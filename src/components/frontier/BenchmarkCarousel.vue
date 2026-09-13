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
      <span class="deck-caption">BENCHMARK INDEX / {{ String(benchmarks.length).padStart(2, '0') }}</span>
      <span class="deck-hint">SHIFT + 滚轮切换</span>
      <div class="deck-controls">
        <button v-if="!reduced && benchmarks.length > 1" type="button" class="play-control"
          :aria-label="paused ? '开启自动轮播' : '暂停自动轮播'" :aria-pressed="paused" @click="paused = !paused">
          {{ paused ? '▶' : 'Ⅱ' }} <span>{{ paused ? '已暂停' : '自动轮播' }}</span>
        </button>
        <button type="button" aria-label="上一个 Benchmark" :disabled="benchmarks.length < 2 || changing" @click="select(index - 1)">←</button>
        <span class="deck-count">{{ String(index + 1).padStart(2, '0') }} / {{ String(benchmarks.length).padStart(2, '0') }}</span>
        <button type="button" aria-label="下一个 Benchmark" :disabled="benchmarks.length < 2 || changing" @click="select(index + 1)">→</button>
      </div>
    </div>
    <div class="deck-viewport" :style="{ '--slide-direction': direction }">
      <Transition name="benchmark-slide" mode="out-in" @after-enter="changing = false" @enter-cancelled="changing = false">
        <article v-if="active" :key="active.id" class="benchmark-slide" data-testid="benchmark-slide" :aria-label="active.name">
          <div class="benchmark-intro">
            <div class="benchmark-class"><span>{{ active.category }}</span><span>{{ demo ? 'DEMO' : active.version }}</span></div>
            <span class="benchmark-ordinal" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="benchmark-heading">
              <p class="benchmark-version">BENCHMARK / {{ active.version }}</p>
              <h3><RouterLink :to="'/ai-frontier/benchmarks/' + active.id">{{ active.name }}</RouterLink></h3>
              <p class="benchmark-summary">{{ active.description }}</p>
            </div>
            <RouterLink class="benchmark-report-link" :to="'/ai-frontier/benchmarks/' + active.id">查看完整测试报告 <span aria-hidden="true">↗</span></RouterLink>
          </div>
          <div class="benchmark-ranking">
            <div class="ranking-label"><span>MODEL / 排名</span><span>{{ active.scoreLabel }} {{ active.higherIsBetter === false ? '↓' : '↑' }}</span></div>
            <ol class="ranking-list">
              <li v-for="(model, rank) in rows" :key="model.id" :class="{ 'rank-winner': rank === 0 }">
                <span class="rank-number">{{ String(rank + 1).padStart(2, '0') }}</span>
                <div class="rank-model"><strong>{{ model.name }}</strong><span>{{ model.provider }}</span></div>
                <div class="rank-score"><strong>{{ displayScore(model.score) }}</strong><span>{{ active.unit }}</span></div>
                <div v-if="active.higherIsBetter !== false" class="rank-meter" aria-hidden="true"><i :style="{ width: Math.max(0, Math.min(100, model.score / (active.maxScore || 100) * 100)) + '%' }"></i></div>
              </li>
            </ol>
            <div class="ranking-footnote">{{ demo ? '演示数据 · 虚构模型 · 不代表真实能力' : '排名仅对应当前测试条件，请结合报告阅读。' }}</div>
          </div>
        </article>
      </Transition>
    </div>
    <div class="deck-pagination" aria-label="选择 Benchmark">
      <button v-for="(benchmark, item) in benchmarks" :key="benchmark.id" type="button" :aria-current="index === item ? 'true' : undefined"
        :aria-label="'切换至 ' + benchmark.name" :disabled="changing" @click="select(item)">
        <span>{{ String(item + 1).padStart(2, '0') }}</span>{{ benchmark.shortName }}
        <i v-if="item === index" :style="{ transform: 'scaleX(' + (reduced || paused ? 1 : progress) + ')' }" aria-hidden="true"></i>
      </button>
    </div>
    <p class="frontier-sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </section>
</template>

<style scoped>
.benchmark-deck{border:1px solid var(--f-line);margin-top:24px;outline-offset:6px}
.deck-toolbar{min-height:60px;display:flex;align-items:center;gap:24px;padding:0 22px;border-bottom:1px solid var(--f-line);font:11px/1.5 var(--f-mono,monospace);letter-spacing:.035em}
.deck-caption{font-weight:700}.deck-hint{margin-left:auto;color:var(--f-muted)}
.deck-controls{display:flex;align-items:center;gap:14px}.deck-controls button{border:0;border-left:1px solid var(--f-line);background:none;color:var(--f-ink);height:59px;min-width:38px;cursor:pointer;font-size:22px}
.deck-controls button:hover{color:var(--f-accent)}.deck-controls button:disabled{opacity:.4;cursor:default}.deck-controls .play-control{font:11px var(--f-mono,monospace);padding:0 12px;border-left:0}.play-control span{margin-left:6px}
.deck-count{white-space:nowrap;font-variant-numeric:tabular-nums}
.deck-viewport{overflow:hidden;min-height:496px}
.benchmark-slide{display:grid;grid-template-columns:5fr 7fr;min-height:496px}
.benchmark-intro{background:var(--f-accent);color:var(--f-on-accent);padding:26px 32px 24px;display:flex;flex-direction:column;position:relative;overflow:hidden}
.benchmark-class{display:flex;justify-content:space-between;text-transform:uppercase;font:11px var(--f-mono,monospace);letter-spacing:.1em;position:relative;z-index:1}
.benchmark-ordinal{position:absolute;right:20px;top:38px;font:italic 900 188px/.95 'Arial Narrow',Impact,sans-serif;letter-spacing:-.07em;opacity:.13;pointer-events:none}
.benchmark-heading{margin-top:auto;padding-top:66px;position:relative}
.benchmark-version{font:10px var(--f-mono,monospace);letter-spacing:.1em;margin:0 0 12px}
.benchmark-heading h3{font:800 clamp(30px,3.4vw,51px)/1.04 'Arial Narrow',Arial,sans-serif;letter-spacing:-.045em;margin:0;max-width:420px;text-wrap:balance}
.benchmark-heading h3 a{color:inherit;text-decoration:none}.benchmark-heading h3 a:hover{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px}
.benchmark-summary{font-size:13px;line-height:1.9;max-width:360px;opacity:.88;margin:20px 0 30px}
.benchmark-report-link{display:flex;align-items:center;justify-content:space-between;border-top:1px solid currentColor;padding-top:18px;font-size:13px;font-weight:600;color:inherit;text-decoration:none}
.benchmark-report-link span{font-size:24px;transition:transform .2s}.benchmark-report-link:hover span{transform:translate(3px,-3px)}
.benchmark-ranking{padding:25px 30px 18px;display:flex;flex-direction:column;min-width:0}
.ranking-label{display:flex;justify-content:space-between;font:10px var(--f-mono,monospace);letter-spacing:.07em;color:var(--f-muted);padding-bottom:17px;border-bottom:1px solid var(--f-ink)}
.ranking-list{padding:0;margin:0;list-style:none;flex:1}
.ranking-list li{display:grid;grid-template-columns:30px 1fr auto;gap:12px;align-items:center;position:relative;border-bottom:1px solid var(--f-line);min-height:61px;padding:10px 0 12px}
.rank-number{font:12px var(--f-mono,monospace);color:var(--f-muted)}
.rank-model{display:flex;flex-direction:column;gap:4px;min-width:0}.rank-model strong{font-size:15px;line-height:1.3}.rank-model>span{font:9px var(--f-mono,monospace);color:var(--f-muted)}
.rank-score{text-align:right;display:flex;align-items:baseline;gap:8px}.rank-score strong{font:600 23px var(--f-mono,monospace);letter-spacing:-.08em}.rank-score>span{font:9px var(--f-mono,monospace);color:var(--f-muted)}
.rank-winner .rank-number,.rank-winner .rank-score strong{color:var(--f-accent)}
.rank-meter{position:absolute;bottom:-1px;left:42px;right:0;height:2px}.rank-meter i{height:100%;display:block;background:var(--f-accent);opacity:.23}.rank-winner .rank-meter i{opacity:1}
.ranking-footnote{font-size:10px;color:var(--f-muted);padding-top:16px}
.deck-pagination{display:flex;border-top:1px solid var(--f-line)}
.deck-pagination button{flex:1;min-width:0;text-align:left;position:relative;padding:18px 22px;border:0;border-right:1px solid var(--f-line);background:none;color:var(--f-muted);font:11px var(--f-mono,monospace);cursor:pointer}
.deck-pagination button:last-child{border-right:0}.deck-pagination button span{margin-right:14px}.deck-pagination button[aria-current=true]{color:var(--f-accent);background:var(--f-panel);font-weight:700}
.deck-pagination button i{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;background:var(--f-accent);transition:transform .08s linear}
.benchmark-slide-enter-active{transition:opacity .3s ease,transform .38s cubic-bezier(.18,.75,.2,1)}.benchmark-slide-leave-active{transition:opacity .14s ease,transform .18s ease}
.benchmark-slide-enter-from{opacity:0;transform:translateY(calc(var(--slide-direction)*32px))}.benchmark-slide-leave-to{opacity:0;transform:translateY(calc(var(--slide-direction)*-20px))}
.frontier-sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media(min-width:1600px){.benchmark-slide,.deck-viewport{min-height:520px}}
@media(max-width:800px){.deck-toolbar{padding:0 12px;gap:8px}.deck-hint{display:none}.deck-controls{margin-left:auto;gap:6px}.deck-controls .play-control span{display:none}.benchmark-slide{grid-template-columns:1fr}.benchmark-intro{min-height:300px;padding:22px}.benchmark-heading{padding-top:42px}.benchmark-heading h3{font-size:40px}.benchmark-summary{margin:16px 0 24px}.benchmark-ranking{padding:22px}.deck-pagination button{padding:17px 10px;font-size:10px}.deck-pagination button span{display:block;margin:0 0 6px}.rank-score strong{font-size:21px}}
@media(prefers-reduced-motion:reduce){.benchmark-slide-enter-active,.benchmark-slide-leave-active,.deck-pagination button i,.benchmark-report-link span{transition:none}.benchmark-slide-enter-from,.benchmark-slide-leave-to{transform:none}}
</style>
