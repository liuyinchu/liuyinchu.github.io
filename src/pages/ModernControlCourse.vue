<template>
  <main class="modern-control-page" :class="[`is-${theme}`, `lang-${lang}`]">
    <section class="course-hero" aria-labelledby="course-title">
      <div class="hero-orbit" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="hero-copy">
        <p class="hero-eyebrow">{{ copy.eyebrow }}</p>
        <h1 id="course-title">{{ copy.title }}</h1>
        <p class="hero-subtitle">{{ copy.subtitle }}</p>
        <div class="hero-tags" aria-label="Course focus">
          <span v-for="tag in copy.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <aside class="hero-panel" aria-label="Course identity and controls">
        <img
          src="/modern-control-course/course-logo.png"
          alt="Modern Control Theory and Technology course emblem"
          class="course-logo"
        />
        <div class="course-mark">
          <span>{{ copy.term }}</span>
          <strong>{{ copy.shortName }}</strong>
        </div>
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
    eyebrow: '现代控制理论与技术 · 课程实践站',
    title: '主动隔振与 MIMO 控制实践',
    subtitle: '面向课堂实践、期末大作业、报告与答辩的半官方指引页面。这里聚焦建模、解耦、状态估计、鲁棒控制与统一频域评定。',
    shortName: 'Modern Control Studio',
    term: 'Course Site / Draft 0.1',
    tags: ['两级质量-弹簧-阻尼', '3-DOF 主动隔振', 'KF / LQG / H∞', 'ASD 统一评定'],
    tocTitle: '目录',
    languageAction: 'English',
    themeAction: '切换明暗',
  },
  en: {
    eyebrow: 'Modern Control Theory and Technology · Studio',
    title: 'Active Isolation and MIMO Control Practice',
    subtitle: 'A semi-official course page for classroom practice, the final project, report submission, and defense preparation.',
    shortName: 'Modern Control Studio',
    term: 'Course Site / Draft 0.1',
    tags: ['Two-stage model', '3-DOF active isolation', 'KF / LQG / H∞', 'Unified ASD evaluation'],
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
  --course-bg: #f7f2e7;
  --course-paper: rgba(255, 252, 244, 0.88);
  --course-paper-strong: rgba(255, 253, 247, 0.96);
  --course-ink: #20231f;
  --course-muted: rgba(32, 35, 31, 0.66);
  --course-line: rgba(35, 50, 40, 0.16);
  --course-jade: #2f7367;
  --course-jade-soft: rgba(47, 115, 103, 0.12);
  --course-celadon: #dbe8da;
  --course-gold: #ad7b32;
  --course-red: #a64b3c;
  --course-shadow: rgba(32, 26, 18, 0.14);
  --course-code: #17201d;

  min-height: 100vh;
  color: var(--course-ink);
  background:
    linear-gradient(135deg, rgba(173, 123, 50, 0.08) 0 1px, transparent 1px 30px),
    linear-gradient(90deg, rgba(47, 115, 103, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgba(47, 115, 103, 0.05) 1px, transparent 1px),
    var(--course-bg);
  background-size: 30px 30px, 48px 48px, 48px 48px, auto;
  font-family: 'Inter', 'LXGW WenKai', 'Noto Serif SC', system-ui, sans-serif;
}

.modern-control-page.is-dark {
  --course-bg: #101412;
  --course-paper: rgba(21, 30, 27, 0.82);
  --course-paper-strong: rgba(24, 34, 31, 0.94);
  --course-ink: #eee7d8;
  --course-muted: rgba(238, 231, 216, 0.68);
  --course-line: rgba(220, 211, 184, 0.18);
  --course-jade: #8fc7b4;
  --course-jade-soft: rgba(143, 199, 180, 0.13);
  --course-celadon: #1f332e;
  --course-gold: #d8ad63;
  --course-red: #d47761;
  --course-shadow: rgba(0, 0, 0, 0.34);
  --course-code: #0a0f0d;

  background:
    linear-gradient(135deg, rgba(216, 173, 99, 0.08) 0 1px, transparent 1px 30px),
    linear-gradient(90deg, rgba(143, 199, 180, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(143, 199, 180, 0.04) 1px, transparent 1px),
    var(--course-bg);
  background-size: 30px 30px, 48px 48px, 48px 48px, auto;
}

.course-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.38fr);
  gap: clamp(2rem, 5vw, 5rem);
  width: min(100% - 3rem, 1240px);
  min-height: 92vh;
  margin: 0 auto;
  padding: clamp(4rem, 8vw, 7rem) 0 clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.hero-orbit {
  position: absolute;
  inset: 7rem -4vw 2rem;
  pointer-events: none;
}

.hero-orbit span {
  position: absolute;
  border: 1px solid var(--course-line);
  border-radius: 999px;
  transform: rotate(-12deg);
}

.hero-orbit span:nth-child(1) {
  width: min(54vw, 42rem);
  aspect-ratio: 1.45;
  right: 5%;
  top: 6%;
}

.hero-orbit span:nth-child(2) {
  width: min(38vw, 30rem);
  aspect-ratio: 1.2;
  left: 2%;
  bottom: 4%;
  transform: rotate(16deg);
}

.hero-orbit span:nth-child(3) {
  width: min(24vw, 18rem);
  aspect-ratio: 1;
  right: 20%;
  bottom: 12%;
  border-color: rgba(173, 123, 50, 0.28);
}

.hero-copy,
.hero-panel,
.course-layout {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  margin: 0 0 1rem;
  color: var(--course-jade);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  max-width: 11ch;
  margin: 0 0 1.3rem;
  color: var(--course-ink);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 6.8rem;
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: 0;
}

.lang-en h1 {
  max-width: 12ch;
  font-size: 5.8rem;
}

.hero-subtitle {
  max-width: 45rem;
  margin: 0;
  color: var(--course-muted);
  font-size: 1.2rem;
  line-height: 1.9;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.6rem;
}

.hero-tags span,
.control-row button,
.course-toc,
.course-article,
.hero-panel {
  border: 1px solid var(--course-line);
  background: var(--course-paper);
  box-shadow: 0 24px 70px var(--course-shadow);
  backdrop-filter: blur(18px) saturate(122%);
  -webkit-backdrop-filter: blur(18px) saturate(122%);
}

.hero-tags span {
  border-radius: 999px;
  padding: 0.52rem 0.74rem;
  color: var(--course-ink);
  font-size: 0.9rem;
  box-shadow: none;
}

.hero-panel {
  display: grid;
  gap: 1rem;
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

.course-mark {
  display: grid;
  gap: 0.3rem;
}

.course-mark span {
  color: var(--course-muted);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.course-mark strong {
  color: var(--course-ink);
  font-size: 1.08rem;
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
  grid-template-columns: minmax(14rem, 0.24fr) minmax(0, 1fr);
  gap: 1rem;
  width: min(100% - 3rem, 1240px);
  margin: 0 auto;
  padding: 0 0 clamp(4rem, 7vw, 6rem);
}

.course-toc,
.course-article {
  border-radius: 8px;
}

.course-toc {
  position: sticky;
  top: 1rem;
  align-self: start;
  padding: 1rem;
  box-shadow: 0 18px 50px var(--course-shadow);
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
  padding: 2rem;
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
}

.course-article :deep(.markdown-body h2) {
  margin-top: 3.4rem;
  padding-top: 0.35rem;
  border-top: 1px solid var(--course-line);
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
.course-article :deep(.course-figure-grid) {
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

.course-article :deep(.course-figure-grid) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.course-article :deep(.course-stage-grid > div),
.course-article :deep(.course-method-grid > div),
.course-article :deep(.course-deadline),
.course-article :deep(.course-callout) {
  border: 1px solid var(--course-line);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(47, 115, 103, 0.07);
}

.course-article :deep(.course-stage-grid strong),
.course-article :deep(.course-method-grid strong) {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--course-jade);
}

.course-article :deep(.course-stage-grid p),
.course-article :deep(.course-method-grid p),
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
}

.course-article :deep(.course-download.is-disabled) {
  cursor: not-allowed;
  opacity: 0.68;
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
  .course-article :deep(.course-figure-grid),
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
