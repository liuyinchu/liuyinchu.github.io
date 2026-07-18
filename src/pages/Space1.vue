<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FeaturedArticleRail from '../components/journal/FeaturedArticleRail.vue'

const ARTICLES_PER_PAGE = 7

const articles = ref([])
const featuredSelections = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const isDirectoryOpen = ref(false)
const featuredOffset = ref(0)
const loadError = ref('')
const directoryWrap = ref(null)

const poemLines = [
  '来自远方，来自黄昏和清晨，来自十二重高天的好风轻扬，飘来生命气息的吹拂，吹在我身上。',
  '趁着生命气息逗留，盘桓未去，拉住我的手，快告诉我你的心声。',
  '莫待无常之风，携我去飘渺远方。',
]

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('pointerdown', handleOutsidePointer)

  try {
    const [articleResult, featuredResult] = await Promise.allSettled([
      fetch('/articles.json'),
      fetch('/featured-articles.json'),
    ])

    if (articleResult.status === 'rejected') throw articleResult.reason
    const articleResponse = articleResult.value
    if (!articleResponse.ok) throw new Error(`文章列表请求失败：${articleResponse.status}`)
    articles.value = await articleResponse.json()

    if (featuredResult.status === 'fulfilled' && featuredResult.value.ok) {
      featuredSelections.value = await featuredResult.value.json()
    }
  } catch (error) {
    loadError.value = '随记列表暂时没有加载成功，请稍后刷新。'
    console.error('无法加载文章列表:', error)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('pointerdown', handleOutsidePointer)
})

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredArticles = computed(() => {
  if (!normalizedQuery.value) return articles.value

  return articles.value.filter((article) => {
    const content = [
      article.title,
      article.desc,
      article.author,
      article.date,
    ].join(' ').toLowerCase()

    return content.includes(normalizedQuery.value)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / ARTICLES_PER_PAGE)))

const pagedArticles = computed(() => {
  const start = (currentPage.value - 1) * ARTICLES_PER_PAGE
  return filteredArticles.value.slice(start, start + ARTICLES_PER_PAGE)
})

const pageArticleKey = computed(() => pagedArticles.value.map((article) => article.id).join('|'))

const featuredArticle = computed(() => {
  if (!pagedArticles.value.length) return null
  return pagedArticles.value[featuredOffset.value % pagedArticles.value.length]
})

const remainingPageArticles = computed(() => (
  pagedArticles.value.filter((article) => article.id !== featuredArticle.value?.id)
))

const sideArticles = computed(() => remainingPageArticles.value.slice(0, 2))
const gridArticles = computed(() => remainingPageArticles.value.slice(2))

const resultSummary = computed(() => {
  if (loadError.value) return loadError.value
  if (!articles.value.length) return '正在加载文章'
  if (!filteredArticles.value.length) return '没有找到匹配的文章'
  return `${filteredArticles.value.length} 篇随记`
})

const selectedFeaturedArticles = computed(() => (
  featuredSelections.value
    .map((selection) => {
      const article = articles.value.find((item) => item.id === selection.id)
      return article ? { ...article, featuredLabel: selection.label || '精选' } : null
    })
    .filter(Boolean)
))

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) currentPage.value = nextTotal
})

watch(pageArticleKey, () => {
  featuredOffset.value = pagedArticles.value.length
    ? Math.floor(Math.random() * pagedArticles.value.length)
    : 0
})

function clearSearch() {
  searchQuery.value = ''
}

function goToPage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function toggleDirectory() {
  isDirectoryOpen.value = !isDirectoryOpen.value
}

function handleGlobalKeydown(event) {
  if (event.key === 'Escape') isDirectoryOpen.value = false
}

function handleOutsidePointer(event) {
  if (isDirectoryOpen.value && !directoryWrap.value?.contains(event.target)) {
    isDirectoryOpen.value = false
  }
}
</script>

<template>
  <main class="journal-page">
    <section class="journal-hero" aria-labelledby="journal-title">
      <div class="hero-intro">
        <div>
          <p class="hero-kicker">Jottings · Since 2024</p>
          <h1 id="journal-title">随手写下，慢慢整理。</h1>
        </div>
        <p class="hero-description">
          思考、学习和生活留下的边角。可以从搜索开始，也可以任由精选文章带路。
        </p>
      </div>

      <div class="poem-ribbon" aria-label="阿尔弗雷德·爱德华·豪斯迈《西罗普郡少年》选句">
        <div class="poem-track">
          <p>
            <span v-for="line in poemLines" :key="line">{{ line }}</span>
            <em>— 阿尔弗雷德·爱德华·豪斯迈《西罗普郡少年》</em>
          </p>
          <p aria-hidden="true">
            <span v-for="line in poemLines" :key="`copy-${line}`">{{ line }}</span>
            <em>— 阿尔弗雷德·爱德华·豪斯迈《西罗普郡少年》</em>
          </p>
        </div>
      </div>

      <div class="discovery-panel">
        <div class="discovery-copy">
          <p>Find a note</p>
          <strong aria-live="polite">{{ resultSummary }}</strong>
        </div>

        <div class="hero-tools">
          <label class="search-shell" for="journal-search">
            <span class="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M10.8 18.1a7.3 7.3 0 1 1 5.16-2.14l4.04 4.04-1.42 1.42-4.04-4.04a7.25 7.25 0 0 1-3.74 1.02Zm0-2a5.3 5.3 0 1 0 0-10.6 5.3 5.3 0 0 0 0 10.6Z" />
              </svg>
            </span>
            <input
              id="journal-search"
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="搜索标题、摘要、日期"
            >
            <button
              v-if="searchQuery"
              class="search-clear"
              type="button"
              aria-label="清空搜索"
              @click.prevent="clearSearch"
            >
              清空
            </button>
          </label>

          <div ref="directoryWrap" class="directory-wrap">
            <button
              class="directory-button"
              type="button"
              :aria-expanded="isDirectoryOpen.toString()"
              aria-controls="journal-directory"
              @click="toggleDirectory"
            >
              <span>全部目录</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10l5 5 5-5H7Z" />
              </svg>
            </button>

            <div
              v-if="isDirectoryOpen"
              id="journal-directory"
              class="directory-panel"
            >
              <RouterLink
                v-for="article in articles"
                :key="article.id"
                class="directory-link"
                :to="`/space1/${article.id}`"
                @click="isDirectoryOpen = false"
              >
                <span>{{ article.title }}</span>
                <small>{{ article.date }}</small>
              </RouterLink>
            </div>
          </div>

          <RouterLink class="alternate-index" to="/space4">
            <span aria-hidden="true">✦</span>
            <span>
              <strong>星穹文库</strong>
              <small>另一种浏览</small>
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <FeaturedArticleRail :articles="selectedFeaturedArticles" />

    <section class="article-section" aria-labelledby="article-section-heading">
      <div class="section-heading">
        <div>
          <p class="section-label">{{ resultSummary }}</p>
          <h2 id="article-section-heading">文章</h2>
        </div>
        <p class="page-indicator">第 {{ currentPage }} / {{ totalPages }} 页</p>
      </div>

      <div
        v-if="filteredArticles.length"
        class="article-layout"
      >
        <RouterLink
          v-if="featuredArticle"
          class="featured-card"
          :to="`/space1/${featuredArticle.id}`"
        >
          <img :src="featuredArticle.image" :alt="featuredArticle.title" decoding="async">
          <div class="featured-copy">
            <h3>{{ featuredArticle.title }}</h3>
            <p class="article-meta">
              <span>{{ featuredArticle.author }}</span>
              <span>{{ featuredArticle.date }}</span>
            </p>
            <p class="article-desc">{{ featuredArticle.desc }}</p>
          </div>
        </RouterLink>

        <div class="side-stack">
          <RouterLink
            v-for="article in sideArticles"
            :key="article.id"
            class="side-card"
            :to="`/space1/${article.id}`"
          >
            <img :src="article.image" :alt="article.title" loading="lazy" decoding="async">
            <h3>{{ article.title }}</h3>
            <p class="article-meta">
              <span>{{ article.author }}</span>
              <span>{{ article.date }}</span>
            </p>
          </RouterLink>
        </div>
      </div>

      <div
        v-if="gridArticles.length"
        class="latest-grid"
      >
        <RouterLink
          v-for="article in gridArticles"
          :key="article.id"
          class="latest-card"
          :to="`/space1/${article.id}`"
        >
          <img :src="article.image" :alt="article.title" loading="lazy" decoding="async">
          <div class="latest-copy">
            <h3>{{ article.title }}</h3>
            <p class="article-meta">
              <span>{{ article.author }}</span>
              <span>{{ article.date }}</span>
            </p>
          </div>
        </RouterLink>
      </div>

      <div
        v-if="loadError"
        class="empty-state"
        role="status"
      >
        {{ loadError }}
      </div>

      <div
        v-else-if="!filteredArticles.length && !articles.length"
        class="empty-state"
        role="status"
      >
        正在加载文章。
      </div>

      <div
        v-else-if="!filteredArticles.length"
        class="empty-state"
      >
        没有找到匹配的文章。
      </div>

      <nav
        v-if="totalPages > 1"
        class="pagination"
        aria-label="随记分页"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        <div class="page-dots" aria-hidden="true">
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="{ 'is-active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.journal-page {
  --ctp-base: #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-text: #cdd6f4;
  --ctp-subtext0: #a6adc8;
  --ctp-subtext1: #bac2de;
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  --ctp-surface2: #585b70;
  --ctp-blue: #89b4fa;
  --ctp-sapphire: #74c7ec;
  --ctp-lavender: #b4befe;
  --ctp-mauve: #cba6f7;

  min-height: 100vh;
  color: var(--ctp-text);
  background: var(--ctp-mantle);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
}

.journal-hero {
  width: min(100% - 3rem, 1320px);
  margin: 0 auto;
  padding: clamp(5.8rem, 9vw, 8rem) 0 clamp(3.2rem, 6vw, 5rem);
}

.hero-kicker,
.section-label {
  margin: 0 0 0.7rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(17rem, 0.6fr);
  align-items: end;
  gap: clamp(2rem, 5vw, 6rem);
}

.hero-intro h1 {
  max-width: 15ch;
  margin: 0;
  color: #f5f6ff;
  font-size: clamp(2.7rem, 6.6vw, 6.4rem);
  font-weight: 760;
  letter-spacing: -0.055em;
  line-height: 0.98;
  text-wrap: balance;
}

.hero-description {
  max-width: 30rem;
  margin: 0 0 0.35rem;
  color: rgba(205, 214, 244, 0.68);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1rem, 1.3vw, 1.14rem);
  line-height: 1.75;
}

.poem-ribbon {
  overflow: hidden;
  margin-top: clamp(2rem, 4vw, 3.25rem);
  border-block: 1px solid rgba(180, 190, 254, 0.1);
  color: rgba(205, 214, 244, 0.54);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 3rem, #000 calc(100% - 3rem), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 3rem, #000 calc(100% - 3rem), transparent);
}

.poem-track {
  display: flex;
  width: max-content;
  animation: poem-scroll 76s linear infinite;
  will-change: transform;
}

.poem-ribbon:hover .poem-track {
  animation-play-state: paused;
}

.poem-track p {
  display: flex;
  gap: 2.8rem;
  margin: 0;
  padding: 0.75rem 1.4rem;
  white-space: nowrap;
  font-family: 'LXGW WenKai', serif;
  font-size: 0.79rem;
}

.poem-track span {
  position: relative;
}

.poem-track span::after {
  content: '✦';
  position: absolute;
  right: -1.65rem;
  color: rgba(137, 180, 250, 0.56);
  font-size: 0.55rem;
}

.poem-track em {
  color: rgba(180, 190, 254, 0.6);
  font-style: normal;
}

@keyframes poem-scroll {
  to { transform: translateX(-50%); }
}

.discovery-panel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 4rem);
  margin-top: 1.35rem;
  padding: clamp(1rem, 2vw, 1.35rem);
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 1.15rem;
  background:
    linear-gradient(135deg, rgba(137, 180, 250, 0.07), transparent 45%),
    rgba(30, 30, 46, 0.54);
}

.discovery-copy {
  min-width: 10rem;
}

.discovery-copy p {
  margin: 0 0 0.3rem;
  color: rgba(205, 214, 244, 0.46);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.discovery-copy strong {
  display: block;
  max-width: 20rem;
  color: rgba(205, 214, 244, 0.88);
  font-size: 0.95rem;
  font-weight: 680;
}

.hero-tools {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.9rem;
  min-width: 0;
}

.search-shell {
  display: flex;
  align-items: center;
  min-height: 3.65rem;
  gap: 0.85rem;
  padding: 0 1.1rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 999px;
  background: rgba(30, 30, 46, 0.68);
  transition: border-color 0.22s ease, background-color 0.22s ease;
}

.search-shell:focus-within {
  border-color: rgba(137, 180, 250, 0.58);
  background: rgba(49, 50, 68, 0.72);
}

.search-icon {
  display: inline-flex;
  width: 1.25rem;
  color: rgba(205, 214, 244, 0.68);
}

.search-icon svg,
.directory-button svg {
  display: block;
  width: 100%;
  fill: currentColor;
}

.search-shell input {
  width: 100%;
  min-width: 0;
  color: var(--ctp-text);
  background: transparent;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 1rem;
}

.search-shell input::placeholder {
  color: rgba(205, 214, 244, 0.46);
}

.search-clear {
  border: 0;
  color: rgba(180, 190, 254, 0.82);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.directory-wrap {
  position: relative;
}

.directory-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.65rem;
  gap: 0.55rem;
  padding: 0 1.25rem;
  border: 1px solid rgba(180, 190, 254, 0.18);
  border-radius: 999px;
  color: var(--ctp-text);
  background: rgba(49, 50, 68, 0.72);
  font: inherit;
  font-weight: 720;
  cursor: pointer;
  transition: background-color 0.22s ease, border-color 0.22s ease;
}

.directory-button:hover,
.directory-button:focus-visible {
  background: rgba(69, 71, 90, 0.78);
  border-color: rgba(180, 190, 254, 0.32);
}

.directory-button svg {
  width: 1rem;
}

.directory-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  z-index: 40;
  width: min(34rem, calc(100vw - 3rem));
  max-height: min(28rem, 70vh);
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1.1rem;
  background: rgba(30, 30, 46, 0.97);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
}

.alternate-index {
  display: inline-flex;
  min-height: 3.65rem;
  align-items: center;
  gap: 0.65rem;
  padding: 0 1rem;
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.86);
  background: linear-gradient(135deg, rgba(203, 166, 247, 0.13), rgba(137, 180, 250, 0.08));
  text-decoration: none;
  white-space: nowrap;
}

.alternate-index > span:first-child {
  color: #cba6f7;
  transition: rotate 0.35s ease;
}

.alternate-index > span:last-child {
  display: grid;
  gap: 0.05rem;
}

.alternate-index strong {
  font-size: 0.82rem;
}

.alternate-index small {
  color: rgba(205, 214, 244, 0.48);
  font-size: 0.64rem;
}

.alternate-index:hover,
.alternate-index:focus-visible {
  border-color: rgba(203, 166, 247, 0.46);
  color: #f5f6ff;
}

.alternate-index:hover > span:first-child,
.alternate-index:focus-visible > span:first-child {
  rotate: 72deg;
}

.directory-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.8rem 0.85rem;
  border-radius: 0.8rem;
  color: rgba(205, 214, 244, 0.9);
  text-decoration: none;
}

.directory-link:hover,
.directory-link:focus-visible {
  background: rgba(69, 71, 90, 0.56);
}

.directory-link span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.directory-link small {
  color: rgba(166, 173, 200, 0.68);
}

.article-section {
  width: min(100% - 3rem, 1320px);
  margin: 0 auto;
  padding: 0 0 clamp(4.5rem, 8vw, 7rem);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: clamp(1.6rem, 4vw, 3rem);
}

.section-heading h2 {
  margin: 0;
  color: var(--ctp-text);
  font-size: clamp(2rem, 3.5vw, 3.25rem);
  line-height: 1;
  letter-spacing: 0;
}

.page-indicator {
  margin: 0;
  color: rgba(205, 214, 244, 0.66);
  font-weight: 650;
}

.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.05fr) minmax(18rem, 0.72fr);
  gap: clamp(1.6rem, 3vw, 2.4rem);
  align-items: start;
}

.featured-card,
.side-card,
.latest-card {
  color: inherit;
  text-decoration: none;
}

.featured-card img,
.side-card img,
.latest-card img {
  display: block;
  width: 100%;
  object-fit: cover;
  background: rgba(49, 50, 68, 0.55);
}

.featured-card img {
  aspect-ratio: 16 / 9;
  border-radius: 0.45rem;
}

.featured-copy {
  padding-top: 1.7rem;
}

.featured-copy h3 {
  margin: 0;
  color: var(--ctp-text);
  font-size: clamp(2.05rem, 4.65vw, 4.45rem);
  font-weight: 760;
  line-height: 1.05;
  letter-spacing: 0;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.1rem 0 0;
  color: rgba(205, 214, 244, 0.68);
  font-size: 0.98rem;
  font-weight: 680;
}

.article-desc {
  max-width: 50rem;
  margin: 1rem 0 0;
  color: rgba(205, 214, 244, 0.76);
  font-size: 1.06rem;
  line-height: 1.75;
}

.side-stack {
  display: grid;
  gap: clamp(2rem, 3vw, 2.8rem);
}

.side-card img {
  aspect-ratio: 1 / 1;
  border-radius: 0.45rem;
}

.side-card h3,
.latest-card h3 {
  margin: 1.05rem 0 0;
  color: var(--ctp-text);
  font-size: clamp(1.24rem, 1.75vw, 1.55rem);
  line-height: 1.22;
}

.latest-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2.2rem, 4vw, 4rem) clamp(2rem, 5vw, 6rem);
  margin-top: clamp(4rem, 7vw, 6rem);
}

.latest-card {
  display: grid;
  grid-template-columns: minmax(8rem, 0.78fr) minmax(0, 1fr);
  gap: clamp(1.2rem, 2vw, 2rem);
  align-items: center;
}

.latest-card img {
  aspect-ratio: 1 / 1;
  border-radius: 0.45rem;
}

.latest-card h3 {
  margin-top: 0;
}

.featured-card img,
.side-card img,
.latest-card img {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.featured-card:hover img,
.side-card:hover img,
.latest-card:hover img {
  opacity: 0.86;
}

.featured-card:hover h3,
.side-card:hover h3,
.latest-card:hover h3 {
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.16em;
}

.empty-state {
  padding: 5rem 0;
  color: rgba(205, 214, 244, 0.68);
  font-size: 1.1rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: clamp(3.5rem, 6vw, 5rem);
}

.pagination button {
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.88);
  background: rgba(30, 30, 46, 0.6);
  font: inherit;
  font-weight: 680;
  cursor: pointer;
}

.pagination button:hover:not(:disabled),
.pagination button:focus-visible:not(:disabled),
.page-dots button.is-active {
  color: var(--ctp-base);
  background: var(--ctp-lavender);
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.page-dots {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.page-dots button {
  min-width: 2.75rem;
  padding: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 980px) {
  .article-layout {
    grid-template-columns: 1fr;
  }

  .side-stack,
  .latest-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .latest-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .journal-hero,
  .article-section {
    width: min(100% - 2rem, 1320px);
  }

  .journal-hero {
    padding-top: 5.4rem;
  }

  .hero-intro,
  .discovery-panel {
    grid-template-columns: 1fr;
  }

  .hero-intro {
    gap: 1.2rem;
  }

  .hero-intro h1 {
    max-width: 12ch;
  }

  .hero-description {
    max-width: 34rem;
  }

  .poem-ribbon {
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 1rem, #000 calc(100% - 1rem), transparent);
  }

  .discovery-panel {
    gap: 1rem;
  }

  .discovery-copy {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .hero-tools {
    grid-template-columns: 1fr;
  }

  .directory-wrap,
  .directory-button,
  .alternate-index {
    width: 100%;
  }

  .alternate-index {
    justify-content: center;
  }

  .directory-panel {
    right: auto;
    left: 0;
    width: 100%;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .side-stack,
  .latest-grid {
    grid-template-columns: 1fr;
  }

  .latest-card {
    gap: 1rem;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 460px) {
  .hero-intro h1 {
    font-size: clamp(2.35rem, 13.5vw, 3.35rem);
    line-height: 1.02;
  }

  .poem-track p {
    gap: 2.2rem;
    font-size: 0.73rem;
  }

  .featured-copy h3 {
    font-size: clamp(1.65rem, 9.2vw, 2.35rem);
    line-height: 1.12;
  }

  .page-dots {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .poem-ribbon {
    overflow-x: auto;
    -webkit-mask-image: none;
    mask-image: none;
    scrollbar-width: thin;
  }

  .poem-track {
    animation: none;
    will-change: auto;
  }

  .poem-track p:nth-child(2) {
    display: none;
  }

  .featured-card img,
  .side-card img,
  .latest-card img {
    transition: none;
  }

  .alternate-index > span:first-child {
    transition: none;
  }
}
</style>
