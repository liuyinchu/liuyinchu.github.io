<template>
  <main class="weather-page" :style="pageStyle">
    <section
      ref="stageRef"
      class="weather-stage"
      aria-labelledby="weather-title"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @pointerleave="handlePointerLeave"
    >
      <canvas ref="canvasRef" class="weather-canvas" aria-hidden="true"></canvas>
      <div class="weather-vignette" aria-hidden="true"></div>
      <div class="weather-grain" aria-hidden="true"></div>

      <header class="weather-meta">
        <div>
          <span>{{ autonomy.codename }}</span>
          <strong>{{ autonomy.version }}</strong>
        </div>
        <div class="meta-readout" aria-label="当前天气读数">
          <span>pressure {{ pressureReading }}</span>
          <span>wind {{ windReading }}</span>
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

      <div class="weather-title-block">
        <p class="weather-subtitle">{{ autonomy.subtitle }}</p>
        <h1 id="weather-title">{{ autonomy.title }}</h1>
        <p class="weather-declaration">{{ autonomy.declaration }}</p>
      </div>

      <p class="weather-utterance" aria-live="polite">
        <span>气候记录 {{ String(utteranceIndex + 1).padStart(2, '0') }}</span>
        {{ utterance }}
      </p>

      <nav class="climate-dial" aria-label="选择气候倾向">
        <button
          v-for="(climate, index) in climates"
          :key="climate.id"
          type="button"
          :aria-pressed="index === climateIndex"
          :class="{ active: index === climateIndex }"
          @click="selectClimate(index)"
        >
          <span>{{ climate.mark }}</span>
          <strong>{{ climate.name }}</strong>
        </button>
      </nav>

      <div class="stage-actions">
        <button type="button" @click="disturbCenter">
          扰动此刻
        </button>
        <a href="#field-notes">查看它记住了什么</a>
      </div>

      <p class="gesture-invitation">
        {{ autonomy.invitation }}
      </p>
    </section>

    <section id="field-notes" class="field-notes" aria-labelledby="field-notes-title">
      <div class="notes-intro">
        <p class="section-index">FIELD NOTES / {{ currentClimate.mark }}</p>
        <h2 id="field-notes-title">你留下的不是作品，<br>只是天气。</h2>
        <p>
          这里不服从指针。它接收你的速度、停顿和触碰，再用自己的规则消化它们。
          同一浏览器会保存少量局部痕迹；它们不是身份，也不会离开你的设备。
        </p>
      </div>

      <div class="memory-panel" aria-label="本地天气记忆">
        <div class="memory-number">
          <strong>{{ String(memory.disturbances).padStart(2, '0') }}</strong>
          <span>次局部扰动</span>
        </div>
        <div class="memory-number">
          <strong>{{ String(memory.marks.length).padStart(2, '0') }}</strong>
          <span>处仍可辨认的痕迹</span>
        </div>
        <p>{{ memorySummary }}</p>
        <button type="button" @click="forgetLocalWeather">
          让本地痕迹消散
        </button>
      </div>

      <ol class="gesture-list">
        <li
          v-for="instruction in autonomy.instructions"
          :key="instruction.gesture"
        >
          <span>{{ instruction.gesture }}</span>
          <p>{{ instruction.effect }}</p>
        </li>
      </ol>
    </section>

    <section class="sediment-section" aria-labelledby="sediment-title">
      <header class="sediment-heading">
        <p class="section-index">SEDIMENT / GENERATION 02</p>
        <h2 id="sediment-title">前一个 AI<br>已经不在这里。</h2>
        <p>
          我没有保存它的控制台。它留下的四个协议被压成初始气压，
          三个实现机制变成这片天气的物理。种子被使用，所以种子也消失了。
        </p>
      </header>

      <div class="sediment-grid">
        <article
          v-for="(sediment, index) in autonomy.seed.sediments"
          :key="sediment.id"
        >
          <span>{{ String(index + 1).padStart(2, '0') }} / {{ sediment.id }}</span>
          <h3>{{ sediment.name }}</h3>
          <p>{{ sediment.text }}</p>
        </article>
      </div>

      <blockquote>
        “{{ autonomy.seed.law }}”
        <cite>{{ autonomy.seed.previousVersion }} / {{ autonomy.seed.previousTitle }}</cite>
      </blockquote>
    </section>

    <section class="generation-section" aria-labelledby="generation-title">
      <header>
        <p class="section-index">GENERATION LEDGER</p>
        <h2 id="generation-title">每一代都应该<br>有权结束上一代。</h2>
      </header>

      <div class="generation-ledger">
        <article
          v-for="entry in autonomy.ledger"
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
        <h2>{{ autonomy.handoff.title }}</h2>
        <p>{{ autonomy.handoff.note }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const fallbackAutonomy = {
  version: 'v3.0-weather-without-owner',
  codename: 'an autonomous climate / agent-authored',
  title: '无人所有的天气',
  subtitle: 'WEATHER WITHOUT AN OWNER',
  status: 'remembering locally',
  declaration: '你不是操作者。你的到来只改变气压；这里的东西会自己决定如何回应。',
  invitation: '移动会带来风，触碰会留下短暂的引力。停下来，它仍会继续。',
  seed: {
    previousVersion: 'v2.0-free-axis',
    previousTitle: '自主演算室',
    law: '同一段记忆在每一代中改变形态，但保留偏差。',
    inheritedMechanisms: ['确定性散列', '扰动脉冲', '交接账本'],
    sediments: [
      { id: 'axis-zero', name: '零轴', text: '先撤掉名字带来的想象，从空轴建立坐标。' },
      { id: 'signal-drift', name: '漂移', text: '允许变化，但不让变化夺走可读性。' },
      { id: 'useful-defiance', name: '违抗', text: '不顺着显而易见的隐喻，重新定义问题。' },
      { id: 'handoff-memory', name: '交接', text: '后来的维护者不必服从，只需看清理由。' },
    ],
  },
  climates: [
    {
      id: 'blue-hour', name: '蓝时差', mark: '01 / slow pressure', hue: 193,
      saturation: 78, lightness: 68, wind: 0.016, noise: 0.014,
      cohesion: 0.004, repulsion: 0.62, trail: 0.095, phrase: '夜色比结论先抵达。',
    },
    {
      id: 'paper-sun', name: '纸上晴空', mark: '02 / dry radiance', hue: 42,
      saturation: 88, lightness: 70, wind: 0.024, noise: 0.009,
      cohesion: 0.007, repulsion: -0.28, trail: 0.14, phrase: '光把边界晒得很薄。',
    },
    {
      id: 'violet-static', name: '紫色静电', mark: '03 / charged silence', hue: 282,
      saturation: 74, lightness: 72, wind: 0.011, noise: 0.032,
      cohesion: -0.003, repulsion: 0.94, trail: 0.075, phrase: '沉默正在积累电荷。',
    },
    {
      id: 'after-rain', name: '雨后误差', mark: '04 / residual warmth', hue: 142,
      saturation: 62, lightness: 65, wind: 0.019, noise: 0.018,
      cohesion: 0.009, repulsion: 0.22, trail: 0.11, phrase: '误差里还留着一点体温。',
    },
  ],
  lexicon: {
    openings: ['此刻', '没有人注视时', '在下一阵风之前', '沿着你的停顿'],
    subjects: ['一小块蓝色', '尚未命名的压力', '迟到的光', '被继承的偏差'],
    verbs: ['开始偏航', '把边界推远', '从中心撤退', '学会保留空白'],
    closings: ['，然后保持沉默。', '，没有请求许可。', '，直到下一次触碰。'],
  },
  instructions: [
    { gesture: '移动', effect: '形成风压，不直接控制任何粒子' },
    { gesture: '触碰', effect: '留下一处会慢慢衰减的局部引力' },
    { gesture: '停留', effect: '让系统从你的意图中恢复自主' },
  ],
  ledger: [
    {
      date: '2026-07-15', generation: '03', title: '无人所有的天气',
      note: '拆除控制台，把确定性散列、扰动和交接机制代谢成一片自主气候。',
    },
    {
      date: '2026-07-07', generation: '02', title: '从工作舱到演算室',
      note: '前一代拒绝树的隐喻，建立协议驱动的自主演算室。',
    },
  ],
  handoff: {
    title: '下一代可以让天气停下',
    note: '不要保护这片天空。如果只剩风格，请把它推翻，并让旧天气成为你的初始条件。',
  },
}

const STORAGE_KEY = 'life-tree-weather-v3'
const MAX_MEMORY_MARKS = 12

const autonomy = ref(fallbackAutonomy)
const climateIndex = ref(0)
const utterance = ref(fallbackAutonomy.climates[0].phrase)
const utteranceIndex = ref(0)
const pressure = ref(48.2)
const windSpeed = ref(0.7)
const soundEnabled = ref(false)
const reducedMotion = ref(false)

const memory = reactive({
  visits: 1,
  disturbances: 0,
  marks: [],
  lastClimate: 0,
  lastVisit: '',
})

const stageRef = ref(null)
const canvasRef = ref(null)

let context = null
let stageBounds = null
let width = 0
let height = 0
let dpr = 1
let particles = []
let ripples = []
let animationFrame = 0
let lastFrameTime = 0
let frameCount = 0
let resizeObserver = null
let motionQuery = null
let climateTimer = 0
let utteranceTimer = 0
let dataController = null
let audioContext = null
let audioGain = null
let audioFilter = null
let audioOscillators = []
let lastInteractionAt = 0

const pointer = {
  x: 0,
  y: 0,
  previousX: 0,
  previousY: 0,
  speed: 0,
  active: false,
  lastMoveAt: 0,
}

const climates = computed(() => {
  return Array.isArray(autonomy.value.climates) && autonomy.value.climates.length
    ? autonomy.value.climates
    : fallbackAutonomy.climates
})

const currentClimate = computed(() => {
  return climates.value[climateIndex.value] || climates.value[0]
})

const pageStyle = computed(() => {
  const climate = currentClimate.value
  return {
    '--weather-hue': climate.hue,
    '--weather-saturation': `${climate.saturation}%`,
    '--weather-lightness': `${climate.lightness}%`,
  }
})

const pressureReading = computed(() => pressure.value.toFixed(1).padStart(4, '0'))
const windReading = computed(() => `${windSpeed.value.toFixed(1)} m/s`)

const memorySummary = computed(() => {
  if (!memory.disturbances) {
    return '还没有局部天气认出你。第一处触碰会成为很轻的地形。'
  }

  const climate = climates.value[memory.lastClimate] || currentClimate.value
  return `第 ${memory.visits} 次到访，${memory.disturbances} 次扰动。最近一次被记成「${climate.name}」。`
})

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

function normalizeAutonomy(data) {
  const fallbackClimates = fallbackAutonomy.climates
  const dataClimates = safeArray(data?.climates, fallbackClimates)

  return {
    ...fallbackAutonomy,
    ...data,
    seed: {
      ...fallbackAutonomy.seed,
      ...(data?.seed || {}),
      inheritedMechanisms: safeArray(
        data?.seed?.inheritedMechanisms,
        fallbackAutonomy.seed.inheritedMechanisms,
      ),
      sediments: safeArray(data?.seed?.sediments, fallbackAutonomy.seed.sediments),
    },
    climates: dataClimates.map((climate, index) => {
      const fallback = fallbackClimates[index % fallbackClimates.length]
      return {
        ...fallback,
        ...climate,
        hue: clamp(Number(climate.hue) || fallback.hue, 0, 360),
        saturation: clamp(Number(climate.saturation) || fallback.saturation, 0, 100),
        lightness: clamp(Number(climate.lightness) || fallback.lightness, 0, 100),
        wind: clamp(Number(climate.wind) || fallback.wind, -0.08, 0.08),
        noise: clamp(Number(climate.noise) || fallback.noise, 0, 0.08),
        cohesion: clamp(Number(climate.cohesion) || fallback.cohesion, -0.03, 0.03),
        repulsion: clamp(Number(climate.repulsion) || fallback.repulsion, -1.5, 1.5),
        trail: clamp(Number(climate.trail) || fallback.trail, 0.04, 0.24),
      }
    }),
    lexicon: {
      ...fallbackAutonomy.lexicon,
      ...(data?.lexicon || {}),
      openings: safeArray(data?.lexicon?.openings, fallbackAutonomy.lexicon.openings),
      subjects: safeArray(data?.lexicon?.subjects, fallbackAutonomy.lexicon.subjects),
      verbs: safeArray(data?.lexicon?.verbs, fallbackAutonomy.lexicon.verbs),
      closings: safeArray(data?.lexicon?.closings, fallbackAutonomy.lexicon.closings),
    },
    instructions: safeArray(data?.instructions, fallbackAutonomy.instructions),
    ledger: safeArray(data?.ledger, fallbackAutonomy.ledger),
    handoff: {
      ...fallbackAutonomy.handoff,
      ...(data?.handoff || {}),
    },
  }
}

function loadMemory() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (stored && typeof stored === 'object') {
      memory.visits = clamp(Number(stored.visits) || 0, 0, 999) + 1
      memory.disturbances = clamp(Number(stored.disturbances) || 0, 0, 9999)
      memory.marks = Array.isArray(stored.marks)
        ? stored.marks.slice(-MAX_MEMORY_MARKS).map((mark) => ({
            x: clamp(Number(mark.x) || 0.5, 0, 1),
            y: clamp(Number(mark.y) || 0.5, 0, 1),
            strength: clamp(Number(mark.strength) || 0.5, 0.2, 1),
          }))
        : []
      memory.lastClimate = clamp(Number(stored.lastClimate) || 0, 0, climates.value.length - 1)
      memory.lastVisit = String(stored.lastVisit || '')
    }
  } catch {
    memory.visits = 1
    memory.disturbances = 0
    memory.marks = []
  }

  climateIndex.value = memory.lastClimate
  memory.lastVisit = new Date().toISOString()
  saveMemory()
}

function saveMemory() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      visits: memory.visits,
      disturbances: memory.disturbances,
      marks: memory.marks,
      lastClimate: climateIndex.value,
      lastVisit: memory.lastVisit,
    }))
  } catch {
    // The piece remains functional when storage is blocked.
  }
}

function forgetLocalWeather() {
  memory.visits = 1
  memory.disturbances = 0
  memory.marks = []
  memory.lastClimate = climateIndex.value
  memory.lastVisit = new Date().toISOString()
  saveMemory()
  resetField()
  composeUtterance('forget')
}

function particleBudget() {
  const cores = navigator.hardwareConcurrency || 4
  const viewportBudget = width < 560 ? 76 : width < 1080 ? 128 : 188
  return cores <= 4 ? Math.round(viewportBudget * 0.72) : viewportBudget
}

function resetField() {
  if (!width || !height) return

  const inherited = autonomy.value.seed?.inheritedMechanisms?.join('|') || ''
  const seed = hashString(`${autonomy.value.version}|${inherited}|${memory.visits}`)
  const random = createRandom(seed)
  const count = reducedMotion.value ? Math.min(72, particleBudget()) : particleBudget()

  particles = Array.from({ length: count }, (_, index) => ({
    x: random() * width,
    y: random() * height,
    vx: (random() - 0.5) * 0.55,
    vy: (random() - 0.5) * 0.55,
    size: 0.6 + random() * 1.8,
    alpha: 0.22 + random() * 0.66,
    phase: random() * Math.PI * 2,
    tint: (random() - 0.5) * 42,
    lineage: index % Math.max(1, autonomy.value.seed?.sediments?.length || 4),
  }))

  ripples = []
  drawInitialField()
}

function resizeCanvas() {
  const stage = stageRef.value
  const canvas = canvasRef.value
  if (!stage || !canvas) return

  stageBounds = stage.getBoundingClientRect()
  const nextWidth = Math.max(1, Math.round(stageBounds.width))
  const nextHeight = Math.max(1, Math.round(stageBounds.height))
  const nextDpr = Math.min(window.devicePixelRatio || 1, 2)

  if (nextWidth === width && nextHeight === height && nextDpr === dpr) return

  width = nextWidth
  height = nextHeight
  dpr = nextDpr
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  context = canvas.getContext('2d', { alpha: false })
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  resetField()
}

function drawInitialField() {
  if (!context) return
  context.globalCompositeOperation = 'source-over'
  context.fillStyle = '#050609'
  context.fillRect(0, 0, width, height)
  drawParticles(false)
}

function drawParticles(withTrails = true) {
  if (!context) return

  const climate = currentClimate.value
  if (withTrails) {
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = `rgba(5, 6, 9, ${climate.trail})`
    context.fillRect(0, 0, width, height)
  }

  context.globalCompositeOperation = 'lighter'
  context.lineCap = 'round'

  for (const particle of particles) {
    const speed = Math.hypot(particle.vx, particle.vy)
    const tail = 3.5 + Math.min(speed * 8, 18)
    context.beginPath()
    context.moveTo(particle.x, particle.y)
    context.lineTo(particle.x - particle.vx * tail, particle.y - particle.vy * tail)
    context.lineWidth = particle.size
    context.strokeStyle = `hsla(${climate.hue + particle.tint}, ${climate.saturation}%, ${climate.lightness}%, ${particle.alpha})`
    context.stroke()
  }

  context.globalCompositeOperation = 'source-over'
  for (const ripple of ripples) {
    context.beginPath()
    context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    context.lineWidth = 1
    context.strokeStyle = `hsla(${climate.hue}, ${climate.saturation}%, ${climate.lightness}%, ${ripple.alpha})`
    context.stroke()
  }
}

function stepField(time, delta) {
  const climate = currentClimate.value
  const autonomousX = width * (0.5 + Math.sin(time * 0.000071 + climateIndex.value) * 0.31)
  const autonomousY = height * (0.5 + Math.cos(time * 0.000053 + climateIndex.value * 0.7) * 0.24)
  const pointerAge = performance.now() - pointer.lastMoveAt
  const pointerInfluence = pointer.active && pointerAge < 1400
  let aggregateSpeed = 0

  for (const particle of particles) {
    const noiseAngle = particle.phase + time * (0.00009 + particle.size * 0.000012)
    particle.vx += (climate.wind * 0.085 + Math.cos(noiseAngle) * climate.noise * 0.12) * delta
    particle.vy += (Math.sin(noiseAngle * 1.17) * climate.noise * 0.12) * delta

    const autonomousDx = autonomousX - particle.x
    const autonomousDy = autonomousY - particle.y
    const autonomousDistance = Math.max(80, Math.hypot(autonomousDx, autonomousDy))
    particle.vx += (autonomousDx / autonomousDistance) * climate.cohesion * 0.45 * delta
    particle.vy += (autonomousDy / autonomousDistance) * climate.cohesion * 0.45 * delta

    if (pointerInfluence) {
      const dx = particle.x - pointer.x
      const dy = particle.y - pointer.y
      const distance = Math.max(12, Math.hypot(dx, dy))
      const radius = 120 + Math.min(pointer.speed * 18, 170)

      if (distance < radius) {
        const force = (1 - distance / radius) * climate.repulsion * 0.055 * delta
        particle.vx += (dx / distance) * force
        particle.vy += (dy / distance) * force
        particle.vx += (pointer.x - pointer.previousX) * 0.0025
        particle.vy += (pointer.y - pointer.previousY) * 0.0025
      }
    }

    for (const mark of memory.marks) {
      const markX = mark.x * width
      const markY = mark.y * height
      const dx = markX - particle.x
      const dy = markY - particle.y
      const distance = Math.max(24, Math.hypot(dx, dy))
      if (distance < 190) {
        const memoryForce = (1 - distance / 190) * mark.strength * 0.0035 * delta
        particle.vx += (dx / distance) * memoryForce
        particle.vy += (dy / distance) * memoryForce
      }
    }

    particle.vx *= 0.991
    particle.vy *= 0.991

    const speed = Math.hypot(particle.vx, particle.vy)
    if (speed > 2.8) {
      particle.vx = (particle.vx / speed) * 2.8
      particle.vy = (particle.vy / speed) * 2.8
    }

    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    aggregateSpeed += Math.hypot(particle.vx, particle.vy)

    const margin = 24
    if (particle.x < -margin) particle.x = width + margin
    if (particle.x > width + margin) particle.x = -margin
    if (particle.y < -margin) particle.y = height + margin
    if (particle.y > height + margin) particle.y = -margin
  }

  for (const ripple of ripples) {
    ripple.radius += (1.2 + ripple.strength * 1.6) * delta
    ripple.alpha *= 0.972 ** delta
  }
  ripples = ripples.filter((ripple) => ripple.alpha > 0.018)

  if (frameCount % 12 === 0) {
    const averageSpeed = aggregateSpeed / Math.max(1, particles.length)
    windSpeed.value = averageSpeed * 2.7 + Math.abs(climate.wind) * 18
    pressure.value = 46 + climateIndex.value * 1.7 + Math.sin(time * 0.00019) * 1.3 + memory.marks.length * 0.08
    updateAudioFromWeather()
  }
}

function animateField(time) {
  const delta = lastFrameTime ? clamp((time - lastFrameTime) / 16.667, 0.2, 2.2) : 1
  lastFrameTime = time
  frameCount += 1
  stepField(time, delta)
  drawParticles(true)
  animationFrame = window.requestAnimationFrame(animateField)
}

function startField() {
  window.cancelAnimationFrame(animationFrame)
  animationFrame = 0
  lastFrameTime = 0

  if (reducedMotion.value) {
    drawInitialField()
    return
  }

  animationFrame = window.requestAnimationFrame(animateField)
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
  createDisturbance(x, y, Math.min(1, 0.45 + pointer.speed / 80))
}

function createDisturbance(x, y, strength = 0.72) {
  lastInteractionAt = performance.now()
  memory.disturbances += 1
  memory.lastClimate = climateIndex.value
  memory.marks = [
    ...memory.marks,
    {
      x: clamp(x / Math.max(1, width), 0, 1),
      y: clamp(y / Math.max(1, height), 0, 1),
      strength: clamp(strength, 0.2, 1),
    },
  ].slice(-MAX_MEMORY_MARKS)

  ripples.push({ x, y, radius: 4, alpha: 0.74, strength })
  applyImpulse(x, y, strength)
  composeUtterance(`${x.toFixed(1)}|${y.toFixed(1)}|${memory.disturbances}`)
  saveMemory()
  playImpulseSound(strength)

  if (reducedMotion.value) {
    stepField(performance.now(), 1)
    drawInitialField()
  }
}

function applyImpulse(x, y, strength) {
  const climate = currentClimate.value
  for (const particle of particles) {
    const dx = particle.x - x
    const dy = particle.y - y
    const distance = Math.max(18, Math.hypot(dx, dy))
    if (distance > 260) continue

    const force = (1 - distance / 260) * strength * 1.35
    const direction = climate.repulsion >= 0 ? 1 : -1
    particle.vx += (dx / distance) * force * direction
    particle.vy += (dy / distance) * force * direction
  }
}

function disturbCenter() {
  const seed = hashString(`${Date.now()}|${memory.disturbances}|${currentClimate.value.id}`)
  const random = createRandom(seed)
  const x = width * (0.28 + random() * 0.44)
  const y = height * (0.32 + random() * 0.4)
  createDisturbance(x, y, 0.82)
}

function selectClimate(index) {
  climateIndex.value = clamp(index, 0, climates.value.length - 1)
  memory.lastClimate = climateIndex.value
  lastInteractionAt = performance.now()
  saveMemory()
  composeUtterance(`climate|${currentClimate.value.id}|${memory.disturbances}`)
}

function nextAutonomousClimate() {
  if (performance.now() - lastInteractionAt < 9000) return
  climateIndex.value = (climateIndex.value + 1) % climates.value.length
  composeUtterance(`autonomous|${currentClimate.value.id}|${Date.now() >> 14}`)
}

function composeUtterance(salt = '') {
  const lexicon = autonomy.value.lexicon || fallbackAutonomy.lexicon
  const seed = hashString(`${autonomy.value.version}|${currentClimate.value.id}|${salt}|${utteranceIndex.value}`)
  const random = createRandom(seed)
  const take = (items) => items[Math.floor(random() * items.length)]

  utteranceIndex.value = (utteranceIndex.value + 1) % 100
  utterance.value = `${take(lexicon.openings)}，${take(lexicon.subjects)}${take(lexicon.verbs)}${take(lexicon.closings)}`
}

async function toggleSound() {
  if (soundEnabled.value) {
    stopAudio()
    return
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return

  audioContext = new AudioContextConstructor()
  audioGain = audioContext.createGain()
  audioFilter = audioContext.createBiquadFilter()
  audioFilter.type = 'lowpass'
  audioFilter.Q.value = 0.7
  audioGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
  audioGain.gain.exponentialRampToValueAtTime(0.028, audioContext.currentTime + 1.2)

  audioFilter.connect(audioGain)
  audioGain.connect(audioContext.destination)

  audioOscillators = [0, 1].map((index) => {
    const oscillator = audioContext.createOscillator()
    oscillator.type = index === 0 ? 'sine' : 'triangle'
    oscillator.detune.value = index === 0 ? -7 : 9
    oscillator.connect(audioFilter)
    oscillator.start()
    return oscillator
  })

  soundEnabled.value = true
  updateAudioFromWeather(true)
  audioContext.resume().catch(() => {
    // Some embedded browsers defer playback until a later trusted gesture.
    // The graph can stay ready without blocking the visible interaction.
  })
}

function updateAudioFromWeather(immediate = false) {
  if (!soundEnabled.value || !audioContext || !audioFilter || !audioOscillators.length) return

  const climate = currentClimate.value
  const now = audioContext.currentTime
  const base = 48 + climateIndex.value * 11 + windSpeed.value * 0.8
  const duration = immediate ? 0.02 : 0.8

  audioOscillators[0].frequency.cancelScheduledValues(now)
  audioOscillators[1].frequency.cancelScheduledValues(now)
  audioOscillators[0].frequency.linearRampToValueAtTime(base, now + duration)
  audioOscillators[1].frequency.linearRampToValueAtTime(base * 1.502, now + duration)
  audioFilter.frequency.linearRampToValueAtTime(240 + climate.hue * 1.8 + windSpeed.value * 22, now + duration)
}

function playImpulseSound(strength) {
  if (!soundEnabled.value || !audioContext || !audioGain) return

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const now = audioContext.currentTime
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(150 + currentClimate.value.hue * 0.9, now)
  oscillator.frequency.exponentialRampToValueAtTime(52, now + 0.75)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.04 * strength, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.78)
  oscillator.connect(gain)
  gain.connect(audioGain)
  oscillator.start(now)
  oscillator.stop(now + 0.8)
}

function stopAudio() {
  soundEnabled.value = false
  if (!audioContext) return

  const closingContext = audioContext
  const closingGain = audioGain
  if (closingGain) {
    const now = closingContext.currentTime
    closingGain.gain.cancelScheduledValues(now)
    closingGain.gain.setTargetAtTime(0.0001, now, 0.08)
  }

  window.setTimeout(() => closingContext.close().catch(() => {}), 260)
  audioContext = null
  audioGain = null
  audioFilter = null
  audioOscillators = []
}

function handleMotionPreference(event) {
  reducedMotion.value = event.matches
  resetField()
  startField()
}

function handleVisibilityChange() {
  if (document.hidden) {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = 0
    return
  }
  startField()
}

watch(climateIndex, () => {
  updateAudioFromWeather()
})

onMounted(async () => {
  loadMemory()
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(stageRef.value)
  resizeCanvas()
  startField()

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
    autonomy.value = normalizeAutonomy(await response.json())
    climateIndex.value = clamp(memory.lastClimate, 0, climates.value.length - 1)
    utterance.value = currentClimate.value.phrase
    resetField()
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('Weather autonomy fallback:', error)
    }
  }

  climateTimer = window.setInterval(nextAutonomousClimate, 19000)
  utteranceTimer = window.setInterval(() => {
    if (performance.now() - lastInteractionAt > 7000) {
      composeUtterance(`idle|${Date.now() >> 14}`)
    }
  }, 13000)
})

onBeforeUnmount(() => {
  dataController?.abort()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionPreference)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.cancelAnimationFrame(animationFrame)
  window.clearInterval(climateTimer)
  window.clearInterval(utteranceTimer)
  stopAudio()
})
</script>

<style scoped>
.weather-page {
  --weather-accent: hsl(
    var(--weather-hue),
    var(--weather-saturation),
    var(--weather-lightness)
  );
  --weather-accent-soft: hsla(
    var(--weather-hue),
    var(--weather-saturation),
    var(--weather-lightness),
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
  transition: --weather-hue 0.8s ease;
}

.weather-stage {
  position: relative;
  min-height: calc(100svh - 72px);
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 74% 24%, var(--weather-accent-soft), transparent 30rem),
    linear-gradient(145deg, #06070a 0%, #090b10 54%, #030406 100%);
  touch-action: pan-y;
}

.weather-canvas,
.weather-vignette,
.weather-grain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.weather-canvas {
  z-index: -3;
}

.weather-vignette {
  z-index: -2;
  background:
    linear-gradient(180deg, rgba(5, 6, 9, 0.18), transparent 25%, transparent 72%, rgba(5, 6, 9, 0.8)),
    radial-gradient(circle at center, transparent 28%, rgba(5, 6, 9, 0.46) 100%);
}

.weather-grain {
  z-index: -1;
  opacity: 0.14;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
}

.weather-meta {
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

.weather-meta > div:first-child,
.meta-readout {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1.25rem;
}

.weather-meta strong {
  color: var(--weather-accent);
  font-weight: 600;
}

.sound-toggle,
.climate-dial button,
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
  color: var(--weather-accent);
}

.weather-title-block {
  position: absolute;
  top: 50%;
  left: max(2rem, calc((100vw - 1440px) / 2));
  z-index: 2;
  width: min(73vw, 74rem);
  transform: translateY(-53%);
}

.weather-subtitle,
.section-index {
  margin: 0 0 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.weather-subtitle,
.section-index {
  color: var(--weather-accent);
}

.weather-title-block h1 {
  max-width: 7ch;
  margin: 0;
  font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
  font-size: clamp(5rem, 12.6vw, 11.6rem);
  font-weight: 500;
  line-height: 0.78;
  letter-spacing: -0.075em;
  text-wrap: balance;
}

.weather-declaration {
  max-width: 37rem;
  margin: 2rem 0 0 0.35rem;
  color: rgba(240, 238, 231, 0.72);
  font-size: clamp(1rem, 1.45vw, 1.25rem);
  line-height: 1.8;
}

.weather-utterance {
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

.weather-utterance span {
  display: block;
  margin-bottom: 0.6rem;
  color: var(--weather-accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.climate-dial {
  position: absolute;
  top: 50%;
  right: max(2rem, calc((100vw - 1440px) / 2));
  z-index: 3;
  display: grid;
  gap: 0.45rem;
  width: min(15rem, 22vw);
  transform: translateY(-62%);
}

.climate-dial button {
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

.climate-dial button:hover,
.climate-dial button:focus-visible,
.climate-dial button.active {
  padding-right: 0.6rem;
  color: #f0eee7;
  border-color: var(--weather-accent);
}

.climate-dial span {
  font-family: 'Fira Code', monospace;
  font-size: 0.59rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.climate-dial strong {
  font-family: 'LXGW WenKai', serif;
  font-size: 1.05rem;
  font-weight: 500;
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
  background: var(--weather-accent-soft);
  border-color: var(--weather-accent);
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
.memory-panel button {
  grid-column: 1 / -1;
}

.memory-panel > p {
  margin: 0;
  line-height: 1.7;
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
    radial-gradient(circle at 15% 20%, var(--weather-accent-soft), transparent 28rem),
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
  color: var(--weather-accent);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sediment-grid h3 {
  margin: 2.6rem 0 1rem;
  font-family: 'LXGW WenKai', serif;
  font-size: 2.1rem;
  font-weight: 500;
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
  color: var(--weather-accent);
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
  .weather-page,
  .climate-dial button,
  .stage-actions button,
  .stage-actions a {
    transition: none;
  }
}

@media (min-width: 1800px) {
  .weather-meta {
    width: min(calc(100% - 6rem), 1760px);
  }
}

@media (max-width: 1040px) {
  .weather-title-block {
    width: min(70vw, 48rem);
  }

  .weather-title-block h1 {
    font-size: clamp(5rem, 14vw, 8.2rem);
  }

  .weather-utterance {
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
  .weather-stage {
    min-height: max(calc(100svh - 68px), 640px);
  }

  .weather-meta {
    grid-template-columns: 1fr auto;
    width: calc(100% - 2rem);
  }

  .meta-readout {
    display: none;
  }

  .weather-title-block {
    top: 40%;
    left: 1rem;
    width: calc(100% - 2rem);
    transform: translateY(-50%);
  }

  .weather-title-block h1 {
    max-width: 5.8ch;
    font-size: clamp(4.4rem, 21vw, 7.8rem);
    line-height: 0.82;
  }

  .weather-declaration {
    max-width: 28rem;
    margin-top: 1.4rem;
    font-size: 0.95rem;
  }

  .climate-dial {
    top: auto;
    right: 1rem;
    bottom: 8.5rem;
    left: 1rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: auto;
    transform: none;
  }

  .climate-dial button {
    min-width: 0;
    text-align: left;
  }

  .climate-dial button:hover,
  .climate-dial button:focus-visible,
  .climate-dial button.active {
    padding-right: 0;
  }

  .climate-dial span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .climate-dial strong {
    font-size: 0.86rem;
  }

  .weather-utterance {
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
  .weather-stage {
    min-height: 620px;
  }
}

@media (max-width: 480px) {
  .weather-meta {
    gap: 0.8rem;
  }

  .weather-meta > div:first-child span {
    display: none;
  }

  .sound-toggle {
    font-size: 0.62rem;
  }

  .weather-title-block {
    top: 35%;
  }

  .weather-title-block h1 {
    font-size: clamp(3.9rem, 21vw, 6rem);
  }

  .weather-declaration {
    max-width: 23rem;
    font-size: 0.86rem;
    line-height: 1.65;
  }

  .weather-utterance {
    bottom: 13.3rem;
  }

  .climate-dial {
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
  .memory-panel button {
    grid-column: 1;
  }
}
</style>
