const GAP = 16
const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
const validRect = rect => rect && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(rect[key])) && rect.width > 0 && rect.height > 0
const copyRect = ({ x, y, width, height }) => ({ x, y, width, height })

/** Fit a normal desktop rectangle, allowing small viewports to override minimum size. */
export function fitRect(rect, area, minSize) {
  const width = clamp(rect.width, Math.min(minSize.width, area.width), area.width)
  const height = clamp(rect.height, Math.min(minSize.height, area.height), area.height)
  return {
    x: clamp(rect.x, area.x, area.x + area.width - width),
    y: clamp(rect.y, area.y, area.y + area.height - height),
    width,
    height,
  }
}

export function moveRect(rect, delta, area, minSize) {
  return fitRect({ ...rect, x: rect.x + delta.x, y: rect.y + delta.y }, area, minSize)
}

/** Keep the opposite edge stationary; dragging beyond a boundary stops at that boundary. */
export function resizeRect(rect, edge, delta, area, minSize) {
  const start = fitRect(rect, area, minSize)
  let left = start.x
  let top = start.y
  let right = start.x + start.width
  let bottom = start.y + start.height
  const minWidth = Math.min(minSize.width, area.width)
  const minHeight = Math.min(minSize.height, area.height)
  if (edge.includes('w')) left = clamp(left + delta.x, area.x, right - minWidth)
  if (edge.includes('e')) right = clamp(right + delta.x, left + minWidth, area.x + area.width)
  if (edge.includes('n')) top = clamp(top + delta.y, area.y, bottom - minHeight)
  if (edge.includes('s')) bottom = clamp(bottom + delta.y, top + minHeight, area.y + area.height)
  return { x: left, y: top, width: right - left, height: bottom - top }
}

function defaultRect(app, index, area) {
  return fitRect({
    x: area.x + (area.width - app.defaultSize.width) / 2 + index * 24,
    y: area.y + (area.height - app.defaultSize.height) / 2 + index * 24,
    ...app.defaultSize,
  }, area, app.minSize)
}

export function createWorkspace(apps, area) {
  return {
    windows: Object.fromEntries(apps.map((app, index) => [app.id, {
      open: false,
      minimized: false,
      maximized: false,
      rect: defaultRect(app, index, area),
    }])),
    order: [],
    focusedId: null,
  }
}

const visible = (state, id) => Boolean(state.windows[id]?.open && !state.windows[id].minimized)
function settleFocus(state) {
  if (!visible(state, state.focusedId)) {
    state.focusedId = [...state.order].reverse().find(id => visible(state, id)) ?? null
  }
}
function raise(state, id) {
  state.order = [...state.order.filter(candidate => candidate !== id), id]
  state.focusedId = id
}

function planTiles(state, apps, area) {
  const ids = state.order.filter(id => visible(state, id))
  if (!ids.length) return null
  const metadata = new Map(apps.map(app => [app.id, app]))
  let best = null
  for (let columns = 1; columns <= ids.length; columns++) {
    const rows = Math.ceil(ids.length / columns)
    const widths = Array(columns).fill(0)
    const heights = Array(rows).fill(0)
    ids.forEach((id, index) => {
      const min = metadata.get(id).minSize
      const column = index % columns
      const row = Math.floor(index / columns)
      widths[column] = Math.max(widths[column], min.width)
      heights[row] = Math.max(heights[row], min.height)
    })
    const spareWidth = area.width - GAP * (columns - 1) - widths.reduce((sum, width) => sum + width, 0)
    const spareHeight = area.height - GAP * (rows - 1) - heights.reduce((sum, height) => sum + height, 0)
    if (spareWidth < 0 || spareHeight < 0) continue
    const columnWidths = widths.map(width => width + spareWidth / columns)
    const rowHeights = heights.map(height => height + spareHeight / rows)
    const rects = ids.map((id, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      return fitRect({
        x: area.x + columnWidths.slice(0, column).reduce((sum, width) => sum + width + GAP, 0),
        y: area.y + rowHeights.slice(0, row).reduce((sum, height) => sum + height + GAP, 0),
        width: columnWidths[column],
        height: rowHeights[row],
      }, area, metadata.get(id).minSize)
    })
    const score = rects.reduce((sum, rect, index) => {
      const size = metadata.get(ids[index]).defaultSize
      return sum + Math.abs(Math.log((rect.width / rect.height) / (size.width / size.height)))
    }, columns * rows - ids.length)
    if (!best || score < best.score) best = { ids, rects, score }
  }
  return best
}

/** False when no visible windows exist or no grid fits their minimum sizes plus gaps. */
export function canTileWorkspace(state, apps, area) {
  return planTiles(state, apps, area) !== null
}

function tileWindows(state, apps, area) {
  const plan = planTiles(state, apps, area)
  if (!plan) return
  plan.ids.forEach((id, index) => {
    state.windows[id].rect = plan.rects[index]
    state.windows[id].maximized = false
  })
}

/** Reducer never mutates its input; rect always means the unmaximized desktop geometry. */
export function reduceWorkspace(state, action, apps, area) {
  const next = {
    windows: Object.fromEntries(Object.entries(state.windows).map(([id, window]) => [id, { ...window, rect: copyRect(window.rect) }])),
    order: [...state.order],
    focusedId: state.focusedId,
  }
  const window = next.windows[action.id]
  const app = apps.find(item => item.id === action.id)
  switch (action.type) {
    case 'open':
      if (window) {
        window.open = true
        window.minimized = false
        raise(next, action.id)
      }
      break
    case 'focus':
      if (visible(next, action.id)) raise(next, action.id)
      break
    case 'minimize':
      if (window?.open) {
        window.minimized = true
        if (next.focusedId === action.id) next.focusedId = null
      }
      break
    case 'restore':
      if (window?.open) {
        window.minimized = false
        raise(next, action.id)
      }
      break
    case 'close':
      if (window) {
        window.open = false
        window.minimized = false
        window.maximized = false
        next.order = next.order.filter(id => id !== action.id)
        if (next.focusedId === action.id) next.focusedId = null
      }
      break
    case 'toggleMaximize':
      if (visible(next, action.id)) {
        window.maximized = !window.maximized
        raise(next, action.id)
      }
      break
    case 'setRect':
      if (window && app && validRect(action.rect)) window.rect = fitRect(action.rect, area, app.minSize)
      break
    case 'fit':
      apps.forEach(app => {
        if (next.windows[app.id]) next.windows[app.id].rect = fitRect(next.windows[app.id].rect, area, app.minSize)
      })
      break
    case 'tile':
      tileWindows(next, apps, area)
      break
    case 'resetLayout':
      apps.forEach((app, index) => {
        if (next.windows[app.id]) {
          next.windows[app.id].rect = defaultRect(app, index, area)
          next.windows[app.id].maximized = false
        }
      })
      break
  }
  settleFocus(next)
  return next
}

export function serializeWorkspace(state) {
  return JSON.stringify({
    version: 1,
    windows: Object.fromEntries(Object.entries(state.windows).map(([id, window]) => [id, {
      open: window.open,
      minimized: window.minimized,
      maximized: window.maximized,
      rect: copyRect(window.rect),
    }])),
    order: [...state.order],
    focusedId: state.focusedId,
  })
}

export function restoreWorkspace(raw, apps, area, { preserveRects = false } = {}) {
  const state = createWorkspace(apps, area)
  let saved
  try { saved = JSON.parse(raw) } catch { return state }
  if (!saved || saved.version !== 1 || !saved.windows || typeof saved.windows !== 'object' || Array.isArray(saved.windows)) return state
  apps.forEach(app => {
    const source = saved.windows[app.id]
    if (!source || typeof source !== 'object' || Array.isArray(source)) return
    const window = state.windows[app.id]
    window.open = source.open === true
    window.minimized = window.open && source.minimized === true
    window.maximized = window.open && source.maximized === true
    if (validRect(source.rect)) {
      window.rect = preserveRects ? copyRect(source.rect) : fitRect(source.rect, area, app.minSize)
    }
  })
  state.order = [...new Set(Array.isArray(saved.order) ? saved.order.filter(id => typeof id === 'string' && state.windows[id]?.open) : [])]
  apps.forEach(app => {
    if (state.windows[app.id].open && !state.order.includes(app.id)) state.order.push(app.id)
  })
  state.focusedId = typeof saved.focusedId === 'string' ? saved.focusedId : null
  settleFocus(state)
  return state
}
