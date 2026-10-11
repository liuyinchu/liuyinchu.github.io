import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { auditPage, BASE_URL, expectKnownRouteShell, expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'
import { mockFrontierNotes, NOTES_SOURCE, FRONTIER_MARKDOWN_FIXTURE } from './frontier-fixture.js'

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

  test('Frontier stays light without changing document theme or saved preferences', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ysy-ai-frontier-theme', 'dark'))
    const audit = auditPage(page)
    await gotoRoute(page, '/')
    await expectKnownRouteShell(page, '/')
    const readMainTheme = () => page.evaluate(() => ({
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      htmlStyle: document.documentElement.style.cssText,
      frontierTheme: document.documentElement.getAttribute('data-frontier-theme'),
      storage: { ...localStorage },
    }))
    const mainTheme = await readMainTheme()
    await openOverview(page)
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('.frontier-shell')).toHaveCSS('background-color', 'rgb(236, 229, 214)')
    await expect(page.getByRole('button', { name: /切换到.*模式/ })).toHaveCount(0)
    expect(await readMainTheme()).toEqual(mainTheme)
    await page.reload()
    await expect(page.locator('.frontier-shell')).toHaveAttribute('data-theme', 'light')
    expect(await readMainTheme()).toEqual(mainTheme)
    await page.getByRole('banner').getByRole('link', { name: 'AVIS3 Arena', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + arena)
    expect(await readMainTheme()).toEqual(mainTheme)
    await page.getByRole('banner').getByRole('link', { name: '返回主站', exact: true }).click()
    await expectKnownRouteShell(page, '/')
    await expect(page.locator('.frontier-shell')).toHaveCount(0)
    expect(await readMainTheme()).toEqual(mainTheme)
    await finishAudit(page, audit)
  })

  test('the complete reader preserves structure, rich interactions and local scrolling', async ({ page, isMobile }) => {
    test.setTimeout(90_000)
    if (!isMobile) await page.setViewportSize({ width: 1280, height: 704 })
    const manual = await readFile(new URL('../../public/markdown/pages/markdown-components.md', import.meta.url), 'utf8')
    await page.route(NOTES_SOURCE, route => route.fulfill({ contentType: 'text/markdown', body: FRONTIER_MARKDOWN_FIXTURE + manual }))
    await gotoRoute(page, overview)
    const reader = page.locator('.frontier-markdown .markdown-body')
    await expect(reader.locator('h6')).toHaveText('六级标题')
    for (const selector of ['strong', 'em', 's', 'blockquote', 'hr', 'ol', 'ul', '.task-list-item', '.md-footnotes', '.md-gallery', '.md-columns', '.md-chat', '.md-timeline', '.md-steps', '.md-link-card', '.md-progress']) {
      await expect(reader.locator(selector).first()).toBeAttached()
    }
    const code = reader.locator('pre code').first()
    await expect(code).toContainText("const spacecraft =")
    await expect(code).toHaveCSS('white-space', 'pre')
    await expect(reader.locator('.hljs-keyword').first()).toBeAttached()
    await page.evaluate(() => { window.__frontierCopied = ''; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__frontierCopied = text } } }) })
    await reader.locator('.copy-button').first().click()
    await expect.poll(() => page.evaluate(() => window.__frontierCopied)).toContain('const spacecraft =')
    const table = reader.locator('table').first()
    await expect(table).toHaveCSS('overflow-x', 'auto')
    await table.evaluate(el => { el.scrollLeft = 1000 })
    expect(await table.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
    const folding = reader.locator('.md-folding').first()
    await folding.locator('summary').first().click()
    await expect(folding).toHaveAttribute('open', '')
    const nested = folding.locator('.md-folding').first()
    await nested.locator('summary').click()
    await expect(nested).toHaveAttribute('open', '')
    const blur = reader.locator('.md-blur-inline').first()
    await blur.click()
    await expect(blur).toHaveClass(/is-revealed/)
    const block = reader.locator('.md-blur-block').first()
    await block.getByRole('button').click()
    await expect(block).toHaveClass(/is-revealed/)
    const stream = reader.locator('.md-stream-button').first()
    await expect(stream).toHaveCSS('background-image', 'none')
    await expect(stream.locator('.md-stream-button-field')).toBeHidden()
    await expect(stream.locator('strong').first()).toHaveCSS('color', 'rgb(255, 249, 237)')
    await reader.locator('.md-tip-inline').first().focus()
    expect(await reader.locator('.md-tip-inline').first().evaluate(el => getComputedStyle(el, '::after').position)).toBe(page.viewportSize().width <= 680 ? 'fixed' : 'absolute')
    await expectNoHorizontalOverflow(page)
    await expect(reader.locator('.md-alert').first()).toHaveCSS('background-image', 'none')
    const contents = page.locator('.frontier-contents details')
    await contents.locator('summary').click()
    await expect(contents).not.toHaveAttribute('open', '')
    await contents.locator('summary').press('Enter')
    await expect(contents).toHaveAttribute('open', '')
    const lastChapter = contents.getByRole('link').last()
    const chapterId = (await lastChapter.getAttribute('href')).slice(1)
    await lastChapter.scrollIntoViewIfNeeded()
    await expect(lastChapter).toBeInViewport()
    expect(await contents.locator('ul').evaluate(el => el.scrollTop)).toBeGreaterThan(0)
    await lastChapter.click()
    await expect(page.locator('[id="' + chapterId + '"]')).toBeInViewport()
    await expectNoHorizontalOverflow(page)
  })

  test('Frontier math keeps short inline baselines and scrolls wide equations', async ({ page }) => {
    test.setTimeout(90_000)
    await page.route(NOTES_SOURCE, route => route.fulfill({ contentType: 'text/markdown', body: FRONTIER_MARKDOWN_FIXTURE }))
    await gotoRoute(page, overview)
    const reader = page.locator('.frontier-markdown .markdown-body')
    const paragraph = reader.locator('p').filter({ hasText: '正常行内公式' })
    await paragraph.scrollIntoViewIfNeeded()
    const inline = paragraph.locator('mjx-container').first()
    await expect(inline.locator('mjx-math mjx-c').first()).toBeAttached({ timeout: 45_000 })
    await expect(inline).toHaveCSS('display', 'inline')
    await expect(inline).toHaveCSS('overflow', 'visible')
    await page.evaluate(() => document.fonts.ready)
    const baselineDifference = await inline.evaluate(el => {
      const p = el.closest('p')
      const marker = document.createElement('span')
      marker.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline'
      const reference = document.createElement('p')
      reference.style.cssText = 'position:fixed;left:-10000px;top:0;margin:0;white-space:nowrap'
      const style = getComputedStyle(p)
      for (const property of ['font-family','font-size','font-weight','font-style','line-height','letter-spacing']) reference.style.setProperty(property,style.getPropertyValue(property))
      const clone = el.cloneNode(true)
      const cloneMarker = marker.cloneNode()
      reference.append(clone,cloneMarker)
      document.body.append(reference)
      const run = document.createElement('span')
      run.style.whiteSpace = 'nowrap'
      el.before(run)
      run.append(el,marker)
      try {
        return Math.abs((el.querySelector('mjx-math').getBoundingClientRect().bottom-marker.getBoundingClientRect().top)-(clone.querySelector('mjx-math').getBoundingClientRect().bottom-cloneMarker.getBoundingClientRect().top))
      } finally { run.before(el); run.remove(); reference.remove() }
    })
    expect(baselineDifference).toBeLessThanOrEqual(1)
    const longParagraph = reader.locator('p').filter({ hasText: '很长的行内公式' })
    await longParagraph.scrollIntoViewIfNeeded()
    const long = longParagraph.locator('mjx-container').first()
    await expect(long.locator('mjx-math mjx-c').first()).toBeAttached({ timeout: 45_000 })
    await expect(long).toHaveClass(/frontier-inline-overflow/)
    const display = reader.locator('mjx-container[display="true"]').first()
    await display.scrollIntoViewIfNeeded()
    await expect(display.locator('mjx-math mjx-c').first()).toBeAttached({ timeout: 45_000 })
    for (const formula of [long, display]) {
      await formula.evaluate(el => { el.scrollLeft = 10000 })
      await expect.poll(() => formula.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
    }
    await expectNoHorizontalOverflow(page)
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
