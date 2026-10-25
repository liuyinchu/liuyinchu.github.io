<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import StellarField from '../components/effects/StellarField.vue'

const experience = ref(null)
const stage = ref(null)
const field = ref(null)
const progress = ref(0)
const activeChapter = ref(0)
const paused = ref(false)
const ready = ref(false)
const unavailable = ref(false)
const chapters = [
  { id: 'about-space', label: '这个空间' },
  { id: 'about-names', label: '名字偏航' },
  { id: 'about-purpose', label: '想法落点' },
  { id: 'about-wander', label: '随处逛逛' },
  { id: 'about-making', label: '一边搭建' },
  { id: 'about-curiosity', label: '未完待续' },
]
const formation = computed(() => {
  if (progress.value < .13) return '01 / 命名轨道'
  if (progress.value < .28) return '散开 / 寻找落点'
  if (progress.value < .53) return '02 / 搭建结构'
  if (progress.value < .72) return '散开 / 彼此靠近'
  if (progress.value < .93) return '03 / 兴趣星图'
  return '向外 / 未完待续'
})
const readingProgress = computed(() => String(Math.round(progress.value * 100)).padStart(2, '0'))
let frame = 0
let resizeObserver
let sections = []
let reducedMotion
let previousTitle

function updateProgress() {
  frame = 0
  if (!experience.value || !stage.value) return
  const top = Number.parseFloat(getComputedStyle(stage.value).top) || 0
  const distance = Math.max(1, experience.value.offsetHeight - stage.value.offsetHeight)
  progress.value = Math.max(0, Math.min(1, (top - experience.value.getBoundingClientRect().top) / distance))
  const readingLine = top + stage.value.offsetHeight * .42
  let current = 0
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= readingLine) current = index
  })
  activeChapter.value = current
}
function scheduleProgress() {
  if (!frame) frame = requestAnimationFrame(updateProgress)
}
function goTo(id) {
  const section = sections.find((item) => item.id === id)
  if (!section) return
  section.focus({ preventScroll: true })
  section.scrollIntoView({ block: 'start', behavior: reducedMotion?.matches ? 'instant' : 'smooth' })
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
  document.title = "关于我 & 关于本站 · LiuYinChu'Space"
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  sections = Array.from(experience.value.querySelectorAll('section[id]'))
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
      <div ref="stage" class="about-stage">
        <StellarField
          ref="field"
          profile="about"
          :progress="progress"
          :paused="paused"
          :interactive="true"
          @ready="onReady"
          @unavailable="onUnavailable"
        />
        <div class="about-stage__shade" aria-hidden="true"></div>
      </div>

      <div class="about-instruments">
        <div class="about-coordinate" aria-hidden="true">
          <span>LIUYINCHU'SPACE <i>／</i> A PERSONAL ORBIT</span>
          <span class="about-coordinate__right">{{ formation }}</span>
        </div>
        <div class="about-rail">
          <div class="about-rail__track" aria-hidden="true">
            <span :style="{ transform: 'scaleX(' + progress + ')' }"></span>
          </div>
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
              :disabled="!ready"
              :aria-label="paused ? '继续星空动画' : '暂停星空动画'"
              :aria-pressed="paused"
              :title="paused ? '继续星空' : '暂停星空'"
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
        <p class="about-gesture">
          <template v-if="unavailable">星图静静亮着，向下读故事。</template>
          <template v-else><span class="about-gesture__desktop">拖动星光，换个角度。</span><span class="about-gesture__mobile">横向轻扫星光。</span>向下，慢慢认识这里。</template>
        </p>
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
            <a class="about-read-on" href="#about-names" @click.prevent="goTo('about-names')">从一个名字开始 <span aria-hidden="true">↓</span></a>
          </div>
          <div class="about-opening__aside" aria-hidden="true">
            <span>零散的念头，也有自己的轨道。</span>
            <span>SCROLL TO WANDER</span>
          </div>
          <span class="about-section-marker" aria-hidden="true">01 <i>/</i> 06</span>
        </section>

        <section id="about-names" class="about-chapter about-align-right" tabindex="-1" aria-labelledby="about-names-title">
          <div class="about-copy">
            <p class="about-eyebrow"><span>02</span> 名字 / A SLIGHT DETOUR</p>
            <h2 id="about-names-title">名字有一点<br>偏航。</h2>
            <p><strong lang="en">LiuYinChu</strong> 来自「流萤厨」。本来应该是 <span lang="en">Ying</span>，却因为口音，拼成了 <span lang="en">Yin</span>。有点难绷，但这个小小的偏航，就这样留下了。</p>
            <p>另一个名字是 <strong lang="en">pifuyuini</strong>——梦游时打在手机上的一串字。没有严谨的来历，也挺好。</p>
            <div class="about-name-note">
              <span class="about-name-note__emoji" role="img" aria-label="书呆子表情和向上指的手指">🤓☝️</span>
              <p>喜欢这个表情。<br>创造、灵感、活力，<br>还有一点疯疯的抽象感。</p>
            </div>
          </div>
          <p class="about-marginalia about-marginalia--left" aria-hidden="true">YING <span>↘</span> YIN<br><small>有些误差，后来成了自己。</small></p>
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
          <div class="about-purpose-trace" aria-hidden="true">
            <span>记下来</span><i></i><span>想清楚</span><i></i><span>做出来</span>
          </div>
        </section>

        <section id="about-wander" class="about-chapter about-wander about-align-right" tabindex="-1" aria-labelledby="about-wander-title">
          <div class="about-copy about-copy--wide">
            <p class="about-eyebrow"><span>04</span> 去处 / WAYS TO WANDER</p>
            <h2 id="about-wander-title">这里可以认真，<br>也可以随便逛逛。</h2>
            <p>这些栏目没有严格的边界。<br>挑一个此刻感兴趣的入口，就好。</p>
            <ul class="about-destinations">
              <li><RouterLink to="/space1"><span>随记</span><span>把一个问题，慢慢展开。</span><i aria-hidden="true">↗</i></RouterLink></li>
              <li><RouterLink to="/talk"><span>说说</span><span>留住还没长成文章的念头。</span><i aria-hidden="true">↗</i></RouterLink></li>
              <li><RouterLink to="/rd"><span>资源</span><span>收好值得再回来找的入口。</span><i aria-hidden="true">↗</i></RouterLink></li>
              <li><RouterLink to="/code"><span>代码项目</span><span>把想法做成可用、可玩的东西。</span><i aria-hidden="true">↗</i></RouterLink></li>
            </ul>
            <p class="about-experiments">也可以走远一点：打开 <RouterLink to="/portal">Portal ↗</RouterLink>，翻翻 <RouterLink to="/space4">星穹文库 ↗</RouterLink>，或去代码项目里找一场音乐与星空的实验。好奇心可以不带目的地。</p>
          </div>
        </section>

        <section id="about-making" class="about-chapter about-making about-align-left" tabindex="-1" aria-labelledby="about-making-title">
          <div class="about-copy">
            <p class="about-eyebrow"><span>05</span> 搭建 / ALWAYS IN THE MAKING</p>
            <h2 id="about-making-title">一边使用，<br>一边搭建。</h2>
            <p>网站本身，也是这里的一件作品。写下内容、整理入口、打磨一个小交互，都是让它继续生长的方式。</p>
            <p>用 <strong>Vue 3、Vite 和 Vue Router</strong> 搭起页面，以 <strong>Markdown 与 JSON</strong> 存放内容，再交给 <strong>GitHub Pages</strong> 静态托管。</p>
            <p>文字可以带着代码、公式与图示一起出现；星空则让一些难以用文字说完的感觉，有了可以触碰的形状。</p>
          </div>
          <div class="about-colophon">
            <p class="about-colophon__heading">这座空间的材料</p>
            <dl>
              <div><dt>文字与内容</dt><dd>Markdown <span>/</span> JSON</dd></div>
              <div><dt>阅读与表达</dt><dd>markdown-it <span>/</span> highlight.js<br>MathJax <span>/</span> Mermaid</dd></div>
              <div><dt>星光与交互</dt><dd>WebGL</dd></div>
              <div><dt>落在网络上</dt><dd>GitHub Pages</dd></div>
            </dl>
            <p>持续修改，也持续使用。</p>
          </div>
        </section>

        <section id="about-curiosity" class="about-chapter about-closing" tabindex="-1" aria-labelledby="about-curiosity-title">
          <div class="about-closing__content">
            <p class="about-eyebrow"><span>06</span> 继续 / STILL CURIOUS</p>
            <h2 id="about-curiosity-title">保留好奇，<br>也保留一点抽象。</h2>
            <p>编程与开源、数据分析、工具与工作流，<br class="about-desktop-break">设计、动效、音乐、游戏，还有生活里偶然发现的小事——<br class="about-desktop-break">它们不必被归成同一种兴趣，却都能在这里相遇。</p>
            <p>这座空间还会继续变。<br>如果刚好有一样东西让你停留，那就很好。</p>
            <div class="about-closing__links">
              <RouterLink to="/space1">去读一篇随记 <span aria-hidden="true">↗</span></RouterLink>
              <RouterLink to="/code">找个东西玩玩 <span aria-hidden="true">↗</span></RouterLink>
            </div>
            <span class="about-signoff">随便逛。我们慢慢认识。</span>
          </div>
          <span class="about-closing__end" aria-hidden="true">THE SPACE KEEPS GROWING <i>↗</i></span>
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
.about-stage {
  position: sticky;
  top: var(--site-header-height, 72px);
  width: 100%;
  height: var(--about-stage-height);
  overflow: hidden;
  z-index: 0;
}
.about-stage__shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgb(3 9 13 / 44%), transparent 37%, transparent 63%, rgb(3 9 13 / 28%)), linear-gradient(0deg, #03090d 0%, transparent 14%, transparent 88%, rgb(3 9 13 / 28%) 100%);
}
.about-instruments {
  position: sticky;
  top: var(--site-header-height, 72px);
  height: var(--about-stage-height);
  margin-top: calc(-1 * var(--about-stage-height));
  z-index: 3;
  pointer-events: none;
}
.about-coordinate {
  position: absolute;
  top: 27px;
  left: var(--about-gutter);
  right: var(--about-gutter);
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #76828e;
  font: 9px/1.5 'Fira Code', monospace;
  letter-spacing: .12em;
}
.about-coordinate i { padding: 0 .7em; font-style: normal; color: #445460; }
.about-coordinate__right { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: .14em; }
.about-rail {
  position: absolute;
  left: var(--about-gutter);
  right: var(--about-gutter);
  bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-top: 13px;
}
.about-rail__track { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: #9eabc51f; }
.about-rail__track span { display: block; height: 100%; background: #a6a8bb; transform-origin: left center; }
.about-chapters { display: flex; gap: clamp(16px, 2.4vw, 38px); pointer-events: auto; }
.about-chapters a {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 7px 0;
  color: #707c88;
  font-size: 10px;
  text-decoration: none;
  white-space: nowrap;
  transition: color .2s;
}
.about-chapters__number { font: 9px/1.5 'Fira Code', monospace; }
.about-chapters a[aria-current] { color: var(--about-paper); }
.about-chapters a:hover { color: var(--about-paper); }
.about-tools { display: flex; align-items: center; gap: 9px; pointer-events: auto; }
.about-percent { color: #929aa9; font: 10px/1 'Fira Code', monospace; margin-right: 12px; min-width: 30px; }
.about-percent i { color: #526271; font-size: 8px; padding-left: 3px; font-style: normal; }
.about-tools button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 36px;
  height: 36px;
  border: 1px solid #8d9dab26;
  border-radius: 50%;
  padding: 0;
  color: #a5adba;
  background: rgb(6 14 20 / 62%);
  cursor: pointer;
  transition: color .2s, background .2s;
}
.about-tools button:last-child { padding: 0 12px; border-radius: 30px; }
.about-tools button:hover { color: var(--about-paper); background: #16202a; }
.about-tools button:disabled { cursor: default; opacity: .35; }
.about-tools svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; }
.about-tools__label { font-size: 10px; }
.about-gesture { position: absolute; bottom: 94px; right: var(--about-gutter); color: #7c8792; font-size: 10px; letter-spacing: .07em; line-height: 1.7; margin: 0; }
.about-gesture__mobile { display: none; }
.about-narrative {
  position: relative;
  margin-top: calc(-1 * var(--about-stage-height));
  z-index: 1;
  pointer-events: none;
}
.about-chapter {
  position: relative;
  display: flex;
  align-items: center;
  min-height: max(var(--about-stage-height), 720px);
  padding: 120px var(--about-gutter) 145px;
  scroll-margin-top: var(--site-header-height, 72px);
  outline: none;
}
.about-chapter:focus-visible { outline: none; }
.about-copy, .about-opening__content, .about-closing__content, .about-colophon { pointer-events: auto; }
.about-align-left { justify-content: flex-start; }
.about-align-right { justify-content: flex-end; }
.about-copy { width: min(33%, 410px); min-width: 320px; }
.about-copy--wide { width: min(40%, 475px); }
.about-eyebrow {
  display: flex;
  align-items: baseline;
  gap: 17px;
  margin: 0 0 31px;
  color: #8d96a5;
  font-size: 9px;
  line-height: 1.8;
  letter-spacing: .12em;
}
.about-eyebrow > span { color: var(--about-accent); font: 11px/1 'Fira Code', monospace; }
.about-chapter h2 {
  margin: 0 0 29px;
  color: var(--about-paper);
  font-size: clamp(31px, 3.55vw, 53px);
  line-height: 1.35;
  font-weight: 430;
  letter-spacing: -.045em;
  text-wrap: balance;
}
.about-copy > p:not(.about-eyebrow) {
  margin: 0 0 18px;
  color: var(--about-body);
  font-size: 13px;
  line-height: 2.15;
  letter-spacing: .025em;
  text-wrap: pretty;
}
.about-chapter strong { color: #d5d7dd; font-weight: 480; }
.about-opening { align-items: center; }
.about-opening__content { width: min(52%, 660px); padding-bottom: 15px; }
.about-opening h1 { margin: 0 0 31px; color: #a19c94; font-size: 11px; font-weight: 400; letter-spacing: .2em; }
.about-opening h2 { font-size: clamp(48px, 5.1vw, 79px); line-height: 1.28; letter-spacing: -.06em; margin-bottom: 32px; }
.about-opening__intro p { color: var(--about-body); font-size: 13px; line-height: 2; margin: 0 0 13px; letter-spacing: .035em; }
.about-opening__intro p:first-child { color: #d5d3cd; font-size: 14px; }
.about-opening__intro span { letter-spacing: .01em; }
.about-read-on { display: inline-flex; gap: 35px; align-items: center; color: #c2b9a7; margin-top: 21px; padding: 8px 0; border-bottom: 1px solid #8a817347; font-size: 11px; letter-spacing: .06em; text-decoration: none; }
.about-read-on:hover { color: #fff2db; text-decoration: none; }
.about-read-on > span { font-size: 17px; font-weight: 300; }
.about-opening__aside { position: absolute; bottom: 162px; right: var(--about-gutter); display: grid; gap: 17px; color: #8c95a0; font-size: 11px; letter-spacing: .12em; text-align: right; }
.about-opening__aside > span:last-child { color: #5d6d79; font: 8px/1.5 'Fira Code', monospace; letter-spacing: .2em; }
.about-section-marker { position: absolute; top: 115px; right: var(--about-gutter); color: #79828e; font: 10px/1.5 'Fira Code', monospace; }
.about-section-marker i { margin: 0 13px; color: #3b4a58; font-style: normal; }
.about-name-note { display: flex; align-items: center; gap: 19px; margin-top: 30px; padding-top: 23px; border-top: 1px solid #a2a6b329; }
.about-name-note__emoji { font-size: 29px; white-space: nowrap; letter-spacing: -.16em; padding-right: 5px; }
.about-name-note p { margin: 0; color: #8a95a2; font-size: 11px; line-height: 1.9; }
.about-marginalia { position: absolute; bottom: 185px; color: #8d9bad; font: 12px/1.6 'Fira Code', monospace; letter-spacing: .12em; }
.about-marginalia--left { left: var(--about-gutter); }
.about-marginalia > span { color: #ada28c; margin: 0 17px; }
.about-marginalia small { display: block; color: #657585; font: 10px/2 'PingFang SC', 'Microsoft YaHei', sans-serif; margin-top: 16px; letter-spacing: .1em; }
.about-copy > p.about-lead { color: #d4c8b2; margin-bottom: 22px; font-size: 15px; }
.about-copy > p.about-quiet { color: #9d9488; margin-top: 29px; font-size: 11px; }
.about-purpose-trace { position: absolute; right: var(--about-gutter); bottom: 175px; display: flex; align-items: center; gap: 15px; color: #7e8997; font-size: 10px; letter-spacing: .1em; }
.about-purpose-trace i { width: 29px; height: 1px; background: #74839645; }
.about-wander h2 { font-size: clamp(29px, 3vw, 45px); }
.about-destinations { list-style: none; margin: 25px 0 22px; padding: 0; border-top: 1px solid #a0a7b82c; }
.about-destinations li { border-bottom: 1px solid #a0a7b825; }
.about-destinations a { display: grid; grid-template-columns: 68px 1fr 12px; gap: 13px; align-items: baseline; padding: 16px 0; text-decoration: none; color: #c9ccd3; }
.about-destinations a > span:first-child { font-size: 13px; }
.about-destinations a > span:nth-child(2) { color: #919ba8; font-size: 11px; line-height: 1.8; }
.about-destinations i { color: #737f91; font-size: 12px; font-style: normal; }
.about-destinations a:hover, .about-destinations a:hover > span:nth-child(2), .about-destinations a:hover > i { color: #e7dbc7; }
.about-copy > p.about-experiments { font-size: 11px; line-height: 2.1; color: #8b97a5; }
.about-experiments a { display: inline-block; color: #bbb4cb; border-bottom: 1px solid #817b8c4d; text-decoration: none; line-height: 1.7; }
.about-experiments a:hover { color: #ede2fa; }
.about-colophon { position: absolute; right: var(--about-gutter); width: min(27%, 340px); bottom: 170px; }
.about-colophon__heading { color: #b2aa9b; font-size: 10px; letter-spacing: .18em; margin: 0 0 20px; }
.about-colophon dl { margin: 0; border-top: 1px solid #9eabc52a; }
.about-colophon dl > div { display: grid; grid-template-columns: 80px 1fr; gap: 13px; padding: 15px 0; border-bottom: 1px solid #9eabc51c; }
.about-colophon dt { font-size: 10px; color: #7b8998; line-height: 1.9; }
.about-colophon dd { margin: 0; color: #aab4c3; font: 10px/1.9 'Fira Code', monospace; overflow-wrap: anywhere; }
.about-colophon dd span { color: #5e6a7c; padding: 0 3px; }
.about-colophon > p:last-child { margin-top: 16px; color: #657484; font-size: 9px; letter-spacing: .08em; }
.about-closing { align-items: center; }
.about-closing__content { width: min(57%, 690px); }
.about-closing h2 { font-size: clamp(40px, 4.3vw, 65px); margin-bottom: 30px; }
.about-closing__content > p:not(.about-eyebrow) { margin: 0 0 19px; color: #aab2bf; font-size: 13px; line-height: 2.2; letter-spacing: .025em; }
.about-closing__links { display: flex; gap: 31px; flex-wrap: wrap; margin-top: 30px; }
.about-closing__links a { display: inline-flex; gap: 26px; align-items: center; padding: 13px 0; border-top: 1px solid #c1b3975e; border-bottom: 1px solid #c1b3975e; color: #e1d5be; font-size: 12px; text-decoration: none; }
.about-closing__links a:last-child { border-color: #9eabc53b; color: #aeb7c5; }
.about-closing__links a:hover { color: white; border-color: #e0d2b5; }
.about-signoff { display: block; margin-top: 37px; color: #918e88; font-size: 11px; letter-spacing: .08em; }
.about-closing__end { position: absolute; right: var(--about-gutter); bottom: 170px; color: #657382; font: 8px/1.6 'Fira Code', monospace; letter-spacing: .12em; writing-mode: vertical-rl; }
.about-closing__end i { font-size: 20px; font-style: normal; margin-top: 16px; color: #8b8d91; }

@media (min-width: 1600px) {
  .about-copy { margin-inline: 3vw; }
  .about-opening__content, .about-closing__content { margin-left: 3vw; }
}
@media (max-width: 1100px) {
  .about-chapters { gap: 18px; }
  .about-chapters__label { display: none; }
  .about-copy { width: 38%; min-width: 300px; }
  .about-copy--wide { width: 46%; }
  .about-colophon { width: 29%; }
  .about-colophon dl > div { grid-template-columns: 1fr; gap: 4px; padding: 11px 0; }
  .about-opening h2 { font-size: 56px; }
  .about-chapter h2 { font-size: 39px; }
  .about-opening h2 { font-size: 58px; }
  .about-closing h2 { font-size: 49px; }
}
@media (max-width: 760px) {
  .about-story { --about-gutter: 26px; }
  .about-coordinate { top: 23px; font-size: 7px; gap: 10px; letter-spacing: .07em; }
  .about-coordinate i { padding: 0 .35em; }
  .about-coordinate__right { font-size: 8px; letter-spacing: .04em; white-space: nowrap; }
  .about-stage :deep(.stellar-field) { transform: translateY(clamp(125px, 19svh, 165px)); }
  .about-stage__shade { background: linear-gradient(0deg, #03090d 0%, rgb(3 9 13 / 8%) 10%, transparent 32%); }
  .about-rail { bottom: 18px; padding-top: 10px; gap: 8px; }
  .about-chapters { gap: 5px; }
  .about-chapters a { justify-content: center; padding: 7px 4px; min-width: 25px; min-height: 37px; }
  .about-chapters__number { font-size: 9px; }
  .about-tools { gap: 6px; }
  .about-tools button { min-width: 32px; height: 32px; }
  .about-tools button:last-child { padding: 0 9px; }
  .about-tools__label { display: none; }
  .about-percent { margin-right: 4px; min-width: 28px; font-size: 9px; }
  .about-gesture { bottom: 79px; font-size: 9px; letter-spacing: .025em; }
  .about-gesture__desktop { display: none; }
  .about-gesture__mobile { display: inline; }
  .about-chapter {
    align-items: flex-start;
    min-height: max(var(--about-stage-height), 790px);
    padding-top: 220px;
    padding-bottom: 155px;
    justify-content: flex-start;
  }
  .about-copy, .about-copy--wide { width: 100%; min-width: 0; max-width: 410px; margin-inline: auto; }
  .about-copy { background: radial-gradient(ellipse at 45% 48%, rgb(3 9 13 / 32%), transparent 80%); text-shadow: 0 2px 16px rgb(3 9 13 / 95%); }
  .about-chapter h2 { font-size: clamp(31px, 7.4vw, 42px); line-height: 1.35; margin-bottom: 24px; }
  .about-eyebrow { font-size: 8px; gap: 14px; margin-bottom: 24px; }
  .about-eyebrow > span { font-size: 10px; }
  .about-copy > p:not(.about-eyebrow) { font-size: 13px; line-height: 2.05; }
  .about-opening { padding-top: 130px; min-height: max(var(--about-stage-height), 750px); }
  .about-opening__content { width: 100%; padding: 0; }
  .about-opening h1 { font-size: 10px; margin-bottom: 28px; letter-spacing: .15em; }
  .about-opening h2 { font-size: clamp(42px, 11.1vw, 65px); line-height: 1.3; margin-bottom: 33px; }
  .about-opening__intro { max-width: 285px; text-shadow: 0 1px 18px #03090d; }
  .about-opening__intro p { font-size: 12px; line-height: 2.1; margin-bottom: 12px; }
  .about-opening__intro p:first-child { font-size: 13px; }
  .about-read-on { font-size: 10px; margin-top: 18px; }
  .about-opening__aside { display: none; }
  .about-section-marker { top: 77px; font-size: 8px; }
  .about-marginalia, .about-purpose-trace { display: none; }
  .about-name-note { margin-top: 26px; padding-top: 21px; }
  .about-name-note__emoji { font-size: 25px; }
  .about-name-note p { font-size: 10px; }
  .about-wander { padding-top: 200px; }
  .about-wander h2 { font-size: clamp(29px, 7vw, 39px); }
  .about-destinations { margin-top: 23px; }
  .about-destinations a { grid-template-columns: 65px 1fr 10px; gap: 9px; padding: 15px 0; }
  .about-destinations a > span:first-child { font-size: 12px; }
  .about-destinations a > span:nth-child(2) { font-size: 10px; }
  .about-copy > p.about-experiments { font-size: 11px; }
  .about-making { display: block; }
  .about-colophon { position: relative; right: auto; bottom: auto; width: 100%; max-width: 410px; margin: 36px auto 0; }
  .about-colophon__heading { font-size: 9px; margin-bottom: 17px; }
  .about-colophon dl > div { grid-template-columns: 85px 1fr; gap: 10px; padding: 12px 0; }
  .about-colophon dd { font-size: 9px; }
  .about-colophon dt { font-size: 9px; }
  .about-closing { padding-top: 230px; min-height: max(var(--about-stage-height), 880px); }
  .about-closing__content { width: 100%; max-width: 410px; margin-inline: auto; }
  .about-closing h2 { font-size: clamp(34px, 8.8vw, 48px); }
  .about-closing__content > p:not(.about-eyebrow) { font-size: 12px; line-height: 2.15; }
  .about-closing__links { gap: 22px; margin-top: 29px; }
  .about-closing__links a { gap: 20px; font-size: 11px; padding: 13px 0; }
  .about-signoff { margin-top: 30px; font-size: 10px; }
  .about-closing__end { display: none; }
  .about-desktop-break { display: none; }
}
@media (max-width: 360px) {
  .about-story { --about-gutter: 21px; }
  .about-coordinate { font-size: 6px; }
  .about-coordinate__right { font-size: 7px; }
  .about-chapters { gap: 2px; }
  .about-tools { gap: 5px; }
  .about-percent { display: none; }
  .about-chapter h2 { font-size: 31px; }
  .about-opening h2 { font-size: 41px; }
  .about-closing__links { gap: 17px; }
  .about-closing__links a { gap: 15px; font-size: 10px; }
}
@media (max-height: 800px) and (min-width: 761px) {
  .about-chapter {
    align-items: flex-start;
    min-height: max(var(--about-stage-height), 650px);
    padding-top: 84px;
    padding-bottom: 145px;
  }
  .about-chapter:not(.about-opening) h2 { font-size: 37px; line-height: 1.3; margin-bottom: 22px; }
  .about-eyebrow { margin-bottom: 21px; }
  .about-copy > p:not(.about-eyebrow) { font-size: 14px; line-height: 1.9; margin-bottom: 14px; }
  .about-copy > p.about-lead { font-size: 15px; margin-bottom: 19px; }
  .about-copy > p.about-quiet { font-size: 11px; margin-top: 23px; }
  .about-name-note { margin-top: 20px; padding-top: 18px; }
  .about-name-note p { font-size: 14px; line-height: 1.75; }
  .about-name-note__emoji { font-size: 26px; }
  .about-destinations { margin-top: 20px; margin-bottom: 18px; }
  .about-destinations a { padding: 12px 0; }
  .about-copy > p.about-experiments { font-size: 14px; line-height: 1.9; }
  .about-colophon { top: clamp(164px, 27vh, 210px); bottom: auto; }
  .about-colophon__heading { margin-bottom: 15px; }
  .about-colophon dl > div { padding-top: 11px; padding-bottom: 11px; }
  .about-colophon > p:last-child { margin-top: 12px; }
  .about-gesture { top: 51px; bottom: auto; }
  .about-opening__aside { bottom: 155px; }
  .about-section-marker { top: 86px; }
  .about-closing__content > p:not(.about-eyebrow) { font-size: 14px; line-height: 1.9; margin-bottom: 15px; }
  .about-closing__links { margin-top: 23px; }
  .about-signoff { margin-top: 27px; }
}
@media (max-height: 650px) and (min-width: 761px) {
  .about-chapter { padding-top: 72px; }
  .about-chapter:not(.about-opening) h2 { font-size: 32px; margin-bottom: 18px; }
  .about-eyebrow { margin-bottom: 17px; }
  .about-copy > p:not(.about-eyebrow) { line-height: 1.8; margin-bottom: 12px; }
  .about-colophon dd, .about-colophon dt { font-size: 9px; }
  .about-colophon dl > div { padding-top: 9px; padding-bottom: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .about-story *, .about-story *::before, .about-story *::after { transition: none !important; animation: none !important; }
}
</style>
