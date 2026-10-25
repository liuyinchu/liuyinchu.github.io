import { keyGeometry, baseGeometry, plateGeometry, keyboardLayout, keyboardCamera, keyboardScene, projectedKeys, project, KEY_TRAVEL } from './geometry.js'
import { createCatGeometry } from './cat-geometry.js'

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
uniform float uPress;
uniform float uMaterial;
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
  float specular = pow(max(dot(normal, normalize(lightDirection + viewDirection)), 0.), uMaterial > .5 ? 88. : 42.);
  float rim = pow(1. - max(dot(normal, viewDirection), 0.), 3.);
  float wallShade = mix(.78, 1., smoothstep(.3, .78, vPosition.y - uOffset.y));
  vec3 color = uColor * (.34 + diffuse * .63 + fill * .14) * wallShade;
  color += vec3(.91, .94, 1.) * (specular * .19 + rim * .045);
  if (uMaterial > .5) {
    float brushed = sin(vPosition.x * 420. + sin(vPosition.z * 52.) * .6) * .007;
    color += brushed + specular * .12;
    if (uMaterial < 1.5) {
      float seam = 1. - smoothstep(.002, .014, abs(vPosition.y - .078));
      float trim = smoothstep(.10, .12, vPosition.y) * (1. - smoothstep(.13, .16, vPosition.y));
      color = color * (1. - seam * .62) + trim * vec3(.035, .046, .058);
    }
  } else {
    float crownEdge = smoothstep(.74, .94, max(abs(vUv.x - .5), abs(vUv.y - .5)) * 2.);
    float fineGrain = sin(vPosition.x * 480.) * sin(vPosition.z * 510.) * .003;
    color += fineGrain;
    color += uSelected * vec3(.035, .045, .047) * max(normal.y, .2);
    color += uSelected * crownEdge * vLabel * vec3(.42, .66, .72) * (.20 + uPress * .35);
  }
  if (vLabel > .99) {
    vec2 uv = mix(uAtlasRect.xy, uAtlasRect.zw, clamp(vUv, .002, .998));
    vec4 ink = texture(uAtlas, uv);
    color = mix(color, ink.rgb, ink.a);
  }
  outColor = vec4(color, 1.);
}`

const CAT_VERTEX = `#version 300 es
precision highp float;
in vec3 aPosition; in vec3 aColor; in vec2 aStyle;
uniform mat4 uCatViewProjection;
uniform vec3 uCatOrigin; uniform vec3 uCatRight; uniform vec3 uCatUp; uniform vec3 uCatForward;
uniform float uCatScale; uniform float uCatDpr; uniform float uCatPresentationScale; uniform float uCatMinPointSize;
out vec3 vCatColor; out float vCatAlpha; out float vCatStar; out float vCatDust;
void main() {
 vec3 p=uCatRight*aPosition.x+uCatUp*aPosition.y+uCatForward*aPosition.z;
 vec4 clip=uCatViewProjection*vec4(p*uCatScale+uCatOrigin,1.);
 gl_Position=clip;
 // Settle the unchanged source pose onto the back row: 5.5% of canvas height.
 gl_Position.y-=.11*clip.w;
 float perspective=clamp(18./max(clip.w,.2),.75,1.6);
 float star=step(.975,fract(float(gl_VertexID)*.6180339));
 float desired=aStyle.x*uCatDpr*1.40*perspective*(1.+star*.42)*uCatPresentationScale;
 float raster=max(uCatMinPointSize,min(desired,6.*uCatDpr));
 gl_PointSize=raster;
 // Subpixel dots keep their intended energy when the GPU rasterizes at least one pixel.
 float coverage=min(1.,desired*desired/(raster*raster));
 vCatColor=aColor; vCatAlpha=aStyle.y*coverage;
 vCatDust=1.-smoothstep(.72,.84,aStyle.y); vCatStar=star;
}`
const CAT_FRAGMENT = `#version 300 es
precision highp float;
in vec3 vCatColor; in float vCatAlpha; in float vCatStar; in float vCatDust;
out vec4 outColor;
void main() {
 vec2 p=gl_PointCoord*2.-1.; float r=dot(p,p); if(r>1.) discard;
 float light=exp(-r*4.2)*.50+exp(-r*26.)*1.05;
 float dust=exp(-r*2.4)*.90+exp(-r*22.)*.35;
 light=mix(light,dust,vCatDust);
 light+=vCatStar*(exp(-abs(p.x)*32.)*exp(-p.y*p.y*7.)+exp(-abs(p.y)*32.)*exp(-p.x*p.x*7.))*.18;
 outColor=vec4(vCatColor,light*vCatAlpha);
}`

export function createKeyboardRenderer(canvas, { keys, onReady, onUnavailable, onPositions }) {
  let gl
  try { gl = canvas.getContext('webgl2', { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' }) }
  catch { onUnavailable(); return null }
  if (!gl) { onUnavailable(); return null }
  let program = null
  let texture = null
  let catProgram = null
  let catMeshes = []
  let catLocations = {}
  let catMinPointSize = 1
  let catBody
  const catGeometry = createCatGeometry()
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
  let dpr = 1
  let previousTime = 0
  let observer
  let resizeObserver
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reduced = motionQuery.matches
  const movement = keys.map(() => ({ position: 0, velocity: 0, target: 0, timer: 0 }))
  let layout = keyboardLayout(width, keys.length)
  let centers = layout.centers
  const atlasColumns = 6
  const atlasRows = Math.ceil(keys.length / atlasColumns)
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
    atlas.width = atlasColumns * 256
    atlas.height = atlasRows * 256
    const ctx = atlas.getContext('2d')
    if (!ctx) throw new Error('Canvas text is unavailable')
    ctx.clearRect(0, 0, atlas.width, atlas.height)
    keys.forEach((key, index) => {
      const x = index % atlasColumns * 256
      const y = Math.floor(index / atlasColumns) * 256
      ctx.fillStyle = 'rgba(22, 28, 32, .92)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = '500 82px Arial, sans-serif'
      ctx.fillText(key.shortcut.toUpperCase(), x + 23, y + 49, 85)
      ctx.textAlign = 'center'
      ctx.font = '600 104px Arial, sans-serif'
      ctx.fillText(key.mark, x + 128, y + 159, 223)
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
  function catMesh(data) {
    const vao = gl.createVertexArray(), buffer = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    for (const [name,size,offset] of [['aPosition',3,0],['aColor',3,12],['aStyle',2,24]]) {
      const location=gl.getAttribLocation(catProgram,name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location,size,gl.FLOAT,false,32,offset)
    }
    const result={vao,buffer,count:data.length/8}
    catMeshes.push(result)
    return result
  }
  function initializeCat() {
    let vertex, fragment
    try {
      vertex=shader(gl.VERTEX_SHADER,CAT_VERTEX)
      fragment=shader(gl.FRAGMENT_SHADER,CAT_FRAGMENT)
      catProgram=gl.createProgram()
      gl.attachShader(catProgram,vertex); gl.attachShader(catProgram,fragment)
      gl.linkProgram(catProgram)
      if(!gl.getProgramParameter(catProgram,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(catProgram))
      catLocations=Object.fromEntries(['uCatViewProjection','uCatOrigin','uCatScale','uCatRight','uCatUp','uCatForward','uCatDpr','uCatPresentationScale','uCatMinPointSize'].map((name)=>[name,gl.getUniformLocation(catProgram,name)]))
      catMinPointSize=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[0]
      catBody=catMesh(catGeometry.body)
    } finally {
      if(vertex) gl.deleteShader(vertex)
      if(fragment) gl.deleteShader(fragment)
    }
  }
  function drawCat(matrix,right,up,forward) {
    const scene=keyboardScene(layout)
    gl.useProgram(catProgram)
    gl.uniformMatrix4fv(catLocations.uCatViewProjection,false,matrix)
    gl.uniform3fv(catLocations.uCatOrigin,scene.catOrigin)
    gl.uniform3fv(catLocations.uCatRight,right)
    gl.uniform3fv(catLocations.uCatUp,up)
    gl.uniform3fv(catLocations.uCatForward,forward)
    gl.uniform1f(catLocations.uCatScale,scene.catScale)
    gl.uniform1f(catLocations.uCatDpr,dpr)
    const left=scene.catOrigin.map((n,i)=>n-right[i]*scene.catScale*.5)
    const edge=scene.catOrigin.map((n,i)=>n+right[i]*scene.catScale*.5)
    const frameWidth=Math.abs(project(matrix,...edge)[0]-project(matrix,...left)[0])*width*.5
    // The accepted desktop frame is about 300 CSS px (visible cat about 280).
    // Source-pixel radii must shrink with the presentation, never grow on desktop.
    gl.uniform1f(catLocations.uCatPresentationScale,Math.min(1,frameWidth/240))
    gl.uniform1f(catLocations.uCatMinPointSize,catMinPointSize)
    gl.depthMask(false)
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE,gl.ONE,gl.ONE_MINUS_SRC_ALPHA)
    gl.bindVertexArray(catBody.vao)
    gl.drawArrays(gl.POINTS,0,catBody.count)
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(true)
  }
  function release() {
    meshes.forEach(({ vao, buffer }) => { gl.deleteVertexArray(vao); gl.deleteBuffer(buffer) })
    meshes = []
    catMeshes.forEach(({vao,buffer})=>{gl.deleteVertexArray(vao);gl.deleteBuffer(buffer)})
    catMeshes=[]
    if(catProgram) gl.deleteProgram(catProgram)
    catProgram=null
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
      locations = Object.fromEntries(['uViewProjection', 'uOffset', 'uScale', 'uColor', 'uEye', 'uSelected', 'uPress', 'uMaterial', 'uKind', 'uAtlasRect', 'uAtlas'].map((name) => [name, gl.getUniformLocation(program, name)]))
      keyMesh = mesh(keyGeometry())
      baseMesh = mesh(baseGeometry(layout.width, layout.depth))
      plateMesh = mesh(plateGeometry(layout.width, layout.depth))
      planeMesh = mesh(new Float32Array([
        -1, 0, -1, 0, 1, 0, 0, 1, 0, 1, 0, -1, 0, 1, 0, 1, 1, 0, -1, 0, 1, 0, 1, 0, 0, 0, 0,
        -1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
      ]))
      labelAtlas()
      initializeCat()
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
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
  function drawMesh(object, offset, color, { scale = [1, 1, 1], kind = 0, highlight = 0, depression = 0, material = 0, index = 0 } = {}) {
    gl.uniform3fv(locations.uOffset, offset)
    gl.uniform3fv(locations.uScale, scale)
    gl.uniform3fv(locations.uColor, color)
    gl.uniform1f(locations.uKind, kind)
    gl.uniform1f(locations.uSelected, highlight)
    gl.uniform1f(locations.uPress, depression)
    gl.uniform1f(locations.uMaterial, material)
    const column = index % atlasColumns
    const row = Math.floor(index / atlasColumns)
    gl.uniform4f(locations.uAtlasRect, column / atlasColumns, 1 - (row + 1) / atlasRows, (column + 1) / atlasColumns, 1 - row / atlasRows)
    gl.bindVertexArray(object.vao)
    gl.drawArrays(gl.TRIANGLES, 0, object.count)
  }
  function render(time = performance.now()) {
    frame = 0
    if (disposed || lost || !visible || !inViewport) return
    const dt = Math.min((time - previousTime) / 1000 || .016, .033)
    previousTime = time
    const animate = active && !paused && !reduced
    if (!paused) currentProgress += (progress - currentProgress) * (animate ? Math.min(1, dt * 9) : 1)
    let moving = Math.abs(progress - currentProgress) > .0003
    movement.forEach((key) => {
      if (animate) {
        const steps = Math.ceil(dt / .012)
        const step = dt / steps
        for (let i = 0; i < steps; i++) {
          const stiffness = key.target ? 850 : 600
          const damping = key.target ? 44 : 31
          key.velocity += ((key.target - key.position) * stiffness - key.velocity * damping) * step
          key.position += key.velocity * step
        }
        moving ||= Math.abs(key.position-key.target)>.00015 || Math.abs(key.velocity)>.001
      } else if (!paused) { key.position = key.target; key.velocity = 0 }
    })
    const { matrix, eye, right, up, forward } = keyboardCamera(width, height, layout, currentProgress, reduced)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.uniformMatrix4fv(locations.uViewProjection, false, matrix)
    gl.uniform3fv(locations.uEye, eye)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(locations.uAtlas, 0)
    gl.depthMask(false)
    drawMesh(planeMesh, [0, -.52, .14], [0, 0, 0], { scale: [layout.width * .66, 1, layout.depth * .68], kind: 1 })
    gl.depthMask(true)
    drawMesh(baseMesh, [0, 0, 0], [.12, .145, .18], { material: 1 })
    drawMesh(plateMesh, [0, 0, 0], [.055, .069, .086], { material: 2 })
    gl.depthMask(false)
    centers.forEach(([x, , z]) => drawMesh(planeMesh, [x, .281, z], [0, 0, 0], { scale: [.65, 1, .63], kind: 2 }))
    gl.depthMask(true)
    centers.forEach(([x, , z], index) => drawMesh(keyMesh, [x, -movement[index].position, z], colors[index], { index, highlight: index === selected ? 1 : 0, depression: movement[index].position / KEY_TRAVEL }))
    drawCat(matrix,right,up,forward)
    onPositions(projectedKeys(matrix, layout))
    if (!ready) {
      if (gl.getError() !== gl.NO_ERROR) { release(); lost = true; onUnavailable(); return }
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
    const nextLayout = keyboardLayout(width, keys.length)
    if (nextLayout.columns !== layout.columns) {
      layout = nextLayout
      centers = layout.centers
      if (!lost) {
        gl.bindBuffer(gl.ARRAY_BUFFER, baseMesh.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, baseGeometry(layout.width, layout.depth), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, plateMesh.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, plateGeometry(layout.width, layout.depth), gl.STATIC_DRAW)
      }
    }
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1600000 / (width * height)))
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
    catMeshes = []
    catProgram = null
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
      movement[index].target = held ? KEY_TRAVEL : 0
      wake()
    },
    pulse(index) {
      if (!movement[index]) return
      this.press(index, true)
      movement[index].timer = window.setTimeout(() => { movement[index].target = 0; wake() }, reduced ? 85 : 145)
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
