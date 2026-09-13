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
    <h2 class="frontier-contents__title">{{ title }}</h2>
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
  </nav>
</template>

<style scoped>
.frontier-contents {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--f-line);
  border-radius: 12px;
  background: var(--f-panel);
  color: var(--f-ink);
}

.frontier-contents__title {
  margin: 0 0 10px;
  color: var(--f-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.frontier-contents__list {
  display: grid;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.frontier-contents__link {
  position: relative;
  display: block;
  padding: 7px 10px 7px 13px;
  border-radius: 6px;
  color: var(--f-ink);
  font-size: 13px;
  line-height: 1.5;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.frontier-contents__link:hover {
  background: var(--f-surface);
}

.frontier-contents__link:focus-visible {
  outline: 2px solid var(--f-accent);
  outline-offset: 2px;
}

.frontier-contents__link.is-active {
  background: color-mix(in srgb, var(--f-accent) 10%, var(--f-panel));
  color: var(--f-accent);
}

.frontier-contents__link.is-active::before {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 0;
  width: 3px;
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
</style>
