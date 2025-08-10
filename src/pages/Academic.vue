<template>
  <div class="academic-page">
    <!-- 模块一：顶部 Banner -->
    <header class="hero-banner">
      <!-- 修改点 4：更新背景图片路径 -->
      <div 
        class="hero-image" 
        style="background-image: url('/bg/IMG_FireFly4.jpeg');"
      ></div>
      <!-- 修改点 3：简化为纯色深色滤镜 -->
      <div class="hero-filter"></div>
      <!-- 页面标题 -->
      <h1 class="hero-title">My Academic</h1>
    </header>

    <!-- 页面主内容区 -->
    <main class="main-content">
      <div v-if="isLoading" class="loading-indicator">正在加载学术数据...</div>
      <div v-if="error" class="error-message">数据加载失败：{{ error.message }}</div>

      <template v-if="!isLoading && !error">
        <!-- 修改点 1：为每个模块包裹一个 div 来控制间距 -->
        <div class="module-wrapper">
          <AcademicCard v-if="brief" :data="brief" />
        </div>

        <div class="module-wrapper">
          <PublicationList v-if="publications.length" :publications="publications" />
        </div>

        <div class="module-wrapper">
            <MarkdownRenderer v-if="markdownContent" :source="markdownContent" />
        </div>

        <div class="module-wrapper">
          <ExperienceTimeline v-if="experience.length" :items="experience" />
        </div>
        
        <div class="module-wrapper">
          <ConferenceList v-if="conferences.length" :items="conferences" />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
// 脚本部分无需改动，保持原样
import { ref, onMounted } from 'vue';
import AcademicCard from '../components/academic/AcademicCard.vue';
import PublicationList from '../components/academic/PublicationList.vue';
import MarkdownRenderer from '../components/academic/MarkdownRenderer.vue';
import ExperienceTimeline from '../components/academic/ExperienceTimeline.vue';
import ConferenceList from '../components/academic/ConferenceList.vue';

const brief = ref(null);
const publications = ref([]);
const markdownContent = ref('');
const experience = ref([]);
const conferences = ref([]);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const responses = await Promise.all([
      fetch('/data/academic_brief.json'),
      fetch('/data/publications.json'),
      fetch('/data/highlight_work.md'),
      fetch('/data/experience.json'),
      fetch('/data/conferences.json')
    ]);
    for (const res of responses) {
      if (!res.ok) throw new Error(`网络请求失败: ${res.status}`);
    }
    const [briefData, pubsData, mdText, expData, confData] = await Promise.all([
      responses[0].json(),
      responses[1].json(),
      responses[2].text(),
      responses[3].json(),
      responses[4].json(),
    ]);
    brief.value = briefData;
    publications.value = pubsData;
    markdownContent.value = mdText;
    experience.value = expData;
    conferences.value = confData;
  } catch (e) {
    console.error("加载学术主页数据时出错:", e);
    error.value = e;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.academic-page {
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 100vh;
}

/* --- 顶部 Banner 样式 --- */
.hero-banner {
  position: relative;
  height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 2px solid var(--border-color);
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: grayscale(30%); /* 稍微降低灰度，让图片色彩多一点 */
}

.hero-filter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 修改点 3：直接使用半透明黑色作为滤镜 */
  background-color: rgba(0, 0, 0, 0.5);
}

.hero-title {
  position: relative;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  color: var(--text-color);
  font-weight: 400;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.7);
  animation: fadeInDown 1s ease-out;
}

/* --- 主内容区样式 --- */
.main-content {
  max-width: 1150px;
  margin: 0 auto;
  /* 增大顶部内边距，让所有内容下移 */
  padding: 5rem 1.5rem; 
}

/* 修改点 1：为模块包裹层增加下边距，拉开模块间距 */
.module-wrapper {
  margin-bottom: 4rem; /* 显著增大模块间距 */
}
.module-wrapper:last-child {
  margin-bottom: 0;
}

.loading-indicator,
.error-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--ctp-mocha-subtext1, #bac2de);
}

.error-message {
  color: var(--danger-color);
  background-color: rgba(var(--ctp-mocha-red-rgb), 0.1);
  border: 1px solid var(--danger-color);
  border-radius: 8px;
}

/* 为模块三（亮点工作快报）提供一个特殊的、更深的背景 */
/* .research-summary-wrapper {
  background-color: var(--background-color);
  border: 1px solid var(--surface-color);
} */

.keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>