<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  toc: {
    type: Array,
    required: true
  }
})

const activeId = ref('')
const tocContainer = ref(null)
const linkElements = new Map()

let headings = []
let frame = 0

function setLinkElement(element, id) {
  if (element) linkElements.set(id, element)
  else linkElements.delete(id)
}

function collectHeadings() {
  headings = props.toc
    .map((item) => document.getElementById(item.id))
    .filter(Boolean)

  if (!activeId.value && headings.length) activeId.value = headings[0].id
  queueUpdate()
}

function keepActiveLinkVisible() {
  const container = tocContainer.value
  const link = linkElements.get(activeId.value)
  if (!container || !link) return

  const containerRect = container.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()
  const inset = 18

  if (linkRect.top < containerRect.top + inset) {
    container.scrollTop -= containerRect.top + inset - linkRect.top
  } else if (linkRect.bottom > containerRect.bottom - inset) {
    container.scrollTop += linkRect.bottom - containerRect.bottom + inset
  }
}

function updateActive() {
  frame = 0
  if (!headings.length) return

  const rawHeight = getComputedStyle(document.documentElement)
    .getPropertyValue('--site-header-height')
  const headerHeight = Number.parseFloat(rawHeight) || 72
  const activationLine = headerHeight + 32
  let current = headings[0]

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= activationLine) current = heading
    else break
  }

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    current = headings[headings.length - 1]
  }

  if (current?.id === activeId.value) return
  activeId.value = current?.id || ''
  window.requestAnimationFrame(keepActiveLinkVisible)
}

function queueUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateActive)
}

watch(
  () => props.toc.map((item) => item.id).join('|'),
  async () => {
    linkElements.clear()
    await nextTick()
    collectHeadings()
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('scroll', queueUpdate, { passive: true })
  window.addEventListener('resize', queueUpdate)
  collectHeadings()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', queueUpdate)
  window.removeEventListener('resize', queueUpdate)
  if (frame) window.cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="tocContainer" class="toc-sticky-container">
    <div class="toc-heading">
      <span>On this page</span>
      <h4>目 录</h4>
    </div>
    <nav aria-label="文章目录">
      <ul>
        <li
          v-for="item in toc"
          :key="item.id"
          :class="`toc-level-${item.level}`"
        >
          <a
            :ref="(element) => setLinkElement(element, item.id)"
            :href="`#${item.id}`"
            :class="{ 'is-active': item.id === activeId }"
            :aria-current="item.id === activeId ? 'location' : undefined"
            @click="activeId = item.id"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.toc-sticky-container {
  position: sticky;
  top: calc(var(--site-header-height, 72px) + 1.25rem);
  max-height: calc(100dvh - var(--site-header-height, 72px) - 2.5rem);
  overflow-y: auto;
  padding: 1rem 0.8rem 1.1rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1rem;
  background:
    linear-gradient(145deg, rgba(69, 71, 90, 0.38), rgba(30, 30, 46, 0.76)),
    var(--surface-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.035),
    0 18px 48px rgba(0, 0, 0, 0.16);
  font-family: "LXGW WenKai", "Noto Serif SC", serif;
  scrollbar-width: thin;
  scrollbar-color: rgba(137, 180, 250, 0.54) rgba(30, 30, 46, 0.88);
}

.toc-sticky-container::-webkit-scrollbar {
  width: 0.62rem;
}

.toc-sticky-container::-webkit-scrollbar-track {
  background: rgba(30, 30, 46, 0.88);
  border-radius: 999px;
}

.toc-sticky-container::-webkit-scrollbar-thumb {
  border: 2px solid rgba(30, 30, 46, 0.88);
  border-radius: 999px;
  background-color: rgba(137, 180, 250, 0.54);
  background-clip: padding-box;
}

.toc-sticky-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(116, 199, 236, 0.74);
}

.toc-heading {
  margin: 0 0 0.75rem;
  padding: 0.25rem 0.55rem 0.9rem;
  border-bottom: 1px solid rgba(243, 233, 198, 0.1);
}
.toc-heading span {
  display: block;
  margin-bottom: 0.25rem;
  color: rgba(137, 180, 250, 0.62);
  font-family: "Fira Code", monospace;
  font-size: 0.62rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
h4 {
  margin: 0;
  color: #f3e9c6;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li a {
  position: relative;
  display: block;
  margin: 0.12rem 0;
  padding: 0.48rem 0.55rem 0.48rem 0.8rem;
  border: 1px solid transparent;
  border-radius: 0.62rem;
  color: rgba(205, 214, 244, 0.72);
  text-decoration: none;
  font-size: 0.91rem;
  line-height: 1.38;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
}
li a::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0.3rem;
  width: 0.18rem;
  height: 0.95rem;
  border-radius: 999px;
  background: #89b4fa;
  opacity: 0;
  transform: translateY(-50%) scaleY(0.35);
  transition: opacity 180ms ease, transform 180ms ease;
}
li a:hover,
li a:focus-visible {
  color: #e5e9ff;
  border-color: rgba(137, 180, 250, 0.14);
  background: rgba(137, 180, 250, 0.07);
  transform: translateX(2px);
}
li a.is-active {
  color: #f5f6ff;
  border-color: rgba(137, 180, 250, 0.2);
  background: linear-gradient(90deg, rgba(137, 180, 250, 0.16), rgba(137, 180, 250, 0.045));
  box-shadow: inset 0 0 20px rgba(137, 180, 250, 0.025);
}
li a.is-active::before {
  opacity: 1;
  transform: translateY(-50%) scaleY(1);
}
.toc-level-2 { padding-left: 0rem; }
.toc-level-3 { padding-left: 0.8rem; }
.toc-level-4 { padding-left: 1.6rem; }

@media (prefers-reduced-motion: reduce) {
  li a,
  li a::before {
    transition: none;
  }
}
</style>
