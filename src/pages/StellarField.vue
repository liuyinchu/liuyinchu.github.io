<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import StellarField from '../components/effects/StellarField.vue'

const experience = ref(null)
const field = ref(null)
const progress = ref(0)
const paused = ref(false)
const unavailable = ref(false)
const ready = ref(false)
const chapter = computed(() => progress.value < 0.375 ? 0 : progress.value < 0.875 ? 1 : 2)
const chapters = [
  { title: '看见', target: 0 },
  { title: '选择', target: 0.5 },
  { title: '连接', target: 1 },
]
let frame = 0
let observer
let previousTitle
let reducedMotion

function updateProgress() {
  frame = 0
  if (!experience.value) return
  const stage = experience.value.querySelector('.stellar-stage')
  const travel = experience.value.offsetHeight - stage.offsetHeight
  const offset = Number.parseFloat(getComputedStyle(stage).top) || 0
  progress.value = Math.max(0, Math.min(1, (offset - experience.value.getBoundingClientRect().top) / travel))
}
function scheduleProgress() {
  if (!frame) frame = requestAnimationFrame(updateProgress)
}
function goTo(target) {
  field.value?.resetView()
  const stage = experience.value.querySelector('.stellar-stage')
  const offset = Number.parseFloat(getComputedStyle(stage).top) || 0
  const top = window.scrollY + experience.value.getBoundingClientRect().top - offset
  const travel = experience.value.offsetHeight - stage.offsetHeight
  window.scrollTo({ top: top + target * travel, behavior: reducedMotion?.matches ? 'instant' : 'smooth' })
}
function replay() {
  field.value?.replay()
}
function onReady() {
  ready.value = true
  unavailable.value = false
}
function onUnavailable() {
  ready.value = false
  unavailable.value = true
}

onMounted(() => {
  previousTitle = document.title
  document.title = "星间 Stellar Field · LiuYinChu'Space"
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('scroll', scheduleProgress, { passive: true })
  observer = new ResizeObserver(scheduleProgress)
  observer.observe(experience.value)
  updateProgress()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleProgress)
  observer?.disconnect()
  cancelAnimationFrame(frame)
  document.title = previousTitle
})

const example = `<StellarField\n  ref="stars"\n  :progress="scrollProgress"\n  :paused="false"\n  :interactive="true"\n/>`
</script>

<template>
  <main class="stellar-page">
    <div ref="experience" class="stellar-experience">
      <div class="stellar-stage">
        <StellarField
          ref="field"
          :progress="progress"
          :paused="paused"
          @ready="onReady"
          @unavailable="onUnavailable"
        />
      </div>
      <div class="stellar-overlay">
        <div class="stellar-overline" aria-hidden="true">
          <span>星间 <i>/</i> STELLAR FIELD</span>
          <span>AN INTERACTIVE STUDY</span>
        </div>
        <div class="stellar-controls">
          <nav class="chapter-nav" aria-label="星空章节">
            <button
              v-for="(item, index) in chapters"
              :key="item.title"
              :aria-current="chapter === index ? 'step' : undefined"
              @click="goTo(item.target)"
            >
              <span class="chapter-number">0{{ index + 1 }}</span>
              <span>{{ item.title }}</span>
            </button>
          </nav>
          <div class="animation-controls">
            <button :disabled="!ready" :aria-label="paused ? '继续星空动画' : '暂停星空动画'" :title="paused ? '继续动画' : '暂停动画'" :aria-pressed="paused" @click="paused = !paused">
              <svg v-if="paused" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" fill="currentColor" stroke="none" /></svg>
              <svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12" /></svg>
            </button>
            <button :disabled="!ready" aria-label="重新聚拢星空" title="重新聚拢" @click="replay">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a7 7 0 1 1-.8 5M4 3v4h4" /></svg>
            </button>
            <button :disabled="!ready" aria-label="恢复初始视角" title="恢复视角" @click="field?.resetView()">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="5" /><path d="M10 1v4m0 10v4M1 10h4m10 0h4" /></svg>
            </button>
          </div>
        </div>
        <p v-if="unavailable" class="renderer-notice" role="status">当前设备无法启用三维星空，已显示静态星图。下面的故事仍可阅读。</p>
      </div>

      <div class="stellar-story">
        <section class="story-screen opening" aria-labelledby="stellar-title">
          <h1 id="stellar-title"><span>从光点</span><span>到意义</span></h1>
          <div class="opening-caption">
            <p>一片星空，三次相遇。</p>
            <p class="gesture-hint"><span class="desktop-gesture">拖动，换一个角度。</span><span class="mobile-gesture">横向轻扫，换一个角度。</span>向下滚动，让星光改变形状。</p>
          </div>
          <span class="scroll-cue" aria-hidden="true">↓</span>
        </section>

        <section class="story-screen reading" aria-labelledby="seeing-title">
          <div class="story-copy">
            <p class="chapter-eyebrow">01 / 看见 · A DISTANT LIGHT</p>
            <h2 id="seeing-title">星光是一封<br>迟到的信。</h2>
            <p>光穿过距离，也穿过时间。仰望夜空时，我们看到的是从不同年代出发、恰好在此刻抵达的光。</p>
            <p>同一片天空，从来不是同一个瞬间。或许，观察的第一步，是允许眼前的事物拥有自己的来路。</p>
            <span class="story-aside">先看见，再试着理解。</span>
          </div>
        </section>

        <section class="story-screen formation" aria-labelledby="choosing-title">
          <div class="formation-caption">
            <p class="chapter-eyebrow">02 / 选择 · A SMALL INTENTION</p>
            <h2 id="choosing-title"><span>方向，</span><span>始于一个念头。</span></h2>
            <p>同样的光点，可以指向一个新的地方。</p>
          </div>
        </section>

        <section class="story-screen reading" aria-labelledby="connection-title">
          <div class="story-copy">
            <p class="chapter-eyebrow">一次关于注意力的小实验</p>
            <h2 id="connection-title">当你移动目光，<br>世界开始重组。</h2>
            <p>方才还是遥远的星云，此刻成了手边的光标。尺度改变了，那个“想要靠近一点”的念头却没有变。</p>
            <p>试着拖动它。扁平的轮廓会显出深度，熟悉的形状也会变得陌生。换一个位置，往往比急着下结论更有用。</p>
            <span class="story-aside">下面，让分散的线索彼此相遇。</span>
          </div>
        </section>

        <section class="story-screen formation final-formation" aria-labelledby="together-title">
          <div class="formation-caption">
            <p class="chapter-eyebrow">03 / 连接 · A SHARED PATTERN</p>
            <h2 id="together-title"><span>意义，</span><span>诞生于连接。</span></h2>
            <p>每一点都很微小。放在一起，就有了新的形状。</p>
          </div>
        </section>
      </div>
    </div>

    <section class="stellar-colophon" aria-labelledby="about-experiment">
      <div class="colophon-intro">
        <p class="chapter-eyebrow">BEHIND THE STARS</p>
        <h2 id="about-experiment">让这片星空，<br>也能出现在别处。</h2>
        <p>星间是一个可复用的交互星空组件。这一页用它讲一个关于观察、选择与连接的小故事；换一段文字、换一条滚动路径，也可以成为另一段旅程。</p>
        <p class="reference-note">视觉与交互研究自 <a href="https://openai.com/zh-Hans-CN/index/gpt-6-astra/" target="_blank" rel="noopener noreferrer">OpenAI 的 GPT Astra 发布页 ↗</a>，由本站独立实现。花结用于展示参考形态，本项目与 OpenAI 无隶属关系。这是一件视觉实验作品，并非真实天体模拟。</p>
        <RouterLink to="/code" class="back-to-projects">← 返回代码与项目</RouterLink>
      </div>
      <details class="component-notes">
        <summary>在自己的页面中使用 <span aria-hidden="true">＋</span></summary>
        <div class="component-notes-content">
          <p>导入 <code>src/components/effects/StellarField.vue</code>，放进有明确宽高的容器。由页面将滚动位置归一化后传给 <code>progress</code>。</p>
          <pre><code>{{ example }}</code></pre>
          <dl>
            <div><dt>0 → 0.25</dt><dd>旋涡星云 → 散开</dd></div>
            <div><dt>0.25 → 0.5</dt><dd>散开 → 方向光标</dd></div>
            <div><dt>0.5 → 0.75</dt><dd>方向光标 → 散开</dd></div>
            <div><dt>0.75 → 1</dt><dd>散开 → 编织花结</dd></div>
          </dl>
          <p>拖动或用方向键旋转，Home 键回正。组件提供 <code>replay()</code> 与 <code>resetView()</code>，可暂停，支持系统的减少动态效果设置。无图片、视频或额外依赖。</p>
        </div>
      </details>
    </section>
  </main>
</template>

<style scoped>
.stellar-page {
  --stellar-ink: #edf3f5;
  --stellar-muted: #99acb4;
  --stage-height: calc(100svh - var(--site-header-height, 72px));
  position: relative;
  isolation: isolate;
  color: var(--stellar-ink);
  background: #03090d;
  font-family: 'Inter', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.stellar-experience { position: relative; }
.stellar-stage { position: sticky; top: var(--site-header-height, 72px); height: var(--stage-height); width: 100%; z-index: 0; overflow: hidden; }
.stellar-overlay { position: sticky; top: var(--site-header-height, 72px); height: var(--stage-height); margin-top: calc(-1 * var(--stage-height)); z-index: 3; pointer-events: none; }
.stellar-overline { position: absolute; inset: 30px 42px auto; display: flex; justify-content: space-between; color: #8c9da5; font: 10px/1.6 'Fira Code', monospace; letter-spacing: .17em; pointer-events: none; }
.stellar-overline i { margin: 0 .7em; color: #53636c; font-style: normal; }
.stellar-controls { position: absolute; bottom: 22px; left: 42px; right: 30px; display: flex; justify-content: space-between; align-items: center; z-index: 4; pointer-events: none; }
.chapter-nav, .animation-controls { display: flex; align-items: center; gap: 10px; pointer-events: auto; }
.chapter-nav { gap: 28px; }
.chapter-nav button, .animation-controls button { border: 0; color: #91a4ae; cursor: pointer; background: transparent; transition: color .2s, background .2s; }
.chapter-nav button { padding: 10px 0; font-size: 11px; letter-spacing: .12em; border-bottom: 1px solid transparent; }
.chapter-nav button[aria-current] { color: #f0f6f8; border-bottom-color: #718c9c; }
.chapter-number { margin-right: 9px; font: 10px 'Fira Code', monospace; opacity: .55; }
.animation-controls button { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: rgb(117 145 160 / 9%); }
.animation-controls svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.45; stroke-linecap: round; stroke-linejoin: round; }
.animation-controls button:hover, .chapter-nav button:hover { color: white; }
.animation-controls button:hover { background: rgb(117 145 160 / 20%); }
.animation-controls button:disabled { opacity: .3; cursor: default; }
.stellar-story { position: relative; margin-top: calc(-1 * var(--stage-height)); z-index: 1; pointer-events: none; }
.story-screen { position: relative; height: var(--stage-height); min-height: 480px; display: flex; }
.opening { align-items: center; }
.opening h1 { display: flex; justify-content: space-between; width: 100%; margin: 0; padding: 0 clamp(2rem, 5.7vw, 7rem); font-size: clamp(1.9rem, 4vw, 4rem); font-weight: 420; line-height: 1.25; letter-spacing: -.035em; text-shadow: 0 2px 28px #02070c; }
.opening-caption { position: absolute; bottom: 118px; left: 42px; font-size: 12px; line-height: 1.8; color: #afbec6; }
.opening-caption p { margin: .3em 0; }
.opening-caption .gesture-hint { font-size: 10px; color: #758993; }
.mobile-gesture { display: none; }
.scroll-cue { position: absolute; bottom: 120px; right: 48px; font-size: 22px; color: #7e919c; }
.reading { align-items: center; justify-content: center; }
.story-copy { max-width: 500px; padding: 0 28px; pointer-events: auto; }
.chapter-eyebrow { font: 10px/1.6 'Fira Code', monospace; letter-spacing: .16em; color: #809ba9; margin: 0 0 28px; }
.story-copy h2 { font-size: clamp(2rem, 4.1vw, 3.45rem); line-height: 1.27; font-weight: 440; letter-spacing: -.045em; margin: 0 0 28px; }
.story-copy > p:not(.chapter-eyebrow) { color: #b3c1c8; font-size: 15px; line-height: 2; margin: 0 0 17px; }
.story-aside { display: block; margin-top: 28px; font-size: 11px; color: #6c8795; letter-spacing: .08em; }
.formation { align-items: flex-end; }
@media (min-width: 961px) {
  .formation .formation-caption { position: absolute; top: 50%; left: 42px; width: 235px; transform: translateY(-50%); padding: 0; text-align: left; background: none; }
  .formation .formation-caption h2 span { display: block; }
  .formation .formation-caption h2 { font-size: 27px; line-height: 1.45; text-wrap: balance; }
  .formation .formation-caption > p:last-child { line-height: 1.9; max-width: 210px; }
}
.formation-caption { position: relative; width: 100%; text-align: center; padding: 28px 24px 100px; background: linear-gradient(transparent, rgb(3 9 13 / 60%) 55%, transparent); }
.formation-caption .chapter-eyebrow { margin-bottom: 12px; }
.formation-caption h2 { font-size: clamp(1.4rem, 2vw, 2rem); font-weight: 450; line-height: 1.3; letter-spacing: -.025em; margin: 0 0 10px; }
.formation-caption > p:last-child { color: #869da8; font-size: 11px; letter-spacing: .06em; margin: 0; }
.renderer-notice { position: absolute; top: 65px; left: 24px; right: 24px; text-align: center; color: #9cb1bc; font-size: 12px; pointer-events: none; }
.stellar-colophon { position: relative; z-index: 2; padding: 108px max(28px, calc((100% - 920px) / 2)) 100px; background: linear-gradient(#03090d, #080f15); border-top: 1px solid #16232c; }
.colophon-intro { max-width: 520px; }
.colophon-intro h2 { font-size: clamp(1.9rem, 3.4vw, 2.9rem); line-height: 1.3; font-weight: 430; margin: 0 0 25px; letter-spacing: -.035em; }
.colophon-intro > p:not(.chapter-eyebrow) { font-size: 14px; color: #9dafb9; line-height: 1.9; }
.colophon-intro .reference-note { font-size: 11px !important; color: #67808e !important; margin-top: 24px; }
.stellar-colophon a { color: #bacbd4; text-decoration: none; border-bottom: 1px solid #42545f; padding-bottom: 2px; }
.stellar-colophon a:hover { color: white; }
.back-to-projects { display: inline-block; font-size: 12px; margin-top: 25px; }
.component-notes { margin-top: 65px; border-top: 1px solid #21303a; border-bottom: 1px solid #21303a; }
.component-notes summary { padding: 22px 0; cursor: pointer; list-style: none; font-size: 13px; display: flex; justify-content: space-between; color: #b6c8d1; }
.component-notes summary::-webkit-details-marker { display: none; }
.component-notes summary span { color: #65808f; }
.component-notes[open] summary span { transform: rotate(45deg); }
.component-notes-content { max-width: 700px; padding-bottom: 25px; font-size: 13px; line-height: 1.9; color: #92a9b6; }
.component-notes code { font-family: 'Fira Code', monospace; font-size: .87em; overflow-wrap: anywhere; }
.component-notes pre { padding: 24px; color: #bed8e5; background: #0a141d; border: 1px solid #1c2c37; border-radius: 5px; line-height: 1.8; overflow-x: auto; }
.component-notes dl { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; margin: 25px 0; }
.component-notes dl div { display: flex; gap: 18px; }
.component-notes dt { color: #d5e3eb; font: 11px/1.9 'Fira Code', monospace; }
.component-notes dd { margin: 0; font-size: 12px; }
@media (max-width: 640px) {
  .stellar-overline { inset: 22px 22px auto; font-size: 8px; letter-spacing: .1em; }
  .stellar-overline > span:last-child { display: none; }
  .stellar-controls { left: 20px; right: 16px; bottom: 20px; }
  .chapter-nav { gap: 10px; }
  .chapter-nav button { font-size: 10px; min-width: 35px; min-height: 40px; padding-inline: 4px; }
  .chapter-number { display: none; }
  .animation-controls { gap: 6px; }
  .animation-controls button { width: 34px; height: 34px; }
  .opening h1 { padding: 0 22px; font-size: 26px; }
  .opening-caption { bottom: 112px; left: 22px; right: 22px; font-size: 11px; }
  .opening-caption .gesture-hint { max-width: 255px; font-size: 10px; }
  .desktop-gesture { display: none; }
  .mobile-gesture { display: inline; }
  .scroll-cue { right: 25px; bottom: 111px; }
  .story-copy { max-width: 440px; padding: 0 35px; }
  .story-copy h2 { font-size: 32px; }
  .story-copy > p:not(.chapter-eyebrow) { font-size: 14px; line-height: 1.95; }
  .story-copy .chapter-eyebrow { font-size: 9px; margin-bottom: 24px; }
  .formation-caption { padding-bottom: 104px; }
  .formation-caption h2 { font-size: 22px; }
  .formation-caption > p:last-child { font-size: 10px; }
  .formation-caption .chapter-eyebrow { font-size: 8px; }
  .stellar-colophon { padding-top: 72px; padding-bottom: 65px; }
  .component-notes dl { grid-template-columns: 1fr; }
}
@media (max-height: 620px) and (min-width: 641px) {
  .story-screen { min-height: 0; }
  .story-copy { max-width: 560px; }
  .story-copy h2 { font-size: 28px; margin-bottom: 16px; }
  .story-copy > p:not(.chapter-eyebrow) { font-size: 13px; line-height: 1.8; margin-bottom: 10px; }
  .chapter-eyebrow { margin-bottom: 16px; }
  .story-aside { margin-top: 15px; }
  .formation-caption { padding-bottom: 76px; }
  .opening-caption { bottom: 90px; }
}
@media (prefers-reduced-motion: reduce) {
  .stellar-page *, .stellar-page *::before, .stellar-page *::after { transition: none !important; }
}
</style>
