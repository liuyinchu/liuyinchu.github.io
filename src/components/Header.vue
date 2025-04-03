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
