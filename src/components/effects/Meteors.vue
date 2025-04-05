<template>
  <div class="meteor-layer absolute inset-0 overflow-hidden z-0 pointer-events-none">
    <div
      v-for="meteor in meteors"
      :key="meteor.id"
      class="meteor"
      :style="{
        top: meteor.top + '%',
        left: meteor.left + '%',
        animationDuration: meteor.duration + 's',
        animationDelay: meteor.delay + 's',
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const number = 30
const meteors = ref([])

onMounted(() => {
  for (let i = 0; i < number; i++) {
    meteors.value.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 5,
    })
  }
})
</script>

<style scoped>
.meteor {
  position: absolute;
  width: 2px;
  height: 80px;

  /* 流星颜色：尾巴是透明，头部是白色 */
  background: linear-gradient(to bottom, transparent, white);
  opacity: 0.8;

  /* 方向：倾斜为 -45 度，方向为左上到右下 */
  transform: rotate(-45deg);

  /* 流星动画 */
  animation: meteor-fall linear infinite;
}

@keyframes meteor-fall {
  0% {
    transform: translate(0, 0) rotate(-45deg);
    opacity: 1;
  }
  100% {
    transform: translate(200px, 200px) rotate(-45deg); /* 右下坠落 */
    opacity: 0;
  }
}
</style>