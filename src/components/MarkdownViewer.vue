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
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",'Inter','Noto Serif SC','Times New Roman',serif;
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
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  background-color: #6c7086;
  color: #89dceb;
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
  font-size: 1rem;
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
  font-family: 
    /* --- 首选字体 (本地安装) --- */
    /* 专为数学和技术文档设计的西文字体，具有经典的 LaTeX 风格。*/
    "Latin Modern Math",
    "Computer Modern",

    /* --- Google Fonts 备选 (网络字体) --- */
    /* Google 提供的开源数学字体，作为 Latin Modern Math 的优秀备选。*/
    "Noto Sans Math",

    /* --- 中文字体 --- */
    /* Google 提供的开源宋体，适用于所有平台，确保中文内容的可读性和美观性。*/
    /* 将其放在西文字体之后，这样它仅用于渲染中文字符（或其他西文字体不支持的字符）。*/
    "Noto Serif SC",

    /* --- 平台原生备选 (按系统优化) --- */
    /* macOS 和 iOS 平台的中文字体，效果现代、清晰。*/
    "PingFang SC",
    /* Windows 平台首选的无衬线中文字体，渲染效果优秀。*/
    "Microsoft YaHei", /* 微软雅黑 */
    "Heiti SC", /* 黑体-简，一些旧版macOS或移动设备可能使用 */

    /* --- 通用西文备选 (按系统优化) --- */
    /* 针对 Apple 设备的系统 UI 字体，会自动选择 San Francisco 字体。*/
    -apple-system,
    BlinkMacSystemFont,
    /* 针对 Windows 的现代 UI 字体。*/
    "Segoe UI",
    /* 针对 Android 和 ChromeOS 的字体。*/
    "Roboto",
    /* 跨平台都非常普及的无衬线字体。*/
    "Helvetica Neue",
    "Arial",

    /* --- 最终备选项 --- */
    /* 如果以上所有字体都不可用，浏览器将使用其默认的无衬线字体。*/
    /* 这里使用 sans-serif 是因为前面备选的西文字体多为无衬线，可以保持风格一致。*/
    /* 如果你更倾向于衬线风格，可以将其改为 `serif`。*/
    sans-serif !important;
  font-size: 1.05rem;
  line-height: 1.8;
}

:deep(blockquote) { 
  margin: 0; padding: 0 1em; color: #bac2de; border-left: .25em solid #74c7ec; 
  background: linear-gradient(
  90deg,
  #74c7ec 0%,    /* 起点 */
  #45475a 1%,   /* 中间颜色快速到位 */
  #45475a 100%   /* 后半段渐变慢慢延伸 */
);
}

/* [新增] 分割线样式 */
:deep(hr) {
  border: 0; /* 移除默认边框 */
  height: 2.0px; /* 为线条本身的高度 */
  margin: 0.5rem 0; /* 增加垂直间距，让分割感更强 */
  background-color: #b4befe; /* 线条的基础颜色 */
  position: relative; /* 为伪元素提供定位上下文 */
  text-align: center; /* 使中间的符号居中 */
}
</style>