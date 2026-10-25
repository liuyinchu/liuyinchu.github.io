const TIME_ZONE = 'Asia/Shanghai'
const EMPTY = '—'
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
})
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, weekday: 'short',
})

export function numberOrNull(value) {
  if (value == null || typeof value === 'boolean' || typeof value === 'object') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function instant(value) {
  if (value == null || value === '') return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function localDate(value) {
  const date = instant(value)
  if (!date) return null
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function forecastDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = instant(`${value}T12:00:00+08:00`)
  return date && localDate(date) === value ? date : null
}

export function formatLocalTime(iso) {
  const date = instant(iso)
  return date ? timeFormatter.format(date) : EMPTY
}

export function formatLocalHour(iso) {
  const time = formatLocalTime(iso)
  return time === EMPTY ? EMPTY : time.slice(0, 2) + ':00'
}

export function formatForecastDay(date, now = Date.now()) {
  const value = forecastDate(date)
  if (!value) return EMPTY
  return date === localDate(now) ? 'Today' : dayFormatter.format(value)
}

export function temperatureDomain(daily) {
  const temperatures = daily.flatMap(day => [numberOrNull(day.tempMin), numberOrNull(day.tempMax)])
    .filter(value => value != null)
  return temperatures.length ? { min: Math.min(...temperatures), max: Math.max(...temperatures) } : null
}

export function temperatureRange(day, domain) {
  const min = numberOrNull(day.tempMin)
  const max = numberOrNull(day.tempMax)
  if (!domain || min == null || max == null) return null
  if (domain.max === domain.min) return { left: 50, width: 0 }
  const span = domain.max - domain.min
  return { left: (min - domain.min) / span * 100, width: (max - min) / span * 100 }
}

function solarTime(value) {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null
}

export function solarSummary(day, now = Date.now()) {
  const sunrise = solarTime(day?.sunrise)
  const sunset = solarTime(day?.sunset)
  const summary = { sunrise, sunset, daylightMinutes: null, progress: null, isDay: null }
  if (!sunrise || !sunset || !forecastDate(day?.fxDate)) return summary
  const start = Date.parse(`${day.fxDate}T${sunrise}:00+08:00`)
  const end = Date.parse(`${day.fxDate}T${sunset}:00+08:00`)
  if (end <= start) return summary
  summary.daylightMinutes = (end - start) / 60000
  const current = instant(now)
  if (!current) return summary
  summary.progress = Math.max(0, Math.min(1, (current.getTime() - start) / (end - start)))
  summary.isDay = current.getTime() >= start && current.getTime() < end
  return summary
}

export function uvCategory(value) {
  const uv = numberOrNull(value)
  if (uv == null || uv < 0) return null
  if (uv < 3) return { label: 'Low', level: 1 }
  if (uv < 6) return { label: 'Moderate', level: 2 }
  if (uv < 8) return { label: 'High', level: 3 }
  if (uv < 11) return { label: 'Very high', level: 4 }
  return { label: 'Extreme', level: 5 }
}
