import { BONGO_WIDTH, BONGO_HEIGHT, BONGO_PALETTE, BONGO_RUNS } from './bongo-reference.js'

// Point positions come only from the pinned second source frame, not drawn paths.
// Its own slanted pose, two paws, facial negative space and red marks stay intact.
let cached
const decode = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

export function createCatGeometry() {
  if (cached) return cached
  const palette = decode(BONGO_PALETTE), runs = decode(BONGO_RUNS)
  const pixels = new Uint8Array(BONGO_WIDTH * BONGO_HEIGHT)
  let read = 0, written = 0
  while (read < runs.length) {
    let count = 0, shift = 0, byte
    do { byte = runs[read++]; count += (byte & 127) * 2 ** shift; shift += 7 } while (byte & 128)
    pixels.fill(runs[read++], written, written + count)
    written += count
  }
  if (written !== pixels.length) throw new Error('Incomplete Bongo reference mask')
  const kinds = new Uint8Array(palette.length / 4)
  for (let i = 0; i < kinds.length; i++) {
    const r = palette[i * 4] / 255, g = palette[i * 4 + 1] / 255, b = palette[i * 4 + 2] / 255
    if (palette[i * 4 + 3] < 16) kinds[i] = 0
    else if (r > .43 && r - g > .20 && g < .43) kinds[i] = 4
    else if (r > .55 && r - g > .10) kinds[i] = 3
    else if (Math.max(r, g, b) < .42) kinds[i] = 2
    else kinds[i] = 1
  }
  const body = [], fallback = []
  const kindAt = (x, y) => x < 0 || y < 0 || x >= BONGO_WIDTH || y >= BONGO_HEIGHT ? 0 : kinds[pixels[y * BONGO_WIDTH + x]]
  for (let y = 0; y < BONGO_HEIGHT; y++) for (let x = 0; x < BONGO_WIDTH; x++) {
    const index = pixels[y * BONGO_WIDTH + x], kind = kinds[index]
    // Dark source ink is a true negative space against the lighter star dust.
    if (kind === 0 || kind === 2) continue
    const edge = kind === 1 && [kindAt(x-1,y),kindAt(x+1,y),kindAt(x,y-1),kindAt(x,y+1)].some((k) => k === 0 || k === 2)
    if (kind === 1 && !edge && ((x & 1) || (y & 1))) continue
    const offset = index * 4
    const color = [palette[offset] / 255, palette[offset + 1] / 255, palette[offset + 2] / 255]
    const sourceAlpha = palette[offset + 3] / 255
    const grain = ((x*x*17 + y*y*31 + x*y*13 + x*71 + y*157) % 997) / 996
    const spark = (x*x*11 + y*y*7 + x*y*29 + x*17 + y*31) % 1021
    const core = kind === 1 && !edge && spark < 5
    let px=x+.5, py=y+.5
    if(kind===1 && !edge) {
      const dx=(((x*73+y*151+x*y*19)%991)/990-.5)*1.36
      const dy=(((x*193+y*47+x*y*31)%983)/982-.5)*1.36
      if(kindAt(Math.floor(px+dx),Math.floor(py+dy))===1) { px+=dx; py+=dy }
    }
    const fine=grain<.45
    const size = kind === 1 ? (edge?1.35:core?2.0+grain*.40:fine?1.10+grain/.45*.22:1.38+(grain-.45)/.55*.38) : kind === 4 ? 1.35 : 1.24
    const alpha = sourceAlpha * (kind===1 ? (edge?.78:core?.96:fine?.54+grain/.45*.18:.66+(grain-.45)/.55*.14) : .96)
    body.push(px/BONGO_WIDTH-.5,(BONGO_HEIGHT-py)/BONGO_WIDTH,
      kind===1?.002+grain*.003:.006,...color,size,alpha)
    if (kind === 1 ? ((x % 4 === 0 && y % 4 === 0) || (edge && (x + y) % 2 === 0)) : (x + y) % 2 === 0) {
      fallback.push({ x: px, y: py, radius: kind === 1 ? (core?2.0:.95+grain*.75) : 1.2,
        color: `rgb(${palette[offset]} ${palette[offset + 1]} ${palette[offset + 2]})`, alpha })
    }
  }
  cached = { body: new Float32Array(body), fallback, width: BONGO_WIDTH, height: BONGO_HEIGHT }
  return cached
}
