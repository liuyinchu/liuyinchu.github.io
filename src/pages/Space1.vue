<script setup>
const articles = [
  {
    id: 'naming_guide',
    title: '命名规范',
    desc: '我倡议规范命名。',
  },
  {
    id: 'qm_course_note',
    title: '量子力学课程相关笔记',
    desc: '其实主要是与作业和小测相关。',
  },
  {
    id: 'python_note_class_specific_methods',
    title: 'Python中类的专有方法',
    desc: '这是一篇Python学习笔记。',
  }
]
</script>

<template>
  <main class="container fade-in">
    <h1 class="block-title">讨论</h1>
    <p class="block-intro">一些值得记录的思考、讨论或灵感。</p>

    <ul class="article-list">
      <li v-for="(article, i) in articles" :key="i">
        <RouterLink :to="`/space1/${article.id}`" class="article-link">
          <h3>{{ article.title }}</h3>
          <p class="desc">{{ article.desc }}</p>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.article-list {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: auto;
}

.article-link {
  display: block;
  padding: 1rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  text-decoration: none;
  background: white;
  transition: all 0.3s ease;
  color: inherit;
}

.article-link:hover {
  background-color: var(--gray-green);
  color: white;
  transform: translateY(-2px);
}

.article-link h3 {
  margin: 0 0 0.5rem;
  color: var(--gray-blue);
}

.article-link .desc {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
  opacity: 0.9;
}
</style>
