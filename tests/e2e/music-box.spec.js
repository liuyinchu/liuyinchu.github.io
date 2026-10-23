import { expect, test } from '@playwright/test'
import {
  auditPage,
  BASE_URL,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const LAYOUT_KEY = 'music-box-layout-v1'

async function expectStopped(page) {
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('music-ball')).toHaveCount(0)
  await expect(page.getByTestId('music-hit-count')).toHaveText('0')
}

async function openBox(page) {
  const audit = auditPage(page)
  await gotoRoute(page, '/music-box')
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expect(page.getByTestId('music-board')).toBeVisible()
  await expectStopped(page)
  return audit
}

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

async function hitCount(page) {
  return Number(await page.getByTestId('music-hit-count').textContent())
}

async function ballPositions(page) {
  return page.getByTestId('music-ball').evaluateAll((balls) =>
    balls.map((ball) => [ball.getAttribute('cx'), ball.getAttribute('cy')]),
  )
}

async function layoutSnapshot(page) {
  return page.getByTestId('music-part').evaluateAll((parts) =>
    parts.map((part) => ({
      id: part.getAttribute('data-part-id'),
      type: part.getAttribute('data-type'),
      x: Number(part.getAttribute('data-x')),
      y: Number(part.getAttribute('data-y')),
    })),
  )
}

async function codeNavigation(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  return page.getByRole('link', { name: '返回代码与项目', exact: true })
}

async function dragPart(page, part, isMobile) {
  await part.scrollIntoViewIfNeeded()
  const box = await part.boundingBox()
  const board = await page.getByTestId('music-board').boundingBox()
  expect(box).not.toBeNull()
  expect(board).not.toBeNull()
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const to = { x: from.x + board.width * 0.09, y: from.y + board.height * 0.04 }

  if (isMobile) {
    // Trusted touch input exercises browser pointer capture and touch-action.
    const session = await page.context().newCDPSession(page)
    try {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ ...from, id: 1 }],
      })
      for (let step = 1; step <= 6; step += 1) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{
            x: from.x + (to.x - from.x) * step / 6,
            y: from.y + (to.y - from.y) * step / 6,
            id: 1,
          }],
        })
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } finally {
      await session.detach()
    }
  } else {
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 6 })
    await page.mouse.up()
  }
}


async function clickControl(page, id, isMobile) {
  const control = page.getByTestId(id)
  if (isMobile) await control.tap()
  else await control.click()
}

async function placePart(page, type, isMobile, position = { x: 0.32, y: 0.4 }) {
  const parts = page.getByTestId('music-part')
  const count = await parts.count()
  await clickControl(page, 'music-add-' + type, isMobile)
  await expect(page.getByTestId('music-add-' + type)).toHaveAttribute('aria-pressed', 'true')
  await expect(parts).toHaveCount(count)
  const board = page.getByTestId('music-board')
  await board.scrollIntoViewIfNeeded()
  const point = await board.evaluate((svg, relative) => {
    const view = svg.viewBox.baseVal
    const world = { x: view.x + view.width * relative.x, y: view.y + view.height * relative.y }
    const client = new DOMPoint(world.x, world.y).matrixTransform(svg.getScreenCTM())
    return { world, client: { x: client.x, y: client.y } }
  }, position)
  if (isMobile) await page.touchscreen.tap(point.client.x, point.client.y)
  else await page.mouse.click(point.client.x, point.client.y)
  await expect(parts).toHaveCount(count + 1)
  await expect(page.getByTestId('music-tool-select')).toHaveAttribute('aria-pressed', 'true')
  const id = await page.getByTestId('music-selection').inputValue()
  expect(id).not.toBe('')
  const part = page.locator('[data-testid="music-part"][data-part-id="' + id + '"]')
  await expect(part).toHaveAttribute('data-type', type)
  expect(Math.abs(Number(await part.getAttribute('data-x')) - point.world.x)).toBeLessThan(3)
  expect(Math.abs(Number(await part.getAttribute('data-y')) - point.world.y)).toBeLessThan(3)
  return { id, part }
}

async function expectNearbyMobileEditing(page, isMobile) {
  if (!isMobile) return
  const ids = ['music-board', 'music-audition', 'music-duplicate', 'music-delete', 'music-undo', 'music-redo']
  const boxes = []
  for (const id of ids) {
    const control = page.getByTestId(id)
    await expect(control).toBeVisible()
    boxes.push(await control.boundingBox())
  }
  const top = Math.min(...boxes.map((box) => box.y))
  const bottom = Math.max(...boxes.map((box) => box.y + box.height))
  expect(bottom - top, 'board and frequent edit actions should fit together near one phone viewport')
    .toBeLessThanOrEqual(page.viewportSize().height - 64)
  await expectNoHorizontalOverflow(page)
}

async function installAudioProbe(page) {
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext
    const probe = { contexts: [], taps: [], oscillators: new Set() }
    window.__musicAudioProbe = probe
    window.AudioContext = class extends NativeAudioContext {
      constructor(...args) {
        super(...args)
        probe.contexts.push(this)
      }

      createOscillator(...args) {
        const oscillator = super.createOscillator(...args)
        probe.oscillators.add(oscillator)
        oscillator.addEventListener('ended', () => probe.oscillators.delete(oscillator), { once: true })
        return oscillator
      }

      createDynamicsCompressor(...args) {
        const compressor = super.createDynamicsCompressor(...args)
        const analyser = this.createAnalyser()
        analyser.fftSize = 2048
        // A read-only branch leaves the original destination connection intact.
        compressor.connect(analyser)
        probe.taps.push({ analyser, samples: new Float32Array(analyser.fftSize) })
        return compressor
      }
    }
  })
}

function readAudio(page) {
  return page.evaluate(() => {
    const probe = window.__musicAudioProbe
    let peak = 0
    for (const { analyser, samples } of probe.taps) {
      analyser.getFloatTimeDomainData(samples)
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample))
    }
    return {
      states: probe.contexts.map((context) => context.state),
      time: Math.max(0, ...probe.contexts.map((context) => context.currentTime)),
      activeOscillators: probe.oscillators.size,
      peak,
      hits: Number(document.querySelector('[data-testid="music-hit-count"]').textContent),
    }
  })
}

async function expectAudible(page) {
  let peak = 0
  await expect.poll(async () => {
    peak = Math.max(peak, (await readAudio(page)).peak)
    return peak
  }, { intervals: [25, 50, 100], timeout: 10_000 }).toBeGreaterThan(0.0001)
  return peak
}

test('the Code project opens a standalone Music Box and restores site chrome on return', async ({ page }) => {
  const audit = auditPage(page)
  await gotoRoute(page, '/code')
  await expect(page.getByText('音乐机关盒', { exact: true })).toBeVisible()
  const projectHomepage = page.locator('a[href="/music-box"]')
  await expect(projectHomepage).toHaveAttribute('target', '_blank')

  const popupPromise = page.waitForEvent('popup')
  await projectHomepage.click()
  const popup = await popupPromise
  const popupAudit = auditPage(popup)
  await expect(popup).toHaveURL(BASE_URL + '/music-box')
  await expect(popup.getByTestId('music-box')).toBeVisible()
  await expectStopped(popup)
  await expect(popup.locator('.site-header, .site-footer')).toHaveCount(0)
  const codeLink = await codeNavigation(popup)
  await expect(codeLink).toHaveAttribute('href', '/code')
  await codeLink.click()
  await expect(popup).toHaveURL(BASE_URL + '/code')
  await expect(popup.locator('.site-header')).toBeVisible()
  await expect(popup.locator('.site-footer')).toBeVisible()
  await popup.goBack()
  await expect(popup).toHaveURL(BASE_URL + '/music-box')
  await expect(popup.getByTestId('music-box')).toBeVisible()
  await expect(popup.locator('.site-header, .site-footer')).toHaveCount(0)
  await expectStopped(popup)
  await finishAudit(popup, popupAudit)
  await finishAudit(page, audit)
  await popup.close()
})

test('the original parade uses several entrances, advances sections, and pauses in place', async ({ page }) => {
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('parade')
  await expect(page.getByTestId('music-preset')).toHaveValue('parade')
  const score = page.getByTestId('music-score-state')
  await expect(score).toContainText('整队')
  const play = page.getByTestId('music-play')
  await play.click()
  await expect(play).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.getByTestId('music-ball').count()).toBeGreaterThan(0)
  const startingPositions = await ballPositions(page)
  const entrances = []
  await expect.poll(async () => {
    const upperBalls = await page.getByTestId('music-ball').evaluateAll((balls) =>
      balls.filter((ball) => Number(ball.getAttribute('cy')) <= 50)
        .map((ball) => Number(ball.getAttribute('cx'))),
    )
    for (const x of upperBalls) {
      if (entrances.every((known) => Math.abs(known - x) > 60)) entrances.push(x)
    }
    return entrances.length
  }, { intervals: [25, 50, 75], timeout: 6_000 }).toBeGreaterThanOrEqual(3)
  await expect.poll(() => ballPositions(page)).not.toEqual(startingPositions)
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(score).toContainText('起行', { timeout: 10_000 })

  await play.click()
  await expect(play).toHaveAttribute('aria-pressed', 'false')
  const pausedHits = await hitCount(page)
  const pausedPositions = await ballPositions(page)
  const pausedScore = await score.textContent()
  expect(pausedPositions.length).toBeGreaterThan(0)
  // Several animation frames must pass without physics or the score advancing.
  await page.waitForTimeout(350)
  expect(await hitCount(page)).toBe(pausedHits)
  expect(await ballPositions(page)).toEqual(pausedPositions)
  await expect(score).toHaveText(pausedScore)

  await play.click()
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(pausedHits)
  await expect.poll(() => score.textContent()).not.toBe(pausedScore)
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await expect(score).toContainText('整队')
  await finishAudit(page, audit)
})

test('placing, auditioning, copying, undoing, and saving form one editing loop', async ({
  page,
  isMobile,
}) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  const parts = page.getByTestId('music-part')
  await expect(parts).toHaveCount(0)

  const { id: bellId } = await placePart(page, 'bell', isMobile)
  await expectNearbyMobileEditing(page, isMobile)
  await clickControl(page, 'music-note-5', isMobile)
  await expect(page.getByTestId('music-note')).toHaveValue('5')
  await expectAudible(page)
  await expectStopped(page)
  await expect.poll(async () => (await readAudio(page)).peak, { timeout: 5_000 })
    .toBeLessThan(0.00001)
  await clickControl(page, 'music-audition', isMobile)
  await expectAudible(page)
  await expectStopped(page)

  await clickControl(page, 'music-duplicate', isMobile)
  await expect(parts).toHaveCount(2)
  await expect(page.getByTestId('music-note')).toHaveValue('5')
  const copiedLayout = await layoutSnapshot(page)
  expect(copiedLayout[0].x === copiedLayout[1].x && copiedLayout[0].y === copiedLayout[1].y).toBe(false)
  await clickControl(page, 'music-undo', isMobile)
  await expect(parts).toHaveCount(1)
  await clickControl(page, 'music-redo', isMobile)
  await expect.poll(() => layoutSnapshot(page)).toEqual(copiedLayout)

  const { id: rampId } = await placePart(page, 'ramp', isMobile, { x: 0.62, y: 0.64 })
  const angle = page.getByTestId('music-angle')
  const oldAngle = Number(await angle.inputValue())
  await clickControl(page, 'music-angle-more', isMobile)
  await expect(angle).toHaveValue(String(oldAngle + 15))
  const savedAngle = await angle.inputValue()

  await placePart(page, 'drum', isMobile, { x: 0.76, y: 0.3 })
  await expect(parts).toHaveCount(4)
  await clickControl(page, 'music-delete', isMobile)
  await expect(parts).toHaveCount(3)
  await expect(page.locator('[data-testid="music-part"][data-type="drum"]')).toHaveCount(0)

  const savedLayout = await layoutSnapshot(page)
  await page.getByTestId('music-save').click()
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LAYOUT_KEY))
    .not.toBeNull()
  // Unsaved removal must not replace the layout explicitly saved by the user.
  await page.getByTestId('music-selection').selectOption(rampId)
  await page.getByTestId('music-delete').click()
  await expect(parts).toHaveCount(2)

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await expect.poll(() => layoutSnapshot(page)).toEqual(savedLayout)
  await page.getByTestId('music-selection').selectOption(bellId)
  await expect(page.getByTestId('music-note')).toHaveValue('5')
  await page.getByTestId('music-selection').selectOption(rampId)
  await expect(page.getByTestId('music-angle')).toHaveValue(savedAngle)
  await finishAudit(page, audit)
})

test('a single marble does not start the parade sequence', async ({ page }) => {
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('parade')
  await expectStopped(page)
  await expect.poll(() => page.getByTestId('music-part').count()).toBeGreaterThan(0)
  const score = page.getByTestId('music-score-state')
  const idleScore = await score.textContent()
  await page.getByTestId('music-drop').click()
  await expect(page.getByTestId('music-ball')).toHaveCount(1)
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(page.getByTestId('music-ball')).toHaveCount(0, { timeout: 15_000 })
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'false')
  await expect(score).toHaveText(idleScore)
  const completedHits = await hitCount(page)
  await page.waitForTimeout(800)
  await expect(page.getByTestId('music-ball')).toHaveCount(0)
  expect(await hitCount(page)).toBe(completedHits)
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('sound and tempo controls remain operable at the current viewport', async ({ page }) => {
  const audit = await openBox(page)
  const mute = page.getByTestId('music-mute')
  await expect(mute).toHaveAttribute('aria-pressed', 'false')
  await mute.click()
  await expect(mute).toHaveAttribute('aria-pressed', 'true')
  await mute.click()
  await expect(mute).toHaveAttribute('aria-pressed', 'false')

  await page.getByTestId('music-settings').locator('summary').click()
  for (const id of ['music-volume', 'music-tempo']) {
    const slider = page.getByTestId(id)
    const oldValue = Number(await slider.inputValue())
    await slider.focus()
    await slider.press('ArrowLeft')
    await expect(slider).toHaveValue(String(oldValue - 1))
  }
  // Range inputs retain focus after editing but have no native undo history.
  const tempo = page.getByTestId('music-tempo')
  const editedTempo = Number(await tempo.inputValue())
  await page.keyboard.press('ControlOrMeta+z')
  await expect(tempo).toHaveValue(String(editedTempo + 1))
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect(tempo).toHaveValue(String(editedTempo))
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('leaving a running box and returning creates a quiet, usable scene', async ({ page }) => {
  const audit = await openBox(page)
  await page.getByTestId('music-play').click()
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  const codeLink = await codeNavigation(page)
  await codeLink.click()
  await expect(page).toHaveURL(BASE_URL + '/code')
  await expect(page.getByTestId('music-box')).toHaveCount(0)
  await audit.settle()
  await page.goBack()
  await expect(page).toHaveURL(BASE_URL + '/music-box')
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await page.waitForTimeout(350)
  await expectStopped(page)
  await page.getByTestId('music-play').click()
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('actual Web Audio produces PCM, mutes during collisions, and closes on route exit', async ({ page }, testInfo) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  expect(await page.evaluate(() => window.__musicAudioProbe.contexts.length)).toBe(0)

  await page.getByTestId('music-play').click()
  await expect.poll(async () => (await readAudio(page)).states).toContain('running')
  const audiblePeak = await expectAudible(page)

  await page.getByTestId('music-mute').click()
  await expect(page.getByTestId('music-mute')).toHaveAttribute('aria-pressed', 'true')
  let quietStartHits = null
  let quietSamples = 0
  let mutedPeak = 0
  let mutedHits = 0
  await expect.poll(async () => {
    const sample = await readAudio(page)
    if (sample.peak > 0.00001) {
      quietStartHits = null
      quietSamples = 0
      mutedPeak = 0
      return false
    }
    quietStartHits ??= sample.hits
    quietSamples += 1
    mutedPeak = Math.max(mutedPeak, sample.peak)
    mutedHits = sample.hits - quietStartHits
    // Silence must span new collisions, rather than a gap between notes.
    return quietSamples >= 6 && mutedHits >= 3
  }, { intervals: [25, 50, 100], timeout: 10_000 }).toBe(true)

  await page.getByTestId('music-mute').click()
  const restoredPeak = await expectAudible(page)

  const codeLink = await codeNavigation(page)
  await codeLink.click()
  await expect(page).toHaveURL(BASE_URL + '/code')
  let closedStates = []
  await expect.poll(async () => {
    closedStates = await page.evaluate(() =>
      window.__musicAudioProbe.contexts.map((context) => context.state),
    )
    return closedStates.length > 0 && closedStates.every((state) => state === 'closed')
  }).toBe(true)
  await testInfo.attach('audio-observation', {
    body: JSON.stringify({ audiblePeak, mutedPeak, mutedHits, quietSamples, restoredPeak, closedStates }, null, 2),
    contentType: 'application/json',
  })
  await finishAudit(page, audit)
})

test('deleting a held part and releasing outside the board allows another drag', async ({
  page,
  isMobile,
}) => {
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  await placePart(page, 'bell', isMobile)
  const parts = page.getByTestId('music-part')
  await expect(parts).toHaveCount(1)
  const heldPart = parts.first()
  await heldPart.scrollIntoViewIfNeeded()
  await heldPart.focus()
  const box = await heldPart.boundingBox()
  const board = await page.getByTestId('music-board').boundingBox()
  const viewport = page.viewportSize()
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const outside = [
    { x: 1, y: 1 },
    { x: viewport.width - 1, y: 1 },
    { x: 1, y: viewport.height - 1 },
    { x: viewport.width - 1, y: viewport.height - 1 },
  ].find((point) => point.x < board.x || point.x > board.x + board.width
    || point.y < board.y || point.y > board.y + board.height)
  expect(outside, 'release point should be outside the instrument board').toBeTruthy()

  if (isMobile) {
    const session = await page.context().newCDPSession(page)
    try {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ ...from, id: 1 }],
      })
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from.x + 10, y: from.y + 10, id: 1 }],
      })
      await page.keyboard.press('Delete')
      await expect(parts).toHaveCount(0)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...outside, id: 1 }],
      })
    } finally {
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await session.detach()
    }
  } else {
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    try {
      await page.mouse.move(from.x + 10, from.y + 10)
      await page.keyboard.press('Delete')
      await expect(parts).toHaveCount(0)
      await page.mouse.move(outside.x, outside.y)
    } finally {
      await page.mouse.up()
    }
  }

  await placePart(page, 'drum', isMobile)
  await expect(parts).toHaveCount(1)
  const beforeDrag = (await layoutSnapshot(page))[0]
  await dragPart(page, parts.first(), isMobile)
  await expect.poll(async () => {
    const after = (await layoutSnapshot(page))[0]
    return Math.hypot(after.x - beforeDrag.x, after.y - beforeDrag.y)
  }).toBeGreaterThan(30)
  await finishAudit(page, audit)
})

test('one undo restores a whole drag and history shortcuts respect native controls', async ({
  page,
  isMobile,
}) => {
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  const { part } = await placePart(page, 'bell', isMobile)
  const beforeDrag = await layoutSnapshot(page)
  await dragPart(page, part, isMobile)
  await expect.poll(() => layoutSnapshot(page)).not.toEqual(beforeDrag)
  const afterDrag = await layoutSnapshot(page)

  // Undo belongs to the focused form control, not the canvas history.
  await page.getByTestId('music-note').focus()
  await page.keyboard.press('ControlOrMeta+z')
  expect(await layoutSnapshot(page)).toEqual(afterDrag)

  await clickControl(page, 'music-undo', isMobile)
  await expect.poll(() => layoutSnapshot(page)).toEqual(beforeDrag)
  await clickControl(page, 'music-redo', isMobile)
  await expect.poll(() => layoutSnapshot(page)).toEqual(afterDrag)
  await page.getByTestId('music-tool-select').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => layoutSnapshot(page)).toEqual(beforeDrag)
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await expect.poll(() => layoutSnapshot(page)).toEqual(afterDrag)

  await clickControl(page, 'music-clear', isMobile)
  await expect(page.getByTestId('music-part')).toHaveCount(0)
  await clickControl(page, 'music-undo', isMobile)
  await expect.poll(() => layoutSnapshot(page)).toEqual(afterDrag)
  await page.getByTestId('music-preset').selectOption('cascade')
  await expect.poll(() => page.getByTestId('music-part').count()).toBeGreaterThan(1)
  await clickControl(page, 'music-undo', isMobile)
  await expect.poll(() => layoutSnapshot(page)).toEqual(afterDrag)
  await finishAudit(page, audit)
})

test('a saved v1 layout without a score restores its instruments and free rhythm', async ({ page }) => {
  const legacy = {
    version: 1,
    emitterX: 240,
    tempo: 108,
    parts: [
      { id: 'legacy-bell', type: 'bell', x: 240, y: 220, note: 2 },
      { id: 'legacy-ramp', type: 'ramp', x: 410, y: 350, angle: 25, length: 132 },
    ],
  }
  await page.addInitScript(({ key, layout }) => {
    localStorage.setItem(key, JSON.stringify(layout))
  }, { key: LAYOUT_KEY, layout: legacy })
  const audit = await openBox(page)
  await expect(page.getByTestId('music-part')).toHaveCount(2)
  expect(await layoutSnapshot(page)).toEqual(legacy.parts.map(({ id, type, x, y }) => ({ id, type, x, y })))
  await expect(page.getByTestId('music-tempo')).toHaveValue('108')
  await page.getByTestId('music-selection').selectOption('legacy-bell')
  await expect(page.getByTestId('music-note')).toHaveValue('2')
  await page.getByTestId('music-selection').selectOption('legacy-ramp')
  await expect(page.getByTestId('music-angle')).toHaveValue('25')
  await page.getByTestId('music-save').click()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).score, LAYOUT_KEY)).toBeNull()
  await finishAudit(page, audit)
})

test('an explicitly selected parade keeps its complete score and edits after reload', async ({ page }) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('cascade')
  await page.getByTestId('music-preset').selectOption('parade')
  await expect(page.getByTestId('music-tempo')).toHaveValue('144')
  const bellId = await page.locator('[data-testid="music-part"][data-type="bell"]').first()
    .getAttribute('data-part-id')
  await page.getByTestId('music-selection').selectOption(bellId)
  await page.getByTestId('music-note').selectOption('7')
  const savedLayout = await layoutSnapshot(page)
  await page.getByTestId('music-save').click()
  const savedScore = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).score, LAYOUT_KEY)
  expect(savedScore).toMatchObject({ id: 'parade', lengthBeats: 32, beatsPerBar: 4 })
  expect(new Set(savedScore.emitters.map((emitter) => emitter.x)).size).toBeGreaterThanOrEqual(3)
  expect(savedScore.events.length).toBeGreaterThan(0)

  await page.getByTestId('music-preset').selectOption('blank')
  await expect(page.getByTestId('music-part')).toHaveCount(0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await expect.poll(() => layoutSnapshot(page)).toEqual(savedLayout)
  await page.getByTestId('music-selection').selectOption(bellId)
  await expect(page.getByTestId('music-note')).toHaveValue('7')
  await page.getByTestId('music-save').click()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).score, LAYOUT_KEY)).toEqual(savedScore)
  await page.getByTestId('music-play').click()
  await expectAudible(page)
  await expect(page.getByTestId('music-score-state')).toContainText('起行', { timeout: 10_000 })
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('a placed string sounds and vibrates on collision, edits, and survives saving', async ({
  page,
  isMobile,
}) => {
  await installAudioProbe(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  const { id: stringId, part } = await placePart(page, 'string', isMobile, { x: 0.5, y: 0.4 })
  await expectNearbyMobileEditing(page, isMobile)
  const parts = page.getByTestId('music-part')
  await expect(parts).toHaveCount(1)
  await expect(page.getByTestId('music-note')).toHaveValue('8')
  await expect(page.getByTestId('music-angle')).toHaveValue('0')
  const wire = part.getByTestId('music-string-vibration')
  await expect(wire).toBeVisible()
  await expect(wire).toHaveAttribute('data-strike', '0')

  // This board has only a string and has never been auditioned.
  await clickControl(page, 'music-drop', isMobile)
  await Promise.all([
    expectAudible(page),
    expect.poll(() => hitCount(page), { intervals: [25, 50, 100] }).toBeGreaterThan(0),
    expect.poll(async () => Number(await wire.getAttribute('data-strike')), {
      intervals: [25, 50, 100],
    }).toBeGreaterThan(0),
    expect.poll(() => wire.evaluate((element) =>
      element.getAnimations().some((animation) => animation.playState === 'running'),
    ), { intervals: [25, 50], timeout: 5_000 }).toBe(true),
  ])
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await expect.poll(async () => (await readAudio(page)).peak, { timeout: 5_000 })
    .toBeLessThan(0.00001)

  await clickControl(page, 'music-note-12', isMobile)
  await expect(page.getByTestId('music-note')).toHaveValue('12')
  await expectAudible(page)
  await expectStopped(page)
  await clickControl(page, 'music-angle-more', isMobile)
  await expect(page.getByTestId('music-angle')).toHaveValue('15')
  await clickControl(page, 'music-duplicate', isMobile)
  await expect(parts).toHaveCount(2)
  const copiedId = await page.getByTestId('music-selection').inputValue()
  expect(copiedId).not.toBe(stringId)
  await clickControl(page, 'music-undo', isMobile)
  await expect(parts).toHaveCount(1)
  await clickControl(page, 'music-redo', isMobile)
  await expect(parts).toHaveCount(2)
  await page.getByTestId('music-selection').selectOption(copiedId)
  await expect(page.getByTestId('music-note')).toHaveValue('12')
  await expect(page.getByTestId('music-angle')).toHaveValue('15')

  const savedLayout = await layoutSnapshot(page)
  expect(savedLayout.every((item) => item.type === 'string')).toBe(true)
  await page.getByTestId('music-save').click()
  await page.getByTestId('music-delete').click()
  await expect(parts).toHaveCount(1)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await expect.poll(() => layoutSnapshot(page)).toEqual(savedLayout)
  for (const id of [stringId, copiedId]) {
    await page.getByTestId('music-selection').selectOption(id)
    await expect(page.getByTestId('music-note')).toHaveValue('12')
    await expect(page.getByTestId('music-angle')).toHaveValue('15')
  }
  await finishAudit(page, audit)
})

test('the original string parade stays quiet until played and performs several string voices', async ({
  page,
  isMobile,
}) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('string-parade')
  const preset = page.getByTestId('music-preset')
  const strings = page.locator('[data-testid="music-part"][data-type="string"]')
  await expect(preset).toHaveValue('string-parade')
  await expect.poll(() => strings.count()).toBeGreaterThanOrEqual(3)
  expect(await page.evaluate(() => window.__musicAudioProbe.contexts.length)).toBe(0)

  await preset.selectOption('parade')
  await expect(strings).toHaveCount(0)
  await preset.selectOption('string-parade')
  await expectStopped(page)
  await expect.poll(() => strings.count()).toBeGreaterThanOrEqual(3)
  const score = page.getByTestId('music-score-state')
  const initialScore = await score.textContent()
  await clickControl(page, 'music-play', isMobile)
  await Promise.all([
    expectAudible(page),
    expect.poll(() => strings.evaluateAll((parts) =>
      parts.filter((part) =>
        Number(part.querySelector('[data-testid="music-string-vibration"]').getAttribute('data-strike')) > 0,
      ).length,
    ), { intervals: [50, 100], timeout: 10_000 }).toBeGreaterThanOrEqual(3),
  ])
  await expect.poll(() => hitCount(page)).toBeGreaterThan(0)
  await expect.poll(() => score.textContent()).not.toBe(initialScore)
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('an isolated bowed voice sustains, renews without stacking, releases, and saves its settings', async ({
  page,
  isMobile,
}, testInfo) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  const { id: bowedId, part } = await placePart(page, 'bowed', isMobile, { x: 0.5, y: 0.4 })
  await expectNearbyMobileEditing(page, isMobile)
  await expect(page.getByTestId('music-part')).toHaveCount(1)
  await expect(page.getByTestId('music-voice')).toHaveValue('violin')
  await expect(page.getByTestId('music-hold')).toHaveValue('4')
  for (let step = 0; step < 4; step += 1) await clickControl(page, 'music-angle-more', isMobile)
  await expect(page.getByTestId('music-angle')).toHaveValue('60')
  await page.getByTestId('music-settings').locator('summary').click()
  await page.getByTestId('music-tempo').focus()
  await page.getByTestId('music-tempo').press('Home')
  await expect(page.getByTestId('music-tempo')).toHaveValue('30')
  await page.getByTestId('music-hold').selectOption('8')

  // Changing hold auditions the voice; clear that sound before the real collision.
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await expect.poll(async () => (await readAudio(page)).peak, {
    intervals: [25, 50, 100], timeout: 1_000,
  }).toBeLessThan(0.00001)
  await expect.poll(async () => (await readAudio(page)).activeOscillators).toBe(0)
  const activity = part.getByTestId('music-bowed-activity')
  await expect(activity).toHaveAttribute('data-active', 'false')
  await clickControl(page, 'music-drop', isMobile)
  await expect.poll(() => hitCount(page), { intervals: [25, 50, 100] }).toBe(1)
  await expectAudible(page)
  await expect(activity).toHaveAttribute('data-active', 'true')
  const first = await readAudio(page)
  const firstUntil = Number(await activity.getAttribute('data-until'))
  expect(first.activeOscillators).toBeGreaterThan(0)
  let minimumPeak = first.peak
  let sustainedSamples = 0
  await expect.poll(async () => {
    const sample = await readAudio(page)
    minimumPeak = Math.min(minimumPeak, sample.peak)
    sustainedSamples += 1
    return sample.time - first.time >= 3.2
      && sample.hits === 1
      && minimumPeak > 0.0001
      && sample.activeOscillators === first.activeOscillators
  }, { intervals: [50, 100], timeout: 6_000 }).toBe(true)
  expect(await hitCount(page)).toBe(1)
  await expect(activity).toHaveAttribute('data-active', 'true')

  // More real marbles renew this same part, without adding simultaneous voices.
  for (const expectedHits of [2, 3]) {
    await clickControl(page, 'music-drop', isMobile)
    await expect.poll(() => hitCount(page), { intervals: [25, 50, 100] }).toBe(expectedHits)
    await expect.poll(async () => (await readAudio(page)).activeOscillators, {
      timeout: 1_000,
    }).toBe(first.activeOscillators)
  }
  expect(Number(await activity.getAttribute('data-until'))).toBeGreaterThan(firstUntil)
  await expectAudible(page)
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'true')
  await clickControl(page, 'music-play', isMobile)
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'false')
  await expect(activity).toHaveAttribute('data-active', 'false')
  await expect.poll(async () => (await readAudio(page)).peak, {
    intervals: [25, 50, 100], timeout: 1_000,
  }).toBeLessThan(0.00001)
  await expect.poll(async () => (await readAudio(page)).activeOscillators).toBe(0)

  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await page.getByTestId('music-voice').selectOption('cello')
  await page.getByTestId('music-note').selectOption('8')
  await clickControl(page, 'music-audition', isMobile)
  await expectAudible(page)
  await expect(activity).toHaveAttribute('data-voice', 'cello')
  await expect(activity).toHaveAttribute('data-hold-beats', '8')
  await expect(activity).toHaveAttribute('data-active', 'true')
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'true')
  expect(await hitCount(page)).toBe(0)
  await clickControl(page, 'music-play', isMobile)
  await expect.poll(async () => (await readAudio(page)).peak, {
    intervals: [25, 50, 100], timeout: 1_000,
  }).toBeLessThan(0.00001)
  await expectStopped(page)

  const savedLayout = await layoutSnapshot(page)
  await page.getByTestId('music-save').click()
  await page.getByTestId('music-voice').selectOption('violin')
  await page.getByTestId('music-hold').selectOption('2')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await expect.poll(() => layoutSnapshot(page)).toEqual(savedLayout)
  await page.getByTestId('music-selection').selectOption(bowedId)
  await expect(page.getByTestId('music-voice')).toHaveValue('cello')
  await expect(page.getByTestId('music-hold')).toHaveValue('8')
  await expect(page.getByTestId('music-note')).toHaveValue('8')
  await expect(page.getByTestId('music-angle')).toHaveValue('60')
  expect(await page.evaluate(() => window.__musicAudioProbe.contexts.length)).toBe(0)
  await testInfo.attach('bowed-sustain-observation', {
    body: JSON.stringify({ minimumPeak, sustainedSamples, oscillatorBaseline: first.activeOscillators }, null, 2),
    contentType: 'application/json',
  })
  await finishAudit(page, audit)
})

test('the lantern ensemble is a quiet default and brings in both bowed voices and the next section', async ({
  page,
  isMobile,
}) => {
  await installAudioProbe(page)
  const audit = await openBox(page)
  const preset = page.getByTestId('music-preset')
  const activity = page.getByTestId('music-bowed-activity')
  await expect(preset).toHaveValue('lantern-ensemble')
  expect(await page.evaluate(() => window.__musicAudioProbe.contexts.length)).toBe(0)
  await preset.selectOption('string-parade')
  await expect(activity).toHaveCount(0)
  await expect.poll(() => page.getByTestId('music-string-vibration').count()).toBeGreaterThan(0)
  await preset.selectOption('parade')
  await expect(activity).toHaveCount(0)
  await expect(page.getByTestId('music-string-vibration')).toHaveCount(0)
  await preset.selectOption('lantern-ensemble')
  await expectStopped(page)
  await expect(page.getByTestId('music-tempo')).toHaveValue('116')
  // The complete preset must survive the same bounds normalization as user edits.
  const savedEnsemble = await layoutSnapshot(page)
  await page.getByTestId('music-save').click()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('music-box')).toBeVisible()
  await expectStopped(page)
  await expect.poll(() => layoutSnapshot(page)).toEqual(savedEnsemble)
  const score = page.getByTestId('music-score-state')
  await expect(score).toContainText('序幕')
  await clickControl(page, 'music-play', isMobile)
  await expectAudible(page)
  for (const voice of ['cello', 'violin']) {
    const voiceActivity = page.locator('[data-testid="music-bowed-activity"][data-voice="' + voice + '"]')
    await expect.poll(() => voiceActivity.evaluateAll((nodes) =>
      nodes.some((node) => node.getAttribute('data-active') === 'true'),
    ), { intervals: [50, 100], timeout: 8_000 }).toBe(true)
  }
  await expect.poll(() => page.getByTestId('music-string-vibration').evaluateAll((strings) =>
    strings.some((string) => Number(string.getAttribute('data-strike')) > 0),
  )).toBe(true)
  await expect.poll(() => hitCount(page)).toBeGreaterThan(0)
  await expect(score).toContainText('行进', { timeout: 12_000 })
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await expect.poll(() => activity.evaluateAll((nodes) =>
    nodes.every((node) => node.getAttribute('data-active') === 'false'),
  )).toBe(true)
  await finishAudit(page, audit)
})
