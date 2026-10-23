import test from 'node:test'
import assert from 'node:assert/strict'
import { createPreset, NOTES } from '../src/components/music-box/presets.js'
import { createSimulation } from '../src/components/music-box/simulation.js'
import { createSequencer } from '../src/components/music-box/sequencer.js'

test('the ensemble adds two bowed voices while saved notes and earlier arrangements remain compatible', () => {
  assert.equal(NOTES.length, 13)
  assert.equal(createPreset().score.id, 'lantern-ensemble')
  const first = createPreset('lantern-ensemble')
  const second = createPreset('lantern-ensemble')
  const bows = first.parts.filter(part => part.type === 'bowed')
  assert.deepEqual(new Set(bows.map(part => part.voice)), new Set(['violin', 'cello']))
  assert.ok(bows.every(part => [2, 4, 8].includes(part.holdBeats)))
  assert.ok(bows.filter(part => part.voice === 'cello').every(part => part.holdBeats === 8 && part.note >= 8))
  first.parts[0].voice = 'violin'
  first.score.events[0].beat = 4
  assert.equal(second.parts[0].voice, 'cello')
  assert.equal(second.score.events[0].beat, 0)
  for (const id of ['parade', 'string-parade', 'cascade', 'garden', 'blank']) {
    assert.ok(createPreset(id).parts.every(part => part.type !== 'bowed'), id + ' must keep its earlier instruments')
  }
})

test('two ensemble loops preserve every entrance, build audible layers, and let all marbles leave naturally', () => {
  const preset = createPreset('lantern-ensemble')
  const secondsPerBeat = 60 / preset.tempo
  const cycleSeconds = preset.score.lengthBeats * secondsPerBeat
  const step = 1 / 240
  const drops = new Map()
  const hits = []
  const gates = new Map()
  const sections = Array.from({ length: 4 }, () => ({ hits: 0, drumHits: 0, gateTotal: 0, frames: 0, peakGates: 0 }))
  let time = 0
  let peakBalls = 0
  let longestTrajectory = 0
  const simulation = createSimulation({
    parts: preset.parts,
    onHit(hit) {
      hits.push({ ...hit, time })
      if (hit.part.type === 'bowed') gates.set(hit.part.id, time + hit.part.holdBeats * secondsPerBeat)
      if (time < cycleSeconds) {
        const section = sections[Math.floor(time / (16 * secondsPerBeat))]
        section.hits += 1
        if (hit.part.type === 'drum') section.drumHits += 1
      }
    },
  })
  const sequencer = createSequencer({
    onDrop(event) { drops.set(simulation.drop(event.x), { ...event, time }) },
  })
  function snapshot() {
    const balls = simulation.getBalls()
    peakBalls = Math.max(peakBalls, balls.length)
    for (const ball of balls) longestTrajectory = Math.max(longestTrajectory, time - drops.get(ball.id).time)
    if (time < cycleSeconds) {
      const section = sections[Math.floor(time / (16 * secondsPerBeat))]
      const active = [...gates.values()].filter(end => end > time).length
      section.frames += 1
      section.gateTotal += active
      section.peakGates = Math.max(section.peakGates, active)
    }
  }
  sequencer.setScore(preset.score)
  sequencer.step(0, preset.tempo)
  for (let frame = 1; frame * step < cycleSeconds * 2 - 1e-8; frame++) {
    time = frame * step
    sequencer.step(step, preset.tempo)
    simulation.step(step)
    snapshot()
  }
  for (let frame = 0; frame < 8 * 240; frame++) {
    time += step
    simulation.step(step)
    snapshot()
  }

  assert.equal(drops.size, preset.score.events.length * 2)
  const firstHits = new Map()
  for (const hit of hits) if (!firstHits.has(hit.ballId)) firstHits.set(hit.ballId, hit)
  assert.equal(firstHits.size, drops.size, 'every scheduled marble must make a real musical collision')
  for (const [ballId, hit] of firstHits) {
    const entrance = preset.score.emitters.findIndex(emitter => emitter.id === drops.get(ballId).emitterId)
    assert.equal(hit.part.id, preset.parts[entrance].id, 'each entrance must start its intended voice')
  }
  const families = new Set(hits.map(hit => hit.part.type === 'bowed' ? 'bowed:' + hit.part.voice : hit.part.type))
  assert.deepEqual(families, new Set(['bowed:cello', 'bowed:violin', 'string', 'bell', 'drum']))
  assert.ok(preset.parts.filter(part => part.type === 'bowed').every(part => hits.some(hit => hit.part.id === part.id)))

  assert.ok(sections[0].hits < sections[1].hits && sections[1].hits < sections[2].hits)
  assert.ok(sections[3].hits < sections[2].hits, 'the final section must release the climax density')
  assert.ok(sections[0].peakGates <= 2 && sections[2].peakGates >= 4, 'long bowed notes must enter in layers')
  const meanGates = sections.map(section => section.gateTotal / section.frames)
  assert.ok(meanGates[2] > meanGates[0] * 2)
  assert.ok(meanGates[3] < meanGates[2] * 0.8, 'the closing phrase must give sustained voices space')
  assert.ok(sections[0].drumHits < sections[1].drumHits && sections[1].drumHits < sections[2].drumHits)
  assert.ok(peakBalls < 24)
  assert.ok(longestTrajectory < 8, 'marbles must leave through the board, without waiting for age cleanup')
  assert.equal(simulation.getBalls().length, 0)
})
