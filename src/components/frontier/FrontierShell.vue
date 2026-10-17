<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({ title: { type: String, default: 'Ysy AI Frontier' } })
const route = useRoute()
const isIntelligence = computed(() => route.path === '/ai-frontier' && Boolean(route.hash) && !['#arena', '#frontier-main'].includes(route.hash))
const isOverview = computed(() => route.path === '/ai-frontier' && !isIntelligence.value)
const isSkills = computed(() => route.path === '/ai-frontier/skills')
const isTrivia = computed(() => route.path === '/ai-frontier/trivia')
const isArena = computed(() => route.path.startsWith('/ai-frontier/arena/'))
let previousDocumentTitle = ''
let mounted = false

watch(() => props.title, (title) => {
  if (mounted) document.title = title
})

onMounted(() => {
  previousDocumentTitle = document.title
  document.title = props.title
  mounted = true
})

onBeforeUnmount(() => {
  mounted = false
  document.title = previousDocumentTitle
})
</script>

<template>
  <div class="frontier-shell" data-theme="light">
    <a class="frontier-skip" href="#frontier-main">跳至主要内容</a>
    <header class="frontier-masthead">
      <div class="frontier-masthead-inner">
        <RouterLink class="frontier-brand" to="/ai-frontier" aria-label="Ysy AI Frontier 首页">
          <span class="frontier-brand-mark" aria-hidden="true">F</span>
          <span class="frontier-brand-wordmark">YSY AI FRONTIER<small>INDEPENDENT OBSERVATION UNIT</small></span>
        </RouterLink>
        <nav class="frontier-navigation" aria-label="AI Frontier 导航">
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isOverview }" :aria-current="isOverview ? 'page' : undefined" to="/ai-frontier">总览</RouterLink>
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isIntelligence }" :aria-current="isIntelligence ? 'location' : undefined" to="/ai-frontier#intelligence">前沿札记</RouterLink>
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isSkills }" :aria-current="isSkills ? 'page' : undefined" to="/ai-frontier/skills">Skill 收集</RouterLink>
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isTrivia }" :aria-current="isTrivia ? 'page' : undefined" to="/ai-frontier/trivia">AI Trivia</RouterLink>
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isArena }" :aria-current="isArena ? 'page' : undefined" to="/ai-frontier/arena/avis3">AVIS3 Arena</RouterLink>
        </nav>
        <div class="frontier-utilities">
          <RouterLink class="frontier-return" to="/">返回主站</RouterLink>

        </div>
      </div>
    </header>

    <main id="frontier-main" class="frontier-main" tabindex="-1"><slot /></main>

    <footer class="frontier-footer">
      <RouterLink class="frontier-footer-brand" to="/ai-frontier">Ysy AI Frontier</RouterLink>
      <span>AI 研究、评测与一线动态</span>
      <RouterLink class="frontier-footer-return" to="/">返回主站</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
.frontier-shell {
  --f-paper: #ece5d6; --f-panel: #e2dac9; --f-surface: #f6f2e8;
  --f-ink: #242520; --f-muted: #626258; --f-line: #aaa798; --f-accent: #d63a2c;
  --f-on-accent: #fff9ed; --f-accent-soft: #eadbcd;
  --f-blue: #4c5a68; --f-olive: #7a7f4e; --f-gold: #d2a85e; --f-rust: #a8432f;
  --f-font: Arial, Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --f-display: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', sans-serif;
  --f-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  --f-gutter: clamp(1rem, 4vw, 3.5rem); --f-scroll-offset: 100px;
  min-height: 100svh; color: var(--f-ink); background: var(--f-paper);
  font: 1rem/1.6 var(--f-font); color-scheme: light; -webkit-font-smoothing: antialiased;
}
.frontier-shell :deep(*) { box-sizing: border-box; }
.frontier-shell :deep(button) { font-family: inherit; }
.frontier-masthead-inner, .frontier-main, .frontier-footer { width: calc(100% - var(--f-gutter) * 2); max-width: 1280px; margin-inline: auto; }
.frontier-masthead { position: sticky; top: 0; z-index: 50; background: var(--f-paper); border-bottom: 1px solid var(--f-ink); }
.frontier-masthead-inner { display: flex; align-items: center; min-height: 82px; gap: 2rem; }
.frontier-brand { display: inline-flex; align-items: center; gap: .75rem; flex: 0 0 auto; color: var(--f-ink); text-decoration: none; }
.frontier-brand:hover { color: var(--f-ink); text-decoration: none; }
.frontier-brand-mark { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border: 2px solid var(--f-ink); font: 900 30px/1 var(--f-display); }
.frontier-brand-wordmark { font: 800 15px/1.35 var(--f-display); letter-spacing: .09em; }
.frontier-brand-wordmark small { display: block; margin-top: 4px; font: 8px/1.4 var(--f-mono); letter-spacing: .12em; }
.frontier-navigation { display: flex; align-items: stretch; gap: 0; margin-left: auto; }
.frontier-nav-link { padding: .7rem 1rem; border: 1px solid transparent; color: var(--f-muted); font: 600 12px/1.5 var(--f-font); text-decoration: none; white-space: nowrap; }
.frontier-nav-link:hover { color: var(--f-ink); text-decoration: none; background: var(--f-panel); }
.frontier-nav-link.is-active { border-color: var(--f-ink); color: var(--f-ink); background: var(--f-surface); box-shadow: inset 0 -3px 0 var(--f-ink); }
.frontier-utilities { display: flex; align-items: center; padding-left: 1.5rem; border-left: 1px solid var(--f-line); }
.frontier-return { color: var(--f-ink); font-size: 11px; text-decoration: none; white-space: nowrap; }
.frontier-return:hover { text-decoration: underline; text-underline-offset: 4px; }
.frontier-main { min-height: 65svh; outline: none; }
.frontier-footer { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem 1.5rem; margin-top: 5rem; padding-block: 1.5rem 2rem; border-top: 2px solid var(--f-ink); color: var(--f-muted); font: 10px/1.7 var(--f-mono); }
.frontier-footer-brand { color: var(--f-ink); font-weight: 700; letter-spacing: .08em; text-decoration: none; text-transform: uppercase; }
.frontier-footer-return { margin-left: auto; color: var(--f-ink); text-decoration: none; }
.frontier-footer a:hover { color: var(--f-ink); text-decoration: underline; }
.frontier-skip { position: fixed; z-index: 10001; top: .65rem; left: 1rem; padding: .7rem 1rem; color: var(--f-on-accent); background: var(--f-accent); font-size: .85rem; text-decoration: none; transform: translateY(calc(-100% - 1rem)); }
.frontier-skip:focus { transform: translateY(0); }
.frontier-shell :deep(:focus-visible) { outline: 2px solid var(--f-accent); outline-offset: 4px; }
.frontier-shell :deep(::selection) { color: var(--f-on-accent); background: var(--f-rust); text-shadow: none; }
@media (max-width: 900px) { .frontier-masthead-inner { gap: 1rem; } .frontier-nav-link { padding-inline: .7rem; } .frontier-utilities { padding-left: 1rem; } }
@media (max-width: 760px) {
  .frontier-shell { --f-scroll-offset: 138px; }
  .frontier-masthead-inner { flex-wrap: wrap; gap: 0 1rem; padding-block: .8rem .65rem; }
  .frontier-brand-wordmark { font-size: 13px; } .frontier-brand-wordmark small { font-size: 7px; }
  .frontier-utilities { margin-left: auto; padding-left: 0; border: 0; }
  .frontier-navigation { order: 3; width: 100%; flex-wrap: wrap; margin-top: .8rem; border-top: 1px solid var(--f-line); padding-top: .5rem; }
  .frontier-nav-link { padding: .4rem .55rem; font-size: 11px; }
  .frontier-footer { gap: .5rem 1rem; }
}
@media (max-width: 440px) { .frontier-return { font-size: 10px; } .frontier-footer > span { width: 100%; order: 3; } }
</style>
