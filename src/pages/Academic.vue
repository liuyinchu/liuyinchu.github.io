<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MarkdownRenderer from '../components/academic/MarkdownRenderer.vue'

const brief = ref(null)
const publications = ref([])
const markdownContent = ref('')
const experience = ref([])
const conferences = ref([])
const isLoading = ref(true)
const error = ref(null)

const pageIdx = ref(0)
const workPageIdx = ref(0)
const direction = ref('down')
const transitioning = ref(false)
const academicRef = ref(null)
const contactLinks = computed(() => {
  const links = Object.entries(brief.value?.contact?.links || {}).map(([label, href]) => [label, href])
  const email = brief.value?.contact?.email

  return [
    ['Research Homepage', '/research'],
    ...links,
    ...(email ? [['Email', `mailto:${email}`]] : []),
  ]
})
const slides = computed(() => [
  {
    key: 'signature',
    eyebrow: 'Academic Card',
    title: brief.value?.name || 'Shuyun Yang',
  },
  {
    key: 'profile',
    eyebrow: 'Slide 01 / Profile',
    title: '学术名片',
    lead: '',
    metrics: [
      { value: brief.value?.name || 'Yang Shuyun', label: 'Name' },
      { value: brief.value?.title || 'Academic Profile', label: 'Current Title' },
      { value: brief.value?.research_interests?.[0] || 'Research Focus', label: 'Primary Focus' },
    ],
    statements: brief.value?.career_three_lines || [],
  },
  {
    key: 'directions',
    eyebrow: 'Slide 02 / Research Focus',
    title: '研究方向',
    lead: '',
    interests: brief.value?.research_interests || [],
  },
  {
    key: 'work',
    eyebrow: 'Slide 03 / Current Work',
    title: '当前工作',
    lead: '',
    markdownPages: workMarkdownPages.value,
  },
  {
    key: 'publications',
    eyebrow: 'Slide 04 / Publications',
    title: '出版与成果',
    lead: '',
    publications: publications.value,
    highlights: brief.value?.highlights || [],
  },
  {
    key: 'record',
    eyebrow: 'Slide 05 / Record',
    title: '经历与会议',
    lead: '',
    timeline: experience.value.map((item) => [item.period, `${item.organization}｜${item.role}。${item.description}`]),
    conferences: conferences.value,
  },
  {
    key: 'contact',
    eyebrow: 'Slide 06 / Links',
    title: '联系与入口',
    lead: brief.value?.contact?.email || '',
    links: contactLinks.value,
  },
])
const currentSlide = computed(() => slides.value[pageIdx.value] || slides.value[0])
const transitionName = computed(() => (direction.value === 'down' ? 'deck-forward' : 'deck-backward'))
const pageNumber = computed(() => String(pageIdx.value + 1).padStart(2, '0'))
const totalPages = computed(() => String(slides.value.length).padStart(2, '0'))
const currentWorkMarkdown = computed(() => workMarkdownPages.value[workPageIdx.value] || '')
const workPageNumber = computed(() => String(workPageIdx.value + 1).padStart(2, '0'))
const workPageTotal = computed(() => String(Math.max(workMarkdownPages.value.length, 1)).padStart(2, '0'))

let touchX = 0
let touchY = 0
let originalHtmlOverflow = ''
let originalBodyOverflow = ''

function splitMarkdownPages(source) {
  const blocks = source.trim().split(/\n{2,}/).filter(Boolean).flatMap((block) => {
    if (block.length <= 480 || block.startsWith('#') || block.startsWith('```') || block.includes('|')) {
      return [block]
    }

    const sentences = block.match(/[^.!?。！？]+[.!?。！？]+["')\]]*/g) || [block]
    const chunks = []
    let chunk = ''

    for (const sentence of sentences) {
      if (chunk && chunk.length + sentence.length > 480) {
        chunks.push(chunk.trim())
        chunk = ''
      }
      chunk += sentence
    }

    if (chunk.trim()) chunks.push(chunk.trim())
    return chunks.length ? chunks : [block]
  })
  const pages = []
  let current = []
  let weight = 0

  for (const block of blocks) {
    const blockWeight = block.length + (block.startsWith('#') ? 180 : 0)

    if (current.length && weight + blockWeight > 560) {
      pages.push(current.join('\n\n'))
      current = []
      weight = 0
    }

    current.push(block)
    weight += blockWeight
  }

  if (current.length) {
    pages.push(current.join('\n\n'))
  }

  return pages.length ? pages : ['']
}

const workMarkdownPages = computed(() => splitMarkdownPages(markdownContent.value))

function stepWorkPage(delta) {
  if (currentSlide.value.key !== 'work') return false
  if (workMarkdownPages.value.length <= 1) return false

  const next = workPageIdx.value + delta
  if (next < 0 || next >= workMarkdownPages.value.length) return false

  workPageIdx.value = next
  return true
}

function step(delta) {
  if (transitioning.value) return

  const next = pageIdx.value + delta
  if (next < 0 || next >= slides.value.length) return

  direction.value = delta > 0 ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = next
  if (slides.value[next]?.key === 'work') {
    workPageIdx.value = 0
  }
  window.setTimeout(() => {
    transitioning.value = false
  }, 560)
}

function goTo(idx) {
  if (idx === pageIdx.value || transitioning.value) return
  direction.value = idx > pageIdx.value ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = idx
  if (slides.value[idx]?.key === 'work') {
    workPageIdx.value = 0
  }
  window.setTimeout(() => {
    transitioning.value = false
  }, 560)
}

function onWheel(event) {
  if (Math.abs(event.deltaY) < 12) return
  event.preventDefault()
  const delta = event.deltaY > 0 ? 1 : -1
  step(delta)
}

function onKey(event) {
  if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault()
    step(1)
  }

  if (['ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault()
    step(-1)
  }
}

function onTouchStart(event) {
  const touch = event.changedTouches[0]
  touchX = touch.clientX
  touchY = touch.clientY
}

function onTouchEnd(event) {
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchX
  const dy = touch.clientY - touchY

  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 34) {
    const delta = dy < 0 ? 1 : -1
    step(delta)
  }
}

async function loadAcademicData() {
  try {
    const responses = await Promise.all([
      fetch('/data/academic_brief.json'),
      fetch('/data/publications.json'),
      fetch('/data/highlight_work.md'),
      fetch('/data/experience.json'),
      fetch('/data/conferences.json'),
    ])

    for (const res of responses) {
      if (!res.ok) throw new Error(`网络请求失败: ${res.status}`)
    }

    const [briefData, pubsData, mdText, expData, confData] = await Promise.all([
      responses[0].json(),
      responses[1].json(),
      responses[2].text(),
      responses[3].json(),
      responses[4].json(),
    ])

    brief.value = briefData
    publications.value = pubsData
    markdownContent.value = mdText
    experience.value = expData
    conferences.value = confData
  } catch (err) {
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  originalHtmlOverflow = document.documentElement.style.overflow
  originalBodyOverflow = document.body.style.overflow
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  window.requestAnimationFrame(() => academicRef.value?.focus())
  loadAcademicData()
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = originalHtmlOverflow
  document.body.style.overflow = originalBodyOverflow
})
</script>

<template>
  <main
    ref="academicRef"
    class="academic-deck"
    aria-labelledby="academic-title"
    tabindex="0"
    @wheel="onWheel"
    @keydown="onKey"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="deck-atmosphere" aria-hidden="true"></div>
    <div class="deck-grid" aria-hidden="true"></div>

    <RouterLink class="research-link" to="/research">Research Homepage</RouterLink>

    <div class="deck-stage">
      <Transition :name="transitionName" mode="out-in">
        <section
          :key="currentSlide.key"
          class="deck-slide"
          :class="`deck-slide--${currentSlide.key}`"
          :aria-label="currentSlide.title"
        >
          <template v-if="currentSlide.key === 'signature'">
            <div class="signature-slide">
              <p class="slide-eyebrow">{{ currentSlide.eyebrow }}</p>
              <div class="signature-stage" aria-label="Shuyun Yang signature">
                <svg
                  class="signature-outline"
                  viewBox="0 0 460 149"
                  role="img"
                  aria-label="Shuyun Yang signature outline"
                >
                  <defs>
                    <filter id="signature-outline-filter">
                      <feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="expanded" />
                      <feComposite in="expanded" in2="SourceAlpha" operator="out" result="outline" />
                      <feFlood flood-color="#89b4fa" flood-opacity="0.95" result="color" />
                      <feComposite in="color" in2="outline" operator="in" />
                    </filter>
                  </defs>
                  <image
                    href="/fig/signature-shuyun-yang.png"
                    width="460"
                    height="149"
                    preserveAspectRatio="xMidYMid meet"
                    filter="url(#signature-outline-filter)"
                  />
                </svg>
                <img
                  class="signature-fill"
                  src="/fig/signature-shuyun-yang.png"
                  alt="Shuyun Yang signature"
                >
              </div>
              <button class="enter-deck" type="button" @click="step(1)">
                <span>Enter Deck</span>
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          </template>

          <template v-else>
            <div class="slide-copy">
              <p class="slide-eyebrow">{{ currentSlide.eyebrow }}</p>
              <h1 id="academic-title">{{ currentSlide.title }}</h1>
              <p v-if="currentSlide.lead" class="slide-lead">{{ currentSlide.lead }}</p>
            </div>

            <div v-if="currentSlide.metrics" class="metric-board">
              <div
                v-for="metric in currentSlide.metrics"
                :key="metric.value"
                class="metric-item"
              >
                <span>{{ metric.value }}</span>
                <p>{{ metric.label }}</p>
              </div>
            </div>

            <div v-if="currentSlide.cards" class="direction-board">
              <article
                v-for="card in currentSlide.cards"
                :key="card[0]"
                class="direction-card"
              >
                <span>{{ card[0] }}</span>
                <p>{{ card[1] }}</p>
              </article>
            </div>

            <div v-if="currentSlide.statements" class="statement-stack">
              <p
                v-for="statement in currentSlide.statements"
                :key="statement"
              >
                {{ statement }}
              </p>
            </div>

            <div v-if="currentSlide.interests" class="interest-board">
              <span
                v-for="interest in currentSlide.interests"
                :key="interest"
              >
                {{ interest }}
              </span>
            </div>

            <div v-if="currentSlide.markdownPages" class="markdown-page-deck">
              <Transition name="markdown-page" mode="out-in">
                <div :key="workPageIdx" class="markdown-page">
                  <MarkdownRenderer :source="currentWorkMarkdown" />
                </div>
              </Transition>
              <div
                v-if="currentSlide.markdownPages.length > 1"
                class="markdown-pager"
                aria-label="当前工作内容翻页"
              >
                <button
                  type="button"
                  :disabled="workPageIdx === 0"
                  aria-label="上一页当前工作内容"
                  @click="stepWorkPage(-1)"
                >
                  ←
                </button>
                <span>{{ workPageNumber }} / {{ workPageTotal }}</span>
                <button
                  type="button"
                  :disabled="workPageIdx === currentSlide.markdownPages.length - 1"
                  aria-label="下一页当前工作内容"
                  @click="stepWorkPage(1)"
                >
                  →
                </button>
              </div>
            </div>

            <div v-if="currentSlide.publications" class="publication-board">
              <article
                v-for="item in currentSlide.publications"
                :key="`${item.title}-${item.year}`"
                class="publication-item"
              >
                <span>{{ item.type || 'Publication' }}</span>
                <h2>{{ item.title }}</h2>
                <p>{{ item.authors?.join(', ') }}</p>
                <small>{{ item.venue }} · {{ item.year }}</small>
                <a
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </article>
              <p
                v-for="highlight in currentSlide.highlights"
                :key="highlight"
                class="highlight-line"
              >
                {{ highlight }}
              </p>
            </div>

            <div v-if="currentSlide.timeline" class="timeline-board">
              <article
                v-for="item in currentSlide.timeline"
                :key="item[0]"
                class="timeline-item"
              >
                <span>{{ item[0] }}</span>
                <p>{{ item[1] }}</p>
              </article>
            </div>

            <div v-if="currentSlide.conferences" class="conference-board">
              <article
                v-for="item in currentSlide.conferences"
                :key="`${item.name}-${item.date}`"
                class="conference-item"
              >
                <span>{{ item.date }}</span>
                <h2>{{ item.name }}</h2>
                <p>{{ item.event }} · {{ item.location }}</p>
              </article>
            </div>

            <div v-if="currentSlide.links" class="link-board">
              <a
                v-for="link in currentSlide.links"
                :key="link[0]"
                :href="link[1]"
                :target="link[1].startsWith('http') ? '_blank' : undefined"
                :rel="link[1].startsWith('http') ? 'noopener noreferrer' : undefined"
              >
                <span>{{ link[0] }}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </template>
        </section>
      </Transition>
    </div>

    <nav class="deck-controls" aria-label="我的学术分页">
      <button
        class="deck-arrow"
        type="button"
        :disabled="pageIdx === 0"
        aria-label="上一页"
        @click="step(-1)"
      >
        ↑
      </button>
      <div class="deck-progress">
        <button
          v-for="(slide, idx) in slides"
          :key="slide.key"
          class="progress-node"
          :class="{ active: idx === pageIdx }"
          type="button"
          :aria-label="`前往第 ${idx + 1} 页`"
          @click="goTo(idx)"
        ></button>
      </div>
      <button
        class="deck-arrow"
        type="button"
        :disabled="pageIdx === slides.length - 1"
        aria-label="下一页"
        @click="step(1)"
      >
        ↓
      </button>
      <span class="deck-count">{{ pageNumber }} / {{ totalPages }}</span>
    </nav>
  </main>
</template>

<style scoped>
.academic-deck {
  --deck-line: rgba(var(--ctp-mocha-overlay0-rgb), 0.28);
  --deck-line-strong: rgba(var(--ctp-mocha-blue-rgb), 0.48);
  --deck-panel: rgba(24, 24, 37, 0.62);
  position: relative;
  height: calc(100svh - 72px);
  overflow: hidden;
  isolation: isolate;
  color: var(--ctp-mocha-text);
  outline: none;
  background:
    linear-gradient(118deg, rgba(137, 180, 250, 0.13), transparent 28%),
    linear-gradient(242deg, transparent 35%, rgba(180, 190, 254, 0.10) 62%, transparent 78%),
    linear-gradient(180deg, #090a12 0%, var(--ctp-mocha-crust) 48%, #14131f 100%);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
}

.deck-atmosphere,
.deck-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deck-atmosphere {
  z-index: -3;
  background:
    linear-gradient(110deg, transparent 0%, rgba(116, 199, 236, 0.12) 34%, transparent 58%),
    linear-gradient(168deg, transparent 12%, rgba(203, 166, 247, 0.08) 52%, transparent 78%);
  filter: blur(26px);
  opacity: 0.92;
  transform: scale(1.05);
}

.deck-grid {
  z-index: -2;
  background:
    linear-gradient(rgba(205, 214, 244, 0.052) 1px, transparent 1px),
    linear-gradient(90deg, rgba(205, 214, 244, 0.046) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.74) 62%, transparent 100%);
}

.academic-deck::before,
.academic-deck::after {
  content: '';
  position: absolute;
  z-index: -1;
  pointer-events: none;
}

.academic-deck::before {
  top: 13vh;
  right: -12vw;
  width: 52vw;
  height: 34vh;
  border: 1px solid rgba(var(--ctp-mocha-blue-rgb), 0.26);
  transform: rotate(-16deg) skewX(-10deg);
}

.academic-deck::after {
  left: -14vw;
  bottom: 11vh;
  width: 46vw;
  height: 20vh;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.22);
  transform: rotate(12deg) skewX(18deg);
}

.research-link {
  position: absolute;
  top: clamp(1rem, 3vw, 1.8rem);
  left: clamp(1rem, 4vw, 3rem);
  z-index: 6;
  display: inline-flex;
  align-items: center;
  min-height: 2.35rem;
  padding: 0 0.88rem;
  border: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.36);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.78);
  background: rgba(var(--ctp-mocha-base-rgb), 0.46);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-weight: 750;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.research-link:hover,
.research-link:focus-visible {
  border-color: rgba(var(--ctp-mocha-blue-rgb), 0.52);
  color: var(--ctp-mocha-blue);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.62);
  outline: none;
  transform: translateY(-2px);
}

.deck-stage {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.deck-slide {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(18rem, 0.86fr);
  gap: clamp(1.5rem, 5vw, 5rem);
  align-items: center;
  box-sizing: border-box;
  padding:
    clamp(4.6rem, 10vh, 6.8rem)
    clamp(1.25rem, 7vw, 6.6rem)
    clamp(5.6rem, 11vh, 7.2rem);
}

.deck-slide--signature {
  display: grid;
  place-items: center;
  grid-template-columns: 1fr;
  text-align: center;
}

.signature-slide {
  display: grid;
  place-items: center;
  width: min(860px, 100%);
}

.slide-eyebrow,
.deck-count,
.deck-arrow,
.progress-node,
.metric-item span,
.direction-card span,
.timeline-item span,
.link-board a {
  font-family: 'Fira Code', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.slide-eyebrow {
  margin: 0 0 1rem;
  color: var(--ctp-mocha-sky);
  font-size: 0.72rem;
  font-weight: 800;
}

.signature-stage {
  position: relative;
  width: min(78vw, 720px);
  aspect-ratio: 460 / 149;
  margin: clamp(1.2rem, 5vh, 3rem) 0 1rem;
}

.signature-outline,
.signature-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.signature-outline {
  filter: drop-shadow(0 0 18px rgba(var(--ctp-mocha-blue-rgb), 0.35));
  clip-path: inset(0 100% 0 0);
  animation: signature-trace 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
}

.signature-fill {
  opacity: 0;
  filter:
    drop-shadow(0 24px 58px rgba(0, 0, 0, 0.34))
    drop-shadow(0 0 24px rgba(var(--ctp-mocha-lavender-rgb), 0.18));
  clip-path: inset(0 100% 0 0);
  animation:
    signature-fill 1.35s cubic-bezier(0.16, 1, 0.3, 1) 1.15s forwards,
    signature-settle 3s ease-in-out 2.2s infinite;
}

.enter-deck {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 2.8rem;
  padding: 0 1rem;
  border: 1px solid rgba(var(--ctp-mocha-blue-rgb), 0.38);
  border-radius: 999px;
  color: var(--ctp-mocha-text);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.52);
  cursor: pointer;
  font-weight: 800;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.enter-deck:hover,
.enter-deck:focus-visible {
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.68);
  background: rgba(var(--ctp-mocha-surface1-rgb), 0.62);
  outline: none;
  transform: translateY(-2px);
}

.slide-copy {
  display: grid;
  align-content: center;
  max-width: 48rem;
}

.slide-copy h1 {
  margin: 0;
  color: rgba(245, 246, 255, 0.96);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(3rem, 8.5vw, 7rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: 0;
}

.slide-lead {
  max-width: 42rem;
  margin: clamp(1.1rem, 3vh, 1.8rem) 0 0;
  color: rgba(205, 214, 244, 0.82);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1rem, 1.5vw, 1.16rem);
  font-weight: 560;
  line-height: 1.82;
}

.metric-board,
.direction-board,
.interest-board,
.markdown-page-deck,
.publication-board,
.statement-stack,
.timeline-board,
.conference-board,
.link-board {
  position: relative;
  display: grid;
  align-self: center;
  border: 1px solid var(--deck-line);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(var(--ctp-mocha-surface0-rgb), 0.68), rgba(var(--ctp-mocha-base-rgb), 0.28));
  box-shadow:
    0 28px 82px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.055);
  overflow: hidden;
}

.metric-board::before,
.direction-board::before,
.interest-board::before,
.markdown-page-deck::before,
.publication-board::before,
.statement-stack::before,
.timeline-board::before,
.conference-board::before,
.link-board::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--ctp-mocha-blue), var(--ctp-mocha-lavender), transparent);
}

.metric-board {
  grid-template-columns: 1fr;
}

.deck-slide--profile .statement-stack,
.deck-slide--record .conference-board {
  grid-column: 2;
}

.deck-slide--profile .statement-stack {
  margin-top: -1rem;
}

.metric-item {
  display: grid;
  gap: 0.35rem;
  padding: clamp(1.1rem, 3vw, 1.55rem);
  border-bottom: 1px solid var(--deck-line);
}

.metric-item:last-child {
  border-bottom: 0;
}

.metric-item span {
  color: var(--ctp-mocha-blue);
  font-size: clamp(1.25rem, 3vw, 2.2rem);
  font-weight: 900;
}

.metric-item p,
.direction-card p,
.statement-stack p,
.timeline-item p {
  margin: 0;
  color: rgba(205, 214, 244, 0.78);
  font-size: 0.94rem;
  line-height: 1.7;
}

.direction-board {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.direction-card {
  display: grid;
  gap: 0.7rem;
  min-height: 10rem;
  padding: clamp(1rem, 2.4vw, 1.35rem);
  border-right: 1px solid var(--deck-line);
  border-bottom: 1px solid var(--deck-line);
}

.direction-card:nth-child(2n) {
  border-right: 0;
}

.direction-card:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.direction-card span {
  color: var(--ctp-mocha-lavender);
  font-size: 0.82rem;
  font-weight: 850;
}

.interest-board {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.72rem;
  padding: clamp(1rem, 2.6vw, 1.5rem);
}

.interest-board span {
  display: inline-flex;
  align-items: center;
  min-height: 3.4rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(var(--ctp-mocha-blue-rgb), 0.18);
  border-radius: 6px;
  color: rgba(205, 214, 244, 0.88);
  background: rgba(var(--ctp-mocha-surface1-rgb), 0.28);
  font-family: 'Fira Code', monospace;
  font-size: 0.82rem;
  font-weight: 760;
  line-height: 1.4;
}

.markdown-page-deck {
  grid-template-rows: 1fr auto;
  min-height: min(54vh, 36rem);
  padding: clamp(1rem, 2.4vw, 1.45rem);
}

.markdown-page {
  display: grid;
  align-content: start;
  min-height: 0;
}

.markdown-page :deep(.academic-markdown),
.markdown-page :deep(.markdown-renderer) {
  margin: 0;
}

.markdown-page :deep(h1),
.markdown-page :deep(h2) {
  margin-top: 0;
  font-size: clamp(1.08rem, 1.7vw, 1.38rem);
}

.markdown-page :deep(p),
.markdown-page :deep(li) {
  font-size: clamp(0.84rem, 1.2vw, 0.94rem);
  line-height: 1.64;
}

.markdown-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.22);
}

.markdown-pager button {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid rgba(var(--ctp-mocha-blue-rgb), 0.36);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.86);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.52);
  cursor: pointer;
  font-weight: 900;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.markdown-pager button:disabled {
  cursor: default;
  opacity: 0.32;
}

.markdown-pager button:not(:disabled):hover,
.markdown-pager button:focus-visible {
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.72);
  color: var(--ctp-mocha-sky);
  background: rgba(var(--ctp-mocha-surface1-rgb), 0.62);
  outline: none;
  transform: translateY(-2px);
}

.markdown-pager span {
  color: rgba(205, 214, 244, 0.74);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  font-weight: 820;
  letter-spacing: 0.08em;
}

.markdown-page-enter-active,
.markdown-page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.markdown-page-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}

.markdown-page-leave-to {
  opacity: 0;
  transform: translateX(-1rem);
}

.publication-board {
  padding: 0.75rem;
  gap: 0.7rem;
}

.publication-item {
  position: relative;
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid var(--deck-line);
  border-radius: 6px;
  background: rgba(var(--ctp-mocha-base-rgb), 0.28);
}

.publication-item span,
.publication-item small,
.conference-item span {
  color: var(--ctp-mocha-sky);
  font-family: 'Fira Code', monospace;
  font-size: 0.68rem;
  font-weight: 820;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.publication-item h2,
.conference-item h2 {
  margin: 0;
  color: rgba(245, 246, 255, 0.92);
  font-size: clamp(1.05rem, 1.6vw, 1.32rem);
  line-height: 1.3;
}

.publication-item p,
.conference-item p,
.highlight-line {
  margin: 0;
  color: rgba(205, 214, 244, 0.76);
  font-size: 0.9rem;
  line-height: 1.65;
}

.publication-item a {
  position: absolute;
  right: 0.8rem;
  top: 0.8rem;
  color: var(--ctp-mocha-blue);
  font-family: 'Fira Code', monospace;
  font-size: 0.7rem;
  font-weight: 820;
  text-decoration: none;
}

.highlight-line {
  padding: 0.9rem 1rem;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.18);
  border-radius: 6px;
  background: rgba(var(--ctp-mocha-lavender-rgb), 0.08);
}

.statement-stack {
  gap: 0;
}

.statement-stack p {
  position: relative;
  padding: clamp(1rem, 2.4vw, 1.45rem) clamp(1.1rem, 2.8vw, 1.75rem);
  border-bottom: 1px solid var(--deck-line);
}

.statement-stack p:last-child {
  border-bottom: 0;
}

.statement-stack p::before {
  content: '';
  position: absolute;
  top: 1.45rem;
  left: 0;
  width: 4px;
  height: 1.4rem;
  background: var(--ctp-mocha-blue);
}

.timeline-board {
  gap: 0;
}

.conference-board {
  gap: 0;
  margin-top: -0.75rem;
  border-top: 0;
  background: rgba(var(--ctp-mocha-base-rgb), 0.38);
}

.conference-item {
  display: grid;
  gap: 0.35rem;
  padding: clamp(1rem, 2.4vw, 1.35rem);
  border-bottom: 1px solid var(--deck-line);
}

.conference-item:last-child {
  border-bottom: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: minmax(7rem, 0.34fr) 1fr;
  gap: 1rem;
  padding: clamp(1rem, 2.4vw, 1.45rem);
  border-bottom: 1px solid var(--deck-line);
}

.timeline-item:last-child {
  border-bottom: 0;
}

.timeline-item span {
  color: var(--ctp-mocha-sky);
  font-size: 0.76rem;
  font-weight: 850;
}

.link-board {
  padding: 0.6rem;
}

.link-board a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3.6rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--deck-line);
  border-radius: 6px;
  color: rgba(205, 214, 244, 0.82);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 820;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.link-board a:last-child {
  border-bottom: 0;
}

.link-board a:hover,
.link-board a:focus-visible {
  color: var(--ctp-mocha-text);
  background: rgba(var(--ctp-mocha-blue-rgb), 0.14);
  outline: none;
  transform: translateX(0.35rem);
}

.deck-controls {
  position: absolute;
  left: 50%;
  bottom: clamp(1rem, 3vh, 1.8rem);
  z-index: 8;
  display: grid;
  grid-template-columns: auto minmax(8rem, 16rem) auto auto;
  gap: 0.65rem;
  align-items: center;
  transform: translateX(-50%);
}

.deck-progress {
  display: flex;
  gap: 0.36rem;
  align-items: center;
  padding: 0.42rem;
  border: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.30);
  border-radius: 999px;
  background: rgba(var(--ctp-mocha-base-rgb), 0.62);
}

.progress-node {
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid rgba(205, 214, 244, 0.18);
  border-radius: 999px;
  background: rgba(var(--ctp-mocha-surface1-rgb), 0.46);
  cursor: pointer;
  transition:
    width 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.progress-node.active {
  width: 2.4rem;
  border-color: rgba(var(--ctp-mocha-blue-rgb), 0.54);
  background: linear-gradient(90deg, var(--ctp-mocha-blue), var(--ctp-mocha-lavender));
}

.deck-arrow {
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.34);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.82);
  background: rgba(var(--ctp-mocha-base-rgb), 0.62);
  cursor: pointer;
  font-weight: 900;
}

.deck-arrow:disabled {
  cursor: default;
  opacity: 0.36;
}

.deck-arrow:not(:disabled):hover,
.deck-arrow:focus-visible {
  border-color: rgba(var(--ctp-mocha-blue-rgb), 0.54);
  color: var(--ctp-mocha-blue);
  outline: none;
}

.deck-count {
  min-width: 4.2rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.72rem;
  font-weight: 820;
}

.deck-forward-enter-from {
  opacity: 0;
  transform: translateY(58px) rotateX(-6deg) scale(0.985);
  filter: blur(10px);
}

.deck-forward-enter-active,
.deck-forward-leave-active,
.deck-backward-enter-active,
.deck-backward-leave-active {
  transition:
    opacity 0.56s ease,
    transform 0.56s cubic-bezier(0.18, 0.9, 0.1, 1.16),
    filter 0.56s ease;
}

.deck-forward-leave-to {
  opacity: 0;
  transform: translateY(-58px) rotateX(6deg) scale(0.985);
  filter: blur(10px);
}

.deck-backward-enter-from {
  opacity: 0;
  transform: translateY(-58px) rotateX(6deg) scale(0.985);
  filter: blur(10px);
}

.deck-backward-leave-to {
  opacity: 0;
  transform: translateY(58px) rotateX(-6deg) scale(0.985);
  filter: blur(10px);
}

@keyframes signature-trace {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0.4;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

@keyframes signature-fill {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

@keyframes signature-settle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.25rem);
  }
}

@media (max-width: 980px) {
  .deck-slide {
    grid-template-columns: 1fr;
    align-content: center;
    gap: 1.25rem;
  }

  .deck-slide--profile .statement-stack,
  .deck-slide--record .conference-board {
    grid-column: auto;
  }

  .slide-copy h1 {
    font-size: clamp(2.8rem, 12vw, 5rem);
  }
}

@media (max-width: 680px) {
  .academic-deck {
    height: calc(100svh - 68px);
  }

  .research-link {
    min-height: 2.15rem;
    font-size: 0.66rem;
  }

  .deck-slide {
    padding: 4.4rem 1rem 5.4rem;
  }

  .signature-stage {
    width: min(92vw, 520px);
  }

  .direction-board {
    grid-template-columns: 1fr;
  }

  .direction-card,
  .direction-card:nth-child(2n),
  .direction-card:nth-last-child(-n + 2) {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--deck-line);
  }

  .direction-card:last-child {
    border-bottom: 0;
  }

  .timeline-item {
    grid-template-columns: 1fr;
  }

  .deck-controls {
    grid-template-columns: auto minmax(7.5rem, 1fr) auto;
    width: calc(100% - 1.5rem);
  }

  .deck-count {
    display: none;
  }
}

@media (max-width: 420px) {
  .slide-lead,
  .metric-item p,
  .direction-card p,
  .statement-stack p,
  .timeline-item p {
    font-size: 0.88rem;
    line-height: 1.62;
  }

  .deck-slide {
    padding-top: 4.2rem;
  }

  .metric-board,
  .direction-board,
  .interest-board,
  .publication-board,
  .statement-stack,
  .timeline-board,
  .conference-board,
  .link-board {
    max-height: 44vh;
    overflow-y: auto;
  }

  .markdown-page-deck {
    min-height: 46vh;
  }

  .markdown-pager {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signature-outline,
  .signature-fill,
  .enter-deck,
  .deck-forward-enter-active,
  .deck-forward-leave-active,
  .deck-backward-enter-active,
  .deck-backward-leave-active,
  .progress-node {
    transition: none;
    animation: none;
  }

  .signature-outline,
  .signature-fill {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
</style>
