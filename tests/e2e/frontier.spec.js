import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { auditPage, BASE_URL, expectKnownRouteShell, expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'
import { mockFrontierNotes, NOTES_SOURCE, FRONTIER_MARKDOWN_FIXTURE } from './frontier-fixture.js'
import { STATIC_ROUTES } from './route-manifest.js'
import { mockPlusSpectra, plusSpectrum } from './avis3-plus-spectra-fixture.js'

const overview = '/ai-frontier'
const arena = overview + '/arena/avis3'
const preview = overview + '/arena/avis3-preview'
const officialPath = '/ai-frontier/evaluation-1108/evaluation-1108.json'
const dataUrl = '**' + officialPath
const leaderboard = page => page.getByTestId('avis3-leaderboard')

async function expectNoDecorativeArrows(page) {
  const decoration = await page.locator('.frontier-shell').evaluate(shell => {
    const text = []
    for (const element of shell.querySelectorAll('*')) {
      if (!element.getClientRects().length) continue
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) text.push(node.textContent)
      }
      for (const pseudo of ['::before', '::after']) text.push(getComputedStyle(element, pseudo).content)
    }
    return text.join(' ')
  })
  expect(decoration).not.toMatch(/[\u2190-\u21ff\u27f0-\u27ff\u2900-\u297f\u2b00-\u2b11›‹»«⌄⌃]/u)
  await expect(page.locator('.frontier-shell [class*="chevron"]')).toHaveCount(0)
}

async function expectCleanRanking(page) {
  await expect(page.locator('.avis3-contestant-id, .avis3-results-note')).toHaveCount(0)
  await expect(leaderboard(page)).not.toContainText('0 失败')
  const scores = await leaderboard(page).locator('.avis3-result-score').evaluateAll(cells =>
    cells.map(cell => ({
      text: cell.innerText.trim(),
      fontSize: Number.parseFloat(getComputedStyle(cell.querySelector('strong')).fontSize),
    })))
  for (const score of scores) {
    expect(score.text).toMatch(/^\d+\.\d{4}$/)
    expect(score.fontSize).toBeGreaterThanOrEqual(20)
  }
}

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
    const response = await page.request.get(BASE_URL + officialPath)
    const data = await response.json()
    const audit = auditPage(page)
    await openOverview(page)
    await expect(page.getByRole('link', { name: 'Ysy AI Frontier 首页', exact: true })).toBeVisible()
    const rows = leaderboard(page).getByTestId('avis3-result')
    await expect(rows).toHaveCount(5)
    expect(await rows.evaluateAll(elements => elements.map(element => element.dataset.entryId))).toEqual(['official-004', 'official-014', 'official-005', 'official-010', 'official-001'])
    for (const entry of [...data.entrants].sort((a, b) => b.mean - a.mean).slice(0, 5)) {
      const row = page.locator('[data-testid="avis3-result"][data-entry-id="' + entry.id + '"]')
      await expect(row.locator('.avis3-contestant strong')).toHaveText(entry.model)
      await expect(row.locator('.avis3-harness')).toHaveText(entry.harness)
      await expect(row.locator('.avis3-result-score strong')).toHaveText(entry.mean.toFixed(4))
      await expect(row.locator('.avis3-result-score strong')).toHaveAttribute('title', String(entry.mean))
      await expect(row.locator('.avis3-number')).toHaveText(entry.std.toFixed(4))
    }
    await expect(page.locator('.frontier-intelligence .markdown-body')).toContainText('用于页面验证的固定内容')
    await expect(page.locator('.benchmark-deck, .frontier-tier-list')).toHaveCount(0)
    await expect(page.locator('.frontier-shell')).not.toContainText('演示数据')
    await expect(page.getByRole('heading', { name: 'AI 能力测评', exact: true })).toBeVisible()
    await expectCleanRanking(page)
    await expectNoDecorativeArrows(page)
    await finishAudit(page, audit)
  })

  test('editable collections keep their own Markdown and the Frontier shell', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    const collections = page.getByRole('region', { name: '收集与记录', exact: true })
    await expect(collections.getByRole('link', { name: /Skill 收集/ })).toHaveAttribute('href', overview + '/skills')
    await expect(collections.getByRole('link', { name: /AI Trivia/ })).toHaveAttribute('href', overview + '/trivia')
    await expectNoDecorativeArrows(page)
    await collections.getByRole('link', { name: /Skill 收集/ }).click()
    await expect(page).toHaveURL(BASE_URL + overview + '/skills')
    await expectKnownRouteShell(page, overview + '/skills')
    await expect(page).toHaveTitle('Skill 收集 · Ysy AI Frontier')
    await expect(page.locator('.frontier-report-title h1')).toHaveText('Skill 收集')
    await expect(page.getByRole('navigation', { name: 'AI Frontier 导航' }).getByRole('link', { name: 'Skill 收集', exact: true })).toHaveAttribute('aria-current', 'page')
    const source = await readFile(new URL('../../public/ai-frontier/skills.md', import.meta.url), 'utf8')
    const entries = [...source.matchAll(/^- \[([^\]]+)\]\(([^)]+)\)/gm)]
    const reader = page.locator('.frontier-document .markdown-body')
    expect(entries.length).toBeGreaterThan(0)
    await expect(reader.locator('li')).toHaveCount(entries.length)
    for (const [, name, href] of entries) {
      await expect(reader.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    await expect(reader.locator('.md-badge').first()).toHaveText('用过')
    await expectNoDecorativeArrows(page)
    await finishAudit(page, audit)

    await page.getByRole('navigation', { name: 'AI Frontier 导航' }).getByRole('link', { name: 'AI Trivia', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + overview + '/trivia')
    await expectKnownRouteShell(page, overview + '/trivia')
    await expect(page).toHaveTitle('AI Trivia · Ysy AI Frontier')
    await expect(page.locator('.frontier-report-title h1')).toHaveText('AI Trivia')
    await expect(page.locator('.frontier-markdown')).toHaveAttribute('aria-busy', 'false')
    const triviaSource = await readFile(new URL('../../public/ai-frontier/trivia.md', import.meta.url), 'utf8')
    const triviaHeading = triviaSource.match(/^#{1,6} (.+)$/m)?.[1]
    if (triviaHeading) await expect(reader.getByRole('heading').first()).toContainText(triviaHeading)
    else await expect(reader).toBeEmpty()
    await expect(page.getByRole('alert')).toHaveCount(0)
    const trivia = await page.request.get(BASE_URL + '/ai-frontier/trivia.md')
    expect(trivia.ok()).toBe(true)
    expect(await trivia.text()).toBe(triviaSource)
    await page.reload()
    await expect(page.locator('.frontier-report-title h1')).toHaveText('AI Trivia')
    await expect(page.locator('.frontier-markdown')).toHaveAttribute('aria-busy', 'false')
    if (triviaHeading) await expect(reader.getByRole('heading').first()).toContainText(triviaHeading)
    else await expect(reader).toBeEmpty()
    await expect(page.locator('.frontier-shell')).toHaveCSS('background-color', 'rgb(236, 229, 214)')
    await expectNoDecorativeArrows(page)
    await finishAudit(page, audit)
  })

  test('talk no longer includes the migrated Skill collection and preserves adjacent notes', async ({ page }) => {
    const audit = auditPage(page)
    await gotoRoute(page, '/talk')
    await expectKnownRouteShell(page, '/talk')
    await expect(page.getByRole('heading', { name: /记录一条 README 撰写守则/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Skill 收集/ })).toHaveCount(0)
    await finishAudit(page, audit)
  })

  test('the AVIS3 detail opens from the overview and shows its Markdown explanation', async ({ page }) => {
    const audit = auditPage(page)
    await openOverview(page)
    await page.getByRole('link', { name: '查看规则与完整结果', exact: true }).click()
    await expect(page).toHaveURL(BASE_URL + arena)
    await expectKnownRouteShell(page, arena)
    await expect(page.locator('.frontier-report-cover h1')).toHaveText('AVIS3 Arena Plus')
    await expect(page.locator('.frontier-report-byline time')).toHaveText('发布时间 2026-11-08')
    await expect(page.locator('.frontier-report-meta, .avis3-comparison-note, .frontier-sidebar-back')).toHaveCount(0)
    await expect(page.locator('.avis3-report-actions a[download]')).toHaveCount(0)
    for (const heading of await page.locator('.frontier-section-heading').all()) await expect(heading).toHaveCSS('border-top-width', '0px')
    const rows = leaderboard(page).getByTestId('avis3-result')
    await expect(rows).toHaveCount(14)
    expect(await rows.evaluateAll(elements => elements.map(element => element.dataset.entryId))).toEqual([4,14,5,10,1,2,6,12,7,8,3,15,9,11].map(number => 'official-' + String(number).padStart(3, '0')))
    await expectCleanRanking(page)
    for (const ids of [['official-001', 'official-014'], ['official-007', 'official-008']]) {
      const names = []
      for (const id of ids) names.push(await page.locator('[data-entry-id="' + id + '"] .avis3-contestant strong').innerText())
      expect(names[0]).toBe(names[1])
    }
    await expect(page.getByTestId('avis3-spectra')).toHaveCount(0)
    await rows.first().getByRole('button').click()
    const details = page.getByTestId('avis3-result-details')
    await expect(details).toHaveCount(1)
    await expect(details.locator('.result-round-scores li')).toHaveCount(20)
    await expect(details.locator('.submission-report > h4')).toHaveText('提交时自述')
    await expect(details.locator('.submission-report > summary')).toHaveCount(0)
    await expect.poll(() => details.locator('.submission-report .markdown-body p').count()).toBeGreaterThan(1)
    const reportData = await (await page.request.get(BASE_URL + '/ai-frontier/evaluation-1108/evaluation-1108.json')).json()
    const reportText = await details.locator('.submission-report .markdown-body').textContent()
    expect(reportText.replace(/\s+/g, '')).toBe(reportData.entrants[0].self_report.replace(/\s+/g, ''))
    await expect(details.locator('.markdown-body')).toBeVisible()
    await rows.nth(1).getByRole('button').click()
    await expect(details).toHaveCount(1)
    await expect(rows.first().getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    await expect(details.locator('h3')).toHaveText(await rows.nth(1).locator('.avis3-contestant strong').innerText())
    await mockPlusSpectra(page)
    await details.getByRole('link', { name: '查看该选手频谱' }).click()
    await expect(page.getByTestId('avis3-spectra').getByLabel('参测组合 / CONTESTANT')).toHaveValue('official-014')
    await expect(page.getByTestId('avis3-spectra').getByRole('img')).toHaveCount(3)
    await expect(page.locator('#spectra')).toBeInViewport()
    await expect(page.locator('.frontier-markdown .markdown-body').last()).toBeVisible()
    await rows.nth(3).getByRole('button').click()
    await expect(details).toContainText('API 路由')
    await expect(details).toContainText('OpenCode API')
    await expectNoDecorativeArrows(page)
    for (const score of await details.locator('.result-round-scores strong').allTextContents()) expect(score).toMatch(/^\d+\.\d{4}$/)
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
    await page.getByRole('banner').getByRole('link', { name: 'AVIS3 Arena Plus', exact: true }).click()
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
    const response = await page.request.get(BASE_URL + officialPath)
    const data = await response.json()
    data.entrants = data.entrants.slice(0, 3).map((entry, index) => ({
      ...entry,
      mean: index === 0 ? 850.1234567 : 850.1234568,
      std: [1, 0.01, 9][index],
    }))
    await page.route(dataUrl, route => route.fulfill({ json: data }))
    const audit = auditPage(page)
    await openOverview(page)
    const rows = leaderboard(page).getByTestId('avis3-result')
    expect(await rows.evaluateAll(elements => elements.map(element => element.dataset.entryId))).toEqual([data.entrants[1].id, data.entrants[2].id].sort().concat(data.entrants[0].id))
    expect(await rows.locator('.avis3-result-score strong').allTextContents()).toEqual(['850.1235', '850.1235', '850.1235'])
    expect(await rows.locator('.avis3-result-score strong').evaluateAll(elements => elements.map(element => element.title))).toEqual(['850.1234568', '850.1234568', '850.1234567'])
    expect(await rows.locator('.avis3-rank').allTextContents()).toEqual(['1', '1', '3'])
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


test.describe('AVIS3 Arena Plus spectra', () => {
  test('spectra retain readable legends, log axes and native keyboard controls at each viewport', async ({ page, isMobile }) => {
    const audit = auditPage(page)
    await gotoRoute(page, arena)
    await page.getByRole('button', { name: '打开频谱查看器', exact: true }).click()
    const viewer = page.getByTestId('avis3-spectra')
    await expect(viewer.getByRole('img')).toHaveCount(3)
    await viewer.scrollIntoViewIfNeeded()
    await expect(viewer.getByRole('list', { name: '频谱图例', exact: true })).toContainText('受控真值')
    await expect(viewer.getByRole('list', { name: '频谱图例', exact: true })).toContainText('无控制基线')
    await expect(viewer.locator('.spectra-reading-key')).toHaveCSS('border-top-width', '0px')
    await expect(viewer.locator('.spectra-reading-key')).toHaveCSS('border-bottom-width', '0px')
    await expect(viewer.locator('.spectra-plot').first()).toHaveCSS('border-top-width', '1px')
    await expect(viewer.locator('.spectra-registration, .spectra-data-meta')).toHaveCount(0)
    for (const channel of ['y1', 'y2', 'y3']) {
      const plot = viewer.locator('[data-channel="' + channel + '"]')
      const svg = plot.locator('svg')
      await plot.scrollIntoViewIfNeeded()
      await expect(svg).toBeVisible()
      await expect(svg).toHaveAttribute('role', 'img')
      await expect(svg.locator('title')).toContainText(channel + ' 位移等效 ASD')
      await expect(svg.locator('desc')).toContainText('两轴均为对数刻度')
      const geometry = await svg.evaluate(el => ({
        width: el.getBoundingClientRect().width,
        labelSize: Number.parseFloat(getComputedStyle(el.querySelector('.spectra-ticks')).fontSize) * el.getBoundingClientRect().width / el.viewBox.baseVal.width,
        ticks: [...el.querySelectorAll('.spectra-ticks text')].map(text => text.textContent),
        frame: (() => { const box = el.querySelector('.spectra-frame').getBBox(); return { x: box.x, y: box.y, width: box.width, height: box.height } })(),
        bounds: [...el.querySelectorAll('.spectra-curves path')].map(path => {
          const box = path.getBBox()
          return { x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height }
        }),
      }))
      expect(geometry.width).toBeGreaterThan(300)
      expect(geometry.labelSize).toBeGreaterThanOrEqual(11)
      expect(geometry.ticks.slice(0, 5)).toEqual(['0.01', '0.1', '1', '10', '100'])
      expect(geometry.ticks.some(tick => /e-/.test(tick))).toBe(true)
      for (const bounds of geometry.bounds) {
        expect(bounds.x).toBeCloseTo(geometry.frame.x, 5)
        expect(bounds.right).toBeCloseTo(geometry.frame.x + geometry.frame.width, 5)
        expect(bounds.y).toBeGreaterThan(geometry.frame.y)
        expect(bounds.bottom).toBeLessThan(geometry.frame.y + geometry.frame.height)
      }
    }
    if (isMobile) {
      const boxes = await viewer.locator('.spectra-plot').evaluateAll(plots => plots.map(plot => ({ x: plot.getBoundingClientRect().x, y: plot.getBoundingClientRect().y })))
      expect(boxes[0].x).toBeCloseTo(boxes[1].x, 1)
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y)
      expect(boxes[2].y).toBeGreaterThan(boxes[1].y)
    }
    const contestantSelect = viewer.getByLabel('参测组合 / CONTESTANT')
    const roundSelect = viewer.getByLabel('频谱 / SPECTRUM')
    await contestantSelect.focus()
    await expect(contestantSelect).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(roundSelect).toBeFocused()
    await expect(roundSelect).toHaveCSS('outline-style', 'solid')
    await expect(roundSelect).toHaveCSS('outline-width', '2px')
    await contestantSelect.selectOption('official-001')
    await expect(viewer.getByRole('img')).toHaveCount(3)
    await roundSelect.selectOption('round_01')
    await expect(viewer.locator('svg title').first()).toContainText('统一第 1 轮')
    await finishAudit(page, audit)
  })
  test.beforeEach(async ({ page }) => {
    await mockFrontierNotes(page)
    await mockPlusSpectra(page)
  })

  test('all fourteen entries expose pooled and shared first-round curves lazily', async ({ page }) => {
    test.setTimeout(90_000)
    const data = await (await page.request.get(BASE_URL + officialPath)).json()
    const requests = []
    page.on('request', request => {
      if (request.url().includes('/evaluation-1108/spectra/')) requests.push(new URL(request.url()).pathname.split('/').at(-1))
    })
    await gotoRoute(page, arena)
    await expect(leaderboard(page).getByTestId('avis3-result')).toHaveCount(14)
    await expect(page.getByTestId('avis3-spectra')).toHaveCount(0)
    expect(requests).toEqual([])
    await page.getByRole('link', { name: /查看公开频谱/ }).click()
    const viewer = page.getByTestId('avis3-spectra')
    const contestant = viewer.getByLabel('参测组合 / CONTESTANT')
    const selection = viewer.getByLabel('频谱 / SPECTRUM')
    await expect(viewer.getByRole('img')).toHaveCount(3)
    await expect(contestant).toHaveValue('official-004')
    await expect(selection).toHaveValue('pooled')
    await expect(contestant.locator('option')).toHaveCount(14)
    await expect(selection.locator('option')).toHaveCount(2)
    for (const entry of data.entrants) {
      await contestant.selectOption(entry.id)
      for (const mode of ['pooled', 'round_01']) {
        await selection.selectOption(mode)
        await expect(viewer.getByRole('img')).toHaveCount(3)
        const label = mode === 'pooled' ? '20 轮功率平均' : '统一第 1 轮'
        await expect(viewer.locator('svg title').first()).toHaveText(entry.model + ' · 均分 ' + entry.mean.toFixed(4) + '，' + label + '，y1 位移等效 ASD')
        const score = mode === 'pooled' ? entry.mean : entry.rounds.find(round => round.index === 1).score
        await expect(viewer.getByTestId('spectra-round-score')).toHaveAttribute('title', String(score))
        const file = entry.id + '-' + (mode === 'pooled' ? 'pooled' : 'round-01') + '.json'
        expect(requests).toContain(file)
        const points = await viewer.locator('.spectra-curves path').evaluateAll(paths => paths.map(path => (path.getAttribute('d').match(/[ML]/g) || []).length))
        expect(points).toEqual([5, 5, 5, 5, 5, 5])
      }
    }
    for (const file of ['frequency.json', 'baseline-pooled.json', 'baseline-round-01.json']) {
      expect(requests.filter(request => request === file)).toHaveLength(1)
    }
    await expectNoHorizontalOverflow(page)
  })

  test('switching entries clears curves and ignores a late official response', async ({ page }) => {
    await gotoRoute(page, arena)
    await page.getByRole('button', { name: '打开频谱查看器', exact: true }).click()
    const viewer = page.getByTestId('avis3-spectra')
    await expect(viewer.getByRole('img')).toHaveCount(3)
    let releaseSlow
    let notifyStarted
    let notifyFinished
    const released = new Promise(resolve => { releaseSlow = resolve })
    const started = new Promise(resolve => { notifyStarted = resolve })
    const finished = new Promise(resolve => { notifyFinished = resolve })
    await page.route('**/evaluation-1108/spectra/official-014-pooled.json', async route => {
      notifyStarted()
      await released
      await route.fulfill({ json: plusSpectrum('official-014', 'pooled') })
      notifyFinished()
    })
    const contestant = viewer.getByLabel('参测组合 / CONTESTANT')
    await contestant.selectOption('official-014')
    await started
    await expect(viewer.getByRole('img')).toHaveCount(0)
    await expect(viewer.getByRole('status')).toContainText(await contestant.locator('option:checked').innerText())
    await contestant.selectOption('official-005')
    await expect(viewer.getByRole('img')).toHaveCount(3)
    const paths = await viewer.locator('.spectra-curves path').evaluateAll(elements => elements.map(element => element.getAttribute('d')))
    releaseSlow()
    await finished
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await expect(contestant).toHaveValue('official-005')
    expect(await viewer.locator('.spectra-curves path').evaluateAll(elements => elements.map(element => element.getAttribute('d')))).toEqual(paths)
  })

  for (const failure of [
    { label: 'HTTP failure', status: 503, contentType: 'application/json', body: '{"error":"temporary"}' },
    { label: 'HTML fallback', status: 200, contentType: 'text/html', body: '<html>Unexpected fallback</html>' },
  ]) {
    test('official spectra recover after ' + failure.label, async ({ page }) => {
      const url = '**/evaluation-1108/spectra/official-004-pooled.json'
      const failing = route => route.fulfill({ status: failure.status, contentType: failure.contentType, body: failure.body })
      await page.route(url, failing)
      await gotoRoute(page, arena)
      await page.getByRole('button', { name: '打开频谱查看器', exact: true }).click()
      const viewer = page.getByTestId('avis3-spectra')
      const alert = viewer.getByRole('alert')
      await expect(alert).toContainText('本次频谱暂时无法加载')
      await expect(viewer.getByRole('img')).toHaveCount(0)
      await page.unroute(url, failing)
      await alert.getByRole('button', { name: '重新加载频谱' }).click()
      await expect(viewer.getByRole('img')).toHaveCount(3)
      await expect(alert).toHaveCount(0)
      await expect(viewer.getByLabel('参测组合 / CONTESTANT')).toHaveValue('official-004')
    })
  }
})

test('official results remain available while the methodology retries', async ({ page }) => {
  await mockFrontierNotes(page)
  const url = '**/evaluation-1108/methodology.md'
  const failing = route => route.fulfill({ status: 503, body: 'Temporary report failure' })
  await page.route(url, failing)
  await gotoRoute(page, arena)
  await expect(leaderboard(page).getByTestId('avis3-result')).toHaveCount(14)
  await expect(leaderboard(page).getByTestId('avis3-result').first().getByRole('button')).toBeEnabled()
  await page.getByRole('link', { name: '评测与评分说明', exact: true }).click()
  await expect(page.getByRole('heading', { name: '评测与评分说明', exact: true })).toBeInViewport()
  const error = page.locator('.frontier-reading-card .frontier-markdown').getByRole('alert')
  await expect(error).toBeVisible()
  await page.unroute(url, failing)
  await error.getByRole('button', { name: '重新加载', exact: true }).click()
  await expect(page.locator('.frontier-reading-card .markdown-body')).toBeVisible()
  await expect(error).toHaveCount(0)
})

test('the retired Preview route shows Arena 404 and stays out of the static manifest', async ({ page }) => {
  expect(STATIC_ROUTES).not.toContain(preview)
  await mockFrontierNotes(page)
  await gotoRoute(page, preview)
  const missing = page.locator('[data-page="arena-not-found"]')
  await expect(missing).toBeVisible()
  await expect(missing.getByRole('heading', { level: 1 })).toContainText('404')
  await expect(leaderboard(page)).toHaveCount(0)
  await missing.getByRole('link', { name: /返回 Ysy AI Frontier/ }).click()
  await expect(page).toHaveURL(BASE_URL + overview)
  await expect(leaderboard(page)).toBeVisible()
})

test('the methodology loads both accessible illustrations', async ({ page }) => {
  await gotoRoute(page, arena)
  const reader = page.locator('.frontier-reading-card .markdown-body')
  await expect(reader).toBeVisible()
  for (const name of ['control-loop.svg', 'quality-curve.svg']) {
    const image = reader.locator('img[src$="/figures/' + name + '"]')
    await expect(image).toHaveCount(1)
    expect((await image.getAttribute('alt'))?.trim()).toBeTruthy()
    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0)).toBe(true)
  }
  await reader.locator('img').first().click()
  const preview = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('button', { name: '上一张图片', exact: true })).toHaveText('上一张')
  await expect(preview.getByRole('button', { name: '下一张图片', exact: true })).toHaveText('下一张')
  expect(await preview.innerText()).not.toMatch(/[←→↑↓↖↗↘↙‹›]/u)
  await preview.getByRole('button', { name: '下一张图片', exact: true }).click()
  await expect(preview.locator('img')).toHaveAttribute('alt', /按实际评分公式/)
  await preview.getByRole('button', { name: '关闭图片预览', exact: true }).click()
  await expectNoHorizontalOverflow(page)
  await expectNoDecorativeArrows(page)
})
