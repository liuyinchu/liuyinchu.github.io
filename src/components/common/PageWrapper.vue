<template>
  <div class="page-wrapper">
    <slot />
  </div>
</template>

<script setup>
// 无需额外逻辑，只是一个结构容器
</script>

<style scoped>
.page-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.5s ease, color 0.5s ease;
}

/* 大屏 */
@media (min-width: 1250px) {
  .page-wrapper {
    max-width: 80%;
    padding: 2.5rem 2rem;
  }
}

/* 小屏幕 (手机等) */
@media (max-width: 600px) {
  .page-wrapper {
    max-width: 90%;
    padding: 1.5rem 1rem;
  }
}

</style>