<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import MarkdownViewer from '../MarkdownViewer.vue'
import SiteIcon from '../common/SiteIcon.vue'

const props = defineProps({
  entry: { type: Object, required: true },
})

const postId = computed(() => `post-${props.entry.id}`)
const titleId = computed(() => `talk-card-title-${props.entry.id}`)
const dateLabel = computed(() => props.entry.date?.slice(0, 10).replaceAll('-', '.') ?? '日期未记录')
const copyState = ref('')
const fallbackUrl = ref('')
let copyResetTimer

async function copyPermalink() {
  window.clearTimeout(copyResetTimer)
  const url = new URL(props.entry.href, window.location.href).href

  try {
    await navigator.clipboard.writeText(url)
    copyState.value = 'copied'
    fallbackUrl.value = ''
    copyResetTimer = window.setTimeout(() => {
      copyState.value = ''
    }, 1800)
  } catch (_) {
    copyState.value = ''
    fallbackUrl.value = url
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(copyResetTimer)
})
</script>

<template>
  <article :id="postId" class="talk-card" :aria-labelledby="titleId">
    <div class="talk-card__inner">
      <header class="talk-card__header">
        <h2 :id="titleId" class="talk-card__title">{{ entry.title }}</h2>
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
          title="历史收录日期，不代表正文事件发生日期"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <time v-if="entry.date" :datetime="entry.date">收录于 {{ dateLabel }}</time>
          <span v-else>日期未记录</span>
        </span>

        <div class="talk-card__actions">
          <button
            class="talk-card__copy"
            type="button"
            :aria-label="`复制「${entry.title}」的永久链接`"
            @click="copyPermalink"
          >
            {{ copyState === 'copied' ? '已复制' : '复制链接' }}
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
        <span class="talk-card__sr-only" role="status">{{ copyState === 'copied' ? '永久链接已复制' : '' }}</span>
      </footer>

      <p v-if="fallbackUrl" class="talk-card__copy-fallback" role="status">
        手动复制链接：<a :href="entry.href">{{ fallbackUrl }}</a>
      </p>
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
  padding: 1.6rem;
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 18px;
  color: var(--ctp-mocha-text);
  background:
    linear-gradient(145deg, rgba(49, 50, 68, 0.58), rgba(24, 24, 37, 0.9)),
    var(--ctp-mocha-base);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.025);
  transition: border-color var(--motion-base, 220ms) ease;
}

.talk-card:target .talk-card__inner {
  border-color: rgba(137, 180, 250, 0.58);
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
  gap: 0.6rem;
  margin-top: 1.35rem;
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
  padding: 0.3rem 0.58rem;
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
  gap: 0.3rem;
}

.talk-card__copy,
.talk-card__permalink {
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.4rem;
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

.talk-card__permalink {
  width: 1.8rem;
}

.talk-card__copy-fallback {
  margin: 0.7rem 0 0;
  color: var(--ctp-mocha-subtext0);
  font-size: 0.75rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
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

@media (max-width: 480px) {
  .talk-card__inner {
    padding: 1.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .talk-card__inner,
  .talk-card__copy,
  .talk-card__permalink {
    transition: none;
  }
}
</style>
