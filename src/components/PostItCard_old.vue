<template>
  <div class="post-it-card" :class="`post-it-${color}`">
    <div class="post-it-header">{{ title }}</div>
    <div class="post-it-content markdown-body" v-html="content"></div>
  </div>
</template>

<script setup>
// a
defineProps({
  title: { type: String, required: true },
  content: { type: String, required: true },
  color: { type: String, default: 'default' }
});
</script>

<style scoped>
/* 这里的样式现在只负责卡片本身的外观，不再关心内部的具体内容样式 */
.post-it-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.2em 1.5em;
  box-shadow: 0 10px 25px -5px rgba(var(--ctp-mocha-base-rgb), 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  font-family: "LXGW WenKai";
  /* transform: rotate(-1.5deg); */
}
/* 方案三：抹茶拿铁 */
.post-it-card :deep(::selection) {
  background-color: #DDEBE7;
  color: #3C5249;
}

.post-it-card:hover {
  transform: rotate(0deg) scale(1.03);
  box-shadow: 0 15px 30px -5px rgba(var(--ctp-mocha-base-rgb), 0.3);
}

.post-it-card:active {
  transform: rotate(0deg) scale(1.01);
  box-shadow: 0 8px 20px -5px rgba(var(--ctp-mocha-base-rgb), 0.25);
}

.post-it-header {
  font-size: 1.3em;
  font-weight: bold;
  color: var(--accent-color);
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.5em;
  margin-bottom: 1em;
}

/* post-it-content 的样式现在可以简化甚至移除，因为 .markdown-body 会接管 */
.post-it-content {
  line-height: 1.7;
}

/* 颜色变体样式保持不变 */
.post-it-yellow { background-color: var(--warning-color); color: var(--ctp-mocha-base); }
.post-it-yellow .post-it-header { color: var(--ctp-mocha-crust); }
.post-it-green { background-color: var(--success-color); color: var(--ctp-mocha-base); }
.post-it-green .post-it-header { color: var(--ctp-mocha-crust); }
.post-it-red { background-color: var(--danger-color); color: var(--ctp-mocha-base); }
.post-it-red .post-it-header { color: var(--ctp-mocha-crust); }

/*
  之前所有关于 table, th, td, pre, code, katex 的 :deep() 样式
  都已从此文件中删除。
*/
</style>

<style>
.content-block:not(:last-child) {
  margin-bottom: 2rem; /* 为除最后一个元素外的所有块添加下外边距 */
}

.markdown-body code {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  background-color: rgba(147, 153, 178, 0.25);;
  color: #89dceb;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
/* 要用也要改成上述形式 */
/* :deep(pre) {
  position: relative; 
  background-color: rgb(24, 24, 37);
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  font-size: 0.95rem;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
}

:deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
} */
</style>