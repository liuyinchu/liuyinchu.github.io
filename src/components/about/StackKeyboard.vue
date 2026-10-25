<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createKeyboardRenderer } from './stack-keyboard/renderer.js'

const props = defineProps({
  active: { type: Boolean, default: true },
  progress: { type: Number, default: 1 },
  paused: { type: Boolean, default: false },
})
const emit = defineEmits(['ready', 'unavailable', 'selection'])
const technologies = [
  { id: 'vue', name: 'Vue', shortcut: 'v', color: '#9bc7af', description: '把页面拆成组件，让内容与交互一起更新。' },
  { id: 'vite', name: 'Vite', shortcut: 'i', color: '#e2c38c', description: '负责本地开发、即时更新与网站构建。' },
  { id: 'javascript', name: 'JavaScript', shortcut: 'j', color: '#cda870', description: '连接滚动、按键与页面里那些细小的响应。' },
  { id: 'css', name: 'CSS', shortcut: 'c', color: '#96b9ce', description: '安排字体、留白、颜色和不同屏幕下的布局。' },
  { id: 'markdown', name: 'Markdown', shortcut: 'm', color: '#b9b7ac', description: '用轻量的文本格式，写下文章与零散的想法。' },
  { id: 'json', name: 'JSON', shortcut: 'n', color: '#b2aac9', description: '组织文章索引和页面要读取的结构化数据。' },
  { id: 'highlight', name: 'highlight.js', legend: ['highlight.js'], shortcut: 'h', color: '#a7b08b', description: '为文章中的代码片段添加语法颜色。' },
  { id: 'mermaid', name: 'Mermaid', shortcut: 'r', color: '#c598a8', description: '把文章里的文字描述，变成流程与关系图。' },
  { id: 'mathjax', name: 'MathJax', shortcut: 'x', color: '#d3c7b1', description: '在文章里排版数学公式，让符号保持清晰。' },
  { id: 'webgl', name: 'WebGL', shortcut: 'w', color: '#81b8b3', description: '在浏览器里绘制星空，以及眼前这把立体键盘。' },
  { id: 'git', name: 'Git', shortcut: 'g', color: '#cd9987', description: '记录代码与内容的每次改动，保留搭建的过程。' },
  { id: 'github-pages', name: 'GitHub Pages', legend: ['GitHub', 'Pages'], shortcut: 'p', color: '#aab5c2', description: '托管构建后的静态页面，让这个空间可以被访问。' },
]
const canvas = ref(null)
const surface = ref(null)
const selectedIndex = ref(0)
const selected = computed(() => technologies[selectedIndex.value])
const rendererState = ref('loading')
const positions = ref([])
let renderer = null
let heldPointer = -1
let heldLetter = -1

function choose(index, press = false) {
  selectedIndex.value = index
  renderer?.setState({ selected: index })
  if (press) renderer?.pulse(index)
  emit('selection', { ...technologies[index] })
}
function pointerDown(event, index) {
  if (event.button !== 0 && event.pointerType !== 'touch') return
  heldPointer = index
  choose(index)
  renderer?.press(index, true)
}
function releasePointer() {
  if (heldPointer !== -1) renderer?.press(heldPointer, false)
  heldPointer = -1
}
function releaseLetter() {
  if (heldLetter !== -1) renderer?.press(heldLetter, false)
  heldLetter = -1
}
function handleKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.key.length !== 1) return
  const index = technologies.findIndex((key) => key.shortcut === event.key.toLowerCase())
  if (index === -1) return
  event.preventDefault()
  releaseLetter()
  heldLetter = index
  choose(index)
  surface.value?.querySelectorAll('button')[index]?.focus({ preventScroll: true })
  renderer?.press(index, true)
}
function handleKeyup(event) {
  if (heldLetter !== -1 && event.key.toLowerCase() === technologies[heldLetter].shortcut) releaseLetter()
}
function onFocusOut(event) {
  if (!surface.value?.contains(event.relatedTarget)) { releaseLetter(); releasePointer() }
}
function keyStyle(index) {
  const key = technologies[index]
  const position = positions.value[index]
  if (rendererState.value !== 'ready' || !position) return { '--cap': key.color }
  return {
    '--cap': key.color,
    left: `${position.left}%`, top: `${position.top}%`,
    width: `${position.width}%`, height: `${position.height}%`,
    clipPath: `polygon(${position.polygon})`,
  }
}
watch(() => [props.active, props.progress, props.paused], () => {
  renderer?.setState({ active: props.active, progress: props.progress, paused: props.paused })
  if (!props.active) { releaseLetter(); releasePointer() }
})
onMounted(() => {
  renderer = createKeyboardRenderer(canvas.value, {
    keys: technologies,
    onReady: () => { rendererState.value = 'ready'; emit('ready') },
    onUnavailable: () => { rendererState.value = 'unavailable'; emit('unavailable') },
    onPositions: (value) => { positions.value = value },
  })
  renderer?.setState({ selected: selectedIndex.value, active: props.active, progress: props.progress, paused: props.paused })
  window.addEventListener('pointerup', releasePointer, { passive: true })
  window.addEventListener('pointercancel', releasePointer, { passive: true })
  window.addEventListener('blur', releaseLetter)
  window.addEventListener('keyup', handleKeyup)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerup', releasePointer)
  window.removeEventListener('pointercancel', releasePointer)
  window.removeEventListener('blur', releaseLetter)
  window.removeEventListener('keyup', handleKeyup)
  renderer?.dispose()
})
</script>

<template>
  <div
    class="stack-keyboard"
    :class="{ 'is-ready': rendererState === 'ready', 'is-fallback': rendererState === 'unavailable' }"
    role="group"
    aria-label="技术栈键盘"
    data-testid="stack-keyboard"
    :data-renderer="rendererState"
    :data-selected="selected.id"
  >
    <div ref="surface" class="stack-keyboard__surface" @keydown="handleKeydown" @focusout="onFocusOut">
      <canvas ref="canvas" class="stack-keyboard__canvas" aria-hidden="true" data-testid="stack-keyboard-canvas"></canvas>
      <div class="stack-keyboard__keys" aria-label="选择一种技术">
        <button
          v-for="(key, index) in technologies"
          :key="key.id"
          type="button"
          class="stack-keyboard__key"
          :class="{ 'is-selected': index === selectedIndex }"
          :style="keyStyle(index)"
          :aria-label="key.name + '，快捷键 ' + key.shortcut.toUpperCase()"
          :aria-pressed="index === selectedIndex"
          @pointerenter="choose(index, true)"
          @pointerdown="pointerDown($event, index)"
          @pointercancel="releasePointer"
          @focus="choose(index)"
          @click="choose(index, true)"
        >
          <span class="stack-keyboard__shortcut" aria-hidden="true">{{ key.shortcut.toUpperCase() }}</span>
          <span class="stack-keyboard__legend" aria-hidden="true">{{ key.name }}</span>
        </button>
      </div>
    </div>
    <div class="stack-keyboard__information">
      <span class="stack-keyboard__eyebrow">用来搭建这里</span>
      <div class="stack-keyboard__selection" aria-live="polite" aria-atomic="true">
        <h3 data-testid="stack-selection-title">{{ selected.name }}</h3>
        <p data-testid="stack-selection-description">{{ selected.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack-keyboard {
  display: grid;
  grid-template-columns: minmax(0, 2.7fr) minmax(172px, 1fr);
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2.75rem);
  width: 100%;
  min-height: 440px;
  color: #f2eee6;
}
.stack-keyboard__surface {
  position: relative;
  height: clamp(350px, 36vw, 490px);
  min-width: 0;
  touch-action: pan-y;
}
.stack-keyboard__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  pointer-events: none;
}
.is-ready .stack-keyboard__canvas { visibility: visible; }
.stack-keyboard__keys {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
  padding: 25px 20px;
  align-content: center;
  height: 100%;
  box-sizing: border-box;
}
.stack-keyboard__key {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 77px;
  padding: 12px 7px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .22);
  border-bottom: 5px solid rgba(17, 24, 30, .48);
  border-radius: 11px;
  background: var(--cap);
  color: #1c2328;
  font: 600 12px/1.3 Arial, sans-serif;
  cursor: pointer;
  touch-action: pan-y;
}
.stack-keyboard__key:focus-visible { outline: 2px solid #fff7de; outline-offset: 4px; }
.stack-keyboard__key.is-selected { box-shadow: 0 0 0 2px #ece3d0; }
.stack-keyboard__key:active { transform: translateY(3px); }
.stack-keyboard__shortcut { position: absolute; top: 8px; left: 10px; font-size: 10px; font-weight: 400; opacity: .72; }
.stack-keyboard__legend { overflow-wrap: anywhere; }
.is-ready .stack-keyboard__keys { position: absolute; inset: 0; display: block; padding: 0; }
.is-ready .stack-keyboard__key {
  position: absolute;
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: transparent;
  box-shadow: none;
  transform: none;
}
.is-ready .stack-keyboard__key > span { opacity: 0; }
.is-ready .stack-keyboard__key:focus-visible { background: rgba(255, 247, 222, .20); outline: 0; }
.stack-keyboard__information { position: relative; padding-block: 24px; }
.stack-keyboard__eyebrow { display: block; margin-bottom: 19px; color: rgba(236, 229, 214, .47); font-size: .71rem; letter-spacing: .16em; }
.stack-keyboard__selection { min-height: 133px; }
.stack-keyboard__selection h3 { margin: 0 0 15px; color: #f5efe4; font-size: clamp(1.8rem, 2.9vw, 2.8rem); font-weight: 500; letter-spacing: -.035em; line-height: 1.1; overflow-wrap: anywhere; }
.stack-keyboard__selection p { margin: 0; max-width: 23ch; color: rgba(237, 231, 219, .72); font-size: .89rem; line-height: 1.9; }
@media (max-width: 760px) {
  .stack-keyboard { grid-template-columns: minmax(0, 1fr); gap: 0; min-height: 0; }
  .stack-keyboard__surface { height: clamp(285px, 78vw, 390px); }
  .stack-keyboard__information { padding: 0 16px 12px; }
  .stack-keyboard__eyebrow { margin-bottom: 13px; }
  .stack-keyboard__selection { min-height: 99px; }
  .stack-keyboard__selection h3 { font-size: 2rem; margin-bottom: 11px; }
  .stack-keyboard__selection p { max-width: 34ch; font-size: .85rem; }
  .stack-keyboard__keys { gap: 9px; padding: 20px 12px; }
  .stack-keyboard__key { min-height: 72px; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .stack-keyboard__key:active { transform: none; }
}
</style>
