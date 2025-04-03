<script setup>
import TypingTitle from '../components/TypingTitle.vue'
import ContentBlock from '../components/ContentBlock.vue'
import { ref, onMounted } from 'vue'

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

const visitorCountAvailable = true // 控制是否启用 busuanzi

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
  <!-- 打字区 + 渐变背景 -->
  <section class="hero-section">
    <TypingTitle />
  </section>

  <!-- 主体板块区域 -->
  <div class="main-content fade-in">

  <ContentBlock title="分享" backgroundImage="/bg/share.jpeg">
    <p class="block-intro">在这里，我收藏并整理了最愿意与你分享的代码、资源与笔记。</p>
    <div class="block-content">
      <RouterLink to="/code" class="btn">代码</RouterLink>
      <RouterLink to="/resource" class="btn">资源链接</RouterLink>
      <RouterLink to="/notes" class="btn">笔记</RouterLink>
      <a href="https://github.com/TaLEsCuber/CoLabR" class="btn" target="_blank">实验报告</a>
    </div>
  </ContentBlock>

  <ContentBlock title="开放空间" backgroundImage="/bg/open.jpeg">
    <p class="block-intro">我想在此写下思考的片段，也留下一些日后展开的可能。</p>
    <div class="block-content">
      <RouterLink to="/space1" class="btn">讨论</RouterLink>
      <RouterLink to="/space2" class="btn">未开放</RouterLink>
    </div>
  </ContentBlock>

  <ContentBlock title="网络邻居" backgroundImage="/bg/neighbor.jpeg">
    <p class="block-intro">
      我悄然注视着他们，如同在一个温柔的社区里漫步。<br />
      那里的每一位邻居，都像是命运精心编织的音符——<br />
      有的旋律与我悠然共鸣，有的则只是匆匆过客，留下淡淡的印记。
    </p>
    <div class="block-content">
      <a href="https://huanyushi.github.io" class="btn" target="_blank">本学院一位19级大佬</a>
      <a href="https://www.yykspace.com" class="btn" target="_blank">物理学院一位20级大佬</a>
      <a href="https://talescuber.github.io" class="btn" target="_blank">学物理太多导致的</a>
    </div>
  </ContentBlock>

  <ContentBlock title="神秘空间" backgroundImage="/bg/liuyin.jpg">
    <p class="block-intro">
      我曾安眠，赤染之茧；<br />
      自破碎的天空坠落；<br />
      沉睡在静默的星河。<br /><br />
      我会看见，飞萤之火；<br />
      自无梦的长夜亮起；<br />
      绽放在终竟的明天。
    </p>
  </ContentBlock>

    <!-- ✅ 新增访客板块 -->
    <ContentBlock title="访客" backgroundImage="/bg/visitor.jpeg">
      <!-- 第一行：日期 + 总访问量 -->
      <div class="visitor-row">
        <span>{{ today }}</span>
        <span v-if="visitorCountAvailable" id="busuanzi_container_site_pv">
          | 总访问量：<span id="busuanzi_value_site_pv"></span> 次
        </span>
      </div>

      <!-- 第二行：访客信息 -->
      <div class="visitor-row">
        <span>你的IP：<b>{{ visitorInfo.ip }}</b></span>
        <span>来自：<b>{{ visitorInfo.country }}</b></span>
        <span>浏览器：<b>{{ visitorInfo.browser }}</b></span>
        <span>系统：<b>{{ visitorInfo.os }}</b></span>
      </div>

      <!-- 第三行：欢迎语（可点击） -->
      <div class="visitor-greeting">
        <a href="/bg/welcome.jpg" target="_blank">
          欢迎你的到来，祝你有晴朗的一天 ☀️
        </a>
      </div>
    </ContentBlock>

    <footer class="footer">
      <p>
        GitHub: <a href="https://github.com/pifuyuini" target="_blank">GitHub</a> |
        Email: <a href="mailto:your@email.com">your@email.com</a> |
        <RouterLink to="/about">About</RouterLink> |
        <RouterLink to="/credit">Copyright</RouterLink>
      </p>
    </footer>
  </div>
</template>
