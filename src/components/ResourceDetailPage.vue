<script setup>
import MarkdownIt from 'markdown-it'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  jsonFile: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
})

const categoryNav = [
  { id: 'literature', label: '文献', path: '/rliterature' },
  { id: 'programming', label: '编程', path: '/rprogramming' },
  { id: 'computer', label: '计算机', path: '/rcomputer' },
  { id: 'materials', label: '资料', path: '/rmaterials' },
  { id: 'tools', label: '工具', path: '/rtools' },
  { id: 'files', label: '文件', path: '/rfiles' },
]

const md = new MarkdownIt({ html: true, breaks: true, linkify: true })

const items = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredItems = computed(() => {
  if (!normalizedQuery.value) return items.value

  return items.value.filter((item) => {
    const content = [
      item.name,
      item.intro,
      item.add,
      item.url,
    ].join(' ').toLowerCase()

    return content.includes(normalizedQuery.value)
  })
})

const activeCategory = computed(() => (
  categoryNav.find((category) => category.id === props.categoryId)
))

const resourceCountLabel = computed(() => {
  if (loading.value) return '正在读取'
  if (error.value) return '读取失败'
  if (normalizedQuery.value) return `${filteredItems.value.length} / ${items.value.length} 条`
  return `${items.value.length} 条资源`
})

const formatIdx = (idx) => String(idx).padStart(2, '0')

const renderMarkdown = (text) => {
  if (!text) return ''
  return md.render(text)
}

const clearSearch = () => {
  searchQuery.value = ''
}

const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch(`/resource/${props.jsonFile}`)
    if (!response.ok) throw new Error(`Status ${response.status}`)
    const data = await response.json()
    items.value = data.sort((a, b) => Number(a.idx) - Number(b.idx))
  } catch (err) {
    error.value = `无法加载资源：${err.message}`
  } finally {
    loading.value = false
  }
}

watch(() => props.jsonFile, fetchData)

onMounted(() => {
  fetchData()
})
</script>

<template>
  <main class="resource-detail-page">
    <section class="resource-hero" aria-labelledby="resource-title">
      <RouterLink class="back-link" to="/rd">返回资源目录</RouterLink>
      <div class="hero-copy">
        <p class="eyebrow">Resource Index</p>
        <h1 id="resource-title">{{ title }}</h1>
        <p class="hero-summary">
          按条目整理的资源清单。保留简短说明、补充备注和外部入口，方便快速浏览与回访。
        </p>
      </div>
      <div class="hero-meta">
        <span>{{ activeCategory?.label || '资源' }}</span>
        <span>{{ resourceCountLabel }}</span>
      </div>
    </section>

    <section class="resource-layout" aria-label="资源内容">
      <aside class="resource-side">
        <div class="side-panel">
          <label class="resource-search" for="resource-search-input">
            <span>搜索</span>
            <input
              id="resource-search-input"
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="名称、说明、链接"
            >
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
            >
              Clear
            </button>
          </label>

          <nav class="category-nav" aria-label="资源分类">
            <RouterLink
              v-for="category in categoryNav"
              :key="category.id"
              :to="category.path"
              :class="{ 'is-active': category.id === categoryId }"
            >
              {{ category.label }}
            </RouterLink>
          </nav>
        </div>
      </aside>

      <div class="resource-main">
        <div v-if="loading" class="state-block">
          正在读取资源。
        </div>

        <div v-else-if="error" class="state-block is-error">
          {{ error }}
        </div>

        <div v-else-if="filteredItems.length" class="resource-list">
          <article
            v-for="item in filteredItems"
            :key="item.idx"
            class="resource-entry"
          >
            <div class="entry-index">{{ formatIdx(item.idx) }}</div>
            <div class="entry-body">
              <div class="entry-head">
                <h2>{{ item.name }}</h2>
                <a
                  v-if="item.url"
                  class="entry-link"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </div>

              <div
                v-if="item.intro"
                class="markdown-content entry-intro"
                v-html="renderMarkdown(item.intro)"
              ></div>

              <div
                v-if="item.add"
                class="entry-note markdown-content"
                v-html="renderMarkdown(item.add)"
              ></div>
            </div>
          </article>
        </div>

        <div v-else class="state-block">
          没有找到匹配的资源。
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.resource-detail-page {
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
  --ctp-pink: #f5c2e7;
  --ctp-red: #f38ba8;

  min-height: 100vh;
  padding: clamp(5.5rem, 9vw, 8rem) 0 clamp(4.5rem, 8vw, 7rem);
  color: var(--ctp-text);
  background:
    radial-gradient(circle at 20% 0%, rgba(137, 180, 250, 0.08), transparent 32rem),
    var(--ctp-mantle);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
}

.resource-hero,
.resource-layout {
  width: min(100% - 3rem, 1200px);
  margin: 0 auto;
}

.resource-hero {
  display: grid;
  grid-template-columns: minmax(8rem, 0.35fr) minmax(0, 1fr) auto;
  gap: clamp(1.2rem, 4vw, 4rem);
  align-items: end;
  padding-bottom: clamp(2rem, 5vw, 4rem);
  border-bottom: 1px solid rgba(180, 190, 254, 0.12);
}

.back-link {
  width: fit-content;
  color: rgba(205, 214, 244, 0.72);
  font-size: 0.92rem;
  font-weight: 680;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link:hover,
.back-link:focus-visible {
  color: var(--ctp-lavender);
}

.eyebrow {
  margin: 0 0 1.1rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.82rem;
  font-weight: 760;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: var(--ctp-text);
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  font-weight: 760;
  line-height: 1.02;
  letter-spacing: 0;
}

.hero-summary {
  max-width: 48rem;
  margin: 1.4rem 0 0;
  color: rgba(205, 214, 244, 0.72);
  font-size: clamp(1rem, 1.4vw, 1.14rem);
  line-height: 1.8;
}

.hero-meta {
  display: grid;
  gap: 0.5rem;
  justify-items: end;
  color: rgba(205, 214, 244, 0.7);
  font-size: 0.94rem;
  font-weight: 680;
}

.resource-layout {
  display: grid;
  grid-template-columns: minmax(12rem, 0.33fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  padding-top: clamp(2.5rem, 5vw, 4.5rem);
}

.resource-side {
  position: relative;
}

.side-panel {
  position: sticky;
  top: 6rem;
  display: grid;
  gap: 1.4rem;
}

.resource-search {
  display: grid;
  gap: 0.65rem;
}

.resource-search span {
  color: rgba(205, 214, 244, 0.68);
  font-size: 0.8rem;
  font-weight: 760;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.resource-search input {
  width: 100%;
  min-height: 3rem;
  padding: 0 0.95rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 999px;
  color: var(--ctp-text);
  background: rgba(30, 30, 46, 0.68);
  outline: 0;
  font: inherit;
  box-sizing: border-box;
}

.resource-search input:focus {
  border-color: rgba(137, 180, 250, 0.58);
  background: rgba(49, 50, 68, 0.72);
}

.resource-search input::placeholder {
  color: rgba(205, 214, 244, 0.42);
}

.resource-search button {
  width: fit-content;
  border: 0;
  color: rgba(180, 190, 254, 0.82);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.category-nav {
  display: grid;
  gap: 0.25rem;
}

.category-nav a {
  padding: 0.62rem 0;
  border-bottom: 1px solid rgba(180, 190, 254, 0.1);
  color: rgba(205, 214, 244, 0.68);
  text-decoration: none;
  transition: color 0.2s ease, padding-left 0.2s ease;
}

.category-nav a:hover,
.category-nav a:focus-visible,
.category-nav a.is-active {
  padding-left: 0.45rem;
  color: var(--ctp-lavender);
}

.resource-main {
  min-width: 0;
}

.resource-list {
  display: grid;
}

.resource-entry {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(1.35rem, 2.6vw, 2.25rem) 0;
  border-bottom: 1px solid rgba(180, 190, 254, 0.12);
}

.resource-entry:first-child {
  padding-top: 0;
}

.entry-index {
  color: rgba(205, 214, 244, 0.42);
  font-size: clamp(1.25rem, 2vw, 1.85rem);
  font-weight: 720;
  line-height: 1.2;
}

.entry-body {
  min-width: 0;
}

.entry-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.5rem;
}

.entry-head h2 {
  margin: 0;
  color: var(--ctp-text);
  font-size: clamp(1.35rem, 2.1vw, 2rem);
  font-weight: 760;
  line-height: 1.25;
  letter-spacing: 0;
}

.entry-link {
  flex: 0 0 auto;
  color: var(--ctp-text);
  border: 1px solid rgba(180, 190, 254, 0.22);
  border-radius: 999px;
  padding: 0.42rem 0.85rem;
  font-size: 0.86rem;
  font-weight: 720;
  text-decoration: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.entry-link:hover,
.entry-link:focus-visible {
  background: rgba(69, 71, 90, 0.56);
  border-color: rgba(180, 190, 254, 0.4);
}

.entry-intro {
  margin-top: 0.75rem;
}

.entry-note {
  margin-top: 0.95rem;
  padding: 0.8rem 0.95rem;
  border-left: 2px solid rgba(137, 180, 250, 0.62);
  background: rgba(30, 30, 46, 0.72);
  color: rgba(205, 214, 244, 0.82);
}

.markdown-content {
  color: rgba(205, 214, 244, 0.72);
  font-size: clamp(1rem, 1.35vw, 1.1rem);
  line-height: 1.82;
}

.markdown-content :deep(p) {
  margin: 0 0 0.75rem;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(strong) {
  color: var(--ctp-lavender);
  font-weight: 760;
}

.markdown-content :deep(a) {
  color: var(--ctp-blue);
  text-decoration: none;
  border-bottom: 1px solid rgba(137, 180, 250, 0.4);
}

.markdown-content :deep(a:hover) {
  border-bottom-color: currentColor;
}

.markdown-content :deep(code) {
  padding: 0.12rem 0.32rem;
  border-radius: 0.35rem;
  color: var(--ctp-pink);
  background: rgba(49, 50, 68, 0.65);
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.state-block {
  padding: 4rem 0;
  color: rgba(205, 214, 244, 0.68);
  font-size: 1.05rem;
}

.state-block.is-error {
  color: var(--ctp-red);
}

@media (max-width: 980px) {
  .resource-hero {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .hero-meta {
    justify-items: start;
  }

  .resource-layout {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: static;
  }

  .category-nav {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .category-nav a {
    flex: 0 0 auto;
    border: 1px solid rgba(180, 190, 254, 0.14);
    border-radius: 999px;
    padding: 0.55rem 0.9rem;
  }

  .category-nav a:hover,
  .category-nav a:focus-visible,
  .category-nav a.is-active {
    padding-left: 0.9rem;
    background: rgba(49, 50, 68, 0.72);
  }
}

@media (max-width: 640px) {
  .resource-detail-page {
    padding-top: 5rem;
  }

  .resource-hero,
  .resource-layout {
    width: min(100% - 2rem, 1200px);
  }

  .resource-entry {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .entry-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.8rem;
  }

  .entry-link {
    width: fit-content;
  }
}
</style>
