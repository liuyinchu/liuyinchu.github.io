import { expect, test } from '@playwright/test'
import {
  auditPage,
  BASE_URL,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const chapters = [
  ['about-space', '这个空间，也在介绍我。'],
  ['about-names', '名字有一点偏航。'],
  ['about-purpose', '想法，总得有个落点。'],
  ['about-wander', '这里可以认真，也可以随便逛逛。'],
  ['about-making', '一边使用，一边搭建。'],
  ['about-curiosity', '保留好奇，也保留一点抽象。'],
]
const retiredRoutes = ['/about/site', '/about/self', '/research', '/academic']
const identityPageName = /^(?:学术主页|学术概览)(?:，|$)/

async function expectCompleteStory(page) {
  const story = page.getByTestId('about-story')
  await expect(story).toBeVisible()
  await expect(story.getByRole('heading', { level: 1 })).toHaveText('关于我 & 关于本站')
  await expect(story.locator('section[id]')).toHaveCount(chapters.length)
  for (const [id, title] of chapters) {
    await expect(story.locator('#' + id).getByRole('heading', { level: 2 })).toHaveText(title)
  }
  for (const name of [/\bLiuYinChu\b/, /\bYing\b/, /\bYin\b/, /\bpifuyuini\b/, '🤓☝️']) {
    await expect(story).toContainText(name)
  }
  const making = story.locator('#about-making')
  for (const technology of ['Vue 3', 'Vite', 'Vue Router', 'Markdown', 'JSON', 'GitHub Pages', 'markdown-it', 'highlight.js', 'MathJax', 'Mermaid', /WebGL(?:2)?/]) {
    await expect(making).toContainText(technology)
  }
  await expect(story).not.toContainText(/学术主页|学术概览|研究方向|研究兴趣|博士生|硕士生|研究生|Google Scholar|ORCID|Ph\.?D/i)
  return story
}

async function expectReadableToFooter(page) {
  const overflow = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflowY,
    body: getComputedStyle(document.body).overflowY,
  }))
  expect(overflow.html, 'the document must allow vertical scrolling').not.toMatch(/hidden|clip/)
  expect(overflow.body, 'the body must allow vertical scrolling').not.toMatch(/hidden|clip/)
  for (const [id] of chapters) {
    const heading = page.locator('#' + id).getByRole('heading', { level: 2 })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
    await expect(heading).toBeInViewport()
    await expectNoHorizontalOverflow(page)
  }
  const footerBottom = page.locator('.site-footer .footer-bottom')
  await footerBottom.scrollIntoViewIfNeeded()
  await expect(footerBottom).toBeInViewport()
  await expect(page.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expectNoHorizontalOverflow(page)
}

async function expectCurrentNavigation(page) {
  const navigation = page.locator('header, .site-footer')
  for (const route of retiredRoutes) {
    await expect(navigation.locator('a[href="' + route + '"]')).toHaveCount(0)
  }
  const footer = page.getByRole('navigation', { name: 'Footer navigation' })
  await expect(footer.getByRole('link', { name: '关于我 & 关于本站', exact: true })).toHaveAttribute('href', '/about/me')
  await expect(footer.getByRole('link', { name: '版权说明', exact: true })).toHaveAttribute('href', '/credit')
}

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

test('the About directory opens the full story and keeps its controls and Footer reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const audit = auditPage(page)
  await gotoRoute(page, '/about')
  await page.getByRole('button', { name: '进入关于页面目录', exact: true }).click()
  const directory = page.getByRole('navigation', { name: '关于页面入口', exact: true })
  await expect(directory.getByRole('link')).toHaveCount(2)
  const storyLink = directory.getByRole('link', { name: /关于我 & 关于本站/ })
  await expect(storyLink).toHaveAttribute('href', '/about/me')
  await expect(directory.getByRole('link', { name: /版权说明/ })).toHaveAttribute('href', '/credit')
  await storyLink.click()
  await expect(page).toHaveURL(BASE_URL + '/about/me')
  await expectKnownRouteShell(page, '/about/me')
  const story = await expectCompleteStory(page)
  const field = story.locator('.stellar-field[data-profile="about"]')
  await expect(field).toHaveAttribute('data-renderer', /^(?:webgl2|unavailable)$/)
  if (await field.getAttribute('data-renderer') === 'webgl2') {
    await story.getByRole('button', { name: '暂停星空动画', exact: true }).click()
    await expect(field).toHaveAttribute('data-paused', 'true')
    const resume = story.getByRole('button', { name: '继续星空动画', exact: true })
    await expect(resume).toHaveAttribute('aria-pressed', 'true')
    await resume.click()
    await expect(field).toHaveAttribute('data-paused', 'false')
    await story.getByRole('button', { name: '星空视角回正', exact: true }).click()
  } else {
    await expect(story.getByRole('button', { name: '暂停星空动画', exact: true })).toBeDisabled()
    await expect(field.locator('.stellar-field__fallback')).toBeVisible()
  }
  const index = story.getByRole('navigation', { name: '关于我与本站：章节索引' })
  await expect(index.getByRole('link')).toHaveCount(6)
  await index.getByRole('link', { name: '第2节：名字偏航', exact: true }).click()
  await expect(story.locator('#about-names')).toBeFocused()
  await expect(story.locator('#about-names').getByRole('heading', { level: 2 })).toBeInViewport()
  await expectReadableToFooter(page)
  await expectCurrentNavigation(page)
  const footer = page.getByRole('navigation', { name: 'Footer navigation' })
  await footer.getByRole('link', { name: '版权说明', exact: true }).click()
  await expect(page).toHaveURL(BASE_URL + '/credit')
  await expectKnownRouteShell(page, '/credit')
  await finishAudit(page, audit)
})

test('reduced motion keeps every chapter and the Footer readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  await expectCompleteStory(page)
  await expectReadableToFooter(page)
  await finishAudit(page, audit)
})

test('WebGL unavailability leaves a visible static star map and complete readable content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null
      return getContext.call(this, type, ...args)
    }
  })
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  const story = await expectCompleteStory(page)
  const field = story.locator('.stellar-field[data-profile="about"]')
  await expect(field).toHaveAttribute('data-renderer', 'unavailable')
  const fallback = field.locator('.stellar-field__fallback')
  await expect(fallback).toBeVisible()
  await expect(fallback.locator('svg')).toBeVisible()
  await expect(fallback).toContainText('当前设备显示静态星图')
  await expect(story.getByRole('button', { name: '暂停星空动画', exact: true })).toBeDisabled()
  await expect(story.getByRole('button', { name: '星空视角回正', exact: true })).toBeDisabled()
  await expectReadableToFooter(page)
  await finishAudit(page, audit)
})

test('Portal search opens the unified About story and has no retired identity entry', async ({ page }) => {
  const audit = auditPage(page)
  const searchIndexResponse = page.waitForResponse(response => response.url().endsWith('/data/search-index.json'))
  await gotoRoute(page, '/portal')
  await expectKnownRouteShell(page, '/portal')
  const response = await searchIndexResponse
  expect(response.ok()).toBe(true)
  const searchIndex = await response.json()
  expect(searchIndex.filter(item => item.path === '/about/me')).toHaveLength(1)
  expect(searchIndex.filter(item => retiredRoutes.includes(new URL(item.path, BASE_URL).pathname))).toEqual([])
  const menuBar = page.getByLabel('Portal menu bar', { exact: true })
  await menuBar.getByRole('button', { name: 'Open Spotlight', exact: true }).click()
  const spotlight = page.getByRole('dialog', { name: 'Spotlight', exact: true })
  const query = spotlight.getByRole('combobox', { name: "Search LiuYinChu's Space", exact: true })
  for (const term of ['学术主页', '学术概览', '/research', '/academic']) {
    await query.fill(term)
    await expect(spotlight.getByRole('option', { name: identityPageName })).toHaveCount(0)
  }
  await query.fill('pifuyuini')
  const about = spotlight.getByRole('option', { name: /^关于我 & 关于本站，/ })
  await expect(about).toHaveCount(1)
  await expect(about).toBeVisible()
  const popupPromise = page.waitForEvent('popup')
  await query.press('Enter')
  const popup = await popupPromise
  await expect(popup).toHaveURL(BASE_URL + '/about/me')
  await expectCompleteStory(popup)
  await expectNoHorizontalOverflow(popup)
  await popup.close()
  await expect(spotlight).toHaveCount(0)
  await finishAudit(page, audit)
})
