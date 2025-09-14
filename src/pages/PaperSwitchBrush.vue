<template>
  <div class="psb-root no-page-scroll">
    <!-- 背景：随机不等大多边形 + 更深遮罩 -->
    <div class="bg">
      <div class="tile t1"></div>
      <div class="tile t2"></div>
      <div class="tile t3"></div>
      <div class="tile t4"></div>
      <div class="tile t5"></div>
      <div class="tile t6"></div>
      <div class="tile t7"></div>
      <div class="tile t8"></div>
      <div class="tile t9"></div>
      <div class="tile t10"></div>
      <div class="tile t11"></div>
      <div class="dark-overlay"></div>
    </div>

    <!-- 舞台（绝对居中，只显示一张卡） -->
    <div class="stage" ref="stageRef">
      <transition :name="transitionName" mode="out-in">
        <!-- Intro -->
        <section
          v-if="pageIdx === -1"
          key="intro"
          class="card hero"
          ref="cardRef"
          @wheel.passive="onWheel"
          @keydown.stop.prevent="onKey"
          tabindex="0"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <h1>Paper Switch Brush</h1>
          <img class="psb-logo" src="/fig/psb.svg" alt="psb" />
          <p class="hint">Scroll ↓</p>
        </section>

        <!-- 论文卡片 -->
        <article
          v-else-if="pageIdx >= 0 && pageIdx < items.length"
          :key="curPaper['arXiv id']"
          class="card glass"
          ref="cardRef"
          @wheel.passive="onWheel"
          @keydown.stop.prevent="onKey"
          tabindex="0"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <header class="head">
            <h2 class="title">{{ curPaper.title }}</h2>
            <div class="meta">
              <span class="date">{{ toDate(curPaper.date) }}</span>
              <span class="dot">•</span>
              <span class="authors">{{ curPaper['author list'].join(', ') }}</span>
            </div>
            <div class="tags">
              <span class="tag">{{ curPaper.theme || 'Unknown Theme' }}</span>
            </div>
          </header>

          <section class="content">
            <div class="block">
              <h3>Problem</h3>
              <div class="md" v-html="renderMD(curPaper.problem)"></div>
            </div>
            <div class="block">
              <h3>Method</h3>
              <div class="md" v-html="renderMD(curPaper.method)"></div>
            </div>
            <div class="block">
              <h3>Result</h3>
              <div class="md" v-html="renderMD(curPaper.result)"></div>
            </div>
          </section>

          <footer class="actions spread">
            <a class="psb_cblock" :href="safePdf(curPaper['arXiv pdf adress'])" target="_blank" rel="noopener">
              Read&nbsp;PDF
            </a>
            <button class="psb_cblock" :class="{ liked: isLiked(curPaper) }" @click="toggleLike(curPaper)">
              {{ isLiked(curPaper) ? 'Liked' : 'Like' }}
            </button>
            <button class="psb_cblock pager-pill" @click="jumpPrompt">
              {{ pageIdx + 1 }} / {{ items.length }}
            </button>
          </footer>
        </article>

        <!-- 汇总卡片 -->
        <article
          v-else
          key="summary"
          class="card glass summary"
          ref="cardRef"
          @wheel.passive="onWheel"
          @keydown.stop.prevent="onKey"
          tabindex="0"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <header class="head">
            <h2 class="title">Today’s Picks</h2>
            <div class="meta">
              <span class="date">{{ todayISO }}</span>
              <span class="dot">•</span>
              <span class="muted">Total liked: {{ likedToday.length }}</span>
            </div>
          </header>

          <section class="summary-list">
            <ol v-if="likedToday.length">
              <li v-for="id in likedToday" :key="id">
                <span class="sum-title">{{ titleById(id) || id }}</span>
                <span class="sum-id">({{ id }})</span>
              </li>
            </ol>
            <p v-else class="muted">No liked items yet.</p>
          </section>

          <footer class="actions spread">
            <button class="psb_cblock primary" :disabled="!likedToday.length" @click="copyAndClear">I&nbsp;get</button>
            <button class="psb_cblock" :disabled="!likedToday.length" @click="clearToday">Clear&nbsp;today</button>
            <button class="psb_cblock" @click="clearAll">Clear&nbsp;all</button>
          </footer>
        </article>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* ======= 日期工具与数据回退（当天 → 前一天） ======= */
function keyFromDate(d) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}_${mm}_${yy}`
}
const today = new Date()
const dateKey = keyFromDate(today)
const activeKey = ref(dateKey) // 实际加载成功的数据键
const prevDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
const prevKey = keyFromDate(prevDate)

function urlFor(key) {
  return `https://raw.githubusercontent.com/liuyinchu/paper-radar/main/out/${key}_Daily_Arxiv.json`
}

const items = ref([])
const todayISO = today.toISOString().slice(0, 10)

async function loadDailyWithFallback() {
  // 先试当天，失败就试前一天
  const tryList = [dateKey, prevKey]
  for (const key of tryList) {
    try {
      const r = await fetch(urlFor(key), { cache: 'no-store' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      items.value = Array.isArray(data) ? data : [data]
      activeKey.value = key
      return
    } catch (_) {
      // try next
    }
  }
  items.value = [] // 实在找不到就保持空
}
onMounted(loadDailyWithFallback)

/* ======= 页面 Chrome 处理：仅本页隐藏页眉/页脚 + 禁止整页滚动 ======= */
let headerEl = null, footerEl = null, headerOld = '', footerOld = ''
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  headerEl = document.querySelector('header')
  footerEl = document.querySelector('footer')
  if (headerEl) { headerOld = headerEl.style.display; headerEl.style.display = 'none' }
  if (footerEl) { footerOld = footerEl.style.display; footerEl.style.display = 'none' }
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  if (headerEl) headerEl.style.display = headerOld
  if (footerEl) footerEl.style.display = footerOld
})

/* ======= 单卡分页控制（同位切换 & 只在卡片区域响应） ======= */
const pageIdx = ref(-1) // -1: intro, 0..N-1: papers, N: summary
const transitioning = ref(false)
const direction = ref('down')
const transitionName = computed(() => (direction.value === 'down' ? 'slide-up-elastic' : 'slide-down-elastic'))
const cardRef = ref(null)
const stageRef = ref(null)

const curPaper = computed(() => items.value[pageIdx.value] || {})

function insideCard(x, y) {
  const el = cardRef.value
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function step(delta) {
  if (transitioning.value) return
  const next = pageIdx.value + delta
  if (next < -1) return
  if (next > items.value.length) return
  direction.value = delta > 0 ? 'down' : 'up'
  transitioning.value = true
  pageIdx.value = next
  setTimeout(() => (transitioning.value = false), 460) // 与 CSS 动画时长匹配
}

function onWheel(e) {
  if (!insideCard(e.clientX, e.clientY)) return
  if (Math.abs(e.deltaY) < 8) return
  step(e.deltaY > 0 ? +1 : -1)
}

function onKey(e) {
  // 键盘在卡片聚焦时才有效
  if (document.activeElement !== cardRef.value) return
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) step(+1)
  if (['ArrowUp', 'PageUp'].includes(e.key)) step(-1)
}

let touchY = 0, touchX = 0
function onTouchStart(e) {
  const t = e.changedTouches[0]
  if (!insideCard(t.clientX, t.clientY)) return
  touchY = t.clientY
  touchX = t.clientX
}
function onTouchEnd(e) {
  const t = e.changedTouches[0]
  if (!insideCard(t.clientX, t.clientY)) return
  const dy = t.clientY - touchY
  const dx = t.clientX - touchX
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
    step(dy < 0 ? +1 : -1)
  }
}

/* ======= Markdown（轻量） ======= */
function renderMD(t) {
  if (!t) return ''
  let html = t
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>')
  return html
}

/* ======= Like（按日, 响应式） ======= */
const LS_LIKES_KEY = 'paperbrush_likes'
function getMap() { try { return JSON.parse(localStorage.getItem(LS_LIKES_KEY)) || {} } catch { return {} } }
function setMap(m) { localStorage.setItem(LS_LIKES_KEY, JSON.stringify(m)) }

// 响应式缓存，点击后立刻触发视图更新
const likesMap = ref(getMap())
function likedOfReactive(dk) {
  const a = likesMap.value[dk]
  return Array.isArray(a) ? a : []
}
const likedToday = computed(() => likedOfReactive(activeKey.value))

function isLiked(p) {
  return likedToday.value.includes(p['arXiv id'])
}
function toggleLike(p) {
  const id = p['arXiv id']
  const m  = { ...likesMap.value }
  const arr = likedOfReactive(activeKey.value).slice()
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
  m[activeKey.value] = arr
  likesMap.value = m
  setMap(m)
}

/* ======= 工具 ======= */
function toDate(s) { if (!s) return ''; const d = new Date(s); return isNaN(d) ? s : d.toISOString().slice(0,10) }
function safePdf(u) { if (!u) return '#'; return u.startsWith('http') ? u : ('https://' + u.replace(/^\/\//,'')) }
function titleById(id) { const f = items.value.find(x => x['arXiv id'] === id); return f?.title || '' }

/* ======= 汇总操作 ======= */
async function copyAndClear() {
  const text = likedToday.value.map(id => titleById(id) || id).join('\n')
  try { await navigator.clipboard.writeText(text) }
  catch {
    const ta = document.createElement('textarea'); ta.value = text
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
  }
  clearToday()
}
function clearToday() {
  const m = { ...likesMap.value }
  delete m[activeKey.value]
  likesMap.value = m
  setMap(m)
}
function clearAll() {
  localStorage.removeItem(LS_LIKES_KEY)
  likesMap.value = {}
}
/* ======= n/N 点击跳转 ======= */
function jumpPrompt() {
  const n = prompt(`Jump to card (1..${items.value.length})`)
  if (!n) return
  const idx = Math.max(1, Math.min(items.value.length, parseInt(n, 10)))
  if (!Number.isFinite(idx)) return
  // 计算方向用于动画
  direction.value = (idx - 1) > pageIdx.value ? 'down' : 'up'
  pageIdx.value = idx - 1
}
</script>

<style scoped>
:root {
  --background-color: var(--ctp-mocha-base);
  --text-color: var(--ctp-mocha-text);
  --surface-color: var(--ctp-mocha-surface0);
  --surface-color-hover: var(--ctp-mocha-surface1);
  --border-color: var(--ctp-mocha-surface2);

  --primary-color: var(--ctp-mocha-blue);
  --primary-color-hover: var(--ctp-mocha-sky);
  --accent-color: var(--ctp-mocha-mauve);
  --link-color: var(--ctp-mocha-lavender);

  --success-color: var(--ctp-mocha-green);
  --warning-color: var(--ctp-mocha-yellow);
  --danger-color: var(--ctp-mocha-red);

  --frosted-glass: rgba(var(--ctp-mocha-base-rgb), 0.75);

  --radius: 16px;
  --shadow: 0 14px 48px rgba(0,0,0,0.48);
  --thin: 1px;
}

.psb-root { position: fixed; inset: 0; background: var(--background-color); color: var(--text-color); z-index: 0; }

/* 背景块更多 + 铺满 */
.bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.tile { position: absolute; opacity: .85; filter: blur(.6px) saturate(.95); }
.t1 { background: var(--ctp-mocha-mauve);  width:42vmax; height:40vmax; left:-8vmax; top:-6vmax; transform:rotate(6deg);  clip-path: polygon(0 0, 85% 0, 70% 62%, 0 72%); }
.t2 { background: var(--ctp-mocha-blue);   width:30vmax; height:28vmax; right:-6vmax; top:2vmax;  transform:rotate(-16deg); clip-path: polygon(10% 10%, 100% 0, 92% 92%, 0 70%); }
.t3 { background: var(--ctp-mocha-lavender); width:32vmax; height:30vmax; left:10vmax; bottom:-6vmax; transform:rotate(14deg); clip-path: polygon(0 30%, 80% 0, 100% 70%, 20% 100%); }
.t4 { background: var(--ctp-mocha-sky);     width:24vmax; height:26vmax; right:14vmax; bottom:10vmax; transform:rotate(8deg);  clip-path: polygon(0 0, 100% 20%, 70% 100%, 10% 80%); }
.t5 { background: var(--ctp-mocha-teal);    width:22vmax; height:18vmax; left:50%; top:45%; transform:translate(-50%,-50%) rotate(-10deg); clip-path: polygon(0 40%, 60% 0, 100% 60%, 30% 100%); }
.t6 { background: var(--ctp-mocha-peach);   width:20vmax; height:22vmax; right:4vmax; bottom:-4vmax; transform:rotate(24deg); clip-path: polygon(0 30%, 90% 0, 100% 80%, 20% 100%); }
.t7 { background: var(--ctp-mocha-green);   width:16vmax; height:18vmax; left:-4vmax; bottom:8vmax; transform:rotate(-8deg); clip-path: polygon(0 0, 100% 30%, 70% 100%, 0 80%); }
.t8 { background: var(--ctp-mocha-rosewater, #f5e0dc); width:18vmax; height:18vmax; left:22vmax; top:8vmax; transform:rotate(22deg); clip-path: polygon(0 20%, 100% 0, 80% 100%, 10% 90%); opacity: .35; }
.t9 { background: var(--ctp-mocha-yellow); width:14vmax; height:12vmax; right:26vmax; top:22vmax; transform:rotate(-12deg); clip-path: polygon(0 10%, 100% 30%, 80% 100%, 10% 90%); opacity: .3; }

/* 更深黑色滤镜 */
.dark-overlay { position:absolute; inset:0; background: radial-gradient(ellipse at 60% 40%, rgba(0,0,0,.58), rgba(0,0,0,.88)); }

/* 舞台（绝对居中） */
.stage {
  position: absolute; inset: 0; display: grid; place-items: center; z-index: 1;
}

/* 单卡居中（固定尺寸，竖向更短） */
.card {
  width: min(980px, 92vw);
  height: min(68vh, 760px); /* ↓ 比之前更矮，包括 summary */
  border-radius: var(--radius);
  border: var(--thin) solid var(--border-color);
  box-shadow: var(--shadow);
  padding: clamp(14px, 2.6vw, 26px);
  display: flex; flex-direction: column;
  position: absolute; left: 50%; top: 50%; translate: -50% -50%;
}

/* Intro */
.hero { background: transparent; border: none; box-shadow: none; }
.hero h1 { font-size: clamp(32px, 5.2vw, 56px); margin: 0 0 10px; font-weight: 900; }
.psb-logo { display: block; margin: 10px auto 0; width: min(120%, 680px); max-width: 120%; }
.hint { margin-top: 10px; opacity: .75; text-align: center; }

/* 毛玻璃卡 */
.glass {
  background: linear-gradient(to bottom right, rgba(17,17,17,0.2), rgba(17,17,17,0.8));
  backdrop-filter: blur(16px) saturate(1.05);
  -webkit-backdrop-filter: blur(16px) saturate(1.05);
}

/* 头部与信息 */
.head .title { font-size: clamp(18px, 2.7vw, 28px); font-weight: 800; margin: 0 0 6px; }
.meta { display:flex; flex-wrap:wrap; gap:8px; align-items:center; opacity:.9; }
.meta .dot { opacity:.6; }
.tags { margin-top: 8px; }
.tag {
  display:inline-block; font-size:12px; padding:4px 10px; border-radius:999px;
  border:1px solid var(--border-color); background:rgba(255,255,255,0.04); color:var(--link-color);
}

/* 内容区（窄屏单列） */
.content {
  margin-top: clamp(8px, 2vw, 12px);
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: clamp(10px, 2vw, 16px);
  overflow: auto; padding-right: 6px;
}
@media (max-width: 1080px) { .content { grid-template-columns: 1fr; } }
.block h3 { margin: 0 0 6px; font-size: 12px; letter-spacing:.04em; text-transform:uppercase; color: var(--accent-color); }
.md { font-size: 15px; line-height: 1.62; }
.md a { color: var(--link-color); text-decoration: underline; }
.md code { padding: 0 .35em; border-radius: 4px; background: rgba(255,255,255,0.08); border: 1px solid var(--border-color); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }

/* 操作区：三块大按钮（等宽等高，分散摆放，不挤） */
.actions.spread {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: clamp(12px, 2.2vw, 20px);
  margin-top: auto;
}

/* psb_cblock：统一大块按钮 */
.psb_cblock {
  display: inline-flex; align-items: center; justify-content: center;
  height: clamp(46px, 8vh, 64px);
  padding: 0 14px;
  border-radius: 14px;
  font-weight: 800;
  font-size: clamp(14px, 1.8vw, 16px);
  border: var(--thin) solid var(--border-color);
  background: #6c7086;
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: transform .08s ease, background .15s ease, border-color .15s ease;
}
.psb_cblock:hover { background: var(--surface-color-hover); transform: translateY(-1px); }
.psb_cblock:active { transform: translateY(0); }

.psb_cblock.primary {
  background: var(--primary-color);
  border-color: transparent;
  color: #0b0b0b;
}
.psb_cblock.ghost { background: transparent; }
.psb_cblock.liked {
  background: linear-gradient(135deg, var(--success-color), #89dceb);
  border-color: var(--success-color);
  color: #1e1e2e;
}

/* n/N 色块样式（可点击跳转） */
.pager-pill {
  background: linear-gradient(135deg, var(--ctp-mocha-mauve), var(--ctp-mocha-blue));
  color: #0b0b0b;
  border: none;
}

/* Summary 列表（高度随整体更矮） */
.summary .summary-list { margin-top: 8px; max-height: 48vh; overflow: auto; padding-right: 6px; }
.summary ol { margin: 0; padding-left: 18px; }
.summary li { margin: 8px 0; display: flex; gap: 6px; align-items: baseline; }
.sum-title { font-weight: 600; }
.sum-id { opacity: 0.6; }

/* 进出场动画：同位 + 弹性 */
.slide-up-elastic-enter-from   { opacity: 0; transform: translateY(46px) scale(.985); }
.slide-up-elastic-enter-active { transition: all .46s cubic-bezier(.2, .9, .1, 1.2); }
.slide-up-elastic-leave-to     { opacity: 0; transform: translateY(-46px) scale(.985); }
.slide-up-elastic-leave-active { transition: all .46s cubic-bezier(.2, .9, .1, 1.2); position: absolute; left:50%; top:50%; translate:-50% -50%; }

.slide-down-elastic-enter-from   { opacity: 0; transform: translateY(-46px) scale(.985); }
.slide-down-elastic-enter-active { transition: all .46s cubic-bezier(.2, .9, .1, 1.2); }
.slide-down-elastic-leave-to     { opacity: 0; transform: translateY(46px) scale(.985); }
.slide-down-elastic-leave-active { transition: all .46s cubic-bezier(.2, .9, .1, 1.2); position: absolute; left:50%; top:50%; translate:-50% -50%; }

/* === 首页（Intro）内容改为严格居中 === */
.hero {
  background: transparent;
  border: none;
  box-shadow: none;
  /* 固定卡片仍保持绝对居中由 .card 控制，这里确保内容在卡片内部也居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}
.hero h1 {
  /* 居中放置，适配更窄屏 */
  font-size: clamp(30px, 4.8vw, 52px);
  margin: 0;
  font-weight: 900;
}

/* SVG 改大（120% -> 160%），并限制最大宽度 */
.psb-logo {
  display: block;
  margin: 6px auto 0;
  width: min(200%, 1000px);  /* 拉大 */
  max-width: 250%;
}

/* === 背景色块：铺满视口（增加覆盖密度与尺寸） === */
.bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; }

/* 统一基础样式 */
.tile { position: absolute; opacity: .9; filter: blur(.6px) saturate(.95); }

/* 放大已有块的尺寸与覆盖范围 */
.t1 { background: var(--ctp-mocha-mauve);
      width:55vmax; height:50vmax; left:-12vmax; top:-10vmax;
      transform:rotate(6deg);
      clip-path: polygon(0 0, 88% 0, 70% 62%, 0 80%); }
.t2 { background: var(--ctp-mocha-blue);
      width:38vmax; height:34vmax; right:-10vmax; top:-4vmax;
      transform:rotate(-16deg);
      clip-path: polygon(6% 12%, 100% 0, 94% 96%, 0 70%); }
.t3 { background: var(--ctp-mocha-lavender);
      width:42vmax; height:40vmax; left:6vmax; bottom:-12vmax;
      transform:rotate(12deg);
      clip-path: polygon(0 26%, 80% 0, 100% 70%, 18% 100%); }
.t4 { background: var(--ctp-mocha-sky);
      width:34vmax; height:38vmax; right:8vmax; bottom:4vmax;
      transform:rotate(10deg);
      clip-path: polygon(0 0, 100% 18%, 70% 100%, 10% 80%); }
.t5 { background: var(--ctp-mocha-teal);
      width:30vmax; height:26vmax; left:48%; top:48%;
      transform:translate(-50%,-50%) rotate(-10deg);
      clip-path: polygon(0 38%, 60% 0, 100% 60%, 30% 100%); }
.t6 { background: var(--ctp-mocha-peach);
      width:26vmax; height:30vmax; right:-6vmax; bottom:-8vmax;
      transform:rotate(24deg);
      clip-path: polygon(0 30%, 90% 0, 100% 80%, 20% 100%); }
.t7 { background: var(--ctp-mocha-green);
      width:24vmax; height:22vmax; left:-8vmax; bottom:10vmax;
      transform:rotate(-8deg);
      clip-path: polygon(0 0, 100% 30%, 70% 100%, 0 80%); }

/* 新增补足块，确保四角与中心空白被覆盖 */
.t8 { background: var(--ctp-mocha-rosewater, #f5e0dc);
      width:26vmax; height:24vmax; left:22vmax; top:6vmax;
      transform:rotate(20deg);
      clip-path: polygon(0 18%, 100% 0, 84% 100%, 8% 88%);
      opacity:.4; }
.t9 { background: var(--ctp-mocha-yellow);
      width:22vmax; height:20vmax; right:24vmax; top:24vmax;
      transform:rotate(-12deg);
      clip-path: polygon(0 8%, 100% 26%, 82% 100%, 10% 90%);
      opacity:.35; }
/* 额外两块进一步铺满上下边缘 */
.t10 { background: var(--ctp-mocha-blue);
       width:50vmax; height:18vmax; left:-10vmax; top:55%;
       transform:rotate(-4deg);
       clip-path: polygon(0 0, 100% 10%, 96% 100%, 6% 90%); opacity:.25; }
.t11 { background: var(--ctp-mocha-lavender);
       width:46vmax; height:20vmax; right:-12vmax; top:18%;
       transform:rotate(8deg);
       clip-path: polygon(4% 6%, 96% 0, 100% 88%, 0 100%); opacity:.22; }

/* 深色遮罩再加深一点点 */
.dark-overlay{
  position:absolute; inset:0;
  background: radial-gradient(ellipse at 60% 40%, rgba(0,0,0,.62), rgba(0,0,0,.9));
}
</style>