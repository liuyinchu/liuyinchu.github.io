<template>
  <section id="publications" class="content-section">
    <h2 class="section-title">Publications</h2>
    <ul class="publication-list">
      <li v-for="pub in publications" :key="pub.title" class="publication-item">
        
        <h3 class="pub-title">
          <a v-if="pub.link" :href="pub.link" target="_blank" rel="noopener noreferrer">
            {{ pub.title }}
            <svg class="external-link-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          <span v-else>{{ pub.title }}</span>
        </h3>
        
        <div class="pub-meta">
          <span class="pub-authors">
            <span v-for="(author, index) in pub.authors" :key="author">
              <strong v-if="isMyName(author)" class="my-name">{{ author }}</strong>
              <span v-else>{{ author }}</span>
              <span v-if="index < pub.authors.length - 1">, </span>
            </span>
          </span>
          <span class="separator">|</span>
          <span class="pub-venue">
            <em>{{ pub.venue }}</em>, {{ pub.year }}
            <span :class="['pub-type', pub.type.toLowerCase()]">{{ pub.type }}</span>
          </span>
        </div>
        
      </li>
    </ul>
  </section>
</template>

<script setup>
const props = defineProps({
  publications: {
    type: Array,
    required: true
  }
});

// 请将 '您的名字' 替换成您在 authors 列表里使用的名字
const isMyName = (author) => {
  return author === '您的名字';
};
</script>

<style scoped>
.content-section {
  margin-top: 4rem;
  padding: 2rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s 0.4s ease-out forwards;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 1px;
}

.publication-list {
  list-style: none;
  padding: 0;
}

.publication-item {
  padding: 1.2rem 1.5rem;
  margin-bottom: 0.8rem;
  border-left: 3px solid transparent;
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease-in-out;
}
.publication-item:hover {
  background-color: var(--surface-color-hover);
  border-left-color: var(--accent-color);
  transform: translateX(10px);
  box-shadow: 5px 5px 20px rgba(0,0,0,0.2);
}
.publication-item:last-child {
  margin-bottom: 0;
}

.pub-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.6rem 0; /* 调整下方间距 */
}
.pub-title a {
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s ease;
}
.pub-title a:hover {
  color: var(--primary-color-hover);
}
.external-link-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.5rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}
.pub-title a:hover .external-link-icon {
  opacity: 1;
  transform: translate(2px, -2px);
}

/* 修改点：为新的 meta 信息行添加 flex 布局 */
.pub-meta {
  display: flex;
  align-items: baseline; /* 基线对齐，让文字看起来更整齐 */
  flex-wrap: wrap; /* 在小屏幕上允许换行 */
  gap: 0 0.8rem; /* 设置元素之间的水平间距 */
  font-size: 0.95rem;
  color: var(--ctp-mocha-subtext1, #bac2de);
  line-height: 1.6;
}

/* 修改点：移除原来 p 标签的边距，现在由 flex gap 控制 */
.pub-authors, .pub-venue {
  margin: 0;
}

/* 修改点：分隔符样式 */
.separator {
  color: var(--border-color);
  font-weight: bold;
}

.my-name {
  color: var(--primary-color-hover);
  font-weight: bold;
}

.pub-type {
  display: inline-block;
  padding: 0.2em 0.7em;
  margin-left: 1em;
  font-size: 0.8em;
  font-weight: bold;
  border-radius: 4px;
  color: var(--ctp-mocha-base);
  text-transform: uppercase;
}
.pub-type.conference { background-color: var(--ctp-mocha-blue); }
.pub-type.journal { background-color: var(--ctp-mocha-green); }
.pub-type.preprint { background-color: var(--ctp-mocha-yellow); }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>