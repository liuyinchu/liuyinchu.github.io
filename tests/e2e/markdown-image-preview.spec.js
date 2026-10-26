import { expect, test } from '@playwright/test'
import { expectNoHorizontalOverflow, gotoRoute } from './test-helpers.js'

const articlePath = '/space1/hinf_robust_control_tutorial'
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#313244"/><circle cx="800" cy="500" r="280" fill="#89b4fa"/><path d="M400 700 800 240 1200 700" fill="none" stroke="#cdd6f4" stroke-width="32"/></svg>'
const markdown = [
  '# 正文图片预览',
  '<img src="/preview-raw.svg" alt="原始 HTML 正文图" width="800" height="500">',
  '![普通 Markdown 正文图](/preview-normal.svg)',
  '[![链接包裹正文图](/preview-linked.svg)](https://example.com/source-page)',
  ':::gallery{columns="2"}',
  '![画廊第一张](/preview-gallery-one.svg)',
  '![画廊第二张](/preview-gallery-two.svg)',
  ':::',
  '<button type="button" aria-label="正文交互按钮"><img src="/preview-button.svg" width="96" height="60" alt="按钮内图片"></button>',
  '<span role="button" tabindex="0"><img src="/preview-role.svg" width="96" height="60" alt="交互角色内图片"></span>',
  ':::link-card{href="/rd" title="资源入口"}',
  '![链接卡内图片](/preview-link-card.svg)',
  ':::',
  '<a class="md-stream-button" href="#正文图片预览"><img src="/preview-stream.svg" width="96" height="60" alt="流光按钮内图片"></a>',
].join('\n\n')

async function mockImages(page) {
  await page.route('**/preview-*.svg', route => route.fulfill({
    contentType: 'image/svg+xml',
    body: svg,
  }))
}

async function openArticle(page) {
  await mockImages(page)
  await page.route('**/markdown/hinf_robust_control_tutorial.md', route => route.fulfill({
    contentType: 'text/markdown',
    body: markdown,
  }))
  await gotoRoute(page, articlePath)
  await expect(page.locator('[data-article-content] [data-md-image-preview]')).toHaveCount(5)
}

const preview = page => page.getByRole('dialog', { name: '图片预览' })
const previewImage = page => preview(page).locator('.md-image-preview__image')

test('all body image forms preview together while interactive images and page decoration retain their roles', async ({ page }) => {
  await openArticle(page)
  for (const alt of ['按钮内图片', '交互角色内图片', '链接卡内图片', '流光按钮内图片']) {
    await expect(page.locator('[data-article-content] img[alt="' + alt + '"]')).not.toHaveAttribute('data-md-image-preview')
  }
  expect(await page.locator('[data-md-image-preview]').evaluateAll(images => images.every(image => !!image.closest('.markdown-body')))).toBe(true)

  const raw = page.getByRole('button', { name: '放大查看图片：原始 HTML 正文图', exact: true })
  await raw.scrollIntoViewIfNeeded()
  await raw.focus()
  const before = await page.evaluate(() => ({
    position: document.body.style.position,
    bodyOverflow: document.body.style.overflow,
    rootOverflow: document.documentElement.style.overflow,
    y: window.scrollY,
  }))
  await raw.press('Enter')
  await expect(preview(page)).toBeVisible()
  await expect(previewImage(page)).toHaveAttribute('alt', '原始 HTML 正文图')
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('1 / 5')
  await expect(page.getByRole('button', { name: '关闭图片预览', exact: true })).toBeFocused()
  expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement.closest('dialog[open]'))).toBe(true)
  }
  await page.keyboard.press('ArrowRight')
  await expect(previewImage(page)).toHaveAttribute('alt', '普通 Markdown 正文图')
  expect(await page.evaluate(() => !!document.activeElement.closest('dialog[open]'))).toBe(true)
  await page.keyboard.press('ArrowLeft')
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('1 / 5')
  await page.keyboard.press('Escape')
  await expect(preview(page)).toBeHidden()
  await expect(raw).toBeFocused()
  await expect.poll(() => page.evaluate(() => ({
    position: document.body.style.position,
    bodyOverflow: document.body.style.overflow,
    rootOverflow: document.documentElement.style.overflow,
    y: window.scrollY,
  }))).toEqual(before)
  await expectNoHorizontalOverflow(page)
})

test('linked images open a preview on ordinary activation and preserve modified and middle clicks', async ({ page, context }) => {
  await openArticle(page)
  const linked = page.getByRole('button', { name: '放大查看图片：链接包裹正文图', exact: true })
  await linked.click()
  await expect(preview(page)).toBeVisible()
  await expect(page).toHaveURL(new RegExp(articlePath + '$'))
  await expect(preview(page).getByRole('link', { name: '原链接 ↗', exact: true })).toHaveAttribute('href', 'https://example.com/source-page')
  await expect(preview(page).getByRole('link', { name: '在新标签页打开原图', exact: true })).toHaveAttribute('href', /\/preview-linked\.svg$/)
  await expect(preview(page).getByRole('link', { name: '在新标签页打开原图', exact: true })).toHaveAttribute('rel', 'noopener noreferrer')
  await page.keyboard.press('Escape')

  // The listener must leave native link activation uncancelled for both cases.
  // Prevent navigation in a later listener, after observing the production handler.
  for (const activation of [{ button: 0, ctrlKey: true }, { button: 0, metaKey: true }, { button: 1 }]) {
    const cancelledByPreview = await linked.evaluate((image, init) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
      let cancelled = null
      image.addEventListener('click', observed => {
        cancelled = observed.defaultPrevented
        observed.preventDefault()
      }, { once: true })
      image.dispatchEvent(event)
      return cancelled
    }, activation)
    expect(cancelledByPreview).toBe(false)
    await expect(preview(page)).toBeHidden()
  }
  expect(context.pages()).toHaveLength(1)
})

test('zoom, pan, reset and body-local gallery navigation work on desktop and touch screens', async ({ page, isMobile }) => {
  await openArticle(page)
  await page.getByRole('button', { name: '放大查看图片：画廊第一张', exact: true }).click()
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('4 / 5')
  await expect(previewImage(page)).toHaveClass(/is-ready/)
  const image = previewImage(page)
  const bounds = await image.boundingBox()
  if (isMobile) {
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await expect(preview(page).getByRole('button', { name: '复位图片', exact: true })).toHaveText('200%')
    await image.dispatchEvent('dblclick', { clientX: bounds.x + bounds.width / 2, clientY: bounds.y + bounds.height / 2 })
  } else {
    await image.dblclick()
  }
  await expect(preview(page).getByRole('button', { name: '复位图片', exact: true })).toHaveText('200%')
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width / 2 + 90, bounds.y + bounds.height / 2 + 30, { steps: 5 })
  await page.mouse.up()
  await expect(image).not.toHaveAttribute('style', /translate\(0px, 0px\)/)
  await expect(preview(page)).toBeVisible()
  await preview(page).getByRole('button', { name: '复位图片', exact: true }).click()
  await expect(preview(page).getByRole('button', { name: '复位图片', exact: true })).toHaveText('100%')
  if (isMobile) {
    const client = await page.context().newCDPSession(page)
    const viewport = await page.locator('.md-image-preview__stage').boundingBox()
    const y = viewport.y + viewport.height / 2
    const start = viewport.x + viewport.width * 0.75
    const end = viewport.x + viewport.width * 0.25
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: end, y }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await client.detach()
  } else {
    await preview(page).getByRole('button', { name: '下一张图片', exact: true }).click()
  }
  await expect(previewImage(page)).toHaveAttribute('alt', '画廊第二张')
  await expect(preview(page)).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('1 / 5')
  await page.keyboard.press('Escape')
  await expectNoHorizontalOverflow(page)
})

test('failed body images keep recovery controls usable and only empty-stage clicks dismiss the preview', async ({ page }) => {
  await mockImages(page)
  await page.route('**/preview-failed.svg', route => route.fulfill({
    status: 404,
    contentType: 'text/plain',
    body: 'Image unavailable',
  }))
  await page.route('**/markdown/hinf_robust_control_tutorial.md', route => route.fulfill({
    contentType: 'text/markdown',
    body: [
      '# 图片失败恢复',
      '<img src="/preview-failed.svg" alt="暂时失效的正文图" width="800" height="500">',
      '![可正常查看的正文图](/preview-recovered.svg)',
    ].join('\n\n'),
  }))
  await gotoRoute(page, articlePath)
  const trigger = page.getByRole('button', { name: '放大查看图片：暂时失效的正文图', exact: true })
  await trigger.click()
  await expect(preview(page).getByRole('status')).toContainText('暂时无法载入图片')
  await expect(preview(page).getByRole('button', { name: '重新载入', exact: true })).toBeVisible()
  await expect(preview(page).getByRole('link', { name: '在新标签页打开原图', exact: true }))
    .toHaveAttribute('href', /\/preview-failed\.svg$/)
  await preview(page).getByRole('button', { name: '下一张图片', exact: true }).click()
  await expect(previewImage(page)).toHaveAttribute('alt', '可正常查看的正文图')
  await expect(previewImage(page)).toHaveClass(/is-ready/)
  await expect(preview(page).getByRole('status')).toHaveCount(0)
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('2 / 2')

  await previewImage(page).click()
  await expect(preview(page)).toBeVisible()
  await page.locator('.md-image-preview__stage').click({ position: { x: 8, y: 8 } })
  await expect(preview(page)).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
})

test('SPA route teardown removes the dialog and restores page styles', async ({ page }) => {
  await openArticle(page)
  await page.getByRole('button', { name: '放大查看图片：原始 HTML 正文图', exact: true }).click()
  await expect(preview(page)).toBeVisible()
  // Dispatch through an existing RouterLink to exercise component unmount while
  // the native modal has made the background inert.
  await page.locator('a[href="/talk"]').first().dispatchEvent('click', { button: 0 })
  await expect(page).toHaveURL(/\/talk$/)
  await expect(page.locator('[data-article-content]')).toHaveCount(0)
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  await expectNoHorizontalOverflow(page)
})

test('Talk images use the shared viewer and keep each post as its own image group', async ({ page }) => {
  await mockImages(page)
  const entries = [
    { id: 'preview-first', title: '第一条图片说说', date: '2030-10-26', content: '![说说内图片](/preview-talk.svg)', summary: '图片', href: '/talk#post-preview-first' },
    { id: 'preview-second', title: '第二条图片说说', date: '2030-10-25', content: '![另一条说说图片](/preview-talk-second.svg)', summary: '图片', href: '/talk#post-preview-second' },
  ]
  await page.route(url => url.pathname === '/@id/__x00__virtual:post-it', route => route.fulfill({
    contentType: 'text/javascript',
    body: 'const postItEntries = ' + JSON.stringify(entries) + '; export { postItEntries }; export default postItEntries;',
  }))
  await gotoRoute(page, '/talk')
  await page.getByRole('button', { name: '放大查看图片：说说内图片', exact: true }).click()
  await expect(preview(page)).toBeVisible()
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('1 / 1')
  await expect(preview(page).getByRole('button', { name: '下一张图片', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
})

test('resource introductions and notes share body-only preview and clean up when filtering removes them', async ({ page }) => {
  await mockImages(page)
  await page.route('**/resource/*.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([{
      idx: 1,
      name: '正文预览资源',
      intro: '![资源介绍图片](/preview-resource-intro.svg)',
      add: '<img src="/preview-resource-note.svg" alt="资源备注图片">',
      url: 'https://example.com/resource',
    }]),
  }))
  await gotoRoute(page, '/rprogramming')
  await page.getByRole('button', { name: '放大查看图片：资源介绍图片', exact: true }).click()
  await expect(preview(page)).toBeVisible()
  await expect(preview(page).locator('.md-image-preview__count')).toHaveText('1 / 2')
  await preview(page).getByRole('button', { name: '下一张图片', exact: true }).click()
  await expect(previewImage(page)).toHaveAttribute('alt', '资源备注图片')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '放大查看图片：资源备注图片', exact: true }).click()
  await page.locator('#resource-search-input').evaluate(input => {
    input.value = '__no_resource__'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(preview(page)).toBeHidden()
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  await expect(page.locator('.resource-entry')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})
