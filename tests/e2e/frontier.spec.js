import { expect, test } from '@playwright/test'
import {
  auditPage,
  BASE_URL,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const overview = '/ai-frontier'
const carousel = (page) => page.getByRole('region', { name: 'AI 能力排行榜', exact: true })
const slide = (page) => page.getByTestId('benchmark-slide')

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

async function openOverview(page) {
  await gotoRoute(page, overview)
  await expectKnownRouteShell(page, overview)
  await expect(slide(page)).toHaveCount(1)
  await expect(slide(page)).toBeVisible()
}

test.describe('AI Frontier', () => {
  test.use({ reducedMotion: 'no-preference', colorScheme: 'light' })

  test('the independent demo overview supports manual carousel controls', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    await expect(page.getByRole('link', { name: 'Ysy AI Frontier 首页', exact: true })).toBeVisible()
    await expect(slide(page)).toContainText('DEMO')
    await expect(carousel(page)).toContainText('演示数据')

    const initial = await slide(page).getAttribute('aria-label')
    const next = page.getByRole('button', { name: '下一个 Benchmark', exact: true })
    const previous = page.getByRole('button', { name: '上一个 Benchmark', exact: true })
    await next.click()
    await expect(slide(page)).not.toHaveAttribute('aria-label', initial)
    await expect(slide(page)).toHaveCount(1)
    await expect(previous).toBeEnabled()
    await previous.click()
    await expect(slide(page)).toHaveAttribute('aria-label', initial)
    await expect(next).toBeEnabled()

    await page.getByRole('button', { name: '暂停自动轮播', exact: true }).click()
    await expect(page.getByRole('button', { name: '开启自动轮播', exact: true }))
      .toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: '开启自动轮播', exact: true }).click()
    await expect(page.getByRole('button', { name: '暂停自动轮播', exact: true }))
      .toHaveAttribute('aria-pressed', 'false')
    await finishAudit(page, audit)
  })

  test('autoplay advances an in-view carousel and pauses while hovered', async ({ page }) => {
    await page.clock.install()
    const audit = auditPage(page)
    await openOverview(page)
    const region = carousel(page)
    await region.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const initial = await slide(page).getAttribute('aria-label')

    await page.clock.runFor(9_000)
    await expect(slide(page)).not.toHaveAttribute('aria-label', initial)
    await expect(page.getByRole('button', { name: '下一个 Benchmark', exact: true })).toBeEnabled()

    await region.locator('.deck-toolbar').hover()
    const hovered = await slide(page).getAttribute('aria-label')
    await page.clock.runFor(10_000)
    await expect(slide(page)).toHaveAttribute('aria-label', hovered)
    await expect(slide(page)).toHaveCount(1)
    await finishAudit(page, audit)
  })

  test('Shift plus wheel changes the benchmark while an ordinary wheel scrolls the page', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    await page.getByRole('button', { name: '暂停自动轮播', exact: true }).click()
    const region = carousel(page)
    await region.locator('.deck-toolbar').hover()
    const initial = await slide(page).getAttribute('aria-label')

    await page.keyboard.down('Shift')
    await page.mouse.wheel(0, 140)
    await page.keyboard.up('Shift')
    await expect(slide(page)).not.toHaveAttribute('aria-label', initial)
    await expect(page.getByRole('button', { name: '下一个 Benchmark', exact: true })).toBeEnabled()

    const shifted = await slide(page).getAttribute('aria-label')
    await region.locator('.deck-toolbar').hover()
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 280)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore)
    await expect(slide(page)).toHaveAttribute('aria-label', shifted)
    await expect(slide(page)).toHaveCount(1)
    await finishAudit(page, audit)
  })

  test('a report link opens the tier list and its Markdown report', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    const benchmarkName = await slide(page).getAttribute('aria-label')
    const modelNames = await slide(page).locator('.rank-model strong').allTextContents()
    expect(modelNames.length).toBeGreaterThan(0)
    const report = slide(page).getByRole('link', { name: '查看完整测试报告', exact: true })
    const href = await report.getAttribute('href')
    expect(href).toMatch(/^\/ai-frontier\/benchmarks\/[^/]+$/)
    await report.click()
    await expect(page).toHaveURL(BASE_URL + href)
    await expectKnownRouteShell(page, href)
    await expect(page.locator('.frontier-report-cover h1')).toContainText(benchmarkName)

    const tierList = page.locator('.frontier-tier-list')
    await expect(tierList).toBeVisible()
    await expect(tierList.locator('section')).toHaveCount(5)
    await expect(tierList.locator('h3')).toHaveCount(5)
    await expect(tierList.locator('.frontier-model-tile')).toHaveCount(modelNames.length)
    const reportedNames = await tierList.locator('.frontier-model-tile > strong').allTextContents()
    expect(reportedNames.sort()).toEqual(modelNames.sort())
    await expect(page.locator('.frontier-markdown')).toBeVisible()
    await expect(page.locator('.frontier-markdown').locator('p').first()).toContainText(/\S/)
    await expect(page.locator('.frontier-markdown').getByRole('heading').first()).toBeVisible()
    await finishAudit(page, audit)
  })

  test('an unknown benchmark has an independent 404 and a working return link', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, overview + '/benchmarks/__missing_benchmark__')
    await expectKnownRouteShell(page, overview)
    const missing = page.locator('[data-page="benchmark-not-found"]')
    await expect(missing).toBeVisible()
    await expect(missing.getByRole('heading', { level: 1 })).toContainText('404')
    await missing.getByRole('link', { name: /返回 Ysy AI Frontier/ }).click()
    await expect(page).toHaveURL(BASE_URL + overview)
    await expect(slide(page)).toBeVisible()
    await finishAudit(page, audit)
  })

  test('the theme survives reload and leaving Frontier restores the main site', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, '/')
    await expectKnownRouteShell(page, '/')
    const mainTheme = await page.evaluate(() => ({
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      colorScheme: document.documentElement.style.colorScheme,
    }))

    await openOverview(page)
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'light')
    await page.getByRole('button', { name: '切换到暗色模式', exact: true }).click()
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'dark')
    await expect.poll(() => page.evaluate(() => localStorage.getItem('ysy-ai-frontier-theme'))).toBe('dark')

    await page.reload()
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('html')).toHaveAttribute('data-frontier-theme', 'dark')
    await page.getByRole('button', { name: '切换到浅色模式', exact: true }).click()
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'light')
    await page.getByRole('button', { name: '切换到暗色模式', exact: true }).click()
    await page.getByRole('banner').getByRole('link', { name: '返回主站', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + '/')
    await expectKnownRouteShell(page, '/')
    await expect(page.locator('.frontier-shell')).toHaveCount(0)
    await expect.poll(() => page.locator('html').getAttribute('data-frontier-theme')).toBeNull()
    await expect.poll(() => page.evaluate(() => ({
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      colorScheme: document.documentElement.style.colorScheme,
    }))).toEqual(mainTheme)
    await finishAudit(page, audit)
  })
  test('a failed catalog request can be retried without leaving the overview', async ({ page }) => {
    const catalogUrl = '**/ai-frontier/benchmarks.json'
    await page.route(catalogUrl, (route) => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: '{"error":"temporary catalog failure"}',
    }))
    await gotoRoute(page, overview)
    const retry = page.getByRole('alert').getByRole('button', { name: /重新加载榜单/ })
    await expect(retry).toBeVisible()

    await page.unroute(catalogUrl)
    const audit = auditPage(page)
    await retry.click()
    await expect(slide(page)).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page).toHaveURL(BASE_URL + overview)
    await finishAudit(page, audit)
  })

  test('a report rejects an HTML fallback and recovers after retry', async ({ page }) => {
    const catalogResponse = await page.request.get(BASE_URL + '/ai-frontier/benchmarks.json')
    expect(catalogResponse.ok()).toBe(true)
    const catalog = await catalogResponse.json()
    const benchmark = catalog.benchmarks[0]
    const markdownUrl = new URL(benchmark.markdown, BASE_URL).href
    await page.route(markdownUrl, (route) => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body><h1>Unexpected SPA fallback</h1></body></html>',
    }))
    await gotoRoute(page, overview + '/benchmarks/' + benchmark.id)
    const error = page.locator('.frontier-markdown-state[role="alert"]')
    await expect(error).toBeVisible()
    await expect(page.locator('.frontier-markdown')).not.toContainText('Unexpected SPA fallback')

    await page.unroute(markdownUrl)
    const audit = auditPage(page)
    await error.getByRole('button', { name: '重新加载', exact: true }).click()
    await expect(page.locator('.frontier-markdown')).toBeVisible()
    await expect(page.locator('.frontier-markdown').getByRole('heading').first()).toBeVisible()
    await expect(error).toHaveCount(0)
    await finishAudit(page, audit)
  })

  test('the contents links navigate to chapters and update the active chapter on scroll', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, overview + '/benchmarks/reasoning-demo')
    const contents = page.getByRole('navigation', { name: '本页目录', exact: true })
    await expect(contents).toBeVisible()
    const links = contents.getByRole('link')
    await expect.poll(() => links.count()).toBeGreaterThan(1)

    const firstLink = links.first()
    const lastLink = links.last()
    const firstHeading = page.locator('.frontier-markdown').getByRole('heading', {
      name: await firstLink.innerText(),
    })
    const lastHeading = page.locator('.frontier-markdown').getByRole('heading', {
      name: await lastLink.innerText(),
    })
    const targetId = await lastHeading.getAttribute('id')
    await lastLink.click()
    await expect.poll(() => page.evaluate(() => decodeURIComponent(window.location.hash.slice(1)))).toBe(targetId)
    await expect(lastLink).toHaveAttribute('aria-current', 'location')
    await expect(lastHeading).toBeInViewport()
    await expect.poll(async () => {
      const before = await page.evaluate(() => window.scrollY)
      await page.waitForTimeout(120)
      return Math.abs(await page.evaluate(() => window.scrollY) - before)
    }).toBeLessThan(1)

    const viewport = page.viewportSize()
    await page.mouse.move(viewport.width / 2, viewport.height / 2)
    const firstBounds = await firstHeading.boundingBox()
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, firstBounds.y - viewport.height / 4)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore)
    await expect(firstLink).toHaveAttribute('aria-current', 'location')
    await expect(lastLink).not.toHaveAttribute('aria-current', 'location')
    await expect(firstHeading).toBeInViewport()

    const overviewLink = page.getByRole('banner').getByRole('link', { name: '总览', exact: true })
    await overviewLink.click()
    await expect(page).toHaveURL(BASE_URL + overview)
    await expect(page.locator('.frontier-cover h1')).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

    const overviewChapter = contents.getByRole('link').last()
    await expect(overviewChapter).toBeVisible()
    const overviewHeading = page.locator('.frontier-markdown').getByRole('heading', {
      name: await overviewChapter.innerText(),
    })
    await overviewChapter.click()
    await expect(overviewChapter).toHaveAttribute('aria-current', 'location')
    await expect(overviewHeading).toBeInViewport()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await overviewLink.click()
    await expect(page).toHaveURL(BASE_URL + overview)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await finishAudit(page, audit)
  })

})
