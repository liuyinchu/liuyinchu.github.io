<script setup>
import { computed, ref } from 'vue'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import BenchmarkCarousel from '../components/frontier/BenchmarkCarousel.vue'
import { useFrontierData } from '../components/frontier/useFrontierData'
import '../components/frontier/frontier-pages.css'

const { data, error, loading, load } = useFrontierData()
const contents = ref([])
const modelCount = computed(() => new Set((data.value?.benchmarks || []).flatMap(item => (item.rankings || []).map(model => model.id))).size)
</script>

<template>
  <FrontierShell>
    <header class="frontier-cover">
      <div class="frontier-cover-copy">
        <div class="frontier-eyebrow"><span class="frontier-status-dot"></span> 个人 AI 观察站</div>
        <h1>看见 AI 的<span>下一步。</span></h1>
        <p>从能力榜单到前沿动态，让每一次变化都有据可循。</p>
        <a class="frontier-inline-link" href="#intelligence">阅读最新札记 <span aria-hidden="true">↗</span></a>
      </div>
      <div class="frontier-overview-stats" aria-label="内容概览">
        <div class="frontier-stats-top"><span>Ysy AI Frontier</span><span v-if="data?.demo" class="frontier-soft-badge">演示刊</span></div>
        <div class="frontier-stats-numbers">
          <div><strong>{{ String(data?.benchmarks.length || 0).padStart(2, '0') }}</strong><span>项能力测试</span></div>
          <div><strong>{{ String(modelCount).padStart(2, '0') }}</strong><span>个参测模型</span></div>
        </div>
        <div class="frontier-stats-foot"><span>最近更新</span><time>{{ data?.updatedAt || '—' }}</time></div>
      </div>
    </header>

    <section id="benchmarks" class="frontier-section" aria-labelledby="frontier-benchmarks-title">
      <div class="frontier-section-heading">
        <div><div class="frontier-eyebrow">BENCHMARKS</div><h2 id="frontier-benchmarks-title">能力，放在一起看。</h2></div>
        <p>选一个测试，看看模型各自擅长什么。</p>
      </div>
      <p v-if="loading" class="frontier-state" role="status">正在读取榜单…</p>
      <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载榜单</button></div>
      <BenchmarkCarousel v-else-if="data.benchmarks.length" :benchmarks="data.benchmarks" :demo="data.demo" />
      <p v-else class="frontier-state">第一份测试报告正在准备中。</p>
    </section>

    <section id="intelligence" class="frontier-section frontier-intelligence" aria-labelledby="frontier-intelligence-title">
      <div class="frontier-section-heading">
        <div><div class="frontier-eyebrow">FIELD NOTES</div><h2 id="frontier-intelligence-title">信息之外，多一点理解。</h2></div>
        <p>模型、工具、研究与实践的持续记录。</p>
      </div>
      <div class="frontier-reading-grid">
        <article class="frontier-reading-card">
          <div class="frontier-article-label"><span>AI 信息收集</span><span>YSY 的观察札记</span></div>
          <FrontierMarkdown src="/ai-frontier/news.md" @toc-generated="contents = $event" />
        </article>
        <aside class="frontier-reading-sidebar">
          <FrontierContents :items="contents" />
          <div class="frontier-sidebar-note"><span class="frontier-small-label">关于这份记录</span><p>保留值得关注的进展，<br>也保留尚未解决的问题。</p><span v-if="data?.demo" class="frontier-soft-badge">当前内容为演示</span></div>
        </aside>
      </div>
    </section>
  </FrontierShell>
</template>
