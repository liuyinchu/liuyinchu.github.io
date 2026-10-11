<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import Avis3Leaderboard from '../components/frontier/Avis3Leaderboard.vue'
import { displayScore, orderedResults, useAvis3Data } from '../components/frontier/useAvis3Data'
import '../components/frontier/frontier-pages.css'

const route = useRoute()
const { data, loading, error, load } = useAvis3Data()
const contents = ref([])
const isAvis3 = computed(() => route.params.arenaId === 'avis3')
const roundResults = computed(() => orderedResults(data.value).filter(result => Array.isArray(result.roundScores)))
const contestant = (id) => data.value.contestants.find(item => item.id === id)
</script>

<template>
  <FrontierShell :title="isAvis3 ? 'AVIS3 Arena · Ysy AI Frontier' : 'Ysy AI Frontier'">
    <section v-if="!isAvis3" class="frontier-missing" data-page="arena-not-found">
      <span class="frontier-soft-badge">Arena 未找到</span><h1>404</h1><p>这份评测记录还不在观察档案里。</p><RouterLink class="frontier-primary-link" to="/ai-frontier">返回 Ysy AI Frontier</RouterLink>
    </section>
    <p v-else-if="loading" class="frontier-state" role="status">正在读取 AVIS3 成绩…</p>
    <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载成绩</button></div>
    <template v-else>
      <header class="frontier-report-cover">
        <nav class="frontier-breadcrumb" aria-label="当前位置"><RouterLink to="/ai-frontier">AI Frontier</RouterLink><span aria-hidden="true">/</span><span>AVIS3 Arena</span></nav>
        <div class="frontier-report-heading">
          <div class="frontier-report-title">
            <div class="frontier-report-tags"><span class="frontier-soft-badge">内部 HPC 私有部署</span></div>
            <h1>AVIS3 Arena</h1>
            <p>观察模型与运行工具组合在动力学控制任务中的表现。这里公开项目介绍、正式规则和核验后的成绩。</p>
            <div class="frontier-report-byline"><span>评测版本：{{ data.evaluationVersion || '待核验' }}</span><span v-if="data.release">· {{ data.release }}</span><span v-if="data.evaluatedAt">· 正式验收 <time>{{ data.evaluatedAt }}</time></span><span v-if="data.timezone">（{{ data.timezone }}）</span></div>
          </div>
          <a class="frontier-primary-link" href="#methodology">阅读规则与说明 <span aria-hidden="true">↘</span></a>
        </div>
        <div class="frontier-report-meta">
          <div><span>参测组合</span><strong>{{ data.contestants.length }} <small>组模型与工具</small></strong></div>
          <div><span>评测轮次</span><strong>{{ data.scoring?.roundCount || '待核验' }} <small v-if="data.scoring?.roundCount">轮 / 组合</small></strong></div>
          <div><span>评价方式</span><strong>{{ data.scoring?.label || '待核验' }}</strong><small v-if="data.scoring">{{ data.scoring.higherIsBetter === false ? '越低越好' : '越高越好' }}</small></div>
        </div>
      </header>

      <section id="results" class="frontier-section" aria-labelledby="avis3-results-title">
        <div class="frontier-section-heading"><div><div class="frontier-eyebrow">VERIFIED RESULTS</div><h2 id="avis3-results-title">模型、工具与成绩。</h2></div><p>编号用于识别，排序依据已核验均值。</p></div>
        <div class="avis3-result-card"><Avis3Leaderboard :arena="data" /></div>
      </section>

      <section v-if="roundResults.length" class="frontier-section" aria-labelledby="avis3-rounds-title">
        <div class="frontier-section-heading"><div><div class="frontier-eyebrow">ROUND RECORDS</div><h2 id="avis3-rounds-title">逐轮结果。</h2></div></div>
        <p class="avis3-comparison-note">各选手同编号轮次使用不同随机场景，不能按轮号做配对比较。</p>
        <div class="avis3-round-grid">
          <article v-for="result in roundResults" :key="result.contestantId" class="avis3-round-card">
            <h3>{{ contestant(result.contestantId).model }}</h3><p>{{ contestant(result.contestantId).harness }} · {{ result.contestantId }}</p>
            <ol class="avis3-round-list"><li v-for="(score, index) in result.roundScores" :key="index"><span>第 {{ index + 1 }} 轮</span><strong :title="String(score)">{{ displayScore(score) }}</strong></li></ol>
          </article>
        </div>
      </section>

      <section id="methodology" class="frontier-section" aria-labelledby="avis3-method-title">
        <div class="frontier-section-heading"><div><div class="frontier-eyebrow">RULES & CONTEXT</div><h2 id="avis3-method-title">理解规则，再解释成绩。</h2></div></div>
        <div class="frontier-reading-grid">
          <article class="frontier-reading-card"><div class="frontier-article-label"><span>AVIS3 评测说明</span><span>{{ data.evaluationVersion || '版本待核验' }}</span></div><FrontierMarkdown src="/ai-frontier/arena/avis3.md" @toc-generated="contents = $event" /></article>
          <aside class="frontier-reading-sidebar"><FrontierContents :items="contents" /><RouterLink class="frontier-sidebar-back" to="/ai-frontier">← 返回 AI Frontier</RouterLink></aside>
        </div>
      </section>
    </template>
  </FrontierShell>
</template>
