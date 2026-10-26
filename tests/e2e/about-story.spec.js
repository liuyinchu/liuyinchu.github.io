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
  ['about-curiosity', '保持好奇，继续创造。'],
]
const retiredRoutes = ['/about/site', '/about/self', '/research', '/academic']
const identityPageName = /^(?:学术主页|学术概览)(?:，|$)/
const arrowSymbols = /[\u2190-\u21ff\u27f0-\u27ff\u2900-\u297f]/u
const stackKeys = [
  ['Python', 'Y'], ['Rust', 'U'], ['MATLAB', 'A'], ['LaTeX', 'L'],
  ['Codex', 'D'], ['Claude Code', 'E'],
  ['Vue', 'V'], ['Vite', 'I'], ['JavaScript', 'J'], ['CSS', 'C'],
  ['Markdown', 'M'], ['JSON', 'N'], ['highlight.js', 'H'], ['Mermaid', 'R'],
  ['MathJax', 'X'], ['WebGL', 'W'], ['Git', 'G'], ['GitHub Pages', 'P'],
]

const contentConstellations = [
  { id: 'notes', name: '随记', column: '/space1', title: '给 AI 编程助手补一份项目记忆：聊聊 claude-mem', href: '/space1/claude_mem_intro' },
  { id: 'talk', name: '说说', column: '/talk', title: '随手记下的想法与片段', description: '放一些零散的想法、见闻和心情。还没写成文章的内容，也可以先留在这里。' },
  { id: 'resources', name: '资源', column: '/rd', title: '人生苦短，我学 Python ！', href: 'https://docs.python.org/3/' },
  { id: 'projects', name: '代码与项目', column: '/code', title: '音乐机关盒', href: '/music-box' },
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
  const ending = story.locator('#about-curiosity')
  await expect(ending.locator('a[href="/portal"], a[href="/space4"]')).toHaveCount(0)
  await expect(ending).not.toContainText(/也可以打开|或翻翻|好奇心可以不带目的地/)
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
  await expect(keyboard).toHaveAttribute('data-selected', 'python')
  await expectStackSelection(keyboard, 'Python')
  const python = stackKey(keyboard, 'Python')
  if (isMobile) await python.tap()
  else await python.click()
  let previousDescription = await expectStackSelection(keyboard, 'Python')
  for (const technology of ['Rust', 'MATLAB', 'LaTeX', 'Codex', 'Claude Code']) {
    if (isMobile) await stackKey(keyboard, technology).tap()
    else await page.keyboard.press(stackKeys.find(([name]) => name === technology)[1].toLowerCase())
    const description = await expectStackSelection(keyboard, technology)
    expect(description).not.toBe(previousDescription)
    previousDescription = description
  }
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

function constellationLink(directory, destination) {
  return directory.locator('[aria-label="内容星座入口"], [aria-label="栏目入口"]').getByRole('link', { name: destination.name, exact: true })
}

function observeAboutTalkRequests(page) {
  const requests = []
  const onRequest = request => {
    if (new URL(request.url()).pathname === '/markdown/post_it.md') requests.push(request.url())
  }
  page.on('request', onRequest)
  return () => {
    page.off('request', onRequest)
    expect(requests, 'the About story must not request the Talk body').toEqual([])
  }
}

async function expectDirectoryLinks(directory) {
  await expect(directory).toBeVisible()
  const icons = directory.locator('[aria-label="内容星座入口"], [aria-label="栏目入口"]')
  await expect(icons.getByRole('link')).toHaveCount(contentConstellations.length)
  await expect(directory.getByRole('button')).toHaveCount(0)
  for (const destination of contentConstellations) {
    const link = constellationLink(directory, destination)
    await expect(link).toHaveAttribute('href', destination.column)
    await expect(link).not.toHaveAttribute('aria-pressed')
    await expect(link).not.toHaveAttribute('target')
    await expect(link).not.toHaveAttribute('rel')
  }
  const preview = directory.getByRole('article', { name: '当前内容预览', exact: true })
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('button')).toHaveCount(0)
  return preview
}

async function expectConstellationSelection(story, directory, destination) {
  await expect(constellationLink(directory, destination)).toHaveAttribute('data-selected', 'true')
  await expect(directory.locator('a[data-selected="true"]')).toHaveCount(1)
  await expect(story.locator('.stellar-field[data-profile="about"]')).toHaveAttribute('data-active-node', destination.id)
  const preview = directory.getByRole('article', { name: '当前内容预览', exact: true })
  const heading = preview.getByRole('heading', { level: 3 })
  await expect(heading).toHaveText(destination.title)
  await expect(preview.getByRole('button')).toHaveCount(0)
  if (destination.id === 'talk') {
    await expect(heading.getByRole('link')).toHaveCount(0)
    await expect(preview.getByRole('link')).toHaveCount(0)
    await expect(preview.locator('.constellation-preview__description')).toHaveText(destination.description)
  } else {
    await expect(preview.getByRole('link')).toHaveCount(1)
    const detail = heading.getByRole('link', { name: destination.title, exact: true })
    await expect(detail).toHaveAttribute('href', destination.href)
    if (destination.id === 'resources') {
      await expect(detail).toHaveAttribute('target', '_blank')
      await expect(detail).toHaveAttribute('rel', 'noopener noreferrer')
    } else {
      await expect(detail).not.toHaveAttribute('target')
      await expect(detail).not.toHaveAttribute('rel')
    }
    await expect(preview.locator('.constellation-preview__description')).toHaveText(/\S/)
  }
}

async function tabToConstellation(page, directory, link) {
  const chapter = page.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第4节：随处逛逛', exact: true })
  await chapter.click()
  await expect(page.locator('#about-wander')).toBeFocused()
  await expect.poll(() => page.locator('#about-wander').evaluate(section => {
    const stage = document.querySelector('.about-stage')
    return Math.abs(section.getBoundingClientRect().top - stage.getBoundingClientRect().top)
  }), { message: 'the chapter navigation should reach its scroll destination' }).toBeLessThanOrEqual(1)
  await expect(directory).toBeVisible()
  const instruments = page.locator('.about-instruments')
  // One optional preview title link can appear when focus changes the selection.
  const tabStops = await instruments.locator('a[href], button:not([disabled])').count() + 1
  for (let step = 0; step < tabStops; step += 1) {
    await page.keyboard.press('Shift+Tab')
    const focused = await page.evaluate(() => ({
      inside: Boolean(document.activeElement?.closest('.about-instruments')),
      label: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim().slice(0, 80) || document.activeElement?.tagName,
    }))
    expect(focused.inside, 'Tab should stay in the visible star-map tools: ' + focused.label).toBe(true)
    await expect(directory).toBeVisible()
    if (await link.evaluate(element => element === document.activeElement)) break
  }
  await expect(link).toBeFocused()
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
      await expectDirectoryLinks(directory)
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

async function expectStableCanvasRegion(page, canvas) {
  const chapter = page.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第5节：一边搭建', exact: true })
  await chapter.press('Enter')
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  await expect.poll(() => page.locator('#about-making').evaluate(section => {
    const stage = document.querySelector('.about-stage')
    return Math.abs(section.getBoundingClientRect().top - stage.getBoundingClientRect().top)
  }), { message: 'the keyboard chapter should finish positioning before observing pixels' }).toBeLessThanOrEqual(1)
  const stage = page.getByTestId('about-story').locator('.about-stage')
  await expect(stage).toBeInViewport({ ratio: 1 })
  await expect(canvas).toBeVisible()
  let previousFrame
  let previousRect
  let stableSince = 0
  let samples = 0
  // Observe the entire visible canvas, including intentional mobile stage clipping.
  // The quiet window must still span multiple cat-strike beats.
  await expect.poll(async () => {
    const visible = await canvas.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const stage = element.closest('.about-stage').getBoundingClientRect()
      const x = Math.max(0, rect.left, stage.left)
      const y = Math.max(0, rect.top, stage.top)
      const right = Math.min(window.innerWidth, rect.right, stage.right)
      const bottom = Math.min(window.innerHeight, rect.bottom, stage.bottom)
      return { clip: { x, y, width: right - x, height: bottom - y }, stageWidth: stage.width, stageHeight: stage.height }
    })
    const rect = visible.clip
    expect(rect.width, 'the observed canvas must occupy a substantial part of the stage').toBeGreaterThanOrEqual(visible.stageWidth / 2)
    expect(rect.height, 'position the scene before observing a useful canvas region').toBeGreaterThanOrEqual(visible.stageHeight / 2)
    const frame = await page.screenshot({ clip: rect, animations: 'allow', scale: 'css' })
    const now = performance.now()
    const sameRegion = previousRect && ['x', 'y', 'width', 'height'].every(dimension => rect[dimension] === previousRect[dimension])
    if (!previousFrame || !sameRegion || !frame.equals(previousFrame)) {
      previousFrame = frame
      previousRect = rect
      stableSince = now
      samples = 1
      return false
    }
    samples += 1
    return now - stableSince >= 750 && samples >= 4
  }, { message: 'the visible canvas region should remain still throughout a quiet observation window', timeout: 10_000, intervals: [80, 110, 130] }).toBe(true)
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

test('reduced motion keeps every chapter and the Footer readable', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  await expectCompleteStory(page)
  const chapter = page.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第5节：一边搭建', exact: true })
  await chapter.click()
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  const keyboard = page.locator('#about-making').getByTestId('stack-keyboard')
  await keyboard.scrollIntoViewIfNeeded()
  const initialDescription = await expectStackSelection(keyboard, 'Python')
  const codex = stackKey(keyboard, 'Codex')
  if (isMobile) await codex.tap()
  else await codex.click()
  const codexDescription = await expectStackSelection(keyboard, 'Codex')
  expect(codexDescription).not.toBe(initialDescription)
  const field = page.locator('.stellar-field[data-profile="about"]')
  await expect(field).toHaveAttribute('data-renderer', /^(?:webgl2|unavailable)$/)
  if (await field.getAttribute('data-renderer') === 'webgl2') {
    await page.mouse.move(0, 0)
    await expectStableCanvasRegion(page, field.locator(':scope > canvas.stellar-field__canvas'))
  }
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
  await expect(fallback).toHaveAttribute('aria-label', '同一片星光凝聚成固定姿态的猫，右爪落在键盘上')
  await expect(fallback).toContainText('当前设备显示静态星光猫')
  await expect(keyboard).toHaveAttribute('data-renderer', 'unavailable')
  await expect(keyboard).toHaveClass(/is-fallback/)
  await expectReadableToFooter(page)
  await finishAudit(page, audit)
})

test('constellation icons open columns while preview titles open details without loading Talk content', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  let stopTalkObservation = observeAboutTalkRequests(page)
  await gotoRoute(page, '/about/me')
  const story = await expectCompleteStory(page)
  const chapter = story.getByRole('navigation', { name: '关于我与本站：章节索引' }).getByRole('link', { name: '第4节：随处逛逛', exact: true })
  await chapter.click()
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  const directory = story.getByRole('region', { name: '内容星图', exact: true })
  await expectDirectoryLinks(directory)
  const [notes, talk, resources, projects] = contentConstellations
  await expectConstellationSelection(story, directory, notes)
  for (const destination of [talk, resources, projects]) {
    const icon = constellationLink(directory, destination)
    if (!isMobile && destination.id === 'talk') await pointAtVisibleNode(page, icon, false, true)
    else await tabToConstellation(page, directory, icon)
    await expectConstellationSelection(story, directory, destination)
  }
  const notesIcon = constellationLink(directory, notes)
  await tabToConstellation(page, directory, notesIcon)
  await expectConstellationSelection(story, directory, notes)
  await expectSimplifiedPresentation(story)
  await expectNoHorizontalOverflow(page)
  await audit.settle()
  stopTalkObservation()
  if (isMobile) await pointAtVisibleNode(page, notesIcon, true)
  else await page.keyboard.press('Enter')
  await expect(page).toHaveURL(BASE_URL + notes.column)
  await expectKnownRouteShell(page, notes.column)
  await expect(page.locator('a[href="' + notes.href + '"]')).not.toHaveCount(0)
  await audit.settle()

  // The column may legitimately load its Talk ticker; observe only About visits.
  stopTalkObservation = observeAboutTalkRequests(page)
  await gotoRoute(page, '/about/me')
  await expectCompleteStory(page)
  await chapter.click()
  await expect(chapter).toHaveAttribute('aria-current', 'step')
  await expectDirectoryLinks(directory)
  await expectConstellationSelection(story, directory, notes)
  const detail = directory.getByRole('article', { name: '当前内容预览', exact: true }).getByRole('heading', { level: 3 }).getByRole('link', { name: notes.title, exact: true })
  if (!isMobile) await tabToConstellation(page, directory, detail)
  await audit.settle()
  stopTalkObservation()
  if (isMobile) await pointAtVisibleNode(page, detail, true)
  else await page.keyboard.press('Enter')
  await expect(page).toHaveURL(BASE_URL + notes.href)
  await expect(page.locator('[data-page="article"][data-article-id="claude_mem_intro"][data-state="ready"]')).toBeVisible()
  await expect(page.locator('[data-article-content]')).toBeVisible()
  await finishAudit(page, audit)
})

test('the mechanical keyboard renders on supported browsers and responds to touch, focus, and shortcuts', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const audit = auditPage(page)
  await gotoRoute(page, '/about/me')
  const webgl2Supported = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  })
  const field = page.locator('.stellar-field[data-profile="about"]')
  const mainCanvas = field.locator(':scope > canvas.stellar-field__canvas')
  await expect(field).toHaveCount(1)
  await expect(field).toHaveAttribute('data-renderer', /^(?:webgl2|unavailable)$/)
  await expect(mainCanvas).toHaveCount(1)
  const originalCanvas = await mainCanvas.elementHandle()
  expect(originalCanvas).not.toBeNull()
  async function expectSameMainCanvas() {
    await expect(field).toHaveCount(1)
    await expect(mainCanvas).toHaveCount(1)
    const identity = await originalCanvas.evaluate(original => {
      const current = document.querySelector('.stellar-field[data-profile="about"] > canvas.stellar-field__canvas')
      const rect = original.getBoundingClientRect()
      return { connected: original.isConnected, same: current === original, width: original.width, height: original.height, layoutWidth: rect.width, layoutHeight: rect.height }
    })
    expect(identity.connected, 'the original Stellar canvas must remain attached').toBe(true)
    expect(identity.same, 'each chapter must keep the original Stellar canvas element').toBe(true)
    for (const dimension of ['width', 'height', 'layoutWidth', 'layoutHeight']) expect(identity[dimension]).toBeGreaterThan(0)
  }
  const chapters = page.getByRole('navigation', { name: '关于我与本站：章节索引' })
  const directoryChapter = chapters.getByRole('link', { name: '第4节：随处逛逛', exact: true })
  await directoryChapter.press('Enter')
  await expect(directoryChapter).toHaveAttribute('aria-current', 'step')
  await expect(page.getByRole('region', { name: '内容星图', exact: true })).toBeVisible()
  await expectSameMainCanvas()
  const keyboard = await exerciseStackKeyboard(page, isMobile)
  await expectSameMainCanvas()
  await expect(keyboard).toHaveAttribute('data-renderer', webgl2Supported ? 'ready' : 'unavailable')
  if (webgl2Supported) {
    const canvas = keyboard.getByTestId('stack-keyboard-canvas')
    await expect(canvas).toBeVisible()
    expect(await canvas.evaluate(element => element.width > 0 && element.height > 0)).toBe(true)
  } else {
    await expect(keyboard).toHaveClass(/is-fallback/)
  }
  if (await field.getAttribute('data-renderer') === 'webgl2') {
    const markdownBeforePause = await expectStackSelection(keyboard, 'Markdown')
    const pause = page.getByRole('button', { name: '暂停星空动画', exact: true })
    await pointAtVisibleNode(page, pause, isMobile)
    const resume = page.getByRole('button', { name: '继续星空动画', exact: true })
    await expect(resume).toHaveAttribute('aria-pressed', 'true')
    await page.mouse.move(0, 0)
    await expectStableCanvasRegion(page, mainCanvas)
    const pausedCodex = stackKey(keyboard, 'Codex')
    if (isMobile) await pausedCodex.tap()
    else await pausedCodex.click()
    expect(await expectStackSelection(keyboard, 'Codex')).not.toBe(markdownBeforePause)
    if (isMobile) await stackKey(keyboard, 'Markdown').tap()
    else await pausedCodex.press('m')
    expect(await expectStackSelection(keyboard, 'Markdown')).toBe(markdownBeforePause)
    await pointAtVisibleNode(page, resume, isMobile)
    await expect(pause).toHaveAttribute('aria-pressed', 'false')
    await expectSameMainCanvas()
  }
  // Keep a returning keycap from passing under the navigation pointer and selecting itself.
  await page.mouse.move(0, 0)
  const selectedDescription = await expectStackSelection(keyboard, 'Markdown')
  const ending = chapters.getByRole('link', { name: '第6节：未完待续', exact: true })
  await ending.press('Enter')
  await expect(ending).toHaveAttribute('aria-current', 'step')
  await expectSameMainCanvas()
  await page.locator('.site-footer .footer-bottom').scrollIntoViewIfNeeded()
  await expect(keyboard).not.toBeInViewport()
  await expectStackSelection(keyboard, 'Markdown')
  const making = chapters.getByRole('link', { name: '第5节：一边搭建', exact: true })
  await making.press('Enter')
  await expect(making).toHaveAttribute('aria-current', 'step')
  await keyboard.scrollIntoViewIfNeeded()
  await expectSameMainCanvas()
  expect(await expectStackSelection(keyboard, 'Markdown')).toBe(selectedDescription)
  const codex = stackKey(keyboard, 'Codex')
  if (isMobile) await codex.tap()
  else await codex.click()
  expect(await expectStackSelection(keyboard, 'Codex')).not.toBe(selectedDescription)
  await expect(keyboard).toHaveAttribute('data-renderer', webgl2Supported ? 'ready' : 'unavailable')
  await originalCanvas.dispose()
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
