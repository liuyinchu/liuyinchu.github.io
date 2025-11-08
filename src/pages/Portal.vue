<script setup>
const dockGroups = [
  {
    name: 'Advanced AI',
    color: '#cba6f7', // Mocha - Mauve
    links: [
      { name: 'ChatGPT', url: 'https://chat.openai.com/' },
      { name: '深度求索', url: 'https://chat.deepseek.com/' },
      { name: 'Suno', url: 'https://suno.com/' },
      { name: 'Gemini', url: 'https://gemini.google.com/' },
      { name: 'Grok', url: 'https://grok.com/' },
    ]
  },
  {
    name: '工具',
    color: '#94e2d5', // Mocha - Teal
    links: [
      { name: 'GitHub', url: 'https://github.com/' },
      { name: '通用格式转换', url: 'https://cloudconvert.com' },
      { name: 'LaTeX 公式编辑器', url: 'https://www.latexlive.com/' },
      { name: 'Google Translate', url: 'https://translate.google.com' },
      { name: '文件传输助手', url: 'https://filehelper.weixin.qq.com/' },
      { name: 'Bing', url: 'https://cn.bing.com/' },
      { name: 'Google', url: 'https://www.google.com/' },
      { name: 'Google Drive', url: 'https://drive.google.com/drive/home' },
      { name: '坚果云盘', url: 'https://www.jianguoyun.com/' },
    ]
  },
  {
    name: '文献',
    color: '#f9e2af', // Mocha - Yellow
    links: [
      { name: 'arXiv', url: 'https://arxiv.org/' },
      { name: '菜鸟教程', url: 'https://www.runoob.com/' },
      { name: '小时百科', url: 'https://wuli.wiki/online/index.html' },
      { name: '马克思主义文库', url: 'https://www.marxists.org/chinese/' },
      { name: 'Git教程&速查', url: 'https://liaoxuefeng.com/books/git/introduction/index.html' },
    ]
  },
  {
    name: '其它',
    color: '#fab387', // Mocha - Peach
    links: [
      { name: '网易企业邮箱', url: 'https://qy.163.com/static/login/' },
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'YouTube', url: 'https://www.youtube.com/' },
      { name: 'B站', url: 'https://www.bilibili.com/' },
      { name: '知乎', url: 'https://www.zhihu.com/' },
      { name: 'Catppuccin 调色板', url: 'https://catppuccin.com/palette/' },
      { name: 'Pixiv', url: 'https://www.pixiv.net/' },
      { name: '中山大学统一门户', url: 'https://portal.sysu.edu.cn/' },
    ]
  }
]

import APlayer from 'aplayer'
import { onMounted, ref } from 'vue'
import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue' // 引入 ToDoList 组件
import Weather from '../components/Weather.vue'   // 引入 Weather 组件

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
    listMaxHeight: '240px',
    audio: [
      {
        name: 'Space Walk',
        artist: 'HoYo-Mix',
        url: '/music/space_walk.m4a',
        cover: '/music/cover/default.jpg',
      },
      {
        name: '太空曼波～',
        artist: '还我神ID',
        url: '/music/太空曼波_还我神ID.m4a',
        cover: '/music/cover/default.jpg',
      },
      { name: '不谓侠', artist: '萧忆情Alex', url: '/music/不谓侠_萧忆情Alex.m4a', cover: '/music/cover/default5.jpg' },
      { name: 'A Letter', artist: '泽野弘之', url: '/music/a_letter.m4a', cover: '/music/cover/default4.jpg' },
      { name: 'A New Day with Hope', artist: 'HoYo-Mix', url: '/music/a_new_day_with_hope.m4a', cover: '/music/cover/default2.jpg' },
      { name: 'Cage', artist: '泽野弘之', url: '/music/cage.m4a', cover: '/music/cover/default3.jpg' },
      { name: 'Call Your Name (Gv)', artist: '泽野弘之', url: '/music/call_your_name_gv.m4a', cover: '/music/cover/default.jpg' },
      { name: 'Flower Dance', artist: 'DJ Okawari', url: '/music/flower_dance.m4a', cover: '/music/cover/default3.jpg' },
      { name: '只对你有感觉', artist: '飞轮海', url: '/music/只对你有感觉_飞轮海.m4a', cover: '/music/cover/default6.jpg' },
      { name: '红色高跟鞋', artist: '蔡健雅', url: '/music/红色高跟鞋_蔡健雅.m4a', cover: '/music/cover/default5.jpg' },
      { name: 'narrative', artist: '泽野弘之', url: '/music/narrative.m4a', cover: '/music/cover/default2.jpg' },
      { name: 'ninelie', artist: 'Aimer', url: '/music/ninelie.m4a', cover: '/music/cover/default4.jpg' },
      { name: '一等情事', artist: '许一鸣', url: '/music/一等情事_许一鸣.m4a', cover: '/music/cover/default7.jpg' },
      { name: 'Puppet in the Dark', artist: 'FELT', url: '/music/puppet_in_the_dark.m4a', cover: '/music/cover/default.jpg' },
      { name: 'Revolution', artist: 'The Score', url: '/music/revolution.m4a', cover: '/music/cover/default.jpg' },
      { name: 'sh0ut', artist: 'SawanoHiroyuki[nZk]', url: '/music/sh0ut.m4a', cover: '/music/cover/default3.jpg' },
      { name: 'The Opening', artist: '塞壬唱片', url: '/music/the_opening.m4a', cover: '/music/cover/default.jpg' },
      { name: '知我', artist: '哦漏', url: '/music/知我_哦漏.m4a', cover: '/music/cover/default.jpg' },
      { name: '皎洁的笑颜', artist: '陈致逸', url: '/music/皎洁的笑颜_陈致逸.m4a', cover: '/music/cover/default7.jpg' },
      { name: '爱情转移', artist: '陈奕迅', url: '/music/爱情转移_陈奕迅.mp3', cover: '/music/cover/default2.jpg' },
      { name: 'LOVE Theme from TIGA', artist: '矢野立美', url: '/music/LOVE_Theme_from_TIGA_矢野立美.m4a', cover: '/music/cover/default5.jpg' },
      { name: '不是因为寂寞才想你', artist: 'T.R.Y', url: '/music/不是因为寂寞才想你.m4a', cover: '/music/cover/default4.jpg' },
      { name: '关键词', artist: '林俊杰', url: '/music/关键词_林俊杰.m4a', cover: '/music/cover/default.jpg' },
      { name: '跳楼机（1.1曼波版）', artist: '曼波~曼波~', url: '/music/跳楼机_曼波版.m4a', cover: '/music/cover/default6.jpg' },
      { name: '关山酒', artist: '兰音Reine', url: '/music/关山酒_兰音.m4a', cover: '/music/cover/default3.jpg' },
      { name: '环佩凭栏望千帆', artist: '陈致逸', url: '/music/环佩凭栏望千帆_陈致逸.m4a', cover: '/music/cover/default7.jpg' },
      { name: '花海', artist: '周杰伦', url: '/music/花海.m4a', cover: '/music/cover/cute_cat1.png' },
      { name: '画', artist: '邓紫棋', url: '/music/画.m4a', cover: '/music/cover/default4.jpg' },
      { name: '几初的智愿', artist: 'HoYo-Mix', url: '/music/几初的智愿.m4a', cover: '/music/cover/default.jpg' },
      { name: '寂寞沙洲冷', artist: '周传雄', url: '/music/寂寞沙洲冷_周传雄.mp3', cover: '/music/cover/default3.jpg' },
      { name: '流光记', artist: '银临', url: '/music/流光记_银临.m4a', cover: '/music/cover/default.jpg' },
      { name: '眉间雪', artist: '晴愔', url: '/music/眉间雪.m4a', cover: '/music/cover/default2.jpg' },
      { name: '天涯过客', artist: '周杰伦', url: '/music/天涯过客_周杰伦.m4a', cover: '/music/cover/cute_cat1.png' },
      { name: '天地缓缓', artist: '兰音Reine', url: '/music/天地缓缓_兰音Reine.m4a', cover: '/music/cover/default5.jpg' },
      { name: '七里香', artist: '周杰伦', url: '/music/七里香_周杰伦.mp3', cover: '/music/cover/default.jpg' },
      { name: '如果当时', artist: '许嵩', url: '/music/如果当时.m4a', cover: '/music/cover/default.jpg' },
      { name: '若我不曾见过太阳', artist: '知更鸟', url: '/music/若我不曾见过太阳.m4a', cover: '/music/cover/default2.jpg' },
      { name: '舍离去', artist: '兰音Reine', url: '/music/舍离去_兰音.m4a', cover: '/music/cover/default.jpg' },
      { name: '使一颗心免于哀伤', artist: '知更鸟', url: '/music/使一颗心免于哀伤.m4a', cover: '/music/cover/default.jpg' },
      { name: '听我说', artist: '周深', url: '/music/听我说_周深.m4a', cover: '/music/cover/cute_toy_skadi.png' },
      { name: '手写的从前', artist: '周杰伦', url: '/music/手写的从前.m4a', cover: '/music/cover/default2.jpg' },
      { name: '祝福', artist: 'YOASOBI', url: '/music/祝福_YOASOBI.m4a', cover: '/music/cover/default6.jpg' },
      { name: '烟雨行舟', artist: '伦桑', url: '/music/烟雨行舟_伦桑.m4a', cover: '/music/cover/default5.jpg' },
      { name: '天军行阵乐', artist: 'Poe(CN)', url: '/music/天军行阵乐.flac', cover: '/music/cover/default4.jpg' },
      { name: '突然的自我', artist: '伍佰', url: '/music/突然的自我_伍佰.mp3', cover: '/music/cover/default.jpg' },
      { name: '我们的歌谣', artist: '凤凰传奇', url: '/music/我们的歌谣_凤凰传奇.m4a', cover: '/music/cover/default3.jpg' },
      { name: '循迹', artist: '王子健', url: '/music/循迹_王子健.m4a', cover: '/music/cover/cute_toy_skadi.png' },
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

      <!-- <div class="card frosted calendar-card">
        <h2 class="title">Calendar</h2>
        <Calendar class="themed-calendar" />
      </div> -->
      <div class="card frosted weather-card">
        <h2 class="title">Weather</h2>
        <Weather />
      </div>
    </div>
    <div class="row-cards">
      <div class="card frosted todo-card">
        <h2 class="title">ToDo List</h2>
        <ToDoList />
      </div>

      <!-- <div class="card frosted weather-card">
        <h2 class="title">Weather</h2>
        <Weather />
      </div> -->
      <div class="card frosted calendar-card">
        <h2 class="title">Calendar</h2>
        <Calendar class="themed-calendar" />
      </div>
    </div>
    <div class="card frosted dock-card">
      <h2 class="title">Dock</h2>
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
  font-family: "Verdana",-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",'Inter','Noto Serif SC','Times New Roman',serif;
}

.aplayer-wrapper {
  max-height: 400px;
  overflow: hidden;
  border-radius: 0.5rem;
}

/* 穿透 APlayer 的样式 */
:deep(.aplayer) {
  background-color: rgba(30, 30, 46, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  font-family: 'LXGW WenKai', 'Inter', sans-serif;
  color: var(--text-color);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  height: 320px;
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
  background: linear-gradient(135deg, var(--success-color), #89dceb);
  color: var(--background-color);
}

/* ✅ 当前播放项高亮 */
:deep(.aplayer-list-light) {
  background: rgba(116, 199, 236, 0.3) !important;
}
:deep(.aplayer-list-light .aplayer-list-title),
:deep(.aplayer-list-light .aplayer-list-author) {
  color: var(--text-color) !important;
  font-weight: 700;
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
  flex: 1;          /* 占满剩余空间 */
  min-width: 300px; /* 给它一个最小宽度，避免太窄 */
  height: 400px;
  display: flex;
  flex-direction: column;
}

.calendar-card {
  flex: 0 0 350px;  /* 不伸缩，固定宽度 */
  width: 350px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 日历基础 */
/* .themed-calendar {
  flex: 1;
  background: transparent;
  color: var(--text-color);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  font-size: 0.78rem; 
} */

/* 月份标题 */
/* .themed-calendar .calendar-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-color);
} */

/* 网格布局 */
/* .themed-calendar .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
  flex: 1;
} */

/* 星期标签 */
/* .themed-calendar .calendar-day {
  text-align: center;
  opacity: 0.6;
  font-weight: 600;
  color: var(--ctp-mocha-subtext0);
} */

/* 日期单元格 */
/* .themed-calendar .calendar-cell {
  text-align: center;
  padding: 0.3rem 0;
  border-radius: 0.4rem;
  color: var(--text-color);
  transition: background-color 0.2s ease;
  font-size: 0.75rem;
} */

/* 今天高亮 */
/* .themed-calendar .calendar-cell.today {
  background-color: #74c7ec;
  color: #1e1e2e;
  font-weight: bold;
} */

/* hover 效果 */
/* .themed-calendar .calendar-cell:hover {
  background-color: rgba(255, 255, 255, 0.07);
  cursor: pointer;
} */

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

.todo-card {
  flex: 1;
  min-width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.weather-card {
  flex: 0 0 350px;
  width: 350px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

/* 媒体查询，处理在小屏幕下 to-do list 宽度为 weather 的 1:1 关系 */
@media (max-width: 750px) { /* 调整断点，如果卡片宽度增加，可能需要更宽的断点 */
  .row-cards {
    flex-direction: column;
  }
  .todo-card,
  .weather-card {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: unset;
  }
}
</style>
