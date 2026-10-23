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
  { label: 'C3', frequency: 130.81 },
  { label: 'D3', frequency: 146.83 },
  { label: 'E3', frequency: 164.81 },
  { label: 'G3', frequency: 196.0 },
  { label: 'A3', frequency: 220.0 },
]

export const PRESETS = [
  { id: 'lantern-ensemble', name: '灯火弦歌', description: '大提琴铺开长音，小提琴接过旋律；拨弦、铃声与鼓点层层汇成灯火。' },
  { id: 'string-parade', name: '弦上焰火', description: '低音拨弦托起鼓点，高铃穿过余韵；让七路弹珠奏出更温暖的焰火。' },
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
    note: type === 'string' ? 8 : type === 'bowed' ? 3 : 0,
    ...(type === 'bowed' ? { voice: 'violin', holdBeats: 4 } : {}),
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

function createStringParade() {
  const preset = createParade()
  preset.parts[2] = arrange('string', 295, 104, 8, 44)
  preset.parts[4] = arrange('string', 511, 104, 11, 44)
  preset.parts[7] = arrange('string', 260, 332, 10, -20)
  preset.score.id = 'string-parade'
  preset.score.name = '弦上焰火'
  preset.score.emitters[2].label = 'C3 弦'
  preset.score.emitters[4].label = 'G3 弦'
  return preset
}

function createLanternEnsemble() {
  const bowed = (x, y, note, voice, holdBeats, angle = 44) => ({
    ...arrange('bowed', x, y, note, angle), voice, holdBeats,
  })
  const emitters = [
    { id: 'cello-root', label: '大提琴 C3', x: 92 },
    { id: 'pluck', label: '拨弦 E3', x: 184 },
    { id: 'violin-g', label: '小提琴 G4', x: 276 },
    { id: 'drum', label: '鼓', x: 368 },
    { id: 'violin-c', label: '小提琴 C5', x: 460 },
    { id: 'bell', label: '铃 E5', x: 552 },
    { id: 'violin-d', label: '小提琴 D5', x: 644 },
    { id: 'cello-fifth', label: '大提琴 G3', x: 736 },
  ]
  const events = []
  const phrase = (emitterId, beats) => beats.forEach(beat => events.push({ beat, emitterId }))

  // Eight-beat cello foundations open into a two-note pedal at the climax.
  phrase('cello-root', [0, 16, 32, 40, 48, 56])
  phrase('cello-fifth', [8, 24, 32, 40, 56])
  phrase('violin-g', [4, 16, 28, 32, 36, 40, 44, 52, 60])
  phrase('violin-c', [12, 20, 34, 38, 42, 46, 48, 56])
  phrase('violin-d', [24, 35.5, 39.5, 43.5, 47])
  phrase('pluck', [2, 6, 10, 14, 17, 19, 21, 23, 25, 27, 29, 31,
    32.5, 34.5, 36.5, 38.5, 40.5, 42.5, 44.5, 46.5, 49.5, 53.5, 57.5, 61.5])
  phrase('bell', [7.5, 15.5, 22.5, 30.5, 33.5, 37.5, 41.5, 45.5, 51, 59, 63.5])
  // The opening breathes; a half-time walk grows into the full beat and recedes.
  phrase('drum', [16, 18, 20, 22, 24, 26, 28, 30, 31.5,
    ...Array.from({ length: 16 }, (_, beat) => beat + 32), 47.5, 48, 52, 56, 60])
  events.sort((left, right) => left.beat - right.beat)

  return {
    emitterX: 276,
    tempo: 116,
    parts: [
      bowed(81, 104, 8, 'cello', 8),
      arrange('string', 173, 104, 10, 44),
      bowed(265, 104, 3, 'violin', 4),
      arrange('drum', 348, 121, 0),
      bowed(449, 104, 5, 'violin', 4),
      arrange('bell', 534, 119, 7),
      bowed(633, 104, 6, 'violin', 2),
      bowed(722, 104, 11, 'cello', 8),
      arrange('string', 258, 330, 0, -22),
      arrange('bell', 412, 302, 4),
      arrange('string', 548, 338, 2, 22),
      arrange('bell', 688, 388, 5),
      arrange('ramp', 180, 438, 0, 22),
      arrange('ramp', 600, 465, 0, -22),
      arrange('bell', 350, 505, 0),
    ],
    score: {
      id: 'lantern-ensemble',
      name: '灯火弦歌',
      lengthBeats: 64,
      beatsPerBar: 4,
      emitters,
      events,
      sections: [
        { beat: 0, label: '序幕' },
        { beat: 16, label: '行进' },
        { beat: 32, label: '盛放' },
        { beat: 48, label: '余辉' },
      ],
    },
  }
}

export function createPreset(id = 'lantern-ensemble') {
  if (id === 'lantern-ensemble') return createLanternEnsemble()
  if (id === 'string-parade') return createStringParade()
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
