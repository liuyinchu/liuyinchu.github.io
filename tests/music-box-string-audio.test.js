import test from 'node:test'
import assert from 'node:assert/strict'
import { NOTES } from '../src/components/music-box/presets.js'
import { createStringSamples } from '../src/components/music-box/string-synthesis.js'

function pluck(frequency, sampleRate) {
  const noise = [0.11, 0.83, 0.37, 0.67, 0.24, 0.92, 0.49, 0.06, 0.74, 0.3, 0.58]
  let index = 0
  return createStringSamples({ frequency, sampleRate, random: () => noise[index++ % noise.length] })
}

function rms(samples, sampleRate, start, duration) {
  const from = Math.round(start * sampleRate)
  const count = Math.round(duration * sampleRate)
  let energy = 0
  for (let index = from; index < from + count; index++) energy += samples[index] ** 2
  return Math.sqrt(energy / count)
}

function pitch(samples, sampleRate, expected) {
  const correlation = new Map()
  let best = -1
  let bestLag = 0
  for (let lag = Math.floor(sampleRate / expected * 0.94); lag <= Math.ceil(sampleRate / expected * 1.06); lag++) {
    let product = 0
    let firstEnergy = 0
    let secondEnergy = 0
    for (let index = Math.round(0.12 * sampleRate); index < Math.round(0.27 * sampleRate); index++) {
      const first = samples[index]
      const second = samples[index + lag]
      product += first * second
      firstEnergy += first * first
      secondEnergy += second * second
    }
    const value = product / Math.sqrt(firstEnergy * secondEnergy)
    correlation.set(lag, value)
    if (value > best) { best = value; bestLag = lag }
  }
  const left = correlation.get(bestLag - 1)
  const center = correlation.get(bestLag)
  const right = correlation.get(bestLag + 1)
  const fraction = 0.5 * (left - right) / (left - 2 * center + right)
  return sampleRate / (bestLag + fraction)
}

function harmonic(samples, sampleRate, frequency, start) {
  const from = Math.round(start * sampleRate)
  const count = Math.round(0.12 * sampleRate)
  let real = 0
  let imaginary = 0
  for (let index = 0; index < count; index++) {
    const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * index / (count - 1))
    const sample = samples[from + index] * window
    const phase = 2 * Math.PI * frequency * index / sampleRate
    real += sample * Math.cos(phase)
    imaginary += sample * Math.sin(phase)
  }
  return Math.hypot(real, imaginary)
}

test('plucked strings stay in tune across all available notes at common browser sample rates', () => {
  for (const sampleRate of [44100, 48000]) {
    for (const note of NOTES) {
      const samples = pluck(note.frequency, sampleRate)
      const measured = pitch(samples, sampleRate, note.frequency)
      const cents = 1200 * Math.log2(measured / note.frequency)
      assert.ok(Math.abs(cents) < 5, note.label + ' must remain within five cents at ' + sampleRate)
    }
  }
})

test('a pluck rings naturally, decays, and reaches silence without a hard endpoint', () => {
  const sampleRate = 48000
  const samples = pluck(NOTES[8].frequency, sampleRate)
  assert.ok(samples.every(Number.isFinite))
  assert.ok(samples.every(sample => Math.abs(sample) <= 0.91))
  const attack = rms(samples, sampleRate, 0.03, 0.1)
  const body = rms(samples, sampleRate, 0.35, 0.1)
  const tail = rms(samples, sampleRate, 1.4, 0.1)
  assert.ok(attack > 0.05)
  assert.ok(body > attack * 0.15 && body < attack)
  assert.ok(tail > 0 && tail < attack * 0.1)
  assert.equal(Math.abs(samples[0]), 0)
  assert.equal(Math.abs(samples.at(-1)), 0)
  assert.ok(Math.abs(samples.at(-2)) < 0.0001)
})

test('a pluck contains upper harmonics that soften faster than its fundamental', () => {
  const sampleRate = 44100
  const frequency = NOTES[8].frequency
  const samples = pluck(frequency, sampleRate)
  const fundamental = harmonic(samples, sampleRate, frequency, 0.04)
  const second = harmonic(samples, sampleRate, frequency * 2, 0.04)
  assert.ok(second > fundamental * 0.15, 'the string must contain more than a pure sine tone')
  const brightness = start => Math.sqrt([7, 8, 9, 10, 11, 12].reduce(
    (energy, partial) => energy + harmonic(samples, sampleRate, frequency * partial, start) ** 2, 0,
  )) / harmonic(samples, sampleRate, frequency, start)
  assert.ok(brightness(0.8) < brightness(0.04) * 0.8, 'upper partials must naturally lose energy')
})
