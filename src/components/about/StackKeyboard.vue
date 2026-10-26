<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createKeyboardRenderer } from './stack-keyboard/renderer.js'
import { fitCatFrame } from './stack-keyboard/geometry.js'

const props = defineProps({
  active: { type: Boolean, default: true },
  progress: { type: Number, default: 1 },
  paused: { type: Boolean, default: false },
})
const emit = defineEmits(['ready', 'unavailable', 'selection', 'layout'])
const technologies = [
  { id: 'python', name: 'Python', mark: 'PY', shortcut: 'y', color: '#c5d5b7', description: '处理数据、写小脚本，把重复步骤交给程序。' },
  { id: 'rust', name: 'Rust', mark: 'RS', shortcut: 'u', color: '#d5a68e', description: '用类型与所有权，表达更明确的程序边界。' },
  { id: 'matlab', name: 'MATLAB', mark: 'MAT', shortcut: 'a', color: '#cbb98e', description: '做矩阵运算、数值计算和结果可视化。' },
  { id: 'latex', name: 'LaTeX', mark: 'TeX', shortcut: 'l', color: '#c7cac3', description: '把公式、段落和引用整理成排版清晰的文档。' },
  { id: 'codex', name: 'Codex', mark: 'CX', shortcut: 'd', color: '#a8c6bf', description: '协助拆解任务、修改代码，并核对实现结果。' },
  { id: 'claude-code', name: 'Claude Code', mark: 'CC', shortcut: 'e', color: '#d0ab98', description: '在终端里讨论代码，推进调试与重构。' },
  { id: 'vue', name: 'Vue', mark: 'VUE', shortcut: 'v', color: '#8fb6a0', description: '用组件组织界面，让内容与交互一起更新。' },
  { id: 'vite', name: 'Vite', mark: 'VI', shortcut: 'i', color: '#d1b57e', description: '在本地即时预览改动，再把网站构建成静态文件。' },
  { id: 'javascript', name: 'JavaScript', mark: 'JS', shortcut: 'j', color: '#c4a46d', description: '连接滚动、按键与界面里那些细小的响应。' },
  { id: 'css', name: 'CSS', mark: 'CSS', shortcut: 'c', color: '#8eacbf', description: '安排字体、留白、颜色和不同屏幕下的布局。' },
  { id: 'markdown', name: 'Markdown', mark: 'MD', shortcut: 'm', color: '#b7b5a9', description: '用轻量的文本格式，写下文章与零散的想法。' },
  { id: 'json', name: 'JSON', mark: 'JSON', shortcut: 'n', color: '#aaa2bd', description: '交换结构化数据，整理配置与内容索引。' },
  { id: 'highlight', name: 'highlight.js', mark: 'HL', shortcut: 'h', color: '#a2aa87', description: '为代码片段添加语法颜色，方便阅读与分享。' },
  { id: 'mermaid', name: 'Mermaid', mark: 'MM', shortcut: 'r', color: '#ba94a1', description: '用文字画流程与关系，把思路整理成图。' },
  { id: 'mathjax', name: 'MathJax', mark: 'MX', shortcut: 'x', color: '#c9bfa9', description: '在网页中排版数学公式，让符号保持清晰。' },
  { id: 'webgl', name: 'WebGL', mark: 'GL', shortcut: 'w', color: '#80aaa6', description: '在浏览器里绘制星空、图形与可交互的三维物体。' },
  { id: 'git', name: 'Git', mark: 'GIT', shortcut: 'g', color: '#bf9283', description: '记录代码与内容的改动，保留每一步的来处。' },
  { id: 'github-pages', name: 'GitHub Pages', mark: 'GH', shortcut: 'p', color: '#9fabb9', description: '托管静态页面，把做好的小站放到网上。' },
]
const canvas = ref(null)
const surface = ref(null)
const selectedIndex = ref(0)
const selected = computed(() => technologies[selectedIndex.value])
const rendererState = ref('loading')
const positions = ref([])
let renderer = null
let layoutObserver
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
function releaseInput() { releaseLetter(); releasePointer() }
function releaseHiddenInput() { if (document.hidden) releaseInput() }
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
function getCatFrame() {
  const projected=renderer?.getCatFrame()
  if (projected) return projected
  const keys=surface.value?.querySelector('.stack-keyboard__keys')
  const buttons=keys?.querySelectorAll('button')
  if (!buttons?.length) return null
  const first=buttons[0].getBoundingClientRect()
  if (!(first.width>0 && first.height>0)) return null
  const columns=getComputedStyle(keys).gridTemplateColumns.trim().split(/\s+/).length
  const last=buttons[columns>=6?4:3].getBoundingClientRect()
  return fitCatFrame([first.left+first.width*.5,first.top+first.height*.5],
    [last.left+last.width*.5,last.top+last.height*.5])
}
function layoutAfterUpdate() { nextTick(()=>emit('layout')) }
defineExpose({ getCatFrame })
watch(() => [props.active, props.progress, props.paused], () => {
  renderer?.setState({ active: props.active, progress: props.progress, paused: props.paused })
  if (!props.active) { releaseLetter(); releasePointer() }
})
onMounted(() => {
  renderer = createKeyboardRenderer(canvas.value, {
    keys: technologies,
    onReady: () => { rendererState.value = 'ready'; emit('ready'); layoutAfterUpdate() },
    onUnavailable: () => { rendererState.value = 'unavailable'; emit('unavailable'); layoutAfterUpdate() },
    onPositions: (value) => {
      const changed=value.length!==positions.value.length || value.some((point,index)=>{
        const old=positions.value[index]
        return !old || point.left!==old.left || point.top!==old.top || point.width!==old.width || point.height!==old.height || point.polygon!==old.polygon
      })
      if (changed) { positions.value=value; emit('layout') }
    },
  })
  renderer?.setState({ selected: selectedIndex.value, active: props.active, progress: props.progress, paused: props.paused })
  layoutObserver=new ResizeObserver(()=>emit('layout'))
  layoutObserver.observe(surface.value)
  window.addEventListener('pointerup', releasePointer, { passive: true })
  window.addEventListener('pointercancel', releasePointer, { passive: true })
  window.addEventListener('blur', releaseInput)
  document.addEventListener('visibilitychange', releaseHiddenInput)
  window.addEventListener('keyup', handleKeyup)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerup', releasePointer)
  window.removeEventListener('pointercancel', releasePointer)
  window.removeEventListener('blur', releaseInput)
  document.removeEventListener('visibilitychange', releaseHiddenInput)
  window.removeEventListener('keyup', handleKeyup)
  layoutObserver?.disconnect()
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
          <span class="stack-keyboard__legend" aria-hidden="true">{{ key.mark }}</span>
        </button>
      </div>
    </div>
    <div class="stack-keyboard__information">
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
  grid-template-columns: minmax(0, 3.1fr) minmax(185px, 1fr);
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2.75rem);
  width: 100%;
  min-height: 520px;
  color: #f2eee6;
}
.stack-keyboard__surface { position: relative; height: clamp(480px, 36vw, 540px); min-width: 0; touch-action: pan-y; }
.stack-keyboard__canvas { position: absolute; inset: 0; width: 100%; height: 100%; visibility: hidden; pointer-events: none; }
.is-ready .stack-keyboard__canvas { visibility: visible; }
.stack-keyboard:not(.is-ready) .stack-keyboard__surface { height: 560px; }
.stack-keyboard:not(.is-ready) .stack-keyboard__keys { padding-top: 180px; }
.stack-keyboard__keys {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  padding: 25px 12px;
  align-content: center;
  height: 100%;
  box-sizing: border-box;
}
.stack-keyboard__key {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 85px;
  padding: 22px 4px 8px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .22);
  border-bottom: 5px solid rgba(17, 24, 30, .48);
  border-radius: 10px;
  background: var(--cap);
  color: #1c2328;
  font: 600 20px/1.2 Arial, sans-serif;
  cursor: pointer;
  touch-action: pan-y;
}
.stack-keyboard__key:focus-visible { outline: 2px solid #fff7de; outline-offset: 4px; }
.stack-keyboard__key.is-selected { box-shadow: 0 0 0 2px #ece3d0; }
.stack-keyboard__key:active { transform: translateY(3px); }
.stack-keyboard__shortcut { position: absolute; top: 7px; left: 9px; font-size: 14px; font-weight: 400; opacity: .72; }
.stack-keyboard__legend { overflow-wrap: anywhere; }
.is-ready .stack-keyboard__keys { position: absolute; inset: 0; display: block; padding: 0; }
.is-ready .stack-keyboard__key { position: absolute; min-height: 0; padding: 0; border: 0; border-radius: 0; background: transparent; color: transparent; box-shadow: none; transform: none; }
.is-ready .stack-keyboard__key > span { opacity: 0; }
.is-ready .stack-keyboard__key:focus-visible { background: rgba(255, 247, 222, .16); outline: 0; }
.stack-keyboard__information { position: relative; padding-block: 20px; }
.stack-keyboard__selection { min-height: 133px; }
.stack-keyboard__selection h3 { margin: 0 0 15px; color: #f5efe4; font-size: clamp(1.8rem, 2.9vw, 2.8rem); font-weight: 500; letter-spacing: -.035em; line-height: 1.1; overflow-wrap: anywhere; }
.stack-keyboard__selection p { margin: 0; max-width: 24ch; color: rgba(237, 231, 219, .72); font-size: max(14px, .89rem); line-height: 1.85; }
@media (max-width: 760px) {
  .stack-keyboard { grid-template-columns: minmax(0, 1fr); gap: 0; min-height: 0; }
  .stack-keyboard__information { grid-row: 1; padding: 6px 12px 0; }
  .stack-keyboard__surface { grid-row: 2; height: 520px; }
  .stack-keyboard__selection { min-height: 100px; }
  .stack-keyboard__selection h3 { font-size: 1.9rem; margin-bottom: 11px; }
  .stack-keyboard__selection p { max-width: 35ch; font-size: 14px; }
  .stack-keyboard__keys { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; padding: 12px 6px; }
  .stack-keyboard__key { min-height: 67px; font-size: 20px; }
  .stack-keyboard:not(.is-ready) .stack-keyboard__keys { padding-top: 170px; }
}
@media (prefers-reduced-motion: reduce) { .stack-keyboard__key:active { transform: none; } }
</style>
