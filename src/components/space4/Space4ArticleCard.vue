<script setup>
// 文章卡片：星环（orbit）与星图（grid）两种形态共用。
// grid 形态支持鼠标 3D 倾斜与光斑跟踪；orbit 形态由父组件驱动 3D 变换。
import { computed, ref } from 'vue'

const props = defineProps({
  article: { type: Object, required: true },
  variant: { type: String, default: 'grid' }, // 'grid' | 'orbit'
  index: { type: Number, default: 0 },
  focusable: { type: Boolean, default: true },
})

defineEmits(['activate'])

const imgLoaded = ref(false)
const imgError = ref(false)
const hovering = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const glowX = ref(50)
const glowY = ref(50)
const canTilt = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches

const fallbackHue = computed(() => {
  const seed = props.article.id || props.article.title || 'space4'
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
})

const fallbackStyle = computed(() => ({
  background: `linear-gradient(135deg, hsl(${fallbackHue.value} 45% 26%), hsl(${(fallbackHue.value + 60) % 360} 55% 14%))`,
}))

const interactiveStyle = computed(() => {
  if (props.variant !== 'grid') return {}
  return {
    transform: `perspective(900px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)${hovering.value ? ' translateY(-4px)' : ''}`,
    '--glow-x': `${glowX.value}%`,
    '--glow-y': `${glowY.value}%`,
  }
})

function onMove(e) {
  if (props.variant !== 'grid' || !canTilt) return
  const r = e.currentTarget.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  tiltY.value = (px - 0.5) * 10
  tiltX.value = (0.5 - py) * 8
  glowX.value = px * 100
  glowY.value = py * 100
  hovering.value = true
}

function onLeave() {
  tiltX.value = 0
  tiltY.value = 0
  hovering.value = false
}
</script>

<template>
  <article
    class="s4-card"
    :class="[`s4-card--${variant}`, { 'is-hover': hovering }]"
    :style="[interactiveStyle, { '--stagger': `${index * 45}ms` }]"
    :tabindex="focusable ? 0 : -1"
    role="link"
    :aria-hidden="variant === 'orbit' && !focusable ? 'true' : undefined"
    :aria-label="`阅读文章：${article.title}`"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @click="$emit('activate', article)"
    @keydown.enter.prevent="$emit('activate', article)"
  >
    <div class="s4-card__media">
      <img
        v-if="!imgError && article.image"
        :src="article.image"
        :alt="article.title"
        loading="lazy"
        decoding="async"
        draggable="false"
        :class="{ 'is-loaded': imgLoaded }"
        @load="imgLoaded = true"
        @error="imgError = true"
      />
      <div v-else class="s4-card__fallback" :style="fallbackStyle" aria-hidden="true">
        <span>{{ (article.title || '文')[0] }}</span>
      </div>
      <div class="s4-card__sheen" aria-hidden="true"></div>
    </div>
    <div class="s4-card__body">
      <div class="s4-card__meta">
        <time :datetime="article.date">{{ article.date }}</time>
        <span class="s4-card__author">@{{ article.author }}</span>
      </div>
      <h3 class="s4-card__title">{{ article.title }}</h3>
      <p class="s4-card__desc">{{ article.desc }}</p>
    </div>
    <span class="s4-card__cta" aria-hidden="true">进入此文 <i>→</i></span>
    <span class="s4-card__glow" aria-hidden="true"></span>
  </article>
</template>

<style scoped>
.s4-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(24, 27, 44, 0.88), rgba(13, 15, 26, 0.94));
  border: 1px solid rgba(148, 163, 216, 0.16);
  box-shadow: 0 10px 30px rgba(2, 4, 12, 0.45);
  cursor: pointer;
  outline: none;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}

.s4-card--grid {
  transition: transform 0.18s ease-out, border-color 0.35s ease, box-shadow 0.35s ease;
}

.s4-card--orbit {
  user-select: none;
  -webkit-user-select: none;
}

.s4-card:hover,
.s4-card:focus-visible {
  border-color: rgba(137, 180, 250, 0.55);
  box-shadow: 0 16px 44px rgba(2, 4, 12, 0.6), 0 0 32px rgba(137, 180, 250, 0.12);
}

.s4-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.28), 0 16px 44px rgba(2, 4, 12, 0.6);
}

.s4-card__media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: rgba(9, 11, 20, 0.6);
}

.s4-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.s4-card__media img.is-loaded {
  opacity: 1;
}

.s4-card:hover .s4-card__media img {
  transform: scale(1.1);
}

.s4-card__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s4-card__fallback span {
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 46px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.4);
}

.s4-card__sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.16) 50%, transparent 60%);
  transform: translateX(-130%);
  transition: transform 1s ease;
  pointer-events: none;
}

.s4-card:hover .s4-card__sheen {
  transform: translateX(130%);
}

.s4-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px 18px;
  flex: 1;
}

.s4-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: rgba(165, 176, 214, 0.75);
  font-variant-numeric: tabular-nums;
}

.s4-card__author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s4-card__title {
  margin: 0;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 16.5px;
  line-height: 1.42;
  color: #eef1ff;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.s4-card__desc {
  margin: 0;
  font-size: 12.8px;
  line-height: 1.65;
  color: rgba(176, 186, 222, 0.72);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.s4-card--orbit .s4-card__desc {
  -webkit-line-clamp: 2;
}

.s4-card__cta {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #89dceb;
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.s4-card__cta i {
  font-style: normal;
}

.s4-card:hover .s4-card__cta,
.s4-card:focus-visible .s4-card__cta {
  opacity: 1;
  transform: translateY(0);
}

.s4-card__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(137, 180, 250, 0.14), transparent 65%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.s4-card.is-hover .s4-card__glow {
  opacity: 1;
}

.s4-card--orbit .s4-card__glow,
.s4-card--orbit .s4-card__cta {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .s4-card,
  .s4-card--grid,
  .s4-card__media img,
  .s4-card__sheen,
  .s4-card__cta,
  .s4-card__glow {
    transition: none;
  }

  .s4-card:hover .s4-card__media img {
    transform: scale(1.04);
  }

  .s4-card__sheen {
    display: none;
  }
}
</style>
