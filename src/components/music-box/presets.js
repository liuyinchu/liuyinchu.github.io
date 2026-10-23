export const BOARD_WIDTH = 800
export const BOARD_HEIGHT = 600

export const NOTES = [
  { label: 'C4', frequency: 261.63 },
  { label: 'D4', frequency: 293.66 },
  { label: 'E4', frequency: 329.63 },
  { label: 'G4', frequency: 392.0 },
  { label: 'A4', frequency: 440.0 },
  { label: 'C5', frequency: 523.25 },
  { label: 'D5', frequency: 587.33 },
  { label: 'E5', frequency: 659.25 },
]

export const PRESETS = [
  { id: 'parade', name: '焰火游行', description: '七路弹珠、四段推进；让鼓点领路，让高低铃声点亮夜空。' },
  { id: 'cascade', name: '铃声瀑布', description: '顺着斜坡落下，让五声音阶一层层亮起。' },
  { id: 'garden', name: '午后庭院', description: '木鼓和清铃交错，弹珠奏出轻盈的节拍。' },
  { id: 'blank', name: '空白画布', description: '放上第一件乐器，搭建属于你的声音路线。' },
]

export function createPart(type, x, y) {
  return {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    angle: type === 'ramp' ? 20 : 0,
    note: 0,
  }
}

function arrange(type, x, y, note = 0, angle = 0) {
  return { ...createPart(type, x, y), note, angle }
}

function createParade() {
  const emitters = [
    { id: 'pulse', label: '低鼓', x: 92 },
    { id: 'snap', label: '高鼓', x: 198 },
    { id: 'low', label: 'C4', x: 306 },
    { id: 'answer', label: 'G4', x: 414 },
    { id: 'spark', label: 'C5', x: 522 },
    { id: 'rise', label: 'D5', x: 630 },
    { id: 'flare', label: 'E5', x: 732 },
  ]
  const events = []
  const phrase = (emitterId, beats) => beats.forEach(beat => events.push({ beat, emitterId }))

  // Four-on-the-floor pulse, then backbeats and a short closing drum fill.
  phrase('pulse', Array.from({ length: 32 }, (_, beat) => beat))
  phrase('snap', [3, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 31.5, 31.75])
  phrase('low', [0, 4, 8, 12, 16, 18, 20, 22, 24, 28])
  phrase('answer', [2, 6, 9.5, 13.5, 17, 19, 21, 23, 26, 29.5])
  phrase('spark', [7, 10, 14, 16.5, 18.5, 20.5, 22.5, 27, 30, 31.5])
  phrase('rise', [11, 15, 17.5, 21.5, 30.5, 31.25])
  phrase('flare', [11.5, 15.5, 19.5, 23.5, 27.5, 31])
  events.sort((left, right) => left.beat - right.beat)

  return {
    emitterX: 306,
    tempo: 144,
    parts: [
      arrange('drum', 72, 121, 0),
      arrange('drum', 178, 121, 4),
      arrange('bell', 288, 119, 0),
      arrange('bell', 396, 119, 3),
      arrange('bell', 504, 119, 5),
      arrange('bell', 612, 119, 6),
      arrange('bell', 714, 119, 7),
      arrange('bell', 252, 305, 2),
      arrange('bell', 358, 305, 4),
      arrange('bell', 466, 305, 5),
      arrange('bell', 574, 305, 7),
      arrange('bell', 686, 305, 6),
      arrange('ramp', 235, 417, 0, 22),
      arrange('ramp', 589, 421, 0, -22),
      arrange('bell', 386, 490, 0),
      arrange('bell', 620, 500, 5),
    ],
    score: {
      id: 'parade',
      name: '焰火游行',
      lengthBeats: 32,
      beatsPerBar: 4,
      emitters,
      events,
      sections: [
        { beat: 0, label: '整队' },
        { beat: 8, label: '起行' },
        { beat: 16, label: '焰火' },
        { beat: 24, label: '回旋' },
      ],
    },
  }
}

export function createPreset(id = 'parade') {
  if (id === 'parade') return createParade()
  if (id === 'blank') return { parts: [], emitterX: 400, tempo: 88, score: null }
  if (id === 'garden') {
    return {
      emitterX: 300,
      tempo: 72,
      score: null,
      parts: [
        arrange('bell', 288, 138, 4),
        arrange('drum', 425, 242, 0),
        arrange('bell', 510, 400, 6),
        arrange('bell', 380, 407, 2),
        arrange('drum', 183, 476, 3),
        arrange('bell', 427, 496, 5),
        arrange('ramp', 560, 285, 0, -25),
        arrange('ramp', 66, 341, 0, 25),
      ],
    }
  }
  return {
    emitterX: 400,
    tempo: 88,
    score: null,
    parts: [
      arrange('bell', 388, 140, 0),
      arrange('bell', 532, 246, 2),
      arrange('bell', 764, 350, 4),
      arrange('bell', 455, 365, 5),
      arrange('drum', 275, 476, 0),
      arrange('bell', 522, 494, 6),
      arrange('ramp', 665, 284, 0, -24),
      arrange('ramp', 176, 353, 0, 24),
      arrange('bell', 573, 372, 3),
    ],
  }
}
