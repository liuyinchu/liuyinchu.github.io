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

async function codeNavigation(page, isMobile) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  if (isMobile) {
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
    return page.getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: '代码与项目' })
  }
  return page.getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: '代码与项目' })
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

test('the Code project card opens Music Box in its existing navigation section', async ({
  page,
  isMobile,
}) => {
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
  const codeLink = await codeNavigation(popup, isMobile)
  await expect(codeLink).toHaveClass(/is-active/)
  if (isMobile) {
    await popup.getByRole('button', { name: 'Toggle navigation' }).click()
  }
  await finishAudit(popup, popupAudit)
  await finishAudit(page, audit)
  await popup.close()
})

test('real marble collisions play, pause in place, resume, and reset', async ({ page }) => {
  const audit = await openBox(page)
  const play = page.getByTestId('music-play')
  await play.click()
  await expect(play).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(() => page.getByTestId('music-ball').count()).toBeGreaterThan(0)
  const startingPositions = await ballPositions(page)
  await expect.poll(() => ballPositions(page)).not.toEqual(startingPositions)
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)

  await play.click()
  await expect(play).toHaveAttribute('aria-pressed', 'false')
  const pausedHits = await hitCount(page)
  const pausedPositions = await ballPositions(page)
  expect(pausedPositions.length).toBeGreaterThan(0)
  // Several animation frames must pass without either physics or hits advancing.
  await page.waitForTimeout(350)
  expect(await hitCount(page)).toBe(pausedHits)
  expect(await ballPositions(page)).toEqual(pausedPositions)

  await play.click()
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(pausedHits)
  await page.getByTestId('music-reset').click()
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('parts can be added, dragged, tuned, removed, and restored after saving', async ({
  page,
  isMobile,
}) => {
  const audit = await openBox(page)
  await page.getByTestId('music-preset').selectOption('blank')
  const parts = page.getByTestId('music-part')
  await expect(parts).toHaveCount(0)

  await page.getByTestId('music-add-bell').click()
  await expect(parts).toHaveCount(1)
  const bellId = await page.getByTestId('music-selection').inputValue()
  expect(bellId).not.toBe('')
  const bell = page.locator('[data-testid="music-part"][data-part-id="' + bellId + '"]')
  await page.getByTestId('music-note').selectOption('5')
  const beforeDrag = (await layoutSnapshot(page))[0]
  await dragPart(page, bell, isMobile)
  await expect.poll(async () => {
    const after = (await layoutSnapshot(page))[0]
    return Math.hypot(after.x - beforeDrag.x, after.y - beforeDrag.y)
  }).toBeGreaterThan(30)

  await page.getByTestId('music-add-ramp').click()
  await expect(parts).toHaveCount(2)
  const rampId = await page.getByTestId('music-selection').inputValue()
  const angle = page.getByTestId('music-angle')
  const oldAngle = Number(await angle.inputValue())
  await angle.focus()
  await angle.press('ArrowRight')
  await expect(angle).toHaveValue(String(oldAngle + 1))
  const savedAngle = await angle.inputValue()

  await page.getByTestId('music-add-drum').click()
  await expect(parts).toHaveCount(3)
  await page.getByTestId('music-delete').click()
  await expect(parts).toHaveCount(2)
  await expect(page.locator('[data-testid="music-part"][data-type="drum"]')).toHaveCount(0)

  const savedLayout = await layoutSnapshot(page)
  await page.getByTestId('music-save').click()
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LAYOUT_KEY))
    .not.toBeNull()
  // Unsaved removal must not replace the layout explicitly saved by the user.
  await page.getByTestId('music-selection').selectOption(rampId)
  await page.getByTestId('music-delete').click()
  await expect(parts).toHaveCount(1)

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

test('the second musical preset supports a single marble without continuous playback', async ({
  page,
}) => {
  const audit = await openBox(page)
  const preset = page.getByTestId('music-preset')
  const alternative = await preset.locator('option').evaluateAll((options) =>
    options.map((option) => option.value).find((value) => !['cascade', 'blank'].includes(value)),
  )
  expect(alternative).toBeTruthy()
  await preset.selectOption(alternative)
  await expectStopped(page)
  await expect.poll(() => page.getByTestId('music-part').count()).toBeGreaterThan(0)
  await page.getByTestId('music-drop').click()
  await expect(page.getByTestId('music-ball')).toHaveCount(1)
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(page.getByTestId('music-ball')).toHaveCount(0, { timeout: 15_000 })
  await expect(page.getByTestId('music-play')).toHaveAttribute('aria-pressed', 'false')
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

  for (const id of ['music-volume', 'music-tempo']) {
    const slider = page.getByTestId(id)
    const oldValue = Number(await slider.inputValue())
    await slider.focus()
    await slider.press('ArrowLeft')
    await expect(slider).toHaveValue(String(oldValue - 1))
  }
  await expectStopped(page)
  await finishAudit(page, audit)
})

test('leaving a running box and returning creates a quiet, usable scene', async ({
  page,
  isMobile,
}) => {
  const audit = await openBox(page)
  await page.getByTestId('music-play').click()
  await expect.poll(() => hitCount(page), { timeout: 10_000 }).toBeGreaterThan(0)
  const codeLink = await codeNavigation(page, isMobile)
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

test('actual Web Audio produces PCM, mutes during collisions, and closes on route exit', async ({
  page,
  isMobile,
}, testInfo) => {
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext
    const probe = { contexts: [], taps: [] }
    window.__musicAudioProbe = probe
    window.AudioContext = class extends NativeAudioContext {
      constructor(...args) {
        super(...args)
        probe.contexts.push(this)
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

  const audit = await openBox(page)
  expect(await page.evaluate(() => window.__musicAudioProbe.contexts.length)).toBe(0)
  const readAudio = () => page.evaluate(() => {
    const probe = window.__musicAudioProbe
    let peak = 0
    for (const { analyser, samples } of probe.taps) {
      analyser.getFloatTimeDomainData(samples)
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample))
    }
    return {
      states: probe.contexts.map((context) => context.state),
      peak,
      hits: Number(document.querySelector('[data-testid="music-hit-count"]').textContent),
    }
  })

  await page.getByTestId('music-play').click()
  await expect.poll(async () => (await readAudio()).states).toContain('running')
  let audiblePeak = 0
  await expect.poll(async () => {
    audiblePeak = Math.max(audiblePeak, (await readAudio()).peak)
    return audiblePeak
  }, { intervals: [25, 50, 100], timeout: 10_000 }).toBeGreaterThan(0.0001)

  await page.getByTestId('music-mute').click()
  await expect(page.getByTestId('music-mute')).toHaveAttribute('aria-pressed', 'true')
  let quietStartHits = null
  let quietSamples = 0
  let mutedPeak = 0
  let mutedHits = 0
  await expect.poll(async () => {
    const sample = await readAudio()
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
  let restoredPeak = 0
  await expect.poll(async () => {
    restoredPeak = Math.max(restoredPeak, (await readAudio()).peak)
    return restoredPeak
  }, { intervals: [25, 50, 100], timeout: 10_000 }).toBeGreaterThan(0.0001)

  const codeLink = await codeNavigation(page, isMobile)
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
  await page.getByTestId('music-add-bell').click()
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

  await page.getByTestId('music-add-drum').click()
  await expect(parts).toHaveCount(1)
  const beforeDrag = (await layoutSnapshot(page))[0]
  await dragPart(page, parts.first(), isMobile)
  await expect.poll(async () => {
    const after = (await layoutSnapshot(page))[0]
    return Math.hypot(after.x - beforeDrag.x, after.y - beforeDrag.y)
  }).toBeGreaterThan(30)
  await finishAudit(page, audit)
})
