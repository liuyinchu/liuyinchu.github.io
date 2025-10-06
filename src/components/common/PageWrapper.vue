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
/* 方案一：紫色 */
.page-wrapper :deep(::selection) {
  background-color: #d8bfd8; /* 选一个淡紫色 (Thistle) 作为背景 */
  color: #4b0082;             /* 用深靛蓝色 (Indigo) 作为文字颜色，确保高对比度 */
}
/* 方案二：Catppuccin Mocha 原生蓝色 */
/* .page-wrapper :deep(::selection) {
  background-color: #74C7EC;
  color: #1E1E2E;
} */
/* 方案三：抹茶拿铁 */
/* .page-wrapper :deep(::selection) {
  background-color: #DDEBE7;
  color: #3C5249;
} */


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