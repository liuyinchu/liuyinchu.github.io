<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TalkCard from '../components/journal/TalkCard.vue'
import { postItEntries } from '../data/postIt.js'

const query = ref('')
const grid = ref(null)
const filteredEntries = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return postItEntries
  return postItEntries.filter(entry => (
    (entry.title + '\n' + entry.content).toLocaleLowerCase().includes(needle)
  ))
})
const countLabel = computed(() => (
  query.value.trim()
    ? filteredEntries.value.length + ' / ' + postItEntries.length + ' 则说说'
    : postItEntries.length + ' 则说说'
))

let resizeObserver
let layoutFrame = 0
let gridWidth = 0
let initialAnchorPlaced = false
let disposed = false

function arrangeCards() {
  layoutFrame = 0
  if (!grid.value) return
  const gap = parseFloat(getComputedStyle(grid.value).columnGap) || 24
  for (const card of grid.value.children) {
    card.style.gridRowEnd = 'span ' + Math.ceil(card.getBoundingClientRect().height + gap)
  }
  if (!initialAnchorPlaced) {
    initialAnchorPlaced = true
    const target = document.getElementById(window.location.hash.slice(1))
    if (target && grid.value.contains(target)) target.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
}

function scheduleLayout() {
  if (!layoutFrame) layoutFrame = requestAnimationFrame(arrangeCards)
}

function observeCards() {
  if (!resizeObserver || !grid.value) return
  resizeObserver.disconnect()
  resizeObserver.observe(grid.value)
  for (const card of grid.value.children) {
    const inner = card.querySelector('.talk-card__inner')
    if (inner) resizeObserver.observe(inner)
  }
  scheduleLayout()
}

watch(filteredEntries, async () => {
  await nextTick()
  if (!disposed) observeCards()
})

onMounted(() => {
  resizeObserver = new ResizeObserver(changes => {
    let changed = false
    for (const change of changes) {
      if (change.target === grid.value) {
        const width = change.contentRect.width
        if (width === gridWidth) continue
        gridWidth = width
      }
      changed = true
    }
    if (changed) scheduleLayout()
  })
  observeCards()
})

onBeforeUnmount(() => {
  disposed = true
  resizeObserver?.disconnect()
  cancelAnimationFrame(layoutFrame)
})
</script>

<template>
  <main class="talk-page" aria-labelledby="talk-title">
    <header class="talk-hero">
      <img src="/bg/white_sweater.PNG" alt="" decoding="async">
      <div class="talk-hero__veil" aria-hidden="true"></div>
      <div class="talk-hero__content">
        <h1 id="talk-title">时代正疾驰而过</h1>
        <span>分享日常生活，偶尔发表各种想法与吐槽</span>
      </div>
    </header>

    <section id="talk-board" class="talk-content" aria-label="说说">
      <div class="talk-toolbar">
        <div class="talk-toolbar__intro">
          <span class="talk-eyebrow">LIFE, IN LITTLE PIECES</span>
          <div class="talk-toolbar__line">
            <h2>片刻之间</h2>
            <span class="talk-count" role="status">{{ countLabel }}</span>
          </div>
        </div>
        <label class="talk-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input v-model="query" type="search" aria-label="搜索说说" placeholder="搜索标题或正文…" autocomplete="off">
          <button v-if="query" type="button" aria-label="清除搜索" @click.prevent="query = ''">×</button>
        </label>
      </div>

      <div v-if="filteredEntries.length" ref="grid" class="talk-grid">
        <TalkCard v-for="entry in filteredEntries" :key="entry.id" :entry="entry" />
      </div>
      <div v-else class="talk-empty" data-testid="talk-empty">
        <p>没有找到这段片刻。</p>
        <span>换个关键词，或回到全部说说。</span>
        <button type="button" @click="query = ''">查看全部说说 <span aria-hidden="true">↗</span></button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.talk-page {
  min-height: 100vh;
  padding: clamp(1.5rem, 3vw, 2.75rem) 0 clamp(4rem, 8vw, 7rem);
  color: var(--ctp-mocha-text);
  background:
    radial-gradient(circle at 10% 8%, rgba(137, 180, 250, 0.09), transparent 28rem),
    radial-gradient(circle at 92% 24%, rgba(203, 166, 247, 0.07), transparent 30rem),
    var(--ctp-mocha-base);
}

.talk-hero {
  position: relative;
  display: flex;
  min-height: clamp(20rem, 35vw, 29rem);
  align-items: end;
  margin: 0 auto clamp(3rem, 6vw, 5.5rem);
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1.15rem;
  background: #181825;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

.talk-hero > img,
.talk-hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.talk-hero > img {
  object-fit: cover;
  object-position: 50% 34%;
  opacity: 0.74;
  filter: saturate(0.82) contrast(1.04);
}

.talk-hero__veil {
  background:
    linear-gradient(90deg, rgba(17, 17, 27, 0.86) 0%, rgba(17, 17, 27, 0.45) 58%, rgba(17, 17, 27, 0.18)),
    linear-gradient(0deg, rgba(17, 17, 27, 0.82), transparent 64%);
}

.talk-hero__content {
  position: relative;
  z-index: 1;
  max-width: 56rem;
  padding: clamp(2rem, 5vw, 5rem);
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", serif;
  text-shadow: 0 3px 24px rgba(0, 0, 0, 0.38);
}

.talk-hero__content h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2.55rem, 6.2vw, 6rem);
  font-weight: 700;
  line-height: 1.06;
  text-wrap: balance;
}

.talk-hero__content span {
  display: block;
  margin-top: 1.45rem;
  color: rgba(245, 246, 255, 0.82);
  font-size: clamp(1rem, 1.9vw, 1.35rem);
  line-height: 1.7;
}

.talk-hero,
.talk-content {
  width: min(100% - 3rem, 1320px);
  margin-inline: auto;
}

.talk-content {
  min-height: 18rem;
  scroll-margin-top: calc(var(--site-header-height, 72px) + 1.5rem);
}

.talk-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.talk-eyebrow {
  color: var(--ctp-mocha-blue);
  font: 0.69rem/1.5 "Fira Code", monospace;
  letter-spacing: 0.17em;
}

.talk-toolbar__line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.45rem;
}

.talk-toolbar h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2.4vw, 1.8rem);
  line-height: 1.35;
  letter-spacing: 0.035em;
}

.talk-count {
  padding: 0.25rem 0.65rem;
  border: 1px solid rgba(180, 190, 254, 0.15);
  border-radius: 99px;
  color: var(--ctp-mocha-subtext0);
  background: rgba(49, 50, 68, 0.55);
  font-size: 0.78rem;
  white-space: nowrap;
}

.talk-search {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: min(100%, 20rem);
  min-height: 2.85rem;
  padding: 0.1rem 0.85rem;
  box-sizing: border-box;
  border: 1px solid rgba(180, 190, 254, 0.18);
  border-radius: 0.85rem;
  color: var(--ctp-mocha-subtext0);
  background: rgba(24, 24, 37, 0.58);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.talk-search:focus-within {
  border-color: var(--ctp-mocha-blue);
  box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.09);
}

.talk-search > svg {
  width: 1.1rem;
  height: 1.1rem;
  flex: 0 0 auto;
}

.talk-search input {
  width: 100%;
  min-width: 0;
  padding: 0.65rem 0;
  border: 0;
  outline: 0;
  color: var(--ctp-mocha-text);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  appearance: none;
}

.talk-search input::-webkit-search-cancel-button { display: none; }
.talk-search input::placeholder { color: var(--ctp-mocha-overlay1); }

.talk-search button {
  flex: 0 0 auto;
  padding: 0;
  width: 1.6rem;
  height: 1.6rem;
  border: 0;
  border-radius: 50%;
  color: var(--ctp-mocha-subtext0);
  background: transparent;
  font-size: 1.3rem;
  cursor: pointer;
}

.talk-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1px;
  column-gap: 1.5rem;
  row-gap: 0;
  align-items: start;
}

.talk-grid :deep(.talk-card) {
  min-width: 0;
  align-self: start;
}

.talk-empty {
  padding: 4rem 1.5rem;
  border: 1px dashed rgba(180, 190, 254, 0.2);
  border-radius: 1.1rem;
  background: rgba(24, 24, 37, 0.35);
  text-align: center;
}

.talk-empty p { margin: 0 0 0.5rem; font-size: 1.2rem; }
.talk-empty > span { color: var(--ctp-mocha-subtext0); font-size: 0.9rem; }
.talk-empty button {
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.6rem 1rem;
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 0.7rem;
  color: var(--ctp-mocha-blue);
  background: rgba(137, 180, 250, 0.07);
  font: inherit;
  cursor: pointer;
}
.talk-empty button span { margin-left: 0.5rem; }

@media (min-width: 1800px) {
  .talk-hero,
  .talk-content { width: min(100% - 6rem, 1760px); }
  .talk-hero { min-height: 31.5rem; }
  .talk-hero__content { max-width: 72rem; padding: 5.5rem 6.5rem; }
}

@media (max-width: 1100px) {
  .talk-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .talk-page { padding-top: 1rem; }
  .talk-hero {
    min-height: 23rem;
    margin-bottom: 3.25rem;
    border-radius: 0.9rem;
  }
  .talk-hero,
  .talk-content { width: min(100% - 2rem, 1320px); }
  .talk-hero > img { object-position: 58% center; }
  .talk-hero__veil {
    background:
      linear-gradient(0deg, rgba(17, 17, 27, 0.9), rgba(17, 17, 27, 0.16) 85%),
      linear-gradient(90deg, rgba(17, 17, 27, 0.6), transparent);
  }
  .talk-hero__content { padding: 1.5rem; }
  .talk-toolbar { align-items: stretch; flex-direction: column; gap: 1rem; }
  .talk-search { width: 100%; }
  .talk-grid { grid-template-columns: minmax(0, 1fr); column-gap: 1.25rem; }
}

@media (prefers-reduced-motion: reduce) {
  .talk-search { transition: none; }
}
</style>
