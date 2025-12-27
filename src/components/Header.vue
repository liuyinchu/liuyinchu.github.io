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

<!-- <template>
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
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",'Inter','Noto Serif SC','Times New Roman',serif;
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
  font-size: 1.2rem;
  transition: color 0.3s ease;
  font-family: "LXGW WenKai";
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
</style> -->

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="header-inner">
      <RouterLink to="/" class="logo-area">
        <div class="logo-wrapper">
          <img src="/favicon_liuyin.svg" alt="logo" class="logo" />
          <div class="logo-glow"></div>
        </div>
        <span class="site-name">LiuYinChu'Space</span>
      </RouterLink>

      <nav class="nav-menu desktop-menu">
        <!-- <RouterLink to="/postit">日志</RouterLink> -->
        <RouterLink to="/space1">随记</RouterLink>
        <RouterLink to="/rd">资源链接</RouterLink>
        <RouterLink to="/code">代码与项目</RouterLink>
        <RouterLink to="/research">我的学术</RouterLink>
      </nav>

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
    </div>

    <Transition name="fade-slide">
      <div v-if="isMenuOpen" class="mobile-menu-container">
        <nav class="mobile-nav-links">
          <!-- <RouterLink to="/postit" @click="closeMenu" style="--i:1">日志</RouterLink> -->
          <RouterLink to="/space1" @click="closeMenu" style="--i:2">随记</RouterLink>
          <RouterLink to="/rd" @click="closeMenu" style="--i:3">资源链接</RouterLink>
          <RouterLink to="/code" @click="closeMenu" style="--i:4">代码与项目</RouterLink>
          <RouterLink to="/research" @click="closeMenu" style="--i:5">我的学术</RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)
const isScrolled = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  // 防止菜单打开时背景滚动
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMenu() {
  if (isMenuOpen.value) {
    isMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

// [新增] 监听滚动，给 Header 增加更明显的背景
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* =========================================
   1. 容器与基础布局 (Layout & Container)
   ========================================= */
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 初始状态：极简、几乎透明 */
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 滚动后的状态：加深背景，增加阴影，增强可读性 */
.site-header.is-scrolled {
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-inner {
  max-width: 1200px; /* 限制最大宽度，大屏更美观 */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
}

/* =========================================
   2. Logo 区域的高级感 (Logo Aesthetics)
   ========================================= */
.logo-area {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  group: logo-group; /* 用于 hover 状态管理 */
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 36px; /* 稍微加大一点 */
  height: 36px;
  position: relative;
  z-index: 2;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* Logo背后的光晕 */
.logo-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.4s ease, transform 0.4s ease;
  z-index: 1;
  filter: blur(8px);
}

.site-name {
  font-family: 'Inter', system-ui, sans-serif; /* 英文用非衬线体更现代，若必须中文可用原字体 */
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-color);
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

/* Hover Effect: Logo */
.logo-area:hover .logo {
  transform: rotate(-10deg) scale(1.1);
}
.logo-area:hover .logo-glow {
  opacity: 0.4;
  transform: scale(1.5);
}
.logo-area:hover .site-name {
  background: linear-gradient(135deg, #E57219, #47F1E8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* =========================================
   3. 桌面端导航 (Desktop Navigation)
   ========================================= */
.desktop-menu {
  display: none; /* 移动优先，默认隐藏 */
}

@media (min-width: 769px) {
  .desktop-menu {
    display: flex;
    gap: 0.5rem; /* 使用 pill 形状时，间距可以小一点，因为有 padding */
    background: rgba(0, 0, 0, 0.03); /* 极淡的背景槽 */
    padding: 4px;
    border-radius: 99px; /* 胶囊形状容器 */
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .desktop-menu a {
    position: relative;
    padding: 0.5rem 1.2rem;
    color: var(--ctp-mocha-subtext0);
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 99px; /* 胶囊按钮 */
    transition: all 0.3s ease;
    font-family: "LXGW WenKai", sans-serif;
  }

  /* 悬浮态：轻微亮起 */
  .desktop-menu a:hover {
    color: var(--text-color);
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* 激活态：高亮背景 + 阴影 */
  .desktop-menu a.router-link-active {
    background-color: var(--primary-color, #47F1E8); /* 确保你有这个变量，或者用具体颜色 */
    color: #fff; /* 激活时文字反白，显眼 */
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(var(--primary-rgb, 71, 241, 232), 0.3);
  }
}

/* =========================================
   4. 移动端汉堡按钮 (Hamburger)
   ========================================= */
.mobile-nav-toggle {
  display: block;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1002;
}

@media (min-width: 769px) {
  .mobile-nav-toggle {
    display: none;
  }
}

.hamburger-box {
  width: 24px;
  height: 24px;
  position: relative;
  display: block;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  width: 24px;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 4px;
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), background 0.3s ease;
}

.hamburger-inner { top: 50%; transform: translateY(-50%); }
.hamburger-inner::before { content: ''; top: -7px; left: 0; }
.hamburger-inner::after { content: ''; top: 7px; left: 0; }

/* 激活状态动画 */
.mobile-nav-toggle.is-active .hamburger-inner { background-color: transparent; }
.mobile-nav-toggle.is-active .hamburger-inner::before { top: 0; transform: rotate(135deg); }
.mobile-nav-toggle.is-active .hamburger-inner::after { top: 0; transform: rotate(-135deg); }

/* =========================================
   5. 移动端全屏菜单 (Mobile Overlay)
   ========================================= */
.mobile-menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000000;
  backdrop-filter: blur(20px);
  z-index: 1001; /* 比 Header 低一点点，或者同级，但因为是 fixed 所以会覆盖 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.mobile-nav-links a {
  font-size: 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  font-family: "LXGW WenKai", serif;
  font-weight: 600;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  /* 这里的动画是在类名添加时触发 */
  animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  /* 使用 CSS 变量计算延迟 */
  animation-delay: calc(var(--i) * 0.08s);
}

.mobile-nav-links a.router-link-active {
  color: var(--primary-color);
}
.mobile-nav-links a.router-link-active::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  margin: 0.5rem auto 0;
}

/* =========================================
   6. 动画关键帧 (Keyframes)
   ========================================= */
@keyframes slideUpFade {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition 组件的过渡类 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>