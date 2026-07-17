const INTERACTIVE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
].join(', ')

const HIT_SLOP = 10
const CONTROL_PRESS_SCALE = 0.97
const SURFACE_PRESS_SCALE = 0.985
const MOTION_SURFACE_SELECTOR = '.card, .spotlight-card'
const activeControllers = new Set()

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const reduceTransparency = () => window.matchMedia('(prefers-reduced-transparency: reduce)').matches

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function parseScale(value) {
  if (!value || value === 'none') return 1
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 1
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
    activeControllers.delete(api)
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
  activeControllers.add(api)
  render(values())
  return api
}

function isLargeSurface(bounds) {
  const area = bounds.width * bounds.height
  return (
    bounds.width >= 180
    && bounds.height >= 76
    && bounds.width <= 560
    && bounds.height <= 360
    && area <= 160000
  )
}

function getInteractiveTarget(root, start) {
  if (!(start instanceof Element)) return null

  const control = start.closest(INTERACTIVE_SELECTOR)
  if (!control || !root.documentElement.contains(control)) return null

  const card = control.closest(MOTION_SURFACE_SELECTOR)
  const cardBounds = card?.getBoundingClientRect()
  const element = card && isLargeSurface(cardBounds) ? card : control

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

  return { element, control, style, bounds }
}

function getHoverTarget(root, start) {
  if (!(start instanceof Element)) return null

  const card = start.closest(MOTION_SURFACE_SELECTOR)
  if (card && root.documentElement.contains(card)) {
    const style = window.getComputedStyle(card)
    const bounds = card.getBoundingClientRect()
    if (
      isLargeSurface(bounds)
      && style.display !== 'none'
      && style.pointerEvents !== 'none'
    ) {
      return { element: card, control: null, style, bounds }
    }
  }

  return getInteractiveTarget(root, start)
}

export function installInteractionMotion(root = document) {
  const pointerPresses = new Map()
  const keyboardPresses = new Set()
  const pressStates = new Map()
  const hoverStates = new Map()
  let hoveredSurface = null

  function hasActivePress(element) {
    if (keyboardPresses.has(element)) return true
    for (const press of pointerPresses.values()) {
      if (press.element === element && press.inside) return true
    }
    return false
  }

  function restorePressState(element, state) {
    state.controller.stop()
    element.style.scale = state.inlineScale
    element.style.opacity = state.inlineOpacity
    element.style.willChange = state.inlineWillChange
    pressStates.delete(element)
  }

  function ensurePressState(element, style, bounds) {
    const existing = pressStates.get(element)
    if (existing) return existing

    const useOpacity = reduceMotion() || style.display === 'inline'
    const baseline = useOpacity
      ? Number.parseFloat(style.opacity) || 1
      : parseScale(style.scale)
    const state = {
      baseline,
      useOpacity,
      pressedTarget: useOpacity
        ? baseline * 0.76
        : baseline * (isLargeSurface(bounds) ? SURFACE_PRESS_SCALE : CONTROL_PRESS_SCALE),
      inlineScale: element.style.scale,
      inlineOpacity: element.style.opacity,
      inlineWillChange: element.style.willChange,
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
    const target = knownTarget ?? getInteractiveTarget(root, element)
    if (!target) return

    const state = ensurePressState(element, target.style, target.bounds)
    state.controller.retarget(
      { value: pressed ? state.pressedTarget : state.baseline },
      {
        response: pressed ? 0.18 : 0.34,
        damping: 1,
        restDelta: 0.0002,
        restSpeed: 0.004,
        onRest: () => {
          if (!pressed && !hasActivePress(element)) restorePressState(element, state)
        },
      },
    )
  }

  function restoreHoverState(element, state) {
    state.controller.stop()
    element.style.translate = state.inlineTranslate
    element.style.willChange = state.inlineWillChange
    hoverStates.delete(element)
    if (hoveredSurface === element) hoveredSurface = null
  }

  function ensureHoverState(element) {
    const existing = hoverStates.get(element)
    if (existing) return existing

    const state = {
      inlineTranslate: element.style.translate,
      inlineWillChange: element.style.willChange,
      lastTarget: { x: 0, y: 0, time: window.performance.now() },
      releaseVelocity: { x: 0, y: 0 },
      controller: null,
    }
    element.style.willChange = 'translate'
    state.controller = createSpring(
      { x: 0, y: 0 },
      ({ x, y }) => {
        if (!element.isConnected) {
          restoreHoverState(element, state)
          return
        }
        element.style.translate = `${x}px ${y}px`
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

    const speed = Math.hypot(state.releaseVelocity.x, state.releaseVelocity.y)
    state.controller.retarget(
      { x: 0, y: 0 },
      {
        response: 0.36,
        damping: speed > 5 ? 0.86 : 1,
        velocity: speed > 5 ? state.releaseVelocity : undefined,
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

    if (!target || !isLargeSurface(target.bounds) || target.style.display === 'inline') {
      releaseHoveredSurface()
      return
    }

    const { element, bounds } = target
    if (hoveredSurface && hoveredSurface !== element) releaseHoveredSurface()
    hoveredSurface = element

    const state = ensureHoverState(element)
    const x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 6, -3, 3)
    const y = clamp(-2 + ((event.clientY - bounds.top) / bounds.height - 0.5) * 3, -3.5, -0.5)
    const now = window.performance.now()
    const elapsed = Math.max((now - state.lastTarget.time) / 1000, 1 / 120)
    state.releaseVelocity = {
      x: clamp((x - state.lastTarget.x) / elapsed, -24, 24),
      y: clamp((y - state.lastTarget.y) / elapsed, -24, 24),
    }
    state.lastTarget = { x, y, time: now }
    state.controller.retarget(
      { x, y },
      { response: 0.28, damping: 1, restDelta: 0.02, restSpeed: 0.08 },
    )
  }

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return

    const target = getInteractiveTarget(root, event.target)
    if (!target) return

    pointerPresses.set(event.pointerId, {
      element: target.element,
      bounds: target.bounds,
      inside: true,
    })
    setPressed(target.element, true, target)
  }

  function onPointerMove(event) {
    const press = pointerPresses.get(event.pointerId)
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
        setPressed(element, inside || hasActivePress(element))
      }
      return
    }

    updateSurfaceHover(event, getHoverTarget(root, event.target))
  }

  function finishPointer(event) {
    const press = pointerPresses.get(event.pointerId)
    if (!press) return

    pointerPresses.delete(event.pointerId)
    setPressed(press.element, hasActivePress(press.element))
  }

  function onPointerOut(event) {
    if (event.pointerType === 'mouse' && !event.relatedTarget) releaseHoveredSurface()
  }

  function onKeyDown(event) {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return

    const target = getInteractiveTarget(root, event.target)
    if (!target || (event.key === ' ' && target.control.matches('a[href]'))) return

    keyboardPresses.add(target.element)
    setPressed(target.element, true, target)
  }

  function finishKeyboard(event) {
    const target = getInteractiveTarget(root, event.target)
    if (!target || !keyboardPresses.delete(target.element)) return
    setPressed(target.element, hasActivePress(target.element), target)
  }

  function cancelAllInput() {
    const pressedElements = new Set(
      Array.from(pointerPresses.values(), ({ element }) => element),
    )
    pointerPresses.clear()
    for (const element of keyboardPresses) pressedElements.add(element)
    keyboardPresses.clear()
    for (const element of pressedElements) setPressed(element, false)
    releaseHoveredSurface()
  }

  root.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pointermove', onPointerMove, true)
  window.addEventListener('pointerup', finishPointer, true)
  window.addEventListener('pointercancel', finishPointer, true)
  window.addEventListener('pointerout', onPointerOut, true)
  root.addEventListener('keydown', onKeyDown, true)
  root.addEventListener('keyup', finishKeyboard, true)
  root.addEventListener('blur', finishKeyboard, true)
  window.addEventListener('blur', cancelAllInput)

  return () => {
    root.removeEventListener('pointerdown', onPointerDown, true)
    window.removeEventListener('pointermove', onPointerMove, true)
    window.removeEventListener('pointerup', finishPointer, true)
    window.removeEventListener('pointercancel', finishPointer, true)
    window.removeEventListener('pointerout', onPointerOut, true)
    root.removeEventListener('keydown', onKeyDown, true)
    root.removeEventListener('keyup', finishKeyboard, true)
    root.removeEventListener('blur', finishKeyboard, true)
    window.removeEventListener('blur', cancelAllInput)

    for (const [element, state] of pressStates) restorePressState(element, state)
    for (const [element, state] of hoverStates) restoreHoverState(element, state)
    pointerPresses.clear()
    keyboardPresses.clear()
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
  }
}

function renderMenu(element, progress) {
  const reduced = reduceMotion()
  const links = Array.from(element.querySelectorAll('a'))
  element.style.opacity = String(clamp(progress, 0, 1))
  element.style.transformOrigin = 'calc(100% - 38px) 34px'
  element.style.willChange = reduced ? 'opacity' : 'opacity, scale, backdrop-filter'

  if (!reduced) {
    element.style.scale = String(0.94 + 0.06 * progress)
    if (!reduceTransparency()) {
      const blur = 6 + 12 * progress
      element.style.backdropFilter = `blur(${blur}px) saturate(135%)`
      element.style.webkitBackdropFilter = `blur(${blur}px) saturate(135%)`
    }
  }

  links.forEach((link, index) => {
    const delay = index * 0.055
    const local = clamp((progress - delay) / Math.max(1 - delay, 0.01), 0, 1)
    link.style.opacity = String(local)
    link.style.willChange = reduced ? 'opacity' : 'opacity, translate, scale'
    if (!reduced) {
      link.style.translate = `0 ${(1 - local) * 22}px`
      link.style.scale = String(0.98 + 0.02 * local)
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
  for (const link of element.querySelectorAll('a')) {
    link.style.opacity = ''
    link.style.translate = ''
    link.style.scale = ''
    link.style.willChange = ''
  }
}

function ensureMenuMotion(element, initialProgress) {
  const existing = menuMotions.get(element)
  if (existing) return existing

  const state = {
    baseline: captureMenuBaseline(element),
    controller: null,
  }
  state.controller = createSpring(
    { progress: initialProgress },
    ({ progress }) => renderMenu(element, progress),
  )
  menuMotions.set(element, state)
  return state
}

export function prepareMobileMenu(element) {
  if (!menuMotions.has(element)) ensureMenuMotion(element, 0)
}

export function enterMobileMenu(element, done = null) {
  const state = ensureMenuMotion(element, 0)
  state.controller.retarget(
    { progress: 1 },
    {
      response: reduceMotion() ? 0.18 : 0.34,
      damping: 1,
      restDelta: 0.001,
      restSpeed: 0.015,
      onRest: () => {
        restoreMenuStyles(element, state)
        state.controller.stop()
        menuMotions.delete(element)
        done?.()
      },
    },
  )
}

export function leaveMobileMenu(element, done = null) {
  const state = ensureMenuMotion(element, 1)
  state.controller.retarget(
    { progress: 0 },
    {
      response: reduceMotion() ? 0.16 : 0.3,
      damping: 1,
      restDelta: 0.001,
      restSpeed: 0.015,
      onRest: () => {
        restoreMenuStyles(element, state)
        state.controller.stop()
        menuMotions.delete(element)
        done?.()
      },
    },
  )
}

export function stopMobileMenuMotion(element) {
  const state = menuMotions.get(element)
  if (!state) return
  restoreMenuStyles(element, state)
  state.controller.stop()
  menuMotions.delete(element)
}

const headerMotions = new WeakMap()

export function setFluidHeaderHidden(element, hidden) {
  if (!element) return
  let state = headerMotions.get(element)
  if (!state) {
    state = {
      inlineTranslate: element.style.translate,
      inlineWillChange: element.style.willChange,
      controller: null,
    }
    state.controller = createSpring(
      { progress: hidden ? 1 : 0 },
      ({ progress }) => {
        element.style.translate = `0 ${-110 * progress}%`
        element.style.willChange = 'translate'
      },
    )
    headerMotions.set(element, state)
  }

  if (reduceMotion()) {
    state.controller.snap({ progress: hidden ? 1 : 0 })
    return
  }

  state.controller.retarget(
    { progress: hidden ? 1 : 0 },
    { response: 0.34, damping: 1, restDelta: 0.001, restSpeed: 0.02 },
  )
}

export function stopFluidHeaderMotion(element) {
  const state = element ? headerMotions.get(element) : null
  if (!state) return
  state.controller.stop()
  element.style.translate = state.inlineTranslate
  element.style.willChange = state.inlineWillChange
  headerMotions.delete(element)
}

const routeMotions = new Map()
let inheritedRouteVelocity = 0

function captureRouteBaseline(element) {
  return {
    opacity: element.style.opacity,
    translate: element.style.translate,
    scale: element.style.scale,
    willChange: element.style.willChange,
    computedOpacity: Number.parseFloat(window.getComputedStyle(element).opacity) || 1,
  }
}

function renderRoute(element, state, progress) {
  const clamped = clamp(progress, 0, 1.08)
  const reduced = reduceMotion()
  element.style.opacity = String(
    state.baseline.computedOpacity * (0.86 + 0.14 * clamp(clamped, 0, 1)),
  )
  element.style.willChange = reduced ? 'opacity' : 'opacity, translate, scale'
  if (!reduced) {
    element.style.translate = `0 ${(1 - clamped) * 12}px`
    element.style.scale = String(0.992 + 0.008 * clamped)
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
    controller: null,
  }
  state.controller = createSpring(
    { progress: 0 },
    ({ progress }) => renderRoute(element, state, progress),
  )
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
  restoreRouteStyles(element, state)
  routeMotions.delete(element)
}

export function animateRouteChildren(container) {
  if (!container) return

  for (const [element, state] of routeMotions) {
    stopRouteState(element, state)
  }

  const children = Array.from(container.children)
  if (!children.length) return

  const inherited = reduceMotion() ? 0 : clamp(inheritedRouteVelocity, 0, 4)
  inheritedRouteVelocity = 0

  children.forEach((element) => {
    const state = prepareRouteEnter(element)
    state.controller.retarget(
      { progress: 1 },
      {
        response: reduceMotion() ? 0.2 : 0.32,
        damping: 1,
        velocity: { progress: inherited },
        restDelta: 0.001,
        restSpeed: 0.015,
        onRest: () => stopRouteState(element, state, false),
      },
    )
  })
}

export function stopRouteChildrenMotion() {
  for (const [element, state] of routeMotions) {
    stopRouteState(element, state, false)
  }
  inheritedRouteVelocity = 0
}
