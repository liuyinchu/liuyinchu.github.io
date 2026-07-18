<script setup>
// 3D 星环画廊：文章卡片分布在圆柱面上，支持拖拽（含惯性）、滚轮、方向键，
// 空闲时自动巡游并吸附到最近卡片；点击任意可见卡片直接进入正文。
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Space4ArticleCard from './Space4ArticleCard.vue'

const props = defineProps({
  articles: { type: Array, required: true },
})
const emit = defineEmits(['activate'])

const viewportRef = ref(null)
const angle = ref(0) // 星环当前角（度）
const frontIndex = ref(0)
const cardW = ref(272)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let rafId = 0
let dragging = false
let dragMoved = 0
let captureActive = false
let lastX = 0
let lastT = 0
let vel = 0 // 度 / 帧
let snapTarget = null
let hovering = false
let lastInteract = 0
let visibilityObserver = null
let inViewport = true
let pageVisible = !document.hidden

const n = computed(() => props.articles.length)
const step = computed(() => 360 / Math.max(n.value, 1))
const cardH = computed(() => Math.round(cardW.value * 1.42))
// 半径由卡片宽度与数量推出；数量过少时按 7 张占位，避免半径退化
const radius = computed(() => {
  const nEff = Math.max(n.value, 7)
  const r = (cardW.value / 2 + 16) / Math.tan(Math.PI / nEff)
  return Math.min(Math.max(r, 300), 1500)
})

const ringStyle = computed(() => ({
  transform: `translateZ(${-radius.value}px) rotateX(-6deg) rotateY(${angle.value}deg)`,
}))

function frontness(i) {
  return Math.cos(((i * step.value + angle.value) * Math.PI) / 180)
}

function cardStyle(i) {
  const f = frontness(i)
  const vis = Math.min(Math.max((f + 0.22) / 1.22, 0), 1)
  return {
    transform: `rotateY(${i * step.value}deg) translateZ(${radius.value}px)`,
    opacity: (0.1 + 0.9 * vis * vis).toFixed(3),
    pointerEvents: vis > 0.32 ? 'auto' : 'none',
  }
}

function resizeCards() {
  const w = window.innerWidth
  cardW.value = w < 560 ? 208 : w < 900 ? 240 : 272
}

function loop() {
  rafId = 0
  if (!dragging) {
    if (snapTarget != null) {
      const d = snapTarget - angle.value
      angle.value += d * (reduced ? 1 : 0.09)
      if (Math.abs(d) < 0.05) {
        angle.value = snapTarget
        snapTarget = null
      }
    } else {
      angle.value += vel
      vel *= 0.945
      if (Math.abs(vel) < 0.015) {
        vel = 0
        // 吸附到最近卡片
        const target = Math.round(angle.value / step.value) * step.value
        angle.value += (target - angle.value) * (reduced ? 1 : 0.045)
        // 空闲自动巡游
        if (!hovering && !reduced && performance.now() - lastInteract > 2600) {
          angle.value += 0.02
        }
      }
    }
  }
  if (n.value > 0) {
    frontIndex.value = ((Math.round(-angle.value / step.value) % n.value) + n.value) % n.value
  }
  if (!reduced || dragging || snapTarget != null || Math.abs(vel) >= 0.015) scheduleLoop()
}

function scheduleLoop() {
  if (rafId || !pageVisible || !inViewport) return
  rafId = requestAnimationFrame(loop)
}

function syncLoop() {
  if (pageVisible && inViewport) {
    scheduleLoop()
    return
  }
  cancelAnimationFrame(rafId)
  rafId = 0
}

function onVisibilityChange() {
  pageVisible = !document.hidden
  syncLoop()
}

function onPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return
  dragging = true
  dragMoved = 0
  vel = 0
  snapTarget = null
  lastX = e.clientX
  lastT = performance.now()
  lastInteract = lastT
  scheduleLoop()
}

function onPointerMove(e) {
  if (!dragging) return
  const now = performance.now()
  const dx = e.clientX - lastX
  const dt = Math.max(now - lastT, 1)
  lastX = e.clientX
  lastT = now
  dragMoved += Math.abs(dx)
  if (!captureActive && dragMoved > 8) {
    viewportRef.value?.setPointerCapture?.(e.pointerId)
    captureActive = true
  }
  const degPerPx = step.value / (cardW.value * 1.05) // 拖过一张卡宽 ≈ 转过一张卡
  angle.value += dx * degPerPx
  vel = 0.72 * vel + 0.28 * ((dx * degPerPx) / (dt / 16.7))
  lastInteract = now
  scheduleLoop()
}

function onPointerUp(e) {
  if (!dragging) return
  dragging = false
  lastInteract = performance.now()
  if (captureActive) viewportRef.value?.releasePointerCapture?.(e.pointerId)
  captureActive = false
}

function onWheel(e) {
  const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (!rawDelta) return
  e.preventDefault()
  const modeScale = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? viewportRef.value?.clientWidth || 800 : 1
  const d = Math.max(-180, Math.min(180, rawDelta * modeScale))
  snapTarget = null
  vel += d * 0.012
  lastInteract = performance.now()
  scheduleLoop()
}

function onEnter() {
  hovering = true
}

function onLeave() {
  hovering = false
}

function goBy(dir) {
  const snapped = Math.round(angle.value / step.value) * step.value
  snapTarget = snapped - dir * step.value
  vel = 0
  lastInteract = performance.now()
  scheduleLoop()
}

function onCardActivate(i) {
  if (dragMoved > 8) return // 视为拖拽而非点击
  lastInteract = performance.now()
  emit('activate', props.articles[i])
}

function openFront() {
  const article = props.articles[frontIndex.value]
  if (article) emit('activate', article)
}

onMounted(() => {
  resizeCards()
  window.addEventListener('resize', resizeCards, { passive: true })
  // 手动挂非 passive 滚轮监听，保证 preventDefault 生效
  viewportRef.value?.addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('visibilitychange', onVisibilityChange)
  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      syncLoop()
    }, { rootMargin: '120px 0px' })
    visibilityObserver.observe(viewportRef.value)
  }
  scheduleLoop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeCards)
  viewportRef.value?.removeEventListener('wheel', onWheel)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  visibilityObserver?.disconnect()
})
</script>

<template>
  <div
    ref="viewportRef"
    class="s4-orbit"
    tabindex="0"
    role="region"
    aria-roledescription="三维星环"
    aria-label="文章星环：可拖拽、使用鼠标滚轮、触控板横滑或左右方向键浏览，点击卡片即可打开文章"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @keydown.left.prevent="goBy(-1)"
    @keydown.right.prevent="goBy(1)"
    @keydown.enter.self.prevent="openFront"
    @dragstart.prevent
  >
    <div
      class="s4-orbit__stage"
      :style="{ '--ow': `${cardW}px`, '--oh': `${cardH}px`, height: `${cardH + 116}px` }"
    >
      <div class="s4-orbit__floor" aria-hidden="true"></div>
      <div class="s4-orbit__ring" :style="ringStyle">
        <div class="s4-orbit__core" aria-hidden="true"></div>
        <Space4ArticleCard
          v-for="(a, i) in articles"
          :key="a.id"
          class="s4-orbit__item"
          :style="cardStyle(i)"
          :article="a"
          variant="orbit"
          :index="i"
          :focusable="i === frontIndex"
          @activate="onCardActivate(i)"
        />
      </div>
    </div>
    <div class="s4-orbit__hud">
      <span class="s4-orbit__count">
        {{ String(frontIndex + 1).padStart(2, '0') }}<i>/</i>{{ String(n).padStart(2, '0') }}
      </span>
      <Transition name="s4-hud" mode="out-in">
        <span :key="frontIndex" class="s4-orbit__title">{{ articles[frontIndex]?.title }}</span>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.s4-orbit {
  position: relative;
  padding: 6px 0 2px;
  outline: none;
  touch-action: pan-y; /* 纵向保留页面滚动，横向拖动旋转星环 */
  user-select: none;
  -webkit-user-select: none;
}

.s4-orbit:focus-visible .s4-orbit__stage {
  box-shadow: inset 0 0 0 2px rgba(137, 180, 250, 0.35);
  border-radius: 24px;
}

.s4-orbit__stage {
  position: relative;
  perspective: 1500px;
  perspective-origin: 50% 42%;
  overflow: hidden;
  cursor: grab;
}

.s4-orbit:active .s4-orbit__stage {
  cursor: grabbing;
}

.s4-orbit__ring {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
}

.s4-orbit__item {
  position: absolute;
  left: 50%;
  top: calc(50% - 8px);
  width: var(--ow);
  height: var(--oh);
  margin-left: calc(var(--ow) / -2);
  margin-top: calc(var(--oh) / -2);
}

.s4-orbit__core {
  position: absolute;
  left: 50%;
  top: calc(50% - 8px);
  width: 300px;
  height: 300px;
  margin: -150px 0 0 -150px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 34%, rgba(180, 200, 255, 0.28), transparent 42%),
    radial-gradient(circle at center, rgba(88, 102, 190, 0.32), rgba(20, 24, 48, 0.05) 68%, transparent 72%);
  box-shadow: 0 0 90px 18px rgba(120, 140, 250, 0.14);
  transform: translateZ(-60px);
  pointer-events: none;
}

.s4-orbit__floor {
  position: absolute;
  left: 50%;
  bottom: 6px;
  width: min(760px, 86%);
  height: 90px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(124, 146, 245, 0.16), transparent 68%);
  filter: blur(6px);
  pointer-events: none;
}

.s4-orbit__hud {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 14px;
  padding: 10px 16px 0;
  min-height: 30px;
}

.s4-orbit__count {
  font-size: 13px;
  letter-spacing: 0.14em;
  color: rgba(137, 220, 235, 0.85);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.s4-orbit__count i {
  font-style: normal;
  margin: 0 3px;
  opacity: 0.45;
}

.s4-orbit__title {
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 14.5px;
  color: rgba(222, 229, 255, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: min(60vw, 460px);
}

.s4-hud-enter-active,
.s4-hud-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.s4-hud-enter-from {
  opacity: 0;
  transform: translateY(7px);
}

.s4-hud-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}

@media (prefers-reduced-motion: reduce) {
  .s4-orbit__ring {
    will-change: auto;
  }

  .s4-hud-enter-active,
  .s4-hud-leave-active {
    transition: none;
  }
}
</style>
