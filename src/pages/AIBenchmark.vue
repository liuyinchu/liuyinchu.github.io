<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import { displayScore, orderedRankings, tiers, useFrontierData } from '../components/frontier/useFrontierData'
import '../components/frontier/frontier-pages.css'

const route = useRoute()
const { data, loading, error, load } = useFrontierData()
const contents = ref([])
const benchmark = computed(() => data.value?.benchmarks.find(item => item.id === route.params.benchmarkId))
const models = computed(() => orderedRankings(benchmark.value))
const tierModels = (tier) => models.value.filter(model => model.tier === tier)
const initial = (name) => name.replace(/^DEMO\s+/i, '').slice(0, 1).toUpperCase()
const barWidth = (score) => Math.max(0, Math.min(100, score / (benchmark.value.maxScore || 100) * 100)) + '%'
</script>

<template>
  <FrontierShell :title="benchmark ? benchmark.name + ' · Ysy AI Frontier' : 'Ysy AI Frontier'">
    <p v-if="loading" class="frontier-state" role="status">正在读取报告…</p>
    <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载报告</button></div>
    <section v-else-if="!benchmark" class="frontier-missing" data-page="benchmark-not-found">
      <span class="frontier-soft-badge">报告未找到</span><h1>404</h1><p>这份报告还不在观察档案里。</p><RouterLink class="frontier-primary-link" to="/ai-frontier">返回 Ysy AI Frontier</RouterLink>
    </section>
    <template v-else>
      <header class="frontier-report-cover">
        <nav class="frontier-breadcrumb" aria-label="当前位置"><RouterLink to="/ai-frontier">AI Frontier</RouterLink><span aria-hidden="true">/</span><span>Benchmark 报告</span></nav>
        <div class="frontier-report-heading">
          <div class="frontier-report-title">
            <div class="frontier-report-tags"><span class="frontier-soft-badge">{{ benchmark.category }}</span><span v-if="data.demo" class="frontier-demo-tag">演示数据</span></div>
            <h1>{{ benchmark.name }}</h1>
            <p>{{ benchmark.description }}</p>
            <div class="frontier-report-byline"><span class="frontier-author-avatar">Y</span><span>Ysy</span><span class="frontier-byline-dot">·</span><time>{{ data.updatedAt }}</time><span class="frontier-byline-dot">·</span><span>{{ benchmark.version }}</span></div>
          </div>
          <a class="frontier-primary-link" href="#methodology">阅读测试报告 <span aria-hidden="true">↘</span></a>
        </div>
        <div class="frontier-report-meta">
          <div><span>评价指标</span><strong>{{ benchmark.scoreLabel }}</strong><small>{{ benchmark.higherIsBetter === false ? '↓ 越低越好' : '↑ 越高越好' }}</small></div>
          <div><span>参测模型</span><strong>{{ models.length }} <small>个模型</small></strong></div>
          <div><span>当前领先</span><strong>{{ models[0]?.name || '—' }}</strong><small v-if="models[0]">{{ displayScore(models[0].score) }} {{ benchmark.unit }}</small></div>
        </div>
      </header>

      <section class="frontier-section frontier-rank-section" aria-labelledby="frontier-tiers-title">
        <div class="frontier-section-heading">
          <div><div class="frontier-eyebrow">MODEL TIERS</div><h2 id="frontier-tiers-title">从夯到拉，一眼看明白。</h2></div>
          <span class="frontier-section-description">同一项测试，不同的能力表现。</span>
        </div>
        <div class="frontier-results-grid">
          <div class="frontier-tier-list" aria-label="从夯到拉 AI 排行榜">
            <section v-for="tier in tiers" :key="tier.id" class="frontier-tier-row" :class="'frontier-tier-' + tier.id" :aria-labelledby="'tier-' + tier.id">
              <div class="frontier-tier-label"><span class="frontier-tier-letter">{{ tier.id }}</span><h3 :id="'tier-' + tier.id">{{ tier.name }}</h3></div>
              <ol class="frontier-tier-models" :aria-label="tier.name + '档模型'">
                <li v-for="model in tierModels(tier.id)" :key="model.id" class="frontier-model-tile">
                  <span class="frontier-model-avatar" aria-hidden="true">{{ initial(model.name) }}</span>
                  <strong>{{ model.name }}</strong>
                  <span class="frontier-model-score">{{ displayScore(model.score) }}<small>{{ benchmark.unit }}</small></span>
                </li>
                <li v-if="!tierModels(tier.id).length" class="frontier-empty-tier">暂无模型</li>
              </ol>
            </section>
          </div>
          <aside class="frontier-score-card" aria-label="模型得分对照">
            <div class="frontier-score-card-heading"><h3>得分对照</h3><span>{{ benchmark.unit }}</span></div>
            <p>{{ benchmark.scoreLabel }} · {{ benchmark.higherIsBetter === false ? '越低越好' : '越高越好' }}</p>
            <ol class="frontier-score-chart">
              <li v-for="model in models" :key="model.id"><div><span>{{ model.name }}</span><strong>{{ displayScore(model.score) }}</strong></div><span class="frontier-score-track" aria-hidden="true"><i :style="{ width: barWidth(model.score) }"></i></span></li>
            </ol>
          </aside>
        </div>
        <p class="frontier-tier-caption"><span class="frontier-info-symbol" aria-hidden="true">i</span>{{ data.demo ? '当前为虚构模型与演示分数。分档标准及完整结果见下方报告。' : '分档仅对应本项测试，具体条件与评价方法见下方报告。' }}</p>
      </section>

      <section id="methodology" class="frontier-section" aria-labelledby="frontier-method-title">
        <div class="frontier-section-heading"><div><div class="frontier-eyebrow">BEHIND THE SCORE</div><h2 id="frontier-method-title">先理解测试，再解释分数。</h2></div><span class="frontier-section-description">方法、过程与完整结果。</span></div>
        <div class="frontier-reading-grid">
          <article class="frontier-reading-card"><div class="frontier-article-label"><span>测试报告</span><span>{{ benchmark.version }}</span></div><FrontierMarkdown :key="benchmark.id" :src="benchmark.markdown" @toc-generated="contents = $event" /></article>
          <aside class="frontier-reading-sidebar"><FrontierContents :items="contents" /><RouterLink class="frontier-sidebar-back" to="/ai-frontier">← 返回全部榜单</RouterLink></aside>
        </div>
      </section>
    </template>
  </FrontierShell>
</template>
