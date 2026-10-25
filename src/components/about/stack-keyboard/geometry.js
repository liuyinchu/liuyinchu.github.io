// Rounded, bevelled solids. Every cap has a top, shoulder and full-height side walls.
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

export function createSolid(profiles, { labels = false, uvWidth = 1, uvDepth = 1 } = {}) {
  const data = []
  const rings = profiles.map(({ width, depth, radius, y }) => ({ y, points: contour(width, depth, radius) }))
  function vertex(point, y, normal, label) {
    data.push(point[0], y, point[1], ...normal, point[0] / uvWidth + .5, .5 - point[1] / uvDepth, label)
  }
  const ringNormals = rings.map((ring, level) => {
    const previous = rings[Math.max(0, level - 1)]
    const next = rings[Math.min(rings.length - 1, level + 1)]
    return ring.points.map((p, index) => {
      const a = previous.points[index]
      const b = next.points[index]
      const dy = next.y - previous.y
      const dr = (b[0] - a[0]) * p[2] + (b[1] - a[1]) * p[3]
      const length = Math.hypot(dy, dr) || 1
      return [p[2] * dy / length, -dr / length, p[3] * dy / length]
    })
  })
  for (let level = 0; level < rings.length - 1; level++) {
    const lower = rings[level]
    const upper = rings[level + 1]
    for (let i = 0; i < lower.points.length; i++) {
      const j = (i + 1) % lower.points.length
      vertex(lower.points[i], lower.y, ringNormals[level][i], 0)
      vertex(lower.points[j], lower.y, ringNormals[level][j], 0)
      vertex(upper.points[i], upper.y, ringNormals[level + 1][i], 0)
      vertex(lower.points[j], lower.y, ringNormals[level][j], 0)
      vertex(upper.points[j], upper.y, ringNormals[level + 1][j], 0)
      vertex(upper.points[i], upper.y, ringNormals[level + 1][i], 0)
    }
  }
  const top = rings.at(-1)
  for (let i = 0; i < top.points.length; i++) {
    vertex([0, 0], top.y, [0, 1, 0], labels ? 1 : 0)
    vertex(top.points[i], top.y, [0, 1, 0], labels ? 1 : 0)
    vertex(top.points[(i + 1) % top.points.length], top.y, [0, 1, 0], labels ? 1 : 0)
  }
  return new Float32Array(data)
}

export function keyGeometry() {
  return createSolid([
    { width: 1.07, depth: 1.03, radius: .115, y: .30 },
    { width: 1.11, depth: 1.07, radius: .125, y: .35 },
    { width: 1.04, depth: 1.00, radius: .135, y: .72 },
    { width: .93, depth: .89, radius: .14, y: .81 },
  ], { labels: true, uvWidth: .93, uvDepth: .89 })
}

export function baseGeometry() {
  return createSolid([
    { width: 5.16, depth: 3.96, radius: .24, y: -.20 },
    { width: 5.40, depth: 4.20, radius: .30, y: -.10 },
    { width: 5.40, depth: 4.20, radius: .30, y: .16 },
    { width: 5.25, depth: 4.05, radius: .27, y: .25 },
  ])
}

export function plateGeometry() {
  return createSolid([
    { width: 5.02, depth: 3.83, radius: .22, y: .248 },
    { width: 4.96, depth: 3.77, radius: .20, y: .278 },
  ])
}

export function perspective(aspect, fov = .58, near = .1, far = 60) {
  const f = 1 / Math.tan(fov / 2)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0])
}

export function multiply(a, b) {
  const result = new Float32Array(16)
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) result[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k]
    }
  }
  return result
}

export function lookAt(eye, target) {
  const normalize = (v) => { const length = Math.hypot(...v); return v.map((n) => n / length) }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const z = normalize(eye.map((n, i) => n - target[i]))
  const x = normalize(cross([0, 1, 0], z))
  const y = cross(z, x)
  const dot = (v) => -v.reduce((total, n, i) => total + n * eye[i], 0)
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, dot(x), dot(y), dot(z), 1])
}

export function project(matrix, x, y, z) {
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  return [(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w]
}
