const INTERACTIVE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  '[role="button"]:not([aria-disabled="true"])',
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
].join(', ')

const PRESS_SCALE = '0.985'
const PRESS_DURATION = 90
const RELEASE_DURATION = 240
const HIT_SLOP = 10

export function installInteractionMotion(root = document) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointerPresses = new Map()
  const keyboardPresses = new Set()
  const baselines = new WeakMap()
  const animations = new WeakMap()

  function getInteractiveTarget(start) {
    if (!(start instanceof Element)) return null

    const element = start.closest(INTERACTIVE_SELECTOR)
    if (!element || !root.documentElement.contains(element)) return null

    const style = window.getComputedStyle(element)
    const bounds = element.getBoundingClientRect()

    if (
      style.display === 'inline'
      || style.pointerEvents === 'none'
      || bounds.width === 0
      || bounds.height === 0
    ) {
      return null
    }

    return element
  }

  function hasActivePress(element) {
    if (keyboardPresses.has(element)) return true

    for (const press of pointerPresses.values()) {
      if (press.element === element && press.inside) return true
    }

    return false
  }

  function animateState(element, pressed) {
    let baseline = baselines.get(element)
    const computed = window.getComputedStyle(element)

    if (!baseline) {
      baseline = {
        opacity: computed.opacity,
        scale: computed.scale === 'none' ? '1' : computed.scale,
      }
      baselines.set(element, baseline)
    }

    const previous = animations.get(element)
    const current = window.getComputedStyle(element)
    previous?.cancel()

    const reduced = reduceMotion.matches
    const keyframes = reduced
      ? [
          { opacity: current.opacity },
          { opacity: pressed ? String(Number(baseline.opacity) * 0.82) : baseline.opacity },
        ]
      : [
          { scale: current.scale === 'none' ? baseline.scale : current.scale },
          { scale: pressed ? PRESS_SCALE : baseline.scale },
        ]

    const animation = element.animate(keyframes, {
      duration: pressed ? PRESS_DURATION : (reduced ? 120 : RELEASE_DURATION),
      easing: pressed
        ? 'cubic-bezier(0.32, 0.72, 0, 1)'
        : 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    })

    animations.set(element, animation)

    if (!pressed) {
      animation.finished
        .catch(() => {})
        .finally(() => {
          if (animations.get(element) !== animation || hasActivePress(element)) return
          animation.cancel()
          animations.delete(element)
          baselines.delete(element)
        })
    }
  }

  function onPointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return

    const element = getInteractiveTarget(event.target)
    if (!element) return

    const bounds = element.getBoundingClientRect()
    pointerPresses.set(event.pointerId, { element, bounds, inside: true })
    animateState(element, true)
  }

  function onPointerMove(event) {
    const press = pointerPresses.get(event.pointerId)
    if (!press) return

    const { bounds, element } = press
    const inside = (
      event.clientX >= bounds.left - HIT_SLOP
      && event.clientX <= bounds.right + HIT_SLOP
      && event.clientY >= bounds.top - HIT_SLOP
      && event.clientY <= bounds.bottom + HIT_SLOP
    )

    if (inside === press.inside) return
    press.inside = inside
    animateState(element, inside || hasActivePress(element))
  }

  function finishPointer(event) {
    const press = pointerPresses.get(event.pointerId)
    if (!press) return

    pointerPresses.delete(event.pointerId)
    animateState(press.element, hasActivePress(press.element))
  }

  function onKeyDown(event) {
    if (event.repeat || !['Enter', ' '].includes(event.key)) return

    const element = getInteractiveTarget(event.target)
    if (!element || (event.key === ' ' && element.matches('a[href]'))) return

    keyboardPresses.add(element)
    animateState(element, true)
  }

  function finishKeyboard(event) {
    const element = getInteractiveTarget(event.target)
    if (!element || !keyboardPresses.delete(element)) return
    animateState(element, hasActivePress(element))
  }

  root.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pointermove', onPointerMove, true)
  window.addEventListener('pointerup', finishPointer, true)
  window.addEventListener('pointercancel', finishPointer, true)
  root.addEventListener('keydown', onKeyDown, true)
  root.addEventListener('keyup', finishKeyboard, true)
  root.addEventListener('blur', finishKeyboard, true)

  return () => {
    root.removeEventListener('pointerdown', onPointerDown, true)
    window.removeEventListener('pointermove', onPointerMove, true)
    window.removeEventListener('pointerup', finishPointer, true)
    window.removeEventListener('pointercancel', finishPointer, true)
    root.removeEventListener('keydown', onKeyDown, true)
    root.removeEventListener('keyup', finishKeyboard, true)
    root.removeEventListener('blur', finishKeyboard, true)

    for (const { element } of pointerPresses.values()) {
      animations.get(element)?.cancel()
    }
    for (const element of keyboardPresses) {
      animations.get(element)?.cancel()
    }
  }
}
