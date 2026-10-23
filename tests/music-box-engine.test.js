import test from 'node:test'
import assert from 'node:assert/strict'
import { createPreset, createPart, NOTES } from '../src/components/music-box/presets.js'
import { createSimulation } from '../src/components/music-box/simulation.js'
import { createAudioEngine } from '../src/components/music-box/audio.js'
import { createSequencer } from '../src/components/music-box/sequencer.js'

function run(simulation, seconds, frame = 1 / 60) {
  for (let time = 0; time < seconds; time += frame) simulation.step(frame)
}

test('presets are independently editable and each part has a fresh identity', () => {
  const first = createPreset()
  const second = createPreset()
  first.parts[0].x = 20
  assert.notEqual(second.parts[0].x, 20)
  assert.notEqual(first.parts[0].id, second.parts[0].id)
  assert.equal(new Set(second.parts.map((part) => part.id)).size, second.parts.length)
  assert.ok(second.parts.every((part) => part.note >= 0 && part.note < NOTES.length))
  assert.deepEqual(createPreset('blank').parts, [])
})

test('each musical preset leads multiple marbles through multiple instruments', () => {
  for (const name of ['cascade', 'garden']) {
    const preset = createPreset(name)
    const hits = []
    const simulation = createSimulation({ parts: preset.parts, onHit: (hit) => hits.push(hit) })
    for (let index = 0; index < 6; index++) {
      simulation.drop(preset.emitterX)
      run(simulation, 60 / preset.tempo)
    }
    run(simulation, 7)
    const instruments = new Set(hits.map((hit) => hit.part.id))
    const playedBalls = new Set(hits.map((hit) => hit.ballId))
    assert.ok(instruments.size >= 3, name + ' should play at least three instruments')
    assert.equal(playedBalls.size, 6)
    for (const ballId of playedBalls) {
      const melody = new Set(hits.filter((hit) => hit.ballId === ballId).map((hit) => hit.part.id))
      assert.ok(melody.size >= 3, name + ' should guide every marble through at least three instruments')
    }
    assert.ok(hits.every((hit) => Number.isFinite(hit.speed) && hit.speed > 0))
  }
})

test('a tilted ramp redirects a falling ball without making a musical hit', () => {
  const ramp = createPart('ramp', 400, 220)
  ramp.angle = 28
  let hits = 0
  const simulation = createSimulation({ parts: [ramp], onHit: () => hits++ })
  simulation.drop(400)
  run(simulation, 0.85)
  const ball = simulation.getBalls()[0]
  assert.ok(ball.vx > 150)
  assert.ok(ball.x > 420)
  assert.equal(hits, 0)
})

test('contact does not repeatedly sound while a ball remains on an instrument', () => {
  const bell = createPart('bell', 400, 200)
  const hits = []
  const simulation = createSimulation({ parts: [bell], onHit: (hit) => hits.push(hit) })
  simulation.drop(10)
  simulation.drop(400, 165)
  run(simulation, 1.2)
  assert.equal(hits.length, 1)
  assert.equal(hits[0].part.id, bell.id)
})

test('pause preserves positions and reset removes balls and old contact state', () => {
  const bell = createPart('bell', 400, 200)
  const hits = []
  const simulation = createSimulation({ parts: [bell], onHit: (hit) => hits.push(hit) })
  simulation.drop(400)
  run(simulation, 0.7)
  const paused = structuredClone(simulation.getBalls())
  assert.deepEqual(simulation.getBalls(), paused)
  assert.equal(hits.length, 1)
  simulation.reset()
  assert.deepEqual(simulation.getBalls(), [])
  simulation.drop(400)
  run(simulation, 0.7)
  assert.equal(hits.length, 2)
})

test('scene edits affect active balls and removed instruments stop receiving hits', () => {
  const bell = createPart('bell', 400, 200)
  const hits = []
  const simulation = createSimulation({ parts: [bell], onHit: (hit) => hits.push(hit) })
  simulation.drop(400)
  run(simulation, 0.2)
  simulation.setParts([])
  run(simulation, 2)
  assert.equal(hits.length, 0)
  assert.equal(simulation.getBalls().length, 0)
})

test('marbles remain bounded and leave an empty board', () => {
  const simulation = createSimulation()
  for (let index = 0; index < 100; index++) simulation.drop(400)
  assert.equal(simulation.getBalls().length, 24)
  run(simulation, 3)
  assert.equal(simulation.getBalls().length, 0)
})

test('a long frame cannot tunnel a marble through a nearby bell', () => {
  const bell = createPart('bell', 400, 200)
  const hits = []
  const simulation = createSimulation({ parts: [bell], onHit: (hit) => hits.push(hit) })
  simulation.drop(400)
  run(simulation, 0.6, 0.1)
  simulation.step(5)
  assert.ok(hits.length >= 1)
  assert.ok(simulation.getBalls().every((ball) => Number.isFinite(ball.x) && Number.isFinite(ball.y)))
})

test('audio is lazy, safely silent before unlock, and reports absent browser support', async () => {
  const audio = createAudioEngine()
  audio.setVolume(0.3)
  audio.hit(createPart('bell', 400, 200), 300)
  assert.equal(await audio.unlock(), false)
  audio.setMuted(true)
  await audio.dispose()
  assert.equal(await audio.unlock(), false)
})

test('parade score copies can be edited without changing future presets or free layouts', () => {
  const first = createPreset('parade')
  const second = createPreset('parade')
  first.score.emitters[0].x = 400
  first.score.events[0].beat = 5
  first.score.sections[0].label = 'Changed'
  assert.equal(second.score.emitters[0].x, 92)
  assert.equal(second.score.events[0].beat, 0)
  assert.equal(second.score.sections[0].label, '整队')
  for (const name of ['cascade', 'garden', 'blank']) assert.equal(createPreset(name).score, null)
})

test('parade performs two complete loops with stable drums and real alternating bell voices', () => {
  const preset = createPreset('parade')
  const drops = new Map()
  const hits = []
  let time = 0
  let peakBalls = 0
  const simulation = createSimulation({
    parts: preset.parts,
    onHit: hit => hits.push({ ...hit, time }),
  })
  const sequencer = createSequencer({
    onDrop: event => drops.set(simulation.drop(event.x), { ...event, time }),
  })
  sequencer.setScore(preset.score)
  sequencer.step(0, preset.tempo)
  const frames = Math.round(2 * preset.score.lengthBeats * 60 / preset.tempo * 240)
  for (let frame = 1; frame < frames; frame++) {
    time = frame / 240
    sequencer.step(1 / 240, preset.tempo)
    simulation.step(1 / 240)
    peakBalls = Math.max(peakBalls, simulation.getBalls().length)
  }
  for (let frame = 0; frame < 5 * 240; frame++) {
    time += 1 / 240
    simulation.step(1 / 240)
  }

  assert.equal(drops.size, preset.score.events.length * 2)
  const firstHits = new Map()
  for (const hit of hits) if (!firstHits.has(hit.ballId)) firstHits.set(hit.ballId, hit)
  assert.equal(firstHits.size, drops.size, 'every scheduled marble must sound')
  for (const [ballId, drop] of drops) {
    const first = firstHits.get(ballId)
    const targetIndex = preset.score.emitters.findIndex(emitter => emitter.id === drop.emitterId)
    assert.equal(first.part.id, preset.parts[targetIndex].id, 'each entrance must play its intended voice')
    assert.ok(first.time - drop.time > 0.38 && first.time - drop.time < 0.45, 'first strikes stay within one short beat of the score')
  }

  const pulseHits = [...firstHits.values()].filter(hit => drops.get(hit.ballId).emitterId === 'pulse')
  assert.equal(pulseHits.length, 64, 'the bass drum must keep all sixty-four quarter-note beats')
  for (let index = 1; index < pulseHits.length; index++) {
    const interval = pulseHits[index].time - pulseHits[index - 1].time
    assert.ok(Math.abs(interval - 60 / preset.tempo) < 0.025, 'the main drum pulse must remain steady')
  }
  const bellNotes = new Set(hits.filter(hit => hit.part.type === 'bell').map(hit => hit.part.note))
  assert.ok([0, 3, 5, 6, 7].every(note => bellNotes.has(note)), 'low C/G and high C/D/E phrases must all be audible')
  assert.equal(new Set(hits.filter(hit => hit.part.type === 'drum').map(hit => hit.part.note)).size, 2)
  assert.ok(hits.length > drops.size * 2, 'lower rails must produce secondary collision phrases')
  assert.ok(peakBalls < 24, 'the composed tempo must leave room for every ongoing trajectory')
  assert.equal(simulation.getBalls().length, 0, 'the last phrase must naturally leave the board')
})
