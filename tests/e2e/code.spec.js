import { test, expect } from '@playwright/test'
import { expectNoHorizontalOverflow } from './test-helpers'

const API = '**/github-contributions-api.jogruber.de/v4/**'
const DAY = 86_400_000
const today = new Date().toISOString().slice(0, 10)
const finish = Date.parse(today + 'T00:00:00Z')
const first = new Date(finish - 365 * DAY).toISOString().slice(0, 10)
const dateAt = offset => new Date(finish + offset * DAY).toISOString().slice(0, 10)

function fixture(start, end, values) {
  const contributions = []
  for (let day = Date.parse(start + 'T00:00:00Z'); day <= Date.parse(end + 'T00:00:00Z'); day += DAY) {
    const date = new Date(day).toISOString().slice(0, 10)
    const count = values[date] || 0
    contributions.push({ date, count, level: count ? Math.min(4, count) : 0 })
  }
  return { contributions, total: { lastYear: contributions.reduce((sum, day) => sum + day.count, 0) } }
}
const primary = fixture(first, today, { [dateAt(-2)]: 3, [dateAt(-1)]: 4, [today]: 10 })
const secondary = fixture(first, today, { [dateAt(-2)]: 2, [today]: 5 })
const historical = fixture('2025-01-01', '2025-12-31', { '2025-12-29': 2, '2025-12-30': 4, '2025-12-31': 1 })
const zero = fixture(first, today, {})
const projectFixture = [
  { name: '星图工具', desc: '整理公开代码', category: 'code', repo: 'https://github.com/example/code' },
  { name: '音乐机关盒', desc: '弹珠与旋律', category: 'toy', homepage: '/music-box' },
  { name: '轨道项目', desc: '探索与实验', category: 'project', homepage: 'https://example.com' },
]

async function mockData(page, handler) {
  await page.route('**/code_proj.json', route => route.fulfill({ json: projectFixture }))
  await page.route(API, async route => {
    if (handler) return handler(route)
    const url = new URL(route.request().url())
    const json = url.searchParams.get('y') === '2025' ? historical : url.pathname.endsWith('/liuyinchu') ? secondary : primary
    await route.fulfill({ json })
  })
}
const panel = page => page.locator('.github-panel')
const stat = (page, name) => panel(page).locator('[data-stat="' + name + '"] dd')

test('real-data panel switches accounts and periods with consistent statistics', async ({ page }) => {
  const requests = []
  await mockData(page, async route => {
    const url = new URL(route.request().url())
    requests.push(url.pathname + url.search)
    await route.fulfill({ json: url.searchParams.get('y') === '2025' ? historical : url.pathname.endsWith('/liuyinchu') ? secondary : primary })
  })
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await expect(stat(page, 'total')).toHaveText('17次')
  await expect(stat(page, 'active')).toHaveText('3天')
  await expect(stat(page, 'streak')).toHaveText('3天')
  await expect(stat(page, 'latest')).toHaveText(today)
  await expect(panel(page).getByRole('button', { name: '@pifuyuini', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(panel(page).locator('.contribution-day')).toHaveCount(primary.contributions.length)
  await panel(page).getByRole('button', { name: '@liuyinchu', exact: true }).click()
  await expect(stat(page, 'total')).toHaveText('7次')
  await expect(stat(page, 'active')).toHaveText('2天')
  await expect(stat(page, 'streak')).toHaveText('1天')
  await panel(page).getByRole('combobox', { name: '贡献期间' }).selectOption('2025')
  await expect(stat(page, 'streak')).toHaveText('3天')
  await expect(stat(page, 'latest')).toHaveText('2025-12-31')
  await expect(panel(page).locator('.calendar-range')).toContainText('2025-01-01')
  await expect(panel(page).locator('.fetched-time')).toContainText('获取于')
  await expect(panel(page).locator('.source-delay')).toContainText('服务缓存约一小时')
  expect(requests).toEqual(['/v4/pifuyuini?y=last', '/v4/liuyinchu?y=last', '/v4/liuyinchu?y=2025'])
})

test('calendar offers one Tab entry, day/week keyboard navigation and tap details', async ({ page }) => {
  await mockData(page)
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  const cells = panel(page).locator('.contribution-day')
  await expect(cells).toHaveCount(primary.contributions.length)
  await expect(panel(page).locator('.contribution-day[tabindex="0"]')).toHaveCount(1)
  const latest = cells.last()
  await latest.focus()
  await expect(panel(page).getByRole('tooltip')).toContainText('10 次贡献')
  await latest.press('Home')
  await expect(cells.first()).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(cells.nth(7)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(cells.nth(6)).toBeFocused()
  await page.keyboard.press('End')
  await expect(latest).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(cells.nth(primary.contributions.length - 8)).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel(page).getByRole('tooltip')).toHaveCount(0)
  await latest.click()
  await expect(panel(page).getByRole('tooltip')).toContainText('10 次贡献')
})

test('mobile keeps the calendar scroll inside its panel and preserves the horizontal stats bar', async ({ page }) => {
  await mockData(page)
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await expect(stat(page, 'total')).toHaveText('17次')
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 })
    await expectNoHorizontalOverflow(page)
    const metrics = await panel(page).evaluate(element => {
      const calendar = element.querySelector('.calendar-scroll')
      const stats = [...element.querySelectorAll('.contribution-stats > div')].map(node => node.getBoundingClientRect())
      const cells = [...element.querySelectorAll('.contribution-day')].map(node => node.getBoundingClientRect())
      return { scrollable: calendar.scrollWidth > calendar.clientWidth, oneRow: stats.every(item => item.top === stats[0].top), cellsFitRows: cells.every(cell => cell.height <= 12.1) }
    })
    if (width < 768) expect(metrics.scrollable).toBe(true)
    expect(metrics.oneRow).toBe(true)
    expect(metrics.cellsFitRows).toBe(true)
  }
})

test('initial network failure exposes retry and genuine zero activity remains valid', async ({ page }) => {
  let attempts = 0
  await mockData(page, async route => {
    attempts += 1
    await route.fulfill(attempts === 1 ? { status: 503, json: { error: 'unavailable' } } : { json: zero })
  })
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await expect(panel(page).getByText('暂时无法连接贡献数据')).toBeVisible()
  await expect(panel(page).locator('.contribution-stats')).toHaveCount(0)
  await panel(page).getByRole('button', { name: '重新获取' }).click()
  await expect(stat(page, 'total')).toHaveText('0次')
  await expect(stat(page, 'latest')).toHaveText('暂无')
  expect(attempts).toBe(2)
})

test('stale cached data stays labelled on failure, retry refreshes and fresh cache avoids another request', async ({ page }) => {
  await page.addInitScript(({ payload }) => {
    localStorage.setItem('code-contributions:v1:pifuyuini:last', JSON.stringify({ payload, fetchedAt: Date.now() - 2 * 60 * 60 * 1000 }))
  }, { payload: primary })
  let attempts = 0
  await mockData(page, async route => {
    attempts += 1
    await route.fulfill(attempts === 1 ? { status: 503, json: {} } : { json: primary })
  })
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await expect(panel(page).locator('.cache-warning')).toContainText('显示过期缓存')
  await expect(stat(page, 'total')).toHaveText('17次')
  const retryResponse = page.waitForResponse(response => response.url().includes('/v4/pifuyuini?y=last') && response.status() === 200)
  await panel(page).getByRole('button', { name: '重试', exact: true }).click()
  await (await retryResponse).finished()
  await expect(panel(page)).toHaveAttribute('aria-busy', 'false')
  await expect(panel(page).locator('.cache-warning')).toHaveCount(0)
  await expect(stat(page, 'total')).toHaveText('17次')
  const secondaryResponse = page.waitForResponse(response => response.url().includes('/v4/liuyinchu?y=last') && response.status() === 200)
  await panel(page).getByRole('button', { name: '@liuyinchu', exact: true }).click()
  await (await secondaryResponse).finished()
  await expect(panel(page)).toHaveAttribute('aria-busy', 'false')
  await expect(stat(page, 'total')).toHaveText('17次')
  expect(attempts).toBe(3)
  await panel(page).getByRole('button', { name: '@pifuyuini', exact: true }).click()
  await expect(stat(page, 'total')).toHaveText('17次')
  await expect(panel(page)).toHaveAttribute('aria-busy', 'false')
  await expect.poll(() => attempts).toBe(3)
})

test('late account responses cannot overwrite the current account', async ({ page }) => {
  // Keep this one response uncancellable to exercise the request-sequence guard,
  // including the response body arriving after the selected account has changed.
  await page.addInitScript(() => {
    const originalFetch = window.fetch
    window.fetch = (resource, options) => originalFetch(resource,
      typeof resource === 'string' && resource.includes('github-contributions-api.jogruber.de/v4/pifuyuini?')
        ? { ...options, signal: undefined } : options)
  })
  let release
  const pending = new Promise(resolve => { release = resolve })
  await mockData(page, async route => {
    if (route.request().url().includes('/pifuyuini?')) {
      await pending
      await route.fulfill({ json: primary })
    } else {
      await route.fulfill({ json: secondary })
    }
  })
  const initialRequest = page.waitForRequest('**/v4/pifuyuini?y=last')
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await initialRequest
  await panel(page).getByRole('button', { name: '@liuyinchu', exact: true }).click()
  await expect(stat(page, 'total')).toHaveText('7次')
  await expect(panel(page)).toHaveAttribute('aria-busy', 'false')
  const lateResponse = page.waitForResponse(response => response.url().includes('/v4/pifuyuini?y=last') && response.status() === 200)
  release()
  await (await lateResponse).finished()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(panel(page).getByRole('button', { name: '@liuyinchu', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(stat(page, 'total')).toHaveText('7次')
  await expect(stat(page, 'active')).toHaveText('2天')
})

test('project filters, labelled search, clearing and empty results work with accessible links', async ({ page }) => {
  await mockData(page)
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.results-count')).toHaveText('找到 3 个项目')
  await page.getByRole('button', { name: '巧 思', exact: true }).click()
  await expect(page.getByRole('button', { name: '巧 思', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.grid .card')).toHaveCount(1)
  const search = page.getByRole('searchbox', { name: '搜索项目名称或简介' })
  await search.fill('不存在')
  await expect(page.locator('.empty-state')).toContainText('暂时没有匹配的项目')
  await expect(page.locator('.results-count')).toContainText('找到 0 个项目')
  await page.getByRole('button', { name: '清除搜索' }).click()
  await expect(search).toBeFocused()
  await expect(page.locator('.grid .card')).toHaveCount(1)
  await search.fill('abc')
  await page.getByRole('button', { name: '重置筛选' }).click()
  await expect(page.locator('.grid .card')).toHaveCount(3)
  await expect(page.locator('.grid .card[tabindex]')).toHaveCount(0)
  await expect(page.locator('.grid a').first()).toHaveAttribute('rel', 'noopener noreferrer')
})

test('reduced motion stops JavaScript spotlight and CSS motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mockData(page)
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  const card = page.locator('.grid .card').first()
  await expect(card).toBeVisible()
  await card.dispatchEvent('pointermove', { clientX: 100, clientY: 100, pointerType: 'mouse' })
  const style = await card.evaluate(element => ({
    x: element.style.getPropertyValue('--mouse-x'),
    transition: getComputedStyle(element).transitionDuration,
    panelAnimation: getComputedStyle(document.querySelector('.github-panel')).animationName,
  }))
  expect(style.x).toBe('')
  expect(style.transition).toBe('0s')
  expect(style.panelAnimation).toBe('none')
})

test('normal desktop motion updates only the hovered card and cleans up on leave or preference change', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Spotlight follows a fine hover pointer on desktop')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await mockData(page)
  await page.goto('/code', { waitUntil: 'domcontentloaded' })
  const cards = page.locator('.grid .card')
  await expect(cards).toHaveCount(3)
  const firstCard = cards.first()
  await firstCard.hover({ position: { x: 80, y: 55 } })
  await expect.poll(() => firstCard.evaluate(element => element.style.getPropertyValue('--mouse-x'))).not.toBe('')
  expect(await cards.evaluateAll(elements => elements.slice(1).map(element => element.style.getPropertyValue('--mouse-x')))).toEqual(['', ''])
  await page.mouse.move(2, 2)
  await expect.poll(() => firstCard.evaluate(element => element.style.getPropertyValue('--mouse-x'))).toBe('')
  await firstCard.hover({ position: { x: 100, y: 70 } })
  await expect.poll(() => firstCard.evaluate(element => element.style.getPropertyValue('--mouse-x'))).not.toBe('')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => firstCard.evaluate(element => element.style.getPropertyValue('--mouse-x'))).toBe('')
  await firstCard.dispatchEvent('pointermove', { clientX: 120, clientY: 100, pointerType: 'mouse' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  expect(await firstCard.evaluate(element => element.style.getPropertyValue('--mouse-x'))).toBe('')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: '巧 思', exact: true }).click()
  await expect(cards).toHaveCount(1)
  await expect(page.locator('.projects-leave-active')).toHaveCount(0)
  await expect(cards.locator('a')).toHaveCount(1)
  await expect(cards.locator('a')).toBeVisible()
  await expect(cards.locator('a')).toHaveAttribute('href', '/music-box')
})
