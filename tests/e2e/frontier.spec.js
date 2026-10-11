import { expect, test } from '@playwright/test'
import { auditPage, BASE_URL, expectKnownRouteShell, expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'
import { mockFrontierNotes, NOTES_SOURCE } from './frontier-fixture.js'

const overview = '/ai-frontier'
const arena = overview + '/arena/avis3'
const dataUrl = '**/ai-frontier/avis3.json'
const leaderboard = page => page.getByTestId('avis3-leaderboard')

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

async function openOverview(page) {
  await gotoRoute(page, overview)
  await expectKnownRouteShell(page, overview)
  await expect(leaderboard(page)).toBeVisible()
  await expect(page.locator('.frontier-intelligence .markdown-body')).toBeVisible()
}

test.describe('AI Frontier', () => {
  test.use({ colorScheme: 'light' })
  test.beforeEach(async ({ page }) => { await mockFrontierNotes(page) })

  test('the overview presents verified models and tools in score order with live-source notes', async ({ page }) => {
    const response = await page.request.get(BASE_URL + '/ai-frontier/avis3.json')
    const data = await response.json()
    const audit = auditPage(page)
    await openOverview(page)
    await expect(page.getByRole('link', { name: 'Ysy AI Frontier 首页', exact: true })).toBeVisible()
    const rows = leaderboard(page).getByTestId('avis3-result')
    await expect(rows).toHaveCount(3)
    expect(await rows.locator('.avis3-contestant-id').allTextContents()).toEqual(['contestant-2', 'contestant-1', 'contestant-3'])
    for (const result of data.results) {
      const row = rows.filter({ has: page.getByText(result.contestantId, { exact: true }) })
      const contestant = data.contestants.find(item => item.id === result.contestantId)
      await expect(row.locator('.avis3-contestant strong')).toHaveText(contestant.model)
      await expect(row.locator('.avis3-harness')).toHaveText(contestant.harness)
      await expect(row.locator('.avis3-result-score strong')).toHaveText(result.mean.toFixed(4))
      await expect(row.locator('.avis3-result-score strong')).toHaveAttribute('title', String(result.mean))
      if (typeof result.std === 'number') await expect(row.locator('.avis3-number')).toHaveText(result.std.toFixed(4))
    }
    await expect(page.getByRole('link', { name: '源仓库 ↗', exact: true })).toHaveAttribute('href', 'https://github.com/liuyinchu/deepsight-ai-today')
    await expect(page.locator('.frontier-intelligence .markdown-body')).toContainText('用于页面验证的固定内容')
    await expect(page.locator('.benchmark-deck, .frontier-tier-list')).toHaveCount(0)
    await expect(page.locator('.frontier-shell')).not.toContainText('演示数据')
    if (!data.results.some(result => typeof result.std === 'number')) {
      await expect(leaderboard(page).getByRole('columnheader', { name: '样本标准差', exact: true })).toHaveCount(0)
    }
    await finishAudit(page, audit)
  })

  test('the AVIS3 detail opens from the overview and shows its Markdown explanation', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    await page.getByRole('link', { name: '查看规则与完整结果', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + arena)
    await expectKnownRouteShell(page, arena)
    await expect(page.locator('.frontier-report-cover h1')).toHaveText('AVIS3 Arena')
    await expect(leaderboard(page).getByTestId('avis3-result')).toHaveCount(3)
    await expect(page.locator('.frontier-markdown .markdown-body')).toBeVisible()
    await expect(page.locator('.avis3-round-card')).toHaveCount(3)
    await expect(page.locator('.avis3-round-list li')).toHaveCount(30)
    await expect(page.locator('.frontier-markdown').getByRole('heading').first()).toContainText('AVIS3')
    const folding = page.locator('.frontier-markdown details').first()
    await folding.locator('summary').click()
    await expect(folding).toHaveAttribute('open', '')
    await finishAudit(page, audit)
  })

  test('an unknown arena has an independent 404 and a working return link', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, overview + '/arena/__missing_arena__')
    await expectKnownRouteShell(page, overview + '/arena/__missing_arena__')
    const missing = page.locator('[data-page="arena-not-found"]')
    await expect(missing).toBeVisible()
    await expect(missing.getByRole('heading', { level: 1 })).toContainText('404')
    await missing.getByRole('link', { name: /返回 Ysy AI Frontier/ }).click()
    await expect(page).toHaveURL(BASE_URL + overview)
    await expect(leaderboard(page)).toBeVisible()
    await finishAudit(page, audit)
  })

  test('the removed demo detail no longer renders a ranking page', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, overview + '/benchmarks/six-dof-avis-control-benchmark-v0')
    await expect(page.locator('[data-page="not-found"]')).toBeVisible()
    await expect(page.locator('.frontier-shell')).toHaveCount(0)
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
    await page.getByRole('banner').getByRole('link', { name: 'AVIS3 Arena', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + arena)
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'dark')
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

  test('a failed AVIS3 data request recovers after retry', async ({ page }) => {
    const failing = route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"temporary failure"}' })
    await page.route(dataUrl, failing)
    await gotoRoute(page, overview)
    const retry = page.getByRole('alert').getByRole('button', { name: '重新加载成绩', exact: true })
    await expect(retry).toBeVisible()
    await page.unroute(dataUrl, failing)
    const audit = auditPage(page)
    await retry.click()
    await expect(leaderboard(page)).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page).toHaveURL(BASE_URL + overview)
    await finishAudit(page, audit)
  })

  for (const failure of [
    { name: 'an HTTP failure', status: 503, contentType: 'text/plain', body: 'Temporary notes failure' },
    { name: 'an HTML fallback', status: 200, contentType: 'text/html', body: '<html><h1>Unexpected HTML fallback</h1></html>' },
  ]) {
    test('remote notes reject ' + failure.name + ' and recover after retry', async ({ page }) => {
      const failing = route => route.fulfill({ status: failure.status, contentType: failure.contentType, body: failure.body })
      await page.route(NOTES_SOURCE, failing)
      await gotoRoute(page, overview)
      const notes = page.locator('.frontier-intelligence .frontier-markdown')
      const error = notes.getByRole('alert')
      await expect(error).toBeVisible()
      await expect(notes.locator('.markdown-body')).toHaveCount(0)
      await page.unroute(NOTES_SOURCE, failing)
      const audit = auditPage(page)
      await error.getByRole('button', { name: '重新加载', exact: true }).click()
      await expect(notes.locator('.markdown-body')).toContainText('用于页面验证的固定内容')
      await expect(error).toHaveCount(0)
      await finishAudit(page, audit)
    })
  }

  test('raw precision determines order and exact ties share competition ranks', async ({ page }) => {
    const response = await page.request.get(BASE_URL + '/ai-frontier/avis3.json')
    const data = await response.json()
    data.results = [
      { contestantId: 'contestant-3', mean: 850.1234568, std: 9, rounds: 10, failures: 0, roundScores: null },
      { contestantId: 'contestant-1', mean: 850.1234567, std: 1, rounds: 10, failures: 0, roundScores: null },
      { contestantId: 'contestant-2', mean: 850.1234568, std: 0.01, rounds: 10, failures: 0, roundScores: null },
    ]
    await page.route(dataUrl, route => route.fulfill({ json: data }))
    const audit = auditPage(page)
    await openOverview(page)
    const rows = leaderboard(page).getByTestId('avis3-result')
    expect(await rows.locator('.avis3-contestant-id').allTextContents()).toEqual(['contestant-2', 'contestant-3', 'contestant-1'])
    expect(await rows.locator('.avis3-result-score strong').allTextContents()).toEqual(['850.1235', '850.1235', '850.1235'])
    expect(await rows.locator('.avis3-result-score strong').evaluateAll(elements => elements.map(element => element.title))).toEqual(['850.1234568', '850.1234568', '850.1234567'])
    expect(await rows.locator('.avis3-rank').allTextContents()).toEqual(['1', '1', '3'])
    await finishAudit(page, audit)
  })

  test('round context remains visible when the method Markdown fails and the report retries', async ({ page }) => {
    const methodUrl = '**/ai-frontier/arena/avis3.md'
    const failing = route => route.fulfill({ status: 503, contentType: 'text/plain', body: 'Temporary report failure' })
    await page.route(methodUrl, failing)
    await gotoRoute(page, arena)
    await expect(page.locator('.avis3-comparison-note')).toHaveText('各选手同编号轮次使用不同随机场景，不能按轮号做配对比较。')
    await expect(page.locator('.avis3-round-list li')).toHaveCount(30)
    const error = page.locator('.frontier-markdown').getByRole('alert')
    await expect(error).toBeVisible()
    await page.unroute(methodUrl, failing)
    const audit = auditPage(page)
    await error.getByRole('button', { name: '重新加载', exact: true }).click()
    await expect(page.locator('.frontier-markdown .markdown-body')).toContainText('评分公式')
    await expect(error).toHaveCount(0)
    await expect(page.locator('.avis3-comparison-note')).toBeVisible()
    await finishAudit(page, audit)
  })

  test('the contents navigate to chapters and returning to overview resets the scroll', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, arena)
    const contents = page.getByRole('navigation', { name: '本页目录', exact: true })
    await expect(contents).toBeVisible()
    const links = contents.getByRole('link')
    await expect.poll(() => links.count()).toBeGreaterThan(1)
    const first = links.first()
    const last = links.last()
    const lastHeading = page.locator('.frontier-markdown').getByRole('heading', { name: await last.innerText() })
    await last.click()
    await expect(last).toHaveAttribute('aria-current', 'location')
    await expect(lastHeading).toBeInViewport()
    const firstHeading = page.locator('.frontier-markdown').getByRole('heading', { name: await first.innerText() })
    await first.click()
    await expect(first).toHaveAttribute('aria-current', 'location')
    await expect(firstHeading).toBeInViewport()
    const overviewLink = page.getByRole('banner').getByRole('link', { name: '总览', exact: true })
    await overviewLink.click()
    await expect(page).toHaveURL(BASE_URL + overview)
    await expect(page.locator('.frontier-cover h1')).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    const notesChapter = contents.getByRole('link').last()
    await expect(notesChapter).toBeVisible()
    const notesHeading = page.locator('.frontier-markdown').getByRole('heading', { name: await notesChapter.innerText() })
    await notesChapter.click()
    await expect(notesChapter).toHaveAttribute('aria-current', 'location')
    await expect(notesHeading).toBeInViewport()
    await overviewLink.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await finishAudit(page, audit)
  })
})
