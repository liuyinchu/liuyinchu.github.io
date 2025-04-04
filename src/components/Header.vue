<template>
  <header class="site-header">
    <RouterLink to="/" class="logo-area">
      <img src="/favicon_liuyin.svg" alt="logo" class="logo" />
      <span class="site-name">LiuYinChu'Space</span>
    </RouterLink>

    <nav class="nav-menu">
      <RouterLink to="/code">代码</RouterLink>
      <RouterLink to="/resource">资源链接</RouterLink>
      <RouterLink to="/notes">笔记</RouterLink>
      <RouterLink to="/space1">留言与讨论</RouterLink>
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
</style>