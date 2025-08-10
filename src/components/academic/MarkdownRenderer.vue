<template>
  <section class="content-section">
    <h2 class="section-title">Research Summary</h2>
    <div class="markdown-wrapper">
      <!-- v-html 渲染的内容会被下面的 scoped 样式通过 :deep() 控制 -->
      <div class="markdown-content" v-html="renderedHtml"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import MarkdownIt from 'markdown-it';

const props = defineProps({
  source: {
    type: String,
    required: true,
    default: ''
  }
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

let isMathJaxReady = ref(false);

const loadMathJax = () => {
  if (window.MathJax) {
    isMathJaxReady.value = true;
    return;
  }
  const configScript = document.createElement('script');
  configScript.innerHTML = `
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      },
      svg: {
        fontCache: 'global'
      }
    };
  `;
  document.head.appendChild(configScript);
  const script = document.createElement('script');
  script.id = 'MathJax-script';
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
  script.async = true;
  script.onload = () => { isMathJaxReady.value = true; };
  document.head.appendChild(script);
};

const renderedHtml = computed(() => {
  return props.source ? md.render(props.source) : '';
});

// 新增：为代码块添加复制按钮的函数
const addCopyButtons = () => {
  // 查找所有由 markdown-it 生成的 <pre> 标签
  document.querySelectorAll('.markdown-content pre').forEach(pre => {
    // 防止重复添加按钮
    if (pre.querySelector('.copy-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<span>Copy</span>';
    pre.appendChild(button);

    button.addEventListener('click', () => {
      const code = pre.querySelector('code')?.innerText || '';
      
      // 使用 document.execCommand 以兼容 iframe 环境
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        button.innerHTML = '<span>Copied!</span>';
        button.classList.add('copied');
      } catch (err) {
        console.error('复制失败', err);
        button.innerHTML = '<span>Error</span>';
      }
      document.body.removeChild(textArea);

      // 2秒后恢复按钮状态
      setTimeout(() => {
        button.innerHTML = '<span>Copy</span>';
        button.classList.remove('copied');
      }, 2000);
    });
  });
};

watch(renderedHtml, () => {
  // 确保 DOM 更新后再执行后续操作
  nextTick(() => {
    // 渲染数学公式
    if (isMathJaxReady.value && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
    // 添加复制按钮
    addCopyButtons();
  });
}, { immediate: true });

onMounted(() => {
  loadMathJax();
});
</script>

<style scoped>
/* 整体卡片样式，更紧凑 */
.content-section {
  margin-top: 4rem;
  padding: 2rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s 0.6s ease-out forwards;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1rem 0; /* 减小下方间距 */
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 1px;
}

.markdown-wrapper {
  padding: 0 0.5rem;
}

/* --- Markdown 内容样式 (使用 :deep() 确保局部生效) --- */

/* 修改点 3：Markdown 标题不再有下划线 */
:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3) {
  color: var(--primary-color);
  /* border-bottom: 1px solid var(--border-color); */ /* 已移除 */
  padding-bottom: 0.2rem;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
}

:deep(.markdown-content a) {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
}
:deep(.markdown-content a:hover) {
  color: var(--primary-color-hover);
  text-decoration: underline;
}

:deep(.markdown-content p) {
  line-height: 1.7; /* 减小行高 */
  font-size: 1.05rem;
  margin-bottom: 0.8rem; /* 减小段落间距 */
}

:deep(.markdown-content blockquote) {
  border-left: 4px solid var(--accent-color);
  padding: 0.8rem 1rem;
  color: var(--ctp-mocha-subtext1, #bac2de);
  margin-left: 0;
  background-color: var(--surface-color);
}

:deep(.markdown-content img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto 0.5rem auto; /* 减小图片上下间距 */
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

/* 修改点 4：图片 caption 样式 */
/* 假设 caption 是紧跟在图片段落后的一个斜体段落 */
:deep(.markdown-content p > img + em),
:deep(.markdown-content p:has(img) + p > em) {
  display: block;
  text-align: center;
  font-style: normal; /* 移除斜体 */
  color: #94e2d5; /* 换个颜色 */
  font-size: 0.9em;
  margin-top: 0.5rem;
}

/* 修改点 1：新的表格样式 */
:deep(.markdown-content table) {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: collapse;
  font-size: 0.9em;
  color: var(--text-color);
}
:deep(.markdown-content th), 
:deep(.markdown-content td) {
  border: 1px solid var(--border-color);
  padding: 0.6em 0.8em;
  text-align: left;
  vertical-align: middle;
}
:deep(.markdown-content th) {
  font-weight: bold;
  background-color: var(--surface-color-hover);
  color: var(--primary-color);
}
:deep(.markdown-content tbody tr) {
  transition: background-color 0.2s ease;
  background-color: transparent;
}
/* :deep(.markdown-content tbody tr:nth-child(even)) {
  background-color: var(--surface-color-hover);
} */
:deep(.markdown-content tbody tr:hover) {
  background-color: rgb(147, 153, 178);
  color: var(--ctp-mocha-base);
}

/* 修改点 5：新的代码样式 */
:deep(.markdown-content code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: var(--surface-color-hover);
  color: var(--ctp-mocha-subtext1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(.markdown-content pre) {
  position: relative;
  background-color: var(--surface-color);
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  font-size: 0.95rem;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
}

:deep(.markdown-content pre code) {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* 代码块复制按钮样式 */
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
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s ease;
}

:deep(.markdown-content pre:hover .copy-button) {
  opacity: 1;
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


@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* -------------------------------------------------- */
/* 新增：为“网页图表”（研究路线图）添加的专属样式 */
/* -------------------------------------------------- */
:deep(.roadmap) {
  margin: 2rem 0;
}
:deep(.roadmap-stage) {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}
:deep(.stage-icon) {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--surface-color-hover);
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  transition: all 0.3s ease;
}
:deep(.roadmap-stage:hover .stage-icon) {
  background-color: var(--primary-color);
  color: var(--ctp-mocha-base);
  transform: scale(1.1);
}
:deep(.stage-content h4) {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.2rem;
}
:deep(.stage-content p) {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ctp-mocha-subtext1, #bac2de);
}
:deep(.roadmap-connector) {
  height: 2rem;
  width: 2px;
  background-color: var(--border-color);
  margin: 0.5rem 0 0.5rem 1.5rem; /* 对齐到图标中心 */
  opacity: 0.5;
}

@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

</style>