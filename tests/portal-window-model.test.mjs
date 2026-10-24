import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createWorkspace, reduceWorkspace, fitRect, moveRect, resizeRect, canTileWorkspace,
  serializeWorkspace, restoreWorkspace,
} from '../src/portal/windowModel.mjs'

const apps = [
  { id: 'todo', defaultSize: { width: 600, height: 480 }, minSize: { width: 340, height: 260 } },
  { id: 'music', defaultSize: { width: 700, height: 420 }, minSize: { width: 420, height: 280 } },
  { id: 'calendar', defaultSize: { width: 490, height: 488 }, minSize: { width: 320, height: 300 } },
  { id: 'weather', defaultSize: { width: 520, height: 384 }, minSize: { width: 320, height: 240 } },
]
const area = { x: 20, y: 60, width: 1400, height: 900 }
const act = (state, type, id, extra = {}) => reduceWorkspace(state, { type, id, ...extra }, apps, area)
const openAll = () => apps.reduce((state, app) => act(state, 'open', app.id), createWorkspace(apps, area))
const contains = (outer, rect) => {
  assert.ok(rect.x >= outer.x && rect.y >= outer.y)
  assert.ok(rect.x + rect.width <= outer.x + outer.width + 1e-8)
  assert.ok(rect.y + rect.height <= outer.y + outer.height + 1e-8)
}
const freeze = value => {
  Object.freeze(value)
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child)
  return value
}

test('initial windows are closed, deterministic, within the desktop and use independent records', () => {
  const first = createWorkspace(apps, area)
  assert.deepEqual(first, createWorkspace(apps, area))
  assert.deepEqual(first.order, [])
  assert.equal(first.focusedId, null)
  for (const app of apps) {
    assert.equal(first.windows[app.id].open, false)
    assert.equal(first.windows[app.id].minimized, false)
    assert.equal(first.windows[app.id].maximized, false)
    contains(area, first.windows[app.id].rect)
  }
  first.windows.todo.rect.x = -100
  assert.notEqual(first.windows.music.rect.x, -100)
})

test('all four apps coexist; reopening an app restores one instance and raises it', () => {
  let state = openAll()
  assert.deepEqual(state.order, apps.map(app => app.id))
  assert.equal(state.focusedId, 'weather')
  state = act(state, 'minimize', 'music')
  state = act(state, 'open', 'music')
  state = act(state, 'open', 'music')
  assert.deepEqual(state.order, ['todo', 'calendar', 'weather', 'music'])
  assert.equal(state.focusedId, 'music')
  assert.equal(state.windows.music.minimized, false)
  assert.equal(Object.values(state.windows).filter(window => window.open).length, 4)
})

test('focus follows the most recent visible window and ignores hidden windows', () => {
  let state = act(openAll(), 'focus', 'todo')
  state = act(state, 'minimize', 'todo')
  assert.equal(state.focusedId, 'weather')
  assert.equal(state.order.at(-1), 'todo')
  const ignored = act(state, 'focus', 'todo')
  assert.deepEqual(ignored, state)
  state = act(state, 'minimize', 'weather')
  assert.equal(state.focusedId, 'calendar')
  state = act(state, 'close', 'calendar')
  assert.equal(state.focusedId, 'music')
  state = act(state, 'minimize', 'music')
  assert.equal(state.focusedId, null)
  state = act(state, 'restore', 'todo')
  assert.equal(state.focusedId, 'todo')
  assert.equal(state.windows.weather.minimized, true)
})

test('maximize preserves normal geometry and minimize/restore retains maximization', () => {
  const original = openAll()
  const rect = original.windows.music.rect
  let state = act(original, 'toggleMaximize', 'music')
  assert.equal(state.windows.music.maximized, true)
  assert.deepEqual(state.windows.music.rect, rect)
  state = act(state, 'minimize', 'music')
  state = act(state, 'restore', 'music')
  assert.equal(state.windows.music.maximized, true)
  state = act(state, 'toggleMaximize', 'music')
  assert.equal(state.windows.music.maximized, false)
  assert.deepEqual(state.windows.music.rect, rect)
})

test('closing keeps its normal layout, clears display flags and leaves other apps untouched', () => {
  let state = act(openAll(), 'setRect', 'music', { rect: { x: 70, y: 90, width: 750, height: 450 } })
  state = act(state, 'toggleMaximize', 'music')
  state = act(state, 'minimize', 'music')
  const before = state
  state = act(state, 'close', 'music')
  assert.deepEqual(state.windows.music, {
    open: false, minimized: false, maximized: false, rect: before.windows.music.rect,
  })
  for (const id of ['todo', 'calendar', 'weather']) assert.deepEqual(state.windows[id], before.windows[id])
  assert.ok(!state.order.includes('music'))
  const reopened = act(state, 'open', 'music')
  assert.deepEqual(reopened.windows.music.rect, before.windows.music.rect)
})

test('reducers accept frozen inputs without changing past states', () => {
  const initial = freeze(openAll())
  const snapshot = JSON.stringify(initial)
  for (const type of ['open', 'focus', 'minimize', 'restore', 'close', 'toggleMaximize', 'setRect', 'fit', 'tile', 'resetLayout']) {
    const next = act(initial, type, 'todo', { rect: { x: 40, y: 80, width: 400, height: 300 } })
    assert.notEqual(next, initial)
  }
  assert.equal(JSON.stringify(initial), snapshot)
})

test('fit clamps oversize and offscreen geometry, and tiny areas override app minima', () => {
  assert.deepEqual(fitRect({ x: -99, y: 9999, width: 5000, height: 40 }, area, apps[0].minSize),
    { x: 20, y: 700, width: 1400, height: 260 })
  const tiny = { x: 3, y: 7, width: 200, height: 100 }
  assert.deepEqual(fitRect({ x: 50, y: 40, width: 600, height: 480 }, tiny, apps[0].minSize), tiny)
})

test('movement follows pointer displacement until the desktop edge without recentering', () => {
  const rect = { x: 120, y: 150, width: 600, height: 480 }
  assert.deepEqual(moveRect(rect, { x: 37, y: -21 }, area, apps[0].minSize),
    { ...rect, x: 157, y: 129 })
  assert.deepEqual(moveRect(rect, { x: -900, y: 9000 }, area, apps[0].minSize),
    { ...rect, x: 20, y: 480 })
})

for (const edge of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
  test(edge + ' resize follows its selected edges and anchors the opposite edges', () => {
    const rect = { x: 220, y: 260, width: 600, height: 480 }
    const result = resizeRect(rect, edge, { x: 30, y: 40 }, area, apps[0].minSize)
    assert.equal(result.x, edge.includes('w') ? 250 : 220)
    assert.equal(result.y, edge.includes('n') ? 300 : 260)
    assert.equal(result.x + result.width, edge.includes('e') ? 850 : 820)
    assert.equal(result.y + result.height, edge.includes('s') ? 780 : 740)
  })
  test(edge + ' resize respects minimum dimensions and stops at desktop boundaries', () => {
    const rect = { x: 220, y: 260, width: 600, height: 480 }
    const min = apps[0].minSize
    const shrinking = { x: edge.includes('w') ? 9000 : -9000, y: edge.includes('n') ? 9000 : -9000 }
    const shrunk = resizeRect(rect, edge, shrinking, area, min)
    assert.equal(shrunk.width, /[ew]/.test(edge) ? min.width : rect.width)
    assert.equal(shrunk.height, /[ns]/.test(edge) ? min.height : rect.height)
    const grown = resizeRect(rect, edge, { x: -shrinking.x, y: -shrinking.y }, area, min)
    contains(area, grown)
    if (edge.includes('w')) { assert.equal(grown.x, area.x); assert.equal(grown.x + grown.width, 820) }
    if (edge.includes('e')) { assert.equal(grown.x, 220); assert.equal(grown.x + grown.width, 1420) }
    if (edge.includes('n')) { assert.equal(grown.y, area.y); assert.equal(grown.y + grown.height, 740) }
    if (edge.includes('s')) { assert.equal(grown.y, 260); assert.equal(grown.y + grown.height, 960) }
  })
}

test('viewport fitting brings visible, minimized and closed normal rectangles into the new desktop', () => {
  const original = act(act(openAll(), 'minimize', 'todo'), 'close', 'weather')
  const smaller = { x: 0, y: 30, width: 500, height: 360 }
  const fitted = reduceWorkspace(original, { type: 'fit' }, apps, smaller)
  for (const window of Object.values(fitted.windows)) contains(smaller, window.rect)
  assert.equal(fitted.windows.todo.minimized, true)
  assert.equal(fitted.windows.weather.open, false)
  assert.deepEqual(fitted.order, original.order)
})

function assertNoOverlap(rects) {
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i]
    const b = rects[j]
    assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y)
  }
}

test('tile fits all four windows without overlap and meets minima when space permits', () => {
  const state = act(act(openAll(), 'toggleMaximize', 'music'), 'tile')
  const rects = apps.map(app => state.windows[app.id].rect)
  assertNoOverlap(rects)
  for (const app of apps) {
    const window = state.windows[app.id]
    contains(area, window.rect)
    assert.ok(window.rect.width >= app.minSize.width && window.rect.height >= app.minSize.height)
    assert.equal(window.maximized, false)
  }
  assert.equal(state.focusedId, 'music')
})

test('tile leaves minimized windows alone while arranging the remaining visible windows', () => {
  const original = act(openAll(), 'minimize', 'todo')
  const state = act(original, 'tile')
  assert.deepEqual(state.windows.todo, original.windows.todo)
  const rects = ['music', 'calendar', 'weather'].map(id => state.windows[id].rect)
  rects.forEach(rect => contains(area, rect))
  assertNoOverlap(rects)
})

test('a tight desktop uses unequal grid tracks and tiled geometry survives refresh and zero movement', () => {
  const tight = { x: 20, y: 60, width: 800, height: 600 }
  const opened = apps.reduce((state, app) => reduceWorkspace(state, { type: 'open', id: app.id }, apps, tight), createWorkspace(apps, tight))
  assert.equal(canTileWorkspace(opened, apps, tight), true)
  const tiled = reduceWorkspace(opened, { type: 'tile' }, apps, tight)
  const restored = restoreWorkspace(serializeWorkspace(tiled), apps, tight)
  assert.deepEqual(restored, tiled)
  assertNoOverlap(apps.map(app => restored.windows[app.id].rect))
  for (const app of apps) {
    const rect = tiled.windows[app.id].rect
    contains(tight, rect)
    assert.ok(rect.width >= app.minSize.width && rect.height >= app.minSize.height)
    assert.deepEqual(moveRect(rect, { x: 0, y: 0 }, tight, app.minSize), rect)
    assert.deepEqual(fitRect(rect, tight, app.minSize), rect)
  }
})

test('impossible tiling is disabled and preserves existing geometry and maximized state', () => {
  const original = act(openAll(), 'toggleMaximize', 'music')
  const small = { x: 0, y: 40, width: 240, height: 180 }
  assert.equal(canTileWorkspace(original, apps, small), false)
  assert.deepEqual(reduceWorkspace(original, { type: 'tile' }, apps, small), original)
  const noVisible = apps.reduce((state, app) => act(state, 'minimize', app.id), original)
  assert.equal(canTileWorkspace(noVisible, apps, area), false)
  assert.deepEqual(act(noVisible, 'tile'), noVisible)
})

test('a single visible app can tile only when its actual minimum dimensions fit', () => {
  const original = act(createWorkspace(apps, area), 'open', 'music')
  assert.equal(canTileWorkspace(original, apps, { x: 0, y: 0, width: 419, height: 280 }), false)
  const exact = { x: 0, y: 0, width: 420, height: 280 }
  assert.equal(canTileWorkspace(original, apps, exact), true)
  const tiled = reduceWorkspace(original, { type: 'tile' }, apps, exact)
  assert.deepEqual(tiled.windows.music.rect, exact)
  assert.deepEqual(restoreWorkspace(serializeWorkspace(tiled), apps, exact).windows.music.rect, exact)
})

test('reset restores default layout and unmaximizes without reopening or unminimizing windows', () => {
  let state = act(act(openAll(), 'tile'), 'toggleMaximize', 'music')
  state = act(act(state, 'minimize', 'todo'), 'close', 'weather')
  const result = act(state, 'resetLayout')
  const defaults = createWorkspace(apps, area)
  for (const app of apps) {
    assert.deepEqual(result.windows[app.id].rect, defaults.windows[app.id].rect)
    assert.equal(result.windows[app.id].maximized, false)
    assert.equal(result.windows[app.id].open, state.windows[app.id].open)
    assert.equal(result.windows[app.id].minimized, state.windows[app.id].minimized)
  }
  assert.deepEqual(result.order, state.order)
})

test('serialization roundtrip retains stacking, normal geometry, display state and focus', () => {
  let state = act(act(openAll(), 'minimize', 'todo'), 'toggleMaximize', 'music')
  state = act(state, 'setRect', 'weather', { rect: { x: 80, y: 90, width: 600, height: 400 } })
  assert.deepEqual(restoreWorkspace(serializeWorkspace(state), apps, area), state)
})

test('restore reconciles removed and new apps and repairs stale order and invisible focus', () => {
  const saved = JSON.parse(serializeWorkspace(act(openAll(), 'minimize', 'todo')))
  saved.order = ['music', 'music', 'removed', 'todo']
  saved.focusedId = 'todo'
  const changed = [apps[0], apps[2], { ...apps[3], id: 'new-app' }]
  const restored = restoreWorkspace(JSON.stringify(saved), changed, area)
  assert.deepEqual(Object.keys(restored.windows), ['todo', 'calendar', 'new-app'])
  assert.deepEqual(restored.order, ['todo', 'calendar'])
  assert.equal(restored.focusedId, 'calendar')
  assert.equal(restored.windows['new-app'].open, false)
})

test('damaged storage falls back sensibly without discarding valid neighboring windows', () => {
  const defaults = createWorkspace(apps, area)
  for (const raw of [null, '', '{bad', 'null', '[]', '{"version":2}', '{"version":1,"windows":[]}']) {
    assert.deepEqual(restoreWorkspace(raw, apps, area), defaults)
  }
  const saved = JSON.parse(serializeWorkspace(openAll()))
  saved.windows.todo.rect.x = null
  saved.windows.music.rect.width = -10
  saved.windows.calendar.rect.y = 'wrong'
  const restored = restoreWorkspace(JSON.stringify(saved), apps, area)
  for (const id of ['todo', 'music', 'calendar']) assert.deepEqual(restored.windows[id].rect, defaults.windows[id].rect)
  assert.deepEqual(restored.windows.weather, saved.windows.weather)
  const nonfinite = '{"version":1,"windows":{"todo":{"open":true,"rect":{"x":1e400,"y":0,"width":400,"height":300}}}}'
  assert.deepEqual(restoreWorkspace(nonfinite, apps, area).windows.todo.rect, defaults.windows.todo.rect)
})

test('phone restore preserves desktop geometry through persistence and desktop fitting', () => {
  const desktop = act(openAll(), 'setRect', 'music', { rect: { x: 650, y: 450, width: 700, height: 420 } })
  const phone = { x: 0, y: 40, width: 390, height: 650 }
  const onPhone = restoreWorkspace(serializeWorkspace(desktop), apps, phone, { preserveRects: true })
  assert.deepEqual(onPhone, desktop)
  const returned = restoreWorkspace(serializeWorkspace(onPhone), apps, area)
  assert.deepEqual(returned, desktop)
  const resizedDesktop = { x: 0, y: 40, width: 900, height: 700 }
  const fitted = reduceWorkspace(returned, { type: 'fit' }, apps, resizedDesktop)
  Object.values(fitted.windows).forEach(window => contains(resizedDesktop, window.rect))
})
