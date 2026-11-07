<script setup>
import { computed, ref, watch } from 'vue'
import { displayScore, orderedResults } from './useAvis3Data'
import Avis3ResultDetails from './Avis3ResultDetails.vue'

const props = defineProps({
  arena: { type: Object, required: true },
  limit: { type: Number, default: 0 },
  expandable: { type: Boolean, default: false },
})
const emit = defineEmits(['select-spectra'])
const expandedId = ref(null)
const results = computed(() => orderedResults(props.arena))
const visibleResults = computed(() => props.limit > 0 ? results.value.slice(0, props.limit) : results.value)
const pending = computed(() => props.arena.contestants.filter(contestant =>
  !results.value.some(result => result.contestantId === contestant.id)))
const hasStd = computed(() => results.value.some(result => typeof result.std === 'number'))
const rank = (index) => results.value.findIndex(result => result.mean === results.value[index].mean) + 1
const contestant = (id) => props.arena.contestants.find(item => item.id === id)
const barWidth = (score) => Math.max(0, Math.min(100, score / props.arena.scoring.theoreticalMax * 100)) + '%'
const detailId = (id) => 'avis3-details-' + encodeURIComponent(id)
function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}
watch(() => props.arena, () => { expandedId.value = null })
</script>

<template>
  <div class="avis3-leaderboard" data-testid="avis3-leaderboard">
    <p v-if="!results.length" class="avis3-pending-message" role="status">成绩正在核验，确认后将在这里公布。</p>
    <table class="avis3-results-table">
      <caption class="avis3-visually-hidden">{{ arena.name || 'AVIS3' }} 模型、运行环境与已核验成绩</caption>
      <thead><tr><th scope="col" class="avis3-rank-heading">名次</th><th scope="col">模型 / 运行环境</th><th scope="col">{{ arena.scoring?.label || '成绩' }}</th><th v-if="hasStd" scope="col">样本标准差</th><th scope="col">轮次记录</th></tr></thead>
      <tbody>
        <template v-for="(result, index) in visibleResults" :key="result.contestantId">
          <tr data-testid="avis3-result" :data-entry-id="result.contestantId">
            <td class="avis3-rank" data-label="名次">{{ rank(index) }}</td>
            <td class="avis3-contestant">
              <strong>{{ contestant(result.contestantId).model }}</strong>
              <span class="avis3-harness">{{ contestant(result.contestantId).harness }}</span>

            </td>
            <td class="avis3-result-score" :data-label="arena.scoring?.label || '成绩'">
              <strong :title="String(result.mean)">{{ displayScore(result.mean) }}</strong>
              <span v-if="arena.scoring?.theoreticalMax > 0" class="avis3-score-track" aria-hidden="true"><i :style="{ width: barWidth(result.mean) }"></i></span>
            </td>
            <td v-if="hasStd" class="avis3-number" data-label="样本标准差" :title="typeof result.std === 'number' ? String(result.std) : undefined">{{ displayScore(result.std) }}</td>
            <td class="avis3-round-status" data-label="轮次记录"><span>{{ result.rounds }} 轮</span><small v-if="result.failures > 0">{{ result.failures }} 失败</small>
              <button v-if="expandable" type="button" class="avis3-expand-button"
                :aria-expanded="expandedId === result.contestantId" :aria-controls="detailId(result.contestantId)"
                :aria-label="(expandedId === result.contestantId ? '收起' : '展开') + contestant(result.contestantId).model + ' · 均分 ' + displayScore(result.mean) + ' 的详细结果'"
                @click="toggleDetails(result.contestantId)">{{ expandedId === result.contestantId ? '收起详情' : '展开详情' }}</button>
            </td>
          </tr>
          <tr v-if="expandable" v-show="expandedId === result.contestantId" :id="detailId(result.contestantId)" class="avis3-details-row">
            <td :colspan="hasStd ? 5 : 4">
              <Avis3ResultDetails v-if="expandedId === result.contestantId" :contestant="contestant(result.contestantId)" :result="result" :scoring="arena.scoring"
                @select-spectra="emit('select-spectra', $event)" />
            </td>
          </tr>
        </template>
        <tr v-for="item in pending" :key="item.id" data-testid="avis3-pending">
          <td class="avis3-rank">—</td>
          <td class="avis3-contestant"><strong>{{ item.model }}</strong><span class="avis3-harness">{{ item.harness }}</span></td>
          <td class="avis3-pending-cell" :colspan="hasStd ? 3 : 2">待核验</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.avis3-leaderboard .avis3-results-table th:nth-child(2) { width: 34%; }
.avis3-expand-button {
  margin-top: 10px; min-height: 44px; padding: 6px 9px; border: 1px solid var(--f-line);
  background: var(--f-paper); color: var(--f-ink); font: 12px/1.5 var(--f-font);
  text-align: left; white-space: normal; cursor: pointer;
}
.avis3-expand-button:hover, .avis3-expand-button[aria-expanded="true"] { background: var(--f-panel); border-color: var(--f-ink); }
.avis3-leaderboard .avis3-result-score strong { font-size: 24px; }
.avis3-leaderboard .avis3-details-row > td { padding: 0; }
@media (max-width: 760px) {
  .avis3-leaderboard .avis3-result-score strong { font-size: 20px; }
  .avis3-leaderboard .avis3-results-table .avis3-details-row { grid-template-columns: minmax(0, 1fr); padding: 0; }
  .avis3-leaderboard .avis3-results-table .avis3-details-row > td { grid-column: 1 / -1; padding: 0; min-width: 0; }
}
</style>
