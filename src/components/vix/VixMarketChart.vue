<script setup>
import { ref } from 'vue'

const props = defineProps({
  series: { type: String, required: true },
  name: { type: String, required: true },
  requestedAt: { type: Date, required: true },
})

const state = ref('loading')
const start = new Date(props.requestedAt)
start.setUTCFullYear(start.getUTCFullYear() - 1)

function graphUrl(width, height) {
  const url = new URL('https://fred.stlouisfed.org/graph/fredgraph.png')
  url.search = new URLSearchParams({
    id: props.series,
    cosd: start.toISOString().slice(0, 10),
    width: String(width),
    height: String(height),
    bgcolor: '#cdd6f4',
    graph_bgcolor: '#eff1fc',
    line_color: '#665a9e',
    refresh: String(props.requestedAt.getTime()),
  })
  return url.href
}
</script>

<template>
  <figure class="market-chart" :aria-busy="state === 'loading'">
    <picture v-show="state === 'ready'">
      <source media="(max-width: 480px)" :srcset="graphUrl(370, 310)" />
      <img
        :src="graphUrl(800, 450)"
        :alt="name + ' 近一年日收盘走势图（Cboe / FRED）'"
        @load="state = 'ready'"
        @error="state = 'failed'"
      />
    </picture>
    <div v-if="state !== 'ready'" class="chart-placeholder" role="status">
      <span v-if="state === 'loading'">正在载入 {{ name }} 日收盘图…</span>
      <span v-else>暂时无法载入图表。可以刷新或在 FRED 查看。</span>
    </div>
  </figure>
</template>

<style scoped>
.market-chart {
  display: grid;
  flex: 1;
  place-items: center;
  min-width: 0;
  margin: 0;
  padding: clamp(0.35rem, 1.4vw, 0.85rem);
}

.market-chart picture {
  display: block;
  width: 100%;
  max-width: 50rem;
}

.market-chart img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.48rem;
}

.chart-placeholder {
  padding: 0.8rem;
  color: var(--vix-muted);
  font-size: 0.875rem;
  text-align: center;
}
</style>
