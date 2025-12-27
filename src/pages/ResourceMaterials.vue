<template>
  <div class="resource-detail-wrapper">
    <div class="ambient-background">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="noise-overlay"></div>
    </div>
    <nav class="nav-bar relative-layer">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span> 
        <span class="back-text">INDEX</span>
      </button>
      <h1 class="header-title">{{ PAGE_CONFIG.title }}</h1>
      <div class="header-placeholder"></div>
    </nav>

    <div class="content-container relative-layer">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>数据加载中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <div v-else class="resource-stream">
        <div 
          v-for="(item, index) in items" 
          :key="item.idx" 
          class="resource-card"
          :class="{ 'is-clickable': item.url }"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="handleCardClick(item)"
        >
          <div v-if="item.url" class="active-indicator"></div>

          <div class="card-main">
            <div class="card-header-row">
              <div class="title-group">
                <span class="idx-badge">{{ formatIdx(item.idx) }}</span>
                <h2 class="resource-name">{{ item.name }}</h2>
              </div>
              <div v-if="item.url" class="link-icon-hint"></div>
            </div>

            <div 
              v-if="item.intro" 
              class="markdown-content intro-text"
              v-html="renderMarkdown(item.intro)"
            ></div>
            
            <div v-if="item.add" class="add-info-box">
              <!-- <span class="info-icon">▶</span> -->
              <div 
                class="markdown-content add-text"
                v-html="renderMarkdown(item.add)"
              ></div>
            </div>
          </div>
        </div>
        
        <div v-if="items.length === 0" class="empty-list">
          暂无相关资源
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MarkdownIt from 'markdown-it'; 

const router = useRouter();

// ==========================================
// ▼▼▼ 唯一需要修改的配置区域 ▼▼▼
// ==========================================
const PAGE_CONFIG = {
  title: "资料收集",        
  jsonFile: "materials.json"   
};
// ==========================================

const md = new MarkdownIt({ html: true, breaks: true, linkify: true });
const items = ref([]);
const loading = ref(true);
const error = ref(null);

const formatIdx = (idx) => String(idx).padStart(2, '0');
const goBack = () => router.back();

const renderMarkdown = (text) => {
  if (!text) return '';
  return md.render(text);
};

const handleCardClick = (item) => {
  if (item.url) {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await fetch(`/resource/${PAGE_CONFIG.jsonFile}`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    items.value = data.sort((a, b) => Number(a.idx) - Number(b.idx));
  } catch (err) {
    error.value = `Load Failed: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Theme: Catppuccin Mocha & LXGW WenKai */
.resource-detail-wrapper {
  --ctp-base: #1e1e2e;
  --ctp-text: #cdd6f4;
  --ctp-subtext0: #a6adc8;
  --ctp-subtext1: #bac2de;
  --ctp-overlay0: #6c7086;
  --ctp-surface1: #45475a;
  --ctp-lavender: #b4befe;
  --ctp-blue: #89b4fa;
  --ctp-mauve: #cba6f7;
  --ctp-pink: #f5c2e7;
  --ctp-yellow: #f9e2af;

  --font-main: 'LXGW WenKai', 'PingFang SC', sans-serif;
  --font-code: 'Fira Code', monospace;

  min-height: 100vh;
  background-color: var(--ctp-base);
  color: var(--ctp-text);
  font-family: var(--font-main);
  padding: 0 20px 40px 20px;
  box-sizing: border-box;
  position: relative; /* 为背景定位做准备 */
  overflow-x: hidden; /* 防止背景溢出 */
}

/* ========= 新增：背景特效样式 ========= */

/* 确保内容在背景之上 */
.relative-layer {
  position: relative;
  z-index: 1;
}

/* 氛围背景容器 (Fixed定位，不随滚动条移动) */
.ambient-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 确保不阻挡点击 */
  z-index: 0;
  overflow: hidden;
}

/* 光团通用样式 */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px); /* 巨大的高斯模糊产生光晕感 */
  opacity: 0.4; /* 低透明度，不抢眼 */
  will-change: transform; /* 性能优化 */
}

/* 左上 Mauve 光团 */
.blob-1 {
  top: -15%;
  left: -15%;
  width: 50vw;
  height: 50vw;
  background: var(--ctp-mauve);
  opacity: 0.25;
  animation: move1 25s infinite alternate ease-in-out;
}

/* 右下 Blue 光团 */
.blob-2 {
  bottom: -20%;
  right: -20%;
  width: 60vw;
  height: 60vw;
  background: var(--ctp-blue);
  opacity: 0.25;
  animation: move2 30s infinite alternate ease-in-out;
}

/* 中间 Lavender 光团 (更淡) */
.blob-3 {
  top: 50%;
  left: 30%;
  width: 40vw;
  height: 40vw;
  background: var(--ctp-yellow);
  opacity: 0.3;
  animation: move3 22s infinite alternate ease-in-out;
}

/* 噪点纹理叠加层 (可选，增加质感) */
.noise-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  /* 使用 SVG filter 或图片生成噪点。这里用一个简单的base64噪点图 */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.2;
  mix-blend-mode: overlay;
}

/* 缓慢漂浮动画关键帧 */
@keyframes move1 {
  from { transform: translate(0, 0) rotate(0deg) scale(1); }
  to { transform: translate(100px, 50px) rotate(20deg) scale(1.1); }
}
@keyframes move2 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-80px, -60px) scale(0.9); }
}
@keyframes move3 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-40px, 80px) scale(1.2); }
}
/* =================================== */


/* --- 导航栏 --- */
.nav-bar {
  max-width: 1200px;
  margin: 0 auto 20px auto;
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(166, 173, 200, 0.1);
}
.back-btn {
  background: rgba(30, 30, 46, 0.4); /* 稍微加点背景色以便在光晕上看得清 */
  backdrop-filter: blur(5px);
  border: 1px solid var(--ctp-surface1);
  color: var(--ctp-subtext0);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;
  font-family: var(--font-code); font-size: 0.8rem;
}
.back-btn:hover { border-color: var(--ctp-lavender); color: var(--ctp-lavender); background: rgba(180, 190, 254, 0.1); }
.header-title { font-size: 3rem; font-weight: bold; color: var(--ctp-mauve); margin: 0; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); /* 增加标题立体感 */ }
.header-placeholder { width: 80px; }

.content-container { max-width: 1100px; margin: 0 auto; }
.resource-stream { display: flex; flex-direction: column; gap: 12px; }

/* --- 卡片样式 (Compact & Glassmorphism Enhanced) --- */
.resource-card {
  position: relative;
  /* 增强玻璃态效果，适应新背景 */
  background: rgba(30, 30, 46, 0.6); /* 更深一点的基础色 */
  backdrop-filter: blur(16px) saturate(180%); /* 更强的模糊和饱和度 */
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(180, 190, 254, 0.08); /* 更细腻的边框 */
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 基础阴影 */
  
  opacity: 0; transform: translateY(10px); animation: slideIn 0.4s ease forwards;
}
@keyframes slideIn { to { opacity: 1; transform: translateY(0); } }

.resource-card.is-clickable { cursor: pointer; }
.resource-card.is-clickable:hover {
  background: rgba(49, 50, 68, 0.7);
  border-color: rgba(203, 166, 247, 0.3);
  /* Hover 时增强阴影和发光感 */
  box-shadow: 0 8px 24px rgba(203, 166, 247, 0.15), inset 0 0 20px rgba(203, 166, 247, 0.05);
  transform: translateY(-2px) scale(1.005); /* 微妙的放大浮动 */
}

/* 左侧光条 */
.active-indicator {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, var(--ctp-mauve), var(--ctp-blue));
  opacity: 0; transition: opacity 0.3s ease; box-shadow: 2px 0 10px var(--ctp-mauve); /* 光条也发光 */
}
.resource-card.is-clickable:hover .active-indicator { opacity: 1; }

/* --- 卡片内部布局 --- */
.card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
.title-group { display: flex; align-items: baseline; gap: 10px; flex: 1; }
.idx-badge { font-family: var(--font-code); font-size: 1.15rem; color: var(--ctp-surface1); opacity: 0.8; min-width: 24px; transition: all 0.3s; }
.resource-card.is-clickable:hover .idx-badge { color: var(--ctp-mauve); opacity: 1; text-shadow: 0 0 8px rgba(203, 166, 247, 0.4); }
.resource-name { font-size: 1.3rem; font-weight: bold; color: var(--ctp-text); margin: 0; line-height: 1.3; transition: color 0.3s; }
.resource-card.is-clickable:hover .resource-name { color: var(--ctp-lavender); }
.link-icon-hint { color: var(--ctp-surface1); font-size: 1.1rem; opacity: 0; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); margin-left: 10px; }
.resource-card.is-clickable:hover .link-icon-hint { opacity: 1; color: var(--ctp-blue); transform: translate(4px, -4px) scale(1.1); }

/* --- Markdown 内容区 --- */
.markdown-content { font-size: 1.15rem; line-height: 1.5; color: var(--ctp-subtext0); }
.intro-text { margin-left: 34px; margin-bottom: 0; }
.intro-text:not(:last-child) { margin-bottom: 6px; }
.add-info-box { display: flex; gap: 6px; align-items: flex-start; margin-left: 34px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(166, 173, 200, 0.1); }
.info-icon { font-size: 0.75rem; color: var(--ctp-yellow); margin-top: 2px;}
.add-text { font-size: 1rem; color: var(--ctp-subtext1); }

/* --- Markdown 标签美化 --- */
.markdown-content :deep(p) { margin: 0 0 4px 0; }
.markdown-content :deep(p:last-child) { margin: 0; }
.markdown-content :deep(strong) { color: var(--ctp-lavender); font-weight: 600; }
.markdown-content :deep(a) { color: var(--ctp-blue); text-decoration: none; border-bottom: 1px dashed rgba(137, 180, 250, 0.4); transition: all 0.2s; }
.markdown-content :deep(a:hover) { border-bottom-style: solid; background: rgba(137, 180, 250, 0.1); }
.markdown-content :deep(code) { font-family: var(--font-code); background: rgba(24, 24, 37, 0.5); color: var(--ctp-pink); padding: 1px 4px; border-radius: 4px; font-size: 0.85em; border: 1px solid rgba(243, 139, 168, 0.1); }

/* 状态样式 */
.loading-state, .error-state, .empty-list { text-align: center; padding: 40px 0; color: var(--ctp-overlay0); font-size: 0.9rem; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--ctp-surface1); border-top: 3px solid var(--ctp-mauve); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .intro-text, .add-info-box { margin-left: 0; margin-top: 8px; }
  .resource-card { padding: 12px; }
  .title-group { gap: 8px; }
}
</style>