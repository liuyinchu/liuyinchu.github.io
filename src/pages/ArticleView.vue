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

const stateInstrument = computed(() => {
  const states = {
    loading: {
      code: 'SCAN',
      tab: 'LIVE',
      caption: 'Locating folio',
      readout: 'Seeking',
      channel: 'Index 01'
    },
    'not-found': {
      code: '404',
      tab: 'LOST',
      caption: 'Folio not indexed',
      readout: 'No match',
      channel: 'Space 01'
    },
    error: {
      code: 'ERR',
      tab: 'LINK',
      caption: 'Archive link lost',
      readout: 'Offline',
      channel: 'Retry'
    }
  }

  return states[status.value] || states.loading
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
      <section class="article-state-panel" :class="`article-state-panel--${status}`">
        <div class="article-state-instrument" aria-hidden="true">
          <div class="article-state-unit-label">
            <span class="article-state-led"></span>
            <span>Folio recovery unit</span>
          </div>

          <div class="article-state-folio-well">
            <div class="article-state-folio-card">
              <span class="article-state-folio-tab">{{ stateInstrument.tab }}</span>
              <span class="article-state-folio-index">Archive / 01</span>
              <strong class="article-state-folio-code">{{ stateInstrument.code }}</strong>

              <svg
                class="article-state-folio-icon"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <g v-if="status === 'loading'" class="article-state-scan-glyph">
                  <circle cx="32" cy="32" r="19" />
                  <path d="M32 13a19 19 0 0 1 16.5 9.5M32 32l13-9" />
                  <circle cx="32" cy="32" r="3.5" />
                </g>
                <g v-else-if="status === 'not-found'">
                  <path d="M18 8h20l9 9v18M38 8v10h9M18 8v48h20" />
                  <circle cx="45" cy="45" r="9" />
                  <path d="m51.5 51.5 6 6M41.5 45h7" />
                </g>
                <g v-else>
                  <path d="M15 43h31a10 10 0 0 0 1.5-19.9A17 17 0 0 0 16 18.5 12.5 12.5 0 0 0 15 43Z" />
                  <path d="m24 29 15 14m0-14L24 43" />
                </g>
              </svg>

              <span class="article-state-folio-trace">
                <i></i><i></i><i></i>
              </span>
              <span class="article-state-folio-caption">{{ stateInstrument.caption }}</span>
            </div>
          </div>

          <div class="article-state-telemetry">
            <span><small>Status</small>{{ stateInstrument.readout }}</span>
            <span><small>Channel</small>{{ stateInstrument.channel }}</span>
          </div>
        </div>

        <div class="article-state-content">
          <section
            v-if="status === 'loading'"
            class="article-state-body"
            data-article-loading
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span class="article-state-kicker">
              <svg class="article-state-kicker-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v5l3 2" />
              </svg>
              Article · locating signal
            </span>
            <h1>正在定位文章…</h1>
            <p class="article-state-description">正在读取文章索引，请稍候。</p>
            <div class="article-state-progress" aria-hidden="true"><span></span></div>
          </section>

          <section
            v-else-if="status === 'not-found'"
            class="article-state-body"
            data-article-not-found
            aria-labelledby="article-not-found-title"
            aria-describedby="article-not-found-description"
          >
            <span class="article-state-kicker">
              <svg class="article-state-kicker-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" />
                <path d="M14 2v6h6" />
                <path d="m9.5 13 5 5m0-5-5 5" />
              </svg>
              Article · signal lost
            </span>
            <h1 id="article-not-found-title" ref="stateHeadingRef" tabindex="-1">
              这篇文章暂时不在这里
            </h1>
            <p id="article-not-found-description" class="article-state-description">
              没有找到“<code>{{ articleId }}</code>”对应的文章。它可能已被移动、重命名，或尚未发布。
            </p>

            <div class="article-state-path">
              <svg class="article-state-path-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5" />
                <path d="M14 2v6h6v3" />
                <circle cx="17" cy="17" r="3" />
                <path d="M17 12v2M17 20v2M12 17h2M20 17h2" />
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
            class="article-state-body"
            data-article-error
            role="alert"
            aria-labelledby="article-error-title"
            aria-describedby="article-error-description"
          >
            <span class="article-state-kicker">
              <svg class="article-state-kicker-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12a8 8 0 0 1 13.7-5.6L20 9" />
                <path d="M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15" />
              </svg>
              Article · connection interrupted
            </span>
            <h1 id="article-error-title" ref="stateHeadingRef" tabindex="-1">
              文章索引暂时无法读取
            </h1>
            <p id="article-error-description" class="article-state-description">
              {{ loadError }}文章地址本身未必有误，你可以重新尝试连接。
            </p>

            <div class="article-state-path">
              <svg class="article-state-path-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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

/* Lost Folio Console: tactile archive recovery states. */
.article-state-shell {
  width: min(100%, 68rem);
}

.article-state-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(17rem, 0.88fr) minmax(0, 1.12fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  width: 100%;
  padding: clamp(1.1rem, 2.5vw, 1.6rem);
  border: 0;
  border-radius: clamp(1.7rem, 3vw, 2.4rem);
  background:
    radial-gradient(circle at 1.25rem 1.25rem, #171923 0 0.2rem, #4a4f67 0.23rem 0.31rem, transparent 0.34rem),
    radial-gradient(circle at calc(100% - 1.25rem) 1.25rem, #171923 0 0.2rem, #4a4f67 0.23rem 0.31rem, transparent 0.34rem),
    radial-gradient(circle at 1.25rem calc(100% - 1.25rem), #171923 0 0.2rem, #4a4f67 0.23rem 0.31rem, transparent 0.34rem),
    radial-gradient(circle at calc(100% - 1.25rem) calc(100% - 1.25rem), #171923 0 0.2rem, #4a4f67 0.23rem 0.31rem, transparent 0.34rem),
    linear-gradient(145deg, #2e3142, #242735);
  box-shadow:
    -20px -20px 42px rgba(66, 71, 96, 0.29),
    22px 22px 48px rgba(7, 8, 13, 0.72),
    inset 1px 1px 0 rgba(255, 255, 255, 0.055),
    inset -1px -1px 0 rgba(0, 0, 0, 0.35);
}

.article-state-panel--loading {
  width: 100%;
}

.article-state-instrument {
  display: grid;
  min-width: 0;
  gap: 1rem;
  padding: clamp(1rem, 2vw, 1.35rem);
  border-radius: 1.55rem;
  background: #252836;
  box-shadow:
    inset 10px 10px 22px rgba(7, 8, 13, 0.74),
    inset -8px -8px 19px rgba(65, 70, 95, 0.2);
}

.article-state-unit-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.55rem;
  color: #b8bfd8;
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.article-state-led {
  width: 0.5rem;
  height: 0.5rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--article-state-blue);
  box-shadow:
    0 0 0 0.28rem rgba(159, 196, 255, 0.09),
    0 0 0.75rem rgba(159, 196, 255, 0.48);
}

.article-state-panel--not-found .article-state-led {
  background: var(--article-state-mauve);
  box-shadow:
    0 0 0 0.28rem rgba(212, 184, 255, 0.09),
    0 0 0.75rem rgba(212, 184, 255, 0.45);
}

.article-state-panel--error .article-state-led {
  background: #d9a7c7;
  box-shadow: 0 0 0 0.28rem rgba(217, 167, 199, 0.08);
}

.article-state-folio-well {
  display: grid;
  min-height: 16.25rem;
  box-sizing: border-box;
  place-items: center;
  padding: 1.3rem;
  border-radius: 1.3rem;
  background: #1b1e2a;
  box-shadow:
    inset 12px 12px 25px rgba(7, 8, 13, 0.79),
    inset -9px -9px 20px rgba(65, 70, 95, 0.18),
    0 0 0 1px rgba(115, 122, 148, 0.16);
}

.article-state-folio-card {
  position: relative;
  width: min(80%, 13.25rem);
  aspect-ratio: 0.84;
  box-sizing: border-box;
  padding: 1.25rem 1.2rem 1rem 1.65rem;
  color: #2d3040;
  border-radius: 1rem 1rem 0.82rem 0.82rem;
  background: linear-gradient(145deg, #e1dacb, #bcb5a8);
  box-shadow:
    -8px -8px 17px rgba(72, 77, 101, 0.23),
    11px 13px 22px rgba(5, 6, 10, 0.66),
    inset 1px 1px 0 rgba(255, 255, 255, 0.55),
    inset -2px -2px 3px rgba(79, 73, 66, 0.24);
  transform: rotate(-1.5deg);
}

.article-state-folio-card::before {
  position: absolute;
  top: 1.25rem;
  left: 0.58rem;
  width: 0.34rem;
  height: 0.34rem;
  border-radius: 50%;
  background: #8e887e;
  box-shadow:
    inset 1px 1px 2px rgba(68, 63, 58, 0.62),
    inset -1px -1px 2px rgba(255, 255, 255, 0.45),
    0 2.5rem #8e887e,
    0 5rem #8e887e;
  content: "";
}

.article-state-folio-card::after {
  position: absolute;
  top: 0.9rem;
  bottom: 0.9rem;
  left: 1.18rem;
  width: 1px;
  background: rgba(84, 78, 71, 0.2);
  content: "";
}

.article-state-folio-tab {
  position: absolute;
  top: -0.7rem;
  right: 0.9rem;
  min-width: 3.25rem;
  padding: 0.38rem 0.6rem 0.32rem;
  color: #252836;
  font-family: var(--article-state-mono);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-align: center;
  border-radius: 0.55rem 0.55rem 0 0;
  background: #c8b0e6;
  box-shadow:
    -3px -3px 7px rgba(71, 76, 98, 0.19),
    5px 5px 9px rgba(7, 8, 13, 0.42);
}

.article-state-folio-index {
  display: block;
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.article-state-folio-code {
  display: block;
  margin-top: 0.85rem;
  font-family: var(--article-state-mono);
  font-size: clamp(2.7rem, 5vw, 3.65rem);
  font-weight: 850;
  line-height: 0.95;
  letter-spacing: -0.075em;
  text-shadow:
    -1px -1px 0 rgba(255, 255, 255, 0.42),
    2px 2px 2px rgba(76, 70, 63, 0.24);
}

.article-state-folio-icon {
  position: absolute;
  top: 5rem;
  right: 1.05rem;
  width: 4.35rem;
  height: 4.35rem;
  color: #455675;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-state-panel--error .article-state-folio-icon {
  color: #704d67;
}

.article-state-folio-trace {
  position: absolute;
  right: 1.05rem;
  bottom: 3.25rem;
  left: 1.65rem;
  display: grid;
  gap: 0.4rem;
}

.article-state-folio-trace i {
  display: block;
  height: 2px;
  border-radius: 999px;
  background: rgba(63, 66, 82, 0.32);
  box-shadow: 0 1px rgba(255, 255, 255, 0.28);
}

.article-state-folio-trace i:nth-child(2) {
  width: 78%;
}

.article-state-folio-trace i:nth-child(3) {
  width: 54%;
}

.article-state-folio-caption {
  position: absolute;
  right: 1.05rem;
  bottom: 1.1rem;
  left: 1.65rem;
  font-family: var(--article-state-mono);
  font-size: 0.55rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article-state-telemetry {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.article-state-telemetry > span {
  display: grid;
  min-width: 0;
  gap: 0.18rem;
  padding: 0.62rem 0.68rem;
  color: var(--article-state-text);
  font-family: var(--article-state-mono);
  font-size: 0.7rem;
  border-radius: 0.7rem;
  background: #292c3b;
  box-shadow:
    -4px -4px 8px rgba(66, 71, 96, 0.2),
    5px 5px 10px rgba(7, 8, 13, 0.52);
}

.article-state-telemetry small {
  color: var(--article-state-muted);
  font-size: 0.54rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.article-state-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: clamp(0.75rem, 2vw, 1.4rem) clamp(0.5rem, 1.5vw, 1rem) clamp(0.75rem, 2vw, 1.4rem) 0;
}

.article-state-body {
  min-width: 0;
}

.article-state-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  color: var(--article-state-mauve);
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.article-state-kicker svg {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.article-state-body h1 {
  margin: 0.85rem 0 0;
  color: var(--article-state-text);
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", "Noto Serif SC", serif;
  font-size: clamp(2.05rem, 3.5vw, 2.85rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.01em;
  text-wrap: balance;
}

.article-state-body h1:focus {
  outline: none;
}

.article-state-body h1:focus-visible {
  padding-left: 0.75rem;
  outline: none;
  box-shadow: inset 0.2rem 0 var(--article-state-mauve);
}

.article-state-description {
  margin: 1rem 0 0;
  color: var(--article-state-muted);
  font-size: clamp(0.98rem, 1.7vw, 1.06rem);
  line-height: 1.78;
}

.article-state-path {
  margin-top: clamp(1.5rem, 3vw, 2rem);
  border: 0;
  border-radius: 1rem;
  background: #1c1f2b;
  box-shadow:
    inset 7px 7px 15px rgba(6, 7, 12, 0.74),
    inset -6px -6px 13px rgba(62, 66, 91, 0.21),
    0 0 0 1px rgba(115, 122, 148, 0.18);
}

.article-state-path > svg {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  stroke-width: 1.75;
}

.article-state-actions {
  gap: 0.9rem;
  margin-top: 1.35rem;
}

.article-state-action {
  min-height: 3.35rem;
  border: 1px solid #747c98;
  border-radius: 0.95rem;
  background: linear-gradient(145deg, #303445, #272a39);
  box-shadow:
    -6px -6px 13px rgba(67, 72, 98, 0.27),
    7px 7px 15px rgba(7, 8, 13, 0.65),
    inset 1px 1px 0 rgba(255, 255, 255, 0.04);
}

.article-state-action--primary {
  color: #bed7ff;
  border-color: #7998c6;
  background: linear-gradient(145deg, #33435c, #29364c);
}

.article-state-action:active {
  box-shadow:
    inset 5px 5px 11px rgba(7, 8, 13, 0.72),
    inset -4px -4px 10px rgba(66, 78, 105, 0.25);
}

.article-state-progress {
  height: 0.72rem;
  margin-top: 1.75rem;
  padding: 0.18rem;
  border-radius: 999px;
  background: #1b1e2a;
  box-shadow:
    inset 4px 4px 8px rgba(6, 7, 12, 0.75),
    inset -3px -3px 7px rgba(62, 66, 91, 0.2);
}

.article-state-progress span {
  display: block;
  width: 34%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #819fcf, #c6a8ea);
  box-shadow: 0 0 0.7rem rgba(159, 196, 255, 0.25);
  animation: article-progress-search 1.8s ease-in-out infinite alternate;
}

.article-state-scan-glyph {
  transform-origin: 32px 32px;
  animation: article-folio-scan 3.2s linear infinite;
}

.article-state-panel--loading .article-state-led {
  animation: article-led-breathe 1.8s ease-in-out infinite alternate;
}

@keyframes article-folio-scan {
  to {
    transform: rotate(360deg);
  }
}

@keyframes article-progress-search {
  to {
    width: 78%;
    transform: translateX(22%);
  }
}

@keyframes article-led-breathe {
  to {
    opacity: 0.52;
    box-shadow: 0 0 0 0.4rem rgba(159, 196, 255, 0.05);
  }
}

@media (max-width: 860px) {
  .article-state-shell {
    width: min(100%, 43rem);
  }

  .article-state-panel {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .article-state-folio-well {
    min-height: 13.5rem;
  }

  .article-state-folio-card {
    width: min(68%, 11.25rem);
  }

  .article-state-folio-code {
    font-size: 2.8rem;
  }

  .article-state-folio-icon {
    top: 4.4rem;
    width: 3.7rem;
    height: 3.7rem;
  }

  .article-state-content {
    padding: 0.75rem 0.65rem 1rem;
  }
}

@media (min-width: 620px) and (max-width: 860px) {
  .page-container:not([data-state="ready"]) {
    padding-top: 4rem;
    padding-bottom: 3rem;
  }

  .article-state-panel {
    grid-template-columns: minmax(14.25rem, 0.78fr) minmax(0, 1.22fr);
    gap: 1rem;
    padding: 1rem;
  }

  .article-state-instrument {
    gap: 0.7rem;
    padding: 0.85rem;
  }

  .article-state-folio-well {
    min-height: 11.5rem;
    padding: 0.8rem;
  }

  .article-state-folio-card {
    width: min(78%, 9.25rem);
  }

  .article-state-folio-code {
    font-size: 2.35rem;
  }

  .article-state-folio-icon {
    top: 3.65rem;
    right: 0.75rem;
    width: 3.05rem;
    height: 3.05rem;
  }

  .article-state-folio-trace {
    right: 0.8rem;
    bottom: 2.65rem;
    left: 1.4rem;
  }

  .article-state-folio-caption {
    right: 0.8rem;
    left: 1.4rem;
  }

  .article-state-telemetry > span {
    padding: 0.5rem 0.55rem;
  }

  .article-state-content {
    padding: 0.5rem 0.25rem;
  }

  .article-state-body h1 {
    margin-top: 0.65rem;
    font-size: clamp(1.85rem, 4.7vw, 2.05rem);
  }

  .article-state-description {
    margin-top: 0.65rem;
    font-size: 0.94rem;
    line-height: 1.58;
  }

  .article-state-path {
    grid-template-columns: 1.05rem minmax(0, 1fr);
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.7rem 0.55rem;
  }

  .article-state-path > svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  .article-state-path code {
    min-width: 0;
    overflow: hidden;
    font-size: 0.72rem;
    letter-spacing: -0.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .article-state-actions {
    gap: 0.65rem;
    margin-top: 0.9rem;
  }

  .article-state-action {
    min-height: 3.1rem;
    padding-inline: 0.7rem;
  }
}

@media (max-width: 520px) {
  .page-container:not([data-state="ready"]) {
    padding-top: 3rem;
  }

  .article-state-panel {
    gap: 1rem;
    padding: 0.85rem;
    border-radius: 1.45rem;
    box-shadow:
      -10px -10px 23px rgba(66, 71, 96, 0.25),
      12px 12px 27px rgba(7, 8, 13, 0.69);
  }

  .article-state-instrument {
    gap: 0.8rem;
    padding: 0.9rem;
    border-radius: 1.15rem;
  }

  .article-state-folio-well {
    min-height: 12.25rem;
    padding: 1rem;
  }

  .article-state-folio-card {
    width: min(72%, 9.8rem);
  }

  .article-state-folio-code {
    margin-top: 0.65rem;
    font-size: 2.35rem;
  }

  .article-state-folio-icon {
    top: 3.85rem;
    width: 3.2rem;
    height: 3.2rem;
  }

  .article-state-folio-trace {
    bottom: 2.85rem;
  }

  .article-state-content {
    padding: 0.65rem 0.35rem 0.75rem;
  }

  .article-state-body h1 {
    margin-top: 0.65rem;
    font-size: clamp(1.85rem, 9vw, 2.35rem);
  }

  .article-state-description {
    margin-top: 0.75rem;
    font-size: 0.95rem;
    line-height: 1.68;
  }

  .article-state-path {
    grid-template-columns: 1.05rem minmax(0, 1fr);
    gap: 0.5rem;
    margin-top: 1.15rem;
    padding: 0.7rem 0.55rem;
  }

  .article-state-path > svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  .article-state-path code {
    min-width: 0;
    overflow: hidden;
    font-size: 0.72rem;
    letter-spacing: -0.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .article-state-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.72rem;
    margin-top: 1rem;
  }
}

@media (max-width: 360px) {
  .page-container:not([data-state="ready"]) {
    padding: 1rem max(0.75rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
  }

  .article-state-panel {
    gap: 0.65rem;
    padding: 0.65rem;
  }

  .article-state-instrument {
    gap: 0;
    padding: 0.7rem;
  }

  .article-state-unit-label,
  .article-state-telemetry {
    display: none;
  }

  .article-state-folio-well {
    min-height: 8.6rem;
    padding: 0.7rem;
  }

  .article-state-folio-card {
    width: 7.1rem;
    padding: 0.85rem 0.75rem 0.7rem 1.2rem;
  }

  .article-state-folio-card::before {
    top: 0.85rem;
    left: 0.42rem;
    box-shadow:
      inset 1px 1px 2px rgba(68, 63, 58, 0.62),
      inset -1px -1px 2px rgba(255, 255, 255, 0.45),
      0 1.7rem #8e887e,
      0 3.4rem #8e887e;
  }

  .article-state-folio-card::after {
    top: 0.6rem;
    bottom: 0.6rem;
    left: 0.88rem;
  }

  .article-state-folio-tab {
    top: -0.48rem;
    right: 0.55rem;
    min-width: 2.6rem;
    padding: 0.27rem 0.4rem 0.23rem;
    font-size: 0.48rem;
  }

  .article-state-folio-index {
    font-size: 0.44rem;
  }

  .article-state-folio-code {
    margin-top: 0.45rem;
    font-size: 1.75rem;
  }

  .article-state-folio-icon {
    top: 2.75rem;
    right: 0.55rem;
    width: 2.45rem;
    height: 2.45rem;
  }

  .article-state-folio-trace {
    right: 0.6rem;
    bottom: 2rem;
    left: 1.2rem;
    gap: 0.25rem;
  }

  .article-state-folio-caption {
    right: 0.55rem;
    bottom: 0.62rem;
    left: 1.2rem;
    font-size: 0.42rem;
  }

  .article-state-content {
    padding: 0.45rem 0.25rem 0.55rem;
  }

  .article-state-kicker {
    gap: 0.36rem;
    font-size: 0.6rem;
  }

  .article-state-kicker svg {
    width: 0.95rem;
    height: 0.95rem;
  }

  .article-state-body h1 {
    margin-top: 0.5rem;
    font-size: 1.7rem;
  }

  .article-state-description {
    margin-top: 0.55rem;
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .article-state-path {
    display: none;
  }

  .article-state-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.52rem;
    margin-top: 0.8rem;
  }

  .article-state-action {
    min-height: 3rem;
    gap: 0.4rem;
    padding: 0.62rem 0.55rem;
    font-size: 0.84rem;
  }

  .article-state-action svg {
    width: 1.05rem;
    height: 1.05rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-state-scan-glyph,
  .article-state-panel--loading .article-state-led,
  .article-state-progress span {
    animation: none;
  }
}

@media (forced-colors: active) {
  .article-state-panel,
  .article-state-instrument,
  .article-state-folio-well,
  .article-state-folio-card,
  .article-state-telemetry > span,
  .article-state-path,
  .article-state-action,
  .article-state-progress {
    color: CanvasText;
    border: 1px solid CanvasText;
    background: Canvas;
    box-shadow: none;
  }

  .article-state-folio-tab,
  .article-state-action--primary {
    color: LinkText;
    border: 1px solid LinkText;
    background: Canvas;
  }

  .article-state-folio-trace,
  .article-state-folio-card::before,
  .article-state-folio-card::after {
    display: none;
  }

  .article-state-body h1:focus-visible {
    padding-inline-start: 0;
    outline: 2px solid Highlight;
    outline-offset: 0.35rem;
    box-shadow: none;
  }
}
</style>
