<template>
  <div class="ambient-background-container">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
</template>

<script setup>
// 这个组件不需要任何 Props，即插即用
// 它的任务就是静静地在背后漂浮
</script>

<style scoped>
/* [核心容器]
  使用 fixed 定位，确保它始终铺满屏幕
  z-index 设置为 -1，保证它永远在所有内容的最底层
*/
.ambient-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 防止光球溢出导致滚动条 */
  z-index: -1;      /* 关键：沉底 */
  pointer-events: none; /* 关键：透传点击事件，不影响用户交互 */
  background-color: var(--ctp-mocha-base); /* 可选：设置一个底色，防止背景穿透 */
}

/* [通用光球样式] */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px); /* 极度模糊，制造光晕感 */
  opacity: 0.4;
  animation: floatOrb 20s infinite ease-in-out;
}

/* [光球 1：主色调] */
.orb-1 {
  width: 60vh; /* 使用 vh 单位，适应不同屏幕尺寸 */
  height: 60vh;
  background: var(--primary-color);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

/* [光球 2：互补色 (紫色系)] */
.orb-2 {
  width: 50vh;
  height: 50vh;
  /* 如果你没有 mauve 变量，可以用具体颜色 #cba6f7 */
  background: var(--ctp-mocha-mauve, #cba6f7); 
  bottom: 0%;
  right: -10%;
  animation-delay: -5s;
}

/* [光球 3：暖色调 (橙色系)] */
.orb-3 {
  width: 40vh;
  height: 40vh;
  /* 如果你没有 peach 变量，可以用具体颜色 #fab387 */
  background: var(--ctp-mocha-peach, #fab387); 
  top: 40%;
  left: 30%;
  opacity: 0.2; /* 这个球让它淡一点 */
  animation-delay: -10s;
}

/* [漂浮动画] */
@keyframes floatOrb {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* [移动端优化] 手机上球稍微小一点，性能更好 */
@media (max-width: 768px) {
  .orb {
    filter: blur(60px);
  }
  .orb-1 { width: 300px; height: 300px; }
  .orb-2 { width: 250px; height: 250px; }
  .orb-3 { width: 200px; height: 200px; }
}
</style>