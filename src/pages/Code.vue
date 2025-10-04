<template>
  <div class="code-projects-page">
    <header class="page-header">
      <div class="header-overlay"></div>
      <h1>代码 &amp; 项目分享</h1>
    </header>

    <!-- 说明区 -->
    <section class="intro-section" aria-label="Introduction">
      <div class="intro-card">
        <!-- <h2 class="intro-title">说 明</h2> -->
        <p class="intro-text">
          这里是我在学习与创造之旅中汇集的部分代码与项目。内容涵盖了个人独立创作的代码、主导或参与的项目，以及一些神人小巧思。所有项目基本都托管于 GitHub 。由于个人水平所限，疏漏在所难免，欢迎任何形式的交流与指正（轻喷）。
        </p>
      </div>
    </section>

    <!-- GitHub 贡献图 -->
    <section class="contrib-section" aria-label="GitHub contributions">
      <img
        src="/fig/github_user_contribution.svg"
        alt="GitHub 贡献图"
        class="contrib-img"
        loading="lazy"
      />
    </section>

    <!-- 目录区：Tabs + 搜索 + 项目网格 -->
<section class="directory-section" aria-label="项目目录">
  <!-- 工具栏：分类 + 搜索 -->
  <div class="directory-toolbar">
    <nav class="tabs" role="tablist" aria-label="Project categories">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: activeTab === t.key }"
        role="tab"
        :aria-selected="activeTab === t.key ? 'true' : 'false'"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <div class="search">
      <input
        v-model.trim="query"
        type="search"
        inputmode="search"
        class="search-input"
        placeholder="搜索名称 / 简介…"
        aria-label="Search projects"
      />
    </div>
  </div>

  <!-- 加载 / 错误 -->
  <div v-if="loading" class="hint">正在载入项目…</div>
  <div v-else-if="error" class="hint hint-error">载入失败：{{ error }}</div>

  <!-- 项目网格 -->
  <div v-else class="grid">
    <article v-for="p in filtered" :key="p.name" class="card" tabindex="0" :aria-label="p.name">
      <header class="card-head"><h3 class="card-title">{{ p.name }}</h3></header>
      <p class="card-desc">{{ p.desc }}</p>
      <footer class="card-actions">
        <a v-if="p.homepage" class="btn" :href="p.homepage" target="_blank" rel="noopener">项目主页</a>
        <a v-if="p.repo" class="btn" :href="p.repo" target="_blank" rel="noopener">托管仓库</a>
      </footer>
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

/** 载入 public/code_proj.json */
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
      category: (d.category || 'project')  // 兼容缺省
    }))
  } catch (e) {
    error.value = e && e.message ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})

/** Tabs + 搜索 */
const tabs = [
  { key: 'all',     label: '全部' },
  { key: 'code',    label: '个人代码' },
  { key: 'project', label: '项目' },
  { key: 'toy',     label: '小巧思 & 练手' }
]
const activeTab = ref('all')
const query = ref('')

/** 过滤逻辑：按 Tab + 关键词（name/desc） */
const filtered = computed(() => {
  const q = query.value.toLowerCase()
  return items.value.filter(p => {
    const matchTab = activeTab.value === 'all' ? true : p.category === activeTab.value
    const hay = `${p.name} ${p.desc}`.toLowerCase()
    const matchText = q === '' ? true : hay.includes(q)
    return matchTab && matchText
  })
})
</script>




<style scoped>
/* 1) 字体（标题用 Cinzel） */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

/* 2) 全局 reset 要用 :global，否则 scoped 作用不到 html/body */
:global(html, body){
  margin: 0;
  padding: 0;
  height: 100%;
}

/* 主题 + 英雄图路径（可改成你的） */
.code-projects-page{
  --hero-img: url('/bg/The_Promised_King_of_Stars.jpg'); /* ✅ 正确写法 */
  background-color: var(--ctp-mocha-base, #1E1E2E);
  color: var(--ctp-mocha-text, #CDD6F4);
  font-family: 'Roboto', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  min-height: 100vh;
}

/* 3) 顶部头图区：固定背景 + 居中标题 */
.page-header{
  position: relative;
  height: 75vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  /* 背景图 */
  background-image: var(--hero-img);
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* 视差感 */

  /* 防止父级外层有半透明背景叠加时影响对比 */
  isolation: isolate;
}

/* 深色滤镜：减黑一点 + 顶部径向渐变，字更清晰 */
.header-overlay{
  position: absolute; inset: 0;
  background:
    radial-gradient(1100px 420px at 50% -10%, rgba(0,0,0,.40), transparent 60%),
    linear-gradient(180deg, rgba(10,10,14,.52), rgba(10,10,14,.70));
  z-index: 0;
}

/* 4) 标题：更亮、更稳，自适应字号 */
.page-header h1{
  position: relative; z-index: 1;
  font-family: 'Cinzel', serif;
  font-size: clamp(32px, 6vw, 72px);   /* 自适应 */
  line-height: 1.1;
  letter-spacing: .06em;
  color: #F3E9C6;                      /* 亮金色，确保“看得见” */
  text-shadow:
    0 0 10px rgba(243,233,198,.36),
    0 0 22px rgba(183,189,248,.25),
    0 2px 18px rgba(0,0,0,.55);
}

/* 副内容占位 */
.content-placeholder{
  padding: 3rem 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--ctp-mocha-text, #CDD6F4);
}

/* 5) 移动端/iOS 对 fixed 支持差，降级为 scroll，避免抖动/失效 */
@media (max-device-width: 1024px){
  .page-header{ background-attachment: scroll; }
}

/* 尊重减少动效 */
@media (prefers-reduced-motion: reduce){
  .page-header h1{ text-shadow: none; }
}

/* 说明区容器 */
.intro-section{
  width: min(1100px, 92vw);
  margin: 1.6rem auto 0;
}

/* 暗底 + 细描边 + 轻微金色辉光 */
.intro-card{
  background: #313244;
  border: 1px solid #6c7086;
  border-radius: 14px;
  padding: 0.5rem 1.0rem;
  box-shadow: 0 0 0 rgba(200,170,110,0), 0 0 18px rgba(200,170,110,0.12);
}

/* “说明”二字居中 */
.intro-title{
  margin: 0 0 .6rem;
  font-size: 1.5rem;
  letter-spacing: .02em;
  color: #d9c28a;             /* Elden gold */
  text-align: center;          /* 居中 */
}

/* 正文：限制行宽、提升可读性 */
.intro-text{
  margin: 0 auto;
  max-width: 100ch;             /* 舒适行宽 */
  line-height: 1.8;
  color: #d9c28a;
  opacity: .92;
  text-align: left;
  font-family: "LXGW WenKai";
  font-size: 1.1rem;
}

/* 小屏微调 */
@media (max-width: 600px){
  .intro-card{ padding: 1rem 1.05rem; }
  .intro-title{ font-size: 1rem; }
  .intro-text{ line-height: 1.75; }
}

/* ===== GitHub 贡献图（无卡片、无边框、居中） ===== */
.code-projects-page{
  --contrib-max-width: 1100px;   /* 最大内容宽度 */
  --contrib-h-margins: 96vw;     /* 水平占宽 */
  --contrib-space-top: 0.5rem;   /* 与上文间距 */
  --contrib-space-bottom: 0.5rem;/* 与下文间距 */
}

.contrib-section{
  width: min(var(--contrib-max-width), var(--contrib-h-margins));
  margin: var(--contrib-space-top) auto var(--contrib-space-bottom) auto;
}

.contrib-img{
  display: block;     /* 去掉行内元素缝隙 */
  width: 100%;        /* 自适应宽度 */
  height: auto;       /* 保持纵横比 */
  /* 不要阴影/描边：确保“无分割痕迹” */
}

/* 小屏：稍增留白，避免拥挤 */
@media (max-width: 600px){
  .code-projects-page{
    --contrib-space-top: 1.6rem;
    --contrib-space-bottom: 1.6rem;
  }
}

/* ===== 增大 标题区 ↔ 说明区 间距（在之前基础上再拉大一点） ===== */
.intro-section{ margin-top: 3.2rem; }

/* ===== 目录区整体 ===== */
.directory-section{
  width: min(1100px, 92vw);
  margin: 2.2rem auto 0;
}

/* 工具栏布局：左 Tabs 右 搜索 */
.directory-toolbar{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: .9rem;
}
@media (max-width: 720px){
  .directory-toolbar{ grid-template-columns: 1fr; }
}

/* Tabs */
.tabs{
  display: inline-flex;
  gap: 6px;
  background: var(--ctp-mocha-surface0, #1e1e2e);
  border: 1px solid var(--ctp-mocha-surface2, #313244);
  padding: 6px;
  border-radius: 12px;
}
.tab{
  border: 1px solid transparent;
  background: transparent;
  color: var(--ctp-mocha-text, #cdd6f4);
  padding: .42rem .75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 120ms ease;
}
.tab:hover{ background: var(--ctp-mocha-surface1, #45475a40); }
.tab.active{
  background: linear-gradient(180deg, rgba(200,170,110,.16), rgba(200,170,110,.08));
  border-color: color-mix(in oklch, #c8aa6e 40%, var(--ctp-mocha-surface2, #313244));
  box-shadow: 0 0 18px rgba(200,170,110,.12);
}

/* 搜索框（与站点主题一致） */
.search{ justify-self: end; }
.search-input{
  width: min(320px, 72vw);
  background: var(--ctp-mocha-surface0, #1e1e2e);
  border: 1px solid var(--ctp-mocha-surface2, #313244);
  border-radius: 10px;
  padding: .55rem .8rem;
  color: var(--ctp-mocha-text, #cdd6f4);
  outline: none;
}
.search-input::placeholder{ opacity: .6; }
.search-input:focus{
  border-color: var(--ctp-mocha-blue, #89b4fa);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ctp-mocha-blue, #89b4fa) 24%, transparent);
}

/* 网格 + 卡片 */
.grid{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 980px){ .grid{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px){ .grid{ grid-template-columns: 1fr; } }

.card{
  background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01));
  border: 1px solid var(--ctp-mocha-surface2, #313244);
  border-radius: 14px;
  padding: .95rem;
  display: flex; flex-direction: column; gap: .55rem;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  outline: none;
}
.card:hover, .card:focus-visible{
  transform: translateY(-2px);
  border-color: color-mix(in oklch, #c8aa6e 40%, var(--ctp-mocha-surface2, #313244));
  box-shadow: 0 0 18px rgba(200,170,110,.12);
}
.card-head{ display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.card-title{ margin: 0; font-size: 1rem; color: var(--ctp-mocha-text, #CDD6F4); }
.card-desc{ opacity: .92; line-height: 1.6; }

/* 统一按钮样式：主页/仓库一致 */
.card-actions{ margin-top: .2rem; display: flex; flex-wrap: wrap; gap: 8px; }
.btn{
  font-size: .92rem;
  padding: .46rem .75rem;
  border-radius: 10px;
  border: 1px solid var(--ctp-mocha-surface2, #313244);
  background: var(--ctp-mocha-surface0, #1e1e2e);
  color: var(--ctp-mocha-text, #cdd6f4);
  text-decoration: none;
  cursor: pointer;
  transition: 120ms ease;
}
.btn:hover{
  background: var(--ctp-mocha-surface1, #45475a30);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ctp-mocha-blue, #89b4fa) 20%, transparent);
}

/* 提示 */
.hint{ opacity: .85; padding: .8rem 0; }
.hint-error{ color: var(--ctp-mocha-red, #f38ba8); }

/* ==== 页尾留白更大（最后一部分与底边的间距） ==== */
.code-projects-page { padding-bottom: 3.2rem; }
.directory-section:last-of-type { margin-bottom: 3.2rem; }

/* ==== 主题化：用你给的 :root 颜色变量重绘 ==== */

/* 分类标题用强调色 */
.catalog-title{
  color: var(--accent-color);
}

/* Tabs */
.tabs{
  background: var(--surface-color);
  border: 1px solid var(--border-color);
}
.tab{
  color: var(--text-color);
}
.tab:hover{
  background: var(--surface-color-hover);
}
.tab.active{
  /* 轻微主色叠加，不突兀 */
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--primary-color) 16%, transparent),
    transparent
  );
  border-color: color-mix(in oklch, var(--primary-color) 42%, var(--border-color));
  box-shadow: 0 0 18px color-mix(in oklch, var(--primary-color) 18%, transparent);
}

/* 搜索框 */
.search-input{
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
.search-input:focus{
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary-color) 24%, transparent);
}

/* 网格卡片 */
.card{
  background: linear-gradient(180deg,
    color-mix(in oklch, var(--surface-color) 92%, transparent),
    color-mix(in oklch, var(--surface-color) 88%, transparent)
  );
  border: 1px solid var(--border-color);
}
.card:hover,
.card:focus-visible{
  border-color: color-mix(in oklch, var(--primary-color) 42%, var(--border-color));
  box-shadow: 0 0 18px color-mix(in oklch, var(--primary-color) 18%, transparent);
}

/* 按钮（主页/仓库一致） */
.btn{
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
}
.btn:hover{
  background: var(--surface-color-hover);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary-color) 20%, transparent);
}

/* 提示颜色 */
.hint-error{
  color: var(--danger-color);
}

/* === 1) 项目标题颜色：默认 link 色，悬停/聚焦提到主色 === */
.card-title{
  color: var(--link-color);
  transition: color 120ms ease;
}
.card:hover .card-title,
.card:focus-visible .card-title{
  color: var(--primary-color);
}

/* === 2) 两个链接按钮统一：主色系实心按钮（主页/仓库一致） === */
.card-actions .btn{
  border: 1px solid color-mix(in oklch, var(--primary-color) 55%, var(--border-color));
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--primary-color) 28%, transparent),
    color-mix(in oklch, var(--primary-color) 18%, transparent)
  );
  color: var(--text-color);
}
.card-actions .btn:hover{
  border-color: var(--primary-color);
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--primary-color-hover) 34%, transparent),
    color-mix(in oklch, var(--primary-color) 24%, transparent)
  );
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary-color) 22%, transparent);
}

/* === 3) 卡片毛玻璃：暗色磨砂 + 轻描边 + 细微高光 === */
.card{
  /* 若定义了 --frosted-glass 则用它，否则退化到半透明底色 */
  background: var(--frosted-glass, rgba(24,24,32,0.55));
  backdrop-filter: blur(8px) saturate(1.12);
  -webkit-backdrop-filter: blur(8px) saturate(1.12);
  border: 1px solid color-mix(in oklch, var(--border-color) 80%, white 12%);
  box-shadow:
    0 1px 10px rgba(0,0,0,0.25),
    0 0 18px color-mix(in oklch, var(--primary-color) 10%, transparent);
}
.card:hover,
.card:focus-visible{
  border-color: color-mix(in oklch, var(--primary-color) 42%, var(--border-color));
  box-shadow:
    0 2px 16px rgba(0,0,0,0.28),
    0 0 22px color-mix(in oklch, var(--primary-color) 16%, transparent);
  transform: translateY(-2px);
}

/* 卡片正文可读性微增 */
.card-desc{ opacity: .95; }

/* === 4) 底边距略减小 === */
.code-projects-page{ padding-bottom: 2.4rem; }
.directory-section:last-of-type{ margin-bottom: 0.6rem; }
</style>