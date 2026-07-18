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
      <aside ref="tocRef" class="course-toc" aria-label="Table of contents">
        <p>{{ copy.tocTitle }}</p>
        <nav>
          <a
            v-for="item in visibleToc"
            :key="item.id"
            :href="`#${item.id}`"
            :class="[`toc-level-${item.level}`, { 'is-active': activeTocId === item.id }]"
            :aria-current="activeTocId === item.id ? 'location' : undefined"
            @click="handleTocClick($event, item.id)"
          >
            {{ item.text }}
          </a>
        </nav>
      </aside>

      <article ref="articleRef" class="course-article">
        <MarkdownViewer
          :content="selectedMarkdown"
          variant="embed"
          use-c-j-k
          @toc-generated="handleTocGenerated"
        />
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const activeTocId = ref('')
const tocRef = ref(null)
const articleRef = ref(null)
let previousTitle = ''
let headingElements = []
let scrollFrame = 0

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

function syncTocHeadings() {
  headingElements = visibleToc.value
    .map((item) => document.getElementById(item.id))
    .filter((heading) => heading && articleRef.value?.contains(heading))
  updateActiveToc()
}

function updateActiveToc() {
  if (!headingElements.length) {
    activeTocId.value = ''
    return
  }

  let currentId = headingElements[0].id
  for (const heading of headingElements) {
    if (heading.getBoundingClientRect().top > 120) break
    currentId = heading.id
  }
  if (activeTocId.value === currentId) return
  activeTocId.value = currentId
  nextTick(() => keepActiveTocLinkVisible(currentId))
}

function keepActiveTocLinkVisible(id) {
  if (activeTocId.value !== id || !tocRef.value) return
  const link = tocRef.value.querySelector('a.is-active')
  if (!link) return

  const linkTop = link.offsetTop
  const linkBottom = linkTop + link.offsetHeight
  const visibleTop = tocRef.value.scrollTop
  const visibleBottom = visibleTop + tocRef.value.clientHeight
  let nextTop = null

  if (linkTop < visibleTop) {
    nextTop = linkTop
  } else if (linkBottom > visibleBottom) {
    nextTop = linkBottom - tocRef.value.clientHeight
  }

  if (nextTop !== null) {
    tocRef.value.scrollTo({ top: nextTop, behavior: 'smooth' })
  }
}

function handlePageScroll() {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0
    updateActiveToc()
  })
}

function handleTocClick(event, id) {
  event.preventDefault()
  const heading = document.getElementById(id)
  if (!heading || !articleRef.value?.contains(heading)) return

  activeTocId.value = id
  const url = new URL(window.location.href)
  url.hash = id
  window.history.pushState(null, '', url)
  heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleTocGenerated(items) {
  tocItems.value = items
  nextTick(syncTocHeadings)
}

watch(lang, (value) => {
  localStorage.setItem('modern-control-lang', value)
  document.title = value === 'zh'
    ? '现代控制理论与技术课程站'
    : 'Modern Control Theory Course Site'
  nextTick(syncTocHeadings)
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
  window.addEventListener('scroll', handlePageScroll, { passive: true })

  try {
    const response = await fetch('/markdown/pages/modern-control-course.md', { cache: 'no-cache' })
    if (!response.ok) throw new Error(`Markdown load failed: ${response.status}`)
    rawMarkdown.value = await response.text()
  } catch (error) {
    rawMarkdown.value = `## Content unavailable\n\n${error.message}`
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handlePageScroll)
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
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
  --course-bg: #e3e8e7;
  --course-hero: #294740;
  --course-paper: #f7f8f5;
  --course-surface: #edf1f2;
  --course-jade-panel: #e0e8e9;
  --course-ink: #17201e;
  --course-muted: #596762;
  --course-line: #c3cdcf;
  --course-line-strong: #91a2a7;
  --course-jade: #17695f;
  --course-jade-soft: #e6edef;
  --course-blue: #365f83;
  --course-gold: #a47b37;
  --course-red: #a8473b;
  --course-shadow: rgba(24, 34, 31, 0.17);
  --course-shadow-soft: rgba(58, 76, 84, 0.12);
  --course-button-light: #f7f9f8;
  --course-glaze: #f8faf9;
  --course-blue-layer: #dce7eb;
  --course-inner-light: rgba(255, 255, 255, 0.72);
  --course-material-shadow: rgba(62, 82, 94, 0.16);
  --course-code: #101816;

  display: flow-root;
  box-sizing: border-box;
  min-height: 100vh;
  padding-top: 1.5rem;
  color: var(--course-ink);
  background: var(--course-bg);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
}

.modern-control-page.is-dark {
  --course-bg: #0d1312;
  --course-hero: #151c1a;
  --course-paper: #19211f;
  --course-surface: #222c29;
  --course-jade-panel: #263630;
  --course-ink: #f7f8f5;
  --course-muted: #adb9b3;
  --course-line: #3b4944;
  --course-line-strong: #586a63;
  --course-jade: #87b8a9;
  --course-jade-soft: #24332e;
  --course-blue: #8daec7;
  --course-gold: #c6a15f;
  --course-red: #cc6d5e;
  --course-shadow: rgba(0, 0, 0, 0.36);
  --course-shadow-soft: rgba(0, 0, 0, 0.24);
  --course-button-light: #2a3532;
  --course-code: #0d1312;
}

.course-hero {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16.5rem;
  gap: clamp(2rem, 5vw, 5rem);
  width: min(100% - 4rem, 1280px);
  min-height: 23.25rem;
  margin: 0 auto 2rem;
  padding: 1.65rem clamp(2rem, 5vw, 4.5rem);
  align-items: center;
  border: 1px solid #293632;
  border-top: 3px solid var(--course-gold);
  border-radius: 4px;
  background: var(--course-hero);
  box-shadow: 0 18px 42px var(--course-shadow);
}

.hero-copy,
.hero-panel,
.course-layout {
  position: relative;
  z-index: 1;
}

.hero-copy {
  border-left: 3px solid var(--course-red);
  padding-left: clamp(1.25rem, 3vw, 2.25rem);
}

h1 {
  width: min(100%, 9.3em);
  margin: 0;
  color: #f7f8f5;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 3.75rem;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0;
}

.lang-en h1 {
  width: min(100%, 19ch);
  overflow-wrap: anywhere;
  font-size: 3.2rem;
  line-height: 1.06;
}

.hero-panel {
  box-sizing: border-box;
  display: grid;
  width: 100%;
  max-width: 16.5rem;
  gap: 0.65rem;
  align-content: start;
  justify-self: end;
  border: 1px solid #8fa198;
  border-radius: 3px;
  padding: 0.65rem;
  background: var(--course-jade-panel);
  box-shadow: 10px 14px 24px rgba(0, 0, 0, 0.24);
}

.course-logo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid var(--course-line-strong);
}

.control-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.control-row button {
  min-height: 44px;
  border: 1px solid var(--course-line-strong);
  border-radius: 4px;
  color: var(--course-ink);
  background: var(--course-button-light);
  font: inherit;
  cursor: pointer;
  box-shadow:
    inset 2px 2px 5px var(--course-shadow-soft),
    0 3px 7px var(--course-shadow-soft);
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.control-row button:hover {
  border-color: var(--course-gold);
  color: var(--course-jade);
  transform: translateY(-1px);
}

.control-row button:focus-visible,
.course-toc a:focus-visible,
.course-article :deep(.course-download:focus-visible) {
  outline: 3px solid var(--course-blue);
  outline-offset: 2px;
}

.course-layout {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: 16.5rem minmax(0, 1fr);
  gap: 1.5rem;
  width: min(100% - 4rem, 1280px);
  margin: 0 auto;
  padding: 0 0 6rem;
}

.course-toc,
.course-article {
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--course-line);
  border-radius: 3px;
}

.course-toc {
  position: sticky;
  top: 1rem;
  align-self: start;
  max-height: calc(100vh - 2rem);
  box-sizing: border-box;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.2rem 1rem 1.35rem;
  border-top: 3px solid var(--course-gold);
  border-right: 3px solid var(--course-jade);
  background: var(--course-surface);
  scrollbar-color: var(--course-line-strong) var(--course-surface);
  scrollbar-width: thin;
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

.course-toc a.is-active,
.course-toc a.is-active:hover,
.course-toc a.is-active:focus-visible {
  border-left-color: var(--course-red);
  color: var(--course-ink);
  background: var(--course-jade-soft);
}

.course-toc .toc-level-3 {
  padding-left: 1rem;
  font-size: 0.92rem;
}

.course-article {
  padding: 2.6rem 3rem;
  background: var(--course-paper);
  box-shadow: 0 18px 42px var(--course-shadow);
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
  --md-panel: var(--course-jade-soft);
  --md-panel-strong: var(--course-surface);
  --md-border: var(--course-line);

  max-width: none;
  margin: 0;
  padding: 0;
  color: var(--course-ink);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 1.08rem;
  line-height: 1.88;
}

.course-article :deep(.markdown-body h2) {
  margin-top: 3.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--course-line);
  color: var(--course-jade);
  text-decoration-color: var(--course-red);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
}

.course-article :deep(.markdown-body h2:first-child) {
  margin-top: 0;
  border-top: 0;
}

.course-article :deep(.markdown-body h3) {
  color: var(--course-gold);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
}

.course-article :deep(.markdown-body h2),
.course-article :deep(.markdown-body h3) {
  scroll-margin-top: 8rem;
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
  background: #202b28;
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
  border-radius: 4px;
  padding: 1rem;
  background: var(--course-jade-soft);
  box-shadow: 5px 7px 14px var(--course-shadow-soft);
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
  border: 1px solid var(--course-gold);
  border-radius: 4px;
  padding: 0 1rem;
  color: var(--course-ink);
  background: var(--course-surface);
  font-weight: 760;
  text-decoration: none;
  box-shadow: 5px 7px 14px var(--course-shadow-soft);
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.course-article :deep(.course-download:hover),
.course-article :deep(.course-download:focus-visible) {
  border-color: var(--course-jade);
  background: var(--course-jade-soft);
  transform: translateY(-1px);
}

.course-article :deep(.course-deadline) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  align-items: start;
  background: var(--course-surface);
  border-left: 3px solid var(--course-red);
}

.course-article :deep(.course-deadline strong) {
  display: block;
  color: var(--course-red);
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: 2.15rem;
  line-height: 1;
  white-space: nowrap;
}

.course-article :deep(.md-figure) {
  border: 1px solid var(--course-line);
  border-radius: 4px;
  padding: 0.7rem;
  background: var(--course-surface);
}

.course-article :deep(.md-figure img) {
  border-radius: 4px;
}

.modern-control-page:not(.is-dark) .hero-panel {
  border-color: var(--course-line-strong);
  background: var(--course-jade-panel);
  box-shadow:
    inset 0 0 0 1px var(--course-inner-light),
    0 10px 22px var(--course-material-shadow);
}

.modern-control-page:not(.is-dark) .control-row button {
  background: var(--course-glaze);
  box-shadow:
    inset 0 0 0 1px var(--course-inner-light),
    0 4px 9px var(--course-material-shadow);
}

.modern-control-page:not(.is-dark) .course-toc a.is-active,
.modern-control-page:not(.is-dark) .course-toc a.is-active:hover,
.modern-control-page:not(.is-dark) .course-toc a.is-active:focus-visible {
  background: var(--course-blue-layer);
  box-shadow:
    inset 0 0 0 1px var(--course-inner-light),
    0 3px 7px var(--course-material-shadow);
}

.modern-control-page:not(.is-dark) .course-article :deep(.course-download) {
  background: var(--course-glaze);
  box-shadow:
    inset 0 0 0 1px var(--course-inner-light),
    0 5px 11px var(--course-material-shadow);
}

.modern-control-page:not(.is-dark) .course-article :deep(.course-method-grid > div),
.modern-control-page:not(.is-dark) .course-article :deep(.course-requirement-grid > div) {
  background: var(--course-blue-layer);
  box-shadow:
    inset 0 0 0 1px var(--course-inner-light),
    0 6px 13px var(--course-material-shadow);
}

@media (max-width: 1100px) {
  .course-hero {
    gap: 2rem;
    padding-inline: 2.25rem;
  }

  h1 {
    font-size: 3.35rem;
  }

  .lang-en h1 {
    font-size: 2.8rem;
  }
}

@media (max-width: 760px) {
  .course-hero,
  .course-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .course-hero {
    min-height: auto;
    padding: 2.25rem;
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
    max-width: 16.5rem;
    justify-self: start;
  }

  .course-toc {
    position: static;
    width: 100%;
  }

  .course-toc nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .course-toc a,
  .course-article {
    overflow-wrap: anywhere;
  }

  .course-article {
    width: 100%;
  }

  .course-article :deep(.markdown-body) {
    min-width: 0;
    max-width: 100%;
  }

  .course-article :deep(.course-stage-grid),
  .course-article :deep(.course-method-grid),
  .course-article :deep(.course-requirement-grid),
  .course-article :deep(.course-deadline) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .modern-control-page {
    padding-top: 0.75rem;
  }

  .course-hero,
  .course-layout {
    width: min(100% - 1.5rem, 1280px);
  }

  .course-hero {
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
