import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { officialArena, orderedResults } from '../src/components/frontier/useAvis3Data.js'

const raw = JSON.parse(await readFile(new URL('../public/ai-frontier/evaluation-1108/evaluation-1108.json', import.meta.url), 'utf8'))

test('official results retain fourteen independent entrants and all 280 scored rounds', () => {
  assert.equal(raw.entrants.length, 14)
  assert.equal(new Set(raw.entrants.map(entry => entry.id)).size, 14)
  assert.equal(raw.total_rounds, 280)
  assert.equal(raw.scoring.theoretical_maximum, 866.2936695331011)
  assert.equal(raw.scoring.unit, 's')
  const ids = raw.entrants.map(entry => entry.id)
  for (const id of ['official-001', 'official-014', 'official-007', 'official-008']) assert.ok(ids.includes(id))
  assert.equal(raw.entrants.reduce((sum, entry) => sum + entry.rounds.length, 0), 280)
  for (const entry of raw.entrants) {
    assert.equal(entry.round_count, 20)
    assert.equal(entry.rounds.length, 20)
    assert.deepEqual(entry.rounds.map(round => round.index).sort((a, b) => a - b), Array.from({ length: 20 }, (_, index) => index + 1))
    const scores = entry.rounds.map(round => round.score)
    const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length
    const std = Math.sqrt(scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (scores.length - 1))
    assert.ok(Math.abs(mean - entry.mean) < 1e-10, entry.id + ' mean')
    assert.ok(Math.abs(std - entry.std) < 1e-10, entry.id + ' sample standard deviation')
    assert.equal(Math.min(...scores), entry.min)
    assert.equal(Math.max(...scores), entry.max)
  }
})

test('public mapping preserves raw precision and orders the official champion and runner-up', () => {
  const mapped = officialArena(raw)
  assert.deepEqual(orderedResults(mapped).map(entry => entry.contestantId),
    [4,14,5,10,1,2,6,12,7,8,3,15,9,11].map(number => 'official-' + String(number).padStart(3, '0')))
  for (const entry of raw.entrants) {
    const result = mapped.results.find(result => result.contestantId === entry.id)
    assert.equal(result.mean, entry.mean)
    assert.equal(result.std, entry.std)
    assert.deepEqual(result.roundScores, [...entry.rounds].sort((a, b) => a.index - b.index).map(round => round.score))
    const contestant = mapped.contestants.find(contestant => contestant.id === entry.id)
    assert.equal(contestant.model, entry.model)
    assert.equal(contestant.selfReport, entry.self_report)
  }
})
