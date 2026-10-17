<script setup>
import { ref } from 'vue'
import FrontierShell from '../components/frontier/FrontierShell.vue'
import FrontierMarkdown from '../components/frontier/FrontierMarkdown.vue'
import FrontierContents from '../components/frontier/FrontierContents.vue'
import '../components/frontier/frontier-pages.css'

defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, required: true },
  description: { type: String, required: true },
  src: { type: String, required: true },
})
const contents = ref([])
</script>

<template>
  <FrontierShell :title="title + ' · Ysy AI Frontier'">
    <header class="frontier-report-cover">
      <nav class="frontier-breadcrumb" aria-label="当前位置"><RouterLink to="/ai-frontier">AI Frontier</RouterLink><span aria-hidden="true">/</span><span>{{ title }}</span></nav>
      <div class="frontier-report-heading">
        <div class="frontier-report-title">
          <div class="frontier-eyebrow">{{ eyebrow }}</div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
      </div>
    </header>
    <section class="frontier-section frontier-document" :aria-label="title + '正文'">
      <div class="frontier-reading-grid" :class="{ 'frontier-document-single': !contents.length }">
        <article class="frontier-reading-card"><FrontierMarkdown :src="src" @toc-generated="contents = $event" /></article>
        <aside v-if="contents.length" class="frontier-reading-sidebar"><FrontierContents :items="contents" /></aside>
      </div>
    </section>
  </FrontierShell>
</template>
