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
          <div class="meta-primary">
            <span>作者: {{ articleMeta.author }}</span>
            <span>发布于: {{ articleMeta.date }}</span>
          </div>
          <span v-if="articleMeta.readingTime" class="meta-reading">
            阅读时间: {{ articleMeta.readingTime }}
          </span>
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
  display: flex;
  min-height: 22rem;
  align-items: flex-end;
  padding: 7rem clamp(2rem, 5vw, 5rem) 5rem;
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
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  text-align: left;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
}
.header-content h1 {
  margin: 0 0 1.25rem;
  color: #fff;
  font-family: "Cinzel", "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", "Noto Serif SC", serif;
  font-size: clamp(2.4rem, 3.8vw, 3.7rem);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: 0.01em;
  text-wrap: balance;
}
.header-content .meta-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.38rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: "TsangerJinKai02-W03", "仓耳今楷02 W03", "LXGW WenKai", "Noto Serif SC", serif;
  font-size: 0.96rem;
  line-height: 1.55;
}
.meta-primary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.4rem;
}
.meta-reading {
  color: rgba(255, 255, 255, 0.76);
}
/* Keep the title in the lower half without moving its layout box. */
.header-content h1,
.header-content .meta-info {
  position: relative;
  z-index: 1;
}
/* A little more contrast behind the left-aligned title on bright covers. */
.header-content::before {
  content: '';
  position: absolute;
  inset: -2rem -3rem;
  z-index: 0;
  max-width: 78rem;
  background: radial-gradient(ellipse at left, rgba(17, 17, 27, 0.3), transparent 70%);
  pointer-events: none;
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
  width: 260px;
  display: none;
}
@media (min-width: 1800px) {
  .header-content {
    max-width: 1600px;
  }

  .main-content-area {
    max-width: 1760px;
    justify-content: center;
    gap: 3rem;
  }

  .article-wrapper {
    max-width: 1100px;
  }

  .toc-wrapper {
    width: 300px;
  }
}

@media (min-width: 1100px) {
  .toc-wrapper {
    display: block;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.25rem 0.85rem 2rem;
  }

  .title-container {
    min-height: 20rem;
    padding: 4.2rem 1.35rem 2.8rem;
    margin-bottom: 1.6rem;
    border-radius: 0.9rem;
  }

  .title-container::before {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.34),
      rgba(0, 0, 0, 0.62)
    );
  }

  .header-content h1 {
    font-size: clamp(2.05rem, 8.5vw, 2.65rem);
    line-height: 1.16;
    margin-bottom: 0.85rem;
    text-wrap: balance;
  }

  .header-content .meta-info {
    gap: 0.3rem;
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .meta-primary {
    gap: 0.2rem 0.85rem;
  }

  .main-content-area {
    display: block;
  }

  .article-wrapper {
    padding: 1.25rem 0.95rem;
    border-radius: 0.7rem;
  }
}

@media (max-width: 420px) {
  .page-container {
    padding: 1rem 0.75rem 1.75rem;
  }

  .title-container {
    min-height: 18rem;
    padding: 3.8rem 1rem 2.4rem;
  }

  .header-content h1 {
    font-size: clamp(1.85rem, 8vw, 2.25rem);
  }

  .article-wrapper {
    padding: 0.95rem 0.75rem;
  }
}
</style>
