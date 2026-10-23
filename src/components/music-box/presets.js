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

export function createPreset(id = 'cascade') {
  if (id === 'blank') return { parts: [], emitterX: 400, tempo: 88 }
  if (id === 'garden') {
    return {
      emitterX: 300,
      tempo: 72,
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
