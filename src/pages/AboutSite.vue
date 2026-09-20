<script setup>
import { RouterLink } from 'vue-router'

const sections = [
  {
    title: '随记', to: '/space1', label: '读一篇文章',
    description: '放下需要展开说的事情。这里有科研与技术笔记、学习整理，也有生活观察和阶段性的思考。你可以顺着兴趣慢慢读，也可以带着一个问题来找答案。',
    hint: '按标题、摘要或日期搜索，或从「全部目录」挑选文章。',
  },
  {
    title: '说说', to: '/talk', label: '看看最近的想法',
    description: '一些还不必写成长文的日常、想法与吐槽。比起完整的论述，这里更接近随手记下的片段，也留下了思考发生时的样子。',
    hint: '适合随意翻看，认识文章之外的日常。',
  },
  {
    title: '资源链接', to: '/rd', label: '找一份资源',
    description: '把学习和工作中值得留存的入口放在一起。文献、编程、计算机、资料、工具与文件分门别类，方便需要时再找到它们。',
    hint: '可以搜索资源名称，也可以进入各个分类继续浏览。',
  },
  {
    title: '代码与项目', to: '/code', label: '探索项目',
    description: '从想法走向实现的地方。这里汇集独立创作、主导或参与的代码与项目，包括学习资料、数据分析工具和一些有趣的小实验。',
    hint: '按分类或关键词查找，再通过项目主页和 GitHub 入口了解详情。',
  },
  {
    title: '赛博会客厅', to: '/space3', label: '去串个门',
    description: '给相遇留一个位置。访客中心提供访客信息与地球仪视图；网络邻居连接朋友们的个人站点，让浏览也能成为一次串门。',
    hint: '从这里认识来访的足迹，也走向更多独立的个人空间。',
  },
  {
    title: '关于', to: '/about', label: '继续了解这里',
    description: '网站之外，还有记录它的人。这里收拢了自我介绍、学术主页和版权说明，方便你了解站主的兴趣与研究，以及内容的使用约定。',
    hint: '需要引用内容或复用代码、素材时，请先查看版权说明。',
  },
]
</script>

<template>
  <main class="site-guide" aria-labelledby="site-guide-title">
    <div class="guide-shell">
      <RouterLink class="back-link" to="/about">← 返回关于</RouterLink>
      <header class="guide-hero">
        <p class="eyebrow">01 / ABOUT THIS SPACE</p>
        <h1 id="site-guide-title">网站概览</h1>
        <p class="hero-line">一个用来记录、分享，也不断尝试的个人空间。</p>
        <p class="hero-description">
          欢迎来到 LiuYinChu'Space。这里既是我的笔记本，也是作品与资源的集合：
          把学习和研究中的理解写下来，把反复用到的经验做成工具，也给日常的想法留一点位置。
          第一次来，不妨从下面选一个感兴趣的方向。
        </p>
      </header>

      <section class="section-map" aria-labelledby="section-map-title">
        <div class="section-heading">
          <h2 id="section-map-title">这里有什么</h2>
          <p>六个入口，各有各的用途。</p>
        </div>
        <div class="section-grid">
          <article v-for="(section, index) in sections" :key="section.to" class="section-card">
            <span class="section-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ section.title }}</h3>
            <p class="section-description">{{ section.description }}</p>
            <p class="section-hint">{{ section.hint }}</p>
            <RouterLink :to="section.to" class="section-link">{{ section.label }} <span aria-hidden="true">↗</span></RouterLink>
          </article>
        </div>
      </section>

      <section class="reading-guide" aria-labelledby="reading-guide-title">
        <div class="section-heading">
          <h2 id="reading-guide-title">读起来更顺手</h2>
          <p>给准备停留一会儿的你。</p>
        </div>
        <dl class="reading-list">
          <div>
            <dt>长文章，用目录找路</dt>
            <dd>随记文章提供章节目录，可以直接跳到感兴趣的部分。手机上展开目录后，也能按章节浏览。</dd>
          </div>
          <div>
            <dt>选一种舒服的排版</dt>
            <dd>随记文章默认使用原版排版。目录顶部的按钮可以切换 Enhanced 模式；切换会刷新页面，并记住你的选择，再次点击即可切回。</dd>
          </div>
          <div>
            <dt>公式、代码与图示，一起读</dt>
            <dd>技术文章会结合公式、代码和图表展开说明。遇到较宽的公式或代码，可以在内容区域内横向滚动，查看完整内容。</dd>
          </div>
        </dl>
      </section>

      <aside class="guide-note" aria-label="内容与交流">
        <h2>这里会继续生长</h2>
        <p>有些内容是完整的整理，有些只是某个阶段的记录。阅读时可以留意发布日期，并结合自己的问题判断是否适用。如果发现疏漏，或者想聊聊相关的话题，欢迎通过页脚的 GitHub 或 Email 联系我。</p>
        <RouterLink to="/credit">引用与使用前，看看版权说明 <span aria-hidden="true">→</span></RouterLink>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.site-guide {
  color: var(--ctp-mocha-text);
  background:
    radial-gradient(ellipse at 85% 0%, rgb(137 180 250 / 0.09), transparent 34rem),
    var(--ctp-mocha-base);
  padding: clamp(2rem, 5vw, 4rem) 1.25rem clamp(4rem, 8vw, 7rem);
}
.guide-shell { width: min(1080px, 100%); margin: 0 auto; }
.back-link, .section-link, .guide-note a { color: var(--ctp-mocha-sky); text-decoration: none; }
.back-link { display: inline-block; font-size: 0.9rem; }
a:hover { text-decoration: underline; text-underline-offset: 0.25em; }
a:focus-visible { outline: 2px solid var(--ctp-mocha-sky); outline-offset: 5px; border-radius: 3px; }
.guide-hero { max-width: 800px; padding: clamp(2.5rem, 6vw, 5rem) 0; }
.eyebrow, .section-number { font-family: 'Fira Code', monospace; font-size: 0.75rem; letter-spacing: 0.08em; color: var(--ctp-mocha-sky); }
h1, h2, h3, p { margin: 0; }
h1 { margin: 1rem 0 1.5rem; font-size: clamp(2.7rem, 6vw, 4.8rem); line-height: 1.15; }
.hero-line { font-size: clamp(1.15rem, 2.4vw, 1.55rem); line-height: 1.7; }
.hero-description { margin-top: 1rem; color: var(--ctp-mocha-subtext0); line-height: 1.95; max-width: 46rem; }
.section-heading { margin-bottom: 1.6rem; }
.section-heading h2, .guide-note h2 { font-size: 1.45rem; line-height: 1.5; }
.section-heading p { margin-top: 0.4rem; color: var(--ctp-mocha-subtext0); }
.section-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.section-card { display: flex; flex-direction: column; align-items: start; padding: clamp(1.4rem, 3vw, 2rem); border: 1px solid rgb(166 173 200 / 0.18); border-radius: 12px; background: rgb(49 50 68 / 0.4); }
.section-card h3 { margin-top: 0.7rem; font-size: 1.5rem; }
.section-description { margin-top: 0.85rem; line-height: 1.9; }
.section-hint { margin: 1rem 0 1.4rem; color: var(--ctp-mocha-subtext0); font-size: 0.9rem; line-height: 1.8; }
.section-link { margin-top: auto; padding: 0.25rem 0; font-size: 0.95rem; }
.section-link span { margin-left: 0.4rem; }
.reading-guide { margin-top: clamp(3rem, 7vw, 5rem); }
.reading-list { margin: 0; }
.reading-list > div { display: grid; grid-template-columns: minmax(12rem, 0.75fr) minmax(0, 2fr); gap: 2rem; padding: 1.5rem 0; border-top: 1px solid rgb(166 173 200 / 0.2); }
dt { font-weight: 600; line-height: 1.8; }
dd { margin: 0; color: var(--ctp-mocha-subtext0); line-height: 1.9; }
.guide-note { margin-top: 3rem; border-left: 2px solid var(--ctp-mocha-sky); padding: 0.25rem 0 0.25rem 1.5rem; }
.guide-note p { margin: 0.8rem 0 1rem; color: var(--ctp-mocha-subtext0); line-height: 1.9; max-width: 52rem; }
.guide-note a { line-height: 1.8; }
@media (max-width: 640px) {
  .section-grid { grid-template-columns: 1fr; }
  .reading-list > div { grid-template-columns: 1fr; gap: 0.5rem; }
  .guide-note { padding-left: 1rem; }
}
</style>
