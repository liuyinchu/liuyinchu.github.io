<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({ title: { type: String, default: 'Ysy AI Frontier' } })
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
      <RouterLink class="frontier-brand" to="/ai-frontier" aria-label="Ysy AI Frontier 首页">
        <span class="frontier-brand-mark" aria-hidden="true">F.</span>
        <span>Ysy AI Frontier</span>
      </RouterLink>
      <span class="frontier-masthead-note">AI / RESEARCH / ENGINEERING</span>
      <nav class="frontier-utilities" aria-label="页面工具">
        <RouterLink class="frontier-return" to="/">返回主站 <span aria-hidden="true">↗</span></RouterLink>
        <button
          class="frontier-theme-button"
          type="button"
          :aria-label="themeLabel"
          :aria-pressed="theme === 'dark'"
          @click="toggleTheme"
        >
          <span class="frontier-theme-mark" aria-hidden="true"></span>
          <span>{{ theme === 'light' ? 'DARK MODE' : 'LIGHT MODE' }}</span>
        </button>
      </nav>
    </header>

    <main id="frontier-main" class="frontier-main" tabindex="-1">
      <slot />
    </main>

    <footer class="frontier-footer">
      <RouterLink to="/ai-frontier">YSY AI FRONTIER</RouterLink>
      <span>RESEARCH NOTES &amp; TECHNICAL REPORTS</span>
      <span class="frontier-footer-end">持续观察，持续记录。</span>
    </footer>
  </div>
</template>

<style scoped>
.frontier-shell {
  --f-paper: #f3f0e7;
  --f-ink: #171914;
  --f-muted: #62665e;
  --f-line: #c8cbbf;
  --f-accent: #1745e8;
  --f-panel: #e9e7dd;
  --f-on-accent: #ffffff;
  --f-font: Arial, Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --f-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  --f-display: Impact, 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif;
  min-height: 100svh;
  padding-inline: clamp(1.1rem, 4.5vw, 5rem);
  color: var(--f-ink);
  background: var(--f-paper);
  font-family: var(--f-font);
  font-size: 1rem;
  line-height: 1.5;
  color-scheme: light;
  -webkit-font-smoothing: antialiased;
}

.frontier-shell[data-theme='dark'] {
  --f-paper: #171914;
  --f-ink: #f3f0e7;
  --f-muted: #a8afa2;
  --f-line: #444a40;
  --f-accent: #94aeff;
  --f-panel: #22261f;
  --f-on-accent: #171914;
  color-scheme: dark;
}

.frontier-masthead,
.frontier-main,
.frontier-footer {
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  box-sizing: border-box;
}

.frontier-masthead {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.5rem;
  min-height: 88px;
  padding-block: 1rem;
  border-bottom: 1px solid var(--f-ink);
}

.frontier-brand {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 0.7rem;
  color: var(--f-ink);
  font-size: 1.07rem;
  font-weight: 800;
  letter-spacing: -0.045em;
  text-decoration: none;
  white-space: nowrap;
}

.frontier-brand-mark {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  color: var(--f-on-accent);
  background: var(--f-accent);
  font-size: 1.2rem;
  line-height: 1;
}

.frontier-masthead-note,
.frontier-utilities,
.frontier-footer {
  font-family: var(--f-mono);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.055em;
  line-height: 1.5;
}

.frontier-masthead-note { color: var(--f-muted); }
.frontier-utilities { display: flex; align-items: center; justify-self: end; gap: 1.35rem; }
.frontier-return { color: var(--f-ink); text-decoration: none; white-space: nowrap; }
.frontier-return span { margin-left: 0.25rem; }
.frontier-return:hover { color: var(--f-accent); text-decoration: none; }

.frontier-theme-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.4rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--f-line);
  border-radius: 0;
  color: var(--f-ink);
  background: transparent;
  font: inherit;
  letter-spacing: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease;
}

.frontier-theme-button:hover { border-color: var(--f-accent); color: var(--f-accent); }
.frontier-theme-mark { width: 0.65rem; height: 0.65rem; border: 1px solid currentColor; background: currentColor; }
.frontier-shell[data-theme='dark'] .frontier-theme-mark { background: transparent; }
.frontier-main { min-height: 65svh; outline: none; }

.frontier-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem 2rem;
  margin-top: clamp(4rem, 8vw, 7rem);
  padding-block: 1.2rem 1.5rem;
  border-top: 1px solid var(--f-ink);
  color: var(--f-muted);
}

.frontier-footer a { color: var(--f-ink); text-decoration: none; font-weight: 700; }
.frontier-footer a:hover { color: var(--f-accent); }
.frontier-footer-end { margin-left: auto; }

.frontier-skip {
  position: fixed;
  z-index: 10001;
  top: 0.5rem;
  left: 1rem;
  padding: 0.7rem 1rem;
  color: var(--f-on-accent);
  background: var(--f-accent);
  font-size: 0.85rem;
  text-decoration: none;
  transform: translateY(calc(-100% - 1rem));
}

.frontier-skip:focus { transform: translateY(0); }
.frontier-shell :deep(:focus-visible) { outline: 2px solid var(--f-accent); outline-offset: 4px; }
.frontier-shell :deep(::selection) { color: var(--f-on-accent); background: var(--f-accent); text-shadow: none; }

@media (max-width: 1050px) {
  .frontier-masthead { grid-template-columns: 1fr auto; }
  .frontier-masthead-note { display: none; }
}

@media (max-width: 560px) {
  .frontier-masthead { gap: 0.6rem; min-height: 76px; }
  .frontier-brand { font-size: 0.9rem; gap: 0.4rem; }
  .frontier-brand-mark { width: 1.65rem; height: 1.65rem; }
  .frontier-utilities { gap: 0.65rem; font-size: 0.58rem; }
  .frontier-return span { display: none; }
  .frontier-theme-button { padding-inline: 0.4rem; }
  .frontier-theme-mark { display: none; }
  .frontier-footer-end { width: 100%; margin-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .frontier-theme-button { transition: none; }
}
</style>

<style>
html[data-frontier-theme='light'] {
  color-scheme: light;
  background: #f3f0e7;
  scrollbar-color: #62665e #f3f0e7;
}

html[data-frontier-theme='dark'] {
  color-scheme: dark;
  background: #171914;
  scrollbar-color: #a8afa2 #171914;
}

html[data-frontier-theme] { scroll-padding-top: 1.5rem; }
html[data-frontier-theme] body { background: inherit; }
html[data-frontier-theme='light']::-webkit-scrollbar-track { background: #f3f0e7; }
html[data-frontier-theme='light']::-webkit-scrollbar-thumb { background: #62665e; border-color: #f3f0e7; }
html[data-frontier-theme='dark']::-webkit-scrollbar-track { background: #171914; }
html[data-frontier-theme='dark']::-webkit-scrollbar-thumb { background: #a8afa2; border-color: #171914; }
</style>
