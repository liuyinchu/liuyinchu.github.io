<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  active: Boolean,
  selected: { type: String, default: 'notes' },
  anchors: { type: Array, default: () => [] },
  canvas: { type: Object, default: () => ({ left: 0, top: 0, width: 0, height: 0 }) },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
})
const emit = defineEmits(['select'])
const nodes = [
  { id: 'notes', label: '随记', to: '/space1', color: '#c3bde6' },
  { id: 'talk', label: '说说', to: '/talk', color: '#c4b59b' },
  { id: 'resources', label: '资源', to: '/rd', color: '#9fc4bf' },
  { id: 'projects', label: '代码与项目', to: '/code', color: '#a8bddc' },
]
const content = ref({
  notes: { title: '随记', description: '把一个问题，慢慢展开。', href: '/space1', meta: '' },
  talk: { title: '随手记下的想法与片段', description: '放一些零散的想法、见闻和心情。还没写成文章的内容，也可以先留在这里。', meta: '' },
  resources: { title: '资源', description: '收好值得再回来找的入口。', href: '/rd', meta: '' },
  projects: { title: '代码与项目', description: '把想法做成可用、可玩的东西。', href: '/code', meta: '' },
})
const currentNode = computed(() => nodes.find((node) => node.id === props.selected) || nodes[0])
const preview = computed(() => content.value[currentNode.value.id])
const compact = computed(() => props.height > 0 && props.height < 518)
const projected = computed(() => !compact.value && props.canvas.width > 0 && nodes.every((node) => props.anchors.some((anchor) => anchor.id === node.id)))
const projectedNodes = computed(() => projected.value ? nodes.filter((node) => point(node)) : [])
const fallbackNodes = computed(() => nodes.filter((node) => !projectedNodes.value.some((item) => item.id === node.id)))
let controller

function isExternal(href) {
  return /^https?:\/\//.test(href)
}
function destination(href) {
  return isExternal(href) ? { href, target: '_blank', rel: 'noopener noreferrer' } : { to: href }
}
function choose(id) {
  if (id !== props.selected) emit('select', id)
}
function point(node) {
  const anchor = props.anchors.find((item) => item.id === node.id)
  if (!anchor || anchor.visible === false) return null
  const x = props.canvas.left + anchor.x * props.canvas.width
  const y = props.canvas.top + anchor.y * props.canvas.height
  if (x < 0 || x > props.width || y < 0 || y > props.height) return null
  return { x, y }
}
function position(node) {
  const location = point(node)
  const labelHalfWidth = node.label.length * 9 + 12
  const labelCenter = Math.max(labelHalfWidth, Math.min(props.width - labelHalfWidth, location.x))
  const above = props.width <= 760 ? location.y > props.height * .5 : location.y > props.height - 90
  return {
    '--node-color': node.color,
    left: location.x + 'px',
    top: location.y + 'px',
    '--label-x': labelCenter - location.x + 'px',
    '--label-y': (above ? -40 : 25) + 'px',
  }
}
function sentence(value, limit = 72) {
  const plain = String(value || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#]/g, '').replace(/\s+/g, ' ').trim()
  const first = plain.match(/^.*?[。！？](?:[”’])?/)?.[0] || plain
  return first.length > limit ? `${first.slice(0, limit).replace(/[，、：；\s]+$/, '')}…` : first
}
async function read(url) {
  const response = await fetch(url, { signal: controller.signal })
  if (!response.ok) throw new Error('Content unavailable')
  return response.json()
}

onMounted(async () => {
  controller = new AbortController()
  const results = await Promise.allSettled([
    read('/articles.json'),
    read('/resource/programming.json'),
    read('/code_proj.json'),
  ])
  if (controller.signal.aborted) return
  const [notes, resources, projects] = results
  if (notes.status === 'fulfilled' && Array.isArray(notes.value) && notes.value.length) {
    const article = notes.value[0]
    content.value.notes = {
      title: article.title,
      description: sentence(article.desc),
      href: `/space1/${encodeURIComponent(article.id)}`,
      meta: `${notes.value.length} 篇随记`,
    }
  }
  if (resources.status === 'fulfilled' && Array.isArray(resources.value) && resources.value.length) {
    const resource = resources.value[0]
    content.value.resources = {
      title: resource.name,
      description: sentence(resource.intro),
      href: resource.url || '/rprogramming',
      meta: `${resources.value.length} 个编程入口`,
    }
  }
  if (projects.status === 'fulfilled' && Array.isArray(projects.value) && projects.value.length) {
    const project = projects.value.find((item) => item.category === 'toy') || projects.value[0]
    content.value.projects = {
      title: project.name,
      description: sentence(project.desc),
      href: project.homepage || project.repo || '/code',
      meta: `${projects.value.length} 个项目`,
    }
  }
})
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div v-show="active" class="constellation-directory" role="region" aria-label="内容星图" :class="{ 'constellation-directory--projected': projected, 'constellation-directory--compact': compact }">
    <div class="constellation-directory__nodes" aria-label="内容星座入口">
      <RouterLink
        v-for="node in projectedNodes"
        :key="node.id"
        :to="node.to"
        class="constellation-node"
        :class="{ 'is-selected': selected === node.id }"
        :style="position(node)"
        :aria-label="node.label"
        :data-selected="selected === node.id"
        @pointerenter="choose(node.id)"
        @focus="choose(node.id)"
      >
        <span class="constellation-node__point" aria-hidden="true"></span>
        <span class="constellation-node__label">{{ node.label }}</span>
      </RouterLink>
    </div>
    <nav v-if="fallbackNodes.length" class="constellation-directory__fallback" aria-label="栏目入口">
      <RouterLink
        v-for="node in fallbackNodes"
        :key="node.id"
        :to="node.to"
        class="constellation-fallback"
        :class="{ 'is-selected': selected === node.id }"
        :style="{ '--node-color': node.color }"
        :aria-label="node.label"
        :data-selected="selected === node.id"
        @pointerenter="choose(node.id)"
        @focus="choose(node.id)"
      >{{ node.label }}</RouterLink>
    </nav>
    <article id="constellation-content-preview" class="constellation-preview" aria-label="当前内容预览" aria-live="polite" aria-atomic="true" :style="{ '--node-color': currentNode.color }">
      <p class="constellation-preview__category"><span>{{ currentNode.label }}</span><span v-if="preview.meta">{{ preview.meta }}</span></p>
      <h3>
        <component
          v-if="currentNode.id !== 'talk'"
          :is="isExternal(preview.href) ? 'a' : RouterLink"
          v-bind="destination(preview.href)"
          class="constellation-preview__title-link"
        >{{ preview.title }}</component>
        <template v-else>{{ preview.title }}</template>
      </h3>
      <p class="constellation-preview__description">{{ preview.description }}</p>
    </article>
  </div>
</template>

<style scoped>
.constellation-directory { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.constellation-directory__nodes { position: absolute; inset: 25% 35% 23% 8%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center; }
.constellation-node { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; justify-self: center; min-width: 88px; min-height: 64px; padding: 0 8px 8px; border: 0; border-radius: 10px; background: transparent; color: var(--node-color); cursor: pointer; pointer-events: auto; font: inherit; text-align: center; text-decoration: none; touch-action: manipulation; }
.constellation-directory--projected .constellation-directory__nodes { inset: 0; display: block; z-index: 2; }
.constellation-directory__fallback { position: absolute; left: var(--about-gutter, 6vw); bottom: 105px; display: flex; flex-wrap: wrap; gap: 8px 20px; max-width: 64%; z-index: 3; pointer-events: none; }
.constellation-fallback { min-height: 44px; padding: 6px 4px; border: 0; border-bottom: 1px solid #8192a35c; background: transparent; color: var(--node-color); font: inherit; font-size: 14px; cursor: pointer; pointer-events: auto; text-decoration: none; }
.constellation-fallback.is-selected { color: #eeeae0; border-bottom-color: currentColor; }
.constellation-fallback:focus-visible { outline: 1px solid currentColor; outline-offset: 4px; }
.constellation-directory--projected .constellation-node { position: absolute; width: 112px; height: 112px; min-width: 112px; min-height: 112px; padding: 0; transform: translate(-50%, -50%); }
.constellation-directory--projected .constellation-node__point { position: absolute; left: 50%; top: 50%; margin: 0; transform: translate(-50%, -50%); }
.constellation-directory--projected .constellation-node__label { position: absolute; left: 50%; top: calc(50% + var(--label-y)); width: max-content; white-space: nowrap; transform: translateX(calc(-50% + var(--label-x))); }
.constellation-node__point { position: relative; display: block; width: 23px; height: 23px; margin: 0 auto 9px; border: 1px solid currentColor; border-radius: 50%; opacity: .42; transition: opacity .2s, box-shadow .2s; }
.constellation-node__point::after { content: ''; position: absolute; width: 5px; height: 5px; top: 8px; left: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 13px currentColor; }
.constellation-node__label { display: block; font-size: 16px; line-height: 1.55; letter-spacing: .09em; text-shadow: 0 1px 12px #03090d, 0 0 18px #03090d; }
.constellation-node:hover .constellation-node__point, .constellation-node.is-selected .constellation-node__point, .constellation-node:focus-visible .constellation-node__point { opacity: 1; box-shadow: 0 0 22px color-mix(in srgb, var(--node-color), transparent 65%); }
.constellation-node.is-selected .constellation-node__label { color: #f0eada; }
.constellation-node:focus-visible { outline: 1px solid var(--node-color); outline-offset: 5px; }
.constellation-preview { position: absolute; z-index: 1; top: 42%; right: var(--about-gutter, 6vw); width: min(25%, 300px); margin: 0; padding: 24px 0 0 24px; border-left: 1px solid color-mix(in srgb, var(--node-color), transparent 60%); pointer-events: auto; }
.constellation-preview__category { display: flex; flex-wrap: wrap; gap: 6px 18px; color: #a3adba; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
.constellation-preview__category > span:first-child { color: var(--node-color); }
.constellation-preview h3 { color: #e2dfd7; margin: 0 0 17px; font-size: clamp(21px, 2vw, 28px); line-height: 1.55; font-weight: 450; text-wrap: pretty; }
.constellation-preview__title-link { color: inherit; text-decoration: underline; text-decoration-color: #a6a2b15c; text-decoration-thickness: 1px; text-underline-offset: .18em; }
.constellation-preview__title-link:hover { color: #fff3d5; text-decoration-color: currentColor; }
.constellation-preview__title-link:focus-visible { outline: 1px solid var(--node-color); outline-offset: 5px; }
.constellation-preview__description { color: #a5afbc; margin: 0; font-size: 14px; line-height: 1.95; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
@media (max-width: 1100px) and (min-width: 761px) {
  .constellation-preview { width: 28%; right: 4vw; padding-left: 18px; }
  .constellation-preview h3 { font-size: 21px; }
}
@media (max-width: 760px) {
  .constellation-directory__nodes { inset: 29% 7% 39%; }
  .constellation-node__label { font-size: 15px; white-space: nowrap; }
  .constellation-directory--projected .constellation-node { width: 88px; height: 88px; min-width: 88px; min-height: 88px; }
  .constellation-directory__fallback { top: 176px; bottom: auto; left: var(--about-gutter, 26px); right: var(--about-gutter, 26px); max-width: none; gap: 6px 16px; }
  .constellation-preview { top: auto; bottom: 86px; left: var(--about-gutter, 26px); right: var(--about-gutter, 26px); width: auto; padding: 16px 0 0; border-left: 0; border-top: 1px solid color-mix(in srgb, var(--node-color), transparent 60%); }
  .constellation-preview__category { justify-content: space-between; margin-bottom: 8px; }
  .constellation-preview h3 { margin-bottom: 8px; font-size: 19px; line-height: 1.45; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .constellation-preview__description { line-height: 1.7; -webkit-line-clamp: 2; }
}
@media (max-height: 700px) and (min-width: 761px) {
  .constellation-preview { top: 29%; }
  .constellation-preview__category { margin-bottom: 12px; }
  .constellation-preview h3 { font-size: 20px; margin-bottom: 11px; }
  .constellation-preview__description { -webkit-line-clamp: 3; line-height: 1.8; }
}
.constellation-directory--compact .constellation-directory__fallback { top: 108px; bottom: auto; left: var(--about-gutter, 6vw); right: auto; width: 39%; max-width: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; }
.constellation-directory--compact .constellation-preview { top: 108px; bottom: auto; left: auto; right: var(--about-gutter, 6vw); width: 44%; padding: 0 0 0 16px; border-top: 0; border-left: 1px solid #8192a35c; }
.constellation-directory--compact .constellation-preview__category { font-size: 14px; margin-bottom: 6px; gap: 2px 10px; }
.constellation-directory--compact .constellation-preview h3 { font-size: 18px; line-height: 1.35; margin-bottom: 4px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.constellation-directory--compact .constellation-preview__description { display: none; }
@media (prefers-reduced-motion: reduce) {
  .constellation-node__point { transition: none; }
}
</style>
