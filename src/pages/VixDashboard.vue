<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  fetchIndexCloses, fetchQuoteSnapshot, mergeIndexCloses,
  VIX_HISTORY_PROXY, VIX_SNAPSHOT_PATH, VIX_SYMBOLS,
} from '../utils/vix-quotes.mjs'

const instruments = [
  { symbol: 'VIX', label: '标普 500 波动率', ticks: [10, 20, 30, 45] },
  { symbol: 'VXN', label: '纳指 100 波动率', ticks: [12, 22, 32, 48] },
  { symbol: 'VVIX', label: 'VIX 的波动率', ticks: [70, 95, 115, 150] },
]

const bands = [
  { range: '<15', name: '极低波满仓', tone: 'low', tag: '极度平静区', headline: '量化多头满仓巡航（对应 CTA 持仓 > +100 亿美元）', body: '当 VIX 低于 15 时，波动率目标基金（Vol-Control）与 CTA 会将杠杆开到最大。此时市场呈现低波慢牛，但多头极度拥挤，需警惕波动率突然抬头引发多杀多。' },
  { range: '15–20', name: '慢牛回补', tone: 'low', tag: '右侧抄底确认区', headline: '★ 右侧最佳击球点：VIX 跌破 20 触发百亿级“空头回补 + 波动率买盘”！', body: '一旦 VIX 从当前的 25 回落至 20 以下（VXN 降至 27 以下），期权做市商将平掉空头对冲盘（Vanna 顺风买盘），同时 CTA 与波动率控制基金被迫把 -38.7 亿美元空单回补翻多，形成戴维斯双击式的右侧反弹。' },
  { range: '20–26', name: '降仓警戒', tone: 'mid', tag: '高波压制期', headline: '这解释了为何纳指 CTA 持仓会被垂直砸到 -3.87B！', body: '量化基金仓位与波动率成反比（目标仓位 ∝ 1 / 波动率）。在参考情景中，VXN 为 34.6，较 VIX 高出近 10 点，而 VVIX 为 101.5。' },
  { range: '26–33', name: '恐慌抛售', tone: 'high', tag: '恐慌急跌区', headline: '市场进入剧烈震荡寻底，CTA 空头接近风控极限 (-4B ~ -6B)', body: '当 VIX 处于 26–33 区间时，参考情景关注波动率扩大时的仓位调整、止损与对冲行为。' },
  { range: '>33', name: '极值黄金坑', tone: 'high', tag: '极端流动性冲击', headline: '历史级恐慌极值（十年黄金坑，对应 CTA 触及 -6.01B 极限）', body: '在参考沙盘中，VIX 高于 33 属于最高一档。拖动滑杆可对比 VIX、VXN 和 VVIX 在不同波动水平下的推演读数。' },
]

const selected = ref('VIX')
const scenarioVix = ref(null)
const quotes = ref(null)
const refreshing = ref(false)
const refreshError = ref('')
const lifetime = new AbortController()

const inScenario = computed(() => scenarioVix.value !== null)
const values = computed(() => {
  if (inScenario.value) {
    const vix = scenarioVix.value
    return { VIX: vix, VXN: +(vix * 1.384).toFixed(1), VVIX: +(72 + vix * 1.18).toFixed(1) }
  }
  return Object.fromEntries(VIX_SYMBOLS.map(symbol => [symbol, quotes.value?.[symbol]?.value]))
})

const sliderValue = computed(() => scenarioVix.value ?? values.value.VIX ?? 25)
const sliderProgress = computed(() => Math.min(100, Math.max(0, (sliderValue.value - 13) * 4)) + '%')

const activeBand = computed(() => {
  const vix = values.value.VIX
  if (!Number.isFinite(vix)) return -1
  if (vix < 15) return 0
  if (vix < 20) return 1
  if (vix <= 26) return 2
  return vix <= 33 ? 3 : 4
})
const band = computed(() => bands[activeBand.value])

const spread = computed(() => {
  const { VIX, VXN } = values.value
  if (!Number.isFinite(VIX) || !Number.isFinite(VXN)) return '—'
  if (!inScenario.value && quotes.value.VIX.date !== quotes.value.VXN.date) return '日期不同'
  const difference = VXN - VIX
  return (difference >= 0 ? '+' : '') + difference.toFixed(inScenario.value ? 1 : 2) + ' pt'
})
const range52w = computed(() => {
  const range = quotes.value?.VIX.range52w
  return range ? '52 周区间 ' + range.map(value => value.toFixed(1)).join('–') : '量程 10–45'
})

function formatValue(symbol) {
  const value = values.value[symbol]
  return Number.isFinite(value) ? value.toFixed(inScenario.value ? 1 : 2) : '—'
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
  refreshError.value = ''
  const signal = AbortSignal.any([lifetime.signal, AbortSignal.timeout(14000)])
  try {
    if (!quotes.value || !import.meta.env.DEV) {
      const latest = await fetchQuoteSnapshot(VIX_SNAPSHOT_PATH, signal)
      quotes.value = mergeIndexCloses(quotes.value ?? {}, latest.quotes)
    }

    if (import.meta.env.DEV) {
      const updates = await fetchIndexCloses(VIX_HISTORY_PROXY, signal)
      if (lifetime.signal.aborted) return
      if (!Object.keys(updates).length) throw new Error('Cboe history unavailable')
      quotes.value = mergeIndexCloses(quotes.value, updates)
    }
  } catch {
    if (!lifetime.signal.aborted) {
      refreshError.value = quotes.value ? '刷新失败，显示上次读数' : '暂时无法载入行情'
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
  <main class="volatility-page">
    <div class="volatility-dashboard">
      <header class="dashboard-heading">
        <h1>CBOE 波动率三维仪表盘 <span>(VIX / VXN / VVIX)</span></h1>
      </header>

      <section class="gauge-grid" aria-label="波动率仪表">
        <button
          v-for="instrument in instruments"
          :key="instrument.symbol"
          type="button"
          class="gauge-card"
          :data-tone="toneFor(instrument)"
          :aria-label="'查看 ' + instrument.symbol + ' 说明'"
          :aria-describedby="'dial-value-' + instrument.symbol"
          :aria-pressed="selected === instrument.symbol"
          @click="selectInstrument(instrument.symbol)"
        >
          <span class="gauge-heading">
            <strong>{{ instrument.symbol }}</strong>
            <span>{{ instrument.label }}</span>
          </span>
          <span class="gauge-face">
            <svg class="gauge-svg" viewBox="0 0 180 107" aria-hidden="true">
              <defs>
                <linearGradient :id="'dial-metal-' + instrument.symbol" x1="0" x2="0.75" y1="0" y2="1">
                  <stop offset="0%" stop-color="#54566f" />
                  <stop offset="55%" stop-color="#2b2c41" />
                  <stop offset="100%" stop-color="#191928" />
                </linearGradient>
                <radialGradient :id="'dial-glass-' + instrument.symbol" cx="0.35" cy="0.18" r="1">
                  <stop offset="0%" stop-color="#242536" />
                  <stop offset="100%" stop-color="#131320" />
                </radialGradient>
              </defs>
              <path class="bezel-back" d="M17 84 A73 73 0 0 1 163 84 L163 91 Q90 103 17 91 Z" />
              <path class="bezel-face" :fill="'url(#dial-metal-' + instrument.symbol + ')'" d="M17 81 A73 73 0 0 1 163 81 L163 87 Q90 99 17 87 Z" />
              <path class="bezel-inset" :fill="'url(#dial-glass-' + instrument.symbol + ')'" d="M24 82 A66 66 0 0 1 156 82 Q90 91 24 82 Z" />
              <path class="gauge-arc arc-low" d="M 28 82 A 62 62 0 0 1 58 29" />
              <path class="gauge-arc arc-mid" d="M 61 27 A 62 62 0 0 1 119 27" />
              <path class="gauge-arc arc-high" d="M 122 29 A 62 62 0 0 1 152 82" />
              <path class="arc-shine" d="M25 82 A65 65 0 0 1 155 82" />
              <g v-if="Number.isFinite(values[instrument.symbol])" class="needle" :style="{ transform: 'rotate(' + angleFor(instrument) + 'deg)' }">
                <path d="M90 25 L92.6 80 Q90 85 87.4 80 Z" />
              </g>
              <circle class="hub" cx="90" cy="82" r="4.4" />
              <circle class="hub-center" cx="90" cy="82" r="1.5" />
              <text x="17" y="102">{{ instrument.ticks[0] }}</text>
              <text x="52" y="19">{{ instrument.ticks[1] }}</text>
              <text x="128" y="19">{{ instrument.ticks[2] }}</text>
              <text x="163" y="102">{{ instrument.ticks[3] }}</text>
            </svg>
            <output :id="'dial-value-' + instrument.symbol" class="gauge-value" :data-symbol="instrument.symbol" aria-live="off">{{ formatValue(instrument.symbol) }}</output>
          </span>
          <span class="gauge-footer">
            <span v-if="instrument.symbol === 'VIX'">{{ range52w }}</span>
            <span v-else-if="instrument.symbol === 'VXN'">较 VIX {{ spread }}</span>
            <span v-else>参考观察线 120</span>
            <span v-if="inScenario" class="gauge-date">推演值</span>
            <span v-else-if="quotes?.[instrument.symbol]" class="gauge-date">
              日收盘
              <time :datetime="quotes[instrument.symbol].date">{{ quotes[instrument.symbol].date }}</time>
            </span>
            <span v-else>等待数据</span>
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
              :style="{ '--slider-progress': sliderProgress }"
              @input="setScenario"
            />
          </label>
          <div class="toolbar-actions">
            <output class="sim-readout" for="volatility-slider">
              {{ inScenario ? '推演' : '最新值' }}
              <strong>VIX {{ formatValue('VIX') }}</strong>
              <span>VXN {{ inScenario ? '≈ ' : '' }}{{ formatValue('VXN') }}</span>
            </output>
            <button class="refresh" type="button" :disabled="refreshing" @click="refreshLatest">
              <span class="refresh-icon" aria-hidden="true">↻</span>
              {{ refreshing ? '刷新中…' : '刷新最新值' }}
            </button>
          </div>
        </div>
        <p v-if="refreshError" class="refresh-error" role="status">{{ refreshError }}</p>

        <div class="regime-grid" aria-label="VIX 参考区间">
          <span
            v-for="(item, index) in bands"
            :key="item.range"
            class="regime"
            :data-tone="item.tone"
            :aria-current="index === activeBand ? 'true' : undefined"
          ><b>{{ item.range }}</b><span>{{ item.name }}</span></span>
        </div>

        <div class="diagnosis">
          <div class="diagnosis-heading">
            <span class="diagnosis-tag" :data-tone="band?.tone">{{ diagnosis.tag }}</span>
            <strong>{{ diagnosis.headline }}</strong>
          </div>
          <p>{{ diagnosis.body }}</p>
        </div>
      </section>

      <section class="vix-intro" aria-labelledby="vix-intro-title">
        <h2 id="vix-intro-title">认识 VIX 指数</h2>
        <p class="intro-lead">
          <strong>VIX 指数</strong>（Cboe Volatility Index）由芝加哥期权交易所于 1993 年推出，2003 年改用标普 500 指数期权作为计算基础。它汇总不同执行价的看涨和看跌期权报价，衡量市场对标普 500 指数<strong>未来 30 天</strong>的预期波动率，并用年化百分比表示。
        </p>
        <p>
          历史波动率来自已经发生的价格变化，VIX 则用当前的期权报价衡量市场对未来不确定性的定价。股市急跌时，投资者往往增加对冲，期权隐含波动率随之上升。由于 VIX 常与标普 500 指数反向变动，市场也称它为<strong>「恐慌指数」</strong>。
        </p>
        <p>
          例如，<strong>VIX 为 20</strong>，意味着未来 30 天的预期波动折算成年率约为 20%。按一年约 252 个交易日粗略换算，单个交易日波动的标准差约为 1.25%，这就是常说的「16 法则」。
        </p>
        <figure class="vix-example" aria-label="VIX 为 20 时的单日波动估算">
          <div>
            <span>年化预期波动率</span>
            <strong>20<small>%</small></strong>
          </div>
          <span class="vix-example-formula" role="img" aria-label="除以 252 的平方根">÷ √252</span>
          <div>
            <span>单日波动标准差</span>
            <strong>≈1.25<small>%</small></strong>
          </div>
        </figure>
        <p>
          低于 <strong>15</strong> 常见于较平静的市场，<strong>15–25</strong> 可视为常规波动区间，高于 <strong>30</strong> 往往意味着不确定性和避险需求升高。这些区间是经验参考。2008 年金融危机和 2020 年 3 月疫情冲击期间，VIX 的收盘值都曾突破 80。
        </p>
        <p>
          投资者常用 VIX 观察市场的风险偏好，逆向交易者有时也会把极端高值作为判断避险情绪是否过度的线索。VIX 本身是指数，市场参与者可借助 VIX 期货、期权或相关交易所交易产品（ETP）对冲风险或交易波动率。对滚动持有 VIX 期货多头的产品，期货曲线升水时，展期成本可能持续拖累收益。
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.volatility-page {
  --page-base: var(--ctp-mocha-base, #1e1e2e);
  --panel: var(--ctp-mocha-mantle, #181825);
  --ink: var(--ctp-mocha-text, #cdd6f4);
  --muted: var(--ctp-mocha-subtext0, #a6adc8);
  --accent: var(--ctp-mocha-lavender, #b4befe);
  --low: var(--ctp-mocha-teal, #94e2d5);
  --mid: var(--ctp-mocha-peach, #fab387);
  --high: var(--ctp-mocha-red, #f38ba8);
  --edge: color-mix(in srgb, var(--accent) 19%, transparent);
  --shadow: #10101d;
  padding: clamp(2.3rem, 5vw, 4.5rem) var(--page-gutter, 1.25rem) 1.5rem;
  color: var(--ink);
  background:
    radial-gradient(ellipse 39rem 22rem at 50% 0, color-mix(in srgb, var(--accent) 11%, transparent), transparent 100%),
    var(--page-base);
}

.volatility-dashboard { width: min(100%, 62rem); margin-inline: auto; }

.dashboard-heading { margin-bottom: clamp(1.6rem, 3.25vw, 2.4rem); text-align: center; }
.dashboard-heading h1 {
  margin: 0;
  font-size: clamp(1.69rem, 4.2vw, 2.75rem);
  font-weight: 750;
  line-height: 1.16;
  letter-spacing: -0.045em;
  text-wrap: balance;
}
.dashboard-heading h1 span {
  display: block;
  margin-top: 0.65rem;
  color: var(--muted);
  font-size: clamp(0.77rem, 1.7vw, 0.91rem);
  font-weight: 550;
  letter-spacing: 0.18em;
}

[data-tone='low'] { --tone: var(--low); }
[data-tone='mid'] { --tone: var(--mid); }
[data-tone='high'] { --tone: var(--high); }

.gauge-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.9rem; }
.gauge-card, .simulator {
  border: 1px solid var(--edge);
  border-radius: 1.15rem;
  color: var(--ink);
  background: linear-gradient(155deg, #28293c, var(--panel) 72%);
  box-shadow: inset 0 1px 0 #ffffff08, 0 0.55rem 1.25rem #10101d73;
}
.gauge-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
  padding: clamp(0.85rem, 1.7vw, 1.16rem);
  font: inherit;
  text-align: start;
  cursor: pointer;
  background:
    radial-gradient(ellipse at 50% 8%, color-mix(in srgb, var(--tone, var(--accent)) 7%, transparent), transparent 60%),
    linear-gradient(155deg, #27283a, var(--panel) 75%);
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.gauge-card[aria-pressed='true'] {
  border-color: color-mix(in srgb, var(--accent) 53%, transparent);
  box-shadow: inset 0 1px 0 #ffffff15, 0 0.55rem 1.4rem #10101d96;
}
@media (hover: hover) {
  .gauge-card:hover { transform: translateY(-2px); border-color: var(--accent); }
}
.gauge-heading, .gauge-footer, .toolbar-actions, .sim-readout, .diagnosis-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.gauge-heading {
  justify-content: space-between;
  gap: 0.3rem 0.5rem;
  color: var(--muted);
  font-size: 0.78rem;
}
.gauge-heading strong { color: var(--ink); font-size: 1.03rem; letter-spacing: 0.045em; }

.gauge-face {
  display: grid;
  justify-items: center;
  width: min(100%, 14.25rem);
  margin: 0.35rem auto 0.85rem;
}
.gauge-svg { display: block; width: 100%; overflow: visible; }
.gauge-svg .bezel-back { fill: #111120; filter: drop-shadow(0 4px 4px #0d0d17ad); }
.gauge-svg .bezel-face { stroke: #575870; stroke-width: 0.5px; }
.gauge-svg .bezel-inset { stroke: #11111d; stroke-width: 1.2px; }
.gauge-arc, .arc-shine { fill: none; }
.gauge-arc { stroke-width: 6.6px; }
.arc-low { stroke: var(--low); }
.arc-mid { stroke: var(--mid); }
.arc-high { stroke: var(--high); }
.arc-shine { stroke: #ffffff37; stroke-width: 0.72px; }
.needle {
  fill: #f0edff;
  transform-origin: 90px 82px;
  filter: drop-shadow(0 1.4px 2px #10101cab);
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.hub { fill: #4a4c64; stroke: #a0a2bf; stroke-width: 0.6px; }
.hub-center { fill: var(--accent); }
.gauge-svg text {
  fill: var(--muted);
  font: 8.3px ui-monospace, monospace;
  text-anchor: middle;
}
.gauge-value {
  color: color-mix(in srgb, var(--ink) 87%, var(--tone, var(--ink)));
  font: 730 clamp(1.8rem, 3.5vw, 2.55rem)/1.05 ui-monospace, monospace;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.gauge-footer {
  justify-content: space-between;
  gap: 0.22rem 0.55rem;
  margin-top: auto;
  padding-top: 0.65rem;
  border-top: 1px solid var(--edge);
  color: var(--muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}
.gauge-date time { margin-inline-start: 0.2rem; color: var(--ink); white-space: nowrap; }

.simulator { margin-top: 1rem; padding: clamp(0.85rem, 2vw, 1.25rem); font-size: 0.87rem; }
.simulator-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem 1rem;
}
.slider-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
}
.slider-label span { flex: none; color: var(--ink); font-size: 0.83rem; }
.slider-label input {
  appearance: none;
  flex: 1;
  min-width: 3rem;
  max-width: 13rem;
  height: 2rem;
  margin: 0;
  border-radius: 0.5rem;
  background: linear-gradient(to right, var(--accent) var(--slider-progress), #434459 var(--slider-progress)) center / 100% 5px no-repeat;
  cursor: pointer;
}
.slider-label input::-webkit-slider-thumb {
  appearance: none;
  width: 0.92rem;
  height: 0.92rem;
  border: 1px solid #e4e8ff;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 2px 6px #0c0c16a6;
}
.slider-label input::-moz-range-thumb {
  box-sizing: border-box;
  width: 0.92rem;
  height: 0.92rem;
  border: 1px solid #e4e8ff;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 2px 6px #0c0c16a6;
}
.slider-label input::-moz-range-track { background: transparent; }
.toolbar-actions { justify-content: space-between; gap: 0.5rem 0.9rem; }
.sim-readout { gap: 0.25rem 0.48rem; color: var(--muted); font-size: 0.76rem; font-variant-numeric: tabular-nums; }
.sim-readout strong { color: var(--ink); }
.refresh {
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.68rem;
  border: 1px solid color-mix(in srgb, var(--accent) 33%, transparent);
  border-radius: 0.58rem;
  color: var(--ink);
  background: color-mix(in srgb, var(--accent) 14%, var(--panel));
  box-shadow: inset 0 1px 0 #ffffff16, 0 0.2rem 0.45rem #10101d65;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}
.refresh-icon { color: var(--accent); font-size: 1.1em; line-height: 1; }
.refresh:hover:not(:disabled) { border-color: var(--accent); }
.refresh:active:not(:disabled) { box-shadow: inset 0 0.15rem 0.4rem var(--shadow); }
.refresh:disabled { opacity: 0.62; cursor: progress; }
.refresh-error { margin: 0.55rem 0 0; color: var(--mid); font-size: 0.78rem; }

.regime-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.35rem;
  margin-block: 1rem;
}
.regime {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.13rem 0.32rem;
  padding: 0.45rem 0.12rem;
  border: 1px solid #ffffff0a;
  border-radius: 0.5rem;
  background: #151522bf;
  box-shadow: inset 0 0.15rem 0.45rem #10101d85;
  color: var(--muted);
  text-align: center;
  font-size: clamp(0.64rem, 1.5vw, 0.76rem);
  line-height: 1.33;
}
.regime b { color: var(--ink); font-variant-numeric: tabular-nums; }
.regime[aria-current] {
  border-color: color-mix(in srgb, var(--tone) 57%, transparent);
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 10%, var(--panel));
}
.regime[aria-current] b { color: var(--tone); }

.diagnosis { padding-top: 0.9rem; border-top: 1px solid var(--edge); }
.diagnosis-heading { gap: 0.45rem 0.65rem; }
.diagnosis-tag {
  padding: 0.17rem 0.49rem;
  border-radius: 0.35rem;
  color: var(--tone, var(--accent));
  background: color-mix(in srgb, var(--tone, var(--accent)) 12%, var(--panel));
  font-size: 0.79rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.diagnosis p { margin: 0.48rem 0 0; color: var(--muted); line-height: 1.65; }

.vix-intro {
  max-width: 44rem;
  margin: clamp(2.6rem, 6vw, 4.5rem) auto 0;
  padding-top: clamp(1.6rem, 3vw, 2.4rem);
  border-top: 1px solid var(--edge);
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.95;
}
.vix-intro h2 {
  margin: 0 0 0.85rem;
  color: var(--ink);
  font-size: clamp(1.45rem, 3.25vw, 1.95rem);
  font-weight: 730;
  line-height: 1.3;
  letter-spacing: -0.03em;
}
.vix-intro p { margin: 0.76em 0 0; }
.vix-intro .intro-lead { color: var(--ink); }
.vix-intro strong { color: var(--ink); }
.vix-example {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(0.34rem, 2vw, 1.4rem);
  margin: 1.35rem 0;
  padding: clamp(0.75rem, 2vw, 1.2rem);
  border: 1px solid var(--edge);
  border-radius: 0.75rem;
  background: linear-gradient(120deg, #232437, var(--panel));
  text-align: center;
}
.vix-example div { display: grid; gap: 0.28rem; font-size: 0.76rem; line-height: 1.4; }
.vix-example strong {
  color: var(--accent);
  font: 700 clamp(1.2rem, 4vw, 2.15rem)/1.15 ui-monospace, monospace;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
.vix-example small { font-size: 0.62em; }
.vix-example-formula {
  color: var(--ink);
  font: 530 clamp(0.76rem, 2.4vw, 1.06rem)/1.2 ui-monospace, monospace;
  white-space: nowrap;
}

.volatility-page :is(button, input):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

@media (min-width: 640px) {
  .gauge-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .regime { grid-auto-flow: column; justify-content: center; }
}
@media (min-width: 760px) {
  .simulator-toolbar { grid-template-columns: minmax(0, 1fr) auto; }
}
@media (prefers-reduced-motion: reduce) {
  .gauge-card, .needle { transition: none; }
}
</style>
