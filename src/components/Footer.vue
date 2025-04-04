<template>
  <footer class="site-footer">
    <p>
      GitHub:
      <a href="https://github.com/pifuyuini" target="_blank" rel="noopener noreferrer">GitHub</a>
      |
      Email:
      <a href="mailto:your@email.com">your@email.com</a>
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
  margin-top: 2rem;
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
</style>