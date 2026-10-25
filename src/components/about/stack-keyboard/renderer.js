import { keyGeometry, baseGeometry, plateGeometry, perspective, lookAt, multiply, project } from './geometry.js'

const VERTEX = `#version 300 es
precision highp float;
in vec3 aPosition;
in vec3 aNormal;
in vec2 aUv;
in float aLabel;
uniform mat4 uViewProjection;
uniform vec3 uOffset;
uniform vec3 uScale;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUv;
out float vLabel;
void main() {
  vPosition = aPosition * uScale + uOffset;
  vNormal = normalize(aNormal / uScale);
  vUv = aUv;
  vLabel = aLabel;
  gl_Position = uViewProjection * vec4(vPosition, 1.);
}`
const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUv;
in float vLabel;
uniform vec3 uColor;
uniform vec3 uEye;
uniform vec3 uOffset;
uniform float uSelected;
uniform float uKind;
uniform vec4 uAtlasRect;
uniform sampler2D uAtlas;
out vec4 outColor;
void main() {
  if (uKind > .5) {
    vec2 p = vUv * 2. - 1.;
    float opacity;
    if (uKind > 1.5) opacity = (1. - smoothstep(.3, 1., max(abs(p.x), abs(p.y)))) * .72;
    else opacity = exp(-dot(p, p) * 2.6) * .42 * (1. - smoothstep(.65, 1., length(p)));
    outColor = vec4(.006, .008, .014, opacity);
    return;
  }
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(uEye - vPosition);
  vec3 lightDirection = normalize(vec3(-3.5, 8., 5.));
  float diffuse = max(dot(normal, lightDirection), 0.);
  float fill = max(dot(normal, normalize(vec3(4., 3., -5.))), 0.);
  float specular = pow(max(dot(normal, normalize(lightDirection + viewDirection)), 0.), 60.);
  float rim = pow(1. - max(dot(normal, viewDirection), 0.), 3.);
  float wallShade = mix(.78, 1., smoothstep(.3, .78, vPosition.y - uOffset.y));
  vec3 color = uColor * (.34 + diffuse * .63 + fill * .14) * wallShade;
  color += vec3(.91, .94, 1.) * (specular * .19 + rim * .045);
  color += uSelected * vec3(.095, .108, .105) * max(normal.y, .15);
  if (vLabel > .99) {
    vec2 uv = mix(uAtlasRect.xy, uAtlasRect.zw, clamp(vUv, .002, .998));
    vec4 ink = texture(uAtlas, uv);
    color = mix(color, ink.rgb, ink.a);
  }
  outColor = vec4(color, 1.);
}`

export function createKeyboardRenderer(canvas, { keys, onReady, onUnavailable, onPositions }) {
  let gl
  try { gl = canvas.getContext('webgl2', { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' }) }
  catch { onUnavailable(); return null }
  if (!gl) { onUnavailable(); return null }
  let program = null
  let texture = null
  let meshes = []
  let locations = {}
  let frame = 0
  let disposed = false
  let lost = false
  let ready = false
  let visible = !document.hidden
  let inViewport = true
  let active = true
  let paused = false
  let selected = 0
  let progress = 1
  let currentProgress = 1
  let width = 1
  let height = 1
  let previousTime = 0
  let observer
  let resizeObserver
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reduced = motionQuery.matches
  const movement = keys.map(() => ({ position: 0, velocity: 0, target: 0, timer: 0 }))
  const centers = keys.map((_, index) => [((index % 4) - 1.5) * 1.19, 0, (Math.floor(index / 4) - 1) * 1.21])
  const colors = keys.map((key) => [1, 3, 5].map((offset) => Number.parseInt(key.color.slice(offset, offset + 2), 16) / 255))

  function shader(type, source) {
    const result = gl.createShader(type)
    gl.shaderSource(result, source)
    gl.compileShader(result)
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(result)
      gl.deleteShader(result)
      throw new Error(message)
    }
    return result
  }
  function mesh(data) {
    const vao = gl.createVertexArray()
    const buffer = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const stride = 9 * 4
    for (const [name, size, offset] of [['aPosition', 3, 0], ['aNormal', 3, 12], ['aUv', 2, 24], ['aLabel', 1, 32]]) {
      const location = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset)
    }
    const result = { vao, buffer, count: data.length / 9 }
    meshes.push(result)
    return result
  }
  function labelAtlas() {
    const atlas = document.createElement('canvas')
    atlas.width = atlas.height = 1024
    const ctx = atlas.getContext('2d')
    if (!ctx) throw new Error('Canvas text is unavailable')
    ctx.clearRect(0, 0, 1024, 1024)
    keys.forEach((key, index) => {
      const x = index % 4 * 256
      const y = Math.floor(index / 4) * 256
      ctx.fillStyle = 'rgba(24, 29, 34, .94)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = '500 26px Arial, sans-serif'
      ctx.fillText(key.shortcut.toUpperCase(), x + 28, y + 43)
      ctx.textAlign = 'center'
      const lines = key.legend || [key.name]
      ctx.font = `600 ${key.name.length > 9 ? 25 : 30}px Arial, sans-serif`
      lines.forEach((line, lineIndex) => ctx.fillText(line, x + 128, y + 138 + (lineIndex - (lines.length - 1) / 2) * 36, 214))
      ctx.fillStyle = 'rgba(24, 29, 34, .3)'
      ctx.fillRect(x + 111, y + 210, 34, 3)
    })
    texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.generateMipmap(gl.TEXTURE_2D)
  }
  function release() {
    meshes.forEach(({ vao, buffer }) => { gl.deleteVertexArray(vao); gl.deleteBuffer(buffer) })
    meshes = []
    if (texture) gl.deleteTexture(texture)
    if (program) gl.deleteProgram(program)
    texture = program = null
  }
  let keyMesh
  let baseMesh
  let plateMesh
  let planeMesh
  function initialize() {
    let vertexShader
    let fragmentShader
    try {
      vertexShader = shader(gl.VERTEX_SHADER, VERTEX)
      fragmentShader = shader(gl.FRAGMENT_SHADER, FRAGMENT)
      program = gl.createProgram()
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
      locations = Object.fromEntries(['uViewProjection', 'uOffset', 'uScale', 'uColor', 'uEye', 'uSelected', 'uKind', 'uAtlasRect', 'uAtlas'].map((name) => [name, gl.getUniformLocation(program, name)]))
      keyMesh = mesh(keyGeometry())
      baseMesh = mesh(baseGeometry())
      plateMesh = mesh(plateGeometry())
      planeMesh = mesh(new Float32Array([
        -1, 0, -1, 0, 1, 0, 0, 1, 0, 1, 0, -1, 0, 1, 0, 1, 1, 0, -1, 0, 1, 0, 1, 0, 0, 0, 0,
        -1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
      ]))
      labelAtlas()
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
      return true
    } catch {
      release()
      onUnavailable()
      return false
    } finally {
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
    }
  }
  function camera() {
    const entrance = (1 - currentProgress) * (reduced ? 0 : 1)
    const eye = [5.2 + entrance * .75, 8.2 - entrance * .55, 11.4]
    const view = lookAt(eye, [0, .2, 0])
    const projection = perspective(width / height)
    let matrix = multiply(projection, view)
    const corners = []
    for (const x of [-2.88, 2.88]) for (const y of [-.22, .85]) for (const z of [-2.22, 2.22]) corners.push(project(matrix, x, y, z))
    const xs = corners.map((p) => p[0])
    const ys = corners.map((p) => p[1])
    const minimumX = Math.min(...xs), maximumX = Math.max(...xs)
    const minimumY = Math.min(...ys), maximumY = Math.max(...ys)
    const zoom = Math.min(1.87 / (maximumX - minimumX), 1.75 / (maximumY - minimumY))
    projection[0] *= zoom
    projection[5] *= zoom
    projection[8] = (maximumX + minimumX) / 2 * zoom
    projection[9] = (maximumY + minimumY) / 2 * zoom - .015
    matrix = multiply(projection, view)
    return { matrix, eye }
  }
  function drawMesh(object, offset, color, { scale = [1, 1, 1], kind = 0, highlight = 0, index = 0 } = {}) {
    gl.uniform3fv(locations.uOffset, offset)
    gl.uniform3fv(locations.uScale, scale)
    gl.uniform3fv(locations.uColor, color)
    gl.uniform1f(locations.uKind, kind)
    gl.uniform1f(locations.uSelected, highlight)
    const column = index % 4
    const row = Math.floor(index / 4)
    gl.uniform4f(locations.uAtlasRect, column / 4, 1 - (row + 1) / 4, (column + 1) / 4, 1 - row / 4)
    gl.bindVertexArray(object.vao)
    gl.drawArrays(gl.TRIANGLES, 0, object.count)
  }
  function render(time = performance.now()) {
    frame = 0
    if (disposed || lost || !visible || !inViewport) return
    const dt = Math.min((time - previousTime) / 1000 || .016, .033)
    previousTime = time
    const animate = active && !paused && !reduced
    currentProgress += (progress - currentProgress) * (animate ? Math.min(1, dt * 9) : 1)
    let moving = Math.abs(progress - currentProgress) > .0003
    movement.forEach((key) => {
      if (animate) {
        key.velocity += ((key.target - key.position) * 440 - key.velocity * 29) * dt
        key.position += key.velocity * dt
        moving ||= Math.abs(key.position - key.target) > .00015 || Math.abs(key.velocity) > .001
      } else { key.position = key.target; key.velocity = 0 }
    })
    const { matrix, eye } = camera()
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.uniformMatrix4fv(locations.uViewProjection, false, matrix)
    gl.uniform3fv(locations.uEye, eye)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(locations.uAtlas, 0)
    gl.depthMask(false)
    drawMesh(planeMesh, [0, -.23, .14], [0, 0, 0], { scale: [3.6, 1, 2.8], kind: 1 })
    gl.depthMask(true)
    drawMesh(baseMesh, [0, 0, 0], [.105, .12, .15])
    drawMesh(plateMesh, [0, 0, 0], [.055, .065, .083])
    gl.depthMask(false)
    centers.forEach(([x, , z]) => drawMesh(planeMesh, [x, .281, z], [0, 0, 0], { scale: [.65, 1, .63], kind: 2 }))
    gl.depthMask(true)
    centers.forEach(([x, , z], index) => drawMesh(keyMesh, [x, -movement[index].position, z], colors[index], { index, highlight: index === selected ? 1 : 0 }))
    onPositions(centers.map(([x, , z], index) => {
      const top = .818 - movement[index].position
      const points = [[-.48, -.46], [.48, -.46], [.48, .46], [-.48, .46]].map(([dx, dz]) => {
        const p = project(matrix, x + dx, top, z + dz)
        return [(p[0] + 1) * 50, (1 - p[1]) * 50]
      })
      const left = Math.min(...points.map((p) => p[0])), right = Math.max(...points.map((p) => p[0]))
      const topEdge = Math.min(...points.map((p) => p[1])), bottom = Math.max(...points.map((p) => p[1]))
      return { left, top: topEdge, width: right - left, height: bottom - topEdge, polygon: points.map((p) => `${((p[0] - left) / (right - left) * 100).toFixed(3)}% ${((p[1] - topEdge) / (bottom - topEdge) * 100).toFixed(3)}%`).join(', ') }
    }))
    if (!ready) {
      if (gl.getError() !== gl.NO_ERROR) { lost = true; onUnavailable(); return }
      ready = true
      onReady()
    }
    if (moving && animate) frame = requestAnimationFrame(render)
  }
  function wake() {
    if (!disposed && !lost && visible && inViewport && !frame) frame = requestAnimationFrame(render)
  }
  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1600000 / (width * height)))
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    wake()
  }
  function onVisibility() {
    visible = !document.hidden
    if (!visible) { cancelAnimationFrame(frame); frame = 0 }
    else { previousTime = 0; wake() }
  }
  function onMotion(event) { reduced = event.matches; wake() }
  function onLost(event) {
    event.preventDefault()
    lost = true
    ready = false
    cancelAnimationFrame(frame)
    frame = 0
    onUnavailable()
  }
  function onRestored() {
    if (disposed) return
    meshes = []
    program = texture = null
    lost = false
    if (initialize()) { resize(); wake() }
    else lost = true
  }
  if (!initialize()) return null
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)
  document.addEventListener('visibilitychange', onVisibility)
  motionQuery.addEventListener('change', onMotion)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  observer = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting
    if (!inViewport) { cancelAnimationFrame(frame); frame = 0 }
    else { previousTime = 0; wake() }
  }, { rootMargin: '80px' })
  observer.observe(canvas)
  resize()
  return {
    setState(state) {
      if (typeof state.selected === 'number') selected = state.selected
      if (typeof state.progress === 'number') progress = Math.max(0, Math.min(1, state.progress))
      if (typeof state.active === 'boolean') active = state.active
      if (typeof state.paused === 'boolean') paused = state.paused
      wake()
    },
    press(index, held) {
      if (!movement[index]) return
      clearTimeout(movement[index].timer)
      movement[index].target = held ? .135 : 0
      wake()
    },
    pulse(index) {
      if (!movement[index]) return
      this.press(index, true)
      movement[index].timer = window.setTimeout(() => { movement[index].target = 0; wake() }, reduced ? 85 : 125)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      movement.forEach((key) => clearTimeout(key.timer))
      resizeObserver.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotion)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (!lost) release()
    },
  }
}
