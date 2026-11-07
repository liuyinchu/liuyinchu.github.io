<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import Avis3Leaderboard from '../components/frontier/Avis3Leaderboard.vue'
import Avis3Spectra from '../components/frontier/Avis3Spectra.vue'
import { OFFICIAL_BASE, useAvis3Data } from '../components/frontier/useAvis3Data'
import '../components/frontier/frontier-pages.css'

const route = useRoute()
const router = useRouter()
const isKnown = computed(() => route.params.arenaId === 'avis3')
const { data, loading, error, load } = useAvis3Data()
const contents = ref([])
const spectraOpen = ref(false)
const spectraContestant = ref('')
const pageName = 'AVIS3 Arena Plus'
const reportPath = OFFICIAL_BASE + '/methodology.md'

async function goToSection(id) {
  if (id === 'spectra') spectraOpen.value = true
  await nextTick()
  await router.replace({ hash: '#' + id })
  document.getElementById(id)?.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

function selectSpectra(id) {
  spectraContestant.value = id
  goToSection('spectra')
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
        <div class="frontier-report-heading">
          <div class="frontier-report-title">
            <h1>{{ pageName }}</h1>
            <p>让 Agent 设计控制器，在受扰动、带噪声的耦合动力学系统中完成长程控制。</p>
            <div class="frontier-report-byline">
              <time datetime="2026-11-08">发布时间 2026-11-08</time>
            </div>
          </div>
        </div>
        <div class="avis3-report-actions">
          <a href="#spectra" class="frontier-inline-link" @click.prevent="goToSection('spectra')">查看公开频谱</a>
          <a href="#methodology" class="frontier-inline-link" @click.prevent="goToSection('methodology')">评测与评分说明</a>
        </div>
      </header>

      <section id="results" class="frontier-section" aria-labelledby="avis3-results-title">
        <div class="frontier-section-heading">
          <div><h2 id="avis3-results-title">正式排名</h2></div>
        </div>
        <div class="avis3-result-card">
          <Avis3Leaderboard :arena="data" expandable @select-spectra="selectSpectra" />
        </div>
      </section>

      <section id="spectra" class="frontier-section" aria-labelledby="avis3-spectra-title">
        <div class="frontier-section-heading">
          <div><h2 id="avis3-spectra-title">真实输出频谱</h2></div>
        </div>
        <p class="avis3-spectrum-intro">每位选手提供 20 轮功率平均，以及第 1 轮的受控真值与无控制基线。</p>
        <button v-if="!spectraOpen" class="frontier-text-button" type="button" @click="spectraOpen = true">打开频谱查看器</button>
        <Avis3Spectra v-else :arena="data" :selected-contestant="spectraContestant" />
      </section>

      <section id="methodology" class="frontier-section" aria-labelledby="avis3-method-title">
        <div class="frontier-section-heading"><div><h2 id="avis3-method-title">评测与评分说明</h2></div></div>
        <div class="frontier-reading-grid">
          <article class="frontier-reading-card">
            <FrontierMarkdown :src="reportPath" @toc-generated="contents = $event" />
          </article>
          <aside class="frontier-reading-sidebar"><FrontierContents :items="contents" /></aside>
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
.avis3-arena-page :deep(.frontier-section-heading) { margin-bottom: 18px; border-top: 0; padding-top: 0; }
.avis3-arena-page :deep(.frontier-report-byline) { font-size: 15px; }
.avis3-arena-page :deep(.avis3-result-card) { padding: 18px 24px; }
.avis3-spectrum-intro { color: var(--f-muted); font-size: 13px; line-height: 1.8; margin-bottom: 18px; }
@media (max-width: 760px) {
  .avis3-arena-page :deep(.frontier-report-title > p) { margin-bottom: 12px; }
  .avis3-arena-page :deep(.avis3-result-card) { padding: 12px 16px; }
}
</style>
