<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import MarkdownViewer from '../MarkdownViewer.vue'
import SiteIcon from '../common/SiteIcon.vue'

const props = defineProps({
  entry: { type: Object, required: true },
})

const postId = computed(() => `post-${props.entry.id}`)
const titleId = computed(() => `talk-card-title-${encodeURIComponent(props.entry.id)}`)
const fallbackId = computed(() => `talk-copy-${encodeURIComponent(props.entry.id)}`)
const dateInfo = computed(() => {
  const value = props.entry.date
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { label: value.replaceAll('-', '.'), title: '说说日期：' + value }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { label: value, title: '说说日期：' + value }
  return {
    label: new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(date).replaceAll('/', '.'),
    title: new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full', timeStyle: 'long' }).format(date) + '（本地时间）',
  }
})
const copyState = ref('')
const fallbackUrl = ref('')
const fallbackInput = ref(null)
const copyMessage = computed(() => {
  if (copyState.value === 'copied') return '永久链接已复制'
  if (copyState.value === 'manual') return '暂时无法自动复制，请手动复制下方链接'
  return ''
})
let copyResetTimer
let disposed = false

async function copyPermalink() {
  window.clearTimeout(copyResetTimer)
  const url = new URL(props.entry.href, window.location.href).href
  copyState.value = 'copying'
  fallbackUrl.value = ''

  try {
    await navigator.clipboard.writeText(url)
    if (disposed) return
    copyState.value = 'copied'
    copyResetTimer = window.setTimeout(() => {
      copyState.value = ''
    }, 2200)
  } catch (_) {
    if (disposed) return
    copyState.value = 'manual'
    fallbackUrl.value = url
    await nextTick()
    fallbackInput.value?.focus()
    fallbackInput.value?.select()
  }
}

onBeforeUnmount(() => {
  disposed = true
  window.clearTimeout(copyResetTimer)
})
</script>

<template>
  <article :id="postId" class="talk-card" :aria-labelledby="titleId">
    <div class="talk-card__inner">
      <header class="talk-card__header">
        <h2 :id="titleId" class="talk-card__title">
          <a class="talk-card__title-link" :href="entry.href">{{ entry.title }}</a>
        </h2>
      </header>

      <div class="talk-card__body">
        <MarkdownViewer
          :content="entry.content"
          :anchor-prefix="`${postId}-`"
          variant="embed"
          use-c-j-k
        />
      </div>

      <footer class="talk-card__footer">
        <span
          class="talk-card__date"
          :title="dateInfo?.title ?? '日期未记录'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <time v-if="dateInfo" :datetime="entry.date">{{ dateInfo.label }}</time>
          <span v-else>日期未记录</span>
        </span>

        <div class="talk-card__actions">
          <button
            class="talk-card__copy"
            :class="{ 'is-copied': copyState === 'copied' }"
            type="button"
            :disabled="copyState === 'copying'"
            :aria-busy="copyState === 'copying'"
            :aria-label="`复制「${entry.title}」的永久链接`"
            @click="copyPermalink"
          >
            {{ copyState === 'copied' ? '已复制' : copyState === 'copying' ? '复制中…' : '复制链接' }}
          </button>
          <a
            class="talk-card__permalink"
            :href="entry.href"
            :aria-label="`打开「${entry.title}」的永久链接`"
            title="永久链接"
          >
            <SiteIcon name="link" size="15" />
          </a>
        </div>
        <span class="talk-card__sr-only" role="status" aria-atomic="true">{{ copyMessage }}</span>
      </footer>

      <div v-if="fallbackUrl" class="talk-card__copy-fallback">
        <label :for="fallbackId">复制未完成，可选中下方链接手动复制：</label>
        <input
          :id="fallbackId"
          ref="fallbackInput"
          :value="fallbackUrl"
          type="text"
          readonly
          aria-label="手动复制永久链接"
          @focus="$event.target.select()"
          @click="$event.target.select()"
        >
      </div>
    </div>
  </article>
</template>

<style scoped>
.talk-card {
  min-width: 0;
  scroll-margin-top: calc(var(--site-header-height, 72px) + 1.5rem);
}

.talk-card__inner {
  min-width: 0;
  width: 100%;
  padding: clamp(1.2rem, 2vw, 1.7rem);
  box-sizing: border-box;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 18px;
  color: var(--ctp-mocha-text);
  background:
    linear-gradient(145deg, rgba(49, 50, 68, 0.58), rgba(24, 24, 37, 0.9)),
    var(--ctp-mocha-base);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.025);
  transition: border-color var(--motion-base, 220ms) ease, box-shadow var(--motion-base, 220ms) ease;
}

.talk-card:focus-within .talk-card__inner {
  border-color: rgba(137, 180, 250, 0.34);
}

.talk-card:target .talk-card__inner {
  border-color: rgba(137, 180, 250, 0.58);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(137, 180, 250, 0.07);
}

@media (hover: hover) {
  .talk-card__inner:hover { border-color: rgba(180, 190, 254, 0.3); }
  .talk-card:target .talk-card__inner:hover { border-color: rgba(137, 180, 250, 0.7); }
}

.talk-card__header {
  margin-bottom: 1.05rem;
}

.talk-card__title {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", serif;
  font-size: 1.32rem;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.talk-card__title-link {
  color: inherit;
  text-decoration: none;
  text-decoration-color: rgba(137, 180, 250, 0.4);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  transition: color var(--motion-fast, 140ms) ease;
}

.talk-card__title-link:hover {
  color: var(--ctp-mocha-blue);
  text-decoration-line: underline;
}

.talk-card__title-link:focus-visible,
.talk-card__copy:focus-visible,
.talk-card__permalink:focus-visible,
.talk-card__copy-fallback input:focus-visible {
  outline: 2px solid var(--ctp-mocha-blue);
  outline-offset: 4px;
}

.talk-card__body {
  min-width: 0;
}

.talk-card__body :deep(.markdown-body--embed) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  font-size: 1rem;
  line-height: 1.85;
  overflow-wrap: anywhere;
}

.talk-card__body :deep(p) {
  margin-bottom: 1rem;
}

.talk-card__body :deep(h1),
.talk-card__body :deep(h2),
.talk-card__body :deep(h3),
.talk-card__body :deep(h4),
.talk-card__body :deep(h5),
.talk-card__body :deep(h6) {
  margin: 1.55rem 0 0.65rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.talk-card__body :deep(h1) {
  padding-bottom: 0.45rem;
  font-size: 1.4rem;
}

.talk-card__body :deep(h2) {
  font-size: 1.28rem;
}

.talk-card__body :deep(h3) {
  font-size: 1.18rem;
}

.talk-card__body :deep(h4) {
  font-size: 1.08rem;
}

.talk-card__body :deep(h5),
.talk-card__body :deep(h6) {
  font-size: 1rem;
}

.talk-card__body :deep(.markdown-body > :first-child) {
  margin-top: 0;
}

.talk-card__body :deep(.markdown-body > :last-child) {
  margin-bottom: 0;
}

.talk-card__body :deep(.markdown-body > hr:last-child) {
  display: none;
}

.talk-card__body :deep(.header-anchor) {
  margin-right: 0.25rem;
  opacity: 0.38;
}

.talk-card__body :deep(.header-anchor:focus-visible),
.talk-card__body :deep(h1:hover .header-anchor),
.talk-card__body :deep(h2:hover .header-anchor),
.talk-card__body :deep(h3:hover .header-anchor) {
  opacity: 1;
}

.talk-card__body :deep(a) {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.talk-card__body :deep(ul),
.talk-card__body :deep(ol) {
  margin-bottom: 1.05rem;
  padding-left: 1.4rem;
}

.talk-card__body :deep(li) {
  margin-block: 0.35rem;
}

.talk-card__body :deep(blockquote) {
  margin-block: 1.2rem;
  padding: 0.9rem 1rem;
}

.talk-card__body :deep(hr) {
  height: 1px;
  margin-block: 1.5rem;
}

.talk-card__body :deep(pre),
.talk-card__body :deep(table) {
  min-width: 0;
  max-width: 100%;
  margin-block: 1.2rem;
  overflow-x: auto;
  overflow-wrap: normal;
}

.talk-card__body :deep(pre code) {
  max-width: 100%;
  padding: 0.95rem 1rem;
  overflow-x: auto;
  font-size: 0.82rem;
  line-height: 1.75;
  white-space: pre;
  overflow-wrap: normal;
  word-break: normal;
}

.talk-card__body :deep(table) {
  display: block;
  width: 100%;
}

.talk-card__body :deep(th),
.talk-card__body :deep(td) {
  padding: 0.5rem 0.65rem;
}

.talk-card__body :deep(figure),
.talk-card__body :deep(.md-figure),
.talk-card__body :deep(.md-image-link),
.talk-card__body :deep(.md-gallery),
.talk-card__body :deep(.md-columns) {
  min-width: 0;
  max-width: 100%;
  margin-block: 1.2rem;
}

.talk-card__body :deep(.md-gallery .md-figure),
.talk-card__body :deep(.md-linked-figure) {
  margin: 0;
}

.talk-card__body :deep(img),
.talk-card__body :deep(video),
.talk-card__body :deep(iframe) {
  max-width: 100%;
}

.talk-card__body :deep(img),
.talk-card__body :deep(video) {
  height: auto;
}

.talk-card__body :deep(figcaption),
.talk-card__body :deep(.md-figcaption) {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.talk-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.6rem;
  margin-top: clamp(1.25rem, 2vw, 1.65rem);
  padding-top: 0.95rem;
  border-top: 1px solid rgba(180, 190, 254, 0.09);
  color: var(--ctp-mocha-subtext0);
  font-family: "Inter", "LXGW WenKai", sans-serif;
  font-size: 0.73rem;
  line-height: 1.5;
}

.talk-card__date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.35rem 0.58rem;
  border: 1px solid rgba(180, 190, 254, 0.09);
  border-radius: 999px;
  background: rgba(17, 17, 27, 0.26);
  font-variant-numeric: tabular-nums;
}

.talk-card__date svg {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
}

.talk-card__actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  margin-left: auto;
}

.talk-card__copy,
.talk-card__permalink {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.6rem;
  border: 0;
  border-radius: 0.4rem;
  color: var(--ctp-mocha-subtext0);
  background: transparent;
  font: inherit;
  line-height: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color var(--motion-fast, 140ms) ease, background-color var(--motion-fast, 140ms) ease;
}

.talk-card__copy:hover,
.talk-card__copy:focus-visible,
.talk-card__permalink:hover,
.talk-card__permalink:focus-visible {
  color: var(--ctp-mocha-blue);
  background: rgba(137, 180, 250, 0.08);
  text-decoration: none;
}

.talk-card__copy { min-width: 5.1rem; }
.talk-card__copy.is-copied { color: var(--ctp-mocha-blue); background: rgba(137, 180, 250, 0.1); }
.talk-card__copy:disabled { cursor: wait; opacity: 0.7; }

.talk-card__permalink {
  width: 2.75rem;
  padding-inline: 0;
}

.talk-card__copy-fallback {
  margin: 0.7rem 0 0;
  color: var(--ctp-mocha-subtext0);
  font-size: 0.75rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.talk-card__copy-fallback label { display: block; margin-bottom: 0.45rem; }
.talk-card__copy-fallback input {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.55rem 0.7rem;
  box-sizing: border-box;
  border: 1px solid rgba(180, 190, 254, 0.2);
  border-radius: 0.5rem;
  color: var(--ctp-mocha-text);
  background: rgba(17, 17, 27, 0.3);
  font: inherit;
}

.talk-card__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .talk-card__inner,
  .talk-card__title-link,
  .talk-card__copy,
  .talk-card__permalink {
    transition: none;
  }
}
</style>
