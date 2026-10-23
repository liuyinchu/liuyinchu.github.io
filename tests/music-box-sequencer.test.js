import test from 'node:test'
import assert from 'node:assert/strict'
import { createPreset } from '../src/components/music-box/presets.js'
import { createSequencer } from '../src/components/music-box/sequencer.js'

function shortScore() {
  return {
    id: 'test',
    name: 'Two voices',
    lengthBeats: 4,
    beatsPerBar: 4,
    emitters: [{ id: 'low', label: 'Low', x: 100 }, { id: 'high', label: 'High', x: 700 }],
    events: [
      { beat: 0, emitterId: 'low' },
      { beat: 0, emitterId: 'high' },
      { beat: 1, emitterId: 'low' },
      { beat: 1.5, emitterId: 'high' },
      { beat: 3.5, emitterId: 'high' },
    ],
    sections: [{ beat: 0, label: 'Opening' }, { beat: 2, label: 'Answer' }],
  }
}

test('starting a score plays its opening chord once, including a zero-time first frame', () => {
  const drops = []
  const sequencer = createSequencer({ onDrop: event => drops.push(event) })
  sequencer.setScore(shortScore())
  sequencer.step(0, 120)
  sequencer.step(0, 120)
  assert.deepEqual(drops, [
    { x: 100, emitterId: 'low', beat: 0 },
    { x: 700, emitterId: 'high', beat: 0 },
  ])
  sequencer.step(0.49, 120)
  assert.equal(drops.length, 2)
  sequencer.step(0.01, 120)
  assert.equal(drops.at(-1).beat, 1)
  assert.equal(drops.length, 3)
})

test('offbeat events and loop openings are preserved when one frame crosses several boundaries', () => {
  const drops = []
  const sequencer = createSequencer({ onDrop: event => drops.push(event) })
  sequencer.setScore(shortScore())
  sequencer.step(5, 120)
  assert.deepEqual(drops.map(event => event.beat), [
    0, 0, 1, 1.5, 3.5,
    0, 0, 1, 1.5, 3.5,
    0, 0, 1, 1.5,
  ])
  assert.deepEqual(sequencer.getState(), { beat: 2, bar: 1, section: 'Answer', cycle: 2 })
  sequencer.step(1, 120)
  assert.equal(drops.filter(event => event.beat === 0).length, 8)
  assert.deepEqual(sequencer.getState(), { beat: 0, bar: 1, section: 'Opening', cycle: 3 })
})

test('pausing retains the phrase and changing tempo changes only subsequent beat progression', () => {
  const drops = []
  const sequencer = createSequencer({ onDrop: event => drops.push(event) })
  sequencer.setScore(shortScore())
  sequencer.step(0.75, 60)
  const paused = sequencer.getState()
  assert.deepEqual(sequencer.getState(), paused)
  assert.equal(drops.length, 2)
  sequencer.step(0.375, 120)
  assert.equal(sequencer.getState().beat, 1.5)
  assert.deepEqual(drops.slice(2).map(event => event.beat), [1, 1.5])
  sequencer.step(0.5, 60)
  assert.equal(sequencer.getState().section, 'Answer')
})

test('reset replays the opening while free layouts disable score playback', () => {
  const drops = []
  const sequencer = createSequencer({ onDrop: event => drops.push(event) })
  sequencer.setScore(shortScore())
  sequencer.step(1, 120)
  sequencer.reset()
  assert.deepEqual(sequencer.getState(), { beat: 0, bar: 1, section: 'Opening', cycle: 0 })
  sequencer.step(0, 120)
  assert.deepEqual(drops.slice(-2).map(event => event.emitterId), ['low', 'high'])
  sequencer.setScore(null)
  const count = drops.length
  sequencer.step(10, 144)
  assert.equal(drops.length, count)
  assert.deepEqual(sequencer.getState(), { beat: 0, bar: 1, section: '', cycle: 0 })
})

test('parade marks all four sections and returns to bar one after eight bars', () => {
  const { score, tempo } = createPreset('parade')
  const sequencer = createSequencer()
  sequencer.setScore(score)
  const states = []
  for (let section = 0; section < 4; section++) {
    states.push(sequencer.getState())
    sequencer.step(8 * 60 / tempo, tempo)
  }
  assert.deepEqual(states.map(state => [state.beat, state.bar, state.section]), [
    [0, 1, '整队'], [8, 3, '起行'], [16, 5, '焰火'], [24, 7, '回旋'],
  ])
  assert.deepEqual(sequencer.getState(), { beat: 0, bar: 1, section: '整队', cycle: 1 })
})
