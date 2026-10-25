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
  ['about-wander', '挑一片星光，随处逛逛。'],
  ['about-making', '一边使用，一边搭建。'],
  ['about-curiosity', '保留好奇，也保留一点抽象。'],
]
const retiredRoutes = ['/about/site', '/about/self', '/research', '/academic']
const identityPageName = /^(?:学术主页|学术概览)(?:，|$)/
const arrowSymbols = /[\u2190-\u21ff\u27f0-\u27ff\u2900-\u297f]/u
const stackKeys = [
  ['Vue', 'V'], ['Vite', 'I'], ['JavaScript', 'J'], ['CSS', 'C'],
  ['Markdown', 'M'], ['JSON', 'N'], ['highlight.js', 'H'], ['Mermaid', 'R'],
  ['MathJax', 'X'], ['WebGL', 'W'], ['Git', 'G'], ['GitHub Pages', 'P'],
]

function stackKey(keyboard, name) {
  const shortcut = stackKeys.find(([technology]) => technology === name)[1]
  return keyboard.getByRole('button', { name: name + '，快捷键 ' + shortcut, exact: true })
}

async function expectSimplifiedPresentation(story) {
  await expect(story).not.toContainText(arrowSymbols)
  await expect(story).not.toContainText(/🤓|☝|从一个名字开始|SCROLL TO WANDER|拖动星光|横向轻扫星光|向下，慢慢认识这里/)
  await expect(story.locator('.about-name-note, .about-purpose-trace, .about-colophon, .about-read-on, .about-gesture')).toHaveCount(0)
  await expect(story.locator('#about-making dl')).toHaveCount(0)
  const controlLabels = await story.locator('a, button, [role="button"], [role="img"]').evaluateAll(elements =>
    elements.flatMap(element => ['aria-label', 'title'].map(attribute => element.getAttribute(attribute) || '')).join(' '),
  )
  expect(controlLabels, 'About controls must not retain arrow symbols').not.toMatch(arrowSymbols)
}

async function expectCompleteStory(page) {
  const story = page.getByTestId('about-story')
  await expect(story).toBeVisible()
  await expect(story.getByRole('heading', { level: 1 })).toHaveText('关于我 & 关于本站')
  await expect(story.locator('section[id]')).toHaveCount(chapters.length)
  for (const [id, title] of chapters) {
    await expect(story.locator('#' + id).getByRole('heading', { level: 2 })).toHaveText(title)
  }
  for (const name of [/\bLiuYinChu\b/, /\bYing\b/, /\bYin\b/, /\bpifuyuini\b/]) {
    await expect(story).toContainText(name)
  }
  const keyboard = story.locator('#about-making').getByTestId('stack-keyboard')
  await expect(keyboard).toHaveAttribute('role', 'group')
  await expect(keyboard).toHaveAttribute('aria-label', '技术栈键盘')
  await expect(keyboard.getByRole('button')).toHaveCount(stackKeys.length)
  for (const [technology] of stackKeys) {
    await expect(stackKey(keyboard, technology)).toHaveCount(1)
  }
  await expectSimplifiedPresentation(story)
  await expect(story).not.toContainText(/学术主页|学术概览|研究方向|研究兴趣|博士生|硕士生|研究生|Google Scholar|ORCID|Ph\.?D/i)
  return story
}

async function expectStackSelection(keyboard, technology) {
  await expect(stackKey(keyboard, technology)).toHaveAttribute('aria-pressed', 'true')
  await expect(keyboard.getByRole('button', { pressed: true })).toHaveCount(1)
  await expect(keyboard.getByTestId('stack-selection-title')).toHaveText(technology)
  const description = keyboard.getByTestId('stack-selection-description')
  await expect(description).toHaveText(/\S/)
  return description.textContent()
}

async function exerciseStackKeyboard(page, isMobile) {
  const chapter = page.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第5节：一边搭建', exact: true })
  await chapter.click()
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  const keyboard = page.locator('#about-making').getByTestId('stack-keyboard')
  await keyboard.scrollIntoViewIfNeeded()
  const vue = stackKey(keyboard, 'Vue')
  if (isMobile) await vue.tap()
  else await vue.click()
  const vueDescription = await expectStackSelection(keyboard, 'Vue')
  const webgl = stackKey(keyboard, 'WebGL')
  if (isMobile) await webgl.tap()
  else await webgl.focus()
  const webglDescription = await expectStackSelection(keyboard, 'WebGL')
  expect(webglDescription).not.toBe(vueDescription)
  if (isMobile) await stackKey(keyboard, 'Markdown').tap()
  else await webgl.press('m')
  const markdownDescription = await expectStackSelection(keyboard, 'Markdown')
  expect(markdownDescription).not.toBe(webglDescription)
  await expectNoHorizontalOverflow(page)
  return keyboard
}

// Locator actions can auto-scroll projected hotspots away from their sticky scene.
// Use real pointer input only after the complete control is visibly in the viewport.
async function pointAtVisibleNode(page, node, isMobile, hover = false) {
  await expect(node).toBeVisible()
  await expect(node).toBeInViewport({ ratio: 1 })
  let box
  await expect.poll(async () => {
    box = await node.boundingBox()
    return box !== null && box.width > 0 && box.height > 0
  }, { message: 'the projected control should have a usable layout box' }).toBe(true)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  if (isMobile) await page.touchscreen.tap(x, y)
  else if (hover) await page.mouse.move(x, y)
  else await page.mouse.click(x, y)
}

async function expectReadableToFooter(page) {
  const overflow = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflowY,
    body: getComputedStyle(document.body).overflowY,
  }))
  expect(overflow.html, 'the document must allow vertical scrolling').not.toMatch(/hidden|clip/)
  expect(overflow.body, 'the body must allow vertical scrolling').not.toMatch(/hidden|clip/)
  for (const [id, title] of chapters) {
    if (id === 'about-wander') {
      const chapter = page.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第4节：随处逛逛', exact: true })
      await chapter.click()
      await expect(chapter).toHaveAttribute('aria-current', 'step')
      const visualTitle = page.locator('#about-wander .about-wander__visual-title')
      await expect(visualTitle).toHaveText(title)
      await expect(visualTitle).toBeVisible()
      await expect(visualTitle).toBeInViewport()
      const directory = page.getByRole('region', { name: '内容星图', exact: true })
      await expect(directory).toBeVisible()
      await expect(directory.getByRole('button')).toHaveCount(4)
      await expect(directory.getByRole('article', { name: '当前内容预览', exact: true })).toBeVisible()
    } else {
      const heading = page.locator('#' + id).getByRole('heading', { level: 2 })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
      await expect(heading).toBeInViewport()
    }
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

test('WebGL unavailability preserves the static star map and usable native keyboard', async ({ page, isMobile }) => {
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
  const keyboard = await exerciseStackKeyboard(page, isMobile)
  await expect(keyboard).toHaveAttribute('data-renderer', 'unavailable')
  await expect(keyboard).toHaveClass(/is-fallback/)
  await expectReadableToFooter(page)
  await finishAudit(page, audit)
})

test('content constellations select real previews and open a complete article', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  const story = await expectCompleteStory(page)
  const chapter = story.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第4节：随处逛逛', exact: true })
  await chapter.click()
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  const directory = story.getByRole('region', { name: '内容星图', exact: true })
  await expect(directory).toBeVisible()
  await expect(directory.getByRole('button')).toHaveCount(4)
  const preview = directory.getByRole('article', { name: '当前内容预览', exact: true })
  const destinations = [
    { id: 'notes', name: '随记', title: '给 AI 编程助手补一份项目记忆：聊聊 claude-mem', action: '读这篇随记', href: '/space1/claude_mem_intro' },
    { id: 'talk', name: '说说', title: '小马过河', action: '继续读说说', href: '/talk' },
    { id: 'resources', name: '资源', title: '人生苦短，我学 Python ！', action: '看看这个资源', href: 'https://docs.python.org/3/' },
    { id: 'projects', name: '代码项目', title: '音乐机关盒', action: '打开这个项目', href: '/music-box' },
  ]
  for (const destination of destinations) {
    const node = directory.getByRole('button', { name: destination.name, exact: true })
    if (!isMobile && destination.id === 'resources') {
      await page.keyboard.press('Tab')
      await expect(directory.getByRole('button', { name: '说说', exact: true })).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(node).toBeFocused()
    } else {
      await pointAtVisibleNode(page, node, isMobile, destination.id === 'talk')
    }
    await expect(node).toHaveAttribute('aria-pressed', 'true')
    await expect(directory.getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(story.locator('.stellar-field[data-profile="about"]')).toHaveAttribute('data-active-node', destination.id)
    await expect(preview.getByRole('heading', { level: 3 })).toHaveText(destination.title)
    const link = preview.getByRole('link', { name: destination.action, exact: true })
    await expect(link).toHaveAttribute('href', destination.href)
    await expect(link).toBeVisible()
    await expectSimplifiedPresentation(story)
    await expectNoHorizontalOverflow(page)
  }
  const notes = directory.getByRole('button', { name: '随记', exact: true })
  await pointAtVisibleNode(page, notes, isMobile)
  await pointAtVisibleNode(page, preview.getByRole('link', { name: '读这篇随记', exact: true }), isMobile)
  await expect(page).toHaveURL(BASE_URL + '/space1/claude_mem_intro')
  await expect(page.locator('[data-page="article"][data-article-id="claude_mem_intro"][data-state="ready"]')).toBeVisible()
  await expect(page.locator('[data-article-content]')).toBeVisible()
  await finishAudit(page, audit)
})

test('the mechanical keyboard renders on supported browsers and responds to touch, focus, and shortcuts', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  const webgl2Supported = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  })
  const keyboard = await exerciseStackKeyboard(page, isMobile)
  await expect(keyboard).toHaveAttribute('data-renderer', webgl2Supported ? 'ready' : 'unavailable')
  if (webgl2Supported) {
    const canvas = keyboard.getByTestId('stack-keyboard-canvas')
    await expect(canvas).toBeVisible()
    expect(await canvas.evaluate(element => element.width > 0 && element.height > 0)).toBe(true)
  } else {
    await expect(keyboard).toHaveClass(/is-fallback/)
  }
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
