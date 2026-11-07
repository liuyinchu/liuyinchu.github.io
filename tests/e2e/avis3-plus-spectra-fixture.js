// Small synthetic spectra exercise bindings and races without copying production assets.
export const plusFrequencies = [0.01, 0.1, 1, 10, 100]

export function plusSpectrum(id, mode) {
  const scale = id === 'uncontrolled_baseline' ? 40 : Number(id.slice(-3))
  const factor = mode === 'pooled' ? 1 : 1.5
  return {
    evaluation_id: 'Evaluation-1108',
    series_id: id,
    selection: mode === 'pooled' ? 'power_average_20_rounds' : 'round_01',
    round_index: mode === 'pooled' ? null : 1,
    output_names: ['y1', 'y2', 'y3'],
    asd_by_channel: [1, 2, 3].map(channel =>
      plusFrequencies.map((_, index) => scale * factor * channel * 1e-8 / (index + 1))),
  }
}

export async function mockPlusSpectra(page) {
  await page.route('**/evaluation-1108/spectra/**', route => {
    const file = new URL(route.request().url()).pathname.split('/').at(-1)
    if (file === 'frequency.json') return route.fulfill({ json: { unit: 'Hz', values: plusFrequencies } })
    const match = /^(official-\d{3}|baseline)-(pooled|round-01)\.json$/.exec(file)
    if (!match) return route.fulfill({ status: 404, body: 'Unknown test spectrum' })
    return route.fulfill({ json: plusSpectrum(match[1] === 'baseline' ? 'uncontrolled_baseline' : match[1], match[2] === 'pooled' ? 'pooled' : 'round_01') })
  })
}
