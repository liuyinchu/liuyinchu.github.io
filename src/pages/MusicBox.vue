<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { BOARD_WIDTH, BOARD_HEIGHT, NOTES, PRESETS, createPart, createPreset } from '../components/music-box/presets.js'
import { createSimulation } from '../components/music-box/simulation.js'
import { createAudioEngine } from '../components/music-box/audio.js'
import { createSequencer } from '../components/music-box/sequencer.js'

const STORAGE_KEY = 'music-box-layout-v1'
const MAX_PARTS = 64
const initial = createPreset('lantern-ensemble')
const parts = ref(initial.parts)
const emitterX = ref(initial.emitterX)
const tempo = ref(initial.tempo)
const score = ref(initial.score || null)
const presetId = ref('lantern-ensemble')
const selectedId = ref('')
const activeTool = ref('select')
const placementPoint = ref(null)
const board = ref(null)
const balls = shallowRef([])
const scoreState = shallowRef({ beat: 0, bar: 1, section: '', cycle: 0 })
const isPlaying = ref(false)
const isPreviewing = ref(false)
const isUnlocking = ref(false)
const hasStarted = ref(false)
const hitCount = ref(0)
const lastNote = ref('—')
const hitFlashes = ref({})
const bowedGates = ref({})
const bowTimers = new Map()
const volume = ref(60)
const muted = ref(false)
const dirty = ref(false)
const hasSavedLayout = ref(false)
const draggingId = ref('')
const undoStack = shallowRef([])
const redoStack = shallowRef([])
const notice = ref('先听「灯火弦歌」，让持续的弓弦与清亮的拨弦相遇。')
const partTypes = [
  { type: 'bell', name: '铃铛', hint: '清亮的音符' },
  { type: 'drum', name: '鼓', hint: '温暖的节拍' },
  { type: 'string', name: '弦', hint: '温柔的拨弦音' },
  { type: 'bowed', name: '弓弦', hint: '小提琴与大提琴的持续旋律' },
  { type: 'ramp', name: '斜坡', hint: '改变弹珠方向' },
]
const pitchOrderedNotes = NOTES.map((note, index) => ({ ...note, index })).sort((a, b) => a.frequency - b.frequency)
const selectedPart = computed(() => parts.value.find(part => part.id === selectedId.value) || null)
const hasBowVoices = computed(() => Object.keys(bowedGates.value).length > 0)
const quickNotes = computed(() => selectedPart.value?.type === 'bowed' ? pitchOrderedNotes.filter(note => note.label.slice(-1) === NOTES[selectedPart.value.note]?.label.slice(-1)) : pitchOrderedNotes)
const isRunning = computed(() => isPlaying.value || isPreviewing.value || hasBowVoices.value)
const stateLabel = computed(() => isPlaying.value ? '演奏中' : isPreviewing.value ? '单次试奏' : hasBowVoices.value ? '延音中' : hasStarted.value ? '已暂停' : '准备就绪')
const currentPreset = computed(() => PRESETS.find(preset => preset.id === presetId.value))
const activeEmitters = computed(() => score.value?.emitters || [{ id: 'manual', label: '落球', x: emitterX.value }])
const scoreProgress = computed(() => score.value ? scoreState.value.beat / score.value.lengthBeats * 100 : 0)
const currentBeat = computed(() => score.value ? Math.floor(scoreState.value.beat % score.value.beatsPerBar) : 0)
const audio = createAudioEngine()
let mounted = false
let frameId = 0
let previousTime = 0
let autoElapsed = 0
let interactionEpoch = 0
let flashSequence = 0
let drag = null
let rangeEdit = null
let savedLayoutKey = ''
const simulation = createSimulation({ parts: parts.value, onHit({ part, speed }) { hitCount.value += 1; flashPart(part); audio.hit(part, speed, { tempo: tempo.value }) } })
const sequencer = createSequencer({ onDrop: ({ x }) => simulation.drop(x) })
sequencer.setScore(score.value)
scoreState.value = sequencer.getState()
audio.setVolume(volume.value / 100)

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)) }
function typeName(type) { return partTypes.find(item => item.type === type)?.name || '零件' }
function partName(part, index) {
  const number = index === undefined ? parts.value.indexOf(part) + 1 : index + 1
  return `${String(number).padStart(2, '0')} · ${typeName(part.type)}${part.type === 'ramp' ? ` ${part.angle}°` : ` ${NOTES[part.note]?.label || 'C4'}`}`
}
function layoutData() { return { parts: parts.value, emitterX: emitterX.value, tempo: tempo.value, score: score.value } }
function editorSnapshot() { return clone({ ...layoutData(), presetId: presetId.value, selectedId: selectedId.value }) }
function historyKey(state) { const { selectedId: ignoredSelection, ...layout } = state; return JSON.stringify(layout) }
function refreshDirty() { dirty.value = JSON.stringify(layoutData()) !== savedLayoutKey }
function setParts(next, edited = true) {
  for (const id of Object.keys(bowedGates.value)) {
    if (!next.some(part => part.id === id && part.type === 'bowed')) releaseBowed(id)
  }
  parts.value = next
  simulation.setParts(next)
  if (edited) { presetId.value = 'custom'; refreshDirty() }
}
function remember(before, label) {
  if (historyKey(before) === historyKey(editorSnapshot())) return
  undoStack.value = [...undoStack.value.slice(-49), { state: before, label }]
  redoStack.value = []
  refreshDirty()
}
function restoreEditor(state) {
  const scoreChanged = JSON.stringify(score.value) !== JSON.stringify(state.score)
  if (scoreChanged) resetPerformance(false)
  setParts(clone(state.parts), false)
  emitterX.value = state.emitterX
  tempo.value = state.tempo
  score.value = clone(state.score)
  presetId.value = state.presetId
  selectedId.value = state.selectedId
  activeTool.value = 'select'
  placementPoint.value = null
  if (scoreChanged) { sequencer.setScore(score.value); scoreState.value = sequencer.getState() }
  refreshDirty()
}
function undo() {
  cancelDrag(); finishRangeEdit()
  const entry = undoStack.value.at(-1)
  if (!entry) return
  redoStack.value = [...redoStack.value, { state: editorSnapshot(), label: entry.label }]
  undoStack.value = undoStack.value.slice(0, -1)
  restoreEditor(entry.state)
  notice.value = `已撤销：${entry.label}。`
}
function redo() {
  cancelDrag(); finishRangeEdit()
  const entry = redoStack.value.at(-1)
  if (!entry) return
  undoStack.value = [...undoStack.value, { state: editorSnapshot(), label: entry.label }]
  redoStack.value = redoStack.value.slice(0, -1)
  restoreEditor(entry.state)
  notice.value = `已重做：${entry.label}。`
}
function beginBowGate(part) {
  const duration = (part.holdBeats || 4) * 60 / tempo.value * 1000
  clearTimeout(bowTimers.get(part.id))
  bowedGates.value = { ...bowedGates.value, [part.id]: performance.now() + duration }
  bowTimers.set(part.id, setTimeout(() => {
    bowTimers.delete(part.id)
    const next = { ...bowedGates.value }
    delete next[part.id]
    bowedGates.value = next
  }, duration))
}
function releaseBowed(partId) {
  audio.releaseBows(partId)
  if (partId) {
    clearTimeout(bowTimers.get(partId))
    bowTimers.delete(partId)
    const next = { ...bowedGates.value }
    delete next[partId]
    bowedGates.value = next
  } else {
    for (const timer of bowTimers.values()) clearTimeout(timer)
    bowTimers.clear()
    bowedGates.value = {}
  }
}
function flashPart(part) {
  if (part.type === 'bowed') beginBowGate(part)
  lastNote.value = part.type === 'drum' ? `鼓 · ${NOTES[part.note]?.label || 'C4'}` : NOTES[part.note]?.label || 'C4'
  hitFlashes.value = { ...hitFlashes.value, [part.id]: ++flashSequence }
}
function snapshotBalls() { balls.value = simulation.getBalls().map(ball => ({ id: ball.id, x: ball.x, y: ball.y, trail: ball.trail || [] })) }
function trailPoints(ball) { return [...ball.trail, { x: ball.x, y: ball.y }].map(point => `${point.x},${point.y}`).join(' ') }
function frame(time) {
  frameId = 0
  if (!mounted || !isRunning.value) return
  const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0
  previousTime = time
  if (isPlaying.value) {
    if (score.value) { sequencer.step(dt, tempo.value); scoreState.value = sequencer.getState() }
    else {
      autoElapsed += dt
      const interval = 60 / tempo.value
      if (autoElapsed >= interval) { simulation.drop(emitterX.value); autoElapsed %= interval }
    }
  }
  simulation.step(dt)
  snapshotBalls()
  if (isPreviewing.value && !balls.value.length) {
    isPreviewing.value = false; previousTime = 0
    notice.value = hasBowVoices.value ? '弹珠已落下，弓弦正在延音；点击暂停可收音。' : '试奏结束。再投一颗，或开始连续演奏。'
    return
  }
  frameId = requestAnimationFrame(frame)
}
function ensureFrame() { if (!frameId && mounted) { previousTime = 0; frameId = requestAnimationFrame(frame) } }
function pausePlayback(message = '已暂停。弹珠与曲目进度留在原处。') {
  releaseBowed()
  interactionEpoch += 1
  isUnlocking.value = false; isPlaying.value = false; isPreviewing.value = false
  if (frameId) cancelAnimationFrame(frameId)
  frameId = 0; previousTime = 0
  if (message) notice.value = message
}
async function withAudio(action) {
  const epoch = ++interactionEpoch
  isUnlocking.value = true
  let available = false
  try { available = await audio.unlock() } catch { available = false }
  if (!mounted || epoch !== interactionEpoch) return
  isUnlocking.value = false
  if (document.hidden) return
  action()
  if (!available) notice.value = '暂时无法启用声音，仍可编辑和观看演奏。'
}
function togglePlayback() {
  if (isRunning.value) { pausePlayback(); return }
  withAudio(() => {
    isPlaying.value = true; isPreviewing.value = false; hasStarted.value = true
    if (score.value) { sequencer.step(0, tempo.value); scoreState.value = sequencer.getState() }
    else if (!simulation.getBalls().length) simulation.drop(emitterX.value)
    snapshotBalls(); ensureFrame()
    notice.value = score.value ? `「${score.value.name}」开始了。旋律会循环，也可以边听边改。` : '开始演奏。拖动零件，听一听新的相遇。'
  })
}
function dropOne() {
  withAudio(() => {
    simulation.drop(emitterX.value); hasStarted.value = true
    if (!isPlaying.value) isPreviewing.value = true
    snapshotBalls(); ensureFrame()
    notice.value = '投下一颗弹珠。单颗试奏不会启动曲目连投。'
  })
}
function resetPerformance(announce = true) {
  pausePlayback(''); simulation.reset(); sequencer.reset()
  scoreState.value = sequencer.getState()
  balls.value = []; hitCount.value = 0; lastNote.value = '—'; hitFlashes.value = {}; hasStarted.value = false; autoElapsed = 0
  if (announce) notice.value = '演奏回到开头，画板编排保留。'
}
function loadPreset(id) {
  finishDrag(); finishRangeEdit()
  const before = editorSnapshot()
  const preset = createPreset(id)
  resetPerformance(false); setParts(preset.parts, false)
  emitterX.value = preset.emitterX; tempo.value = preset.tempo; score.value = preset.score || null
  sequencer.setScore(score.value); scoreState.value = sequencer.getState()
  presetId.value = id; selectedId.value = ''; activeTool.value = 'select'; placementPoint.value = null
  remember(before, `切换到${PRESETS.find(item => item.id === id)?.name || '草稿'}`)
  notice.value = id === 'blank' ? '空白画板已就绪。选一个工具，再点画板放置。' : `已打开「${currentPreset.value?.name}」。原来的编排可以撤销找回。`
}
function setTool(type) {
  finishDrag(); finishRangeEdit()
  activeTool.value = type; placementPoint.value = null
  if (type !== 'select') {
    selectedId.value = ''
    notice.value = `点击画板放置${typeName(type)}；按 Enter 放在中央，Esc 退出。`
    board.value?.focus({ preventScroll: true })
  }
}
function selectPart(id) { finishRangeEdit(); selectedId.value = id }
function boundedPosition(part, x, y) {
  const margin = ['string', 'bowed'].includes(part.type) ? 78 : part.type === 'ramp' ? 66 : 34
  return { x: Math.round(clamp(x, margin, BOARD_WIDTH - margin)), y: Math.round(clamp(y, 70, BOARD_HEIGHT - margin)) }
}
function placePart(type, x, y) {
  if (type === 'select') return
  if (parts.value.length >= MAX_PARTS) { notice.value = `画板最多放置 ${MAX_PARTS} 个零件，先移除一个再试。`; return }
  const before = editorSnapshot()
  const part = createPart(type, x, y)
  Object.assign(part, boundedPosition(part, x, y))
  setParts([...parts.value, part]); selectedId.value = part.id; activeTool.value = 'select'; placementPoint.value = null
  remember(before, `加入${typeName(type)}`)
  notice.value = `已放置${typeName(type)}。${type === 'ramp' ? '用 ±15° 快速转动，也可以拖动滑杆。' : '点音符就能试听，也可以复制出下一枚。'}`
}
function placeAtCenter() { if (activeTool.value !== 'select') placePart(activeTool.value, BOARD_WIDTH / 2, BOARD_HEIGHT / 2) }
function onToolEnter(event, type) { event.preventDefault(); if (activeTool.value === type) placeAtCenter(); else setTool(type) }
function updateSelected(field, value, rememberChange = true) {
  const part = selectedPart.value
  if (!part || part[field] === value) return
  const before = rememberChange ? editorSnapshot() : null
  setParts(parts.value.map(item => item.id === part.id ? { ...item, [field]: value } : item))
  if (before) remember(before, { note: '更改音符', voice: '切换弓弦音色', holdBeats: '调整延音时值' }[field] || `旋转${typeName(part.type)}`)
}
function audition(part = selectedPart.value) {
  if (!part || part.type === 'ramp') return
  const playedPart = { ...part }
  withAudio(() => {
    audio.hit(playedPart, 270, { tempo: tempo.value }); flashPart(playedPart)
    if (playedPart.type === 'bowed') hasStarted.value = true
    notice.value = muted.value ? `已试听 ${NOTES[playedPart.note].label}，当前处于静音。` : `试听 ${typeName(playedPart.type)} · ${NOTES[playedPart.note].label}。`
  })
}
function setBowSetting(field, value) { finishRangeEdit(); updateSelected(field, value); audition() }
function setNote(value) { finishRangeEdit(); updateSelected('note', Number(value)); audition() }
function rotateSelected(delta) { finishRangeEdit(); if (['ramp', 'string', 'bowed'].includes(selectedPart.value?.type)) updateSelected('angle', clamp(selectedPart.value.angle + delta, -75, 75)) }
function duplicateSelected() {
  finishDrag(); finishRangeEdit()
  const source = selectedPart.value
  if (!source) return
  if (parts.value.length >= MAX_PARTS) { notice.value = '零件数量已达上限，先移除一个再复制。'; return }
  const before = editorSnapshot()
  const part = { ...createPart(source.type, source.x + 40, source.y + 40), note: source.note, angle: source.angle, ...(source.type === 'bowed' ? { voice: source.voice, holdBeats: source.holdBeats } : {}) }
  Object.assign(part, boundedPosition(part, part.x, part.y))
  setParts([...parts.value, part]); selectedId.value = part.id
  remember(before, `复制${typeName(source.type)}`)
  notice.value = `已复制${typeName(source.type)}，拖到新的位置即可。`
}
function removeSelected() {
  finishDrag(); finishRangeEdit()
  if (!selectedPart.value) return
  const before = editorSnapshot()
  const name = typeName(selectedPart.value.type)
  setParts(parts.value.filter(part => part.id !== selectedId.value)); selectedId.value = ''
  remember(before, `移除${name}`); notice.value = `已移除${name}，可以撤销。`
}
function clearBoard() {
  finishDrag(); finishRangeEdit()
  const before = editorSnapshot()
  resetPerformance(false); setParts([], false)
  score.value = null; sequencer.setScore(null); scoreState.value = sequencer.getState()
  presetId.value = 'blank'; selectedId.value = ''; activeTool.value = 'select'; placementPoint.value = null
  remember(before, '清空画板'); notice.value = '画板已清空。点击撤销可找回刚才的完整编排。'
}
function movePart(id, x, y) {
  const part = parts.value.find(item => item.id === id)
  if (!part) return
  const position = boundedPosition(part, x, y)
  if (position.x === part.x && position.y === part.y) return
  setParts(parts.value.map(item => item.id === id ? { ...item, ...position } : item))
}
function boardPoint(event) { const matrix = board.value?.getScreenCTM(); return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null }
function onBoardPointerDown(event) {
  if (event.button !== 0) return
  if (activeTool.value === 'select') { selectedId.value = ''; return }
  const point = boardPoint(event)
  if (point) { event.preventDefault(); placePart(activeTool.value, point.x, point.y) }
}
function startDrag(event, part) {
  if (event.button !== 0 || drag) return
  const point = boardPoint(event)
  if (!point) return
  if (activeTool.value !== 'select') { event.preventDefault(); placePart(activeTool.value, point.x, point.y); return }
  finishRangeEdit(); selectedId.value = part.id; event.currentTarget.focus({ preventScroll: true }); event.preventDefault()
  drag = { id: part.id, pointerId: event.pointerId, element: event.currentTarget, offsetX: point.x - part.x, offsetY: point.y - part.y, before: editorSnapshot() }
  draggingId.value = part.id; event.currentTarget.setPointerCapture(event.pointerId)
}
function onBoardPointerMove(event) {
  const point = boardPoint(event)
  if (!point) return
  if (activeTool.value !== 'select') placementPoint.value = boundedPosition({ type: activeTool.value }, point.x, point.y)
  if (drag && event.pointerId === drag.pointerId) movePart(drag.id, point.x - drag.offsetX, point.y - drag.offsetY)
}
function endDrag(event, cancelled) {
  if (!drag || event && event.pointerId !== drag.pointerId) return
  const previous = drag
  drag = null; draggingId.value = ''
  if (previous.element.hasPointerCapture(previous.pointerId)) previous.element.releasePointerCapture(previous.pointerId)
  if (cancelled) { setParts(previous.before.parts, false); presetId.value = previous.before.presetId; refreshDirty() }
  else remember(previous.before, `移动${typeName(parts.value.find(part => part.id === previous.id)?.type)}`)
}
function finishDrag(event) { endDrag(event, false) }
function cancelDrag(event) { endDrag(event, true) }
function updateRange(field, raw) {
  if (!rangeEdit) rangeEdit = { before: editorSnapshot(), field }
  const value = Number(raw)
  if (field === 'angle') updateSelected('angle', value, false)
  else { if (field === 'tempo') tempo.value = value; else emitterX.value = value; presetId.value = 'custom'; refreshDirty() }
}
function finishRangeEdit() {
  if (!rangeEdit) return
  const edit = rangeEdit; rangeEdit = null
  remember(edit.before, { angle: '调整倾角', tempo: '调整速度', emitterX: '调整落球位置' }[edit.field])
}
function updateVolume() { audio.setVolume(volume.value / 100) }
function toggleMuted() { muted.value = !muted.value; audio.setMuted(muted.value); notice.value = muted.value ? '已静音，演奏继续。' : '声音已开启。' }
function validScore(value) {
  if (value == null) return true
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || !Number.isFinite(value.lengthBeats) || value.lengthBeats <= 0 || !Number.isInteger(value.beatsPerBar) || value.beatsPerBar <= 0 || !Array.isArray(value.emitters) || !value.emitters.length || !Array.isArray(value.events) || !Array.isArray(value.sections)) return false
  const validBeat = beat => Number.isFinite(beat) && beat >= 0 && beat < value.lengthBeats
  return value.emitters.every(source => source && typeof source.id === 'string' && typeof source.label === 'string' && Number.isFinite(source.x) && source.x >= 0 && source.x <= BOARD_WIDTH) && value.events.every(event => event && validBeat(event.beat) && value.emitters.some(source => source.id === event.emitterId)) && value.sections.every(section => section && validBeat(section.beat) && typeof section.label === 'string')
}
function saveLayout() {
  finishDrag(); finishRangeEdit()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...layoutData() }))
    savedLayoutKey = JSON.stringify(layoutData()); dirty.value = false; hasSavedLayout.value = true
    notice.value = '编排已保存在此浏览器，下次打开会自动恢复。'
  } catch { notice.value = '浏览器未能保存编排，当前画板仍可继续使用。' }
}
function loadLayout(automatic = false) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) { if (!automatic) notice.value = '此浏览器还没有保存的编排。'; return }
    const layout = JSON.parse(raw)
    if (layout?.version !== 1 || !Array.isArray(layout.parts) || layout.parts.length > MAX_PARTS || !Number.isFinite(layout.emitterX) || !Number.isFinite(layout.tempo) || !validScore(layout.score) || !layout.parts.every(part => part && ['bell', 'drum', 'ramp', 'string', 'bowed'].includes(part.type) && typeof part.id === 'string' && Number.isFinite(part.x) && Number.isFinite(part.y) && (part.angle == null || Number.isFinite(part.angle)) && (part.note == null || Number.isInteger(part.note) && part.note >= 0 && part.note < NOTES.length) && (part.type !== 'bowed' || (part.voice == null || ['violin', 'cello'].includes(part.voice)) && (part.holdBeats == null || [2, 4, 8].includes(part.holdBeats))))) throw new Error('Invalid saved layout')
    finishDrag(); finishRangeEdit()
    const before = editorSnapshot()
    resetPerformance(false)
    setParts(layout.parts.map(part => ({ ...part, ...boundedPosition(part, part.x, part.y), note: part.note ?? (part.type === 'bowed' ? 3 : part.type === 'string' ? 8 : 0), ...(part.type === 'bowed' ? { voice: part.voice || 'violin', holdBeats: part.holdBeats || 4 } : {}), angle: clamp(part.angle ?? (part.type === 'ramp' ? 20 : 0), -75, 75) })), false)
    emitterX.value = clamp(layout.emitterX, 64, BOARD_WIDTH - 64); tempo.value = clamp(layout.tempo, 30, 180); score.value = layout.score || null
    sequencer.setScore(score.value); scoreState.value = sequencer.getState()
    selectedId.value = ''; activeTool.value = 'select'; presetId.value = 'custom'
    if (!automatic) remember(before, '读回保存的编排')
    hasSavedLayout.value = true; savedLayoutKey = JSON.stringify(layoutData()); dirty.value = false
    notice.value = '已恢复保存的编排。点击开始，继续你的旋律。'
  } catch { notice.value = '暂时无法读取保存的编排，当前画板仍可继续使用。' }
}
function onKeydown(event) {
  const target = event.target
  const formInput = target instanceof Element && target.closest('input, select, textarea, [contenteditable="true"]')
  if (event.defaultPrevented || event.altKey) return
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    if (formInput && !formInput.matches('input[type="range"]')) return
    event.preventDefault()
    if (event.shiftKey) redo(); else undo()
    return
  }
  if (formInput || event.ctrlKey || event.metaKey) return
  if (event.key === 'Escape') {
    const wasDragging = !!drag
    cancelDrag(); activeTool.value = 'select'; placementPoint.value = null
    if (!wasDragging) selectedId.value = ''
    notice.value = wasDragging ? '已取消这次移动，零件回到原位。' : '已回到选择工具。'
    return
  }
  if (target instanceof Element && target.closest('button, a')) return
  if (event.code === 'Space') { event.preventDefault(); if (!isUnlocking.value) togglePlayback(); return }
  const part = selectedPart.value
  if (!part) return
  if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelected(); return }
  const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
  if (direction) {
    event.preventDefault()
    const before = editorSnapshot(); const step = event.shiftKey ? 20 : 5
    movePart(part.id, part.x + direction[0] * step, part.y + direction[1] * step); remember(before, `移动${typeName(part.type)}`)
  }
}
function onVisibilityChange() { if (document.hidden) { cancelDrag(); if (isRunning.value || isUnlocking.value) pausePlayback('页面已暂停。回来后点击开始，继续这段旋律。') } }
function onWindowBlur() { cancelDrag() }
onMounted(() => {
  mounted = true; savedLayoutKey = JSON.stringify(layoutData()); loadLayout(true)
  document.addEventListener('keydown', onKeydown); document.addEventListener('visibilitychange', onVisibilityChange); window.addEventListener('blur', onWindowBlur)
})
onBeforeUnmount(() => {
  mounted = false; cancelDrag(); pausePlayback('')
  document.removeEventListener('keydown', onKeydown); document.removeEventListener('visibilitychange', onVisibilityChange); window.removeEventListener('blur', onWindowBlur)
  audio.dispose()
})
</script>


<template>
  <main class="music-workshop" data-testid="music-box">
    <div class="workshop-content">
      <header class="workshop-heading">
        <div class="heading-copy"><RouterLink to="/code" class="back-link" aria-label="返回代码与项目"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 4-6 6 6 6M6 10h11"/></svg></RouterLink><div><p class="eyebrow">LITTLE SOUND WORKSHOP</p><h1>音乐机关盒<span>摆一段轨道，让碰撞写成旋律。</span></h1></div></div>
        <span class="workshop-stamp"><i></i>一方小小的声音工坊</span>
      </header>
      <section class="transport-bar" aria-label="演奏与曲目">
        <div class="transport-actions">
          <button class="play-button" data-testid="music-play" type="button" :aria-pressed="isRunning" :disabled="isUnlocking" @click="togglePlayback"><svg v-if="isRunning" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v12M14 4v12"/></svg><svg v-else viewBox="0 0 20 20" aria-hidden="true"><path d="m6 3 11 7-11 7Z"/></svg>{{ isUnlocking ? '准备声音…' : isRunning ? '暂停' : '开始演奏' }}</button>
          <button class="raised-button drop-button" data-testid="music-drop" type="button" :disabled="isUnlocking" @click="dropOne"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v7m-3-3 3 3 3-3"/><circle cx="10" cy="14.5" r="3.5"/></svg>投一颗</button>
          <button class="quiet-button reset-button" data-testid="music-reset" type="button" aria-label="重置演奏，保留画板编排" title="重置演奏，保留画板编排" @click="resetPerformance()"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a6 6 0 1 1-1 6M4 2v5h5"/></svg><span>重置演奏</span></button>
          <button class="icon-button mute-button transport-mute" data-testid="music-mute" type="button" :aria-label="muted ? '开启声音' : '静音'" :aria-pressed="muted" @click="toggleMuted"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z"/><path v-if="muted" d="m17 9 5 6m0-6-5 6"/><path v-else d="M17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg></button>
        </div>
        <div class="scene-picker"><label for="music-preset">曲目 / 草稿</label><select id="music-preset" :value="presetId" data-testid="music-preset" @change="loadPreset($event.target.value)"><option v-if="presetId === 'custom'" value="custom" disabled>我的编排{{ score ? ` · ${score.name}` : '' }}</option><option v-for="preset in PRESETS" :key="preset.id" :value="preset.id">{{ preset.name }}</option></select></div>
        <button class="save-button" data-testid="music-save" type="button" @click="saveLayout"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2h10l3 3v13H3V2ZM6 2v6h8V2M6 18v-7h8v7"/></svg>{{ hasSavedLayout && !dirty ? '已保存' : '保存编排' }}<span v-if="dirty" class="unsaved-dot" aria-label="有未保存的更改"></span></button>
      </section>
      <div class="workbench">
        <section class="board-panel" aria-label="画板与编辑工具">
          <div class="tool-strip">
            <div class="placement-tools" role="group" aria-label="选择放置工具">
              <button class="placement-tool" data-testid="music-tool-select" type="button" :aria-pressed="activeTool === 'select'" title="选择与移动零件（Esc）" @click="setTool('select')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 13 9-6 1-3 6Z"/><path d="m13 13 4 7"/></svg><span>选择</span></button>
              <button v-for="item in partTypes" :key="item.type" class="placement-tool" :data-testid="`music-add-${item.type}`" type="button" :aria-label="`放置${item.name}：选择后点击画板，或按 Enter 在中央加入`" :aria-pressed="activeTool === item.type" @click="setTool(item.type)" @keydown.enter.stop="onToolEnter($event, item.type)">
                <svg viewBox="0 0 32 28" aria-hidden="true"><g v-if="item.type === 'bell'"><circle cx="16" cy="14" r="9" fill="#d6b97a" stroke="#ae8d50"/><circle cx="16" cy="14" r="5.8" fill="none" stroke="#a38248"/><circle cx="16" cy="10" r="1" fill="#8d6d39"/></g><g v-else-if="item.type === 'drum'"><circle cx="16" cy="14" r="10" fill="#b78e70" stroke="#957057"/><circle cx="16" cy="14" r="7" fill="#e8d7bc"/><path d="M13 12h6m-6 4h6" stroke="#ad906c"/></g><g v-else-if="item.type === 'bowed'"><path d="M4 17Q16 22 28 17" fill="none" stroke="#a7b691" stroke-width="3"/><path d="M4 12H28" stroke="#a19655" stroke-width="2"/><path d="M12 3 19 25" stroke="#92714e" stroke-width="2"/><path d="M15 3 21 24" stroke="#e9dab0" stroke-width="1.3"/><circle cx="4" cy="12" r="2.5" fill="#b8a575"/><circle cx="28" cy="12" r="2.5" fill="#b8a575"/></g><g v-else-if="item.type === 'string'"><path d="M4 18Q16 23 28 18" fill="none" stroke="#c5b797" stroke-width="3"/><rect x="2" y="9" width="5" height="12" rx="2" fill="#b6aa85"/><rect x="25" y="9" width="5" height="12" rx="2" fill="#b6aa85"/><path d="M4 13H28" stroke="#b08740" stroke-width="1.7"/><path d="M15 11v5" stroke="#8f7246" stroke-width="2"/></g><g v-else transform="rotate(-20 16 14)"><rect x="2" y="11" width="28" height="6" rx="3" fill="#b18c5d" stroke="#8d6b43"/><path d="M6 13h20" stroke="#e2c48a"/></g></svg><span>{{ item.name }}</span>
              </button>
            </div>
            <div class="history-tools"><button class="icon-button" data-testid="music-undo" type="button" :disabled="!undoStack.length" aria-label="撤销（Ctrl 或 Command + Z）" :title="undoStack.length ? `撤销：${undoStack.at(-1).label}` : '撤销'" @click="undo"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4-4 4 4 4M3 8h8a5 5 0 0 1 0 10"/></svg></button><button class="icon-button" data-testid="music-redo" type="button" :disabled="!redoStack.length" aria-label="重做（Ctrl 或 Command + Shift + Z）" :title="redoStack.length ? `重做：${redoStack.at(-1).label}` : '重做'" @click="redo"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13 4 4 4-4 4m4-4H9a5 5 0 0 0 0 10"/></svg></button></div>
          </div>
          <div class="tool-context"><span :class="{ 'placing-hint': activeTool !== 'select' }">{{ activeTool === 'select' ? '选中调音，拖动改道。' : `点击画板放置${typeName(activeTool)} · Enter 中央加入 · Esc 退出` }}</span><span class="play-state" :class="{ active: isRunning }"><i></i>{{ stateLabel }}</span></div>
          <div class="stage-bed">
          <div class="wood-frame">
            <i v-for="corner in ['tl', 'tr', 'bl', 'br']" :key="corner" class="frame-screw" :class="corner" aria-hidden="true"></i>
            <div class="board-surface">
              <svg
                ref="board"
                class="music-board"
                data-testid="music-board"
                :viewBox="`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`"
                role="group"
                aria-label="音乐机关盒画板；选择零件后可拖动，或用方向键移动"
                @pointermove="onBoardPointerMove"
                @pointerup="finishDrag"
                @pointercancel="cancelDrag"
                @lostpointercapture="cancelDrag"
                @pointerdown="onBoardPointerDown"
                @pointerleave="placementPoint = null"
                @keydown.enter.stop.prevent="placeAtCenter"
                :class="{ placing: activeTool !== 'select' }"
                tabindex="0"
              >
                <defs>
                  <pattern id="music-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#87795d" stroke-width="0.5" opacity="0.19"/><circle cx="0" cy="0" r="1" fill="#87795d" opacity="0.25"/></pattern>
                  <pattern id="music-major-grid" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#music-grid)"/><path d="M100 0H0V100" fill="none" stroke="#87795d" stroke-width="0.7" opacity="0.17"/></pattern>
                  <radialGradient id="music-brass" cx="32%" cy="24%" r="85%"><stop stop-color="#f7df9a"/><stop offset="0.6" stop-color="#d5b364"/><stop offset="1" stop-color="#a47a38"/></radialGradient>
                  <radialGradient id="music-marble" cx="30%" cy="25%" r="75%"><stop stop-color="#e2f4e9"/><stop offset="0.45" stop-color="#7eb7a7"/><stop offset="1" stop-color="#295e54"/></radialGradient>
                  <linearGradient id="music-rail" x2="0" y2="1"><stop stop-color="#bd925d"/><stop offset="0.45" stop-color="#916841"/><stop offset="1" stop-color="#694931"/></linearGradient>
                  <filter id="music-part-shadow" x="-50%" y="-80%" width="200%" height="260%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#564331" flood-opacity="0.2"/></filter>
                </defs>
                <rect width="800" height="600" fill="#f1f1e8"/>
                <rect x="20" y="20" width="760" height="560" fill="url(#music-major-grid)" pointer-events="none"/>
                <rect x="20" y="20" width="760" height="560" rx="2" fill="none" stroke="#b6aa90" stroke-width="0.8" pointer-events="none"/>
                <g class="board-rulers" aria-hidden="true" pointer-events="none">
                  <path v-for="n in 39" :key="`tick-x-${n}`" :d="`M${n * 20} 20v${n % 5 === 0 ? 8 : 4}`"/>
                  <path v-for="n in 29" :key="`tick-y-${n}`" :d="`M20 ${n * 20}h${n % 5 === 0 ? 8 : 4}`"/>
                  <text v-for="n in 7" :key="`number-${n}`" :x="n * 100" y="14" text-anchor="middle">{{ String(n * 100).padStart(3, '0') }}</text>
                  <text x="36" y="562" class="board-signature">MUSIC MECHANISM / NO. 01</text>
                  <path d="M744 554h18m-9-9v18"/>
                  <text x="741" y="535" text-anchor="end">重力 ↓</text>
                </g>

                <g v-for="source in activeEmitters" :key="source.id" :transform="`translate(${source.x} 0)`" class="emitter" aria-hidden="true" pointer-events="none">
                  <path d="M0 43v27" stroke="#6b9b87" stroke-width="1.4" stroke-dasharray="3 5" opacity="0.45"/>
                  <rect x="-20" y="0" width="40" height="10" rx="3" fill="#c7d0bd" stroke="#92a28b" stroke-width="1"/>
                  <path d="M-15 9H15L8 31H-8Z" fill="url(#music-brass)" stroke="#a27d43" stroke-width="1.1"/>
                  <path d="M-10 13H10M-8 17H8" stroke="#f5dda4" stroke-width="1.2" opacity="0.7"/>
                  <rect x="-9" y="27" width="18" height="7" rx="3" fill="#977444"/><circle cx="0" cy="35" r="4.5" fill="url(#music-marble)"/>
                  <text x="0" y="56" text-anchor="middle" class="emitter-label-svg">{{ source.label }}</text>
                </g>

                <g v-if="!parts.length" class="empty-board" pointer-events="none" aria-hidden="true">
                  <circle cx="400" cy="252" r="36" fill="none" stroke="#b8ad96" stroke-width="1.2" stroke-dasharray="4 6"/>
                  <path d="M388 252h24m-12-12v24" stroke="#a39981" stroke-width="1.6"/>
                  <text x="400" y="317" text-anchor="middle">给第一颗弹珠，安排一次相遇。</text>
                  <text x="400" y="345" text-anchor="middle" class="empty-hint">选一个工具，点击画板开始创作</text>
                </g>

                <g
                  v-for="(part, index) in parts"
                  :key="part.id"
                  class="music-part"
                  :class="{ selected: selectedId === part.id, dragging: draggingId === part.id }"
                  data-testid="music-part"
                  :data-part-id="part.id"
                  :data-type="part.type"
                  :data-x="part.x"
                  :data-y="part.y"
                  :transform="`translate(${part.x} ${part.y}) rotate(${['ramp', 'string', 'bowed'].includes(part.type) ? part.angle : 0})`"
                  tabindex="0"
                  role="button"
                  :aria-label="`${partName(part, index)}，位置 ${Math.round(part.x)}，${Math.round(part.y)}；可拖动或用方向键移动`"
                  :aria-pressed="selectedId === part.id"
                  @focus="selectPart(part.id)"
                  @pointerdown.stop="startDrag($event, part)"
                  @keydown.enter.stop.prevent="selectedId = part.id"
                  @keydown.space.stop.prevent="selectedId = part.id"
                >
                  <title>{{ partName(part, index) }} · 拖动调整位置</title>
                  <template v-if="part.type === 'ramp'">
                    <rect x="-66" y="-38" width="132" height="76" rx="8" fill="transparent"/>
                    <rect v-if="selectedId === part.id" class="selection-outline" x="-65" y="-15" width="130" height="30" rx="8"/>
                    <g filter="url(#music-part-shadow)" pointer-events="none">
                      <rect x="-58" y="-6" width="116" height="12" rx="5" fill="url(#music-rail)" stroke="#785334" stroke-width="1.2"/>
                      <path d="M-52-3H52" stroke="#ddbd7f" stroke-width="2" stroke-linecap="round"/>
                      <path d="M-47 3H47" stroke="#66472f" stroke-width="0.8" opacity="0.55"/>
                      <circle v-for="x in [-50, 50]" :key="x" :cx="x" r="3.2" fill="#caaa68" stroke="#795832" stroke-width="0.8"/>
                      <path d="M-52 0h4m96 0h4" stroke="#76512d" stroke-width="0.8"/>
                    </g>
                  </template>
                  <template v-else-if="part.type === 'bowed'">
                    <rect x="-80" y="-44" width="160" height="92" rx="10" fill="transparent"/>
                    <rect v-if="selectedId === part.id" class="selection-outline" x="-78" y="-41" width="156" height="89" rx="10"/>
                    <g pointer-events="none">
                      <path d="M-66 12Q0 26 66 12" fill="none" stroke="#a9b79a" stroke-width="10" stroke-linecap="round" filter="url(#music-part-shadow)"/>
                      <path d="M-60 10Q0 23 60 10" fill="none" stroke="#e1e8ce" stroke-width="1.5"/>
                      <g v-for="postX in [-66, 66]" :key="postX" :transform="`translate(${postX} 0)`"><rect x="-7" y="-12" width="14" height="27" rx="4" fill="#c5d0b6" stroke="#899d7b" stroke-width="1.1"/><circle r="4.5" fill="url(#music-brass)" stroke="#947744"/><path d="M-2-2 2 2" stroke="#8f744b"/></g>
                      <path d="M-7 6-4-4H4L7 6Z" fill="#b19b6b" stroke="#7e784e" stroke-width="0.8"/>
                      <path d="M-66 0H66" class="bowed-rest"/>
                      <g class="bowed-activity" data-testid="music-bowed-activity" :class="{ 'is-active': !!bowedGates[part.id] }" :data-active="!!bowedGates[part.id]" :data-state="bowedGates[part.id] ? 'sounding' : 'idle'" :data-until="bowedGates[part.id] || 0" :data-voice="part.voice" :data-hold-beats="part.holdBeats" :style="{ '--bow-period': `${120 / tempo}s` }">
                        <path d="M-66 0H66" class="bowed-glow"/>
                        <g class="bowed-bow"><path d="M-13-32Q-5 1 12 33" fill="none" stroke="#8f704c" stroke-width="3.4" stroke-linecap="round"/><path d="M-9-31 15 31" fill="none" stroke="#f3e6bc" stroke-width="2"/><path d="M-14-32-8-32M10 32H16" stroke="#9b8159" stroke-width="3" stroke-linecap="round"/><rect x="7" y="22" width="9" height="13" rx="2" transform="rotate(-20 11.5 28.5)" fill="#6a7560" stroke="#515f49" stroke-width="0.8"/></g>
                      </g>
                      <text y="42" dominant-baseline="central" text-anchor="middle" class="bowed-note">{{ NOTES[part.note]?.label }}</text>
                    </g>
                  </template>
                  <template v-else-if="part.type === 'string'">
                    <rect x="-78" y="-38" width="156" height="76" rx="10" fill="transparent"/>
                    <rect v-if="selectedId === part.id" class="selection-outline" x="-77" y="-22" width="154" height="64" rx="10"/>
                    <g pointer-events="none">
                      <path d="M-66 11Q0 22 66 11" fill="none" stroke="#c1b99c" stroke-width="8" stroke-linecap="round" filter="url(#music-part-shadow)"/>
                      <path d="M-61 10Q0 19 61 10" fill="none" stroke="#efe5c6" stroke-width="1.3"/>
                      <g v-for="postX in [-66, 66]" :key="postX" :transform="`translate(${postX} 0)`">
                        <rect x="-7" y="-11" width="14" height="25" rx="4" fill="#ddd5b9" stroke="#a79d7c" stroke-width="1.1"/>
                        <circle r="4.5" fill="url(#music-brass)" stroke="#947744" stroke-width="1"/>
                        <path d="M-2-2 2 2" stroke="#8f744b" stroke-width="1"/>
                      </g>
                      <path d="M-6 5-4-4H4L6 5Z" fill="#b99462" stroke="#9c794b" stroke-width="0.8"/>
                      <path d="M-66 1.4H66" fill="none" stroke="#75633e" stroke-width="3.2" opacity="0.2"/>
                      <path d="M-66 0H66" class="string-rest"/>
                      <path :key="`string-${part.id}-${hitFlashes[part.id] || 0}`" data-testid="music-string-vibration" :data-strike="hitFlashes[part.id] || 0" class="string-vibration" :class="{ 'is-struck': !!hitFlashes[part.id] }" d="M-66 0Q-33-7 0 0T66 0"/>
                      <text y="29" dominant-baseline="central" text-anchor="middle" class="string-note">{{ NOTES[part.note]?.label }}</text>
                    </g>
                  </template>
                  <template v-else>
                    <circle r="40" fill="transparent"/>
                    <circle v-if="selectedId === part.id" class="selection-outline" :r="part.type === 'drum' ? 34 : 30"/>
                    <circle v-if="hitFlashes[part.id]" :key="hitFlashes[part.id]" class="impact-ring" :r="part.type === 'drum' ? 29 : 25" pointer-events="none"/>
                    <g v-if="part.type === 'bell'" filter="url(#music-part-shadow)" pointer-events="none">
                      <circle r="22" fill="url(#music-brass)" stroke="#a78240" stroke-width="1.3"/>
                      <circle r="17.5" fill="none" stroke="#f6dfa3" stroke-width="1"/>
                      <circle r="14.5" fill="none" stroke="#ac843f" stroke-width="0.7" opacity="0.65"/>
                      <path d="M-8-17a19 19 0 0 1 16 0" fill="none" stroke="#fff0c7" stroke-width="1.8" stroke-linecap="round"/>
                      <text y="0" dominant-baseline="central" text-anchor="middle" class="bell-note">{{ NOTES[part.note]?.label }}</text>
                      <circle cy="-14" r="1.2" fill="#87632f"/>
                    </g>
                    <g v-else filter="url(#music-part-shadow)" pointer-events="none">
                      <circle r="26" fill="#976b51" stroke="#70513c" stroke-width="1.3"/>
                      <circle r="22" fill="#e1ccb0" stroke="#bd9672" stroke-width="1.3"/>
                      <circle r="17.5" fill="none" stroke="#c7ae8c" stroke-width="0.8"/>
                      <path d="M-4-10h8m-12 20H8" stroke="#b39772" stroke-width="0.8"/>
                      <circle v-for="angle in [0, 60, 120, 180, 240, 300]" :key="angle" cx="0" cy="-24" r="1.5" :transform="`rotate(${angle})`" fill="#e7c995"/>
                      <text y="0" dominant-baseline="central" text-anchor="middle" class="drum-note">{{ NOTES[part.note]?.label }}</text>
                    </g>
                  </template>
                </g>

                <g v-if="placementPoint && activeTool !== 'select'" :transform="`translate(${placementPoint.x} ${placementPoint.y})`" class="placement-preview" pointer-events="none" aria-hidden="true"><rect v-if="activeTool === 'ramp'" x="-58" y="-6" width="116" height="12" rx="5" transform="rotate(20)"/><path v-else-if="['string', 'bowed'].includes(activeTool)" d="M-66 0H66M-66-9V9M66-9V9" stroke-width="3"/><circle v-else :r="activeTool === 'drum' ? 26 : 22"/><path d="M-8 0H8M0-8V8"/></g>
                <g class="marbles" pointer-events="none" aria-hidden="true">
                  <polyline v-for="ball in balls" :key="`trail-${ball.id}`" class="marble-trail" :points="trailPoints(ball)"/>
                  <circle v-for="ball in balls" :key="ball.id" data-testid="music-ball" :cx="ball.x" :cy="ball.y" r="7" fill="url(#music-marble)" stroke="#285b4f" stroke-width="0.8"/>
                </g>
              </svg>
            </div>
          </div>


          </div>
          <div class="board-caption">
            <div v-if="score" class="score-ribbon" data-testid="music-score-state"><span class="score-spark" aria-hidden="true">✦</span><strong>{{ scoreState.section || score.sections[0]?.label || score.name }}</strong><span>第 {{ scoreState.bar }} 小节</span><span class="beat-dots" aria-hidden="true"><i v-for="beat in score.beatsPerBar" :key="beat" :class="{ current: beat - 1 === currentBeat }"></i></span><span class="sr-only">第 {{ currentBeat + 1 }} 拍</span><div class="score-progress" aria-hidden="true"><i :style="{ width: `${scoreProgress}%` }"></i></div></div>
            <div v-else class="free-score" data-testid="music-score-state"><span>自由编排</span><span>每一次碰撞，都是新的音符。</span></div>
            <div class="board-stats"><span>碰撞 <strong data-testid="music-hit-count">{{ hitCount }}</strong></span><span>最近 <strong>{{ lastNote }}</strong></span></div>
          </div>
          <p class="status-message" role="status"><span aria-hidden="true">↳</span>{{ notice }}</p>
        </section>
        <aside class="editor-console" aria-label="快捷调音与设置">
          <section class="quick-panel" :class="{ 'has-selection': !!selectedPart, 'has-notes': selectedPart && selectedPart.type !== 'ramp' }">
            <div class="panel-heading"><h2>随手调一调</h2><span>{{ selectedPart ? typeName(selectedPart.type) : `${parts.length} 枚零件` }}</span></div>
            <label class="sr-only" for="music-selection">选择要调整的零件</label><select id="music-selection" :value="selectedId" data-testid="music-selection" @change="selectPart($event.target.value)"><option value="">点选画板零件，或从这里选取</option><option v-for="(part, index) in parts" :key="part.id" :value="part.id">{{ partName(part, index) }}</option></select>
            <div v-if="selectedPart" class="selected-properties">
              <template v-if="selectedPart.type !== 'ramp'">
                <div class="note-heading"><label for="music-note">{{ selectedPart.type === 'bowed' ? '全音域' : '音符' }} <select id="music-note" data-testid="music-note" :value="selectedPart.note" @change="setNote($event.target.value)"><option v-for="note in pitchOrderedNotes" :key="note.label" :value="note.index">{{ note.label }}</option></select></label><button class="audition-button" data-testid="music-audition" type="button" @click="audition()"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3v10l-4-3H3ZM14 6a6 6 0 0 1 0 8m3-10a9 9 0 0 1 0 12"/></svg>试听</button></div>
                <div class="note-pads" role="group" aria-label="从低音到高音选择音符并试听"><button v-for="note in quickNotes" :key="note.label" :data-testid="`music-note-${note.index}`" type="button" :aria-pressed="selectedPart.note === note.index" :aria-label="`音符 ${note.label}，点击试听`" @click="setNote(note.index)">{{ note.label }}</button></div>
                <p v-if="!['string', 'bowed'].includes(selectedPart.type)" class="property-tip">从低到高排列，点音符即可试听。</p>
              </template>
              <div v-if="selectedPart.type === 'bowed'" class="bowed-settings">
                <label for="music-voice">音色 <select id="music-voice" data-testid="music-voice" :value="selectedPart.voice" @change="setBowSetting('voice', $event.target.value)"><option value="violin">小提琴</option><option value="cello">大提琴</option></select></label>
                <label for="music-hold">延音 <select id="music-hold" data-testid="music-hold" :value="selectedPart.holdBeats" @change="setBowSetting('holdBeats', Number($event.target.value))"><option :value="2">2 拍</option><option :value="4">4 拍</option><option :value="8">8 拍</option></select></label>
              </div>
              <div v-if="['ramp', 'string', 'bowed'].includes(selectedPart.type)" class="angle-panel" :class="{ 'string-angle': ['string', 'bowed'].includes(selectedPart.type) }">
                <div class="angle-heading"><label for="music-angle">{{ selectedPart.type === 'ramp' ? '斜坡角度' : '弦倾角' }} <output>{{ selectedPart.angle }}°</output></label><div><button class="small-button" data-testid="music-angle-less" type="button" :aria-label="`${typeName(selectedPart.type)}减少15度`" @click="rotateSelected(-15)">−15°</button><button class="small-button" data-testid="music-angle-more" type="button" :aria-label="`${typeName(selectedPart.type)}增加15度`" @click="rotateSelected(15)">＋15°</button></div></div>
                <input id="music-angle" data-testid="music-angle" type="range" min="-75" max="75" step="1" :value="selectedPart.angle" @input="updateRange('angle', $event.target.value)" @change="finishRangeEdit" @blur="finishRangeEdit"/>
                <template v-if="selectedPart.type === 'ramp'"><div class="range-labels"><span>左低</span><span>水平</span><span>右低</span></div><p class="property-tip">一点倾斜，让旋律转个弯。</p></template>
              </div>
              <div class="part-actions"><button class="raised-button" data-testid="music-duplicate" type="button" @click="duplicateSelected"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V3H3v10h4"/></svg>复制</button><button class="quiet-button delete-button" data-testid="music-delete" type="button" @click="removeSelected"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M7 5V2h6v3M5 5l1 12h8l1-12M8 8v6m4-6v6"/></svg>删除</button><span class="part-position">{{ Math.round(selectedPart.x) }}, {{ Math.round(selectedPart.y) }}</span></div>
            </div>
            <div v-else class="selection-placeholder"><svg viewBox="0 0 96 66" aria-hidden="true"><path d="m17 48 56-17" stroke="#b29461" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="17" r="9" fill="#89ae9c" stroke="#628f7a"/><circle cx="73" cy="50" r="10" fill="#e0c385" stroke="#b69a62"/><circle cx="73" cy="50" r="6" fill="none" stroke="#b69a62"/><path d="M50 29v6" stroke="#9fae9f" stroke-dasharray="2 2"/></svg><p><strong>点一枚零件，马上调音。</strong>或用上方工具，在画板任意位置<br>放下你的第一枚小零件。</p></div>
          </section>
          <details class="settings-panel" data-testid="music-settings"><summary><span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2v16M10 2v16M16 2v16"/><path d="M2 6h4m2 7h4m2-5h4" stroke-width="3"/></svg>演奏设置</span><small>{{ tempo }} BPM</small><i aria-hidden="true"></i></summary><div class="settings-content"><label class="control-label" for="music-tempo">投球速度 <output>{{ tempo }} <small>BPM</small></output></label><input id="music-tempo" data-testid="music-tempo" type="range" min="30" max="180" step="1" :value="tempo" @input="updateRange('tempo', $event.target.value)" @change="finishRangeEdit" @blur="finishRangeEdit"/><div class="range-labels"><span>从容</span><span>轻快</span></div><label class="control-label emitter-label" for="music-emitter">{{ score ? '单颗试奏落点' : '落球位置' }} <output>{{ Math.round(emitterX) }}</output></label><input id="music-emitter" data-testid="music-emitter" type="range" min="64" max="736" step="1" :value="emitterX" @input="updateRange('emitterX', $event.target.value)" @change="finishRangeEdit" @blur="finishRangeEdit"/><div class="volume-controls"><label class="volume-label" for="music-volume">音量</label><input id="music-volume" v-model.number="volume" data-testid="music-volume" type="range" min="0" max="100" step="1" @input="updateVolume"/><output>{{ muted ? '静音' : `${volume}%` }}</output></div></div></details>
          <div class="layout-actions"><button class="quiet-button" data-testid="music-load" type="button" :disabled="!hasSavedLayout" @click="loadLayout(false)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h6l2-3h6v14H3ZM10 8v6m-3-3 3 3 3-3"/></svg>读回保存</button><button class="quiet-button" data-testid="music-clear" type="button" :disabled="!parts.length && !score" @click="clearBoard"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 3 5 5-9 9H3v-5ZM8 7l5 5M8 17h9"/></svg>清空画板</button></div>
          <div v-if="score" class="score-card"><span>精选编排 <b>✦</b></span><h3>{{ score.name }}</h3><p>{{ currentPreset?.description || '保留原曲的节拍，用你的零件写出另一种热烈。' }}</p><div><span>{{ score.emitters.length }} 个入口</span><i></i><span>{{ score.lengthBeats }} 拍循环</span><i></i><span>真实碰撞发声</span></div></div>
          <p class="storage-note">编排只在点击「保存」时写入此浏览器。</p>
        </aside>
      </div>
      <footer class="workshop-notes"><span><kbd>空格</kbd> 播放 / 暂停　<kbd>方向键</kbd> 移动　<kbd>⌘ / Ctrl Z</kbd> 撤销</span><span>不必懂乐理，只需一点好奇心。</span></footer>
    </div>
  </main>
</template>


<style scoped>
.music-workshop {
  --site-header-height:0px;
  --desk:#e6ebe7;
  --panel:#e5eae4;
  --ink:#2e453b;
  --muted:#6e8174;
  --accent:#4d755d;
  --line:#c6d0c4;
  --soft-shadow:5px 5px 13px #bcc6bd85,-5px -5px 13px #ffffffb0;
  min-height:100vh;
  padding:12px clamp(14px,2.7vw,40px) 22px;
  background:radial-gradient(ellipse at 25% 0%,#f1f3eec0,transparent 70%),var(--desk);
  color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;
  color-scheme:light
}

.workshop-content {
  max-width:1200px;
  margin:0 auto
}

.workshop-heading {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin-bottom:12px
}

.heading-copy {
  display:flex;
  align-items:center;
  gap:15px;
  min-width:0
}

.back-link {
  display:grid;
  place-items:center;
  flex:0 0 32px;
  width:32px;
  height:34px;
  border:1px solid #ffffffb0;
  border-radius:10px;
  color:#637a69;
  background:#e9ede6;
  box-shadow:3px 3px 8px #c4cec480,-3px -3px 8px #ffffffc0
}

.back-link:hover {
  color:#345b42;
  text-decoration:none
}

.back-link svg {
  width:16px;
  height:16px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.5
}

.eyebrow {
  margin:0 0 3px;
  color:#788c78;
  font:8px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:1.7px
}

h1 {
  display:flex;
  align-items:baseline;
  gap:17px;
  margin:0;
  font-size:24px;
  line-height:1.3;
  font-weight:650;
  letter-spacing:1px;
  color:#2d4538
}

h1 span {
  font-size:11px;
  font-weight:400;
  letter-spacing:.4px;
  color:#788875
}

.workshop-stamp {
  display:flex;
  align-items:center;
  gap:7px;
  color:#81917e;
  font-size:10px;
  letter-spacing:.5px;
  white-space:nowrap
}

.workshop-stamp i {
  width:5px;
  height:5px;
  border:1px solid #ba9a67;
  transform:rotate(45deg)
}

button,input,select {
  max-width:100%;
  font:inherit
}

button {
  cursor:pointer;
  transition:background-color 150ms,box-shadow 150ms,border-color 150ms
}

button:disabled {
  opacity:.4;
  cursor:default;
  box-shadow:none
}

button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible,summary:focus-visible {
  outline:2px solid #3e7d5a;
  outline-offset:3px
}

button svg {
  flex:0 0 auto;
  width:17px;
  height:17px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.4;
  stroke-linecap:round;
  stroke-linejoin:round
}

.transport-bar {
  display:flex;
  align-items:center;
  gap:15px;
  min-height:61px;
  margin-bottom:14px;
  padding:8px 10px;
  position:sticky;
  top:calc(var(--site-header-height,72px) + 6px);
  z-index:20;
  border:1px solid #f9fcf5;
  border-radius:15px;
  background:#e6ece3f5;
  box-shadow:5px 5px 15px #bcc7bc80,-4px -4px 11px #ffffffb0
}

.transport-actions {
  display:flex;
  align-items:center;
  gap:8px;
  flex:0 0 auto
}

.play-button,.raised-button,.quiet-button,.save-button,.audition-button {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  min-height:40px;
  padding:0 13px;
  border-radius:10px;
  font-size:11px;
  line-height:1.3;
  white-space:nowrap
}

.play-button {
  min-width:111px;
  border:1px solid #577d60;
  background:linear-gradient(145deg,#6b8c68,#4e7456);
  color:#fcfff6;
  box-shadow:3px 3px 7px #b3bfb0,inset 1px 1px 0 #a9bc99;
  font-weight:600
}

.play-button:hover:not(:disabled) {
  background:#446b4d
}

.play-button svg {
  width:13px;
  height:13px;
  fill:currentColor;
  stroke-width:2
}

.raised-button {
  border:1px solid #f5f8ee;
  color:#47604a;
  background:#e9ede4;
  box-shadow:3px 3px 7px #bac7b688,-3px -3px 7px #ffffffc0
}

.raised-button:hover:not(:disabled) {
  background:#f4f6ee
}

.quiet-button {
  border:1px solid transparent;
  background:transparent;
  color:#6d7f6c
}

.quiet-button:hover:not(:disabled) {
  background:#dbe4d7;
  color:#35553d
}

.scene-picker {
  display:flex;
  align-items:center;
  gap:10px;
  flex:1 1 auto;
  min-width:0;
  padding-left:14px;
  border-left:1px solid #c9d4c5
}

.scene-picker>label {
  color:#7c8c75;
  font-size:9px;
  white-space:nowrap
}

select {
  min-width:0;
  min-height:37px;
  width:100%;
  padding:7px 9px;
  border:1px solid #cbd5c6;
  border-radius:8px;
  color:#3c5540;
  background:#e1e8dc;
  box-shadow:inset 2px 2px 5px #b8c4b56b,inset -2px -2px 5px #ffffffa0;
  font-size:10px;
  cursor:pointer
}

option {
  color:#314a37;
  background:#edf2e7
}

.scene-picker select {
  flex:1 1 auto;
  max-width:260px;
  min-height:37px;
  border-color:#c4cdbb;
  font-size:11px
}

.save-button {
  min-width:105px;
  margin-left:auto;
  border:1px solid #c2cfb9;
  background:#e5ecd9;
  color:#506846;
  box-shadow:inset 1px 1px 0 #f8fbed
}

.save-button:hover {
  background:#d8e4ca
}

.unsaved-dot {
  width:5px;
  height:5px;
  flex:0 0 auto;
  border-radius:50%;
  background:#bd8953
}

.workbench {
  max-width:calc(clamp(440px,calc(133.333svh - 292px),756px) + 298px);
  margin-inline:auto;
  display:grid;
  grid-template-columns:minmax(0,1fr) 278px;
  gap:20px;
  align-items:start
}

.board-panel {
  min-width:0
}

.tool-strip {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px
}

.placement-tools {
  display:flex;
  gap:5px;
  padding:4px;
  border-radius:12px;
  background:#dde5dc;
  border:1px solid #d1dbce;
  box-shadow:inset 3px 3px 7px #b9c6b66b,inset -3px -3px 7px #ffffffa0
}

.placement-tool {
  min-height:37px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  border:1px solid transparent;
  border-radius:8px;
  background:transparent;
  color:#6e8169;
  padding:0 12px;
  font-size:11px
}

.placement-tool svg {
  width:24px;
  height:24px
}

.placement-tool:first-child svg {
  width:17px;
  height:17px
}

.placement-tool[aria-pressed='true'] {
  color:#2d5b3d;
  background:#edf3e6;
  border-color:#83a17a;
  box-shadow:2px 2px 5px #aebea56b,-2px -2px 5px #ffffff
}

.placement-tool:hover:not([aria-pressed='true']) {
  background:#e6edde
}

.history-tools {
  display:flex;
  gap:6px
}

.icon-button {
  display:inline-grid;
  place-items:center;
  min-width:36px;
  min-height:36px;
  padding:6px;
  border:1px solid #edf3e8;
  border-radius:10px;
  color:#60765a;
  background:#e7ede1;
  box-shadow:3px 3px 7px #becbb788,-3px -3px 7px #ffffffb0
}

.icon-button:hover:not(:disabled) {
  background:#f0f4e8
}

.tool-context {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  min-height:24px;
  padding:3px 4px;
  color:#7a8d72;
  font-size:9px
}

.tool-context .placing-hint {
  color:#416c41
}

.play-state {
  display:inline-flex;
  align-items:center;
  gap:5px;
  font-size:9px;
  white-space:nowrap
}

.play-state i {
  width:5px;
  height:5px;
  border-radius:50%;
  background:#b0bba4
}

.play-state.active {
  color:#527c4b
}

.play-state.active i {
  background:#638b50;
  box-shadow:0 0 0 3px #a9c09530
}

.stage-bed {
  width:min(100%,clamp(440px,calc(133.333svh - 292px),756px));
  margin-inline:auto;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:13px;
  border:1px solid #d7dfd0;
  border-radius:19px;
  background:#e0e7dc;
  box-shadow:inset 5px 5px 13px #b7c4b56b,inset -5px -5px 13px #ffffffb8
}

.wood-frame {
  position:relative;
  width:100%;
  padding:11px;
  border:1px solid #f7f7e9;
  border-radius:14px;
  background:linear-gradient(145deg,#e9e8d7,#d3d5bf);
  box-shadow:5px 6px 11px #acbaa56b,-5px -5px 11px #fafdf0c0,inset 1px 1px 0 #ffffff
}

.board-surface {
  touch-action:none;
  overflow:hidden;
  border:1px solid #b9c1aa;
  border-radius:6px;
  background:#f1f1e8;
  box-shadow:inset 2px 3px 6px #98a1895e,0 0 0 1px #faffed
}

.music-board {
  touch-action:none;
  display:block;
  width:100%;
  height:auto;
  aspect-ratio:4/3;
  overflow:hidden;
  user-select:none;
  -webkit-user-select:none;
  outline-offset:4px
}

.music-board.placing,.music-board.placing .music-part {
  cursor:crosshair
}

.frame-screw {
  position:absolute;
  width:4px;
  height:4px;
  border:1px solid #a7af94;
  border-radius:50%;
  background:#e9ebd7;
  box-shadow:inset 1px 1px 0 #ffffff
}

.frame-screw::after {
  content:'';
  position:absolute;
  top:1px;
  left:0;
  right:0;
  height:1px;
  background:#9da68a;
  transform:rotate(-35deg)
}

.frame-screw.tl {
  top:4px;
  left:4px
}

.frame-screw.tr {
  top:4px;
  right:4px
}

.frame-screw.bl {
  bottom:4px;
  left:4px
}

.frame-screw.br {
  bottom:4px;
  right:4px
}

.board-rulers {
  fill:#9c9f87;
  stroke:#b6b8a2;
  stroke-width:.8;
  font:8px ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:1px
}

.board-rulers text {
  stroke:none
}

.board-rulers .board-signature {
  font-size:8.5px;
  letter-spacing:2px;
  fill:#a6a68b
}

.emitter-label-svg {
  fill:#6c8066;
  font:9px ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.5px
}

.music-part {
  cursor:grab;
  touch-action:none;
  outline:none
}

.music-part.dragging {
  cursor:grabbing
}

.music-part:focus-visible .selection-outline {
  stroke-width:3;
  stroke-dasharray:none
}

.selection-outline {
  fill:#3c8b5820;
  stroke:#3b8151;
  stroke-width:2;
  stroke-dasharray:3 3;
  pointer-events:none
}

.impact-ring {
  fill:none;
  stroke:#6d9e5f;
  stroke-width:2;
  transform-origin:0 0;
  animation:music-impact 480ms ease-out both
}

@keyframes music-impact {
  from {
    opacity:.85;
    transform:scale(1)
  }
  to {
    opacity:0;
    transform:scale(1.8)
  }
}

.bell-note,.drum-note {
  fill:#6b4e28;
  font:700 20px ui-monospace,SFMono-Regular,Consolas,monospace
}

.drum-note {
  fill:#7c6048
}

.marble-trail {
  fill:none;
  stroke:#76a28b;
  stroke-width:4;
  stroke-linecap:round;
  stroke-linejoin:round;
  opacity:.19
}

.placement-preview {
  fill:#6d9c6f25;
  stroke:#58845a;
  stroke-width:1.5;
  stroke-dasharray:4 3
}

.empty-board {
  fill:#92977e;
  font-size:17px;
  letter-spacing:1px
}

.empty-board .empty-hint {
  fill:#a0a48e;
  font-size:12px;
  letter-spacing:.5px
}

.board-caption {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  min-height:36px;
  padding:0 5px
}

.score-ribbon,.free-score {
  display:flex;
  align-items:center;
  gap:9px;
  min-width:0;
  color:#7d8d73;
  font-size:9px
}

.score-ribbon strong {
  color:#946b3e;
  font-size:10px;
  font-weight:600;
  white-space:nowrap
}

.score-spark {
  color:#bb9358;
  font-size:12px
}

.beat-dots {
  display:flex;
  gap:4px
}

.beat-dots i {
  width:4px;
  height:4px;
  border-radius:50%;
  background:#c9d2bf
}

.beat-dots i.current {
  background:#b18d52
}

.score-progress {
  width:58px;
  height:3px;
  border-radius:3px;
  overflow:hidden;
  background:#d1d9c7
}

.score-progress i {
  display:block;
  height:100%;
  background:#bd9b67
}

.board-stats {
  display:flex;
  align-items:center;
  gap:14px;
  flex-shrink:0;
  color:#7a8b70;
  font-size:9px
}

.board-stats strong {
  margin-left:4px;
  color:#536c48;
  font:10px ui-monospace,SFMono-Regular,Consolas,monospace
}

.status-message {
  display:flex;
  align-items:baseline;
  gap:7px;
  margin:0 4px;
  min-height:25px;
  font-size:10px;
  line-height:1.8;
  color:#6b8262
}

.status-message>span {
  color:#b39b65;
  font-size:15px
}

.editor-console {
  min-width:0
}

.quick-panel {
  padding:17px;
  border:1px solid #f8fbf1;
  border-radius:17px;
  background:#e8eee2;
  box-shadow:var(--soft-shadow)
}

.panel-heading {
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:8px;
  margin-bottom:12px
}

.panel-heading h2 {
  margin:0;
  color:#415e3d;
  font-size:13px;
  font-weight:600;
  letter-spacing:.5px
}

.panel-heading>span {
  color:#839577;
  font-size:9px
}

.selected-properties {
  margin-top:13px
}

.note-heading {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  margin-bottom:13px
}

.note-heading label {
  display:flex;
  align-items:center;
  gap:7px;
  font-size:10px;
  color:#6c8061
}

.note-heading select {
  width:64px;
  min-height:32px;
  padding:5px 7px;
  font:11px ui-monospace,SFMono-Regular,Consolas,monospace
}

.audition-button {
  min-height:34px;
  border:1px solid #b3c5a4;
  border-radius:8px;
  background:#dbe8cf;
  padding:0 10px;
  color:#507145;
  font-size:10px
}

.audition-button:hover {
  background:#cedfbf
}

.audition-button svg {
  width:14px;
  height:14px
}

.note-pads {
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:8px
}

.note-pads button {
  min-height:36px;
  padding:5px;
  border:1px solid #f8faee;
  border-radius:8px;
  color:#7b845e;
  background:#ecefdf;
  box-shadow:3px 3px 7px #bfccb38c,-3px -3px 7px #ffffffb0;
  font:11px ui-monospace,SFMono-Regular,Consolas,monospace
}

.note-pads button:hover {
  background:#f5f7e9
}

.note-pads button[aria-pressed='true'] {
  color:#4c733b;
  border-color:#8dab72;
  background:#d9e8c7;
  box-shadow:inset 2px 2px 5px #a9be965e,inset -2px -2px 5px #fbffe9;
  font-weight:700
}

.property-tip {
  margin:11px 0 0;
  color:#849573;
  font-size:9px;
  line-height:1.6
}

.angle-heading {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  margin-bottom:9px
}

.angle-heading>label {
  color:#738467;
  font-size:10px
}

.angle-heading output {
  display:block;
  margin-top:5px;
  color:#5b7748;
  font:17px ui-monospace,SFMono-Regular,Consolas,monospace
}

.angle-heading>div {
  display:flex;
  gap:6px
}

.small-button {
  min-height:36px;
  min-width:47px;
  padding:5px;
  border:1px solid #e8f0dc;
  border-radius:8px;
  background:#e3ecd8;
  color:#627c4f;
  box-shadow:3px 3px 7px #bfcdb28c,-3px -3px 7px #ffffffb0;
  font-size:10px
}

.part-actions {
  display:flex;
  align-items:center;
  gap:5px;
  border-top:1px solid #ced9c3;
  margin-top:13px;
  padding-top:11px
}

.part-actions .raised-button,.part-actions .quiet-button {
  min-height:33px;
  padding:0 9px;
  font-size:10px
}

.part-actions svg {
  width:13px;
  height:13px
}

.delete-button {
  color:#9b7961
}

.part-position {
  margin-left:auto;
  color:#93a080;
  font:8px ui-monospace,SFMono-Regular,Consolas,monospace
}

.selection-placeholder {
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:17px 0 9px;
  text-align:center
}

.selection-placeholder svg {
  width:86px;
  height:59px;
  margin-bottom:7px
}

.selection-placeholder p {
  margin:0;
  color:#8a9a7b;
  font-size:10px;
  line-height:1.8
}

.selection-placeholder strong {
  display:block;
  color:#67805a;
  font-weight:500;
  margin-bottom:5px
}

.settings-panel {
  margin-top:14px;
  border:1px solid #eef4e7;
  border-radius:12px;
  background:#e2eadb;
  box-shadow:3px 3px 9px #bdcbb58c,-3px -3px 9px #ffffffa0
}

.settings-panel summary {
  display:flex;
  align-items:center;
  gap:9px;
  list-style:none;
  min-height:45px;
  padding:9px 14px;
  cursor:pointer
}

.settings-panel summary::-webkit-details-marker {
  display:none
}

.settings-panel summary>span {
  display:flex;
  align-items:center;
  gap:8px;
  color:#677f57;
  font-size:11px
}

.settings-panel summary svg {
  width:14px;
  height:14px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.1;
  stroke-linecap:round
}

.settings-panel summary small {
  margin-left:auto;
  color:#8e9f7b;
  font:9px ui-monospace,SFMono-Regular,Consolas,monospace
}

.settings-panel summary>i {
  width:5px;
  height:5px;
  margin-left:2px;
  border-bottom:1px solid #81966b;
  border-right:1px solid #81966b;
  transform:rotate(45deg)
}

.settings-panel[open] summary>i {
  transform:rotate(225deg)
}

.settings-content {
  padding:5px 17px 14px
}

.control-label {
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-bottom:6px;
  color:#6c805c;
  font-size:10px
}

.control-label output {
  color:#5b784a;
  font:12px ui-monospace,SFMono-Regular,Consolas,monospace
}

.control-label output small {
  font-size:8px
}

input[type='range'] {
  appearance:none;
  -webkit-appearance:none;
  width:100%;
  height:22px;
  margin:0;
  background:transparent;
  cursor:pointer;
  accent-color:#80a264
}

input[type='range']::-webkit-slider-runnable-track {
  height:4px;
  border:1px solid #c1d0b1;
  border-radius:4px;
  background:#cbd9bb;
  box-shadow:inset 1px 1px 2px #a8bc95,0 1px 0 #f8ffec
}

input[type='range']::-moz-range-track {
  height:4px;
  border-radius:4px;
  background:#cbd9bb
}

input[type='range']::-webkit-slider-thumb {
  appearance:none;
  -webkit-appearance:none;
  width:15px;
  height:15px;
  margin-top:-7px;
  border:1px solid #94ad7a;
  border-radius:50%;
  background:linear-gradient(145deg,#f3f8e4,#bbce9e);
  box-shadow:2px 2px 4px #9bb1847a,-2px -2px 4px #fff
}

input[type='range']::-moz-range-thumb {
  width:14px;
  height:14px;
  border:1px solid #94ad7a;
  border-radius:50%;
  background:#d2e0b6
}

.range-labels {
  display:flex;
  justify-content:space-between;
  color:#93a47f;
  font-size:8px
}

.emitter-label {
  margin-top:15px
}

.volume-controls {
  display:flex;
  align-items:center;
  gap:9px;
  margin-top:12px
}

.volume-controls input {
  min-width:0
}

.volume-controls output {
  min-width:31px;
  text-align:right;
  color:#7d9563;
  font:9px ui-monospace,SFMono-Regular,Consolas,monospace
}

.mute-button {
  min-width:33px;
  min-height:33px
}

.mute-button[aria-pressed='true'] {
  color:#ae9773;
  background:#e5e5d1
}

.layout-actions {
  display:flex;
  justify-content:space-between;
  gap:5px;
  margin-top:12px
}

.layout-actions .quiet-button {
  flex:1;
  min-height:35px;
  padding:0 5px;
  font-size:10px;
  color:#7a8f67
}

.layout-actions svg {
  width:14px;
  height:14px
}

.score-card {
  margin-top:13px;
  padding:14px 15px;
  border:1px solid #e8dec1;
  border-radius:12px;
  background:linear-gradient(135deg,#f3ebd6,#e9e6cc);
  box-shadow:inset 1px 1px 0 #ffffed
}

.score-card>span {
  display:flex;
  justify-content:space-between;
  color:#aa9269;
  font-size:8px;
  letter-spacing:1px
}

.score-card b {
  color:#c49c5e;
  font-weight:400
}

.score-card h3 {
  margin:5px 0 6px;
  color:#8b734d;
  font-size:14px;
  font-weight:600;
  letter-spacing:1px
}

.score-card p {
  margin:0;
  color:#9b8b68;
  font-size:9px;
  line-height:1.7
}

.score-card>div {
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;
  margin-top:9px;
  color:#a3926b;
  font-size:8px
}

.score-card i {
  width:2px;
  height:2px;
  border-radius:50%;
  background:#c5b68e
}

.storage-note {
  margin:12px 3px 0;
  color:#95a480;
  font-size:8px;
  line-height:1.7
}

.workshop-notes {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  margin-top:15px;
  padding-top:12px;
  border-top:1px solid #ced8c4;
  color:#8b9d78;
  font-size:9px
}

kbd {
  font:inherit;
  color:#6e865a
}

.sr-only {
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
  border:0
}

@media(min-width:1500px) {
  .music-workshop {
    padding-top:18px
  }
  .workshop-heading {
    margin-bottom:17px
  }
  .workbench {
    gap:27px
  }
}

@media(max-width:1100px) {
  .workbench {
    grid-template-columns:minmax(0,1fr) 254px;
    gap:16px
  }
  .scene-picker>label {
    display:none
  }
  .workshop-stamp {
    display:none
  }
  .transport-bar {
    gap:10px
  }
  .quick-panel {
    padding:14px
  }
  .placement-tool {
    padding-inline:9px
  }
  .score-progress {
    display:none
  }
  .board-stats {
    gap:9px
  }
}

@media(max-width:850px) {
  .music-workshop {
    padding:15px 18px 22px
  }
  h1 span {
    display:none
  }
  .workbench {
    grid-template-columns:minmax(0,1fr);
    gap:13px
  }
  .wood-frame {
    width:min(100%,680px)
  }
  .editor-console {
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,.85fr);
    align-items:start;
    gap:12px 16px
  }
  .quick-panel {
    grid-row:1/5
  }
  .settings-panel,.layout-actions,.score-card,.storage-note {
    margin-top:0
  }
  .placement-tool {
    min-height:40px;
    padding-inline:14px
  }
  .tool-context {
    min-height:29px
  }
  .transport-bar {
    top:calc(var(--site-header-height,72px) + 3px)
  }
  .reset-button {
    padding-inline:8px
  }
  .scene-picker {
    padding-left:9px
  }
  .save-button {
    min-width:92px;
    padding-inline:9px
  }
  .stage-bed {
    padding:12px
  }
  .board-caption {
    min-height:40px
  }
}

@media(max-width:600px) {
  .music-workshop {
    padding:12px 12px 21px
  }
  .workshop-heading {
    margin-bottom:12px
  }
  .heading-copy {
    gap:11px
  }
  .back-link {
    width:31px;
    flex-basis:31px;
    height:33px
  }
  .eyebrow {
    font-size:7px;
    letter-spacing:1.5px;
    margin-bottom:3px
  }
  h1 {
    font-size:23px
  }
  .transport-bar {
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    gap:8px;
    padding:8px;
    margin-bottom:12px;
    border-radius:13px
  }
  .transport-actions {
    grid-column:1/-1;
    justify-content:space-between;
    gap:7px
  }
  .play-button {
    flex:1.2;
    min-width:0;
    min-height:44px;
    font-size:12px
  }
  .drop-button {
    flex:1;
    min-height:44px;
    font-size:12px;
    padding-inline:11px
  }
  .reset-button {
    flex:0 1 auto;
    min-height:44px;
    padding-inline:8px;
    font-size:10px
  }
  .scene-picker {
    padding-left:0;
    border-left:none
  }
  .scene-picker select {
    width:100%;
    max-width:none;
    min-height:41px
  }
  .save-button {
    min-height:41px;
    min-width:101px;
    font-size:10px
  }
  .workbench {
    gap:10px
  }
  .tool-strip {
    gap:8px
  }
  .placement-tools {
    flex:1;
    padding:3px;
    gap:2px
  }
  .placement-tool {
    flex:1;
    flex-direction:column;
    gap:0;
    min-width:0;
    min-height:48px;
    padding:2px 5px;
    font-size:9px
  }
  .placement-tool svg {
    width:22px;
    height:23px
  }
  .placement-tool:first-child svg {
    height:20px;
    margin-bottom:3px
  }
  .history-tools {
    gap:5px
  }
  .history-tools .icon-button {
    min-width:38px;
    min-height:44px;
    padding:6px
  }
  .tool-context {
    min-height:27px;
    font-size:8px;
    padding-inline:2px
  }
  .play-state {
    font-size:8px
  }
  .stage-bed {
    padding:7px;
    border-radius:14px
  }
  .wood-frame {
    width:100%;
    padding:7px;
    border-radius:10px
  }
  .frame-screw.tl {
    top:2px;
    left:2px
  }
  .frame-screw.tr {
    top:2px;
    right:2px
  }
  .frame-screw.bl {
    bottom:2px;
    left:2px
  }
  .frame-screw.br {
    bottom:2px;
    right:2px
  }
  .board-caption {
    padding:0 2px;
    gap:7px;
    min-height:36px
  }
  .score-ribbon {
    gap:6px;
    font-size:8px
  }
  .score-ribbon strong {
    font-size:9px
  }
  .beat-dots {
    gap:3px
  }
  .beat-dots i {
    width:3px;
    height:3px
  }
  .board-stats {
    gap:9px;
    font-size:8px
  }
  .board-stats strong {
    font-size:8px;
    margin-left:3px
  }
  .board-stats>span:last-child {
    display:none
  }
  .free-score {
    gap:7px;
    font-size:8px
  }
  .status-message {
    font-size:9px;
    min-height:28px;
    margin-inline:2px
  }
  .editor-console {
    display:block
  }
  .quick-panel {
    padding:13px 14px;
    border-radius:14px
  }
  .panel-heading {
    margin-bottom:9px
  }
  .panel-heading h2 {
    font-size:12px
  }
  .panel-heading>span {
    font-size:10px
  }
  #music-selection {
    min-height:42px;
    font-size:11px
  }
  .selected-properties {
    margin-top:10px
  }
  .note-heading {
    margin-bottom:10px
  }
  .note-heading select {
    min-height:38px;
    width:73px;
    font-size:12px
  }
  .note-heading label {
    font-size:11px
  }
  .audition-button {
    min-height:42px;
    min-width:86px;
    font-size:11px
  }
  .note-pads {
    grid-template-columns:repeat(5,minmax(0,1fr));
    gap:6px
  }
  .note-pads button {
    min-height:44px;
    font-size:12px;
    padding:3px;
    border-radius:8px
  }
  .property-tip {
    font-size:9px;
    margin-top:9px
  }
  .part-actions {
    margin-top:10px;
    padding-top:8px
  }
  .part-actions .raised-button,.part-actions .quiet-button {
    min-height:42px;
    min-width:79px;
    font-size:11px
  }
  .part-position {
    font-size:9px
  }
  .angle-heading>label {
    font-size:11px
  }
  .angle-heading output {
    display:inline;
    margin-left:7px;
    font-size:18px
  }
  .small-button {
    min-height:44px;
    min-width:59px;
    font-size:11px
  }
  .selection-placeholder {
    flex-direction:row;
    gap:14px;
    justify-content:center;
    text-align:left;
    padding:14px 0 2px
  }
  .selection-placeholder svg {
    flex:0 0 76px;
    width:76px;
    height:53px;
    margin:0
  }
  .selection-placeholder p {
    font-size:10px
  }
  .selection-placeholder p br {
    display:none
  }
  .selection-placeholder strong {
    margin-bottom:3px
  }
  .settings-panel {
    margin-top:13px
  }
  .settings-panel summary {
    min-height:48px
  }
  .settings-content {
    padding:6px 17px 14px
  }
  .settings-content .control-label {
    font-size:11px
  }
  .volume-controls {
    gap:13px
  }
  .mute-button {
    min-height:44px;
    min-width:44px
  }
  .layout-actions {
    margin-top:9px
  }
  .layout-actions .quiet-button {
    min-height:44px;
    font-size:11px
  }
  .score-card {
    margin-top:9px;
    padding:12px 14px
  }
  .score-card h3 {
    font-size:13px
  }
  .score-card p {
    font-size:10px
  }
  .score-card>div {
    font-size:9px
  }
  .storage-note {
    margin:10px 3px 0;
    font-size:9px
  }
  .workshop-notes {
    margin-top:17px;
    padding-top:12px;
    font-size:8px;
    flex-wrap:wrap;
    gap:7px
  }
}

@media(max-width:350px) {
  .placement-tool {
    padding-inline:3px
  }
  .placement-tool svg {
    width:20px
  }
  .history-tools .icon-button {
    min-width:33px
  }
  .reset-button span {
    font-size:9px
  }
  .play-button,.drop-button {
    padding-inline:9px
  }
}


/* Keep the useful controls visible while giving the canvas more room. */
.transport-mute { min-width:40px; min-height:40px; flex:0 0 40px; }
.volume-label { color:#6c805c; font-size:10px; flex:0 0 auto; }
@media (min-width:851px) {
  .music-workshop { padding-top:8px; }
  .workshop-heading { margin-bottom:9px; }
  .eyebrow { display:none; }
  .transport-bar { min-height:54px; padding-block:6px; margin-bottom:10px; }
  .placement-tools { padding:3px; }
  .placement-tool { min-height:34px; }
  .tool-context { min-height:20px; padding-block:1px; }
  .stage-bed { padding:8px; }
  .wood-frame { padding:8px; }
}
@media (max-width:850px) {
  .workbench { max-width:none; }
  .stage-bed { width:min(100%,706px); }
}
@media (max-width:600px) {
  .stage-bed { width:100%; }
  .bell-note,.drum-note { font-size:24px; }
  .emitter-label-svg { font-size:20px; }
  .transport-mute { min-width:44px; min-height:44px; flex-basis:44px; }
  .transport-actions .reset-button { min-width:44px; flex:0 0 44px; padding:0; }
  .reset-button span { display:none; }
}

@media(prefers-reduced-motion:reduce) {
  .music-workshop *,.music-workshop *::before,.music-workshop *::after {
    transition:none!important
  }
  .impact-ring {
    animation:none;
    opacity:0
  }
  .marble-trail {
    display:none
  }
}


/* A taut 132-unit string shares the physics segment and keeps both ends fixed. */
.string-rest { fill:none; stroke:#a77c38; stroke-width:2.3; stroke-linecap:round; }
.string-vibration { fill:none; stroke:#d19d44; stroke-width:2.3; stroke-linecap:round; opacity:0; transform-origin:0 0; vector-effect:non-scaling-stroke; }
.string-vibration.is-struck { animation:string-pluck 480ms ease-out both; }
@keyframes string-pluck {
  0% { opacity:1; transform:scaleY(1); }
  14% { transform:scaleY(-0.84); }
  29% { transform:scaleY(0.66); }
  44% { transform:scaleY(-0.47); }
  59% { opacity:0.8; transform:scaleY(0.3); }
  74% { transform:scaleY(-0.17); }
  87% { transform:scaleY(0.07); }
  100% { opacity:0; transform:scaleY(0); }
}
.string-note { fill:#6b7655; font:600 20px ui-monospace,SFMono-Regular,Consolas,monospace; }
.placement-tool { padding-inline:8px; min-width:44px; }
.string-angle { display:grid; grid-template-columns:auto minmax(30px,1fr) auto; align-items:center; gap:6px; margin-top:10px; padding-top:10px; border-top:1px solid #ced9c3; }
.string-angle .angle-heading { display:contents; }
.string-angle .angle-heading > label { grid-column:1; grid-row:1; font-size:9px; white-space:nowrap; }
.string-angle .angle-heading output { display:block; margin:3px 0 0; font-size:12px; }
.string-angle .angle-heading > div { grid-column:3; grid-row:1; gap:4px; }
.string-angle input { grid-column:2; grid-row:1; min-width:0; }
.string-angle .small-button { min-width:38px; padding-inline:3px; }
@media (max-width:600px) {
  .placement-tool { padding-inline:3px; }
  .note-pads { gap:5px; }
  .string-note { font-size:24px; }
  .string-angle { margin-top:8px; padding-top:8px; }
  .string-angle .angle-heading > label { font-size:10px; }
  .string-angle .angle-heading output { font-size:13px; }
  .string-angle .small-button { min-width:44px; min-height:44px; font-size:10px; }
}
@media (max-width:350px) {
  .tool-strip { flex-wrap:wrap; }
  .placement-tools { flex:1 1 100%; }
  .history-tools { margin-left:auto; }
}
@media (prefers-reduced-motion:reduce) {
  .string-vibration.is-struck { animation:none; opacity:0; }
}


/* On phones, selection and audition share one row instead of repeating a heading. */
@media (max-width:600px) {
  .quick-panel.has-selection {
    display:grid;
    grid-template-columns:minmax(0,1fr) auto;
    gap:8px;
    align-items:center;
  }
  .quick-panel.has-selection .panel-heading { display:none; }
  .quick-panel.has-selection #music-selection {
    grid-column:1;
    grid-row:1;
    min-height:44px;
    min-width:0;
  }
  .quick-panel.has-selection:not(.has-notes) #music-selection { grid-column:1 / -1; }
  .quick-panel.has-selection .selected-properties { display:contents; margin:0; }
  .quick-panel.has-selection .note-heading {
    grid-column:2;
    grid-row:1;
    gap:6px;
    min-width:0;
    margin:0;
  }
  .quick-panel.has-selection .note-heading label { gap:4px; font-size:10px; }
  .quick-panel.has-selection .note-heading select { width:56px; min-height:44px; padding-inline:5px; }
  .quick-panel.has-selection .audition-button { min-width:48px; min-height:44px; padding-inline:8px; font-size:10px; }
  .quick-panel.has-selection .audition-button svg { display:none; }
  .quick-panel.has-selection .note-pads,
  .quick-panel.has-selection .angle-panel,
  .quick-panel.has-selection .part-actions { grid-column:1 / -1; }
  .quick-panel.has-selection .property-tip { display:none; }
  .quick-panel.has-selection .string-angle { margin-top:0; }
  .quick-panel.has-selection .part-actions { margin-top:0; }
  .quick-panel.has-selection .part-actions button { min-height:44px; }
}


/* Bow movement lasts for the same renewable gate as the sustained voice. */
.bowed-rest { fill:none; stroke:#8f8c4f; stroke-width:2.6; stroke-linecap:round; }
.bowed-glow { fill:none; stroke:#c6ad55; stroke-width:8; stroke-linecap:round; opacity:0; transition:opacity 180ms ease; }
.bowed-activity.is-active .bowed-glow { opacity:0.38; }
.bowed-activity.is-active .bowed-bow { animation:bow-stroke var(--bow-period,1.2s) ease-in-out infinite; }
@keyframes bow-stroke { 0%,100% { transform:translateX(-23px); } 50% { transform:translateX(23px); } }
.bowed-note { fill:#586c49; font:600 20px ui-monospace,SFMono-Regular,Consolas,monospace; }
.bowed-settings { display:flex; align-items:center; gap:10px; margin-top:10px; }
.bowed-settings label { display:flex; align-items:center; gap:6px; min-width:0; color:#6c805c; font-size:10px; }
.bowed-settings label:first-child { flex:1.3; }
.bowed-settings label:last-child { flex:1; }
.bowed-settings select { flex:1; min-width:0; min-height:44px; padding-inline:7px; font-size:11px; }
.tool-strip { flex-wrap:wrap; }
@media (max-width:600px) {
  .placement-tools { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); flex:1 1 100%; }
  .history-tools { margin-left:auto; }
  .bowed-note { font-size:24px; }
  .quick-panel.has-selection .bowed-settings { grid-column:1 / -1; margin-top:0; gap:12px; }
  .bowed-settings label { font-size:11px; }
}
@media (prefers-reduced-motion:reduce) {
  .bowed-activity.is-active .bowed-bow { animation:none; transform:none; }
}

</style>
