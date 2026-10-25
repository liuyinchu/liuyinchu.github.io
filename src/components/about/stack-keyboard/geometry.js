// Rounded solids with a real cylindrical dish across each key's crown.
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
    { width: 1.055, depth: 1.015, radius: .11, y: .75 },
    { width: .97, depth: .93, radius: .115, y: .86 },
  ], { labels: true, uvWidth: .97, uvDepth: .93, dish: .065 })
}

export function baseGeometry(width = 7.69, depth = 4.18) {
  return createSolid([
    { width: width - .24, depth: depth - .24, radius: .22, y: -.24 },
    { width, depth, radius: .28, y: -.14 },
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
export function keyboardCamera(width, height, layout, progress, reduced = false) {
  const entrance = (1 - progress) * (reduced ? 0 : 1)
  const eye = layout.columns === 4 ? [1.5 + entrance * .3, 14 - entrance * .35, 8.5] : [5.2 + entrance * .65, 8.8 - entrance * .4, 12]
  const view = lookAt(eye, [0, .2, 0]), projection = perspective(width / height)
  const initial = multiply(projection, view), corners = []
  for (const x of [-layout.width / 2 - .08, layout.width / 2 + .08]) for (const y of [-.25, .9]) {
    for (const z of [-layout.depth / 2 - .08, layout.depth / 2 + .08]) corners.push(project(initial, x, y, z))
  }
  const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1])
  const minimumX = Math.min(...xs), maximumX = Math.max(...xs), minimumY = Math.min(...ys), maximumY = Math.max(...ys)
  const zoom = Math.min(1.92 / (maximumX - minimumX), 1.84 / (maximumY - minimumY))
  projection[0] *= zoom; projection[5] *= zoom
  projection[8] = (maximumX + minimumX) / 2 * zoom
  projection[9] = (maximumY + minimumY) / 2 * zoom
  return { matrix: multiply(projection, view), eye }
}
export function projectedKeys(matrix, layout, depression) {
  return layout.centers.map(([x, , z], index) => {
    const top = .824 - depression[index]
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
