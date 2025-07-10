<!-- <template>
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
</style> -->

<template>
  <div ref="markdownContainer" class="markdown-body" v-html="compiledHtml"></div>
</template>

<script setup>
import { computed, defineProps, onMounted, onUpdated, ref } from 'vue'

// --- 依赖导入 ---
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import hljs from 'highlight.js'

// [调整] 只保留 markdown-it-attrs 插件
import markdownItAttrs from 'markdown-it-attrs'

// --- 样式导入 ---
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-dark.css'

// --- Props 定义 ---
const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// --- [优化] Markdown-it 实例 (保持单例模式) ---
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`
      } catch (e) { console.error(e) }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})
.use(markdownItKatex)
.use(markdownItAttrs); // [调整] 只保留此插件

// --- 响应式计算 ---
const compiledHtml = computed(() => md.render(props.content || ''))


// --- [核心优化] 代码块一键复制功能 ---
const markdownContainer = ref(null)

function addCopyButtons() {
  if (markdownContainer.value) {
    const pres = markdownContainer.value.querySelectorAll('pre')
    pres.forEach(pre => {
      // 防止重复添加按钮
      if (pre.querySelector('.copy-button')) return;

      const button = document.createElement('button')
      button.className = 'copy-button'
      button.innerHTML = '<span>Copy</span>' // 使用 span 包裹方便做动画

      button.addEventListener('click', () => {
        const code = pre.querySelector('code').innerText
        navigator.clipboard.writeText(code).then(() => {
          button.innerHTML = '<span>Copied!</span>';
          button.classList.add('copied');
          setTimeout(() => {
            button.innerHTML = '<span>Copy</span>';
            button.classList.remove('copied');
          }, 2000)
        }).catch(err => {
          console.error('Failed to copy: ', err)
          button.innerText = 'Error';
        })
      })
      
      pre.appendChild(button)
    })
  }
}

// 在组件挂载和更新后都执行此函数，以确保所有代码块都有复制按钮
onMounted(addCopyButtons)
onUpdated(addCopyButtons)

</script>

<style scoped>
.markdown-body {
  line-height: 1.8;
  font-size: 1.05rem;
  color: var(--text-color);
}

/* ===== [优化] 视觉效果全面增强 ===== */

:deep(*) {
  line-height: 1.8;
}

:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  font-weight: 700;
  color: var(--primary-color);
  margin: 2.5rem 0 1.25rem 0;
  line-height: 1.4;
}

:deep(p) { margin-bottom: 1.2rem; }

:deep(a) {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}
:deep(a:hover) {
  color: var(--primary-color-hover);
  border-bottom-color: var(--primary-color-hover);
}

:deep(ul), :deep(ol) {
  padding-left: 1.8rem;
  margin-bottom: 1.2rem;
}
:deep(li) { margin-bottom: 0.6rem; }

:deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.5rem 1.5rem;
  background-color: var(--surface-color);
  border-left: 4px solid var(--accent-color);
  color: var(--ctp-mocha-subtext1);
}
:deep(blockquote p:last-child) { margin-bottom: 0; }

:deep(img) {
  max-width: 100%;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin: 2rem auto;
  display: block;
}

/* [新增] 分割线样式 */
:deep(hr) {
  border: 0; /* 移除默认边框 */
  height: 1px; /* 为线条本身的高度 */
  margin: 3.5rem 0; /* 增加垂直间距，让分割感更强 */
  background-color: rgb(242, 205, 205); /* 线条的基础颜色 */
  position: relative; /* 为伪元素提供定位上下文 */
  text-align: center; /* 使中间的符号居中 */
}

/* [新增] 表格样式 */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-radius: 0.75rem;
  overflow: hidden;
}
:deep(th), :deep(td) {
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  text-align: left;
}
:deep(thead) {
  background-color: var(--surface-color-hover);
  color: var(--text-color);
  font-weight: 600;
}
:deep(tbody tr:nth-child(even)) {
  background-color: var(--surface-color);
}


/* --- 代码块样式优化 --- */
:deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: var(--surface-color-hover);
  color: var(--ctp-mocha-subtext1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(pre) {
  position: relative; /* 为复制按钮提供定位上下文 */
  background-color: var(--surface-color);
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

/* [核心优化] 代码块复制按钮样式 */
:deep(.copy-button) {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: var(--surface-color-hover);
  color: var(--ctp-mocha-subtext1);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0; /* 默认隐藏 */
  transform: translateY(5px);
  transition: all 0.2s ease;
}

:deep(pre:hover .copy-button) {
  opacity: 1; /* 悬浮在代码块上时显示 */
  transform: translateY(0);
}

:deep(.copy-button:hover) {
  background-color: var(--primary-color);
  color: var(--ctp-mocha-base);
}

:deep(.copy-button.copied) {
  background-color: var(--success-color);
  color: var(--ctp-mocha-base);
}

:deep(.copy-button span) {
  display: inline-block;
  transition: all 0.2s ease;
}
</style>