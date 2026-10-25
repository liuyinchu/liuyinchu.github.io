// Procedural About formations and the projection shared with their DOM anchors.
export const ABOUT_NODES = [
  { id: 'notes', position: [-.58, .42, .10], fallbackPath: 'M-14-17H14V17H-14ZM-8-8H8M-8-1H8M-8 6H4' },
  { id: 'resources', position: [-.50, -.26, -.10], fallbackPath: 'M-21 0A21 11 0 1 0 21 0A21 11 0 1 0-21 0M0-21A11 21 0 1 0 0 21A11 21 0 1 0 0-21' },
  { id: 'projects', position: [.45, .06, .14], fallbackPath: 'M-17-8 0-18 17-8 0 2ZM-17-8V12L0 22 17 12V-8M0 2V22' },
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
  return {
    scene: Math.min(height * .458, width * .45) * (1 - mobile * (.12 * contents + .32 * ending) - desktop * .12 * ending),
    offsetX: width * desktop * (.16 * contents - .18 * ending),
    offsetY: height * mobile * (.07 * contents + .036 * ending),
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

export function createAboutParticles({ dustCount, starCount, backgroundCount, random }) {
  const count = dustCount + starCount + backgroundCount
  const result = { count }
  for (const name of ['six', 'emoji', 'arrow', 'knot', 'field', 'scatter', 'ending']) result[name] = new Float32Array(count * 3)
  result.style = new Float32Array(count * 4)
  result.nodeGroup = new Float32Array(count)
  result.anchors = ABOUT_NODES.map((node, index) => ({ id: node.id, index: dustCount + index }))
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(2 * Math.PI * random())
  const write = (name, index, point) => result[name].set(point, index * 3)
  const emojiSample = sampler([
    ellipse(-.35, .00, .62, .61, -.03),
    ellipse(-.57, .19, .205, .20, .09), ellipse(-.12, .19, .205, .20, .09),
    ellipse(-.57, .19, .022, .034, .12), ellipse(-.12, .19, .022, .034, .12),
    path([[-.365, .23], [-.325, .23]], .09),
    path([[-.97, .26], [-.775, .22]], .08), path([[.085, .22], [.26, .26]], .08),
    path([[-.35, .04], [-.41, -.05], [-.29, -.05]], .12),
    ellipse(-.35, -.115, .315, .285, .10, Math.PI, Math.PI * 2),
    path([[-.665, -.115], [-.035, -.115]], .10),
    path([[-.45, -.115], [-.45, -.285], [-.355, -.285], [-.355, -.115]], .13),
    path([[-.345, -.115], [-.345, -.285], [-.25, -.285], [-.25, -.115]], .13),
    path([[.55, -.50], [.86, -.50], [.91, -.27], [1.01, -.05], [.99, .13], [.92, .20], [.85, .14], [.82, .24], [.81, .73], [.77, .82], [.69, .82], [.65, .73], [.65, .24], [.57, .32], [.48, .30], [.44, .22], [.44, .03], [.50, -.17], [.55, -.27], [.55, -.50]], .04),
    path([[.65, .24], [.65, -.04], [.78, -.10], [.86, .00]], .08),
    path([[.48, .14], [.56, .14], [.60, .04]], .08),
    path([[.52, -.03], [.61, -.04]], .08),
  ])
  const corners = [
    [-.64, -.64, -.48], [.64, -.64, -.48], [.64, .64, -.48], [-.64, .64, -.48],
    [-.64, -.64, .48], [.64, -.64, .48], [.64, .64, .48], [-.64, .64, .48],
  ]
  const beams = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
    .map(([a, b]) => [corners[a], corners[b]])
  beams.push(path([[-.64, 0], [.64, 0]], .48), path([[-.64, 0], [.64, 0]], -.48))
  const frameSample = sampler(beams)
  const iconSamples = [
    sampler([
      path([[-.15, -.19], [.15, -.19], [.15, .19], [-.15, .19], [-.15, -.19]]),
      path([[-.09, .09], [.09, .09]]), path([[-.09, .01], [.09, .01]]), path([[-.09, -.07], [.04, -.07]]),
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
    const facePoint = emojiSample(u)
    write('emoji', i, facePoint.map((value, axis) => value + gaussian() * (axis === 2 ? .045 : .006)))
    const [fx, fy, fz] = hero ? corners[(i - dustCount) % corners.length] : frameSample(u)
    const depth = -fx * Math.sin(.42) + fz * Math.cos(.42)
    write('arrow', i, [fx * Math.cos(.42) + fz * Math.sin(.42) + jitter(), fy * Math.cos(.18) - depth * Math.sin(.18) + jitter(), fy * Math.sin(.18) + depth * Math.cos(.18) + jitter()])
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
      for (const name of ['six', 'emoji', 'arrow', 'knot', 'field', 'scatter', 'ending']) write(name, i, point)
    }
    const temperature = random() < .085 ? .97 : hero ? .30 + random() * .33 : .03 + random() * .38
    const size = background ? 1.4 + random() * 2.5 : hero ? 8 + Math.pow(random(), 2.2) * 15 : 1.1 + Math.pow(random(), 2.5) * 2.7
    const brightness = background ? .58 + random() * .46 : hero ? .58 + random() * .65 : .12 + random() * .30
    result.style.set([size, brightness, temperature, background ? 0 : hero ? 1 : .5], i * 4)
  }
  return result
}

export function projectAboutAnchors(particles, { progress, replay, rotationX, rotationY, hoverX, hoverY, time, motion, width, height }) {
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
    let p = Array.from({ length: 3 }, (_, axis) => {
      const start = from[index * 3 + axis]
      const mixed = start + (to[index * 3 + axis] - start) * t
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
