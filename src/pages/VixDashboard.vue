<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  fetchIndexCloses, fetchQuoteSnapshot, mergeIndexCloses,
  VIX_HISTORY_PROXY, VIX_SNAPSHOT_PATH, VIX_SYMBOLS,
} from '../utils/vix-quotes.mjs'

const instruments = [
  { symbol: 'VIX', label: '标普恐慌', ticks: [10, 20, 30, 45] },
  { symbol: 'VXN', label: '纳指恐慌', ticks: [12, 22, 32, 48] },
  { symbol: 'VVIX', label: '黑天鹅度', ticks: [70, 95, 115, 150] },
]

const bands = [
  { range: '<15', name: '极低波满仓', tone: 'low', tag: '极度平静区', headline: '量化多头满仓巡航（对应 CTA 持仓 > +100 亿美元）', body: '当 VIX 低于 15 时，波动率目标基金（Vol-Control）与 CTA 会将杠杆开到最大。此时市场呈现低波慢牛，但多头极度拥挤，需警惕波动率突然抬头引发多杀多。' },
  { range: '15–20', name: '慢牛回补', tone: 'low', tag: '右侧抄底确认区', headline: '★ 右侧最佳击球点：VIX 跌破 20 触发百亿级“空头回补 + 波动率买盘”！', body: '一旦 VIX 从当前的 25 回落至 20 以下（VXN 降至 27 以下），期权做市商将平掉空头对冲盘（Vanna 顺风买盘），同时 CTA 与波动率控制基金被迫把 -38.7 亿美元空单回补翻多，形成戴维斯双击式的右侧反弹。' },
  { range: '20–26', name: '降仓警戒', tone: 'mid', tag: '高波压制期', headline: '这解释了为何纳指 CTA 持仓会被垂直砸到 -3.87B！', body: '量化基金仓位与波动率成反比（目标仓位 ∝ 1 / 波动率）。在参考情景中，VXN 为 34.6，较 VIX 高出近 10 点，而 VVIX 为 101.5。' },
  { range: '26–33', name: '恐慌抛售', tone: 'high', tag: '恐慌急跌区', headline: '市场进入剧烈震荡寻底，CTA 空头接近风控极限 (-4B ~ -6B)', body: '当 VIX 处于 26–33 区间时，参考情景关注波动率扩大时的仓位调整、止损与对冲行为。' },
  { range: '>33', name: '极值黄金坑', tone: 'high', tag: '极端流动性冲击', headline: '历史级恐慌极值（十年黄金坑，对应 CTA 触及 -6.01B 极限）', body: '在参考沙盘中，VIX 高于 33 属于最高一档。拖动滑杆可对比 VIX、VXN 和 VVIX 在不同波动水平下的推演读数。' },
]

const dark = ref(true)
const selected = ref('VIX')
const scenarioVix = ref(null)
const snapshot = ref(null)
const refreshing = ref(false)
const refreshStatus = ref('')
const publicQuoteUrl = import.meta.env.VITE_VIX_QUOTE_URL
const lifetime = new AbortController()

const quotes = computed(() => snapshot.value?.quotes)
const inScenario = computed(() => scenarioVix.value !== null)
const values = computed(() => {
  if (inScenario.value) {
    const vix = scenarioVix.value
    return { VIX: vix, VXN: +(vix * 1.384).toFixed(1), VVIX: +(72 + vix * 1.18).toFixed(1) }
  }
  return Object.fromEntries(VIX_SYMBOLS.map(symbol => [symbol, quotes.value?.[symbol]?.value]))
})
const sliderValue = computed(() => scenarioVix.value ?? values.value.VIX ?? 25)

const activeBand = computed(() => {
  const vix = values.value.VIX
  if (!Number.isFinite(vix)) return -1
  if (vix < 15) return 0
  if (vix < 20) return 1
  if (vix <= 26) return 2
  return vix <= 33 ? 3 : 4
})
const band = computed(() => bands[activeBand.value])

const snapshotKind = computed(() => ({
  close: '日收盘',
  delayed: '延时行情',
  live: '实时行情',
})[snapshot.value?.kind] ?? '行情')
const commonDate = computed(() => {
  const dates = new Set(VIX_SYMBOLS.map(symbol => quotes.value?.[symbol]?.date))
  return dates.size === 1 ? dates.values().next().value : undefined
})
const spread = computed(() => {
  const { VIX, VXN } = values.value
  if (!Number.isFinite(VIX) || !Number.isFinite(VXN)) return '—'
  if (!inScenario.value && quotes.value.VIX.date.slice(0, 10) !== quotes.value.VXN.date.slice(0, 10)) return '日期不同'
  const difference = VXN - VIX
  return (difference >= 0 ? '+' : '') + difference.toFixed(inScenario.value ? 1 : 2) + ' pt'
})
const range52w = computed(() => {
  const range = quotes.value?.VIX.range52w
  return range ? '52W: ' + range.map(value => value.toFixed(1)).join('–') : '量程 10–45'
})

function formatValue(symbol) {
  const value = values.value[symbol]
  return Number.isFinite(value) ? value.toFixed(inScenario.value ? 1 : 2) : '—'
}

const timeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit',
  minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})
function formatDate(date) {
  return date.length === 10 ? date : timeFormat.format(new Date(date)) + ' 北京时间'
}

function toneFor(instrument) {
  const value = values.value[instrument.symbol]
  if (!Number.isFinite(value)) return 'idle'
  return value < instrument.ticks[1] ? 'low' : value < instrument.ticks[2] ? 'mid' : 'high'
}

function angleFor(instrument) {
  const { symbol, ticks } = instrument
  const value = values.value[symbol]
  if (!Number.isFinite(value)) return -90
  const bounded = Math.min(ticks[3], Math.max(ticks[0], value))
  const segment = bounded < ticks[1] ? 0 : bounded < ticks[2] ? 1 : 2
  return -90 + 60 * (segment + (bounded - ticks[segment]) / (ticks[segment + 1] - ticks[segment]))
}

const diagnosis = computed(() => {
  if (!band.value) return { tag: '行情', headline: '正在等待指数读数', body: '载入后可点击表盘查看说明，或拖动滑杆推演。' }
  if (selected.value === 'VXN') {
    return {
      tag: 'VXN ' + formatValue('VXN'),
      headline: '纳斯达克 100 的隐含波动率',
      body: 'VXN 由纳斯达克 100 指数期权推导。当前面板的 VXN − VIX 为 ' + spread.value + '。',
    }
  }
  if (selected.value === 'VVIX') {
    return {
      tag: 'VVIX ' + formatValue('VVIX'),
      headline: 'VIX 本身的预期波动率',
      body: 'VVIX 由 VIX 期权价格推导，用于观察 VIX 的波动预期。参考沙盘标注的观察线为 120。',
    }
  }
  if (inScenario.value) {
    return { tag: '推演 · ' + band.value.tag, headline: band.value.headline, body: band.value.body }
  }
  return {
    tag: 'VIX ' + formatValue('VIX'),
    headline: '标普 500 的隐含波动率',
    body: '当前读数落在参考沙盘的 ' + band.value.range + ' 区间。拖动滑杆可查看各区间的推演说明。',
  }
})

function selectInstrument(symbol) {
  selected.value = symbol
  if (symbol === 'VIX') scenarioVix.value = null
}

function setScenario(event) {
  selected.value = 'VIX'
  scenarioVix.value = Number(event.target.value)
}

async function loadLatest() {
  if (refreshing.value) return
  refreshing.value = true
  const signal = AbortSignal.any([lifetime.signal, AbortSignal.timeout(14000)])
  try {
    if (!snapshot.value || (!publicQuoteUrl && !import.meta.env.DEV)) {
      snapshot.value = await fetchQuoteSnapshot(VIX_SNAPSHOT_PATH, signal)
    }

    if (publicQuoteUrl) {
      snapshot.value = await fetchQuoteSnapshot(publicQuoteUrl, signal)
      refreshStatus.value = '已查询行情源'
    } else if (import.meta.env.DEV) {
      const updates = await fetchIndexCloses(VIX_HISTORY_PROXY, signal)
      if (lifetime.signal.aborted) return
      const count = Object.keys(updates).length
      if (!count) throw new Error('Cboe history unavailable')
      const previous = snapshot.value.quotes
      const older = VIX_SYMBOLS.some(symbol => updates[symbol]?.date < previous[symbol].date)
      snapshot.value = { kind: 'close', quotes: mergeIndexCloses(previous, updates) }
      refreshStatus.value = count < VIX_SYMBOLS.length || older
        ? '已查询，部分读数沿用较新记录'
        : '已查询 Cboe 收盘数据'
    } else {
      refreshStatus.value = '已读取收盘快照'
    }
  } catch {
    if (!lifetime.signal.aborted) {
      refreshStatus.value = snapshot.value ? '刷新失败，显示上次读数' : '暂时无法载入行情'
    }
  } finally {
    refreshing.value = false
  }
}

function refreshLatest() {
  selectInstrument('VIX')
  loadLatest()
}

const pageTitle = "VIX 指数仪表盘 · LiuYinChu'Space"
let previousTitle
onMounted(() => {
  previousTitle = document.title
  document.title = pageTitle
  loadLatest()
})
onBeforeUnmount(() => {
  lifetime.abort()
  if (document.title === pageTitle) document.title = previousTitle
})
</script>

<template>
  <main class="volatility-page" :class="{ 'dashboard-light': !dark }">
    <div class="volatility-dashboard">
      <header class="dashboard-heading">
        <div class="headline">
          <h1>CBOE 波动率三维仪表盘 <span>(VIX / VXN / VVIX)</span></h1>
          <span v-if="snapshot" class="snapshot">
            {{ snapshotKind }}
            <time v-if="commonDate" :datetime="commonDate">{{ formatDate(commonDate) }}</time>
            <span v-else>· 各表盘日期</span>
          </span>
        </div>
        <div class="header-actions">
          <span class="current-state" :data-tone="band?.tone">
            <span class="status-dot" aria-hidden="true"></span>
            {{ inScenario ? '推演状态' : '当前状态' }}
            <strong>{{ band ? 'VIX ' + band.range : '等待数据' }}</strong>
            <span>VXN − VIX {{ spread }}</span>
          </span>
          <button class="tactile-button" type="button" :aria-pressed="!dark" @click="dark = !dark">
            切换明/暗主题
          </button>
        </div>
      </header>

      <section class="gauge-grid" aria-label="波动率仪表">
        <button
          v-for="instrument in instruments"
          :key="instrument.symbol"
          type="button"
          class="gauge-card"
          :data-tone="toneFor(instrument)"
          :aria-label="'查看 ' + instrument.symbol + ' 说明'"
          :aria-pressed="selected === instrument.symbol"
          @click="selectInstrument(instrument.symbol)"
        >
          <span class="gauge-heading">
            <strong>{{ instrument.symbol }} {{ instrument.label }}</strong>
            <span class="gauge-tag">{{ inScenario ? '推演值' : snapshot ? snapshotKind : '等待数据' }}</span>
          </span>
          <span class="gauge-face">
            <svg class="gauge-svg" viewBox="0 0 180 108" aria-hidden="true">
              <defs>
                <linearGradient :id="'dial-metal-' + instrument.symbol" x1="0" x2="0.75" y1="0" y2="1">
                  <stop offset="0%" stop-color="var(--dial-top)" />
                  <stop offset="65%" stop-color="var(--dial-middle)" />
                  <stop offset="100%" stop-color="var(--dial-bottom)" />
                </linearGradient>
              </defs>
              <path class="bezel-back" d="M19 84 A71 71 0 0 1 161 84 L161 92 Q90 104 19 92 Z" />
              <path class="bezel-face" :fill="'url(#dial-metal-' + instrument.symbol + ')'" d="M19 81 A71 71 0 0 1 161 81 L161 86 Q90 98 19 86 Z" />
              <path class="bezel-inset" d="M28 81 A62 62 0 0 1 152 81 L152 83 Q90 92 28 83 Z" />
              <path class="arc-track" d="M 28 82 A 62 62 0 0 1 152 82" />
              <path class="gauge-arc arc-low" d="M 28 82 A 62 62 0 0 1 58 29" />
              <path class="gauge-arc arc-mid" d="M 61 27 A 62 62 0 0 1 119 27" />
              <path class="gauge-arc arc-high" d="M 122 29 A 62 62 0 0 1 152 82" />
              <path class="arc-shine" d="M29 78 A61 61 0 0 1 151 78" />
              <g v-if="Number.isFinite(values[instrument.symbol])" class="needle" :style="{ transform: 'rotate(' + angleFor(instrument) + 'deg)' }">
                <path d="M90 23 L93 51 L87 51 Z" />
              </g>
              <circle class="hub" cx="90" cy="82" r="3.6" />
              <text x="19" y="102">{{ instrument.ticks[0] }}</text>
              <text x="53" y="20">{{ instrument.ticks[1] }}</text>
              <text x="127" y="20">{{ instrument.ticks[2] }}</text>
              <text x="161" y="102">{{ instrument.ticks[3] }}</text>
            </svg>
            <output class="gauge-value" :data-symbol="instrument.symbol" aria-live="off">{{ formatValue(instrument.symbol) }}</output>
          </span>
          <span class="gauge-footer">
            <span v-if="instrument.symbol === 'VIX'">{{ range52w }}</span>
            <span v-else-if="instrument.symbol === 'VXN'">较 VIX {{ spread }}</span>
            <span v-else>参考观察线 120</span>
            <span v-if="inScenario">情景推演</span>
            <time v-else-if="quotes?.[instrument.symbol]" :datetime="quotes[instrument.symbol].date">
              {{ formatDate(quotes[instrument.symbol].date) }}
            </time>
            <span v-else>—</span>
          </span>
        </button>
      </section>

      <section class="simulator" aria-label="波动率情景推演">
        <div class="simulator-toolbar">
          <label class="slider-label" for="volatility-slider">
            <span>拖动推演 VIX 波动率变化</span>
            <input
              id="volatility-slider"
              type="range"
              min="13"
              max="38"
              step="0.5"
              :value="sliderValue"
              @input="setScenario"
            />
          </label>
          <div class="toolbar-actions">
            <output class="sim-readout" for="volatility-slider">
              {{ inScenario ? '推演' : '最新值' }} VIX = {{ formatValue('VIX') }}
              (VXN {{ inScenario ? '≈' : '=' }} {{ formatValue('VXN') }})
            </output>
            <button class="tactile-button refresh" type="button" :disabled="refreshing" @click="refreshLatest">
              {{ refreshing ? '刷新中…' : '刷新最新值' }}
            </button>
          </div>
        </div>

        <div class="regime-grid" aria-label="VIX 参考区间">
          <span
            v-for="(item, index) in bands"
            :key="item.range"
            class="regime"
            :data-tone="item.tone"
            :aria-current="index === activeBand ? 'true' : undefined"
          ><b>{{ item.range }}</b> {{ item.name }}<span v-if="index === activeBand" aria-hidden="true"> ★</span></span>
        </div>

        <div class="diagnosis">
          <div class="diagnosis-heading">
            <span class="diagnosis-tag" :data-tone="band?.tone">{{ diagnosis.tag }}</span>
            <strong>{{ diagnosis.headline }}</strong>
          </div>
          <p>{{ diagnosis.body }}</p>
        </div>

        <div class="source-line">
          <a href="https://www.cboe.com/tradable-products/vix/vix-historical-data/" target="_blank" rel="noopener noreferrer">
            {{ snapshot?.kind === 'close' || !snapshot ? 'Cboe 收盘数据' : 'Cboe 指数说明' }}
          </a>
          <span role="status">{{ refreshing ? '正在查询最新值…' : refreshStatus }}</span>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.volatility-page {
  --page-base: var(--ctp-mocha-base, #1e1e2e);
  --panel: var(--ctp-mocha-mantle, #181825);
  --raised: var(--ctp-mocha-surface0, #313244);
  --edge: var(--ctp-mocha-surface1, #45475a);
  --ink: var(--ctp-mocha-text, #cdd6f4);
  --muted: var(--ctp-mocha-subtext0, #a6adc8);
  --accent: var(--ctp-mocha-lavender, #b4befe);
  --low: var(--ctp-mocha-teal, #94e2d5);
  --mid: var(--ctp-mocha-peach, #fab387);
  --high: var(--ctp-mocha-red, #f38ba8);
  --glint: rgba(225, 219, 255, 0.16);
  --shadow: rgba(7, 7, 17, 0.72);
  --dial-top: #44465d;
  --dial-middle: #28293e;
  --dial-bottom: #171728;
  --dial-needle: #f5edff;
  min-height: calc(100vh - var(--site-header-height, 72px));
  padding: clamp(1.25rem, 4vw, 3.5rem) var(--page-gutter, 1.25rem) 4rem;
  color: var(--ink);
  background: radial-gradient(ellipse at 50% -5%, color-mix(in srgb, var(--accent) 12%, var(--page-base)), transparent 28rem),
    var(--page-base);
}

.dashboard-light {
  color-scheme: light;
  --page-base: var(--ctp-latte-base, #eff1f5);
  --panel: var(--ctp-latte-mantle, #e6e9ef);
  --raised: var(--ctp-latte-surface0, #ccd0da);
  --edge: var(--ctp-latte-surface1, #bcc0cc);
  --ink: var(--ctp-latte-text, #4c4f69);
  --muted: var(--ctp-latte-subtext0, #6c6f85);
  --accent: var(--ctp-latte-mauve, #8839ef);
  --low: var(--ctp-latte-teal, #179299);
  --mid: #a54d14;
  --high: var(--ctp-latte-red, #d20f39);
  --glint: rgba(255, 255, 255, 0.88);
  --shadow: rgba(76, 79, 105, 0.33);
  --dial-top: #f8f9fd;
  --dial-middle: #d6d9e6;
  --dial-bottom: #aeb4ca;
  --dial-needle: #5a417d;
}

.volatility-dashboard { max-width: 48rem; margin: 0 auto; }

.dashboard-heading, .headline, .header-actions, .current-state,
.gauge-heading, .gauge-footer, .simulator-toolbar, .toolbar-actions,
.slider-label, .diagnosis-heading, .source-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.dashboard-heading {
  justify-content: space-between;
  gap: 0.55rem 0.8rem;
  margin-bottom: 0.85rem;
  padding: 0.12rem 0.12rem 0.7rem;
  border-bottom: 1px solid var(--edge);
}

.headline, .header-actions, .current-state { gap: 0.5rem; }
.headline h1 { margin: 0; font-size: clamp(0.92rem, 2.05vw, 1.15rem); line-height: 1.45; }
.headline h1 span { white-space: nowrap; }
.snapshot, .current-state, .gauge-tag, .gauge-footer, .source-line { font-size: 0.68rem; }
.snapshot, .gauge-tag {
  padding: 0.2rem 0.42rem;
  border: 1px solid var(--edge);
  border-radius: 0.42rem;
  color: var(--muted);
  background: var(--panel);
}
.current-state { color: var(--muted); }
.current-state strong { color: var(--tone, var(--ink)); }
.status-dot { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: var(--tone, var(--muted)); }

[data-tone='low'] { --tone: var(--low); }
[data-tone='mid'] { --tone: var(--mid); }
[data-tone='high'] { --tone: var(--high); }

.gauge-grid { display: grid; grid-template-columns: 1fr; gap: 0.65rem; }
.gauge-card, .simulator, .tactile-button {
  border: 1px solid var(--edge);
  color: var(--ink);
  background: linear-gradient(151deg, var(--raised), var(--panel) 65%);
  box-shadow: inset 0 1px 0 var(--glint), 0.28rem 0.38rem 0.8rem var(--shadow);
}
.gauge-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  padding: 0.64rem 0.58rem 0.5rem;
  border-radius: 0.78rem;
  font: inherit;
  cursor: pointer;
  transition: transform 140ms ease, border-color 140ms ease;
}
.gauge-card:hover { transform: translateY(-1px); }
.gauge-card[aria-pressed='true'] { border-color: var(--accent); }
.gauge-heading, .gauge-footer { width: 100%; justify-content: space-between; gap: 0.3rem; text-align: start; }
.gauge-heading strong { font-size: 0.76rem; }
.gauge-tag { color: var(--tone, var(--muted)); }
.gauge-footer {
  min-height: 1.45rem;
  padding-top: 0.36rem;
  border-top: 1px solid var(--edge);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.gauge-face { position: relative; display: block; width: min(100%, 11.8rem); margin: 0.16rem auto; }
.gauge-svg { display: block; width: 100%; overflow: visible; }
.gauge-svg .bezel-back { fill: var(--dial-bottom); filter: drop-shadow(1px 3.5px 2px var(--shadow)); }
.gauge-svg .bezel-face { stroke: var(--edge); stroke-width: 0.65px; }
.gauge-svg .bezel-inset { fill: var(--panel); stroke: var(--dial-bottom); stroke-width: 1.4px; }
.arc-track, .gauge-arc, .arc-shine { fill: none; }
.arc-track { stroke: var(--dial-bottom); stroke-width: 12px; }
.gauge-arc { stroke-width: 7.5px; }
.arc-low { stroke: var(--low); }
.arc-mid { stroke: var(--mid); }
.arc-high { stroke: var(--high); }
.arc-shine { stroke: var(--glint); stroke-width: 0.8px; pointer-events: none; }
.needle {
  fill: var(--dial-needle);
  transform-origin: 90px 82px;
  filter: drop-shadow(0 1.6px 1.4px var(--shadow));
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.hub { fill: var(--dial-top); stroke: var(--edge); stroke-width: 0.7px; }
.gauge-svg text { fill: var(--muted); font: 9px ui-monospace, monospace; text-anchor: middle; }
.gauge-value {
  position: absolute;
  inset: 50% 0 auto;
  color: var(--ink);
  text-align: center;
  font: 760 1.42rem/1.12 ui-monospace, monospace;
  letter-spacing: -0.08em;
  font-variant-numeric: tabular-nums;
}

.simulator { margin-top: 0.75rem; padding: 0.75rem; border-radius: 0.85rem; font-size: 0.76rem; }
.simulator-toolbar { justify-content: space-between; gap: 0.52rem 0.65rem; }
.slider-label { gap: 0.35rem 0.6rem; }
.slider-label input { width: clamp(7rem, 20vw, 11rem); min-height: 1.4rem; margin: 0; accent-color: var(--accent); }
.toolbar-actions { gap: 0.35rem; }
.sim-readout, .regime {
  border: 1px solid var(--edge);
  border-radius: 0.42rem;
  background: var(--panel);
  box-shadow: inset 0.12rem 0.16rem 0.38rem var(--shadow);
}
.sim-readout { padding: 0.24rem 0.42rem; font-size: 0.68rem; font-variant-numeric: tabular-nums; }
.tactile-button {
  padding: 0.24rem 0.48rem;
  border-radius: 0.44rem;
  font: inherit;
  font-size: 0.7rem;
  white-space: nowrap;
  cursor: pointer;
}
.tactile-button:active { box-shadow: inset 0.12rem 0.15rem 0.28rem var(--shadow); }
.tactile-button:hover { border-color: var(--accent); }
.tactile-button:disabled { opacity: 0.65; cursor: progress; }

.regime-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.36rem; margin-block: 0.58rem; }
.regime {
  display: grid;
  align-content: center;
  justify-items: center;
  padding: 0.28rem 0.08rem;
  color: var(--muted);
  text-align: center;
  font-size: clamp(0.59rem, 1.7vw, 0.72rem);
  line-height: 1.45;
}
.regime b { color: var(--ink); font-variant-numeric: tabular-nums; }
.regime[aria-current] {
  border-color: var(--tone);
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 13%, var(--panel));
}

.diagnosis { padding-top: 0.55rem; border-top: 1px solid var(--edge); }
.diagnosis-heading { gap: 0.4rem; }
.diagnosis-tag {
  padding: 0.15rem 0.4rem;
  border: 1px solid color-mix(in srgb, var(--tone, var(--accent)) 55%, var(--edge));
  border-radius: 0.38rem;
  color: var(--tone, var(--accent));
  background: color-mix(in srgb, var(--tone, var(--accent)) 12%, var(--panel));
  font-weight: 650;
}
.diagnosis p { margin: 0.42rem 0 0; color: var(--muted); line-height: 1.65; }
.source-line { justify-content: space-between; gap: 0.25rem 0.5rem; margin-top: 0.48rem; color: var(--muted); }
.source-line a { color: var(--accent); }

.volatility-page :is(button, a, input):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

@media (min-width: 640px) {
  .gauge-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .regime { display: block; }
}

@media (prefers-reduced-motion: reduce) {
  .gauge-card, .needle { transition: none; }
}
</style>
