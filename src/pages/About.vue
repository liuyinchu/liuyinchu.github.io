<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const aboutLinks = [
  {
    title: '自我介绍',
    eyebrow: 'Personal Profile',
    index: '01',
    to: '/about/self',
    desc: '保留原 About 内容，记录兴趣、技术实践和这个网站仍在生长的状态。',
  },
  {
    title: '我的学术',
    eyebrow: 'Academic Work',
    index: '02',
    to: '/academic',
    desc: '进入学术相关内容、科研工具、绘图记录和后续会继续整理的学习材料。',
  },
  {
    title: '版权说明',
    eyebrow: 'Credits & License',
    index: '03',
    to: '/credit',
    desc: '查看网站使用素材、致谢、代码许可和内容版权边界说明。',
  },
]

const INTRO_DURATION = 3600
const INTRO_SETTLE_DELAY = 420

const introWords = [
  'Hi',
  'Space',
  'Journey',
  'Explore',
  'Record',
  'Create',
  'Code',
  'Project',
  'Resource',
  'Research',
  'Academic',
  'About',
]

function shouldShowIntro() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const showIntro = ref(shouldShowIntro())
const introProgress = ref(0)
const introOffset = ref(0)
const introWordStage = ref(null)
const introWordTrack = ref(null)

let introFrameId = 0
let introFinishTimer = 0
let originalBodyOverflow = ''

function easeIntro(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getIntroWordMetrics() {
  const firstWord = introWordTrack.value?.firstElementChild
  const wordHeight = firstWord?.getBoundingClientRect().height || 96
  const stageHeight = introWordStage.value?.getBoundingClientRect().height || wordHeight

  return {
    wordHeight,
    centerOffset: (stageHeight - wordHeight) / 2,
  }
}

function finishIntro() {
  if (introFrameId) {
    window.cancelAnimationFrame(introFrameId)
    introFrameId = 0
  }

  if (introFinishTimer) {
    window.clearTimeout(introFinishTimer)
    introFinishTimer = 0
  }

  if (showIntro.value) {
    document.body.style.overflow = originalBodyOverflow
  }

  showIntro.value = false
  introProgress.value = 100
}

async function startIntro() {
  if (!shouldShowIntro()) {
    showIntro.value = false
    return
  }

  showIntro.value = true
  introProgress.value = 0
  introOffset.value = 0
  originalBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  await nextTick()

  introOffset.value = getIntroWordMetrics().centerOffset

  const startedAt = window.performance.now()
  const lastWordIndex = introWords.length - 1

  function animate(now) {
    const rawProgress = Math.min((now - startedAt) / INTRO_DURATION, 1)
    const easedProgress = easeIntro(rawProgress)
    const { wordHeight, centerOffset } = getIntroWordMetrics()

    introProgress.value = easedProgress * 100
    introOffset.value = centerOffset - lastWordIndex * wordHeight * easedProgress

    if (rawProgress < 1) {
      introFrameId = window.requestAnimationFrame(animate)
      return
    }

    introProgress.value = 100
    introOffset.value = centerOffset - lastWordIndex * wordHeight
    introFinishTimer = window.setTimeout(() => finishIntro(), INTRO_SETTLE_DELAY)
  }

  introFrameId = window.requestAnimationFrame(animate)
}

onMounted(() => {
  startIntro()
})

onBeforeUnmount(() => {
  finishIntro()
})
</script>

<template>
  <Transition name="entry-intro">
    <div
      v-if="showIntro"
      class="entry-intro"
      role="status"
      aria-live="polite"
      aria-label="About LiuYinChu'Space"
    >
      <div class="entry-progress" aria-hidden="true">
        <div
          class="entry-progress__bar"
          :style="{ width: `${introProgress}%` }"
        ></div>
      </div>

      <div
        ref="introWordStage"
        class="entry-word-stage"
        aria-hidden="true"
      >
        <div
          ref="introWordTrack"
          class="entry-word-track"
          :style="{ transform: `translate3d(0, ${introOffset}px, 0)` }"
        >
          <div
            v-for="word in introWords"
            :key="word"
            class="entry-word"
          >
            {{ word }}
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <main class="about-hub-page" aria-labelledby="about-title">
    <section class="about-shell">
      <div class="about-hero">
        <div class="about-copy">
          <p class="kicker">ABOUT / DIRECTORY</p>
          <h1 id="about-title">关于</h1>
          <p class="about-lead">
            这里汇总与站主相关的三个入口：自我介绍、学术内容和版权说明。
          </p>
        </div>

        <aside class="principle-panel" aria-label="About page principle">
          <span class="principle-index">00</span>
          <p>
            个人叙事、学术记录和版权边界在这里分流。页面只保留必要路径，让后续内容继续向外展开。
          </p>
        </aside>
      </div>

      <nav class="route-console" aria-label="关于页面入口">
        <RouterLink
          v-for="item in aboutLinks"
          :key="item.to"
          class="route-row"
          :to="item.to"
        >
          <span class="route-index">{{ item.index }}</span>
          <span class="route-main">
            <span class="route-eyebrow">{{ item.eyebrow }}</span>
            <span class="route-title">{{ item.title }}</span>
          </span>
          <span class="route-desc">{{ item.desc }}</span>
          <span class="route-action">ENTER</span>
        </RouterLink>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.entry-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #cdd6f4;
  background:
    linear-gradient(180deg, rgba(17, 17, 27, 0.96), rgba(30, 30, 46, 0.98)),
    #1e1e2e;
}

.entry-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  overflow: visible;
  background: rgba(205, 214, 244, 0.22);
  box-shadow: 0 1px 18px rgba(137, 180, 250, 0.22);
}

.entry-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #74c7ec, #cba6f7, #f5c2e7);
  box-shadow:
    0 0 18px rgba(137, 180, 250, 0.72),
    0 0 34px rgba(203, 166, 247, 0.52);
  transition: width 80ms linear;
}

.entry-word-stage {
  position: relative;
  width: min(86vw, 920px);
  height: clamp(14rem, 29vw, 22rem);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.04) 12%,
    rgba(0, 0, 0, 0.10) 29%,
    #000 46%,
    #000 54%,
    rgba(0, 0, 0, 0.10) 71%,
    rgba(0, 0, 0, 0.04) 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.04) 12%,
    rgba(0, 0, 0, 0.10) 29%,
    #000 46%,
    #000 54%,
    rgba(0, 0, 0, 0.10) 71%,
    rgba(0, 0, 0, 0.04) 88%,
    transparent 100%
  );
}

.entry-word-track {
  will-change: transform;
}

.entry-word {
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(3.8rem, 8.4vw, 6.2rem);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(2.45rem, 8.5vw, 5.65rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  color: #f5f6ff;
  text-shadow: 0 16px 52px rgba(137, 180, 250, 0.28);
}

.entry-intro-enter-active,
.entry-intro-leave-active {
  transition: opacity 0.45s ease;
}

.entry-intro-enter-from,
.entry-intro-leave-to {
  opacity: 0;
}

.about-hub-page {
  position: relative;
  min-height: calc(100svh - 72px);
  overflow: clip;
  isolation: isolate;
  padding: clamp(5rem, 9vw, 7.6rem) clamp(1.25rem, 6vw, 5.5rem) clamp(4rem, 7vw, 6rem);
  color: var(--ctp-mocha-text);
  background:
    linear-gradient(115deg, rgba(var(--ctp-mocha-sky-rgb), 0.13), transparent 28%),
    linear-gradient(180deg, var(--ctp-mocha-crust), var(--ctp-mocha-base) 62%, var(--ctp-mocha-mantle));
}

.about-hub-page::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 78%);
}

.about-hub-page::after {
  content: '';
  position: absolute;
  inset: auto -10vw 9vh 42vw;
  z-index: -1;
  height: 38vh;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.24);
  background:
    linear-gradient(135deg, transparent 0 48%, rgba(var(--ctp-mocha-sky-rgb), 0.18) 48% 49%, transparent 49%),
    rgba(var(--ctp-mocha-surface0-rgb), 0.18);
  transform: skewX(-18deg);
}

.about-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.about-hero {
  display: grid;
  min-height: min(58svh, 620px);
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.42fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: end;
  border-bottom: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.42);
  padding-bottom: clamp(2rem, 5vw, 4rem);
}

.about-copy {
  position: relative;
  display: grid;
  gap: 1rem;
}

.about-copy::before {
  content: 'ABOUT';
  position: absolute;
  left: -0.08em;
  bottom: 0.44em;
  z-index: -1;
  color: transparent;
  font-family: 'Inter', sans-serif;
  font-size: clamp(5.4rem, 18vw, 14rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.75;
  -webkit-text-stroke: 1px rgba(var(--ctp-mocha-overlay1-rgb), 0.22);
}

.kicker,
.principle-index,
.route-index,
.route-eyebrow,
.route-action {
  margin: 0;
  font-family: 'Fira Code', monospace;
  letter-spacing: 0;
  text-transform: uppercase;
}

.kicker {
  color: var(--ctp-mocha-sky);
  font-size: 0.82rem;
}

.about-copy h1 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(4.4rem, 10vw, 8.2rem);
  font-weight: 900;
  line-height: 0.92;
}

.about-lead {
  max-width: 36rem;
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.02rem, 1.6vw, 1.22rem);
  line-height: 1.8;
}

.principle-panel {
  display: grid;
  gap: 1rem;
  border-left: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.38);
  padding: 0.35rem 0 0.35rem 1.25rem;
}

.principle-index {
  color: var(--ctp-mocha-sky);
  font-size: 0.75rem;
}

.principle-panel p {
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1rem;
  line-height: 1.85;
}

.route-console {
  display: grid;
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
  border-top: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.42);
}

.route-row {
  position: relative;
  display: grid;
  grid-template-columns: 5rem minmax(12rem, 0.72fr) minmax(16rem, 1fr) 5rem;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  min-height: 8.6rem;
  border-bottom: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.42);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.22s ease,
    color 0.22s ease,
    transform 0.22s ease;
}

.route-row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.16), transparent 58%),
    linear-gradient(135deg, transparent 0 62%, rgba(var(--ctp-mocha-teal-rgb), 0.12) 62% 63%, transparent 63%);
  transform: scaleX(0.98);
  transform-origin: left center;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.route-row:hover,
.route-row:focus-visible {
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.62);
  transform: translateX(0.35rem);
}

.route-row:hover::before,
.route-row:focus-visible::before {
  opacity: 1;
  transform: scaleX(1);
}

.route-row:focus-visible {
  outline: 3px solid rgba(var(--ctp-mocha-sky-rgb), 0.36);
  outline-offset: 4px;
}

.route-index {
  color: var(--ctp-mocha-overlay2);
  font-size: 0.82rem;
}

.route-main {
  display: grid;
  gap: 0.45rem;
}

.route-eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.74rem;
}

.route-title {
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2rem, 4vw, 3.6rem);
  font-weight: 800;
  line-height: 1;
}

.route-desc {
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1rem;
  line-height: 1.75;
}

.route-action {
  justify-self: end;
  color: var(--ctp-mocha-green);
  font-size: 0.76rem;
}

@media (max-width: 900px) {
  .about-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .principle-panel {
    max-width: 34rem;
  }

  .route-row {
    grid-template-columns: 3rem minmax(0, 1fr) 4rem;
    gap: 1rem;
    min-height: 11rem;
    padding: 1.1rem 0;
  }

  .route-desc {
    grid-column: 2 / 4;
  }
}

@media (max-width: 560px) {
  .about-hub-page {
    padding-inline: 1rem;
  }

  .about-copy h1 {
    font-size: 4rem;
  }

  .about-copy::before {
    bottom: 0.62em;
    font-size: 5.6rem;
  }

  .principle-panel {
    padding-left: 1rem;
  }

  .route-row {
    grid-template-columns: 2.5rem minmax(0, 1fr);
  }

  .route-desc,
  .route-action {
    grid-column: 2;
  }

  .route-action {
    justify-self: start;
  }
}
</style>
