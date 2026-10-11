<script setup>
import { computed } from 'vue'
import { displayScore, orderedResults } from './useAvis3Data'

const props = defineProps({ arena: { type: Object, required: true } })
const results = computed(() => orderedResults(props.arena))
const pending = computed(() => props.arena.contestants.filter(contestant =>
  !results.value.some(result => result.contestantId === contestant.id)))
const hasStd = computed(() => results.value.some(result => typeof result.std === 'number'))
const rank = (index) => results.value.findIndex(result => result.mean === results.value[index].mean) + 1
const contestant = (id) => props.arena.contestants.find(item => item.id === id)
const barWidth = (score) => Math.max(0, Math.min(100, score / props.arena.scoring.theoreticalMax * 100)) + '%'
</script>

<template>
  <div class="avis3-leaderboard" data-testid="avis3-leaderboard">
    <p v-if="!results.length" class="avis3-pending-message" role="status">成绩正在核验，确认后将在这里公布。</p>
    <table class="avis3-results-table">
      <caption class="avis3-visually-hidden">AVIS3 模型、运行环境与已核验成绩</caption>
      <thead><tr><th scope="col" class="avis3-rank-heading">名次</th><th scope="col">模型 / 运行环境</th><th scope="col">{{ arena.scoring?.label || '成绩' }}</th><th v-if="hasStd" scope="col">样本标准差</th><th scope="col">轮次记录</th></tr></thead>
      <tbody>
        <tr v-for="(result, index) in results" :key="result.contestantId" data-testid="avis3-result">
          <td class="avis3-rank" data-label="名次">{{ rank(index) }}</td>
          <td class="avis3-contestant">
            <span class="avis3-contestant-id">{{ result.contestantId }}</span>
            <strong>{{ contestant(result.contestantId).model }}</strong>
            <span class="avis3-harness">{{ contestant(result.contestantId).harness }}</span>
          </td>
          <td class="avis3-result-score" :data-label="arena.scoring?.label || '成绩'">
            <strong :title="String(result.mean)">{{ displayScore(result.mean) }}</strong><small v-if="arena.scoring?.unit">{{ arena.scoring.unit }}</small>
            <span v-if="arena.scoring?.theoreticalMax > 0" class="avis3-score-track" aria-hidden="true"><i :style="{ width: barWidth(result.mean) }"></i></span>
          </td>
          <td v-if="hasStd" class="avis3-number" data-label="样本标准差" :title="typeof result.std === 'number' ? String(result.std) : undefined">{{ displayScore(result.std) }}</td>
          <td class="avis3-round-status" data-label="轮次记录"><span>{{ result.rounds }} 轮</span><small>{{ result.failures }} 失败</small></td>
        </tr>
        <tr v-for="item in pending" :key="item.id" data-testid="avis3-pending">
          <td class="avis3-rank">—</td>
          <td class="avis3-contestant"><span class="avis3-contestant-id">{{ item.id }}</span><strong>{{ item.model }}</strong><span class="avis3-harness">{{ item.harness }}</span></td>
          <td class="avis3-pending-cell" :colspan="hasStd ? 3 : 2">待核验</td>
        </tr>
      </tbody>
    </table>
    <p class="avis3-results-note">
      展示四位小数，按原始均值排序。编号仅用于识别选手，成绩按{{ arena.scoring?.higherIsBetter === false ? '升序' : '降序' }}展示；原始均值完全相等时并列，采用 1、1、3 的竞争名次。
      <span v-if="arena.scoring?.theoreticalMax > 0">条形量程为 0 至 {{ arena.scoring.theoreticalMax }}。</span>
      <span v-if="hasStd">标准差为样本标准差（ddof = 1）。</span><span v-else-if="results.length">标准差尚未公布。</span>
    </p>
  </div>
</template>
