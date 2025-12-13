<script setup>
import { ref, onMounted } from 'vue'
import FriendCard from '../components/FriendCard.vue'
import AmbientBackground from '../components/AmbientBackground.vue'


const friends = ref([])
const isLoaded = ref(false) // 用于触发动画状态

onMounted(async () => {
  try {
    const res = await fetch('/friends.json')
    friends.value = await res.json()
    // 给一点延迟让动画更流畅
    setTimeout(() => { isLoaded.value = true }, 100)
  } catch (error) {
    console.error("无法加载邻居列表:", error)
  }
})
</script>

<template>
  <div class="page-container">
    <AmbientBackground />
    
    <header class="page-header">
      <div class="header-content">
        <h1 class="title">网络邻居</h1>
        <div class="title-bg-glow"></div> </div>
      
      <div class="contrib-wrapper">
        <img
          src="/fig/friends.svg"
          alt="Friends"
          class="contrib-img"
          loading="lazy"
        />
      </div>
      
      <!-- <p class="intro-quote">
        <span class="quote-line">相知无远近，</span>
        <span class="quote-line">万里尚为邻。</span>
      </p> -->
    </header>

    <div class="friends-grid" :class="{ 'grid-loaded': isLoaded }">
      <FriendCard
        v-for="(friend, index) in friends"
        :key="friend.link"
        :name="friend.name"
        :link="friend.link"
        :desc="friend.desc"
        :style="{ '--delay': `${index * 0.05}s` }" 
      />
    </div>

    <div class="exchange-section">
      <div class="exchange-glass-panel">
        
        <div class="rules-column">
          <div class="section-header">
            <!-- <span class="section-icon">🤝</span> -->
            <h2 class="section-title">成为邻居</h2>
          </div>
          <p class="section-intro">
            很高兴能在数字宇宙中与你相遇。如果你的站点满足以下条件，欢迎交换友链，共同构建去中心化的网络连接。
          </p>
          
          <ul class="rules-list">
            <li>
              <span class="check-icon">✓</span>
              <span>内容健康，不涉及违法、色情、暴力或灰色产业。</span>
            </li>
            <li>
              <span class="check-icon">✓</span>
              <span>非空壳站点，保持一定的原创性与更新频率。</span>
            </li>
            <li>
              <span class="check-icon">♥</span>
              <span>如果愿意，请支持 <strong>SYSU.SPA</strong> ！</span>
            </li>
          </ul>

          <div class="warning-box">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              本站坚决拒绝任何包含恶意推广、政治敏感或人身攻击内容的站点连接。
            </div>
          </div>
        </div>

        <div class="format-column">
          <h3 class="column-subtitle">Application JSON</h3>
          <div class="code-window">
            <div class="window-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <pre><code><span class="token key">"name"</span><span class="token punc">:</span> <span class="token str">"LiuYinChu'Space"</span><span class="token punc">,</span>
<span class="token key">"link"</span><span class="token punc">:</span> <span class="token str">"https://liuyinchu.github.io"</span><span class="token punc">,</span>
<span class="token key">"desc"</span><span class="token punc">:</span> <span class="token str">"祝你有晴朗的一天！"</span></code></pre>
            <div class="copy-hint">
              // 请在 Issues 中提交以上信息
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- 全局容器与排版 --- */
.page-container {
  max-width: 1200px; /* 稍微加宽一点 */
  margin: 0 auto;
  padding: 4rem 1.5rem 8rem; /* 底部留足空间 */
  position: relative;
}

/* --- 1. Header 区域 --- */
.page-header {
  text-align: center;
  margin-bottom: 5rem;
  position: relative;
}

.header-content {
  position: relative;
  display: inline-block;
}

.title {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--primary-color);
  font-family: "LXGW WenKai", sans-serif;
  position: relative;
  z-index: 2;
  margin: 0;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.1);
}

/* 标题背后的柔光 */
.title-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  opacity: 0.15;
  filter: blur(40px);
  z-index: 1;
}

.contrib-wrapper {
  margin: 2rem auto;
  perspective: 1000px;
}

.contrib-img {
  width: 300%;
  max-width: 450px; /* 稍微缩小图片，让留白更高级 */
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.05));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.intro-quote {
  margin-top: 2rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  color: var(--ctp-mocha-subtext0);
  line-height: 1.6;
  opacity: 0.8;
}

.quote-line {
  display: inline-block;
  margin: 0 0.5rem;
}

/* --- 2. 网格布局与入场动画 --- */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 卡片稍微紧凑一点 */
  gap: 1.5rem;
  margin-bottom: 6rem;
}

/* 动画控制：默认隐藏，加载后显示 */
.friends-grid :deep(.friend-card) {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.friends-grid.grid-loaded :deep(.friend-card) {
  opacity: 1;
  transform: translateY(0);
  /* 使用内联 style 中的 --delay 变量 */
  transition-delay: var(--delay, 0s);
}

/* --- 3. 交换区域 (Glassmorphism Panel) --- */
.exchange-section {
  padding: 0 1rem;
}

.exchange-glass-panel {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
  padding: 3.5rem;
  border-radius: 24px;
  
  /* 玻璃态核心 */
  background: rgba(var(--surface-color-rgb, 30, 30, 46), 0.6); /* 假设深色背景 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 20px 40px -10px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* 左侧规则样式 */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 2rem;
  animation: wave 2s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-color);
  font-family: "LXGW WenKai";
  margin: 0;
}

.section-intro {
  color: var(--ctp-mocha-subtext0);
  font-family: "LXGW WenKai";
  line-height: 1.8;
  margin-bottom: 2rem;
  font-size: 1.05rem;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.rules-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.2rem;
  color: var(--ctp-mocha-text);
  font-family: "LXGW WenKai";
  font-size: 1rem;
  line-height: 1.6;
}

.check-icon {
  color: var(--primary-color); /* 使用主题色 */
  margin-right: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.warning-box {
  padding: 1.2rem;
  background: rgba(231, 130, 132, 0.1); /* Catppuccin Red minimal */
  border: 1px solid rgba(231, 130, 132, 0.3);
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.warning-icon {
  font-size: 1.5rem;
}

.warning-text {
  font-size: 0.9rem;
  color: var(--ctp-mocha-red, #e78284); /* 兼容 fallback 颜色 */
  font-family: "LXGW WenKai";
  line-height: 1.5;
}

/* 右侧代码样式 */
.format-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.column-subtitle {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ctp-mocha-overlay1);
  margin-bottom: 1rem;
  font-weight: 700;
}

.code-window {
  background: #1e1e2e; /* 纯黑/深蓝背景模拟终端 */
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.code-window:hover {
  transform: translateY(-5px);
}

.window-header {
  background: rgba(255,255,255,0.05);
  padding: 0.8rem 1rem;
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red { background-color: #ff5f56; }
.dot.yellow { background-color: #ffbd2e; }
.dot.green { background-color: #27c93f; }

.code-window pre {
  margin: 0;
  padding: 1.5rem;
  overflow-x: auto;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.7;
}

.copy-hint {
  padding: 0.8rem 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--ctp-mocha-overlay0);
  border-top: 1px solid rgba(255,255,255,0.05);
  font-style: italic;
}

/* 代码高亮颜色 (使用 Catppuccin 风格) */
.token.key { color: #cba6f7; } /* Mauve */
.token.punc { color: #9399b2; } /* Overlay2 */
.token.str { color: #a6e3a1; } /* Green */

/* --- 响应式适配 --- */
@media (max-width: 900px) {
  .exchange-glass-panel {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem;
  }
  
  .title {
    font-size: 2.5rem;
  }
}
</style>