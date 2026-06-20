<script setup>
import TypingTitle from '../components/TypingTitle.vue'
import ContentBlock from '../components/ContentBlock.vue'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

/* ----------------------------------------------------------------
   逻辑部分完全保持原样 (100% Original Logic)
---------------------------------------------------------------- */
const today = new Date().toLocaleDateString()

const visitorInfo = ref({
  ip: 'Loading...',
  country: '未知',
  browser: '未知',
  os: '未知'
})

const INTRO_STORAGE_KEY = 'liuyinchu-home-entry-seen'
const INTRO_DURATION = 3600
const INTRO_SETTLE_DELAY = 420

const introWords = [
  'Hi',
  'Space',
  'Journey',
  'Explore',
  'Record',
  'Create',
  'Code',
  'Project',
  'Resource',
  'Research',
  'Academic',
  'Welcome'
]

function shouldShowIntroOnFirstPaint() {
  const hasSeenIntro = window.localStorage.getItem(INTRO_STORAGE_KEY) === 'true'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return !hasSeenIntro && !reduceMotion
}

const showIntro = ref(shouldShowIntroOnFirstPaint())
const introProgress = ref(0)
const introOffset = ref(0)
const introWordTrack = ref(null)

let introFrameId = 0
let introFinishTimer = 0
let originalBodyOverflow = ''

function easeIntro(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getIntroWordHeight() {
  const firstWord = introWordTrack.value?.firstElementChild
  return firstWord?.getBoundingClientRect().height || 96
}

function rememberIntro() {
  window.localStorage.setItem(INTRO_STORAGE_KEY, 'true')
}

function finishIntro(shouldRemember = true) {
  if (introFrameId) {
    window.cancelAnimationFrame(introFrameId)
    introFrameId = 0
  }

  if (introFinishTimer) {
    window.clearTimeout(introFinishTimer)
    introFinishTimer = 0
  }

  if (showIntro.value) {
    document.body.style.overflow = originalBodyOverflow
  }

  showIntro.value = false
  introProgress.value = 100

  if (shouldRemember) rememberIntro()
}

async function startIntro() {
  showIntro.value = true
  introProgress.value = 0
  introOffset.value = 0
  originalBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  await nextTick()

  const startedAt = window.performance.now()
  const lastWordIndex = introWords.length - 1

  function animate(now) {
    const rawProgress = Math.min((now - startedAt) / INTRO_DURATION, 1)
    const easedProgress = easeIntro(rawProgress)
    const wordHeight = getIntroWordHeight()

    introProgress.value = easedProgress * 100
    introOffset.value = -lastWordIndex * wordHeight * easedProgress

    if (rawProgress < 1) {
      introFrameId = window.requestAnimationFrame(animate)
      return
    }

    introProgress.value = 100
    introOffset.value = -lastWordIndex * wordHeight
    introFinishTimer = window.setTimeout(() => finishIntro(true), INTRO_SETTLE_DELAY)
  }

  introFrameId = window.requestAnimationFrame(animate)
}

function startIntroIfNeeded() {
  const hasSeenIntro = window.localStorage.getItem(INTRO_STORAGE_KEY) === 'true'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (hasSeenIntro) return

  if (reduceMotion) {
    rememberIntro()
    return
  }

  startIntro()
}

function parseVisitorDevice() {
  const ua = navigator.userAgent
  const platform = navigator.platform

  let browser = '未知'
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Edg')) browser = 'Edge'

  let os = '未知'
  if (platform.includes('Mac')) os = 'macOS'
  else if (platform.includes('Win')) os = 'Windows'
  else if (/Linux|X11/.test(platform)) os = 'Linux'

  visitorInfo.value.browser = browser
  visitorInfo.value.os = os
}

const visitorCountAvailable = true

onMounted(async () => {
  parseVisitorDevice()
  startIntroIfNeeded()

  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    visitorInfo.value.ip = data.ip
    visitorInfo.value.country = data.country_name
  } catch (e) {
    visitorInfo.value.ip = '无法获取'
  }
})

onBeforeUnmount(() => {
  finishIntro(false)
})
</script>

<template>
  <Transition name="entry-intro">
    <div
      v-if="showIntro"
      class="entry-intro"
      role="status"
      aria-live="polite"
      aria-label="Welcome to LiuYinChu'Space"
    >
      <div class="entry-progress" aria-hidden="true">
        <div
          class="entry-progress__bar"
          :style="{ width: `${introProgress}%` }"
        ></div>
      </div>

      <div class="entry-word-stage" aria-hidden="true">
        <div
          ref="introWordTrack"
          class="entry-word-track"
          :style="{ transform: `translate3d(0, ${introOffset}px, 0)` }"
        >
          <div
            v-for="word in introWords"
            :key="word"
            class="entry-word"
          >
            {{ word }}
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <section class="typing-screen">
    <TypingTitle />
  </section>

  <div class="main-content">

    <ContentBlock title="访客信息" backgroundImage="/bg/liuyin.jpg">
      <div class="centered-text">
        <p>{{ today }}
          <span v-if="visitorCountAvailable" id="busuanzi_container_site_pv">
            | 总访问量：<span id="busuanzi_value_site_pv"></span> 次
          </span>
        </p>

        <p><span>你的IP：<b>{{ visitorInfo.ip }}；</b></span>
        <span>来自：<b>{{ visitorInfo.country }}；</b></span>
        <span>浏览器：<b>{{ visitorInfo.browser }}；</b></span>
        <span>系统：<b>{{ visitorInfo.os }}</b></span></p>

        <p>
          <img src="/fig/welcome.svg" alt="Welcome" width="50%">
        </p>
      </div>
    </ContentBlock>
    
    <ContentBlock title="共享内容" backgroundImage="/bg/share.jpeg">
      <div class="grid-layout">
        <RouterLink to="/code" class="glass-btn">代码与项目</RouterLink>
        <RouterLink to="/rd" class="glass-btn">资源链接</RouterLink>
        <!-- <RouterLink to="/notes" class="glass-btn">笔记与文件</RouterLink> -->
        <RouterLink to="/labreport" class="glass-btn">实验报告</RouterLink>
      </div>
    </ContentBlock>

    <ContentBlock title="开放空间" backgroundImage="/bg/open.jpeg">
      <div class="grid-layout">
        <!-- <RouterLink to="/postit" class="glass-btn">日志与碎碎念</RouterLink> -->
        <RouterLink to="/space1" class="glass-btn">随记</RouterLink>
        <RouterLink to="/space2" class="glass-btn">网络邻居</RouterLink>
      </div>
    </ContentBlock>

    <ContentBlock title="学术研究" backgroundImage="/bg/snow_mountain_starry_sky_aurora.jpeg">
      <div class="grid-layout">
        <RouterLink to="/research" class="glass-btn">我的学术主页</RouterLink>
        <RouterLink to="/academic" class="glass-btn">个人学术简历</RouterLink>  
        <!-- <RouterLink to="/paper-switch-brush" class="glass-btn">每日论文</RouterLink> -->
      </div>
    </ContentBlock>
  </div>
</template>

<style scoped>
.entry-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #cdd6f4;
  background:
    linear-gradient(180deg, rgba(17, 17, 27, 0.96), rgba(30, 30, 46, 0.98)),
    #1e1e2e;
}

.entry-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  overflow: visible;
  background: rgba(205, 214, 244, 0.22);
  box-shadow: 0 1px 18px rgba(137, 180, 250, 0.22);
}

.entry-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #74c7ec, #cba6f7, #f5c2e7);
  box-shadow:
    0 0 18px rgba(137, 180, 250, 0.72),
    0 0 34px rgba(203, 166, 247, 0.52);
  transition: width 80ms linear;
}

.entry-word-stage {
  position: relative;
  width: min(86vw, 920px);
  height: clamp(3.8rem, 8.4vw, 6.2rem);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 24%,
    #000 76%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 24%,
    #000 76%,
    transparent 100%
  );
}

.entry-word-track {
  will-change: transform;
}

.entry-word {
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(3.8rem, 8.4vw, 6.2rem);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(2.45rem, 8.5vw, 5.65rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  color: #f5f6ff;
  text-shadow: 0 16px 52px rgba(137, 180, 250, 0.28);
}

.entry-intro-enter-active,
.entry-intro-leave-active {
  transition: opacity 0.45s ease;
}

.entry-intro-enter-from,
.entry-intro-leave-to {
  opacity: 0;
}

/* 保持原有的居中样式 */
.centered-text {
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'LXGW WenKai';
}

/* ------------------------------------------------------------
   修改点 2: 布局样式 (Grid Layout)
   不再使用 flex 乱排，而是使用 Grid 保证按钮等宽、对齐
------------------------------------------------------------ */
.grid-layout {
  display: grid;
  /* 自动适应宽度，每列至少 110px，自动填充 */
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 1rem; /* 按钮之间的间距 */
  margin-top: 1.2rem;
  padding: 0 0.5rem;
  font-family: 'LXGW WenKai';
}

/* ------------------------------------------------------------
   修改点 3: 按钮样式 (Glassmorphism)
   磨砂玻璃质感，去掉了土气的渐变色
------------------------------------------------------------ */
.glass-btn {
  /* 布局与文字 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.5rem; /* 上下内边距 */
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff; /* 默认白色文字 */
  text-decoration: none;
  text-align: center;
  
  /* 玻璃背景核心代码 */
  background: (255, 255, 255, 0.25); /* 低透明度白底 */
  backdrop-filter: blur(16px);           /* 背景模糊 */
  -webkit-backdrop-filter: blur(16px);   /* Safari 兼容 */
  
  /* 边框与圆角 */
  border: 2px solid rgba(255, 255, 255, 0.3); /* 细微的白边框 */
  border-radius: 12px; /* 稍微现代一点的圆角，不是全圆 */
  
  /* 阴影 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* 动画 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 悬停状态：高亮、上浮 */
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.9); /* 变实 */
  color: #333; /* 文字变深色，形成反差 */
  border-color: #fff;
  transform: translateY(-3px); /* 微微上浮 */
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2); /* 阴影加深 */
}

/* 点击状态 */
.glass-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
@media (max-width: 768px) {
  .entry-progress {
    height: 7px;
  }

  .entry-word-stage,
  .entry-word {
    height: clamp(3.15rem, 14vw, 4.6rem);
  }

  .entry-word {
    font-size: clamp(2.2rem, 12vw, 4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry-intro-enter-active,
  .entry-intro-leave-active,
  .entry-progress__bar {
    transition: none;
  }
}
</style>
