<template>
  <main class="modern-control-page" :class="[`is-${theme}`, `lang-${lang}`]">
    <section class="course-hero" aria-labelledby="course-title">
      <div class="hero-copy">
        <h1 id="course-title">{{ copy.title }}</h1>
        <p class="hero-subtitle">{{ copy.subtitle }}</p>
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
    subtitle: '课堂实践与期末大作业指引：从两级质量弹簧阻尼建模，到三自由度主动隔振系统的解耦、观测、控制与频域评定。',
    tocTitle: '目录',
    languageAction: 'English',
    themeAction: '切换明暗',
  },
  en: {
    title: 'Modern Control Theory and Technology Practice',
    subtitle: 'Course practice and final project guide: from two-stage mass-spring-damper modeling to decoupling, observation, control, and ASD evaluation for a 3-DOF active isolation system.',
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
  --course-bg: #f4efe5;
  --course-paper: rgba(248, 244, 235, 0.9);
  --course-paper-strong: rgba(255, 252, 245, 0.96);
  --course-ink: #17201d;
  --course-muted: rgba(23, 32, 29, 0.68);
  --course-line: rgba(28, 82, 73, 0.18);
  --course-jade: #1f695f;
  --course-jade-soft: rgba(31, 105, 95, 0.11);
  --course-celadon: #dce8de;
  --course-gold: #9b7234;
  --course-red: #9d4b3f;
  --course-shadow: rgba(57, 46, 31, 0.16);
  --course-highlight: rgba(255, 255, 255, 0.72);
  --course-code: #111a17;

  min-height: 100vh;
  color: var(--course-ink);
  background:
    linear-gradient(90deg, rgba(31, 105, 95, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, rgba(31, 105, 95, 0.045) 1px, transparent 1px),
    linear-gradient(135deg, rgba(155, 114, 52, 0.08) 0 1px, transparent 1px 34px),
    var(--course-bg);
  background-size: 52px 52px, 52px 52px, 34px 34px, auto;
  font-family: 'Inter', 'LXGW WenKai', 'Noto Serif SC', system-ui, sans-serif;
}

.modern-control-page.is-dark {
  --course-bg: #111716;
  --course-paper: rgba(20, 30, 28, 0.9);
  --course-paper-strong: rgba(18, 27, 25, 0.96);
  --course-ink: #efe8d7;
  --course-muted: rgba(239, 232, 215, 0.66);
  --course-line: rgba(181, 205, 182, 0.2);
  --course-jade: #91c5b8;
  --course-jade-soft: rgba(143, 199, 180, 0.13);
  --course-celadon: #1c302b;
  --course-gold: #d6ad67;
  --course-red: #d47761;
  --course-shadow: rgba(0, 0, 0, 0.36);
  --course-highlight: rgba(255, 255, 255, 0.05);
  --course-code: #0a0f0d;

  background:
    linear-gradient(90deg, rgba(143, 199, 180, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, rgba(143, 199, 180, 0.045) 1px, transparent 1px),
    linear-gradient(135deg, rgba(216, 173, 99, 0.08) 0 1px, transparent 1px 34px),
    var(--course-bg);
  background-size: 52px 52px, 52px 52px, 34px 34px, auto;
}

.course-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(19rem, 26rem);
  gap: 4rem;
  width: min(100% - 4rem, 1440px);
  min-height: 72vh;
  margin: 0 auto;
  padding: 5rem 0 3.5rem;
  align-items: center;
}

.course-hero::before {
  content: '';
  position: absolute;
  inset: 2rem -1.5rem;
  border: 1px solid var(--course-line);
  border-radius: 8px;
  background:
    linear-gradient(90deg, transparent 0 32%, var(--course-line) 32% calc(32% + 1px), transparent calc(32% + 1px)),
    linear-gradient(180deg, transparent 0 58%, rgba(155, 114, 52, 0.18) 58% calc(58% + 1px), transparent calc(58% + 1px));
  pointer-events: none;
  opacity: 0.68;
}

.hero-copy,
.hero-panel,
.course-layout {
  position: relative;
  z-index: 1;
}

h1 {
  max-width: 14ch;
  margin: 0 0 1.4rem;
  color: var(--course-ink);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 4.9rem;
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: 0;
}

.lang-en h1 {
  max-width: 15ch;
  font-size: 4.2rem;
}

.hero-subtitle {
  max-width: 50rem;
  margin: 0;
  color: var(--course-muted);
  font-size: 1.18rem;
  line-height: 1.95;
}

.control-row button,
.course-toc,
.course-article,
.hero-panel {
  border: 1px solid var(--course-line);
  background: var(--course-paper);
  box-shadow:
    18px 18px 44px var(--course-shadow),
    -12px -12px 28px var(--course-highlight);
  backdrop-filter: blur(18px) saturate(122%);
  -webkit-backdrop-filter: blur(18px) saturate(122%);
}

.hero-panel {
  display: grid;
  gap: 1.1rem;
  align-content: start;
  border-radius: 8px;
  padding: 1rem;
}

.course-logo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--course-line);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.control-row button {
  min-height: 2.75rem;
  border-radius: 999px;
  color: var(--course-ink);
  font: inherit;
  cursor: pointer;
  box-shadow: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.control-row button:hover,
.control-row button:focus-visible {
  border-color: rgba(173, 123, 50, 0.52);
  background: rgba(173, 123, 50, 0.1);
  transform: translateY(-1px);
}

.course-layout {
  display: grid;
  grid-template-columns: minmax(16rem, 18rem) minmax(0, 1fr);
  gap: 1.25rem;
  width: min(100% - 4rem, 1440px);
  margin: 0 auto;
  padding: 0 0 6rem;
}

.course-toc,
.course-article {
  border-radius: 8px;
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
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.course-toc nav {
  display: grid;
  gap: 0.35rem;
}

.course-toc a {
  border-radius: 8px;
  padding: 0.46rem 0.55rem;
  color: var(--course-muted);
  text-decoration: none;
  line-height: 1.35;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.course-toc a:hover,
.course-toc a:focus-visible {
  color: var(--course-ink);
  background: var(--course-jade-soft);
}

.course-toc .toc-level-3 {
  padding-left: 1rem;
  font-size: 0.92rem;
}

.course-article {
  padding: 2.4rem;
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
  --md-accent-2: var(--course-jade);
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
}

.course-article :deep(.markdown-body h2:first-child) {
  margin-top: 0;
  border-top: 0;
}

.course-article :deep(.markdown-body h3) {
  color: var(--course-gold);
}

.course-article :deep(.markdown-body blockquote) {
  border-radius: 8px;
  background:
    linear-gradient(90deg, var(--course-jade-soft), transparent 0.45rem),
    rgba(173, 123, 50, 0.06);
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
  border-radius: 8px;
  padding: 1rem;
  background: rgba(31, 105, 95, 0.07);
  box-shadow: inset 0 1px 0 var(--course-highlight);
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
  border-radius: 999px;
  padding: 0 1rem;
  color: var(--course-ink);
  background: rgba(173, 123, 50, 0.12);
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
  grid-template-columns: minmax(9rem, 0.3fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  background: rgba(166, 75, 60, 0.1);
}

.course-article :deep(.course-deadline strong) {
  color: var(--course-red);
  font-size: 2.4rem;
  line-height: 1;
}

.course-article :deep(.md-figure) {
  border: 1px solid var(--course-line);
  border-radius: 8px;
  padding: 0.7rem;
  background: rgba(255, 255, 255, 0.42);
}

.is-dark .course-article :deep(.md-figure) {
  background: rgba(0, 0, 0, 0.18);
}

.course-article :deep(.md-figure img) {
  border-radius: 8px;
}

@media (max-width: 980px) {
  .course-hero,
  .course-layout {
    grid-template-columns: 1fr;
  }

  .course-hero {
    min-height: auto;
  }

  h1 {
    font-size: 4.7rem;
  }

  .lang-en h1 {
    font-size: 4rem;
  }

  .hero-subtitle {
    font-size: 1.08rem;
  }

  .hero-panel {
    max-width: 28rem;
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
    width: min(100% - 2rem, 1240px);
  }

  h1,
  .lang-en h1 {
    font-size: 3rem;
  }

  .control-row,
  .course-toc nav {
    grid-template-columns: 1fr;
  }

  .course-article {
    padding: 1rem;
  }

  .course-article :deep(.course-deadline strong) {
    font-size: 1.75rem;
  }
}
</style>
