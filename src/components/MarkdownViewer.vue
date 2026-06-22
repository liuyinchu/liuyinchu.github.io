<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItContainer from 'markdown-it-container'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const props = defineProps({
  src: { type: String, default: '' },
  content: { type: String, default: '' },
  variant: { type: String, default: 'article' },
  useCJK: { type: Boolean, default: false },
})

const emit = defineEmits(['tocGenerated', 'markdownLoaded'])

const renderedHtml = ref('')
const markdownBodyRef = ref(null)
let renderToken = 0
let mathJaxReadyPromise = null
let mermaidModule = null
let mermaidReady = false
let copyCleanups = []
let mounted = false

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function extractFormulas(text) {
  const formulas = []
  const replaced = text.replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g, (match) => {
    const key = `@@FORMULA_${formulas.length}@@`
    formulas.push(match)
    return key
  })
  return { replaced, formulas }
}

function restoreFormulas(html, formulas) {
  return html.replace(/@@FORMULA_(\d+)@@/g, (_, i) => formulas[i])
}

function renderCodeBlock(str, lang) {
  const rawLang = (lang || '').trim().split(/\s+/)[0]
  const safeLang = rawLang || 'text'
  let code = escapeHtml(str)

  if (rawLang && hljs.getLanguage(rawLang)) {
    try {
      code = hljs.highlight(str, { language: rawLang, ignoreIllegals: true }).value
    } catch (_) {
      code = escapeHtml(str)
    }
  }

  return `<pre class="hljs code-block"><div class="code-header"><span class="window-dots" aria-hidden="true"></span><span class="lang-tag">${escapeHtml(safeLang)}</span><button class="copy-button" type="button" data-copy-code>Copy</button></div><code>${code}</code></pre>`
}

function containerRenderer(name, label) {
  return {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return `<aside class="md-callout md-callout--${name}"><span class="md-callout-label">${label}</span>\n`
      }
      return '</aside>\n'
    },
  }
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: renderCodeBlock,
})

md.use(mdAnchor, {
  level: [1, 2, 3],
  permalink: mdAnchor.permalink.ariaHidden({
    placement: 'before',
    symbol: '#',
    class: 'header-anchor',
  }),
})
  .use(markdownItAttrs)
  .use(markdownItTaskLists, { enabled: true, label: true })
  .use(markdownItContainer, 'button-row', {
    render(tokens, idx) {
      return tokens[idx].nesting === 1 ? '<div class="md-button-row">\n' : '</div>\n'
    },
  })
  .use(markdownItContainer, 'note', containerRenderer('note', 'NOTE'))
  .use(markdownItContainer, 'tip', containerRenderer('tip', 'TIP'))
  .use(markdownItContainer, 'warning', containerRenderer('warning', 'WARNING'))

const defaultFence = md.renderer.rules.fence
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const lang = (token.info || '').trim().split(/\s+/)[0].toLowerCase()
  if (lang === 'mermaid') {
    return `<div class="markdown-mermaid mermaid">${escapeHtml(token.content)}</div>\n`
  }
  return defaultFence(tokens, idx, options, env, self)
}

const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('href') || ''
  if (/^https?:\/\//i.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx]
  const src = escapeHtml(token.attrGet('src') || '')
  const alt = escapeHtml(token.content || token.attrGet('alt') || '')
  const title = token.attrGet('title')
  const imageClass = token.attrGet('class')
  const figureClass = imageClass ? ` ${escapeHtml(imageClass)}` : ''
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''

  return `<figure class="md-figure${figureClass}"><img src="${src}" alt="${alt}" loading="lazy"${titleAttr}>${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
}

function loadMathJax() {
  if (window.MathJax?.typesetPromise) {
    return Promise.resolve(window.MathJax)
  }

  if (mathJaxReadyPromise) return mathJaxReadyPromise

  mathJaxReadyPromise = new Promise((resolve) => {
    window.MathJax = {
      loader: { load: ['[tex]/ams', '[tex]/autoload', '[tex]/physics', 'ui/lazy'] },
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        packages: { '[+]': ['ams', 'autoload', 'physics'] },
        tags: 'ams',
        processEscapes: true,
      },
      startup: {
        ready: () => {
          window.MathJax.startup.defaultReady()
          resolve(window.MathJax)
        },
      },
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js'
    script.async = true
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })

  return mathJaxReadyPromise
}

async function typesetMath() {
  const container = markdownBodyRef.value
  if (!container || !container.textContent.includes('$')) return

  const mathJax = await loadMathJax()
  if (mathJax?.typesetPromise) {
    await mathJax.typesetPromise([container])
  }
}

async function renderMermaid() {
  const container = markdownBodyRef.value
  if (!container) return

  const nodes = [...container.querySelectorAll('.markdown-mermaid')]
  if (!nodes.length) return

  if (!mermaidModule) {
    const imported = await import('mermaid')
    mermaidModule = imported.default || imported
  }

  if (!mermaidReady) {
    mermaidModule.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'dark',
      themeVariables: {
        background: '#181825',
        primaryColor: '#313244',
        primaryTextColor: '#cdd6f4',
        primaryBorderColor: '#89b4fa',
        lineColor: '#b4befe',
        secondaryColor: '#45475a',
        tertiaryColor: '#1e1e2e',
        clusterBkg: '#1e1e2e',
        clusterBorder: '#74c7ec',
        fontFamily: 'Inter, LXGW WenKai, sans-serif',
      },
    })
    mermaidReady = true
  }

  try {
    await mermaidModule.run({ nodes })
  } catch (error) {
    nodes.forEach((node) => {
      node.classList.add('is-error')
      node.textContent = `Mermaid render failed: ${error.message}`
    })
  }
}

function cleanupCopyButtons() {
  copyCleanups.forEach((cleanup) => cleanup())
  copyCleanups = []
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {
      // Fall through to the textarea fallback for constrained browser contexts.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)
  return success
}

function selectCode(pre) {
  const code = pre?.querySelector('code')
  if (!code) return false
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(code)
  selection.removeAllRanges()
  selection.addRange(range)
  return true
}

function attachCopyButtons() {
  cleanupCopyButtons()
  const container = markdownBodyRef.value
  if (!container) return

  container.querySelectorAll('[data-copy-code]').forEach((button) => {
    const onClick = async () => {
      const pre = button.closest('pre')
      const code = pre?.querySelector('code')?.innerText || ''
      const copied = await copyText(code)
      if (copied) {
        button.textContent = 'Copied'
        button.classList.add('copied')
        window.setTimeout(() => {
          button.textContent = 'Copy'
          button.classList.remove('copied')
        }, 1600)
      } else if (selectCode(pre)) {
        button.textContent = 'Selected'
        window.setTimeout(() => {
          button.textContent = 'Copy'
        }, 1600)
      } else {
        button.textContent = 'Error'
      }
    }

    button.addEventListener('click', onClick)
    copyCleanups.push(() => button.removeEventListener('click', onClick))
  })
}

async function readMarkdown() {
  if (props.content) return props.content
  if (!props.src) return ''

  const response = await fetch(props.src)
  if (!response.ok) {
    throw new Error(`Markdown load failed: ${response.status}`)
  }
  return response.text()
}

function emitToc() {
  const container = markdownBodyRef.value
  const tocItems = []
  if (container) {
    const headings = container.querySelectorAll('h1[id], h2[id], h3[id]')
    headings.forEach((heading) => {
      tocItems.push({
        level: Number(heading.tagName.substring(1)),
        text: heading.innerText.replace(/^#\s*/, '').trim(),
        id: heading.id,
      })
    })
  }
  emit('tocGenerated', tocItems)
}

async function renderMarkdown() {
  const token = ++renderToken
  try {
    const rawText = await readMarkdown()
    if (token !== renderToken) return

    emit('markdownLoaded', rawText)
    const { replaced, formulas } = extractFormulas(rawText)
    renderedHtml.value = restoreFormulas(md.render(replaced), formulas)

    await nextTick()
    if (token !== renderToken) return

    emitToc()
    attachCopyButtons()
    await renderMermaid()
    await typesetMath()
  } catch (error) {
    renderedHtml.value = `<p class="markdown-error">${escapeHtml(error.message)}</p>`
    emit('tocGenerated', [])
  }
}

onMounted(() => {
  mounted = true
  renderMarkdown()
})

watch(
  () => [props.src, props.content],
  () => {
    if (mounted) renderMarkdown()
  },
)

onBeforeUnmount(() => {
  cleanupCopyButtons()
})
</script>

<template>
  <div
    ref="markdownBodyRef"
    class="markdown-body"
    :class="[`markdown-body--${variant}`, { 'use-cjk': useCJK }]"
    v-html="renderedHtml"
  ></div>
</template>

<style scoped>
.markdown-body {
  --md-text: #d8def8;
  --md-muted: #aeb7d7;
  --md-soft: rgba(205, 214, 244, 0.72);
  --md-heading: #f3e9c6;
  --md-link: #89b4fa;
  --md-link-strong: #b4befe;
  --md-accent: #74c7ec;
  --md-accent-2: #cba6f7;
  --md-panel: rgba(30, 30, 46, 0.76);
  --md-panel-strong: rgba(24, 24, 37, 0.94);
  --md-border: rgba(180, 190, 254, 0.16);

  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: var(--md-text);
  font-family: "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Inter", "Noto Serif SC", "Times New Roman", serif;
  font-size: clamp(1.13rem, 1.08vw, 1.22rem);
  line-height: 2.02;
}

.markdown-body--embed {
  max-width: none;
  margin: 0;
  padding: 0;
}

.markdown-body--page {
  max-width: min(100% - 2rem, 960px);
  margin: clamp(2rem, 4vw, 4rem) auto;
  padding: clamp(1.2rem, 3vw, 2.2rem);
  border: 1px solid rgba(180, 190, 254, 0.1);
  border-radius: 1.15rem;
  background:
    linear-gradient(145deg, rgba(49, 50, 68, 0.42), rgba(24, 24, 37, 0.72)),
    var(--md-panel);
  box-shadow:
    18px 18px 44px rgba(0, 0, 0, 0.24),
    -10px -10px 28px rgba(180, 190, 254, 0.035);
}

.markdown-body.use-cjk {
  font-family: "LXGW WenKai", "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif;
}

.markdown-body :deep(::selection) {
  background-color: rgba(137, 180, 250, 0.92);
  color: #11111b;
  text-shadow: none;
}

.markdown-body :deep(p) {
  margin: 0 0 1.55rem;
  color: var(--md-text);
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(strong) {
  color: #cba6f7;
  font-weight: 780;
}

.markdown-body :deep(em) {
  color: #bac2de;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  position: relative;
  color: var(--md-heading);
  font-weight: 760;
  letter-spacing: 0;
  line-height: 1.32;
  margin: 3rem 0 1.35rem;
  text-wrap: balance;
}

.markdown-body :deep(h1) {
  font-family: "Cinzel", "LXGW WenKai", serif;
  font-size: clamp(2.25rem, 3.2vw, 2.75rem);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(243, 233, 198, 0.22);
}

.markdown-body :deep(h2) {
  font-size: clamp(1.82rem, 2.45vw, 2.2rem);
}

.markdown-body :deep(h3) {
  font-size: clamp(1.52rem, 2vw, 1.78rem);
}

.markdown-body :deep(h4) {
  font-size: clamp(1.28rem, 1.65vw, 1.45rem);
}

.markdown-body :deep(.header-anchor) {
  margin-right: 0.45rem;
  color: rgba(137, 180, 250, 0.55);
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.markdown-body :deep(h1:hover .header-anchor),
.markdown-body :deep(h2:hover .header-anchor),
.markdown-body :deep(h3:hover .header-anchor) {
  opacity: 1;
}

.markdown-body :deep(a) {
  color: var(--md-link);
  font-weight: 680;
  text-decoration: none;
  border-bottom: 1px solid rgba(137, 180, 250, 0.42);
  transition: color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.markdown-body :deep(a:hover),
.markdown-body :deep(a:focus-visible) {
  color: var(--md-link-strong);
  border-bottom-color: currentColor;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 1.7rem;
  padding-left: 1.65rem;
}

.markdown-body :deep(li) {
  margin: 0.55rem 0;
  padding-left: 0.12rem;
}

.markdown-body :deep(li::marker) {
  color: var(--md-accent);
}

.markdown-body :deep(.task-list-item) {
  list-style: none;
}

.markdown-body :deep(.task-list-item input) {
  width: 1rem;
  height: 1rem;
  margin: 0 0.55rem 0 -1.45rem;
  accent-color: var(--md-accent-2);
}

.markdown-body :deep(blockquote) {
  margin: 2rem 0;
  padding: 1.1rem 1.3rem 1.1rem 1.45rem;
  border-left: 0;
  border-radius: 0.95rem;
  color: #cdd6f4;
  background:
    linear-gradient(90deg, rgba(137, 180, 250, 0.22), transparent 0.45rem),
    linear-gradient(145deg, rgba(69, 71, 90, 0.42), rgba(24, 24, 37, 0.58));
  box-shadow:
    inset 0 0 0 1px rgba(180, 190, 254, 0.12),
    inset 9px 9px 24px rgba(0, 0, 0, 0.18),
    inset -8px -8px 18px rgba(180, 190, 254, 0.035);
}

.markdown-body :deep(blockquote p) {
  color: #cdd6f4;
}

.markdown-body :deep(hr) {
  width: min(100%, 34rem);
  height: 0.72rem;
  margin: 3rem auto;
  border: 0;
  border-radius: 999px;
  background:
    linear-gradient(90deg, transparent, rgba(137, 180, 250, 0.38), rgba(203, 166, 247, 0.34), transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.24),
    0 12px 26px rgba(0, 0, 0, 0.18);
}

.markdown-body :deep(:not(pre) > code) {
  padding: 0.16em 0.42em;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.45rem;
  color: #f5c2e7;
  background:
    linear-gradient(145deg, rgba(69, 71, 90, 0.62), rgba(24, 24, 37, 0.74));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  font-family: "Fira Code", "JetBrains Mono", monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre.code-block) {
  position: relative;
  margin: 2.35rem 0;
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 1rem;
  background: #181825;
  box-shadow:
    0 22px 58px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.markdown-body :deep(.code-header) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.7rem;
  padding: 0 0.95rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.1);
  background: linear-gradient(180deg, rgba(49, 50, 68, 0.82), rgba(30, 30, 46, 0.78));
}

.markdown-body :deep(.window-dots) {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
  background: #f38ba8;
  box-shadow: 1.05rem 0 0 #f9e2af, 2.1rem 0 0 #a6e3a1;
  flex: 0 0 auto;
}

.markdown-body :deep(.lang-tag) {
  margin-left: 2.15rem;
  color: rgba(205, 214, 244, 0.58);
  font-family: "Fira Code", monospace;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.markdown-body :deep(.copy-button) {
  margin-left: auto;
  border: 1px solid rgba(137, 180, 250, 0.22);
  border-radius: 999px;
  padding: 0.28rem 0.68rem;
  color: rgba(205, 214, 244, 0.82);
  background: rgba(30, 30, 46, 0.65);
  font: inherit;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 720;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease;
}

.markdown-body :deep(.copy-button:hover),
.markdown-body :deep(.copy-button:focus-visible) {
  color: #11111b;
  border-color: rgba(137, 180, 250, 0.72);
  background: #89b4fa;
  transform: translateY(-1px);
}

.markdown-body :deep(.copy-button.copied) {
  color: #11111b;
  border-color: #a6e3a1;
  background: #a6e3a1;
}

.markdown-body :deep(pre code) {
  display: block;
  overflow-x: auto;
  padding: 1.28rem 1.35rem;
  color: #cdd6f4;
  background: transparent;
  font-family: "Fira Code", "JetBrains Mono", monospace;
  font-size: 0.96rem;
  line-height: 1.75;
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  margin: 2rem 0;
  overflow-x: auto;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 0.9rem;
  background: rgba(24, 24, 37, 0.44);
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.82rem 0.95rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.1);
  border-right: 1px solid rgba(180, 190, 254, 0.08);
  vertical-align: top;
}

.markdown-body :deep(th) {
  color: #f3e9c6;
  background: rgba(69, 71, 90, 0.46);
  font-weight: 760;
}

.markdown-body :deep(tr:last-child td) {
  border-bottom: 0;
}

.markdown-body :deep(th:last-child),
.markdown-body :deep(td:last-child) {
  border-right: 0;
}

.markdown-body :deep(.md-figure) {
  margin: 2.2rem auto;
  text-align: center;
}

.markdown-body :deep(.md-figure img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1rem;
  background: rgba(30, 30, 46, 0.68);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.26);
}

.markdown-body :deep(.figure-wide img) {
  width: min(100%, 780px);
}

.markdown-body :deep(figcaption) {
  margin-top: 0.72rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.92rem;
  line-height: 1.6;
}

.markdown-body :deep(.md-button-row) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin: 1.7rem 0 2rem;
}

.markdown-body :deep(.md-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.7rem;
  padding: 0 1.1rem;
  border: 1px solid rgba(137, 180, 250, 0.22);
  border-radius: 999px;
  color: #11111b;
  background: linear-gradient(135deg, #89b4fa, #cba6f7);
  box-shadow: 0 12px 30px rgba(137, 180, 250, 0.16);
  font-family: "Inter", "LXGW WenKai", sans-serif;
  font-size: 0.95rem;
  font-weight: 780;
  line-height: 1.2;
  text-decoration: none;
}

.markdown-body :deep(.md-button:hover),
.markdown-body :deep(.md-button:focus-visible) {
  color: #11111b;
  border-color: rgba(203, 166, 247, 0.68);
  transform: translateY(-1px);
}

.markdown-body :deep(.md-callout) {
  margin: 2rem 0;
  padding: 1.1rem 1.25rem;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 0.95rem;
  background: rgba(30, 30, 46, 0.7);
}

.markdown-body :deep(.md-callout-label) {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--md-accent);
  font-family: "Fira Code", monospace;
  font-size: 0.78rem;
  font-weight: 760;
  letter-spacing: 0.13em;
}

.markdown-body :deep(.md-callout--warning .md-callout-label) {
  color: #fab387;
}

.markdown-body :deep(.markdown-mermaid) {
  margin: 2.25rem 0;
  padding: 1.2rem;
  overflow-x: auto;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 1rem;
  background:
    linear-gradient(145deg, rgba(49, 50, 68, 0.34), rgba(24, 24, 37, 0.68)),
    #181825;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.markdown-body :deep(.markdown-mermaid svg) {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}

.markdown-body :deep(.markdown-mermaid.is-error) {
  color: #f38ba8;
  white-space: pre-wrap;
}

.markdown-body :deep(.ascii-title) {
  overflow-x: auto;
  margin: 0 0 2rem;
  color: rgba(137, 180, 250, 0.78);
  background: transparent;
  border: 0;
  box-shadow: none;
  font-family: "Fira Code", monospace;
  font-size: clamp(0.48rem, 1.02vw, 0.78rem);
  line-height: 1.1;
  text-align: center;
}

.markdown-body :deep(.markdown-error) {
  color: #f38ba8;
}

.markdown-body :deep(mjx-container) {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  color: var(--md-text);
  font-size: 1.06em;
  line-height: 1.9;
}

@media (max-width: 768px) {
  .markdown-body {
    margin: 1rem auto;
    padding: 0 0.35rem;
    font-size: clamp(1.04rem, 4vw, 1.12rem);
    line-height: 1.9;
  }

  .markdown-body--embed {
    margin: 0;
    padding: 0;
  }

  .markdown-body--page {
    max-width: min(100% - 1.4rem, 960px);
    padding: 1rem;
    border-radius: 0.9rem;
  }

  .markdown-body :deep(h1),
  .markdown-body :deep(h2),
  .markdown-body :deep(h3),
  .markdown-body :deep(h4) {
    margin-top: 2.25rem;
    margin-bottom: 1rem;
    overflow-wrap: anywhere;
  }

  .markdown-body :deep(h1) {
    font-size: clamp(1.8rem, 7vw, 2.15rem);
  }

  .markdown-body :deep(h2) {
    font-size: clamp(1.55rem, 6vw, 1.9rem);
  }

  .markdown-body :deep(h3) {
    font-size: clamp(1.32rem, 5vw, 1.6rem);
  }

  .markdown-body :deep(.header-anchor) {
    display: none;
  }

  .markdown-body :deep(blockquote) {
    margin: 1.5rem 0;
    padding: 1rem 1rem 1rem 1.15rem;
  }

  .markdown-body :deep(pre.code-block) {
    margin: 1.65rem 0;
  }

  .markdown-body :deep(pre code) {
    padding: 1rem;
    font-size: 0.84rem;
  }

  .markdown-body :deep(.md-button-row) {
    display: grid;
  }

  .markdown-body :deep(.md-button) {
    width: 100%;
  }
}
</style>
