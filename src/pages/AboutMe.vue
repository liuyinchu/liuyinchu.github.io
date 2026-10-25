<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import StellarField from '../components/effects/StellarField.vue'
import ConstellationDirectory from '../components/about/ConstellationDirectory.vue'
import StackKeyboard from '../components/about/StackKeyboard.vue'

const experience = ref(null)
const stage = ref(null)
const field = ref(null)
const progress = ref(0)
const activeChapter = ref(0)
const paused = ref(false)
const ready = ref(false)
const selectedNode = ref('notes')
const anchors = ref([])
const projection = ref({ left: 0, top: 0, width: 0, height: 0 })
const stageSize = ref({ width: 0, height: 0 })
const keyboardProgress = ref(0)
const chapters = [
  { id: 'about-space', label: '这个空间' },
  { id: 'about-names', label: '名字偏航' },
  { id: 'about-purpose', label: '想法落点' },
  { id: 'about-wander', label: '随处逛逛' },
  { id: 'about-making', label: '一边搭建' },
  { id: 'about-curiosity', label: '未完待续' },
]
const readingProgress = computed(() => String(Math.round(progress.value * 100)).padStart(2, '0'))
let frame = 0
let resizeObserver
let sections = []
let reducedMotion
let previousTitle

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}
function updateProjection() {
  const canvasRect = field.value?.getCanvasRect?.()
  const stageRect = stage.value?.getBoundingClientRect()
  if (!canvasRect || !stageRect) return
  projection.value = {
    left: canvasRect.left - stageRect.left,
    top: canvasRect.top - stageRect.top,
    width: canvasRect.width,
    height: canvasRect.height,
  }
  stageSize.value = { width: stageRect.width, height: stageRect.height }
}
function onAnchors(nextAnchors) {
  anchors.value = nextAnchors
  updateProjection()
}
function updateProgress() {
  frame = 0
  if (!experience.value || !stage.value || !sections.length) return
  const top = Number.parseFloat(getComputedStyle(stage.value).top) || 0
  const positions = sections.map((section) => section.getBoundingClientRect().top - top)
  let current = 0
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] <= 1) current = index
  }
  // Each chapter owns one fifth of the story, regardless of its document height.
  // In particular, the keyboard can take more room without shifting later forms.
  const next = Math.min(current + 1, positions.length - 1)
  const local = next === current ? 0 : clamp(-positions[current] / Math.max(1, positions[next] - positions[current]))
  progress.value = clamp((current + local) / (positions.length - 1))
  // Content visibility follows the reading area; formation progress stays continuous.
  // Anchor scrolling may stop before a chapter reaches the sticky stage top.
  const readingLine = stage.value.offsetHeight * .35
  let readingChapter = 0
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] <= readingLine) readingChapter = index
  }
  activeChapter.value = readingChapter
  keyboardProgress.value = clamp((stage.value.offsetHeight * .55 - positions[4]) / Math.max(1, stage.value.offsetHeight * .55))
  updateProjection()
}
function scheduleProgress() {
  if (!frame) frame = requestAnimationFrame(updateProgress)
}
function goTo(id) {
  const section = sections.find((item) => item.id === id)
  if (!section) return
  section.focus({ preventScroll: true })
  const top = Number.parseFloat(getComputedStyle(stage.value).top) || 0
  window.scrollTo({ top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - top), behavior: reducedMotion?.matches ? 'instant' : 'smooth' })
}
function onReady() {
  ready.value = true
  updateProjection()
}

onMounted(() => {
  previousTitle = document.title
  document.title = "关于我 & 关于本站 · LiuYinChu'Space"
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  sections = Array.from(experience.value.querySelectorAll('.about-chapter[id]'))
  window.addEventListener('scroll', scheduleProgress, { passive: true })
  window.addEventListener('resize', scheduleProgress, { passive: true })
  resizeObserver = new ResizeObserver(scheduleProgress)
  resizeObserver.observe(experience.value)
  resizeObserver.observe(stage.value)
  updateProgress()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleProgress)
  window.removeEventListener('resize', scheduleProgress)
  resizeObserver?.disconnect()
  cancelAnimationFrame(frame)
  if (previousTitle !== undefined) document.title = previousTitle
})
</script>

<template>
  <main class="about-story" data-testid="about-story" aria-labelledby="about-page-title">
    <div ref="experience" class="about-experience">
      <div ref="stage" class="about-stage" :class="{ 'about-stage--directory': activeChapter === 3, 'about-stage--making': activeChapter === 4 }">
        <StellarField
          ref="field"
          profile="about"
          :progress="progress"
          :active-node="activeChapter === 3 ? selectedNode : ''"
          :paused="paused || activeChapter === 4"
          :interactive="activeChapter !== 4"
          @anchors="onAnchors"
          @ready="onReady"
          @unavailable="ready = false"
        />
        <div class="about-stage__shade" aria-hidden="true"></div>
      </div>

      <div class="about-instruments">
        <ConstellationDirectory
          :active="activeChapter === 3"
          :selected="selectedNode"
          :anchors="anchors"
          :canvas="projection"
          :width="stageSize.width"
          :height="stageSize.height"
          @select="selectedNode = $event"
        />
        <div class="about-rail">
          <div class="about-rail__track" aria-hidden="true"><span :style="{ transform: 'scaleX(' + progress + ')' }"></span></div>
          <nav class="about-chapters" aria-label="关于我与本站：章节索引">
            <a
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              :href="'#' + chapter.id"
              :aria-label="'第' + (index + 1) + '节：' + chapter.label"
              :aria-current="activeChapter === index ? 'step' : undefined"
              @click.prevent="goTo(chapter.id)"
            >
              <span class="about-chapters__number">0{{ index + 1 }}</span>
              <span class="about-chapters__label">{{ chapter.label }}</span>
            </a>
          </nav>
          <div class="about-tools">
            <span class="about-percent" aria-hidden="true">{{ readingProgress }}<i>%</i></span>
            <button
              type="button"
              :disabled="!ready && activeChapter !== 4"
              :aria-label="paused ? '继续星空动画' : '暂停星空动画'"
              :aria-pressed="paused"
              :title="paused ? '继续动画' : '暂停动画'"
              @click="paused = !paused"
            >
              <svg v-if="paused" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6z" fill="currentColor" stroke="none" /></svg>
              <svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12" /></svg>
            </button>
            <button type="button" :disabled="!ready" aria-label="星空视角回正" title="视角回正" @click="field?.resetView()">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="5" /><path d="M10 1v4m0 10v4M1 10h4m10 0h4" /></svg>
              <span class="about-tools__label">回正</span>
            </button>
          </div>
        </div>
      </div>

      <div class="about-narrative">
        <section id="about-space" class="about-chapter about-opening" tabindex="-1" aria-labelledby="about-opening-title">
          <div class="about-opening__content">
            <h1 id="about-page-title">关于我 &amp; 关于本站</h1>
            <h2 id="about-opening-title">这个空间，<br>也在介绍我。</h2>
            <div class="about-opening__intro">
              <p>这里是 <span lang="en">LiuYinChu'Space</span>。</p>
              <p>随记、说说、资源、代码项目，<br class="about-desktop-break">还有一些可以动手玩的东西。</p>
              <p>与其列出一串身份，<br>我更愿意让这里的内容，慢慢介绍我。</p>
            </div>
          </div>
          <span class="about-section-marker" aria-hidden="true">01 <i>/</i> 06</span>
        </section>

        <section id="about-names" class="about-chapter about-align-right" tabindex="-1" aria-labelledby="about-names-title">
          <div class="about-copy">
            <p class="about-eyebrow"><span>02</span> 名字 / A SLIGHT DETOUR</p>
            <h2 id="about-names-title">名字有一点<br>偏航。</h2>
            <p><strong lang="en">LiuYinChu</strong> 来自「流萤厨」。本来应该是 <span lang="en">Ying</span>，却因为口音，拼成了 <span lang="en">Yin</span>。有点难绷，但这个小小的偏航，就这样留下了。</p>
            <p>另一个名字是 <strong lang="en">pifuyuini</strong>——梦游时打在手机上的一串字。没有严谨的来历，也挺好。</p>
          </div>
        </section>

        <section id="about-purpose" class="about-chapter about-align-left" tabindex="-1" aria-labelledby="about-purpose-title">
          <div class="about-copy">
            <p class="about-eyebrow"><span>03</span> 落点 / A PLACE FOR IDEAS</p>
            <h2 id="about-purpose-title">想法，<br>总得有个落点。</h2>
            <p class="about-lead">记录，为了更深刻地思考。</p>
            <p>有些问题，要写下来才想得清楚。有些资料，总会在下一次需要时找不到。有些念头，只有做成工具或作品，才知道它到底是什么。</p>
            <p>于是有了这座网站：把经历过的思考留下，把反复用的东西整理好，也保留一个能自行决定样子的空间。</p>
            <p class="about-quiet">不必完美，才开始。</p>
          </div>
        </section>

        <section id="about-wander" class="about-chapter about-wander" tabindex="-1" aria-labelledby="about-wander-title">
          <h2 id="about-wander-title" class="about-sr-only">挑一片星光，随处逛逛。</h2>
          <div v-show="activeChapter === 3" class="about-wander__heading" aria-hidden="true">
            <p class="about-eyebrow"><span>04</span> 去处 / WAYS TO WANDER</p>
            <p class="about-wander__visual-title">挑一片星光，<br class="about-mobile-break">随处逛逛。</p>
          </div>
        </section>

        <section id="about-making" class="about-chapter about-making" tabindex="-1" aria-labelledby="about-making-title">
          <div class="about-making__heading">
            <p class="about-eyebrow"><span>05</span> 搭建 / ALWAYS IN THE MAKING</p>
            <h2 id="about-making-title">一边使用，一边搭建。</h2>
            <p>写作、计算、编程，把想法慢慢做成东西。按一枚键，看看我手边的工具。</p>
          </div>
          <StackKeyboard class="about-making__keyboard" :active="activeChapter === 4" :progress="keyboardProgress" :paused="paused" />
        </section>

        <section id="about-curiosity" class="about-chapter about-closing" tabindex="-1" aria-labelledby="about-curiosity-title">
          <div class="about-closing__content">
            <p class="about-eyebrow"><span>06</span> 继续 / STILL CURIOUS</p>
            <h2 id="about-curiosity-title">保持好奇，<br>继续创造。</h2>
            <p>编程与开源、数据分析、工具与工作流，<br class="about-desktop-break">设计、动效、音乐、游戏，还有生活里偶然发现的小事——<br class="about-desktop-break">它们不必被归成同一种兴趣，却都能在这里相遇。</p>
            <div class="about-closing__links">
              <RouterLink to="/space1">去读一篇随记</RouterLink>
              <RouterLink to="/code">找个东西玩玩</RouterLink>
            </div>
            <span class="about-signoff">随便逛。我们慢慢认识。</span>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.about-story {
  --about-paper: #eeeae0;
  --about-body: #b2b8c1;
  --about-muted: #858e9d;
  --about-accent: #b9ad96;
  --about-stage-height: calc(100svh - var(--site-header-height, 72px));
  --about-gutter: clamp(28px, 6.1vw, 108px);
  position: relative;
  isolation: isolate;
  background: #03090d;
  color: var(--about-paper);
  font-family: 'Inter', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.about-experience { position: relative; }
.about-stage { position: sticky; top: var(--site-header-height, 72px); width: 100%; height: var(--about-stage-height); overflow: hidden; z-index: 0; }
.about-stage :deep(.stellar-field) { transition: opacity .65s; }
.about-stage--making :deep(.stellar-field) { opacity: .16; pointer-events: none; }
.about-stage__shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgb(3 9 13 / 35%), transparent 37%, transparent 63%, rgb(3 9 13 / 20%)), linear-gradient(0deg, #03090d 0%, transparent 14%, transparent 88%, rgb(3 9 13 / 20%) 100%); }
.about-stage--directory .about-stage__shade { background: linear-gradient(0deg, #03090d 0%, transparent 16%, transparent 90%, rgb(3 9 13 / 12%) 100%); }
.about-instruments { position: sticky; top: var(--site-header-height, 72px); height: var(--about-stage-height); margin-top: calc(-1 * var(--about-stage-height)); z-index: 3; pointer-events: none; }
.about-rail { position: absolute; z-index: 4; left: var(--about-gutter); right: var(--about-gutter); bottom: 25px; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-top: 13px; }
.about-rail__track { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: #9eabc51f; }
.about-rail__track span { display: block; height: 100%; background: #a6a8bb; transform-origin: left center; }
.about-chapters { display: flex; gap: clamp(16px, 2.4vw, 38px); pointer-events: auto; }
.about-chapters a { display: flex; align-items: center; gap: 9px; min-height: 38px; padding: 7px 0; color: #7f8b97; font-size: 11px; text-decoration: none; white-space: nowrap; transition: color .2s; }
.about-chapters__number { font: 10px/1.5 'Fira Code', monospace; }
.about-chapters a[aria-current], .about-chapters a:hover { color: var(--about-paper); }
.about-tools { display: flex; align-items: center; gap: 9px; pointer-events: auto; }
.about-percent { color: #929aa9; font: 10px/1 'Fira Code', monospace; margin-right: 12px; min-width: 30px; }
.about-percent i { color: #526271; font-size: 9px; padding-left: 3px; font-style: normal; }
.about-tools button { display: flex; align-items: center; justify-content: center; gap: 6px; min-width: 36px; height: 36px; border: 1px solid #8d9dab26; border-radius: 50%; padding: 0; color: #a5adba; background: rgb(6 14 20 / 62%); cursor: pointer; transition: color .2s, background .2s; }
.about-tools button:last-child { padding: 0 12px; border-radius: 30px; }
.about-tools button:hover { color: var(--about-paper); background: #16202a; }
.about-tools button:disabled { cursor: default; opacity: .35; }
.about-tools svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; }
.about-tools__label { font-size: 11px; }
.about-narrative { position: relative; margin-top: calc(-1 * var(--about-stage-height)); z-index: 1; pointer-events: none; }
.about-chapter { position: relative; display: flex; align-items: center; min-height: max(var(--about-stage-height), 740px); padding: 110px var(--about-gutter) 135px; scroll-margin-top: var(--site-header-height, 72px); outline: none; }
.about-copy, .about-opening__content, .about-closing__content, .about-making__heading { pointer-events: auto; }
.about-chapter h2.about-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.about-align-left { justify-content: flex-start; }
.about-align-right { justify-content: flex-end; }
.about-copy { width: min(34%, 420px); min-width: 320px; }
.about-eyebrow { display: flex; align-items: baseline; gap: 17px; margin: 0 0 27px; color: #8d96a5; font-size: 10px; line-height: 1.8; letter-spacing: .12em; }
.about-eyebrow > span { color: var(--about-accent); font: 11px/1 'Fira Code', monospace; }
.about-chapter :is(h2, :where(.about-wander__visual-title)) { margin: 0 0 27px; color: var(--about-paper); font-size: clamp(31px, 3.55vw, 53px); line-height: 1.35; font-weight: 430; letter-spacing: -.045em; text-wrap: balance; }
.about-copy > p:not(.about-eyebrow) { margin: 0 0 18px; color: var(--about-body); font-size: 14px; line-height: 2.1; letter-spacing: .025em; text-wrap: pretty; }
.about-chapter strong { color: #d5d7dd; font-weight: 480; }
.about-opening__content { width: min(52%, 660px); padding-bottom: 15px; }
.about-opening h1 { margin: 0 0 31px; color: #a19c94; font-size: 12px; font-weight: 400; letter-spacing: .2em; }
.about-opening h2 { font-size: clamp(48px, 5.1vw, 79px); line-height: 1.28; letter-spacing: -.06em; margin-bottom: 32px; }
.about-opening__intro p { color: var(--about-body); font-size: 14px; line-height: 2; margin: 0 0 13px; letter-spacing: .035em; }
.about-opening__intro p:first-child { color: #d5d3cd; font-size: 15px; }
.about-opening__intro span { letter-spacing: .01em; }
.about-section-marker { position: absolute; top: 88px; right: var(--about-gutter); color: #79828e; font: 10px/1.5 'Fira Code', monospace; }
.about-section-marker i { margin: 0 13px; color: #3b4a58; font-style: normal; }
.about-copy > p.about-lead { color: #d4c8b2; margin-bottom: 22px; font-size: 16px; }
.about-copy > p.about-quiet { color: #9d9488; margin-top: 29px; font-size: 14px; }
.about-wander { align-items: flex-start; padding-top: 95px; }
.about-wander__heading { position: fixed; top: calc(var(--site-header-height, 72px) + 32px); left: var(--about-gutter); right: var(--about-gutter); width: fit-content; max-width: calc(100% - 2 * var(--about-gutter)); pointer-events: none; }
.about-wander__heading > * { width: fit-content; pointer-events: auto; }
.about-wander__heading .about-eyebrow { margin-bottom: 15px; }
.about-wander :is(h2, :where(.about-wander__visual-title)) { font-size: clamp(30px, 3vw, 45px); }
.about-mobile-break { display: none; }
.about-making { display: flex; flex-direction: column; align-items: stretch; justify-content: center; min-height: max(var(--about-stage-height), 900px); padding-top: 95px; padding-bottom: 125px; }
.about-making__heading { width: min(100%, 690px); }
.about-making h2 { font-size: clamp(31px, 3.2vw, 46px); margin-bottom: 18px; }
.about-making__heading > p:last-child { color: var(--about-body); font-size: 14px; line-height: 1.95; margin: 0; }
.about-making__keyboard { width: 100%; margin-top: 24px; pointer-events: auto; }
.about-closing__content { width: min(57%, 690px); }
.about-closing h2 { font-size: clamp(40px, 4.3vw, 65px); margin-bottom: 30px; }
.about-closing__content > p:not(.about-eyebrow) { margin: 0 0 19px; color: #aab2bf; font-size: 14px; line-height: 2.15; letter-spacing: .025em; }
.about-closing__content > p a { color: #c0b8cd; text-decoration: none; border-bottom: 1px solid #817b8c4d; }
.about-closing__links { display: flex; gap: 31px; flex-wrap: wrap; margin-top: 30px; }
.about-closing__links a { display: inline-flex; align-items: center; min-height: 44px; padding: 11px 0; border-top: 1px solid #c1b3975e; border-bottom: 1px solid #c1b3975e; color: #e1d5be; font-size: 14px; text-decoration: none; }
.about-closing__links a:last-child { border-color: #9eabc53b; color: #aeb7c5; }
.about-closing__links a:hover { color: white; border-color: #e0d2b5; }
.about-signoff { display: block; margin-top: 33px; color: #918e88; font-size: 14px; letter-spacing: .08em; }

@media (min-width: 1600px) {
  .about-copy { margin-inline: 3vw; }
  .about-opening__content, .about-closing__content { margin-left: 3vw; }
}
@media (max-width: 1100px) {
  .about-chapters { gap: 18px; }
  .about-chapters__label { display: none; }
  .about-copy { width: 39%; min-width: 300px; }
  .about-opening h2 { font-size: 58px; }
  .about-chapter :is(h2, :where(.about-wander__visual-title)) { font-size: 39px; }
  .about-closing h2 { font-size: 49px; }
  .about-making h2 { font-size: 38px; }
}
@media (max-width: 760px) {
  .about-story { --about-gutter: 26px; }
  .about-stage :deep(.stellar-field) { transform: translateY(clamp(125px, 19svh, 165px)); }
  .about-stage--directory :deep(.stellar-field) { transform: translateY(18px) scale(.82); transform-origin: 50% 0; }
  .about-stage__shade { background: linear-gradient(0deg, #03090d 0%, rgb(3 9 13 / 8%) 10%, transparent 32%); }
  .about-rail { bottom: 18px; padding-top: 10px; gap: 8px; }
  .about-chapters { gap: 5px; }
  .about-chapters a { justify-content: center; padding: 7px 4px; min-width: 25px; min-height: 37px; }
  .about-chapters__number { font-size: 10px; }
  .about-tools { gap: 6px; }
  .about-tools button { min-width: 32px; height: 32px; }
  .about-tools button:last-child { padding: 0 9px; }
  .about-tools__label { display: none; }
  .about-percent { margin-right: 4px; min-width: 28px; font-size: 9px; }
  .about-chapter { align-items: flex-start; min-height: max(var(--about-stage-height), 810px); padding-top: 210px; padding-bottom: 155px; justify-content: flex-start; }
  .about-copy { width: 100%; min-width: 0; max-width: 410px; margin-inline: auto; text-shadow: 0 2px 16px rgb(3 9 13 / 85%); }
  .about-chapter :is(h2, :where(.about-wander__visual-title)) { font-size: clamp(31px, 7.4vw, 42px); line-height: 1.35; margin-bottom: 24px; }
  .about-eyebrow { font-size: 10px; gap: 14px; margin-bottom: 24px; }
  .about-copy > p:not(.about-eyebrow) { font-size: 14px; line-height: 2.05; }
  .about-opening { padding-top: 125px; min-height: max(var(--about-stage-height), 780px); }
  .about-opening__content { width: 100%; padding: 0; }
  .about-opening h1 { font-size: 11px; margin-bottom: 28px; letter-spacing: .15em; }
  .about-opening h2 { font-size: clamp(42px, 11.1vw, 65px); line-height: 1.3; margin-bottom: 33px; }
  .about-opening__intro { max-width: 300px; text-shadow: 0 1px 18px #03090d; }
  .about-opening__intro p { font-size: 14px; line-height: 2.1; margin-bottom: 12px; }
  .about-opening__intro p:first-child { font-size: 15px; }
  .about-section-marker { top: 66px; font-size: 9px; }
  .about-wander { padding-top: 86px; min-height: max(var(--about-stage-height), 810px); }
  .about-wander__heading { top: calc(var(--site-header-height, 72px) + 24px); width: fit-content; }
  .about-wander .about-eyebrow { margin-bottom: 16px; }
  .about-wander :is(h2, :where(.about-wander__visual-title)) { font-size: 31px; line-height: 1.4; }
  .about-mobile-break { display: inline; }
  #about-names { padding-top: 42px; }
  #about-names .about-eyebrow { margin-bottom: 14px; }
  #about-names h2 { margin-bottom: 18px; }
  #about-names h2 br { display: none; }
  #about-names .about-copy > p:not(.about-eyebrow) { line-height: 1.95; margin-bottom: 14px; }
  #about-purpose { padding-top: 32px; justify-content: flex-start; }
  #about-purpose .about-eyebrow { margin-bottom: 14px; }
  #about-purpose h2 { margin-bottom: 18px; }
  #about-purpose h2 br { display: none; }
  #about-purpose .about-copy > p:not(.about-eyebrow) { font-size: 14px; line-height: 1.95; margin-bottom: 14px; }
  #about-purpose .about-copy > p.about-quiet { margin-top: 14px; }
  .about-making { justify-content: flex-start; padding-top: 32px; padding-bottom: 120px; min-height: max(var(--about-stage-height), 850px); }
  .about-making__heading { width: 100%; }
  .about-making__heading .about-eyebrow { margin-bottom: 14px; }
  .about-making h2 { max-width: none; font-size: 31px; margin-bottom: 14px; }
  .about-making__keyboard { margin-top: 12px; }
  .about-closing { padding-top: 42px; min-height: max(var(--about-stage-height), 940px); }
  .about-closing__content { width: 100%; max-width: 410px; margin-inline: auto; }
  .about-closing .about-eyebrow { margin-bottom: 14px; }
  .about-closing h2 { font-size: clamp(34px, 8.8vw, 48px); margin-bottom: 18px; }
  .about-closing__content > p:not(.about-eyebrow) { font-size: 14px; line-height: 1.95; margin-bottom: 14px; }
  .about-closing__links { gap: 22px; margin-top: 18px; }
  .about-signoff { margin-top: 20px; }
  .about-desktop-break { display: none; }
}
@media (max-width: 360px) {
  .about-story { --about-gutter: 21px; }
  .about-chapters { gap: 2px; }
  .about-tools { gap: 5px; }
  .about-percent { display: none; }
  .about-chapter :is(h2, :where(.about-wander__visual-title)) { font-size: 31px; }
  .about-opening h2 { font-size: 41px; }
  .about-closing__links { gap: 17px; }
}
@media (max-height: 800px) and (min-width: 761px) {
  .about-chapter { align-items: flex-start; min-height: max(var(--about-stage-height), 680px); padding-top: 84px; padding-bottom: 135px; }
  .about-chapter:not(.about-opening) :is(h2, :where(.about-wander__visual-title)) { font-size: 37px; line-height: 1.3; margin-bottom: 22px; }
  .about-eyebrow { margin-bottom: 21px; }
  .about-copy > p:not(.about-eyebrow) { line-height: 1.9; margin-bottom: 14px; }
  .about-copy > p.about-lead { font-size: 16px; margin-bottom: 19px; }
  .about-copy > p.about-quiet { margin-top: 23px; }
  .about-section-marker { top: 86px; }
  .about-wander { padding-top: 75px; }
  .about-wander .about-eyebrow { margin-bottom: 15px; }
  .about-wander :is(h2, :where(.about-wander__visual-title)) { font-size: 34px !important; }
  .about-making { min-height: 850px; padding-top: 78px; }
  .about-closing__content > p:not(.about-eyebrow) { line-height: 1.9; margin-bottom: 15px; }
  .about-closing__links { margin-top: 23px; }
  .about-signoff { margin-top: 27px; }
}
@media (max-height: 650px) and (min-width: 761px) {
  .about-chapter { padding-top: 72px; }
  .about-chapter:not(.about-opening) :is(h2, :where(.about-wander__visual-title)) { font-size: 32px; margin-bottom: 18px; }
  .about-eyebrow { margin-bottom: 17px; }
  .about-copy > p:not(.about-eyebrow) { line-height: 1.8; margin-bottom: 12px; }
}
@media (max-height: 590px) {
  .about-wander__heading { top: calc(var(--site-header-height, 72px) + 16px); }
  .about-wander__heading .about-eyebrow { margin-bottom: 8px; }
  .about-wander :is(h2, :where(.about-wander__visual-title)) { font-size: 26px !important; line-height: 1.25; }
  .about-wander :is(h2, :where(.about-wander__visual-title)) br { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .about-story *, .about-story *::before, .about-story *::after { transition: none !important; animation: none !important; }
  .about-stage :deep(.stellar-field) { transition: none; }
}
</style>
