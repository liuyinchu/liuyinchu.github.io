import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { expectNoHorizontalOverflow } from './test-helpers.js'

const key = 'birthday-planet-letters-v1'
const birthday2026 = new Date('2026-10-28T04:00:00Z')

test('hidden entrance lazy loads the planet and leaving restores the normal shell', async ({ page }) => {
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
  await expect(page).toHaveTitle("生日星球 · LiuYinChu'Space")
  await expect(page.locator('#app > header, #app > footer')).toHaveCount(0)
  await expect(page.locator('meta[data-birthday-robots]')).toHaveAttribute('content', 'noindex, nofollow')
  expect(planetRequests.length).toBeGreaterThan(0)
  await expectNoHorizontalOverflow(page)
  await page.getByRole('link', { name: '返回', exact: true }).click()
  await expect(page.locator('[data-page="birthday-planet"]')).toHaveCount(0)
  await expect(page.locator('meta[data-birthday-robots]')).toHaveCount(0)
  await expect(page).not.toHaveTitle(/生日星球/)
  await expect(page.locator('#app > header')).toBeVisible()
  await page.locator('#app > footer').getByRole('link', { name: '说说', exact: true }).click()
  await expect(page).toHaveURL(/\/talk$/)
  await expect(entrance).toHaveCount(0)
  await expect(page.locator('#app > header')).toBeVisible()
})

test('letters survive reload, can be edited, and open on the next Shanghai birthday', async ({ page }) => {
  await page.clock.setFixedTime(birthday2026)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  const letter = page.getByRole('dialog')
  await expect(letter).toBeVisible()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('愿明年的我仍然好奇。')
  await page.getByRole('button', { name: '存好这封信' }).click()
  await expect(letter).toContainText('2027.10.28')
  await expect(letter).toContainText('信已存好')
  await page.getByRole('button', { name: '关闭信件' }).click()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /2026 的信/ }).click()
  await expect(letter).toContainText('来拆这封信吧')
  await page.getByRole('button', { name: '再写几句', exact: true }).click()
  await expect(page.getByLabel('写给下一岁的自己', { exact: true })).toHaveValue('愿明年的我仍然好奇。')
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('愿明年的我仍然好奇。\n记得看星星。')
  await page.getByRole('button', { name: '存好这封信' }).click()
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, key)).toBe(1)
  await page.getByRole('button', { name: '关闭信件' }).click()
  await page.clock.setFixedTime(new Date('2027-10-27T16:00:00Z'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.planet-year')).toContainText('第 2 圈光')
  await page.getByRole('button', { name: /2026 的信/ }).click()
  await expect(letter).toContainText('嘿，又见面了')
  await expect(page.getByRole('heading', { name: '嘿，又见面了。' })).toBeFocused()
  await expect(page.locator('.opened-letter')).toHaveText('愿明年的我仍然好奇。\n记得看星星。')
})

test('audio starts only by gesture and stops on pause and navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext
    window.birthdayAudioContexts = []
    window.AudioContext = class extends OriginalAudioContext {
      constructor(...args) {
        super(...args)
        window.birthdayAudioContexts.push(this)
      }
    }
  })
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  expect(await page.evaluate(() => window.birthdayAudioContexts.length)).toBe(0)
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '暂停生日旋律' })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts[0]?.state)).toBe('running')
  await page.getByRole('button', { name: '暂停生日旋律' }).click()
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts[0]?.state)).toBe('closed')
  await page.getByRole('button', { name: '轻触星球，播放生日旋律' }).click()
  await expect(page.getByRole('button', { name: '暂停生日旋律' })).toBeVisible()
  await page.getByRole('link', { name: '返回', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.birthdayAudioContexts.every(context => context.state === 'closed'))).toBe(true)
})

test('reduced motion, dialog keyboard dismissal and mobile width work', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.planet-art')).toHaveCSS('animation-name', 'none')
  await page.screenshot({ path: testInfo.outputPath('birthday-planet.jpg'), type: 'jpeg', quality: 78, scale: 'css', fullPage: true, animations: 'disabled' })
  await expectNoHorizontalOverflow(page)
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  await expect(page.getByLabel('写给下一岁的自己', { exact: true })).toBeFocused()
  await expectNoHorizontalOverflow(page)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: '写封信，给下一岁的自己' })).toBeFocused()
})

test('a failed local save keeps the letter available for copying', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError') }
  })
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('这封信应该留在编辑框里。')
  await page.getByRole('button', { name: '存好这封信' }).click()
  await expect(page.getByRole('status')).toContainText('暂时没有存成功')
  await expect(page.getByLabel('写给下一岁的自己', { exact: true })).toHaveValue('这封信应该留在编辑框里。')
})

test('saving across birthday midnight preserves the previous year letter', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2027-10-27T15:59:50Z'))
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([{
      year: 2026,
      text: '上一圈的信，应该留下。',
      createdAt: '2026-10-28T04:00:00.000Z',
      opensOn: '2027-10-28',
    }]))
  }, key)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '再写几句，给下一岁的自己' }).click()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('这是新一圈的信。')
  await page.clock.setFixedTime(new Date('2027-10-27T16:00:05Z'))
  await page.getByRole('button', { name: '存好这封信' }).click()
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key)
  expect(saved).toHaveLength(2)
  expect(saved.find(letter => letter.year === 2026).text).toBe('上一圈的信，应该留下。')
  expect(saved.find(letter => letter.year === 2027)).toMatchObject({ text: '这是新一圈的信。', opensOn: '2028-10-28' })
  await expect(page.getByRole('dialog')).toContainText('2028.10.28')
})

test('an unsaved letter survives dismissing and reopening the dialog', async ({ page }) => {
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('先记下一束光，稍后再慢慢写。')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '继续写，给下一岁的自己' }).click()
  await expect(page.getByLabel('写给下一岁的自己', { exact: true })).toHaveValue('先记下一束光，稍后再慢慢写。')
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull()
  await page.getByRole('button', { name: '存好这封信', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('信已存好')
})

test('dialog whitespace and an outward drag do not dismiss the letter', async ({ page }) => {
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.click({ position: { x: 8, y: 90 } })
  await expect(dialog).toBeVisible()
  const box = await page.getByLabel('写给下一岁的自己', { exact: true }).boundingBox()
  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(2, 2)
  await page.mouse.up()
  await expect(dialog).toBeVisible()
  await page.mouse.click(2, 2)
  await expect(dialog).not.toBeVisible()
})

test('failed copying keeps the sealed letter and pending draft separate', async ({ page }) => {
  await page.clock.setFixedTime(birthday2026)
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([{ year: 2026, text: '已经存好的原信。', createdAt: '2026-10-28T04:00:00.000Z', opensOn: '2027-10-28' }]))
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new DOMException('Copy unavailable', 'NotAllowedError') },
    } })
  }, key)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '再写几句，给下一岁的自己' }).click()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('没有保存的新草稿。')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /2026 的信/ }).click()
  await page.getByRole('button', { name: '复制留存' }).click()
  await expect(page.getByRole('heading', { name: '把这一天，轻轻收好。' })).toBeVisible()
  const fallback = page.getByLabel('手动复制原文')
  await expect(fallback).toHaveValue('已经存好的原信。')
  await expect(fallback).toHaveAttribute('readonly', '')
  await expect(fallback).toBeFocused()
  expect(await fallback.evaluate(input => input.selectionEnd - input.selectionStart)).toBe('已经存好的原信。'.length)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '继续写，给下一岁的自己' }).click()
  await expect(page.getByLabel('写给下一岁的自己', { exact: true })).toHaveValue('没有保存的新草稿。')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key))[0].text, key)).toBe('已经存好的原信。')
})

test('sealed letters show the waiting date, focus the receipt and download as text', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(birthday2026)
  await page.goto('/birthday-planet', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '写封信，给下一岁的自己' }).click()
  await page.getByLabel('写给下一岁的自己', { exact: true }).fill('愿下一岁的我，依然好奇。\n  留住一点星光。')
  await page.getByRole('button', { name: '存好这封信', exact: true }).click()
  await expect(page.getByRole('heading', { name: '把这一天，轻轻收好。' })).toBeFocused()
  await expect(page.locator('.letter-countdown')).toContainText('365')
  await expect(page.locator('.letter-arrival time')).toHaveText('2027.10.28')
  await page.screenshot({ path: testInfo.outputPath('birthday-letter.jpg'), type: 'jpeg', quality: 78, scale: 'css', animations: 'disabled' })
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载信件' }).click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('生日星球-2026.txt')
  const file = testInfo.outputPath('birthday-letter.txt')
  await download.saveAs(file)
  const content = await readFile(file, 'utf8')
  expect(content).toContain('开启日期：2027.10.28')
  expect(content).toContain('愿下一岁的我，依然好奇。\n  留住一点星光。')
})
