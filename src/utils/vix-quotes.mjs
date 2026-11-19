export const VIX_SYMBOLS = ['VIX', 'VXN', 'VVIX']
export const VIX_SNAPSHOT_PATH = '/data/vix-latest.json'
export const CBOE_HISTORY_URL = 'https://cdn-api.cboe.com/api/global/us_indices/daily_prices/'
export const VIX_HISTORY_PROXY = '/vix-history/'

export function historyFile(symbol) {
  return symbol + '_History.csv'
}

export function parseIndexHistory(csv, symbol) {
  const [heading, ...lines] = csv.trim().split(/\r?\n/)
  const fields = heading.split(',').map(field => field.trim().replace(/^\uFEFF/, ''))
  const dateIndex = fields.indexOf('DATE')
  const valueIndex = fields.includes('CLOSE') ? fields.indexOf('CLOSE') : fields.indexOf(symbol)
  const lowIndex = fields.indexOf('LOW')
  const highIndex = fields.indexOf('HIGH')
  if (dateIndex < 0 || valueIndex < 0) throw new Error('Unexpected ' + symbol + ' CSV')

  const rows = lines.flatMap(line => {
    const cells = line.split(',')
    const [month, day, year] = (cells[dateIndex] ?? '').split('/')
    const date = year + '-' + month?.padStart(2, '0') + '-' + day?.padStart(2, '0')
    const value = Number(cells[valueIndex])
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && value > 0 && Number.isFinite(value)
      ? [{ date, value, low: Number(cells[lowIndex]), high: Number(cells[highIndex]) }]
      : []
  })
  const latest = rows.at(-1)
  if (!latest) throw new Error('Missing ' + symbol + ' closing values')

  const quote = { date: latest.date, value: latest.value }
  if (symbol === 'VIX') {
    const start = new Date(latest.date)
    start.setUTCDate(start.getUTCDate() - 364)
    const firstDate = start.toISOString().slice(0, 10)
    const pastYear = rows.filter(row => row.date >= firstDate &&
      row.low > 0 && Number.isFinite(row.low) && row.high > 0 && Number.isFinite(row.high))
    if (pastYear.length) {
      quote.range52w = [Math.min(...pastYear.map(row => row.low)), Math.max(...pastYear.map(row => row.high))]
    }
  }
  return quote
}

export async function fetchIndexCloses(base, signal) {
  const requests = await Promise.allSettled(VIX_SYMBOLS.map(async symbol => {
    const response = await fetch(base + historyFile(symbol), { cache: 'no-store', signal })
    if (!response.ok) throw new Error(symbol + ' data unavailable')
    return [symbol, parseIndexHistory(await response.text(), symbol)]
  }))
  return Object.fromEntries(requests.flatMap(result => result.status === 'fulfilled' ? [result.value] : []))
}

export function mergeIndexCloses(previous, updates) {
  return Object.fromEntries(VIX_SYMBOLS.map(symbol => {
    const current = previous[symbol]
    const next = updates[symbol]
    return [symbol, next && (!current || next.date >= current.date) ? next : current]
  }))
}

export function parseClosingSnapshot(data) {
  if (data?.kind !== 'close' || !VIX_SYMBOLS.every(symbol => {
    const quote = data.quotes?.[symbol]
    return Number.isFinite(quote?.value) && quote.value > 0 && /^\d{4}-\d{2}-\d{2}$/.test(quote.date)
  })) throw new Error('Invalid volatility quotes')
  return data
}

export async function fetchQuoteSnapshot(url, signal) {
  const response = await fetch(url, { cache: 'no-store', signal })
  if (!response.ok) throw new Error('Quote feed unavailable')
  return parseClosingSnapshot(await response.json())
}
