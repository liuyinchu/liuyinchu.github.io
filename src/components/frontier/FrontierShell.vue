<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({ title: { type: String, default: 'Ysy AI Frontier' } })
const route = useRoute()
const isIntelligence = computed(() => route.path === '/ai-frontier' && Boolean(route.hash) && !['#benchmarks', '#frontier-main'].includes(route.hash))
const isOverview = computed(() => route.path === '/ai-frontier' && !isIntelligence.value)
const STORAGE_KEY = 'ysy-ai-frontier-theme'
function readTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const theme = ref(readTheme())
const themeLabel = computed(() => theme.value === 'light' ? '切换到暗色模式' : '切换到浅色模式')
let previousDocumentTheme = null
let previousDocumentTitle = ''
let mounted = false

function applyDocumentTheme() {
  document.documentElement.setAttribute('data-frontier-theme', theme.value)
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  try {
    window.localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {
    // The current page can still switch when browser storage is unavailable.
  }
}

watch(theme, () => {
  if (mounted) applyDocumentTheme()
})

watch(() => props.title, (title) => {
  if (mounted) document.title = title
})

onMounted(() => {
  previousDocumentTitle = document.title
  document.title = props.title
  previousDocumentTheme = document.documentElement.getAttribute('data-frontier-theme')
  mounted = true
  applyDocumentTheme()
})

onBeforeUnmount(() => {
  mounted = false
  document.title = previousDocumentTitle
  if (previousDocumentTheme === null) {
    document.documentElement.removeAttribute('data-frontier-theme')
  } else {
    document.documentElement.setAttribute('data-frontier-theme', previousDocumentTheme)
  }
})
</script>

<template>
  <div class="frontier-shell" :data-theme="theme">
    <a class="frontier-skip" href="#frontier-main">跳至主要内容</a>
    <header class="frontier-masthead">
      <div class="frontier-masthead-inner">
        <RouterLink class="frontier-brand" to="/ai-frontier" aria-label="Ysy AI Frontier 首页">
          <span class="frontier-brand-mark" aria-hidden="true">AI</span>
          <span>Ysy AI Frontier</span>
        </RouterLink>
        <nav class="frontier-navigation" aria-label="AI Frontier 导航">
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isOverview }" :aria-current="isOverview ? 'page' : undefined" to="/ai-frontier">总览</RouterLink>
          <RouterLink class="frontier-nav-link" :class="{ 'is-active': isIntelligence }" :aria-current="isIntelligence ? 'location' : undefined" to="/ai-frontier#intelligence">信息简报</RouterLink>
        </nav>
        <div class="frontier-utilities">
          <RouterLink class="frontier-return" to="/">返回主站 <span aria-hidden="true">↗</span></RouterLink>
          <button class="frontier-theme-button" type="button" :aria-label="themeLabel" :title="themeLabel" @click="toggleTheme">
            <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.4 13A8.5 8.5 0 0 1 11 3.6 8.5 8.5 0 1 0 20.4 13Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3.8" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main id="frontier-main" class="frontier-main" tabindex="-1"><slot /></main>

    <footer class="frontier-footer">
      <RouterLink class="frontier-footer-brand" to="/ai-frontier">Ysy AI Frontier</RouterLink>
      <span>AI 研究、评测与一线动态</span>
      <RouterLink class="frontier-footer-return" to="/">返回主站 <span aria-hidden="true">↗</span></RouterLink>
    </footer>
  </div>
</template>

<style scoped>
.frontier-shell {
  --f-paper: #f5f7fb;
  --f-panel: #f0f3fa;
  --f-surface: #ffffff;
  --f-ink: #182237;
  --f-muted: #626f86;
  --f-line: #e5eaf3;
  --f-accent: #5261dc;
  --f-on-accent: #ffffff;
  --f-accent-soft: #edf0ff;
  --f-font: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --f-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  --f-display: var(--f-font);
  --f-gutter: clamp(1.25rem, 4vw, 3rem);
  min-height: 100svh;
  color: var(--f-ink);
  background: var(--f-paper);
  font-family: var(--f-font);
  font-size: 1rem;
  line-height: 1.6;
  color-scheme: light;
  -webkit-font-smoothing: antialiased;
}

.frontier-shell[data-theme='dark'] {
  --f-paper: #10141e;
  --f-panel: #1b2231;
  --f-surface: #171e2c;
  --f-ink: #eef2fa;
  --f-muted: #a0acc0;
  --f-line: #2b3549;
  --f-accent: #9aabff;
  --f-on-accent: #131a35;
  --f-accent-soft: #242e4d;
  color-scheme: dark;
}

.frontier-masthead-inner,
.frontier-main,
.frontier-footer {
  width: calc(100% - var(--f-gutter) * 2);
  max-width: 1240px;
  margin-inline: auto;
  box-sizing: border-box;
}

.frontier-masthead {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--f-line);
  background: color-mix(in srgb, var(--f-surface) 92%, transparent);
  box-shadow: 0 2px 16px rgba(24, 34, 55, 0.025);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.frontier-masthead-inner { display: flex; align-items: center; min-height: 72px; gap: 2.5rem; }
.frontier-brand { display: inline-flex; align-items: center; gap: 0.7rem; flex: 0 0 auto; color: var(--f-ink); font-size: 1.08rem; font-weight: 750; letter-spacing: -0.035em; text-decoration: none; white-space: nowrap; }
.frontier-brand:hover { color: var(--f-ink); text-decoration: none; }
.frontier-brand-mark { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; color: var(--f-accent); background: var(--f-accent-soft); font-size: 0.9rem; font-weight: 800; letter-spacing: -0.045em; line-height: 1; }
.frontier-navigation { display: flex; align-items: center; gap: 0.3rem; }
.frontier-nav-link { padding: 0.5rem 0.85rem; border-radius: 9px; color: var(--f-muted); font-size: 0.875rem; font-weight: 550; text-decoration: none; white-space: nowrap; transition: color 160ms ease, background-color 160ms ease; }
.frontier-nav-link:hover { color: var(--f-ink); background: var(--f-panel); text-decoration: none; }
.frontier-nav-link.is-active { color: var(--f-accent); background: var(--f-accent-soft); font-weight: 650; }
.frontier-utilities { display: flex; align-items: center; gap: 1.3rem; margin-left: auto; }
.frontier-return { color: var(--f-muted); font-size: 0.83rem; font-weight: 500; text-decoration: none; white-space: nowrap; }
.frontier-return span { margin-left: 0.15rem; }
.frontier-return:hover { color: var(--f-accent); text-decoration: none; }

.frontier-theme-button {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 1px solid var(--f-line);
  border-radius: 10px;
  color: var(--f-muted);
  background: var(--f-surface);
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}
.frontier-theme-button svg { width: 18px; height: 18px; }
.frontier-theme-button:hover { color: var(--f-accent); border-color: color-mix(in srgb, var(--f-accent) 30%, var(--f-line)); background: var(--f-accent-soft); }
.frontier-main { min-height: 65svh; outline: none; }

.frontier-footer { display: flex; align-items: center; flex-wrap: wrap; gap: 0.6rem 1.5rem; margin-top: 3.5rem; padding-block: 1.5rem 2rem; border-top: 1px solid var(--f-line); color: var(--f-muted); font-size: 0.8rem; }
.frontier-footer-brand { color: var(--f-ink); font-weight: 650; text-decoration: none; }
.frontier-footer-return { margin-left: auto; color: var(--f-muted); text-decoration: none; }
.frontier-footer-brand:hover,
.frontier-footer-return:hover { color: var(--f-accent); text-decoration: none; }
.frontier-skip { position: fixed; z-index: 10001; top: 0.65rem; left: 1rem; padding: 0.7rem 1rem; border-radius: 10px; color: var(--f-on-accent); background: var(--f-accent); font-size: 0.85rem; text-decoration: none; transform: translateY(calc(-100% - 1rem)); }
.frontier-skip:focus { transform: translateY(0); }
.frontier-shell :deep(:focus-visible) { outline: 2px solid var(--f-accent); outline-offset: 4px; }
.frontier-shell :deep(::selection) { color: var(--f-on-accent); background: var(--f-accent); text-shadow: none; }

@media (max-width: 760px) {
  .frontier-masthead-inner { flex-wrap: wrap; gap: 0 1rem; padding-block: 0.8rem 0.55rem; }
  .frontier-brand { font-size: 1rem; }
  .frontier-utilities { gap: 0.8rem; }
  .frontier-navigation { order: 3; width: 100%; margin-top: 0.6rem; }
  .frontier-nav-link { padding-block: 0.35rem; }
  .frontier-footer { gap: 0.5rem 1rem; }
}

@media (max-width: 440px) {
  .frontier-return { font-size: 0.75rem; }
  .frontier-return span { display: none; }
  .frontier-footer > span { width: 100%; order: 3; }
}

@media (prefers-reduced-motion: reduce) {
  .frontier-theme-button,
  .frontier-nav-link { transition: none; }
}
</style>

<style>
html[data-frontier-theme='light'] { color-scheme: light; background: #f5f7fb; scrollbar-color: #a7b1c3 #f5f7fb; }
html[data-frontier-theme='dark'] { color-scheme: dark; background: #10141e; scrollbar-color: #65718a #10141e; }
html[data-frontier-theme] { scroll-padding-top: 88px; }
html[data-frontier-theme] body { background: inherit; }
html[data-frontier-theme='light']::-webkit-scrollbar-track { background: #f5f7fb; }
html[data-frontier-theme='light']::-webkit-scrollbar-thumb { background: #a7b1c3; border-color: #f5f7fb; }
html[data-frontier-theme='dark']::-webkit-scrollbar-track { background: #10141e; }
html[data-frontier-theme='dark']::-webkit-scrollbar-thumb { background: #65718a; border-color: #10141e; }
@media (max-width: 760px) { html[data-frontier-theme] { scroll-padding-top: 120px; } }
</style>
