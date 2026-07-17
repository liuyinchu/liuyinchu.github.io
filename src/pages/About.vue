<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TypingTitle from '../components/TypingTitle.vue'

const aboutLinks = [
  {
    title: '自我介绍',
    eyebrow: 'Personal Profile',
    index: '01',
    to: '/about/self',
    desc: '保留原 About 内容，暂时作为个人介绍的起点。',
    detail: 'Identity',
  },
  {
    title: '学术主页',
    eyebrow: 'Academic Work',
    index: '02',
    to: '/research',
    desc: '进入研究综述、学术脉络和通往学术名片页的入口。',
    detail: 'Research',
  },
  {
    title: '版权说明',
    eyebrow: 'Credits & License',
    index: '03',
    to: '/credit',
    desc: '查看素材致谢、代码许可和内容版权边界。',
    detail: 'Credits',
  },
]

const pageIdx = ref(0)
const direction = ref('down')
const transitioning = ref(false)
const aboutRef = ref(null)
const transitionName = computed(() => (direction.value === 'down' ? 'page-up-elastic' : 'page-down-elastic'))

let touchX = 0
let touchY = 0
let originalHtmlOverflow = ''
let originalBodyOverflow = ''

function step(delta) {
  if (transitioning.value) return

  const next = pageIdx.value + delta
  if (next < 0 || next > 1) return

  direction.value = delta > 0 ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = next
  window.setTimeout(() => {
    transitioning.value = false
  }, 520)
}

function goTo(idx) {
  if (idx === pageIdx.value) return
  step(idx > pageIdx.value ? 1 : -1)
}

function onWheel(event) {
  if (Math.abs(event.deltaY) < 12) return
  event.preventDefault()
  step(event.deltaY > 0 ? 1 : -1)
}

function onKey(event) {
  if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault()
    step(1)
  }

  if (['ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault()
    step(-1)
  }
}

function onTouchStart(event) {
  const touch = event.changedTouches[0]
  touchX = touch.clientX
  touchY = touch.clientY
}

function onTouchEnd(event) {
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchX
  const dy = touch.clientY - touchY

  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 34) {
    step(dy < 0 ? 1 : -1)
  }
}

onMounted(() => {
  originalHtmlOverflow = document.documentElement.style.overflow
  originalBodyOverflow = document.body.style.overflow
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  window.requestAnimationFrame(() => aboutRef.value?.focus())
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = originalHtmlOverflow
  document.body.style.overflow = originalBodyOverflow
})
</script>

<template>
  <main
    ref="aboutRef"
    class="about-page"
    aria-labelledby="about-title"
    tabindex="0"
    @wheel="onWheel"
    @keydown="onKey"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="about-backdrop" aria-hidden="true"></div>

    <div class="about-stage">
      <Transition :name="transitionName" mode="out-in">
        <section
          v-if="pageIdx === 0"
          key="typing"
          class="about-panel about-panel--typing"
          aria-label="关于页打字机首页"
        >
          <div class="typing-center">
            <TypingTitle />
          </div>

          <button
            class="scroll-cue"
            type="button"
            aria-label="进入关于页面目录"
            @click="goTo(1)"
          >
            <span>Scroll</span>
            <span aria-hidden="true">↓</span>
          </button>
        </section>

        <section
          v-else
          key="directory"
          class="about-panel about-panel--directory"
          aria-label="关于页面入口目录"
        >
          <div class="directory-shell">
            <div class="directory-copy">
              <p class="eyebrow">ABOUT HUB</p>
              <h1 id="about-title">关于</h1>
              <p class="hero-lead">
                这里是站主相关内容的入口页：自我介绍、学术主页和版权说明会在这里分流。
              </p>
            </div>

            <nav class="link-matrix" aria-label="关于页面入口">
              <RouterLink
                v-for="item in aboutLinks"
                :key="item.to"
                class="matrix-link"
                :to="item.to"
              >
                <span class="matrix-index">{{ item.index }}</span>
                <span class="matrix-main">
                  <span class="matrix-eyebrow">{{ item.eyebrow }}</span>
                  <span class="matrix-title">{{ item.title }}</span>
                  <span class="matrix-desc">{{ item.desc }}</span>
                </span>
                <span class="matrix-detail">{{ item.detail }}</span>
                <span class="matrix-arrow" aria-hidden="true">→</span>
              </RouterLink>
            </nav>
          </div>
        </section>
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.about-page {
  --about-line: rgba(var(--ctp-mocha-overlay0-rgb), 0.34);
  --about-line-strong: rgba(var(--ctp-mocha-sky-rgb), 0.38);
  position: relative;
  height: calc(100svh - 72px);
  overflow: hidden;
  isolation: isolate;
  color: var(--ctp-mocha-text);
  outline: none;
  background:
    radial-gradient(circle at 20% 18%, rgba(var(--ctp-mocha-mauve-rgb), 0.18), transparent 24rem),
    radial-gradient(circle at 76% 10%, rgba(var(--ctp-mocha-sky-rgb), 0.16), transparent 28rem),
    linear-gradient(180deg, var(--ctp-mocha-crust), #10111c 54%, var(--ctp-mocha-base));
}

.about-backdrop {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.065) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.065) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.78) 48%, transparent 100%);
}

.about-page::after {
  content: '';
  position: absolute;
  top: clamp(7rem, 18vw, 14rem);
  right: max(-24vw, -18rem);
  z-index: -1;
  width: min(56vw, 720px);
  aspect-ratio: 1;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.20);
  border-radius: 999px;
  background:
    conic-gradient(from 210deg, transparent, rgba(var(--ctp-mocha-sky-rgb), 0.16), transparent 34%),
    radial-gradient(circle, rgba(var(--ctp-mocha-surface0-rgb), 0.08), transparent 58%);
}

.about-stage {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.about-panel {
  position: absolute;
  inset: 0;
  display: grid;
  box-sizing: border-box;
  padding: clamp(1.5rem, 5vw, 4.5rem);
}

.about-panel--typing {
  place-items: center;
  text-align: center;
}

.typing-center {
  width: min(980px, 100%);
  display: grid;
  place-items: center;
  gap: 1rem;
}

.eyebrow,
.matrix-index,
.matrix-eyebrow,
.matrix-detail,
.matrix-arrow,
.scroll-cue,
.back-control {
  margin: 0;
  font-family: 'Fira Code', monospace;
  letter-spacing: 0;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.76rem;
  font-weight: 700;
}

.typing-center :deep(.typing-container) {
  padding: 0;
}

.typing-center :deep(.typing-content) {
  width: min(100%, 58rem);
  min-height: 4.1em;
  font-size: clamp(1.45rem, 3.8vw, 3rem);
  letter-spacing: 0 !important;
  line-height: 1.42;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: clamp(1.8rem, 5vw, 3.5rem);
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  border: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.42);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  color: var(--ctp-mocha-subtext0);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.38);
  cursor: pointer;
  transform: translateX(-50%);
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.scroll-cue span:last-child {
  color: var(--ctp-mocha-green);
  animation: cue-bounce 1.4s ease-in-out infinite;
}

.scroll-cue:hover,
.scroll-cue:focus-visible {
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.42);
  color: var(--ctp-mocha-text);
  background: rgba(var(--ctp-mocha-surface1-rgb), 0.54);
  outline: none;
  transform: translateX(-50%) translateY(-2px);
}

.about-panel--directory {
  align-items: center;
}

.directory-shell {
  width: min(1120px, 100%);
  max-height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(220px, 0.36fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: start;
}

.directory-copy {
  display: grid;
  gap: 0.95rem;
}

.directory-copy h1 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(3.4rem, 8vw, 7rem);
  font-weight: 900;
  line-height: 0.9;
}

.hero-lead {
  max-width: 31rem;
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(0.98rem, 1.45vw, 1.1rem);
  line-height: 1.75;
}

.link-matrix {
  display: grid;
  border-top: 1px solid var(--about-line);
}

.matrix-link {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: 3rem minmax(12rem, 0.66fr) minmax(5rem, 0.22fr) 2rem;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  min-height: clamp(7.4rem, 18vh, 9rem);
  border-bottom: 1px solid var(--about-line);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.matrix-link::before {
  content: '';
  position: absolute;
  inset: 0.5rem -0.9rem;
  z-index: -1;
  border-radius: 8px;
  opacity: 0;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.24), rgba(var(--ctp-mocha-mauve-rgb), 0.08) 48%, transparent 78%),
    linear-gradient(180deg, rgba(var(--ctp-mocha-surface1-rgb), 0.56), rgba(var(--ctp-mocha-base-rgb), 0.18));
  box-shadow:
    0 22px 64px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateX(-0.55rem) scaleX(0.965);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.matrix-link::after {
  content: '';
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: -0.9rem;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--ctp-mocha-sky), var(--ctp-mocha-green));
  box-shadow: 0 0 18px rgba(var(--ctp-mocha-sky-rgb), 0.52);
  opacity: 0;
  transform: scaleY(0.35);
  transform-origin: center;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.matrix-link:hover,
.matrix-link:focus-visible {
  border-color: var(--about-line-strong);
  box-shadow: 0 0 0 1px rgba(var(--ctp-mocha-sky-rgb), 0.22);
  transform: translateX(0.45rem) scale(1.012);
}

.matrix-link:hover::before,
.matrix-link:focus-visible::before {
  opacity: 1;
  transform: translateX(0) scaleX(1);
}

.matrix-link:hover::after,
.matrix-link:focus-visible::after {
  opacity: 1;
  transform: scaleY(1);
}

.matrix-link:focus-visible {
  outline: 3px solid rgba(var(--ctp-mocha-sky-rgb), 0.30);
  outline-offset: 4px;
}

.matrix-index {
  color: var(--ctp-mocha-overlay2);
  font-size: 0.74rem;
  transition: color 0.2s ease;
}

.matrix-main {
  display: grid;
  gap: 0.45rem;
}

.matrix-eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.70rem;
  transition: color 0.2s ease;
}

.matrix-title {
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.72rem, 3.2vw, 2.8rem);
  font-weight: 800;
  line-height: 1;
  transition:
    color 0.2s ease,
    text-shadow 0.2s ease;
}

.matrix-desc {
  max-width: 28rem;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 0.94rem;
  line-height: 1.68;
  transition: color 0.2s ease;
}

.matrix-detail {
  justify-self: end;
  color: var(--ctp-mocha-overlay2);
  font-size: 0.74rem;
  transition: color 0.2s ease;
}

.matrix-arrow {
  display: inline-grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  justify-self: end;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--ctp-mocha-green);
  font-size: 1.12rem;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.matrix-link:hover .matrix-index,
.matrix-link:focus-visible .matrix-index,
.matrix-link:hover .matrix-detail,
.matrix-link:focus-visible .matrix-detail {
  color: var(--ctp-mocha-green);
}

.matrix-link:hover .matrix-title,
.matrix-link:focus-visible .matrix-title {
  color: var(--ctp-mocha-lavender);
  text-shadow: 0 0 24px rgba(var(--ctp-mocha-sky-rgb), 0.26);
}

.matrix-link:hover .matrix-desc,
.matrix-link:focus-visible .matrix-desc {
  color: var(--ctp-mocha-text);
}

.matrix-link:hover .matrix-arrow,
.matrix-link:focus-visible .matrix-arrow {
  border-color: rgba(var(--ctp-mocha-green-rgb), 0.42);
  background: rgba(var(--ctp-mocha-green-rgb), 0.12);
  box-shadow: 0 0 22px rgba(var(--ctp-mocha-green-rgb), 0.24);
  color: var(--ctp-mocha-text);
  transform: translateX(0.55rem);
}

.page-up-elastic-enter-from {
  opacity: 0;
  transform: translateY(56px) scale(0.982);
  filter: blur(10px);
}

.page-up-elastic-enter-active,
.page-up-elastic-leave-active,
.page-down-elastic-enter-active,
.page-down-elastic-leave-active {
  transition:
    opacity 0.52s ease,
    transform 0.52s cubic-bezier(0.2, 0.9, 0.1, 1.18),
    filter 0.52s ease;
}

.page-up-elastic-leave-to {
  opacity: 0;
  transform: translateY(-56px) scale(0.982);
  filter: blur(10px);
}

.page-down-elastic-enter-from {
  opacity: 0;
  transform: translateY(-56px) scale(0.982);
  filter: blur(10px);
}

.page-down-elastic-leave-to {
  opacity: 0;
  transform: translateY(56px) scale(0.982);
  filter: blur(10px);
}

@keyframes cue-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

@media (max-width: 980px) {
  .directory-shell {
    grid-template-columns: 1fr;
    gap: 1.4rem;
    align-content: center;
    overflow-y: auto;
    padding-right: 0.4rem;
  }

  .directory-copy h1 {
    font-size: 4rem;
  }

  .matrix-link {
    grid-template-columns: 2.4rem minmax(0, 1fr) 2rem;
    min-height: auto;
    padding: 1rem 0;
  }

  .matrix-detail {
    grid-column: 2;
    justify-self: start;
  }

  .matrix-arrow {
    grid-column: 3;
    grid-row: 1;
  }
}

@media (max-width: 640px) {
  .about-panel {
    padding: 1.15rem;
  }

  .typing-center {
    transform: translateY(-1.2rem);
  }

  .typing-center :deep(.typing-content) {
    font-size: clamp(1.35rem, 6.4vw, 2rem);
    min-height: 5.8em;
  }

  .directory-copy h1 {
    font-size: 3.35rem;
  }

  .hero-lead,
  .matrix-desc {
    font-size: 0.9rem;
  }

  .matrix-title {
    font-size: 1.75rem;
  }

}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue span:last-child {
    animation: none;
  }

  .page-up-elastic-enter-active,
  .page-up-elastic-leave-active,
  .page-down-elastic-enter-active,
  .page-down-elastic-leave-active {
    transition: opacity 0.2s ease;
  }
}
</style>
