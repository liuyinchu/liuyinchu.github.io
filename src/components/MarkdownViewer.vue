<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import mdAnchor from 'markdown-it-anchor'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItContainer from 'markdown-it-container'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import {
  attachMarkdownComponentInteractions,
  installMarkdownComponentRules,
  renderMarkdownWithComponents,
} from '../utils/markdownComponents'

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
let componentCleanup = null
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

const headingAnchorIcon = `
  <svg class="header-anchor-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
`

md.use(mdAnchor, {
  level: [1, 2, 3],
  permalink: mdAnchor.permalink.linkInsideHeader({
    placement: 'before',
    symbol: headingAnchorIcon,
    class: 'header-anchor',
    ariaHidden: false,
    renderAttrs: () => ({
      'aria-label': '定位到此标题',
      title: '定位到此标题',
    }),
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

installMarkdownComponentRules(md, escapeHtml)

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
  const classNames = new Set(
    (token.attrGet('class') || '').split(/\s+/).filter(Boolean)
  )

  if (!classNames.has('header-anchor') && !classNames.has('md-button')) {
    token.attrJoin('class', 'md-text-link')
  }

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

function cleanupComponentInteractions() {
  componentCleanup?.()
  componentCleanup = null
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
    renderedHtml.value = restoreFormulas(renderMarkdownWithComponents(replaced, md, escapeHtml), formulas)

    await nextTick()
    if (token !== renderToken) return

    emitToc()
    attachCopyButtons()
    cleanupComponentInteractions()
    componentCleanup = attachMarkdownComponentInteractions(markdownBodyRef.value)
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
  cleanupComponentInteractions()
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
  --md-heading: #89b4fa;
  --md-link: #89b4fa;
  --md-link-strong: #b4befe;
  --md-accent: #74c7ec;
  --md-accent-2: #b4befe;
  --md-accent-3: #89dceb;
  --md-panel: rgba(30, 30, 46, 0.76);
  --md-panel-strong: rgba(24, 24, 37, 0.94);
  --md-border: rgba(180, 190, 254, 0.16);

  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  box-sizing: content-box;
  color: var(--md-text);
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Inter", "Noto Serif SC", "Times New Roman", serif;
  font-size: clamp(1.13rem, 1.08vw, 1.22rem);
  line-height: 2.02;
  -webkit-font-smoothing: auto;
  text-rendering: auto;
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
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif;
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
  color: #89dceb;
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
  font-family: "TsangerJinKai02-W05", "仓耳今楷02 W05", "LXGW WenKai", "Cinzel", serif;
  font-weight: 760;
  letter-spacing: 0;
  line-height: 1.32;
  margin: 3rem 0 1.35rem;
  text-wrap: balance;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  scroll-margin-top: calc(var(--site-header-height, 72px) + 1.25rem);
}

.markdown-body :deep(h1) {
  font-size: clamp(2.25rem, 3.2vw, 2.75rem);
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(137, 180, 250, 0.26);
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

.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  color: var(--md-text);
}

.markdown-body :deep(.header-anchor) {
  display: inline-grid;
  width: 1.08em;
  height: 1.08em;
  margin-right: 0.42rem;
  place-items: center;
  border: 0;
  border-radius: 0.34em;
  color: #89b4fa;
  background: transparent;
  box-shadow: none;
  text-decoration: none;
  opacity: 0.68;
  transform: translateY(0.08em) scale(0.94);
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.markdown-body :deep(.header-anchor-icon) {
  width: 0.9em;
  height: 0.9em;
}

.markdown-body :deep(h1:hover .header-anchor),
.markdown-body :deep(h2:hover .header-anchor),
.markdown-body :deep(h3:hover .header-anchor),
.markdown-body :deep(.header-anchor:focus-visible) {
  color: #89b4fa;
  opacity: 1;
  transform: translateY(0.08em) scale(1);
  background-color: rgba(137, 180, 250, 0.1);
  box-shadow: 0 0 0 1px rgba(137, 180, 250, 0.2), 0 5px 16px rgba(137, 180, 250, 0.12);
}

.markdown-body :deep(.md-text-link) {
  padding-inline: 0.06em;
  padding-bottom: 0.045em;
  border: 0;
  border-radius: 0.16em;
  color: var(--md-text);
  font-weight: 680;
  text-decoration: none;
  background-image: linear-gradient(#b4befe, #b4befe);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 0.14em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: color 180ms ease, background-size 210ms var(--motion-ease), box-shadow 180ms ease;
}

.markdown-body :deep(.md-text-link:hover),
.markdown-body :deep(.md-text-link:focus-visible) {
  color: #181825;
  background-size: 100% 100%;
  box-shadow: 0 0.22em 0.65em rgba(180, 190, 254, 0.18);
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
  height: 0.25em;
  margin: 2.25rem 0;
  border: 0;
  background: rgba(180, 190, 254, 0.22);
}

.markdown-body :deep(:not(pre) > code) {
  padding: 0.16em 0.42em;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.45rem;
  color: #b4befe;
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
  background: #ff5f57;
  box-shadow: 1.05rem 0 0 #febc2e, 2.1rem 0 0 #28c840;
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
  border-color: #94e2d5;
  background: #94e2d5;
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

.markdown-body--article :deep(pre.code-block) {
  background: #14141f;
}

.markdown-body--article :deep(.code-header) {
  background: linear-gradient(180deg, rgba(43, 44, 61, 0.86), rgba(24, 24, 37, 0.9));
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 1.65rem 0;
  overflow-x: auto;
  border-spacing: 0;
  border-collapse: collapse;
  background: transparent;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 0.62rem 0.82rem;
  border: 2px solid rgba(180, 190, 254, 0.16);
  vertical-align: top;
}

.markdown-body :deep(th) {
  color: #cdd6f4;
  background: rgba(49, 50, 68, 0.62);
  font-weight: 760;
}

.markdown-body :deep(tr:nth-child(2n) td) {
  background: rgba(49, 50, 68, 0.22);
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

.markdown-body :deep(.figure-medium img) {
  width: min(100%, 520px);
}

.markdown-body :deep(.name-logo img) {
  width: min(100%, 680px);
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
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
  background: linear-gradient(135deg, #89b4fa, #b4befe);
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
  border-color: rgba(180, 190, 254, 0.72);
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
  color: #b4befe;
}

.markdown-body :deep(.md-alert) {
  --alert-accent: #b4befe;
  --alert-soft: rgba(180, 190, 254, 0.09);
  position: relative;
  margin: 1.85rem 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--alert-accent) 23%, transparent);
  border-left: 3px solid var(--alert-accent);
  border-radius: 0.8rem;
  background:
    linear-gradient(105deg, var(--alert-soft), transparent 52%),
    rgba(24, 24, 37, 0.62);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.025),
    0 12px 34px rgba(0, 0, 0, 0.12);
}

.markdown-body :deep(.md-alert--info) {
  --alert-accent: #89b4fa;
  --alert-soft: rgba(137, 180, 250, 0.09);
}

.markdown-body :deep(.md-alert--tip) {
  --alert-accent: #89dceb;
  --alert-soft: rgba(137, 220, 235, 0.09);
}

.markdown-body :deep(.md-alert--success) {
  --alert-accent: #94e2d5;
  --alert-soft: rgba(148, 226, 213, 0.09);
}

.markdown-body :deep(.md-alert--question) {
  --alert-accent: #cba6f7;
  --alert-soft: rgba(203, 166, 247, 0.09);
}

.markdown-body :deep(.md-alert--warning) {
  --alert-accent: #f9e2af;
  --alert-soft: rgba(249, 226, 175, 0.09);
}

.markdown-body :deep(.md-alert--danger) {
  --alert-accent: #f38ba8;
  --alert-soft: rgba(243, 139, 168, 0.09);
}

.markdown-body :deep(.md-alert-head) {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  padding: 0.92rem 1.1rem 0.52rem 1.05rem;
  color: var(--alert-accent);
  font-family: "Inter", "LXGW WenKai", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.markdown-body :deep(.md-alert-head > strong) {
  color: inherit;
  font-weight: 760;
}

.markdown-body :deep(.md-alert-icon) {
  display: inline-flex;
  width: 1.15rem;
  height: 1.15rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.markdown-body :deep(.md-alert-symbol) {
  display: block;
  width: 100%;
  height: 100%;
}

.markdown-body :deep(.md-alert-body) {
  padding: 0 1.1rem 0.98rem 1.05rem;
}

.markdown-body :deep(.md-alert-body > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.md-alert-inline) {
  display: inline-flex;
  align-items: center;
  gap: 0.32em;
  padding: 0.08em 0.42em 0.08em 0.34em;
  border: 1px solid color-mix(in srgb, var(--alert-accent, #b4befe) 24%, transparent);
  border-radius: 0.42em;
  color: var(--alert-accent, #b4befe);
  background: var(--alert-soft, rgba(180, 190, 254, 0.09));
  line-height: 1.35;
  vertical-align: 0.02em;
}

.markdown-body :deep(.md-alert-inline-icon) {
  display: inline-flex;
  width: 0.94em;
  height: 0.94em;
  flex: 0 0 auto;
}

.markdown-body :deep(.md-blur-inline) {
  appearance: none;
  display: inline;
  margin: 0;
  padding: 0.05em 0.35em;
  border: 1px dashed rgba(180, 190, 254, 0.3);
  border-radius: 0.38em;
  color: inherit;
  background: rgba(69, 71, 90, 0.5);
  font: inherit;
  cursor: pointer;
}

.markdown-body :deep(.md-blur-inline span) {
  filter: blur(0.34em);
  opacity: 0.72;
  transition: filter 0.28s ease, opacity 0.28s ease;
}

.markdown-body :deep(.md-blur-inline:hover span),
.markdown-body :deep(.md-blur-inline:focus-visible span),
.markdown-body :deep(.md-blur-inline.is-revealed span) {
  filter: blur(0);
  opacity: 1;
}

.markdown-body :deep(.md-blur-block) {
  margin: 2rem 0;
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1rem;
  background: rgba(24, 24, 37, 0.68);
}

.markdown-body :deep(.md-blur-block-head) {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.12);
  color: var(--md-muted);
  font-size: 0.86rem;
}

.markdown-body :deep(.md-blur-block-head button) {
  border: 1px solid rgba(137, 180, 250, 0.26);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  color: #cdd6f4;
  background: rgba(49, 50, 68, 0.72);
  font: inherit;
  cursor: pointer;
}

.markdown-body :deep(.md-blur-block-content) {
  padding: 1.15rem;
  filter: blur(0.72rem);
  opacity: 0.48;
  user-select: none;
  pointer-events: none;
  transition: filter 0.36s ease, opacity 0.36s ease;
}

.markdown-body :deep(.md-blur-block.is-revealed .md-blur-block-content) {
  filter: blur(0);
  opacity: 1;
  user-select: auto;
  pointer-events: auto;
}

.markdown-body :deep(.md-folding) {
  margin: 1.65rem 0;
  overflow: clip;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.9rem;
  background: rgba(30, 30, 46, 0.6);
}

.markdown-body :deep(.md-folding > summary) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.92rem 1rem;
  color: #cdd6f4;
  font-weight: 720;
  cursor: pointer;
  list-style: none;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.markdown-body :deep(.md-folding > summary:hover),
.markdown-body :deep(.md-folding > summary:focus-visible) {
  color: #89dceb;
  background: rgba(137, 180, 250, 0.06);
}

.markdown-body :deep(.md-folding > summary::-webkit-details-marker) {
  display: none;
}

.markdown-body :deep(.md-folding > summary::before) {
  content: '';
  width: 0.54rem;
  height: 0.54rem;
  flex: 0 0 auto;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  color: #89b4fa;
  transform: rotate(-45deg);
  transform-origin: center;
  transition: transform 0.2s ease, color 0.18s ease;
}

.markdown-body :deep(.md-folding[open] > summary::before) {
  color: #89dceb;
  transform: rotate(45deg);
}

.markdown-body :deep(.md-folding > .md-folding-content) {
  padding: 0.95rem 1rem 1rem 2.3rem;
  border-top: 1px solid rgba(180, 190, 254, 0.1);
}

.markdown-body :deep(.md-folding .md-folding) {
  margin: 0.8rem 0 0;
}

.markdown-body :deep(.md-chat) {
  display: grid;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.1rem;
  list-style: none;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 1.1rem;
  background:
    linear-gradient(180deg, rgba(49, 50, 68, 0.32), rgba(24, 24, 37, 0.72));
}

.markdown-body :deep(.md-chat-message) {
  display: grid;
  max-width: min(82%, 38rem);
  margin: 0;
  padding: 0;
}

.markdown-body :deep(.md-chat-message.is-self) {
  justify-self: end;
}

.markdown-body :deep(.md-chat-speaker) {
  margin: 0 0.45rem 0.3rem;
  color: var(--md-muted);
  font-size: 0.78rem;
}

.markdown-body :deep(.md-chat-message.is-self .md-chat-speaker) {
  text-align: right;
}

.markdown-body :deep(.md-chat-bubble) {
  padding: 0.72rem 0.95rem;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 0.35rem 1rem 1rem 1rem;
  background: rgba(69, 71, 90, 0.68);
}

.markdown-body :deep(.md-chat-message.is-self .md-chat-bubble) {
  border-color: rgba(137, 180, 250, 0.22);
  border-radius: 1rem 0.35rem 1rem 1rem;
  background: linear-gradient(135deg, rgba(137, 180, 250, 0.28), rgba(180, 190, 254, 0.18));
}

.markdown-body :deep(.md-chat-bubble > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.md-chat-system) {
  justify-self: center;
  margin: 0;
  padding: 0.2rem 0.72rem;
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.58);
  background: rgba(17, 17, 27, 0.48);
  font-size: 0.76rem;
  text-align: center;
}

.markdown-body :deep(.md-chat-system > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.md-timeline),
.markdown-body :deep(.md-steps) {
  position: relative;
  display: grid;
  gap: 0;
  margin: 2rem 0;
  padding: 0;
  list-style: none;
}

.markdown-body :deep(.md-timeline::before),
.markdown-body :deep(.md-steps::before) {
  content: '';
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 0.85rem;
  width: 1px;
  background: linear-gradient(#89b4fa, #cba6f7);
}

.markdown-body :deep(.md-timeline li),
.markdown-body :deep(.md-steps li) {
  position: relative;
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr);
  gap: 1rem;
  margin: 0;
  padding: 0 0 1.45rem;
}

.markdown-body :deep(.md-timeline-marker),
.markdown-body :deep(.md-steps-marker) {
  z-index: 1;
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 1px solid rgba(137, 180, 250, 0.55);
  border-radius: 50%;
  color: #11111b;
  background: #89b4fa;
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  font-weight: 800;
}

.markdown-body :deep(.md-timeline-marker) {
  width: 0.72rem;
  height: 0.72rem;
  margin: 0.52rem;
  background: #cba6f7;
}

.markdown-body :deep(.md-timeline-content),
.markdown-body :deep(.md-steps-content) {
  padding: 0.1rem 0 0;
}

.markdown-body :deep(.md-timeline-content > strong),
.markdown-body :deep(.md-steps-content > strong) {
  display: block;
  margin-bottom: 0.35rem;
  color: #89dceb;
}

.markdown-body :deep(.md-gallery),
.markdown-body :deep(.md-columns) {
  display: grid;
  grid-template-columns: repeat(var(--md-columns, 2), minmax(0, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  align-items: start;
}

.markdown-body :deep(.md-gallery .md-figure) {
  margin: 0;
}

.markdown-body :deep(.md-gallery > p:empty) {
  display: none;
}

.markdown-body :deep(.md-column),
.markdown-body :deep(.md-columns > *) {
  margin-top: 0;
}

.markdown-body :deep(.md-column) {
  min-width: 0;
  padding: 1rem;
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 0.85rem;
  background: rgba(30, 30, 46, 0.46);
}

.markdown-body :deep(.md-column > :first-child) {
  margin-top: 0;
}

.markdown-body :deep(.md-column > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.md-link-card) {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "eyebrow icon"
    "title icon"
    "copy icon";
  gap: 0.28rem 1rem;
  margin: 1.65rem 0;
  padding: 1.12rem 1.15rem 1.08rem 1.2rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.9rem;
  color: var(--md-text);
  background:
    linear-gradient(110deg, rgba(137, 180, 250, 0.075), transparent 58%),
    rgba(24, 24, 37, 0.58);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.markdown-body :deep(.md-link-card:hover),
.markdown-body :deep(.md-link-card:focus-visible) {
  border-color: rgba(137, 180, 250, 0.4);
  color: var(--md-text);
  background-color: rgba(30, 30, 46, 0.76);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.035),
    0 14px 34px rgba(0, 0, 0, 0.16);
  transform: translateY(-2px);
}

.markdown-body :deep(.md-link-card:focus-visible) {
  outline: 2px solid rgba(137, 180, 250, 0.58);
  outline-offset: 3px;
}

.markdown-body :deep(.md-link-card-eyebrow) {
  grid-area: eyebrow;
  color: var(--md-muted);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  font-weight: 680;
  letter-spacing: 0.14em;
  line-height: 1.4;
  text-transform: uppercase;
}

.markdown-body :deep(.md-link-card-title) {
  grid-area: title;
  color: #cdd6f4;
  font-size: 1.08rem;
  line-height: 1.45;
}

.markdown-body :deep(.md-link-card-copy) {
  grid-area: copy;
  color: rgba(205, 214, 244, 0.66);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.65;
}

.markdown-body :deep(.md-link-card-copy > :last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(.md-link-card-icon) {
  grid-area: icon;
  align-self: center;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid rgba(137, 180, 250, 0.18);
  border-radius: 0.62rem;
  color: #89b4fa;
  background: rgba(137, 180, 250, 0.06);
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.markdown-body :deep(.md-link-card-icon svg) {
  width: 1.05rem;
  height: 1.05rem;
}

.markdown-body :deep(.md-link-card:hover .md-link-card-icon),
.markdown-body :deep(.md-link-card:focus-visible .md-link-card-icon) {
  border-color: rgba(137, 220, 235, 0.38);
  color: #89dceb;
  transform: translate(2px, -2px);
}

.markdown-body :deep(.md-tip-inline) {
  position: relative;
  border-bottom: 1px dashed #f9e2af;
  color: #f9e2af;
  cursor: help;
}

.markdown-body :deep(.md-tip-inline::after) {
  content: attr(data-tip);
  position: absolute;
  z-index: 20;
  bottom: calc(100% + 0.55rem);
  left: 50%;
  width: max-content;
  max-width: min(20rem, 78vw);
  padding: 0.55rem 0.72rem;
  border: 1px solid rgba(249, 226, 175, 0.28);
  border-radius: 0.55rem;
  color: #cdd6f4;
  background: #181825;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
  font-size: 0.78rem;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  translate: -50% 0.3rem;
  transition: opacity 0.18s ease, translate 0.18s ease;
}

.markdown-body :deep(.md-tip-inline:hover::after),
.markdown-body :deep(.md-tip-inline:focus-visible::after) {
  opacity: 1;
  translate: -50% 0;
}

.markdown-body :deep(.md-badge) {
  display: inline-flex;
  align-items: center;
  padding: 0.12em 0.55em;
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 999px;
  color: #89b4fa;
  background: rgba(137, 180, 250, 0.1);
  font-family: "Inter", sans-serif;
  font-size: 0.78em;
  font-weight: 760;
  line-height: 1.5;
}

.markdown-body :deep(.md-badge--success) {
  border-color: rgba(148, 226, 213, 0.34);
  color: #94e2d5;
  background: rgba(148, 226, 213, 0.1);
}

.markdown-body :deep(.md-badge--warning) {
  border-color: rgba(249, 226, 175, 0.34);
  color: #f9e2af;
  background: rgba(249, 226, 175, 0.1);
}

.markdown-body :deep(.md-mark) {
  padding: 0.02em 0.22em;
  border-radius: 0.25em;
  color: #11111b;
  background: linear-gradient(100deg, rgba(249, 226, 175, 0.85), rgba(203, 166, 247, 0.76));
}

.markdown-body :deep(.md-progress) {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  max-width: 100%;
  padding: 0.1em 0.4em;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 0.45em;
  color: var(--md-muted);
  background: rgba(30, 30, 46, 0.5);
  font-size: 0.78em;
  line-height: 1.4;
  vertical-align: 0.04em;
  white-space: nowrap;
}

.markdown-body :deep(.md-progress-label) {
  color: rgba(205, 214, 244, 0.72);
}

.markdown-body :deep(.md-progress-track) {
  width: clamp(3.6rem, 8vw, 5.8rem);
  height: 0.45rem;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(69, 71, 90, 0.72);
}

.markdown-body :deep(.md-progress-track > span) {
  display: block;
  width: var(--md-progress);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #89b4fa, #cba6f7);
}

.markdown-body :deep(.md-progress-value) {
  min-width: 3ch;
  color: #89b4fa;
  font-family: "Fira Code", monospace;
  font-size: 0.92em;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.markdown-body :deep(.md-footnote-ref) {
  scroll-margin-top: 6rem;
}

.markdown-body :deep(.md-footnote-ref a) {
  border-bottom: 0;
  font-family: "Fira Code", monospace;
  font-size: 0.72em;
}

.markdown-body :deep(.md-footnotes) {
  margin-top: 3.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(180, 190, 254, 0.18);
  color: var(--md-muted);
  font-size: 0.9rem;
}

.markdown-body :deep(.md-footnotes h2) {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.markdown-body :deep(.md-footnotes li) {
  scroll-margin-top: 6rem;
}

.markdown-body :deep(.md-footnote-back) {
  margin-left: 0.35rem;
  border-bottom: 0;
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
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
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

.markdown-body :deep(.md-mini-toc) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.55rem 0.85rem;
  margin: 1.25rem 0 2rem;
  padding: 1rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.75rem;
  background: rgba(30, 30, 46, 0.52);
}

.markdown-body :deep(.md-mini-toc strong) {
  grid-column: 1 / -1;
  color: #89dceb;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.markdown-body :deep(.md-mini-toc a) {
  width: fit-content;
  font-size: 0.98rem;
}

.markdown-body :deep(h2.sec) {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.markdown-body :deep(a.back-top) {
  margin-left: auto;
  padding: 0.08rem 0.4rem;
  border: 1px solid rgba(180, 190, 254, 0.2);
  border-radius: 0.35rem;
  color: rgba(180, 190, 254, 0.82);
  font-family: "Fira Code", monospace;
  font-size: 0.72em;
  text-decoration: none;
}

.markdown-body :deep(a.back-top:hover),
.markdown-body :deep(a.back-top:focus-visible) {
  color: #89dceb;
  border-color: rgba(137, 220, 235, 0.44);
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

.markdown-body :deep(pre code),
.markdown-body :deep(table),
.markdown-body :deep(.markdown-mermaid),
.markdown-body :deep(.ascii-title),
.markdown-body :deep(mjx-container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(137, 180, 250, 0.48) rgba(30, 30, 46, 0.78);
}

.markdown-body :deep(pre code::-webkit-scrollbar),
.markdown-body :deep(table::-webkit-scrollbar),
.markdown-body :deep(.markdown-mermaid::-webkit-scrollbar),
.markdown-body :deep(.ascii-title::-webkit-scrollbar),
.markdown-body :deep(mjx-container::-webkit-scrollbar) {
  width: 0.62rem;
  height: 0.62rem;
}

.markdown-body :deep(pre code::-webkit-scrollbar-track),
.markdown-body :deep(table::-webkit-scrollbar-track),
.markdown-body :deep(.markdown-mermaid::-webkit-scrollbar-track),
.markdown-body :deep(.ascii-title::-webkit-scrollbar-track),
.markdown-body :deep(mjx-container::-webkit-scrollbar-track) {
  background: rgba(30, 30, 46, 0.78);
}

.markdown-body :deep(pre code::-webkit-scrollbar-thumb),
.markdown-body :deep(table::-webkit-scrollbar-thumb),
.markdown-body :deep(.markdown-mermaid::-webkit-scrollbar-thumb),
.markdown-body :deep(.ascii-title::-webkit-scrollbar-thumb),
.markdown-body :deep(mjx-container::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: rgba(137, 180, 250, 0.48);
}

@media (min-width: 1800px) {
  .markdown-body--page {
    max-width: min(100% - 4rem, 1120px);
  }
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
    box-sizing: border-box;
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

  .markdown-body :deep(.md-chat-message) {
    max-width: 92%;
  }

  .markdown-body :deep(.md-gallery),
  .markdown-body :deep(.md-columns) {
    grid-template-columns: 1fr;
  }

  .markdown-body :deep(.md-folding > .md-folding-content) {
    padding-left: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .markdown-body :deep(.md-blur-inline span),
  .markdown-body :deep(.md-blur-block-content),
  .markdown-body :deep(.md-folding > summary::before),
  .markdown-body :deep(.md-link-card),
  .markdown-body :deep(.md-link-card-icon),
  .markdown-body :deep(.md-tip-inline::after) {
    transition: none;
  }
}
</style>
