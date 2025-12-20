<script setup>
import { ref, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

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
        // 增加 hljs 类名，确保样式生效
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs code-block"><div class="code-header"><span class="lang-tag">${lang}</span></div><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
          } catch (_) {}
        }
        return `<pre class="hljs code-block"><div class="code-header"></div><code>${md.utils.escapeHtml(str)}</code></pre>`
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
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "LXGW WenKai",-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",'Inter','Noto Serif SC','Times New Roman',serif;
  line-height: 1.9;
  font-size: 1.1rem;
  color: var(--text-color);
}
/* 方案二：Catppuccin Mocha 原生蓝色 */
/* .markdown-body :deep(::selection) {
  background-color: #74C7EC;
  color: #1E1E2E;
} */
/* 方案：暗金星流 (奢华质感，呼应标题) */
/* .markdown-body :deep(::selection) {
  background-color: rgba(243, 233, 198, 0.95);
  color: #181825; 
  text-shadow: none;
} */
.markdown-body :deep(::selection) {
  background-color: #4df8e8; 
  color: #11111b; 
  text-shadow: 0 0 2px rgba(255,255,255,0.2); /* 微弱发光 */
} 

/* 标题样式略 */
/* .markdown-body h1,
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
} */
/* ================== 1. 标题 ================== */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  color: #F3E9C6; /* 暗金标题 */
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  line-height: 1.3;
  position: relative;
}

.markdown-body :deep(h1) {
  font-family: 'Cinzel', serif; /* 特殊字体 */
  font-size: 2.2rem;
  border-bottom: 1px solid rgba(243, 233, 198, 0.2);
  padding-bottom: 0.5rem;
}

.markdown-body :deep(h2) {
  font-size: 1.9rem;
}

.markdown-body :deep(h3) {
  font-size: 1.6rem;
}

.markdown-body :deep(h4) {
  font-size: 1.3rem;
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
/* :deep(code) {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  background-color: #6c7086;
  color: #89dceb;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(pre) {
  position: relative; 
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
} */
/* ================== 2. 代码块 (Mac Style) ================== */
/* 行内代码 */
.markdown-body :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  background-color: rgba(147, 153, 178, 0.15); /* Surface overlay */
  color: #f5c2e7; /* Pink */
}

/* 代码块容器 */
.markdown-body :deep(pre.code-block) {
  position: relative;
  background: #181825; /* Mantle dark */
  border-radius: 12px;
  margin: 2rem 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 模拟 Mac 窗口头部 */
.markdown-body :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 语言标签放右边 */
  height: 36px;
  background: rgba(30, 30, 46, 0.8);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 0 1rem;
  position: relative;
}

/* Mac 三色小圆点 */
.markdown-body :deep(.code-header)::before {
  content: '';
  position: absolute;
  left: 1rem;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #ff5f56; /* Red */
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f; /* Yellow & Green */
}

.markdown-body :deep(.lang-tag) {
  font-size: 0.75rem;
  color: #6c7086;
  font-family: 'Fira Code', monospace;
  text-transform: uppercase;
}

.markdown-body :deep(pre code) {
  display: block;
  padding: 1.2rem;
  overflow-x: auto;
  background: transparent;
  color: #cdd6f4;
  font-size: 0.95rem;
  line-height: 1.6;
  border-radius: 0;
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
  margin: 1.5em; 
  padding-block: 0.0002em;  /* 上下 */
  padding-inline: 1em;   /* 左右 */
  color: #bac2de; border-left: .25em solid #74c7ec; 
  background: linear-gradient(
  90deg,
  #74c7ec 0%,    /* 起点 */
  #45475a 0.5%,   /* 中间颜色快速到位 */
  #45475a 100%   /* 后半段渐变慢慢延伸 */
  );
  font-style: italic;
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