import { BONGO_WIDTH, BONGO_HEIGHT, BONGO_PALETTE, BONGO_RUNS, BONGO_ALTERNATE_PALETTE, BONGO_ALTERNATE_RUNS } from './bongo-reference.js'

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
  const staticBody=new Float32Array(body)
  const typing=buildTypingPose(staticBody,{palette,pixels,kinds})
  cached = { body: staticBody, fallback, width: BONGO_WIDTH, height: BONGO_HEIGHT, ...typing }
  return cached
}

// Only original hand/strike-mark differences get movable IDs. Common face and fur
// retain their exact existing coordinates, colors and style in both endpoints.
function buildTypingPose(body, base) {
  const palette=decode(BONGO_ALTERNATE_PALETTE), runs=decode(BONGO_ALTERNATE_RUNS)
  const pixels=new Uint8Array(BONGO_WIDTH*BONGO_HEIGHT)
  let read=0,written=0
  while(read<runs.length) {
    let count=0,shift=0,byte
    do { byte=runs[read++]; count+=(byte&127)*2**shift; shift+=7 } while(byte&128)
    pixels.fill(runs[read++],written,written+count);written+=count
  }
  const kinds=new Uint8Array(palette.length/4)
  for(let i=0;i<kinds.length;i++) {
    const r=palette[i*4]/255,g=palette[i*4+1]/255,b=palette[i*4+2]/255
    kinds[i]=palette[i*4+3]<16?0:r>.43&&r-g>.20&&g<.43?4:r>.55&&r-g>.10?3:Math.max(r,g,b)<.42?2:1
  }
  const inside=(x,y)=>x>=0&&y>=0&&x<BONGO_WIDTH&&y<BONGO_HEIGHT
  const kindAt=(x,y)=>inside(x,y)?kinds[pixels[y*BONGO_WIDTH+x]]:0
  const baseKindAt=(x,y)=>inside(x,y)?base.kinds[base.pixels[y*BONGO_WIDTH+x]]:0
  function handAt(x,y) {
    // The original red strike strokes extend beyond the palm rectangles.
    if(x>=0&&x<=145&&y>=76&&y<=236 && !(x>112&&y<150)) return 1
    if(x>=240&&x<=400&&y>=135&&y<=288 && !(x<=260&&y<=180) && !(x>=276&&x<=312&&y<=190)) return 2
    return 0
  }
  const changed=new Uint8Array(pixels.length)
  for(let y=0;y<BONGO_HEIGHT;y++) for(let x=0;x<BONGO_WIDTH;x++) {
    const side=handAt(x,y)
    if(side && baseKindAt(x,y)!==kindAt(x,y)) changed[y*BONGO_WIDTH+x]=side
  }
  const motionRole=new Uint8Array(body.length/8), groups=[[],[]]
  const alternate=body.slice()
  for(let i=0;i<motionRole.length;i++) {
    const x=Math.floor((body[i*8]+.5)*BONGO_WIDTH),y=Math.floor(BONGO_HEIGHT-body[i*8+1]*BONGO_WIDTH)
    const role=inside(x,y)?changed[y*BONGO_WIDTH+x]:0
    if(!role) continue
    motionRole[i]=role
    groups[role-1].push({index:i,x,y,kind:baseKindAt(x,y)})
    // If one source silhouette contains fewer points, surplus IDs fade in place.
    alternate[i*8+7]=0
  }
  const targets=[[],[]]
  for(let y=0;y<BONGO_HEIGHT;y++) for(let x=0;x<BONGO_WIDTH;x++) {
    const role=changed[y*BONGO_WIDTH+x],kind=kindAt(x,y)
    if(!role || kind===0 || kind===2) continue
    const edge=kind===1&&[kindAt(x-1,y),kindAt(x+1,y),kindAt(x,y-1),kindAt(x,y+1)].some(k=>k===0||k===2)
    if(kind===1&&!edge&&((x&1)||(y&1))) continue
    const grain=((x*x*17+y*y*31+x*y*13+x*71+y*157)%997)/996
    const spark=(x*x*11+y*y*7+x*y*29+x*17+y*31)%1021
    const core=kind===1&&!edge&&spark<5
    let px=x+.5,py=y+.5
    if(kind===1&&!edge) {
      const dx=(((x*73+y*151+x*y*19)%991)/990-.5)*1.36
      const dy=(((x*193+y*47+x*y*31)%983)/982-.5)*1.36
      const xx=Math.floor(px+dx),yy=Math.floor(py+dy)
      if(kindAt(xx,yy)===1&&changed[yy*BONGO_WIDTH+xx]===role) {px+=dx;py+=dy}
    }
    const fine=grain<.45,offset=pixels[y*BONGO_WIDTH+x]*4
    const size=kind===1?(edge?1.35:core?2+grain*.4:fine?1.10+grain/.45*.22:1.38+(grain-.45)/.55*.38):kind===4?1.35:1.24
    const alpha=palette[offset+3]/255*(kind===1?(edge?.78:core?.96:fine?.54+grain/.45*.18:.66+(grain-.45)/.55*.14):.96)
    targets[role-1].push({x:px,y:py,kind,priority:kind>=3?0:edge?1:2,
      value:[px/BONGO_WIDTH-.5,(BONGO_HEIGHT-py)/BONGO_WIDTH,kind===1?.002+grain*.003:.006,
        palette[offset]/255,palette[offset+1]/255,palette[offset+2]/255,size,alpha]})
  }
  for(let hand=0;hand<2;hand++) {
    const ids=groups[hand], candidates=targets[hand], chosen=[]
    // Keep every colored pad/strike pixel and contour before thinning interior dust.
    for(let priority=0;priority<3;priority++) {
      const list=candidates.filter(p=>p.priority===priority),count=Math.min(ids.length-chosen.length,list.length)
      for(let i=0;i<count;i++) chosen.push(list[Math.floor((i+.5)*list.length/count)])
    }
    const used=new Uint8Array(ids.length)
    for(const target of chosen) {
      let nearest=-1,best=Infinity
      for(let i=0;i<ids.length;i++) {
        if(used[i]) continue
        const node=ids[i],dx=node.x-target.x,dy=node.y-target.y
        const cost=dx*dx+dy*dy+(node.kind===target.kind?0:2500)
        if(cost<best) {best=cost;nearest=i}
      }
      if(nearest<0) break
      used[nearest]=1
      alternate.set(target.value,ids[nearest].index*8)
    }
  }
  return {alternate,motionRole}
}
