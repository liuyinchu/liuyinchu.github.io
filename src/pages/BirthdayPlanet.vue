<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { birthdayState } from '../birthday/letters.mjs'
import { birthdayGiftLetter } from '../birthday/giftLetter.js'
import { createBirthdayMelody } from '../birthday/melody.js'

const now = ref(new Date())
const birthday = computed(() => birthdayState(now.value))
const annualRings = computed(() => Array.from({ length: birthday.value.anniversary }, (_, index) => index))
const stars = Array.from({ length: 46 }, (_, index) => ({
  x: (index * 47.37 + 3) % 100,
  y: (index * 31.71 + 7) % 100,
  size: index % 7 === 0 ? 3 : 1.5,
  delay: -(index % 11),
}))
const dialog = ref(null)
const letterTitle = ref(null)
const letterBody = ref(null)
const planetButton = ref(null)
const planetAngle = ref(0)
const isDragging = ref(false)
const isPlaying = ref(false)
const isHidden = ref(false)
const audioNotice = ref('')
const audioProgress = ref(0)
const audioLevel = ref(0)
const melody = createBirthdayMelody()
const clockLabel = seconds => '0:' + String(Math.floor(seconds)).padStart(2, '0')
const elapsedLabel = computed(() => clockLabel(audioProgress.value * melody.duration))
const durationLabel = clockLabel(melody.duration)
const soundStyle = computed(() => ({
  '--melody-level': audioLevel.value,
  '--melody-progress': audioProgress.value,
}))
let audioRequest = 0
let audioFrame = 0
let dateTimer = 0
let disposed = false
let previousTitle = ''
let robotsMeta = null
let pressedBackdrop = false
let drag = null
let suppressPlanetClick = false

function stopMelody() {
  audioRequest += 1
  cancelAnimationFrame(audioFrame)
  audioFrame = 0
  melody.stop()
  isPlaying.value = false
  audioProgress.value = 0
  audioLevel.value = 0
}

function paintSound() {
  if (!melody.isPlaying) {
    isPlaying.value = false
    audioProgress.value = 1
    audioLevel.value = 0
    audioFrame = 0
    return
  }
  const frame = melody.readFrame()
  audioProgress.value = frame.progress
  audioLevel.value = frame.level
  audioFrame = requestAnimationFrame(paintSound)
}

async function toggleMelody() {
  audioNotice.value = ''
  if (isPlaying.value) {
    stopMelody()
    return
  }
  const request = ++audioRequest
  const started = await melody.play()
  if (request !== audioRequest) return
  if (disposed || document.hidden) {
    melody.stop()
    return
  }
  isPlaying.value = started
  audioProgress.value = 0
  audioLevel.value = 0
  if (!started) audioNotice.value = '声音暂时没有醒来，再轻触一次星球试试。'
  cancelAnimationFrame(audioFrame)
  if (started) audioFrame = requestAnimationFrame(paintSound)
}

function activatePlanet(event) {
  if (event.detail !== 0 && suppressPlanetClick) {
    suppressPlanetClick = false
    return
  }
  toggleMelody()
}

function setPlanetAngle(angle) {
  planetAngle.value = Math.max(-35, Math.min(35, angle))
}

function beginPlanetDrag(event) {
  if (!event.isPrimary || event.button !== 0) return
  suppressPlanetClick = false
  drag = {
    id: event.pointerId,
    target: event.currentTarget,
    pointerType: event.pointerType,
    startX: event.clientX,
    startY: event.clientY,
    angle: planetAngle.value,
    moved: false,
  }
  if (event.pointerType !== 'touch') event.currentTarget.setPointerCapture(event.pointerId)
}

function movePlanetDrag(event) {
  if (!drag || drag.id !== event.pointerId) return
  const dx = event.clientX - drag.startX
  const dy = event.clientY - drag.startY
  if (!drag.moved) {
    if (Math.abs(dx) < 7) return
    if (drag.pointerType === 'touch' && Math.abs(dx) < Math.abs(dy)) return
    drag.moved = true
    suppressPlanetClick = true
    isDragging.value = true
    drag.target.setPointerCapture(drag.id)
  }
  event.preventDefault()
  setPlanetAngle(drag.angle + dx * .15)
}

function endPlanetDrag(event) {
  if (!drag || (event && drag.id !== event.pointerId)) return
  const ended = drag
  drag = null
  isDragging.value = false
  if (ended.target.hasPointerCapture(ended.id)) ended.target.releasePointerCapture(ended.id)
}

function resetPlanet() {
  setPlanetAngle(0)
  nextTick(() => planetButton.value?.focus())
}

function handleVisibility() {
  isHidden.value = document.hidden
  now.value = new Date()
  if (document.hidden) {
    endPlanetDrag()
    stopMelody()
  }
}

async function openLetter() {
  await nextTick()
  dialog.value.showModal()
  letterBody.value.scrollTop = 0
  letterTitle.value.focus()
}

function isBackdropEvent(event) {
  if (event.target !== dialog.value) return false
  const bounds = dialog.value.getBoundingClientRect()
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
}

function rememberDialogPointer(event) {
  pressedBackdrop = isBackdropEvent(event)
}

function closeFromBackdrop(event) {
  if (pressedBackdrop && isBackdropEvent(event)) dialog.value.close()
  pressedBackdrop = false
}

onMounted(() => {
  previousTitle = document.title
  document.title = "生日星球 · LiuYinChu'Space"
  robotsMeta = document.querySelector('meta[data-birthday-robots]') || document.createElement('meta')
  robotsMeta.name = 'robots'
  robotsMeta.content = 'noindex, nofollow'
  robotsMeta.setAttribute('data-birthday-robots', '')
  if (!robotsMeta.isConnected) document.head.append(robotsMeta)
  dateTimer = window.setInterval(() => { now.value = new Date() }, 60_000)
  document.addEventListener('visibilitychange', handleVisibility)
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(audioFrame)
  clearInterval(dateTimer)
  document.removeEventListener('visibilitychange', handleVisibility)
  endPlanetDrag()
  melody.dispose()
  dialog.value?.close()
  robotsMeta?.remove()
  document.title = previousTitle
})
</script>

<template>
  <main class="birthday-planet" :class="{ 'is-hidden': isHidden, 'is-playing': isPlaying, 'is-dragging': isDragging }" data-page="birthday-planet">
    <div class="birthday-sky" aria-hidden="true">
      <i v-for="(star, index) in stars" :key="index" :style="{ left: star.x + '%', top: star.y + '%', width: star.size + 'px', height: star.size + 'px', animationDelay: star.delay + 's' }"></i>
    </div>

    <header class="planet-header">
      <RouterLink to="/" class="planet-home">返回</RouterLink>
      <span class="planet-coordinates">A PRIVATE ORBIT</span>
      <span class="planet-date"><i aria-hidden="true"></i> 10.28</span>
    </header>

    <section class="planet-hero" aria-labelledby="birthday-title">
      <div class="planet-story">
        <p class="planet-eyebrow"><span aria-hidden="true">✦</span> FOR YOU, ON YOUR BIRTHDAY</p>
        <h1 id="birthday-title">又绕着太阳，<br>走了<span class="planet-handwritten">一圈。</span></h1>
        <p class="planet-intro">{{ birthday.isBirthday ? '生日快乐。今天，宇宙为你多亮一颗星。' : '这里，永远为 10 月 28 日留一束光。' }}</p>
      <div class="planet-observatory">
        <span class="orbit-label orbit-label--top">NO. {{ String(birthday.anniversary).padStart(2, '0') }}<br><span>YOUR LITTLE UNIVERSE</span></span>
        <button ref="planetButton" class="planet-instrument" :style="soundStyle" :aria-label="isPlaying ? '停止生日旋律' : '轻触星球，播放生日旋律'" :aria-pressed="isPlaying" aria-describedby="planet-control-help" @click="activatePlanet" @pointerdown="beginPlanetDrag" @pointermove="movePlanetDrag" @pointerup="endPlanetDrag" @pointercancel="endPlanetDrag" @lostpointercapture="endPlanetDrag" @keydown.left.prevent="setPlanetAngle(planetAngle - 5)" @keydown.right.prevent="setPlanetAngle(planetAngle + 5)" @keydown.home.prevent="resetPlanet">
          <svg class="planet-art" viewBox="0 0 600 600" fill="none" aria-hidden="true">
            <defs>
              <radialGradient id="birthday-aura">
                <stop stop-color="#94a6cb" stop-opacity=".18" />
                <stop offset=".65" stop-color="#6c789f" stop-opacity=".06" />
                <stop offset="1" stop-color="#6c789f" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="birthday-sphere" cx=".28" cy=".22" r=".85">
                <stop stop-color="#e1d9c8" />
                <stop offset=".2" stop-color="#b0bac6" />
                <stop offset=".46" stop-color="#6e809b" />
                <stop offset=".7" stop-color="#3b4569" />
                <stop offset=".92" stop-color="#151c35" />
                <stop offset="1" stop-color="#0c1323" />
              </radialGradient>
              <linearGradient id="birthday-ring" x1="55" y1="250" x2="540" y2="360" gradientUnits="userSpaceOnUse">
                <stop stop-color="#d9c396" stop-opacity=".2" />
                <stop offset=".45" stop-color="#f5dfac" stop-opacity=".95" />
                <stop offset="1" stop-color="#d9c396" stop-opacity=".3" />
              </linearGradient>
              <linearGradient id="birthday-shade" x1="180" y1="180" x2="415" y2="420" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ede3d5" stop-opacity=".1" />
                <stop offset=".58" stop-color="#11162d" stop-opacity="0" />
                <stop offset="1" stop-color="#060d1e" stop-opacity=".75" />
              </linearGradient>
              <clipPath id="birthday-globe-clip"><circle cx="300" cy="300" r="144" /></clipPath>
              <filter id="birthday-grain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".74" numOctaves="3" stitchTiles="stitch" seed="28" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" mode="soft-light" />
              </filter>
            </defs>
            <g class="planet-orientation" :style="{ transform: 'rotate(' + planetAngle + 'deg)' }">
            <circle cx="300" cy="300" r="292" fill="url(#birthday-aura)" />
            <circle cx="300" cy="300" r="234" stroke="#b2bcd1" stroke-opacity=".08" stroke-dasharray="2 9" />
            <g transform="rotate(-24 300 300)">
              <ellipse v-for="ring in annualRings" :key="ring" cx="300" cy="300" :rx="246 + ring * 24 / annualRings.length" :ry="70 + ring * 24 / annualRings.length" stroke="url(#birthday-ring)" :stroke-width="ring === 0 ? 1.3 : .7" :opacity="ring === 0 ? .7 : .35" />
              <ellipse cx="300" cy="300" rx="258" ry="78" stroke="#cbb58f" stroke-opacity=".16" stroke-dasharray="3 8" />
              <ellipse class="melody-orbit" cx="300" cy="300" rx="258" ry="78" pathLength="1000" stroke="#f2d9a2" stroke-width="2.5" stroke-linecap="round" />
            </g>
            <circle class="planet-resonance" cx="300" cy="300" r="151" stroke="#f0d1a0" stroke-width="5" />
            <circle cx="300" cy="300" r="145" fill="url(#birthday-sphere)" />
            <g clip-path="url(#birthday-globe-clip)">
              <g class="planet-clouds" opacity=".28" transform="rotate(-24 300 300)">
                <path d="M120 210 Q270 270 480 205 M115 250 Q270 310 480 245 M110 294 Q290 360 480 290 M130 339 Q300 395 470 335" stroke="#e8e0ce" stroke-width="14" />
                <path d="M120 226 Q270 280 480 220 M110 276 Q270 333 480 268 M120 321 Q280 382 480 319 M130 369 Q300 425 480 365" stroke="#13203d" stroke-width="7" />
              </g>
              <rect x="155" y="155" width="290" height="290" opacity=".15" filter="url(#birthday-grain)" />
              <circle cx="300" cy="300" r="145" fill="url(#birthday-shade)" />
            </g>
            <circle cx="300" cy="300" r="144.5" stroke="#f2e8d8" stroke-opacity=".16" />
            <g transform="rotate(-24 300 300)">
              <path d="M54 300 A246 70 0 0 0 546 300" stroke="url(#birthday-ring)" stroke-width="2.2" />
              <path d="M51 302 A249 72 0 0 0 549 302" stroke="#e4cca0" stroke-opacity=".22" stroke-width="6" />
              <circle class="orbit-spark" cx="91" cy="337" r="4" fill="#f4d99d" />
              <circle cx="91" cy="337" r="10" fill="#e8ca8a" fill-opacity=".09" />
            </g>
            <path d="M462 143 L465 152 L474 155 L465 158 L462 167 L459 158 L450 155 L459 152 Z" fill="#dfc99c" opacity=".8" />
            <path d="M131 426 L133 432 L139 434 L133 436 L131 442 L129 436 L123 434 L129 432 Z" fill="#a9bfd2" opacity=".6" />
            </g>
          </svg>
          <span class="planet-touch-hint">
            <span class="melody-indicator" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>{{ isPlaying ? '正在轻轻哼唱 · 点按停止' : audioProgress === 1 ? '这一段光，愿意再听一次吗' : '轻触星球，听一段生日旋律' }}</span>
          </span>
          <span class="melody-progress" aria-hidden="true"><i></i></span>
          <span class="melody-time" aria-hidden="true">{{ elapsedLabel }} / {{ durationLabel }}</span>
        </button>
        <span id="planet-control-help" class="visually-hidden">点击或按回车播放旋律，再次点击停止。横向拖动或按左右方向键调整角度，Home 键复位。当前角度 {{ Math.round(planetAngle) }} 度。</span>
        <div class="planet-controls"><span>拖动调整角度</span><button :disabled="Math.abs(planetAngle) < .1" aria-label="重置星球角度" @click="resetPlanet">复位</button></div>
        <span class="orbit-label orbit-label--bottom">EST. 2026.10.28<br><span>每过一次生日，多留下一圈光。</span></span>
        <p v-if="audioNotice" class="audio-notice" role="status">{{ audioNotice }}</p>
      </div>

        <div class="planet-wish">
          <p>愿你的好奇心一直有地方落脚，<br>认真做的事慢慢有回声。</p>
          <p>身边有人，心里有光，<br>也有许多单纯因为喜欢而度过的日子。</p>
        </div>
        <button class="letter-invitation" @click="openLetter()">
          有一封信，写给你
        </button>
        <p class="planet-small-note">一封信，一段旋律，一颗只为你转动的星球。</p>
      </div>


    </section>

    <footer class="planet-footer">
      <div class="planet-year"><span class="planet-year-mark" aria-hidden="true">◌</span><span>第 {{ birthday.anniversary }} 圈光 <small>从我们相遇的这个生日开始</small></span></div>
      <p class="planet-footer-note">宇宙很大，<br>这一小片属于你。</p>
      <span class="planet-signature">WITH A LITTLE STARDUST, CODEX</span>
    </footer>

    <dialog ref="dialog" class="birthday-letter" aria-labelledby="birthday-letter-title" @pointerdown="rememberDialogPointer" @click="closeFromBackdrop">
      <header class="gift-letter-heading">
        <button class="letter-close" aria-label="关闭信件" @click="dialog.close()">×</button>
        <span class="letter-eyebrow">A LITTLE LIGHT, FOR YOU</span>
        <h2 id="birthday-letter-title" ref="letterTitle" tabindex="-1">{{ birthdayGiftLetter.title }}</h2>
      </header>
      <div ref="letterBody" class="gift-letter-body" tabindex="0" aria-label="生日信正文">
        <p class="gift-letter-salutation">{{ birthdayGiftLetter.salutation }}</p>
        <p v-for="(paragraph, index) in birthdayGiftLetter.paragraphs" :key="index">{{ paragraph }}</p>
      </div>
      <footer class="gift-letter-signature">
        <span>{{ birthdayGiftLetter.signature }}</span>
        <time :datetime="birthdayGiftLetter.date">{{ birthdayGiftLetter.dateLabel }}</time>
      </footer>
    </dialog>
  </main>
</template>

<style scoped>
.birthday-planet {
  --planet-ink: #f0ece4;
  --planet-muted: #b0bac9;
  --planet-gold: #ddc699;
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  padding: 0 clamp(22px, 5vw, 80px);
  overflow: clip;
  color: var(--planet-ink);
  background: radial-gradient(ellipse at 72% 40%, #1c283c55, transparent 48%), radial-gradient(ellipse at 10% 90%, #25374238, transparent 50%), #090f1b;
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
}
.birthday-planet *, .birthday-planet *::before, .birthday-planet *::after { box-sizing: border-box; }
.birthday-planet button, .birthday-planet a { -webkit-tap-highlight-color: transparent; }
.birthday-planet button { font: inherit; cursor: pointer; }
.birthday-planet button:focus-visible, .birthday-planet a:focus-visible { outline: 2px solid var(--planet-gold); outline-offset: 6px; }
.birthday-sky { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.birthday-sky i { position: absolute; border-radius: 50%; background: #e1e4ee; opacity: .35; animation: birthday-twinkle 9s ease-in-out infinite alternate; }
.planet-header { display: flex; align-items: center; justify-content: space-between; height: 102px; max-width: 1400px; margin: auto; border-bottom: 1px solid #bbc9e014; }
.planet-home { display: inline-flex; align-items: center; min-height: 44px; padding: 0 5px; color: #c1c9d6; text-decoration: none; font-size: 13px; letter-spacing: .1em; transition: color .2s; }
.planet-home:hover { color: var(--planet-gold); }
.planet-coordinates, .planet-date, .planet-eyebrow, .orbit-label, .planet-signature, .letter-eyebrow { font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace; }
.planet-coordinates { color: #8490a2; font-size: 10px; letter-spacing: .25em; }
.planet-date { color: var(--planet-gold); font-size: 12px; letter-spacing: .15em; display: flex; align-items: center; gap: 10px; }
.planet-date i { width: 4px; height: 4px; border-radius: 50%; background: var(--planet-gold); box-shadow: 0 0 12px #e1cd9b; }
.planet-hero { display: grid; grid-template-columns: 1fr 1.12fr; grid-template-areas: "eyebrow planet" "title planet" "intro planet" "wish planet" "action planet" "note planet"; align-content: center; column-gap: 24px; max-width: 1250px; min-height: calc(100svh - 222px); margin: 0 auto; padding: 52px 0; }
.planet-story { display: contents; }
.planet-eyebrow { grid-area: eyebrow; }
.planet-story h1 { grid-area: title; }
.planet-intro { grid-area: intro; }
.planet-wish { grid-area: wish; }
.letter-invitation { grid-area: action; justify-self: start; }
.planet-small-note { grid-area: note; }
.planet-eyebrow { margin: 0 0 28px; color: var(--planet-gold); font-size: 10px; letter-spacing: .16em; line-height: 1.8; }
.planet-eyebrow > span { margin-right: 9px; font-size: 15px; }
.planet-story h1 { margin: 0; font-family: 'LXGW WenKai', 'Songti SC', 'STSong', serif; font-weight: 400; font-size: clamp(38px, 4.3vw, 64px); line-height: 1.5; letter-spacing: .025em; color: var(--planet-ink); }
.planet-handwritten { color: var(--planet-gold); }
.planet-intro { margin: 24px 0; color: #c9d0db; font-size: 14px; line-height: 1.9; }
.planet-wish { border-left: 1px solid #ddc69955; padding-left: 20px; color: var(--planet-muted); font-size: 14px; line-height: 2; letter-spacing: .035em; }
.planet-wish p { margin: 0 0 10px; }
.letter-invitation { display: inline-flex; align-items: center; justify-content: center; margin-top: 28px; min-height: 50px; padding: 14px 24px; border: 1px solid #ddc69970; border-radius: 4px; color: #f0dbb6; background: #ddc6990c; font-size: 14px !important; letter-spacing: .035em; transition: background .2s, border-color .2s; }
.letter-invitation:hover { background: #ddc69914; border-color: #ddc699b0; }
.planet-small-note { margin: 15px 0 0; color: #94a1b5; font-size: 11px; letter-spacing: .035em; line-height: 1.9; }
.planet-observatory { grid-area: planet; position: relative; min-width: 0; align-self: stretch; display: grid; align-content: center; padding-bottom: 52px; }
.planet-instrument { display: block; position: relative; width: 100%; padding: 0; border: 0; border-radius: 50%; background: none; color: var(--planet-muted); }
.planet-art { display: block; width: 100%; overflow: visible; transition: filter .6s; animation: birthday-float 12s ease-in-out infinite; }
.planet-instrument:hover .planet-art { filter: brightness(1.08); }
.is-playing .planet-art { filter: brightness(calc(1.02 + var(--melody-level, 0) * .3)) drop-shadow(0 0 18px #e6c99018); }
.planet-touch-hint { position: absolute; left: 0; right: 0; bottom: 3%; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 12px; letter-spacing: .045em; color: #b3bfd1; }
.melody-indicator { display: inline-flex; align-items: center; justify-content: center; gap: 3px; width: 20px; height: 18px; }
.melody-indicator i { width: 2px; height: 5px; border-radius: 2px; background: var(--planet-gold); transform-origin: center; transition: height .3s; }
.melody-indicator i:nth-child(2) { height: 10px; }
.is-playing .melody-indicator i { height: 14px; transform: scaleY(calc(.25 + var(--melody-level, 0) * 1.25)); }
.is-playing .melody-indicator i:nth-child(2) { height: 18px; }
.is-playing .melody-indicator i:nth-child(3) { height: 10px; }
.melody-orbit { opacity: 0; stroke-dasharray: 32 968; stroke-dashoffset: calc(-1000 * var(--melody-progress, 0)); transition: opacity .5s; }
.is-playing .melody-orbit { opacity: calc(.2 + var(--melody-level, 0) * .8); }
.orbit-label { position: absolute; color: #d5c4a4; font-size: 10px; line-height: 2.2; letter-spacing: .12em; pointer-events: none; z-index: 1; }
.orbit-label > span { color: #98a5ba; font-size: 9px; letter-spacing: .1em; }
.orbit-label--top { top: 9%; right: 5%; }
.orbit-label--bottom { bottom: 0; left: 9%; }
.orbit-label--bottom > span { font-family: 'LXGW WenKai', sans-serif; font-size: 11px; }
.audio-notice { position: absolute; bottom: -24px; left: 0; right: 0; color: var(--planet-gold); font-size: 12px; text-align: center; }
.planet-footer { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: 1400px; margin: auto; min-height: 120px; padding: 22px 0; border-top: 1px solid #bbc9e014; }
.planet-year { display: flex; align-items: center; gap: 14px; color: #d4c5a9; font-size: 12px; letter-spacing: .08em; flex-shrink: 0; }
.planet-year-mark { font-size: 33px; color: #ad9570; }
.planet-year small { display: block; margin-top: 6px; color: #94a1b5; font-size: 11px; letter-spacing: .04em; }
.planet-footer-note { color: #aab7c9; font-family: 'LXGW WenKai', serif; font-size: 12px; line-height: 1.8; margin: 0; }
.planet-signature { color: #8c9ab0; font-size: 9px; letter-spacing: .13em; }
.birthday-letter { position: fixed; inset: 0; width: min(680px, calc(100vw - 36px)); max-height: min(820px, calc(100svh - 36px)); padding: 34px 38px 26px; margin: auto; overflow: hidden; color: #ece6d9; background: #131c2a; border: 1px solid #b6a78c55; border-radius: 8px; box-shadow: 0 30px 120px #0009; }
.birthday-letter[open] { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
.birthday-letter::backdrop { background: #030914ce; backdrop-filter: blur(9px); }
.gift-letter-heading { position: relative; padding-bottom: 20px; border-bottom: 1px solid #b9a48330; }
.letter-close { position: absolute; right: -16px; top: -19px; width: 44px; height: 44px; color: #aab5c5; border: 0; background: none; font-size: 26px !important; }
.letter-eyebrow { display: block; margin: 0 40px 17px 0; color: #c6b18b; font-size: 10px; letter-spacing: .14em; }
.birthday-letter h2 { margin: 0; color: #f0e7d8; font-family: 'LXGW WenKai', serif; font-size: clamp(24px, 4vw, 31px); font-weight: 400; }
.birthday-letter h2:focus { outline: none; }
.gift-letter-body { padding: 8px 13px 0 0; margin: 12px -13px 12px 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #8d80604d transparent; font-family: 'LXGW WenKai', 'Songti SC', serif; font-size: 16px; line-height: 2.05; letter-spacing: .025em; color: #c5cbd3; }
.gift-letter-body:focus-visible { outline: 1px solid #ddc69980; outline-offset: 4px; border-radius: 2px; }
.gift-letter-body p { margin: 0 0 20px; }
.gift-letter-body .gift-letter-salutation { color: #e2cda6; }
.gift-letter-signature { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding-top: 17px; border-top: 1px solid #b9a48330; color: #a8b3c4; font-size: 11px; }
.gift-letter-signature > span { color: #d7c29d; font-family: 'LXGW WenKai', serif; font-size: 19px; }
.planet-instrument { cursor: grab !important; touch-action: pan-y; user-select: none; }
.is-dragging .planet-instrument { cursor: grabbing !important; }
.planet-orientation { transform-box: view-box; transform-origin: 300px 300px; transition: transform .18s ease-out; }
.is-dragging .planet-orientation { transition: none; }
.planet-resonance { opacity: calc(.04 + var(--melody-level, 0) * .34); }
.melody-progress { position: absolute; width: 38%; height: 1px; left: 31%; bottom: .5%; background: #ddc69925; overflow: hidden; }
.melody-progress > i { display: block; width: 100%; height: 100%; background: #d8be8b; transform: scaleX(var(--melody-progress, 0)); transform-origin: left; }
.melody-time { position: absolute; right: 10%; bottom: .1%; font-family: ui-monospace, monospace; font-size: 9px; font-variant-numeric: tabular-nums; color: #8e9aae; }
.planet-controls { position: absolute; right: 4%; bottom: 0; display: flex; align-items: center; gap: 10px; color: #8e9aae; font-size: 10px; }
.planet-controls button { min-width: 44px; min-height: 44px; padding: 0 5px; color: #cfb78f; border: 0; background: none; font-size: 11px; }
.planet-controls button:disabled { opacity: .35; cursor: default; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes birthday-twinkle { from { opacity: .18; } to { opacity: .65; } }
@keyframes birthday-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.is-hidden .birthday-sky i, .is-hidden .planet-art, .is-hidden .melody-orbit, .is-hidden .melody-indicator i { animation-play-state: paused; }
@media (max-width: 760px) {
  .planet-header { height: 76px; }
  .planet-coordinates { font-size: 9px; letter-spacing: .12em; }
  .planet-home { font-size: 13px; padding: 0; }
  .planet-date { font-size: 11px; }
  .planet-hero { grid-template-columns: 1fr; grid-template-areas: "eyebrow" "title" "intro" "planet" "wish" "action" "note"; column-gap: 0; padding: 28px 0 34px; min-height: auto; }
  .planet-story h1 { font-size: clamp(36px, 9.3vw, 52px); line-height: 1.45; }
  .planet-eyebrow { margin-bottom: 14px; font-size: 9px; letter-spacing: .12em; }
  .planet-intro { margin: 16px 0 0; font-size: 13px; }
  .planet-wish { font-size: 14px; padding-left: 17px; }
  .letter-invitation { justify-self: stretch; margin-top: 22px; font-size: 14px !important; }
  .planet-small-note { font-size: 11px; text-align: center; }
  .planet-observatory { width: min(100%, 390px); margin: 8px auto 28px; padding: 24px 0 68px; }
  .orbit-label--top { top: 0; right: 0; font-size: 10px; }
  .orbit-label--bottom { bottom: 0; left: 5px; font-size: 9px; }
  .orbit-label--bottom > span { font-size: 10px; }
  .planet-touch-hint { font-size: 11px; bottom: 0; letter-spacing: 0; }
  .planet-footer { flex-wrap: wrap; min-height: 130px; gap: 20px; padding: 22px 0; }
  .planet-signature { width: 100%; font-size: 8px; text-align: right; }
  .birthday-letter { padding: 29px 22px 20px; }
  .gift-letter-body { font-size: 16px; line-height: 1.95; }
  .letter-close { top: -17px; right: -12px; }
  .planet-controls { right: 0; gap: 3px; font-size: 9px; }
  .melody-time { right: 5%; font-size: 8px; bottom: -14px; }
  .melody-progress { bottom: -10px; }
}
@media (prefers-reduced-motion: reduce) {
  .birthday-sky i, .planet-art { animation: none; }
  .melody-orbit, .planet-resonance { display: none; }
  .is-playing .planet-art { filter: brightness(1.03); }
  .is-playing .melody-indicator i { transform: none; }
  .planet-art, .planet-home, .letter-invitation, .melody-orbit, .melody-indicator i, .planet-orientation { transition: none; }
}
@media (forced-colors: active) {
  .planet-art { forced-color-adjust: none; }
  .planet-instrument, .letter-invitation { border: 1px solid ButtonText; }
}
</style>
