import { BONGO_WIDTH, BONGO_HEIGHT } from './bongo-reference.js'

// Rounded solids and the shared camera bounds for the keyboard and starlight cat.
export const KEY_TOP = 1.10
export const KEY_TRAVEL = .14
export const KEY_HIT_HEIGHT = KEY_TOP - .035
function contour(width, depth, radius, segments = 8) {
  const result = []
  const corners = [
    [width / 2 - radius, depth / 2 - radius, 0],
    [-width / 2 + radius, depth / 2 - radius, Math.PI / 2],
    [-width / 2 + radius, -depth / 2 + radius, Math.PI],
    [width / 2 - radius, -depth / 2 + radius, Math.PI * 1.5],
  ]
  for (const [x, z, angle] of corners) {
    for (let i = 0; i <= segments; i++) {
      const a = angle + i / segments * Math.PI / 2
      result.push([x + Math.cos(a) * radius, z + Math.sin(a) * radius, Math.cos(a), Math.sin(a)])
    }
  }
  return result
}

export function createSolid(profiles, { labels = false, uvWidth = 1, uvDepth = 1, dish = 0 } = {}) {
  const data = []
  const rings = profiles.map(({ width, depth, radius, y }) => ({ y, points: contour(width, depth, radius) }))
  const top = rings.at(-1)
  const halfDepth = profiles.at(-1).depth / 2
  const crownHeight = (z) => top.y - dish * (1 - (z / halfDepth) ** 2)
  function vertex(point, y, normal, label) {
    data.push(point[0], y, point[1], ...normal, point[0] / uvWidth + .5, .5 - point[1] / uvDepth, label)
  }
  const ringNormals = rings.map((ring, level) => {
    const previous = rings[Math.max(0, level - 1)]
    const next = rings[Math.min(rings.length - 1, level + 1)]
    return ring.points.map((p, index) => {
      const a = previous.points[index], b = next.points[index]
      const dy = next.y - previous.y
      const dr = (b[0] - a[0]) * p[2] + (b[1] - a[1]) * p[3]
      const length = Math.hypot(dy, dr) || 1
      return [p[2] * dy / length, -dr / length, p[3] * dy / length]
    })
  })
  function sideVertex(level, index) {
    const ring = rings[level], point = ring.points[index]
    vertex(point, level === rings.length - 1 ? crownHeight(point[1]) : ring.y, ringNormals[level][index], 0)
  }
  for (let level = 0; level < rings.length - 1; level++) {
    for (let i = 0; i < rings[level].points.length; i++) {
      const j = (i + 1) % rings[level].points.length
      sideVertex(level, i); sideVertex(level, j); sideVertex(level + 1, i)
      sideVertex(level, j); sideVertex(level + 1, j); sideVertex(level + 1, i)
    }
  }
  function crownVertex(p) {
    const nz = -2 * dish * p[1] / (halfDepth * halfDepth)
    const length = Math.hypot(1, nz)
    vertex(p, crownHeight(p[1]), [0, 1 / length, nz / length], labels ? 1 : 0)
  }
  if (dish) {
    // Concentric rings keep the dip curved in silhouette as well as in its normals.
    const crown = [1, .78, .52, .26].map((scale) => top.points.map((p) => [p[0] * scale, p[1] * scale]))
    for (let level = 0; level < crown.length - 1; level++) {
      for (let i = 0; i < top.points.length; i++) {
        const j = (i + 1) % top.points.length
        crownVertex(crown[level][i]); crownVertex(crown[level][j]); crownVertex(crown[level + 1][i])
        crownVertex(crown[level][j]); crownVertex(crown[level + 1][j]); crownVertex(crown[level + 1][i])
      }
    }
    for (let i = 0; i < top.points.length; i++) {
      crownVertex([0, 0]); crownVertex(crown.at(-1)[i]); crownVertex(crown.at(-1)[(i + 1) % top.points.length])
    }
  } else {
    for (let i = 0; i < top.points.length; i++) {
      crownVertex([0, 0]); crownVertex(top.points[i]); crownVertex(top.points[(i + 1) % top.points.length])
    }
  }
  return new Float32Array(data)
}

export function keyGeometry() {
  return createSolid([
    { width: 1.09, depth: 1.05, radius: .095, y: .30 },
    { width: 1.13, depth: 1.09, radius: .105, y: .35 },
    { width: 1.055, depth: 1.015, radius: .11, y: .94 },
    { width: .97, depth: .93, radius: .115, y: KEY_TOP },
  ], { labels: true, uvWidth: .97, uvDepth: .93, dish: .070 })
}

export function baseGeometry(width = 7.69, depth = 4.18) {
  return createSolid([
    { width: width - .24, depth: depth - .24, radius: .22, y: -.49 },
    { width, depth, radius: .28, y: -.36 },
    { width, depth, radius: .28, y: .04 },
    { width: width + .035, depth: depth + .035, radius: .28, y: .065 },
    { width: width + .035, depth: depth + .035, radius: .28, y: .115 },
    { width: width - .12, depth: depth - .12, radius: .25, y: .25 },
  ])
}
export function plateGeometry(width = 7.69, depth = 4.18) {
  return createSolid([
    { width: width - .34, depth: depth - .34, radius: .19, y: .248 },
    { width: width - .39, depth: depth - .39, radius: .18, y: .279 },
  ])
}

export function keyboardLayout(width, count) {
  const columns = width < 560 ? 4 : 6
  const rows = Math.ceil(count / columns)
  const centers = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns)
    const inRow = Math.min(columns, count - row * columns)
    return [(index % columns - (inRow - 1) / 2) * 1.19, 0, (row - (rows - 1) / 2) * 1.21]
  })
  return { columns, rows, width: columns * 1.19 + .55, depth: rows * 1.21 + .55, centers }
}
export function perspective(aspect, fov = .58, near = .1, far = 60) {
  const f = 1 / Math.tan(fov / 2)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0])
}
export function multiply(a, b) {
  const result = new Float32Array(16)
  for (let column = 0; column < 4; column++) for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 4; k++) result[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k]
  }
  return result
}
export function lookAt(eye, target) {
  const normalize = (v) => { const length = Math.hypot(...v); return v.map((n) => n / length) }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const z = normalize(eye.map((n, i) => n - target[i]))
  const x = normalize(cross([0, 1, 0], z)), y = cross(z, x)
  const dot = (v) => -v.reduce((total, n, i) => total + n * eye[i], 0)
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, dot(x), dot(y), dot(z), 1])
}
export function project(matrix, x, y, z) {
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  return [(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w]
}
export function keyboardScene(layout) {
  return { catScale: layout.width * .71, catOrigin: [0, .30, -layout.depth / 2 - .28], catAspect: BONGO_HEIGHT / BONGO_WIDTH }
}
export function keyboardCamera(width, height, layout, progress, reduced = false) {
  const entrance = (1 - progress) * (reduced ? 0 : 1)
  // Three-quarter view: a slanted front edge plus readable tops and substantial sides.
  const eye = layout.columns === 4 ? [6.22 + entrance * .18, 15.02, 13.74] : [7.20 + entrance * .24, 13.60, 13.35]
  const view = lookAt(eye, [0, .75, -.20]), projection = perspective(width / height)
  const right = [view[0],view[4],view[8]], up = [view[1],view[5],view[9]], forward = [view[2],view[6],view[10]]
  const initial = multiply(projection, view), corners = []
  for (const x of [-layout.width / 2 - .08, layout.width / 2 + .08]) for (const y of [-.52, KEY_TOP + .02]) {
    for (const z of [-layout.depth / 2 - .08, layout.depth / 2 + .08]) corners.push(project(initial, x, y, z))
  }
  const scene = keyboardScene(layout)
  // The source frame already contains the angled cat pose. Face the camera at its
  // exact 457:289 aspect rather than shearing that pose a second time.
  for (const x of [-.5,.5]) for (const y of [0,scene.catAspect]) for (const z of [-.002,.010]) {
    const world=scene.catOrigin.map((n,i)=>n+(right[i]*x+up[i]*y+forward[i]*z)*scene.catScale)
    corners.push(project(initial,...world))
  }
  const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1])
  const minimumX = Math.min(...xs), maximumX = Math.max(...xs), minimumY = Math.min(...ys), maximumY = Math.max(...ys)
  const zoom = Math.min(1.90 / (maximumX - minimumX), 1.85 / (maximumY - minimumY))
  projection[0] *= zoom; projection[5] *= zoom
  projection[8] = (maximumX + minimumX) / 2 * zoom
  projection[9] = (maximumY + minimumY) / 2 * zoom
  return { matrix: multiply(projection, view), eye, right, up, forward }
}
// A similarity transform from source pixels / 457 to viewport client coordinates.
// The hypothetical left-down anchor and actual right-down anchor land on key crowns.
export function fitCatFrame(left, right) {
  if (!left || !right) return null
  const dx=right[0]-left[0], dy=right[1]-left[1]
  if (dx===0 && dy===0) return null
  const du=(325-70)/BONGO_WIDTH, dv=(244-195)/BONGO_WIDTH, denominator=du*du+dv*dv
  const ax=(dx*du+dy*dv)/denominator, ay=(dy*du-dx*dv)/denominator
  const axisX=[ax,ay], axisY=[-ay,ax]
  return { origin:[left[0]-70/BONGO_WIDTH*ax+195/BONGO_WIDTH*ay,
    left[1]-70/BONGO_WIDTH*ay-195/BONGO_WIDTH*ax], axisX, axisY }
}
export function keyboardCatFrame(matrix, layout, rect) {
  if (!(rect.width>0 && rect.height>0)) return null
  const clientPoint=(index)=>{
    const [x,,z]=layout.centers[index], p=project(matrix,x,KEY_HIT_HEIGHT,z)
    return [rect.left+(p[0]+1)*rect.width*.5,rect.top+(1-p[1])*rect.height*.5]
  }
  return fitCatFrame(clientPoint(0),clientPoint(layout.columns===6?4:3))
}
export function projectedKeys(matrix, layout) {
  return layout.centers.map(([x, , z], index) => {
    // Keep the target on the resting crown plane while the cap moves beneath it.
    // This prevents a held key from sliding into the neighboring row's target.
    const top = KEY_HIT_HEIGHT
    // Include the full shoulder, with a real gap between adjacent hit polygons.
    const halfWidth = layout.columns === 4 ? .55 : .52
    const halfDepth = layout.columns === 4 ? .545 : .505
    const points = [[-halfWidth, -halfDepth], [halfWidth, -halfDepth], [halfWidth, halfDepth], [-halfWidth, halfDepth]].map(([dx, dz]) => {
      const p = project(matrix, x + dx, top, z + dz)
      return [(p[0] + 1) * 50, (1 - p[1]) * 50]
    })
    const left = Math.min(...points.map((p) => p[0])), right = Math.max(...points.map((p) => p[0]))
    const topEdge = Math.min(...points.map((p) => p[1])), bottom = Math.max(...points.map((p) => p[1]))
    return { left, top: topEdge, width: right - left, height: bottom - topEdge, points,
      polygon: points.map((p) => `${((p[0] - left) / (right - left) * 100).toFixed(3)}% ${((p[1] - topEdge) / (bottom - topEdge) * 100).toFixed(3)}%`).join(', ') }
  })
}
