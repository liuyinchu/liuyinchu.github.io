<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import Avis3Leaderboard from '../components/frontier/Avis3Leaderboard.vue'
import Avis3Spectra from '../components/frontier/Avis3Spectra.vue'
import { OFFICIAL_BASE, OFFICIAL_DATA, PREVIEW_DATA, displayScore, orderedResults, useAvis3Data } from '../components/frontier/useAvis3Data'
import '../components/frontier/frontier-pages.css'

const route = useRoute()
const isPreview = computed(() => route.params.arenaId === 'avis3-preview')
const isKnown = computed(() => ['avis3', 'avis3-preview'].includes(route.params.arenaId))
const dataPath = computed(() => isKnown.value ? (isPreview.value ? PREVIEW_DATA : OFFICIAL_DATA) : '')
const { data, loading, error, load } = useAvis3Data(dataPath)
const contents = ref([])
const spectraOpen = ref(false)
const spectraContestant = ref('')
const pageName = computed(() => isPreview.value ? 'AVIS3 Arena · Preview' : 'AVIS3 Arena Plus')
const reportPath = computed(() => isPreview.value ? '/ai-frontier/archive/avis3-preview.md' : OFFICIAL_BASE + '/methodology.md')
const roundResults = computed(() => orderedResults(data.value).filter(result => Array.isArray(result.roundScores)))
const contestant = id => data.value.contestants.find(item => item.id === id)

function selectSpectra(id) {
  spectraContestant.value = id
  spectraOpen.value = true
}

watch(() => route.params.arenaId, () => {
  spectraOpen.value = false
  spectraContestant.value = ''
  contents.value = []
})
</script>

<template>
  <FrontierShell :title="isKnown ? pageName + ' · Ysy AI Frontier' : 'Ysy AI Frontier'" class="avis3-arena-page">
    <section v-if="!isKnown" class="frontier-missing" data-page="arena-not-found">
      <span class="frontier-soft-badge">Arena 未找到</span>
      <h1>404</h1><p>这份评测记录还不在观察档案里。</p>
      <RouterLink class="frontier-primary-link" to="/ai-frontier">返回 Ysy AI Frontier</RouterLink>
    </section>
    <p v-else-if="loading" class="frontier-state" role="status">正在读取 AVIS3 成绩…</p>
    <div v-else-if="error" class="frontier-state" role="alert">
      <p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载成绩</button>
    </div>
    <template v-else-if="data">
      <header class="frontier-report-cover">
        <nav v-if="isPreview" class="frontier-breadcrumb" aria-label="当前位置">
          <RouterLink to="/ai-frontier">AI Frontier</RouterLink><span aria-hidden="true">/</span><span>{{ pageName }}</span>
        </nav>
        <div class="frontier-report-heading">
          <div class="frontier-report-title">
            <div class="frontier-report-tags">
              <span class="frontier-soft-badge">{{ isPreview ? 'Preview 归档' : '正式排行榜' }}</span>
              <span v-if="data.batch" class="frontier-eyebrow">{{ data.batch }}</span>
            </div>
            <h1>{{ pageName }}</h1>
            <p v-if="isPreview">AVIS3 Arena 的早期预览记录，保留当时三个参赛组合的 10 轮成绩与频谱。</p>
            <p v-else>让 Agent 设计控制器，在受扰动、带噪声的耦合动力学系统中完成长程控制。排名对应每一次独立提交。</p>
            <div class="frontier-report-byline">
              <span>{{ data.evaluationVersion }}</span><span>{{ data.release }}</span>
              <time>{{ data.evaluatedAt }}</time><span>北京时间</span>
            </div>
          </div>
        </div>
        <div class="avis3-report-actions">
          <a href="#spectra" class="frontier-inline-link" @click="spectraOpen = true">查看{{ isPreview ? '逐轮' : '公开' }}频谱 ↓</a>
          <a href="#methodology" class="frontier-inline-link">评测与评分说明 ↓</a>
          <a :href="dataPath" class="frontier-inline-link" download>下载完整成绩 JSON</a>
          <RouterLink v-if="isPreview" class="frontier-inline-link" to="/ai-frontier/arena/avis3">查看 Plus 正式榜 →</RouterLink>
        </div>
        <div class="frontier-report-meta">
          <div><span>参赛条目</span><strong>{{ data.contestants.length }}</strong><small v-if="data.distinctModels">{{ data.distinctModels }} 个不同模型</small></div>
          <div><span>每位测评</span><strong>{{ data.scoring.roundCount }} <small>轮</small></strong><small>{{ isPreview ? '独立随机场景' : '同一组私有场景' }}</small></div>
          <div><span>{{ isPreview ? '历史测评' : '完整结果' }}</span><strong>{{ data.totalRounds || data.results.reduce((sum, result) => sum + result.rounds, 0) }} <small>轮完成</small></strong><small>{{ data.failures || 0 }} 规则失败</small></div>
        </div>
      </header>

      <section id="results" class="frontier-section" aria-labelledby="avis3-results-title">
        <div class="frontier-section-heading">
          <div><h2 id="avis3-results-title">{{ isPreview ? 'Preview 排名' : '正式排名' }}</h2></div>
          <p>原始积分均分 · 积分秒（s）· 越高越好</p>
        </div>
        <p v-if="!isPreview" class="avis3-comparison-note">全部参赛条目使用相同的 20 个场景。同名模型按编号独立排名。</p>
        <div class="avis3-result-card">
          <Avis3Leaderboard :arena="data" :expandable="!isPreview" @select-spectra="selectSpectra" />
        </div>
      </section>

      <section v-if="isPreview && roundResults.length" class="frontier-section" aria-labelledby="avis3-rounds-title">
        <div class="frontier-section-heading"><div><h2 id="avis3-rounds-title">Preview 逐轮结果</h2></div></div>
        <p class="avis3-comparison-note">预览版为各选手分别抽取随机场景，同编号轮次使用不同场景。</p>
        <div class="avis3-round-grid">
          <article v-for="result in roundResults" :key="result.contestantId" class="avis3-round-card">
            <h3>{{ contestant(result.contestantId).model }}</h3>
            <p>{{ contestant(result.contestantId).harness }} · {{ result.contestantId }}</p>
            <ol class="avis3-round-list">
              <li v-for="(score, index) in result.roundScores" :key="index"><span>第 {{ index + 1 }} 轮</span><strong :title="String(score)">{{ displayScore(score) }}</strong></li>
            </ol>
          </article>
        </div>
      </section>

      <section id="spectra" class="frontier-section" aria-labelledby="avis3-spectra-title">
        <div class="frontier-section-heading">
          <div><h2 id="avis3-spectra-title">{{ isPreview ? 'Preview 逐轮频谱' : '真实输出频谱' }}</h2></div>
          <p>{{ isPreview ? '三路输出与当轮无控制基线' : '20 轮功率平均与统一第 1 轮' }}</p>
        </div>
        <p v-if="!isPreview" class="avis3-spectrum-intro">每位选手提供 20 轮功率平均，以及第 1 轮的受控真值与无控制基线。选定后按需读取。</p>
        <button v-if="!spectraOpen" class="frontier-text-button" type="button" @click="spectraOpen = true">打开频谱查看器</button>
        <Avis3Spectra v-else :key="dataPath" :arena="data" :selected-contestant="spectraContestant" />
      </section>

      <section v-if="!isPreview" class="frontier-section avis3-preview-history" aria-labelledby="avis3-history-title">
        <div><h2 id="avis3-history-title">从 AVIS3 Arena 到 Plus</h2>
          <p>早期 AVIS3 Arena preview 的题目相对简单，模型间成绩较为接近。正式榜采用难度更高的 AVIS3 Arena Plus，以更充分地区分各次提交的表现。两版分别保留对应的评测条件、评分量程与成绩。</p>
        </div>
        <RouterLink class="frontier-inline-link" to="/ai-frontier/arena/avis3-preview">查看 Preview 归档 →</RouterLink>
      </section>

      <section id="methodology" class="frontier-section" aria-labelledby="avis3-method-title">
        <div class="frontier-section-heading"><div><h2 id="avis3-method-title">评测与评分说明</h2></div></div>
        <div class="frontier-reading-grid">
          <article class="frontier-reading-card">
            <div class="frontier-article-label"><span>{{ isPreview ? 'Preview 历史说明' : 'AVIS3 Arena Plus' }}</span><span>{{ data.evaluationVersion }}</span></div>
            <FrontierMarkdown :src="reportPath" @toc-generated="contents = $event" />
          </article>
          <aside class="frontier-reading-sidebar"><FrontierContents :items="contents" /><RouterLink class="frontier-sidebar-back" to="/ai-frontier">← 返回 AI Frontier</RouterLink></aside>
        </div>
      </section>
    </template>
  </FrontierShell>
</template>

<style scoped>
.avis3-arena-page :deep(.frontier-report-cover) { padding-top: 24px; }
.avis3-arena-page :deep(.frontier-report-title > p) { max-width: none; }
.avis3-arena-page :deep(.frontier-section-heading h2) { margin-top: 0; }
.avis3-report-actions { display: flex; flex-wrap: wrap; gap: 12px 28px; margin-top: 16px; }
.avis3-arena-page :deep(.frontier-report-title h1) { font-size: clamp(30px, 3.6vw, 48px); line-height: 1.12; text-transform: none; letter-spacing: -.025em; }
.avis3-arena-page :deep(.frontier-report-meta) { margin: 20px 0 10px; padding-block: 14px; }
.avis3-arena-page :deep(.frontier-section-heading) { margin-bottom: 18px; }
.avis3-arena-page :deep(.avis3-result-card) { padding: 18px 24px; }
.avis3-spectrum-intro { color: var(--f-muted); font-size: 13px; line-height: 1.8; margin-bottom: 18px; }
.avis3-preview-history { display: flex; align-items: center; gap: 28px; padding: 24px; border: 1px solid var(--f-line); background: var(--f-panel); }
.avis3-preview-history h2 { margin: 0 0 10px; font-size: 18px; }
.avis3-preview-history p { margin: 0; color: var(--f-muted); font-size: 13px; line-height: 1.8; }
.avis3-preview-history > a { flex-shrink: 0; }
@media (max-width: 760px) {
  .avis3-arena-page :deep(.frontier-report-meta) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 14px 12px; }
  .avis3-arena-page :deep(.frontier-report-meta > div:last-child) { grid-column: auto; border-top: 0; padding-top: 0; }
  .avis3-arena-page :deep(.frontier-report-title > p) { margin-bottom: 12px; }
  .avis3-arena-page :deep(.avis3-result-card) { padding: 12px 16px; }
  .avis3-preview-history { align-items: flex-start; flex-direction: column; padding: 20px; gap: 18px; }
}
</style>
