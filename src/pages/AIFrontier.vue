<script setup>
import { ref } from 'vue'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import Avis3Leaderboard from '../components/frontier/Avis3Leaderboard.vue'
import { NOTES_REPOSITORY, NOTES_SOURCE, useAvis3Data } from '../components/frontier/useAvis3Data'
import '../components/frontier/frontier-pages.css'

const { data, error, loading, load } = useAvis3Data()
const contents = ref([])
</script>

<template>
  <FrontierShell>
    <header class="frontier-cover">
      <div class="frontier-cover-copy">
        <div class="frontier-eyebrow"><span class="frontier-status-dot"></span> 个人 AI 观察站 <span class="frontier-registration">OBSERVATION / 001</span></div>
        <h1>AI<br><span>FRONTIER</span><span class="frontier-cover-title-cn">看见 AI 的下一步。</span></h1>
        <p>记录前沿进展，也用具体问题观察模型与工具的表现。</p>
        <a class="frontier-inline-link" href="#intelligence">阅读 AI 前沿札记</a>
      </div>
      <div class="frontier-overview-stats" aria-label="内容概览">
        <div class="frontier-stats-top"><span>AVIS3 / TELEMETRY</span><span class="frontier-soft-badge">内部评测</span></div>
        <div class="frontier-instrument" aria-hidden="true"><span class="frontier-orbit"></span><span class="frontier-crosshair">+</span><span class="frontier-instrument-label">MODEL × HARNESS</span></div><div class="frontier-stats-numbers">
          <div><strong>{{ String(data?.contestants.length || 0).padStart(2, '0') }}</strong><span>组模型与工具</span></div>
          <div><strong>{{ String(data?.results.length || 0).padStart(2, '0') }}</strong><span>份核验记录</span></div>
        </div>
        <div class="frontier-stats-foot"><span>评测版本</span><span>{{ data?.evaluationVersion || '待核验' }}</span></div>
      </div>
    </header>

    <div class="frontier-calibration" aria-hidden="true"><span>RESEARCH &amp; EVALUATION</span><i></i><i></i><i></i><i></i><span>FIELD OPERATIONS ↘</span></div>

    <section id="arena" class="frontier-section" aria-labelledby="frontier-arena-title">
      <div class="frontier-section-heading">
        <div><div class="frontier-eyebrow">AVIS3 ARENA</div><h2 id="frontier-arena-title">把能力，放进具体问题。</h2></div>
        <p>一起阅读模型、运行环境与评测结果。</p>
      </div>
      <p v-if="loading" class="frontier-state" role="status">正在读取 AVIS3 成绩…</p>
      <div v-else-if="error" class="frontier-state" role="alert"><p>{{ error }}</p><button type="button" class="frontier-text-button" @click="load">重新加载成绩</button></div>
      <article v-else class="avis3-overview-card">
        <div class="avis3-overview-intro">
          <div><span class="frontier-soft-badge">内部 HPC 私有部署</span><h3>AVIS3 Arena</h3><p>公开项目介绍与已核验成绩，记录每组模型和运行工具的表现。</p></div>
          <RouterLink class="frontier-primary-link" to="/ai-frontier/arena/avis3">查看规则与完整结果</RouterLink>
        </div>
        <Avis3Leaderboard :arena="data" />
      </article>
    </section>

    <section class="frontier-section" aria-labelledby="frontier-collections-title">
      <div class="frontier-section-heading"><div><div class="frontier-eyebrow">COLLECTIONS &amp; NOTES</div><h2 id="frontier-collections-title">收集与记录</h2></div></div>
      <div class="frontier-collection-grid">
        <RouterLink class="frontier-collection-card" to="/ai-frontier/skills"><span class="frontier-eyebrow">01 / SKILLS</span><h3>Skill 收集</h3><p>值得参考的 Skill 与使用经验。</p><span class="frontier-inline-link">阅读收集</span></RouterLink>
        <RouterLink class="frontier-collection-card" to="/ai-frontier/trivia"><span class="frontier-eyebrow">02 / TRIVIA</span><h3>AI Trivia</h3><p>关于 AI 的零散知识与发现。</p><span class="frontier-inline-link">阅读随记</span></RouterLink>
      </div>
    </section>

    <section id="intelligence" class="frontier-section frontier-intelligence" aria-labelledby="frontier-intelligence-title">
      <div class="frontier-section-heading">
        <div><div class="frontier-eyebrow">FIELD NOTES</div><h2 id="frontier-intelligence-title">AI 前沿札记</h2></div>
        <p>模型、工具、研究与实践的持续记录。</p>
      </div>
      <div class="frontier-reading-grid">
        <article class="frontier-reading-card">
          <div class="frontier-article-label"><span>YSY 的观察札记</span><a :href="NOTES_REPOSITORY" target="_blank" rel="noopener noreferrer">源仓库</a></div>
          <FrontierMarkdown :src="NOTES_SOURCE" @toc-generated="contents = $event" />
        </article>
        <aside class="frontier-reading-sidebar">
          <FrontierContents :items="contents" />
          <div class="frontier-sidebar-note"><span class="frontier-small-label">关于这份记录</span><p>保留值得关注的进展，也保留尚未解决的问题。</p><a class="frontier-inline-link" :href="NOTES_REPOSITORY" target="_blank" rel="noopener noreferrer">deepsight-ai-today</a></div>
        </aside>
      </div>
    </section>
  </FrontierShell>
</template>
