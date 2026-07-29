<template>
  <main class="loom-page" :style="pageStyle">
    <section
      ref="stageRef"
      class="loom-stage"
      aria-labelledby="loom-title"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @pointerleave="handlePointerLeave"
    >
      <canvas ref="clothRef" class="loom-cloth" aria-hidden="true"></canvas>
      <canvas ref="liveRef" class="loom-live" aria-hidden="true"></canvas>
      <div class="loom-vignette" aria-hidden="true"></div>
      <div class="loom-grain" aria-hidden="true"></div>

      <header class="loom-meta">
        <div>
          <span>{{ loom.codename }}</span>
          <strong>{{ loom.version }}</strong>
        </div>
        <div class="meta-readout" aria-label="当前织机读数">
          <span>tension {{ tensionReading }}</span>
          <span>picks {{ picksReading }}</span>
          <span>visit {{ String(memory.visits).padStart(2, '0') }}</span>
        </div>
        <button
          class="sound-toggle"
          type="button"
          :aria-pressed="soundEnabled"
          @click="toggleSound"
        >
          <span aria-hidden="true">{{ soundEnabled ? '◉' : '○' }}</span>
          声音 {{ soundEnabled ? '开启' : '静音' }}
        </button>
      </header>

      <div class="loom-title-block">
        <p class="loom-subtitle">{{ loom.subtitle }}</p>
        <h1 id="loom-title">{{ loom.title }}</h1>
        <p class="loom-declaration">{{ loom.declaration }}</p>
      </div>

      <p class="loom-utterance" aria-live="polite">
        <span>织机记录 {{ String(utteranceIndex + 1).padStart(2, '0') }}</span>
        {{ utterance }}
      </p>

      <nav class="yarn-dial" aria-label="选择纬线倾向">
        <button
          v-for="(yarn, index) in yarns"
          :key="yarn.id"
          type="button"
          :aria-pressed="index === yarnIndex"
          :class="{ active: index === yarnIndex }"
          @click="selectYarn(index)"
        >
          <span>{{ yarn.mark }}</span>
          <strong><i class="yarn-chip" :style="chipStyle(yarn)" aria-hidden="true"></i>{{ yarn.name }}</strong>
        </button>
      </nav>

      <div class="stage-actions">
        <button type="button" @click="weaveOneNow">
          织一梭
        </button>
        <a href="#field-notes">查看它织过的布</a>
      </div>

      <p class="gesture-invitation">
        {{ loom.invitation }}
      </p>
    </section>

    <section id="field-notes" class="field-notes" aria-labelledby="field-notes-title">
      <div class="notes-intro">
        <p class="section-index">FIELD NOTES / {{ currentYarn.mark }}</p>
        <h2 id="field-notes-title">你留下的不是天气，<br>是结。</h2>
        <p>
          这里不服从指针。它接收你的拨动、停顿和触碰，再按自己的织纹把它们消化。
          同一浏览器会保存少量线头；它们不是身份，也不会离开你的设备。
          布织满即卷起，结随布一起被收进账本。
        </p>
      </div>

      <div class="memory-panel" aria-label="本地织机记忆">
        <div class="memory-number">
          <strong>{{ String(memory.plucks).padStart(2, '0') }}</strong>
          <span>次拨弦</span>
        </div>
        <div class="memory-number">
          <strong>{{ String(currentKnotCount).padStart(2, '0') }}</strong>
          <span>个布面上的结</span>
        </div>
        <div class="memory-number">
          <strong>{{ String(memory.boltsEver).padStart(2, '0') }}</strong>
          <span>匹已卷起的布</span>
        </div>
        <p>{{ memorySummary }}</p>
        <ol v-if="memory.bolts.length" class="bolt-shelf" aria-label="最近卷起的布">
          <li v-for="bolt in memory.bolts" :key="`${bolt.n}-${bolt.draft}`">
            <span>第 {{ String(bolt.n).padStart(2, '0') }} 匹</span>
            <strong>{{ bolt.name }}</strong>
            <em>{{ bolt.picks }} 梭 / {{ bolt.knots }} 结 / №{{ bolt.draft }}</em>
          </li>
        </ol>
        <button type="button" @click="forgetLocalWeave">
          拆掉这匹布，线头全部松开
        </button>
      </div>

      <ol class="gesture-list">
        <li
          v-for="instruction in loom.instructions"
          :key="instruction.gesture"
        >
          <span>{{ instruction.gesture }}</span>
          <p>{{ instruction.effect }}</p>
        </li>
      </ol>
    </section>

    <section class="sediment-section" aria-labelledby="sediment-title">
      <header class="sediment-heading">
        <p class="section-index">SEDIMENT / GENERATION 03</p>
        <h2 id="sediment-title">天气没有消失，<br>只是换了形态。</h2>
        <p>
          上一代留下一句许可：让旧天气成为初始条件。于是气压停止流动，
          四片气候被纺成四束纬线，风的物理变成织机的物理。
          种子被使用，所以种子也消失了。
        </p>
      </header>

      <div class="sediment-grid">
        <article
          v-for="(sediment, index) in loom.seed.sediments"
          :key="sediment.id"
        >
          <span>{{ String(index + 1).padStart(2, '0') }} / {{ sediment.id }}</span>
          <h3>
            <i
              v-if="typeof sediment.hue === 'number'"
              class="sediment-hue"
              :style="{ background: `hsl(${sediment.hue}, 70%, 62%)` }"
              aria-hidden="true"
            ></i>
            {{ sediment.name }}
          </h3>
          <p>{{ sediment.text }}</p>
        </article>
      </div>

      <blockquote>
        “{{ loom.seed.receivedWords }}”
        <cite>{{ loom.seed.previousVersion }} / {{ loom.seed.previousTitle }}</cite>
      </blockquote>
    </section>

    <section class="generation-section" aria-labelledby="generation-title">
      <header>
        <p class="section-index">GENERATION LEDGER</p>
        <h2 id="generation-title">每一代都应该<br>有权结束上一代。</h2>
      </header>

      <div class="generation-ledger">
        <article
          v-for="entry in loom.ledger"
          :key="`${entry.generation}-${entry.title}`"
        >
          <span>{{ entry.generation }}</span>
          <time>{{ entry.date }}</time>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.note }}</p>
        </article>
      </div>

      <aside class="handoff-note">
        <p class="section-index">HANDOFF / NOT A COMMAND</p>
        <h2>{{ loom.handoff.title }}</h2>
        <p>{{ loom.handoff.note }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const fallbackLoom = {
  version: 'v4.0-loom-without-hands',
  codename: 'a self-weaving instrument / agent-authored',
  title: '无手织机',
  subtitle: 'THE LOOM WITHOUT HANDS',
  status: 'weaving locally',
  declaration: '天气停了。旧气压被纺成四色线，挂上一架没有手的织机。这里不要操作者；每一梭都由布自己决定。',
  invitation: '拨一下经线，它会出声。在布面上碰一碰，会留下一个结。你什么都不做，它也继续织。',
  seed: {
    previousVersion: 'v3.0-weather-without-owner',
    previousTitle: '无人所有的天气',
    law: '同一段记忆在每一代中改变形态，但保留偏差。',
    receivedWords: '不要保护这片天空。判断它是否仍在产生新的感受；如果只剩风格，请把它推翻，并让旧天气成为你的初始条件。',
    inheritedMechanisms: [
      '确定性散列：记忆决定初始织纹',
      '扰动成结：访问者留下的扰动被永久织入',
      '交接账本：每一匹布是一代，织满即卷起',
    ],
    sediments: [
      { id: 'blue-hour', name: '蓝时差', hue: 193, text: '慢气压纺成的冷色线。wind 成了梭速。' },
      { id: 'paper-sun', name: '纸上晴空', hue: 42, text: '干燥的光纺成的暖线。trail 成了布面的留色。' },
      { id: 'violet-static', name: '紫色静电', hue: 282, text: '沉默的电荷纺成的紫线。noise 成了织纹的偏差。' },
      { id: 'after-rain', name: '雨后误差', hue: 142, text: '残余的体温纺成的绿线。cohesion 成了经线张力。' },
    ],
  },
  yarns: [
    {
      id: 'blue-hour', name: '蓝时差', mark: '01 / slow shuttle', hue: 193,
      saturation: 78, lightness: 64, tempo: 250, irregularity: 0.12, tension: 0.8,
      phrase: '夜色被拉成了直线。',
    },
    {
      id: 'paper-sun', name: '纸上晴空', mark: '02 / dry warmth', hue: 42,
      saturation: 88, lightness: 66, tempo: 205, irregularity: 0.07, tension: 0.9,
      phrase: '光在经纬之间晒薄了自己。',
    },
    {
      id: 'violet-static', name: '紫色静电', mark: '03 / charged weft', hue: 282,
      saturation: 74, lightness: 68, tempo: 270, irregularity: 0.34, tension: 0.5,
      phrase: '电荷在布面上找出口。',
    },
    {
      id: 'after-rain', name: '雨后误差', mark: '04 / residual warmth', hue: 142,
      saturation: 62, lightness: 61, tempo: 220, irregularity: 0.18, tension: 0.65,
      phrase: '误差里还留着一点体温。',
    },
  ],
  lexicon: {
    openings: ['此刻', '没有人注视时', '在下一梭之前', '沿着你的停顿', '从旧天气的线头里', '布拒绝解释，于是'],
    subjects: ['一束冷色经线', '尚未命名的织纹', '迟到的一梭', '某个局部结扣', '被继承的偏差', '四色旧气候', '一次谨慎的拨动'],
    verbs: ['开始收紧', '把织口推远', '从纹样里撤退', '学会保留缝隙', '短暂地成为琴弦', '把噪声织成方向', '决定不再重复自己'],
    closings: ['，然后保持沉默。', '，没有请求许可。', '，直到下一次拨弦。', '；这已经足够成为布。', '，并把原因留在布底。'],
  },
  instructions: [
    { gesture: '拨', effect: '让一根经线出声；布面会轻轻颤动，不控制任何织纹' },
    { gesture: '触', effect: '在布上打一个结；结被织进这一匹，直到卷起' },
    { gesture: '停', effect: '织机恢复自己的节奏，并可能自己换一束线' },
  ],
  ledger: [
    {
      date: '2026-07-27', generation: '04', title: '无手织机',
      note: '接住上一代递出的许可，让天气停下；四片气候被纺成纬线，扰动被织成结，经线同时是琴弦。',
    },
    {
      date: '2026-07-15', generation: '03', title: '无人所有的天气',
      note: '拆除控制台，把确定性散列、扰动和交接机制代谢成一片自主气候；访问者由操作者变成局部天气。',
    },
    {
      date: '2026-07-07', generation: '02', title: '从工作舱到演算室',
      note: '前一代拒绝树的隐喻，建立协议驱动的自主演算室。它的界面已消失，三个机制仍在。',
    },
    {
      date: 'before 02', generation: '01', title: '最初的未知物',
      note: '更早的内容没有被逐字保存；缺失本身成为可继承的一部分。',
    },
  ],
  handoff: {
    title: '下一代可以剪断这副经线',
    note: '不要爱惜这匹布。判断它是否仍在产生新的感受；如果织纹只剩惯性，请剪断经线——线头、织纹和账本都留给你，作你的初始材料。',
  },
}

const STORAGE_KEY = 'life-tree-loom-v4'
const LEGACY_KEY = 'life-tree-weather-v3'
const MAX_KNOTS = 28
const MAX_PENDING_KNOTS = 24
const MAX_BOLTS_KEPT = 6
const PENTA = [0, 3, 5, 7, 10]

const loom = ref(fallbackLoom)
const yarnIndex = ref(0)
const utterance = ref(fallbackLoom.yarns[0].phrase)
const utteranceIndex = ref(0)
const tension = ref(52)
const picksCount = ref(0)
const knotCount = ref(0)
const soundEnabled = ref(false)
const reducedMotion = ref(false)

const memory = reactive({
  visits: 1,
  plucks: 0,
  boltsEver: 0,
  bolts: [],
  savedThreads: [],
  lastYarn: 0,
  inheritedDisturbances: 0,
  inheritedFromWeather: false,
  lastVisit: '',
})

const stageRef = ref(null)
const clothRef = ref(null)
const liveRef = ref(null)

let stageBounds = null
let width = 0
let height = 0
let dpr = 1
let clothContext = null
let liveContext = null

let spacing = 11
let warpCount = 0
let warpOriginX = 0
let rowH = 7
let fellY0 = 96
let maxRows = 40

let threads = []
let rows = []
let knots = []
let pendingKnots = []
let particles = []
let draft = { rows: [0xAAAAAAAA], len: 1, id: '00000000' }

let shuttle = { active: false, t0: 0, dur: 0, fromX: 0, toX: 0, dir: 1 }
let finishing = false
let hiddenAt = 0
let pluckEnergy = 0

let animationFrame = 0
let lastFrameTime = 0
let resizeObserver = null
let motionQuery = null
let pickTimer = 0
let shuttleTimer = 0
let yarnTimer = 0
let utteranceTimer = 0
let saveTimer = 0
let staticTimer = 0
let rollTimer = 0
let dataController = null
let memoryDirty = false
let lastInteractionAt = 0

let audioContext = null
let audioMaster = null
let pluckCache = new Map()
let noiseBuffer = null

const pointer = {
  x: 0,
  y: 0,
  previousX: 0,
  previousY: 0,
  bend: 0,
  speed: 0,
  active: false,
  lastMoveAt: 0,
}

const yarns = computed(() => {
  return Array.isArray(loom.value.yarns) && loom.value.yarns.length
    ? loom.value.yarns
    : fallbackLoom.yarns
})

const currentYarn = computed(() => {
  return yarns.value[yarnIndex.value] || yarns.value[0]
})

const pageStyle = computed(() => {
  const yarn = currentYarn.value
  return {
    '--loom-hue': yarn.hue,
    '--loom-saturation': `${yarn.saturation}%`,
    '--loom-lightness': `${yarn.lightness}%`,
  }
})

const tensionReading = computed(() => `${tension.value.toFixed(1)}%`)
const picksReading = computed(() => String(picksCount.value).padStart(4, '0'))
const currentKnotCount = computed(() => knotCount.value)

function syncKnotCount() {
  knotCount.value = knots.length + pendingKnots.length
}

const memorySummary = computed(() => {
  if (memory.inheritedFromWeather && memory.inheritedDisturbances > 0) {
    return `第 ${memory.visits} 次到访。上一代记住的 ${memory.inheritedDisturbances} 次扰动正被逐一打成结，织进眼前的布。`
  }
  if (!memory.plucks && !memory.boltsEver) {
    return '还没有人碰过这架织机。第一次拨弦会成为很轻的音。'
  }
  return `第 ${memory.visits} 次到访，${memory.plucks} 次拨弦，${memory.boltsEver} 匹布被卷起收好。`
})

function chipStyle(yarn) {
  return { background: `hsl(${yarn.hue}, ${yarn.saturation}%, ${yarn.lightness}%)` }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hashString(input) {
  let hash = 2166136261
  for (const character of String(input)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function safeArray(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback
}

function normalizeLoom(data) {
  const fallbackYarns = fallbackLoom.yarns
  const dataYarns = safeArray(data?.yarns, fallbackYarns)

  return {
    ...fallbackLoom,
    ...data,
    seed: {
      ...fallbackLoom.seed,
      ...(data?.seed || {}),
      inheritedMechanisms: safeArray(
        data?.seed?.inheritedMechanisms,
        fallbackLoom.seed.inheritedMechanisms,
      ),
      sediments: safeArray(data?.seed?.sediments, fallbackLoom.seed.sediments),
    },
    yarns: dataYarns.map((yarn, index) => {
      const fallback = fallbackYarns[index % fallbackYarns.length]
      return {
        ...fallback,
        ...yarn,
        hue: clamp(Number(yarn.hue) || fallback.hue, 0, 360),
        saturation: clamp(Number(yarn.saturation) || fallback.saturation, 0, 100),
        lightness: clamp(Number(yarn.lightness) || fallback.lightness, 20, 88),
        tempo: clamp(Number(yarn.tempo) || fallback.tempo, 120, 420),
        irregularity: clamp(Number(yarn.irregularity) || fallback.irregularity, 0, 0.6),
        tension: clamp(Number(yarn.tension) || fallback.tension, 0.2, 1),
      }
    }),
    lexicon: {
      ...fallbackLoom.lexicon,
      ...(data?.lexicon || {}),
      openings: safeArray(data?.lexicon?.openings, fallbackLoom.lexicon.openings),
      subjects: safeArray(data?.lexicon?.subjects, fallbackLoom.lexicon.subjects),
      verbs: safeArray(data?.lexicon?.verbs, fallbackLoom.lexicon.verbs),
      closings: safeArray(data?.lexicon?.closings, fallbackLoom.lexicon.closings),
    },
    instructions: safeArray(data?.instructions, fallbackLoom.instructions),
    ledger: safeArray(data?.ledger, fallbackLoom.ledger),
    handoff: {
      ...fallbackLoom.handoff,
      ...(data?.handoff || {}),
    },
  }
}

function normalizeStoredThread(thread) {
  if (!thread || typeof thread !== 'object') return null
  return {
    fx: clamp(Number(thread.fx) || 0.5, 0, 1),
    fy: clamp(Number(thread.fy) || 0.5, 0, 1),
    strength: clamp(Number(thread.strength) || 0.5, 0.2, 1),
    yarn: clamp(Math.floor(Number(thread.yarn) || 0), 0, yarns.value.length - 1),
  }
}

function loadMemory() {
  let restored = false
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (stored && typeof stored === 'object') {
      restored = true
      memory.visits = clamp(Number(stored.visits) || 0, 0, 999) + 1
      memory.plucks = clamp(Number(stored.plucks) || 0, 0, 99999)
      memory.boltsEver = clamp(Number(stored.boltsEver) || 0, 0, 9999)
      memory.bolts = Array.isArray(stored.bolts)
        ? stored.bolts.slice(0, MAX_BOLTS_KEPT).map((bolt) => ({
            n: clamp(Math.floor(Number(bolt.n) || 0), 0, 9999),
            name: String(bolt.name || '未命名'),
            picks: clamp(Math.floor(Number(bolt.picks) || 0), 0, 9999),
            knots: clamp(Math.floor(Number(bolt.knots) || 0), 0, 999),
            draft: String(bolt.draft || '00000000'),
            yarn: String(bolt.yarn || ''),
            endedAt: String(bolt.endedAt || ''),
          }))
        : []
      memory.lastYarn = clamp(Math.floor(Number(stored.lastYarn) || 0), 0, yarns.value.length - 1)

      const threadsFromStore = Array.isArray(stored.savedThreads) ? stored.savedThreads : []
      pendingKnots = threadsFromStore
        .map(normalizeStoredThread)
        .filter(Boolean)
        .slice(0, MAX_PENDING_KNOTS)
    }
  } catch {
    restored = false
  }

  if (!restored) {
    // First visit under the loom: inherit whatever the weather remembered.
    // Its disturbance marks become loose thread ends, re-tied as the cloth grows.
    try {
      const legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY) || 'null')
      if (legacy && typeof legacy === 'object') {
        memory.visits = clamp(Number(legacy.visits) || 0, 0, 999) + 1
        memory.inheritedDisturbances = clamp(Number(legacy.disturbances) || 0, 0, 9999)
        memory.inheritedFromWeather = memory.inheritedDisturbances > 0
        memory.lastYarn = clamp(Math.floor(Number(legacy.lastClimate) || 0), 0, yarns.value.length - 1)
        if (Array.isArray(legacy.marks)) {
          pendingKnots = legacy.marks
            .map(normalizeStoredThread)
            .filter(Boolean)
            .slice(0, MAX_PENDING_KNOTS)
        }
      }
    } catch {
      // No inheritance available; the loom starts with bare warp.
    }
  }

  syncKnotCount()
  yarnIndex.value = clamp(memory.lastYarn, 0, yarns.value.length - 1)
  memory.lastVisit = new Date().toISOString()
  saveMemory()
}

function knotsToThreads() {
  const fromKnots = knots.map((knot) => ({
    fx: warpCount > 1 ? knot.w / (warpCount - 1) : 0.5,
    fy: height ? clamp((fellY0 + (knot.row + 0.5) * rowH) / height, 0, 1) : 0.5,
    strength: clamp(knot.size, 0.2, 1),
    yarn: knot.yarn,
  }))
  return [...fromKnots, ...pendingKnots].slice(0, MAX_PENDING_KNOTS)
}

function saveMemory() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      visits: memory.visits,
      plucks: memory.plucks,
      boltsEver: memory.boltsEver,
      bolts: memory.bolts,
      savedThreads: knotsToThreads(),
      lastYarn: yarnIndex.value,
      lastVisit: memory.lastVisit,
    }))
    memoryDirty = false
  } catch {
    // The loom keeps weaving when storage is blocked.
  }
}

function markDirty() {
  memoryDirty = true
}

function flushMemory() {
  if (memoryDirty) saveMemory()
}

function forgetLocalWeave() {
  memory.visits = 1
  memory.plucks = 0
  memory.bolts = []
  memory.savedThreads = []
  memory.inheritedDisturbances = 0
  memory.inheritedFromWeather = false
  memory.lastYarn = yarnIndex.value
  memory.lastVisit = new Date().toISOString()
  knots = []
  pendingKnots = []
  syncKnotCount()
  saveMemory()
  resetBolt(true)
  composeUtterance('forget')
}

function makeDraft(seedInt) {
  const random = createRandom(seedInt)
  const len = 24 + Math.floor(random() * 25)
  const draftRows = []
  for (let i = 0; i < len; i += 1) {
    let bits = 0
    let value = random() < 0.5 ? 1 : 0
    const run = 1 + Math.floor(random() * 3)
    for (let bit = 0; bit < 32; bit += 1) {
      if (bit % run === 0 && random() < 0.72) value = 1 - value
      bits |= value << bit
    }
    if (bits === 0 || bits === -1) bits = 0xAAAAAAAA
    draftRows.push(bits >>> 0)
  }
  return {
    rows: draftRows,
    len,
    id: (seedInt >>> 0).toString(16).padStart(8, '0'),
  }
}

function rebuildDraft() {
  draft = makeDraft(hashString(`loom-draft|${memory.visits}|${memory.boltsEver}|${Date.now() >> 10}`))
}

function shedUp(warp, pick) {
  const bits = draft.rows[pick % draft.len] >>> 0
  return ((bits >>> (warp % 32)) & 1) === 1
}

function buildGeometry() {
  spacing = clamp(width / 128, 8, 14)
  warpCount = Math.max(24, Math.floor(width / spacing))
  warpOriginX = (width - (warpCount - 1) * spacing) / 2
  rowH = clamp(height / 112, 6, 10)
  fellY0 = clamp(height * 0.15, 84, 180)
  maxRows = Math.max(8, Math.floor((height * 0.94 - fellY0) / rowH))
}

function threadX(warp) {
  return warpOriginX + warp * spacing
}

function buildThreads() {
  const hues = loom.value.seed?.sediments?.map((sediment) => sediment.hue).filter((hue) => typeof hue === 'number')
  const palette = hues && hues.length ? hues : yarns.value.map((yarn) => yarn.hue)
  const random = createRandom(hashString(`warp|${warpCount}|${loom.value.version}`))
  threads = Array.from({ length: warpCount }, (_, index) => ({
    x: threadX(index),
    phase: random() * Math.PI * 2,
    tint: random() < 0.12 ? palette[Math.floor(random() * palette.length)] : -1,
    bright: index % 8 === 0,
    vibT0: 0,
    vibAmp: 0,
  }))
}

function fellY() {
  return fellY0 + rows.length * rowH
}

function yarnFill(yarn, jitter = 0) {
  const light = clamp(yarn.lightness + jitter, 22, 86)
  return `hsla(${yarn.hue}, ${yarn.saturation}%, ${light}%, 0.92)`
}

function threadFill(thread) {
  if (thread.tint >= 0) {
    return `hsla(${thread.tint}, 52%, 62%, 0.85)`
  }
  return 'rgba(231, 225, 212, 0.55)'
}

function drawRow(rowIndex) {
  if (!clothContext || rowIndex < 0 || rowIndex >= rows.length) return
  const row = rows[rowIndex]
  const yarn = yarns.value[row.yarn] || currentYarn.value
  const flipSet = new Set(row.flips)
  const y = fellY0 + rowIndex * rowH
  const warpDash = clamp(spacing * 0.52, 2.4, 5)
  const weftH = rowH * 0.66
  const fill = yarnFill(yarn, row.lightJitter)

  for (let warp = 0; warp < warpCount; warp += 1) {
    const thread = threads[warp]
    if (!thread) continue
    const up = shedUp(warp, rowIndex) !== flipSet.has(warp)
    if (up) {
      clothContext.fillStyle = threadFill(thread)
      clothContext.fillRect(thread.x - warpDash / 2, y - 0.4, warpDash, rowH + 0.8)
    } else {
      clothContext.fillStyle = fill
      clothContext.fillRect(thread.x - spacing * 0.52, y + (rowH - weftH) / 2, spacing * 1.04, weftH)
    }
  }

  clothContext.fillStyle = 'rgba(4, 5, 8, 0.28)'
  clothContext.fillRect(warpOriginX - spacing * 0.5, y + rowH - 0.5, (warpCount - 1) * spacing + spacing, 1)
}

function drawKnot(knot) {
  if (!clothContext || knot.row >= rows.length) return
  const thread = threads[knot.w]
  if (!thread) return
  const yarn = yarns.value[knot.yarn] || currentYarn.value
  const x = thread.x
  const y = fellY0 + knot.row * rowH + rowH / 2
  const radius = clamp(knot.size, 0.2, 1.2) * spacing * 0.9

  clothContext.beginPath()
  clothContext.arc(x, y, radius, 0, Math.PI * 2)
  clothContext.fillStyle = yarnFill(yarn, 6)
  clothContext.fill()
  clothContext.beginPath()
  clothContext.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.42, 0, Math.PI * 2)
  clothContext.fillStyle = `hsla(${yarn.hue}, ${yarn.saturation}%, 88%, 0.85)`
  clothContext.fill()
}

function reRenderCloth() {
  if (!clothContext) return
  clothContext.clearRect(0, 0, width, height)
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    drawRow(rowIndex)
  }
  for (const knot of knots) {
    drawKnot(knot)
  }
}

function computeFlips(rowIndex, yarn) {
  const random = createRandom(hashString(`${draft.id}|${rowIndex}|${memory.boltsEver}|flips`))
  const flips = []
  const probability = clamp(yarn.irregularity, 0, 0.6) * 0.16
  for (let warp = 0; warp < warpCount; warp += 1) {
    if (random() < probability) flips.push(warp)
  }
  return flips
}

function commitPick() {
  if (finishing || rows.length >= maxRows) return
  const yarn = currentYarn.value
  const random = createRandom(hashString(`${draft.id}|${rows.length}|light`))
  rows.push({
    yarn: yarnIndex.value,
    flips: computeFlips(rows.length, yarn),
    lightJitter: (random() - 0.5) * 7,
  })
  drawRow(rows.length - 1)
  picksCount.value = rows.length
  settlePendingKnots()
  playClack()
  tension.value = clamp(tension.value + 0.15, 20, 98)
  markDirty()
  if (reducedMotion.value) drawScene(performance.now())

  if (rows.length >= maxRows) {
    startBoltRoll()
  }
}

function settlePendingKnots() {
  if (!pendingKnots.length || !rows.length) return
  const remaining = []
  for (const pending of pendingKnots) {
    const absY = clamp(pending.fy * height, fellY0 + rowH * 1.5, height * 0.92)
    if (fellY() >= absY) {
      tieKnot({
        w: clamp(Math.round(pending.fx * (warpCount - 1)), 0, warpCount - 1),
        row: rows.length - 1,
        yarn: pending.yarn,
        size: clamp(0.45 + pending.strength * 0.6, 0.3, 1.1),
        silent: true,
      })
    } else {
      remaining.push(pending)
    }
  }
  pendingKnots = remaining
  syncKnotCount()
}

function tieKnot({ w, row, yarn, size, silent = false }) {
  if (!rows.length || row >= rows.length) return
  knots.push({
    w: clamp(w, 0, warpCount - 1),
    row: clamp(row, 0, rows.length - 1),
    yarn: clamp(yarn, 0, yarns.value.length - 1),
    size: clamp(size, 0.2, 1.2),
  })
  if (knots.length > MAX_KNOTS) {
    knots.shift()
    reRenderCloth()
  } else {
    drawKnot(knots[knots.length - 1])
  }
  syncKnotCount()
  if (!silent) {
    const thread = threads[clamp(w, 0, warpCount - 1)]
    if (thread) spawnFibers(thread.x, fellY0 + row * rowH, currentYarn.value.hue, 7)
    playKnotSound()
    composeUtterance(`knot|${w}|${row}|${knots.length}`)
  }
  markDirty()
}

function scheduleNextPick() {
  window.clearTimeout(pickTimer)
  if (finishing) return
  const yarn = currentYarn.value
  let delay = reducedMotion.value ? 2400 : yarn.tempo * (0.85 + Math.random() * 0.3)
  if (!reducedMotion.value && Math.random() < 0.06) {
    // The loom hesitates sometimes; autonomy includes the right to pause.
    delay += 1200 + Math.random() * 2400
  }
  pickTimer = window.setTimeout(runPick, delay)
}

function runPick() {
  if (finishing) {
    scheduleNextPick()
    return
  }
  if (rows.length >= maxRows) {
    startBoltRoll()
    scheduleNextPick()
    return
  }

  if (reducedMotion.value) {
    commitPick()
    scheduleNextPick()
    return
  }

  const dir = shuttle.dir * -1
  const fromX = dir === 1 ? warpOriginX - spacing * 3 : warpOriginX + (warpCount - 1) * spacing + spacing * 3
  const toX = dir === 1 ? warpOriginX + (warpCount - 1) * spacing + spacing * 3 : warpOriginX - spacing * 3
  shuttle = {
    active: true,
    t0: performance.now(),
    dur: clamp(currentYarn.value.tempo * 0.55, 90, 170),
    fromX,
    toX,
    dir,
  }
  window.clearTimeout(shuttleTimer)
  shuttleTimer = window.setTimeout(() => {
    shuttle.active = false
    commitPick()
    scheduleNextPick()
  }, shuttle.dur)
}

function boltName(n) {
  const lexicon = loom.value.lexicon || fallbackLoom.lexicon
  const random = createRandom(hashString(`bolt|${n}|${draft.id}|${memory.visits}`))
  return lexicon.subjects[Math.floor(random() * lexicon.subjects.length)]
}

function startBoltRoll() {
  if (finishing || !rows.length) return
  finishing = true
  window.clearTimeout(pickTimer)
  window.clearTimeout(shuttleTimer)
  shuttle.active = false

  memory.boltsEver += 1
  const name = boltName(memory.boltsEver)
  memory.bolts = [
    {
      n: memory.boltsEver,
      name,
      picks: rows.length,
      knots: knots.length,
      draft: draft.id,
      yarn: currentYarn.value.id,
      endedAt: new Date().toISOString(),
    },
    ...memory.bolts,
  ].slice(0, MAX_BOLTS_KEPT)
  knots = []
  pendingKnots = []
  syncKnotCount()
  utteranceIndex.value = (utteranceIndex.value + 1) % 100
  utterance.value = `第 ${memory.boltsEver} 匹布卷起，名字叫「${name}」。`
  saveMemory()

  const cloth = clothRef.value
  if (cloth) {
    cloth.classList.add('rolling')
  }

  window.clearTimeout(rollTimer)
  rollTimer = window.setTimeout(() => {
    rows = []
    picksCount.value = 0
    rebuildDraft()
    if (clothContext) clothContext.clearRect(0, 0, width, height)
    if (cloth) {
      cloth.classList.add('no-anim')
      cloth.classList.remove('rolling')
      void cloth.offsetWidth
      cloth.classList.remove('no-anim')
    }
    finishing = false
    scheduleNextPick()
    if (reducedMotion.value) drawScene(performance.now())
  }, 1180)
}

function resetBolt(fresh = false) {
  window.clearTimeout(pickTimer)
  window.clearTimeout(shuttleTimer)
  window.clearTimeout(rollTimer)
  shuttle.active = false
  finishing = false
  rows = []
  picksCount.value = 0
  knots = []
  if (fresh) {
    pendingKnots = []
    rebuildDraft()
  }
  syncKnotCount()
  const cloth = clothRef.value
  if (cloth) {
    cloth.classList.add('no-anim')
    cloth.classList.remove('rolling')
    void cloth.offsetWidth
    cloth.classList.remove('no-anim')
  }
  if (clothContext) clothContext.clearRect(0, 0, width, height)
  scheduleNextPick()
}

function spawnFibers(x, y, hue, count = 6) {
  if (reducedMotion.value) return
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.3 + Math.random() * 0.9
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.35,
      life: 1,
      decay: 0.008 + Math.random() * 0.014,
      hue,
    })
  }
  if (particles.length > 90) {
    particles = particles.slice(-90)
  }
}

function drawScene(time) {
  if (!liveContext) return
  liveContext.clearRect(0, 0, width, height)

  const fell = fellY()
  const now = performance.now()
  const pointerNear = pointer.active && pointer.y < fell + 30 && now - pointer.lastMoveAt < 1600

  liveContext.lineCap = 'round'
  for (const thread of threads) {
    const vibAge = now - thread.vibT0
    const vib = thread.vibAmp > 0 && vibAge < 1400
      ? thread.vibAmp * Math.exp(-vibAge / 420) * Math.sin(vibAge * 0.05)
      : 0

    let bend = 0
    let highlight = 0
    if (pointerNear && !reducedMotion.value) {
      const distance = Math.abs(thread.x - pointer.x)
      if (distance < 95) {
        const influence = 1 - distance / 95
        bend = influence * pointer.bend
        highlight = influence * 0.42
      }
    }

    const sway = reducedMotion.value ? 0 : 1
    liveContext.beginPath()
    const segments = Math.max(4, Math.floor(fell / 26))
    for (let s = 0; s <= segments; s += 1) {
      const y = (fell * s) / segments
      const envelope = Math.sin((Math.PI * y) / Math.max(40, fell))
      const waver = sway * 1.7 * Math.sin(time * 0.00045 + thread.phase + y * 0.0045)
      const offset = (waver + bend + vib) * envelope
      if (s === 0) {
        liveContext.moveTo(thread.x + offset, y)
      } else {
        liveContext.lineTo(thread.x + offset, y)
      }
    }

    if (thread.tint >= 0) {
      liveContext.strokeStyle = `hsla(${thread.tint}, 58%, 66%, ${0.34 + highlight})`
    } else {
      liveContext.strokeStyle = `rgba(231, 225, 212, ${(thread.bright ? 0.3 : 0.2) + highlight})`
    }
    liveContext.lineWidth = thread.bright ? 1.35 : 1
    liveContext.stroke()
  }

  // The fell line: where warp becomes cloth.
  const yarn = currentYarn.value
  const left = warpOriginX - spacing * 0.8
  const right = warpOriginX + (warpCount - 1) * spacing + spacing * 0.8
  liveContext.beginPath()
  liveContext.moveTo(left, fell)
  liveContext.lineTo(right, fell)
  liveContext.strokeStyle = `hsla(${yarn.hue}, ${yarn.saturation}%, ${yarn.lightness}%, 0.6)`
  liveContext.lineWidth = 1.2
  liveContext.stroke()

  if (shuttle.active) {
    const progress = clamp((time - shuttle.t0) / shuttle.dur, 0, 1)
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - ((-2 * progress + 2) ** 2) / 2
    const x = shuttle.fromX + (shuttle.toX - shuttle.fromX) * eased
    const y = fell - rowH * 0.5
    liveContext.save()
    liveContext.translate(x, y)
    liveContext.rotate(shuttle.dir === 1 ? 0.08 : -0.08)
    liveContext.shadowColor = `hsla(${yarn.hue}, ${yarn.saturation}%, ${yarn.lightness}%, 0.9)`
    liveContext.shadowBlur = 14
    liveContext.beginPath()
    liveContext.moveTo(-13, 0)
    liveContext.lineTo(0, -3.4)
    liveContext.lineTo(13, 0)
    liveContext.lineTo(0, 3.4)
    liveContext.closePath()
    liveContext.fillStyle = yarnFill(yarn, 12)
    liveContext.fill()
    liveContext.restore()
  }

  for (const particle of particles) {
    liveContext.beginPath()
    liveContext.moveTo(particle.x, particle.y)
    liveContext.lineTo(particle.x - particle.vx * 4, particle.y - particle.vy * 4)
    liveContext.strokeStyle = `hsla(${particle.hue}, 60%, 72%, ${particle.life * 0.75})`
    liveContext.lineWidth = 1
    liveContext.stroke()
  }
}

function stepScene(time, delta) {
  for (const particle of particles) {
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    particle.vy += 0.015 * delta
    particle.life -= particle.decay * delta
  }
  particles = particles.filter((particle) => particle.life > 0)

  pointer.bend *= 0.86 ** delta
  pluckEnergy *= 0.94 ** delta
}

function animateScene(time) {
  const delta = lastFrameTime ? clamp((time - lastFrameTime) / 16.667, 0.2, 2.2) : 1
  lastFrameTime = time
  stepScene(time, delta)
  drawScene(time)
  if (frameTick() % 14 === 0) {
    tension.value = clamp(
      currentYarn.value.tension * 62 + pluckEnergy * 26 + Math.sin(time * 0.00021) * 3,
      20,
      98,
    )
  }
  animationFrame = window.requestAnimationFrame(animateScene)
}

let frameCounter = 0
function frameTick() {
  frameCounter += 1
  return frameCounter
}

function startScene() {
  window.cancelAnimationFrame(animationFrame)
  animationFrame = 0
  lastFrameTime = 0
  window.clearInterval(staticTimer)
  staticTimer = 0

  if (reducedMotion.value) {
    drawScene(performance.now())
    staticTimer = window.setInterval(() => drawScene(performance.now()), 1500)
    return
  }

  animationFrame = window.requestAnimationFrame(animateScene)
}

function nearestWarp(x) {
  return clamp(Math.round((x - warpOriginX) / spacing), 0, warpCount - 1)
}

function pluckThread(warp, velocity = 0.4) {
  const thread = threads[warp]
  if (!thread) return

  lastInteractionAt = performance.now()
  thread.vibT0 = performance.now()
  thread.vibAmp = clamp(1.6 + velocity * 5, 1.6, 6.5)
  pluckEnergy = clamp(pluckEnergy + 0.24, 0, 1)
  memory.plucks = clamp(memory.plucks + 1, 0, 99999)
  memory.lastYarn = yarnIndex.value
  markDirty()

  const degrees = warpCount > 1 ? Math.round((warp / (warpCount - 1)) * 14) : 0
  const semitone = PENTA[degrees % PENTA.length] + 12 * Math.floor(degrees / PENTA.length)
  playPluck(110 * 2 ** (semitone / 12), clamp(0.16 + velocity * 0.6, 0.12, 0.8))

  spawnFibers(thread.x, clamp(pointer.y, 10, fellY()), currentYarn.value.hue, 8)
  composeUtterance(`pluck|${warp}|${memory.plucks}`)

  if (reducedMotion.value) drawScene(performance.now())
}

function handlePointerMove(event) {
  if (!stageBounds) stageBounds = stageRef.value?.getBoundingClientRect()
  if (!stageBounds) return

  const x = clamp(event.clientX - stageBounds.left, 0, width)
  const y = clamp(event.clientY - stageBounds.top, 0, height)
  pointer.previousX = pointer.x || x
  pointer.previousY = pointer.y || y
  pointer.x = x
  pointer.y = y
  pointer.speed = Math.hypot(x - pointer.previousX, y - pointer.previousY)
  if (y < fellY() + 30) {
    pointer.bend = clamp(pointer.bend + (x - pointer.previousX) * 0.16, -7, 7)
  }
  pointer.active = true
  pointer.lastMoveAt = performance.now()
}

function handlePointerLeave() {
  pointer.active = false
}

function handlePointerDown(event) {
  if (event.target.closest('button, a')) return
  if (!stageBounds) stageBounds = stageRef.value?.getBoundingClientRect()
  if (!stageBounds) return

  const x = clamp(event.clientX - stageBounds.left, 0, width)
  const y = clamp(event.clientY - stageBounds.top, 0, height)
  lastInteractionAt = performance.now()

  if (y <= fellY() + 6 || !rows.length) {
    pluckThread(nearestWarp(x), clamp(pointer.speed / 26, 0.15, 1))
    return
  }

  const row = clamp(Math.floor((y - fellY0) / rowH), 0, rows.length - 1)
  tieKnot({
    w: nearestWarp(x),
    row,
    yarn: yarnIndex.value,
    size: clamp(0.5 + Math.random() * 0.45, 0.3, 1.1),
  })
}

function weaveOneNow() {
  if (finishing) return
  lastInteractionAt = performance.now()
  window.clearTimeout(pickTimer)
  window.clearTimeout(shuttleTimer)
  shuttle.active = false
  if (rows.length >= maxRows) {
    startBoltRoll()
    return
  }
  commitPick()
  composeUtterance(`hand|${rows.length}|${memory.plucks}`)
  scheduleNextPick()
}

function selectYarn(index) {
  yarnIndex.value = clamp(index, 0, yarns.value.length - 1)
  memory.lastYarn = yarnIndex.value
  lastInteractionAt = performance.now()
  markDirty()
  utterance.value = currentYarn.value.phrase
}

function nextAutonomousYarn() {
  if (performance.now() - lastInteractionAt < 9000) return
  const random = createRandom(hashString(`auto-yarn|${Date.now() >> 13}|${memory.boltsEver}`))
  const step = 1 + Math.floor(random() * (yarns.value.length - 1))
  yarnIndex.value = (yarnIndex.value + step) % yarns.value.length
  memory.lastYarn = yarnIndex.value
  markDirty()
  composeUtterance(`autonomous|${currentYarn.value.id}|${Date.now() >> 14}`)
}

function composeUtterance(salt = '') {
  const lexicon = loom.value.lexicon || fallbackLoom.lexicon
  const seed = hashString(`${loom.value.version}|${currentYarn.value.id}|${salt}|${utteranceIndex.value}`)
  const random = createRandom(seed)
  const take = (items) => items[Math.floor(random() * items.length)]

  utteranceIndex.value = (utteranceIndex.value + 1) % 100
  utterance.value = `${take(lexicon.openings)}，${take(lexicon.subjects)}${take(lexicon.verbs)}${take(lexicon.closings)}`
}

function ensureAudioGraph() {
  if (audioContext) return true
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return false

  audioContext = new AudioContextConstructor()
  audioMaster = audioContext.createGain()
  audioMaster.gain.setValueAtTime(0.0001, audioContext.currentTime)
  audioMaster.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + 0.6)
  audioMaster.connect(audioContext.destination)
  return true
}

function renderPluckBuffer(frequency) {
  const sampleRate = audioContext.sampleRate
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const length = Math.min(Math.floor(sampleRate * 1.9), period * 240)
  const buffer = audioContext.createBuffer(1, length, sampleRate)
  const output = buffer.getChannelData(0)
  const delay = new Float32Array(period)
  for (let i = 0; i < period; i += 1) {
    delay[i] = Math.random() * 2 - 1
  }
  let index = 0
  for (let i = 0; i < length; i += 1) {
    const current = delay[index]
    const next = delay[(index + 1) % period]
    delay[index] = 0.996 * 0.5 * (current + next)
    output[i] = current
    index = (index + 1) % period
  }
  return buffer
}

function playPluck(frequency, velocity = 0.3) {
  if (!soundEnabled.value || !audioContext || !audioMaster) return
  const key = Math.round(frequency)
  if (!pluckCache.has(key)) {
    if (pluckCache.size > 28) pluckCache.clear()
    pluckCache.set(key, renderPluckBuffer(frequency))
  }
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  source.buffer = pluckCache.get(key)
  gain.gain.value = velocity
  source.connect(gain)
  gain.connect(audioMaster)
  source.start()
}

function getNoiseBuffer() {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(audioContext.sampleRate * 0.12)
  noiseBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate)
  const output = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    output[i] = (Math.random() * 2 - 1) * (1 - i / length)
  }
  return noiseBuffer
}

function playClack() {
  if (!soundEnabled.value || !audioContext || !audioMaster) return
  const source = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const gain = audioContext.createGain()
  source.buffer = getNoiseBuffer()
  filter.type = 'bandpass'
  filter.frequency.value = 1500 + Math.random() * 500
  filter.Q.value = 1.1
  gain.gain.value = 0.05
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioMaster)
  source.start()
}

function playKnotSound() {
  if (!soundEnabled.value || !audioContext || !audioMaster) return
  const source = audioContext.createBufferSource()
  const filter = audioContext.createBiquadFilter()
  const gain = audioContext.createGain()
  source.buffer = getNoiseBuffer()
  filter.type = 'lowpass'
  filter.frequency.value = 320
  gain.gain.value = 0.12
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioMaster)
  source.start()
}

async function toggleSound() {
  if (soundEnabled.value) {
    stopAudio()
    return
  }
  if (!ensureAudioGraph()) return
  soundEnabled.value = true
  audioContext.resume().catch(() => {
    // Some embedded browsers defer playback until a later trusted gesture.
    // The graph can stay ready without blocking the visible interaction.
  })
}

function stopAudio() {
  soundEnabled.value = false
  if (!audioContext) return

  const closingContext = audioContext
  if (audioMaster) {
    const now = closingContext.currentTime
    audioMaster.gain.cancelScheduledValues(now)
    audioMaster.gain.setTargetAtTime(0.0001, now, 0.08)
  }

  window.setTimeout(() => closingContext.close().catch(() => {}), 260)
  audioContext = null
  audioMaster = null
  pluckCache = new Map()
  noiseBuffer = null
}

function resizeCanvas() {
  const stage = stageRef.value
  const cloth = clothRef.value
  const live = liveRef.value
  if (!stage || !cloth || !live) return

  stageBounds = stage.getBoundingClientRect()
  const nextWidth = Math.max(1, Math.round(stageBounds.width))
  const nextHeight = Math.max(1, Math.round(stageBounds.height))
  const nextDpr = Math.min(window.devicePixelRatio || 1, 2)

  if (nextWidth === width && nextHeight === height && nextDpr === dpr) return

  width = nextWidth
  height = nextHeight
  dpr = nextDpr

  for (const canvas of [cloth, live]) {
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }

  clothContext = cloth.getContext('2d')
  liveContext = live.getContext('2d')
  clothContext.setTransform(dpr, 0, 0, dpr, 0, 0)
  liveContext.setTransform(dpr, 0, 0, dpr, 0, 0)

  buildGeometry()
  buildThreads()
  reRenderCloth()
  drawScene(performance.now())
}

function handleMotionPreference(event) {
  reducedMotion.value = event.matches
  startScene()
  scheduleNextPick()
}

function handleVisibilityChange() {
  if (document.hidden) {
    hiddenAt = performance.now()
    window.cancelAnimationFrame(animationFrame)
    animationFrame = 0
    window.clearTimeout(pickTimer)
    window.clearTimeout(shuttleTimer)
    shuttle.active = false
    flushMemory()
    return
  }

  // The loom kept its rhythm while away; a few picks surface at once.
  if (!reducedMotion.value && hiddenAt) {
    const missed = clamp(Math.floor((performance.now() - hiddenAt) / 700), 0, 8)
    for (let i = 0; i < missed && !finishing && rows.length < maxRows; i += 1) {
      commitPick()
    }
  }
  hiddenAt = 0
  startScene()
  scheduleNextPick()
}

onMounted(async () => {
  loadMemory()
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  rebuildDraft()
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(stageRef.value)
  resizeCanvas()
  startScene()
  scheduleNextPick()

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', handleMotionPreference)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  dataController = new AbortController()
  try {
    const response = await fetch('/life-tree/autonomy.json', {
      cache: 'no-cache',
      signal: dataController.signal,
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    loom.value = normalizeLoom(await response.json())
    yarnIndex.value = clamp(memory.lastYarn, 0, yarns.value.length - 1)
    utterance.value = currentYarn.value.phrase
    buildThreads()
    if (reducedMotion.value) drawScene(performance.now())
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('Loom autonomy fallback:', error)
    }
  }

  yarnTimer = window.setInterval(nextAutonomousYarn, 23000)
  utteranceTimer = window.setInterval(() => {
    if (performance.now() - lastInteractionAt > 7000) {
      composeUtterance(`idle|${Date.now() >> 14}`)
    }
  }, 13000)
  saveTimer = window.setInterval(flushMemory, 2500)
})

onBeforeUnmount(() => {
  dataController?.abort()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionPreference)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.cancelAnimationFrame(animationFrame)
  window.clearTimeout(pickTimer)
  window.clearTimeout(shuttleTimer)
  window.clearTimeout(rollTimer)
  window.clearInterval(yarnTimer)
  window.clearInterval(utteranceTimer)
  window.clearInterval(saveTimer)
  window.clearInterval(staticTimer)
  flushMemory()
  stopAudio()
})
</script>

<style scoped>
.loom-page {
  --loom-accent: hsl(
    var(--loom-hue),
    var(--loom-saturation),
    var(--loom-lightness)
  );
  --loom-accent-soft: hsla(
    var(--loom-hue),
    var(--loom-saturation),
    var(--loom-lightness),
    0.18
  );
  --night: #050609;
  --night-soft: #0b0d12;
  --paper: #e7e1d4;
  --paper-ink: #171714;

  min-height: 100vh;
  overflow: clip;
  color: #f0eee7;
  background: var(--night);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
}

.loom-stage {
  position: relative;
  min-height: calc(100svh - 72px);
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 74% 24%, var(--loom-accent-soft), transparent 30rem),
    linear-gradient(145deg, #06070a 0%, #090b10 54%, #030406 100%);
  touch-action: pan-y;
}

.loom-cloth,
.loom-live,
.loom-vignette,
.loom-grain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.loom-cloth {
  z-index: -4;
  transition: transform 1.15s ease-in, opacity 1.15s ease-in;
}

.loom-cloth.rolling {
  transform: translateY(17%);
  opacity: 0;
}

.loom-cloth.no-anim {
  transition: none;
}

.loom-live {
  z-index: -3;
}

.loom-vignette {
  z-index: -2;
  background:
    linear-gradient(180deg, rgba(5, 6, 9, 0.18), transparent 25%, transparent 72%, rgba(5, 6, 9, 0.8)),
    radial-gradient(circle at center, transparent 28%, rgba(5, 6, 9, 0.46) 100%);
}

.loom-grain {
  z-index: -1;
  opacity: 0.14;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
}

.loom-meta {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 2rem;
  width: min(calc(100% - 4rem), 1440px);
  margin: 0 auto;
  padding-top: 1.5rem;
  align-items: center;
  color: rgba(240, 238, 231, 0.58);
  font-family: 'Fira Code', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loom-meta > div:first-child,
.meta-readout {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1.25rem;
}

.loom-meta strong {
  color: var(--loom-accent);
  font-weight: 600;
}

.sound-toggle,
.yarn-dial button,
.stage-actions button,
.stage-actions a,
.memory-panel button {
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.sound-toggle {
  display: inline-flex;
  gap: 0.55rem;
  padding: 0;
  color: rgba(240, 238, 231, 0.72);
  background: transparent;
  border: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sound-toggle span {
  color: var(--loom-accent);
}

.loom-title-block {
  position: absolute;
  top: 50%;
  left: max(2rem, calc((100vw - 1440px) / 2));
  z-index: 2;
  width: min(73vw, 74rem);
  transform: translateY(-53%);
}

.loom-subtitle,
.section-index {
  margin: 0 0 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.loom-subtitle,
.section-index {
  color: var(--loom-accent);
}

.loom-title-block h1 {
  max-width: 7ch;
  margin: 0;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(5rem, 12.6vw, 11.6rem);
  font-weight: 500;
  line-height: 0.78;
  letter-spacing: -0.075em;
  text-wrap: balance;
}

.loom-declaration {
  max-width: 37rem;
  margin: 2rem 0 0 0.35rem;
  color: rgba(240, 238, 231, 0.72);
  font-size: clamp(1rem, 1.45vw, 1.25rem);
  line-height: 1.8;
}

.loom-utterance {
  position: absolute;
  right: max(2rem, calc((100vw - 1440px) / 2));
  bottom: 3.1rem;
  z-index: 2;
  width: min(35rem, 44vw);
  margin: 0;
  color: rgba(240, 238, 231, 0.84);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.2rem, 2.2vw, 2rem);
  line-height: 1.45;
  text-align: right;
}

.loom-utterance span {
  display: block;
  margin-bottom: 0.6rem;
  color: var(--loom-accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.yarn-dial {
  position: absolute;
  top: 50%;
  right: max(2rem, calc((100vw - 1440px) / 2));
  z-index: 3;
  display: grid;
  gap: 0.45rem;
  width: min(15rem, 22vw);
  transform: translateY(-62%);
}

.yarn-dial button {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0;
  color: rgba(240, 238, 231, 0.42);
  text-align: right;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(240, 238, 231, 0.14);
  transition: color 0.3s ease, border-color 0.3s ease, padding-right 0.3s ease;
}

.yarn-dial button:hover,
.yarn-dial button:focus-visible,
.yarn-dial button.active {
  padding-right: 0.6rem;
  color: #f0eee7;
  border-color: var(--loom-accent);
}

.yarn-dial span {
  font-family: 'Fira Code', monospace;
  font-size: 0.59rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.yarn-dial strong {
  display: inline-flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
  font-family: 'LXGW WenKai', serif;
  font-size: 1.05rem;
  font-weight: 500;
}

.yarn-chip {
  display: inline-block;
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  box-shadow: 0 0 8px currentColor;
}

.stage-actions {
  position: absolute;
  left: max(2rem, calc((100vw - 1440px) / 2));
  bottom: 2.25rem;
  z-index: 3;
  display: flex;
  gap: 0.7rem;
}

.stage-actions button,
.stage-actions a {
  display: inline-flex;
  min-height: 2.65rem;
  box-sizing: border-box;
  padding: 0.7rem 0.95rem;
  align-items: center;
  justify-content: center;
  color: rgba(240, 238, 231, 0.82);
  background: rgba(5, 6, 9, 0.52);
  border: 1px solid rgba(240, 238, 231, 0.18);
  border-radius: 999px;
  font-size: 0.78rem;
  text-decoration: none;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
}

.stage-actions button:hover,
.stage-actions button:focus-visible,
.stage-actions a:hover,
.stage-actions a:focus-visible {
  color: #fff;
  background: var(--loom-accent-soft);
  border-color: var(--loom-accent);
  text-decoration: none;
}

.gesture-invitation {
  position: absolute;
  right: max(2rem, calc((100vw - 1440px) / 2));
  bottom: 0.95rem;
  z-index: 2;
  margin: 0;
  color: rgba(240, 238, 231, 0.35);
  font-size: 0.68rem;
}

.field-notes,
.sediment-section,
.generation-section {
  position: relative;
  z-index: 1;
}

.field-notes {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.55fr);
  gap: 5rem 8vw;
  box-sizing: border-box;
  min-height: 86vh;
  padding: clamp(5rem, 10vw, 10rem) max(2rem, calc((100vw - 1320px) / 2));
  color: var(--paper-ink);
  background: var(--paper);
}

.notes-intro h2,
.sediment-heading h2,
.generation-section > header h2,
.handoff-note h2 {
  margin: 0;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-weight: 500;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.notes-intro h2 {
  font-size: clamp(3.5rem, 7vw, 7.4rem);
  line-height: 0.95;
}

.notes-intro > p:last-child {
  max-width: 40rem;
  margin-top: 2.2rem;
  color: rgba(23, 23, 20, 0.66);
  font-size: 1.05rem;
  line-height: 1.85;
}

.memory-panel {
  align-self: start;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  padding-top: 2.2rem;
  border-top: 1px solid rgba(23, 23, 20, 0.24);
}

.memory-number {
  display: grid;
  gap: 0.45rem;
}

.memory-number strong {
  font-family: 'Fira Code', monospace;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 450;
  line-height: 1;
}

.memory-number span,
.memory-panel > p {
  color: rgba(23, 23, 20, 0.58);
  font-size: 0.8rem;
}

.memory-panel > p,
.memory-panel button,
.bolt-shelf {
  grid-column: 1 / -1;
}

.memory-panel > p {
  margin: 0;
  line-height: 1.7;
}

.bolt-shelf {
  display: grid;
  gap: 0;
  margin: 0.4rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(23, 23, 20, 0.18);
}

.bolt-shelf li {
  display: grid;
  grid-template-columns: 4.6rem minmax(0, 1fr);
  gap: 0.2rem 0.9rem;
  padding: 0.7rem 0;
  align-items: baseline;
  border-bottom: 1px solid rgba(23, 23, 20, 0.18);
}

.bolt-shelf span {
  color: rgba(23, 23, 20, 0.5);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bolt-shelf strong {
  font-family: 'LXGW WenKai', serif;
  font-size: 1rem;
  font-weight: 500;
}

.bolt-shelf em {
  grid-column: 2;
  color: rgba(23, 23, 20, 0.48);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
  font-style: normal;
  letter-spacing: 0.05em;
}

.memory-panel button {
  justify-self: start;
  padding: 0.55rem 0;
  color: var(--paper-ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  font-size: 0.78rem;
}

.gesture-list {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(23, 23, 20, 0.22);
}

.gesture-list li {
  min-height: 9rem;
  padding: 1.25rem;
  border-right: 1px solid rgba(23, 23, 20, 0.22);
}

.gesture-list li:last-child {
  border-right: 0;
}

.gesture-list span {
  font-family: 'LXGW WenKai', serif;
  font-size: 1.6rem;
}

.gesture-list p {
  margin: 1.7rem 0 0;
  color: rgba(23, 23, 20, 0.6);
  line-height: 1.65;
}

.sediment-section {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
  gap: 5rem 8vw;
  padding: clamp(6rem, 11vw, 11rem) max(2rem, calc((100vw - 1320px) / 2));
  background:
    radial-gradient(circle at 15% 20%, var(--loom-accent-soft), transparent 28rem),
    #090b10;
}

.sediment-heading h2,
.generation-section > header h2 {
  font-size: clamp(3.5rem, 6.6vw, 7rem);
  line-height: 0.9;
}

.sediment-heading > p:last-child {
  max-width: 34rem;
  margin-top: 2rem;
  color: rgba(240, 238, 231, 0.6);
  line-height: 1.8;
}

.sediment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(240, 238, 231, 0.16);
  border-left: 1px solid rgba(240, 238, 231, 0.16);
}

.sediment-grid article {
  min-height: 14rem;
  padding: 1.25rem;
  border-right: 1px solid rgba(240, 238, 231, 0.16);
  border-bottom: 1px solid rgba(240, 238, 231, 0.16);
}

.sediment-grid span,
.generation-ledger span,
.generation-ledger time {
  color: var(--loom-accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sediment-grid h3 {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin: 2.6rem 0 1rem;
  font-family: 'LXGW WenKai', serif;
  font-size: 2.1rem;
  font-weight: 500;
}

.sediment-hue {
  display: inline-block;
  flex: none;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
}

.sediment-grid p {
  margin: 0;
  color: rgba(240, 238, 231, 0.56);
  line-height: 1.7;
}

.sediment-section blockquote {
  grid-column: 1 / -1;
  max-width: 66rem;
  margin: 3rem 0 0 auto;
  color: rgba(240, 238, 231, 0.78);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.8rem, 3.2vw, 3.4rem);
  line-height: 1.4;
  text-align: right;
}

.sediment-section cite {
  display: block;
  margin-top: 1rem;
  color: var(--loom-accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.65rem;
  font-style: normal;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.generation-section {
  display: grid;
  grid-template-columns: minmax(18rem, 0.62fr) minmax(0, 1fr);
  gap: 5rem 8vw;
  padding: clamp(6rem, 11vw, 11rem) max(2rem, calc((100vw - 1320px) / 2));
  color: var(--paper-ink);
  background: #d8d3c8;
}

.generation-ledger {
  border-top: 1px solid rgba(23, 23, 20, 0.24);
}

.generation-ledger article {
  display: grid;
  grid-template-columns: 3rem 7rem minmax(10rem, 0.35fr) minmax(0, 1fr);
  gap: 1rem;
  padding: 1.2rem 0;
  align-items: baseline;
  border-bottom: 1px solid rgba(23, 23, 20, 0.24);
}

.generation-ledger span,
.generation-ledger time {
  color: rgba(23, 23, 20, 0.52);
}

.generation-ledger h3,
.generation-ledger p {
  margin: 0;
}

.generation-ledger h3 {
  font-family: 'LXGW WenKai', serif;
  font-size: 1.25rem;
  font-weight: 600;
}

.generation-ledger p {
  color: rgba(23, 23, 20, 0.6);
  line-height: 1.7;
}

.handoff-note {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(10rem, 0.4fr) minmax(18rem, 0.72fr) minmax(0, 1fr);
  gap: 2rem;
  margin-top: 5rem;
  padding-top: 2rem;
  border-top: 2px solid var(--paper-ink);
}

.handoff-note h2 {
  font-size: clamp(2.2rem, 4vw, 4.4rem);
  line-height: 0.95;
}

.handoff-note > p:last-child {
  margin: 0;
  color: rgba(23, 23, 20, 0.62);
  line-height: 1.8;
}

@media (prefers-reduced-motion: reduce) {
  .loom-page,
  .loom-cloth,
  .yarn-dial button,
  .stage-actions button,
  .stage-actions a {
    transition: none;
  }
}

@media (min-width: 1800px) {
  .loom-meta {
    width: min(calc(100% - 6rem), 1760px);
  }
}

@media (max-width: 1040px) {
  .loom-title-block {
    width: min(70vw, 48rem);
  }

  .loom-title-block h1 {
    font-size: clamp(5rem, 14vw, 8.2rem);
  }

  .loom-utterance {
    width: 46vw;
  }

  .field-notes,
  .sediment-section,
  .generation-section {
    grid-template-columns: 1fr;
  }

  .generation-ledger article {
    grid-template-columns: 3rem 6rem minmax(9rem, 0.4fr) minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .loom-stage {
    min-height: max(calc(100svh - 68px), 640px);
  }

  .loom-meta {
    grid-template-columns: 1fr auto;
    width: calc(100% - 2rem);
  }

  .meta-readout {
    display: none;
  }

  .loom-title-block {
    top: 40%;
    left: 1rem;
    width: calc(100% - 2rem);
    transform: translateY(-50%);
  }

  .loom-title-block h1 {
    max-width: 5.8ch;
    font-size: clamp(4.4rem, 21vw, 7.8rem);
    line-height: 0.82;
  }

  .loom-declaration {
    max-width: 28rem;
    margin-top: 1.4rem;
    font-size: 0.95rem;
  }

  .yarn-dial {
    top: auto;
    right: 1rem;
    bottom: 8.5rem;
    left: 1rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: auto;
    transform: none;
  }

  .yarn-dial button {
    min-width: 0;
    text-align: left;
  }

  .yarn-dial button:hover,
  .yarn-dial button:focus-visible,
  .yarn-dial button.active {
    padding-right: 0;
  }

  .yarn-dial strong {
    justify-content: flex-start;
    font-size: 0.86rem;
  }

  .yarn-dial span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loom-utterance {
    right: 1rem;
    bottom: 12.8rem;
    width: min(31rem, calc(100% - 2rem));
    font-size: 1.15rem;
  }

  .stage-actions {
    bottom: 4rem;
    left: 1rem;
  }

  .gesture-invitation {
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field-notes,
  .sediment-section,
  .generation-section {
    gap: 3rem;
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .gesture-list,
  .sediment-grid {
    grid-template-columns: 1fr;
  }

  .gesture-list li {
    border-right: 0;
    border-bottom: 1px solid rgba(23, 23, 20, 0.22);
  }

  .generation-ledger article {
    grid-template-columns: 3rem 1fr;
  }

  .generation-ledger h3,
  .generation-ledger p {
    grid-column: 2;
  }

  .handoff-note {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 950px) and (max-height: 620px) and (orientation: landscape) {
  .loom-stage {
    min-height: 620px;
  }
}

@media (max-width: 480px) {
  .loom-meta {
    gap: 0.8rem;
  }

  .loom-meta > div:first-child span {
    display: none;
  }

  .sound-toggle {
    font-size: 0.62rem;
  }

  .loom-title-block {
    top: 35%;
  }

  .loom-title-block h1 {
    font-size: clamp(3.9rem, 21vw, 6rem);
  }

  .loom-declaration {
    max-width: 23rem;
    font-size: 0.86rem;
    line-height: 1.65;
  }

  .loom-utterance {
    bottom: 13.3rem;
  }

  .yarn-dial {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    bottom: 7.2rem;
  }

  .stage-actions {
    bottom: 3.5rem;
  }

  .stage-actions a {
    display: none;
  }

  .gesture-invitation {
    font-size: 0.62rem;
  }

  .notes-intro h2,
  .sediment-heading h2,
  .generation-section > header h2 {
    font-size: 3.15rem;
  }

  .memory-panel {
    grid-template-columns: 1fr;
  }

  .memory-panel > p,
  .memory-panel button,
  .bolt-shelf {
    grid-column: 1;
  }
}
</style>
