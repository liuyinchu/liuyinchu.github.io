import { createParticles } from './shapes.js'
import { projectAboutAnchors, getAboutCatMapping } from './about-shapes.js'

const VERTEX = `#version 300 es
precision highp float;
in vec3 aSix;
in vec3 aArrow;
in vec3 aKnot;
in vec3 aScatter;
in vec4 aStyle;
in vec3 aEmoji;
in vec3 aField;
in vec3 aEnding;
in float aNode;
in vec4 aDetails;
in vec4 aCatStyle;
in float aCatSize;
uniform float uProgress;
uniform float uProfile;
uniform float uActiveNode;
uniform float uTime;
uniform float uReplay;
uniform float uDpr;
uniform vec2 uResolution;
uniform vec2 uRotation;
uniform vec2 uHover;
uniform float uMotion;
uniform vec2 uCatOrigin;
uniform vec2 uCatAxisX;
uniform vec2 uCatAxisY;
uniform float uCatScale;
out vec3 vColor;
out float vAlpha;
out float vHero;
out float vSeed;
out float vCatWeight;

mat3 rotationX(float a) {
  float c=cos(a), s=sin(a);
  return mat3(1.,0.,0., 0.,c,s, 0.,-s,c);
}
mat3 rotationY(float a) {
  float c=cos(a), s=sin(a);
  return mat3(c,0.,-s, 0.,1.,0., s,0.,c);
}

void screenView(out float scene,out vec2 offset) {
  scene=min(uResolution.y*.458,uResolution.x*(uProfile>.5?.45:.565));
  offset=vec2(0.);
  if(uProfile>.5) {
    float contents=1.-smoothstep(.04,.14,abs(uProgress-.6));
    float ending=smoothstep(.8,1.,uProgress);
    float expression=1.-smoothstep(.04,.12,abs(uProgress-.2));
    float pointer=1.-smoothstep(.04,.12,abs(uProgress-.4));
    float desktop=smoothstep(700.,1000.,uResolution.x);
    float mobile=1.-desktop;
    scene*=1.-mobile*(.12*contents+.32*ending+.08*expression+.40*pointer)-desktop*(.12*ending+.22*expression+.12*pointer);
    offset=vec2(uResolution.x*desktop*(.16*contents+.18*expression-.17*pointer-.18*ending),
      uResolution.y*mobile*(.07*contents+.036*ending+.06*expression));
  }
}
vec3 catFieldTarget(vec3 point,float seed,mat3 viewRotation,float scene,vec2 offset) {
  vec2 uv=vec2(point.x+.5,289./457.-point.y);
  vec2 pixel=uCatOrigin+uCatAxisX*uv.x+uCatAxisY*uv.y;
  vec3 camera=vec3((pixel.x-uResolution.x*.5+offset.x)/scene,
    (uResolution.y*.5-pixel.y-offset.y)/scene,point.z);
  camera.xy*=(3.8-point.z)/3.8;
  vec3 target=transpose(viewRotation)*camera;
  float breathe=sin(uTime*.19+seed*.025)*.007*uMotion;
  target.xy-=vec2(cos(seed),sin(seed))*breathe;
  target.z-=sin(uTime*.10+seed*.021)*.004*uMotion*smoothstep(.8,1.,uProgress);
  return target;
}
void main() {
  float seed = float(gl_VertexID) * 1.61803398875;
  float scene; vec2 viewOffset;
  screenView(scene,viewOffset);
  mat3 viewRotation=rotationX(uRotation.x+uHover.y+sin(uTime*.12)*.024*uMotion)*
    rotationY(uRotation.y+uHover.x+sin(uTime*.09)*.032*uMotion);
  vec3 fieldPosition=aField;
  if(uProfile>.5 && uProgress>=.6 && aStyle.w>.2) fieldPosition=catFieldTarget(aField,seed,viewRotation,scene,viewOffset);
  float section = clamp(uProgress,0.,1.)*4.;
  float t = smoothstep(0.,1.,fract(section));
  vec3 p;
  float dispersed;
  if(uProfile>.5) {
    section=clamp(uProgress,0.,1.)*5.;
    float segment=min(4.,floor(section));
    t=smoothstep(.18,.82,section-segment);
    if(section<1.) p=mix(aSix,aEmoji,t);
    else if(section<2.) p=mix(aEmoji,aArrow,t);
    else if(section<3.) p=mix(aArrow,aKnot,t);
    else if(section<4.) p=mix(aKnot,fieldPosition,t);
    else p=mix(fieldPosition,aEnding,t);
    p=mix(p,aScatter,sin(t*3.14159265)*(section<4.?.72:.12));
    dispersed=sin(t*3.14159265)*.6;
  } else {
    if(section<1.) { p=mix(aSix,aScatter,t); dispersed=t; }
    else if(section<2.) { p=mix(aScatter,aArrow,t); dispersed=1.-t; }
    else if(section<3.) { p=mix(aArrow,aScatter,t); dispersed=t; }
    else { t=smoothstep(0.,1.,section-3.); p=mix(aScatter,aKnot,t); dispersed=1.-t; }
  }
  float flight = sin(t*3.14159265);
  float catWeight=uProfile>.5?(section<3.?0.:section<4.?t:1.-t):0.;
  float endingWeight=uProfile>.5?smoothstep(.8,1.,uProgress):0.;
  float expressionWeight=uProfile>.5?1.-smoothstep(.04,.12,abs(uProgress-.2)):0.;
  float pointerWeight=uProfile>.5?1.-smoothstep(.04,.12,abs(uProgress-.4)):0.;
  if(aStyle.w>.2) {
    // Curved travel rather than a flat crossfade; the same stars survive every form.
    float angle=flight*.38*sin(seed*.17);
    p.xy=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*p.xy;
    p.z+=flight*sin(seed*.31)*.55;
    p=mix(p,aScatter,uReplay);
    dispersed=max(dispersed,uReplay);
    float breathe=sin(uTime*.19+seed*.025)*.007*uMotion;
    p.xy+=vec2(cos(seed),sin(seed))*breathe;
    p.z+=sin(uTime*.10+seed*.021)*.004*uMotion*endingWeight;
    p=viewRotation*p;
  }
  // Rotation can carry scattered stars behind the camera. Clip the near plane
  // before projection so those stars cannot reappear as mirrored points.
  float cameraDepth=3.8-p.z;
  float perspective=3.8/max(cameraDepth,.25);
  float contentWeight=1.-smoothstep(.04,.14,abs(uProgress-.6));
  vec2 screen=p.xy*scene*perspective;
  screen.x-=viewOffset.x;
  screen.y+=viewOffset.y;
  gl_Position=vec4(screen/uResolution*2.,cameraDepth<=.25?2.:0.,1.);
  float mobileScale=clamp(uResolution.x/720.,.64,1.);
  float nucleusScale=1.;
  if(uProfile<.5 && section<1. && aStyle.w>.8) {
    nucleusScale+=.8*(1.-smoothstep(.035,.15,length(aSix.xy-vec2(.035,-.30))))*(1.-dispersed);
  }
  gl_PointSize=max(1.,aStyle.x*uDpr*perspective*mobileScale*nucleusScale);
  vec3 cold=vec3(.52,.77,1.);
  vec3 neutral=vec3(.93,.97,1.);
  vec3 warm=vec3(1.,.75,.53);
  vColor=aStyle.z<.65?mix(cold,neutral,aStyle.z/.65):mix(neutral,warm,(aStyle.z-.65)/.35);
  float twinkle=1.+sin(uTime*(.32+fract(seed)*.31)+seed)*.16*uMotion;
  float centerGlow=1.;
  if(uProfile<.5 && section<1. && aStyle.w>.2) centerGlow+=exp(-length(aSix.xy-vec2(.035,-.30))*7.)*1.30*(1.-dispersed);
  vAlpha=aStyle.y*twinkle*mix(1.,.30,dispersed)*centerGlow;
  if(uProfile>.5 && uActiveNode>0.) {
    float selected=1.-step(.1,abs(aNode-uActiveNode));
    gl_PointSize*=1.+selected*contentWeight*.45;
    vColor=mix(vColor,vec3(1.,.82,.54),selected*contentWeight);
    vAlpha*=mix(1.,mix(.45,1.7,selected),contentWeight);
  }
  if(endingWeight>0.) {
    float hero=step(.8,aStyle.w);
    float dust=step(.2,aStyle.w)*(1.-hero);
    float edge=step(3.2,abs(mod(float(gl_VertexID),9.)-4.))*dust;
    float layer=mix(.88,1.10,smoothstep(-.5,.5,p.z));
    float dustSize=1.+dust*(.10+edge*.12);
    float dustGlow=1.+dust*((1.55+edge*.25)*layer-1.);
    float brightKnot=hero*(1.-step(.5,mod(float(gl_VertexID),11.)));
    gl_PointSize*=mix(1.,mix(dustSize,.48,hero)+brightKnot*.90,endingWeight);
    vAlpha*=mix(1.,mix(dustGlow,.42,hero)+brightKnot*1.15,endingWeight);
    vColor=mix(vColor,vec3(.88,.94,1.),dust*endingWeight*(.18+edge*.18));
    vColor=mix(vColor,vec3(.96,.83,.62),brightKnot*endingWeight*.85);
  }
  if(expressionWeight>0. && aStyle.w>.2) {
    float feature=aDetails.x;
    vec3 expressionColor=feature>5.5?vec3(.62,.67,.72):feature<1.5?vec3(.82,.64,.30):feature<2.5?vec3(1.,.88,.58):feature<3.5?vec3(1.,.96,.82):vec3(1.,.99,.94);
    float expressionAlpha=feature>5.5?.70:feature<1.5?.24:feature<2.5?1.10:feature<3.5?1.:1.35;
    float expressionSize=(feature>5.5?2.2:feature<1.5?1.65:feature<2.5?2.4:feature<3.5?2.55:2.75)*uDpr*perspective;
    vColor=mix(vColor,expressionColor,expressionWeight);
    vAlpha=mix(vAlpha,expressionAlpha,expressionWeight);
    gl_PointSize=mix(gl_PointSize,max(1.,expressionSize),expressionWeight);
  }
  if(pointerWeight>0. && aStyle.w>.2) {
    float temperature=aDetails.w;
    vec3 cursorColor=temperature<.65?mix(cold,neutral,temperature/.65):mix(neutral,warm,(temperature-.65)/.35);
    vColor=mix(vColor,cursorColor,pointerWeight);
    vAlpha=mix(vAlpha,aDetails.z*twinkle*mix(1.,.30,dispersed),pointerWeight);
    gl_PointSize=mix(gl_PointSize,max(1.,aDetails.y*uDpr*perspective*mobileScale),pointerWeight);
  }
  vHero=step(.8,aStyle.w)*(1.-expressionWeight)
    +expressionWeight*step(.2,aStyle.w)*(aDetails.x>5.5?.12:aDetails.x>=4.?.45:aDetails.x<1.5?.08:.22);
  if(catWeight>0. && aStyle.w>.2) {
    vColor=mix(vColor,aCatStyle.rgb,catWeight);
    float colored=step(.10,aCatStyle.r-aCatStyle.g);
    vAlpha=mix(vAlpha,min(1.,aCatStyle.a*mix(1.20,1.,colored)),catWeight);
    gl_PointSize=mix(gl_PointSize,max(1.,aCatSize*uCatScale*mix(1.65,1.30,colored)),catWeight);
    vHero=mix(vHero,0.,catWeight);
  }
  vCatWeight=catWeight*step(.2,aStyle.w);
  vSeed=seed;
}`

const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
in float vHero;
in float vSeed;
in float vCatWeight;
out vec4 outColor;
void main() {
  vec2 p=gl_PointCoord*2.-1.;
  float r2=dot(p,p);
  if(r2>1.) discard;
  float dust=exp(-r2*5.8)*.65;
  float halo=exp(-r2*4.1)*.23+exp(-r2*13.)*.28;
  float core=exp(-r2*72.)*.94;
  float flare=(exp(-abs(p.x)*90.)*exp(-p.y*p.y*9.)
    +exp(-abs(p.y)*90.)*exp(-p.x*p.x*9.))*.13;
  flare*=step(.71,fract(vSeed*.73));
  float intensity=mix(dust,halo+core+flare,vHero);
  if(vCatWeight>0.) {
    float catDust=exp(-r2*3.4)*.82+exp(-r2*32.)*.42;
    intensity=mix(intensity,catDust,vCatWeight);
  }
  outColor=vec4(vColor,intensity*vAlpha);
}`


const BACKGROUND_VERTEX = `#version 300 es
void main() {
  vec2 position=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
  gl_Position=vec4(position*2.-1.,0.,1.);
}`
const BACKGROUND_FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uBackgroundResolution;
out vec4 outColor;
void main() {
  vec2 uv=gl_FragCoord.xy/uBackgroundResolution;
  vec2 p=(uv-.5)*vec2(1.1,.9);
  float edge=1.-exp(-dot(p,p)*4.0);
  float upperLeft=exp(-dot((uv-vec2(-.12,1.08))*vec2(1.2,1.0),(uv-vec2(-.12,1.08))*vec2(1.2,1.0))*2.1);
  float haze=clamp(edge*.8+upperLeft*.24,0.,1.);
  outColor=vec4(vec3(.008,.020,.027)+haze*vec3(.017,.030,.052),1.);
}`

export function createStellarRenderer(canvas, { profile = 'stellar', onReady, onUnavailable, onAnchors = () => {} }) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' })
  if (!gl) {
    onUnavailable()
    return null
  }

  const particles = createParticles(profile)
  const aboutProfile = profile === 'about'
  let program = null
  let backgroundProgram = null
  let backgroundResolution = null
  let vao = null
  let buffers = []
  let locations = null
  let disposed = false
  let lost = false
  let raf = 0
  let pageVisible = !document.hidden
  let inViewport = true
  let paused = false
  let interactive = true
  let reduced = false
  let activeNode = 0
  let catFrame = null
  let lastAnchorTime = -Infinity
  let targetProgress = 0
  let progress = 0
  let replayStart = -1
  let replayValue = 0
  let replayGatherOnly = false
  let time = 0
  let lastFrame = 0
  let width = 1
  let height = 1
  let dpr = 1
  let rotationX = 0
  let rotationY = 0
  let velocityX = 0
  let velocityY = 0
  let hoverX = 0
  let hoverY = 0
  let targetHoverX = 0
  let targetHoverY = 0
  let resetPending = false
  let pointer = null
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced = motionQuery.matches
  if (!reduced) {
    replayStart = performance.now()
    replayValue = 1
    replayGatherOnly = true
  }

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

  function release() {
    for (const buffer of buffers) gl.deleteBuffer(buffer)
    buffers = []
    if (vao) gl.deleteVertexArray(vao)
    if (program) gl.deleteProgram(program)
    if (backgroundProgram) gl.deleteProgram(backgroundProgram)
    backgroundProgram = null
    vao = program = null
  }

  function initialize() {
    let vertex
    let fragment
    let backgroundVertex
    let backgroundFragment
    try {
      vertex = shader(gl.VERTEX_SHADER, VERTEX)
      fragment = shader(gl.FRAGMENT_SHADER, FRAGMENT)
      program = gl.createProgram()
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
      vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      const attributes = [
        ['aSix', particles.six, 3], ['aArrow', particles.arrow, 3],
        ['aKnot', particles.knot, 3], ['aScatter', particles.scatter, 3],
        ['aStyle', particles.style, 4],
      ]
      if (aboutProfile) attributes.push(['aEmoji', particles.emoji, 3], ['aField', particles.field, 3], ['aEnding', particles.ending, 3], ['aNode', particles.nodeGroup, 1], ['aDetails', particles.details, 4], ['aCatStyle', particles.catStyle, 4], ['aCatSize', particles.catSize, 1])
      else {
        for (const name of ['aEmoji', 'aField', 'aEnding', 'aNode', 'aDetails', 'aCatStyle', 'aCatSize']) {
          const attribute = gl.getAttribLocation(program, name)
          gl.disableVertexAttribArray(attribute)
          gl.vertexAttrib1f(attribute, 0)
        }
      }
      for (const [name, values, size] of attributes) {
        const buffer = gl.createBuffer()
        buffers.push(buffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW)
        const attribute = gl.getAttribLocation(program, name)
        gl.enableVertexAttribArray(attribute)
        gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0)
      }
      locations = {}
      for (const name of ['Progress', 'Profile', 'ActiveNode', 'Time', 'Replay', 'Dpr', 'Resolution', 'Rotation', 'Hover', 'Motion', 'CatOrigin', 'CatAxisX', 'CatAxisY', 'CatScale']) {
        locations[name] = gl.getUniformLocation(program, 'u' + name)
      }
      backgroundVertex = shader(gl.VERTEX_SHADER, BACKGROUND_VERTEX)
      backgroundFragment = shader(gl.FRAGMENT_SHADER, BACKGROUND_FRAGMENT)
      backgroundProgram = gl.createProgram()
      gl.attachShader(backgroundProgram, backgroundVertex)
      gl.attachShader(backgroundProgram, backgroundFragment)
      gl.linkProgram(backgroundProgram)
      if (!gl.getProgramParameter(backgroundProgram, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(backgroundProgram))
      backgroundResolution = gl.getUniformLocation(backgroundProgram, 'uBackgroundResolution')
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      gl.disable(gl.DEPTH_TEST)
      gl.clearColor(0.0118, 0.0353, 0.0510, 1)
      onReady()
      resize()
    } catch (error) {
      release()
      onUnavailable()
      console.warn('Stellar field could not initialize:', error.message)
    } finally {
      if (vertex) gl.deleteShader(vertex)
      if (fragment) gl.deleteShader(fragment)
      if (backgroundVertex) gl.deleteShader(backgroundVertex)
      if (backgroundFragment) gl.deleteShader(backgroundFragment)
    }
  }

  function schedule() {
    if (!disposed && !lost && program && !raf && pageVisible && inViewport) {
      raf = requestAnimationFrame(frame)
    }
  }

  function frame(timestamp) {
    raf = 0
    if (disposed || lost || !program || !pageVisible || !inViewport) return
    const dt = Math.min((timestamp - (lastFrame || timestamp)) / 1000, 0.05)
    lastFrame = timestamp
    if (!paused && !reduced) time += dt
    const smoothing = 1 - Math.exp(-dt * 8)
    progress += (targetProgress - progress) * (reduced ? 1 : smoothing)
    if (Math.abs(targetProgress - progress) < .0001) progress = targetProgress
    hoverX += (targetHoverX - hoverX) * smoothing
    hoverY += (targetHoverY - hoverY) * smoothing
    if (resetPending) {
      rotationX *= 1 - smoothing
      rotationY *= 1 - smoothing
      if (Math.abs(rotationX) + Math.abs(rotationY) < .001) {
        rotationX = rotationY = 0
        resetPending = false
      }
    } else if (!pointer && !paused && !reduced) {
      rotationX = Math.max(-.78, Math.min(.78, rotationX + velocityX * dt))
      rotationY += velocityY * dt
      velocityX *= Math.exp(-dt * 4.5)
      velocityY *= Math.exp(-dt * 4.5)
    }
    if (replayStart >= 0) {
      const elapsed = (timestamp - replayStart) / 1000 + (replayGatherOnly ? .24 : 0)
      if (reduced) replayValue = 0
      else if (elapsed < .24) replayValue = elapsed / .24
      else {
        const t = Math.min(1, (elapsed - .24) / 1.8)
        replayValue = 1 - t * t * (3 - 2 * t)
      }
      if (elapsed >= 2.04 || reduced) { replayStart = -1; replayValue = 0 }
    }
    const canvasRect = aboutProfile ? canvas.getBoundingClientRect() : null
    const catMapping = aboutProfile ? getAboutCatMapping(catFrame, canvasRect, width, height) : null
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindVertexArray(vao)
    gl.disable(gl.BLEND)
    gl.useProgram(backgroundProgram)
    gl.uniform2f(backgroundResolution, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.enable(gl.BLEND)
    gl.useProgram(program)
    gl.uniform1f(locations.Progress, progress)
    gl.uniform1f(locations.Profile, aboutProfile ? 1 : 0)
    gl.uniform1f(locations.ActiveNode, activeNode)
    gl.uniform1f(locations.Time, time)
    gl.uniform1f(locations.Replay, replayValue)
    gl.uniform1f(locations.Dpr, dpr)
    gl.uniform2f(locations.Resolution, width, height)
    gl.uniform2f(locations.Rotation, rotationX, rotationY)
    gl.uniform2f(locations.Hover, hoverX, hoverY)
    gl.uniform1f(locations.Motion, paused || reduced ? 0 : 1)
    if (catMapping) {
      gl.uniform2fv(locations.CatOrigin, catMapping.origin)
      gl.uniform2fv(locations.CatAxisX, catMapping.axisX)
      gl.uniform2fv(locations.CatAxisY, catMapping.axisY)
      gl.uniform1f(locations.CatScale, Math.hypot(...catMapping.source.axisX) / 457 * canvas.width / Math.max(1, canvasRect.width))
    }
    gl.drawArrays(gl.POINTS, 0, particles.count)
    const continuing = (!paused && !reduced) || replayStart >= 0 || resetPending || progress !== targetProgress ||
      Math.abs(hoverX - targetHoverX) + Math.abs(hoverY - targetHoverY) > .0001
    if (aboutProfile && (timestamp - lastAnchorTime >= 1000 / 30 || !continuing)) {
      lastAnchorTime = timestamp
      onAnchors(projectAboutAnchors(particles, { progress, replay: replayValue, rotationX, rotationY, hoverX, hoverY, time, motion: paused || reduced ? 0 : 1, width, height, catFrame, canvasRect }))
    }
    if (continuing) schedule()
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    dpr = Math.min(window.devicePixelRatio || 1, 1.8, Math.sqrt(3600000 / (width * height)))
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    schedule()
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    lastFrame = 0
  }
  function visibility() {
    pageVisible = !document.hidden
    if (!pageVisible) stop()
    else schedule()
  }
  function motionChange(event) {
    reduced = event.matches
    velocityX = velocityY = 0
    schedule()
  }
  function pointerDown(event) {
    if (!interactive || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, at: performance.now(), captured: event.pointerType !== 'touch' }
    if (pointer.captured) canvas.setPointerCapture(event.pointerId)
    velocityX = velocityY = 0
    resetPending = false
    canvas.dataset.dragging = pointer.captured ? 'true' : 'false'
    if (event.pointerType === 'mouse') canvas.focus({ preventScroll: true })
  }
  function pointerMove(event) {
    if (!interactive) return
    if (!pointer) {
      if (event.pointerType === 'mouse') {
        const rect = canvas.getBoundingClientRect()
        targetHoverX = ((event.clientX - rect.left) / width - .5) * .065
        targetHoverY = ((event.clientY - rect.top) / height - .5) * .045
        schedule()
      }
      return
    }
    if (pointer.id !== event.pointerId) return
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    if (!pointer.captured) {
      const totalX = Math.abs(event.clientX - pointer.startX)
      const totalY = Math.abs(event.clientY - pointer.startY)
      if (totalY > totalX && totalY > 7) { pointer = null; return }
      if (totalX < 7) return
      pointer.captured = true
      canvas.setPointerCapture(event.pointerId)
      canvas.dataset.dragging = 'true'
    }
    const now = performance.now()
    const elapsed = Math.max(8, now - pointer.at) / 1000
    const changeY = dx * .0035
    const changeX = dy * .0030
    rotationY += changeY
    rotationX = Math.max(-.78, Math.min(.78, rotationX + changeX))
    velocityX = velocityX * .55 + (changeX / elapsed) * .45
    velocityY = velocityY * .55 + (changeY / elapsed) * .45
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.at = now
    schedule()
  }
  function pointerUp(event) {
    if (!pointer || event.pointerId !== pointer.id) return
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    pointer = null
    canvas.dataset.dragging = 'false'
    schedule()
  }
  function pointerLeave() {
    targetHoverX = targetHoverY = 0
    schedule()
  }
  function resetView() {
    velocityX = velocityY = 0
    targetHoverX = targetHoverY = 0
    resetPending = true
    if (reduced) { rotationX = rotationY = 0; resetPending = false }
    schedule()
  }
  function keydown(event) {
    if (!interactive) return
    const changes = { ArrowLeft: [0, -.12], ArrowRight: [0, .12], ArrowUp: [-.1, 0], ArrowDown: [.1, 0] }
    if (event.key === 'Home') { event.preventDefault(); resetView(); return }
    const change = changes[event.key]
    if (!change) return
    event.preventDefault()
    resetPending = false
    velocityX = velocityY = 0
    rotationX = Math.max(-.78, Math.min(.78, rotationX + change[0]))
    rotationY += change[1]
    schedule()
  }
  function contextLost(event) {
    event.preventDefault()
    lost = true
    stop()
    onUnavailable()
  }
  function contextRestored() {
    if (disposed) return
    lost = false
    buffers = []
    program = vao = backgroundProgram = null
    initialize()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting
    if (inViewport) schedule()
    else stop()
  }, { threshold: 0 })
  intersectionObserver.observe(canvas)
  const listeners = [
    [canvas, 'pointerdown', pointerDown], [canvas, 'pointermove', pointerMove],
    [canvas, 'pointerup', pointerUp], [canvas, 'pointercancel', pointerUp],
    [canvas, 'lostpointercapture', pointerUp], [canvas, 'pointerleave', pointerLeave],
    [canvas, 'keydown', keydown], [canvas, 'webglcontextlost', contextLost],
    [canvas, 'webglcontextrestored', contextRestored], [document, 'visibilitychange', visibility],
  ]
  for (const [target, event, callback] of listeners) target.addEventListener(event, callback)
  motionQuery.addEventListener('change', motionChange)
  initialize()

  return {
    update(options) {
      targetProgress = Math.max(0, Math.min(1, Number(options.progress) || 0))
      activeNode = ['notes', 'talk', 'resources', 'projects'].indexOf(options.activeNode) + 1
      catFrame = options.catFrame
      paused = options.paused
      interactive = options.interactive
      if (!interactive) {
        if (pointer && canvas.hasPointerCapture(pointer.id)) canvas.releasePointerCapture(pointer.id)
        pointer = null
        targetHoverX = targetHoverY = velocityX = velocityY = 0
        canvas.dataset.dragging = 'false'
      }
      schedule()
    },
    replay() {
      replayGatherOnly = false
      replayStart = performance.now()
      replayValue = 0
      schedule()
    },
    resetView,
    destroy() {
      disposed = true
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      for (const [target, event, callback] of listeners) target.removeEventListener(event, callback)
      motionQuery.removeEventListener('change', motionChange)
      release()
    },
  }
}
