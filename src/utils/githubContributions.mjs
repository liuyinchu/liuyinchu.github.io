const DAY = 86_400_000

export function dateNumber(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NaN
  const value = Date.parse(date + 'T00:00:00Z')
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date ? value : NaN
}

/** Keep the service's actual calendar days; missing records are never invented as zero. */
export function normalizeContributions(payload, period = 'last') {
  if (!Array.isArray(payload?.contributions) || !payload.contributions.length) {
    throw new Error('贡献数据格式不完整')
  }
  const days = payload.contributions.map(day => {
    if (!Number.isFinite(dateNumber(day.date)) || !Number.isInteger(day.count) || day.count < 0) {
      throw new Error('贡献数据格式不完整')
    }
    const level = day.count === 0 ? 0 : Number.isInteger(day.level) ? Math.max(1, Math.min(4, day.level)) : 1
    return { date: day.date, count: day.count, level }
  }).filter(day => period === 'last' || day.date.startsWith(period + '-')).sort((a, b) => a.date.localeCompare(b.date))
  if (!days.length) throw new Error('所选期间没有可用的日历数据')
  return days
}

export function contributionStats(days) {
  let total = 0
  let activeDays = 0
  let longestStreak = 0
  let streak = 0
  let previous = NaN
  let latestActive = null
  for (const day of days) {
    const current = dateNumber(day.date)
    total += day.count
    if (day.count > 0) {
      activeDays += 1
      streak = current - previous === DAY ? streak + 1 : 1
      longestStreak = Math.max(longestStreak, streak)
      latestActive = day.date
      previous = current
    } else {
      streak = 0
      previous = NaN
    }
  }
  return { total, activeDays, longestStreak, latestActive }
}

export function contributionCalendar(days) {
  if (!days.length) return { weeks: [], months: [] }
  const start = dateNumber(days[0].date)
  const end = dateNumber(days.at(-1).date)
  const firstSunday = start - new Date(start).getUTCDay() * DAY
  const count = Math.ceil(((end - firstSunday) / DAY + 1) / 7)
  const weeks = Array.from({ length: count }, () => Array(7).fill(null))
  const months = []
  let previousMonth = ''
  for (const [index, day] of days.entries()) {
    const stamp = dateNumber(day.date)
    const week = Math.floor((stamp - firstSunday) / DAY / 7)
    const weekday = new Date(stamp).getUTCDay()
    weeks[week][weekday] = { ...day, index }
    const month = day.date.slice(0, 7)
    if (month !== previousMonth) {
      months.push({ key: month, label: Number(day.date.slice(5, 7)) + '月', week })
      previousMonth = month
    }
  }
  return { weeks, months }
}

export function moveContributionFocus(days, index, key) {
  if (!days.length) return -1
  if (key === 'Home') return 0
  if (key === 'End') return days.length - 1
  const shifts = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }
  return Math.max(0, Math.min(days.length - 1, index + (shifts[key] ?? 0)))
}

export function formatContributionDate(date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(dateNumber(date))
}
