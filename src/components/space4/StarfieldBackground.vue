<script setup>
// 星野背景：多层视差星星 + 闪烁 + 流星，纯 Canvas 手写实现，零依赖。
// 画布固定在视口内，并受像素预算与页面可见性约束，避免长页面和 4K 屏创建超大缓冲区。
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)

let ctx = null
let rafId = 0
let W = 0
let H = 0
let stars = []
let meteors = []
let lastT = 0
let nextMeteorAt = 0
// 鼠标视差（缓动跟随）
let mx = 0
let my = 0
let tmx = 0
let tmy = 0

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function buildStars() {
  const count = Math.min(520, Math.max(150, Math.floor((W * H) / 9000)))
  stars = []
  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    const layer = roll < 0.5 ? 0.25 : roll < 0.85 ? 0.55 : 1
    const colorRoll = Math.random()
    const hue = colorRoll < 0.78 ? 222 + Math.random() * 14 : colorRoll < 0.9 ? 268 : 44
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.25 + layer * (0.5 + Math.random() * 1.0),
      layer,
      tw: Math.random() * Math.PI * 2,
      twS: 0.5 + Math.random() * 1.6,
      hue,
      sat: hue === 44 ? 70 : 45,
      light: hue === 44 ? 78 : 88,
    })
  }
}

function drawStar(s, t) {
  const twinkle = reduced ? 0.85 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw + t * s.twS))
  const px = (s.x + mx * 26 * s.layer + W) % W
  const py = (s.y + my * 14 * s.layer + H) % H
  ctx.beginPath()
  ctx.arc(px, py, s.r, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${(twinkle * 0.95).toFixed(3)})`
  ctx.fill()
  if (s.layer === 1 && s.r > 1.15) {
    ctx.beginPath()
    ctx.arc(px, py, s.r * 2.6, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${(twinkle * 0.1).toFixed(3)})`
    ctx.fill()
  }
}

function drawStatic() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  for (const s of stars) drawStar(s, 0)
}

function spawnMeteor(now) {
  const speed = 320 + Math.random() * 260
  meteors.push({
    x: W * (0.35 + Math.random() * 0.75),
    y: Math.random() < 0.5 ? -30 : Math.random() * H * 0.3,
    vx: -(speed * (0.72 + Math.random() * 0.18)),
    vy: speed * (0.42 + Math.random() * 0.25),
    born: now,
    life: 0.75 + Math.random() * 0.5,
  })
}

function drawMeteors(now, dt) {
  if (now >= nextMeteorAt && meteors.length < 2) {
    spawnMeteor(now)
    nextMeteorAt = now + 2600 + Math.random() * 4200
  }
  meteors = meteors.filter((m) => now - m.born < m.life * 1000 && m.x > -220 && m.y < H + 220)
  for (const m of meteors) {
    m.x += m.vx * dt
    m.y += m.vy * dt
    const age = (now - m.born) / 1000
    const fade = Math.sin(Math.min(age / m.life, 1) * Math.PI)
    const len = 120
    const norm = Math.hypot(m.vx, m.vy) || 1
    const nx = m.vx / norm
    const ny = m.vy / norm
    const grad = ctx.createLinearGradient(m.x, m.y, m.x - nx * len, m.y - ny * len)
    grad.addColorStop(0, `rgba(255, 255, 255, ${(0.85 * fade).toFixed(3)})`)
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(m.x - nx * len, m.y - ny * len)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(m.x, m.y, 1.7, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 * fade).toFixed(3)})`
    ctx.fill()
  }
}

function loop(now) {
  rafId = 0
  if (document.hidden) return
  const dt = Math.min((now - lastT) / 1000 || 0, 0.05)
  lastT = now
  mx += (tmx - mx) * 0.04
  my += (tmy - my) * 0.04
  ctx.clearRect(0, 0, W, H)
  for (const s of stars) {
    s.y -= s.layer * 2.2 * dt // 极慢的上浮漂移
    if (s.y < -4) s.y = H + 4
    drawStar(s, now / 1000)
  }
  drawMeteors(now, dt)
  rafId = requestAnimationFrame(loop)
}

function startLoop() {
  if (reduced || rafId || document.hidden) return
  rafId = requestAnimationFrame((time) => {
    lastT = time
    loop(time)
  })
}

function stopLoop() {
  cancelAnimationFrame(rafId)
  rafId = 0
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  W = Math.max(window.innerWidth, 1)
  H = Math.max(window.innerHeight, 1)
  const requestedDpr = Math.min(window.devicePixelRatio || 1, 2)
  const pixelBudgetDpr = Math.sqrt(8_000_000 / (W * H))
  const dpr = Math.max(0.75, Math.min(requestedDpr, pixelBudgetDpr))
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildStars()
  if (reduced) drawStatic()
}

function onMouseMove(e) {
  tmx = (e.clientX / window.innerWidth - 0.5) * 2
  tmy = (e.clientY / window.innerHeight - 0.5) * 2
}

function onVisibilityChange() {
  if (document.hidden) {
    stopLoop()
  } else if (reduced) {
    drawStatic()
  } else {
    startLoop()
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (!reduced) {
    nextMeteorAt = performance.now() + 1800
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    startLoop()
  }
})

onBeforeUnmount(() => {
  stopLoop()
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <canvas ref="canvasRef" class="s4-stars" aria-hidden="true"></canvas>
</template>

<style scoped>
.s4-stars {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100dvh;
  pointer-events: none;
}
</style>
