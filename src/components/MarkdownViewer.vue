<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

import 'highlight.js/styles/github.css' // 你可以替换其它主题，比如 atom-one-dark.css

const props = defineProps({
  src: String,
})

const renderedHtml = ref('')

// 初始化 MathJax（CDN 引入）
function loadMathJax() {
  if (window.MathJax) {
    window.MathJax.typesetPromise()
    return
  }

  // 必须先设置 config
  window.MathJax = {
    loader: {
      load: ['[tex]/physics', '[tex]/ams', '[tex]/boldsymbol', '[tex]/color', 'ui/lazy']
    },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      packages: { '[+]': ['physics', 'ams', 'boldsymbol', 'color'] },
      tags: 'ams',
      macros: {
        RR: '\\mathbb{R}',
        ZZ: '\\mathbb{Z}',
        QQ: '\\mathbb{Q}',
        NN: '\\mathbb{N}',
        ee: '\\mathrm{e}',
        dd: '\\,\\mathrm{d}',
        vec: ['\\mathbf{#1}', 1],
        abs: ['\\left\\lvert #1 \\right\\rvert', 1],
        norm: ['\\left\\lVert #1 \\right\\rVert', 1],
        bra: ['\\langle #1 \\rvert', 1],
        ket: ['\\lvert #1 \\rangle', 1],
        braket: ['\\langle #1 \\rangle', 1],
        inner: ['\\langle #1 \\mid #2 \\rangle', 2],
        outer: ['\\lvert #1 \\rangle\\langle #2 \\rvert', 2]
      }
    },
    options: {
      lazyMargin: '300px',
      renderActions: {
        addMenu: []  // 移除右键菜单
      }
    },
    svg: {
      fontCache: 'global'
    }
  }

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
  script.async = true
  document.head.appendChild(script)
}

onMounted(async () => {
  const res = await fetch(props.src)
  const text = await res.text()

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
    },
  })

  renderedHtml.value = md.render(text)

  loadMathJax()

  // 确保 typeset 在 script 加载完后调用
  const waitForMathJax = () => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise()
    } else {
      setTimeout(waitForMathJax, 100)
    }
  }
  waitForMathJax()
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

/* 标题样式 */
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.5;
}
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--accent-color);
}

/* 行内代码和块代码 */
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

/* 图片与表格 */
.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95rem;
}
.markdown-body th, .markdown-body td {
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
}

/* 引用块 */
.markdown-body blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  color: var(--text-color);
  background-color: var(--surface-color-hover);
  border-radius: 0.5rem;
  margin: 1rem 0;
  font-style: italic;
}

/* 列表 */
.markdown-body ul, .markdown-body ol {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

/* 链接 */
.markdown-body a {
  color: var(--link-color);
  text-decoration: none;
}
.markdown-body a:hover {
  color: var(--primary-color-hover);
  text-decoration: underline;
}

/* 数学公式 */
mjx-container {
  font-family: 'STIX Two Math', 'Latin Modern Math', 'Noto Serif SC', serif !important;
  font-size: 1.05rem;
  line-height: 1.8;
}
</style>