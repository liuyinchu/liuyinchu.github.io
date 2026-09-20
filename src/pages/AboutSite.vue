<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import handbook from '../content/site-handbook.md?raw'

const toc = ref([])
function updateToc(headings) {
  toc.value = headings.filter((heading) => heading.level === 2)
}

// The router ignores unchanged hashes; a repeated chapter click should still scroll.
function repeatSectionNavigation(event) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const link = event.target.closest('a[href^="#"]')
  const hash = link?.getAttribute('href')
  if (!hash || hash !== window.location.hash) return
  const heading = document.getElementById(hash.slice(1))
  if (!heading) return
  event.preventDefault()
  heading.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <main class="site-handbook" aria-labelledby="handbook-title">
    <div class="handbook-shell">
      <RouterLink class="back-link" to="/about">← 关于</RouterLink>
      <header class="handbook-hero">
        <p class="eyebrow">01 / INSIDE THIS SPACE</p>
        <h1 id="handbook-title">网站说明书</h1>
        <p class="hero-line">内容、功能，以及它们为什么长成现在的样子。</p>
        <p class="hero-description">从一篇随记，到一张星环、一台网页桌面、一匹会生长的布。这份文档慢慢展开 LiuYinChu'Space 的各个部分：可以做什么，怎样使用，界面藏着哪些细节，又留下了哪些尚未完成的地方。</p>
        <div class="handbook-meta" aria-label="文档信息">
          <span>{{ toc.length || 14 }} 个章节</span>
          <span>内容 · 交互 · 设计</span>
          <span>随网站一起更新</span>
        </div>
      </header>
      <div class="handbook-layout" @click="repeatSectionNavigation">
        <aside class="handbook-toc" aria-label="网站说明书目录">
          <TableOfContents :toc="toc" />
        </aside>
        <article class="handbook-content" aria-label="网站说明书正文">
          <MarkdownViewer :content="handbook" variant="embed" use-c-j-k @toc-generated="updateToc" />
        </article>
      </div>
    </div>
  </main>
</template>

<style scoped>
.site-handbook {
  color: var(--ctp-mocha-text);
  background:
    radial-gradient(ellipse at 85% 0%, rgb(137 180 250 / 0.08), transparent 38rem),
    var(--ctp-mocha-base);
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem) 6rem;
}
.handbook-shell { width: min(1240px, 100%); margin: 0 auto; }
.back-link { color: var(--ctp-mocha-sky); font-size: 0.9rem; text-decoration: none; }
.back-link:hover { text-decoration: underline; text-underline-offset: 0.25em; }
.back-link:focus-visible { outline: 2px solid var(--ctp-mocha-sky); outline-offset: 5px; }
.handbook-hero { max-width: 850px; padding: clamp(2.5rem, 6vw, 5rem) 0 3rem; }
.eyebrow { margin: 0; color: var(--ctp-mocha-sky); font: 0.75rem 'Fira Code', monospace; letter-spacing: 0.08em; }
h1 { margin: 1rem 0 1.4rem; font-size: clamp(2.7rem, 6vw, 4.7rem); line-height: 1.15; }
.hero-line { font-size: clamp(1.15rem, 2.2vw, 1.55rem); line-height: 1.7; margin: 0; }
.hero-description { max-width: 45rem; margin: 1.1rem 0 1.5rem; color: var(--ctp-mocha-subtext0); line-height: 1.95; }
.handbook-meta { display: flex; flex-wrap: wrap; gap: 0.65rem 1.2rem; color: var(--ctp-mocha-subtext0); font-size: 0.8rem; }
.handbook-layout { display: grid; grid-template-columns: minmax(0, 1fr) 245px; gap: clamp(1.5rem, 3vw, 3rem); align-items: start; }
.handbook-toc { grid-column: 2; grid-row: 1; align-self: stretch; min-width: 0; }
.handbook-content { grid-column: 1; grid-row: 1; min-width: 0; padding: clamp(1.5rem, 3.5vw, 3rem); border: 1px solid rgb(166 173 200 / 0.13); border-radius: 12px; background: rgb(24 24 37 / 0.48); }
.handbook-content :deep(.markdown-body) { max-width: none; margin: 0; padding: 0; font-size: 1.08rem; line-height: 1.95; }
.handbook-content :deep(h2) { padding-top: 0.7rem; border-top: 1px solid rgb(166 173 200 / 0.18); scroll-margin-top: 0.25rem; font-size: 1.65rem; }
.handbook-content :deep(h2:first-child) { margin-top: 0; padding-top: 0; border-top: 0; }
.handbook-content :deep(h3) { scroll-margin-top: 0.25rem; font-size: 1.25rem; margin-top: 2rem; }
.handbook-content :deep(h4) { font-size: 1.08rem; }
.handbook-content :deep(table) { font-size: 0.93rem; }
.handbook-content :deep(.mermaid) { margin: 1.5rem 0; }
.handbook-content :deep(.mermaid svg) { min-width: 40rem; }
.handbook-toc :deep(.toc-level-2) { padding-left: 0; }
@media (max-width: 1099px) {
  .handbook-layout { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
  .handbook-toc, .handbook-content { grid-column: 1; grid-row: auto; }
}
@media (max-width: 640px) {
  .handbook-hero { padding-bottom: 2rem; }
  .handbook-content { padding: 1.15rem; }
  .handbook-content :deep(.markdown-body) { font-size: 1rem; line-height: 1.9; }
  .handbook-content :deep(h2) { font-size: 1.4rem; }
}
</style>
