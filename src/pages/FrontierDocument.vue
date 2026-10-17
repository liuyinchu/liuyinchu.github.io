<script setup>
import { computed, ref } from 'vue'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import '../components/frontier/frontier-pages.css'

const props = defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, required: true },
  description: { type: String, required: true },
  src: { type: String, required: true },
})
const contents = ref([])
const markdown = ref('')
const isSkillCollection = computed(() => props.src === '/ai-frontier/skills.md')
const skillCount = computed(() => (markdown.value.match(/^- \[[^\]]+\]\(/gm) || []).length)
</script>

<template>
  <FrontierShell :title="title + ' · Ysy AI Frontier'">
    <header class="frontier-report-cover" :class="{ 'skill-cover': isSkillCollection }">
      <nav class="frontier-breadcrumb" aria-label="当前位置"><RouterLink to="/ai-frontier">AI Frontier</RouterLink><span aria-hidden="true">/</span><span>{{ title }}</span></nav>
      <div class="frontier-report-heading">
        <div class="frontier-report-title">
          <div class="frontier-eyebrow">{{ eyebrow }}</div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
        <div v-if="isSkillCollection && skillCount" class="skill-summary" aria-label="收集概览">
          <strong>{{ String(skillCount).padStart(2, '0') }}</strong>
          <div><span>条 Skill</span><small>持续收集，按需取用</small></div>
        </div>
      </div>
    </header>
    <section class="frontier-section frontier-document" :class="{ 'skill-document': isSkillCollection }" :aria-label="title + '正文'">
      <div v-if="isSkillCollection" class="skill-list-heading"><span>收集索引</span><span>名称 · 简介 · 使用记录</span></div>
      <div class="frontier-reading-grid" :class="{ 'frontier-document-single': !contents.length }">
        <article class="frontier-reading-card"><FrontierMarkdown :src="src" @toc-generated="contents = $event" @markdown-loaded="markdown = $event" /></article>
        <aside v-if="contents.length" class="frontier-reading-sidebar"><FrontierContents :items="contents" /></aside>
      </div>
      <a v-if="isSkillCollection" class="skill-back-top" href="#frontier-main">返回页首</a>
    </section>
  </FrontierShell>
</template>

<style scoped>
/* A quiet index treatment, isolated to the Skill collection. */
.skill-cover, .skill-document { max-width: 1000px; margin-inline: auto; }
.skill-cover .frontier-breadcrumb { margin-block: 28px 34px; font-size: 11px; }
.skill-cover .frontier-report-heading { align-items: flex-end; padding-bottom: 26px; gap: 28px; }
.skill-cover .frontier-eyebrow { padding-left: 12px; border-left: 3px solid var(--f-rust); letter-spacing: .15em; }
.skill-cover .frontier-report-title h1 { margin-block: 16px 18px; font-size: clamp(38px, 5vw, 62px); letter-spacing: .015em; }
.skill-cover .frontier-report-title > p { margin: 0; font-size: 14px; line-height: 1.8; }
.skill-summary { display: flex; align-items: center; flex-shrink: 0; gap: 14px; padding-left: 24px; border-left: 1px solid var(--f-line); }
.skill-summary > strong { color: var(--f-blue); font: 500 44px/1 var(--f-mono); letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
.skill-summary span { font: 600 12px/1.6 var(--f-font); }
.skill-summary small { display: block; margin-top: 4px; color: var(--f-muted); font: 10px/1.6 var(--f-font); }
.skill-document { margin-top: 12px; }
.skill-list-heading { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; border-top: 2px solid var(--f-ink); color: var(--f-muted); font: 11px/1.5 var(--f-font); letter-spacing: .08em; }
.skill-list-heading > :first-child { color: var(--f-ink); font-weight: 650; }
.skill-document .frontier-document-single { max-width: none; }
.skill-document .frontier-reading-card { padding: 0; border: 0; box-shadow: none; background: transparent; }
.skill-document :deep(.markdown-body.markdown-body--frontier) { max-width: none; }
.skill-document :deep(.markdown-body > ul) { margin: 0; padding: 0; list-style: none; counter-reset: skill-entry; }
.skill-document :deep(.markdown-body > ul > li) {
  position: relative; counter-increment: skill-entry; list-style: none;
  margin: 0; padding: 24px 28px 24px 76px;
  border: 1px solid var(--f-line); border-bottom: 0;
  background: var(--f-surface); color: var(--f-muted);
  font-size: 14px; line-height: 1.95; overflow-wrap: anywhere;
  transition: background-color .18s ease, box-shadow .18s ease;
}
.skill-document :deep(.markdown-body > ul > li:last-child) { border-bottom: 1px solid var(--f-line); }
.skill-document :deep(.markdown-body > ul > li::before) {
  content: counter(skill-entry, decimal-leading-zero); position: absolute; top: 28px; left: 25px;
  color: var(--f-muted); font: 11px/1.6 var(--f-mono); font-variant-numeric: tabular-nums;
}
.skill-document :deep(.markdown-body > ul > li > a:first-child) {
  color: var(--f-blue); font-size: 16px; font-weight: 650;
  text-decoration: underline; text-decoration-color: transparent;
  text-underline-offset: 4px; text-decoration-thickness: 1px;
  transition: color .18s ease, text-decoration-color .18s ease;
}
.skill-document :deep(.markdown-body > ul > li:focus-within) { background: #fffaf0; box-shadow: inset 3px 0 0 var(--f-blue); }
.skill-document :deep(.markdown-body > ul > li > a:first-child:focus-visible) { color: var(--f-rust); text-decoration-color: currentColor; }
.skill-document :deep(.md-badge) { display: inline-block; margin-left: 5px; padding: 1px 7px; border: 1px solid #bdc2a5; color: #4d5737; background: #e8ecdd; font: 10px/1.5 var(--f-font); vertical-align: 1px; }
.skill-back-top { display: block; width: fit-content; margin: 24px 0 0 auto; padding: 10px 2px; border-bottom: 1px solid var(--f-line); color: var(--f-muted); font: 12px/1.5 var(--f-font); text-decoration: none; }
.skill-back-top:hover { color: var(--f-ink); border-color: var(--f-ink); }
@media (hover: hover) and (pointer: fine) {
  .skill-document :deep(.markdown-body > ul > li:hover) { background: #fffaf0; box-shadow: inset 3px 0 0 var(--f-blue); }
  .skill-document :deep(.markdown-body > ul > li > a:first-child:hover) { color: var(--f-rust); text-decoration-color: currentColor; }
}
@media (prefers-reduced-motion: no-preference) {
  .skill-cover .frontier-report-heading { animation: skill-arrive .4s ease-out both; }
  .skill-document :deep(.markdown-body > ul > li:nth-child(-n+5)) { animation: skill-arrive .35s ease-out both; }
  .skill-document :deep(.markdown-body > ul > li:nth-child(2)) { animation-delay: .04s; }
  .skill-document :deep(.markdown-body > ul > li:nth-child(3)) { animation-delay: .08s; }
  .skill-document :deep(.markdown-body > ul > li:nth-child(4)) { animation-delay: .12s; }
  .skill-document :deep(.markdown-body > ul > li:nth-child(5)) { animation-delay: .16s; }
}
@keyframes skill-arrive { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 680px) {
  .skill-cover .frontier-breadcrumb { margin-block: 22px 26px; }
  .skill-cover .frontier-report-heading { gap: 22px; padding-bottom: 14px; align-items: stretch; }
  .skill-summary { padding: 16px 0 0; border-left: 0; border-top: 1px solid var(--f-line); gap: 12px; }
  .skill-summary > strong { font-size: 30px; }
  .skill-summary > div { display: flex; align-items: baseline; flex: 1; justify-content: space-between; gap: 12px; }
  .skill-summary small { margin: 0; }
  .skill-document :deep(.markdown-body > ul > li) { padding: 20px 18px 20px 52px; font-size: 14px; line-height: 1.9; }
  .skill-document :deep(.markdown-body > ul > li::before) { left: 17px; top: 24px; font-size: 10px; }
  .skill-document :deep(.markdown-body > ul > li > a:first-child) { font-size: 15px; }
}
@media (prefers-reduced-motion: reduce) {
  .skill-document :deep(.markdown-body > ul > li), .skill-document :deep(.markdown-body > ul > li > a:first-child) { transition: none; }
}
</style>
