<template>
  <section
    class="content-block"
    :style="backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}"
  >
    <div class="overlay-glass">
      <h2 class="block-title">{{ title }}</h2>
      <div class="slot-wrapper">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  backgroundImage: String
})
</script>

<style scoped>
/* 外层容器，带背景图 + 渐入动画 */
.content-block {
  position: relative;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 1.5rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}
.content-block:hover {
  transform: translateY(-4px);
}

/* 内层毛玻璃层（减弱版） */
.overlay-glass {
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.6); /* 从 0.75 降到 0.6 */
  border: 1px solid var(--border-color);
  padding: 2rem;
  border-radius: 1.5rem;
  color: var(--text-color);
}

/* 大标题样式 */
.block-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1.25rem;
  text-align: center;
}

/* 插槽内容区域 */
.slot-wrapper {
  font-size: 1rem;
  line-height: 1.6;
}
</style>