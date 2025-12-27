<template>
  <section
    class="content-block"
    :style="backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}"
  >
    <div class="content-wrapper">
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
/* 外层容器，负责背景图和基础定位 */
.content-block {
  position: relative; /* [关键] 为 ::before 伪元素提供定位上下文 */
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 1.5rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

  /* [优化] 增强过渡效果，让缩放更平滑 */
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'LXGW WenKai';
}

/* [优化] 增强悬浮效果，增加轻微的缩放 */
.content-block:hover {
  transform: translateY(-5px) scale(1.02);
}

/* [核心修改] 使用 ::before 伪元素创建暗色滤镜 */
.content-block::before {
  content: '';
  position: absolute;
  inset: 0; /* 覆盖整个父容器 */
  background-color: rgba(0, 0, 0, 0.5); /* [修改] 厚重的黑色滤镜 */
  z-index: 1; /* 确保滤镜在背景之上 */
  
  /* [优化] 为滤镜的颜色变化添加过渡效果 */
  transition: background-color 0.4s ease;
}

/* [优化] 悬浮时，滤镜变得更暗，突出内容 */
.content-block:hover::before {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 内层内容包裹器（原 .overlay-glass） */
.content-wrapper {
  position: relative; /* [关键] 确保内容在滤镜之上 */
  z-index: 2;
  
  /* [优化] 增加垂直内边距，让布局更舒展 */
  padding: 3rem 2rem;
  color: #fff; /* [修改] 将所有文字默认颜色改为白色，以适应深色背景 */
  text-align: center; /* [优化] 整体内容居中 */
}

/* 大标题样式 */
.block-title {
  font-size: 2.2rem; /* [优化] 略微增大字号 */
  font-weight: 800; /* [优化] 使用更粗的字重 */
  color: #fff; /* [修改] 颜色改为纯白 */
  margin-bottom: 1.25rem;
  
  /* [优化] 增加文字阴影，提升在复杂背景下的可读性 */
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* 插槽内容区域 */
.slot-wrapper {
  font-size: 1.05rem; /* [优化] 略微增大字号 */
  line-height: 1.7;
  opacity: 0.9; /* [优化] 轻微降低透明度，与标题形成对比 */
}
</style>