<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const ROTATION_INTERVAL = 7600
const WHEEL_THRESHOLD = 24
const WHEEL_COOLDOWN = 360

const headings = ref([])
const activeIndex = ref(0)
const isPaused = ref(false)
const hasFocusWithin = ref(false)

let rotationTimer = 0
let wheelAccumulator = 0
let wheelResetTimer = 0
let lastWheelSwitch = 0
let pointerStartX = null

const activeHeading = computed(() => (
  headings.value[activeIndex.value] || '主播的摸鱼日常'
))

const positionLabel = computed(() => (
  `${String(activeIndex.value + 1).padStart(2, '0')} / ${String(Math.max(headings.value.length, 1)).padStart(2, '0')}`
))

function cleanHeading(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
}

function extractSecondLevelHeadings(markdown) {
  const result = []
  let fence = null

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!fence) fence = marker
      else if (fence === marker) fence = null
      continue
    }

    if (fence) continue

    const headingMatch = line.match(/^##(?!#)\s+(.+?)\s*#*\s*$/)
    if (!headingMatch) continue

    const title = cleanHeading(headingMatch[1])
    if (title) result.push(title)
  }

  return result
}

function step(direction) {
  const count = headings.value.length
  if (count < 2) return
  activeIndex.value = (activeIndex.value + direction + count) % count
}

function restartRotation() {
  window.clearInterval(rotationTimer)
  if (isPaused.value || hasFocusWithin.value || headings.value.length < 2) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  rotationTimer = window.setInterval(() => step(1), ROTATION_INTERVAL)
}

function setPointerPause(paused) {
  isPaused.value = paused
  restartRotation()
}

function handleFocusIn() {
  hasFocusWithin.value = true
  restartRotation()
}

function handleFocusOut(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return
  hasFocusWithin.value = false
  restartRotation()
}

function handleWheel(event) {
  if (headings.value.length < 2) return

  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
    ? event.deltaY
    : event.deltaX

  if (!delta) return
  event.preventDefault()

  wheelAccumulator += delta
  window.clearTimeout(wheelResetTimer)
  wheelResetTimer = window.setTimeout(() => { wheelAccumulator = 0 }, 150)

  const now = performance.now()
  if (Math.abs(wheelAccumulator) < WHEEL_THRESHOLD || now - lastWheelSwitch < WHEEL_COOLDOWN) return

  step(wheelAccumulator > 0 ? 1 : -1)
  wheelAccumulator = 0
  lastWheelSwitch = now
  restartRotation()
}

function handleKeydown(event) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  step(event.key === 'ArrowRight' ? 1 : -1)
  restartRotation()
}

function handlePointerDown(event) {
  if (event.pointerType === 'mouse') return
  pointerStartX = event.clientX
}

function handlePointerUp(event) {
  if (pointerStartX === null) return
  const distance = event.clientX - pointerStartX
  pointerStartX = null
  if (Math.abs(distance) < 42) return
  step(distance < 0 ? 1 : -1)
  restartRotation()
}

onMounted(async () => {
  try {
    const response = await fetch('/markdown/post_it.md')
    if (!response.ok) throw new Error(`说说请求失败：${response.status}`)
    headings.value = extractSecondLevelHeadings(await response.text())
  } catch (error) {
    console.error('无法读取说说标题:', error)
  } finally {
    restartRotation()
  }
})

onBeforeUnmount(() => {
  window.clearInterval(rotationTimer)
  window.clearTimeout(wheelResetTimer)
})
</script>

<template>
  <section
    class="talk-ticker"
    aria-label="最新说说"
    tabindex="0"
    @pointerenter="setPointerPause(true)"
    @pointerleave="setPointerPause(false)"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @wheel="handleWheel"
    @keydown="handleKeydown"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="pointerStartX = null"
  >
    <span class="talk-ticker__label">说说</span>

    <button
      class="talk-ticker__control"
      type="button"
      aria-label="上一条说说"
      @click="step(-1); restartRotation()"
    >
      ‹
    </button>

    <RouterLink class="talk-ticker__entry" to="/talk">
      <Transition name="talk-slide" mode="out-in">
        <span :key="activeIndex" class="talk-ticker__title" aria-live="polite">
          {{ activeHeading }}
        </span>
      </Transition>
    </RouterLink>

    <span class="talk-ticker__position" aria-hidden="true">{{ positionLabel }}</span>

    <button
      class="talk-ticker__control"
      type="button"
      aria-label="下一条说说"
      @click="step(1); restartRotation()"
    >
      ›
    </button>
  </section>
</template>

<style scoped>
.talk-ticker {
  position: relative;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto auto;
  width: min(100% - 3rem, 1320px);
  min-height: 3.65rem;
  align-items: center;
  gap: clamp(0.45rem, 1.4vw, 0.9rem);
  margin: 1.15rem auto -1rem;
  padding: 0.35rem 0.45rem 0.35rem clamp(0.85rem, 2vw, 1.25rem);
  overflow: hidden;
  border: 1px solid rgba(137, 180, 250, 0.25);
  border-radius: 999px;
  color: #cdd6f4;
  background:
    linear-gradient(90deg, rgba(137, 180, 250, 0.1), transparent 25%, rgba(203, 166, 247, 0.07)),
    rgba(17, 17, 27, 0.72);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.035), 0 14px 38px rgba(0, 0, 0, 0.13);
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.talk-ticker:hover,
.talk-ticker:focus-visible,
.talk-ticker:focus-within {
  border-color: rgba(137, 180, 250, 0.48);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.05), 0 16px 44px rgba(0, 0, 0, 0.2);
}

.talk-ticker__label {
  color: #89b4fa;
  font-size: 0.72rem;
  font-weight: 780;
  letter-spacing: 0.14em;
}

.talk-ticker__entry {
  min-width: 0;
  overflow: hidden;
  color: #dce4ff;
  text-decoration: none;
}

.talk-ticker__title {
  display: block;
  overflow: hidden;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(0.92rem, 1.35vw, 1.08rem);
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.talk-ticker__entry:hover .talk-ticker__title,
.talk-ticker__entry:focus-visible .talk-ticker__title {
  color: #fff;
}

.talk-ticker__position {
  color: rgba(166, 173, 200, 0.58);
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.talk-ticker__control {
  display: inline-grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: rgba(205, 214, 244, 0.72);
  background: rgba(49, 50, 68, 0.52);
  font: inherit;
  font-size: 1.55rem;
  line-height: 1;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.talk-ticker__control:hover,
.talk-ticker__control:focus-visible {
  color: #fff;
  background: rgba(137, 180, 250, 0.18);
  transform: scale(1.04);
}

.talk-slide-enter-active,
.talk-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.talk-slide-enter-from {
  opacity: 0;
  transform: translateY(0.45rem);
}

.talk-slide-leave-to {
  opacity: 0;
  transform: translateY(-0.45rem);
}

@media (max-width: 720px) {
  .talk-ticker {
    grid-template-columns: auto minmax(0, 1fr) auto;
    width: min(100% - 2rem, 1320px);
    margin-top: 0.8rem;
    padding-left: 0.85rem;
  }

  .talk-ticker__control {
    width: 2.6rem;
    height: 2.6rem;
  }

  .talk-ticker__control:first-of-type,
  .talk-ticker__position {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .talk-slide-enter-active,
  .talk-slide-leave-active,
  .talk-ticker,
  .talk-ticker__control {
    transition: none;
  }
}
</style>
