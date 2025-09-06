<script setup>
import { ref, onMounted } from 'vue'
// 路径已根据你的结构调整
import Meteors from '../components/effects/Meteors.vue'

const articles = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/articles.json')
    articles.value = await res.json()
  } catch (error) {
    console.error("无法加载文章列表:", error)
  }
})
</script>

<template>
  <div class="bg-container">
    <Meteors />
    <main class="article-page">
      <h1 class="block-title">随记</h1>
      <p class="block-intro">来自远方，来自黄昏和清晨，来自十二重高天的好风轻扬，飘来生命气息的吹拂，吹在我身上。</p>
      <p class="block-intro">趁着生命气息逗留，盘桓未去，拉住我的手，快告诉我你的心声。</p>
      <p class="block-intro">莫待无常之风，携我去飘渺远方。</p>
      <p class="block-intro">—— 阿尔弗雷德·爱德华·豪斯迈《西罗普郡少年》</p>
      <div class="article-list">
        <RouterLink
          v-for="article in articles"
          :key="article.id"
          :to="`/space1/${article.id}`"
          class="article-card"
        >
          <div class="image-container">
            <img :src="article.image" :alt="article.title" class="article-image" />
          </div>
          <div class="text-container">
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="meta-info">
              <span>{{ article.author }}</span>
              <span>{{ article.date }}</span>
            </div>
            <p class="article-desc">{{ article.desc }}</p>
          </div>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-container {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}
.article-page {
  position: relative;
  z-index: 10;
  padding: 3rem 1rem;
  background-color: transparent;
  text-align: center;
}
.block-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
.block-intro {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 2rem;
}
/* .article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
} */
 .article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* 关键：用 clamp 做流式容器宽度 */
  max-width: clamp(280px, 92vw, 1000px);
  /* 小屏留点内边距，避免贴边 */
  padding-inline: clamp(12px, 3vw, 24px);

  margin: 0 auto;
}

/* 超大屏再放宽一点可读宽度（可选） */
@media (min-width: 1440px) {
  .article-list {
    max-width: clamp(1000px, 80vw, 1200px);
  }
}
.article-card {
  display: flex;
  height: 220px;
  background-color: #313244;
  backdrop-filter: blur(9.5px);
  -webkit-backdrop-filter: blur(9.5px);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.article-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--primary-color);
}
.image-container {
  flex: 0.382;
  height: 100%;
}
.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.article-card:hover .article-image {
  transform: scale(1.05);
}
.text-container {
  flex: 0.618;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  text-align: left;
  color: var(--text-color);
}
.article-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
.meta-info {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--ctp-mocha-subtext0);
  margin-bottom: 0.75rem;
}
.article-desc {
  font-size: 0.95rem;
  opacity: 0.9;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
}
</style>