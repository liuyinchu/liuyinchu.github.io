<!-- <template>
  <footer class="site-footer">
    <p>
      <a href="https://github.com/pifuyuini" target="_blank" rel="noopener noreferrer">GitHub</a>
      |
      <a href="mailto:mingchupifuyuini@gmail.com">MyEmail</a>
      |
      <RouterLink to="/about">About</RouterLink>
      |
      <RouterLink to="/credit">Copyright</RouterLink>
    </p>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.site-footer {
  background-color: var(--surface-color);
  color: var(--text-color);
  text-align: center;
  padding: 1.5rem 1rem;
  font-size: 0.9rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0rem;
}

.site-footer a {
  color: var(--text-color);
  text-decoration: none;
  margin: 0 0.25rem;
  transition: color 0.3s ease;
}

.site-footer a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}
</style> -->

<!-- <template>
  <footer class="site-footer">
    <div class="footer-content">
      <nav class="footer-links">
        <a href="https://github.com/pifuyuini" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:mingchupifuyuini@gmail.com">Email</a>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/credit">Copyright</RouterLink>
      </nav>

      <p class="copyright">
        &copy; 2024 - {{ new Date().getFullYear() }} LiuYinChu'Space. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.site-footer {
  /* [优化] 调整背景色透明度，与页眉保持一致 */
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  color: var(--ctp-mocha-subtext0); /* [优化] 使用柔和的次要文字颜色 */
  text-align: center;
  padding: 2.5rem 1.5rem; /* [优化] 增加垂直内边距 */
  font-size: 0.9rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.1rem; /* [优化] 与主内容区拉开距离 -- 这是个错误的优化！*/
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem; /* [新增] 链接和版权信息之间的间距 */
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap; /* [新增] 移动端自动换行 */
  gap: 0.5rem 0; /* 行间距 和 列间距 */
}

.footer-links a {
  color: var(--ctp-mocha-subtext1); /* [优化] 使用更柔和的链接颜色 */
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  transition: all 0.3s ease; /* [优化] 过渡所有属性 */
}

/* [核心优化] 使用伪元素创建分隔符，代替 | */
.footer-links a:not(:last-child)::after {
  content: '/'; /* 使用斜杠作为分隔符，更具设计感 */
  margin-left: 1.25rem;
  color: var(--border-color);
  font-weight: 300;
}

/* [核心优化] 更精致的悬浮效果 */
.footer-links a:hover {
  color: var(--primary-color-hover);
  transform: translateY(-2px); /* 轻微上浮 */
  text-decoration: none; /* 移除默认下划线 */
}

.copyright {
  font-size: 0.85rem;
  color: var(--ctp-mocha-overlay1); /* [优化] 版权信息使用最柔和的颜色 */
}
</style> -->

<template>
  <footer class="site-footer">
    <div class="footer-gradient-line"></div>

    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-title">
          <span>LiuYinChu'Space</span>
        </div>
        <p class="brand-slogan">
          探索 · 记录 · 创造<br>
          Keep thinking, keep building.
        </p>
      </div>

      <div class="footer-nav">
        <h4 class="nav-title">Statement</h4>
        <div class="nav-links">
          <RouterLink to="/space2">朋友们 (Friendly Links)</RouterLink>
          <RouterLink to="/about">关于我 (About)</RouterLink>
          <RouterLink to="/credit">版权说明 (Copyright)</RouterLink>
        </div>
      </div>

      <div class="footer-social">
        <h4 class="nav-title">Connect</h4>
        <div class="social-icons">
          <a href="https://github.com/pifuyuini" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="social-btn github">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 1.5C6.38 4.5 3.61 3.5 1 4c0 0-1 0-3 1.5-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <a href="mailto:mingchupifuyuini@gmail.com" aria-label="Email" class="social-btn email">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>
        &copy; 2024 - {{ new Date().getFullYear() }} LiuYinChu'Space. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* ===== 容器基础样式 ===== */
.site-footer {
  position: relative;
  /* 增加上外边距，让页脚和正文内容呼吸感更强 */
  margin-top: 4rem; 
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--ctp-mocha-subtext0);
  font-family: 'Inter', "LXGW WenKai", sans-serif;
  overflow: hidden; /* 防止光效溢出 */
}

/* [核心高级感] 顶部流光线条 */
.footer-gradient-line {
  height: 1px;
  width: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--ctp-mocha-surface2-rgb), 0.5) 20%,
    var(--primary-color) 50%,
    rgba(var(--ctp-mocha-surface2-rgb), 0.5) 80%,
    transparent 100%
  );
  opacity: 0.6;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  /* 桌面端三列布局：左侧品牌(占2份)，中间导航，右侧社交 */
  grid-template-columns: 1fr 1fr 1fr; 
  gap: 20rem;
}

/* ===== 1. 品牌区 ===== */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-color);
}

.brand-logo {
  width: 28px;
  height: 28px;
  filter: grayscale(0.2);
  transition: filter 0.3s;
}

.footer-brand:hover .brand-logo {
  filter: grayscale(0);
}

.brand-slogan {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--ctp-mocha-overlay2);
  max-width: 300px;
}

/* ===== 2. 导航与标题通用 ===== */
.nav-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ctp-mocha-overlay2); /* 标题颜色淡一点，不抢戏 */
  margin-bottom: 1rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.nav-links a {
  color: var(--ctp-mocha-subtext0);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  width: fit-content;
  position: relative;
}

/* 链接 Hover 效果：颜色变亮 + 轻微右移 */
.nav-links a:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}

/* ===== 3. 社交图标区 ===== */
.social-icons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 圆形按钮 */
  background-color: rgba(255, 255, 255, 0.05); /* 极淡的背景 */
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--ctp-mocha-subtext0);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 弹性过渡 */
}

/* 社交按钮 Hover：背景变色 + 上浮 + 发光 */
.social-btn:hover {
  background-color: var(--primary-color);
  color: #fff; /* 图标变白 */
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4); /* 需要确保你有 RGB 变量，或者用具体的颜色 rgba(71, 241, 232, 0.4) */
  border-color: transparent;
}

/* ===== 底部版权栏 ===== */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem 0;
  text-align: center;
  font-size: 0.8rem;
  color: var(--ctp-mocha-overlay1);
}

/* ===== 响应式适配 ===== */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr; /* 手机端变为单列 */
    text-align: center;
    gap: 2.5rem;
  }

  .footer-brand {
    align-items: center;
  }
  
  .brand-slogan {
    margin: 0 auto;
  }

  .nav-links {
    align-items: center;
  }

  /* 手机端取消右移 hover 效果，改为颜色变化即可 */
  .nav-links a:hover {
    transform: none;
  }
  
  .social-icons {
    justify-content: center;
  }
}
</style>