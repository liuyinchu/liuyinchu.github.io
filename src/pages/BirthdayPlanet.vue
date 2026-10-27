<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { birthdayState, FIRST_YEAR, isLetterOpen, letterOpeningDate, normalizeLetters, saveLetter } from '../birthday/letters.mjs'
import { createBirthdayMelody } from '../birthday/melody.js'

const STORAGE_KEY = 'birthday-planet-letters-v1'
const now = ref(new Date())
const birthday = computed(() => birthdayState(now.value))
const cycleYear = computed(() => FIRST_YEAR + birthday.value.anniversary - 1)
const letters = ref([])
const currentLetter = computed(() => letters.value.find(letter => letter.year === cycleYear.value))
const annualRings = computed(() => Array.from({ length: birthday.value.anniversary }, (_, index) => index))
const stars = Array.from({ length: 46 }, (_, index) => ({
  x: (index * 47.37 + 3) % 100,
  y: (index * 31.71 + 7) % 100,
  size: index % 7 === 0 ? 3 : 1.5,
  delay: -(index % 11),
}))
const dialog = ref(null)
const draft = ref('')
const hasDraft = ref(false)
const invitationLabel = computed(() => {
  if (hasDraft.value && draft.value.trim() && draft.value !== (currentLetter.value?.text || '')) {
    return '继续写，给下一岁的自己'
  }
  return currentLetter.value ? '再写几句，给下一岁的自己' : '写封信，给下一岁的自己'
})
const selectedLetter = ref(null)
const mode = ref('write')
const notice = ref('')
const storageWarning = ref('')
const isPlaying = ref(false)
const isHidden = ref(false)
const audioNotice = ref('')
const melody = createBirthdayMelody()
const displayedOpening = computed(() => selectedLetter.value?.opensOn || currentLetter.value?.opensOn || letterOpeningDate(now.value))
let audioRequest = 0
let audioTimer = 0
let dateTimer = 0
let disposed = false
let previousTitle = ''
let robotsMeta = null

const dateLabel = value => value.replaceAll('-', '.')
const letterLabel = letter => isLetterOpen(letter, now.value) ? '可以拆开了' : dateLabel(letter.opensOn) + ' 开启'

function stopMelody() {
  audioRequest += 1
  clearTimeout(audioTimer)
  melody.stop()
  isPlaying.value = false
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
  if (!started) audioNotice.value = '声音暂时没有醒来，再轻触一次星球试试。'
  clearTimeout(audioTimer)
  if (started) audioTimer = window.setTimeout(() => { isPlaying.value = false }, melody.duration * 1000)
}

function handleVisibility() {
  isHidden.value = document.hidden
  now.value = new Date()
  if (document.hidden) stopMelody()
}

function prepareDraft(letter = currentLetter.value) {
  if (hasDraft.value) return
  draft.value = letter?.text || ''
  hasDraft.value = true
}

async function openLetter(letter = null) {
  now.value = new Date()
  notice.value = ''
  selectedLetter.value = letter
  if (letter) {
    mode.value = isLetterOpen(letter, now.value) ? 'read' : 'sealed'
  } else {
    mode.value = 'write'
    prepareDraft()
  }
  await nextTick()
  dialog.value.showModal()
}

function editLetter() {
  prepareDraft(selectedLetter.value)
  mode.value = 'write'
  notice.value = ''
  nextTick(() => dialog.value.querySelector('textarea')?.focus())
}

function storeLetter() {
  now.value = new Date()
  try {
    const updated = saveLetter(letters.value, draft.value, now.value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    letters.value = updated
    selectedLetter.value = updated.find(letter => letter.year === cycleYear.value)
    mode.value = 'sealed'
    hasDraft.value = false
    storageWarning.value = ''
    notice.value = '信已存好。下一圈光里，我们再见。'
  } catch {
    notice.value = '暂时没有存成功，请先复制这封信留存。你的文字还在这里。'
  }
}

async function copyLetter() {
  const text = mode.value === 'write' ? draft.value : selectedLetter.value?.text
  try {
    await navigator.clipboard.writeText(text)
    notice.value = '已复制，记得放到你喜欢的地方。'
  } catch {
    if (mode.value === 'sealed') editLetter()
    await nextTick()
    const field = dialog.value.querySelector('textarea')
    field?.focus()
    field?.select()
    notice.value = '请选中文字手动复制留存。'
  }
}

onMounted(() => {
  previousTitle = document.title
  document.title = "生日星球 · LiuYinChu'Space"
  robotsMeta = document.querySelector('meta[data-birthday-robots]') || document.createElement('meta')
  robotsMeta.name = 'robots'
  robotsMeta.content = 'noindex, nofollow'
  robotsMeta.setAttribute('data-birthday-robots', '')
  if (!robotsMeta.isConnected) document.head.append(robotsMeta)
  try {
    letters.value = normalizeLetters(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  } catch {
    storageWarning.value = '当前浏览器暂时无法读取信件。写好后可以先复制留存。'
  }
  dateTimer = window.setInterval(() => { now.value = new Date() }, 60_000)
  document.addEventListener('visibilitychange', handleVisibility)
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(audioTimer)
  clearInterval(dateTimer)
  document.removeEventListener('visibilitychange', handleVisibility)
  melody.dispose()
  dialog.value?.close()
  robotsMeta?.remove()
  document.title = previousTitle
})
</script>

<template>
  <main class="birthday-planet" :class="{ 'is-hidden': isHidden, 'is-playing': isPlaying }" data-page="birthday-planet">
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
        <button class="planet-instrument" :aria-label="isPlaying ? '暂停生日旋律' : '轻触星球，播放生日旋律'" :aria-pressed="isPlaying" @click="toggleMelody">
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
            <circle cx="300" cy="300" r="292" fill="url(#birthday-aura)" />
            <circle cx="300" cy="300" r="234" stroke="#b2bcd1" stroke-opacity=".08" stroke-dasharray="2 9" />
            <g transform="rotate(-24 300 300)">
              <ellipse v-for="ring in annualRings" :key="ring" cx="300" cy="300" :rx="246 + ring * 24 / annualRings.length" :ry="70 + ring * 24 / annualRings.length" stroke="url(#birthday-ring)" :stroke-width="ring === 0 ? 1.3 : .7" :opacity="ring === 0 ? .7 : .35" />
              <ellipse cx="300" cy="300" rx="258" ry="78" stroke="#cbb58f" stroke-opacity=".16" stroke-dasharray="3 8" />
              <ellipse class="melody-orbit" cx="300" cy="300" rx="258" ry="78" pathLength="1000" stroke="#f2d9a2" stroke-width="2.5" stroke-linecap="round" />
            </g>
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
          </svg>
          <span class="planet-touch-hint">
            <span class="melody-indicator" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>{{ isPlaying ? '正在轻轻哼唱 · 点按暂停' : '轻触星球，听一段生日旋律' }}</span>
          </span>
        </button>
        <span class="orbit-label orbit-label--bottom">EST. 2026.10.28<br><span>每过一次生日，多留下一圈光。</span></span>
        <p v-if="audioNotice" class="audio-notice" role="status">{{ audioNotice }}</p>
      </div>

        <div class="planet-wish">
          <p>愿你的好奇心一直有地方落脚，<br>认真做的事慢慢有回声。</p>
          <p>身边有人，心里有光，<br>也有许多单纯因为喜欢而度过的日子。</p>
        </div>
        <button class="letter-invitation" @click="openLetter()">
          {{ invitationLabel }}
        </button>
        <p class="planet-small-note">一封信，一段旋律，一颗只为你转动的星球。</p>
      </div>


    </section>

    <footer class="planet-footer">
      <div class="planet-year"><span class="planet-year-mark" aria-hidden="true">◌</span><span>第 {{ birthday.anniversary }} 圈光 <small>从我们相遇的这个生日开始</small></span></div>
      <div v-if="letters.length" class="planet-letters" aria-label="生日信件">
        <button v-for="letter in [...letters].reverse()" :key="letter.year" @click="openLetter(letter)">
          <span aria-hidden="true">✉</span> {{ letter.year }} 的信 <span class="letter-state">{{ letterLabel(letter) }}</span>
        </button>
      </div>
      <p v-else class="planet-footer-note">宇宙很大，<br>这一小片属于你。</p>
      <span class="planet-signature">WITH A LITTLE STARDUST, CODEX</span>
    </footer>

    <dialog ref="dialog" class="birthday-letter" aria-labelledby="birthday-letter-title" @click="event => { if (event.target === dialog) dialog.close() }">
      <button class="letter-close" aria-label="关闭信件" @click="dialog.close()">×</button>
      <span class="letter-eyebrow">A LETTER TO YOUR NEXT ORBIT</span>
      <h2 id="birthday-letter-title">{{ mode === 'read' ? '嘿，又见面了。' : mode === 'sealed' ? '把这一天，轻轻收好。' : '亲爱的，下一岁的我：' }}</h2>
      <template v-if="mode === 'write'">
        <p class="letter-description">记下今天的小事、一个愿望，或一句想对未来说的话。<br>在 {{ dateLabel(displayedOpening) }}，再来读读它。</p>
        <label class="visually-hidden" for="birthday-letter-text">写给下一岁的自己</label>
        <textarea id="birthday-letter-text" v-model="draft" maxlength="5000" rows="8" placeholder="此刻的我，想告诉你……" autofocus></textarea>
        <div class="letter-draft-meta"><span>暂时关上，也能留在这页继续写。</span><span>{{ draft.length }} / 5000</span></div>
        <div class="letter-actions">
          <button class="letter-primary" :disabled="!draft.trim()" @click="storeLetter">存好这封信</button>
          <button class="letter-secondary" :disabled="!draft.trim()" @click="copyLetter">复制留存</button>
        </div>
      </template>
      <template v-else-if="mode === 'sealed'">
        <div class="sealed-envelope" aria-hidden="true"><span>10.28</span><i>✦</i></div>
        <p class="letter-description letter-center">有些话，留给未来的自己刚刚好。<br><strong>{{ dateLabel(selectedLetter.opensOn) }}</strong>，来拆这封信吧。</p>
        <div class="letter-actions letter-actions--center">
          <button v-if="selectedLetter.year === cycleYear" class="letter-secondary" @click="editLetter">再写几句</button>
          <button class="letter-secondary" @click="copyLetter">复制留存</button>
        </div>
      </template>
      <template v-else>
        <p class="letter-description">这是 {{ selectedLetter.year }} 年的你，留给今天的一束光。</p>
        <div class="opened-letter">{{ selectedLetter.text }}</div>
        <div class="letter-actions"><button class="letter-secondary" @click="copyLetter">复制留存</button></div>
      </template>
      <p v-if="notice" class="letter-notice" role="status">{{ notice }}</p>
      <p v-if="storageWarning" class="letter-notice" role="status">{{ storageWarning }}</p>
      <p class="letter-privacy">信件只保存在当前浏览器，不会上传。清除浏览数据后会丢失，请复制一份留存。</p>
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
.is-playing .planet-art { filter: brightness(1.12) drop-shadow(0 0 20px #e6c99020); }
.planet-touch-hint { position: absolute; left: 0; right: 0; bottom: 3%; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 12px; letter-spacing: .045em; color: #b3bfd1; }
.melody-indicator { display: inline-flex; align-items: center; justify-content: center; gap: 3px; width: 20px; height: 18px; }
.melody-indicator i { width: 2px; height: 5px; border-radius: 2px; background: var(--planet-gold); transform-origin: center; transition: height .3s; }
.melody-indicator i:nth-child(2) { height: 10px; }
.is-playing .melody-indicator i { height: 14px; animation: birthday-notes 1.1s ease-in-out infinite alternate; }
.is-playing .melody-indicator i:nth-child(2) { animation-delay: -.4s; }
.is-playing .melody-indicator i:nth-child(3) { animation-delay: -.8s; }
.melody-orbit { opacity: 0; stroke-dasharray: 32 968; transition: opacity .5s; }
.is-playing .melody-orbit { opacity: .8; animation: birthday-orbit 8.8s linear infinite; }
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
.planet-letters { display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; }
.planet-letters button { color: #d3c6b0; border: 1px solid #b5c0d126; background: #d4bc8f08; border-radius: 3px; padding: 9px 12px; font-size: 12px; line-height: 1.7; }
.planet-letters button > span:first-child { padding-right: 5px; }
.letter-state { display: block; color: #9eabc0; font-size: 11px; }
.birthday-letter { position: fixed; inset: 0; width: min(570px, calc(100vw - 36px)); max-height: calc(100svh - 36px); padding: 42px; margin: auto; overflow: auto; color: #ece6d9; background: #131c2a; border: 1px solid #b6a78c55; border-radius: 8px; box-shadow: 0 30px 120px #0009; }
.birthday-letter::backdrop { background: #030914ce; backdrop-filter: blur(9px); }
.letter-close { position: absolute; right: 12px; top: 8px; width: 44px; height: 44px; color: #aab5c5; border: 0; background: none; font-size: 26px !important; }
.letter-eyebrow { display: block; margin-bottom: 20px; color: #c6b18b; font-size: 9px; letter-spacing: .14em; }
.birthday-letter h2 { margin: 0 0 15px; color: #f0e7d8; font-family: 'LXGW WenKai', serif; font-size: clamp(22px, 4vw, 29px); font-weight: 400; }
.letter-description { margin: 0 0 22px; color: #b3bed0; font-size: 14px; line-height: 1.9; }
.letter-description strong { color: #dfc79b; font-weight: 400; }
.birthday-letter textarea { display: block; width: 100%; padding: 15px; resize: vertical; min-height: 180px; max-height: 45svh; border: 1px solid #b2bdce35; border-radius: 3px; outline: none; color: #eee6d8; background: #0b1321; font-family: 'LXGW WenKai', serif; font-size: 16px; line-height: 1.9; }
.birthday-letter textarea:focus { border-color: #d8bc81a0; box-shadow: 0 0 0 2px #d8bc8110; }
.birthday-letter textarea::placeholder { color: #64748c; }
.letter-draft-meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 9px; color: #99a7bd; font-size: 11px; line-height: 1.6; }
.letter-actions { display: flex; align-items: center; gap: 18px; margin-top: 20px; }
.letter-actions--center { justify-content: center; }
.letter-primary { border: 1px solid #dcc299; border-radius: 3px; min-height: 44px; padding: 12px 20px; background: #ddc699; color: #18202d; font-size: 14px !important; }
.letter-secondary { min-height: 44px; padding: 11px 0; border: 0; background: none; color: #d3bd96; font-size: 13px !important; text-decoration: underline; text-underline-offset: 4px; }
.letter-primary:disabled, .letter-secondary:disabled { cursor: default; opacity: .4; }
.letter-privacy { margin: 25px 0 0; padding-top: 17px; border-top: 1px solid #bbc9e01a; color: #99a7bd; font-size: 12px; line-height: 1.8; }
.letter-notice { color: #dec79a; font-size: 12px; line-height: 1.8; margin: 16px 0 0; }
.sealed-envelope { position: relative; width: 190px; height: 110px; margin: 38px auto 28px; display: grid; place-items: end center; padding-bottom: 18px; border: 1px solid #b6a17b77; border-radius: 3px; background: linear-gradient(28deg, transparent 49.5%, #b6a17b33 50%, transparent 50.7%), linear-gradient(-28deg, transparent 49.5%, #b6a17b33 50%, transparent 50.7%), #a99a7510; }
.sealed-envelope > span { font-family: ui-monospace, monospace; color: #b49d77; font-size: 10px; letter-spacing: .2em; }
.sealed-envelope > i { position: absolute; left: calc(50% - 15px); top: 35px; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #c9ad7c; color: #19202a; font-size: 16px; font-style: normal; }
.letter-center { text-align: center; }
.opened-letter { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 42svh; overflow-y: auto; padding: 20px; border-left: 1px solid #b7a17e77; background: #0b132155; color: #d8d3ca; font-family: 'LXGW WenKai', serif; font-size: 16px; line-height: 2; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes birthday-twinkle { from { opacity: .18; } to { opacity: .65; } }
@keyframes birthday-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes birthday-orbit { to { stroke-dashoffset: -1000; } }
@keyframes birthday-notes { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
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
  .planet-observatory { width: min(100%, 390px); margin: 8px auto 28px; padding: 24px 0 38px; }
  .orbit-label--top { top: 0; right: 0; font-size: 10px; }
  .orbit-label--bottom { bottom: 0; left: 5px; font-size: 9px; }
  .orbit-label--bottom > span { font-size: 10px; }
  .planet-touch-hint { font-size: 11px; bottom: 0; letter-spacing: 0; }
  .planet-footer { flex-wrap: wrap; min-height: 130px; gap: 20px; padding: 22px 0; }
  .planet-signature { width: 100%; font-size: 8px; text-align: right; }
  .planet-letters { justify-content: flex-start; }
  .birthday-letter { padding: 38px 22px 24px; }
  .letter-description { font-size: 13px; }
  .letter-privacy { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .birthday-sky i, .planet-art, .is-playing .melody-orbit, .is-playing .melody-indicator i { animation: none; }
  .planet-art, .planet-home, .letter-invitation, .melody-orbit, .melody-indicator i { transition: none; }
}
@media (forced-colors: active) {
  .planet-art { forced-color-adjust: none; }
  .planet-instrument, .letter-invitation { border: 1px solid ButtonText; }
}
</style>
