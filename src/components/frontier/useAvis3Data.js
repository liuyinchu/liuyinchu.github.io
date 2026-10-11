import { onBeforeUnmount, ref } from 'vue'

export const NOTES_SOURCE = 'https://raw.githubusercontent.com/liuyinchu/deepsight-ai-today/main/index.md'
export const NOTES_REPOSITORY = 'https://github.com/liuyinchu/deepsight-ai-today'

export function useAvis3Data() {
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
      const response = await fetch('/ai-frontier/avis3.json', { signal: request.signal })
      if (!response.ok) throw new Error('AVIS3 data unavailable')
      const result = await response.json()
      if (!Array.isArray(result.contestants) || !Array.isArray(result.results)) {
        throw new Error('Invalid AVIS3 data')
      }
      data.value = result
    } catch (cause) {
      if (cause.name !== 'AbortError') error.value = 'AVIS3 成绩暂时无法加载，请稍后重试。'
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }

  onBeforeUnmount(() => controller?.abort())
  load()
  return { data, loading, error, load }
}

export function orderedResults(arena) {
  return [...(arena?.results || [])].sort((a, b) =>
    (arena.scoring?.higherIsBetter === false ? a.mean - b.mean : b.mean - a.mean)
    || a.contestantId.localeCompare(b.contestantId))
}

export function displayScore(value) {
  return typeof value === 'number' ? value.toFixed(4) : '—'
}
