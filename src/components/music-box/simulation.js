import { BOARD_WIDTH, BOARD_HEIGHT } from './presets.js'

const BALL_RADIUS = 7
const GRAVITY = 780
const FIXED_STEP = 1 / 240
const MAX_BALLS = 24
const MAX_AGE = 22
const CIRCLE_RADIUS = { bell: 22, drum: 26 }

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function createSimulation({ parts: initialParts = [], onHit = () => {} } = {}) {
  let parts = initialParts
  let balls = []
  let nextId = 1
  let accumulator = 0
  let elapsed = 0

  function contact(ball, part, nearestX, nearestY, radius, restitution) {
    const dx = ball.x - nearestX
    const dy = ball.y - nearestY
    const distance = Math.hypot(dx, dy)
    const boundary = radius + BALL_RADIUS
    const previous = ball.contacts.get(part.id)

    if (distance > boundary + 4) {
      if (previous) previous.touching = false
      return
    }
    if (distance >= boundary) return

    const nx = distance > 0.0001 ? dx / distance : 0
    const ny = distance > 0.0001 ? dy / distance : -1
    ball.x += nx * (boundary - distance)
    ball.y += ny * (boundary - distance)

    const impact = -(ball.vx * nx + ball.vy * ny)
    if (impact > 0) {
      ball.vx += (1 + restitution) * impact * nx
      ball.vy += (1 + restitution) * impact * ny
      ball.vx *= 0.992
    }

    if (part.type === 'ramp') return

    const canStrike = !previous || (!previous.touching && elapsed - previous.lastHit > 0.16)
    if (canStrike && impact > 32) {
      ball.contacts.set(part.id, { touching: true, lastHit: elapsed })
      onHit({
        part,
        speed: impact,
        x: ball.x - nx * BALL_RADIUS,
        y: ball.y - ny * BALL_RADIUS,
        ballId: ball.id,
      })
    } else if (previous) {
      previous.touching = true
    }
  }

  function advance(dt) {
    elapsed += dt
    for (const ball of balls) {
      ball.age += dt
      ball.vy += GRAVITY * dt
      ball.vx *= Math.exp(-0.055 * dt)
      ball.x += ball.vx * dt
      ball.y += ball.vy * dt

      if (ball.x < BALL_RADIUS) {
        ball.x = BALL_RADIUS
        ball.vx = Math.abs(ball.vx) * 0.68
      } else if (ball.x > BOARD_WIDTH - BALL_RADIUS) {
        ball.x = BOARD_WIDTH - BALL_RADIUS
        ball.vx = -Math.abs(ball.vx) * 0.68
      }

      for (const part of parts) {
        if (part.type === 'ramp' || part.type === 'string' || part.type === 'bowed') {
          const isString = part.type === 'string' || part.type === 'bowed'
          const length = isString ? 132 : 116
          const radians = part.angle * Math.PI / 180
          const halfX = Math.cos(radians) * length / 2
          const halfY = Math.sin(radians) * length / 2
          const startX = part.x - halfX
          const startY = part.y - halfY
          const along = clamp(
            ((ball.x - startX) * halfX * 2 + (ball.y - startY) * halfY * 2) / (length * length),
            0,
            1,
          )
          contact(ball, part, startX + halfX * 2 * along, startY + halfY * 2 * along, isString ? 4 : 6, isString ? 0.48 : 0.64)
        } else if (CIRCLE_RADIUS[part.type]) {
          contact(ball, part, part.x, part.y, CIRCLE_RADIUS[part.type], part.type === 'bell' ? 0.72 : 0.56)
        }
      }
    }
    balls = balls.filter((ball) => ball.y < BOARD_HEIGHT + 40 && ball.age < MAX_AGE)
  }

  return {
    setParts(nextParts) {
      parts = nextParts
    },
    drop(x = 400, y = 28) {
      const id = nextId++
      balls.push({
        id,
        x: clamp(x, BALL_RADIUS, BOARD_WIDTH - BALL_RADIUS),
        y,
        vx: [-8, 0, 8][(id - 1) % 3],
        vy: 0,
        age: 0,
        contacts: new Map(),
        trail: [],
      })
      if (balls.length > MAX_BALLS) balls.shift()
      return id
    },
    step(dtSeconds) {
      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return
      accumulator += Math.min(dtSeconds, 0.1)
      while (accumulator >= FIXED_STEP) {
        advance(FIXED_STEP)
        accumulator -= FIXED_STEP
      }
      for (const ball of balls) {
        ball.trail.push({ x: ball.x, y: ball.y })
        if (ball.trail.length > 16) ball.trail.shift()
      }
    },
    reset() {
      balls = []
      accumulator = 0
      elapsed = 0
    },
    getBalls() {
      return balls.map(({ id, x, y, vx, vy, trail }) => ({ id, x, y, vx, vy, trail }))
    },
  }
}
