import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeContributions, contributionStats, contributionCalendar, dateNumber, moveContributionFocus } from '../src/utils/githubContributions.mjs'

const payload = contributions => ({ contributions })
const day = (date, count, level = 1) => ({ date, count, level })

test('normalizes service days chronologically and levels without inventing counts', () => {
  const days = normalizeContributions(payload([day('2025-01-03', 8, 9), day('2025-01-01', 0, 3), day('2025-01-02', 2, -3)]))
  assert.deepEqual(days, [day('2025-01-01', 0, 0), day('2025-01-02', 2, 1), day('2025-01-03', 8, 4)])
  assert.equal(normalizeContributions(payload([day('2025-12-31', 1), day('2026-01-01', 2)]), '2026').length, 1)
})

test('rejects failed, malformed and impossible calendar data while retaining genuine zero days', () => {
  for (const value of [{}, payload([]), payload([day('2025-02-29', 1)]), payload([day('2024-02-30', 1)]), payload([day('2024-01-01', -1)])]) {
    assert.throws(() => normalizeContributions(value))
  }
  assert.equal(normalizeContributions(payload([day('2024-02-29', 0)]))[0].count, 0)
  assert.ok(Number.isNaN(dateNumber('2024-2-29')))
})

test('computes period totals, active days, longest streak and latest date across year and leap day', () => {
  const days = normalizeContributions(payload([day('2023-12-31', 3), day('2024-01-01', 4), day('2024-02-28', 1), day('2024-02-29', 2), day('2024-03-01', 3), day('2024-03-02', 0), day('2024-03-03', 7)]))
  assert.deepEqual(contributionStats(days), { total: 20, activeDays: 6, longestStreak: 3, latestActive: '2024-03-03' })
  assert.deepEqual(contributionStats([day('2025-01-01', 0)]), { total: 0, activeDays: 0, longestStreak: 0, latestActive: null })
})

test('calendar places Sunday-first weeks, labels year boundaries and leaves missing dates empty', () => {
  const days = normalizeContributions(payload([day('2023-12-31', 1), day('2024-01-01', 2), day('2024-01-03', 3)]))
  const calendar = contributionCalendar(days)
  assert.equal(calendar.weeks[0][0].date, '2023-12-31')
  assert.equal(calendar.weeks[0][1].date, '2024-01-01')
  assert.equal(calendar.weeks[0][2], null)
  assert.deepEqual(calendar.months.map(month => month.key), ['2023-12', '2024-01'])
  const leap = contributionCalendar(normalizeContributions(payload([day('2024-02-29', 1), day('2024-03-01', 2)])))
  assert.equal(leap.weeks[0][4].date, '2024-02-29')
  assert.equal(leap.weeks[0][5].date, '2024-03-01')
})

test('keyboard traverses day and week with bounded Home and End', () => {
  const days = Array(20).fill(null)
  assert.equal(moveContributionFocus(days, 8, 'ArrowLeft'), 1)
  assert.equal(moveContributionFocus(days, 8, 'ArrowRight'), 15)
  assert.equal(moveContributionFocus(days, 8, 'ArrowUp'), 7)
  assert.equal(moveContributionFocus(days, 8, 'ArrowDown'), 9)
  assert.equal(moveContributionFocus(days, 0, 'ArrowLeft'), 0)
  assert.equal(moveContributionFocus(days, 19, 'ArrowRight'), 19)
  assert.equal(moveContributionFocus(days, 8, 'Home'), 0)
  assert.equal(moveContributionFocus(days, 8, 'End'), 19)
})
