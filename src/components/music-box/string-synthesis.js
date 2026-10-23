// Karplus–Strong feedback loop: https://doi.org/10.2307/3680062
export function createStringSamples({ frequency, sampleRate = 44100, duration = 2.6, random = Math.random }) {
  const period = sampleRate / frequency
  // The two-point loss filter contributes another half-sample of delay.
  const delay = period - 0.5
  const size = Math.ceil(delay) + 1
  const line = new Float32Array(size)
  const samples = new Float32Array(Math.ceil(sampleRate * duration))
  let mean = 0
  const pluckAt = 0.22

  for (let index = 0; index < size; index++) {
    const phase = index / size
    const displacement = phase < pluckAt ? phase / pluckAt : (1 - phase) / (1 - pluckAt)
    line[index] = (displacement * 2 - 1) * 0.68 + (random() * 2 - 1) * 0.22
    mean += line[index] / size
  }
  for (let index = 0; index < size; index++) line[index] -= mean

  const loss = Math.exp(-Math.log(1000) / (frequency * 2.8))
  const dcPole = Math.exp(-2 * Math.PI * 28 / sampleRate)
  const attack = Math.round(sampleRate * 0.003)
  const release = Math.round(sampleRate * 0.06)
  let write = 0
  let previousRead = line[0]
  let previousInput = 0
  let previousOutput = 0
  let peak = 0

  for (let index = 0; index < samples.length; index++) {
    let position = write - delay
    if (position < 0) position += size
    const left = Math.floor(position)
    const fraction = position - left
    const value = line[left] * (1 - fraction) + line[(left + 1) % size] * fraction
    line[write] = (value + previousRead) * 0.5 * loss
    previousRead = value
    write = (write + 1) % size

    const resonant = value - previousInput + dcPole * previousOutput
    previousInput = value
    previousOutput = resonant
    const envelope = Math.min(1, index / attack, (samples.length - 1 - index) / release)
    samples[index] = resonant * envelope
    peak = Math.max(peak, Math.abs(samples[index]))
  }
  const scale = 0.9 / Math.max(peak, 0.9)
  for (let index = 0; index < samples.length; index++) samples[index] *= scale
  return samples
}
