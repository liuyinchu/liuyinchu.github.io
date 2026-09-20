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

test('articles without headings still expose the switch and keep long inline formulas reachable', async ({ page, isMobile }) => {
  await page.route('**/markdown/hinf_robust_control_tutorial.md', route =>
    route.fulfill({
      contentType: 'text/markdown',
      // Match the rendered math box without depending on the external MathJax CDN.
      body: "一篇没有标题的随记。\n\n正文仍然可以切换排版。\n\n<mjx-container jax=\"CHTML\"><span style=\"display:inline-block;white-space:nowrap\">f(x) = a₀ + a₁x + a₂x² + a₃x³ + a₄x⁴ + a₅x⁵ + a₆x⁶ + a₇x⁷ + a₈x⁸ + a₉x⁹</span></mjx-container>",
    }),
  )
  await gotoRoute(page, articlePath)
  await expect(page.getByText('一篇没有标题的随记。', { exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '文章目录' })).toHaveCount(0)
  await page.getByRole('button', { name: '切换至 Enhanced 排版', exact: true }).click()
  await expect(page.getByRole('button', { name: '切换至原版排版', exact: true })).toBeVisible()
  await expect(page.locator('[data-article-content] .markdown-body--enhanced')).toContainText('一篇没有标题的随记。')
  const formula = page.locator('mjx-container').first()
  await expect(formula).toBeVisible()
  if (isMobile) {
    const canScrollToEnd = await formula.evaluate(element => {
      element.scrollLeft = element.scrollWidth
      return element.scrollLeft > 0
    })
    expect(canScrollToEnd, 'wide inline formula should be independently scrollable').toBe(true)
  }
  await expectNoHorizontalOverflow(page)
})
