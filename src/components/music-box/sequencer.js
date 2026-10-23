export function createSequencer({ onDrop = () => {} } = {}) {
  let score = null
  let emitters = new Map()
  let position = 0
  let eventIndex = 0
  let eventCycle = 0

  function reset() {
    position = 0
    eventIndex = 0
    eventCycle = 0
  }

  return {
    setScore(nextScore) {
      score = nextScore
      emitters = new Map((score?.emitters || []).map(emitter => [emitter.id, emitter]))
      reset()
    },
    reset,
    step(dtSeconds, tempo) {
      if (!score || !Number.isFinite(dtSeconds) || dtSeconds < 0 || !Number.isFinite(tempo) || tempo <= 0) return
      position += dtSeconds * tempo / 60
      if (!score.events.length) return

      // The cursor owns each event once, including beat zero and loop boundaries.
      while (true) {
        const event = score.events[eventIndex]
        const eventPosition = eventCycle * score.lengthBeats + event.beat
        if (eventPosition > position + 1e-9) break
        const emitter = emitters.get(event.emitterId)
        onDrop({ x: emitter.x, emitterId: emitter.id, beat: event.beat })
        eventIndex += 1
        if (eventIndex === score.events.length) {
          eventIndex = 0
          eventCycle += 1
        }
      }
    },
    getState() {
      if (!score) return { beat: 0, bar: 1, section: '', cycle: 0 }
      const cycle = Math.floor((position + 1e-9) / score.lengthBeats)
      const beat = Math.max(0, position - cycle * score.lengthBeats)
      let section = ''
      for (const current of score.sections) {
        if (current.beat > beat + 1e-9) break
        section = current.label
      }
      return {
        beat,
        bar: Math.floor((beat + 1e-9) / score.beatsPerBar) + 1,
        section,
        cycle,
      }
    },
  }
}
