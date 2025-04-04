<script setup>
const articles = [
  {
    id: 'naming_guide',
    title: '命名规范',
    desc: '我倡议规范命名。',
    bg: '/bg/share.jpeg' // ✅ 可选：背景图路径
  },
  {
    id: 'qm_course_note',
    title: '量子力学课程相关笔记',
    desc: '其实主要是与作业和小测相关。',
    bg: '' // ✅ 无背景图
  },
  {
    id: 'python_note_class_specific_methods',
    title: 'Python中类的专有方法',
    desc: '这是一篇Python学习笔记。',
    bg: '/bg/open.jpeg'
  }
]
</script>

<template>
  <main class="article-page">
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
</template>

<style scoped>
.article-page {
  padding: 3rem 1rem;
  background-color: var(--background-color);
  min-height: 100vh;
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
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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