<script setup>
const dockGroups = [
  {
    name: 'Advanced AI',
    color: '#cba6f7', // Mocha - Mauve
    links: [
      { name: 'ChatGPT', url: 'https://chat.openai.com/' },
      { name: '深度求索', url: 'https://chat.deepseek.com/' },
    ]
  },
  {
    name: '工具',
    color: '#94e2d5', // Mocha - Teal
    links: [
      { name: 'GitHub', url: 'https://github.com/' },
    ]
  },
  {
    name: '文献',
    color: '#f9e2af', // Mocha - Yellow
    links: [
      { name: 'arXiv', url: 'https://arxiv.org/' },
      { name: '小时百科', url: 'https://wuli.wiki/online/index.html' },
    ]
  },
  {
    name: '其它',
    color: '#fab387', // Mocha - Peach
    links: [
      { name: '企业微信', url: 'https://exmail.qq.com/login' },
      { name: 'Google', url: 'https://www.google.com/' },
      { name: 'YouTube', url: 'https://www.youtube.com/' },
      { name: 'B站', url: 'https://www.bilibili.com/' },
    ]
  }
]

import APlayer from 'aplayer'
import { onMounted, ref } from 'vue'
import Calendar from '../components/Calendar.vue'

const fullText = 'Wishing your day stays bright —— like sunshine that chose to stay just for you.'
const typedText = ref('')
const showCursor = ref(true)

onMounted(() => {
  let i = 0
  const interval = setInterval(() => {
    typedText.value += fullText[i]
    i++
    if (i >= fullText.length) {
      clearInterval(interval)
      showCursor.value = false  // 打完字就移除光标（或保留，下面可以自选）
    }
  }, 100)

  // 如果你希望光标一直闪烁在最后，可以注释掉上面那行
})

const aplayerContainer = ref(null)

onMounted(() => {
  new APlayer({
    container: aplayerContainer.value,
    autoplay: true,
    theme: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#1e1e2e',
    listFolded: false,
    listMaxHeight: '150px',
    audio: [
      {
        name: 'Space Walk',
        artist: 'Test Artist',
        url: '/music/space_walk.m4a',
        cover: '/music/cover/default.jpg',
      },
      {
        name: 'Second Song',
        artist: 'Someone',
        url: '/music/song2.mp3',
        cover: '/music/cover/default.jpg',
      },
      {
        name: 'Third Track',
        artist: 'Another',
        url: '/music/song3.mp3',
        cover: '/music/cover/default.jpg',
      },
      {
        name: 'Third Track',
        artist: 'Another',
        url: '/music/song3.mp3',
        cover: '/music/cover/default.jpg',
      },
      {
        name: 'Third Track',
        artist: 'Another',
        url: '/music/song3.mp3',
        cover: '/music/cover/default.jpg',
      },
    ].map(track => ({
      ...track,
      cover: track.cover || '/music/cover/default.jpg',
    })),
  })
})
</script>

<template>
  <div class="portal-wrapper">
  <div class="background-layer"></div>      <!-- 背景图 -->
  <div class="frosted-glass-layer"></div>   <!-- 毛玻璃遮罩 -->
  <div class="content-layer">               <!-- 实际内容 -->
    <div class="card frosted">
      <h1 class="big-title">Welcome!</h1>
      <p class="subtitle calligraphic">
        {{ typedText }}<span v-if="showCursor" class="cursor">|</span>
      </p>
    </div>
    <!-- 播放器 + 日历并排 -->
    <div class="row-cards">
      <div class="card frosted music-card">
        <h2 class="title">Music Player</h2>
        <div class="aplayer-wrapper">
          <div ref="aplayerContainer"></div>
        </div>
      </div>

      <div class="card frosted calendar-card">
        <h2 class="title">Calendar</h2>
        <!-- 你自己的 Calendar 组件插入这里 -->
        <Calendar class="themed-calendar" />
      </div>
    </div>
    <div class="card frosted dock-card">
      <h2 class="title">🚢 Dock</h2>
      <div class="dock-groups">
        <div
          v-for="group in dockGroups"
          :key="group.name"
          class="dock-group"
          :style="{ '--group-accent': group.color }"
        >
          <h3 class="dock-group-title">{{ group.name }}</h3>
          <div class="dock-grid">
            <a
              v-for="site in group.links"
              :key="site.url"
              :href="site.url"
              class="dock-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="`https://www.google.com/s2/favicons?sz=64&domain_url=${site.url}`"
                :alt="site.name"
                class="dock-icon"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.portal-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  height: 110%;
  display: flex;
  flex-direction: column;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 110%;
  background-image: url('/bg/welcome.jpeg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed; /* ⬅️ 背景固定在视口，可选 */
  z-index: 0;
}

.frosted-glass-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(0px);
  background-color: var(--frosted-glass);
  z-index: 1;
}

.content-layer {
  position: relative;
  z-index: 2;
  padding: 2rem;
  color: var(--text-color);
  flex: 1;
}

.card {
  padding: 0.6rem 2rem 2rem 2rem;
  border-radius: 1rem;
  backdrop-filter: blur(8.5px);
  background-color: rgba(30, 30, 46, 0.6);
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

/* 可自定义修改字号 */
.big-title {
  font-size: 3rem; /* 你可以改成 3rem 等 */
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  text-indent: 1ch; /* 大约等于两个字符宽 */
}

/* 可自定义修改字号 */
.subtitle {
  font-size: 2rem;
  color: #f2cdcd; /* 备选：#89b4fa,#74c7ec,#94e2d5*/
  margin: 0;
}

/* 使用 Playfair Display 字体（Google 字体） */
.calligraphic {
  font-family: 'Pacifico', cursive;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.aplayer-wrapper {
  max-height: 300px;
  overflow: hidden;
  border-radius: 0.5rem;
}

/* 穿透 APlayer 的样式 */
:deep(.aplayer) {
  background-color: rgba(30, 30, 46, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}

/* 播放信息标题 */
:deep(.aplayer-title) {
  color: var(--text-color);
  font-weight: bold;
}
:deep(.aplayer-author) {
  color: var(--ctp-mocha-overlay1);
}

/* 控件 hover 高亮 */
:deep(.aplayer-icon:hover svg path) {
  fill: #74c7ec !important;
}

/* 播放进度条高亮 */
:deep(.aplayer-bar) {
  background: rgba(255, 255, 255, 0.1);
}
:deep(.aplayer-played) {
  background: #74c7ec !important;
}
:deep(.aplayer-volume-bar .aplayer-volume) {
  background-color: #74c7ec !important;
}

/* 播放列表整体 */
:deep(.aplayer-list) {
  background: transparent;
}
:deep(.aplayer-list ol li) {
  background: transparent;
  color: var(--text-color);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
:deep(.aplayer-list ol li:hover) {
  background: rgba(255, 255, 255, 0.05);
}

/* ✅ 当前播放项高亮 */
:deep(.aplayer-list-light) {
  background: rgba(116, 199, 236, 0.15) !important;
}
:deep(.aplayer-list-light .aplayer-list-title),
:deep(.aplayer-list-light .aplayer-list-author) {
  color: var(--text-color) !important;
  font-weight: 600;
}

/* 编号和作者颜色柔和 */
:deep(.aplayer-list-index),
:deep(.aplayer-list-author) {
  color: var(--ctp-mocha-overlay1);
}

/* 滚动条样式 */
:deep(.aplayer-list::-webkit-scrollbar) {
  width: 6px;
}
:deep(.aplayer-list::-webkit-scrollbar-thumb) {
  background-color: rgba(116, 199, 236, 0.4);
  border-radius: 3px;
}
:deep(.aplayer-list::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(116, 199, 236, 0.7);
}

.row-cards {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.music-card {
  flex: 1 1 60%;
  max-width: 60%;
  min-width: 300px;
  height: 300px; /* 统一为 270px，适配日历 6 行 */
}

.calendar-card {
  flex: 1 1 240px;
  max-width: 300px;
  height: 300px; /* 与 music-card 完全一致 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 日历基础 */
.themed-calendar {
  flex: 1;
  background: transparent;
  color: var(--text-color);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  font-size: 0.78rem; /* 稍微缩小一点整体字号以容纳空间 */
}

/* 月份标题 */
.themed-calendar .calendar-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-color);
}

/* 网格布局 */
.themed-calendar .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
  flex: 1;
}

/* 星期标签 */
.themed-calendar .calendar-day {
  text-align: center;
  opacity: 0.6;
  font-weight: 600;
  color: var(--ctp-mocha-subtext0);
}

/* 日期单元格 */
.themed-calendar .calendar-cell {
  text-align: center;
  padding: 0.3rem 0;
  border-radius: 0.4rem;
  color: var(--text-color);
  transition: background-color 0.2s ease;
  font-size: 0.75rem;
}

/* 今天高亮 */
.themed-calendar .calendar-cell.today {
  background-color: #74c7ec;
  color: #1e1e2e;
  font-weight: bold;
}

/* hover 效果 */
.themed-calendar .calendar-cell:hover {
  background-color: rgba(255, 255, 255, 0.07);
  cursor: pointer;
}

.dock-card {
  padding: 1rem 1.5rem 2rem 1.5rem;
}

.dock-groups {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.dock-group {
  --group-accent: #89b4fa;
}

.dock-group-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--group-accent);
  margin-bottom: 0.6rem;
  padding-left: 0.25rem;
  border-left: 4px solid var(--group-accent);
}

.dock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 0.75rem;
  justify-items: start;
  align-items: center;
}

.dock-link {
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.dock-link:hover {
  background-color: var(--group-accent, rgba(255, 255, 255, 0.1));
  transform: scale(1.08);
  box-shadow: 0 0 0 1px var(--group-accent, #74c7ec33);
}

.dock-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>