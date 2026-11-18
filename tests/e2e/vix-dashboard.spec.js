import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'

const plot = 'https://fred.stlouisfed.org/graph/fredgraph.png?*'
const chartFixture = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8z8AARQAFAAH/q842AAAAAElFTkSuQmCC', 'base64')
const plotTitle = name => new RegExp('^' + name + ' 近一年日收盘走势图')

test('the project catalog links to adjustable, independent VIX scenario readings', async ({ page }) => {
  await page.route(plot, route => route.fulfill({ status: 503 }))
  await gotoRoute(page, '/code')
  await page.getByRole('searchbox', { name: '搜索项目名称或简介' }).fill('VIX')
  const project = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'VIX 指数仪表盘' }) })
  await expect(project.getByRole('link', { name: '项目主页' })).toHaveAttribute('href', '/vix-dashboard')

  await gotoRoute(page, '/vix-dashboard')
  const scenario = page.getByRole('region', { name: '情景推演' })
  const readout = symbol => scenario.getByRole('article', { name: symbol, exact: true }).locator('output')
  await expect(readout('VIX')).toHaveText('25.0')
  await scenario.getByRole('slider', { name: 'VIX 情景读数', exact: true }).press('End')
  await expect(readout('VIX')).toHaveText('45.0')
  await expect(readout('VXN')).toHaveText('34.6')
  await expect(readout('VVIX')).toHaveText('101.5')
  await expect(scenario.getByRole('button', { name: '≥ 33' })).toHaveAttribute('aria-pressed', 'true')
  await scenario.getByRole('button', { name: '< 15' }).click()
  await expect(readout('VIX')).toHaveText('12.0')
  await scenario.getByRole('slider', { name: 'VXN 情景读数', exact: true }).press('Home')
  await expect(readout('VXN')).toHaveText('12.0')
  await expect(readout('VIX')).toHaveText('12.0')
  await scenario.getByRole('button', { name: '恢复示例' }).click()
  await expect(readout('VIX')).toHaveText('25.0')
  await expect(readout('VXN')).toHaveText('34.6')
  await expectNoHorizontalOverflow(page)
})

test('market refresh requests a new daily close chart and recovers from a failed image', async ({ page }) => {
  let unavailable = false
  await page.route(plot, route => unavailable ? route.fulfill({ status: 503 }) :
    route.fulfill({ contentType: 'image/png', body: chartFixture }))
  await gotoRoute(page, '/vix-dashboard')
  const market = page.getByRole('region', { name: '市场行情' })
  const refresh = market.getByRole('button', { name: '刷新收盘图' })
  const image = name => market.getByRole('img', { name: plotTitle(name) })
  await expect(image('VIX')).toBeVisible()
  await expect(image('VIX')).toHaveAttribute('src', /id=VIXCLS/)
  await market.getByRole('button', { name: 'VXN', exact: true }).click()
  await expect(image('VXN')).toBeVisible()
  await expect(image('VXN')).toHaveAttribute('src', /id=VXNCLS/)

  const previous = await image('VXN').getAttribute('src')
  unavailable = true
  await refresh.click()
  await expect(market.getByRole('status')).toContainText('暂时无法载入图表')
  await expect(market.getByRole('link', { name: /Cboe \/ FRED/ })).toHaveAttribute('href', 'https://fred.stlouisfed.org/series/VXNCLS')

  unavailable = false
  await refresh.click()
  await expect(image('VXN')).toBeVisible()
  expect(await image('VXN').getAttribute('src')).not.toBe(previous)
  await market.getByRole('button', { name: 'VVIX', exact: true }).click()
  await expect(market.getByRole('link', { name: /在 TradingView 查看/ })).toHaveAttribute('href', 'https://www.tradingview.com/symbols/CBOE-VVIX/')
  await expect(refresh).toHaveCount(0)
  await expect(page.getByRole('region', { name: '情景推演' }).locator('output').first()).toHaveText('25.0')
})
