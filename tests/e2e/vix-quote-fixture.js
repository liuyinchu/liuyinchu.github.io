export const closeSnapshot = {
  kind: 'close',
  quotes: {
    VIX: { date: '2026-11-18', value: 24.61 },
    VXN: { date: '2026-11-18', value: 33.12 },
    VVIX: { date: '2026-11-18', value: 118.37 },
  },
}

export async function mockVixQuotes(page) {
  const feed = { quotes: closeSnapshot.quotes, unavailable: false, requests: [] }
  await page.route('**/data/vix-latest.json', route => route.fulfill({ json: closeSnapshot }))
  await page.route('**/vix-history/*_History.csv', route => {
    const symbol = new URL(route.request().url()).pathname.split('/').at(-1).split('_')[0]
    feed.requests.push(symbol)
    if (feed.unavailable) return route.fulfill({ status: 503 })
    const { date, value } = feed.quotes[symbol]
    const [year, month, day] = date.split('-')
    const dayLabel = [month, day, year].join('/')
    const body = symbol === 'VVIX'
      ? 'DATE,VVIX\n' + dayLabel + ',' + value
      : 'DATE,OPEN,HIGH,LOW,CLOSE\n' + [dayLabel, value, value + 1, value - 1, value].join(',')
    return route.fulfill({ contentType: 'text/csv', body })
  })
  return feed
}
