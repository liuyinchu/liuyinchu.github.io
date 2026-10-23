<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { BOARD_WIDTH, BOARD_HEIGHT, NOTES, PRESETS, createPart, createPreset } from '../components/music-box/presets.js'
import { createSimulation } from '../components/music-box/simulation.js'
import { createAudioEngine } from '../components/music-box/audio.js'

const STORAGE_KEY = 'music-box-layout-v1'
const MAX_PARTS = 64
const initial = createPreset('cascade')
const parts = ref(initial.parts)
const emitterX = ref(initial.emitterX)
const tempo = ref(initial.tempo)
const presetId = ref('cascade')
const selectedId = ref('')
const board = ref(null)
const balls = shallowRef([])
const isPlaying = ref(false)
const isPreviewing = ref(false)
const isUnlocking = ref(false)
const hasStarted = ref(false)
const hitCount = ref(0)
const lastNote = ref('—')
const hitFlashes = ref({})
const volume = ref(60)
const muted = ref(false)
const dirty = ref(false)
const hasSavedLayout = ref(false)
const draggingId = ref('')
const notice = ref('先听听这段旋律，再拖动零件，写出你的版本。')
const partTypes = [
  { type: 'bell', name: '铃铛', hint: '清亮的音符' },
  { type: 'drum', name: '鼓', hint: '温暖的节拍' },
  { type: 'ramp', name: '斜坡', hint: '改变弹珠方向' },
]
const selectedPart = computed(() => parts.value.find(part => part.id === selectedId.value) || null)
const isRunning = computed(() => isPlaying.value || isPreviewing.value)
const stateLabel = computed(() => isPlaying.value ? '正在演奏' : isPreviewing.value ? '单次试奏' : hasStarted.value ? '已暂停' : '准备就绪')
const currentPreset = computed(() => PRESETS.find(preset => preset.id === presetId.value))
const audio = createAudioEngine()
let mounted = false
let frameId = 0
let previousTime = 0
let autoElapsed = 0
let interactionEpoch = 0
let flashSequence = 0
let drag = null

const simulation = createSimulation({
  parts: parts.value,
  onHit({ part, speed }) {
    hitCount.value += 1
    lastNote.value = part.type === 'drum' ? `鼓 · ${NOTES[part.note]?.label || 'C4'}` : NOTES[part.note]?.label || 'C4'
    hitFlashes.value = { ...hitFlashes.value, [part.id]: ++flashSequence }
    audio.hit(part, speed)
  },
})

audio.setVolume(volume.value / 100)

function typeName(type) {
  return partTypes.find(item => item.type === type)?.name || '零件'
}

function partName(part, index) {
  const number = index === undefined ? parts.value.indexOf(part) + 1 : index + 1
  return `${String(number).padStart(2, '0')} · ${typeName(part.type)}${part.type === 'ramp' ? ` ${part.angle}°` : ` ${NOTES[part.note]?.label || 'C4'}`}`
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function setParts(next, edited = true) {
  parts.value = next
  simulation.setParts(next)
  if (edited) {
    dirty.value = true
    presetId.value = 'custom'
  }
}

function snapshotBalls() {
  balls.value = simulation.getBalls().map(ball => ({
    id: ball.id,
    x: ball.x,
    y: ball.y,
    trail: ball.trail?.map(point => ({ x: point.x, y: point.y })) || [],
  }))
}

function trailPoints(ball) {
  return [...ball.trail, { x: ball.x, y: ball.y }].map(point => `${point.x},${point.y}`).join(' ')
}

function frame(time) {
  frameId = 0
  if (!mounted || !isRunning.value) return
  const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0
  previousTime = time
  if (isPlaying.value) {
    autoElapsed += dt
    const interval = 60 / tempo.value
    if (autoElapsed >= interval) {
      simulation.drop(emitterX.value)
      autoElapsed %= interval
    }
  }
  simulation.step(dt)
  snapshotBalls()
  if (isPreviewing.value && !balls.value.length) {
    isPreviewing.value = false
    previousTime = 0
    notice.value = '试奏结束。再投一颗，或开始连续演奏。'
    return
  }
  frameId = requestAnimationFrame(frame)
}

function ensureFrame() {
  if (!frameId && mounted) {
    previousTime = 0
    frameId = requestAnimationFrame(frame)
  }
}

function pausePlayback(message = '演奏已暂停，弹珠留在原处。') {
  interactionEpoch += 1
  isUnlocking.value = false
  isPlaying.value = false
  isPreviewing.value = false
  if (frameId) cancelAnimationFrame(frameId)
  frameId = 0
  previousTime = 0
  if (message) notice.value = message
}

async function withAudio(action) {
  const epoch = ++interactionEpoch
  isUnlocking.value = true
  let available = false
  try {
    available = await audio.unlock()
  } catch {
    available = false
  }
  if (!mounted || epoch !== interactionEpoch) return
  isUnlocking.value = false
  if (document.hidden) return
  action()
  if (!available) notice.value = '暂时无法启用声音，仍可摆放零件和观看演奏。'
}

function togglePlayback() {
  if (isRunning.value) {
    pausePlayback()
    return
  }
  withAudio(() => {
    isPlaying.value = true
    isPreviewing.value = false
    hasStarted.value = true
    autoElapsed = 0
    if (!simulation.getBalls().length) simulation.drop(emitterX.value)
    snapshotBalls()
    ensureFrame()
    notice.value = '开始演奏。可以一边听，一边移动零件。'
  })
}

function dropOne() {
  withAudio(() => {
    simulation.drop(emitterX.value)
    hasStarted.value = true
    if (!isPlaying.value) isPreviewing.value = true
    snapshotBalls()
    ensureFrame()
    notice.value = '投下一颗弹珠，听听它会去哪里。'
  })
}

function resetPerformance(announce = true) {
  pausePlayback('')
  simulation.reset()
  balls.value = []
  hitCount.value = 0
  lastNote.value = '—'
  hitFlashes.value = {}
  hasStarted.value = false
  autoElapsed = 0
  if (announce) notice.value = '演奏已重置，零件布局保留。'
}

function loadPreset() {
  stopDrag()
  resetPerformance(false)
  const preset = createPreset(presetId.value)
  setParts(preset.parts, false)
  emitterX.value = preset.emitterX
  tempo.value = preset.tempo
  selectedId.value = ''
  dirty.value = true
  notice.value = presetId.value === 'blank' ? '空白画板已就绪。从右侧零件匣放入第一个零件。' : `已打开「${currentPreset.value?.name || '预设'}」，点击开始试听。`
}

function addPart(type) {
  if (parts.value.length >= MAX_PARTS) {
    notice.value = `画板最多放置 ${MAX_PARTS} 个零件，先移除一个再试。`
    return
  }
  const offset = parts.value.length % 8
  const part = createPart(type, 330 + (offset % 4) * 48, 270 + Math.floor(offset / 4) * 82)
  setParts([...parts.value, part])
  selectedId.value = part.id
  notice.value = `已加入${typeName(type)}。拖动到合适位置，或在下方调整属性。`
}

function updateSelected(field, raw) {
  const part = selectedPart.value
  if (!part) return
  const value = Number(raw)
  setParts(parts.value.map(item => item.id === part.id ? { ...item, [field]: value } : item))
}

function removeSelected() {
  if (!selectedPart.value) return
  stopDrag()
  const name = typeName(selectedPart.value.type)
  setParts(parts.value.filter(part => part.id !== selectedId.value))
  selectedId.value = ''
  notice.value = `已移除${name}。`
}

function boundedPosition(part, x, y) {
  const margin = part.type === 'ramp' ? 66 : 34
  return {
    x: Math.round(clamp(x, margin, BOARD_WIDTH - margin)),
    y: Math.round(clamp(y, 70, BOARD_HEIGHT - margin)),
  }
}

function movePart(id, x, y) {
  const part = parts.value.find(item => item.id === id)
  if (!part) return
  setParts(parts.value.map(item => item.id === id ? { ...item, ...boundedPosition(part, x, y) } : item))
}

function boardPoint(event) {
  const matrix = board.value?.getScreenCTM()
  if (!matrix) return null
  return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
}

function startDrag(event, part) {
  if (event.button !== 0 || drag) return
  const point = boardPoint(event)
  if (!point) return
  selectedId.value = part.id
  event.currentTarget.focus({ preventScroll: true })
  event.preventDefault()
  drag = {
    id: part.id,
    pointerId: event.pointerId,
    element: event.currentTarget,
    offsetX: point.x - part.x,
    offsetY: point.y - part.y,
  }
  draggingId.value = part.id
  event.currentTarget.setPointerCapture(event.pointerId)
}

function moveDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return
  const point = boardPoint(event)
  if (point) movePart(drag.id, point.x - drag.offsetX, point.y - drag.offsetY)
}

function stopDrag(event) {
  if (!drag || (event && event.pointerId !== drag.pointerId)) return
  const previous = drag
  drag = null
  draggingId.value = ''
  if (previous.element.hasPointerCapture(previous.pointerId)) previous.element.releasePointerCapture(previous.pointerId)
}

function markSettingsEdited() {
  dirty.value = true
  presetId.value = 'custom'
}

function updateVolume() {
  audio.setVolume(volume.value / 100)
}

function toggleMuted() {
  muted.value = !muted.value
  audio.setMuted(muted.value)
  notice.value = muted.value ? '声音已静音，演奏继续。' : '声音已开启。'
}

function saveLayout() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      parts: parts.value,
      emitterX: emitterX.value,
      tempo: tempo.value,
    }))
    dirty.value = false
    hasSavedLayout.value = true
    notice.value = '编排已保存在此浏览器，下次打开会自动恢复。'
  } catch {
    notice.value = '浏览器未能保存编排，当前画板仍可继续使用。'
  }
}

function loadLayout(automatic = false) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      if (!automatic) notice.value = '这个浏览器里还没有保存的编排。'
      return
    }
    const layout = JSON.parse(raw)
    if (layout?.version !== 1 || !Array.isArray(layout.parts) || layout.parts.length > MAX_PARTS ||
      !Number.isFinite(layout.emitterX) || !Number.isFinite(layout.tempo) ||
      !layout.parts.every(part => part && ['bell', 'drum', 'ramp'].includes(part.type) &&
        typeof part.id === 'string' && Number.isFinite(part.x) && Number.isFinite(part.y) &&
        Number.isFinite(part.angle) && Number.isInteger(part.note) && part.note >= 0 && part.note < NOTES.length)) {
      throw new Error('Invalid saved layout')
    }
    stopDrag()
    resetPerformance(false)
    setParts(layout.parts.map(part => ({ ...part, ...boundedPosition(part, part.x, part.y), angle: clamp(part.angle, -75, 75) })), false)
    emitterX.value = clamp(layout.emitterX, 64, BOARD_WIDTH - 64)
    tempo.value = clamp(layout.tempo, 30, 180)
    selectedId.value = ''
    presetId.value = 'custom'
    hasSavedLayout.value = true
    dirty.value = false
    notice.value = '已恢复你保存的编排，点击开始演奏。'
  } catch {
    notice.value = '暂时无法读取保存的编排，当前画板仍可继续使用。'
  }
}

function onKeydown(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
    event.target instanceof Element && event.target.closest('input, select, textarea, button, a, [contenteditable="true"]')) return
  if (event.code === 'Space') {
    event.preventDefault()
    if (!isUnlocking.value) togglePlayback()
    return
  }
  if (event.key === 'Escape') {
    stopDrag()
    selectedId.value = ''
    return
  }
  const part = selectedPart.value
  if (!part) return
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    removeSelected()
    return
  }
  const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
  if (direction) {
    event.preventDefault()
    const step = event.shiftKey ? 20 : 5
    movePart(part.id, part.x + direction[0] * step, part.y + direction[1] * step)
  }
}

function onVisibilityChange() {
  if (document.hidden) {
    stopDrag()
    if (isRunning.value || isUnlocking.value) pausePlayback('页面已暂停。回来后点击开始，继续这段旋律。')
  }
}

onMounted(() => {
  mounted = true
  loadLayout(true)
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  mounted = false
  stopDrag()
  pausePlayback('')
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  audio.dispose()
})
</script>

<template>
  <main class="music-workshop" data-testid="music-box">
    <div class="workshop-content">
      <header class="workshop-heading">
        <div>
          <RouterLink to="/code" class="back-link">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 4-6 6 6 6M6 10h11" /></svg>
            代码与项目
          </RouterLink>
          <p class="eyebrow"><span></span> THE LITTLE SOUND WORKSHOP</p>
          <h1>音乐机关盒<span class="title-dot">。</span></h1>
          <p class="intro">摆一段轨道，让碰撞写成旋律。</p>
        </div>
        <div class="workshop-seal" aria-hidden="true">
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="19"/><path d="M32 5v8m0 38v8M5 32h8m38 0h8M19 44l8-24 10 20 9-17"/><circle cx="27" cy="20" r="3"/><circle cx="37" cy="40" r="3"/></svg>
          <span>GRAVITY × MELODY<br><strong>手作旋律实验 · 01</strong></span>
        </div>
      </header>

      <div class="workbench">
        <section class="board-panel" aria-label="音乐画板与演奏控制">
          <div class="board-toolbar">
            <div class="transport">
              <button class="play-button" data-testid="music-play" type="button" :aria-pressed="isRunning" :disabled="isUnlocking" @click="togglePlayback">
                <svg v-if="isRunning" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v12M14 4v12" /></svg>
                <svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 11 7-11 7Z" /></svg>
                {{ isUnlocking ? '准备声音…' : isRunning ? '暂停演奏' : '开始演奏' }}
              </button>
              <button class="tool-button" data-testid="music-drop" type="button" :disabled="isUnlocking" @click="dropOne">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v7m-3-3 3 3 3-3"/><circle cx="10" cy="14.5" r="3.5"/></svg>
                投一颗
              </button>
              <button class="tool-button reset-button" data-testid="music-reset" type="button" @click="resetPerformance()">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a6 6 0 1 1-1 6M4 2v5h5"/></svg>
                重置演奏
              </button>
            </div>
            <span class="play-state" :class="{ active: isRunning }"><i></i>{{ stateLabel }}</span>
          </div>

          <div class="wood-frame">
            <i v-for="corner in ['tl', 'tr', 'bl', 'br']" :key="corner" class="frame-screw" :class="corner" aria-hidden="true"></i>
            <div class="board-surface">
              <svg
                ref="board"
                class="music-board"
                data-testid="music-board"
                :viewBox="`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`"
                role="group"
                aria-label="音乐机关盒画板；选择零件后可拖动，或用方向键移动"
                @pointermove="moveDrag"
                @pointerup="stopDrag"
                @pointercancel="stopDrag"
                @lostpointercapture="stopDrag"
                @pointerdown.self="selectedId = ''"
              >
                <defs>
                  <pattern id="music-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#87795d" stroke-width="0.5" opacity="0.19"/><circle cx="0" cy="0" r="1" fill="#87795d" opacity="0.25"/></pattern>
                  <pattern id="music-major-grid" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#music-grid)"/><path d="M100 0H0V100" fill="none" stroke="#87795d" stroke-width="0.7" opacity="0.17"/></pattern>
                  <radialGradient id="music-brass" cx="32%" cy="24%" r="85%"><stop stop-color="#f7df9a"/><stop offset="0.6" stop-color="#d5b364"/><stop offset="1" stop-color="#a47a38"/></radialGradient>
                  <radialGradient id="music-marble" cx="30%" cy="25%" r="75%"><stop stop-color="#e2f4e9"/><stop offset="0.45" stop-color="#7eb7a7"/><stop offset="1" stop-color="#295e54"/></radialGradient>
                  <linearGradient id="music-rail" x2="0" y2="1"><stop stop-color="#bd925d"/><stop offset="0.45" stop-color="#916841"/><stop offset="1" stop-color="#694931"/></linearGradient>
                  <filter id="music-part-shadow" x="-50%" y="-80%" width="200%" height="260%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#564331" flood-opacity="0.2"/></filter>
                </defs>
                <rect width="800" height="600" fill="#eee6d5" @pointerdown="selectedId = ''"/>
                <rect x="20" y="20" width="760" height="560" fill="url(#music-major-grid)" pointer-events="none"/>
                <rect x="20" y="20" width="760" height="560" rx="2" fill="none" stroke="#b6aa90" stroke-width="0.8" pointer-events="none"/>
                <g class="board-rulers" aria-hidden="true" pointer-events="none">
                  <path v-for="n in 39" :key="`tick-x-${n}`" :d="`M${n * 20} 20v${n % 5 === 0 ? 8 : 4}`"/>
                  <path v-for="n in 29" :key="`tick-y-${n}`" :d="`M20 ${n * 20}h${n % 5 === 0 ? 8 : 4}`"/>
                  <text v-for="n in 7" :key="`number-${n}`" :x="n * 100" y="14" text-anchor="middle">{{ String(n * 100).padStart(3, '0') }}</text>
                  <text x="36" y="562" class="board-signature">MUSIC MECHANISM / NO. 01</text>
                  <path d="M744 554h18m-9-9v18"/>
                  <text x="741" y="535" text-anchor="end">重力 ↓</text>
                </g>

                <g :transform="`translate(${emitterX} 0)`" class="emitter" aria-hidden="true" pointer-events="none">
                  <path d="M0 45v30" stroke="#5c8b7c" stroke-width="1.4" stroke-dasharray="3 5" opacity="0.55"/>
                  <rect x="-22" y="0" width="44" height="12" rx="3" fill="#55422e"/>
                  <path d="M-17 10H17L9 34H-9Z" fill="url(#music-brass)" stroke="#a27d43" stroke-width="1.2"/>
                  <path d="M-12 14H12M-9 18H9" stroke="#f5dda4" stroke-width="1.3" opacity="0.7"/>
                  <rect x="-10" y="29" width="20" height="8" rx="3" fill="#886637"/>
                  <circle cx="0" cy="38" r="5" fill="url(#music-marble)"/>
                </g>

                <g v-if="!parts.length" class="empty-board" pointer-events="none" aria-hidden="true">
                  <circle cx="400" cy="252" r="36" fill="none" stroke="#b8ad96" stroke-width="1.2" stroke-dasharray="4 6"/>
                  <path d="M388 252h24m-12-12v24" stroke="#a39981" stroke-width="1.6"/>
                  <text x="400" y="317" text-anchor="middle">给第一颗弹珠，安排一次相遇。</text>
                  <text x="400" y="345" text-anchor="middle" class="empty-hint">从零件匣加入铃铛、鼓或斜坡</text>
                </g>

                <g
                  v-for="(part, index) in parts"
                  :key="part.id"
                  class="music-part"
                  :class="{ selected: selectedId === part.id, dragging: draggingId === part.id }"
                  data-testid="music-part"
                  :data-part-id="part.id"
                  :data-type="part.type"
                  :data-x="part.x"
                  :data-y="part.y"
                  :transform="`translate(${part.x} ${part.y}) rotate(${part.type === 'ramp' ? part.angle : 0})`"
                  tabindex="0"
                  role="button"
                  :aria-label="`${partName(part, index)}，位置 ${Math.round(part.x)}，${Math.round(part.y)}；可拖动或用方向键移动`"
                  :aria-pressed="selectedId === part.id"
                  @focus="selectedId = part.id"
                  @pointerdown.stop="startDrag($event, part)"
                  @keydown.enter.stop.prevent="selectedId = part.id"
                  @keydown.space.stop.prevent="selectedId = part.id"
                >
                  <title>{{ partName(part, index) }} · 拖动调整位置</title>
                  <template v-if="part.type === 'ramp'">
                    <rect x="-70" y="-25" width="140" height="50" rx="8" fill="transparent"/>
                    <rect v-if="selectedId === part.id" class="selection-outline" x="-65" y="-15" width="130" height="30" rx="8"/>
                    <g filter="url(#music-part-shadow)" pointer-events="none">
                      <rect x="-58" y="-6" width="116" height="12" rx="5" fill="url(#music-rail)" stroke="#785334" stroke-width="1.2"/>
                      <path d="M-52-3H52" stroke="#ddbd7f" stroke-width="2" stroke-linecap="round"/>
                      <path d="M-47 3H47" stroke="#66472f" stroke-width="0.8" opacity="0.55"/>
                      <circle v-for="x in [-50, 50]" :key="x" :cx="x" r="3.2" fill="#caaa68" stroke="#795832" stroke-width="0.8"/>
                      <path d="M-52 0h4m96 0h4" stroke="#76512d" stroke-width="0.8"/>
                    </g>
                  </template>
                  <template v-else>
                    <circle :r="part.type === 'drum' ? 36 : 32" fill="transparent"/>
                    <circle v-if="selectedId === part.id" class="selection-outline" :r="part.type === 'drum' ? 34 : 30"/>
                    <circle v-if="hitFlashes[part.id]" :key="hitFlashes[part.id]" class="impact-ring" :r="part.type === 'drum' ? 29 : 25" pointer-events="none"/>
                    <g v-if="part.type === 'bell'" filter="url(#music-part-shadow)" pointer-events="none">
                      <circle r="22" fill="url(#music-brass)" stroke="#a78240" stroke-width="1.3"/>
                      <circle r="17.5" fill="none" stroke="#f6dfa3" stroke-width="1"/>
                      <circle r="14.5" fill="none" stroke="#ac843f" stroke-width="0.7" opacity="0.65"/>
                      <path d="M-8-17a19 19 0 0 1 16 0" fill="none" stroke="#fff0c7" stroke-width="1.8" stroke-linecap="round"/>
                      <text y="4.2" text-anchor="middle" class="bell-note">{{ NOTES[part.note]?.label }}</text>
                      <circle cy="-10" r="1.5" fill="#87632f"/>
                    </g>
                    <g v-else filter="url(#music-part-shadow)" pointer-events="none">
                      <circle r="26" fill="#976b51" stroke="#70513c" stroke-width="1.3"/>
                      <circle r="22" fill="#e1ccb0" stroke="#bd9672" stroke-width="1.3"/>
                      <circle r="17.5" fill="none" stroke="#c7ae8c" stroke-width="0.8"/>
                      <path d="M-4-10h8m-12 20H8" stroke="#b39772" stroke-width="0.8"/>
                      <circle v-for="angle in [0, 60, 120, 180, 240, 300]" :key="angle" cx="0" cy="-24" r="1.5" :transform="`rotate(${angle})`" fill="#e7c995"/>
                      <text y="4" text-anchor="middle" class="drum-note">{{ NOTES[part.note]?.label }}</text>
                    </g>
                  </template>
                </g>

                <g class="marbles" pointer-events="none" aria-hidden="true">
                  <polyline v-for="ball in balls" :key="`trail-${ball.id}`" class="marble-trail" :points="trailPoints(ball)"/>
                  <circle v-for="ball in balls" :key="ball.id" data-testid="music-ball" :cx="ball.x" :cy="ball.y" r="7" fill="url(#music-marble)" stroke="#285b4f" stroke-width="0.8"/>
                </g>
              </svg>
            </div>
          </div>

          <div class="board-bottom">
            <div class="board-stats">
              <span><i class="stat-dot"></i>碰撞 <strong data-testid="music-hit-count">{{ hitCount }}</strong></span>
              <span>最近一音 <strong>{{ lastNote }}</strong></span>
              <span class="part-count">零件 <strong>{{ String(parts.length).padStart(2, '0') }}</strong></span>
            </div>
            <span class="board-coordinate" aria-hidden="true">800 × 600</span>
          </div>
          <p class="status-message" role="status"><span aria-hidden="true">↳</span>{{ notice }}</p>
        </section>

        <aside class="console" aria-label="音乐机关盒零件与设置">
          <section class="console-section preset-section">
            <div class="section-heading"><h2>旋律草稿</h2><span>01 / SCENE</span></div>
            <label class="sr-only" for="music-preset">选择预设编排</label>
            <select id="music-preset" v-model="presetId" data-testid="music-preset" @change="loadPreset">
              <option v-if="presetId === 'custom'" value="custom" disabled>我的编排</option>
              <option v-for="preset in PRESETS" :key="preset.id" :value="preset.id">{{ preset.name }}</option>
            </select>
            <p class="section-description">{{ currentPreset?.description || '一点点挪动，就会遇见不一样的旋律。' }}</p>
          </section>

          <section class="console-section">
            <div class="section-heading"><h2>零件匣</h2><span>02 / PARTS</span></div>
            <div class="parts-palette">
              <button v-for="item in partTypes" :key="item.type" :data-testid="`music-add-${item.type}`" type="button" :aria-label="`加入${item.name}：${item.hint}`" @click="addPart(item.type)">
                <svg viewBox="0 0 40 32" aria-hidden="true">
                  <g v-if="item.type === 'bell'"><circle cx="20" cy="16" r="11" fill="#cfac64" stroke="#ead19b"/><circle cx="20" cy="16" r="7" fill="none" stroke="#947136"/><path d="M18 12v8m4-8v8" stroke="#88642e" stroke-width="1.2"/></g>
                  <g v-else-if="item.type === 'drum'"><circle cx="20" cy="16" r="12" fill="#9f7459" stroke="#c29a73"/><circle cx="20" cy="16" r="9" fill="#ddc6a6"/><path d="M16 14h8m-8 4h8" stroke="#aa8c68"/></g>
                  <g v-else transform="rotate(-20 20 16)"><rect x="3" y="13" width="34" height="6" rx="3" fill="#9a714b" stroke="#c5a36e"/><circle cx="8" cy="16" r="1.3" fill="#e0c187"/><circle cx="32" cy="16" r="1.3" fill="#e0c187"/></g>
                </svg>
                <span>{{ item.name }}<b aria-hidden="true">＋</b></span>
              </button>
            </div>
            <p class="quiet-hint">点击加入 · 拖动摆放</p>
          </section>

          <section class="console-section properties-section">
            <div class="section-heading"><h2>调整零件</h2><span>03 / TUNE</span></div>
            <label class="sr-only" for="music-selection">选择要调整的零件</label>
            <select id="music-selection" v-model="selectedId" data-testid="music-selection">
              <option value="">在画板上选择，或从这里选取</option>
              <option v-for="(part, index) in parts" :key="part.id" :value="part.id">{{ partName(part, index) }}</option>
            </select>
            <div v-if="selectedPart" class="selected-properties">
              <template v-if="selectedPart.type === 'ramp'">
                <label class="control-label" for="music-angle">斜坡角度 <output>{{ selectedPart.angle }}<small>°</small></output></label>
                <input id="music-angle" data-testid="music-angle" type="range" min="-75" max="75" step="1" :value="selectedPart.angle" @input="updateSelected('angle', $event.target.value)" />
                <div class="range-labels"><span>左低</span><span>水平</span><span>右低</span></div>
              </template>
              <template v-else>
                <label class="control-label" for="music-note">{{ selectedPart.type === 'bell' ? '铃铛音符' : '鼓的音高' }}<span>五声音阶</span></label>
                <select id="music-note" data-testid="music-note" :value="selectedPart.note" @change="updateSelected('note', $event.target.value)">
                  <option v-for="(note, index) in NOTES" :key="note.label" :value="index">{{ note.label }}</option>
                </select>
              </template>
              <div class="part-properties-footer"><span>X {{ Math.round(selectedPart.x) }} <i>·</i> Y {{ Math.round(selectedPart.y) }}</span><button class="delete-button" data-testid="music-delete" type="button" @click="removeSelected"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4m2-4v4"/></svg>移除</button></div>
            </div>
            <div v-else class="selection-placeholder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 13 9-6 1-3 6Z"/><path d="m13 13 4 7"/></svg><p>选一枚零件，<br>听见自己的小小改动。</p></div>
          </section>

          <section class="console-section playback-section">
            <div class="section-heading"><h2>演奏设定</h2><span>04 / PLAY</span></div>
            <label class="control-label" for="music-tempo">投球速度 <output>{{ tempo }}<small>BPM</small></output></label>
            <input id="music-tempo" v-model.number="tempo" data-testid="music-tempo" type="range" min="30" max="180" step="1" @input="markSettingsEdited" />
            <div class="range-labels"><span>从容</span><span>轻快</span></div>
            <label class="control-label emitter-label" for="music-emitter">落球位置 <output>{{ Math.round(emitterX) }}</output></label>
            <input id="music-emitter" v-model.number="emitterX" data-testid="music-emitter" type="range" min="64" max="736" step="1" @input="markSettingsEdited" />
            <div class="volume-controls">
              <button class="mute-button" data-testid="music-mute" type="button" :aria-label="muted ? '开启声音' : '静音'" :aria-pressed="muted" @click="toggleMuted">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path v-if="muted" d="m17 9 5 6m0-6-5 6"/><path v-else d="M17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>
              </button>
              <label class="sr-only" for="music-volume">音量</label>
              <input id="music-volume" v-model.number="volume" data-testid="music-volume" type="range" min="0" max="100" step="1" @input="updateVolume" />
              <output class="volume-value">{{ muted ? '静音' : `${volume}%` }}</output>
            </div>
          </section>

          <section class="console-section save-section">
            <div class="save-actions">
              <button class="save-button" data-testid="music-save" type="button" @click="saveLayout"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2h10l3 3v13H3V2ZM6 2v6h8V2M6 18v-7h8v7"/></svg>保存编排<span v-if="dirty" class="unsaved-dot" aria-label="有未保存的更改"></span></button>
              <button class="load-button" data-testid="music-load" type="button" :disabled="!hasSavedLayout" @click="loadLayout(false)">读回</button>
            </div>
            <p class="quiet-hint">留在此浏览器里，随时回来续写。</p>
          </section>
        </aside>
      </div>

      <footer class="workshop-notes" aria-label="操作提示">
        <div><span class="note-number">01</span><p><strong>先听，再动手</strong>选一个草稿，点击开始，让重力接管节奏。</p></div>
        <div><span class="note-number">02</span><p><strong>给旋律一个转弯</strong>拖动零件、调整斜坡，每一次碰撞都不同。</p></div>
        <div><span class="note-number">03</span><p><strong>也可以用键盘</strong><kbd>Tab</kbd> 选零件 · <kbd>方向键</kbd> 移动 · <kbd>Delete</kbd> 移除</p></div>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.music-workshop {
  --work-bg: #142826;
  --work-panel: #1d312e;
  --work-border: #3a4b42;
  --work-ink: #eee5d1;
  --work-muted: #a3b0a3;
  --work-green: #afcfb8;
  --work-brass: #d3b378;
  min-height: calc(100vh - 72px);
  padding: 30px clamp(16px, 3.8vw, 60px) 44px;
  color: var(--work-ink);
  background: radial-gradient(ellipse at 50% 0%, #263c32 0%, transparent 60%), var(--work-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color-scheme: dark;
}
.workshop-content { max-width: 1320px; margin: 0 auto; }
.workshop-heading { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 25px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #a9b7a8; font-size: 12px; text-decoration: none; }
.back-link:hover { color: #ede4cf; text-decoration: none; }
.back-link svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; }
.eyebrow { display: flex; align-items: center; gap: 8px; margin: 20px 0 9px; color: var(--work-brass); font: 10px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 2px; }
.eyebrow span { width: 6px; height: 6px; border: 1px solid currentColor; transform: rotate(45deg); }
h1 { margin: 0; color: #f2e9d5; font-size: clamp(30px, 3.1vw, 43px); line-height: 1.25; font-weight: 570; letter-spacing: 2px; }
.title-dot { color: #d3b378; }
.intro { margin: 11px 0 0; color: #b4bfaf; font-size: 13px; letter-spacing: 1px; }
.workshop-seal { display: flex; align-items: center; gap: 15px; color: #a7b29b; padding-top: 25px; }
.workshop-seal svg { width: 64px; height: 64px; fill: none; stroke: #9b9f78; stroke-width: 1; opacity: 0.72; }
.workshop-seal span { font: 9px/2 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1.4px; }
.workshop-seal strong { font: 11px/2 inherit; font-weight: 400; letter-spacing: 1px; }
.workbench { display: grid; grid-template-columns: minmax(0, 1fr) 282px; align-items: start; gap: 18px; }
.board-panel { min-width: 0; }
.board-toolbar { min-height: 59px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 0 1px 13px; }
.transport { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
button { cursor: pointer; }
button, select, input { max-width: 100%; }
button:disabled { cursor: default; opacity: 0.45; }
button:focus-visible, select:focus-visible, input:focus-visible, a:focus-visible { outline: 2px solid #e8c991; outline-offset: 4px; }
.play-button, .tool-button, .save-button, .load-button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 5px; font-size: 12px; transition: background-color 150ms, border-color 150ms; }
.play-button { padding: 0 18px; border: 1px solid #c9dfc6; color: #203d31; background: #bdd4b9; font-weight: 650; box-shadow: 0 2px 0 #0c1d18; }
.play-button:hover:not(:disabled) { background: #d0e3c9; }
.play-button svg { width: 15px; height: 15px; fill: currentColor; stroke: currentColor; stroke-width: 2; stroke-linecap: square; }
.tool-button { padding: 0 12px; border: 1px solid #4d5c4d; color: #d8ddca; background: #233930; }
.tool-button:hover:not(:disabled) { background: #304b3e; border-color: #7c8c71; }
.tool-button svg, .save-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.reset-button { border-color: transparent; color: #adb9a9; background: transparent; padding-inline: 9px; }
.play-state { display: inline-flex; align-items: center; gap: 6px; padding: 0 4px; font-size: 10px; color: #a5b6a5; white-space: nowrap; }
.play-state i { display: block; width: 5px; height: 5px; border-radius: 50%; background: #849580; }
.play-state.active { color: #c1dab5; }
.play-state.active i { background: #b6d2a3; box-shadow: 0 0 8px #c8dea448; }
.wood-frame { position: relative; padding: 13px; border: 1px solid #aa8756; border-radius: 10px; background: repeating-linear-gradient(4deg, transparent 0, transparent 7px, #e4bc6f08 8px, transparent 10px), linear-gradient(135deg, #987544, #654c32 48%, #9d7949); box-shadow: 0 16px 35px #06181435, inset 0 1px 0 #ddbe80, inset 0 -2px 0 #42331e; }
.board-surface { overflow: hidden; border-radius: 3px; border: 1px solid #54442e; background: #eee6d5; box-shadow: 0 0 0 2px #b6925d, 0 0 0 3px #644c32, inset 0 2px 7px #80654050; }
.music-board { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; overflow: hidden; user-select: none; -webkit-user-select: none; }
.frame-screw { position: absolute; z-index: 1; width: 6px; height: 6px; border-radius: 50%; border: 1px solid #59452a; background: #c7a56c; box-shadow: inset 1px 1px 1px #f2dbaa; }
.frame-screw::after { content: ''; position: absolute; top: 2px; left: 0; right: 0; height: 1px; background: #80643c; transform: rotate(-35deg); }
.frame-screw.tl { top: 4px; left: 4px; }.frame-screw.tr { top: 4px; right: 4px; }.frame-screw.bl { bottom: 4px; left: 4px; }.frame-screw.br { bottom: 4px; right: 4px; }
.board-rulers { fill: #92866d; stroke: #ab9d82; stroke-width: 0.8; font: 8px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1px; }
.board-rulers text { stroke: none; }
.board-rulers .board-signature { font-size: 8.5px; letter-spacing: 2px; fill: #95866a; }
.music-part { cursor: grab; touch-action: none; outline: none; }
.music-part.dragging { cursor: grabbing; }
.music-part:focus-visible .selection-outline { stroke-width: 2.4; stroke-dasharray: none; }
.selection-outline { fill: #367d6810; stroke: #3c8069; stroke-width: 1.4; stroke-dasharray: 3 3; pointer-events: none; }
.impact-ring { fill: none; stroke: #5e9b79; stroke-width: 2; transform-origin: 0 0; animation: music-impact 480ms ease-out both; }
@keyframes music-impact { from { opacity: 0.85; transform: scale(1); } to { opacity: 0; transform: scale(1.8); } }
.bell-note, .drum-note { fill: #6b4e28; font: 600 11px ui-monospace, SFMono-Regular, Consolas, monospace; }
.drum-note { fill: #7c6048; font-size: 11px; }
.marble-trail { fill: none; stroke: #5d9e8c; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; opacity: 0.19; }
.empty-board { fill: #91836a; font-size: 17px; letter-spacing: 1px; }
.empty-board .empty-hint { fill: #aa9d84; font-size: 12px; letter-spacing: 0.5px; }
.board-bottom { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 5px; border-bottom: 1px solid #34483e; }
.board-stats { display: flex; align-items: center; gap: 23px; flex-wrap: wrap; font-size: 10px; color: #a9b5a4; }
.board-stats > span { display: inline-flex; align-items: center; gap: 8px; }
.board-stats strong { color: #d7dfca; font: 12px ui-monospace, SFMono-Regular, Consolas, monospace; }
.stat-dot { width: 5px; height: 5px; border-radius: 50%; background: #bf9d62; }
.board-coordinate { font: 9px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1px; color: #859882; }
.status-message { display: flex; align-items: baseline; gap: 8px; margin: 11px 4px 0; min-height: 36px; color: #aebca9; font-size: 11px; line-height: 1.8; }
.status-message > span { color: #bda16d; font-size: 16px; }
.console { border: 1px solid #415243; border-radius: 8px; background: linear-gradient(140deg, #24392e, #1b302b); box-shadow: 0 8px 20px #0b1e1a20; overflow: hidden; }
.console-section { padding: 18px 18px 16px; border-bottom: 1px solid #3b4d3f; }
.console-section:last-child { border-bottom: none; }
.section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 13px; }
.section-heading h2 { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.7px; color: #e1dec7; }
.section-heading > span { color: #92a18a; font: 8px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 1px; }
select { width: 100%; min-width: 0; min-height: 38px; padding: 7px 10px; border: 1px solid #52604a; border-radius: 4px; background: #1a2c25; color: #d8dcc7; font-size: 11px; cursor: pointer; }
option { background: #1a2c25; color: #eee5d1; }
.section-description { margin: 9px 1px 0; min-height: 31px; font-size: 10px; line-height: 1.7; color: #a1b09a; }
.parts-palette { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.parts-palette button { display: flex; flex-direction: column; align-items: center; gap: 5px; min-height: 71px; padding: 7px 3px 9px; border: 1px solid #53604b; border-radius: 5px; background: #304033; color: #e5dcc2; transition: background-color 150ms, border-color 150ms; }
.parts-palette button:hover { background: #3c4e3e; border-color: #9a9b75; }
.parts-palette svg { width: 39px; height: 32px; }
.parts-palette button > span { display: inline-flex; align-items: center; gap: 9px; font-size: 11px; }
.parts-palette b { font-size: 12px; font-weight: 400; color: #a0ae91; }
.quiet-hint { margin: 9px 0 0; font-size: 10px; line-height: 1.6; color: #9caa94; }
.properties-section { min-height: 211px; }
.selected-properties { padding-top: 12px; }
.control-label { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 7px; font-size: 11px; color: #c4cdb7; }
.control-label output { color: #e3d4ae; font: 12px ui-monospace, SFMono-Regular, Consolas, monospace; }
.control-label output small { margin-left: 4px; font-size: 8px; color: #aeb597; }
.control-label > span { color: #8fa38b; font-size: 9px; }
input[type='range'] { appearance: none; -webkit-appearance: none; width: 100%; height: 21px; margin: 0; background: transparent; cursor: pointer; accent-color: #c5c89c; }
input[type='range']::-webkit-slider-runnable-track { height: 3px; border-radius: 4px; background: #65745a; }
input[type='range']::-moz-range-track { height: 3px; border-radius: 4px; background: #65745a; }
input[type='range']::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; margin-top: -5px; width: 13px; height: 13px; border: 2px solid #e6d8ab; border-radius: 50%; background: #a4b28d; box-shadow: 0 1px 3px #0c2019; }
input[type='range']::-moz-range-thumb { width: 10px; height: 10px; border: 2px solid #e6d8ab; border-radius: 50%; background: #a4b28d; }
.range-labels { display: flex; justify-content: space-between; color: #93a38a; font-size: 9px; line-height: 1.4; }
.part-properties-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 9px; }
.part-properties-footer > span { color: #93a38b; font: 9px ui-monospace, SFMono-Regular, Consolas, monospace; }
.part-properties-footer i { padding-inline: 3px; font-style: normal; }
.delete-button { display: flex; align-items: center; gap: 5px; min-height: 34px; border: 0; padding: 3px 0 3px 8px; color: #d5b8a1; background: transparent; font-size: 10px; }
.delete-button:hover { color: #f5c2a6; }
.delete-button svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.selection-placeholder { display: flex; align-items: center; gap: 13px; padding: 21px 8px 5px; color: #95a58d; }
.selection-placeholder svg { width: 25px; height: 25px; fill: none; stroke: #b3b68b; stroke-width: 1.2; }
.selection-placeholder p { margin: 0; font-size: 10px; line-height: 1.9; }
.emitter-label { margin-top: 15px; }
.volume-controls { display: flex; align-items: center; gap: 9px; margin-top: 9px; }
.volume-controls input { min-width: 0; }
.mute-button { flex: 0 0 33px; display: grid; place-items: center; min-height: 34px; padding: 3px; color: #beccaf; background: transparent; border: 1px solid transparent; border-radius: 4px; }
.mute-button:hover { background: #32473a; border-color: #5a6a51; }
.mute-button[aria-pressed='true'] { color: #a59a85; }
.mute-button svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.volume-value { min-width: 31px; color: #b1bea3; text-align: right; font: 9px ui-monospace, SFMono-Regular, Consolas, monospace; }
.save-section { padding-top: 14px; padding-bottom: 14px; }
.save-actions { display: flex; gap: 8px; }
.save-button { flex: 1; padding: 0 10px; min-height: 37px; border: 1px solid #758165; background: #354c3c; color: #dfdec1; font-size: 11px; }
.save-button:hover { background: #435c46; }
.unsaved-dot { width: 5px; height: 5px; border-radius: 50%; background: #d9bb73; }
.load-button { padding: 0 11px; min-height: 37px; border: 1px solid #4b5e48; background: transparent; color: #b7c3a8; font-size: 11px; }
.load-button:hover:not(:disabled) { background: #2c4535; }
.workshop-notes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; margin-top: 28px; padding-top: 22px; border-top: 1px solid #36493e; }
.workshop-notes > div { display: flex; align-items: start; gap: 13px; }
.note-number { padding-top: 2px; color: #bc9d66; font: 11px/1.7 ui-monospace, SFMono-Regular, Consolas, monospace; }
.workshop-notes p { margin: 0; color: #9cad98; font-size: 10px; line-height: 1.9; }
.workshop-notes strong { display: block; color: #cdd3bd; font-size: 11px; font-weight: 500; margin-bottom: 3px; }
kbd { font: inherit; color: #c7cbb5; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (min-width: 1500px) { .music-workshop { padding-top: 36px; } .workshop-heading { margin-bottom: 30px; } }
@media (max-width: 1100px) { .workbench { grid-template-columns: minmax(0, 1fr) 254px; gap: 14px; } .console-section { padding-inline: 14px; } .play-state { display: none; } .board-stats { gap: 16px; } .board-coordinate { display: none; } .workshop-seal { gap: 9px; } }
@media (max-width: 850px) {
  .music-workshop { padding: 24px 20px 32px; }
  .workshop-heading { margin-bottom: 24px; }
  .workshop-seal span { display: none; }
  .workbench { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  .play-state { display: inline-flex; }
  .board-toolbar { min-height: 56px; }
  .console { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .console-section { padding: 18px; }
  .console-section:nth-child(odd) { border-right: 1px solid #3b4d3f; }
  .preset-section { min-height: 170px; }
  .properties-section { min-height: 227px; }
  .save-section { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 18px; border-right: none !important; }
  .save-actions { flex: 0 1 270px; }
  .save-section .quiet-hint { margin: 0; }
  .workshop-notes { gap: 18px; margin-top: 23px; }
}
@media (max-width: 520px) {
  .music-workshop { padding: 19px 14px 28px; }
  .workshop-heading { gap: 10px; margin-bottom: 21px; }
  .eyebrow { font-size: 8px; letter-spacing: 1.3px; margin-top: 17px; }
  .intro { font-size: 12px; letter-spacing: 0.6px; }
  .workshop-seal { align-self: flex-end; padding: 0 0 8px; }
  .workshop-seal svg { width: 44px; height: 44px; }
  .transport { flex: 1; gap: 5px; }
  .play-button { padding-inline: 12px; min-height: 44px; font-size: 11px; }
  .tool-button { padding-inline: 8px; min-height: 44px; font-size: 11px; gap: 4px; }
  .play-button svg, .tool-button svg { width: 14px; height: 14px; }
  .play-state { display: none; }
  .wood-frame { padding: 9px; border-radius: 8px; }
  .frame-screw { width: 5px; height: 5px; }
  .frame-screw.tl { top: 2px; left: 2px; }.frame-screw.tr { top: 2px; right: 2px; }.frame-screw.bl { bottom: 2px; left: 2px; }.frame-screw.br { bottom: 2px; right: 2px; }
  .board-bottom { min-height: 43px; padding-inline: 1px; }
  .board-stats { font-size: 9px; gap: 13px; }
  .board-stats > span { gap: 6px; }
  .board-stats strong { font-size: 10px; }
  .status-message { font-size: 10px; margin: 8px 1px 0; min-height: 36px; }
  .console-section { padding: 16px 12px; }
  .section-heading { margin-bottom: 11px; }
  .section-heading h2 { font-size: 11px; }
  .section-heading > span { font-size: 7px; letter-spacing: 0.2px; }
  select { min-height: 42px; font-size: 10px; padding: 7px 6px; }
  .parts-palette { gap: 5px; }
  .parts-palette button { min-height: 70px; padding-inline: 0; }
  .parts-palette svg { width: 34px; }
  .parts-palette button > span { gap: 2px; font-size: 10px; }
  .parts-palette b { font-size: 10px; }
  .preset-section { min-height: 166px; }
  .section-description, .quiet-hint { font-size: 9px; }
  .control-label { font-size: 10px; }
  .control-label output { font-size: 11px; }
  .properties-section { min-height: 235px; }
  .selection-placeholder { padding: 18px 1px 0; gap: 8px; }
  .selection-placeholder p { font-size: 9px; }
  .selection-placeholder svg { width: 20px; }
  .part-properties-footer { gap: 4px; }
  .part-properties-footer > span { font-size: 8px; }
  .delete-button { font-size: 9px; min-height: 44px; }
  .volume-controls { gap: 5px; }
  .mute-button { min-height: 44px; flex-basis: 28px; }
  .volume-value { min-width: 26px; font-size: 8px; }
  .save-section { flex-wrap: wrap; gap: 9px; }
  .save-actions { flex: 1 1 100%; }
  .save-button, .load-button { min-height: 44px; }
  .save-section .quiet-hint { width: 100%; text-align: center; }
  .workshop-notes { grid-template-columns: 1fr; gap: 14px; margin-top: 22px; padding-top: 19px; }
  .workshop-notes > div { gap: 12px; }
  .workshop-notes strong { display: inline; margin-right: 8px; }
}
@media (max-width: 350px) { .reset-button { font-size: 10px; padding-inline: 5px; } .transport { gap: 4px; } .play-button { padding-inline: 9px; } .workshop-seal { display: none; } .board-stats .part-count { display: none; } .console { grid-template-columns: minmax(0, 1fr); } .console-section:nth-child(odd) { border-right: none; } .properties-section, .preset-section { min-height: 0; } .selection-placeholder { padding-bottom: 7px; } }
@media (prefers-reduced-motion: reduce) { .music-workshop *, .music-workshop *::before, .music-workshop *::after { transition: none !important; } .impact-ring { animation: none; opacity: 0; } .marble-trail { display: none; } }
</style>
