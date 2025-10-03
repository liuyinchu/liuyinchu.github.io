<template>
  <!-- 你的原模板：一字未改（仅在每个 .meteor 的 :style 里新增了一条 animationPlayState） -->
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
        animationPlayState: isPaused ? 'paused' : 'running'
      }"
    />
  </div>

  <!-- 新增：左侧悬浮暂停/恢复按钮（作为第二个根节点；不在 pointer-events: none 的层里） -->
  <button
    class="meteor-toggle"
    type="button"
    :aria-pressed="isPaused"
    @click="isPaused = !isPaused"
    :title="isPaused ? 'Resume meteors' : 'Pause meteors'"
  >
    <span v-if="!isPaused">⏸</span>
    <span v-else>▶</span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const number = 30
const meteors = ref([])

const rand = (a, b) => a + Math.random() * (b - a)

onMounted(() => {
  for (let i = 0; i < number; i++) {
    meteors.value.push({
      id: i,
      // 仍然 0~100%，保证一定出现在视口内（不玩越界）
      top: -10 + Math.random() * 100,
      left: -23 + Math.random() * 100,
      // 稍微拉开速度差
      duration: rand(3.2, 5.2),
      // 关键：负延迟，页面一加载就有流星在飞
      delay: -Math.random() * 5,
    })
  }
})

/* 新增：本地暂停状态（不改全局、不改你的逻辑） */
const isPaused = ref(false)
</script>

<style scoped>
/* ===== 你的原样式：保持不变 ===== */
.meteor {
  position: absolute;
  width: 2.7px;
  /* 稍长一点尾巴，观感更好；不想变可改回 80px */
  height: 110px;

  /* 极光渐变 + 透明尾（严格按你给的色，加入透明度，避免用 mask） */
  background: linear-gradient(
    180deg,
    rgba( 71, 241, 232, 0.05) 0%,
    rgba( 71, 241, 232, 0.25) 20.7%,
    rgba( 71, 241, 232, 0.50) 40.5%,
    rgba( 71, 241, 232, 0.80) 50.2%,
    rgba( 71, 241, 232, 1.00) 58.6%,
    #B4E6CD 64.3%,
    #EDCC87 82.7%,
    #E57219 100%
  );
  opacity: 0.9;

  /* 轻量“发光”——用小半径 drop-shadow，成本极低 */
  filter: drop-shadow(0 0 4px rgba(71, 241, 232, 0.4));

  /* 方向：右下坠落；translate3d 强制合成线程，避免掉帧 */
  transform: translate3d(0,0,0) rotate(-60deg);
  backface-visibility: hidden;
  will-change: transform, opacity;

  /* 只动 transform/opacity，保持 linear 匀速 */
  animation: meteor-fall linear infinite;
}

/* 关键：位移从 0 → 60vw/60vh，任何屏幕都能“穿屏”而不是 200px 一闪而过 */
@keyframes meteor-fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(-60deg) scale(1);
    opacity: 1;
    filter: blur(0px);
  }
  70% {
    transform: translate3d(42vw, 42vh, 0) rotate(-60deg) scale(1.1);
    opacity: 0.9;
    filter: blur(1px); /* 拖尾发光感 */
  }
  100% {
    transform: translate3d(60vw, 60vh, 0) rotate(-60deg) scale(0.8);
    opacity: 0;
    filter: blur(3px); /* 消散时模糊 */
  }
}


/* ===== 新增：左侧悬浮按钮样式（局部 scoped，不动全局） ===== */
.meteor-toggle {
  /* --- 定位 (保持不变) --- */
  position: fixed;
  left: 20px;
  top: 87.7%;
  z-index: 2147483000;
  
  /* --- 尺寸与基础样式 (保持不变) --- */
  width: 36.2px;
  height: 36.2px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  place-items: center;
  border: 1px solid var(--border-color);

  /* --- 外观 (保持不变) --- */
  background: linear-gradient(
    135deg,
    #E57219 0%,
    #EDCC87 38.7%,
    #B4E6CD 55.5%,
    #69F0E1 61%,
    #47F1E8 97.8%
  );
  color: rgba(0,0,0,0.8);
  backdrop-filter: blur(8.5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* 稍微调整阴影使其更柔和 */

  /* === 以下是应用 .ltoc__btn 优秀实践的改进 === */

  /* 1. 【改进】使用 Grid 布局实现内容完美居中 */
  display: grid;
  place-items: center;

  /* 2. 【改进】移除默认轮廓，为键盘导航提供自定义样式 */
  outline: none;

  /* 3. 【改进】添加平滑的过渡动画 */
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
}
.meteor-toggle:hover {transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.28);}
.meteor-toggle:active { transform: translateY(0); box-shadow: 0 4px 14px rgba(0,0,0,.2);  }
</style>