<script setup>
import { computed } from 'vue'
import { displayScore } from './useAvis3Data'
import FrontierMarkdown from './FrontierMarkdown.vue'

const props = defineProps({
  contestant: { type: Object, required: true },
  result: { type: Object, required: true },
  scoring: { type: Object, required: true },
})
const emit = defineEmits(['select-spectra'])
const scores = computed(() => props.result.roundScores || [])
const minimum = computed(() => props.result.min ?? (scores.value.length ? Math.min(...scores.value) : undefined))
const maximum = computed(() => props.result.max ?? (scores.value.length ? Math.max(...scores.value) : undefined))
const unit = computed(() => props.scoring.unit || '')
const chartTitle = computed(() => props.contestant.model + ' · ' + scores.value.length + ' 轮成绩分布')
const width = score => Math.max(0, Math.min(100, score / props.scoring.theoreticalMax * 100)) + '%'
const pointTitle = (score, index) => '第 ' + (index + 1) + ' 轮：' + score + (unit.value ? ' ' + unit.value : '')
</script>

<template>
  <section class="avis3-result-details" data-testid="avis3-result-details" :aria-label="contestant.model + ' 详细结果'">
    <header class="result-details-heading">
      <h3>{{ contestant.model }} <span>· {{ contestant.number || contestant.id }}</span></h3>
      <a href="#spectra" @click="emit('select-spectra', contestant.id)">查看该选手频谱</a>
    </header>
    <dl class="result-summary">
      <div><dt>最低分</dt><dd :title="String(minimum)">{{ displayScore(minimum) }} <small>{{ unit }}</small></dd></div>
      <div><dt>最高分</dt><dd :title="String(maximum)">{{ displayScore(maximum) }} <small>{{ unit }}</small></dd></div>
      <div><dt>规则失败</dt><dd>{{ result.failures }} <small>/ {{ result.rounds }} 轮</small></dd></div>
    </dl>

    <figure v-if="scores.length" class="round-distribution">
      <figcaption>{{ chartTitle }}</figcaption>
      <p class="round-axis-title">逐轮成绩 <span v-if="unit">/ {{ unit }}</span></p>
      <div class="round-axis" aria-hidden="true"><span>0</span><span>{{ displayScore(scoring.theoreticalMax) }} {{ unit }}</span></div>
      <ol class="result-round-scores" aria-label="逐轮成绩">
        <li v-for="(score, index) in scores" :key="index" :title="pointTitle(score, index)">
          <span class="round-label">第 {{ index + 1 }} 轮</span>
          <span class="round-score-bar" aria-hidden="true"><i :style="{ width: width(score) }"></i></span>
          <strong :title="String(score)">{{ displayScore(score) }}<small v-if="unit"> {{ unit }}</small></strong>
        </li>
      </ol>
      <p class="round-chart-note">所有轮次采用 0 至 {{ scoring.theoreticalMax }} {{ unit }} 的共同量程。</p>
    </figure>

    <dl class="submission-context">
      <div><dt>Harness</dt><dd>{{ contestant.harness }}</dd></div>
      <div v-if="contestant.apiRoute"><dt>API 路由</dt><dd>{{ contestant.apiRoute }}</dd></div>
      <div v-if="contestant.thinking"><dt>思考配置</dt><dd>{{ contestant.thinking }}</dd></div>
      <div v-if="contestant.controllerFormat"><dt>控制器格式</dt><dd>{{ contestant.controllerFormat }}</dd></div>
      <div v-if="contestant.controllerSummary"><dt>控制器摘要</dt><dd class="controller-summary">{{ contestant.controllerSummary }}</dd></div>
    </dl>
    <details v-if="contestant.selfReport" class="submission-report">
      <summary>提交时自述</summary>
      <p class="submission-report-note">选手提交时自述。文中的开发测试成绩和当时进度属于提交时记录。</p>
      <FrontierMarkdown :content="contestant.selfReport" />
    </details>
  </section>
</template>

<style scoped>
.avis3-result-details { min-width: 0; padding: 26px; border-inline: 1px solid var(--f-line); background: var(--f-paper); color: var(--f-ink); }
.result-details-heading { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px 24px; }
.result-details-heading h3 { margin: 0; font: 650 17px/1.6 var(--f-font); overflow-wrap: anywhere; }
.result-details-heading h3 span { color: var(--f-muted); font: 12px/1.6 var(--f-mono); }
.result-details-heading a { color: var(--f-ink); text-underline-offset: 4px; font-size: 12px; }
.result-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 22px 0; padding-block: 16px; border-block: 1px solid var(--f-line); }
.result-summary dt, .submission-context dt { color: var(--f-muted); font: 11px/1.6 var(--f-font); }
.result-summary dd { margin: 5px 0 0; overflow-wrap: anywhere; font: 600 16px/1.6 var(--f-mono); font-variant-numeric: tabular-nums; }
.result-summary small { color: var(--f-muted); font: 11px/1.6 var(--f-font); }
.round-distribution { margin: 24px 0; min-width: 0; }
.round-distribution figcaption { font-weight: 650; font-size: 14px; overflow-wrap: anywhere; }
.round-axis-title { color: var(--f-muted); font-size: 11px; margin: 12px 0 4px; }
.round-axis { display: flex; justify-content: space-between; margin-left: 58px; margin-right: 112px; border-bottom: 1px solid var(--f-line); padding-bottom: 5px; font: 10px/1.5 var(--f-mono); color: var(--f-muted); }
.result-round-scores { padding: 0; margin: 8px 0 0; list-style: none; }
.result-round-scores li { display: grid; grid-template-columns: 50px minmax(0, 1fr) 104px; align-items: center; gap: 8px; min-height: 30px; }
.round-label { color: var(--f-muted); font-size: 11px; }
.round-score-bar { display: block; height: 12px; background: var(--f-panel); border-left: 1px solid var(--f-line); }
.round-score-bar i { display: block; height: 100%; background: var(--f-blue); }
.result-round-scores strong { font: 500 12px/1.5 var(--f-mono); text-align: right; font-variant-numeric: tabular-nums; }
.result-round-scores small { font-size: 10px; color: var(--f-muted); }
.round-chart-note, .submission-report-note { margin: 12px 0; color: var(--f-muted); font-size: 12px; line-height: 1.8; overflow-wrap: anywhere; }
.submission-context { margin: 24px 0 0; border-top: 1px solid var(--f-line); }
.submission-context > div { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; margin-top: 14px; }
.submission-context dd { margin: 0; font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
.controller-summary { white-space: pre-wrap; }
.submission-report { margin-top: 24px; border-top: 1px solid var(--f-line); }
.submission-report summary { padding: 14px 0; cursor: pointer; font-size: 13px; font-weight: 600; }
.submission-report :deep(.frontier-markdown) { min-width: 0; }
@media (max-width: 760px) {
  .avis3-result-details { padding: 20px 12px; border-inline: 0; }
  .result-summary { gap: 10px; }
  .result-summary dd { font-size: 13px; }
  .result-round-scores li { grid-template-columns: 42px minmax(0, 1fr) 88px; gap: 6px; min-height: 32px; }
  .round-axis { margin-left: 48px; margin-right: 94px; font-size: 9px; }
  .result-round-scores strong { font-size: 11px; }
  .submission-context > div { grid-template-columns: 1fr; gap: 3px; }
}
</style>
