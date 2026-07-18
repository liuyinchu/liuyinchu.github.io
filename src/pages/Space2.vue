<script setup>
import { ref, onMounted } from 'vue'
import FriendCard from '../components/FriendCard.vue'

const friends = ref([])
const isLoaded = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/friends.json')
    friends.value = await res.json()
    setTimeout(() => { isLoaded.value = true }, 100)
  } catch (error) {
    console.error('无法加载邻居列表:', error)
  }
})
</script>

<template>
  <main class="neighbors-page" aria-labelledby="neighbors-title">
    <section class="neighbors-hero">
      <div class="hero-copy">
        <p class="kicker">CYBER NEIGHBORHOOD</p>
        <h1 id="neighbors-title">网络邻居</h1>
        <p class="hero-quote">相知无远近，万里尚为邻。</p>
      </div>
    </section>

    <section
      class="friends-grid"
      :class="{ 'grid-loaded': isLoaded }"
      aria-label="友链列表"
    >
      <FriendCard
        v-for="(friend, index) in friends"
        :key="friend.link"
        :name="friend.name"
        :link="friend.link"
        :desc="friend.desc"
        :style="{ '--delay': `${index * 0.045}s` }"
      />
    </section>

    <section class="exchange-section" aria-labelledby="exchange-title">
      <div class="exchange-panel">
        <div class="rules-column">
          <p class="kicker">LINK EXCHANGE</p>
          <h2 id="exchange-title">成为邻居</h2>
          <p>
            如果你也在维护一个认真生长的个人站点，欢迎交换友链。这里更偏向长期可访问、内容健康、有个人痕迹的网页。
          </p>

          <ul class="rules-list">
            <li>
              <span>PASS</span>
              <p>内容健康，不涉及违法、色情、暴力或灰色产业。</p>
            </li>
            <li>
              <span>PASS</span>
              <p>非空壳站点，保持一定原创性与更新频率。</p>
            </li>
            <li>
              <span>NICE</span>
              <p>如果愿意，请支持 <strong>SYSU.SPA</strong>。</p>
            </li>
          </ul>
        </div>

        <div class="format-column">
          <div class="code-window">
            <div class="window-header">
              <span></span>
              <span></span>
              <span></span>
              <strong>application.json</strong>
            </div>
            <pre><code><span class="token key">"name"</span><span class="token punc">:</span> <span class="token str">"LiuYinChu'Space"</span><span class="token punc">,</span>
<span class="token key">"link"</span><span class="token punc">:</span> <span class="token str">"https://liuyinchu.github.io"</span><span class="token punc">,</span>
<span class="token key">"desc"</span><span class="token punc">:</span> <span class="token str">"祝你有晴朗的一天！"</span></code></pre>
            <p>请在 Issues 中提交以上信息。</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.neighbors-page {
  min-height: calc(100vh - 72px);
  overflow: hidden;
  padding: clamp(4.5rem, 8vw, 7rem) clamp(1rem, 4vw, 3rem) 7rem;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(160deg, var(--ctp-mocha-crust), var(--ctp-mocha-base) 48%, var(--ctp-mocha-mantle));
  background-size: 38px 38px, 38px 38px, auto;
  color: var(--ctp-mocha-text);
}

.neighbors-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.035) 0,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 10px
    );
  opacity: 0.22;
}

.neighbors-hero,
.friends-grid,
.exchange-section {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.neighbors-hero {
  display: block;
}

.kicker {
  margin: 0;
  color: var(--ctp-mocha-sky);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 1rem 0 1.1rem;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(3.3rem, 8vw, 6.4rem);
  font-weight: 800;
  line-height: 1;
}

.hero-quote {
  max-width: 720px;
  margin: 0;
  color: var(--ctp-mocha-sky);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.45rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.6;
  text-shadow: 0 0 24px rgba(var(--ctp-mocha-sky-rgb), 0.18);
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: clamp(2.6rem, 5vw, 4.2rem);
}

.friends-grid :deep(.friend-card) {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.friends-grid.grid-loaded :deep(.friend-card) {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--delay, 0s);
}

.exchange-section {
  margin-top: clamp(3.5rem, 7vw, 6rem);
}

.exchange-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.16);
  border-radius: 8px;
  padding: clamp(1.4rem, 4vw, 2.6rem);
  background:
    linear-gradient(145deg, rgba(var(--ctp-mocha-surface1-rgb), 0.86), rgba(var(--ctp-mocha-base-rgb), 0.9)),
    var(--ctp-mocha-base);
  box-shadow:
    18px 22px 42px rgba(0, 0, 0, 0.36),
    -14px -14px 30px rgba(255, 255, 255, 0.026),
    inset 1px 1px 0 rgba(255, 255, 255, 0.06);
}

.rules-column h2 {
  margin: 0.7rem 0 1rem;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2rem, 4vw, 3rem);
}

.rules-column > p {
  margin: 0 0 1.8rem;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1.05rem;
  line-height: 1.75;
}

.rules-list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rules-list li {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.12);
  border-radius: 8px;
  padding: 0.9rem;
  background: rgba(var(--ctp-mocha-base-rgb), 0.55);
  box-shadow:
    inset 4px 4px 10px rgba(0, 0, 0, 0.22),
    inset -4px -4px 10px rgba(255, 255, 255, 0.025);
}

.rules-list span {
  color: var(--ctp-mocha-teal);
  font-family: 'Fira Code', monospace;
  font-size: 0.76rem;
  font-weight: 700;
}

.rules-list p {
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  line-height: 1.65;
}

.format-column {
  align-self: start;
  padding-top: clamp(12.2rem, 15.2vw, 14.6rem);
}

.code-window {
  overflow: hidden;
  border: 1px solid rgba(var(--ctp-mocha-peach-rgb), 0.16);
  border-radius: 8px;
  background: var(--ctp-mocha-crust);
  box-shadow:
    12px 16px 30px rgba(0, 0, 0, 0.32),
    inset 1px 1px 0 rgba(255, 255, 255, 0.04);
}

.window-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.65);
}

.window-header span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.window-header span:nth-child(1) { background: var(--ctp-mocha-red); }
.window-header span:nth-child(2) { background: var(--ctp-mocha-yellow); }
.window-header span:nth-child(3) { background: var(--ctp-mocha-green); }

.window-header strong {
  margin-left: 0.4rem;
  color: var(--ctp-mocha-overlay2);
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 500;
}

.code-window pre {
  margin: 0;
  padding: 1.2rem;
  overflow-x: auto;
  color: var(--ctp-mocha-text);
  font-family: 'Fira Code', monospace;
  font-size: 0.86rem;
  line-height: 1.75;
}

.code-window p {
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.85rem 1.2rem;
  color: var(--ctp-mocha-overlay1);
  font-family: 'LXGW WenKai', serif;
}

.token.key { color: var(--ctp-mocha-mauve); }
.token.punc { color: var(--ctp-mocha-overlay2); }
.token.str { color: var(--ctp-mocha-green); }

@media (min-width: 1800px) {
  .neighbors-hero,
  .friends-grid,
  .exchange-section {
    width: min(1760px, 100%);
  }

  .friends-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.35rem;
  }
}

@media (max-width: 900px) {
  .exchange-panel {
    grid-template-columns: 1fr;
  }

  .format-column {
    padding-top: 0;
  }
}

@media (max-width: 560px) {
  .neighbors-page {
    padding-inline: 1rem;
  }

  .rules-list li {
    grid-template-columns: 1fr;
  }
}
</style>
