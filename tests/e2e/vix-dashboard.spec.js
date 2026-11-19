import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'
import { mockVixQuotes } from './vix-quote-fixture.js'

const dial = (page, symbol) => page.locator('output[data-symbol="' + symbol + '"]')
const dashboard = page => page.locator('.volatility-page')
const slider = page => page.getByRole('slider', { name: '拖动推演 VIX 波动率变化' })
const refresh = page => page.getByRole('button', { name: '刷新最新值', exact: true })

test('the VIX project keeps the reference dashboard controls', async ({ page }) => {
  await mockVixQuotes(page)
  await gotoRoute(page, '/code')
  await page.getByRole('searchbox', { name: '搜索项目名称或简介' }).fill('VIX')
  const project = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'VIX 指数仪表盘' }) })
  await expect(project.getByRole('link', { name: '项目主页' })).toHaveAttribute('href', '/vix-dashboard')

  await gotoRoute(page, '/vix-dashboard')
  await expect(page.getByRole('heading', { name: 'CBOE 波动率三维仪表盘 (VIX / VXN / VVIX)' })).toBeVisible()
  await expect(dashboard(page).getByRole('slider')).toHaveCount(1)
  await expect(dashboard(page).locator('iframe, canvas, .market-chart')).toHaveCount(0)
  await expect(dial(page, 'VIX')).toHaveText('24.61')
  await expect(dial(page, 'VXN')).toHaveText('33.12')
  await expect(dial(page, 'VVIX')).toHaveText('118.37')
  await expect(page.locator('.regime')).toHaveCount(5)

  await slider(page).press('End')
  await expect(dial(page, 'VIX')).toHaveText('38.0')
  await expect(dial(page, 'VXN')).toHaveText('52.6')
  await expect(dial(page, 'VVIX')).toHaveText('116.8')
  await expect(page.locator('.regime[aria-current]')).toContainText('>33')

  await page.getByRole('button', { name: '查看 VXN 说明', exact: true }).click()
  await expect(page.locator('.diagnosis')).toContainText('纳斯达克 100 的隐含波动率')
  await page.getByRole('button', { name: '查看 VVIX 说明', exact: true }).click()
  await expect(page.locator('.diagnosis')).toContainText('VIX 本身的预期波动率')
  await page.getByRole('button', { name: '查看 VIX 说明', exact: true }).click()
  await expect(dial(page, 'VIX')).toHaveText('24.61')
  const intro = page.getByRole('region', { name: '认识 VIX 指数' })
  await expect(intro.getByText('未来 30 天', { exact: true })).toBeVisible()
  await expect(intro.getByRole('figure', { name: 'VIX 为 20 时的单日波动估算' })).toContainText('1.25%')
  await expect(intro.locator('ul, ol')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '切换明/暗主题' })).toHaveCount(0)
  await expect(dashboard(page).getByRole('link', { name: 'Cboe 收盘数据' })).toHaveCount(0)
  await expect(dashboard(page).getByText('已查询 Cboe 收盘数据')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('refresh requests new quotes and preserves the last values on connection failure', async ({ page }) => {
  const feed = await mockVixQuotes(page)
  await gotoRoute(page, '/vix-dashboard')
  await expect(refresh(page)).toBeEnabled()
  await expect.poll(() => feed.requests.length).toBe(3)
  await expect(dial(page, 'VIX')).toHaveText('24.61')
  await slider(page).press('End')
  await expect(dial(page, 'VIX')).toHaveText('38.0')

  feed.quotes = {
    VIX: { date: '2026-11-19', value: 23.42 },
    VXN: { date: '2026-11-19', value: 31.55 },
    VVIX: { date: '2026-11-19', value: 112.92 },
  }
  await refresh(page).click()
  await expect(dial(page, 'VIX')).toHaveText('23.42')
  await expect(dial(page, 'VXN')).toHaveText('31.55')
  await expect(dial(page, 'VVIX')).toHaveText('112.92')
  await expect(page.locator('.gauge-date time')).toHaveText(['2026-11-19', '2026-11-19', '2026-11-19'])
  await expect.poll(() => feed.requests.length).toBe(6)

  feed.unavailable = true
  await refresh(page).click()
  await expect(page.getByRole('status').filter({ hasText: '刷新失败' })).toContainText('刷新失败，显示上次读数')
  await expect(dial(page, 'VIX')).toHaveText('23.42')
  await expect.poll(() => feed.requests.length).toBe(9)
})
