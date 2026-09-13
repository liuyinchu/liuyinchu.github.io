<script setup>
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import BenchmarkCarousel from '../components/frontier/BenchmarkCarousel.vue'
import { useFrontierData } from '../components/frontier/useFrontierData'
import '../components/frontier/frontier-pages.css'
const { data, error, loading, load } = useFrontierData()
</script>

<template>
  <FrontierShell>
    <header class="frontier-cover">
      <div class="frontier-kicker"><span>INDEPENDENT AI OBSERVATORY</span><span>VOL. {{ data?.edition || '001' }} / {{ data?.demo ? 'DEMO EDITION' : 'FIELD REPORT' }}</span></div>
      <div class="frontier-cover-grid">
        <div class="frontier-cover-title"><p>YSY / 人工智能观察记录</p><h1>AI <em>FRONTIER</em><span class="frontier-title-mark" aria-hidden="true">↗</span></h1></div>
        <div class="frontier-cover-abstract"><span class="frontier-crosshair" aria-hidden="true">⊕</span><p>追踪智能的边界。<br>用测试观察能力，<br>用记录整理变化。</p><a href="#intelligence">阅读信息简报 <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="frontier-cover-bottom"><span>BENCHMARKS. EVIDENCE. PERSPECTIVES.</span><span>{{ data?.updatedAt || '—' }} <b>更新</b></span></div>
    </header>

    <section class="frontier-section" aria-labelledby="frontier-benchmarks-title">
      <div class="frontier-section-heading">
        <div class="frontier-section-title"><span class="frontier-section-number">01</span><div><p>THE LEADERBOARD</p><h2 id="frontier-benchmarks-title">AI 能力排行榜<span class="frontier-period">.</span></h2></div></div>
        <p class="frontier-section-aside">不同测试，不同切面。<br>排名之外，也看方法与边界。</p>
      </div>
      <p v-if="loading" class="frontier-state" role="status">正在读取榜单 / LOADING DATA…</p>
      <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载榜单 ↗</button></div>
      <BenchmarkCarousel v-else-if="data.benchmarks.length" :benchmarks="data.benchmarks" :demo="data.demo" />
      <p v-else class="frontier-state">第一份测试报告正在准备中。</p>
    </section>

    <section id="intelligence" class="frontier-section frontier-intelligence" aria-labelledby="frontier-intelligence-title">
      <div class="frontier-section-heading">
        <div class="frontier-section-title"><span class="frontier-section-number">02</span><div><p>INTELLIGENCE BRIEF</p><h2 id="frontier-intelligence-title">AI 信息收集<span class="frontier-period">.</span></h2></div></div>
        <span class="frontier-section-aside">持续观察 / 持续记录</span>
      </div>
      <div class="frontier-editorial-grid">
        <aside class="frontier-editorial-note"><span class="frontier-small-label">EDITOR’S NOTE</span><p>把值得留意的变化，<br>留在这里。</p><span class="frontier-note-rule"></span><p class="frontier-fine-print">模型、工具、研究与实践。<br>一份持续更新的个人 AI 观察档案。</p><span v-if="data?.demo" class="frontier-demo-label">当前为演示刊</span></aside>
        <FrontierMarkdown src="/ai-frontier/news.md" />
      </div>
    </section>
  </FrontierShell>
</template>
