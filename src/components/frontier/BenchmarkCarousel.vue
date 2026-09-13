<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { displayScore, orderedRankings } from './useFrontierData'

const props = defineProps({ benchmarks: { type: Array, default: () => [] }, demo: Boolean })
const index = ref(0)
const active = computed(() => props.benchmarks[index.value])
const rows = computed(() => orderedRankings(active.value))
const region = ref(null)
const paused = ref(false)
const hovered = ref(false)
const focused = ref(false)
const visible = ref(true)
const inView = ref(false)
const reduced = ref(false)
const progress = ref(0)
const direction = ref(1)
const changing = ref(false)
const announcement = ref('')
const running = computed(() => !paused.value && !hovered.value && !focused.value && visible.value && inView.value && !reduced.value && props.benchmarks.length > 1 && !changing.value)
let interval, observer, media, lastTick = 0, lastWheel = 0, wheelDistance = 0
function select(next, manual = true) {
  if (props.benchmarks.length < 2 || changing.value) return
  const normalized = (next + props.benchmarks.length) % props.benchmarks.length
  if (normalized === index.value) return
  direction.value = next > index.value ? 1 : -1
  changing.value = !reduced.value
  index.value = normalized
  progress.value = 0
  if (manual) announcement.value = '当前 Benchmark：' + active.value.name
}
function wheel(event) {
  if (!event.shiftKey || props.benchmarks.length < 2) return
  event.preventDefault()
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  if (Math.sign(wheelDistance) !== Math.sign(delta)) wheelDistance = 0
  wheelDistance += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1)
  const now = performance.now()
  if (Math.abs(wheelDistance) >= 35 && now - lastWheel > 360 && !changing.value) {
    select(index.value + Math.sign(wheelDistance))
    wheelDistance = 0
    lastWheel = now
  }
}
function keydown(event) {
  if (event.target !== region.value || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  select(index.value + (event.key === 'ArrowRight' ? 1 : -1))
}
function syncVisibility() { visible.value = !document.hidden }
function syncMotion() { reduced.value = media.matches; progress.value = 0 }
function blur(event) { focused.value = !!region.value?.contains(event.relatedTarget) }
watch(() => props.benchmarks, () => { index.value = 0; progress.value = 0; changing.value = false })
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  syncVisibility()
  media.addEventListener('change', syncMotion)
  document.addEventListener('visibilitychange', syncVisibility)
  region.value.addEventListener('wheel', wheel, { passive: false })
  observer = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting }, { threshold: 0.3 })
  observer.observe(region.value)
  lastTick = performance.now()
  interval = setInterval(() => {
    const now = performance.now()
    if (running.value) {
      progress.value += Math.min(now - lastTick, 150) / 8000
      if (progress.value >= 1) select(index.value + 1, false)
    }
    lastTick = now
  }, 80)
})
onBeforeUnmount(() => {
  clearInterval(interval)
  observer?.disconnect()
  media?.removeEventListener('change', syncMotion)
  document.removeEventListener('visibilitychange', syncVisibility)
  region.value?.removeEventListener('wheel', wheel)
})
</script>

<template>
  <section ref="region" class="benchmark-deck" aria-label="AI 能力排行榜" aria-roledescription="轮播" tabindex="0"
    @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="focused = true" @focusout="blur" @keydown="keydown">
    <div class="deck-toolbar">
      <div class="deck-pagination" aria-label="选择 Benchmark">
        <button v-for="(benchmark, item) in benchmarks" :key="benchmark.id" type="button"
          :aria-current="index === item ? 'true' : undefined" :aria-label="'切换至 ' + benchmark.name"
          :disabled="changing" @click="select(item)">
          {{ benchmark.shortName }}<span>测试</span>
          <i v-if="item === index" :style="{ transform: 'scaleX(' + (reduced || paused ? 1 : progress) + ')' }" aria-hidden="true"></i>
        </button>
      </div>
      <div class="deck-controls">
        <button v-if="!reduced && benchmarks.length > 1" type="button" class="play-control"
          :aria-label="paused ? '开启自动轮播' : '暂停自动轮播'" :aria-pressed="paused" @click="paused = !paused">
          <span class="play-control-symbol" aria-hidden="true">{{ paused ? '▶' : 'Ⅱ' }}</span>
          <span>{{ paused ? '已暂停' : '自动切换' }}</span>
        </button>
        <div class="deck-arrows"><button type="button" aria-label="上一个 Benchmark" :disabled="benchmarks.length < 2 || changing" @click="select(index - 1)">‹</button>
        <span class="deck-count">{{ index + 1 }} / {{ benchmarks.length }}</span>
        <button type="button" aria-label="下一个 Benchmark" :disabled="benchmarks.length < 2 || changing" @click="select(index + 1)">›</button></div>
      </div>
    </div>
    <div class="deck-viewport" :style="{ '--slide-direction': direction }">
      <Transition name="benchmark-slide" mode="out-in" @after-enter="changing = false" @enter-cancelled="changing = false">
        <article v-if="active" :key="active.id" class="benchmark-slide" data-testid="benchmark-slide" :aria-label="active.name">
          <div class="benchmark-intro">
            <div class="benchmark-category"><span class="benchmark-category-dot"></span>{{ active.category }}</div>
            <h3><RouterLink :to="'/ai-frontier/benchmarks/' + active.id">{{ active.name }}</RouterLink></h3>
            <p class="benchmark-summary">{{ active.description }}</p>
            <div class="benchmark-metrics"><div><span>参测模型</span><strong>{{ rows.length }} <small>个</small></strong></div><div><span>评价方式</span><strong>{{ active.higherIsBetter === false ? '越低越好' : '越高越好' }}</strong></div></div>
            <RouterLink class="benchmark-report-link" :to="'/ai-frontier/benchmarks/' + active.id">查看完整测试报告 <span aria-hidden="true">↗</span></RouterLink>
            <span class="benchmark-edition">{{ active.version }}<span v-if="demo"> · 演示榜单</span></span>
          </div>
          <div class="benchmark-ranking">
            <div class="ranking-label"><span>排名与模型</span><span>{{ active.scoreLabel }} {{ active.higherIsBetter === false ? '↓' : '↑' }}</span></div>
            <ol class="ranking-list">
              <li v-for="(model, rank) in rows" :key="model.id" :class="{ 'rank-winner': rank === 0 }">
                <span class="rank-number">{{ String(rank + 1).padStart(2, '0') }}</span>
                <span class="rank-avatar" aria-hidden="true">{{ model.name.replace(/^DEMO\s+/i, '').slice(0, 1).toUpperCase() }}</span>
                <div class="rank-model"><strong>{{ model.name }}</strong><span>{{ model.provider }}</span></div>
                <div class="rank-meter" aria-hidden="true"><i :style="{ width: Math.max(0, Math.min(100, model.score / (active.maxScore || 100) * 100)) + '%' }"></i></div>
                <div class="rank-score"><strong>{{ displayScore(model.score) }}</strong><span>{{ active.unit }}</span></div>
              </li>
            </ol>
          </div>
        </article>
      </Transition>
    </div>
    <div class="deck-footer"><span>{{ demo ? '演示数据 · 虚构模型，不代表真实能力' : '排名仅对应当前测试条件，请结合报告阅读。' }}</span><span class="deck-hint"><kbd>Shift</kbd> + 滚轮，快速切换榜单</span></div>
    <p class="frontier-sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </section>
</template>

<style scoped>
.benchmark-deck { border: 1px solid var(--f-line); border-radius: 18px; background: var(--f-surface); box-shadow: 0 6px 28px rgb(23 38 70 / 3%); overflow: hidden; outline-offset: 5px; }
.deck-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 17px 25px; border-bottom: 1px solid var(--f-line); }
.deck-pagination { display: flex; align-items: center; gap: 7px; overflow-x: auto; padding: 2px; }
.deck-pagination button { position: relative; flex-shrink: 0; border: 0; border-radius: 8px; padding: 10px 17px; color: var(--f-muted); background: transparent; font-size: 12px; font-weight: 550; cursor: pointer; overflow: hidden; transition: background .18s,color .18s; }
.deck-pagination button > span { margin-left: 3px; }
.deck-pagination button:hover { color: var(--f-accent); background: var(--f-panel); }
.deck-pagination button[aria-current=true] { background: var(--f-accent-soft); color: var(--f-accent); }
.deck-pagination button i { position: absolute; height: 2px; width: calc(100% - 24px); left: 12px; bottom: 3px; background: var(--f-accent); opacity: .45; border-radius: 2px; transform-origin: left; transition: transform .08s linear; }
.deck-controls { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
.deck-controls button { background: none; color: var(--f-muted); border: 0; cursor: pointer; }
.deck-controls button:disabled { opacity: .45; cursor: default; }
.deck-controls button:hover { color: var(--f-accent); }
.play-control { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.play-control-symbol { font-size: 12px; }
.deck-arrows { display: flex; align-items: center; gap: 8px; padding-left: 17px; border-left: 1px solid var(--f-line); }
.deck-arrows button { display: grid; place-items: center; width: 26px; height: 28px; border-radius: 6px; font-size: 25px; line-height: 1; }
.deck-arrows button:hover { background: var(--f-panel); }
.deck-count { font-size: 11px; font-variant-numeric: tabular-nums; color: var(--f-muted); white-space: nowrap; }
.deck-viewport { overflow: hidden; min-height: 405px; }
.benchmark-slide { display: grid; grid-template-columns: 30% minmax(0,1fr); min-height: 405px; }
.benchmark-intro { padding: 30px 30px 24px; display: flex; flex-direction: column; border-right: 1px solid var(--f-line); background: var(--f-surface); }
.benchmark-category { display: flex; align-items: center; gap: 7px; width: fit-content; font-size: 11px; color: var(--f-accent); background: var(--f-accent-soft); border-radius: 6px; padding: 5px 9px; }
.benchmark-category-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.benchmark-intro h3 { font-size: 25px; font-weight: 700; line-height: 1.4; letter-spacing: -.045em; margin: 19px 0 12px; text-wrap: balance; }
.benchmark-intro h3 a { color: var(--f-ink); text-decoration: none; }
.benchmark-intro h3 a:hover { color: var(--f-accent); }
.benchmark-summary { font-size: 12px; color: var(--f-muted); line-height: 1.9; margin: 0; }
.benchmark-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0 24px; }
.benchmark-metrics > div { display: flex; flex-direction: column; gap: 9px; }
.benchmark-metrics > div > span { color: var(--f-muted); font-size: 10px; }
.benchmark-metrics strong { font-size: 15px; font-weight: 600; }
.benchmark-metrics small { font-size: 11px; font-weight: 400; color: var(--f-muted); }
.benchmark-report-link { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: auto; padding: 11px 13px; border: 1px solid var(--f-line); border-radius: 8px; font-size: 11px; color: var(--f-ink); text-decoration: none; transition: color .18s, border-color .18s, background .18s; }
.benchmark-report-link:hover { color: var(--f-accent); border-color: var(--f-accent); background: var(--f-accent-soft); text-decoration: none; }
.benchmark-report-link > span { font-size: 17px; }
.benchmark-edition { display: block; margin-top: 13px; font-size: 10px; color: var(--f-muted); }
.benchmark-ranking { padding: 26px 27px 21px; min-width: 0; }
.ranking-label { display: flex; justify-content: space-between; gap: 20px; color: var(--f-muted); font-size: 11px; margin-bottom: 13px; padding: 0 11px; }
.ranking-list { list-style: none; padding: 0; margin: 0; }
.ranking-list li { display: grid; grid-template-columns: 22px 35px minmax(0,1fr) minmax(55px,135px) 57px; align-items: center; gap: 12px; min-height: 57px; padding: 10px 11px; border-radius: 9px; }
.ranking-list li + li { margin-top: 2px; }
.rank-number { font-size: 10px; font-variant-numeric: tabular-nums; color: var(--f-muted); }
.rank-avatar { display: grid; place-items: center; width: 33px; height: 33px; background: var(--f-panel); border: 1px solid var(--f-line); border-radius: 9px; font-size: 14px; font-weight: 650; color: var(--f-muted); }
.rank-model { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.rank-model strong { font-size: 14px; line-height: 1.35; font-weight: 600; }
.rank-model > span { font-size: 11px; color: var(--f-muted); }
.rank-score { text-align: right; white-space: nowrap; }
.rank-score strong { font-size: 20px; font-weight: 650; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.rank-score > span { font-size: 9px; color: var(--f-muted); margin-left: 4px; }
.rank-meter { width: 100%; height: 5px; border-radius: 4px; background: var(--f-panel); overflow: hidden; }
.rank-meter i { display: block; height: 100%; border-radius: inherit; background: var(--f-accent); opacity: .33; }
.ranking-list .rank-winner { background: var(--f-accent-soft); }
.rank-winner .rank-score strong, .rank-winner .rank-number { color: var(--f-accent); }
.rank-winner .rank-avatar { border-color: transparent; background: var(--f-accent); color: var(--f-on-accent); }
.rank-winner .rank-meter i { opacity: 1; }
.deck-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; color: var(--f-muted); padding: 15px 26px; border-top: 1px solid var(--f-line); font-size: 11px; }
.deck-hint { white-space: nowrap; }
.deck-hint kbd { background: var(--f-panel); border: 1px solid var(--f-line); border-radius: 4px; padding: 2px 5px; color: var(--f-muted); font: inherit; }
.benchmark-slide-enter-active { transition: opacity .23s ease,transform .3s cubic-bezier(.2,.75,.25,1); }
.benchmark-slide-leave-active { transition: opacity .13s ease,transform .14s ease; }
.benchmark-slide-enter-from { opacity: 0; transform: translateX(calc(var(--slide-direction)*18px)); }
.benchmark-slide-leave-to { opacity: 0; transform: translateX(calc(var(--slide-direction)*-10px)); }
.frontier-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media(max-width:1050px) {
  .benchmark-slide { grid-template-columns: 32% minmax(0,1fr); }
  .benchmark-intro { padding: 25px 22px; }
  .benchmark-ranking { padding-inline: 18px; }
  .ranking-list li { grid-template-columns: 18px 30px minmax(0,1fr) 55px; gap: 9px; }
  .rank-meter { display: none; }
  .rank-avatar { width: 29px; height: 29px; }
  .deck-toolbar { padding: 15px 20px; gap: 15px; }
  .deck-controls { gap: 12px; }
  .deck-arrows { padding-left: 10px; }
}
@media(max-width:760px) {
  .deck-toolbar { flex-wrap: wrap; padding: 14px 16px; gap: 14px; }
  .deck-pagination { width: 100%; }
  .deck-pagination button { padding: 9px 13px; }
  .deck-controls { width: 100%; justify-content: space-between; }
  .deck-arrows { border: 0; padding-left: 0; }
  .benchmark-slide { grid-template-columns: 1fr; }
  .benchmark-intro { padding: 24px; border-right: 0; border-bottom: 1px solid var(--f-line); }
  .benchmark-intro h3 { font-size: 24px; margin-top: 14px; }
  .benchmark-summary { font-size: 12px; }
  .benchmark-metrics { margin-block: 20px; }
  .benchmark-report-link { font-size: 12px; }
  .benchmark-ranking { padding: 23px 16px; }
  .ranking-list li { min-height: 59px; grid-template-columns: 20px 33px minmax(0,1fr) 58px; gap: 10px; }
  .rank-avatar { width: 33px; height: 33px; }
  .deck-footer { padding: 15px 20px; font-size: 9px; }
  .deck-hint { display: none; }
}
@media(prefers-reduced-motion:reduce) {
  .benchmark-slide-enter-active,.benchmark-slide-leave-active,.deck-pagination button i,.deck-pagination button,.benchmark-report-link { transition: none; }
  .benchmark-slide-enter-from,.benchmark-slide-leave-to { transform: none; }
}
</style>
