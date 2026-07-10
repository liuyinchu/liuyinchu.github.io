<template>
  <main class="modern-control-page" :class="[`is-${theme}`, `lang-${lang}`]">
    <section class="course-hero" aria-labelledby="course-title">
      <div class="hero-copy">
        <h1 id="course-title">{{ copy.title }}</h1>
      </div>

      <aside class="hero-panel" aria-label="Course identity and controls">
        <img
          src="/modern-control-course/course-logo.png"
          alt="Modern Control Theory and Technology course emblem"
          class="course-logo"
        />
        <div class="control-row" aria-label="Page switches">
          <button type="button" @click="toggleLang">{{ copy.languageAction }}</button>
          <button type="button" @click="toggleTheme">{{ copy.themeAction }}</button>
        </div>
      </aside>
    </section>

    <section class="course-layout" aria-label="Course content">
      <aside class="course-toc" aria-label="Table of contents">
        <p>{{ copy.tocTitle }}</p>
        <nav>
          <a
            v-for="item in visibleToc"
            :key="item.id"
            :href="`#${item.id}`"
            :class="`toc-level-${item.level}`"
          >
            {{ item.text }}
          </a>
        </nav>
      </aside>

      <article class="course-article">
        <MarkdownViewer
          :content="selectedMarkdown"
          variant="embed"
          use-c-j-k
          @toc-generated="tocItems = $event"
        />
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'

const copyDeck = {
  zh: {
    title: '现代控制理论与技术课程实践',
    tocTitle: '目录',
    languageAction: 'English',
    themeAction: '切换明暗',
  },
  en: {
    title: 'Modern Control Theory and Technology Practice',
    tocTitle: 'Contents',
    languageAction: '中文',
    themeAction: 'Theme',
  },
}

const lang = ref(localStorage.getItem('modern-control-lang') || 'zh')
const theme = ref(localStorage.getItem('modern-control-theme') || 'light')
const rawMarkdown = ref('')
const tocItems = ref([])
let previousTitle = ''

const copy = computed(() => copyDeck[lang.value] || copyDeck.zh)

const selectedMarkdown = computed(() => extractLanguageBlock(rawMarkdown.value, lang.value))

const visibleToc = computed(() => tocItems.value.filter((item) => item.level > 1 && item.level <= 3))

function extractLanguageBlock(text, language) {
  if (!text) return ''
  const pattern = new RegExp(`<!--\\s*modern-control:${language}\\s*-->([\\s\\S]*?)(?=<!--\\s*modern-control:|$)`, 'i')
  const match = text.match(pattern)
  return (match?.[1] || text).trim()
}

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

watch(lang, (value) => {
  localStorage.setItem('modern-control-lang', value)
  document.title = value === 'zh'
    ? '现代控制理论与技术课程站'
    : 'Modern Control Theory Course Site'
})

watch(theme, (value) => {
  localStorage.setItem('modern-control-theme', value)
})

onMounted(async () => {
  previousTitle = document.title
  document.body.classList.add('modern-control-course-route')
  document.title = lang.value === 'zh'
    ? '现代控制理论与技术课程站'
    : 'Modern Control Theory Course Site'

  try {
    const response = await fetch('/markdown/pages/modern-control-course.md', { cache: 'no-cache' })
    if (!response.ok) throw new Error(`Markdown load failed: ${response.status}`)
    rawMarkdown.value = await response.text()
  } catch (error) {
    rawMarkdown.value = `## Content unavailable\n\n${error.message}`
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('modern-control-course-route')
  document.title = previousTitle
})
</script>

<style scoped>
:global(body.modern-control-course-route .site-header),
:global(body.modern-control-course-route .site-footer),
:global(body.modern-control-course-route footer) {
  display: none !important;
}

.modern-control-page {
  --course-bg: #e9efeb;
  --course-paper: rgba(243, 247, 243, 0.88);
  --course-paper-strong: rgba(250, 252, 249, 0.96);
  --course-ink: #16231f;
  --course-muted: rgba(22, 35, 31, 0.66);
  --course-line: rgba(27, 82, 72, 0.2);
  --course-line-strong: rgba(27, 82, 72, 0.34);
  --course-jade: #17695f;
  --course-jade-soft: rgba(23, 105, 95, 0.09);
  --course-celadon: #dce9e1;
  --course-blue: #386f91;
  --course-gold: #92713b;
  --course-red: #a44c3f;
  --course-shadow: rgba(45, 61, 54, 0.17);
  --course-shadow-soft: rgba(45, 61, 54, 0.09);
  --course-highlight: rgba(255, 255, 255, 0.82);
  --course-code: #10201d;

  min-height: 100vh;
  color: var(--course-ink);
  background: var(--course-bg);
  font-family: 'Inter', 'LXGW WenKai', 'Noto Serif SC', system-ui, sans-serif;
}

.modern-control-page.is-dark {
  --course-bg: #101816;
  --course-paper: rgba(24, 35, 32, 0.9);
  --course-paper-strong: rgba(19, 29, 26, 0.97);
  --course-ink: #eef3eb;
  --course-muted: rgba(238, 243, 235, 0.67);
  --course-line: rgba(157, 199, 183, 0.2);
  --course-line-strong: rgba(157, 199, 183, 0.34);
  --course-jade: #8dc8b7;
  --course-jade-soft: rgba(141, 200, 183, 0.11);
  --course-celadon: #1b302a;
  --course-blue: #8fb7d0;
  --course-gold: #d1ad69;
  --course-red: #d87966;
  --course-shadow: rgba(0, 0, 0, 0.36);
  --course-shadow-soft: rgba(0, 0, 0, 0.2);
  --course-highlight: rgba(255, 255, 255, 0.06);
  --course-code: #0a0f0d;
}

.course-hero {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 3rem;
  width: min(100% - 4rem, 1280px);
  margin: 1.5rem auto 2.25rem;
  padding: 2.75rem 3.5rem;
  align-items: center;
  border: 1px solid var(--course-line-strong);
  border-top: 3px solid var(--course-jade);
  border-radius: 6px;
  background: var(--course-paper);
  box-shadow:
    20px 20px 48px var(--course-shadow),
    -14px -14px 32px var(--course-highlight),
    inset 0 0 0 1px var(--course-highlight);
}

.hero-copy,
.hero-panel,
.course-layout {
  position: relative;
  z-index: 1;
}

h1 {
  max-width: 9em;
  margin: 0;
  color: var(--course-ink);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 3.75rem;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: 0;
}

.lang-en h1 {
  max-width: 17ch;
  font-size: 3.35rem;
  line-height: 1.08;
}

.control-row button,
.course-toc,
.course-article,
.hero-panel {
  border: 1px solid var(--course-line);
  background: var(--course-paper);
  box-shadow:
    12px 12px 28px var(--course-shadow-soft),
    -8px -8px 20px var(--course-highlight);
  backdrop-filter: blur(16px) saturate(112%);
  -webkit-backdrop-filter: blur(16px) saturate(112%);
}

.hero-panel {
  display: grid;
  width: 100%;
  max-width: 20rem;
  gap: 0.75rem;
  align-content: start;
  justify-self: end;
  border-radius: 6px;
  padding: 0.8rem;
  box-shadow:
    14px 14px 32px var(--course-shadow),
    -10px -10px 24px var(--course-highlight),
    inset 0 0 0 1px var(--course-highlight);
}

.course-logo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--course-line-strong);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.control-row button {
  min-height: 2.75rem;
  border-radius: 4px;
  color: var(--course-ink);
  font: inherit;
  cursor: pointer;
  box-shadow:
    inset 2px 2px 5px var(--course-shadow-soft),
    inset -2px -2px 5px var(--course-highlight);
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.control-row button:hover,
.control-row button:focus-visible {
  border-color: rgba(173, 123, 50, 0.52);
  color: var(--course-jade);
  transform: translateY(-1px);
}

.course-layout {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: minmax(16rem, 18rem) minmax(0, 1fr);
  gap: 1.25rem;
  width: min(100% - 4rem, 1280px);
  margin: 0 auto;
  padding: 0 0 6rem;
}

.course-toc,
.course-article {
  border-radius: 6px;
}

.course-toc {
  position: sticky;
  top: 1rem;
  align-self: start;
  padding: 1.1rem;
}

.course-toc p {
  margin: 0 0 0.85rem;
  color: var(--course-jade);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
}

.course-toc nav {
  display: grid;
  gap: 0.35rem;
}

.course-toc a {
  border-left: 2px solid transparent;
  border-radius: 3px;
  padding: 0.46rem 0.55rem;
  color: var(--course-muted);
  text-decoration: none;
  line-height: 1.35;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.course-toc a:hover,
.course-toc a:focus-visible {
  color: var(--course-ink);
  border-left-color: var(--course-red);
  background: var(--course-jade-soft);
}

.course-toc .toc-level-3 {
  padding-left: 1rem;
  font-size: 0.92rem;
}

.course-article {
  padding: 2.6rem 3rem;
  background: var(--course-paper-strong);
}

.course-article :deep(.markdown-body) {
  --md-text: var(--course-ink);
  --md-muted: var(--course-muted);
  --md-soft: var(--course-muted);
  --md-heading: var(--course-jade);
  --md-link: var(--course-jade);
  --md-link-strong: var(--course-gold);
  --md-accent: var(--course-gold);
  --md-accent-2: var(--course-blue);
  --md-accent-3: var(--course-red);
  --md-panel: var(--course-celadon);
  --md-panel-strong: var(--course-paper);
  --md-border: var(--course-line);

  max-width: none;
  margin: 0;
  padding: 0;
  color: var(--course-ink);
  font-family: 'LXGW WenKai', 'Noto Serif SC', 'Inter', serif;
  font-size: 1.08rem;
  line-height: 1.88;
}

.course-article :deep(.markdown-body h2) {
  margin-top: 3.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--course-line);
  color: var(--course-jade);
  text-decoration-color: var(--course-red);
}

.course-article :deep(.markdown-body h2:first-child) {
  margin-top: 0;
  border-top: 0;
}

.course-article :deep(.markdown-body h3) {
  color: var(--course-gold);
}

.course-article :deep(.markdown-body blockquote) {
  border-radius: 4px;
  background: var(--course-jade-soft);
  box-shadow: inset 0 0 0 1px var(--course-line);
}

.course-article :deep(.markdown-body pre.code-block) {
  background: var(--course-code);
}

.course-article :deep(.markdown-body .code-header) {
  background: rgba(255, 255, 255, 0.08);
}

.course-article :deep(.course-stage-grid),
.course-article :deep(.course-method-grid),
.course-article :deep(.course-requirement-grid) {
  display: grid;
  gap: 0.8rem;
  margin: 1.4rem 0 1.8rem;
}

.course-article :deep(.course-stage-grid) {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.course-article :deep(.course-method-grid) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.course-article :deep(.course-requirement-grid) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.course-article :deep(.course-stage-grid > div),
.course-article :deep(.course-method-grid > div),
.course-article :deep(.course-requirement-grid > div),
.course-article :deep(.course-deadline),
.course-article :deep(.course-callout) {
  border: 1px solid var(--course-line);
  border-radius: 5px;
  padding: 1rem;
  background: var(--course-jade-soft);
  box-shadow:
    6px 6px 14px var(--course-shadow-soft),
    -4px -4px 10px var(--course-highlight),
    inset 0 1px 0 var(--course-highlight);
}

.course-article :deep(.course-stage-grid strong),
.course-article :deep(.course-method-grid strong),
.course-article :deep(.course-requirement-grid strong) {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--course-jade);
}

.course-article :deep(.course-stage-grid p),
.course-article :deep(.course-method-grid p),
.course-article :deep(.course-requirement-grid p),
.course-article :deep(.course-callout p),
.course-article :deep(.course-deadline p) {
  margin: 0;
}

.course-article :deep(.course-button-row) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin: 1rem 0 1.8rem;
}

.course-article :deep(.course-download) {
  display: inline-flex;
  align-items: center;
  min-height: 2.85rem;
  border: 1px solid rgba(173, 123, 50, 0.36);
  border-radius: 4px;
  padding: 0 1rem;
  color: var(--course-ink);
  background: rgba(146, 113, 59, 0.1);
  font-weight: 760;
  text-decoration: none;
  box-shadow:
    10px 10px 24px rgba(57, 46, 31, 0.12),
    -8px -8px 18px var(--course-highlight);
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.course-article :deep(.course-download:hover),
.course-article :deep(.course-download:focus-visible) {
  border-color: rgba(31, 105, 95, 0.42);
  background: rgba(31, 105, 95, 0.1);
  transform: translateY(-1px);
}

.course-article :deep(.course-deadline) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  align-items: start;
  background: rgba(164, 76, 63, 0.08);
  border-left: 3px solid var(--course-red);
}

.course-article :deep(.course-deadline strong) {
  display: block;
  color: var(--course-red);
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 2.15rem;
  line-height: 1;
  white-space: nowrap;
}

.course-article :deep(.md-figure) {
  border: 1px solid var(--course-line);
  border-radius: 5px;
  padding: 0.7rem;
  background: rgba(255, 255, 255, 0.42);
}

.is-dark .course-article :deep(.md-figure) {
  background: rgba(0, 0, 0, 0.18);
}

.course-article :deep(.md-figure img) {
  border-radius: 4px;
}

@media (max-width: 1100px) {
  .course-hero {
    grid-template-columns: minmax(0, 1fr) 18rem;
    gap: 2.5rem;
    padding: 2.25rem 2.5rem;
  }

  h1 {
    font-size: 3.15rem;
  }

  .lang-en h1 {
    font-size: 2.75rem;
  }

  .hero-panel {
    max-width: 18rem;
  }

  .course-layout {
    grid-template-columns: 15rem minmax(0, 1fr);
  }
}

@media (max-width: 820px) {
  .course-hero,
  .course-layout {
    grid-template-columns: 1fr;
  }

  .course-hero {
    min-height: auto;
    padding: 2.5rem;
  }

  h1 {
    max-width: 10em;
    font-size: 3rem;
  }

  .lang-en h1 {
    max-width: 19em;
    font-size: 2.7rem;
  }

  .hero-panel {
    max-width: 20rem;
    justify-self: start;
  }

  .course-toc {
    position: static;
  }

  .course-toc nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .course-article :deep(.course-stage-grid),
  .course-article :deep(.course-method-grid),
  .course-article :deep(.course-requirement-grid),
  .course-article :deep(.course-deadline) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .course-hero,
  .course-layout {
    width: min(100% - 1.5rem, 1280px);
  }

  .course-hero {
    margin-top: 0.75rem;
    padding: 2rem 1.25rem;
  }

  h1,
  .lang-en h1 {
    font-size: 2.35rem;
  }

  .control-row,
  .course-toc nav {
    grid-template-columns: 1fr;
  }

  .course-article {
    padding: 1.25rem;
  }

  .course-article :deep(.course-deadline strong) {
    font-size: 1.75rem;
  }
}
</style>
