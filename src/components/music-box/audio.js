import { NOTES } from './presets.js'
import { createStringSamples } from './string-synthesis.js'
import { createBowedInstrument } from './bowed-synthesis.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function createAudioEngine() {
  let context = null
  let master = null
  let compressor = null
  let noiseBuffer = null
  let bowed = null
  let volume = 0.38
  let muted = false
  let disposed = false
  const voices = new Set()
  const stringBuffers = new Map()

  function updateVolume() {
    if (!context || !master) return
    master.gain.setTargetAtTime(muted ? 0 : volume, context.currentTime, 0.015)
  }

  function trackVoice(sources, nodes, endAt) {
    const voice = { sources, nodes }
    voices.add(voice)
    sources[0].onended = () => {
      for (const node of nodes) node.disconnect()
      voices.delete(voice)
    }
    for (const source of sources) {
      source.start()
      source.stop(endAt)
    }
  }

  function playBell(frequency, strength) {
    const now = context.currentTime
    const carrier = context.createOscillator()
    const modulator = context.createOscillator()
    const modulation = context.createGain()
    const envelope = context.createGain()

    carrier.type = 'sine'
    carrier.frequency.setValueAtTime(frequency, now)
    modulator.type = 'sine'
    modulator.frequency.setValueAtTime(frequency * 2.76, now)
    modulation.gain.setValueAtTime(frequency * 0.9 * strength, now)
    modulation.gain.exponentialRampToValueAtTime(frequency * 0.002, now + 0.7)
    envelope.gain.setValueAtTime(0, now)
    envelope.gain.linearRampToValueAtTime(0.16 * strength, now + 0.006)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.45)
    envelope.gain.linearRampToValueAtTime(0, now + 1.5)

    modulator.connect(modulation)
    modulation.connect(carrier.frequency)
    carrier.connect(envelope)
    envelope.connect(master)
    trackVoice([carrier, modulator], [carrier, modulator, modulation, envelope], now + 1.52)
  }

  function playDrum(frequency, strength) {
    const now = context.currentTime
    const body = context.createOscillator()
    const noise = context.createBufferSource()
    const bodyEnvelope = context.createGain()
    const noiseEnvelope = context.createGain()
    const filter = context.createBiquadFilter()

    body.type = 'triangle'
    body.frequency.setValueAtTime(frequency * 0.8, now)
    body.frequency.exponentialRampToValueAtTime(frequency * 0.42, now + 0.11)
    bodyEnvelope.gain.setValueAtTime(0, now)
    bodyEnvelope.gain.linearRampToValueAtTime(0.23 * strength, now + 0.004)
    bodyEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
    bodyEnvelope.gain.linearRampToValueAtTime(0, now + 0.22)

    noise.buffer = noiseBuffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1700, now)
    filter.Q.setValueAtTime(0.75, now)
    noiseEnvelope.gain.setValueAtTime(0, now)
    noiseEnvelope.gain.linearRampToValueAtTime(0.065 * strength, now + 0.002)
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.065)
    noiseEnvelope.gain.linearRampToValueAtTime(0, now + 0.075)

    body.connect(bodyEnvelope)
    bodyEnvelope.connect(master)
    noise.connect(filter)
    filter.connect(noiseEnvelope)
    noiseEnvelope.connect(master)
    trackVoice([body, noise], [body, noise, bodyEnvelope, noiseEnvelope, filter], now + 0.24)
  }

  function playString(frequency, strength) {
    let buffer = stringBuffers.get(frequency)
    if (!buffer) {
      const samples = createStringSamples({ frequency, sampleRate: context.sampleRate })
      buffer = context.createBuffer(1, samples.length, context.sampleRate)
      buffer.copyToChannel(samples, 0)
      stringBuffers.set(frequency, buffer)
    }
    const now = context.currentTime
    const pluck = context.createBufferSource()
    const gain = context.createGain()
    pluck.buffer = buffer
    gain.gain.setValueAtTime(0.3 * strength, now)
    pluck.connect(gain)
    gain.connect(master)
    trackVoice([pluck], [pluck, gain], now + buffer.duration)
  }

  return {
    async unlock() {
      if (disposed) return false
      try {
        if (!context) {
          const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext
          if (!AudioContextClass) return false
          context = new AudioContextClass()
          master = context.createGain()
          compressor = context.createDynamicsCompressor()
          master.gain.value = muted ? 0 : volume
          compressor.threshold.value = -18
          compressor.knee.value = 16
          compressor.ratio.value = 6
          compressor.attack.value = 0.004
          compressor.release.value = 0.12
          master.connect(compressor)
          compressor.connect(context.destination)

          noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.09), context.sampleRate)
          const samples = noiseBuffer.getChannelData(0)
          for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1
        }
        if (context.state !== 'running') await context.resume()
        return !disposed && context.state === 'running'
      } catch {
        return false
      }
    },
    hit(part, speed, { tempo = 120 } = {}) {
      if (disposed || muted || !context || context.state !== 'running') return
      const frequency = NOTES[part.note]?.frequency ?? NOTES[0].frequency
      const strength = clamp(speed / 650, 0.16, 1)
      if (part.type === 'bell') playBell(frequency, strength)
      else if (part.type === 'drum') playDrum(frequency, strength)
      else if (part.type === 'string') playString(frequency, strength)
      else if (part.type === 'bowed') {
        if (!bowed) bowed = createBowedInstrument(context, master)
        bowed.hit(part, frequency, strength, tempo)
      }
    },
    releaseBows(partId) {
      bowed?.release(partId)
    },
    setVolume(nextVolume) {
      volume = clamp(nextVolume, 0, 1)
      updateVolume()
    },
    setMuted(nextMuted) {
      muted = Boolean(nextMuted)
      updateVolume()
    },
    async dispose() {
      if (disposed) return
      disposed = true
      bowed?.dispose()
      bowed = null
      for (const voice of voices) {
        for (const source of voice.sources) source.stop()
        for (const node of voice.nodes) node.disconnect()
      }
      voices.clear()
      stringBuffers.clear()
      if (master) master.disconnect()
      if (compressor) compressor.disconnect()
      if (context && context.state !== 'closed') await context.close()
    },
  }
}
