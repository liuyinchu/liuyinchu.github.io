import { onBeforeUnmount, ref } from 'vue'

export function useFrontierData() {
  const data = ref(null)
  const error = ref('')
  const loading = ref(true)
  let controller
  async function load() {
    controller?.abort()
    const request = new AbortController()
    controller = request
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/ai-frontier/benchmarks.json', { signal: request.signal })
      if (!response.ok) throw new Error('数据暂时无法读取')
      const result = await response.json()
      if (!Array.isArray(result.benchmarks)) throw new Error('榜单数据格式有误')
      data.value = result
    } catch (cause) {
      if (cause.name !== 'AbortError') error.value = '榜单暂时无法加载，请稍后重试。'
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }
  onBeforeUnmount(() => controller?.abort())
  load()
  return { data, error, loading, load }
}

export function orderedRankings(benchmark) {
  return [...(benchmark?.rankings || [])].sort((a, b) =>
    benchmark.higherIsBetter === false ? a.score - b.score : b.score - a.score)
}

export function displayScore(score) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 1 }).format(score)
}

export const tiers = [
  { id: 'S', name: '夯', description: 'Outstanding' },
  { id: 'A', name: '顶级', description: 'Excellent' },
  { id: 'B', name: '人上人', description: 'Solid' },
  { id: 'C', name: 'NPC', description: 'Baseline' },
  { id: 'D', name: '拉完了', description: 'Needs work' },
]
