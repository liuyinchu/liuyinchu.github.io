import { test, expect } from '@playwright/test'
import { expectNoHorizontalOverflow } from './test-helpers.js'

const legacyKey = 'birthday-planet-letters-v1'

async function observeAudio(page) {
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext
    window.birthdayAudioContexts = []
    window.AudioContext = class extends OriginalAudioContext {
      constructor(...args) {
        // Render real audio without depending on a physical output device in CI.
        super({ ...(args[0] || {}), sinkId: { type: 'none' } })
        window.birthdayAudioContexts.push(this)
      }
    }
  })
}

test('the hidden entrance remains lazy and the ordinary shell returns after leaving', async ({ page }) => {
  const planetRequests = []
  page.on('request', request => {
    if (/BirthdayPlanet|\/src\/birthday\//.test(request.url())) planetRequests.push(request.url())
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const entrance = page.getByRole('link', { name: '一颗留给你的生日星球' })
  await expect(entrance).toBeVisible()
  expect(planetRequests).toEqual([])
  await entrance.click()
  await expect(page.locator('[data-page="birthday-planet"]')).toBeVisible()
  await expect(page.locator('#app > header, #app > footer')).toHaveCount(0)
  await expect(page.locator('meta[data-birthday-robots]')).toHaveAttribute('content', 'noindex, nofollow')
  expect(planetRequests.length).toBeGreaterThan(0)
  await page.getByRole('link', { name: '返回', exact: true }).click()
  await expect(page.locator('[data-page="birthday-planet"]')).toHaveCount(0)
  await expect(page.locator('meta[data-birthday-robots]')).toHaveCount(0)
  await expect(page).not.toHaveTitle(/生日星球/)
  await expect(page.locator('#app > header')).toBeVisible()
  await page.locator('#app > footer').getByRole('link', { name: '说说', exact: true }).click()
  await expect(page).toHaveURL(/\/talk$/)
  await expect(entrance).toHaveCount(0)
})

test('the authored letter is fixed and never alters previously saved personal letters', async ({ page }) => {
  const oldLetters = JSON.stringify([{ year: 2026, text: '我原先保存的信。', opensOn: '2027-10-28' }])
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value)
  }, { key: legacyKey, value: oldLetters })
  await page.clock.setFixedTime(new Date('2026-10-29T04:00:00Z'))
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '有一封信，写给你' }).click()
  const dialog = page.getByRole('dialog')
  await expect(page.getByRole('heading', { name: '给下一圈光里的你' })).toBeFocused()
  await expect(dialog.locator('textarea, input, select')).toHaveCount(0)
  await expect(dialog).toContainText('Yin')
  await expect(dialog).toContainText('不必完美，才开始')
  await expect(dialog).toContainText('Codex')
  await expect(dialog.locator('time')).toHaveAttribute('datetime', '2026-10-29')
  const text = await page.locator('.gift-letter-body').innerText()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '有一封信，写给你' })).toBeFocused()
  await page.clock.setFixedTime(new Date('2027-10-28T04:00:00Z'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.planet-year')).toContainText('第 2 圈光')
  await page.getByRole('button', { name: '有一封信，写给你' }).click()
  await expect(page.locator('.gift-letter-body')).toHaveText(text, { useInnerText: true })
  expect(await page.evaluate(key => localStorage.getItem(key), legacyKey)).toBe(oldLetters)
})

test('dragging rotates the planet without starting audio, with touch scrolling and keyboard reset', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await observeAudio(page)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  const button = page.getByRole('button', { name: '轻触星球，播放生日旋律' })
  await button.scrollIntoViewIfNeeded()
  const box = await button.boundingBox()
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  if (isMobile) {
    const session = await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (const offset of [20, 40, 60, 90]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + offset, y }] })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
  } else {
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 90, y, { steps: 8 })
    await page.mouse.up()
  }
  await expect(page.locator('.planet-orientation')).not.toHaveAttribute('style', /rotate\(0deg\)/)
  expect(await page.evaluate(() => window.birthdayAudioContexts.length)).toBe(0)
  await page.getByRole('button', { name: '重置星球角度' }).click()
  await expect(page.locator('.planet-orientation')).toHaveAttribute('style', /rotate\(0deg\)/)
  await expect(button).toBeFocused()
  await button.press('ArrowRight')
  await expect(page.locator('.planet-orientation')).toHaveAttribute('style', /rotate\(5deg\)/)
  await button.press('Home')
  await expect(page.locator('.planet-orientation')).toHaveAttribute('style', /rotate\(0deg\)/)
  if (isMobile) {
    await button.scrollIntoViewIfNeeded()
    const touchBox = await button.boundingBox()
    const sx = touchBox.x + touchBox.width / 2
    const sy = Math.min(650, touchBox.y + touchBox.height / 2)
    const before = await page.evaluate(() => window.scrollY)
    const session = await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] })
    for (const offset of [30, 60, 90, 130]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx, y: sy - offset }] })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await session.detach()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)
    expect(await page.evaluate(() => window.birthdayAudioContexts.length)).toBe(0)
  }
})

test('the running audio drives progress and glow and releases on stop or navigation', async ({ page }) => {
  await observeAudio(page)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  const planet = page.locator('.planet-instrument')
  expect(await page.evaluate(() => window.birthdayAudioContexts.length)).toBe(0)
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '停止生日旋律' })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => planet.evaluate(node => Number(node.style.getPropertyValue('--melody-progress')))).toBeGreaterThan(0)
  await expect.poll(() => planet.evaluate(node => Number(node.style.getPropertyValue('--melody-level')))).toBeGreaterThan(.001)
  await page.getByRole('button', { name: '停止生日旋律' }).click()
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts[0].state)).toBe('closed')
  expect(await planet.evaluate(node => Number(node.style.getPropertyValue('--melody-progress')))).toBe(0)
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '停止生日旋律' })).toBeVisible()
  await page.getByRole('link', { name: '返回', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts.every(context => context.state === 'closed'))).toBe(true)
})

test('the melody finishes naturally with a completed progress indicator', async ({ page }) => {
  test.setTimeout(35_000)
  await observeAudio(page)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '停止生日旋律' })).toBeVisible()
  await expect(page.locator('.planet-instrument')).toHaveAttribute('aria-pressed', 'false', { timeout: 23_000 })
  await expect(page.locator('.planet-touch-hint')).toContainText('愿意再听一次吗')
  expect(await page.locator('.planet-instrument').evaluate(node => Number(node.style.getPropertyValue('--melody-progress')))).toBe(1)
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts[0].state)).toBe('closed')
})

test('reading supports keyboard scrolling and only actual backdrop gestures dismiss it', async ({ page }) => {
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '有一封信，写给你' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.click({ position: { x: 8, y: 90 } })
  await expect(dialog).toBeVisible()
  await page.getByRole('heading', { name: '给下一圈光里的你' }).focus()
  await page.keyboard.press('Tab')
  const body = page.locator('.gift-letter-body')
  await expect(body).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect.poll(() => body.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
  const box = await body.boundingBox()
  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(2, 2)
  await page.mouse.up()
  await expect(dialog).toBeVisible()
  await page.mouse.click(2, 2)
  await expect(dialog).not.toBeVisible()
})

test('reduced motion and both responsive layouts remain usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.planet-art')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.melody-orbit')).toHaveCSS('display', 'none')
  const timeBox = await page.locator('.melody-time').boundingBox()
  const controlsBox = await page.locator('.planet-controls').boundingBox()
  expect(timeBox.y + timeBox.height).toBeLessThanOrEqual(controlsBox.y)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('birthday-planet.jpg'), type: 'jpeg', quality: 78, scale: 'css', fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: '有一封信，写给你' }).click()
  await expect(page.getByRole('heading', { name: '给下一圈光里的你' })).toBeFocused()
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('birthday-gift-letter.jpg'), type: 'jpeg', quality: 78, scale: 'css', animations: 'disabled' })
})

test('backgrounding stops the sound and visual feedback loop', async ({ page }) => {
  await observeAudio(page)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '停止生日旋律' })).toBeVisible()
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.planet-instrument')).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts[0].state)).toBe('closed')
  expect(await page.locator('.planet-instrument').evaluate(node => Number(node.style.getPropertyValue('--melody-level')))).toBe(0)
})
