<script setup>
const guideItems = [
  {
    title: '先从随记进入',
    text: '随记保存正在生长的想法，不强行整理成作品集。',
    to: '/space1',
  },
  {
    title: '再看资源与项目',
    text: '资源链接和代码页面是更偏工具性的入口，适合快速跳转。',
    to: '/rd',
  },
  {
    title: '最后去邻居家串门',
    text: '网络邻居收纳朋友们的站点，保留个人网站互相连接的方式。',
    to: '/space2',
  },
]
</script>

<template>
  <main class="visitor-page" aria-labelledby="visitor-title">
    <section class="visitor-hero">
      <div class="visitor-copy">
        <p class="kicker">VISITOR CENTER</p>
        <h1 id="visitor-title">访客中心</h1>
        <p class="intro">
          给第一次来到这里的人一张简短地图：这个站点是个人空间，不是模板化作品集，也不是单一博客。
        </p>
      </div>

      <img
        class="visitor-image"
        src="/bg/liuyin.jpg"
        alt="LiuYinChu'Space visitor visual"
        loading="eager"
        decoding="async"
      />
    </section>

    <section class="guide-grid" aria-label="访客导览">
      <RouterLink
        v-for="item in guideItems"
        :key="item.to"
        :to="item.to"
        class="guide-card"
      >
        <span>{{ item.title }}</span>
        <p>{{ item.text }}</p>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.visitor-page {
  min-height: calc(100vh - 72px);
  padding: clamp(4rem, 8vw, 7rem) clamp(1rem, 4vw, 3rem) 7rem;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px),
    var(--ctp-mocha-base);
  background-size: 40px 40px, 40px 40px, auto;
  color: var(--ctp-mocha-text);
}

.visitor-hero,
.guide-grid {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.visitor-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.kicker {
  margin: 0 0 1rem;
  color: var(--ctp-mocha-sky);
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(3.2rem, 8vw, 6.2rem);
  line-height: 1;
}

.intro {
  max-width: 660px;
  margin: 1.4rem 0 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  line-height: 1.85;
}

.visitor-image {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.22);
  border-radius: 8px;
  filter: saturate(0.9) contrast(1.04);
  box-shadow:
    18px 20px 40px rgba(0, 0, 0, 0.36),
    -12px -12px 28px rgba(255, 255, 255, 0.025);
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: clamp(3rem, 7vw, 5rem);
}

.guide-card {
  display: grid;
  gap: 0.8rem;
  min-height: 190px;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.16);
  border-radius: 8px;
  padding: 1.35rem;
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.88);
  box-shadow:
    12px 14px 28px rgba(0, 0, 0, 0.3),
    -10px -10px 24px rgba(255, 255, 255, 0.025),
    inset 1px 1px 0 rgba(255, 255, 255, 0.06);
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.guide-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.32);
  text-decoration: none;
}

.guide-card span {
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: 1.35rem;
  font-weight: 800;
}

.guide-card p {
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  line-height: 1.7;
}

@media (max-width: 820px) {
  .visitor-hero,
  .guide-grid {
    grid-template-columns: 1fr;
  }

  .visitor-image {
    aspect-ratio: 16 / 10;
  }
}
</style>
