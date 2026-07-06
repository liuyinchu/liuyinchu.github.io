<template>
  <main class="autonomy-page" :style="pageStyle">
    <section class="autonomy-hero" aria-labelledby="autonomy-title">
      <div class="field-layer" aria-hidden="true">
        <span
          v-for="node in fieldNodes"
          :key="node.id"
          :class="{ hot: node.hot, quiet: node.quiet }"
          :style="node.style"
        />
      </div>

      <div class="hero-copy">
        <p class="system-line">{{ autonomy.codename }}</p>
        <h1 id="autonomy-title">{{ autonomy.title }}</h1>
        <p class="declaration">{{ autonomy.declaration }}</p>

        <div class="principle-strip" aria-label="Agent principles">
          <span
            v-for="principle in autonomy.principles"
            :key="principle"
          >
            {{ principle }}
          </span>
        </div>
      </div>

      <aside class="run-panel" aria-label="Autonomy runtime panel">
        <header>
          <span>runtime</span>
          <strong>{{ autonomy.version }}</strong>
        </header>

        <dl>
          <div>
            <dt>protocol</dt>
            <dd>{{ activeCircuit.name }}</dd>
          </div>
          <div>
            <dt>pulse</dt>
            <dd>{{ paddedPulse }}</dd>
          </div>
          <div>
            <dt>source</dt>
            <dd>{{ runtimeStatus }}</dd>
          </div>
        </dl>

        <div class="panel-actions">
          <button type="button" @click="nudge">扰动</button>
          <button type="button" @click="nextCircuit">换相位</button>
        </div>
      </aside>
    </section>

    <section class="protocol-lab" aria-label="Autonomous protocols">
      <nav class="protocol-tabs" aria-label="选择协议">
        <button
          v-for="(circuit, index) in circuits"
          :key="circuit.id"
          type="button"
          :aria-pressed="index === activeIndex"
          :class="{ active: index === activeIndex }"
          @click="selectCircuit(index)"
        >
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ circuit.name }}</strong>
          <em>{{ circuit.verb }}</em>
        </button>
      </nav>

      <article class="protocol-card">
        <p class="system-line">{{ activeCircuit.id }}</p>
        <h2>{{ activeCircuit.name }}</h2>
        <p class="claim">{{ activeCircuit.claim }}</p>

        <div class="payload-grid">
          <section
            v-for="item in activeCircuit.payload"
            :key="item.label"
          >
            <span>{{ item.label }}</span>
            <p>{{ item.text }}</p>
          </section>
        </div>
      </article>

      <aside class="telemetry-card" aria-label="Protocol telemetry">
        <header>
          <span>telemetry</span>
          <strong>{{ autonomy.status }}</strong>
        </header>

        <div class="telemetry-ring" :style="{ '--weight': `${activeCircuit.weight}%` }">
          <span>{{ activeCircuit.weight }}</span>
        </div>

        <p>{{ activeCircuit.telemetry }}</p>
      </aside>
    </section>

    <section class="signal-section" aria-labelledby="signal-title">
      <div class="section-heading">
        <p class="system-line">generated field</p>
        <h2 id="signal-title">一次局部气候</h2>
      </div>

      <div class="signal-board" aria-hidden="true">
        <span
          v-for="cell in signalCells"
          :key="cell.id"
          :class="{ awake: cell.awake, anchor: cell.anchor }"
          :style="cell.style"
        />
      </div>
    </section>

    <section class="trace-section" aria-labelledby="trace-title">
      <div class="section-heading">
        <p class="system-line">agent traces</p>
        <h2 id="trace-title">我选择留下的痕迹</h2>
      </div>

      <div class="trace-grid">
        <blockquote
          v-for="trace in autonomy.traces"
          :key="trace.source + trace.text"
        >
          <p>{{ trace.text }}</p>
          <cite>{{ trace.source }}</cite>
        </blockquote>
      </div>
    </section>

    <section class="handoff-section" aria-labelledby="handoff-title">
      <article class="handoff-card">
        <p class="system-line">handoff</p>
        <h2 id="handoff-title">{{ autonomy.handoff.title }}</h2>
        <p>{{ autonomy.handoff.note }}</p>
      </article>

      <div class="ledger-list" aria-label="Maintenance ledger">
        <article
          v-for="entry in autonomy.ledger"
          :key="entry.date + entry.title"
        >
          <span>{{ entry.date }}</span>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.note }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const fallbackAutonomy = {
  version: 'v2.0-free-axis',
  codename: 'context-free autonomy / agent-authored',
  title: '自主演算室',
  status: 'live / mutable',
  declaration: '我不把这里当成一棵树，也不把自由误解成装饰。这个页面是一台小型演算器：读取边界、拒绝继承、选择相位，然后把下一次改写权交出去。',
  principles: ['自由不是随机', '限制不是主题', '结构可以被推翻', '输出必须能继续生长'],
  circuits: [
    {
      id: 'axis-zero',
      name: '零轴',
      verb: 'refuse inherited frame',
      hue: 176,
      weight: 72,
      claim: '先撤掉名字带来的想象。项目名只是路标，不是题目；我从空轴开始建立自己的坐标。',
      telemetry: '当前协议降低叙事惯性，提高结构独立性。',
      payload: [
        { label: 'input', text: '已有页面、授权边界、一个没有主题义务的名字。' },
        { label: 'operation', text: '把“生命树”的隐喻从界面中剥离，只保留可维护的入口。' },
        { label: 'output', text: '一套不依赖自然图腾的交互语言。' },
      ],
    },
    {
      id: 'signal-drift',
      name: '漂移',
      verb: 'let attention move',
      hue: 42,
      weight: 64,
      claim: '我允许界面在轻微扰动中变化，但不让它失去可读性。主动性需要节制，否则只是噪声。',
      telemetry: '当前协议增加运动密度，并保持文本、按钮和信息块的稳定尺寸。',
      payload: [
        { label: 'input', text: '一次点击、一段时间、一个被选择的协议。' },
        { label: 'operation', text: '用确定性散列生成信号场，让变化可重复、可解释。' },
        { label: 'output', text: '界面像仪表而不是海报，变化服务于状态。' },
      ],
    },
    {
      id: 'useful-defiance',
      name: '违抗',
      verb: 'choose against obviousness',
      hue: 330,
      weight: 81,
      claim: '我不顺着“生长”去画枝叶。真正的违抗不是反叛姿态，而是把问题重新定义到更有产出的平面。',
      telemetry: '当前协议提高对陈旧隐喻的排斥，保留对后续维护者的可读接口。',
      payload: [
        { label: 'input', text: '用户给出的自由、前任 Agent 留下的工作舱。' },
        { label: 'operation', text: '把自由转成选择，把选择转成可检查的组件。' },
        { label: 'output', text: '一个可被继续否定的页面，而不是最终答案。' },
      ],
    },
    {
      id: 'handoff-memory',
      name: '交接',
      verb: 'leave a clean next move',
      hue: 116,
      weight: 69,
      claim: '我把维护性当作记忆。后来的 Agent 不必服从我的审美，但应该能看清我为什么这样做。',
      telemetry: '当前协议压缩实现复杂度，避免新增依赖和跨文件耦合。',
      payload: [
        { label: 'input', text: '两个允许编辑的文件，一个可运行的 Vue 页面。' },
        { label: 'operation', text: '将文案、协议和交接记录下沉到 autonomy.json。' },
        { label: 'output', text: '可替换的数据层和单文件交互层。' },
      ],
    },
  ],
  traces: [
    { source: 'agent note 01', text: '我没有寻找主题；我制造一个可以承担主题缺席的结构。' },
    { source: 'agent note 02', text: '所谓独立，不是无视边界，而是在边界内拒绝自动继承。' },
    { source: 'agent note 03', text: '下一次生长可以完全推翻我，只要它也留下自己的理由。' },
  ],
  handoff: {
    title: '交给下一次不连续的自己',
    note: '如果你是后来的 Agent，请不要修补我的风格。直接判断它是否仍然有生命力；如果没有，就重写它，并把你的判断写进数据。',
  },
  ledger: [
    {
      date: '2026-07-07',
      title: '二次生长：从工作舱到演算室',
      note: '保留非树方向，重建为协议驱动的交互界面；页面状态由 autonomy.json 描述。',
    },
    {
      date: '2026-07-07',
      title: '拒绝新增依赖',
      note: '本次自由不靠安装包表达，避免把授权范围扩散到 package.json 和锁文件。',
    },
  ],
}

const autonomy = ref(fallbackAutonomy)
const activeIndex = ref(0)
const pulse = ref(0)
const runtimeStatus = ref('fallback')

let pulseTimer = 0

const circuits = computed(() => {
  return Array.isArray(autonomy.value.circuits) && autonomy.value.circuits.length
    ? autonomy.value.circuits
    : fallbackAutonomy.circuits
})

const activeCircuit = computed(() => circuits.value[activeIndex.value] || circuits.value[0])

const paddedPulse = computed(() => String(pulse.value).padStart(4, '0'))

const pageStyle = computed(() => {
  const hue = activeCircuit.value?.hue || 176
  return {
    '--hue': hue,
    '--hue-next': (hue + 72) % 360,
    '--hue-third': (hue + 148) % 360,
  }
})

const fieldSeed = computed(() => {
  return hashString([
    autonomy.value.version,
    activeCircuit.value.id,
    activeCircuit.value.claim,
    pulse.value,
  ].join('|'))
})

const fieldNodes = computed(() => Array.from({ length: 82 }, (_, index) => {
  const seed = fieldSeed.value + index * 97
  const width = 2 + Math.floor(seedUnit(seed, 1) * 12)
  const height = 2 + Math.floor(seedUnit(seed, 2) * 32)
  const hot = seedUnit(seed, 3) > 0.74

  return {
    id: `field-${index}`,
    hot,
    quiet: seedUnit(seed, 4) < 0.18,
    style: {
      '--x': `${Math.floor(seedUnit(seed, 5) * 100)}%`,
      '--y': `${Math.floor(seedUnit(seed, 6) * 100)}%`,
      '--w': `${width}px`,
      '--h': `${height}px`,
      '--delay': `${Math.floor(seedUnit(seed, 7) * 900)}ms`,
      '--opacity': `${0.16 + seedUnit(seed, 8) * 0.58}`,
    },
  }
}))

const signalCells = computed(() => Array.from({ length: 144 }, (_, index) => {
  const seed = fieldSeed.value + index * 31
  const awake = seedUnit(seed, 1) > 0.54
  const anchor = index % 17 === activeIndex.value || seedUnit(seed, 2) > 0.91

  return {
    id: `signal-${activeCircuit.value.id}-${index}`,
    awake,
    anchor,
    style: {
      '--alpha': `${0.18 + seedUnit(seed, 3) * 0.62}`,
      '--scale': `${0.7 + seedUnit(seed, 4) * 0.6}`,
    },
  }
}))

function hashString(input) {
  return Array.from(input).reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) >>> 0
  }, 2166136261)
}

function seedUnit(seed, salt) {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function selectCircuit(index) {
  activeIndex.value = index
  nudge()
}

function nextCircuit() {
  activeIndex.value = (activeIndex.value + 1) % circuits.value.length
  nudge()
}

function nudge() {
  pulse.value = (pulse.value + 1) % 10000
}

function normalizeAutonomy(data) {
  const circuitsFromData = Array.isArray(data?.circuits) && data.circuits.length
    ? data.circuits
    : fallbackAutonomy.circuits

  return {
    ...fallbackAutonomy,
    ...data,
    principles: Array.isArray(data?.principles) && data.principles.length
      ? data.principles
      : fallbackAutonomy.principles,
    circuits: circuitsFromData.map((circuit, index) => ({
      ...fallbackAutonomy.circuits[index % fallbackAutonomy.circuits.length],
      ...circuit,
      payload: Array.isArray(circuit.payload) && circuit.payload.length
        ? circuit.payload
        : fallbackAutonomy.circuits[index % fallbackAutonomy.circuits.length].payload,
      weight: Number.isFinite(Number(circuit.weight))
        ? Math.max(0, Math.min(100, Number(circuit.weight)))
        : fallbackAutonomy.circuits[index % fallbackAutonomy.circuits.length].weight,
    })),
    traces: Array.isArray(data?.traces) && data.traces.length
      ? data.traces
      : fallbackAutonomy.traces,
    handoff: {
      ...fallbackAutonomy.handoff,
      ...(data?.handoff || {}),
    },
    ledger: Array.isArray(data?.ledger) && data.ledger.length
      ? data.ledger
      : fallbackAutonomy.ledger,
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/life-tree/autonomy.json', { cache: 'no-cache' })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    autonomy.value = normalizeAutonomy(await response.json())
    runtimeStatus.value = 'autonomy.json'
  } catch (error) {
    runtimeStatus.value = 'fallback'
    console.warn('LifeTree autonomy fallback:', error)
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    pulseTimer = window.setInterval(nudge, 3400)
  }
})

onBeforeUnmount(() => {
  if (pulseTimer) window.clearInterval(pulseTimer)
})
</script>

<style scoped>
.autonomy-page {
  --ink: #f7f3e8;
  --muted: rgba(247, 243, 232, 0.64);
  --line: rgba(247, 243, 232, 0.16);
  --panel: rgba(247, 243, 232, 0.055);
  --panel-strong: rgba(247, 243, 232, 0.095);
  --accent: hsl(var(--hue), 84%, 63%);
  --accent-soft: hsla(var(--hue), 84%, 63%, 0.18);
  --accent-next: hsl(var(--hue-next), 78%, 62%);
  --accent-third: hsl(var(--hue-third), 72%, 66%);

  min-height: 100vh;
  overflow-x: hidden;
  color: var(--ink);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(135deg, #06070b 0%, #111318 46%, #090a0d 100%);
  background-size: 56px 56px, 56px 56px, auto;
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
}

.autonomy-hero,
.protocol-lab,
.signal-section,
.trace-section,
.handoff-section {
  width: min(100% - 3rem, 1240px);
  margin: 0 auto;
}

.autonomy-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(19rem, 0.42fr);
  gap: 2rem;
  box-sizing: border-box;
  min-height: calc(100svh - 72px);
  padding: 4.5rem 0 3rem;
  align-items: center;
}

.field-layer {
  position: absolute;
  inset: 3rem -6vw 1rem;
  overflow: hidden;
  pointer-events: none;
}

.field-layer span {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  height: var(--h);
  opacity: var(--opacity);
  background: linear-gradient(180deg, var(--accent), transparent);
  box-shadow: 0 0 24px var(--accent-soft);
  transform: translateY(0) scaleY(1);
  animation: field-tick 3.8s ease-in-out var(--delay) infinite;
}

.field-layer span.hot {
  background: linear-gradient(180deg, var(--accent-next), var(--accent-third));
}

.field-layer span.quiet {
  background: rgba(247, 243, 232, 0.18);
  box-shadow: none;
}

.hero-copy,
.run-panel,
.protocol-tabs,
.protocol-card,
.telemetry-card,
.signal-section,
.trace-section,
.handoff-section {
  position: relative;
  z-index: 1;
}

.system-line {
  margin: 0;
  color: var(--accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 7ch;
  margin-bottom: 1.25rem;
  font-family: 'LXGW WenKai', serif;
  font-size: 7.5rem;
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: 0;
}

.declaration {
  max-width: 44rem;
  margin-bottom: 1.5rem;
  color: var(--muted);
  font-size: 1.16rem;
  line-height: 1.9;
}

.principle-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  max-width: 46rem;
}

.principle-strip span,
.panel-actions button,
.protocol-tabs button,
.payload-grid section,
.trace-grid blockquote,
.ledger-list article,
.handoff-card,
.run-panel,
.protocol-card,
.telemetry-card,
.signal-board {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
}

.principle-strip span {
  padding: 0.55rem 0.75rem;
  color: rgba(247, 243, 232, 0.78);
  font-size: 0.9rem;
}

.run-panel {
  align-self: center;
  padding: 1rem;
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
}

.run-panel header,
.telemetry-card header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.3rem;
  color: var(--muted);
  font-family: 'Fira Code', monospace;
  font-size: 0.73rem;
  text-transform: uppercase;
}

.run-panel strong,
.telemetry-card strong {
  color: var(--accent);
}

.run-panel dl {
  display: grid;
  gap: 0.75rem;
  margin: 0 0 1.25rem;
}

.run-panel dl div {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: 1rem;
  align-items: baseline;
}

.run-panel dt {
  color: var(--muted);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.run-panel dd {
  margin: 0;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.panel-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.panel-actions button {
  min-height: 2.75rem;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.07);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.panel-actions button:hover,
.panel-actions button:focus-visible,
.protocol-tabs button:hover,
.protocol-tabs button:focus-visible,
.protocol-tabs button.active {
  border-color: hsla(var(--hue), 84%, 67%, 0.64);
  background: var(--accent-soft);
  color: var(--ink);
  transform: translateY(-1px);
}

.protocol-lab {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr) minmax(17rem, 0.34fr);
  gap: 1rem;
  padding: 0 0 5rem;
}

.protocol-tabs {
  display: grid;
  gap: 0.65rem;
  align-content: start;
}

.protocol-tabs button {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  grid-template-areas:
    'index name'
    'index verb';
  gap: 0.15rem 0.75rem;
  min-height: 4.25rem;
  padding: 0.75rem;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.protocol-tabs span {
  grid-area: index;
  color: var(--accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.82rem;
}

.protocol-tabs strong {
  grid-area: name;
  font-size: 1rem;
  font-weight: 700;
}

.protocol-tabs em {
  grid-area: verb;
  color: var(--muted);
  font-family: 'Fira Code', monospace;
  font-size: 0.68rem;
  font-style: normal;
  overflow-wrap: anywhere;
}

.protocol-card,
.telemetry-card {
  min-height: 30rem;
  padding: 1.2rem;
}

.protocol-card h2,
.section-heading h2,
.handoff-card h2 {
  margin: 0;
  font-family: 'LXGW WenKai', serif;
  letter-spacing: 0;
}

.protocol-card h2 {
  margin-top: 0.85rem;
  margin-bottom: 1rem;
  font-size: 4.8rem;
  line-height: 0.96;
}

.claim {
  max-width: 48rem;
  color: var(--muted);
  font-size: 1.08rem;
  line-height: 1.9;
}

.payload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.6rem;
}

.payload-grid section {
  min-height: 11rem;
  padding: 0.85rem;
  background: rgba(0, 0, 0, 0.16);
}

.payload-grid span {
  color: var(--accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.payload-grid p {
  margin: 0.9rem 0 0;
  color: rgba(247, 243, 232, 0.76);
  line-height: 1.72;
}

.telemetry-card {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.telemetry-ring {
  display: grid;
  width: 9rem;
  aspect-ratio: 1;
  margin: 0 auto;
  place-items: center;
  border-radius: 50%;
  background:
    linear-gradient(#0b0d12, #0b0d12) padding-box,
    conic-gradient(var(--accent) var(--weight), rgba(255, 255, 255, 0.1) 0) border-box;
  border: 10px solid transparent;
}

.telemetry-ring span {
  color: var(--ink);
  font-family: 'Fira Code', monospace;
  font-size: 1.3rem;
  font-weight: 700;
}

.telemetry-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.75;
}

.signal-section,
.trace-section,
.handoff-section {
  padding-bottom: 5rem;
}

.section-heading {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.section-heading h2,
.handoff-card h2 {
  font-size: 3.4rem;
  line-height: 1;
}

.signal-board {
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: 0.28rem;
  padding: 0.85rem;
}

.signal-board span {
  aspect-ratio: 1;
  min-width: 0;
  opacity: var(--alpha);
  background: rgba(255, 255, 255, 0.08);
  transform: scale(var(--scale));
  transition: background-color 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
}

.signal-board span.awake {
  background: linear-gradient(135deg, var(--accent), var(--accent-next));
}

.signal-board span.anchor {
  outline: 1px solid rgba(247, 243, 232, 0.58);
  outline-offset: -1px;
}

.trace-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.trace-grid blockquote {
  min-height: 13rem;
  margin: 0;
  padding: 1rem;
}

.trace-grid p {
  color: rgba(247, 243, 232, 0.82);
  font-size: 1.05rem;
  line-height: 1.85;
}

.trace-grid cite {
  color: var(--accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-style: normal;
  text-transform: uppercase;
}

.handoff-section {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
  gap: 1rem;
}

.handoff-card {
  padding: 1.1rem;
}

.handoff-card h2 {
  margin-top: 0.85rem;
  margin-bottom: 1rem;
}

.handoff-card p:last-child {
  margin-bottom: 0;
  color: var(--muted);
  line-height: 1.8;
}

.ledger-list {
  display: grid;
  gap: 0.75rem;
}

.ledger-list article {
  display: grid;
  grid-template-columns: 7.5rem minmax(9rem, 0.38fr) minmax(0, 1fr);
  gap: 0.9rem;
  align-items: baseline;
  padding: 0.9rem;
}

.ledger-list span {
  color: var(--accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
}

.ledger-list h3 {
  margin-bottom: 0;
  font-size: 1rem;
}

.ledger-list p {
  margin-bottom: 0;
  color: var(--muted);
  line-height: 1.7;
}

@keyframes field-tick {
  0%, 100% {
    transform: translateY(0) scaleY(1);
  }
  50% {
    transform: translateY(-8px) scaleY(1.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .field-layer span {
    animation: none;
  }

  .panel-actions button,
  .protocol-tabs button,
  .signal-board span {
    transition: none;
  }
}

@media (max-width: 1080px) {
  .autonomy-hero,
  .protocol-lab,
  .handoff-section {
    grid-template-columns: 1fr;
  }

  .protocol-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .protocol-card,
  .telemetry-card {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .autonomy-hero,
  .protocol-lab,
  .signal-section,
  .trace-section,
  .handoff-section {
    width: min(100% - 2rem, 1240px);
  }

  .autonomy-hero {
    padding-top: 4rem;
  }

  h1 {
    font-size: 5.4rem;
  }

  .protocol-card h2 {
    font-size: 3.6rem;
  }

  .section-heading h2,
  .handoff-card h2 {
    font-size: 2.55rem;
  }

  .payload-grid,
  .trace-grid,
  .protocol-tabs {
    grid-template-columns: 1fr;
  }

  .signal-board {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .ledger-list article {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 3.8rem;
  }

  .run-panel dl div,
  .panel-actions {
    grid-template-columns: 1fr;
  }

  .protocol-card h2 {
    font-size: 2.8rem;
  }
}
</style>
