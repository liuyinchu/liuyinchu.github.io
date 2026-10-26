<template>
  <div class="code-projects-page">
    
    <div class="bg-cosmos" aria-hidden="true"></div>
    <div class="bg-noise" aria-hidden="true"></div>

    <header class="page-header">
      <div class="header-content">
        <h1 class="hero-title" data-text="代码 & 项目分享">代码 &amp; 项目分享</h1>
        <div class="hero-decoration"></div>
        <p class="hero-subtitle">Code, Creativity & The Cosmos</p>
      </div>
    </header>

    <section class="intro-section">
      <div class="intro-card glass-panel">
        <div class="panel-glow"></div>
        <p class="intro-text">
          这里是我在学习与创造之旅中汇集的部分代码与项目。内容涵盖了个人独立创作的代码、主导或参与的项目，以及一些神人小巧思。所有项目基本都托管于 GitHub 。由于个人水平所限，疏漏在所难免，欢迎任何形式的交流与指正。
        </p>
      </div>
    </section>

    <section class="contrib-section" aria-label="GitHub 贡献面板">
      <GitHubContributions />
    </section>

    <section class="directory-section">
      <div class="directory-toolbar">
        <nav ref="tabsElement" class="tabs" aria-label="项目分类">
          <span class="tab-indicator" :style="indicatorStyle" aria-hidden="true"></span>
          <button
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            :aria-pressed="activeTab === t.key"
            type="button"
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>
        </nav>

        <div class="search-box">
          <label for="project-search" class="sr-only">搜索项目名称或简介</label>
          <SiteIcon name="search" class="search-icon" />
          <input
            id="project-search"
            v-model.trim="query"
            type="search"
            class="search-input"
            placeholder="搜索项目名称或简介…"
            autocomplete="off"
          />
          <button v-if="query" type="button" class="search-clear" aria-label="清除搜索" @click="clearQuery">×</button>
        </div>
      </div>

      <p v-if="!loading && !error" class="results-count" role="status">找到 {{ filtered.length }} 个项目<span v-if="query"> · “{{ query }}”</span></p>

      <div ref="resultsStage" class="results-stage">
        <div v-if="loading" class="state-hint loading">
          <span class="loader-spin"></span> 正在载入星图数据...
        </div>
        <div v-else-if="error" class="state-hint error">载入失败：{{ error }}</div>

        <TransitionGroup
          v-else tag="div" name="projects" class="grid"
          @before-leave="prepareCardLeave"
          @after-leave="releaseCardLeave"
          @leave-cancelled="releaseCardLeave"
          @before-enter="releaseCardLeave"
        >
          <article
            v-for="p in filtered"
            :key="p.name"
            class="card spotlight-card"
            @pointermove="handleCardMove"
            @pointerleave="resetSpotlight"
            @pointercancel="resetSpotlight"
          >
            <div class="spotlight-border"></div>

            <div class="card-inner">
              <header class="card-head">
                <h3 class="card-title">{{ p.name }}</h3>
                <span class="card-tag">{{ p.category }}</span>
              </header>
              <p class="card-desc">{{ p.desc }}</p>
              <footer class="card-actions">
                <a v-if="p.homepage" class="action-btn primary" :href="p.homepage" target="_blank" rel="noopener noreferrer">
                  <span>项目主页</span>
                </a>
                <a v-if="p.repo" class="action-btn secondary" :href="p.repo" target="_blank" rel="noopener noreferrer">
                  <span>GitHub</span>
                </a>
              </footer>
            </div>
          </article>
        </TransitionGroup>
        <div v-if="!loading && !error && !filtered.length" class="state-hint empty-state">
          <span aria-hidden="true">⌕</span>
          <p>暂时没有匹配的项目</p>
          <small>试试其他关键词，或切换项目分类。</small>
          <button type="button" class="reset-filters" @click="resetFilters">重置筛选</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import SiteIcon from '../components/common/SiteIcon.vue'
import GitHubContributions from '../components/code/GitHubContributions.vue'

/** 数据状态 */
const loading = ref(true)
const error = ref(null)
const items = ref([])
let spotlightFrame = 0
let spotlightCard = null
let pointerPosition = null
let spotlightMedia
let motionMedia
const tabsElement = ref(null)
const resultsStage = ref(null)
const indicatorStyle = ref({})
let tabsObserver
let resultsObserver
let resultsWidth = 0
let resultsAnimation
let resultsRevision = 0
const cardLayouts = new WeakMap()

function updateTabIndicator() {
  const active = tabsElement.value?.querySelector('.tab.active')
  if (!active) return
  indicatorStyle.value = {
    width: active.offsetWidth + 'px',
    height: active.offsetHeight + 'px',
    transform: 'translate3d(' + active.offsetLeft + 'px,' + active.offsetTop + 'px,0)',
  }
}

/** Leave cards keep their measured grid slot and stop accepting focus immediately. */
function prepareCardLeave(card) {
  const layout = cardLayouts.get(card)
  if (card.contains(document.activeElement)) {
    document.getElementById('project-search')?.focus({ preventScroll: true })
  }
  if (card === spotlightCard) resetSpotlight()
  Object.assign(card.style, {
    left: layout.left + 'px', top: layout.top + 'px',
    width: layout.width + 'px', height: layout.height + 'px',
  })
  card.inert = true
  card.setAttribute('aria-hidden', 'true')
}
function releaseCardLeave(card) {
  for (const property of ['left', 'top', 'width', 'height']) card.style.removeProperty(property)
  card.inert = false
  card.removeAttribute('aria-hidden')
}

function stopResultsMotion() {
  resultsRevision += 1
  resultsAnimation?.cancel()
  resultsAnimation = null
}

/** Animate only the changing results, always returning to natural content height. */
async function animateResults() {
  resetSpotlight()
  const stage = resultsStage.value
  if (!stage || loading.value || error.value || !stage.querySelector('.grid')) return
  // Read the entire old grid before any leave hook takes cards out of its flow.
  for (const card of stage.querySelectorAll('.grid > .card')) {
    cardLayouts.set(card, {
      left: card.offsetLeft, top: card.offsetTop,
      width: card.offsetWidth, height: card.offsetHeight,
    })
  }
  const from = stage.getBoundingClientRect().height
  stopResultsMotion()
  const revision = resultsRevision
  await nextTick()
  if (revision !== resultsRevision || !stage.isConnected || motionMedia?.matches) return
  const to = stage.getBoundingClientRect().height
  if (Math.abs(from - to) < 1) return
  const animation = stage.animate([{ height: from + 'px' }, { height: to + 'px' }], {
    duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)',
  })
  resultsAnimation = animation
  animation.finished.then(() => {
    if (resultsAnimation === animation) resultsAnimation = null
  }, () => {})
}

/** One card per pointer event; coalesce style writes into the next frame. */
function handleCardMove(event) {
  if (!spotlightMedia?.matches || event.pointerType === 'touch') return
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  if (spotlightCard && spotlightCard !== card) resetSpotlight()
  spotlightCard = card
  card.classList.add('is-tracking')
  pointerPosition = {
    x: event.clientX - rect.left, y: event.clientY - rect.top,
    tiltX: (0.5 - (event.clientY - rect.top) / rect.height) * 2.4,
    tiltY: ((event.clientX - rect.left) / rect.width - 0.5) * 2.4,
  }
  if (spotlightFrame) return
  spotlightFrame = requestAnimationFrame(() => {
    spotlightFrame = 0
    if (!spotlightCard || !pointerPosition || !spotlightMedia?.matches) return
    spotlightCard.style.setProperty('--mouse-x', pointerPosition.x + 'px')
    spotlightCard.style.setProperty('--mouse-y', pointerPosition.y + 'px')
    spotlightCard.style.setProperty('--tilt-x', pointerPosition.tiltX.toFixed(2) + 'deg')
    spotlightCard.style.setProperty('--tilt-y', pointerPosition.tiltY.toFixed(2) + 'deg')
  })
}
function resetSpotlight() {
  if (spotlightFrame) cancelAnimationFrame(spotlightFrame)
  spotlightFrame = 0
  spotlightCard?.classList.remove('is-tracking')
  for (const property of ['--mouse-x', '--mouse-y', '--tilt-x', '--tilt-y']) {
    spotlightCard?.style.removeProperty(property)
  }
  spotlightCard = null
  pointerPosition = null
}
function onMotionChange() {
  if (!spotlightMedia.matches) resetSpotlight()
  if (motionMedia.matches) stopResultsMotion()
}
onBeforeUnmount(() => {
  resetSpotlight()
  stopResultsMotion()
  tabsObserver?.disconnect()
  resultsObserver?.disconnect()
  spotlightMedia?.removeEventListener('change', onMotionChange)
  motionMedia?.removeEventListener('change', onMotionChange)
})

/** 载入数据 */
onMounted(async () => {
  spotlightMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
  spotlightMedia.addEventListener('change', onMotionChange)
  motionMedia.addEventListener('change', onMotionChange)
  tabsObserver = new ResizeObserver(updateTabIndicator)
  tabsObserver.observe(tabsElement.value)
  resultsObserver = new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width
    if (resultsWidth && Math.abs(width - resultsWidth) > 1) stopResultsMotion()
    resultsWidth = width
  })
  resultsObserver.observe(resultsStage.value)
  updateTabIndicator()
  try {
    const res = await fetch('/code_proj.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    items.value = (data || []).map(d => ({
      name: (d.name || '').trim() || 'Untitled',
      desc: (d.desc || '').trim(),
      homepage: (d.homepage || '').trim(),
      repo: (d.repo || '').trim(),
      category: (d.category || 'PROJECT')
    }))
  } catch (e) {
    error.value = e && e.message ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})

/** Tabs + Search */
const tabs = [
  { key: 'all',     label: '全 部' },
  { key: 'code',    label: '代 码' },
  { key: 'project', label: '项 目' },
  { key: 'toy',     label: '巧 思' }
]
const activeTab = ref('all')
const query = ref('')
watch(activeTab, updateTabIndicator, { flush: 'post' })
async function clearQuery() {
  query.value = ''
  await nextTick()
  document.getElementById('project-search')?.focus()
}
function resetFilters() {
  activeTab.value = 'all'
  clearQuery()
}

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  return items.value.filter(p => {
    const matchTab = activeTab.value === 'all' ? true : p.category.toLowerCase() === activeTab.value.toLowerCase()
    const hay = `${p.name} ${p.desc}`.toLowerCase()
    const matchText = q === '' ? true : hay.includes(q)
    return matchTab && matchText
  })
})
watch(filtered, animateResults)
</script>

<style scoped>
/* 引入 Cinzel 字体 */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&display=swap');

/* =========================================
   核心主题变量 (Theme Variables)
   严格遵守 Catppuccin Mocha + 用户原定金色
   ========================================= */
.code-projects-page {
  /* 基础色 */
  --c-bg: #11111b;           /* 比 #1E1E2E 更深一点，作为深空底色 */
  --c-surface: #1e1e2e;      /* 原来的背景色，现在作为卡片底色 */
  --c-surface-light: #313244;
  --c-text-main: #CDD6F4;
  --c-text-dim: #a6adc8;
  
  /* 强调色 */
  --c-gold: #F3E9C6;         /* 核心高光色 */
  --c-gold-dim: #cba6f7;     /* 紫色晕染，增加神秘感 */
  --c-accent: #89b4fa;       /* 蓝色科技感 */

  /* 尺寸 */
  --max-w: 1200px;
  --header-h: 60vh;
  --page-fade: clamp(12rem, 24vw, 22rem);
  
  /* 全局设置 */
  width: 100%;
  display: flow-root;
  background: linear-gradient(180deg, var(--c-bg) 0%, var(--c-bg) calc(100% - var(--page-fade)), var(--background-color, #1e1e2e) 100%);
  color: var(--c-text-main);
  font-family: "LXGW WenKai", system-ui, sans-serif;
  position: relative;
  overflow: clip;
  isolation: isolate; /* 创建层叠上下文 */
}

/* =========================================
   背景氛围 (Atmosphere)
   ========================================= */

/* Atmosphere belongs to this page and fades at its natural content boundary. */
.bg-cosmos,
.bg-noise {
  position: absolute;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 calc(100% - var(--page-fade)), transparent 100%);
  mask-image: linear-gradient(180deg, #000 0%, #000 calc(100% - var(--page-fade)), transparent 100%);
}

/* 1. 深空渐变 */
.bg-cosmos {
  inset: 0;
  z-index: -2;
  background: 
    radial-gradient(circle at 50% 0%, rgba(49, 50, 68, 0.4) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(203, 166, 247, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(137, 180, 250, 0.05) 0%, transparent 40%);
}

/* 2. 噪点纹理 (Film Grain) - 增加胶片质感 */
.bg-noise {
  inset: 0;
  z-index: -1;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* =========================================
   头部设计 (Header)
   ========================================= */
.page-header {
  height: var(--header-h);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  /* 可以在这里加原来的大图背景，建议设为非常暗，主要靠文字发光 */
  background-image: radial-gradient(rgba(0,0,0,0), rgba(17,17,27,1)), url('/bg/The_Promised_King_of_Stars.jpg');
  background-size: cover;
  background-position: center;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* 标题：金属光泽 + 阴影 */
.hero-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.1em;
  color: var(--c-gold);
  text-shadow: 
    0 0 20px rgba(243, 233, 198, 0.3),
    0 10px 40px rgba(0, 0, 0, 0.8);
  position: relative;
}

/* 装饰线条 */
.hero-decoration {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--c-gold), transparent);
  margin-top: -10px;
}

.hero-subtitle {
  font-family: 'Cinzel', serif;
  color: var(--c-text-dim);
  font-size: 1.1rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin: 0;
  opacity: 0.8;
}

/* =========================================
   说明区 (Intro - Glassmorphism)
   ========================================= */
.intro-section {
  width: min(var(--max-w), 92vw);
  margin: -4rem auto 3rem; /* 向上重叠 Header */
  position: relative;
  z-index: 10;
}

.glass-panel {
  background: rgba(30, 30, 46, 0.6); /* 高透明度 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(243, 233, 198, 0.15); /* 金色微边框 */
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.panel-glow {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(243, 233, 198, 0.03), transparent 50%);
  pointer-events: none;
}

.intro-text {
  font-size: 1.15rem;
  line-height: 1.9;
  text-align: center; /* 居中更有仪式感 */
  max-width: 85ch;
  margin: 0 auto;
  color: var(--c-text-main);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* =========================================
   贡献图 (Contribution)
   ========================================= */
.contrib-section {
  width: min(var(--max-w), 92vw);
  margin: 4rem auto;
  display: flex;
  justify-content: center;
}

/* =========================================
   目录区 (Directory)
   ========================================= */
.directory-section {
  width: min(var(--max-w), 92vw);
  margin: 0 auto 6rem;
}

/* 工具栏：Tabs 左，Search 右 */
.directory-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Tabs: 胶囊式设计 */
.tabs {
  display: flex;
  position: relative;
  isolation: isolate;
  gap: 0.5rem;
  background: rgba(255,255,255,0.03);
  padding: 0.4rem;
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.05);
}

.tab {
  background: transparent;
  border: none;
  color: var(--c-text-dim);
  padding: 0.6rem 1.2rem;
  border-radius: 99px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  position: relative;
  overflow: hidden;
  transition: color .2s ease, transform .38s cubic-bezier(.22, 1, .36, 1);
  z-index: 1;
}

.tab:hover {
  color: var(--c-text-main);
}

.tab.active {
  color: #111; /* 激活时文字变深色 */
}

/* A single highlight carries the selection continuously between segments. */
.tab-indicator {
  position: absolute;
  left: 0;
  top: 0;
  background: var(--c-gold);
  z-index: 0;
  border-radius: 99px;
  box-shadow: 0 0 15px rgba(243, 233, 198, .38);
  opacity: .95;
  pointer-events: none;
  transition: transform .42s cubic-bezier(.22, 1, .36, 1), width .42s cubic-bezier(.22, 1, .36, 1), height .42s cubic-bezier(.22, 1, .36, 1);
}

/* 搜索框：极简 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  width: 1rem;
  height: 1rem;
  opacity: 0.5;
  font-size: 0.9rem;
}
.search-input {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.7rem 1rem 0.7rem 2.4rem;
  border-radius: 12px;
  color: var(--c-text-main);
  width: 290px;
  padding-right: 2.6rem;
  font-family: inherit;
  transition: border-color .25s ease, background .25s ease, box-shadow .25s ease;
}
.search-input:focus {
  outline: none;
  border-color: var(--c-gold);
  background: rgba(0,0,0,0.4);
  box-shadow: 0 0 0 2px rgba(243, 233, 198, 0.1);
}

/* =========================================
   卡片核心设计 (Card Spotlight System)
   ========================================= */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  position: relative;
  gap: 20px;
}

.card {
  background-color: rgba(30, 30, 46, 0.4);
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: default;
  transition: background .3s ease, border-color .3s ease;
  overflow: hidden;
  /* 默认聚光灯坐标 */
  --mouse-x: -100px;
  --mouse-y: -100px;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
}

.card:hover {
  background-color: rgba(30, 30, 46, 0.6);
}

/* 聚光灯边框光效 */
.spotlight-border {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
  /* 径向渐变跟随鼠标 */
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y), 
    rgba(243, 233, 198, 0.15), 
    transparent 40%
  );
}


.card-inner {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.card-title {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-gold);
  line-height: 1.2;
  padding: 5px 10px;
}

.card-tag {
  font-size: 0.7rem;
  padding: 3px 8px;
  border: 1px solid var(--c-gold-dim);
  color: var(--c-gold-dim);
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--c-text-dim);
  margin-bottom: 1.5rem;
  flex: 1;
}

/* 按钮组 */
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 0.6rem 0;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  transition: color .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease, transform .38s cubic-bezier(.22, 1, .36, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主按钮 (项目主页) - 金色实心 */
.action-btn.primary {
  background: linear-gradient(135deg, rgba(243, 233, 198, 0.1), rgba(243, 233, 198, 0.05));
  border: 1px solid rgba(243, 233, 198, 0.2);
  color: var(--c-gold);
}
.action-btn.primary:hover {
  background: var(--c-gold);
  color: #111;
  box-shadow: 0 0 15px rgba(243, 233, 198, 0.4);
}

/* 次按钮 (Github) - 幽灵按钮 */
.action-btn.secondary {
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--c-text-dim);
}
.action-btn.secondary:hover {
  border-color: var(--c-text-main);
  color: var(--c-text-main);
  background: rgba(255, 255, 255, 0.05);
}

/* =========================================
   状态提示 (States)
   ========================================= */
.state-hint {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--c-text-dim);
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 12px;
}
.state-hint.error { color: #f38ba8; } /* Catppuccin Red */

/* 加载动画 */
.loader-spin {
  display: inline-block;
  width: 1rem; height: 1rem;
  border: 2px solid var(--c-gold);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }


/* =========================================
   响应式适配 (Responsive)
   ========================================= */
@media (min-width: 1800px) {
  .code-projects-page {
    --max-w: 1760px;
  }

  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.75rem;
  }
}

@media (max-width: 768px) {
  .code-projects-page { --header-h: min(58svh, 28rem); }
  .page-header { min-height: 21rem; padding-inline: 1rem; box-sizing: border-box; }
  .hero-title {
    max-width: 100%;
    font-size: clamp(2rem, 10vw, 3rem);
    line-height: 1.15;
    letter-spacing: 0.03em;
    overflow-wrap: anywhere;
  }
  .hero-subtitle { max-width: 100%; font-size: 0.8rem; letter-spacing: 0.14em; }
  .intro-section,
  .directory-section,
  .contrib-section { width: calc(100% - 1rem); }
  .intro-section { margin-top: -2.5rem; }
  .intro-card { padding: 1.25rem; }
  .intro-text { font-size: 1rem; line-height: 1.75; text-align: left; }
  .contrib-section { margin: 2.5rem auto; }
  .directory-toolbar { flex-direction: column; align-items: stretch; }
  .tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.25rem;
    width: 100%;
    box-sizing: border-box;
    border-radius: 18px;
  }
  .tab {
    min-width: 0;
    min-height: 44px;
    padding: 0.55rem 0.2rem;
    font-size: 0.82rem;
    white-space: nowrap;
  }
  .search-box { width: 100%; }
  .search-input { width: 100%; min-height: 44px; box-sizing: border-box; font-size: 1rem; }
  .grid { grid-template-columns: minmax(0, 1fr); }
  .card-head { gap: 0.5rem; }
  .card-title { min-width: 0; padding-left: 0; overflow-wrap: anywhere; }
  .card-tag { flex: 0 0 auto; }
  .card-actions { flex-direction: column; }
  .action-btn { min-height: 44px; }
}

@media (max-width: 950px) and (max-height: 520px) and (orientation: landscape) {
  .code-projects-page { --header-h: min(78svh, 19rem); }
  .page-header { min-height: 16rem; }
  .header-content { gap: 0.75rem; }
  .hero-title { font-size: clamp(2.4rem, 7vw, 4rem); }
  .hero-subtitle { font-size: 0.78rem; letter-spacing: 0.16em; }
  .intro-section { margin-top: -2rem; }
}

.results-count { margin: -1rem 0 1.5rem; font-size: .8rem; color: var(--c-text-dim); min-height: 1.3rem; }
.results-count > span { opacity: .8; overflow-wrap: anywhere; }
.search-clear { position: absolute; right: 5px; width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--c-text-dim); font: 1.25rem/1 system-ui,sans-serif; cursor: pointer; }
.search-clear:hover { background: #cba6f71a; color: var(--c-gold); }
.search-input::-webkit-search-cancel-button { display: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.code-projects-page :is(button,a):focus-visible { outline: 2px solid var(--c-gold); outline-offset: 4px; }
.card:focus-within { border-color: #cba6f760; background: rgba(30,30,46,.7); }
.empty-state { display: flex; align-items: center; flex-direction: column; gap: .8rem; background: #1e1e2e55; }
.empty-state > span { font-size: 2rem; color: var(--c-gold-dim); }
.empty-state p { margin: 0; color: var(--c-gold); }
.empty-state small { font-size: .85rem; }
.reset-filters { margin-top: .3rem; padding: .6rem 1.1rem; border: 1px solid #cba6f74d; border-radius: 7px; color: var(--c-gold); background: #cba6f70d; font: inherit; font-size: .85rem; cursor: pointer; }
.results-stage { position: relative; }
.projects-enter-active { transition: opacity .32s ease, transform .42s cubic-bezier(.22, 1, .36, 1); }
.projects-leave-active { position: absolute; pointer-events: none; transition: opacity .18s ease, transform .22s ease; }
.projects-enter-from { opacity: 0; transform: translateY(12px) scale(.985); }
.projects-leave-to { opacity: 0; transform: translateY(4px) scale(.985); }
.projects-move { transition: transform .42s cubic-bezier(.22, 1, .36, 1); }
.tab:active, .action-btn:active, .reset-filters:active, .search-clear:active { transform: scale(.96); }
.reset-filters, .search-clear { transition: transform .38s cubic-bezier(.22, 1, .36, 1), background .2s ease; }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .card-inner { transition: transform .5s cubic-bezier(.22, 1, .36, 1); transform-origin: center; }
  .card.is-tracking .card-inner {
    transform: perspective(900px) translateY(-2px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
    transition-duration: .12s;
  }
  .card:hover { border-color: rgba(243, 233, 198, .19); }
  .card:hover .spotlight-border { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  .spotlight-border { display: none; }
  .card-inner, .projects-enter-from, .projects-leave-to { transform: none !important; }
  .tab:active, .action-btn:active, .reset-filters:active, .search-clear:active { transform: none; }
}
</style>
