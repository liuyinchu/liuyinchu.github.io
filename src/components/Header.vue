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
      <RouterLink to="/postit" @click="closeMenu">日志</RouterLink>
      <RouterLink to="/space1" @click="closeMenu">随记</RouterLink>
      <RouterLink to="/resource" @click="closeMenu">资源链接</RouterLink>
      <RouterLink to="/code" @click="closeMenu">代码</RouterLink>
      <RouterLink to="/research" @click="closeMenu">学术主页</RouterLink>
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
  /* color: var(--primary-color-hover); */
  background: linear-gradient(
    135deg,
    #E57219 0%,
    #EDCC87 16.7%,
    #B4E6CD 40.5%,
    #69F0E1 61%,
    #47F1E8 97.8%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* Safari/Chrome */
  background-clip: text;                 /* Firefox */
  color: transparent;
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


/* ===== [修正与改进] 移动端响应式样式 ===== */

/* 汉堡按钮容器 */
.mobile-nav-toggle {
  display: none; /* 桌面端默认隐藏 */
  position: relative;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1001; /* 确保在最上层 */
  padding: 0; /* 移除默认内边距 */
}

/* 汉堡按钮的“三条线”的定位和基础样式 */
.hamburger-box {
  position: relative;
  width: 24px;
  height: 24px;
  margin: 8px; /* 将定位从 absolute 改为 margin，更稳定 */
}

/* 这是中间那条线，也是上下两条线的定位基准 */
.hamburger-inner {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 2px;
  transform: translateY(-50%);
  /* [改进] 为自身也添加过渡效果 */
  transition: background-color 0.1s 0.2s ease-in-out; 
}

/* 这是上面和下面两条线 */
.hamburger-inner::before,
.hamburger-inner::after {
  content: '';
  position: absolute;
  left: 0; /* <<< 新增这一行以修复错位问题 */
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 2px;
  /* [改进] 将过渡效果放在这里，更平滑 */
  transition: transform 0.3s 0.1s ease-in-out;
}

.hamburger-inner::before {
  top: -8px; /* 从中心点向上偏移8px */
}

.hamburger-inner::after {
  top: 8px;  /* [修正] 改为top，方便计算。从中心点向下偏移8px */
}


/* --- 核心修正：汉堡按钮激活时的动画 -> X --- */

/* 当按钮激活时，中间的线“消失” */
.mobile-nav-toggle.is-active .hamburger-inner {
  background-color: transparent; /* 背景变透明，视觉上消失 */
  transition: background-color 0.1s ease-in-out;
}

/* 上面的线：向下移动8px到中心，然后旋转45度 */
.mobile-nav-toggle.is-active .hamburger-inner::before {
  transform: translateY(8px) rotate(45deg);
}

/* 下面的线：向上移动8px到中心，然后旋转-45度 */
.mobile-nav-toggle.is-active .hamburger-inner::after {
  transform: translateY(-8px) rotate(-45deg);
}


/* ===== 移动端导航菜单样式 (媒体查询) ===== */

/* 当屏幕宽度小于 768px 时 */
@media (max-width: 768px) {
  /* 导航菜单的样式 (这部分您的代码是正确的，予以保留和微调) */
  .nav-menu {
    position: absolute;
    top: 100%; /* 定位在导航栏正下方 */
    left: 0;
    width: 100%;
    background-color: rgba(var(--ctp-mocha-base-rgb), 0.9); /* 轻微调高透明度 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    flex-direction: column;
    align-items: center;
    gap: 0;
    padding: 1rem 0;

    /* 默认隐藏，带动画效果 */
    transform: translateY(-10px); /* [改进] 从轻微向上偏移的位置开始 */
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s ease, opacity 0.3s ease;
    border-bottom: 1px solid var(--border-color);
  }

  /* 导航菜单激活时的样式 */
  .nav-menu.is-active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* 菜单项样式 */
  .nav-menu a {
    width: 100%;
    text-align: center;
    padding: 1rem 0;
    font-size: 1.2rem;
  }
  
  /* 菜单项下划线位置调整 */
  .nav-menu a::after {
      bottom: 8px; 
  }

  /* 在移动端显示汉堡按钮 */
  .mobile-nav-toggle {
    display: block; 
  }
}
</style>