// A small additive/subtractive bowed-string voice, not a sampled instrument.
// PeriodicWave supplies harmonics; broad body filters and quiet bow noise colour them.
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave
export const BOWED_VOICES = Object.freeze({
  violin: Object.freeze({
    slope: 1.07, rolloff: 28, even: 1, cutoff: 5200,
    body: 650, bridge: 2600, attack: 0.16, release: 0.3,
    level: 0.12, vibratoRate: 5.2, vibratoCents: 6.5, noise: 0.018,
  }),
  cello: Object.freeze({
    slope: 1.32, rolloff: 14, even: 0.86, cutoff: 2800,
    body: 245, bridge: 1200, attack: 0.22, release: 0.38,
    level: 0.15, vibratoRate: 4.5, vibratoCents: 5, noise: 0.014,
  }),
})

export function bowedHoldSeconds(holdBeats = 4, tempo = 120) {
  const beats = [2, 4, 8].includes(holdBeats) ? holdBeats : 4
  const bpm = Number.isFinite(tempo) && tempo > 0 ? tempo : 120
  return beats * 60 / bpm
}

export function createBowedHarmonics(voice = 'violin') {
  const profile = BOWED_VOICES[voice] || BOWED_VOICES.violin
  const real = new Float32Array(49)
  const imag = new Float32Array(49)
  for (let harmonic = 1; harmonic < imag.length; harmonic++) {
    const parity = harmonic % 2 === 0 ? profile.even : 1
    imag[harmonic] = parity * Math.exp(-(harmonic - 1) / profile.rolloff) / harmonic ** profile.slope
  }
  return { real, imag }
}

function envelopeValue(points, time) {
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1]
    const next = points[index]
    if (time <= next.time) {
      const fraction = Math.max(0, (time - previous.time) / (next.time - previous.time))
      return previous.value + (next.value - previous.value) * fraction
    }
  }
  return points.at(-1).value
}

export function createBowedInstrument(context, destination) {
  const voices = new Map()
  const waves = Object.fromEntries(Object.keys(BOWED_VOICES).map(name => {
    const { real, imag } = createBowedHarmonics(name)
    return [name, context.createPeriodicWave(real, imag)]
  }))
  const noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.75), context.sampleRate)
  const samples = noiseBuffer.getChannelData(0)
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1

  function createVoice(id, frequency) {
    const now = context.currentTime
    const envelope = context.createGain()
    const vibrato = context.createOscillator()
    const vibratoDepth = context.createGain()
    const noise = context.createBufferSource()
    const noiseFilter = context.createBiquadFilter()
    const noiseLevel = context.createGain()
    const sources = [vibrato, noise]
    const nodes = [envelope, vibrato, vibratoDepth, noise, noiseFilter, noiseLevel]
    const tones = []
    let points = [{ time: now, value: 0 }]
    let endAt = Infinity
    let ended = false
    let hasStarted = false

    envelope.gain.setValueAtTime(0, now)
    envelope.connect(destination)
    vibrato.type = 'sine'
    vibrato.frequency.setValueAtTime(5.2, now)
    vibratoDepth.gain.setValueAtTime(0, now)
    vibrato.connect(vibratoDepth)

    // Both colours stay phase-continuous, so changing voice can crossfade in place.
    for (const [name, profile] of Object.entries(BOWED_VOICES)) {
      const carrier = context.createOscillator()
      const lowpass = context.createBiquadFilter()
      const body = context.createBiquadFilter()
      const bridge = context.createBiquadFilter()
      const blend = context.createGain()
      carrier.setPeriodicWave(waves[name])
      carrier.frequency.setValueAtTime(frequency, now)
      lowpass.type = 'lowpass'
      lowpass.frequency.setValueAtTime(profile.cutoff, now)
      lowpass.Q.setValueAtTime(0.65, now)
      body.type = 'peaking'
      body.frequency.setValueAtTime(profile.body, now)
      body.Q.setValueAtTime(0.85, now)
      body.gain.setValueAtTime(2.5, now)
      bridge.type = 'peaking'
      bridge.frequency.setValueAtTime(profile.bridge, now)
      bridge.Q.setValueAtTime(0.8, now)
      bridge.gain.setValueAtTime(3, now)
      blend.gain.setValueAtTime(0, now)
      vibratoDepth.connect(carrier.detune)
      carrier.connect(lowpass)
      lowpass.connect(body)
      body.connect(bridge)
      bridge.connect(blend)
      blend.connect(envelope)
      tones.push({ name, carrier, blend })
      sources.push(carrier)
      nodes.push(carrier, lowpass, body, bridge, blend)
    }
    noise.buffer = noiseBuffer
    noise.loop = true
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(1800, now)
    noiseFilter.Q.setValueAtTime(0.7, now)
    noiseLevel.gain.setValueAtTime(0, now)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseLevel)
    noiseLevel.connect(envelope)

    const voice = {
      get endAt() { return endAt },
      renew(frequency, voiceName, strength, holdSeconds) {
        const current = context.currentTime
        const profile = BOWED_VOICES[voiceName] || BOWED_VOICES.violin
        const selected = BOWED_VOICES[voiceName] ? voiceName : 'violin'
        const level = profile.level * (0.45 + 0.55 * strength)
        const attack = hasStarted ? 0.06 : profile.attack
        const gateAt = current + holdSeconds
        const value = envelopeValue(points, current)
        for (const tone of tones) {
          tone.carrier.frequency.setTargetAtTime(frequency, current, 0.025)
          tone.blend.gain.setTargetAtTime(tone.name === selected ? 1 : 0, current, 0.025)
        }
        vibrato.frequency.setTargetAtTime(profile.vibratoRate, current, 0.05)
        // The initial straight tone blooms into a small, relaxed pitch vibrato.
        vibratoDepth.gain.cancelScheduledValues(current)
        vibratoDepth.gain.setTargetAtTime(profile.vibratoCents, hasStarted ? current : current + 0.28, 0.3)
        noiseLevel.gain.setTargetAtTime(profile.noise, current, 0.08)
        noiseFilter.frequency.setTargetAtTime(selected === 'cello' ? 1050 : 1800, current, 0.06)
        points = [
          { time: current, value },
          { time: Math.min(current + attack, gateAt), value: level },
          { time: gateAt, value: level },
          { time: gateAt + profile.release * 0.75, value: level * 0.12 },
          { time: gateAt + profile.release, value: 0 },
        ]
        scheduleEnvelope()
        hasStarted = true
      },
      release() {
        if (ended) return
        const current = context.currentTime
        if (endAt <= current + 0.18) return
        const value = envelopeValue(points, current)
        points = [
          { time: current, value },
          { time: current + 0.13, value: value * 0.12 },
          { time: current + 0.18, value: 0 },
        ]
        scheduleEnvelope()
      },
      dispose() {
        if (ended) return
        for (const source of sources) source.stop()
        disconnect()
      },
    }

    function scheduleEnvelope() {
      const current = context.currentTime
      envelope.gain.cancelScheduledValues(current)
      envelope.gain.setValueAtTime(points[0].value, current)
      for (const point of points.slice(1)) envelope.gain.linearRampToValueAtTime(point.value, point.time)
      endAt = points.at(-1).time + 0.015
      // A subsequent stop replaces the pending stop; there are no stale JS timers.
      // https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop
      for (const source of sources) source.stop(endAt)
    }
    function disconnect() {
      if (ended) return
      ended = true
      for (const node of nodes) node.disconnect()
      if (voices.get(id) === voice) voices.delete(id)
    }
    vibrato.onended = disconnect
    for (const source of sources) source.start(now)
    voices.set(id, voice)
    return voice
  }

  return {
    hit(part, frequency, strength, tempo = 120) {
      let voice = voices.get(part.id)
      // ended is queued on the main thread; a busy frame may observe it late.
      if (voice && context.currentTime >= voice.endAt) {
        voice.dispose()
        voice = null
      }
      if (!voice) voice = createVoice(part.id, frequency)
      voice.renew(frequency, part.voice, strength, bowedHoldSeconds(part.holdBeats, tempo))
    },
    release(partId) {
      if (partId === undefined) for (const voice of voices.values()) voice.release()
      else voices.get(partId)?.release()
    },
    dispose() {
      for (const voice of voices.values()) voice.dispose()
      voices.clear()
    },
  }
}
