<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createStellarRenderer } from './stellar-field/renderer.js'
import { ABOUT_NODES, getAboutView } from './stellar-field/about-shapes.js'

const props = defineProps({
  profile: { type: String, default: 'stellar' },
  progress: { type: Number, default: 0 },
  paused: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
  activeNode: { type: String, default: '' },
})
const emit = defineEmits(['ready', 'unavailable', 'anchors'])
const canvas = ref(null)
const status = ref('initializing')
const fallbackSize = ref({ width: 1, height: 1 })
const phase = computed(() => {
  const p = Math.max(0, Math.min(1, props.progress))
  if (props.profile === 'about') {
    if (p < .1) return 'orbit'
    if (p < .3) return 'expression'
    if (p < .5) return 'framework'
    if (p < .7) return 'contents'
    if (p < .9) return 'field'
    return 'open'
  }
  if (p < .125) return 'six'
  if (p < .375) return 'scatter'
  if (p < .625) return 'cursor'
  if (p < .875) return 'scatter'
  return 'blossom'
})
const description = computed(() => ({
  orbit: '倾斜交错的立体星尘轨道',
  expression: '星尘组成的戴圆眼镜露齿笑脸，旁边举起一根食指',
  framework: '由星尘搭起的立体建造框架',
  contents: '由书页、对话泡、资源光环和立体方块组成的四簇内容星图',
  field: '舒展到四周、为键盘让出中央空间的星域',
  open: '向远处舒展的开放星空',
  six: '由星尘组成的数字 6',
  scatter: '向边缘散开的星尘',
  cursor: '由星尘组成的导航箭头',
  blossom: '六瓣交织的星尘花结',
})[phase.value])
const fallbackTransform = computed(() => {
  if (props.profile !== 'about') return undefined
  const { width, height } = fallbackSize.value
  const { scene, offsetX } = getAboutView(width, height, props.progress)
  return `translate(${width / 2 - offsetX} ${height / 2}) scale(${scene / 90})`
})
let renderer
let fallbackObserver

function updateFallbackAnchors() {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  fallbackSize.value = { width, height }
  if (props.profile !== 'about' || status.value !== 'unavailable') return
  const { scene, offsetX } = getAboutView(width, height, props.progress)
  emit('anchors', ABOUT_NODES.map((node) => ({
    id: node.id,
    x: .5 + (node.position[0] * scene - offsetX) / width,
    y: .5 - node.position[1] * scene / height,
    visible: phase.value === 'contents',
  })))
}
function initializeRenderer() {
  renderer?.destroy()
  status.value = 'initializing'
  renderer = createStellarRenderer(canvas.value, {
    profile: props.profile,
    onReady() { status.value = 'webgl2'; emit('ready') },
    onUnavailable() { status.value = 'unavailable'; emit('unavailable'); updateFallbackAnchors() },
    onAnchors(anchors) { emit('anchors', anchors) },
  })
  renderer?.update(props)
}
onMounted(() => {
  initializeRenderer()
  fallbackObserver = new ResizeObserver(updateFallbackAnchors)
  fallbackObserver.observe(canvas.value)
})
watch(() => props.profile, initializeRenderer)
watch(() => [props.progress, props.paused, props.interactive, props.activeNode], () => {
  renderer?.update(props)
  if (status.value === 'unavailable') updateFallbackAnchors()
})
onBeforeUnmount(() => {
  renderer?.destroy()
  fallbackObserver?.disconnect()
})
defineExpose({
  replay: () => renderer?.replay(),
  resetView: () => renderer?.resetView(),
  getCanvasRect: () => canvas.value?.getBoundingClientRect(),
})
</script>

<template>
  <div
    class="stellar-field"
    :data-renderer="status"
    :data-profile="profile"
    :data-active-node="activeNode"
    :data-phase="phase"
    :data-paused="paused"
    :data-progress="Math.max(0, Math.min(1, progress)).toFixed(3)"
  >
    <canvas
      ref="canvas"
      class="stellar-field__canvas"
      :class="{ 'is-interactive': interactive }"
      :tabindex="interactive && status === 'webgl2' ? 0 : -1"
      role="img"
      :aria-label="description + (interactive ? '。拖动或使用方向键旋转，Home 回正。' : '。')"
    ></canvas>
    <div v-if="status === 'unavailable'" class="stellar-field__fallback" role="img" :aria-label="description">
      <svg :viewBox="profile === 'about' ? `0 0 ${fallbackSize.width} ${fallbackSize.height}` : '-120 -120 240 240'" :class="{ 'stellar-field__about-static': profile === 'about' }" aria-hidden="true">
        <defs>
          <filter id="stellar-static-glow"><feGaussianBlur stdDeviation="1.3" /></filter>
        </defs>
        <g :transform="fallbackTransform">
        <g class="stellar-field__static-stars">
          <circle cx="-95" cy="-63" r=".6"/><circle cx="90" cy="-85" r=".7"/>
          <circle cx="108" cy="29" r=".6"/><circle cx="-103" cy="76" r=".7"/>
          <circle cx="72" cy="94" r=".5"/><circle cx="-57" cy="-96" r=".5"/>
        </g>
        <g v-if="profile === 'about'" fill="none" stroke="currentColor" stroke-width="1.1">
          <g v-if="phase === 'orbit'" stroke-dasharray=".3 2.4">
            <ellipse rx="86" ry="30" transform="rotate(-28)" />
            <ellipse rx="66" ry="40" transform="rotate(43)" />
          </g>
          <g v-else-if="phase === 'expression'" stroke-dasharray=".4 1.8">
            <circle cx="-32" cy="0" r="55" />
            <circle cx="-52" cy="-17" r="18" /><circle cx="-11" cy="-17" r="18" />
            <path d="M-34-20H-29M-88-23-70-20M7-20 23-23M-60 10A28 25 0 0 0-4 10ZM-41 10V26H-32V10M-31 10V26H-22V10M50 45H77L82 24 91 5 89-12 83-18 77-13 74-22 73-66 69-74H62L59-66V-22L51-29 43-27 40-20V-3L45 15 50 24Z" />
            <circle cx="-52" cy="-17" r="2" fill="currentColor" /><circle cx="-11" cy="-17" r="2" fill="currentColor" />
          </g>
          <g v-else-if="phase === 'framework'" stroke-dasharray=".3 2.1">
            <path d="M-71-33 9-68 75-27-5 10ZM-71-33V44L-5 83 75 47V-27M-5 10V83M9-68V8L75 47M-71 5-5 45 75 9" />
          </g>
          <g v-else-if="phase === 'contents'">
            <g v-for="node in ABOUT_NODES" :key="node.id" :transform="`translate(${node.position[0] * 90} ${-node.position[1] * 90})`" :stroke="activeNode === node.id ? '#ffd18a' : undefined">
              <path :d="node.fallbackPath" stroke-dasharray=".4 1.7" />
              <circle r="2" fill="currentColor" stroke="none" />
            </g>
          </g>
          <g v-else-if="phase === 'field' || phase === 'open'" fill="currentColor" stroke="none">
            <circle v-for="i in 38" :key="i" :cx="Math.cos(i * 2.4) * (phase === 'field' ? 90 + i % 5 * 7 : 18 + i % 7 * 17)" :cy="Math.sin(i * 2.4) * (phase === 'field' ? 78 + i % 4 * 7 : 18 + i % 7 * 14)" :r="i % 4 === 0 ? 1.1 : .55" />
          </g>
        </g>
        <g v-else-if="phase === 'six'" fill="none" stroke="currentColor">
          <path d="M54 -95 C-29 -115 -87 -17 -59 45 C-25 112 73 79 56 20 C42 -18 -25 -9 -20 37 C-15 72 38 62 23 28 C15 10 -9 20 1 33" stroke-dasharray=".3 2.7" stroke-width="2"/>
          <path d="M54 -95 C-29 -115 -87 -17 -59 45 C-25 112 73 79 56 20 C42 -18 -25 -9 -20 37" opacity=".3" filter="url(#stellar-static-glow)"/>
        </g>
        <path v-else-if="phase === 'cursor'" d="M-90 -89 Q-93 -94 -86 -91 L86 -21 Q93 -18 87 -13 L29 30 L-24 86 Q-28 92 -30 85 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray=".3 2.7"/>
        <g v-else-if="phase === 'blossom'" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray=".3 2.2">
          <path v-for="i in 6" :key="i" d="M28 16 L28 -48 A34 34 0 0 0 -40 -48 L-40 9 L28 48 Z" :transform="`rotate(${i * 60})`"/>
        </g>
        </g>
      </svg>
      <span class="stellar-field__fallback-note">当前设备显示静态星图</span>
    </div>
  </div>
</template>

<style scoped>
.stellar-field {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 1px;
  overflow: hidden;
  isolation: isolate;
  background: radial-gradient(ellipse at 51% 58%, #071118 0%, #03090d 55%, #020609 100%);
}
.stellar-field__canvas {
  display: block;
  width: 100%;
  height: 100%;
  outline-offset: -5px;
  touch-action: pan-y;
}
.stellar-field[data-renderer='unavailable'] .stellar-field__canvas { visibility: hidden; }
.stellar-field__canvas.is-interactive { cursor: grab; }
.stellar-field__canvas[data-dragging='true'] { cursor: grabbing; }
.stellar-field__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  color: #c9e5f4;
}
.stellar-field__fallback svg { width: min(90%, 650px); height: 90%; }
.stellar-field__fallback svg.stellar-field__about-static { width: 100%; height: 100%; }
.stellar-field__static-stars { fill: #c9e5f4; opacity: .65; }
.stellar-field__fallback-note {
  position: absolute;
  bottom: 1.5rem;
  color: #87a0ae;
  font-size: .75rem;
  letter-spacing: .08em;
}
</style>
