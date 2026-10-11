<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '本页目录' },
})

const router = useRouter()
const SCROLL_OFFSET = 108
const activeId = ref('')
const visibleItems = computed(() => {
  const items = props.items.filter((item) => item.level <= 2)
  return items[0]?.level === 1 && items.some((item) => item.level === 2)
    ? items.filter((item) => item.level === 2)
    : items
})

let headings = []
let scrollFrame = 0
let mounted = false

function updateActiveHeading() {
  scrollFrame = 0
  if (!headings.length) {
    activeId.value = ''
    return
  }

  let current = headings[0]
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > SCROLL_OFFSET + 2) break
    current = heading
  }
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    current = headings[headings.length - 1]
  }
  activeId.value = current.id
}

function queueActiveUpdate() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateActiveHeading)
}

async function refreshHeadings() {
  await nextTick()
  if (!mounted) return
  headings = visibleItems.value.map((item) => document.getElementById(item.id)).filter(Boolean)
  queueActiveUpdate()
}

async function goToHeading(event, item) {
  // Keep modified clicks available for the browser's normal link actions.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const heading = document.getElementById(item.id)
  if (!heading) return

  event.preventDefault()
  activeId.value = item.id
  await router.replace({ hash: '#' + item.id })
  window.scrollTo({
    top: Math.max(0, window.scrollY + heading.getBoundingClientRect().top - SCROLL_OFFSET),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

watch(visibleItems, refreshHeadings, { flush: 'post' })

onMounted(() => {
  mounted = true
  refreshHeadings()
  window.addEventListener('scroll', queueActiveUpdate, { passive: true })
  window.addEventListener('resize', queueActiveUpdate)
})

onBeforeUnmount(() => {
  mounted = false
  window.removeEventListener('scroll', queueActiveUpdate)
  window.removeEventListener('resize', queueActiveUpdate)
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
})
</script>

<template>
  <nav class="frontier-contents" aria-label="本页目录">
    <details class="frontier-contents__disclosure" open>
      <summary class="frontier-contents__summary">
        <span class="frontier-contents__title">{{ title }}</span>
        <span v-if="visibleItems.length" class="frontier-contents__count">{{ visibleItems.length }} 节</span>
      </summary>
      <ul v-if="visibleItems.length" class="frontier-contents__list">
        <li v-for="item in visibleItems" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="frontier-contents__link"
            :class="{ 'is-active': activeId === item.id }"
            :aria-current="activeId === item.id ? 'location' : undefined"
            @click="goToHeading($event, item)"
          >{{ item.text }}</a>
        </li>
      </ul>
      <p v-else class="frontier-contents__empty">正在整理目录</p>
    </details>
  </nav>
</template>

<style scoped>
.frontier-contents {
  min-width: 0;
  padding: 6px 0;
  background: transparent;
  color: var(--f-ink);
}

.frontier-contents__summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 14px;
  color: var(--f-muted);
  cursor: pointer;
  list-style: none;
}

.frontier-contents__summary::-webkit-details-marker { display: none; }
.frontier-contents__summary::after {
  width: 5px;
  height: 5px;
  margin-left: auto;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  content: '';
  transform: rotate(45deg);
}
.frontier-contents__disclosure[open] > summary::after { transform: rotate(225deg); }
.frontier-contents__summary:focus-visible { outline: 2px solid var(--f-accent); outline-offset: 4px; }
.frontier-contents__count { font-size: 11px; font-variant-numeric: tabular-nums; }

.frontier-contents__title {
  margin: 0;
  color: var(--f-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.frontier-contents__list {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0 0 0 10px;
  border-left: 1px solid var(--f-line);
  list-style: none;
}

.frontier-contents__link {
  position: relative;
  display: block;
  padding: 7px 10px;
  border-radius: 5px;
  color: var(--f-muted);
  font-size: 13px;
  line-height: 1.5;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.frontier-contents__link:hover {
  color: var(--f-ink);
  background: var(--f-panel);
}

.frontier-contents__link:focus-visible {
  outline: 2px solid var(--f-accent);
  outline-offset: 2px;
}

.frontier-contents__link.is-active {
  background: var(--f-accent-soft);
  color: var(--f-accent);
  font-weight: 600;
}

.frontier-contents__link.is-active::before {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: -11px;
  width: 2px;
  border-radius: 3px;
  background: var(--f-accent);
  content: '';
}

.frontier-contents__empty {
  margin: 0;
  color: var(--f-muted);
  font-size: 13px;
  line-height: 1.5;
}
@media (max-width: 980px) {
  .frontier-contents { padding: 14px 18px; border: 1px solid var(--f-line); border-radius: 10px; }
  .frontier-contents__summary { padding: 0; }
  .frontier-contents__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3px 16px;
    max-height: 14rem;
    margin-top: 12px;
    padding: 10px 0 0;
    overflow-y: auto;
    border-top: 1px solid var(--f-line);
    border-left: 0;
    scrollbar-width: thin;
    scrollbar-color: var(--f-line) transparent;
  }
  .frontier-contents__link { padding: 7px 10px 7px 12px; }
  .frontier-contents__link.is-active::before { left: 0; }
  .frontier-contents__empty { margin-top: 12px; }
}

@media (max-width: 520px) {
  .frontier-contents { padding: 13px 15px; }
  .frontier-contents__list { grid-template-columns: 1fr; max-height: 12rem; }
}
</style>
