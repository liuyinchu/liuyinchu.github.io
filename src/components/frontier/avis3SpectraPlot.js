export const SPECTRA_FRAME = {
  left: 65, right: 343, top: 34, bottom: 236, width: 278, height: 202,
}

// Use every exported frequency point. Coordinates do not alter the source arrays.
export function buildSpectraCharts(source) {
  const frequency = source.frequency_hz
  const controlled = source.controlled_asd
  const baseline = source.baseline_asd
  if (source.channels?.join(',') !== 'y1,y2,y3' || !Array.isArray(frequency) || frequency.length < 2
    || controlled?.length !== frequency.length || baseline?.length !== frequency.length) {
    throw new Error('Invalid spectra arrays')
  }
  const x = frequency.map(value => {
    if (!Number.isFinite(value) || value < 0.01 || value > 100) throw new Error('Invalid frequency')
    return SPECTRA_FRAME.left + (Math.log10(value) + 2) / 4 * SPECTRA_FRAME.width
  })

  return source.channels.map((channel, index) => {
    let min = Infinity
    let max = 0
    for (const rows of [controlled, baseline]) {
      for (const row of rows) {
        const value = row[index]
        if (!Number.isFinite(value) || value <= 0) throw new Error('Non-positive ASD')
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    }
    const low = Math.log10(min * 0.9)
    const high = Math.log10(max * 1.1)
    const y = value => SPECTRA_FRAME.bottom - (Math.log10(value) - low) / (high - low) * SPECTRA_FRAME.height
    const firstPower = Math.ceil(low)
    const lastPower = Math.floor(high)
    const step = Math.max(1, Math.ceil((lastPower - firstPower) / 4))
    const tickValues = []
    for (let power = firstPower; power <= lastPower; power += step) tickValues.push(10 ** power)
    if (tickValues.length < 2) {
      tickValues.splice(0, tickValues.length, min * 0.9, max * 1.1)
    }
    const path = rows => rows.map((row, point) =>
      (point === 0 ? 'M' : 'L') + x[point] + ' ' + y(row[index])).join(' ')

    return {
      channel, min: min * 0.9, max: max * 1.1,
      ticks: tickValues.map(value => ({ label: value.toExponential(0).replace('+', ''), y: y(value) })),
      controlledPath: path(controlled), baselinePath: path(baseline),
    }
  })
}
