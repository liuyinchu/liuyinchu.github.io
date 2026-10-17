<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MarkdownViewer from '../MarkdownViewer.vue'

const props = defineProps({
  src: { type: String, default: '' },
  content: { type: String, default: undefined },
  useCJK: { type: Boolean, default: false },
})
const emit = defineEmits(['tocGenerated', 'markdownLoaded', 'loadError'])
const markdown = ref('')
const loading = ref(false)
const loadFailed = ref(false)
const attempt = ref(0)
const reader = ref(null)
let mathResizeObserver
let mathMutationObserver
let mathFrame = 0

// The shared viewer's native inline-math adjustment is article-only. Keep this
// reader's adjustment local so short formulae retain the text baseline.
function queueMathLayout() {
  if (mathFrame) return
  mathFrame = requestAnimationFrame(() => {
    mathFrame = 0
    for (const formula of reader.value?.querySelectorAll('mjx-container:not([display="true"])') || []) {
      const math = formula.querySelector('mjx-math')
      if (!math) continue
      const column = formula.closest('p, li, td, th, blockquote, figcaption, h1, h2, h3, h4, h5, h6') || reader.value
      const style = getComputedStyle(column)
      const width = column.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      formula.classList.toggle('frontier-inline-overflow', math.getBoundingClientRect().width > width + 1)
    }
  })
}
onMounted(() => {
  mathResizeObserver = new ResizeObserver(queueMathLayout)
  mathResizeObserver.observe(reader.value)
  mathMutationObserver = new MutationObserver(queueMathLayout)
  mathMutationObserver.observe(reader.value, { childList: true, subtree: true })
  queueMathLayout()
})
onBeforeUnmount(() => {
  mathResizeObserver?.disconnect()
  mathMutationObserver?.disconnect()
  if (mathFrame) cancelAnimationFrame(mathFrame)
})

watch(
  () => [props.src, props.content, attempt.value],
  async ([src, content], _, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    loadFailed.value = false
    markdown.value = ''
    loading.value = content === undefined && Boolean(src)

    if (content !== undefined || !src) {
      markdown.value = content || ''
      return
    }

    try {
      const response = await fetch(src, { signal: controller.signal, cache: 'no-cache' })
      if (!response.ok) throw new Error(`Report load failed: ${response.status}`)
      if (response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
        throw new Error('The report URL returned an HTML page')
      }
      const text = await response.text()
      if (!controller.signal.aborted) markdown.value = text
    } catch (error) {
      if (!controller.signal.aborted) {
        loadFailed.value = true
        emit('loadError', error)
        emit('tocGenerated', [])
      }
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div ref="reader" class="frontier-markdown" :aria-busy="loading">
    <div v-if="loading" class="frontier-markdown-state" role="status">
      <span class="frontier-markdown-state-label">正在加载</span>
      <p>正在载入正文。</p>
    </div>
    <div v-else-if="loadFailed" class="frontier-markdown-state" role="alert">
      <span class="frontier-markdown-state-label">加载失败</span>
      <p>正文暂时无法加载，请重试。</p>
      <button type="button" @click="attempt += 1">重新加载</button>
    </div>
    <MarkdownViewer
      v-else
      :content="markdown"
      :use-c-j-k="useCJK"
      variant="frontier"
      @toc-generated="emit('tocGenerated', $event)"
      @markdown-loaded="emit('markdownLoaded', $event)"
    />
  </div>
</template>

<style scoped>
.frontier-markdown { min-width: 0; }
.frontier-markdown-state { padding: 1.5rem; border: 1px solid var(--f-line); border-radius: 2px; color: var(--f-ink); background: var(--f-panel); }
.frontier-markdown-state-label { color: var(--f-ink); font: 600 0.95rem/1.5 var(--f-font); }
.frontier-markdown-state p { margin: 0.5rem 0 1rem; color: var(--f-muted); font-size: 0.875rem; }
.frontier-markdown-state button { padding: 0.55rem 0.8rem; border: 1px solid var(--f-line); border-radius: 2px; color: var(--f-blue); background: var(--f-surface); font: 600 0.875rem/1.5 var(--f-font); cursor: pointer; }
.frontier-markdown-state button:hover { color: var(--f-on-accent); border-color: var(--f-blue); background: var(--f-accent); }

.frontier-markdown :deep(.markdown-body.markdown-body--frontier) {
  --md-text: var(--f-ink);
  --md-muted: var(--f-muted);
  --md-soft: var(--f-muted);
  --md-heading: var(--f-ink);
  --md-link: var(--f-ink);
  --md-link-strong: var(--f-blue);
  --md-accent: var(--f-accent);
  --md-accent-2: var(--f-accent);
  --md-accent-3: var(--f-accent);
  --md-panel: var(--f-panel);
  --md-panel-strong: var(--f-panel);
  --md-border: var(--f-line);
  max-width: 46rem;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  color: var(--f-ink);
  background: transparent;
  font-family: var(--f-font);
  font-size: 1.03125rem;
  line-height: 1.88;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
}

.frontier-markdown :deep(.markdown-body--frontier p) { margin-bottom: 1.25rem; }
.frontier-markdown :deep(.markdown-body--frontier p:last-child) { margin-bottom: 0; }
.frontier-markdown :deep(.markdown-body--frontier strong) { color: var(--f-ink); font-weight: 700; -webkit-text-stroke: 0; }
.frontier-markdown :deep(.markdown-body--frontier em) { color: inherit; }

.frontier-markdown :deep(.markdown-body--frontier :is(h1, h2, h3, h4, h5, h6)) {
  margin: 2.8rem 0 1rem;
  color: var(--f-ink);
  font-family: var(--f-display);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.45;
  scroll-margin-top: var(--f-scroll-offset);
}
.frontier-markdown :deep(.markdown-body--frontier > :first-child) { margin-top: 0; }
.frontier-markdown :deep(.markdown-body--frontier h1) { padding: 0; border: 0; font-size: clamp(1.75rem, 2.6vw, 2.05rem); font-weight: 750; line-height: 1.35; }
.frontier-markdown :deep(.markdown-body--frontier h2) { margin-top: 3rem; padding: 0; border: 0; font-size: 1.4rem; }
.frontier-markdown :deep(.markdown-body--frontier h3) { margin: 2.15rem 0 0.8rem; font-size: 1.15rem; font-weight: 650; }
.frontier-markdown :deep(.markdown-body--frontier :is(h4, h5, h6)) { margin: 1.75rem 0 0.65rem; font-size: 1rem; font-weight: 650; }
.frontier-markdown :deep(.markdown-body--frontier > h1 + p) { margin-top: 1rem; color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier :is(h2, h3) + :is(h3, h4)) { margin-top: 1.5rem; }

.frontier-markdown :deep(.markdown-body--frontier .header-anchor) {
  position: absolute;
  top: 0.23em;
  left: -1.2em;
  width: 1em;
  height: 1em;
  margin: 0;
  border-radius: 2px;
  color: var(--f-blue);
  background: transparent;
  box-shadow: none;
  opacity: 0;
  pointer-events: none;
  transform: none;
  transition: opacity 160ms ease, background-color 160ms ease;
}
.frontier-markdown :deep(.markdown-body--frontier :is(h1, h2, h3):hover .header-anchor),
.frontier-markdown :deep(.markdown-body--frontier .header-anchor:focus-visible) {
  color: var(--f-blue);
  background: var(--f-accent-soft);
  box-shadow: none;
  opacity: 1;
  pointer-events: auto;
  transform: none;
}

.frontier-markdown :deep(.markdown-body--frontier .md-text-link) {
  padding: 0;
  border-radius: 0;
  color: var(--f-blue);
  background: none;
  box-shadow: none;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--f-muted);
  text-underline-offset: 0.2em;
  transition: color 140ms ease;
}
.frontier-markdown :deep(.markdown-body--frontier .md-text-link:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-text-link:focus-visible) {
  color: var(--f-ink);
  background: none;
  box-shadow: none;
}
.frontier-markdown :deep(.markdown-body--frontier :is(ul, ol)) { padding-left: 1.5rem; }
.frontier-markdown :deep(.markdown-body--frontier li) { margin-block: 0.35rem; }
.frontier-markdown :deep(.markdown-body--frontier li > p) { margin-bottom: 0.65rem; }
.frontier-markdown :deep(.markdown-body--frontier li::marker) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier hr) { height: 1px; margin: 2.5rem 0; background: var(--f-line); }

/* Keep the viewer's semantic structures and interactions; change only their material. */
.frontier-markdown :deep(.markdown-body--frontier :is(
  blockquote, pre:where(.code-block), .code-header, .md-image-link, :where(.md-figure) img,
  .md-callout, .md-alert, .md-alert-inline, .md-blur-inline, .md-blur-block,
  .md-folding, .md-chat, .md-chat-bubble,
  .md-chat-system, .md-column, .md-link-card, .md-mini-toc, .markdown-mermaid,
  .md-badge, .md-progress, .md-progress-track, .md-mark, .md-link-card-icon
)),
.frontier-markdown :deep(.markdown-body--frontier .md-chat-message.is-self .md-chat-bubble) {
  border-color: var(--f-line);
  border-radius: 2px;
  color: var(--f-ink);
  background: var(--f-panel);
  box-shadow: none;
}

.frontier-markdown :deep(.markdown-body.markdown-body--frontier blockquote) {
  margin: 1.75rem 0;
  padding: 0.35rem 0 0.35rem 1.15rem;
  border-left: 2px solid color-mix(in srgb, var(--f-accent) 35%, var(--f-line));
  border-radius: 0;
  color: var(--f-muted);
  background: transparent;
  font-size: 0.94em;
  line-height: 1.8;
}
.frontier-markdown :deep(.markdown-body--frontier blockquote p) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier blockquote p:last-child) { margin-bottom: 0; }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link) { background: transparent; }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:hover) { background: transparent; box-shadow: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:hover img),
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:focus-visible img) { filter: none; transform: none; }
.frontier-markdown :deep(.markdown-body--frontier :is(figcaption, .md-figcaption)) { color: var(--f-muted); font: 0.82rem/1.6 var(--f-font); text-align: left; }

.frontier-markdown :deep(.markdown-body--frontier :not(pre) > code) {
  padding: 0.12em 0.36em;
  border-color: transparent;
  border-radius: 2px;
  color: var(--f-ink);
  background: var(--f-panel);
  box-shadow: none;
  font-family: var(--f-mono);
  font-size: 0.86em;
}
.frontier-markdown :deep(.markdown-body--frontier pre.code-block) { margin-block: 1.75rem; }
.frontier-markdown :deep(.markdown-body--frontier .code-header) { min-height: 2.5rem; border-radius: 0; background: color-mix(in srgb, var(--f-panel) 65%, var(--f-surface)); }
.frontier-markdown :deep(.markdown-body--frontier .window-dots) { display: none; }
.frontier-markdown :deep(.markdown-body--frontier .lang-tag) { margin-left: 0; color: var(--f-muted); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier pre code) { padding: 1.15rem 1.25rem; color: var(--f-ink); background: transparent; font: 0.86rem/1.75 var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier .hljs [class*='hljs-']) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-keyword, .hljs-literal, .hljs-number, .hljs-built_in, .hljs-selector-tag, .hljs-name, .hljs-attribute)) { color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-comment, .hljs-quote, .hljs-meta)) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-addition, .hljs-deletion)) { color: var(--f-ink); background: var(--f-panel); text-decoration-color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier .hljs .hljs-deletion) { text-decoration: line-through; }

.frontier-markdown :deep(.markdown-body--frontier table) { display: block; width: max-content; max-width: 100%; overflow-x: auto; margin-block: 1.75rem; border: 1px solid var(--f-line); border-radius: 2px; border-collapse: separate; border-spacing: 0; background: var(--f-surface); }
.frontier-markdown :deep(.markdown-body--frontier :is(th, td)) { border: 0; border-bottom: 1px solid var(--f-line); padding: 0.7rem 0.9rem; font-size: 0.875rem; line-height: 1.7; overflow-wrap: anywhere; }
.frontier-markdown :deep(.markdown-body--frontier th) { color: var(--f-ink); background: var(--f-panel); font-weight: 650; text-align: left; }
.frontier-markdown :deep(.markdown-body--frontier tr:nth-child(2n) td) { background: color-mix(in srgb, var(--f-panel) 55%, var(--f-surface)); }
.frontier-markdown :deep(.markdown-body--frontier tbody tr:last-child td) { border-bottom: 0; }
.frontier-markdown :deep(.markdown-body--frontier tbody tr:hover) { color: var(--f-ink); background: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier tbody tr:hover td) { background: var(--f-panel); }

.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top)) {
  border: 1px solid var(--f-line);
  border-radius: 2px;
  color: var(--f-muted);
  background: var(--f-surface);
  box-shadow: none;
  font-family: var(--f-font);
  transform: none;
}
.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top):hover),
.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top):focus-visible),
.frontier-markdown :deep(.markdown-body--frontier .copy-button.copied) {
  border-color: var(--f-blue);
  color: var(--f-on-accent);
  background: var(--f-accent);
  transform: none;
}

.frontier-markdown :deep(.markdown-body--frontier :is(.md-button, .md-stream-button)) {
  border: 1px solid var(--f-accent);
  border-radius: 2px;
  color: var(--f-on-accent);
  background: var(--f-accent);
  box-shadow: none;
  font-family: var(--f-font);
  transform: none;
}
.frontier-markdown :deep(.markdown-body--frontier :is(.md-button, .md-stream-button):hover),
.frontier-markdown :deep(.markdown-body--frontier :is(.md-button, .md-stream-button):focus-visible) {
  border-color: var(--f-ink);
  color: var(--f-paper);
  background: var(--f-ink);
  box-shadow: none;
  transform: none;
}
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button) { width: fit-content; min-width: 12rem; height: auto; min-height: 3rem; padding: 0.65rem 1rem; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-stream-button-field, .md-stream-button-core, .md-stream-button-filter)),
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button::before) { display: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button-content) { max-width: 100%; gap: 0.15rem; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-stream-button-eyebrow, .md-stream-button-copy)) { color: inherit; font: 0.72rem/1.4 var(--f-font); letter-spacing: 0; text-transform: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button-title) { color: inherit; font: 750 0.86rem/1.3 var(--f-font); }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button-copy p) { color: inherit; }

.frontier-markdown :deep(.markdown-body--frontier :is(.md-alert, .md-alert-inline)) { --alert-accent: var(--f-accent); --alert-soft: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert) { border-left: 3px solid var(--f-accent); background: var(--f-accent-soft); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-callout-label, .md-alert-head, .md-link-card-eyebrow, .md-chat-speaker, .md-chat-system)) { color: var(--f-muted); font-family: var(--f-font); font-size: 0.8rem; letter-spacing: 0; text-transform: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-alert-head > strong) { color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-blur-block-head, .md-folding > .md-folding-content)) { border-color: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding) { margin-block: 1.75rem; background: var(--f-surface); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary) { padding: 0.85rem 1rem; color: var(--f-ink); font-size: 0.9rem; font-weight: 600; }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > .md-folding-content) { padding: 1.25rem; }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary:focus-visible) { color: var(--f-blue); background: var(--f-paper); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary::before),
.frontier-markdown :deep(.markdown-body--frontier .md-folding[open] > summary::before) { color: var(--f-blue); }

.frontier-markdown :deep(.markdown-body--frontier .md-timeline::before),
.frontier-markdown :deep(.markdown-body--frontier .md-steps::before) { background: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-timeline-marker, .md-steps-marker)) { border-color: var(--f-blue); border-radius: 50%; color: var(--f-on-accent); background: var(--f-blue); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-timeline-content, .md-steps-content) > strong) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:focus-visible) { border-color: var(--f-blue); color: var(--f-ink); background: var(--f-panel); box-shadow: none; transform: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card-title) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card-copy) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:hover .md-link-card-icon),
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:focus-visible .md-link-card-icon) { color: var(--f-blue); border-color: var(--f-blue); transform: none; }

.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline) { color: var(--f-blue); border-color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline::after) { border-color: var(--f-line); border-radius: 2px; color: var(--f-ink); background: var(--f-surface); box-shadow: 0 6px 24px rgba(24, 34, 55, 0.1); }
.frontier-markdown :deep(.markdown-body--frontier .md-mark) { border-radius: 2px; color: var(--f-ink); background: var(--f-accent-soft); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-badge, .md-alert-inline)) { border-radius: 2px; color: var(--f-blue); background: var(--f-accent-soft); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-progress-label, .md-progress-value)) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .md-progress-track > span) { border-radius: inherit; background: var(--f-olive); }
.frontier-markdown :deep(.markdown-body--frontier .md-footnotes) { border-color: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier .md-footnotes h2) { padding-top: 0; border-top: 0; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-mini-toc strong, .ascii-title)) { color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier :is(.markdown-error, .markdown-mermaid.is-error)) { color: var(--f-ink); }

/* Mermaid embeds ID-scoped colors, so these local overrides need explicit priority. */
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.node, .cluster) :is(rect, circle, ellipse, polygon, path)),
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.actor, .note)) { fill: var(--f-panel) !important; stroke: var(--f-ink) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(text, tspan)) { fill: var(--f-ink) !important; font-family: var(--f-font) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.nodeLabel, .edgeLabel, .label)) { color: var(--f-ink) !important; background-color: var(--f-panel) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.flowchart-link, .edgePath path, .actor-line, .messageLine0, .messageLine1)) { stroke: var(--f-accent) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid marker path) { fill: var(--f-accent) !important; stroke: var(--f-accent) !important; }

.frontier-markdown :deep(.markdown-body--frontier mjx-container[display='true']) {
  margin-block: 1.5rem;
  padding: 1rem 0.75rem;
  box-sizing: border-box;
  border: 1px solid var(--f-line);
  border-radius: 2px;
  background: color-mix(in srgb, var(--f-panel) 45%, var(--f-surface));
}

.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)) { scrollbar-color: var(--f-muted) var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)::-webkit-scrollbar-track) { background: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)::-webkit-scrollbar-thumb) { background: var(--f-muted); border-color: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :focus-visible) { outline: 2px solid var(--f-accent); outline-offset: 3px; }
.frontier-markdown :deep(.markdown-body--frontier ::selection) { color: var(--f-on-accent); background: var(--f-accent); text-shadow: none; }

@media (max-width: 680px) {
  .frontier-markdown :deep(.markdown-body.markdown-body--frontier) { font-size: 1rem; line-height: 1.85; }
  .frontier-markdown :deep(.markdown-body--frontier h2) { margin-top: 2.5rem; font-size: 1.3rem; }
  .frontier-markdown :deep(.markdown-body--frontier h3) { margin-top: 1.85rem; font-size: 1.1rem; }
  .frontier-markdown :deep(.markdown-body.markdown-body--frontier blockquote) { padding-left: 0.9rem; }
  .frontier-markdown :deep(.markdown-body--frontier .md-folding > .md-folding-content) { padding: 1rem; }
  .frontier-markdown :deep(.markdown-body--frontier table) { display: block; overflow-x: auto; }
  .frontier-markdown :deep(.markdown-body--frontier :is(th, td)) { white-space: nowrap; overflow-wrap: normal; }
  .frontier-markdown :deep(.markdown-body--frontier pre code) { font-size: 0.78rem; padding: 1rem; }
}
@media (prefers-reduced-motion: reduce) {
  .frontier-markdown :deep(.markdown-body--frontier :is(.header-anchor, .md-text-link)) { transition: none; }
}

/* NASA manual materials apply to all supported structures, not the shared viewer. */
.frontier-markdown :deep(.markdown-body--frontier) { --md-accent: var(--f-blue); --md-accent-2: var(--f-olive); --md-accent-3: var(--f-rust); }
.frontier-markdown :deep(.markdown-body--frontier h2) { border-top: 1px solid var(--f-line); padding-top: 1.15rem; }
.frontier-markdown :deep(.markdown-body--frontier h4) { font-size: 1.02rem; }
.frontier-markdown :deep(.markdown-body--frontier h5) { font-size: .96rem; }
.frontier-markdown :deep(.markdown-body--frontier h6) { font-size: .9rem; color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier :is(del,s)) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier a:not(.md-button):not(.md-stream-button)) { color: var(--f-blue); }
.frontier-markdown :deep(.markdown-body--frontier .task-list-item) { list-style: none; }
.frontier-markdown :deep(.markdown-body--frontier input[type='checkbox']) { accent-color: var(--f-olive); width: 1em; height: 1em; margin-right: .6em; vertical-align: -.12em; }
.frontier-markdown :deep(.markdown-body--frontier hr) { border: 0; background: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier blockquote) { border-left-color: var(--f-gold); }
.frontier-markdown :deep(.markdown-body--frontier pre:not(.code-block):not(.ascii-title)) { padding: 1rem; overflow-x: auto; background: var(--f-panel); color: var(--f-ink); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier pre.code-block) { border: 1px solid var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier pre code) { white-space: pre; overflow-wrap: normal; word-break: normal; }
.frontier-markdown :deep(.markdown-body--frontier .code-header) { border-bottom: 1px solid var(--f-line); background: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-string, .hljs-regexp, .hljs-addition)) { color: #566035; }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-number, .hljs-literal, .hljs-deletion)) { color: var(--f-rust); }
.frontier-markdown :deep(.markdown-body--frontier :is(th,td)) { white-space: nowrap; overflow-wrap: normal; }
.frontier-markdown :deep(.markdown-body--frontier th) { font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier details:not(.md-folding)) { margin-block: 1.5rem; padding: 1rem; border: 1px solid var(--f-line); background: var(--f-surface); }
.frontier-markdown :deep(.markdown-body--frontier summary) { cursor: pointer; }
.frontier-markdown :deep(.markdown-body--frontier img) { max-width: 100%; height: auto; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-gallery,.md-columns) > *) { min-width: 0; }
.frontier-markdown :deep(.markdown-body--frontier .md-alert) { --alert-accent: var(--f-blue); border-left-color: var(--alert-accent); background: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-alert--tip,.md-alert--success)) { --alert-accent: var(--f-olive); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert--warning) { --alert-accent: var(--f-gold); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert--danger) { --alert-accent: var(--f-rust); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert-head) { color: var(--alert-accent); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert-head > strong) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-callout-label,.md-link-card-eyebrow,.md-chat-speaker,.md-chat-system,.md-badge,.md-progress-value)) { font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier .md-chat-message.is-self .md-chat-speaker) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .md-callout--warning .md-callout-label) { color: var(--f-rust); }
.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline::after) { left: 0; translate: 0 .3rem; box-shadow: 2px 2px 0 var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline:is(:hover,:focus-visible)::after) { translate: 0 0; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button) { max-width: 100%; min-width: 0; transition: background-color .18s; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button:active) { transform: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button :is(strong,em,code,a)) { color: inherit; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button code) { border-color: currentColor; background: transparent; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button :is(.md-stream-button-eyebrow,.md-stream-button-title,.md-stream-button-copy)) { white-space: normal; overflow: visible; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-footnote-ref,.md-footnotes li,[id])) { scroll-margin-top: var(--f-scroll-offset); }
.frontier-markdown :deep(.markdown-body--frontier .md-footnote-ref a) { font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier mjx-container:not([display='true'])) { display: inline; overflow: visible; max-width: none; line-height: normal; padding: 0; border: 0; background: transparent; }
/* Keep MathJax's hidden, accessible MathML inside its lazy inline container. */
.frontier-markdown :deep(.markdown-body--frontier mjx-assistive-mml) { width: 1px !important; height: 1px !important; }
.frontier-markdown :deep(.markdown-body--frontier mjx-container.frontier-inline-overflow:not([display='true'])) { display: inline-block; max-width: 100%; overflow-x: auto; overflow-y: hidden; vertical-align: middle; padding-block: .2em; }
.frontier-markdown :deep(.markdown-body--frontier mjx-container[display='true']) { display: block; max-width: 100%; overflow-x: auto; overflow-y: hidden; background: var(--f-panel); }
@media (max-width: 680px) {
  .frontier-markdown :deep(.markdown-body--frontier .header-anchor) { left: -.95em; width: .8em; }
  .frontier-markdown :deep(.markdown-body--frontier .md-mini-toc) { grid-template-columns: 1fr; }
  .frontier-markdown :deep(.markdown-body--frontier .md-tip-inline::after) { position: fixed; left: 1rem; right: 1rem; bottom: 1rem; width: auto; max-width: calc(100vw - 2rem); }
}
</style>
