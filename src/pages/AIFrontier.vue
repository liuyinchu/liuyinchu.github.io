<script setup>
import { ref } from 'vue'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import Avis3Leaderboard from '../components/frontier/Avis3Leaderboard.vue'
import { NOTES_SOURCE, useAvis3Data } from '../components/frontier/useAvis3Data'
import '../components/frontier/frontier-pages.css'

const { data, error, loading, load } = useAvis3Data()
const contents = ref([])
</script>

<template>
  <FrontierShell>
    <header class="frontier-cover">
      <div class="frontier-cover-copy">
        <h1>AI<br><span>FRONTIER</span><span class="frontier-cover-title-cn">看见 AI 的下一步。</span></h1>
        <a class="frontier-inline-link" href="#intelligence">阅读 AI 前沿札记</a>
      </div>
      <div class="frontier-overview-stats" aria-label="内容概览">
        <div class="frontier-instrument" aria-hidden="true"><span class="frontier-orbit"></span><span class="frontier-crosshair">+</span><span class="frontier-instrument-label">MODEL × HARNESS</span></div><div class="frontier-stats-numbers">
          <div><strong>{{ String(data?.contestants.length || 0).padStart(2, '0') }}</strong><span>个独立参赛条目</span></div>
          <div><strong>{{ String(data?.results.length || 0).padStart(2, '0') }}</strong><span>份正式成绩</span></div>
        </div>
      </div>
    </header>

    <section id="arena" class="frontier-section" aria-labelledby="frontier-arena-title">
      <div class="frontier-section-heading">
        <h2 id="frontier-arena-title">AI 能力测评</h2>
      </div>
      <p v-if="loading" class="frontier-state" role="status">正在读取 AVIS3 成绩…</p>
      <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载成绩</button></div>
      <article v-else class="avis3-overview-card">
        <div class="avis3-overview-intro">
          <h3>AVIS3 Arena Plus</h3>
          <RouterLink class="frontier-primary-link" to="/ai-frontier/arena/avis3">查看规则与完整结果</RouterLink>
        </div>
        <Avis3Leaderboard :arena="data" :limit="5" />
      </article>
    </section>

    <section class="frontier-section" aria-labelledby="frontier-collections-title">
      <div class="frontier-section-heading"><div><h2 id="frontier-collections-title">收集与记录</h2></div></div>
      <div class="frontier-collection-grid">
        <RouterLink class="frontier-collection-card" to="/ai-frontier/skills"><h3>Skill 收集</h3><p>值得参考的 Skill 与使用经验。</p><span class="frontier-inline-link">阅读收集</span></RouterLink>
        <RouterLink class="frontier-collection-card" to="/ai-frontier/trivia"><h3>AI Trivia</h3><p>关于 AI 的零散知识与发现。</p><span class="frontier-inline-link">阅读随记</span></RouterLink>
      </div>
    </section>

    <section id="intelligence" class="frontier-section frontier-intelligence" aria-labelledby="frontier-intelligence-title">
      <div class="frontier-section-heading">
        <div><h2 id="frontier-intelligence-title">AI 前沿札记</h2></div>
      </div>
      <div class="frontier-reading-grid">
        <article class="frontier-reading-card">
          <FrontierMarkdown :src="NOTES_SOURCE" @toc-generated="contents = $event" />
        </article>
        <aside class="frontier-reading-sidebar">
          <FrontierContents :items="contents" />
        </aside>
      </div>
    </section>
  </FrontierShell>
</template>
