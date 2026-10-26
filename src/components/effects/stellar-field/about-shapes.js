import { createCatGeometry } from '../../about/stack-keyboard/cat-geometry.js'

// Procedural About formations and the projection shared with their DOM anchors.
export const ABOUT_NODES = [
  { id: 'notes', position: [-.60, .42, .10], fallbackPath: 'M-14-17H14V17H-14ZM-8-8H8M-8-1H8M-8 6H4' },
  { id: 'talk', position: [.42, .40, -.10], fallbackPath: 'M-18-13H18V10H1L-10 19V10H-18ZM-10-3H10M-10 3H5' },
  { id: 'resources', position: [-.56, -.38, -.10], fallbackPath: 'M-21 0A21 11 0 1 0 21 0A21 11 0 1 0-21 0M0-21A11 21 0 1 0 0 21A11 21 0 1 0 0-21' },
  { id: 'projects', position: [.48, -.34, .14], fallbackPath: 'M-17-8 0-18 17-8 0 2ZM-17-8V12L0 22 17 12V-8M0 2V22' },
]

function smoothstep(low, high, value) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  return t * t * (3 - 2 * t)
}
export function getAboutContentWeight(progress) {
  return 1 - smoothstep(.04, .14, Math.abs(progress - .6))
}
export function getAboutView(width, height, progress) {
  const desktop = smoothstep(700, 1000, width)
  const mobile = 1 - desktop
  const contents = getAboutContentWeight(progress)
  const ending = smoothstep(.8, 1, progress)
  const expression = 1 - smoothstep(.04, .12, Math.abs(progress - .2))
  const pointer = 1 - smoothstep(.04, .12, Math.abs(progress - .4))
  return {
    scene: Math.min(height * .458, width * .45) * (1 - mobile * (.12 * contents + .32 * ending + .08 * expression + .40 * pointer) - desktop * (.12 * ending + .22 * expression + .12 * pointer)),
    offsetX: width * desktop * (.16 * contents + .18 * expression - .17 * pointer - .18 * ending),
    offsetY: height * mobile * (.07 * contents + .036 * ending + .06 * expression),
  }
}

function sampler(paths) {
  const segments = paths.flatMap((path) => path.slice(1).map((point, index) => [path[index], point]))
  const lengths = segments.map(([a, b]) => Math.hypot(...b.map((value, axis) => value - a[axis])))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  return (u) => {
    let distance = u * total
    let index = 0
    while (index < segments.length - 1 && distance > lengths[index]) distance -= lengths[index++]
    const [a, b] = segments[index]
    const t = distance / lengths[index]
    return a.map((value, axis) => value + (b[axis] - value) * t)
  }
}
const path = (points, depth = 0) => points.map(([x, y]) => [x, y, depth])
function ellipse(cx, cy, rx, ry, depth = 0, start = 0, end = Math.PI * 2) {
  return Array.from({ length: 65 }, (_, index) => {
    const angle = start + (end - start) * index / 64
    return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, depth]
  })
}


// User-provided 1540x808 reference, downsampled to 128x70 cells in memory.
// Run lengths are base36; final digit is feature 0..6. Tooth white is sampled
// only inside the face's mouth ROI, never from the source's white background.
// 4/5 are the two real white tooth cores; 6 preserves their rounded grey rim/seam.
const EXPRESSION_REFERENCE = [
  '3k0',
  '390.13.a0',
  '350.62.90',
  '340.82.80',
  't0.92.220.92.70',
  'o0.j2.1w0.a2.70',
  'l0.p2.1t0.a2.70',
  'j0.c2.53.c2.1r0.a2.70',
  'h0.92.f3.92.1p0.a2.70',
  'g0.72.l3.72.1o0.a2.70',
  'e0.72.p3.72.1m0.a2.70',
  'd0.62.t3.62.1l0.a2.70',
  'c0.52.x3.52.1k0.a2.70',
  'b0.52.z3.52.1j0.a2.70',
  'a0.52.113.52.1i0.a2.70',
  '90.52.133.52.1h0.a2.70',
  '80.52.153.52.1g0.a2.70',
  '70.12.11.32.173.32.11.12.1f0.a2.70',
  '70.11.42.183.32.11.1f0.a2.70',
  '60.11.42.193.52.1e0.a2.70',
  '50.12.11.82.103.92.11.1e0.a2.70',
  '50.11.g2.m3.i2.1d0.a2.70',
  '40.12.11.n2.93.n2.11.160.52.20.a2.70',
  '40.12.11.1j2.11.12.130.13.82.11.92.70',
  '40.11.82.c0.i2.c0.72.11.v0.62.20.92.11.92.70',
  '30.12.11.52.i0.b2.j0.42.11.12.t0.82.11.92.11.92.70',
  '30.21.22.1i0.12.21.l0.52.20.11.82.11.92.11.92.70',
  '30.11.32.80.11.82.11.i0.82.11.90.12.21.j0.82.21.82.21.92.11.82.70',
  '20.12.11.32.60.a2.21.32.b0.32.11.10.a2.11.60.22.11.12.i0.92.11.82.21.92.11.82.70',
  '20.21.32.50.a2.40.32.90.32.40.a2.60.22.11.12.h0.a2.11.92.11.92.11.82.70',
  '20.21.22.21.40.92.50.42.80.32.50.a2.30.11.32.21.h0.a2.11.92.11.92.11.82.70',
  '20.21.32.11.30.a2.60.32.80.22.60.11.92.30.11.32.21.h0.a2.11.92.11.92.11.82.70',
  '20.21.42.30.92.70.32.30.11.40.22.70.92.30.42.21.h0.a2.10.92.11.i2.70',
  '10.12.21.42.30.92.30.21.20.32.30.12.11.30.22.30.11.30.92.30.42.21.h0.a2.11.92.11.j2.60',
  '20.21.42.11.20.92.30.21.20.32.20.32.30.22.20.21.30.92.30.42.21.h0.a2.10.92.11.92.11.92.60',
  '20.21.52.30.82.30.21.20.22.30.42.20.22.20.21.30.92.30.42.21.h0.a2.10.92.21.62.31.92.60',
  '20.21.52.30.92.20.11.30.22.30.42.20.22.30.11.20.11.92.20.52.21.h0.a2.21.s2.60',
  '20.21.52.11.20.92.50.32.20.52.20.32.50.a2.20.52.21.i0.11.82.20.12.11.q2.60',
  '20.21.62.20.a2.30.11.32.20.62.20.22.11.30.a2.30.52.21.i0.11.62.21.10.31.q2.60',
  '10.12.31.52.30.f2.20.72.20.g2.20.52.31.h0.12.41.22.21.10.41.q2.60',
  '20.31.62.30.d2.30.82.20.e2.30.52.31.h0.12.91.22.20.q2.60',
  '20.31.62.11.30.b2.30.a2.30.a2.40.62.31.h0.32.51.42.11.10.11.q2.50',
  '20.31.72.g0.c2.f0.72.31.h0.d2.21.q2.50',
  '20.41.82.c0.f2.c0.82.41.h0.e2.31.p2.40',
  '30.31.b2.70.k2.70.a2.31.i0.f2.41.52.21.g2.40',
  '30.31.1j2.31.j0.e2.21.90.11.g2.30',
  '30.41.1h2.41.j0.f2.21.90.11.f2.30',
  '30.41.b2.20.r2.10.c2.31.k0.g2.41.70.11.e2.30',
  '40.41.b2.20.11.n2.11.20.b2.41.k0.i2.71.30.e2.30',
  '40.51.a2.40.l2.30.b2.51.k0.o2.41.e2.30',
  '50.41.b2.50.g2.11.50.b2.41.l0.r2.11.e2.30',
  '50.51.b2.70.21.72.21.70.b2.41.12.l0.142.11.40',
  '60.51.b2.60.34.41.45.50.c2.51.m0.142.11.40',
  '60.12.41.d2.40.54.16.55.40.c2.51.o0.132.11.40',
  '70.51.e2.10.16.54.16.55.10.f2.51.o0.122.11.12.40',
  '80.51.e2.11.16.34.26.45.16.f2.51.p0.122.11.50',
  '90.51.e2.a6.11.d2.61.q0.112.21.50',
  'a0.61.c2.21.76.11.d2.61.s0.11.z2.11.60',
  'a0.71.d2.71.d2.61.12.s0.z2.21.60',
  'b0.12.61.v2.61.v0.11.w2.21.70',
  'd0.71.r2.71.w0.12.11.u2.21.12.70',
  'e0.81.n2.81.y0.21.s2.31.80',
  'f0.91.j2.81.12.100.21.q2.31.90',
  'h0.b1.b2.b1.130.21.n2.41.12.90',
  'i0.12.t1.160.31.k2.41.12.a0',
  'k0.12.p1.12.180.31.h2.51.12.b0',
  'n0.12.k1.1c0.12.41.b2.71.d0',
  'r0.d1.1i0.12.i1.f0',
  '2p0.12.d1.h0',
  '3k0',
]
const referenceSites = []
let referenceWeight = 0
EXPRESSION_REFERENCE.forEach((encoded, row) => {
  let column = 0
  encoded.split('.').forEach((run) => {
    const count = Number.parseInt(run.slice(0, -1), 36)
    const feature = Number(run.at(-1))
    for (let index = 0; index < count; index++, column++) {
      if (!feature) continue
      referenceWeight += feature === 1 ? .18 : feature === 3 ? .85 : feature === 6 ? 2.4 : feature === 4 || feature === 5 ? 4 : 1
      referenceSites.push({ x: 155 + column * 10, y: 45 + row * 10, feature, weight: referenceWeight })
    }
  })
})
function expressionSurface(x, y, feature) {
  let depth
  if (x < 850) {
    const nx = (x - 483) / 320
    const ny = (y - 402) / 320
    depth = .19 * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
  } else {
    const palm = Math.sqrt(Math.max(0, 1 - ((x - 1182) / 225) ** 2 - ((y - 515) / 225) ** 2))
    const finger = Math.sqrt(Math.max(0, 1 - ((x - 1310) / 65) ** 2 - ((y - 180) / 175) ** 2))
    const blend = smoothstep(260, 360, y)
    depth = .14 * (finger * (1 - blend) + palm * blend)
    depth += .05 * Math.exp(-(((x - 1200) / 140) ** 2 + ((y - 470) / 70) ** 2))
  }
  return [(x - 782) * .0015, (394 - y) * .0015, .025 + depth + (feature >= 4 ? .015 : 0)]
}
function expressionPoint(u, index) {
  let low = 0
  let high = referenceSites.length - 1
  const target = u * referenceWeight
  while (low < high) {
    const mid = (low + high) >> 1
    if (referenceSites[mid].weight < target) low = mid + 1
    else high = mid
  }
  const site = referenceSites[low]
  const fraction = Math.sin(index * 2.371) * 43758.5453
  const x = site.x + (fraction - Math.floor(fraction) - .5) * 8
  const vertical = Math.sin(index * 1.719 + .7) * 24634.6345
  const y = site.y + (vertical - Math.floor(vertical) - .5) * 8
  return { point: expressionSurface(x, y, site.feature), feature: site.feature }
}
export const ABOUT_EXPRESSION_DOTS = referenceSites.map(({ x, y, feature }) => {
  const point = expressionSurface(x, y, feature)
  const scale = 90 * 3.8 / (3.8 - point[2])
  return { x: point[0] * scale, y: -point[1] * scale, feature }
})

// An open half-twisted strip follows a depth-separated figure eight; a second,
// narrower stream crosses behind it. Across-strip lanes stay visible when dragged.
export function endingRibbonPoint(u, across = 0, stream = 0) {
  const theta = -.86 * Math.PI + u * 1.80 * Math.PI
  const phase = theta + stream * .24
  const center = [
    Math.sin(phase) * (stream ? .91 : .86) + stream * .07,
    Math.sin(phase * 2 + stream * .38) * (stream ? .29 : .37) - stream * .08,
    Math.cos(phase) * (stream ? -.32 : .44) - stream * .09,
  ]
  const tangent = [
    Math.cos(phase) * (stream ? .91 : .86),
    Math.cos(phase * 2 + stream * .38) * (stream ? .58 : .74),
    -Math.sin(phase) * (stream ? -.32 : .44),
  ]
  const length = Math.hypot(...tangent)
  const [tx, ty, tz] = tangent.map((value) => value / length)
  const flat = Math.hypot(tx, ty)
  const normal = [-ty / flat, tx / flat, 0]
  const binormal = [-tz * normal[1], tz * normal[0], tx * normal[1] - ty * normal[0]]
  const twist = theta * .5 + stream * 1.1
  const taper = .45 + .55 * Math.sin(Math.PI * u) ** .6
  const width = (stream ? .065 : .18) * across * taper
  const point = center.map((value, axis) => value + width * (normal[axis] * Math.cos(twist) + binormal[axis] * Math.sin(twist)))
  const release = smoothstep(.82, 1, u)
  point[0] += release * release * (stream ? .33 : .48)
  point[1] += release * release * .14
  point[2] -= release * .20
  // A gentle tilt exposes both the crossing and the front/back ribbon surfaces.
  const y = point[1] * Math.cos(.26) - point[2] * Math.sin(.26)
  const z = point[1] * Math.sin(.26) + point[2] * Math.cos(.26)
  return [point[0] * Math.cos(.18) - y * Math.sin(.18), point[0] * Math.sin(.18) + y * Math.cos(.18), z]
}

export const ABOUT_ENDING_PATHS = [0, 1].flatMap((stream) =>
  [-1, -.66, -.33, 0, .33, .66, 1].map((across) => ({
    stream,
    opacity: stream ? .44 : .68 - Math.abs(across) * .20,
    d: Array.from({ length: 121 }, (_, index) => {
      const [x, y, z] = endingRibbonPoint(index / 120, across, stream)
      const scale = 90 * 3.8 / (3.8 - z)
      return (index ? 'L' : 'M') + (x * scale).toFixed(2) + ' ' + (-y * scale).toFixed(2)
    }).join(' '),
  })),
)

export const ABOUT_ENDING_KNOTS = [.11, .31, .54, .77, .93].map((u) => {
  const [x, y, z] = endingRibbonPoint(u)
  const scale = 90 * 3.8 / (3.8 - z)
  return { x: x * scale, y: -y * scale }
})

export function getAboutCatFallback() {
  return createCatGeometry().fallback
}
export function getAboutCatWeight(progress) {
  const section = Math.max(0, Math.min(1, progress)) * 5
  const segment = Math.min(4, Math.floor(section))
  const t = smoothstep(.18, .82, section - segment)
  return segment === 3 ? t : segment === 4 ? 1 - t : 0
}
export function resolveAboutCatFrame(frame, rect) {
  if (frame && [frame.origin, frame.axisX, frame.axisY].every((pair) => pair?.length === 2 && pair.every(Number.isFinite))
    && Math.hypot(...frame.axisX) > 0 && Math.hypot(...frame.axisY) > 0) return frame
  const size = Math.min(rect.width * .72, rect.height * .84, 520)
  return { origin: [rect.left + rect.width * .56 - size * .5, rect.top + rect.height * .22], axisX: [size, 0], axisY: [0, size] }
}
export function getAboutCatMapping(frame, rect, width, height) {
  const source = resolveAboutCatFrame(frame, rect)
  const scaleX = width / Math.max(1, rect.width)
  const scaleY = height / Math.max(1, rect.height)
  return {
    origin: [(source.origin[0] - rect.left) * scaleX, (source.origin[1] - rect.top) * scaleY],
    axisX: [source.axisX[0] * scaleX, source.axisX[1] * scaleY],
    axisY: [source.axisY[0] * scaleX, source.axisY[1] * scaleY],
    source,
  }
}
export function getAboutCatTarget(point, seed, state) {
  const { progress, rotationX, rotationY, hoverX, hoverY, time, motion, width, height, catFrame, canvasRect } = state
  const rect = canvasRect || { left: 0, top: 0, width, height }
  const mapping = getAboutCatMapping(catFrame, rect, width, height)
  const u = point[0] + .5
  const v = 289 / 457 - point[1]
  const px = mapping.origin[0] + mapping.axisX[0] * u + mapping.axisY[0] * v
  const py = mapping.origin[1] + mapping.axisX[1] * u + mapping.axisY[1] * v
  const view = getAboutView(width, height, progress)
  const perspective = 3.8 / (3.8 - point[2])
  const x = (px - width * .5 + view.offsetX) / (view.scene * perspective)
  const y = (height * .5 - py - view.offsetY) / (view.scene * perspective)
  const z = point[2]
  const rx = rotationX + hoverY + Math.sin(time * .12) * .024 * motion
  const ry = rotationY + hoverX + Math.sin(time * .09) * .032 * motion
  const iy = y * Math.cos(rx) + z * Math.sin(rx)
  const iz = -y * Math.sin(rx) + z * Math.cos(rx)
  const breathe = Math.sin(time * .19 + seed * .025) * .007 * motion
  return [
    x * Math.cos(ry) - iz * Math.sin(ry) - Math.cos(seed) * breathe,
    iy - Math.sin(seed) * breathe,
    x * Math.sin(ry) + iz * Math.cos(ry) - Math.sin(time * .10 + seed * .021) * .004 * motion * smoothstep(.8, 1, progress),
  ]
}
function attachAboutCat(result, foreground) {
  const { body } = createCatGeometry()
  const priority = []
  const interior = []
  for (let index = 0; index < body.length / 8; index++) {
    const offset = index * 8
    const colored = body[offset + 3] - body[offset + 4] > .10
    const edge = Math.abs(body[offset + 6] - 1.35) < .0001
    const core = body[offset + 6] >= 1.95
    if (colored || edge || core) priority.push(index)
    else interior.push(index)
  }
  const selected = priority.slice()
  const remaining = foreground - selected.length
  for (let index = 0; index < remaining; index++) selected.push(interior[Math.floor((index + .5) * interior.length / remaining)])
  selected.sort((a, b) => a - b)
  result.catStyle = new Float32Array(result.count * 4)
  result.catSize = new Float32Array(result.count)
  for (let index = 0; index < foreground; index++) {
    const offset = selected[index] * 8
    result.field.set(body.subarray(offset, offset + 3), index * 3)
    result.catStyle.set([body[offset + 3], body[offset + 4], body[offset + 5], body[offset + 7]], index * 4)
    result.catSize[index] = body[offset + 6]
  }
}

export function createAboutParticles({ dustCount, starCount, backgroundCount, random, cursor, cursorStyle }) {
  const count = dustCount + starCount + backgroundCount
  const result = { count, arrow: cursor }
  for (const name of ['six', 'emoji', 'knot', 'field', 'scatter', 'ending']) result[name] = new Float32Array(count * 3)
  result.style = new Float32Array(count * 4)
  result.nodeGroup = new Float32Array(count)
  result.details = new Float32Array(count * 4)
  result.anchors = ABOUT_NODES.map((node, index) => ({ id: node.id, index: dustCount + index }))
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(2 * Math.PI * random())
  const write = (name, index, point) => result[name].set(point, index * 3)
  const iconSamples = [
    sampler([
      path([[-.15, -.19], [.15, -.19], [.15, .19], [-.15, .19], [-.15, -.19]]),
      path([[-.09, .09], [.09, .09]]), path([[-.09, .01], [.09, .01]]), path([[-.09, -.07], [.04, -.07]]),
    ]),
    sampler([
      path([[-.20, .14], [.20, .14], [.20, -.11], [.02, -.11], [-.11, -.21], [-.11, -.11], [-.20, -.11], [-.20, .14]]),
      path([[-.10, .04], [.10, .04]]), path([[-.10, -.03], [.05, -.03]]),
    ]),
    sampler([ellipse(0, 0, .23, .12, .02), ellipse(0, 0, .12, .23, -.02)]),
    sampler([
      path([[-.18, .09], [0, .20], [.18, .09], [0, -.02], [-.18, .09]], .08),
      path([[-.18, .09], [-.18, -.13], [0, -.24], [.18, -.13], [.18, .09]], -.04),
      path([[0, -.02], [0, -.24]], .10),
    ]),
  ]
  for (let i = 0; i < count; i++) {
    const background = i >= dustCount + starCount
    const hero = i >= dustCount && !background
    const u = random()
    const group = hero ? (i - dustCount) % ABOUT_NODES.length : i % ABOUT_NODES.length
    result.nodeGroup[i] = background ? 0 : group + 1
    const jitter = () => gaussian() * (hero ? .005 : .009)
    const secondary = i % 4 === 0
    const angle = (hero ? (i - dustCount) % 7 / 7 : u) * Math.PI * 1.86 + .18
    const lean = secondary ? .78 : -.48
    const ox = Math.cos(angle) * (secondary ? .73 : .96)
    const oy = Math.sin(angle) * (secondary ? .32 : .35)
    write('six', i, [ox * Math.cos(lean) - oy * Math.sin(lean) + jitter(), ox * Math.sin(lean) + oy * Math.cos(lean) + jitter(), Math.sin(angle) * (secondary ? -.53 : .46) + jitter()])
    const expression = expressionPoint(u, i)
    write('emoji', i, expression.point.map((value, axis) => value + gaussian() * (axis === 2 ? .014 : .0015)))
    // Preserve the shared random stream while reusing the original cursor buffer.
    jitter(); jitter(); jitter()
    result.details.set([expression.feature, cursorStyle[i * 4], cursorStyle[i * 4 + 1], cursorStyle[i * 4 + 2]], i * 4)
    const node = ABOUT_NODES[group].position
    const local = iconSamples[group](u)
    const isAnchor = hero && i - dustCount < 4
    write('knot', i, isAnchor ? node : local.map((value, axis) => node[axis] + value + jitter()))
    const starAngle = random() * Math.PI * 2
    const openRadius = Math.pow(random(), .62) * 2.3
    write('scatter', i, [Math.cos(starAngle) * openRadius * 1.22, Math.sin(starAngle) * openRadius, (random() - .5) * 2.2 - .15])
    const fieldRadius = .94 + random() * 1.1
    write('field', i, [Math.cos(starAngle) * fieldRadius * 1.15, Math.sin(starAngle) * fieldRadius * .78, (random() - .5) * 1.0 - .8])
    const brightKnot = hero && i % 11 === 0
    const ribbonU = brightKnot ? [.11, .31, .54, .77, .93][i % 5] : u
    const across = brightKnot ? 0 : ((i % 9 - 4) / 4 * .87 + Math.sin(i * 1.71) * .13)
    const ribbon = endingRibbonPoint(ribbonU, across, i % 4 === 0 ? 1 : 0)
    const haze = brightKnot ? .002 : i % 7 === 0 ? .025 : .005
    write('ending', i, ribbon.map((value, axis) => value + Math.sin(i * (.73 + axis * .17)) * haze))
    if (background) {
      const point = [(random() - .5) * 7.5, (random() - .5) * 5.5, -.8 - random() * 2.8]
      for (const name of ['six', 'emoji', 'knot', 'field', 'scatter', 'ending']) write(name, i, point)
    }
    const temperature = random() < .085 ? .97 : hero ? .30 + random() * .33 : .03 + random() * .38
    const size = background ? 1.4 + random() * 2.5 : hero ? 8 + Math.pow(random(), 2.2) * 15 : 1.1 + Math.pow(random(), 2.5) * 2.7
    const brightness = background ? .58 + random() * .46 : hero ? .58 + random() * .65 : .12 + random() * .30
    result.style.set([size, brightness, temperature, background ? 0 : hero ? 1 : .5], i * 4)
  }
  // The original loop and its random calls remain untouched. Only field is replaced.
  attachAboutCat(result, dustCount + starCount)
  return result
}

export function projectAboutAnchors(particles, { progress, replay, rotationX, rotationY, hoverX, hoverY, time, motion, width, height, catFrame, canvasRect }) {
  const section = Math.max(0, Math.min(1, progress)) * 5
  const segment = Math.min(4, Math.floor(section))
  const t = smoothstep(.18, .82, section - segment)
  const names = ['six', 'emoji', 'arrow', 'knot', 'field', 'ending']
  const flight = Math.sin(t * Math.PI)
  const view = getAboutView(width, height, progress)
  const rx = rotationX + hoverY + Math.sin(time * .12) * .024 * motion
  const ry = rotationY + hoverX + Math.sin(time * .09) * .032 * motion
  return particles.anchors.map(({ id, index }) => {
    const seed = Math.fround(Math.fround(index) * Math.fround(1.61803398875))
    const from = particles[names[segment]]
    const to = particles[names[segment + 1]]
    const catTarget = particles.catStyle ? getAboutCatTarget(Array.from(particles.field.subarray(index * 3, index * 3 + 3)), seed, { progress, rotationX, rotationY, hoverX, hoverY, time, motion, width, height, catFrame, canvasRect }) : null
    let p = Array.from({ length: 3 }, (_, axis) => {
      const start = names[segment] === 'field' && catTarget ? catTarget[axis] : from[index * 3 + axis]
      const finish = names[segment + 1] === 'field' && catTarget ? catTarget[axis] : to[index * 3 + axis]
      const mixed = start + (finish - start) * t
      return mixed + (particles.scatter[index * 3 + axis] - mixed) * flight * (segment === 4 ? .12 : .72)
    })
    const angle = flight * .38 * Math.sin(seed * .17)
    p = [p[0] * Math.cos(angle) - p[1] * Math.sin(angle), p[0] * Math.sin(angle) + p[1] * Math.cos(angle), p[2] + flight * Math.sin(seed * .31) * .55]
    p = p.map((value, axis) => value + (particles.scatter[index * 3 + axis] - value) * replay)
    const breathe = Math.sin(time * .19 + seed * .025) * .007 * motion
    p[0] += Math.cos(seed) * breathe
    p[1] += Math.sin(seed) * breathe
    p[2] += Math.sin(time * .10 + seed * .021) * .004 * motion * smoothstep(.8, 1, progress)
    const x = Math.cos(ry) * p[0] + Math.sin(ry) * p[2]
    const z = -Math.sin(ry) * p[0] + Math.cos(ry) * p[2]
    const y = Math.cos(rx) * p[1] - Math.sin(rx) * z
    const depth = 3.8 - (Math.sin(rx) * p[1] + Math.cos(rx) * z)
    const perspective = 3.8 / Math.max(depth, .25)
    const px = .5 + (x * view.scene * perspective - view.offsetX) / width
    const py = .5 - (y * view.scene * perspective + view.offsetY) / height
    return { id, x: Math.max(0, Math.min(1, px)), y: Math.max(0, Math.min(1, py)), visible: getAboutContentWeight(progress) > .15 && replay < .5 && depth > .25 && px >= 0 && px <= 1 && py >= 0 && py <= 1 }
  })
}
