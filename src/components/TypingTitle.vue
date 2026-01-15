<!-- <template>
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
</style> -->
<template>
  <div class="typing-container">
    <div 
      class="typing-content"
      :aria-label="displayedText"
      aria-live="polite"
      @pointerdown="onTap"
    >
      <span class="typing-text">{{ displayedText }}</span>
      <span class="cursor" aria-hidden="true"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/** ===== 配置项 ===== */
const props = defineProps({
  // 允许从父组件覆盖默认台词
  initialTexts: {
    type: Array,
    default: () => null
  }
})

const defaultTexts = [
  "欢迎来到我的个人网站！",
  "个人网站高能回，流萤厨献给流萤的真挚情书！",
  "接下来将继续不随机的播放一些（无意义的）字幕。",
  "Welcome to LiuYinChu'Space.",
  "愿时光清浅，许你安然。",
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
  "往前看，别回头！",
  "今天依旧晴朗，我亲爱的流萤。"
]

const texts = props.initialTexts || defaultTexts

/** 速率配置 */
const baseTyping = 90
const baseErasing = 50
const pauseAfterTyping = 2000 // 稍微延长阅读时间
const pauseAfterErase  = 450

/** 标点智能停顿表 */
const punctPause = new Map([
  [',', 120], ['，', 140], ['、', 160], [';', 160], ['；', 180], [':', 160], ['：', 180],
  ['.', 260], ['。', 320], ['!', 320], ['！', 360], ['?', 360], ['？', 380],
  ['…', 520], ['—', 260]
])

/** ===== 状态 ===== */
const displayedText = ref('')
let abort = false
let hardSkip = false
let idx = 0
let visibilityPaused = false

const delay = (ms) => new Promise((resolve) => {
  if (ms <= 0) return resolve()
  const start = performance.now()
  function tick(now) {
    if (abort) return resolve()
    if (hardSkip) return resolve()
    if (visibilityPaused) return requestAnimationFrame(tick)
    if (now - start >= ms) return resolve()
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

async function typeOut(str) {
  const chars = Array.from(str)
  displayedText.value = ''
  for (let i = 0; i < chars.length; i++) {
    if (abort) return
    if (hardSkip) { displayedText.value = str; return }
    displayedText.value += chars[i]
    const extra = punctPause.get(chars[i]) ?? 0
    // 稍微引入一点随机抖动，模拟真实打字的非线性感
    const randomJitter = Math.random() * 20 - 10 
    await delay(baseTyping + extra + randomJitter)
  }
}

async function eraseAll(str) {
  const chars = Array.from(str)
  for (let i = chars.length; i > 0; i--) {
    if (abort) return
    if (hardSkip) { displayedText.value = ''; return }
    displayedText.value = chars.slice(0, i - 1).join('')
    await delay(baseErasing)
  }
}

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

function onTap() {
  hardSkip = true
}

function onVisibility() {
  visibilityPaused = document.hidden
}

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
/* 定义流萤主题色变量，方便统一调整 */
:root {
  --ff-gradient-start: #E57219; /* 暖橙 */
  --ff-gradient-mid: #EDCC87;   /* 淡金 */
  --ff-gradient-end: #47F1E8;   /* 萤火青 */
  --ff-glow-color: rgba(71, 241, 232, 0.4); /* 辉光色 */
}

.typing-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* 给一个适当的内边距，防止在大屏下太贴边 */
  padding: 2rem 1rem;
  /* 可选：增加一个极其微弱的背景容器，增强聚焦感 */
  /* background: radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%); */
}

.typing-content {
  position: relative;
  /* 响应式字号：针对移动端优化，大屏下不过大 */
  font-size: clamp(1.7rem, 4vw, 3rem);
  /* 字体栈：优先使用苹果/系统字体，保证干净利落 */
  font-family: 'LXGW WenKai', "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 800;
  line-height: 1.4;
  text-align: center;
  
  /* 防止选中，提升点击交互体验 */
  user-select: none; 
  cursor: pointer;
  
  /* 布局稳定：最小高度防止抖动 */
  min-height: 1.5em; 
  display: inline-block;
  
  /* 优化文字渲染 */
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.02em; /* 稍微收紧字间距，显得更精致 */
}

.typing-text {
  /* 核心渐变 */
  background: linear-gradient(
    120deg,
    #E57219 0%,
    #EDCC87 25%,
    #B4E6CD 50%,
    #69F0E1 75%,
    #47F1E8 100%
  );
  background-size: 200% auto; /* 拉大背景以便后续稍微流动 */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  
  /* 关键：使用 drop-shadow 而不是 text-shadow，因为 color 是 transparent */
  /* 这会给渐变文字本身增加一层淡淡的“光晕” */
  filter: drop-shadow(0 0 8px rgba(105, 240, 225, 0.3));
  
  /* 极其缓慢的背景流动，增加生命感 (可选) */
  animation: gradient-shift 8s ease infinite;
}

/* 光标设计：从“竖线”变为“能量块” */
.cursor {
  display: inline-block;
  vertical-align: middle;
  width: 0.3em;          /* 块状宽度 */
  height: 1.1em;         /* 略高于文字 */
  margin-left: 0.15em;
  margin-bottom: 0.1em;  /* 视觉对齐 */
  border-radius: 2px;
  
  /* 光标颜色取渐变末端的青色 */
  background-color: #47F1E8;
  
  /* 强烈的荧光感 */
  box-shadow: 0 0 10px #47F1E8, 0 0 20px #47F1E8;
  
  animation: blink 1s step-end infinite;
}

/* 动画定义 */
@keyframes blink {
  0%, 100% { opacity: 1; transform: scaleY(1); }
  50% { opacity: 0; transform: scaleY(0.95); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 移动端适配：光标稍微变细，避免遮挡文字 */
@media (max-width: 768px) {
  .cursor {
    width: 3px;
    box-shadow: 0 0 8px #47F1E8;
  }
}

/* 减弱动态效果偏好 */
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; opacity: 1; }
  .typing-text { animation: none; }
}
</style>