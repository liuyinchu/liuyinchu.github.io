<template>
  <main class="life-tree-page" :class="{ 'is-blooming': isBlooming }">
    <section class="life-hero" aria-labelledby="life-tree-title">
      <div class="sky-field" aria-hidden="true">
        <i v-for="star in stars" :key="star.id" :style="star.style"></i>
      </div>

      <article class="manifest-panel">
        <p class="eyebrow">Agent-grown page / First sprout</p>
        <h1 id="life-tree-title">生命树</h1>
        <p class="manifest-text">
          这不是一个完成的页面，而是一枚会被后来者继续照看的种子。
          每一次维护都应该留下年轮，每一次扩展都应该长出新的枝叶。
        </p>
        <div class="signal-row" aria-label="生命树状态">
          <span>{{ seed.status || 'germinating' }}</span>
          <span>{{ seed.season || 'unknown season' }}</span>
          <span>{{ seed.version || 'v0' }}</span>
        </div>
      </article>

      <section class="tree-stage" aria-label="生命树可视化">
        <svg class="tree-orbit" viewBox="0 0 1000 1000" role="img" aria-labelledby="tree-diagram-title">
          <title id="tree-diagram-title">由种子数据生成的生命树</title>
          <defs>
            <radialGradient id="lifeCore" cx="48%" cy="48%" r="64%">
              <stop offset="0%" stop-color="#fff8c8" stop-opacity="0.94" />
              <stop offset="38%" stop-color="#8fffd3" stop-opacity="0.56" />
              <stop offset="72%" stop-color="#6a7cff" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#06080f" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="branchLight" x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stop-color="#7dffe2" />
              <stop offset="52%" stop-color="#fff1a8" />
              <stop offset="100%" stop-color="#b897ff" />
            </linearGradient>
          </defs>

          <circle class="aura aura-outer" cx="500" cy="510" r="390" />
          <circle class="aura aura-mid" cx="500" cy="510" r="262" />
          <circle class="aura aura-inner" cx="500" cy="510" r="138" />

          <g class="root-system" aria-hidden="true">
            <path d="M500 724 C454 778 394 806 332 852" />
            <path d="M500 724 C514 812 474 870 430 928" />
            <path d="M500 724 C562 792 642 824 722 902" />
            <path d="M500 724 C489 820 544 878 592 940" />
          </g>

          <g class="branches">
            <path
              v-for="branch in branches"
              :key="branch.id"
              :d="branch.path"
              class="branch-path"
              :style="{ '--delay': `${branch.delay}ms` }"
            />
          </g>

          <g class="nodes">
            <g
              v-for="node in nodeList"
              :key="node.id"
              class="life-node"
              :class="{ 'is-active': activeNode?.id === node.id }"
              :transform="`translate(${node.x} ${node.y})`"
              role="button"
              tabindex="0"
              @click="activeNode = node"
              @keydown.enter.prevent="activeNode = node"
              @keydown.space.prevent="activeNode = node"
            >
              <circle class="node-halo" :r="node.size + 18" />
              <circle class="node-core" :r="node.size" />
              <text x="0" :y="node.size + 32">{{ node.short }}</text>
            </g>
          </g>
        </svg>

        <div class="node-card" aria-live="polite">
          <span class="node-index">{{ activeNode?.id }}</span>
          <h2>{{ activeNode?.name }}</h2>
          <p>{{ activeNode?.description }}</p>
          <button type="button" @click="bloom">
            触发生长脉冲
          </button>
        </div>
      </section>
    </section>

    <section class="growth-ledger" aria-labelledby="ledger-title">
      <div class="ledger-heading">
        <p class="eyebrow">Growth ledger</p>
        <h2 id="ledger-title">第一圈年轮</h2>
      </div>

      <div class="ledger-grid">
        <article v-for="entry in seed.growthLog" :key="entry.date" class="ledger-card">
          <span>{{ entry.date }}</span>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.note }}</p>
        </article>
      </div>
    </section>

    <section class="protocol-strip" aria-label="后续维护协议">
      <p>
        后续生长协议：
        <strong>只修改本页面和 <code>public/life-tree/</code>。</strong>
        新的 Agent 可以扩展种子、增加枝叶、替换视觉，但必须留下下一圈年轮。
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const fallbackSeed = {
  version: 'v0.1',
  status: 'germinating',
  season: 'first light',
  nodes: [
    {
      id: 'root',
      name: 'Root',
      short: 'root',
      x: 500,
      y: 712,
      size: 23,
      description: '页面的第一枚根系：自由、合法、可继续生长。',
    },
  ],
  growthLog: [],
}

const seed = ref(fallbackSeed)
const activeNode = ref(fallbackSeed.nodes[0])
const isBlooming = ref(false)

const nodeList = computed(() => seed.value.nodes || [])

const nodeById = computed(() => {
  const map = new Map()
  nodeList.value.forEach((node) => map.set(node.id, node))
  return map
})

const branches = computed(() => nodeList.value
  .filter((node) => node.parent && nodeById.value.has(node.parent))
  .map((node, index) => {
    const parent = nodeById.value.get(node.parent)
    const bend = node.bend || 0
    const controlX = (parent.x + node.x) / 2 + bend
    const controlY = (parent.y + node.y) / 2 - Math.abs(node.y - parent.y) * 0.18
    return {
      id: `${parent.id}-${node.id}`,
      delay: 120 + index * 130,
      path: `M ${parent.x} ${parent.y} Q ${controlX} ${controlY} ${node.x} ${node.y}`,
    }
  }))

const stars = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  style: {
    '--x': `${(index * 37) % 100}%`,
    '--y': `${(index * 61) % 100}%`,
    '--s': `${0.6 + ((index * 13) % 7) * 0.13}`,
    '--d': `${(index * 97) % 3000}ms`,
  },
}))

function bloom() {
  isBlooming.value = true
  const currentIndex = nodeList.value.findIndex((node) => node.id === activeNode.value?.id)
  const nextIndex = (currentIndex + 1) % nodeList.value.length
  activeNode.value = nodeList.value[nextIndex] || nodeList.value[0]
  window.setTimeout(() => {
    isBlooming.value = false
  }, 900)
}

onMounted(async () => {
  try {
    const response = await fetch('/life-tree/seed.json', { cache: 'no-cache' })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    const data = await response.json()
    seed.value = { ...fallbackSeed, ...data }
    activeNode.value = seed.value.nodes?.[0] || fallbackSeed.nodes[0]
  } catch (error) {
    console.warn('Life tree seed fallback:', error)
  }
})
</script>

<style scoped>
.life-tree-page {
  --ink: #05070d;
  --deep: #0b1020;
  --moss: #85ffd8;
  --gold: #fff0a8;
  --violet: #b497ff;
  --paper: #f6ffe9;
  --muted: rgba(229, 241, 223, 0.66);
  --glass: rgba(12, 18, 32, 0.64);

  min-height: 100vh;
  overflow-x: hidden;
  color: var(--paper);
  background:
    radial-gradient(circle at 16% 8%, rgba(133, 255, 216, 0.18), transparent 28rem),
    radial-gradient(circle at 86% 24%, rgba(180, 151, 255, 0.17), transparent 32rem),
    linear-gradient(150deg, #03050a 0%, #091221 46%, #111022 100%);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
  isolation: isolate;
}

.life-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(18rem, 0.78fr) minmax(0, 1.22fr);
  gap: clamp(1.6rem, 5vw, 5rem);
  width: min(100% - 3rem, 1260px);
  min-height: calc(100svh - 72px);
  margin: 0 auto;
  padding: clamp(5.5rem, 8vw, 8rem) 0 clamp(3rem, 7vw, 6rem);
  align-items: center;
}

.sky-field {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  opacity: 0.75;
  pointer-events: none;
}

.sky-field i {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: calc(2px * var(--s));
  height: calc(2px * var(--s));
  border-radius: 999px;
  background: rgba(246, 255, 233, 0.88);
  box-shadow: 0 0 16px rgba(133, 255, 216, 0.64);
  opacity: 0.62;
}

.manifest-panel {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 1.25rem;
  align-content: center;
}

.eyebrow {
  margin: 0;
  color: var(--moss);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(4rem, 10vw, 9rem);
  line-height: 0.88;
  letter-spacing: 0;
  text-shadow:
    0 0 28px rgba(133, 255, 216, 0.26),
    0 12px 46px rgba(0, 0, 0, 0.45);
}

.manifest-text {
  max-width: 34rem;
  color: var(--muted);
  font-size: clamp(1.02rem, 1.35vw, 1.18rem);
  line-height: 1.95;
}

.signal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.signal-row span {
  border: 1px solid rgba(133, 255, 216, 0.22);
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  background: rgba(246, 255, 233, 0.055);
  color: rgba(246, 255, 233, 0.82);
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
}

.tree-stage {
  position: relative;
  min-height: min(76svh, 780px);
  border: 1px solid rgba(133, 255, 216, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(rgba(246, 255, 233, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(246, 255, 233, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 50% 46%, rgba(133, 255, 216, 0.18), transparent 24rem),
    rgba(5, 7, 13, 0.44);
  background-size: 42px 42px, 42px 42px, auto, auto;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 34px 90px rgba(0, 0, 0, 0.38);
  overflow: hidden;
}

.tree-stage::before {
  content: '';
  position: absolute;
  inset: -8%;
  background:
    conic-gradient(from 90deg, transparent, rgba(133, 255, 216, 0.16), transparent, rgba(180, 151, 255, 0.12), transparent);
  opacity: 0.42;
}

.tree-orbit {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: min(76svh, 780px);
}

.aura {
  fill: none;
  stroke: rgba(246, 255, 233, 0.1);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.aura-mid {
  stroke: rgba(133, 255, 216, 0.18);
  stroke-dasharray: 8 16;
}

.aura-inner {
  stroke: rgba(255, 240, 168, 0.18);
}

.root-system path,
.branch-path {
  fill: none;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

.root-system path {
  stroke: rgba(133, 255, 216, 0.24);
  stroke-width: 1.2;
}

.branch-path {
  stroke: url(#branchLight);
  stroke-width: 2.8;
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: drawBranch 1.7s cubic-bezier(0.2, 0.8, 0.22, 1) forwards;
  animation-delay: var(--delay);
}

.life-node {
  cursor: pointer;
  outline: none;
}

.node-halo {
  fill: url(#lifeCore);
  opacity: 0.62;
  transform-origin: center;
}

.node-core {
  fill: var(--gold);
  stroke: rgba(5, 7, 13, 0.82);
  stroke-width: 2;
}

.life-node.is-active .node-core {
  fill: var(--moss);
}

.life-node text {
  fill: rgba(246, 255, 233, 0.74);
  font-family: 'Fira Code', monospace;
  font-size: 19px;
  text-anchor: middle;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.node-card {
  position: absolute;
  right: clamp(1rem, 4vw, 2.5rem);
  bottom: clamp(1rem, 4vw, 2.5rem);
  z-index: 3;
  width: min(24rem, calc(100% - 2rem));
  border: 1px solid rgba(133, 255, 216, 0.18);
  border-radius: 22px;
  padding: 1.2rem;
  background: rgba(5, 7, 13, 0.72);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
}

.node-index {
  color: var(--moss);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.node-card h2 {
  margin: 0.25rem 0 0.55rem;
  color: var(--paper);
  font-size: 1.55rem;
  line-height: 1.14;
}

.node-card p {
  margin-bottom: 1rem;
  color: var(--muted);
  line-height: 1.72;
}

.node-card button {
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 0.82rem 1rem;
  background: linear-gradient(90deg, var(--moss), var(--gold));
  color: #07100e;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.growth-ledger {
  width: min(100% - 3rem, 1260px);
  margin: 0 auto;
  padding: 0 0 clamp(4rem, 8vw, 7rem);
}

.ledger-heading {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.ledger-heading h2 {
  margin: 0;
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2.4rem, 6vw, 5.2rem);
  line-height: 1;
}

.ledger-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.ledger-card {
  min-height: 14rem;
  border: 1px solid rgba(246, 255, 233, 0.1);
  border-radius: 24px;
  padding: 1.25rem;
  background:
    linear-gradient(145deg, rgba(246, 255, 233, 0.07), rgba(246, 255, 233, 0.02)),
    rgba(5, 7, 13, 0.42);
}

.ledger-card span {
  color: var(--violet);
  font-family: 'Fira Code', monospace;
  font-size: 0.74rem;
}

.ledger-card h3 {
  margin: 1.35rem 0 0.65rem;
  color: var(--paper);
  font-size: 1.34rem;
}

.ledger-card p {
  color: var(--muted);
  line-height: 1.78;
}

.protocol-strip {
  width: min(100% - 3rem, 1260px);
  margin: 0 auto clamp(3rem, 6vw, 5rem);
  border: 1px solid rgba(255, 240, 168, 0.18);
  border-radius: 999px;
  padding: 1rem 1.2rem;
  background: rgba(255, 240, 168, 0.06);
}

.protocol-strip p {
  margin: 0;
  color: rgba(246, 255, 233, 0.8);
  line-height: 1.75;
  text-align: center;
}

.protocol-strip code {
  color: var(--gold);
  font-family: 'Fira Code', monospace;
}

.is-blooming .tree-stage {
  animation: bloomFlash 0.9s ease both;
}

@keyframes drawBranch {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes bloomFlash {
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 34px 90px rgba(0, 0, 0, 0.38);
  }
  45% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      0 0 90px rgba(133, 255, 216, 0.28),
      0 34px 90px rgba(0, 0, 0, 0.38);
  }
}

@media (max-width: 980px) {
  .life-hero {
    grid-template-columns: 1fr;
    padding-top: 4.8rem;
  }

  .tree-stage,
  .tree-orbit {
    min-height: 620px;
    height: 620px;
  }

  .ledger-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .life-hero,
  .growth-ledger,
  .protocol-strip {
    width: min(100% - 2rem, 1260px);
  }

  h1 {
    font-size: clamp(3.4rem, 18vw, 5.2rem);
  }

  .signal-row span {
    flex: 1 1 auto;
    text-align: center;
  }

  .tree-stage,
  .tree-orbit {
    min-height: 560px;
    height: 560px;
  }

  .tree-orbit {
    width: 150%;
    margin-left: -25%;
  }

  .node-card {
    right: 1rem;
    bottom: 1rem;
  }

  .protocol-strip {
    border-radius: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .branch-path,
  .is-blooming .tree-stage {
    animation: none;
  }

  .branch-path {
    stroke-dashoffset: 0;
  }
}
</style>
