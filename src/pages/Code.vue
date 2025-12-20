<template>
  <div class="code-projects-page" ref="containerRef" @mousemove="handleMouseMove">
    
    <div class="bg-cosmos"></div>
    <div class="bg-noise"></div>

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

    <section class="contrib-section">
      <div class="contrib-wrapper">
        <img
          src="/fig/github_user_contribution.svg"
          alt="GitHub 贡献图"
          class="contrib-img"
          loading="lazy"
        />
        <div class="contrib-glow"></div>
      </div>
    </section>

    <section class="directory-section">
      <div class="directory-toolbar">
        <nav class="tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
          >
            {{ t.label }}
            <span v-if="activeTab === t.key" class="tab-glow"></span>
          </button>
        </nav>

        <div class="search-box">
          <i class="search-icon">🔍</i>
          <input
            v-model.trim="query"
            type="search"
            class="search-input"
            placeholder="搜索..."
          />
        </div>
      </div>

      <div v-if="loading" class="state-hint loading">
        <span class="loader-spin"></span> 正在载入星图数据...
      </div>
      <div v-else-if="error" class="state-hint error">载入失败：{{ error }}</div>

      <div v-else class="grid">
        <article 
          v-for="p in filtered" 
          :key="p.name" 
          class="card spotlight-card"
          tabindex="0"
        >
          <div class="spotlight-border"></div>
          
          <div class="card-inner">
            <header class="card-head">
              <h3 class="card-title">{{ p.name }}</h3>
              <span class="card-tag">{{ p.category }}</span>
            </header>
            <p class="card-desc">{{ p.desc }}</p>
            <footer class="card-actions">
              <a v-if="p.homepage" class="action-btn primary" :href="p.homepage" target="_blank">
                <span>项目主页</span>
              </a>
              <a v-if="p.repo" class="action-btn secondary" :href="p.repo" target="_blank">
                <span>GitHub</span>
              </a>
            </footer>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/** 数据状态 */
const loading = ref(true)
const error = ref(null)
const items = ref([])
const containerRef = ref(null)

/** 鼠标移动逻辑：计算聚光灯位置 */
const handleMouseMove = (e) => {
  if (!containerRef.value) return
  
  // 更新卡片的光照坐标
  const cards = containerRef.value.querySelectorAll('.spotlight-card')
  cards.forEach(card => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  })
}

/** 载入数据 */
onMounted(async () => {
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

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  return items.value.filter(p => {
    const matchTab = activeTab.value === 'all' ? true : p.category.toLowerCase() === activeTab.value.toLowerCase()
    const hay = `${p.name} ${p.desc}`.toLowerCase()
    const matchText = q === '' ? true : hay.includes(q)
    return matchTab && matchText
  })
})
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
  
  /* 全局设置 */
  width: 100%;
  min-height: 100vh;
  background-color: var(--c-bg);
  color: var(--c-text-main);
  font-family: "LXGW WenKai", system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
  isolation: isolate; /* 创建层叠上下文 */
}

/* =========================================
   背景氛围 (Atmosphere)
   ========================================= */

/* 1. 深空渐变 */
.bg-cosmos {
  position: fixed;
  inset: 0;
  z-index: -2;
  background: 
    radial-gradient(circle at 50% 0%, rgba(49, 50, 68, 0.4) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(203, 166, 247, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(137, 180, 250, 0.05) 0%, transparent 40%);
}

/* 2. 噪点纹理 (Film Grain) - 增加胶片质感 */
.bg-noise {
  position: fixed;
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
  width: min(var(--max-w), 96vw);
  margin: 4rem auto;
  display: flex;
  justify-content: center;
}

.contrib-wrapper {
  position: relative;
  padding: 10px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.contrib-img {
  width: 100%;
  display: block;
  filter: drop-shadow(0 0 8px rgba(137, 180, 250, 0.2)); /* 蓝色微光 */
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
  transition: all 0.3s ease;
  z-index: 1;
}

.tab:hover {
  color: var(--c-text-main);
}

.tab.active {
  color: #111; /* 激活时文字变深色 */
}

/* 激活背景流光 */
.tab-glow {
  position: absolute;
  inset: 0;
  background: var(--c-gold);
  z-index: -1;
  border-radius: 99px;
  box-shadow: 0 0 15px var(--c-gold);
  animation: pulse-gold 2s infinite;
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
  font-style: normal;
  opacity: 0.5;
  font-size: 0.9rem;
}
.search-input {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.7rem 1rem 0.7rem 2.4rem;
  border-radius: 12px;
  color: var(--c-text-main);
  width: 260px;
  font-family: inherit;
  transition: all 0.3s;
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  transition: transform 0.3s ease, background 0.3s;
  overflow: hidden;
  /* 默认聚光灯坐标 */
  --mouse-x: -100px;
  --mouse-y: -100px;
}

.card:hover {
  transform: translateY(-4px);
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
.card:hover .spotlight-border { opacity: 1; }

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
  transition: all 0.2s;
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
@keyframes pulse-gold {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; box-shadow: 0 0 20px var(--c-gold); }
}

/* =========================================
   响应式适配 (Responsive)
   ========================================= */
@media (max-width: 768px) {
  .hero-title { font-size: 3rem; }
  .intro-card { padding: 1.5rem; }
  .directory-toolbar { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .tabs { justify-content: center; }
  .card-actions { flex-direction: column; }
}
</style>