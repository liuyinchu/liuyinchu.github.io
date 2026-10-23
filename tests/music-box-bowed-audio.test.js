import test from 'node:test'
import assert from 'node:assert/strict'
import { createAudioEngine } from '../src/components/music-box/audio.js'
import { NOTES } from '../src/components/music-box/presets.js'
import { BOWED_VOICES, bowedHoldSeconds, createBowedHarmonics, createBowedInstrument } from '../src/components/music-box/bowed-synthesis.js'

class Param {
  constructor(value = 0) { this.value = value; this.events = [] }
  setValueAtTime(value, time) { this.events.push({ type: 'set', value, time }); return this }
  linearRampToValueAtTime(value, time) { this.events.push({ type: 'linear', value, time }); return this }
  exponentialRampToValueAtTime(value, time) { this.events.push({ type: 'exponential', value, time }); return this }
  setTargetAtTime(value, time, constant) { this.events.push({ type: 'target', value, time, constant }); return this }
  cancelScheduledValues(time) { this.events = this.events.filter(event => event.time < time); return this }
  valueAt(time) {
    let value = this.value
    let previousTime = 0
    for (const event of this.events) {
      if (event.time > time) {
        if (event.type === 'linear') return value + (event.value - value) * (time - previousTime) / (event.time - previousTime)
        return value
      }
      value = event.value
      previousTime = event.time
    }
    return value
  }
}

class Node {
  constructor(context, kind) {
    this.context = context
    this.kind = kind
    this.connections = []
    this.disconnected = false
    this.starts = []
    this.stops = []
    for (const key of ['frequency', 'detune', 'gain', 'Q', 'threshold', 'knee', 'ratio', 'attack', 'release']) this[key] = new Param()
  }
  connect(node) { this.connections.push(node); return node }
  disconnect() { this.disconnected = true }
  start(time = this.context.currentTime) { this.starts.push(time) }
  stop(time = this.context.currentTime) { this.stops.push(time); this.stopAt = Math.max(time, this.context.currentTime) }
  setPeriodicWave(wave) { this.wave = wave }
}

class Context {
  static instances = []
  constructor() {
    this.currentTime = 0
    this.sampleRate = 44100
    this.state = 'suspended'
    this.nodes = []
    this.waves = []
    this.destination = {}
    Context.instances.push(this)
  }
  node(kind) { const node = new Node(this, kind); this.nodes.push(node); return node }
  createGain() { return this.node('gain') }
  createOscillator() { return this.node('oscillator') }
  createBiquadFilter() { return this.node('filter') }
  createBufferSource() { return this.node('buffer') }
  createDynamicsCompressor() { return this.node('compressor') }
  createPeriodicWave(real, imag) { const wave = { real, imag }; this.waves.push(wave); return wave }
  createBuffer(channels, length, sampleRate) {
    const data = Array.from({ length: channels }, () => new Float32Array(length))
    return { duration: length / sampleRate, getChannelData: channel => data[channel], copyToChannel: (input, channel) => data[channel].set(input) }
  }
  async resume() { this.state = 'running' }
  async close() { this.state = 'closed' }
  get sources() { return this.nodes.filter(node => node.starts.length) }
  advance(time) {
    this.currentTime = time
    for (const source of this.sources) {
      if (!source.ended && source.stopAt <= time) {
        source.ended = true
        source.onended?.()
      }
    }
  }
}

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`)
const bowedPart = (id, options = {}) => ({ id, type: 'bowed', voice: 'violin', holdBeats: 4, note: 3, ...options })

async function audioFixture(t) {
  const original = globalThis.AudioContext
  globalThis.AudioContext = Context
  const audio = createAudioEngine()
  t.after(async () => {
    await audio.dispose()
    if (original === undefined) delete globalThis.AudioContext
    else globalThis.AudioContext = original
  })
  return audio
}

test('bowed spectra retain the fundamental and distinguish a bright violin from a warm cello', () => {
  const violin = createBowedHarmonics('violin')
  const cello = createBowedHarmonics('cello')
  for (const spectrum of [violin, cello]) {
    assert.ok(spectrum.real.every(value => value === 0))
    assert.equal(spectrum.imag[0], 0)
    assert.equal(spectrum.imag[1], 1)
    assert.ok(spectrum.imag.slice(2).every(value => value > 0 && value < 1))
  }
  const highEnergy = wave => wave.imag.slice(6).reduce((sum, value) => sum + value ** 2, 0)
  assert.ok(highEnergy(violin) > highEnergy(cello) * 3)
  assert.ok(BOWED_VOICES.cello.cutoff < BOWED_VOICES.violin.cutoff)
  assert.ok(BOWED_VOICES.cello.body < BOWED_VOICES.violin.body)
})

test('the hold is musical beats at the supplied tempo with four beats at 120 as the default', () => {
  near(bowedHoldSeconds(2, 120), 1)
  near(bowedHoldSeconds(4, 60), 4)
  near(bowedHoldSeconds(8, 116), 480 / 116)
  near(bowedHoldSeconds(), 2)
  near(bowedHoldSeconds(3, 0), 2)
  near(bowedHoldSeconds(4, NaN), 2)
})

test('audio remains lazy, then repeated collisions renew one sustained voice without an amplitude jump', async t => {
  const previousContexts = Context.instances.length
  const audio = await audioFixture(t)
  audio.hit(bowedPart('one'), 500)
  audio.releaseBows()
  assert.equal(Context.instances.length, previousContexts)
  assert.equal(await audio.unlock(), true)
  const context = Context.instances.at(-1)
  assert.equal(context.waves.length, 0)
  audio.hit(bowedPart('one'), 500, { tempo: 120 })
  assert.equal(context.waves.length, 2)
  assert.equal(context.sources.length, 4)
  const firstSources = [...context.sources]
  const envelope = context.nodes.find(node => node.kind === 'gain' && node.connections.includes(context.nodes[0]) && node !== context.nodes[0])
  const oldEnd = firstSources[0].stopAt
  context.currentTime = 0.08
  const before = envelope.gain.valueAt(context.currentTime)
  audio.hit(bowedPart('one'), 600, { tempo: 90 })
  near(envelope.gain.valueAt(context.currentTime), before)
  assert.equal(context.sources.length, 4)
  assert.ok(firstSources[0].stopAt > oldEnd)
  near(firstSources[0].stopAt, 0.08 + 4 * 60 / 90 + BOWED_VOICES.violin.release + 0.015)
  assert.ok(firstSources.every(source => source.starts.length === 1))
  context.advance(oldEnd + 0.01)
  assert.ok(firstSources.every(source => !source.ended))
  context.advance(firstSources[0].stopAt + 0.01)
  assert.ok(firstSources.every(source => source.disconnected))
})

test('note and voice changes glide and crossfade in the existing graph', () => {
  const context = new Context()
  const destination = context.createGain()
  const synth = createBowedInstrument(context, destination)
  synth.hit(bowedPart('one'), NOTES[3].frequency, 0.7, 120)
  const carriers = context.sources.filter(source => source.wave)
  const initialWaves = carriers.map(source => source.wave)
  context.currentTime = 0.7
  synth.hit(bowedPart('one', { voice: 'cello', note: 8 }), NOTES[8].frequency, 0.5, 120)
  assert.equal(context.sources.length, 4)
  carriers.forEach((carrier, index) => {
    assert.equal(carrier.wave, initialWaves[index])
    const pitch = carrier.frequency.events.at(-1)
    assert.equal(pitch.type, 'target')
    assert.equal(pitch.value, NOTES[8].frequency)
    assert.ok(pitch.constant > 0)
  })
  const blends = carriers.map(carrier => carrier.connections[0].connections[0].connections[0].connections[0])
  assert.deepEqual(blends.map(blend => blend.gain.events.at(-1).value), [0, 1])
  assert.ok(blends.every(blend => blend.gain.events.at(-1).constant > 0))
  synth.dispose()
})

test('release targets one part, can be renewed before ending, and release-all closes every voice', () => {
  const context = new Context()
  const synth = createBowedInstrument(context, context.destination)
  synth.hit(bowedPart('one', { holdBeats: 8 }), 392, 0.7, 60)
  const first = [...context.sources]
  synth.hit(bowedPart('two', { voice: 'cello', holdBeats: 8 }), 130.81, 0.7, 60)
  const second = context.sources.slice(4)
  const secondEnd = second[0].stopAt
  context.currentTime = 1
  synth.release('one')
  near(first[0].stopAt, 1.195)
  assert.equal(second[0].stopAt, secondEnd)
  context.currentTime = 1.1
  synth.hit(bowedPart('one'), 392, 0.5, 120)
  assert.equal(context.sources.length, 8)
  context.advance(1.21)
  assert.ok(first.every(source => !source.ended))
  synth.release()
  context.advance(1.41)
  assert.ok(context.sources.every(source => source.disconnected))
})

test('a delayed old ended callback cannot remove the replacement voice', () => {
  const context = new Context()
  const synth = createBowedInstrument(context, context.destination)
  synth.hit(bowedPart('one', { holdBeats: 2 }), 392, 0.5, 120)
  const staleEnded = context.sources[0].onended
  context.currentTime = 2
  synth.hit(bowedPart('one'), 440, 0.5, 120)
  assert.equal(context.sources.length, 8)
  staleEnded()
  context.currentTime = 2.1
  synth.hit(bowedPart('one'), 440, 0.5, 120)
  assert.equal(context.sources.length, 8)
  synth.release('one')
  near(context.sources[4].stopAt, 2.295)
  synth.dispose()
})

test('mute, volume, legacy instruments and immediate disposal still work', async t => {
  const audio = await audioFixture(t)
  audio.setMuted(true)
  audio.setVolume(0.6)
  await audio.unlock()
  const context = Context.instances.at(-1)
  assert.equal(context.nodes[0].gain.value, 0)
  audio.hit(bowedPart('one'), 650)
  assert.equal(context.sources.length, 0)
  audio.setMuted(false)
  assert.equal(context.nodes[0].gain.events.at(-1).value, 0.6)
  for (const type of ['bell', 'drum', 'string']) audio.hit({ type, note: 0 }, 650)
  assert.equal(context.sources.length, 5)
  const transientStops = context.sources.map(source => source.stopAt)
  audio.hit(bowedPart('one'), 650)
  assert.equal(context.sources.length, 9)
  context.currentTime = 0.1
  audio.releaseBows()
  assert.deepEqual(context.sources.slice(0, 5).map(source => source.stopAt), transientStops)
  await audio.dispose()
  assert.ok(context.sources.every(source => source.disconnected))
  assert.ok(context.sources.every(source => source.stopAt === 0.1))
  assert.equal(context.state, 'closed')
  assert.equal(await audio.unlock(), false)
  assert.doesNotThrow(() => audio.releaseBows())
  audio.hit(bowedPart('one'), 650)
  assert.equal(context.sources.length, 9)
})
