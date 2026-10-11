<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { displayScore, orderedResults } from './useAvis3Data'
import { buildSpectraCharts, SPECTRA_FRAME } from './avis3SpectraPlot'

const props = defineProps({ arena: { type: Object, required: true } })
const contestantId = ref(orderedResults(props.arena)[0]?.contestantId || props.arena.contestants[0]?.id)
const roundIndex = ref(1)
const source = shallowRef(null)
const charts = shallowRef([])
const loading = ref(true)
const error = ref('')
let controller

const contestants = computed(() => orderedResults(props.arena).map(result =>
  props.arena.contestants.find(contestant => contestant.id === result.contestantId)).filter(Boolean))
const contestant = computed(() => props.arena.contestants.find(item => item.id === contestantId.value))
const roundResult = computed(() => props.arena.results.find(item => item.contestantId === contestantId.value))
const roundCount = computed(() => roundResult.value?.roundScores?.length || props.arena.scoring?.roundCount || 10)
const roundScore = computed(() => roundResult.value?.roundScores?.[roundIndex.value - 1])
const roundLabel = computed(() => String(roundIndex.value).padStart(2, '0'))
const dataPath = computed(() => '/ai-frontier/arena/avis3/spectra/' + contestantId.value + '/round-' + roundLabel.value + '.json')
const xTicks = [0.01, 0.1, 1, 10, 100].map(value => ({
  label: String(value), x: SPECTRA_FRAME.left + (Math.log10(value) + 2) / 4 * SPECTRA_FRAME.width,
}))

async function load() {
  controller?.abort()
  const request = new AbortController()
  controller = request
  const id = contestantId.value
  const round = roundIndex.value
  loading.value = true
  error.value = ''
  source.value = null
  charts.value = []
  try {
    const response = await fetch(dataPath.value, { signal: request.signal })
    if (!response.ok) throw new Error('Spectra unavailable')
    const result = await response.json()
    if (result.contestant_id !== id || result.round_index !== round) {
      throw new Error('Spectra do not match the selected round')
    }
    const plots = buildSpectraCharts(result)
    if (request.signal.aborted) return
    source.value = result
    charts.value = plots
  } catch (cause) {
    if (!request.signal.aborted) error.value = '本轮频谱暂时无法加载，请稍后重试。'
  } finally {
    if (!request.signal.aborted) loading.value = false
  }
}

watch([contestantId, roundIndex], load, { immediate: true, flush: 'sync' })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div class="avis3-spectra" data-testid="avis3-spectra" :aria-busy="loading">
    <div class="spectra-controls">
      <label for="avis3-spectra-contestant"><span>参测组合 / CONTESTANT</span>
        <select id="avis3-spectra-contestant" v-model="contestantId">
          <option v-for="item in contestants" :key="item.id" :value="item.id">{{ item.model }} · {{ item.harness }}</option>
        </select>
      </label>
      <label for="avis3-spectra-round"><span>轮次 / ROUND</span>
        <select id="avis3-spectra-round" v-model.number="roundIndex">
          <option v-for="round in roundCount" :key="round" :value="round">第 {{ round }} 轮</option>
        </select>
      </label>
    </div>

    <div class="spectra-current" aria-live="polite">
      <div class="spectra-round-heading"><span class="spectra-registration">{{ contestantId }} / ROUND {{ roundLabel }}</span>
        <h3>{{ contestant?.model }} <span>· 第 {{ roundIndex }} 轮</span></h3>
      </div>
      <div class="spectra-score"><span>本轮分数</span><strong :title="String(roundScore)" data-testid="spectra-round-score">{{ displayScore(roundScore) }}</strong></div>
    </div>

    <div class="spectra-reading-key">
      <p>同一轮受控真值 / 无控制基线</p>
      <ul class="spectra-legend" aria-label="频谱图例">
        <li><i class="spectra-line controlled" aria-hidden="true"></i>受控真值</li>
        <li><i class="spectra-line baseline" aria-hidden="true"></i>无控制基线</li>
      </ul>
    </div>

    <p v-if="loading" class="spectra-state" role="status">正在读取 {{ contestantId }} 第 {{ roundIndex }} 轮频谱…</p>
    <div v-else-if="error" class="spectra-state" role="alert"><p>{{ error }}</p><button type="button" @click="load">重新加载频谱</button></div>
    <template v-else-if="source">
      <div class="spectra-data-meta"><span>{{ source.frequency_hz.length.toLocaleString('en-US') }} 频率点 / 0.01–100 Hz</span><span>位移等效 ASD / m/√Hz</span><a :href="dataPath">当前轮频谱 JSON ↗</a></div>
      <div class="spectra-grid">
        <figure v-for="chart in charts" :key="chart.channel" class="spectra-plot" :data-channel="chart.channel">
          <figcaption><strong>{{ chart.channel }}</strong><span>LOG / LOG</span></figcaption>
          <svg viewBox="0 0 360 290" role="img" :aria-labelledby="'spectra-title-' + chart.channel + ' spectra-desc-' + chart.channel">
            <title :id="'spectra-title-' + chart.channel">{{ contestant?.model }}，第 {{ roundIndex }} 轮，{{ chart.channel }} 位移等效 ASD</title>
            <desc :id="'spectra-desc-' + chart.channel">受控真值为实线，无控制基线为虚线。横轴频率 0.01 至 100 Hz，纵轴单位 m/√Hz，两轴均为对数刻度。纵轴按本通道两条曲线的正值实际范围留白。</desc>
            <text class="spectra-unit" :x="SPECTRA_FRAME.left" y="20">ASD / m/√Hz</text>
            <g class="spectra-grid-lines" aria-hidden="true">
              <line v-for="tick in xTicks" :key="'x-' + tick.label" :x1="tick.x" :x2="tick.x" :y1="SPECTRA_FRAME.top" :y2="SPECTRA_FRAME.bottom" />
              <line v-for="tick in chart.ticks" :key="'y-' + tick.label" :x1="SPECTRA_FRAME.left" :x2="SPECTRA_FRAME.right" :y1="tick.y" :y2="tick.y" />
            </g>
            <rect class="spectra-frame" :x="SPECTRA_FRAME.left" :y="SPECTRA_FRAME.top" :width="SPECTRA_FRAME.width" :height="SPECTRA_FRAME.height" />
            <g class="spectra-curves" aria-hidden="true">
              <path class="spectra-baseline" :d="chart.baselinePath" data-series="baseline" />
              <path class="spectra-controlled" :d="chart.controlledPath" data-series="controlled" />
            </g>
            <g class="spectra-ticks" aria-hidden="true">
              <text v-for="tick in xTicks" :key="tick.label" :x="tick.x" :y="SPECTRA_FRAME.bottom + 22" text-anchor="middle">{{ tick.label }}</text>
              <text v-for="tick in chart.ticks" :key="tick.label" :x="SPECTRA_FRAME.left - 9" :y="tick.y + 4" text-anchor="end">{{ tick.label }}</text>
              <text :x="SPECTRA_FRAME.left + SPECTRA_FRAME.width / 2" y="278" text-anchor="middle">频率 / Hz</text>
            </g>
          </svg>
        </figure>
      </div>
    </template>

    <div class="spectra-notes"><p>不同选手同编号轮次使用不同场景，不能按轮号配对比较。各图纵轴随本通道两条曲线的实际范围变化，曲线高度不直接代表抑制比例。</p>
      <p>曲线来自真实速度输出换算的位移等效 ASD，保留每个频率点。频谱用于读图，不是积分评分的来源。<a href="#methodology">查看频谱方法与评分说明 ↘</a></p>
    </div>
  </div>
</template>

<style scoped>
.avis3-spectra { min-width: 0; border: 1px solid var(--f-line); background: var(--f-surface); padding: 24px; }
.spectra-controls { display: grid; grid-template-columns: minmax(0, 1fr) 180px; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid var(--f-line); }
.spectra-controls label { display: flex; flex-direction: column; min-width: 0; gap: 8px; }
.spectra-controls label > span { color: var(--f-muted); font: 10px/1.6 var(--f-mono); letter-spacing: .06em; }
.spectra-controls select { width: 100%; min-width: 0; min-height: 44px; padding: 10px 12px; border: 1px solid var(--f-line); border-radius: 0; background: var(--f-paper); color: var(--f-ink); font: 13px/1.5 var(--f-font); cursor: pointer; }
.spectra-current { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding: 22px 0 18px; }
.spectra-registration { color: var(--f-muted); font: 10px/1.5 var(--f-mono); letter-spacing: .08em; }
.spectra-round-heading { min-width: 0; }
.spectra-round-heading h3 { margin: 6px 0 0; font: 650 18px/1.55 var(--f-font); overflow-wrap: anywhere; }
.spectra-round-heading h3 span { color: var(--f-muted); font-size: 13px; font-weight: 400; white-space: nowrap; }
.spectra-score { display: flex; align-items: baseline; gap: 12px; font-variant-numeric: tabular-nums; }
.spectra-score > span { color: var(--f-muted); font-size: 11px; }
.spectra-score strong { color: var(--f-ink); font: 600 21px/1.5 var(--f-mono); }
.spectra-reading-key { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px 24px; border-block: 1px solid var(--f-line); padding: 12px 0; }
.spectra-reading-key > p { margin: 0; font-size: 12px; }
.spectra-legend { display: flex; flex-wrap: wrap; gap: 10px 20px; padding: 0; margin: 0; list-style: none; font-size: 12px; }
.spectra-legend li { display: flex; align-items: center; gap: 8px; }
.spectra-line { display: inline-block; width: 25px; height: 0; border-top: 2px solid var(--f-rust); }
.spectra-line.baseline { border-top: 2px dashed #777a73; }
.spectra-data-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 7px 20px; margin: 18px 0 14px; color: var(--f-muted); font: 11px/1.6 var(--f-mono); }
.spectra-data-meta a { margin-left: auto; }
.spectra-data-meta a, .spectra-notes a { color: var(--f-ink); text-decoration: underline; text-underline-offset: 3px; }
.spectra-data-meta a:hover, .spectra-notes a:hover { color: var(--f-ink); }
.spectra-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.spectra-plot { min-width: 0; margin: 0; padding: 12px 8px 4px; border: 1px solid var(--f-line); background: var(--f-paper); }
.spectra-plot figcaption { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 7px 8px; font-family: var(--f-mono); }
.spectra-plot figcaption strong { color: var(--f-ink); font-size: 15px; font-weight: 600; }
.spectra-plot figcaption > span { color: var(--f-muted); font-size: 9px; letter-spacing: .08em; }
.spectra-plot svg { display: block; width: 100%; height: auto; overflow: visible; }
.spectra-unit, .spectra-ticks { fill: var(--f-muted); font: 12.5px/1 var(--f-mono); }
.spectra-grid-lines { stroke: var(--f-line); stroke-width: .5; opacity: .6; }
.spectra-frame { fill: none; stroke: var(--f-line); stroke-width: 1; }
.spectra-curves { fill: none; stroke-linejoin: round; }
.spectra-baseline { stroke: #777a73; stroke-width: 1.25; stroke-dasharray: 4 3; }
.spectra-controlled { stroke: var(--f-rust); stroke-width: 1.5; }
.spectra-state { min-height: 290px; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 14px; margin: 0; padding: 24px 0; color: var(--f-muted); font-size: 13px; text-align: center; }
.spectra-state p { margin: 0; }
.spectra-state button { min-height: 44px; padding: 9px 16px; border: 1px solid var(--f-ink); background: var(--f-paper); color: var(--f-ink); font: 600 12px/1.5 var(--f-font); cursor: pointer; }
.spectra-state button:hover { background: var(--f-panel); }
.spectra-notes { border-top: 1px solid var(--f-line); padding-top: 14px; margin-top: 20px; color: var(--f-muted); font-size: 12px; line-height: 1.85; }
.spectra-notes p { margin: 0; }
.spectra-notes p + p { margin-top: 6px; }
@media (max-width: 1050px) { .spectra-grid { grid-template-columns: 1fr; } .spectra-plot { max-width: 640px; width: 100%; box-sizing: border-box; margin-inline: auto; } }
@media (max-width: 680px) { .avis3-spectra { padding: 16px 12px; } .spectra-controls { grid-template-columns: 1fr; gap: 14px; padding-bottom: 18px; } .spectra-current { gap: 12px; padding-block: 18px; } .spectra-round-heading h3 { font-size: 16px; } .spectra-score strong { font-size: 19px; } .spectra-data-meta { font-size: 11px; gap: 6px; } .spectra-data-meta > span { width: 100%; } .spectra-data-meta a { margin: 2px 0 0; } .spectra-plot { padding: 12px 4px 4px; } .spectra-grid { gap: 16px; } .spectra-unit, .spectra-ticks { font-size: 13px; } }
</style>
