<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const chapters = [
  {
    index: '壹',
    eyebrow: 'Identity Without Label',
    title: '不必急着定义',
    seal: '关于我',
    image: '/bg/liuyin.jpg',
    imageAlt: '个人空间背景图',
    accent: 'jade',
    paragraphs: [
      '我不太喜欢用一个固定标签来概括自己。',
      '如果一定要说，我大概是一个喜欢探索复杂问题的人。有时通过科研，有时通过编程，有时通过数据分析，有时通过写作、开源和工具折腾。对我来说，这些不是彼此分开的身份，而是几种不同的方式：用来理解世界，整理问题，创造工具，也记录自己正在经历的思考。',
    ],
  },
  {
    index: '贰',
    eyebrow: 'Between Theory And Reality',
    title: '在张力中工作',
    seal: '结构',
    image: '/bg/thinking_and_writing.png',
    imageAlt: '思考与写作视觉图',
    accent: 'porcelain',
    paragraphs: [
      '我喜欢有挑战、有意思、不太枯燥的事情。一个问题如果太简单，往往少了些张力；如果完全没有落地的可能，又容易变得悬浮。',
      '我比较享受的是那种介于理论、工程和现实之间的工作：既要想得清楚，也要做得出来；既要有结构，也要能接受真实世界的复杂和不完美。',
    ],
  },
  {
    index: '叁',
    eyebrow: 'Control, Isolation, Learning',
    title: '让重要信号被听见',
    seal: '控制',
    image: '/bg/research.png',
    imageAlt: '研究主题视觉图',
    accent: 'ink',
    paragraphs: [
      '我的研究兴趣主要在动力学控制、主动隔振和强化学习一带。用不太专业的话说，主动隔振有点像“降噪耳机”的原理：外界总有扰动，系统总会被影响，而我们希望通过建模、测量和控制，让真正重要的信号尽可能被听见。',
      '更具体的研究经历，我可能会放在专门的学术页面里；而在这里，我更想谈谈这些事情如何影响我理解问题的方式。',
    ],
  },
  {
    index: '肆',
    eyebrow: 'Code, Open Source, Data',
    title: '把经验做成工具',
    seal: '工具',
    image: '/bg/open.jpeg',
    imageAlt: '开放空间视觉图',
    accent: 'cinnabar',
    paragraphs: [
      '研究之外，我也热爱编程、开源和数据分析。写代码对我来说不只是实现功能，也是一种整理思路的方式。',
      '一个好的工具，应该让人少做重复劳动；一个好的分析，应该让混杂的信息露出结构；一个好的开源项目，应该让个人经验变成可以被他人复用和改进的公共材料。相比只把事情做完，我更在意它是否优雅、有用、有趣、可复用。',
    ],
  },
  {
    index: '伍',
    eyebrow: 'Aesthetics And Philosophy',
    title: '好看也是一种秩序',
    seal: '审美',
    image: '/bg/philosophy_and_writing.png',
    imageAlt: '哲学与写作视觉图',
    accent: 'gold',
    paragraphs: [
      '我也逐渐发现，自己对“好看”这件事很认真。这里的好看不只是装饰意义上的漂亮，而是包括排版、界面、颜色、结构、节奏、材质、交互和整体气质。',
      '无论是搭建博客、整理笔记、设计页面、调试工具链，还是折腾电子产品和工作流，我都会忍不住想：它能不能更清楚一点，更顺手一点，更耐看一点？',
      '我把哲学理解成一种姿态，而不只是某个学科名称。它意味着保留追问的能力，也意味着不急着把自己封闭成一个确定答案。',
    ],
  },
  {
    index: '陆',
    eyebrow: 'A Growing Place',
    title: '长期生长的地方',
    seal: '日常',
    image: '/bg/visitor.jpeg',
    imageAlt: '访客空间视觉图',
    accent: 'bamboo',
    paragraphs: [
      '这个博客大概也是这种状态的延伸。',
      '这里可能会有科研与技术笔记，也可能有编程、开源、数据分析、工具效率、设计审美、电子产品、生活观察和哲学思考。有些内容会比较系统，有些内容可能只是我在某个阶段刚好觉得有意思、值得记录、想分享出来。',
      '我欣赏“庸德之行，庸言之谨”这样的态度。把日常之事认真做好，说话有分寸，做事尽量可靠，情绪尽量稳定；不把自己说得太满，也不把普通生活看得太轻。',
      '如果你在这里看到某些内容，刚好觉得有意思、聊得来，或者觉得我们也许可以一起做点什么，那可能就是一种缘分。欢迎随意看看，也欢迎在合适的时候来交流。',
    ],
  },
]

const pageIdx = ref(0)
const direction = ref('down')
const transitioning = ref(false)
const selfRef = ref(null)
const usesNativeScroll = ref(false)
const transitionName = computed(() => (direction.value === 'down' ? 'scroll-leaf-up' : 'scroll-leaf-down'))
const currentChapter = computed(() => chapters[pageIdx.value])
const pageNumber = computed(() => String(pageIdx.value + 1).padStart(2, '0'))
const totalPages = String(chapters.length).padStart(2, '0')

let touchX = 0
let touchY = 0
let originalHtmlOverflow = ''
let originalBodyOverflow = ''
let compactQuery = null

function restoreDocumentOverflow() {
  document.documentElement.style.overflow = originalHtmlOverflow
  document.body.style.overflow = originalBodyOverflow
}

function syncLayoutMode(event) {
  usesNativeScroll.value = event.matches

  if (usesNativeScroll.value) {
    restoreDocumentOverflow()
    return
  }

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

function isInteractiveTarget(target) {
  return target instanceof Element
    && Boolean(target.closest('a, button, input, textarea, select, summary, [contenteditable="true"]'))
}

function revealChapterStart() {
  if (!usesNativeScroll.value) return

  nextTick(() => {
    selfRef.value?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  })
}

function step(delta) {
  if (transitioning.value) return

  const next = pageIdx.value + delta
  if (next < 0 || next >= chapters.length) return

  direction.value = delta > 0 ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = next
  revealChapterStart()
  window.setTimeout(() => {
    transitioning.value = false
  }, 560)
}

function goTo(idx) {
  if (idx === pageIdx.value || transitioning.value) return
  direction.value = idx > pageIdx.value ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = idx
  revealChapterStart()
  window.setTimeout(() => {
    transitioning.value = false
  }, 560)
}

function onWheel(event) {
  if (usesNativeScroll.value || Math.abs(event.deltaY) < 12) return
  event.preventDefault()
  step(event.deltaY > 0 ? 1 : -1)
}

function onKey(event) {
  if (usesNativeScroll.value || isInteractiveTarget(event.target)) return

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
  if (usesNativeScroll.value) return
  const touch = event.changedTouches[0]
  touchX = touch.clientX
  touchY = touch.clientY
}

function onTouchEnd(event) {
  if (usesNativeScroll.value) return
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
  compactQuery = window.matchMedia('(max-width: 980px)')
  syncLayoutMode(compactQuery)
  compactQuery.addEventListener('change', syncLayoutMode)

  if (!usesNativeScroll.value) {
    window.requestAnimationFrame(() => selfRef.value?.focus())
  }
})

onBeforeUnmount(() => {
  compactQuery?.removeEventListener('change', syncLayoutMode)
  restoreDocumentOverflow()
})
</script>

<template>
  <main
    ref="selfRef"
    class="self-page"
    aria-labelledby="self-title"
    tabindex="0"
    @wheel="onWheel"
    @keydown="onKey"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="paper-grain" aria-hidden="true"></div>
    <div class="silk-grid" aria-hidden="true"></div>

    <RouterLink class="back-link" to="/about">关于</RouterLink>

    <div class="chapter-stage">
      <Transition :name="transitionName" mode="out-in">
        <section
          :key="currentChapter.index"
          class="chapter-panel"
          :class="`chapter-panel--${currentChapter.accent}`"
          :aria-label="currentChapter.title"
        >
          <div class="chapter-copy">
            <p class="chapter-eyebrow">{{ currentChapter.eyebrow }}</p>
            <div class="title-row">
              <span class="chapter-index">{{ currentChapter.index }}</span>
              <h1 id="self-title">{{ currentChapter.title }}</h1>
            </div>
            <div class="chapter-text">
              <p
                v-for="paragraph in currentChapter.paragraphs"
                :key="paragraph"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>

          <aside class="artifact-field" aria-label="页面视觉材料">
            <figure class="image-slab">
              <img
                :src="currentChapter.image"
                :alt="currentChapter.imageAlt"
                loading="eager"
              >
            </figure>
            <div class="material-plate">
              <span class="seal-mark">{{ currentChapter.seal }}</span>
              <span class="plate-line"></span>
              <span class="plate-copy">LiuYinChu'Space</span>
            </div>
            <div class="chapter-stone" aria-hidden="true">
              <span>{{ pageNumber }}</span>
            </div>
          </aside>
        </section>
      </Transition>
    </div>

    <nav class="chapter-controls" aria-label="自我介绍分页">
      <button
        class="page-arrow"
        type="button"
        :disabled="pageIdx === 0"
        aria-label="上一页"
        @click="step(-1)"
      >
        ↑
      </button>
      <div class="page-track">
        <button
          v-for="(chapter, idx) in chapters"
          :key="chapter.index"
          class="track-node"
          :class="{ active: idx === pageIdx }"
          type="button"
          :aria-label="`前往第 ${idx + 1} 页`"
          @click="goTo(idx)"
        >
          <span>{{ chapter.index }}</span>
        </button>
      </div>
      <button
        class="page-arrow"
        type="button"
        :disabled="pageIdx === chapters.length - 1"
        aria-label="下一页"
        @click="step(1)"
      >
        ↓
      </button>
      <span class="page-count">{{ pageNumber }} / {{ totalPages }}</span>
    </nav>
  </main>
</template>

<style scoped>
.self-page {
  --ink: #11111b;
  --paper: #f2ead8;
  --paper-soft: rgba(242, 234, 216, 0.08);
  --jade: #94e2d5;
  --porcelain: #89dceb;
  --cinnabar: #f38ba8;
  --bamboo: #a6e3a1;
  --gold: #f9e2af;
  --line: rgba(242, 234, 216, 0.14);
  position: relative;
  height: calc(100svh - 72px);
  overflow: hidden;
  isolation: isolate;
  color: var(--ctp-mocha-text);
  outline: none;
  background:
    linear-gradient(120deg, rgba(242, 234, 216, 0.05), transparent 28%),
    linear-gradient(180deg, #0d0e18 0%, var(--ctp-mocha-crust) 44%, #151320 100%);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
}

.paper-grain,
.silk-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.paper-grain {
  z-index: -3;
  opacity: 0.34;
  background:
    repeating-linear-gradient(100deg, rgba(242, 234, 216, 0.035) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(12deg, transparent 0 9px, rgba(137, 180, 250, 0.025) 9px 10px);
}

.silk-grid {
  z-index: -2;
  background:
    linear-gradient(rgba(242, 234, 216, 0.052) 1px, transparent 1px),
    linear-gradient(90deg, rgba(242, 234, 216, 0.045) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.68), transparent 78%);
}

.back-link {
  position: absolute;
  top: clamp(1.1rem, 3vw, 2rem);
  left: clamp(1rem, 4vw, 3rem);
  z-index: 4;
  display: inline-flex;
  align-items: center;
  min-height: 2.4rem;
  padding: 0 0.9rem;
  border: 1px solid rgba(242, 234, 216, 0.16);
  border-radius: 999px;
  color: rgba(242, 234, 216, 0.78);
  background: rgba(17, 17, 27, 0.48);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-decoration: none;
  text-transform: uppercase;
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.back-link:hover,
.back-link:focus-visible {
  border-color: rgba(148, 226, 213, 0.44);
  color: var(--jade);
  background: rgba(49, 50, 68, 0.58);
  outline: none;
  transform: translateY(-2px);
}

.chapter-stage {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.chapter-panel {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.78fr);
  gap: clamp(1.4rem, 5vw, 5.2rem);
  align-items: center;
  box-sizing: border-box;
  padding:
    clamp(4.4rem, 9vh, 6.4rem)
    clamp(1.25rem, 7vw, 6.8rem)
    clamp(5.6rem, 10vh, 7rem);
}

.chapter-panel--jade { --chapter-accent: var(--jade); --chapter-shadow: rgba(148, 226, 213, 0.22); }
.chapter-panel--porcelain { --chapter-accent: var(--porcelain); --chapter-shadow: rgba(137, 220, 235, 0.2); }
.chapter-panel--ink { --chapter-accent: var(--ctp-mocha-blue); --chapter-shadow: rgba(137, 180, 250, 0.22); }
.chapter-panel--cinnabar { --chapter-accent: var(--cinnabar); --chapter-shadow: rgba(243, 139, 168, 0.2); }
.chapter-panel--gold { --chapter-accent: var(--gold); --chapter-shadow: rgba(249, 226, 175, 0.18); }
.chapter-panel--bamboo { --chapter-accent: var(--bamboo); --chapter-shadow: rgba(166, 227, 161, 0.18); }

.chapter-copy {
  position: relative;
  max-width: 54rem;
}

.chapter-copy::before {
  content: '';
  position: absolute;
  top: -1.5rem;
  left: 0;
  width: clamp(4rem, 10vw, 9rem);
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--chapter-accent), transparent);
  box-shadow: 0 0 24px var(--chapter-shadow);
}

.chapter-eyebrow,
.chapter-index,
.seal-mark,
.plate-copy,
.page-count,
.track-node,
.page-arrow {
  font-family: 'Fira Code', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chapter-eyebrow {
  margin: 0 0 1rem;
  color: var(--chapter-accent);
  font-size: clamp(0.72rem, 1.2vw, 0.86rem);
  font-weight: 800;
}

.title-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(1rem, 2.5vw, 1.8rem);
  align-items: start;
  margin-bottom: clamp(1.2rem, 3vw, 2rem);
}

.chapter-index {
  display: inline-grid;
  width: clamp(3.2rem, 7vw, 5.3rem);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(242, 234, 216, 0.18);
  border-radius: 34% 66% 52% 48% / 52% 36% 64% 48%;
  color: var(--ink);
  background:
    linear-gradient(145deg, rgba(242, 234, 216, 0.98), rgba(205, 214, 244, 0.72)),
    var(--paper);
  box-shadow:
    0 22px 54px rgba(0, 0, 0, 0.30),
    inset 1px 1px 2px rgba(255, 255, 255, 0.52),
    inset -8px -10px 20px rgba(17, 17, 27, 0.18);
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight: 900;
}

h1 {
  margin: 0;
  color: rgba(242, 234, 216, 0.94);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(2.55rem, 7vw, 6.3rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: 0;
  text-wrap: balance;
}

.chapter-text {
  display: grid;
  gap: clamp(0.78rem, 1.8vh, 1.15rem);
  max-width: 47rem;
}

.chapter-text p {
  margin: 0;
  color: rgba(205, 214, 244, 0.86);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(0.96rem, 1.45vw, 1.13rem);
  font-weight: 560;
  line-height: 1.88;
}

.artifact-field {
  position: relative;
  min-height: clamp(26rem, 58vh, 38rem);
  perspective: 1200px;
}

.image-slab {
  position: absolute;
  inset: clamp(0.8rem, 2vw, 1.2rem) 0 auto auto;
  width: min(82%, 31rem);
  aspect-ratio: 4 / 5;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(242, 234, 216, 0.16);
  border-radius: 28px;
  background: rgba(24, 24, 37, 0.72);
  box-shadow:
    0 34px 80px rgba(0, 0, 0, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: rotateY(-13deg) rotateX(5deg) rotateZ(1deg);
  transform-origin: center;
}

.image-slab::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(140deg, rgba(242, 234, 216, 0.22), transparent 28%),
    linear-gradient(180deg, transparent 54%, rgba(17, 17, 27, 0.50));
  pointer-events: none;
}

.image-slab img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.82) contrast(0.96) brightness(0.78);
  transform: scale(1.04);
}

.material-plate {
  position: absolute;
  right: min(40%, 12rem);
  bottom: clamp(1.6rem, 5vh, 4rem);
  display: grid;
  gap: 0.72rem;
  width: min(58%, 18rem);
  padding: 1.15rem;
  border: 1px solid rgba(242, 234, 216, 0.20);
  border-radius: 24px;
  color: var(--ink);
  background:
    linear-gradient(145deg, rgba(242, 234, 216, 0.92), rgba(205, 214, 244, 0.72));
  box-shadow:
    0 26px 70px rgba(0, 0, 0, 0.38),
    inset 1px 1px 2px rgba(255, 255, 255, 0.72),
    inset -10px -12px 24px rgba(17, 17, 27, 0.16);
  transform: rotateY(18deg) rotateX(8deg) rotateZ(-4deg);
}

.seal-mark {
  color: #4f1f2a;
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.6rem, 4vw, 2.8rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.plate-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(79, 31, 42, 0.55), transparent);
}

.plate-copy {
  color: rgba(17, 17, 27, 0.64);
  font-size: 0.68rem;
  font-weight: 800;
}

.chapter-stone {
  position: absolute;
  left: clamp(0.6rem, 4vw, 3rem);
  top: clamp(3rem, 9vh, 6rem);
  display: grid;
  width: clamp(5.8rem, 12vw, 9rem);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(242, 234, 216, 0.16);
  border-radius: 36% 64% 42% 58% / 54% 42% 58% 46%;
  color: rgba(242, 234, 216, 0.92);
  background:
    linear-gradient(145deg, rgba(49, 50, 68, 0.96), rgba(17, 17, 27, 0.82));
  box-shadow:
    0 28px 72px rgba(0, 0, 0, 0.42),
    inset 1px 1px 1px rgba(255, 255, 255, 0.08),
    inset -12px -14px 30px rgba(0, 0, 0, 0.24);
  transform: rotateY(-22deg) rotateX(14deg) rotateZ(9deg);
}

.chapter-stone span {
  color: var(--chapter-accent);
  font-family: 'Cinzel', 'Fira Code', serif;
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  font-weight: 900;
}

.chapter-controls {
  position: absolute;
  left: 50%;
  bottom: clamp(1rem, 3vh, 1.9rem);
  z-index: 5;
  display: grid;
  grid-template-columns: auto minmax(10rem, 23rem) auto auto;
  gap: 0.7rem;
  align-items: center;
  transform: translateX(-50%);
}

.page-track {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.35rem;
  border: 1px solid rgba(242, 234, 216, 0.14);
  border-radius: 999px;
  background: rgba(17, 17, 27, 0.56);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.30);
}

.track-node,
.page-arrow {
  border: 1px solid rgba(242, 234, 216, 0.14);
  color: rgba(242, 234, 216, 0.76);
  background: rgba(49, 50, 68, 0.44);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.track-node {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.track-node.active {
  border-color: rgba(242, 234, 216, 0.32);
  color: var(--ink);
  background: linear-gradient(145deg, var(--chapter-accent), rgba(242, 234, 216, 0.84));
  box-shadow: 0 0 24px var(--chapter-shadow);
}

.track-node:not(.active):hover,
.track-node:focus-visible,
.page-arrow:not(:disabled):hover,
.page-arrow:focus-visible {
  border-color: rgba(148, 226, 213, 0.34);
  color: var(--jade);
  transform: translateY(-2px);
  outline: none;
}

.page-arrow {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 900;
}

.page-arrow:disabled {
  cursor: default;
  opacity: 0.36;
}

.page-count {
  min-width: 4.8rem;
  color: rgba(242, 234, 216, 0.62);
  font-size: 0.72rem;
  font-weight: 800;
}

.scroll-leaf-up-enter-from {
  opacity: 0;
  transform: translateY(58px) rotateX(-7deg) scale(0.986);
  filter: blur(10px);
}

.scroll-leaf-up-enter-active,
.scroll-leaf-up-leave-active,
.scroll-leaf-down-enter-active,
.scroll-leaf-down-leave-active {
  transition:
    opacity 0.56s ease,
    transform 0.56s cubic-bezier(0.18, 0.9, 0.1, 1.16),
    filter 0.56s ease;
}

.scroll-leaf-up-leave-to {
  opacity: 0;
  transform: translateY(-58px) rotateX(7deg) scale(0.986);
  filter: blur(10px);
}

.scroll-leaf-down-enter-from {
  opacity: 0;
  transform: translateY(-58px) rotateX(7deg) scale(0.986);
  filter: blur(10px);
}

.scroll-leaf-down-leave-to {
  opacity: 0;
  transform: translateY(58px) rotateX(-7deg) scale(0.986);
  filter: blur(10px);
}

@media (max-width: 980px) {
  .self-page {
    height: auto;
    min-height: calc(100svh - 72px);
    overflow: clip;
    touch-action: pan-y;
  }

  .chapter-stage {
    height: auto;
    min-height: calc(100svh - 72px);
    overflow: visible;
  }

  .chapter-panel {
    position: relative;
    inset: auto;
    grid-template-columns: 1fr;
    gap: 1.2rem;
    align-content: center;
    min-height: calc(100svh - 72px);
    padding:
      clamp(4.6rem, 9vh, 5.4rem)
      clamp(1.1rem, 5vw, 2rem)
      clamp(5.2rem, 10vh, 6rem);
  }

  .chapter-copy {
    max-width: none;
  }

  .artifact-field {
    min-height: clamp(12rem, 26vh, 18rem);
    order: -1;
  }

  .image-slab {
    right: 0;
    width: min(46vw, 14rem);
    aspect-ratio: 1.15;
    border-radius: 22px;
  }

  .material-plate {
    right: auto;
    left: 0;
    bottom: 0.4rem;
    width: min(52vw, 15rem);
    padding: 0.88rem;
  }

  .chapter-stone {
    top: 0;
    left: 50%;
    width: clamp(4.6rem, 17vw, 6.4rem);
  }
}

@media (max-width: 640px) {
  .self-page,
  .chapter-stage,
  .chapter-panel {
    height: auto;
    min-height: calc(100svh - 68px);
  }

  .back-link {
    min-height: 2.15rem;
    padding: 0 0.76rem;
    font-size: 0.68rem;
  }

  .chapter-panel {
    padding: 4.15rem 1rem calc(5.6rem + env(safe-area-inset-bottom));
  }

  .title-row {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .chapter-index {
    width: 3.2rem;
    font-size: 1.2rem;
  }

  h1 {
    font-size: clamp(2.1rem, 13vw, 3.4rem);
  }

  .chapter-text {
    gap: 0.62rem;
  }

  .chapter-text p {
    font-size: 0.92rem;
    line-height: 1.72;
  }

  .artifact-field {
    min-height: 9.6rem;
  }

  .image-slab {
    width: 42vw;
    border-radius: 18px;
  }

  .material-plate {
    width: 52vw;
    border-radius: 18px;
  }

  .seal-mark {
    font-size: 1.42rem;
  }

  .chapter-controls {
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    grid-template-columns: auto minmax(8rem, 1fr) auto;
    width: calc(100% - 1.5rem);
    gap: 0.48rem;
  }

  .page-track {
    justify-content: center;
  }

  .track-node {
    width: 1.72rem;
    height: 1.72rem;
    font-size: 0.64rem;
  }

  .page-arrow {
    width: 2.18rem;
    height: 2.18rem;
  }

  .page-count {
    display: none;
  }
}

@media (max-width: 390px) {
  .artifact-field {
    display: none;
  }

  .chapter-panel {
    align-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-leaf-up-enter-active,
  .scroll-leaf-up-leave-active,
  .scroll-leaf-down-enter-active,
  .scroll-leaf-down-leave-active,
  .track-node,
  .page-arrow,
  .back-link {
    transition: opacity 0.2s ease;
  }
}
</style>
