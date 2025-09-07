<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
// 路径已根据你的结构调整
import MarkdownViewer from '../components/MarkdownViewer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { calculateReadingTime } from '../utils/readingTime.js'

const route = useRoute()
const articleId = route.params.id

const articleMeta = ref(null)
const toc = ref([])

const markdownSrc = computed(() => articleMeta.value?.file || '')
const headerBgStyle = computed(() => {
  if (articleMeta.value?.image) {
    return { backgroundImage: `url(${articleMeta.value.image})` }
  }
  return {}
})

onMounted(async () => {
  try {
    const res = await fetch('/articles.json')
    const articles = await res.json()
    const foundArticle = articles.find(a => a.id === articleId)
    
    if (foundArticle) {
      foundArticle.file = `/markdown/${foundArticle.id}.md`
      articleMeta.value = foundArticle
    } else {
      // 文章未找到的处理
      console.error(`Article with id '${articleId}' not found in articles.json`)
    }
  } catch (error) {
    console.error("无法加载文章元数据:", error)
  }
})

function onTocGenerated(generatedToc) {
  toc.value = generatedToc
}

function onMarkdownLoaded(rawText) {
  if (articleMeta.value) {
    articleMeta.value.readingTime = calculateReadingTime(rawText)
  }
}
</script>

<template>
  <div class="page-container">
    <header 
      v-if="articleMeta" 
      class="title-container" 
      :style="headerBgStyle"
    >
      <div class="header-content">
        <h1>{{ articleMeta.title }}</h1>
        <div class="meta-info">
          <span>作者: {{ articleMeta.author }}</span>
          <span>发布于: {{ articleMeta.date }}</span>
          <span v-if="articleMeta.readingTime">阅读时间: {{ articleMeta.readingTime }}</span>
        </div>
      </div>
    </header>

    <div class="main-content-area">
      <main class="article-wrapper">
        <MarkdownViewer 
          v-if="markdownSrc"
          :src="markdownSrc" 
          @toc-generated="onTocGenerated"
          @markdown-loaded="onMarkdownLoaded"
        />
        <div v-else>
          <p>正在加载文章...</p>
        </div>
      </main>

      <aside class="toc-wrapper">
        <TableOfContents v-if="toc.length > 0" :toc="toc" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.title-container {
  position: relative;
  padding: 6rem 2rem;
  margin-bottom: 3rem;
  border-radius: 1rem;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  color: #fff;
}
.title-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1;
}
.header-content {
  position: relative;
  z-index: 2;
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
}
.header-content h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
}
.header-content .meta-info {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
}
.page-container {
  padding: 3rem 1rem;
  background-color: var(--background-color); /* 这是你的 #1e1e2e */
  min-height: 100vh;
}
.main-content-area {
  display: flex;
  justify-content: flex-end; /* 修改为末端对齐 */
  gap: 2rem;
  max-width: 1500px;
  margin: 0 auto;
}
.article-wrapper {
  flex: 1;
  min-width: 0;
  max-width: 1000px;
  /* [新增] 为正文栏添加背景和圆角 */
  background-color: var(--surface-color); /* 比 #1e1e2e 稍浅的背景 */
  border-radius: 0.75rem;
  padding: 2.5rem;
}
.toc-wrapper {
  width: 240px;
  display: none;
}
@media (min-width: 1100px) {
  .toc-wrapper {
    display: block;
  }
}
</style>