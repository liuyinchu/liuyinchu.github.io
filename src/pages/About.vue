<!-- <template>
  <PageWrapper>
    <BlockMarkdown :content="aboutText" :useCJK="true" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const aboutText = `
# 关于本站和作者

作者是**流萤厨**，所以：“个人网站高能回，流萤厨献给流萤的真挚情书！”

- **自我介绍：** 懒得写，不影响。
- **联系方式：** 页脚有我的 GitHub 和邮箱。
- **关于这个网站：** 主要用于练手和分享一些东西。
- **想到了再写……**
`
</script> -->

<template>
  <div class="about-page-wrapper">
    <div class="ambient-background">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="content-container">
      <section class="hero-section">
        <h1 class="hero-title">
          <span class="greeting">Hello, I'm LiuYinChu.</span>
          <span class="highlight">Builder & Thinker.</span>
        </h1>
        <p class="hero-quote">
          “技术不是工具箱，而是一种思考世界的方式。”
        </p>
      </section>

      <section class="bento-grid">
        
        <div class="bento-card card-origin">
          <h3>执拗的好奇心</h3>
          <div class="card-text">
            <p>
              我对技术的兴趣并不来自某一次“入门”，而是<strong>长期、稳定、甚至有点执拗的好奇心</strong>。
            </p>
            <p>
              我喜欢折腾计算机，喜欢写代码，喜欢把抽象的想法变成可以运行、可以交互、可以反复打磨的东西。对我来说，代码是逻辑的诗歌，是连接现实与想象的桥梁。
            </p>
          </div>
        </div>

        <div class="bento-card card-explorer">
          <h3>拆解与重组</h3>
          <div class="card-text">
            <p>
              我对 AI 工具、新技术和开放生态保持<strong>高度敏感</strong>。
            </p>
            <p>
              我不满足于“会用”，我更想知道它为什么这样设计？还能不能更优雅？在不同场景下会发生什么偏差？我享受这种不断逼近本质、同时又保留实验空间的过程。
            </p>
          </div>
        </div>

        <div class="bento-card card-engineer">
          <h3>工程实用主义</h3>
          <div class="card-text">
            <p>
              相比宏大叙事，我更在意<strong>具体问题是否被真正解决</strong>。
            </p>
            <p>
              相比“正确答案”，我更相信可验证、可迭代的方案。让复杂系统保持可控，本身就是一件值得投入的事情。
            </p>
          </div>
        </div>

        <div class="bento-card card-garden">
          <div class="garden-content">
            <h3>正在生长中...</h3>
            <p>
              这个网站是我的个人空间，用来记录想法、项目、实验和偶尔成型的结论。如果你在这里看到某些尚未完成、甚至有点粗糙的内容，<strong>那通常不是疏忽，而是它们正处在生长中。</strong>
            </p>
          </div>
          <div class="growth-indicator">
            <div class="bar"></div>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup>
// 无需额外逻辑，纯粹的展示组件
</script>

<style scoped>
/* =========================================
   0. 容器与重置 (Scope Isolation)
   ========================================= */
.about-page-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  padding: 6rem 2rem 4rem; /* 避开 Fixed Header */
  color: var(--text-color);
  font-family: 'Inter', "LXGW WenKai", sans-serif;
  box-sizing: border-box;
}

.content-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  z-index: 2; /* 确保在背景之上 */
}

/* =========================================
   1. 动态背景 (Ambient Orbs)
   ========================================= */
.ambient-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: floatOrb 20s infinite ease-in-out;
}

/* 即使在暗色模式下也通透的配色 */
.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #9d7cd8; /* Catppuccin Mauve 近似色 */
  bottom: 10%;
  right: -5%;
  animation-delay: -5s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: #f5a97f; /* Catppuccin Peach 近似色 */
  top: 40%;
  left: 30%;
  opacity: 0.2;
  animation-delay: -10s;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* =========================================
   2. Hero 区域
   ========================================= */
.hero-section {
  text-align: left;
  margin-bottom: 4rem;
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.hero-title .greeting {
  color: var(--ctp-mocha-subtext1, #bacad9);
  font-size: 2rem;
  font-weight: 500;
}

.hero-title .highlight {
  background: linear-gradient(135deg, var(--text-color) 30%, var(--primary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-quote {
  font-size: 1.25rem;
  color: var(--ctp-mocha-overlay2, #9399b2);
  font-style: italic;
  padding-left: 1rem;
  border-left: 4px solid var(--primary-color);
  max-width: 600px;
}

/* =========================================
   3. Bento Grid 布局系统
   ========================================= */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto; /* 让高度自适应 */
  gap: 1.5rem;
}

/* 通用卡片样式 */
.bento-card {
  background: rgba(var(--ctp-mocha-base-rgb), 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Hover 效果 */
.bento-card:hover {
  transform: translateY(-5px);
  background: rgba(var(--ctp-mocha-base-rgb), 0.6);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 卡片内部排版 */
.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.bento-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.card-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--ctp-mocha-subtext0);
}

.card-text p {
  margin-bottom: 1rem;
}

.card-text strong {
  color: var(--primary-color);
  font-weight: 600;
}

/* --- 栅格分配 (Responsive) --- */

/* 卡片 A: 执拗的好奇心 (左侧大块, 跨7列) */
.card-origin {
  grid-column: span 7;
  animation: fadeInUp 0.8s ease-out 0.1s backwards;
}

/* 卡片 B: 探索者 (右侧上方, 跨5列) */
.card-explorer {
  grid-column: span 5;
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.3); /* 稍微深一点 */
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

/* 卡片 C: 工程师 (左侧下方, 跨5列) */
.card-engineer {
  grid-column: span 5;
  animation: fadeInUp 0.8s ease-out 0.3s backwards;
}

/* 卡片 D: 花园 (右侧下方, 跨7列) */
.card-garden {
  grid-column: span 7;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px dashed rgba(255, 255, 255, 0.2); /* 虚线边框暗示“未完成” */
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

/* 进度条装饰 */
.growth-indicator {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 1rem;
  overflow: hidden;
}

.growth-indicator .bar {
  width: 65%; /* 模拟进度 */
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #a6e3a1);
  border-radius: 3px;
  animation: shimmer 2s infinite linear;
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* =========================================
   4. 移动端适配 (Mobile Response)
   ========================================= */
@media (max-width: 900px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .bento-grid {
    grid-template-columns: 1fr; /* 单列模式 */
    gap: 1.5rem;
  }
  
  .card-origin,
  .card-explorer,
  .card-engineer,
  .card-garden {
    grid-column: span 1; /* 全部占满一行 */
  }

  .about-page-wrapper {
    padding: 6rem 1.5rem 2rem;
  }
}

/* =========================================
   5. 通用动画
   ========================================= */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>