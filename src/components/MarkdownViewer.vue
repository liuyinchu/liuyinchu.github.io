<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const renderedHtml = ref('')

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
    loader: {
      load: ['[tex]/ams', '[tex]/autoload', '[tex]/physics', 'ui/lazy']
    },
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

  // 提取公式
  const { replaced, formulas } = extractFormulas(rawText)

  // 渲染 Markdown
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

  const htmlWithPlaceholders = md.render(replaced)

  // 恢复公式
  const finalHtml = restoreFormulas(htmlWithPlaceholders, formulas)
  renderedHtml.value = finalHtml

  // 最后渲染公式
  loadMathJax(() => {
    MathJax.typesetPromise()
  })
})
</script>

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

/* 行内代码与块代码略 */
.markdown-body code {
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
}

/* 其余图片、表格、引用块样式略 */

mjx-container {
  font-family: 'STIX Two Math', 'Latin Modern Math', 'Noto Serif SC', serif !important;
  font-size: 1.05rem;
  line-height: 1.8;
}
</style>