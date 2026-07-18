<script setup>
// SPACE 4 · 星穹文库
// 基于 /articles.json 的文章封面页：星环漫游（3D 画廊）与时间航线（年份年表）双视图，
// 数据运行时拉取，后续新增文章自动纳入，无需改动本页。
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StarfieldBackground from '../components/space4/StarfieldBackground.vue'
import OrbitCarousel from '../components/space4/OrbitCarousel.vue'
import ChronologyAtlas from '../components/space4/ChronologyAtlas.vue'

const router = useRouter()

const articles = ref([])
const loading = ref(true)
const loadError = ref(false)
const query = ref('')

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const compactExperience = window.matchMedia('(max-width: 760px), (pointer: coarse)')
const viewMode = ref(reduced || compactExperience.matches ? 'timeline' : 'orbit')
const titleChars = [...'星穹文库']

async function loadArticles() {
  loading.value = true
  loadError.value = false
  try {
    const res = await fetch('/articles.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    articles.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('SPACE4 无法加载 articles.json:', e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const filtered = computed(() => {
  if (!normalizedQuery.value) return articles.value
  return articles.value.filter((a) =>
    [a.title, a.desc, a.author, a.date].join(' ').toLowerCase().includes(normalizedQuery.value),
  )
})

const sortedFiltered = computed(() =>
  [...filtered.value].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
)

const groups = computed(() => {
  const map = new Map()
  for (const a of sortedFiltered.value) {
    const year = String(a.date || '').slice(0, 4) || '未纪年'
    if (!map.has(year)) map.set(year, [])
    map.get(year).push(a)
  }
  return [...map.entries()]
    .sort((x, y) => y[0].localeCompare(x[0]))
    .map(([year, items]) => ({ year, items }))
})

const yearRange = computed(() => {
  const years = articles.value.map((a) => String(a.date || '').slice(0, 4)).filter(Boolean)
  if (!years.length) return '—'
  return `${Math.min(...years)}–${Math.max(...years)}`
})

const latestDate = computed(() => {
  const dates = articles.value.map((a) => String(a.date || '')).filter(Boolean)
  return dates.length ? dates.sort().at(-1) : '—'
})

const summaryText = computed(() => {
  if (loading.value) return '正在加载星图…'
  if (loadError.value) return '星图加载失败'
  if (normalizedQuery.value) return `找到 ${filtered.value.length} / ${articles.value.length} 篇`
  return `共 ${articles.value.length} 篇随记在轨`
})

const pillStyle = computed(() => ({
  transform: viewMode.value === 'timeline' ? 'translateX(100%)' : 'translateX(0)',
}))

function openArticle(article) {
  router.push(`/space1/${article.id}`)
}

function handleCompactChange(event) {
  if (event.matches && viewMode.value === 'orbit') viewMode.value = 'timeline'
}

onMounted(() => {
  compactExperience.addEventListener('change', handleCompactChange)
  loadArticles()
})

onBeforeUnmount(() => {
  compactExperience.removeEventListener('change', handleCompactChange)
})
</script>

<template>
  <main class="space4">
    <StarfieldBackground />
    <div class="s4-nebula" aria-hidden="true">
      <i class="s4-nebula__blob s4-nebula__blob--a"></i>
      <i class="s4-nebula__blob s4-nebula__blob--b"></i>
      <i class="s4-nebula__blob s4-nebula__blob--c"></i>
    </div>

    <div class="s4-content">
      <section class="s4-hero">
        <p class="s4-hero__kicker">ARTICLE OBSERVATORY · SPACE 4</p>
        <h1 class="s4-hero__title" aria-label="星穹文库">
          <span v-for="(ch, i) in titleChars" :key="i" aria-hidden="true" :style="{ '--i': i }">{{ ch }}</span>
        </h1>
        <p class="s4-hero__sub">把每一篇随记安放成一颗星辰——转动星环，或沿时间航线，换一种方式漫步全部记录。</p>
        <dl class="s4-hero__stats">
          <div class="s4-stat">
            <dt>收录文章</dt>
            <dd><span class="s4-stat__num">{{ articles.length }}</span> 篇</dd>
          </div>
          <div class="s4-stat">
            <dt>时间跨度</dt>
            <dd><span class="s4-stat__num">{{ yearRange }}</span></dd>
          </div>
          <div class="s4-stat">
            <dt>最近更新</dt>
            <dd><span class="s4-stat__num s4-stat__num--date">{{ latestDate }}</span></dd>
          </div>
        </dl>
      </section>

      <section class="s4-controls" aria-label="文章检索与视图切换">
        <label class="s4-search">
          <svg class="s4-search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M10.8 18.1a7.3 7.3 0 1 1 5.16-2.14l4.04 4.04-1.42 1.42-4.04-4.04a7.25 7.25 0 0 1-3.74 1.02Zm0-2a5.3 5.3 0 1 0 0-10.6 5.3 5.3 0 0 0 0 10.6Z"
              fill="currentColor"
            />
          </svg>
          <input v-model="query" type="search" placeholder="搜索标题、简介、作者或日期…" aria-label="搜索文章" />
          <button v-if="query" type="button" class="s4-search__clear" aria-label="清空搜索" @click="query = ''">×</button>
        </label>

        <div class="s4-seg" role="group" aria-label="切换浏览模式">
          <span class="s4-seg__pill" :style="pillStyle" aria-hidden="true"></span>
          <button type="button" :class="{ 'is-active': viewMode === 'orbit' }" :aria-pressed="viewMode === 'orbit'" @click="viewMode = 'orbit'">星环漫游</button>
          <button type="button" :class="{ 'is-active': viewMode === 'timeline' }" :aria-pressed="viewMode === 'timeline'" @click="viewMode = 'timeline'">时间航线</button>
        </div>

        <p class="s4-controls__summary" aria-live="polite">{{ summaryText }}</p>
      </section>

      <section class="s4-stage">
        <div v-if="loading" class="s4-state" role="status">
          <div class="s4-state__loader" aria-hidden="true"></div>
          <p>正在汇聚星光…</p>
        </div>

        <div v-else-if="loadError" class="s4-state" role="alert">
          <p>星图加载失败。</p>
          <button type="button" class="s4-btn" @click="loadArticles">重新加载</button>
        </div>

        <div v-else-if="!filtered.length" class="s4-state">
          <p>这片星域暂时没有匹配的星辰。</p>
          <button type="button" class="s4-btn" @click="query = ''">清空搜索</button>
        </div>

        <template v-else>
          <OrbitCarousel v-if="viewMode === 'orbit'" :articles="sortedFiltered" @activate="openArticle" />

          <ChronologyAtlas v-else :groups="groups" />
        </template>
      </section>

      <footer class="s4-foot">
        <p v-if="viewMode === 'orbit'" class="s4-foot__hint">星环可横向拖拽或触控板横滑，方向键 ← → 切换；点击或回车打开正面卡片。</p>
        <p v-else class="s4-foot__hint">沿时间航线向下浏览，年份坐标可快速跳转；移动端默认使用此模式。</p>
        <RouterLink class="s4-foot__link" to="/space1">返回经典索引 /space1</RouterLink>
      </footer>
    </div>

    <div class="s4-vignette" aria-hidden="true"></div>
  </main>
</template>

<style scoped>
.space4 {
  position: relative;
  min-height: 100dvh;
  overflow-x: clip;
  background:
    radial-gradient(1200px 800px at 78% -10%, rgba(203, 166, 247, 0.1), transparent 60%),
    radial-gradient(1000px 700px at 12% 8%, rgba(137, 180, 250, 0.1), transparent 60%),
    linear-gradient(180deg, #0a0c18 0%, #10121f 45%, #151723 100%);
  color: #e8eaf6;
}

.s4-nebula {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.s4-nebula__blob {
  position: absolute;
  display: block;
  border-radius: 50%;
  filter: blur(70px);
  animation: s4-drift 26s ease-in-out infinite alternate;
}

.s4-nebula__blob--a {
  width: 44vw;
  height: 44vw;
  left: -10vw;
  top: -8vw;
  background: rgba(137, 180, 250, 0.13);
}

.s4-nebula__blob--b {
  width: 38vw;
  height: 38vw;
  right: -8vw;
  top: 16vh;
  background: rgba(203, 166, 247, 0.12);
  animation-duration: 32s;
  animation-delay: -8s;
}

.s4-nebula__blob--c {
  width: 30vw;
  height: 30vw;
  left: 32vw;
  top: 74vh;
  background: rgba(137, 220, 235, 0.09);
  animation-duration: 38s;
  animation-delay: -16s;
}

@keyframes s4-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(4vw, 3vh, 0) scale(1.12);
  }
}

.s4-content {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 40px);
}

/* ---------- Hero ---------- */

.s4-hero {
  text-align: center;
  padding-top: clamp(118px, 17vh, 170px);
}

.s4-hero__kicker {
  margin: 0 0 14px;
  font-size: 12px;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: rgba(137, 220, 235, 0.78);
  animation: s4-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.s4-hero__title {
  margin: 0;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(3rem, 9vw, 5.2rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  background: linear-gradient(115deg, #f4f7ff 10%, #a5b8ff 48%, #cba6f7 88%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 6px 26px rgba(137, 160, 250, 0.28));
}

.s4-hero__title span {
  display: inline-block;
  animation: s4-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i) * 95ms + 120ms);
}

.s4-hero__sub {
  margin: 18px auto 0;
  max-width: 560px;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(186, 195, 230, 0.78);
  animation: s4-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both;
}

.s4-hero__stats {
  display: flex;
  justify-content: center;
  gap: clamp(26px, 6vw, 56px);
  flex-wrap: wrap;
  margin: 34px 0 0;
  animation: s4-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both;
}

.s4-stat dt {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-indent: 0.22em;
  color: rgba(148, 163, 216, 0.66);
}

.s4-stat dd {
  margin: 0;
  font-size: 14px;
  color: rgba(210, 219, 248, 0.85);
}

.s4-stat__num {
  font-size: 30px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(120deg, #cdd9ff, #89dceb);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.s4-stat__num--date {
  font-size: 22px;
}

@keyframes s4-rise {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- 控制区 ---------- */

.s4-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px 18px;
  margin-top: 40px;
  animation: s4-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.72s both;
}

.s4-search {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1 1 300px;
  max-width: 440px;
  padding: 0 14px;
  height: 44px;
  border-radius: 999px;
  background: rgba(17, 20, 36, 0.62);
  border: 1px solid rgba(148, 163, 216, 0.2);
  backdrop-filter: blur(10px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.s4-search:focus-within {
  border-color: rgba(137, 180, 250, 0.6);
  box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.14);
}

.s4-search__icon {
  width: 17px;
  height: 17px;
  flex: none;
  color: rgba(148, 163, 216, 0.75);
}

.s4-search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: #e8eaf6;
}

.s4-search input::placeholder {
  color: rgba(148, 163, 216, 0.5);
}

.s4-search__clear {
  flex: none;
  width: 44px;
  height: 44px;
  margin-right: -14px;
  border: none;
  border-radius: 50%;
  background: rgba(148, 163, 216, 0.18);
  color: #cdd6f4;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.25s ease;
}

.s4-search__clear:hover {
  background: rgba(148, 163, 216, 0.34);
}

.s4-seg {
  position: relative;
  display: flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(17, 20, 36, 0.62);
  border: 1px solid rgba(148, 163, 216, 0.2);
  backdrop-filter: blur(10px);
}

.s4-seg button {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 13.5px;
  padding: 8px 20px;
  border-radius: 999px;
  color: rgba(176, 186, 222, 0.72);
  cursor: pointer;
  transition: color 0.3s ease;
}

.s4-seg button.is-active {
  color: #0d1020;
  font-weight: 600;
}

.s4-seg__pill {
  position: absolute;
  left: 4px;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  border-radius: 999px;
  background: linear-gradient(120deg, #a5b8ff, #89dceb);
  transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.s4-controls__summary {
  flex-basis: 100%;
  margin: 2px 0 0;
  text-align: center;
  font-size: 12.5px;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 216, 0.6);
  font-variant-numeric: tabular-nums;
}

/* ---------- 舞台与状态 ---------- */

.s4-stage {
  margin-top: 26px;
  min-height: 480px;
}

.s4-state {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: rgba(176, 186, 222, 0.78);
  font-size: 14.5px;
  letter-spacing: 0.08em;
}

.s4-state__loader {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid rgba(137, 180, 250, 0.18);
  border-top-color: #a5b8ff;
  animation: s4-spin 0.9s linear infinite;
  box-shadow: 0 0 30px rgba(137, 160, 250, 0.2);
}

@keyframes s4-spin {
  to {
    transform: rotate(360deg);
  }
}

.s4-btn {
  border: 1px solid rgba(137, 180, 250, 0.45);
  background: rgba(137, 180, 250, 0.1);
  color: #cdd9ff;
  font: inherit;
  font-size: 13.5px;
  letter-spacing: 0.1em;
  padding: 9px 26px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.s4-btn:hover {
  background: rgba(137, 180, 250, 0.2);
  box-shadow: 0 0 24px rgba(137, 180, 250, 0.18);
}

/* ---------- 页脚 ---------- */

.s4-foot {
  padding: 26px 0 48px;
  text-align: center;
}

.s4-foot__hint {
  margin: 0 0 10px;
  font-size: 12.5px;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 216, 0.55);
}

.s4-foot__link {
  font-size: 12.5px;
  letter-spacing: 0.08em;
  color: rgba(137, 220, 235, 0.75);
  text-decoration: none;
  border-bottom: 1px solid rgba(137, 220, 235, 0.3);
  padding-bottom: 2px;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.s4-foot__link:hover {
  color: #89dceb;
  border-color: #89dceb;
}

.s4-vignette {
  position: fixed;
  inset: 0;
  z-index: 3;
  background: radial-gradient(ellipse 120% 90% at 50% 40%, transparent 58%, rgba(3, 4, 10, 0.4) 100%);
  pointer-events: none;
}

/* ---------- 动效降级 ---------- */

@media (prefers-reduced-motion: reduce) {
  .s4-hero__kicker,
  .s4-hero__title span,
  .s4-hero__sub,
  .s4-hero__stats,
  .s4-controls {
    animation: none;
  }

  .s4-nebula__blob {
    animation: none;
  }

  .s4-state__loader {
    animation: none;
  }

  .s4-seg__pill {
    transition: none;
  }
}

@media (max-width: 640px) {
  .s4-hero {
    padding-top: 76px;
  }

  .s4-hero__kicker {
    font-size: 10px;
    letter-spacing: 0.28em;
  }

  .s4-hero__stats {
    gap: 20px 28px;
  }

  .s4-controls {
    flex-direction: column;
  }

  .s4-search {
    width: 100%;
    max-width: none;
    flex: none;
  }

  .s4-seg {
    width: 100%;
  }

  .s4-seg button {
    flex: 1;
    min-height: 40px;
    padding-inline: 0.6rem;
  }
}
</style>
