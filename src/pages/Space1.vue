<script setup>
import Meteors from '../components/effects/Meteors.vue'

const articles = [
  {
    id: 'naming_guide',
    title: '命名规范建议',
    desc: '我倡议规范命名。',
    bg: '/bg/IMG_FireFly4.jpeg' // ✅ 可选：背景图路径
  },
  {
    id: 'qm_course_note',
    title: '量子力学课程相关笔记',
    desc: '其实主要是与作业和小测相关。',
    bg: '/bg/outside_sky.jpg'
  },
  {
    id: 'python_note_class_specific_methods',
    title: 'Python中类的专有方法',
    desc: '这是一篇Python学习笔记。',
    bg: '/bg/IMG_Elysia.jpg'
  },
  {
    id: 'astro_ml_guide',
    title: '天文学中的机器学习指南',
    desc: '这是一篇文献阅读笔记。',
    bg: '/bg/IMG_FireFly4.jpeg'
  },
  {
    id: 'introduction_to_open_source_protocol',
    title: '开源协议简介',
    desc: '提供最基本的介绍，你可以进一步去探索它。',
    bg: '/outside_sky.jpg'
  },
  {
    id: 'ms_gate_note',
    title: 'Mølmer–Sørensen门理论推导笔记',
    desc: '这是一篇关于量子物理的早期科研尝试笔记。',
    bg: '/bg/visitor.jpeg'
  }
]
</script>

<template>
  <div class="relative bg-container">
    <!-- 流星背景层 -->
    <Meteors />

    <!-- 正文内容 -->
    <main class="article-page relative z-10">
      <h1 class="block-title">讨论</h1>
      <p class="block-intro">一些值得记录的思考、讨论或灵感。</p>

      <div class="article-list">
        <RouterLink
          v-for="(article, i) in articles"
          :key="i"
          :to="`/space1/${article.id}`"
          class="article-card"
          :style="article.bg ? { backgroundImage: `url(${article.bg})` } : {}"
        >
          <div class="card-overlay">
            <h3 class="article-title">{{ article.title }}</h3>
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

/* 保证流星在底层 */
.bg-container > .meteor-layer,
.bg-container > *:not(.article-page) {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* 正文在上层 */
.article-page {
  position: relative;
  z-index: 10;
  padding: 3rem 1rem;
  background-color: transparent; /* 不覆盖背景 */
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

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 880px;
  margin: 0 auto;
}

/* 卡片容器 */
.article-card {
  position: relative;
  background-size: cover;
  background-position: center;
  border-radius: 1.25rem;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s ease;
}
.article-card:hover {
  transform: translateY(-4px);
}

/* 毛玻璃遮罩层 */
.card-overlay {
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.8);
  backdrop-filter: blur(9.5px);
  -webkit-backdrop-filter: blur(9.5px);
  padding: 1.5rem 2rem;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  text-align: left;
}

/* 文章标题 */
.article-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

/* 文章描述 */
.article-desc {
  font-size: 0.95rem;
  opacity: 0.9;
}
</style>