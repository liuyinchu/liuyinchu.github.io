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

<template>
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
</style>