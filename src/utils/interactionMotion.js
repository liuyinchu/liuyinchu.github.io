const INTERACTIVE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  '[role="switch"]:not([aria-disabled="true"])',
  '[role="checkbox"]:not([aria-disabled="true"])',
  '[role="radio"]:not([aria-disabled="true"])',
  'summary',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
  'input[type="checkbox"]:not(:disabled)',
  'input[type="radio"]:not(:disabled)',
].join(', ')

const FORM_FOCUS_SELECTOR = [
  'input:not(:disabled):not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
].join(', ')

const HIT_SLOP = 10
const CONTROL_PRESS_SCALE = 0.97
const SURFACE_PRESS_SCALE = 0.985
const MOTION_SURFACE_SELECTOR = [
  '.card',
  '.spotlight-card',
  'article',
  '[class*="card"]',
  '[class*="tile"]',
  '[class*="panel"]',
  '[class*="entry"]',
  '[class*="feature"]',
  '[class*="post"]',
].join(', ')
const ROUTE_START_OPACITY = 0.74
const ROUTE_START_OFFSET = 22
const ROUTE_START_SCALE = 0.985
const MOUSE_FALLBACK_POINTER_ID = 'mouse-fallback'

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const reducedTransparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)')
const supportsPointerEvents = 'PointerEvent' in window
const reduceMotion = () => reducedMotionQuery.matches
const reduceTransparency = () => reducedTransparencyQuery.matches

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function parseScale(value) {
  if (!value || value === 'none') return 1
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 1
}

function parseNumber(value, fallback) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function createSpring(initialValues, render) {
  const channels = Object.fromEntries(
    Object.entries(initialValues).map(([key, value]) => [
      key,
      { position: value, velocity: 0, target: value },
    ]),
  )

  let frame = 0
  let previousTime = 0
  let response = 0.32
  let damping = 1
  let restDelta = 0.001
  let restSpeed = 0.02
  let onRest = null
  let stopped = false

  function values() {
    return Object.fromEntries(
      Object.entries(channels).map(([key, channel]) => [key, channel.position]),
    )
  }

  function velocities() {
    return Object.fromEntries(
      Object.entries(channels).map(([key, channel]) => [key, channel.velocity]),
    )
  }

  function settle() {
    for (const channel of Object.values(channels)) {
      channel.position = channel.target
      channel.velocity = 0
    }
    render(values())
    frame = 0
    previousTime = 0
    const callback = onRest
    onRest = null
    callback?.()
  }

  function tick(time) {
    if (stopped) return

    if (!previousTime) previousTime = time
    const elapsed = clamp((time - previousTime) / 1000, 1 / 240, 1 / 30)
    previousTime = time
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
    const step = elapsed / steps
    const omega = (Math.PI * 2) / Math.max(response, 0.08)

    for (let index = 0; index < steps; index += 1) {
      for (const channel of Object.values(channels)) {
        const displacement = channel.target - channel.position
        const acceleration = (
          omega * omega * displacement
          - 2 * damping * omega * channel.velocity
        )
        channel.velocity += acceleration * step
        channel.position += channel.velocity * step
      }
    }

    render(values())
    if (stopped) return

    const atRest = Object.values(channels).every((channel) => (
      Math.abs(channel.target - channel.position) <= restDelta
      && Math.abs(channel.velocity) <= restSpeed
    ))

    if (atRest) {
      settle()
      return
    }

    frame = window.requestAnimationFrame(tick)
  }

  function retarget(targetValues, options = {}) {
    if (stopped) return

    response = options.response ?? response
    damping = options.damping ?? damping
    restDelta = options.restDelta ?? restDelta
    restSpeed = options.restSpeed ?? restSpeed
    onRest = options.onRest ?? null

    for (const [key, target] of Object.entries(targetValues)) {
      if (!channels[key]) {
        channels[key] = { position: target, velocity: 0, target }
      }
      channels[key].target = target
      if (options.velocity?.[key] != null) {
        channels[key].velocity = options.velocity[key]
      }
    }

    if (!frame) {
      previousTime = window.performance.now()
      frame = window.requestAnimationFrame(tick)
    }
  }

  function stop() {
    if (stopped) return
    stopped = true
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
    onRest = null
  }

  function snap(targetValues) {
    if (stopped) return
    if (frame) window.cancelAnimationFrame(frame)
    frame = 0
    previousTime = 0
    onRest = null
    for (const [key, target] of Object.entries(targetValues)) {
      if (!channels[key]) channels[key] = { position: target, velocity: 0, target }
      channels[key].position = target
      channels[key].target = target
      channels[key].velocity = 0
    }
    render(values())
  }

  const api = { retarget, snap, stop, values, velocities }
  render(values())
  return api
}

function isPhysicalSurface(element, bounds) {
  const area = bounds.width * bounds.height
  const viewportArea = Math.max(window.innerWidth * window.innerHeight, 1)
  return (
    bounds.width >= 160
    && bounds.height >= 56
    && bounds.width <= Math.max(window.innerWidth - 24, 160)
    && bounds.height <= Math.max(window.innerHeight * 0.94, 180)
    && area <= viewportArea * 0.74
    && (
      element.matches(INTERACTIVE_SELECTOR)
      || Boolean(element.querySelector(INTERACTIVE_SELECTOR))
    )
  )
}

function getSurfaceTarget(root, start) {
  const surface = start.closest(MOTION_SURFACE_SELECTOR)
  if (!surface || !root.documentElement.contains(surface)) return null

  const style = window.getComputedStyle(surface)
  const bounds = surface.getBoundingClientRect()
  if (
    !isPhysicalSurface(surface, bounds)
    || style.display === 'none'
    || style.pointerEvents === 'none'
  ) {
    return null
  }

  return { element: surface, control: null, style, bounds, kind: 'surface' }
}

function isHoverableControl(style, bounds) {
  return (
    style.display !== 'inline'
    && bounds.width >= 40
    && bounds.height >= 28
    && bounds.width <= 420
    && bounds.height <= 120
  )
}

function getInteractiveTarget(root, start) {
  if (!(start instanceof Element)) return null

  const control = start.closest(INTERACTIVE_SELECTOR)
  if (!control || !root.documentElement.contains(control)) return null

  const surfaceTarget = getSurfaceTarget(root, control)
  const controlIsSurface = surfaceTarget?.element === control
  const element = control

  const style = window.getComputedStyle(element)
  const bounds = element.getBoundingClientRect()
  if (
    style.display === 'none'
    || style.pointerEvents === 'none'
    || bounds.width === 0
    || bounds.height === 0
  ) {
    return null
  }

  return {
    element,
    control,
    style,
    bounds,
    kind: controlIsSurface ? 'surface' : 'control',
  }
}

function getHoverTarget(root, start) {
  if (!(start instanceof Element)) return null

  const surfaceTarget = getSurfaceTarget(root, start)
  if (surfaceTarget) return surfaceTarget

  return getInteractiveTarget(root, start)
}

export function installInteractionMotion(root = document) {
  const pointerPresses = new Map()
  const keyboardPresses = new Map()
  const pressStates = new Map()
  const hoverStates = new Map()
  const formFocusStates = new Map()
  let hoveredSurface = null
  let pruneFrame = 0

  function hasActivePress(element) {
    for (const press of keyboardPresses.values()) {
      if (press.element === element) return true
    }
    for (const press of pointerPresses.values()) {
      if (press.element === element && press.inside) return true
    }
    return false
  }

  function restorePressState(element, state) {
    state.controller?.stop()
    element.style.scale = state.inlineScale
    element.style.opacity = state.inlineOpacity
    element.style.willChange = state.inlineWillChange
    pressStates.delete(element)
  }

  function ensurePressState(element, target) {
    const existing = pressStates.get(element)
    if (existing) return existing

    const { style } = target
    const useOpacity = reduceMotion() || style.display === 'inline'
    const baseline = useOpacity
      ? parseNumber(style.opacity, 1)
      : parseScale(style.scale)
    const state = {
      baseline,
      useOpacity,
      pressedTarget: useOpacity
        ? baseline * 0.82
        : baseline * (
          target.kind === 'surface' ? SURFACE_PRESS_SCALE : CONTROL_PRESS_SCALE
        ),
      target,
      inlineScale: element.style.scale,
      inlineOpacity: element.style.opacity,
      inlineWillChange: element.style.willChange,
      pressedAt: 0,
      controller: null,
    }

    element.style.willChange = useOpacity ? 'opacity' : 'scale'
    state.controller = createSpring(
      { value: baseline },
      ({ value }) => {
        if (!element.isConnected) {
          restorePressState(element, state)
          return
        }
        if (state.useOpacity) element.style.opacity = String(value)
        else element.style.scale = String(value)
      },
    )
    pressStates.set(element, state)
    return state
  }

  function setPressed(element, pressed, knownTarget = null) {
    if (!element?.isConnected) {
      const existing = pressStates.get(element)
      if (existing) restorePressState(element, existing)
      return
    }

    const target = knownTarget
      ?? pressStates.get(element)?.target
      ?? getInteractiveTarget(root, element)
    if (!target) return

    const state = ensurePressState(element, target)
    let releaseVelocity
    if (pressed) {
      state.pressedAt = window.performance.now()
    } else {
      const position = state.controller.values().value
      const velocity = state.controller.velocities().value
      const distance = Math.abs(state.baseline - state.pressedTarget)
      const progress = distance > 0
        ? clamp(Math.abs(state.baseline - position) / distance, 0, 1)
        : 1
      const quickTap = window.performance.now() - state.pressedAt < 90
      if (quickTap && progress < 0.55) {
        const direction = Math.sign(state.pressedTarget - state.baseline) || -1
        const impulse = direction * distance * 52 * (1 - progress)
        releaseVelocity = Math.abs(impulse) > Math.abs(velocity) ? impulse : velocity
      }
      state.pressedAt = 0
    }
    state.controller.retarget(
      { value: pressed ? state.pressedTarget : state.baseline },
      {
        response: pressed ? 0.12 : 0.3,
        damping: 1,
        velocity: releaseVelocity == null ? undefined : { value: releaseVelocity },
        restDelta: 0.0002,
        restSpeed: 0.004,
        onRest: () => {
          if (!pressed && !hasActivePress(element)) restorePressState(element, state)
        },
      },
    )
  }

  function restoreFormFocusState(element, state) {
    state.controller.stop()
    element.style.scale = state.inlineScale
    element.style.willChange = state.inlineWillChange
    formFocusStates.delete(element)
  }

  function setFormFocused(element, focused) {
    let state = formFocusStates.get(element)
    if (reduceMotion()) {
      if (state) restoreFormFocusState(element, state)
      return
    }
    if (!state && focused) {
      const baseline = parseScale(window.getComputedStyle(element).scale)
      state = {
        baseline,
        inlineScale: element.style.scale,
        inlineWillChange: element.style.willChange,
        controller: null,
      }
      element.style.willChange = 'scale'
      state.controller = createSpring(
        { value: baseline },
        ({ value }) => {
          if (!element.isConnected) {
            restoreFormFocusState(element, state)
            return
          }
          element.style.scale = String(value)
        },
      )
      formFocusStates.set(element, state)
    }
    if (!state) return

    state.controller.retarget(
      { value: focused ? state.baseline * 1.012 : state.baseline },
      {
        response: focused ? 0.2 : 0.3,
        damping: 1,
        restDelta: 0.0002,
        restSpeed: 0.004,
        onRest: () => {
          if (!focused) restoreFormFocusState(element, state)
          else element.style.willChange = state.inlineWillChange
        },
      },
    )
  }

  function restoreHoverState(element, state) {
    state.controller.stop()
    element.style.translate = state.inlineTranslate
    element.style.rotate = state.inlineRotate
    element.style.willChange = state.inlineWillChange
    hoverStates.delete(element)
    if (hoveredSurface === element) hoveredSurface = null
  }

  function ensureHoverState(element) {
    const existing = hoverStates.get(element)
    if (existing) return existing

    const state = {
      inlineTranslate: element.style.translate,
      inlineRotate: element.style.rotate,
      inlineWillChange: element.style.willChange,
      controller: null,
    }
    element.style.willChange = 'translate, rotate'
    state.controller = createSpring(
      { x: 0, y: 0, rotation: 0 },
      ({ x, y, rotation }) => {
        if (!element.isConnected) {
          restoreHoverState(element, state)
          return
        }
        element.style.translate = `${x}px ${y}px`
        element.style.rotate = `${rotation}deg`
      },
    )
    hoverStates.set(element, state)
    return state
  }

  function releaseHoveredSurface() {
    if (!hoveredSurface) return
    const element = hoveredSurface
    const state = hoverStates.get(element)
    hoveredSurface = null
    if (!state) return

    const releaseVelocity = state.controller.velocities()
    const speed = Math.hypot(
      releaseVelocity.x,
      releaseVelocity.y,
      releaseVelocity.rotation * 4,
    )
    state.controller.retarget(
      { x: 0, y: 0, rotation: 0 },
      {
        response: 0.36,
        damping: speed > 5 ? 0.86 : 1,
        restDelta: 0.02,
        restSpeed: 0.08,
        onRest: () => restoreHoverState(element, state),
      },
    )
  }

  function updateSurfaceHover(event, target) {
    if (reduceMotion() || event.pointerType !== 'mouse' || event.buttons !== 0) {
      releaseHoveredSurface()
      return
    }

    if (
      !target
      || (target.style.translate && target.style.translate !== 'none')
      || (target.style.rotate && target.style.rotate !== 'none')
      || (
        target.kind !== 'surface'
        && !isHoverableControl(target.style, target.bounds)
      )
    ) {
      releaseHoveredSurface()
      return
    }

    const { element, bounds } = target
    if (hoveredSurface && hoveredSurface !== element) releaseHoveredSurface()
    hoveredSurface = element

    const state = ensureHoverState(element)
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5
    const surface = target.kind === 'surface'
    const x = surface
      ? clamp(horizontal * 10, -5, 5)
      : clamp(horizontal * 3, -1.5, 1.5)
    const y = surface
      ? clamp(-4 + vertical * 4, -6, -2)
      : clamp(-1 + vertical * 1.6, -1.8, -0.2)
    const rotation = surface ? clamp(horizontal * 0.6, -0.3, 0.3) : 0
    state.controller.retarget(
      { x, y, rotation },
      { response: surface ? 0.2 : 0.16, damping: 1, restDelta: 0.02, restSpeed: 0.08 },
    )
  }

  function beginPress(event, pointerId, capturePointer) {
    const target = getInteractiveTarget(root, event.target)
    if (!target) return

    const captureOwner = target.control
    if (capturePointer) {
      try {
        captureOwner?.setPointerCapture?.(pointerId)
      } catch {
        // The pointer may already have ended; window-level cleanup remains active.
      }
    }

    pointerPresses.set(pointerId, {
      element: target.element,
      bounds: target.bounds,
      inside: true,
      target,
      captureOwner,
    })
    setPressed(target.element, true, target)
  }

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return
    beginPress(event, event.pointerId, true)
  }

  function onMouseDown(event) {
    if (event.button !== 0) return
    beginPress(event, MOUSE_FALLBACK_POINTER_ID, false)
  }

  function updatePointerPosition(event, pointerId) {
    const press = pointerPresses.get(pointerId)
    if (press) {
      const { bounds, element } = press
      const inside = (
        event.clientX >= bounds.left - HIT_SLOP
        && event.clientX <= bounds.right + HIT_SLOP
        && event.clientY >= bounds.top - HIT_SLOP
        && event.clientY <= bounds.bottom + HIT_SLOP
      )

      if (inside !== press.inside) {
        press.inside = inside
        setPressed(element, inside || hasActivePress(element), press.target)
      }
      return
    }

    updateSurfaceHover(event, getHoverTarget(root, event.target))
  }

  function onPointerMove(event) {
    updatePointerPosition(event, event.pointerId)
  }

  function onMouseMove(event) {
    updatePointerPosition(
      {
        pointerType: 'mouse',
        buttons: event.buttons,
        clientX: event.clientX,
        clientY: event.clientY,
        target: event.target,
      },
      MOUSE_FALLBACK_POINTER_ID,
    )
  }

  function finishPress(pointerId) {
    const press = pointerPresses.get(pointerId)
    if (!press) return

    pointerPresses.delete(pointerId)
    setPressed(press.element, hasActivePress(press.element), press.target)
    try {
      if (press.captureOwner?.hasPointerCapture?.(pointerId)) {
        press.captureOwner.releasePointerCapture(pointerId)
      }
    } catch {
      // Capture can already be gone after native cancellation.
    }
  }

  function finishPointer(event) {
    finishPress(event.pointerId)
  }

  function finishMouse() {
    finishPress(MOUSE_FALLBACK_POINTER_ID)
  }

  function onLostPointerCapture(event) {
    finishPointer(event)
  }

  function onPointerOut(event) {
    if (event.pointerType === 'mouse' && !event.relatedTarget) releaseHoveredSurface()
  }

  function onMouseOut(event) {
    if (!event.relatedTarget) releaseHoveredSurface()
  }

  function onKeyDown(event) {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return

    const target = getInteractiveTarget(root, event.target)
    if (!target || (event.key === ' ' && target.control.matches('a[href]'))) return

    const key = event.code || event.key
    keyboardPresses.set(key, { element: target.element, target })
    setPressed(target.element, true, target)
  }

  function finishKeyboard(event) {
    const releases = []
    if (event.type === 'blur') {
      for (const [key, press] of keyboardPresses) {
        if (press.target.control === event.target) releases.push([key, press])
      }
    } else {
      const key = event.code || event.key
      const press = keyboardPresses.get(key)
      if (press) releases.push([key, press])
    }

    for (const [key, press] of releases) {
      keyboardPresses.delete(key)
      setPressed(press.element, hasActivePress(press.element), press.target)
    }
  }

  function onFocusIn(event) {
    if (event.target instanceof Element && event.target.matches(FORM_FOCUS_SELECTOR)) {
      setFormFocused(event.target, true)
    }
  }

  function onFocusOut(event) {
    if (event.target instanceof Element && formFocusStates.has(event.target)) {
      setFormFocused(event.target, false)
    }
  }

  function releasePointerCaptures(entries) {
    for (const [pointerId, press] of entries) {
      try {
        if (press.captureOwner?.hasPointerCapture?.(pointerId)) {
          press.captureOwner.releasePointerCapture(pointerId)
        }
      } catch {
        // Native cancellation may have already released capture.
      }
    }
  }

  function cancelAllInput() {
    const pointerEntries = Array.from(pointerPresses.entries())
    const pressedElements = new Set(
      pointerEntries.map(([, { element }]) => element),
    )
    pointerPresses.clear()
    releasePointerCaptures(pointerEntries)
    for (const { element } of keyboardPresses.values()) pressedElements.add(element)
    keyboardPresses.clear()
    for (const element of pressedElements) setPressed(element, false)
    releaseHoveredSurface()
  }

  function handleMotionPreferenceChange() {
    if (!reduceMotion()) return
    const pointerEntries = Array.from(pointerPresses.entries())
    pointerPresses.clear()
    releasePointerCaptures(pointerEntries)
    keyboardPresses.clear()
    for (const [element, state] of pressStates) restorePressState(element, state)
    for (const [element, state] of hoverStates) restoreHoverState(element, state)
    for (const [element, state] of formFocusStates) restoreFormFocusState(element, state)
  }

  function pruneDetachedMotionStates() {
    pruneFrame = 0
    const detachedPointers = []
    for (const [pointerId, press] of pointerPresses) {
      if (press.element.isConnected) continue
      pointerPresses.delete(pointerId)
      detachedPointers.push([pointerId, press])
    }
    releasePointerCaptures(detachedPointers)
    for (const [key, press] of keyboardPresses) {
      if (!press.element.isConnected) keyboardPresses.delete(key)
    }
    for (const [element, state] of pressStates) {
      if (!element.isConnected) restorePressState(element, state)
    }
    for (const [element, state] of hoverStates) {
      if (!element.isConnected) restoreHoverState(element, state)
    }
    for (const [element, state] of formFocusStates) {
      if (!element.isConnected) restoreFormFocusState(element, state)
    }
  }

  const detachedStateObserver = new MutationObserver(() => {
    if (pruneFrame) return
    pruneFrame = window.requestAnimationFrame(pruneDetachedMotionStates)
  })
  detachedStateObserver.observe(root.documentElement, { childList: true, subtree: true })

  if (supportsPointerEvents) {
    root.addEventListener('pointerdown', onPointerDown, true)
    root.addEventListener('lostpointercapture', onLostPointerCapture, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', finishPointer, true)
    window.addEventListener('pointercancel', finishPointer, true)
    window.addEventListener('pointerout', onPointerOut, true)
  } else {
    root.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mousemove', onMouseMove, true)
    window.addEventListener('mouseup', finishMouse, true)
    window.addEventListener('mouseout', onMouseOut, true)
  }
  root.addEventListener('keydown', onKeyDown, true)
  root.addEventListener('keyup', finishKeyboard, true)
  root.addEventListener('blur', finishKeyboard, true)
  root.addEventListener('focusin', onFocusIn, true)
  root.addEventListener('focusout', onFocusOut, true)
  window.addEventListener('blur', cancelAllInput)
  window.addEventListener('pagehide', cancelAllInput)
  document.addEventListener('visibilitychange', cancelAllInput)
  reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange)

  return () => {
    if (supportsPointerEvents) {
      root.removeEventListener('pointerdown', onPointerDown, true)
      root.removeEventListener('lostpointercapture', onLostPointerCapture, true)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', finishPointer, true)
      window.removeEventListener('pointercancel', finishPointer, true)
      window.removeEventListener('pointerout', onPointerOut, true)
    } else {
      root.removeEventListener('mousedown', onMouseDown, true)
      window.removeEventListener('mousemove', onMouseMove, true)
      window.removeEventListener('mouseup', finishMouse, true)
      window.removeEventListener('mouseout', onMouseOut, true)
    }
    root.removeEventListener('keydown', onKeyDown, true)
    root.removeEventListener('keyup', finishKeyboard, true)
    root.removeEventListener('blur', finishKeyboard, true)
    root.removeEventListener('focusin', onFocusIn, true)
    root.removeEventListener('focusout', onFocusOut, true)
    window.removeEventListener('blur', cancelAllInput)
    window.removeEventListener('pagehide', cancelAllInput)
    document.removeEventListener('visibilitychange', cancelAllInput)
    reducedMotionQuery.removeEventListener('change', handleMotionPreferenceChange)
    detachedStateObserver.disconnect()
    if (pruneFrame) window.cancelAnimationFrame(pruneFrame)
    pruneFrame = 0

    const pointerEntries = Array.from(pointerPresses.entries())
    pointerPresses.clear()
    releasePointerCaptures(pointerEntries)
    keyboardPresses.clear()
    for (const [element, state] of pressStates) restorePressState(element, state)
    for (const [element, state] of hoverStates) restoreHoverState(element, state)
    for (const [element, state] of formFocusStates) restoreFormFocusState(element, state)
  }
}

const menuMotions = new WeakMap()

function captureMenuBaseline(element) {
  return {
    opacity: element.style.opacity,
    scale: element.style.scale,
    transformOrigin: element.style.transformOrigin,
    backdropFilter: element.style.backdropFilter,
    webkitBackdropFilter: element.style.webkitBackdropFilter,
    willChange: element.style.willChange,
    links: new Map(
      Array.from(element.querySelectorAll('a'), (link) => [
        link,
        {
          opacity: link.style.opacity,
          translate: link.style.translate,
          scale: link.style.scale,
          willChange: link.style.willChange,
        },
      ]),
    ),
  }
}

function resolveMenuOrigin(element, trigger) {
  if (!trigger?.isConnected) return 'calc(100% - 38px) 34px'
  const triggerBounds = trigger.getBoundingClientRect()
  const x = triggerBounds.left + triggerBounds.width / 2 - element.offsetLeft
  const y = triggerBounds.top + triggerBounds.height / 2 - element.offsetTop
  return `${x}px ${y}px`
}

function renderMenu(element, state, progress) {
  const reduced = state.gentle
  const links = Array.from(element.querySelectorAll('a'))
  element.style.opacity = String(clamp(progress, 0, 1))
  element.style.transformOrigin = state.origin
  element.style.willChange = reduced
    ? 'opacity'
    : `opacity, scale${state.materialEnabled ? ', backdrop-filter' : ''}`

  if (reduced) {
    element.style.scale = state.baseline.scale
  } else {
    element.style.scale = String(0.92 + 0.08 * progress)
  }

  if (!state.materialEnabled) {
    element.style.backdropFilter = state.baseline.backdropFilter
    element.style.webkitBackdropFilter = state.baseline.webkitBackdropFilter
  } else {
    const blur = 4 + 14 * progress
    element.style.backdropFilter = `blur(${blur}px) saturate(135%)`
    element.style.webkitBackdropFilter = `blur(${blur}px) saturate(135%)`
  }

  links.forEach((link, index) => {
    const delay = index * 0.055
    const local = clamp((progress - delay) / Math.max(1 - delay, 0.01), 0, 1)
    link.style.opacity = String(local)
    link.style.willChange = reduced ? 'opacity' : 'opacity, translate, scale'
    if (reduced) {
      const baseline = state.baseline.links.get(link)
      link.style.translate = baseline?.translate ?? ''
      link.style.scale = baseline?.scale ?? ''
    } else {
      link.style.translate = `0 ${(1 - local) * 28}px`
      link.style.scale = String(0.975 + 0.025 * local)
    }
  })
}

function restoreMenuStyles(element, state) {
  const baseline = state.baseline
  element.style.opacity = baseline.opacity
  element.style.scale = baseline.scale
  element.style.transformOrigin = baseline.transformOrigin
  element.style.backdropFilter = baseline.backdropFilter
  element.style.webkitBackdropFilter = baseline.webkitBackdropFilter
  element.style.willChange = baseline.willChange
  for (const [link, linkBaseline] of baseline.links) {
    link.style.opacity = linkBaseline.opacity
    link.style.translate = linkBaseline.translate
    link.style.scale = linkBaseline.scale
    link.style.willChange = linkBaseline.willChange
  }
}

function disposeMenuMotion(element, state) {
  restoreMenuStyles(element, state)
  state.controller.stop()
  reducedMotionQuery.removeEventListener('change', state.handlePreferenceChange)
  reducedTransparencyQuery.removeEventListener('change', state.handlePreferenceChange)
  window.removeEventListener('resize', state.handleResize)
  menuMotions.delete(element)
}

function ensureMenuMotion(element, initialProgress, trigger = null) {
  const existing = menuMotions.get(element)
  if (existing) {
    if (trigger) {
      existing.trigger = trigger
      existing.origin = resolveMenuOrigin(element, trigger)
    }
    return existing
  }

  const state = {
    baseline: captureMenuBaseline(element),
    trigger,
    origin: resolveMenuOrigin(element, trigger),
    gentle: reduceMotion(),
    materialEnabled: !reduceMotion() && !reduceTransparency(),
    targetProgress: initialProgress,
    done: null,
    controller: null,
    handlePreferenceChange: null,
    handleResize: null,
  }
  state.controller = createSpring(
    { progress: initialProgress },
    ({ progress }) => renderMenu(element, state, progress),
  )
  state.handlePreferenceChange = () => {
    if (reduceMotion()) {
      state.gentle = true
      state.materialEnabled = false
    }
    if (reduceTransparency()) state.materialEnabled = false
    renderMenu(element, state, state.controller.values().progress)
    if (reduceMotion()) {
      retargetMenuMotion(element, state, state.targetProgress, state.done)
    }
  }
  state.handleResize = () => {
    state.origin = resolveMenuOrigin(element, state.trigger)
    renderMenu(element, state, state.controller.values().progress)
  }
  reducedMotionQuery.addEventListener('change', state.handlePreferenceChange)
  reducedTransparencyQuery.addEventListener('change', state.handlePreferenceChange)
  window.addEventListener('resize', state.handleResize, { passive: true })
  menuMotions.set(element, state)
  return state
}

function retargetMenuMotion(element, state, targetProgress, done = null) {
  state.targetProgress = targetProgress
  state.done = done
  state.controller.retarget(
    { progress: targetProgress },
    {
      response: state.gentle
        ? (targetProgress ? 0.18 : 0.16)
        : (targetProgress ? 0.38 : 0.34),
      damping: 1,
      restDelta: 0.001,
      restSpeed: 0.015,
      onRest: () => {
        const callback = state.done
        disposeMenuMotion(element, state)
        callback?.()
      },
    },
  )
}

export function prepareMobileMenu(element, trigger = null) {
  if (!menuMotions.has(element)) ensureMenuMotion(element, 0, trigger)
}

export function enterMobileMenu(element, trigger = null, done = null) {
  const state = ensureMenuMotion(element, 0, trigger)
  retargetMenuMotion(element, state, 1, done)
}

export function leaveMobileMenu(element, done = null) {
  const state = ensureMenuMotion(element, 1)
  retargetMenuMotion(element, state, 0, done)
}

export function stopMobileMenuMotion(element) {
  const state = menuMotions.get(element)
  if (!state) return
  disposeMenuMotion(element, state)
}

const menuToggleMotions = new WeakMap()

function restoreMenuToggleState(element, state) {
  state.controller.stop()
  reducedMotionQuery.removeEventListener('change', state.handleMotionPreferenceChange)
  if (state.inlineProgress) {
    element.style.setProperty('--menu-icon-progress', state.inlineProgress)
  } else {
    element.style.removeProperty('--menu-icon-progress')
  }
  menuToggleMotions.delete(element)
}

export function setMobileMenuToggleOpen(element, open) {
  if (!element) return
  let state = menuToggleMotions.get(element)
  if (!state) {
    if (!open) return
    state = {
      inlineProgress: element.style.getPropertyValue('--menu-icon-progress'),
      targetOpen: false,
      controller: null,
      handleMotionPreferenceChange: null,
    }
    state.controller = createSpring(
      { progress: 0 },
      ({ progress }) => {
        element.style.setProperty(
          '--menu-icon-progress',
          String(clamp(progress, -0.025, 1.025)),
        )
      },
    )
    state.handleMotionPreferenceChange = () => {
      setMobileMenuToggleOpen(element, state.targetOpen)
    }
    reducedMotionQuery.addEventListener('change', state.handleMotionPreferenceChange)
    menuToggleMotions.set(element, state)
  }

  state.targetOpen = open
  if (reduceMotion()) {
    state.controller.snap({ progress: open ? 1 : 0 })
    if (!open) restoreMenuToggleState(element, state)
    return
  }

  state.controller.retarget(
    { progress: open ? 1 : 0 },
    {
      response: 0.24,
      damping: 1,
      restDelta: 0.001,
      restSpeed: 0.015,
      onRest: () => {
        if (!open) restoreMenuToggleState(element, state)
      },
    },
  )
}

export function stopMobileMenuToggleMotion(element) {
  const state = element ? menuToggleMotions.get(element) : null
  if (!state) return
  restoreMenuToggleState(element, state)
}

const headerMotions = new WeakMap()

function restoreHeaderState(element, state) {
  state.controller.stop()
  reducedMotionQuery.removeEventListener('change', state.handleMotionPreferenceChange)
  element.style.translate = state.inlineTranslate
  element.style.willChange = state.inlineWillChange
  headerMotions.delete(element)
}

export function setFluidHeaderHidden(element, hidden) {
  if (!element) return
  let state = headerMotions.get(element)
  if (!state) {
    if (!hidden) return
    state = {
      inlineTranslate: element.style.translate,
      inlineWillChange: element.style.willChange,
      targetHidden: false,
      controller: null,
      handleMotionPreferenceChange: null,
    }
    state.controller = createSpring(
      { progress: 0 },
      ({ progress }) => {
        const physicalProgress = clamp(progress, -0.035, 1.035)
        element.style.translate = `0 ${-110 * physicalProgress}%`
        element.style.willChange = 'translate'
      },
    )
    state.handleMotionPreferenceChange = () => {
      setFluidHeaderHidden(element, state.targetHidden)
    }
    reducedMotionQuery.addEventListener('change', state.handleMotionPreferenceChange)
    headerMotions.set(element, state)
  }

  const reversing = state.targetHidden !== hidden
  state.targetHidden = hidden

  if (reduceMotion()) {
    state.controller.snap({ progress: hidden ? 1 : 0 })
    if (hidden) element.style.willChange = state.inlineWillChange
    else restoreHeaderState(element, state)
    return
  }

  const currentVelocity = Math.abs(state.controller.velocities().progress || 0)
  state.controller.retarget(
    { progress: hidden ? 1 : 0 },
    {
      response: 0.36,
      damping: reversing && currentVelocity > 0.2 ? 0.92 : 1,
      restDelta: 0.001,
      restSpeed: 0.02,
      onRest: () => {
        if (hidden) element.style.willChange = state.inlineWillChange
        else restoreHeaderState(element, state)
      },
    },
  )
}

export function stopFluidHeaderMotion(element) {
  const state = element ? headerMotions.get(element) : null
  if (!state) return
  restoreHeaderState(element, state)
}

const routeMotions = new Map()
let inheritedRouteVelocity = 0

function captureRouteBaseline(element) {
  const computed = window.getComputedStyle(element)
  return {
    opacity: element.style.opacity,
    translate: element.style.translate,
    scale: element.style.scale,
    willChange: element.style.willChange,
    computedOpacity: parseNumber(computed.opacity, 1),
    hasSpatialBaseline: (
      (computed.translate && computed.translate !== 'none')
      || (computed.scale && computed.scale !== 'none')
    ),
  }
}

function renderRoute(element, state, progress) {
  const clamped = clamp(progress, 0, 1.08)
  const reduced = state.gentle
  const startOpacity = reduced ? 0.9 : ROUTE_START_OPACITY
  element.style.opacity = String(
    state.baseline.computedOpacity * (
      startOpacity + (1 - startOpacity) * clamp(clamped, 0, 1)
    ),
  )
  element.style.willChange = reduced || state.baseline.hasSpatialBaseline
    ? 'opacity'
    : 'opacity, translate, scale'
  if (reduced || state.baseline.hasSpatialBaseline) {
    element.style.translate = state.baseline.translate
    element.style.scale = state.baseline.scale
  } else {
    element.style.translate = `0 ${(1 - clamped) * ROUTE_START_OFFSET}px`
    element.style.scale = String(
      ROUTE_START_SCALE + (1 - ROUTE_START_SCALE) * clamped,
    )
  }
}

function restoreRouteStyles(element, state) {
  element.style.opacity = state.baseline.opacity
  element.style.translate = state.baseline.translate
  element.style.scale = state.baseline.scale
  element.style.willChange = state.baseline.willChange
}

function prepareRouteEnter(element) {
  const state = {
    baseline: captureRouteBaseline(element),
    gentle: reduceMotion(),
    controller: null,
    handleMotionPreferenceChange: null,
  }
  state.controller = createSpring(
    { progress: 0 },
    ({ progress }) => renderRoute(element, state, progress),
  )
  state.handleMotionPreferenceChange = () => {
    if (reduceMotion()) state.gentle = true
    renderRoute(element, state, state.controller.values().progress)
    if (reduceMotion()) retargetRouteEnter(element, state)
  }
  reducedMotionQuery.addEventListener('change', state.handleMotionPreferenceChange)
  routeMotions.set(element, state)
  return state
}

function stopRouteState(element, state, inheritVelocity = true) {
  if (inheritVelocity) {
    inheritedRouteVelocity = Math.max(
      inheritedRouteVelocity,
      state.controller.velocities().progress || 0,
    )
  }
  state.controller.stop()
  reducedMotionQuery.removeEventListener('change', state.handleMotionPreferenceChange)
  restoreRouteStyles(element, state)
  routeMotions.delete(element)
}

function retargetRouteEnter(element, state, velocity = null) {
  state.controller.retarget(
    { progress: 1 },
    {
      response: state.gentle ? 0.2 : 0.38,
      damping: 1,
      velocity: velocity == null ? undefined : { progress: velocity },
      restDelta: 0.001,
      restSpeed: 0.015,
      onRest: () => stopRouteState(element, state, false),
    },
  )
}

export function animateRouteChildren(container) {
  if (!container) return

  for (const [element, state] of routeMotions) {
    stopRouteState(element, state)
  }

  const children = Array.from(container.children)
  const inherited = reduceMotion() ? 0 : clamp(inheritedRouteVelocity, 0, 4)
  inheritedRouteVelocity = 0
  if (!children.length) return

  children.forEach((element) => {
    const state = prepareRouteEnter(element)
    retargetRouteEnter(element, state, inherited)
  })
}

export function stopRouteChildrenMotion() {
  for (const [element, state] of routeMotions) {
    stopRouteState(element, state, false)
  }
  inheritedRouteVelocity = 0
}
