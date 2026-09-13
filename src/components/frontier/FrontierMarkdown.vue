<script setup>
import { ref, watch } from 'vue'
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
      const response = await fetch(src, { signal: controller.signal })
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
  <div class="frontier-markdown" :aria-busy="loading">
    <div v-if="loading" class="frontier-markdown-state" role="status">
      <span class="frontier-markdown-state-label">REPORT CONTENT</span>
      <p>正在载入报告正文。</p>
    </div>
    <div v-else-if="loadFailed" class="frontier-markdown-state" role="alert">
      <span class="frontier-markdown-state-label">CONTENT UNAVAILABLE</span>
      <p>报告正文暂时无法加载，请重试。</p>
      <button type="button" @click="attempt += 1">重新加载 <span aria-hidden="true">↗</span></button>
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
.frontier-markdown-state { padding: 2rem 0; border-block: 1px solid var(--f-line); color: var(--f-ink); }
.frontier-markdown-state-label { color: var(--f-muted); font: 0.7rem/1.5 var(--f-mono); letter-spacing: 0.08em; }
.frontier-markdown-state p { margin: 0.8rem 0 1rem; }
.frontier-markdown-state button { padding: 0.55rem 0.8rem; border: 1px solid var(--f-ink); border-radius: 0; color: var(--f-ink); background: transparent; font: inherit; cursor: pointer; }
.frontier-markdown-state button:hover { color: var(--f-on-accent); border-color: var(--f-accent); background: var(--f-accent); }

.frontier-markdown :deep(.markdown-body.markdown-body--frontier) {
  --md-text: var(--f-ink);
  --md-muted: var(--f-muted);
  --md-soft: var(--f-muted);
  --md-heading: var(--f-ink);
  --md-link: var(--f-accent);
  --md-link-strong: var(--f-accent);
  --md-accent: var(--f-accent);
  --md-accent-2: var(--f-accent);
  --md-accent-3: var(--f-accent);
  --md-panel: var(--f-panel);
  --md-panel-strong: var(--f-panel);
  --md-border: var(--f-line);
  max-width: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: var(--f-ink);
  background: transparent;
  font-family: var(--f-font);
  font-size: 1.04rem;
  line-height: 1.85;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
}

.frontier-markdown :deep(.markdown-body--frontier p) { margin-bottom: 1.4rem; }
.frontier-markdown :deep(.markdown-body--frontier p:last-child) { margin-bottom: 0; }
.frontier-markdown :deep(.markdown-body--frontier strong) { color: var(--f-ink); font-weight: 750; -webkit-text-stroke: 0; }
.frontier-markdown :deep(.markdown-body--frontier em) { color: inherit; }

.frontier-markdown :deep(.markdown-body--frontier :is(h1, h2, h3, h4, h5, h6)) {
  margin: 2.7rem 0 1rem;
  color: var(--f-ink);
  font-family: var(--f-font);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.25;
  scroll-margin-top: 2rem;
}
.frontier-markdown :deep(.markdown-body--frontier > :first-child) { margin-top: 0; }
.frontier-markdown :deep(.markdown-body--frontier h1) { padding-bottom: 0.85rem; border-bottom: 1px solid var(--f-ink); font-size: clamp(1.9rem, 3vw, 2.6rem); }
.frontier-markdown :deep(.markdown-body--frontier h2) { padding-top: 1.4rem; border-top: 1px solid var(--f-line); font-size: clamp(1.55rem, 2.2vw, 2rem); }
.frontier-markdown :deep(.markdown-body--frontier h3) { font-size: 1.35rem; }
.frontier-markdown :deep(.markdown-body--frontier :is(h4, h5, h6)) { font-size: 1.1rem; }

.frontier-markdown :deep(.markdown-body--frontier .header-anchor) {
  border-radius: 0;
  color: var(--f-accent);
  background: transparent;
  box-shadow: none;
  opacity: 0.5;
  transform: translateY(0.04em);
}
.frontier-markdown :deep(.markdown-body--frontier :is(h1, h2, h3):hover .header-anchor),
.frontier-markdown :deep(.markdown-body--frontier .header-anchor:focus-visible) {
  color: var(--f-accent);
  background: var(--f-panel);
  box-shadow: none;
  opacity: 1;
  transform: translateY(0.04em);
}

.frontier-markdown :deep(.markdown-body--frontier .md-text-link) {
  padding: 0;
  border-radius: 0;
  color: var(--f-accent);
  background: none;
  box-shadow: none;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: color 140ms ease;
}
.frontier-markdown :deep(.markdown-body--frontier .md-text-link:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-text-link:focus-visible) {
  color: var(--f-ink);
  background: none;
  box-shadow: none;
}
.frontier-markdown :deep(.markdown-body--frontier :is(ul, ol)) { padding-left: 1.5rem; }
.frontier-markdown :deep(.markdown-body--frontier li) { margin-block: 0.4rem; }
.frontier-markdown :deep(.markdown-body--frontier hr) { height: 1px; margin: 2.5rem 0; background: var(--f-line); }

/* Keep the viewer's semantic structures and interactions; change only their material. */
.frontier-markdown :deep(.markdown-body--frontier :is(
  blockquote, pre.code-block, .code-header, .md-image-link, .md-figure img,
  .md-callout, .md-alert, .md-alert-inline, .md-blur-inline, .md-blur-block,
  .md-folding, .md-chat, .md-chat-bubble,
  .md-chat-system, .md-column, .md-link-card, .md-mini-toc, .markdown-mermaid,
  .md-badge, .md-progress, .md-progress-track, .md-mark, .md-link-card-icon
)),
.frontier-markdown :deep(.markdown-body--frontier .md-chat-message.is-self .md-chat-bubble) {
  border-color: var(--f-line);
  border-radius: 0;
  color: var(--f-ink);
  background: var(--f-panel);
  box-shadow: none;
}

.frontier-markdown :deep(.markdown-body--frontier blockquote) { padding: 1.1rem 1.25rem; border-left: 3px solid var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier blockquote p) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link) { background: transparent; }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:hover) { background: transparent; box-shadow: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:hover img),
.frontier-markdown :deep(.markdown-body--frontier .md-image-link:focus-visible img) { filter: none; transform: none; }
.frontier-markdown :deep(.markdown-body--frontier :is(figcaption, .md-figcaption)) { color: var(--f-muted); font: 0.76rem/1.6 var(--f-mono); text-align: left; }

.frontier-markdown :deep(.markdown-body--frontier :not(pre) > code) {
  padding: 0.13em 0.3em;
  border-color: var(--f-line);
  border-radius: 0;
  color: var(--f-ink);
  background: var(--f-panel);
  box-shadow: none;
  font-family: var(--f-mono);
  font-size: 0.88em;
}
.frontier-markdown :deep(.markdown-body--frontier pre.code-block) { margin-block: 2rem; }
.frontier-markdown :deep(.markdown-body--frontier .code-header) { min-height: 2.6rem; }
.frontier-markdown :deep(.markdown-body--frontier .window-dots) { display: none; }
.frontier-markdown :deep(.markdown-body--frontier .lang-tag) { margin-left: 0; color: var(--f-muted); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier pre code) { padding: 1.15rem 1.25rem; color: var(--f-ink); background: transparent; font: 0.86rem/1.75 var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier .hljs [class*='hljs-']) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-keyword, .hljs-literal, .hljs-number, .hljs-built_in, .hljs-selector-tag, .hljs-name, .hljs-attribute)) { color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-comment, .hljs-quote, .hljs-meta)) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .hljs :is(.hljs-addition, .hljs-deletion)) { color: var(--f-ink); background: var(--f-panel); text-decoration-color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier .hljs .hljs-deletion) { text-decoration: line-through; }

.frontier-markdown :deep(.markdown-body--frontier :is(th, td)) { border: 1px solid var(--f-line); padding: 0.7rem 0.9rem; font-size: 0.92rem; }
.frontier-markdown :deep(.markdown-body--frontier th) { color: var(--f-ink); background: var(--f-panel); font-weight: 750; }
.frontier-markdown :deep(.markdown-body--frontier tr:nth-child(2n) td) { background: transparent; }

.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top)) {
  border: 1px solid var(--f-line);
  border-radius: 0;
  color: var(--f-ink);
  background: transparent;
  box-shadow: none;
  font-family: var(--f-mono);
  transform: none;
}
.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top):hover),
.frontier-markdown :deep(.markdown-body--frontier :is(.copy-button, .md-blur-block-head button, a.back-top):focus-visible),
.frontier-markdown :deep(.markdown-body--frontier .copy-button.copied) {
  border-color: var(--f-accent);
  color: var(--f-on-accent);
  background: var(--f-accent);
  transform: none;
}

.frontier-markdown :deep(.markdown-body--frontier :is(.md-button, .md-stream-button)) {
  border: 1px solid var(--f-accent);
  border-radius: 0;
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
.frontier-markdown :deep(.markdown-body--frontier :is(.md-stream-button-eyebrow, .md-stream-button-copy)) { color: inherit; font-size: 0.63rem; }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button-title) { color: inherit; font: 750 0.86rem/1.3 var(--f-font); }
.frontier-markdown :deep(.markdown-body--frontier .md-stream-button-copy p) { color: inherit; }

.frontier-markdown :deep(.markdown-body--frontier :is(.md-alert, .md-alert-inline)) { --alert-accent: var(--f-accent); --alert-soft: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert) { border-left-color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-callout-label, .md-alert-head, .md-link-card-eyebrow, .md-chat-speaker, .md-chat-system)) { color: var(--f-muted); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier .md-alert-head > strong) { color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-blur-block-head, .md-folding > .md-folding-content)) { border-color: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary:focus-visible) { color: var(--f-accent); background: var(--f-paper); }
.frontier-markdown :deep(.markdown-body--frontier .md-folding > summary::before),
.frontier-markdown :deep(.markdown-body--frontier .md-folding[open] > summary::before) { color: var(--f-accent); }

.frontier-markdown :deep(.markdown-body--frontier .md-timeline::before),
.frontier-markdown :deep(.markdown-body--frontier .md-steps::before) { background: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-timeline-marker, .md-steps-marker)) { border-color: var(--f-accent); border-radius: 0; color: var(--f-on-accent); background: var(--f-accent); font-family: var(--f-mono); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-timeline-content, .md-steps-content) > strong) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:hover),
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:focus-visible) { border-color: var(--f-accent); color: var(--f-ink); background: var(--f-panel); box-shadow: none; transform: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card-title) { color: var(--f-ink); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card-copy) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:hover .md-link-card-icon),
.frontier-markdown :deep(.markdown-body--frontier .md-link-card:focus-visible .md-link-card-icon) { color: var(--f-accent); border-color: var(--f-accent); transform: none; }

.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline) { color: var(--f-accent); border-color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier .md-tip-inline::after) { border-color: var(--f-line); border-radius: 0; color: var(--f-ink); background: var(--f-paper); box-shadow: none; }
.frontier-markdown :deep(.markdown-body--frontier .md-mark) { color: var(--f-on-accent); background: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-progress-label, .md-progress-value)) { color: var(--f-muted); }
.frontier-markdown :deep(.markdown-body--frontier .md-progress-track > span) { border-radius: 0; background: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier .md-footnotes) { border-color: var(--f-line); }
.frontier-markdown :deep(.markdown-body--frontier .md-footnotes h2) { padding-top: 0; border-top: 0; }
.frontier-markdown :deep(.markdown-body--frontier :is(.md-mini-toc strong, .ascii-title)) { color: var(--f-accent); }
.frontier-markdown :deep(.markdown-body--frontier :is(.markdown-error, .markdown-mermaid.is-error)) { color: var(--f-ink); }

/* Mermaid embeds ID-scoped colors, so these local overrides need explicit priority. */
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.node, .cluster) :is(rect, circle, ellipse, polygon, path)),
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.actor, .note)) { fill: var(--f-panel) !important; stroke: var(--f-ink) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(text, tspan)) { fill: var(--f-ink) !important; font-family: var(--f-font) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.nodeLabel, .edgeLabel, .label)) { color: var(--f-ink) !important; background-color: var(--f-panel) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid :is(.flowchart-link, .edgePath path, .actor-line, .messageLine0, .messageLine1)) { stroke: var(--f-accent) !important; }
.frontier-markdown :deep(.markdown-body--frontier .markdown-mermaid marker path) { fill: var(--f-accent) !important; stroke: var(--f-accent) !important; }

.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)) { scrollbar-color: var(--f-muted) var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)::-webkit-scrollbar-track) { background: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :is(pre code, table, .markdown-mermaid, .ascii-title, mjx-container)::-webkit-scrollbar-thumb) { background: var(--f-muted); border-color: var(--f-panel); }
.frontier-markdown :deep(.markdown-body--frontier :focus-visible) { outline: 2px solid var(--f-accent); outline-offset: 3px; }
.frontier-markdown :deep(.markdown-body--frontier ::selection) { color: var(--f-on-accent); background: var(--f-accent); text-shadow: none; }

@media (max-width: 680px) {
  .frontier-markdown :deep(.markdown-body.markdown-body--frontier) { font-size: 0.98rem; }
  .frontier-markdown :deep(.markdown-body--frontier pre code) { font-size: 0.78rem; padding: 1rem; }
}
</style>
