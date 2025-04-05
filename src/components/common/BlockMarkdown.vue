<template>
  <div class="markdown-body" v-html="compiledHtml"></div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import hljs from 'highlight.js'

// 样式导入（KaTeX + Highlight）
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-dark.css'

// Props: Markdown 内容字符串
const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// 创建 Markdown 渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (_) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
}).use(markdownItKatex)

// 计算渲染后的 HTML
const compiledHtml = computed(() => md.render(props.content))
</script>

<style scoped>
.markdown-body {
  line-height: 1.8;
  font-size: 1rem;
  color: var(--text-color);
}

/* 标题样式 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: 700;
  color: var(--primary-color);
  margin-top: 1.5rem;
}

/* 代码块字体优化 */
.markdown-body code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: var(--surface-color);
  color: var(--primary-color);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.markdown-body pre {
  background-color: var(--surface-color);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.95rem;
  font-family: 'JetBrains Mono', monospace;
}

/* KaTeX 公式 */
.markdown-body .katex {
  font-size: 1.1em;
}
</style>