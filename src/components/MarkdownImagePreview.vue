<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  root: { type: Object, default: null },
  contentKey: { default: '' },
  imageSelector: { type: String, default: 'img' },
})

const dialog = ref(null)
const previewImage = ref(null)
const stage = ref(null)
const images = ref([])
const index = ref(0)
const opened = ref(false)
const loadState = ref('loading')
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const dragging = ref(false)
const retry = ref(0)
const selected = computed(() => images.value[index.value])
const imageStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`,
}))
let detach = null
let trigger = null
let bodySnapshot = null
let lastTap = null
let gesture = null
let pinch = null
let suppressStageClick = false
let lastTouchTime = 0
const pointers = new Map()

function resetView() {
  scale.value = 1
  offset.value = { x: 0, y: 0 }
  pointers.clear()
  gesture = null
  pinch = null
  dragging.value = false
  lastTap = null
  suppressStageClick = false
}

function constrainOffset(x, y, zoom = scale.value) {
  const image = previewImage.value
  const viewport = stage.value
  if (!image || !viewport) return { x: 0, y: 0 }
  const maxX = Math.max(0, (image.clientWidth * zoom - viewport.clientWidth) / 2)
  const maxY = Math.max(0, (image.clientHeight * zoom - viewport.clientHeight) / 2)
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  }
}

function setZoom(value, point = { x: 0, y: 0 }) {
  if (loadState.value !== 'ready') return
  const next = Math.max(1, Math.min(4, value))
  const factor = next / scale.value
  offset.value = constrainOffset(
    point.x + (offset.value.x - point.x) * factor,
    point.y + (offset.value.y - point.y) * factor,
    next,
  )
  scale.value = next
}

function localPoint(event) {
  const rect = stage.value.getBoundingClientRect()
  return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }
}

function toggleZoom(event) {
  setZoom(scale.value > 1 ? 1 : 2, event ? localPoint(event) : undefined)
}

function onDoubleClick(event) {
  // Touch double-taps are handled on pointerup; browsers may also synthesize dblclick.
  if (Date.now() - lastTouchTime < 500) return
  toggleZoom(event)
}

function lockPage() {
  // Header owns overflow. A fixed body keeps its independent menu lock intact.
  const body = document.body
  bodySnapshot = {
    x: window.scrollX,
    y: window.scrollY,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    width: body.style.width,
  }
  const width = body.getBoundingClientRect().width
  body.style.position = 'fixed'
  body.style.top = `-${bodySnapshot.y}px`
  body.style.left = `-${bodySnapshot.x}px`
  body.style.width = `${width}px`
}

function unlockPage() {
  if (!bodySnapshot) return
  const snapshot = bodySnapshot
  bodySnapshot = null
  Object.assign(document.body.style, {
    position: snapshot.position,
    top: snapshot.top,
    left: snapshot.left,
    width: snapshot.width,
  })
  window.scrollTo({ left: snapshot.x, top: snapshot.y, behavior: 'instant' })
}

function close(restoreFocus = true) {
  opened.value = false
  if (dialog.value?.open) dialog.value.close()
  unlockPage()
  resetView()
  window.removeEventListener('resize', resetView)
  const previousTrigger = trigger
  trigger = null
  if (restoreFocus && previousTrigger?.isConnected) previousTrigger.focus({ preventScroll: true })
}

async function open(image) {
  const candidates = Array.from(props.root.querySelectorAll('[data-md-image-preview]'))
  images.value = candidates.map(element => {
    const caption = element.closest('figure')?.querySelector('figcaption')?.textContent.trim()
    const link = element.closest('a[href]')
    return {
      element,
      src: element.currentSrc || element.src,
      alt: element.alt || '',
      caption: caption || element.title || element.alt || '正文图片',
      href: link && /^https?:/i.test(link.href) ? link.href : '',
    }
  })
  index.value = candidates.indexOf(image)
  if (index.value < 0) return
  trigger = image
  resetView()
  loadState.value = 'loading'
  opened.value = true
  lockPage()
  await nextTick()
  if (!opened.value || !dialog.value) return
  dialog.value.showModal()
  window.addEventListener('resize', resetView)
  checkImage()
}

function checkImage() {
  const image = previewImage.value
  if (image?.complete) loadState.value = image.naturalWidth ? 'ready' : 'error'
}

async function move(direction) {
  if (images.value.length < 2) return
  index.value = (index.value + direction + images.value.length) % images.value.length
  resetView()
  loadState.value = 'loading'
  await nextTick()
  checkImage()
}

function onKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key === 'Tab') {
    const controls = Array.from(dialog.value.querySelectorAll('button:not([disabled]), a[href]'))
      .filter(element => element.getClientRects().length)
    const first = controls[0]
    const last = controls.at(-1)
    const active = document.activeElement
    if (event.shiftKey ? active === first || !controls.includes(active) : active === last || !controls.includes(active)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first)?.focus()
    }
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    move(event.key === 'ArrowLeft' ? -1 : 1)
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    setZoom(scale.value + 0.5)
  } else if (event.key === '-') {
    event.preventDefault()
    setZoom(scale.value - 0.5)
  } else if (event.key === '0') {
    event.preventDefault()
    setZoom(1)
  }
}

function onPointerDown(event) {
  if (event.button !== 0 || loadState.value !== 'ready' || event.target.closest('button, a')) return
  // Touching the non-focusable image must keep subsequent keyboard input in the modal.
  dialog.value.focus({ preventScroll: true })
  suppressStageClick = event.target !== stage.value
  stage.value.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size === 1) {
    gesture = { x: event.clientX, y: event.clientY, offset: { ...offset.value }, type: event.pointerType }
    dragging.value = scale.value > 1
  } else if (pointers.size === 2) {
    const [a, b] = Array.from(pointers.values())
    const rect = stage.value.getBoundingClientRect()
    pinch = {
      distance: Math.hypot(b.x - a.x, b.y - a.y),
      scale: scale.value,
      offset: { ...offset.value },
      center: { x: (a.x + b.x) / 2 - rect.left - rect.width / 2, y: (a.y + b.y) / 2 - rect.top - rect.height / 2 },
    }
    gesture = null
    lastTap = null
    dragging.value = true
  }
}

function onPointerMove(event) {
  if (!pointers.has(event.pointerId)) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (gesture && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 12) suppressStageClick = true
  if (pointers.size === 2 && pinch?.distance) {
    const [a, b] = Array.from(pointers.values())
    const rect = stage.value.getBoundingClientRect()
    const center = { x: (a.x + b.x) / 2 - rect.left - rect.width / 2, y: (a.y + b.y) / 2 - rect.top - rect.height / 2 }
    const next = Math.max(1, Math.min(4, pinch.scale * Math.hypot(b.x - a.x, b.y - a.y) / pinch.distance))
    const factor = next / pinch.scale
    offset.value = constrainOffset(
      center.x + (pinch.offset.x - pinch.center.x) * factor,
      center.y + (pinch.offset.y - pinch.center.y) * factor,
      next,
    )
    scale.value = next
  } else if (gesture && scale.value > 1) {
    offset.value = constrainOffset(gesture.offset.x + event.clientX - gesture.x, gesture.offset.y + event.clientY - gesture.y)
  }
}

function onPointerUp(event) {
  if (!pointers.has(event.pointerId)) return
  pointers.delete(event.pointerId)
  if (pointers.size) {
    // Finish the pinch before starting another drag; never turn it into a swipe.
    gesture = null
    pinch = null
    return
  }
  dragging.value = false
  if (!gesture) return
  const dx = event.clientX - gesture.x
  const dy = event.clientY - gesture.y
  const touch = gesture.type === 'touch'
  if (touch) lastTouchTime = Date.now()
  gesture = null
  if (scale.value === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    move(dx < 0 ? 1 : -1)
    suppressStageClick = true
  } else if (touch && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
    const now = Date.now()
    if (lastTap && now - lastTap.time < 320 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 28) {
      toggleZoom(event)
      lastTap = null
    } else {
      lastTap = { time: now, x: event.clientX, y: event.clientY }
    }
  }
}

function onStageClick(event) {
  if (suppressStageClick) {
    suppressStageClick = false
    return
  }
  if (event.target === stage.value) close()
}

function cancelGesture() {
  pointers.clear()
  gesture = null
  pinch = null
  dragging.value = false
}

function bindImages(root) {
  const candidates = Array.from(root.querySelectorAll(props.imageSelector)).filter(image => (
    !image.closest('button, [role="button"], .md-link-card, .md-stream-button')
  ))
  const attributes = ['role', 'tabindex', 'aria-label', 'aria-haspopup', 'title']
  const snapshots = candidates.map(image => ({
    image,
    attributes: attributes.map(name => [name, image.getAttribute(name)]),
  }))
  for (const image of candidates) {
    image.setAttribute('data-md-image-preview', '')
    image.setAttribute('role', 'button')
    image.setAttribute('tabindex', '0')
    image.setAttribute('aria-haspopup', 'dialog')
    image.setAttribute('aria-label', `放大查看图片：${image.alt || image.title || '正文图片'}`)
  }
  const imageFor = event => event.target.closest?.('[data-md-image-preview]')
  const click = event => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const image = imageFor(event)
    if (!image || !root.contains(image)) return
    event.preventDefault()
    event.stopPropagation()
    open(image)
  }
  const keydown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (!event.target.matches('[data-md-image-preview]')) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    event.stopPropagation()
    open(event.target)
  }
  root.addEventListener('click', click, true)
  root.addEventListener('keydown', keydown, true)
  return () => {
    root.removeEventListener('click', click, true)
    root.removeEventListener('keydown', keydown, true)
    for (const { image, attributes: original } of snapshots) {
      image.removeAttribute('data-md-image-preview')
      for (const [name, value] of original) {
        if (value === null) image.removeAttribute(name)
        else image.setAttribute(name, value)
      }
    }
  }
}

watch([loadState, scale], () => {
  // Disabling a focused zoom control during loading or at a zoom limit can move
  // browser focus to body. Keep keyboard shortcuts inside the open modal.
  if (!dialog.value?.open) return
  const active = document.activeElement
  if (!dialog.value.contains(active) || active.matches(':disabled')) {
    dialog.value.focus({ preventScroll: true })
  }
}, { flush: 'post' })

watch(() => [props.root, props.contentKey], async (_, __, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  close()
  detach?.()
  detach = null
  await nextTick()
  if (!cancelled && props.root) detach = bindImages(props.root)
}, { immediate: true, flush: 'post' })

onBeforeUnmount(() => {
  close(false)
  detach?.()
})
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="md-image-preview"
      aria-label="图片预览"
      tabindex="-1"
      @cancel.prevent="close()"
      @close="close()"
      @keydown="onKeydown"
      @click.self="close()"
    >
      <template v-if="opened && selected">
        <header class="md-image-preview__toolbar">
          <span class="md-image-preview__eyebrow">IMAGE VIEWER</span>
          <div class="md-image-preview__tools" aria-label="图片工具">
            <button type="button" aria-label="缩小图片" :disabled="scale <= 1 || loadState !== 'ready'" @click="setZoom(scale - 0.5)">−</button>
            <button type="button" class="md-image-preview__reset" aria-label="复位图片" :disabled="loadState !== 'ready'" @click="setZoom(1)">{{ Math.round(scale * 100) }}%</button>
            <button type="button" aria-label="放大图片" :disabled="scale >= 4 || loadState !== 'ready'" @click="setZoom(scale + 0.5)">+</button>
            <a v-if="selected.href" :href="selected.href" target="_blank" rel="noopener noreferrer">原链接 ↗</a>
            <button type="button" class="md-image-preview__close" aria-label="关闭图片预览" autofocus @click="close()">×</button>
          </div>
        </header>
        <div
          ref="stage"
          class="md-image-preview__stage"
          :class="{ 'is-zoomed': scale > 1, 'is-dragging': dragging }"
          @click="onStageClick"
          @dblclick.prevent="onDoubleClick"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="cancelGesture"
          @lostpointercapture="cancelGesture"
        >
          <img
            :key="index + ':' + retry"
            ref="previewImage"
            class="md-image-preview__image"
            :class="{ 'is-ready': loadState === 'ready' }"
            :src="selected.src"
            :alt="selected.alt"
            :style="imageStyle"
            draggable="false"
            @load="loadState = 'ready'"
            @error="loadState = 'error'"
          >
          <div v-if="loadState !== 'ready'" class="md-image-preview__state" role="status">
            <template v-if="loadState === 'loading'"><span class="md-image-preview__spinner" aria-hidden="true"></span>正在载入图片</template>
            <template v-else>
              <span>暂时无法载入图片</span>
              <button type="button" @click="retry += 1; loadState = 'loading'">重新载入</button>
            </template>
          </div>
          <template v-if="images.length > 1">
            <button type="button" class="md-image-preview__previous" aria-label="上一张图片" @dblclick.stop @click.stop="move(-1)">‹</button>
            <button type="button" class="md-image-preview__next" aria-label="下一张图片" @dblclick.stop @click.stop="move(1)">›</button>
          </template>
        </div>
        <footer class="md-image-preview__footer">
          <div aria-live="polite" aria-atomic="true">
            <p class="md-image-preview__caption">{{ selected.caption }}</p>
            <span class="md-image-preview__count">{{ index + 1 }} / {{ images.length }}</span>
          </div>
          <p class="md-image-preview__hint">双击缩放 · 放大后拖动 · 左右切图 <span>· ESC 关闭</span></p>
        </footer>
      </template>
    </dialog>
  </Teleport>
</template>

<style>
[data-md-image-preview] { cursor: zoom-in; }
[data-md-image-preview]:focus-visible { outline: 2px solid #89b4fa; outline-offset: 5px; border-radius: 4px; }
.md-image-preview {
  position: fixed; inset: 0; z-index: 10000; box-sizing: border-box;
  width: 100%; max-width: none; height: 100%; height: 100dvh; max-height: none;
  padding: 0; margin: 0; border: 0; overflow: hidden;
  color: #cdd6f4; background: rgba(17, 17, 27, 0.97);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
  color-scheme: dark;
}
.md-image-preview[open] { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; animation: md-preview-enter 160ms ease-out; }
.md-image-preview::backdrop { background: rgba(17, 17, 27, 0.82); backdrop-filter: blur(12px); }
.md-image-preview button, .md-image-preview a {
  box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px; border: 1px solid transparent; border-radius: 12px;
  color: #bac2de; background: transparent; font: inherit; text-decoration: none; cursor: pointer;
  transition: color 140ms ease, background 140ms ease, border-color 140ms ease;
}
.md-image-preview button:hover, .md-image-preview a:hover { color: #cdd6f4; background: rgba(180, 190, 254, 0.09); }
.md-image-preview button:focus-visible, .md-image-preview a:focus-visible { outline: 2px solid #89b4fa; outline-offset: 2px; }
.md-image-preview button:disabled { opacity: 0.3; cursor: default; }
.md-image-preview__toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: max(12px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) 12px max(20px, env(safe-area-inset-left));
  border-bottom: 1px solid rgba(180, 190, 254, 0.09);
}
.md-image-preview__eyebrow { color: #7f849c; font-size: 0.68rem; letter-spacing: 0.18em; white-space: nowrap; }
.md-image-preview__tools { display: flex; align-items: center; gap: 4px; }
.md-image-preview__tools button { font-size: 1.35rem; }
.md-image-preview__tools a { padding: 0 10px; font-size: 0.78rem; }
.md-image-preview__tools .md-image-preview__reset { min-width: 58px; font-size: 0.78rem; font-variant-numeric: tabular-nums; }
.md-image-preview__tools .md-image-preview__close { margin-left: 8px; color: #cdd6f4; font-size: 1.8rem; border-color: rgba(180, 190, 254, 0.15); }
.md-image-preview__stage { position: relative; display: flex; align-items: center; justify-content: center; min-height: 0; overflow: hidden; touch-action: none; user-select: none; }
.md-image-preview__image { display: block; max-width: calc(100% - 112px); max-height: calc(100% - 32px); width: auto; height: auto; object-fit: contain; opacity: 0; transform-origin: center; cursor: zoom-in; }
.md-image-preview__image.is-ready { opacity: 1; }
.md-image-preview__stage.is-zoomed .md-image-preview__image { cursor: grab; }
.md-image-preview__stage.is-dragging .md-image-preview__image { cursor: grabbing; }
.md-image-preview__previous, .md-image-preview__next { position: absolute; top: calc(50% - 24px); font-size: 2.4rem !important; background: rgba(30, 30, 46, 0.72) !important; border-color: rgba(180, 190, 254, 0.1) !important; }
.md-image-preview__previous { left: max(12px, env(safe-area-inset-left)); }
.md-image-preview__next { right: max(12px, env(safe-area-inset-right)); }
.md-image-preview__footer { padding: 14px 24px max(18px, env(safe-area-inset-bottom)); border-top: 1px solid rgba(180, 190, 254, 0.09); text-align: center; }
.md-image-preview__footer > div { display: flex; justify-content: center; align-items: baseline; gap: 1rem; }
.md-image-preview__caption { max-width: min(70ch, 80%); margin: 0; color: #cdd6f4; font-size: 0.9rem; line-height: 1.5; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.md-image-preview__count { color: #89b4fa; font-size: 0.78rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.md-image-preview__hint { margin: 8px 0 0; color: #7f849c; font-size: 0.7rem; line-height: 1.5; }
.md-image-preview__state { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #a6adc8; font-size: 0.9rem; }
.md-image-preview__state button { padding: 0 16px; border-color: rgba(180, 190, 254, 0.18); font-size: 0.85rem; }
.md-image-preview__spinner { width: 24px; height: 24px; border: 2px solid rgba(180, 190, 254, 0.18); border-top-color: #89b4fa; border-radius: 50%; animation: md-preview-spin 800ms linear infinite; }
@keyframes md-preview-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes md-preview-spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .md-image-preview__toolbar { padding-right: max(8px, env(safe-area-inset-right)); padding-left: max(8px, env(safe-area-inset-left)); gap: 0; }
  .md-image-preview__eyebrow { display: none; }
  .md-image-preview__tools { justify-content: center; width: 100%; gap: 0; }
  .md-image-preview__tools .md-image-preview__close { margin-left: auto; }
  .md-image-preview__tools a { padding: 0 8px; font-size: 0.7rem; }
  .md-image-preview__image { max-width: calc(100% - 24px); max-height: calc(100% - 24px); }
  .md-image-preview__previous, .md-image-preview__next { top: auto; bottom: 12px; opacity: 0.88; font-size: 2rem !important; }
  .md-image-preview__footer { padding-right: 16px; padding-left: 16px; }
  .md-image-preview__hint span { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .md-image-preview[open], .md-image-preview__spinner { animation: none; }
  .md-image-preview button, .md-image-preview a { transition: none; }
}
</style>
