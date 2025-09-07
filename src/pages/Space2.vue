<script setup>
import { ref, onMounted } from 'vue'
import FriendCard from '../components/FriendCard.vue' // 引入卡片组件
import ContentBlock from '../components/ContentBlock.vue' // 复用我们之前的组件

const friends = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/friends.json')
    friends.value = await res.json()
  } catch (error) {
    console.error("无法加载邻居列表:", error)
  }
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>网络邻居</h1>
      <section class="contrib-section" aria-label="GitHub contributions">
        <img
          src="/fig/friends.svg"
          alt="相知无远近，万里尚为邻。"
          class="contrib-img"
          loading="lazy"
        />
      </section>
      <!-- <p class="intro-quote">
        相知无远近，万里尚为邻。
      </p> -->
<!-- <p class="intro-quote">
        At what station must our farewells be kissed,<br>
        Where wind from rose is endlessly dismissed?<br>
        You and I, we watch the falling snow,<br>
        As holy hands let all deceptions go.<br>
        <br>
        In what season of life will we relent?<br>
        Your hand retreats—an art, an aesthetic scent.<br>
        Love was a fire you fanned and then forsook,<br>
        Leaving me to a path of darkened look.<br>
        <br>
        I drink the snow on peaks where gales confess,<br>
        They whisper of a rose you once possessed.<br>
        May this flurry of white now be my tears,<br>
        To grant you all the light of springtime years.<br>
        <br>
        Invincible, I hide my heart's affair,<br>
        Only the moon knows the glorious despair.<br>
        This sorrow's beauty is for me to bear,<br>
        As snow in winter—not so very rare.<br>
      </p> -->
    </header>

    <div class="friends-grid">
      <FriendCard
        v-for="friend in friends"
        :key="friend.link"
        :name="friend.name"
        :link="friend.link"
        :desc="friend.desc"
      />
    </div>

    <div class="exchange-container">
  <div class="rules-section">
    <h2 class="section-title">成为邻居</h2>
    <p class="section-intro">很高兴能与你在这片数字空间相遇。如果你的站点也满足以下基本要求，欢迎随时与我联系，交换友链。</p>
    <ul>
      <li><span class="icon">1.</span>网站性质不涉及商业/政治/色情/灰色/版权/破解/企业/经营/影音/小说/软件破解/内容不明等，内容有一定质量；</li>
      <li><span class="icon">2.</span>非空壳网站，能长期存活和更新；</li>
      <li><span class="icon">3.</span>如果可以的话，请支持 SYSU.SPA ！</li>
    </ul>
    <div class="important-notice">
      <span class="icon">⚠️</span>本站坚决不与任何包含 违法犯罪、色情暴力、政治舆论、国家机密、恶意推广、人身攻击 等内容的站点交换链接。
    </div>
  </div>
  <div class="format-section">
    <h3 class="section-title-small">申请格式</h3>
    <p>请在本站的 Issues 中或通过其他方式提供格式如下的相关信息（以我自己的网站为例）：</p>
    <pre><code><span class="token key">"name"</span><span class="token punc">:</span> <span class="token str">"LiuYinChu'Space"</span><span class="token punc">,</span>
<span class="token key">"link"</span><span class="token punc">:</span> <span class="token str">"https://liuyinchu.github.io"</span><span class="token punc">,</span>
<span class="token key">"desc"</span><span class="token punc">:</span> <span class="token str">"祝你有晴朗的一天！"</span></code></pre>
  </div>
</div>

  </div>
</template>

<style scoped>
.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-header h1 {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--primary-color);
}

.page-header .intro-quote {
  font-size: 1.1rem;
  margin-top: 1rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.8;
  color: var(--ctp-mocha-subtext1);
  font-style: italic;
}

/* 响应式网格布局 */
.friends-grid {
  display: grid;
  /* 每列最小 300px，最大 1fr，自动填充 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.exchange-block {
  margin-top: 5rem;
}

.exchange-content p {
  margin-bottom: 1em;
}

.exchange-content ul {
  list-style-type: disc;
  padding-left: 2rem;
  margin: 1.5rem 0;
}

.exchange-content li {
  margin-bottom: 0.75rem;
}

.exchange-content pre {
  background-color: rgba(0,0,0,0.3);
  padding: 1rem;
  border-radius: 0.5rem;
  white-space: pre-wrap;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
}

/* --- 新增：成为邻居板块样式 --- */
.exchange-container {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左侧占2/3，右侧占1/3 */
  gap: 3rem;
  margin-top: 5rem;
  padding: 2.5rem;
  background-color: var(--surface-color);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}

/* 适配移动端，变为垂直布局 */
@media (max-width: 768px) {
  .exchange-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.section-title-small {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.section-intro {
  color: var(--ctp-mocha-subtext1);
  margin-bottom: 1.5rem;
}

.rules-section ul {
  list-style: none;
  padding: 0;
  color: var(--text-color);
}

.rules-section li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.rules-section .icon {
  margin-right: 0.75rem;
  margin-top: 2px;
}

.important-notice {
  margin-top: 2rem;
  padding: 1rem;
  background-color: rgba(243, 139, 168, 0.1);
  border-left: 4px solid var(--danger-color);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--ctp-mocha-subtext0);
}

.important-notice strong {
  color: var(--danger-color);
}

.format-section p {
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

/* 代码示例区样式 */
.format-section pre {
  background-color: var(--ctp-mocha-crust); /* 比 surface 更深的颜色 */
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  white-space: pre-wrap;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.token.key { color: var(--ctp-mocha-mauve); }
.token.punc { color: var(--ctp-mocha-subtext1); }
.token.str { color: var(--ctp-mocha-green); }

.contrib-section {
  width: min(var(--contrib-max-width), var(--contrib-h-margins));
  margin: var(--contrib-space-top) auto var(--contrib-space-bottom) auto;
}

.contrib-img {
  display: block;       /* 块级元素，避免行内缝隙 */
  width: 35%;          /* 自适应宽度 */
  height: auto;        /* 保持纵横比 */
  margin: 0 auto;      /* 水平居中 */
  /* 不要阴影/描边：确保“无分割痕迹” */
}

</style>