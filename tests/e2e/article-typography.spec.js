import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'

const articlePath = '/space1/hinf_robust_control_tutorial'

test('article typography defaults to original and toggles with a full reload in both directions', async ({ page, isMobile }) => {
  await gotoRoute(page, articlePath)
  const enhancedButton = page.getByRole('button', { name: '切换至 Enhanced 排版', exact: true })
  await expect(enhancedButton).toBeVisible()
  await expect(enhancedButton).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.markdown-body--enhanced')).toHaveCount(0)

  if (isMobile) {
    await expect(page.getByRole('navigation', { name: '文章目录' })).toBeHidden()
    await page.getByRole('button', { name: '展开目录 +' }).click()
    await expect(page.getByRole('navigation', { name: '文章目录' })).toBeVisible()
    await page.getByRole('button', { name: '收起目录 −' }).click()
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    enhancedButton.click(),
  ])
  const originalButton = page.getByRole('button', { name: '切换至原版排版', exact: true })
  await expect(originalButton).toBeVisible()
  await expect(originalButton).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-article-content] .markdown-body--enhanced')).toBeVisible()
  expect(await page.evaluate(() => performance.getEntriesByType('navigation')[0].type)).toBe('reload')
  await expect(page).toHaveURL(new RegExp(articlePath + '$'))
  await expectNoHorizontalOverflow(page)

  if (isMobile) await page.getByRole('button', { name: '展开目录 +' }).click()
  const sectionLink = page.getByRole('navigation', { name: '文章目录' })
    .getByRole('link', { name: '0.1 信号范数', exact: true })
  await sectionLink.click()
  await expect(sectionLink).toHaveAttribute('aria-current', 'location')

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    originalButton.click(),
  ])
  await expect(enhancedButton).toBeVisible()
  await expect(page.locator('.markdown-body--enhanced')).toHaveCount(0)
  expect(await page.evaluate(() => performance.getEntriesByType('navigation')[0].type)).toBe('reload')
  expect(await page.evaluate(() => localStorage.getItem('article-typography'))).toBe('original')
})

test('the saved preference applies to other journal articles but not shared Markdown pages', async ({ page }) => {
  await gotoRoute(page, articlePath)
  await page.getByRole('button', { name: '切换至 Enhanced 排版', exact: true }).click()
  await expect(page.getByRole('button', { name: '切换至原版排版', exact: true })).toBeVisible()

  for (const path of ['/markdown-components', '/ai-frontier']) {
    await gotoRoute(page, path)
    await expect(page.locator('.markdown-body').first()).toBeVisible()
    await expect(page.locator('.markdown-body--enhanced')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /切换至.*排版/ })).toHaveCount(0)
    await expectNoHorizontalOverflow(page)
  }

  await gotoRoute(page, '/space1/ai_agent_blog')
  await expect(page.getByRole('button', { name: '切换至原版排版', exact: true })).toBeVisible()
  await expect(page.locator('[data-article-content] .markdown-body--enhanced')).toBeVisible()
  await expect(page.locator('[data-article-content] pre code').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

// Wait for real CHTML glyphs, including MathJax's lazy rendering and web fonts.
async function expectRenderedMath(formula) {
  await formula.scrollIntoViewIfNeeded()
  await expect(formula.locator('mjx-math mjx-c').first()).toBeAttached({ timeout: 45_000 })
  await formula.page().evaluate(() => document.fonts.ready)
}

async function expectNativeInlineLayout(formula) {
  const readGeometry = () => formula.evaluate(element => {
    element.scrollLeft = 1000
    element.scrollTop = 1000
    const scroll = { x: element.scrollLeft, y: element.scrollTop }
    element.scrollLeft = 0
    element.scrollTop = 0

    // Compare actual glyph alignment with the same CHTML in MathJax's native
    // context outside the article. A zero-height inline box marks the text baseline.
    const paragraph = element.closest('p')
    const paragraphStyle = getComputedStyle(paragraph)
    const reference = document.createElement('p')
    reference.style.cssText = 'position:fixed;left:-10000px;top:0;margin:0;white-space:nowrap;'
    for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing']) {
      reference.style.setProperty(property, paragraphStyle.getPropertyValue(property))
    }
    const marker = document.createElement('span')
    marker.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline;'
    const nativeMarker = marker.cloneNode()
    const nativeFormula = element.cloneNode(true)
    reference.append('文字 ', nativeFormula, nativeMarker)
    document.body.append(reference)
    const measuredRun = document.createElement('span')
    measuredRun.style.whiteSpace = 'nowrap'
    element.before(measuredRun)
    measuredRun.append(element, marker)
    try {
      const baselineOffset = element.querySelector('mjx-math').getBoundingClientRect().bottom - marker.getBoundingClientRect().top
      const nativeOffset = nativeFormula.querySelector('mjx-math').getBoundingClientRect().bottom - nativeMarker.getBoundingClientRect().top
      return { scroll, baselineDifference: Math.abs(baselineOffset - nativeOffset) }
    } finally {
      measuredRun.before(element)
      measuredRun.remove()
      reference.remove()
    }
  })
  await expect.poll(async () => (await readGeometry()).baselineDifference, {
    message: 'glyphs should regain the native MathJax text baseline after resize',
  }).toBeLessThanOrEqual(1)
  expect((await readGeometry()).scroll, 'ordinary inline math must not create a scrollable box').toEqual({ x: 0, y: 0 })
}

test('real article subscripts, hat theta, and g retain their inline baseline without tiny scrollbars', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => localStorage.setItem('article-typography', 'enhanced'))
  await gotoRoute(page, '/space1/lab_guide_intro')
  const article = page.locator('[data-article-content] .markdown-body--enhanced')
  await expect(article).toBeVisible()

  const observations = article.locator('p').filter({ hasText: '当实验已经完成，观测值变为具体数据' })
  const definitions = article.locator('p').filter({ hasText: '是估计规则。这个定义本身并不要求' })
  const samples = [
    observations.locator('mjx-container:not([display="true"])').first(),
    definitions.locator('mjx-container:not([display="true"])').nth(0),
    definitions.locator('mjx-container:not([display="true"])').nth(2),
  ]
  // Scrolling the actual paragraphs triggers the production lazy renderer.
  for (const paragraph of [observations, definitions]) {
    await paragraph.scrollIntoViewIfNeeded()
    await expect(paragraph.locator('mjx-container[jax="CHTML"]').first()).toBeAttached({ timeout: 45_000 })
  }
  for (const formula of samples) {
    await expectRenderedMath(formula)
    await expectNativeInlineLayout(formula)
  }
  await expectNoHorizontalOverflow(page)
})

test('articles without headings keep real long inline formulas scrollable only while necessary', async ({ page }) => {
  test.setTimeout(120_000)
  await page.route('**/markdown/hinf_robust_control_tutorial.md', route =>
    route.fulfill({
      contentType: 'text/markdown',
      // Real TeX goes through the app's production MathJax renderer.
      body: '一篇没有标题的随记。\n\n正文仍然可以切换排版。\n\n长公式 $f(x)=a_0+a_1x+a_2x^2+a_3x^3+a_4x^4+a_5x^5+a_6x^6+a_7x^7+a_8x^8$ 仍然可以完整阅读。',
    }),
  )
  await gotoRoute(page, articlePath)
  await expect(page.getByText('一篇没有标题的随记。', { exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '文章目录' })).toHaveCount(0)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.getByRole('button', { name: '切换至 Enhanced 排版', exact: true }).click(),
  ])
  await expect(page.getByRole('button', { name: '切换至原版排版', exact: true })).toBeVisible()
  const formula = page.locator('[data-article-content] mjx-container[jax="CHTML"]').first()
  await expect(formula).toBeAttached({ timeout: 45_000 })
  await expectRenderedMath(formula)

  // Exercise both transitions in both browser projects; no reload or retypeset
  // should be needed when the article gains or loses available width.
  for (const width of [390, 1280, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await expect.poll(() => formula.evaluate(element => {
      const math = element.querySelector('mjx-math')
      element.scrollLeft = element.scrollWidth
      const scrolled = element.scrollLeft > 0
      element.scrollLeft = 0
      return {
        mathExceedsParagraph: math.getBoundingClientRect().width > element.closest('p').getBoundingClientRect().width,
        scrolled,
      }
    }), { message: 'only math wider than the available paragraph should scroll' }).toEqual({
      mathExceedsParagraph: width === 390,
      scrolled: width === 390,
    })
    if (width === 1280) {
      // Wait before inserting measurement probes so their DOM mutations cannot
      // accidentally stand in for the production resize notification.
      await expect(formula).not.toHaveClass(/md-inline-overflow/)
      await expectNativeInlineLayout(formula)
    }
    await expectNoHorizontalOverflow(page)
  }
})
