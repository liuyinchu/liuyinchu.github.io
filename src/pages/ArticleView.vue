<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// 路径已根据你的结构调整
import MarkdownViewer from '../components/MarkdownViewer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { calculateReadingTime } from '../utils/readingTime.js'

const route = useRoute()
const articleId = computed(() => String(route.params.id ?? ''))

const articleMeta = ref(null)
const toc = ref([])
const status = ref('loading')
const loadError = ref('')
const stateHeadingRef = ref(null)
let activeController = null
let loadVersion = 0

const markdownSrc = computed(() => articleMeta.value?.file || '')
const headerBgStyle = computed(() => {
  if (articleMeta.value?.image) {
    return { backgroundImage: `url(${articleMeta.value.image})` }
  }
  return {}
})

async function loadArticle(id = articleId.value) {
  const version = ++loadVersion
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller

  status.value = 'loading'
  articleMeta.value = null
  toc.value = []
  loadError.value = ''

  try {
    const res = await fetch('/articles.json', { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`Article index request failed with HTTP ${res.status}`)
    }

    const articles = await res.json()
    if (version !== loadVersion) return

    if (!Array.isArray(articles)) {
      throw new Error('Article index did not return an array')
    }

    const foundArticle = articles.find(article => String(article.id) === id)

    if (!foundArticle) {
      status.value = 'not-found'
      return
    }

    articleMeta.value = {
      ...foundArticle,
      file: `/markdown/${foundArticle.id}.md`
    }
    status.value = 'ready'
  } catch (error) {
    if (version !== loadVersion || error?.name === 'AbortError') return

    console.error('无法加载文章元数据:', error)
    loadError.value = '文章索引暂时无法读取。请检查网络连接后重试。'
    status.value = 'error'
  } finally {
    if (activeController === controller) {
      activeController = null
    }
  }
}

function retryArticle() {
  loadArticle(articleId.value)
}

watch(articleId, loadArticle, { immediate: true })

watch(status, async currentStatus => {
  if (currentStatus !== 'not-found' && currentStatus !== 'error') return

  await nextTick()
  stateHeadingRef.value?.focus({ preventScroll: true })
})

onBeforeUnmount(() => {
  loadVersion += 1
  activeController?.abort()
})

function onTocGenerated(generatedToc) {
  toc.value = generatedToc
}

function onMarkdownLoaded(rawText) {
  if (articleMeta.value) {
    articleMeta.value.readingTime = calculateReadingTime(rawText)
  }
}
</script>

<template>
  <div
    class="page-container"
    data-page="article"
    :data-state="status"
    :data-article-id="articleId"
    :aria-busy="status === 'loading'"
  >
    <header 
      v-if="status === 'ready' && articleMeta"
      class="title-container" 
      :style="headerBgStyle"
    >
      <div class="header-content">
        <h1>{{ articleMeta.title }}</h1>
        <div class="meta-info">
          <div class="meta-primary">
            <span>作者: {{ articleMeta.author }}</span>
            <span>发布于: {{ articleMeta.date }}</span>
          </div>
          <span v-if="articleMeta.readingTime" class="meta-reading">
            阅读时间: {{ articleMeta.readingTime }}
          </span>
        </div>
      </div>
    </header>

    <div v-if="status === 'ready'" class="main-content-area">
      <main class="article-wrapper" data-article-content>
        <MarkdownViewer 
          v-if="markdownSrc && articleMeta"
          :key="articleMeta.id"
          :src="markdownSrc" 
          @toc-generated="onTocGenerated"
          @markdown-loaded="onMarkdownLoaded"
        />
      </main>

      <aside class="toc-wrapper">
        <TableOfContents v-if="toc.length > 0" :toc="toc" />
      </aside>
    </div>

    <main v-else class="article-state-shell">
      <section
        v-if="status === 'loading'"
        class="article-state-panel article-state-panel--loading"
        data-article-loading
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="article-state-heading">
          <span class="article-state-signal article-state-signal--loading" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" focusable="false">
              <circle cx="32" cy="32" r="21" />
              <path d="M32 11a21 21 0 0 1 18.2 10.5" />
              <circle cx="32" cy="32" r="4" />
              <path d="M32 32 45 23" />
            </svg>
          </span>
          <div class="article-state-copy">
            <span class="article-state-kicker">Article · locating signal</span>
            <h1>正在定位文章…</h1>
            <span class="article-state-description">正在读取文章索引，请稍候。</span>
          </div>
        </div>
      </section>

      <section
        v-else-if="status === 'not-found'"
        class="article-state-panel"
        data-article-not-found
        aria-labelledby="article-not-found-title"
        aria-describedby="article-not-found-description"
      >
        <div class="article-state-heading">
          <span class="article-state-signal" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" focusable="false">
              <path d="M20 9h18l9 9v16" />
              <path d="M38 9v10h9M20 9v46h17" />
              <circle cx="46" cy="46" r="9" />
              <path d="m52.5 52.5 5.5 5.5M42.5 46h7" />
            </svg>
          </span>
          <div class="article-state-copy">
            <span class="article-state-kicker">Article · signal lost</span>
            <h1 id="article-not-found-title" ref="stateHeadingRef" tabindex="-1">
              这篇文章暂时不在这里
            </h1>
            <span id="article-not-found-description" class="article-state-description">
              没有找到“<code>{{ articleId }}</code>”对应的文章。它可能已被移动、重命名，或尚未发布。
            </span>
          </div>
        </div>

        <div class="article-state-path">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
          </svg>
          <span>
            <small>Requested article</small>
            <code dir="ltr">{{ route.path }}</code>
          </span>
        </div>

        <nav class="article-state-actions" aria-label="文章恢复导航">
          <RouterLink class="article-state-action article-state-action--primary" to="/space1">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3.5 5.5c3.2-.8 5.8-.2 8.5 1.8v13c-2.7-2-5.3-2.6-8.5-1.8Z" />
              <path d="M20.5 5.5c-3.2-.8-5.8-.2-8.5 1.8v13c2.7-2 5.3-2.6 8.5-1.8Z" />
            </svg>
            <span>返回随记</span>
          </RouterLink>
          <RouterLink class="article-state-action" to="/">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m3.5 10.5 8.5-7 8.5 7" />
              <path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" />
            </svg>
            <span>回到首页</span>
          </RouterLink>
        </nav>
      </section>

      <section
        v-else
        class="article-state-panel"
        data-article-error
        role="alert"
        aria-labelledby="article-error-title"
        aria-describedby="article-error-description"
      >
        <div class="article-state-heading">
          <span class="article-state-signal article-state-signal--error" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" focusable="false">
              <path d="M18 43h29a10 10 0 0 0 1.5-19.9A17 17 0 0 0 17 18.5 12.5 12.5 0 0 0 18 43Z" />
              <path d="m25 29 14 14m0-14L25 43" />
            </svg>
          </span>
          <div class="article-state-copy">
            <span class="article-state-kicker">Article · connection interrupted</span>
            <h1 id="article-error-title" ref="stateHeadingRef" tabindex="-1">
              文章索引暂时无法读取
            </h1>
            <span id="article-error-description" class="article-state-description">
              {{ loadError }}文章地址本身未必有误，你可以重新尝试连接。
            </span>
          </div>
        </div>

        <div class="article-state-path">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 12a8 8 0 0 1 13.7-5.6L20 9" />
            <path d="M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15" />
            <path d="M4 20v-5h5" />
          </svg>
          <span>
            <small>Pending article</small>
            <code dir="ltr">{{ route.path }}</code>
          </span>
        </div>

        <div class="article-state-actions">
          <button
            class="article-state-action article-state-action--primary"
            type="button"
            data-action="retry"
            @click="retryArticle"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M20 7v5h-5" />
              <path d="M18.4 16a8 8 0 1 1 .4-7.5L20 12" />
            </svg>
            <span>重新加载</span>
          </button>
          <RouterLink class="article-state-action" to="/space1">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m5 12 5-5m-5 5 5 5M5 12h14" />
            </svg>
            <span>返回随记</span>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.title-container {
  position: relative;
  display: flex;
  min-height: 22rem;
  align-items: flex-end;
  padding: 7rem clamp(2rem, 5vw, 5rem) 5rem;
  margin-bottom: 3rem;
  border-radius: 1rem;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  color: #fff;
}
.title-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1;
}
.header-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  text-align: left;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
}
.header-content h1 {
  margin: 0 0 1.25rem;
  color: #fff;
  font-family: "Cinzel", "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", "Noto Serif SC", serif;
  font-size: clamp(2.4rem, 3.8vw, 3.7rem);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: 0.01em;
  text-wrap: balance;
}
.header-content .meta-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.38rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: "TsangerJinKai02-W03", "仓耳今楷02 W03", "LXGW WenKai", "Noto Serif SC", serif;
  font-size: 0.96rem;
  line-height: 1.55;
}
.meta-primary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.4rem;
}
.meta-reading {
  color: rgba(255, 255, 255, 0.76);
}
/* Keep the title in the lower half without moving its layout box. */
.header-content h1,
.header-content .meta-info {
  position: relative;
  z-index: 1;
}
/* A little more contrast behind the left-aligned title on bright covers. */
.header-content::before {
  content: '';
  position: absolute;
  inset: -2rem -3rem;
  z-index: 0;
  max-width: 78rem;
  background: radial-gradient(ellipse at left, rgba(17, 17, 27, 0.3), transparent 70%);
  pointer-events: none;
}
.page-container {
  padding: 3rem 1rem;
  background-color: var(--background-color); /* 这是你的 #1e1e2e */
  min-height: 100vh;
}

.page-container:not([data-state="ready"]) {
  display: grid;
  min-height: 100dvh;
  box-sizing: border-box;
  align-items: center;
  padding: clamp(6rem, 12vh, 8rem) clamp(1rem, 4vw, 3rem) clamp(3rem, 7vh, 5rem);
}

.article-state-shell {
  --article-state-surface: #252837;
  --article-state-soft: #292c3c;
  --article-state-deep: #1c1e2a;
  --article-state-shadow-dark: rgba(8, 9, 15, 0.68);
  --article-state-shadow-light: rgba(65, 69, 94, 0.36);
  --article-state-edge: #737a94;
  --article-state-text: #eef1ff;
  --article-state-muted: #b8bfd8;
  --article-state-blue: #9fc4ff;
  --article-state-mauve: #d4b8ff;
  --article-state-display: ui-rounded, "SF Pro Rounded", "Avenir Next", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  --article-state-body: "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  --article-state-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;

  display: grid;
  width: min(100%, 48rem);
  margin: 0 auto;
  color: var(--article-state-text);
  font-family: var(--article-state-body);
}

.article-state-panel {
  width: 100%;
  box-sizing: border-box;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid rgba(115, 122, 148, 0.58);
  border-radius: clamp(1.35rem, 3vw, 2rem);
  background: var(--article-state-surface);
  box-shadow:
    -14px -14px 30px var(--article-state-shadow-light),
    16px 16px 34px var(--article-state-shadow-dark);
}

.article-state-panel--loading {
  width: min(100%, 36rem);
  justify-self: center;
}

.article-state-heading {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 1.6rem);
  align-items: center;
}

.article-state-signal {
  display: grid;
  width: clamp(4.4rem, 9vw, 5.25rem);
  aspect-ratio: 1;
  box-sizing: border-box;
  place-items: center;
  color: var(--article-state-blue);
  border: 1px solid rgba(115, 122, 148, 0.48);
  border-radius: 50%;
  background: var(--article-state-deep);
  box-shadow:
    inset 7px 7px 14px rgba(6, 7, 12, 0.74),
    inset -6px -6px 14px rgba(62, 66, 91, 0.27),
    0 0 0 0.4rem rgba(29, 31, 44, 0.58);
}

.article-state-signal--error {
  color: var(--article-state-mauve);
}

.article-state-signal svg {
  width: 68%;
  height: 68%;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-state-signal--loading svg {
  animation: article-signal-scan 3.2s linear infinite;
}

.article-state-copy {
  min-width: 0;
}

.article-state-kicker,
.article-state-path small {
  color: var(--article-state-mauve);
  font-family: var(--article-state-mono);
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.article-state-copy h1 {
  margin: 0.55rem 0 0;
  color: var(--article-state-text);
  font-family: var(--article-state-display);
  font-size: clamp(1.75rem, 4.2vw, 2.7rem);
  font-weight: 750;
  line-height: 1.17;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.article-state-copy h1:focus {
  outline: none;
}

.article-state-description {
  display: block;
  margin-top: 0.8rem;
  color: var(--article-state-muted);
  font-size: clamp(0.96rem, 1.8vw, 1.04rem);
  line-height: 1.7;
}

.article-state-description code {
  overflow-wrap: anywhere;
  color: var(--article-state-blue);
  font-family: var(--article-state-mono);
  font-size: 0.9em;
}

.article-state-path {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  margin-top: clamp(1.5rem, 4vw, 2rem);
  padding: 0.9rem 1rem;
  border: 1px solid rgba(115, 122, 148, 0.5);
  border-radius: 0.95rem;
  background: var(--article-state-deep);
  box-shadow:
    inset 5px 5px 11px rgba(6, 7, 12, 0.67),
    inset -5px -5px 11px rgba(60, 64, 88, 0.23);
}

.article-state-path > svg {
  width: 1.45rem;
  height: 1.45rem;
  color: var(--article-state-blue);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-state-path > span {
  display: grid;
  min-width: 0;
  gap: 0.3rem;
}

.article-state-path small {
  color: var(--article-state-muted);
  font-size: 0.6rem;
}

.article-state-path code {
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
  color: var(--article-state-blue);
  font-family: var(--article-state-mono);
  font-size: 0.85rem;
  line-height: 1.5;
}

.article-state-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.article-state-action {
  display: inline-flex;
  min-width: 0;
  min-height: 3.25rem;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 1rem;
  color: var(--article-state-text);
  font: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.25;
  text-decoration: none;
  border: 1px solid var(--article-state-edge);
  border-radius: 0.85rem;
  background: var(--article-state-soft);
  box-shadow:
    -5px -5px 11px rgba(66, 71, 97, 0.27),
    6px 6px 13px rgba(7, 8, 13, 0.6);
  cursor: pointer;
  transition: color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.article-state-action--primary {
  color: var(--article-state-blue);
  border-color: var(--article-state-blue);
}

.article-state-action svg {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-state-action:active {
  transform: translateY(1px);
  box-shadow:
    inset 4px 4px 9px rgba(7, 8, 13, 0.65),
    inset -4px -4px 9px rgba(66, 71, 97, 0.23);
}

.article-state-action:focus-visible {
  outline: 3px solid var(--article-state-mauve);
  outline-offset: 3px;
}

@media (hover: hover) {
  .article-state-action:hover {
    color: var(--article-state-blue);
    transform: translateY(-2px);
    box-shadow:
      -7px -7px 14px rgba(66, 71, 97, 0.33),
      8px 8px 16px rgba(7, 8, 13, 0.66);
  }
}

@keyframes article-signal-scan {
  to {
    transform: rotate(360deg);
  }
}

.main-content-area {
  display: flex;
  justify-content: flex-end; /* 修改为末端对齐 */
  gap: 2rem;
  max-width: 1500px;
  margin: 0 auto;
}
.article-wrapper {
  flex: 1;
  min-width: 0;
  max-width: 1000px;
  /* [新增] 为正文栏添加背景和圆角 */
  background-color: var(--surface-color); /* 比 #1e1e2e 稍浅的背景 */
  border-radius: 0.75rem;
  padding: 2.5rem;
}
.toc-wrapper {
  width: 260px;
  display: none;
}
@media (min-width: 1800px) {
  .header-content {
    max-width: 1600px;
  }

  .main-content-area {
    max-width: 1760px;
    justify-content: center;
    gap: 3rem;
  }

  .article-wrapper {
    max-width: 1100px;
  }

  .toc-wrapper {
    width: 300px;
  }
}

@media (min-width: 1100px) {
  .toc-wrapper {
    display: block;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.25rem 0.85rem 2rem;
  }

  .title-container {
    min-height: 20rem;
    padding: 4.2rem 1.35rem 2.8rem;
    margin-bottom: 1.6rem;
    border-radius: 0.9rem;
  }

  .title-container::before {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.34),
      rgba(0, 0, 0, 0.62)
    );
  }

  .header-content h1 {
    font-size: clamp(2.05rem, 8.5vw, 2.65rem);
    line-height: 1.16;
    margin-bottom: 0.85rem;
    text-wrap: balance;
  }

  .header-content .meta-info {
    gap: 0.3rem;
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .meta-primary {
    gap: 0.2rem 0.85rem;
  }

  .main-content-area {
    display: block;
  }

  .article-wrapper {
    padding: 1.25rem 0.95rem;
    border-radius: 0.7rem;
  }
}

@media (max-width: 420px) {
  .page-container {
    padding: 1rem 0.75rem 1.75rem;
  }

  .title-container {
    min-height: 18rem;
    padding: 3.8rem 1rem 2.4rem;
  }

  .header-content h1 {
    font-size: clamp(1.85rem, 8vw, 2.25rem);
  }

  .article-wrapper {
    padding: 0.95rem 0.75rem;
  }
}

@media (max-width: 520px) {
  .page-container:not([data-state="ready"]) {
    padding: 5.75rem max(0.85rem, env(safe-area-inset-right)) max(2.5rem, env(safe-area-inset-bottom)) max(0.85rem, env(safe-area-inset-left));
  }

  .article-state-panel {
    padding: 1.25rem;
    border-radius: 1.25rem;
    box-shadow:
      -9px -9px 20px rgba(65, 69, 94, 0.27),
      11px 11px 24px rgba(8, 9, 15, 0.62);
  }

  .article-state-heading {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .article-state-signal {
    width: 4rem;
  }

  .article-state-copy h1 {
    margin-top: 0.45rem;
    font-size: clamp(1.65rem, 8vw, 2.1rem);
  }

  .article-state-description {
    margin-top: 0.65rem;
    font-size: 0.95rem;
  }

  .article-state-path {
    margin-top: 1.2rem;
    padding: 0.75rem;
  }

  .article-state-actions {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }

  .article-state-action {
    min-height: 3.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-state-signal--loading svg {
    animation: none;
  }

  .article-state-action {
    transition: none;
  }

  .article-state-action:hover,
  .article-state-action:active {
    transform: none;
  }
}

@media (forced-colors: active) {
  .article-state-panel,
  .article-state-signal,
  .article-state-path,
  .article-state-action {
    color: CanvasText;
    border: 1px solid CanvasText;
    background: Canvas;
    box-shadow: none;
  }

  .article-state-kicker,
  .article-state-description code,
  .article-state-path > svg,
  .article-state-path code,
  .article-state-action--primary {
    color: LinkText;
  }

  .article-state-action:focus-visible {
    outline-color: Highlight;
  }
}
</style>
