<!-- <template>
  <header class="site-header">
    <RouterLink to="/" class="logo-area">
      <img src="/favicon_liuyin.svg" alt="logo" class="logo" />
      <span class="site-name">LiuYinChu'Space</span>
    </RouterLink>

    <nav class="nav-menu">
      <RouterLink to="/code">代码</RouterLink>
      <RouterLink to="/resource">资源链接</RouterLink>
      <RouterLink to="/notes">笔记</RouterLink>
      <RouterLink to="/space2">网络邻居</RouterLink>
      <RouterLink to="/space1">随记</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* ===== 导航栏基础样式 ===== */
.site-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--surface-color);
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(6px); /* 毛玻璃效果 */
    -webkit-backdrop-filter: blur(6px);
  }
  
  /* ===== Logo区域 ===== */
  .logo-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color);
    font-weight: bold;
    font-size: 1.25rem;
    text-decoration: none;
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  /* ===== 菜单样式 ===== */
  .nav-menu {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-menu a {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: color 0.3s ease;
  }
  
  .nav-menu a:hover {
    color: var(--primary-color);
  }
</style> -->

<template>
  <header class="site-header">
    <RouterLink to="/" class="logo-area">
      <img src="/favicon_liuyin.svg" alt="logo" class="logo" />
      <span class="site-name">LiuYinChu'Space</span>
    </RouterLink>

    <button
      class="mobile-nav-toggle"
      :class="{ 'is-active': isMenuOpen }"
      @click="toggleMenu"
      aria-label="Toggle navigation"
    >
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    </button>

    <nav class="nav-menu" :class="{ 'is-active': isMenuOpen }">
      <RouterLink to="/code" @click="closeMenu">代码</RouterLink>
      <RouterLink to="/resource" @click="closeMenu">资源链接</RouterLink>
      <RouterLink to="/notes" @click="closeMenu">笔记</RouterLink>
      <RouterLink to="/space2" @click="closeMenu">网络邻居</RouterLink>
      <RouterLink to="/space1" @click="closeMenu">随记</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// [新增] 用于控制移动端菜单的显示/隐藏状态
const isMenuOpen = ref(false)

// [新增] 切换菜单状态的函数
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// [新增] 点击菜单项后关闭菜单（在移动端非常有用）
function closeMenu() {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
  }
}
</script>

<style scoped>
/* ===== 导航栏基础样式 ===== */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* [优化] 增加背景色的透明度，让毛玻璃效果更明显 */
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.8);
  padding: 0.75rem 2rem; /* [优化] 略微增加水平内边距 */
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000; /* [优化] 增加 z-index，确保在最上层 */
  backdrop-filter: blur(8px); /* [优化] 增加模糊半径 */
  -webkit-backdrop-filter: blur(8px);
}

/* ===== Logo区域 ===== */
.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* [优化] 略微增加间距 */
  color: var(--text-color);
  font-weight: bold;
  font-size: 1.25rem;
  text-decoration: none;
}

.logo {
  width: 32px;
  height: 32px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* [新增] 为 logo 添加过渡效果 */
}

.site-name {
  transition: color 0.3s ease; /* [新增] 为网站名称添加过渡效果 */
}

/* [核心优化] Logo区域的悬浮效果 */
.logo-area:hover .logo {
  transform: rotate(-15deg) scale(1.1);
}
.logo-area:hover .site-name {
  color: var(--primary-color-hover);
}

/* ===== 菜单样式 ===== */
.nav-menu {
  display: flex;
  gap: 2rem; /* [优化] 略微增加链接间距 */
}

.nav-menu a {
  position: relative; /* [新增] 为下划线伪元素提供定位上下文 */
  color: var(--ctp-mocha-subtext0); /* [优化] 默认颜色稍暗，突出当前页面 */
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.3s ease;
}

/* [核心优化] 当前激活链接的样式 */
.nav-menu a.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

/* [核心优化] 链接悬浮效果：下划线从中间展开 */
.nav-menu a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -6px;
  left: 0;
  background-color: var(--primary-color-hover);
  transform: scaleX(0); /* 默认隐藏 */
  transform-origin: center;
  transition: transform 0.3s ease;
}

.nav-menu a:hover {
  color: var(--text-color);
}

.nav-menu a:hover::after {
  transform: scaleX(1); /* 悬浮时展开 */
}
/* 激活链接在悬浮时依然保持高亮 */
.nav-menu a.router-link-active:hover {
    color: var(--primary-color-hover);
}


/* ===== [新增] 移动端响应式样式 ===== */
.mobile-nav-toggle {
  display: none; /* 桌面端默认隐藏 */
  position: relative;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.hamburger-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger-inner {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: '';
}

.hamburger-inner::before {
  top: -8px;
}

.hamburger-inner::after {
  bottom: -8px;
}

/* 汉堡按钮激活时的动画 -> X */
.mobile-nav-toggle.is-active .hamburger-inner {
  transform: rotate(45deg);
}
.mobile-nav-toggle.is-active .hamburger-inner::before {
  top: 0;
  transform: rotate(-90deg);
  opacity: 1;
}
.mobile-nav-toggle.is-active .hamburger-inner::after {
  bottom: 0;
  transform: rotate(0deg); /* 视觉上与主线条合并 */
  opacity: 0;
}


/* 当屏幕宽度小于 768px 时 */
@media (max-width: 768px) {
  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: rgba(var(--ctp-mocha-base-rgb), 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    /* 布局变为垂直 */
    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 1rem 0;

    /* 默认隐藏，带动画效果 */
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s ease, opacity 0.3s ease;
    border-bottom: 1px solid var(--border-color);
  }

  .nav-menu.is-active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-menu a {
    width: 100%;
    text-align: center;
    padding: 1rem 0;
    font-size: 1.2rem;
  }
  
  .nav-menu a::after {
      bottom: 8px; /* 调整下划线位置 */
  }

  .mobile-nav-toggle {
    display: block; /* 在移动端显示汉堡按钮 */
  }
}
</style>