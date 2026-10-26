import { test, expect } from '@playwright/test'
import { auditPage, expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'

async function freezeTime(page, time) {
  await page.clock.install({ time: new Date('2025-04-03T00:00:00Z') })
  await page.clock.pauseAt(new Date(time))
}

async function expectUptime(page, values) {
  const timer = page.getByTestId('site-uptime')
  await expect(timer).toBeVisible()
  for (const [unit, value] of Object.entries(values)) {
    await expect(timer.locator('[data-unit="' + unit + '"]')).toHaveText(value)
  }
}

test('lounge uptime ticks, carries into a new day, and follows the actual clock', async ({ page }) => {
  await freezeTime(page, '2025-04-05T19:46:57Z')
  await gotoRoute(page, '/space3')
  await expectUptime(page, { days: '1', hours: '23', minutes: '59', seconds: '59' })
  await expect(page.getByTestId('site-uptime')).toContainText('本站已持续运行')
  await expect(page.getByRole('timer')).toHaveAttribute('aria-live', 'off')

  await page.clock.runFor(1000)
  await expectUptime(page, { days: '2', hours: '00', minutes: '00', seconds: '00' })
  await page.clock.runFor(1000)
  await expectUptime(page, { seconds: '01' })

  // A clock jump must be reflected on the next tick, without accumulating drift.
  await page.clock.setSystemTime(new Date('2025-04-06T20:48:00Z'))
  await page.clock.runFor(1000)
  await expectUptime(page, { days: '3', hours: '01', minutes: '01', seconds: '03' })

  await page.clock.setSystemTime(new Date('2025-04-03T18:46:58Z'))
  await page.clock.runFor(1000)
  await expectUptime(page, { days: '0', hours: '00', minutes: '00', seconds: '00' })
})

test('lounge uptime stays correct after route remounts and fits the viewport', async ({ page }) => {
  const audit = auditPage(page)
  // Keep animation frames and intervals running so route transitions can finish.
  await page.clock.setFixedTime(new Date('2025-04-04T19:47:10Z'))
  await gotoRoute(page, '/space3')
  await expectUptime(page, { days: '1', hours: '00', minutes: '00', seconds: '12' })

  for (const [returnTime, returnedSeconds, tickTime, nextSeconds] of [
    ['2025-04-04T19:47:12Z', '14', '2025-04-04T19:47:13Z', '15'],
    ['2025-04-04T19:47:15Z', '17', '2025-04-04T19:47:16Z', '18'],
  ]) {
    await page.locator('.lounge-card[href="/space2"]').click()
    await expect(page).toHaveURL(/\/space2$/)
    await expect(page.getByTestId('site-uptime')).toHaveCount(0)
    await page.clock.setFixedTime(new Date(returnTime))
    await page.goBack({ waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/space3$/)
    await expect(page.getByTestId('site-uptime')).toHaveCount(1)
    await expectUptime(page, { seconds: returnedSeconds })
    await page.clock.setFixedTime(new Date(tickTime))
    await expectUptime(page, { seconds: nextSeconds })
  }

  await expectNoHorizontalOverflow(page)
  const unitsFit = await page.getByTestId('site-uptime').locator('.uptime-unit').evaluateAll((units) =>
    units.every((unit) => {
      const bounds = unit.getBoundingClientRect()
      return bounds.left >= 0 && bounds.right <= document.documentElement.clientWidth
    }),
  )
  expect(unitsFit, 'each number and its unit should fit within the viewport').toBe(true)
  audit.expectClean()
})
