<script setup>
import TypingTitle from '../components/TypingTitle.vue'
import ContentBlock from '../components/ContentBlock.vue'
import { ref, onMounted } from 'vue'

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

  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    visitorInfo.value.ip = data.ip
    visitorInfo.value.country = data.country_name
  } catch (e) {
    visitorInfo.value.ip = '无法获取'
  }
})
</script>

<template>
  
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
        <RouterLink to="/resource" class="glass-btn">资源链接</RouterLink>
        <RouterLink to="/notes" class="glass-btn">笔记与文件</RouterLink>
        <RouterLink to="/labreport" class="glass-btn">实验报告分享</RouterLink>
      </div>
    </ContentBlock>

    <ContentBlock title="开放空间" backgroundImage="/bg/open.jpeg">
      <div class="grid-layout">
        <RouterLink to="/postit" class="glass-btn">日志与碎碎念</RouterLink>
        <RouterLink to="/space1" class="glass-btn">随记</RouterLink>
        <RouterLink to="/space2" class="glass-btn">网络邻居</RouterLink>
      </div>
    </ContentBlock>

    <ContentBlock title="学术研究" backgroundImage="/bg/snow_mountain_starry_sky_aurora.jpeg">
      <div class="grid-layout">
        <RouterLink to="/research" class="glass-btn">我的学术主页</RouterLink>
        <RouterLink to="/academic" class="glass-btn">个人学术简历</RouterLink>  
        <RouterLink to="/paper-switch-brush" class="glass-btn">每日论文</RouterLink>
      </div>
    </ContentBlock>
  </div>
</template>

<style scoped>
/* 保持原有的居中样式 */
.centered-text {
  text-align: center;
  margin-bottom: 1rem;
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
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff; /* 默认白色文字 */
  text-decoration: none;
  text-align: center;
  
  /* 玻璃背景核心代码 */
  background: rgba(255, 255, 255, 0.15); /* 低透明度白底 */
  backdrop-filter: blur(8px);           /* 背景模糊 */
  -webkit-backdrop-filter: blur(8px);   /* Safari 兼容 */
  
  /* 边框与圆角 */
  border: 1px solid rgba(255, 255, 255, 0.25); /* 细微的白边框 */
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
</style>