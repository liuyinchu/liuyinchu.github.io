// Independent, procedural study of a stellar ribbon. No reference-page source or assets.
// Tune these counts and ribbon widths first when comparing the visual at different sizes.
export const DUST_COUNT = 11800
export const STAR_COUNT = 132
export const BACKGROUND_COUNT = 360

function randomGenerator(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let n = state
    n = Math.imul(n ^ n >>> 15, n | 1)
    n ^= n + Math.imul(n ^ n >>> 7, n | 61)
    return ((n ^ n >>> 14) >>> 0) / 4294967296
  }
}

function catmull(points, samplesPerSegment = 34) {
  const result = []
  for (let segment = 0; segment < points.length - 1; segment++) {
    const a = points[Math.max(0, segment - 1)]
    const b = points[segment]
    const c = points[segment + 1]
    const d = points[Math.min(points.length - 1, segment + 2)]
    for (let j = 0; j < samplesPerSegment; j++) {
      const t = j / samplesPerSegment
      const t2 = t * t
      const t3 = t2 * t
      result.push([0, 1].map(k => 0.5 * (
        2 * b[k] + (-a[k] + c[k]) * t
        + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2
        + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3
      )))
    }
  }
  result.push(points.at(-1))
  return result
}

function roundedPolygon(points, corner = 0.095) {
  const result = []
  for (let i = 0; i < points.length; i++) {
    const before = points[(i + points.length - 1) % points.length]
    const p = points[i]
    const after = points[(i + 1) % points.length]
    const start = p.map((v, k) => v + (before[k] - v) * corner)
    const end = p.map((v, k) => v + (after[k] - v) * corner)
    for (let j = 0; j <= 12; j++) {
      const t = j / 12
      result.push(start.map((v, k) => (1 - t) ** 2 * v + 2 * t * (1 - t) * p[k] + t * t * end[k]))
    }
  }
  result.push(result[0])
  return result
}

function pathSampler(points) {
  const distances = [0]
  for (let i = 1; i < points.length; i++) {
    distances.push(distances.at(-1) + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
  }
  const total = distances.at(-1)
  return (fraction) => {
    const target = Math.max(0, Math.min(0.999999, fraction)) * total
    let low = 0
    let high = points.length - 1
    while (high - low > 1) {
      const mid = (low + high) >> 1
      if (distances[mid] <= target) low = mid
      else high = mid
    }
    const t = (target - distances[low]) / (distances[high] - distances[low])
    const a = points[low]
    const b = points[high]
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx: -(b[1] - a[1]) / length, ny: (b[0] - a[0]) / length }
  }
}

// An open descending arm winds twice into the bright lower nucleus.
const sixPath = pathSampler(catmull([
  [0.59, 0.98], [0.22, 1.00], [-0.20, 0.86], [-0.56, 0.55],
  [-0.73, 0.12], [-0.70, -0.32], [-0.49, -0.68], [-0.13, -0.84],
  [0.29, -0.79], [0.57, -0.53], [0.60, -0.21], [0.36, 0.01],
  [0.03, 0.00], [-0.21, -0.22], [-0.13, -0.48], [0.13, -0.52],
  [0.29, -0.34], [0.18, -0.19], [0.00, -0.24], [0.01, -0.37],
  [0.11, -0.38], [0.12, -0.31],
]))

const cursorPath = pathSampler(roundedPolygon([
  [-0.91, 0.90], [0.91, 0.18], [0.27, -0.33], [-0.265, -0.90],
], 0.072))

// One folded loop: two tangents and a rounded outer crown.
// Six rotations produce the central hexagonal aperture and interwoven lanes.
const crown = []
for (let i = 0; i <= 56; i++) {
  const theta = i / 56 * Math.PI
  crown.push([-0.06 + Math.cos(theta) * 0.34, 0.48 + Math.sin(theta) * 0.34])
}
const knotLoop = pathSampler([
  [0.28, -0.162], [0.28, 0.48], ...crown,
  [-0.40, -0.092], [0.28, -0.484], [0.28, -0.162],
])

export function createParticles(profile = 'stellar') {
  if (profile === 'about') return createAboutParticles()
  const count = DUST_COUNT + STAR_COUNT + BACKGROUND_COUNT
  const six = new Float32Array(count * 3)
  const arrow = new Float32Array(count * 3)
  const knot = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const style = new Float32Array(count * 4)
  const random = randomGenerator(0x71ac93)
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(0.00001, random()))) * Math.cos(2 * Math.PI * random())
  const write = (target, index, x, y, z) => target.set([x, y, z], index * 3)

  for (let i = 0; i < count; i++) {
    const background = i >= DUST_COUNT + STAR_COUNT
    const hero = i >= DUST_COUNT && !background
    const u = random()
    // Multiple narrow streams within a wider, very dim cloud.
    const lane = Math.floor(random() * 5) - 2
    const width = (hero ? 0.024 : (random() < 0.78 ? 0.027 : 0.091)) * (0.65 + 0.55 * Math.sin(u * 17) ** 2)
    const cross = gaussian() * width + lane * 0.014
    const depth = gaussian() * (hero ? 0.055 : 0.072)
    const s = sixPath(u)
    const curveDepth = Math.sin(u * Math.PI * 3.4) * 0.085
    // A slender companion arm joins the main upper sweep rather than forming a second 6.
    const companion = !background && i % 7 === 0 && u < 0.30
    const branchT = u / 0.30
    const branch = companion ? (0.075 + 0.080 * Math.sin(branchT * Math.PI)) * (1 - branchT) : 0
    const sixCross = companion ? cross * 0.40 : cross
    write(six, i, s.x + s.nx * sixCross + branch, s.y + s.ny * sixCross + branch * 0.75, depth + curveDepth)
    // A small luminous nucleus, not an extra flat glow disc.
    if (i < 920 || (hero && i - DUST_COUNT < 10)) {
      const spread = hero ? 0.035 : 0.052
      write(six, i, 0.035 + gaussian() * spread * 1.25, -0.30 + gaussian() * spread, depth * 1.1)
    }

    const a = cursorPath(u)
    write(arrow, i, a.x + a.nx * cross * 0.90, a.y + a.ny * cross * 0.90, depth * 0.58 + Math.sin(u * Math.PI * 6) * 0.055)

    const loop = Math.floor(random() * 6)
    const l = knotLoop(u)
    const theta = loop * Math.PI / 3
    const x = l.x + l.nx * cross * 0.52
    const y = l.y + l.ny * cross * 0.52
    write(knot, i, (x * Math.cos(theta) - y * Math.sin(theta)) * 1.08, (x * Math.sin(theta) + y * Math.cos(theta)) * 1.08,
      depth * 0.42 + Math.sin(u * Math.PI * 2 + loop * Math.PI / 3) * 0.115)

    const angle = random() * Math.PI * 2
    const radius = 1.15 + Math.pow(random(), 0.70) * 2.25
    write(scatter, i, Math.cos(angle) * radius * 1.30, Math.sin(angle) * radius, (random() - 0.5) * 2.8)
    if (background) {
      const bx = (random() - 0.5) * 7.5
      const by = (random() - 0.5) * 5.5
      const bz = -0.8 - random() * 2.8
      for (const target of [six, arrow, knot, scatter]) write(target, i, bx, by, bz)
    }

    const temperature = random() < 0.085 ? 0.97 : (hero ? 0.30 + random() * 0.33 : 0.03 + random() * 0.38)
    const size = background ? 1.4 + random() * 2.5 : hero ? 18 + Math.pow(random(), 2.2) * 32 : 1.15 + Math.pow(random(), 2.5) * 4.4
    const brightness = background ? 0.58 + random() * 0.46 : hero ? 0.86 + random() * 0.76 : 0.26 + random() * 0.44
    style.set([size, brightness, temperature, background ? 0 : hero ? 1 : 0.5], i * 4)
  }
  return { count, six, arrow, knot, scatter, style }
}


// The About story uses the same buffers with three independent, unbranded forms.
function segmentSampler3d(segments) {
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

function createAboutParticles() {
  const count = DUST_COUNT + STAR_COUNT + BACKGROUND_COUNT
  const six = new Float32Array(count * 3)
  const arrow = new Float32Array(count * 3)
  const knot = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const style = new Float32Array(count * 4)
  const random = randomGenerator(0x9a34e1)
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(0.00001, random()))) * Math.cos(2 * Math.PI * random())
  const write = (target, index, point) => target.set(point, index * 3)
  const corners = [
    [-.64, -.64, -.48], [.64, -.64, -.48], [.64, .64, -.48], [-.64, .64, -.48],
    [-.64, -.64, .48], [.64, -.64, .48], [.64, .64, .48], [-.64, .64, .48],
  ]
  const beams = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
    .map(([a, b]) => [corners[a], corners[b]])
  beams.push(
    [[-.64, 0, -.48], [.64, 0, -.48]], [[-.64, 0, .48], [.64, 0, .48]],
    [[-.64, 0, -.48], [-.64, 0, .48]], [[.64, 0, -.48], [.64, 0, .48]],
    [[-.64, -.64, .48], [.64, .64, .48]],
  )
  const frameSample = segmentSampler3d(beams)
  const nodes = [
    [-.92, -.46, -.10], [-.56, -.16, .32], [-.22, -.45, -.28], [.13, -.04, .22],
    [.52, -.23, -.12], [.90, .20, .18], [.50, .57, -.22], [.02, .72, .12],
    [-.40, .52, -.18], [-.80, .22, .10],
  ]
  const links = [[0, 1], [1, 2], [1, 8], [8, 9], [8, 7], [7, 6], [6, 5], [5, 4], [4, 3], [3, 2], [3, 8], [3, 6]]
    .map(([a, b]) => [nodes[a], nodes[b]])
  const constellationSample = segmentSampler3d(links)
  const frameAngle = .42
  const tiltFrame = ([x, y, z]) => {
    const depth = -x * Math.sin(frameAngle) + z * Math.cos(frameAngle)
    return [
      x * Math.cos(frameAngle) + z * Math.sin(frameAngle),
      y * Math.cos(.18) - depth * Math.sin(.18),
      y * Math.sin(.18) + depth * Math.cos(.18),
    ]
  }

  for (let i = 0; i < count; i++) {
    const background = i >= DUST_COUNT + STAR_COUNT
    const hero = i >= DUST_COUNT && !background
    const u = random()
    const spread = hero ? .006 : .013
    const jitter = () => gaussian() * spread
    const secondary = i % 4 === 0
    const angle = (hero ? (i - DUST_COUNT) % 7 / 7 : u) * Math.PI * 1.86 + .18
    const lean = secondary ? .78 : -.48
    const ox = Math.cos(angle) * (secondary ? .73 : .96)
    const oy = Math.sin(angle) * (secondary ? .32 : .35)
    const oz = Math.sin(angle) * (secondary ? -.53 : .46)
    write(six, i, [
      ox * Math.cos(lean) - oy * Math.sin(lean) + jitter(),
      ox * Math.sin(lean) + oy * Math.cos(lean) + jitter(),
      oz + jitter(),
    ])

    const beamPoint = hero ? corners[(i - DUST_COUNT) % corners.length] : frameSample(u)
    write(arrow, i, tiltFrame(beamPoint.map((value) => value + jitter())))
    const nearNode = hero || i % 5 === 0
    const starPoint = nearNode ? nodes[(hero ? i - DUST_COUNT : Math.floor(i / 5)) % nodes.length] : constellationSample(u)
    write(knot, i, starPoint.map((value) => value + gaussian() * (nearNode ? .020 : .007)))

    const scatterAngle = random() * Math.PI * 2
    const radius = 1.15 + Math.pow(random(), .70) * 2.25
    write(scatter, i, [Math.cos(scatterAngle) * radius * 1.30, Math.sin(scatterAngle) * radius, (random() - .5) * 2.8])
    if (background) {
      const point = [(random() - .5) * 7.5, (random() - .5) * 5.5, -.8 - random() * 2.8]
      for (const target of [six, arrow, knot, scatter]) write(target, i, point)
    }

    const temperature = random() < .085 ? .97 : hero ? .30 + random() * .33 : .03 + random() * .38
    const size = background ? 1.4 + random() * 2.5 : hero ? 9 + Math.pow(random(), 2.2) * 17 : 1.1 + Math.pow(random(), 2.5) * 2.7
    const brightness = background ? .58 + random() * .46 : hero ? .60 + random() * .70 : .12 + random() * .30
    style.set([size, brightness, temperature, background ? 0 : hero ? 1 : .5], i * 4)
  }
  return { count, six, arrow, knot, scatter, style }
}
