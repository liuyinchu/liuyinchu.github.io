<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createStellarRenderer } from './stellar-field/renderer.js'

const props = defineProps({
  progress: { type: Number, default: 0 },
  paused: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
})
const emit = defineEmits(['ready', 'unavailable'])
const canvas = ref(null)
const status = ref('initializing')
const phase = computed(() => {
  const p = Math.max(0, Math.min(1, props.progress))
  if (p < .125) return 'six'
  if (p < .375) return 'scatter'
  if (p < .625) return 'cursor'
  if (p < .875) return 'scatter'
  return 'blossom'
})
const description = computed(() => ({
  six: '由星尘组成的数字 6',
  scatter: '向边缘散开的星尘',
  cursor: '由星尘组成的导航箭头',
  blossom: '六瓣交织的星尘花结',
})[phase.value])
let renderer

onMounted(() => {
  renderer = createStellarRenderer(canvas.value, {
    onReady() { status.value = 'webgl2'; emit('ready') },
    onUnavailable() { status.value = 'unavailable'; emit('unavailable') },
  })
  renderer?.update(props)
})
watch(() => [props.progress, props.paused, props.interactive], () => renderer?.update(props))
onBeforeUnmount(() => renderer?.destroy())
defineExpose({
  replay: () => renderer?.replay(),
  resetView: () => renderer?.resetView(),
})
</script>

<template>
  <div
    class="stellar-field"
    :data-renderer="status"
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
      <svg viewBox="-120 -120 240 240" aria-hidden="true">
        <defs>
          <filter id="stellar-static-glow"><feGaussianBlur stdDeviation="1.3" /></filter>
        </defs>
        <g class="stellar-field__static-stars">
          <circle cx="-95" cy="-63" r=".6"/><circle cx="90" cy="-85" r=".7"/>
          <circle cx="108" cy="29" r=".6"/><circle cx="-103" cy="76" r=".7"/>
          <circle cx="72" cy="94" r=".5"/><circle cx="-57" cy="-96" r=".5"/>
        </g>
        <g v-if="phase === 'six'" fill="none" stroke="currentColor">
          <path d="M54 -95 C-29 -115 -87 -17 -59 45 C-25 112 73 79 56 20 C42 -18 -25 -9 -20 37 C-15 72 38 62 23 28 C15 10 -9 20 1 33" stroke-dasharray=".3 2.7" stroke-width="2"/>
          <path d="M54 -95 C-29 -115 -87 -17 -59 45 C-25 112 73 79 56 20 C42 -18 -25 -9 -20 37" opacity=".3" filter="url(#stellar-static-glow)"/>
        </g>
        <path v-else-if="phase === 'cursor'" d="M-90 -89 Q-93 -94 -86 -91 L86 -21 Q93 -18 87 -13 L29 30 L-24 86 Q-28 92 -30 85 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray=".3 2.7"/>
        <g v-else-if="phase === 'blossom'" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray=".3 2.2">
          <path v-for="i in 6" :key="i" d="M28 16 L28 -48 A34 34 0 0 0 -40 -48 L-40 9 L28 48 Z" :transform="`rotate(${i * 60})`"/>
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
.stellar-field__static-stars { fill: #c9e5f4; opacity: .65; }
.stellar-field__fallback-note {
  position: absolute;
  bottom: 1.5rem;
  color: #87a0ae;
  font-size: .75rem;
  letter-spacing: .08em;
}
</style>
