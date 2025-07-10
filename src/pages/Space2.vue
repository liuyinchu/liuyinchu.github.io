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
      <p class="intro-quote">
        “No site is an island entire of itself; every site is a piece of the continent, a part of the main. We are all connected by the invisible threads of the web, each a lighthouse shining in the digital sea.”
      </p>
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
      <li><span class="icon">1.</span>没想好……</li>
      <li><span class="icon">2.</span>也没想好……</li>
      <li><span class="icon">3.</span>支持 SYSU.SPA 喵！</li>
    </ul>
    <div class="important-notice">
      <span class="icon">⚠️</span>本站坚决不与任何包含 违法犯罪、色情暴力、政治舆论、国家机密、恶意推广、人身攻击 等内容的站点交换链接。
    </div>
  </div>
  <div class="format-section">
    <h3 class="section-title-small">申请格式</h3>
    <p>请在留言板或通过其他方式提供以下信息：</p>
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

</style>