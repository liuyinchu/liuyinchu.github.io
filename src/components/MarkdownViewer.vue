<script setup>
import { ref, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  src: { type: String, required: true }
})

// 定义要发送的事件
const emit = defineEmits(['tocGenerated', 'markdownLoaded'])

const renderedHtml = ref('')
const markdownBodyRef = ref(null)

// 提取公式并替换成 @@FORMULA_n@@ 占位符
function extractFormulas(text) {
  const formulas = []
  const replaced = text.replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g, (match) => {
    const key = `@@FORMULA_${formulas.length}@@`
    formulas.push(match)
    return key
  })
  return { replaced, formulas }
}

// 恢复公式占位符
function restoreFormulas(html, formulas) {
  return html.replace(/@@FORMULA_(\d+)@@/g, (_, i) => formulas[i])
}

function loadMathJax(callback) {
  if (window.MathJax) {
    callback && callback()
    return
  }
  window.MathJax = {
    loader: { load: ['[tex]/ams', '[tex]/autoload', '[tex]/physics', 'ui/lazy'] },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      packages: { '[+]': ['ams', 'autoload', 'physics'] },
      tags: 'ams',
      processEscapes: true
    },
    startup: {
      ready: () => {
        MathJax.startup.defaultReady()
        callback && callback()
      }
    }
  }
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js'
  script.async = true
  document.head.appendChild(script)
}

onMounted(async () => {
  const res = await fetch(props.src)
  const rawText = await res.text()

  // 发送原文事件，用于计算阅读时间
  emit('markdownLoaded', rawText)

  const { replaced, formulas } = extractFormulas(rawText)

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch (_) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  })

  // 使用 markdown-it-anchor 插件
  md.use(mdAnchor, {
    level: [1, 2, 3],
    permalink: mdAnchor.permalink.ariaHidden({
      placement: 'before',
      symbol: '#',
      class: 'header-anchor'
    })
  })

  const htmlWithPlaceholders = md.render(replaced)
  const finalHtml = restoreFormulas(htmlWithPlaceholders, formulas)
  renderedHtml.value = finalHtml

  loadMathJax(() => {
    MathJax.typesetPromise()
  })

  // 生成并发送 TOC 数据
  await nextTick()
  const tocItems = []
  const container = markdownBodyRef.value
  if (container) {
    const headings = container.querySelectorAll('h1[id], h2[id], h3[id]')
    headings.forEach(h => {
      tocItems.push({
        level: parseInt(h.tagName.substring(1), 10),
        text: h.innerText.replace(/^#\s*/, '').trim(),
        id: h.id
      })
    })
  }
  emit('tocGenerated', tocItems)
})
</script>

<template>
  <div ref="markdownBodyRef" class="markdown-body" v-html="renderedHtml"></div>
</template>

<style scoped>
.markdown-body {
  max-width: 860px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Inter', 'Noto Serif SC', 'Times New Roman', serif;
  line-height: 1.9;
  font-size: 1.05rem;
  color: var(--text-color);
}

/* 标题样式略 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.5;
}
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--accent-color);
}

/* 行内代码与块代码 */
/* .markdown-body code {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  background-color: var(--surface-color-hover);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.markdown-body pre {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.markdown-body pre code {
  background: none;
  padding: 0;
  font-size: 0.95rem;
} */
:deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: var(--surface-color-hover);
  color: var(--ctp-mocha-subtext1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(pre) {
  position: relative; 
  /* background-color: var(--surface-color); */
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
}

/* 其余图片、表格、引用块样式略 */

mjx-container {
  font-family: 'STIX Two Math', 'Latin Modern Math', 'Noto Serif SC', serif !important;
  font-size: 1.05rem;
  line-height: 1.8;
}
</style>