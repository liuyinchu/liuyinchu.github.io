<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SiteIcon from '../common/SiteIcon.vue'

const ROTATION_INTERVAL = 6200
const WHEEL_THRESHOLD = 24
const WHEEL_COOLDOWN = 360

const entries = ref([])
const activeIndex = ref(0)
const isPaused = ref(false)
const hasFocusWithin = ref(false)

let rotationTimer = 0
let wheelAccumulator = 0
let wheelResetTimer = 0
let lastWheelSwitch = 0
let pointerStartX = null
let pointerId = null
let didSwipe = false
let swipeResetTimer = 0

const talkRequestController = new AbortController()

const activeEntry = computed(() => (
  entries.value[activeIndex.value] || {
    title: '主播的摸鱼日常',
    summary: '分享日常生活，偶尔发表各种想法与吐槽',
  }
))

const positionLabel = computed(() => (
  `${String(activeIndex.value + 1).padStart(2, '0')} / ${String(Math.max(entries.value.length, 1)).padStart(2, '0')}`
))

const activeLinkLabel = computed(() => {
  const summary = activeEntry.value.summary ? `，${activeEntry.value.summary}` : ''
  return `打开第 ${activeIndex.value + 1} 条说说：${activeEntry.value.title}${summary}`
})

function cleanInlineText(value) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:>\s*|[-*+]\s+|\d+[.)]\s+)/, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTalkEntries(markdown) {
  const result = []
  let fence = null
  let currentEntry = null
  let paragraph = []

  const commitParagraph = () => {
    if (!currentEntry || currentEntry.summary || !paragraph.length) return
    currentEntry.summary = cleanInlineText(paragraph.join(' '))
    paragraph = []
  }

  const commitEntry = () => {
    if (!currentEntry) return
    commitParagraph()
    result.push(currentEntry)
    currentEntry = null
  }

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!fence) {
        commitParagraph()
        fence = marker
      } else if (fence === marker) {
        fence = null
      }
      continue
    }

    if (fence) continue

    const headingMatch = line.match(/^##(?!#)\s+(.+?)\s*#*\s*$/)
    if (headingMatch) {
      commitEntry()
      const title = cleanInlineText(headingMatch[1])
      currentEntry = title ? { title, summary: '' } : null
      paragraph = []
      continue
    }

    if (!currentEntry || currentEntry.summary) continue

    if (!line.trim()) {
      commitParagraph()
      continue
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      commitParagraph()
      continue
    }

    if (/^\s*(?:!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>)\s*$/i.test(line)) {
      commitParagraph()
      continue
    }

    if (/^\s*#{1,6}\s+/.test(line) || /^\s*:{1,3}[\w-]*/.test(line)) {
      commitParagraph()
      continue
    }

    const text = cleanInlineText(line)
    if (!text) continue

    if (/^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
      commitParagraph()
      if (!currentEntry.summary) currentEntry.summary = text
      continue
    }

    paragraph.push(text)
  }

  commitEntry()
  return result
}

function step(direction) {
  const count = entries.value.length
  if (count < 2) return
  activeIndex.value = (activeIndex.value + direction + count) % count
}

function restartRotation() {
  window.clearInterval(rotationTimer)
  if (isPaused.value || hasFocusWithin.value || entries.value.length < 2) return
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
  if (entries.value.length < 2) return

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
  didSwipe = false
  if (event.pointerType === 'mouse') return
  pointerStartX = event.clientX
  pointerId = event.pointerId
}

function handlePointerUp(event) {
  if (pointerStartX === null) return
  const distance = event.clientX - pointerStartX
  pointerStartX = null
  pointerId = null
  if (Math.abs(distance) < 42) return
  didSwipe = true
  step(distance < 0 ? 1 : -1)
  restartRotation()
  window.clearTimeout(swipeResetTimer)
  swipeResetTimer = window.setTimeout(() => {
    didSwipe = false
  }, 450)
}

function handlePointerCancel(event) {
  if (pointerId === event.pointerId) {
    pointerStartX = null
    pointerId = null
    didSwipe = false
    window.clearTimeout(swipeResetTimer)
  }
}

function handleEntryClick(event) {
  if (!didSwipe || event.detail === 0) return
  event.preventDefault()
  didSwipe = false
  window.clearTimeout(swipeResetTimer)
}

onMounted(async () => {
  try {
    const response = await fetch('/markdown/post_it.md', {
      signal: talkRequestController.signal,
    })
    if (!response.ok) throw new Error(`说说请求失败：${response.status}`)
    const markdown = await response.text()
    if (!talkRequestController.signal.aborted) {
      entries.value = extractTalkEntries(markdown)
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('无法读取说说标题:', error)
    }
  } finally {
    if (!talkRequestController.signal.aborted) restartRotation()
  }
})

onBeforeUnmount(() => {
  talkRequestController.abort()
  window.clearInterval(rotationTimer)
  window.clearTimeout(wheelResetTimer)
  window.clearTimeout(swipeResetTimer)
})
</script>

<template>
  <section
    class="talk-ticker"
    aria-label="最新说说"
    @pointerenter="setPointerPause(true)"
    @pointerleave="setPointerPause(false)"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @wheel="handleWheel"
    @keydown="handleKeydown"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <span class="talk-ticker__label">
      <SiteIcon name="talk" />
      说说
    </span>

    <RouterLink
      class="talk-ticker__entry"
      to="/talk"
      :aria-label="activeLinkLabel"
      @click.capture="handleEntryClick"
    >
      <Transition name="talk-slide" mode="out-in">
        <span :key="activeIndex" class="talk-ticker__message">
          <strong class="talk-ticker__title">{{ activeEntry.title }}</strong>
          <span v-if="activeEntry.summary" class="talk-ticker__summary">{{ activeEntry.summary }}</span>
        </span>
      </Transition>
    </RouterLink>

    <span class="talk-ticker__position" aria-hidden="true">{{ positionLabel }}</span>
  </section>
</template>

<style scoped>
.talk-ticker {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  width: min(100% - 3rem, 1320px);
  min-height: 3.05rem;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1.25rem);
  margin: 1.15rem auto -1.35rem;
  padding: 0.28rem clamp(0.9rem, 2vw, 1.2rem);
  overflow: hidden;
  border: 1px solid rgba(137, 180, 250, 0.42);
  border-radius: 0.7rem;
  color: #cdd6f4;
  background:
    linear-gradient(90deg, rgba(137, 180, 250, 0.13), transparent 28%, rgba(203, 166, 247, 0.09)),
    rgba(17, 17, 27, 0.94);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.045), 0 10px 28px rgba(0, 0, 0, 0.18);
  outline: none;
  touch-action: pan-y;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.talk-ticker:hover,
.talk-ticker:focus-visible,
.talk-ticker:focus-within {
  border-color: rgba(137, 180, 250, 0.68);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.055), 0 12px 34px rgba(0, 0, 0, 0.24);
}

.talk-ticker__label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #89b4fa;
  font-size: 0.69rem;
  font-weight: 780;
  letter-spacing: 0.14em;
}

.talk-ticker__label :deep(.site-icon) {
  width: 1rem;
  height: 1rem;
}

.talk-ticker__entry {
  display: block;
  min-width: 0;
  overflow: hidden;
  color: #dce4ff;
  text-decoration: none;
}

.talk-ticker__message {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.talk-ticker__title {
  color: #e5e9ff;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(0.92rem, 1.35vw, 1.08rem);
  font-weight: 650;
}

.talk-ticker__summary {
  color: rgba(166, 173, 200, 0.58);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
  font-size: clamp(0.78rem, 1vw, 0.86rem);
  font-weight: 470;
}

.talk-ticker__summary::before {
  content: ' · ';
  color: rgba(137, 180, 250, 0.5);
}

.talk-ticker__entry:hover .talk-ticker__title,
.talk-ticker__entry:focus-visible .talk-ticker__title {
  color: #fff;
}

.talk-ticker__entry:hover .talk-ticker__summary,
.talk-ticker__entry:focus-visible .talk-ticker__summary {
  color: rgba(205, 214, 244, 0.72);
}

.talk-ticker__position {
  color: rgba(166, 173, 200, 0.58);
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  white-space: nowrap;
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

@media (min-width: 1800px) {
  .talk-ticker {
    width: min(100% - 6rem, 1920px);
  }
}

@media (max-width: 720px) {
  .talk-ticker {
    grid-template-columns: auto minmax(0, 1fr);
    width: min(100% - 2rem, 1320px);
    margin-top: 0.8rem;
    padding-inline: 0.85rem;
  }

  .talk-ticker__position {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .talk-slide-enter-active,
  .talk-slide-leave-active,
  .talk-ticker {
    transition: none;
  }
}
</style>
