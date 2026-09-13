<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import { displayScore, orderedRankings, tiers, useFrontierData } from '../components/frontier/useFrontierData'
import '../components/frontier/frontier-pages.css'
const route = useRoute()
const { data, loading, error, load } = useFrontierData()
const benchmark = computed(() => data.value?.benchmarks.find(item => item.id === route.params.benchmarkId))
const models = computed(() => orderedRankings(benchmark.value))
const tierModels = (tier) => models.value.filter(model => model.tier === tier)
</script>

<template>
  <FrontierShell :title="benchmark ? benchmark.name + ' · Ysy AI Frontier' : 'Ysy AI Frontier'">
    <p v-if="loading" class="frontier-state" role="status">正在读取报告 / LOADING REPORT…</p>
    <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载报告 ↗</button></div>
    <section v-else-if="!benchmark" class="frontier-missing" data-page="benchmark-not-found">
      <span class="frontier-small-label">REPORT NOT FOUND</span><h1>404<span class="frontier-period">.</span></h1><p>没有找到这份 Benchmark 报告。</p><RouterLink to="/ai-frontier">返回 Ysy AI Frontier ↗</RouterLink>
    </section>
    <template v-else>
      <header class="frontier-report-cover">
        <div class="frontier-kicker"><RouterLink to="/ai-frontier">← YSY AI FRONTIER / 返回总览</RouterLink><span>BENCHMARK REPORT / {{ benchmark.version }}</span></div>
        <div class="frontier-report-heading"><div><p class="frontier-small-label">{{ benchmark.category }} <span v-if="data.demo"> / DEMO</span></p><h1>{{ benchmark.name }}<span class="frontier-period">.</span></h1></div><span class="frontier-report-symbol" aria-hidden="true">↗</span></div>
        <p class="frontier-report-description">{{ benchmark.description }}</p>
        <dl class="frontier-report-meta"><div><dt>RELEASE / 更新时间</dt><dd>{{ data.updatedAt }}</dd></div><div><dt>METRIC / 评价指标</dt><dd>{{ benchmark.scoreLabel }} {{ benchmark.higherIsBetter === false ? '↓ 越低越好' : '↑ 越高越好' }}</dd></div><div><dt>MODELS / 参测模型</dt><dd>{{ String(models.length).padStart(2, '0') }}</dd></div><div><dt>DATA / 数据性质</dt><dd>{{ data.demo ? '虚构演示数据' : '详见测试报告' }}</dd></div></dl>
      </header>
      <section class="frontier-section" aria-labelledby="frontier-tiers-title">
        <div class="frontier-section-heading"><div class="frontier-section-title"><span class="frontier-section-number">01</span><div><p>THE TIER LIST</p><h2 id="frontier-tiers-title">从夯到拉<span class="frontier-period">.</span></h2></div></div><p class="frontier-section-aside">一个直观的能力切面。<br>分档标准与完整结果见下方报告。</p></div>
        <div class="frontier-tier-list" aria-label="从夯到拉 AI 排行榜">
          <section v-for="tier in tiers" :key="tier.id" class="frontier-tier-row" :class="'frontier-tier-' + tier.id" :aria-labelledby="'tier-' + tier.id">
            <div class="frontier-tier-label"><span class="frontier-tier-letter">{{ tier.id }}</span><h3 :id="'tier-' + tier.id">{{ tier.name }}</h3><span>{{ tier.description }}</span></div>
            <ol class="frontier-tier-models" :aria-label="tier.name + '档模型'">
              <li v-for="model in tierModels(tier.id)" :key="model.id" class="frontier-model-tile">
                <span class="frontier-model-provider">{{ model.provider }}</span><strong>{{ model.name }}</strong>
                <div><span class="frontier-model-score">{{ displayScore(model.score) }}</span><span>{{ benchmark.unit }}</span></div>
              </li>
              <li v-if="!tierModels(tier.id).length" class="frontier-empty-tier">— 暂无模型</li>
            </ol>
          </section>
        </div>
        <p class="frontier-tier-caption"><span>{{ data.demo ? 'DEMO / 本榜为虚构模型和演示分数，不代表真实 AI 能力。' : '分档为本测试下的评价，不代表模型的全部能力。' }}</span><span>{{ benchmark.scoreLabel }} / {{ benchmark.unit }}</span></p>
      </section>
      <section id="methodology" class="frontier-section" aria-labelledby="frontier-method-title">
        <div class="frontier-section-heading"><div class="frontier-section-title"><span class="frontier-section-number">02</span><div><p>METHODS & FINDINGS</p><h2 id="frontier-method-title">测试报告<span class="frontier-period">.</span></h2></div></div><span class="frontier-section-aside">方法 / 过程 / 结果</span></div>
        <div class="frontier-editorial-grid"><aside class="frontier-editorial-note"><span class="frontier-small-label">BEHIND THE NUMBERS</span><p>先理解测试，<br>再解释分数。</p><span class="frontier-note-rule"></span><p class="frontier-fine-print">测试条件和评价方法，<br>也是结果的一部分。</p><RouterLink class="frontier-back-link" to="/ai-frontier">← 返回全部榜单</RouterLink></aside><FrontierMarkdown :key="benchmark.id" :src="benchmark.markdown" /></div>
      </section>
    </template>
  </FrontierShell>
</template>
