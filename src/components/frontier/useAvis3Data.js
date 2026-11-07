import { onBeforeUnmount, ref, unref, watch } from 'vue'

export const NOTES_SOURCE = 'https://raw.githubusercontent.com/liuyinchu/deepsight-ai-today/main/index.md'
export const NOTES_REPOSITORY = 'https://github.com/liuyinchu/deepsight-ai-today'
export const OFFICIAL_BASE = '/ai-frontier/evaluation-1108'
export const OFFICIAL_DATA = OFFICIAL_BASE + '/evaluation-1108.json'
export const PREVIEW_DATA = '/ai-frontier/archive/avis3-preview.json'

export function officialArena(record) {
  return {
    name: record.benchmark,
    batch: record.evaluation_id,
    evaluationVersion: record.arena_version,
    release: record.release,
    evaluatedAt: record.evaluation_date,
    timezone: record.timezone,
    distinctModels: record.distinct_model_count,
    totalRounds: record.total_rounds,
    failures: record.failed_rounds,
    protocol: record.protocol,
    sharedScenarios: record.protocol.shared_scenarios,
    spectraBase: OFFICIAL_BASE,
    scoring: {
      label: '20 轮积分均分',
      unit: record.scoring.unit,
      theoreticalMax: record.scoring.theoretical_maximum,
      higherIsBetter: true,
      roundCount: record.protocol.rounds_per_entrant,
    },
    contestants: record.entrants.map(entry => ({
      id: entry.id,
      number: String(entry.number).padStart(2, '0'),
      model: entry.model,
      harness: entry.harness,
      apiRoute: entry.api_route,
      controllerFormat: entry.controller_format_label,
      controllerSummary: entry.controller_summary,
      selfReport: entry.self_report,
      thinking: '最高可用档位（组织者提供的配置）',
      spectra: entry.spectra,
    })),
    results: record.entrants.map(entry => ({
      contestantId: entry.id,
      mean: entry.mean,
      std: entry.std,
      min: entry.min,
      max: entry.max,
      rounds: entry.round_count,
      failures: entry.failed_rounds,
      roundScores: [...entry.rounds].sort((a, b) => a.index - b.index).map(round => round.score),
    })),
  }
}

export function useAvis3Data(source = OFFICIAL_DATA) {
  const data = ref(null)
  const error = ref('')
  const loading = ref(true)
  let controller

  async function load() {
    controller?.abort()
    const request = new AbortController()
    controller = request
    const path = unref(source)
    data.value = null
    error.value = ''
    loading.value = Boolean(path)
    if (!path) return
    try {
      const response = await fetch(path, { signal: request.signal })
      if (!response.ok) throw new Error('AVIS3 data unavailable')
      const result = await response.json()
      const arena = Array.isArray(result.entrants) ? officialArena(result) : result
      if (!Array.isArray(arena.contestants) || !Array.isArray(arena.results)) {
        throw new Error('Invalid AVIS3 data')
      }
      if (!request.signal.aborted) data.value = arena
    } catch (cause) {
      if (!request.signal.aborted) error.value = 'AVIS3 成绩暂时无法加载，请稍后重试。'
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }

  watch(() => unref(source), load, { immediate: true })
  onBeforeUnmount(() => controller?.abort())
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
