<template>
  <h1
    class="typing"
    :aria-label="displayedText"
    aria-live="polite"
    @pointerdown="onTap"
  >
    <span class="typing__text">{{ displayedText }}</span><span class="cursor" aria-hidden="true">|</span>
  </h1>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/** ===== 可按需自定义（也可从父组件以 props 传入） ===== */
const texts = [
  "欢迎来到我的个人网站！",
  "个人网站高能回，流萤厨献给流萤的真挚情书！",
  "接下来将继续不随机的播放一些（无意义的）字幕。",
  "Welcome to LiuYinChu'Space.",
  "为天地立心，为生民立命，为往圣继绝学，为万世开太平。",
  "Explore unknown possibilities.",
  "致虚极，守静笃。",
  "Make each day your masterpiece.",
  "恒兀兀以穷年，日乾乾而夕惕。",
  "Journey of a thousand miles begins with single step.",
  "志之所趋，无远弗届，穷山距海，不能限也。",
  "Talk is cheap. Show me the code.",
  "记录，为了更深刻地思考。",
  "Now Code is also cheap. Show me the prompt.",
  "庸德之行，庸言之谨。",
  "今天依旧晴朗，我亲爱的流萤。"
]

/** 速率与停顿（ms） */
const baseTyping = 90          // 基础打字速度
const baseErasing = 55         // 基础回删速度
const pauseAfterTyping = 1600  // 打完一行后的停顿
const pauseAfterErase  = 420   // 擦除后的停顿
const caretBlinkMs = 850       // 光标闪烁节奏（配合 CSS steps）

/** 标点智能停顿（叠加到当前字符之后） */
const punctPause = new Map([
  [',', 120], ['，', 140], ['、', 160], [';', 160], ['；', 180], [':', 160], ['：', 180],
  ['.', 260], ['。', 320], ['!', 320], ['！', 360], ['?', 360], ['？', 380],
  ['…', 520], ['—', 260]
])

/** ===== 运行态 ===== */
const displayedText = ref('')
let abort = false
let hardSkip = false         // 点击后快速完成/跳过
let idx = 0                  // 当前行索引
let visibilityPaused = false // 后台暂停

/** 精确延时（可见性/退出/快进感知） */
const delay = (ms) => new Promise((resolve) => {
  if (ms <= 0) return resolve()
  const start = performance.now()
  function tick(now) {
    if (abort) return resolve()           // 组件卸载
    if (hardSkip) return resolve()        // 用户点击快进
    if (visibilityPaused) {               // 后台暂停：不推进计时
      return requestAnimationFrame(tick)
    }
    if (now - start >= ms) return resolve()
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

/** 逐字打字（Unicode 安全） */
async function typeOut(str) {
  const chars = Array.from(str)
  displayedText.value = ''
  for (let i = 0; i < chars.length; i++) {
    if (abort) return
    if (hardSkip) { displayedText.value = str; return }
    displayedText.value += chars[i]

    // 基础速率 + 标点停顿
    const extra = punctPause.get(chars[i]) ?? 0
    await delay(baseTyping + extra)
  }
}

/** 逐字回删 */
async function eraseAll(str) {
  const chars = Array.from(str)
  for (let i = chars.length; i > 0; i--) {
    if (abort) return
    if (hardSkip) { displayedText.value = ''; return }
    displayedText.value = chars.slice(0, i - 1).join('')
    await delay(baseErasing)
  }
}

/** 主循环（按给定顺序，不随机） */
async function loop() {
  while (!abort) {
    const text = texts[idx % texts.length]
    hardSkip = false

    await typeOut(text)
    await delay(pauseAfterTyping)

    await eraseAll(text)
    await delay(pauseAfterErase)

    idx++
  }
}

/** 点击：若在打字阶段 → 直接补全；若在停顿/已完成 → 直接跳到下一条 */
function onTap() {
  // 第一次点击使当前阶段快速结束；若已结束，会在下个 await 立即推进
  hardSkip = true
  // 连续点击也能快速连跳
  // 下一轮开始时会重置 hardSkip=false
}

/** 可见性变化：后台不走时间，回到前台继续 */
function onVisibility() {
  visibilityPaused = document.hidden
}

/** 初始化与清理 */
onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility, { passive: true })
  loop()
})

onBeforeUnmount(() => {
  abort = true
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
/* 避免布局跳动：给文本容器一个最小高度（按大字号估算一行） */
.typing {
  /* 响应式字号：手机更小，超宽屏更大 */
  font-size: clamp(1.6rem, 3.2vw, 3.5rem);
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: var(--ctp-mocha-text);
  margin: 0;
  /* 提升中英文混排的观感 */
  -webkit-font-smoothing: antialiased;
  font-kerning: normal;
  font-variant-ligatures: common-ligatures contextual;
  /* 防止宽度抖动的小技巧：等宽占位的光标宽度由 CSS 控制 */
  white-space: pre-wrap;
}

/* 原版 */
/* .typing__text {text-shadow: 0 0 0.5px rgba(0,0,0,0.2);} */

/* 渐变测试版 */
.typing__text {
  background: linear-gradient(
    135deg,
    #E57219 0%,
    #EDCC87 20.7%,
    #B4E6CD 40.5%,
    #69F0E1 61%,
    #47F1E8 97.8%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* Safari/Chrome */
  background-clip: text;                 /* Firefox */
  color: transparent;
}

/* 光标：使用 steps(1) 减少中间帧重绘，视觉稳定 */
.cursor {
  display: inline-block;
  width: 0.6ch;          /* 与字符网格对齐，避免挤动文本 */
  margin-left: 0.1ch;
  animation: caret-blink var(--caret-ms, 850ms) steps(1, end) infinite;
  color: var(--text-color);
}

@keyframes caret-blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

/* 用户系统偏好减少动效：直接显示首条并周期切换，无逐字动画（由 JS 的 pause 感知配合） */
@media (prefers-reduced-motion: reduce) {
  .cursor { display: none; animation: none; }
}
</style>
