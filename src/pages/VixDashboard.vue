<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import VixMarketChart from '../components/vix/VixMarketChart.vue'

const instruments = [
  { id: 'vix', name: 'VIX', description: '标普 500 隐含波动率', min: 10, max: 45, example: 25, color: 'var(--vix-lavender)', series: 'VIXCLS', quote: 'CBOE-VIX' },
  { id: 'vxn', name: 'VXN', description: '纳斯达克 100 隐含波动率', min: 12, max: 55, example: 34.6, color: 'var(--vix-sky)', series: 'VXNCLS', quote: 'CBOE-VXN' },
  { id: 'vvix', name: 'VVIX', description: 'VIX 期权隐含波动率', min: 65, max: 155, example: 101.5, color: 'var(--vix-peach)', quote: 'CBOE-VVIX' },
]

const bands = [
  { limit: 15, range: '< 15', example: 12 },
  { limit: 20, range: '15–<20', example: 17.5 },
  { limit: 26, range: '20–<26', example: 23 },
  { limit: 33, range: '26–<33', example: 29.5 },
  { limit: Infinity, range: '≥ 33', example: 38 },
]

const examples = Object.fromEntries(instruments.map(({ id, example }) => [id, example]))
const readings = reactive({ ...examples })
const activeBand = computed(() => bands.findIndex(band => readings.vix < band.limit))
const spread = computed(() => {
  const difference = Math.round((readings.vxn - readings.vix) * 10) / 10
  return (difference > 0 ? '+' : '') + difference.toFixed(1)
})

const market = ref(instruments[0])
const chartRevision = ref(0)
const requestedAt = ref(new Date())
const timeFormat = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})
const quoteUrl = computed(() => 'https://www.tradingview.com/symbols/' + market.value.quote + '/')

const pageTitle = "VIX 指数仪表盘 · LiuYinChu'Space"
let previousTitle

onMounted(() => {
  previousTitle = document.title
  document.title = pageTitle
})
onBeforeUnmount(() => {
  if (document.title === pageTitle) document.title = previousTitle
})

function dialStyle(instrument) {
  const progress = (readings[instrument.id] - instrument.min) / (instrument.max - instrument.min)
  return {
    '--dial-accent': instrument.color,
    '--dial-progress': (248 * progress) + 'deg',
    '--dial-angle': (248 * progress - 124) + 'deg',
  }
}

function resetReadings() {
  Object.assign(readings, examples)
}

function refreshChart() {
  requestedAt.value = new Date()
  chartRevision.value++
}

function selectMarket(instrument) {
  if (market.value.id === instrument.id) return
  market.value = instrument
  refreshChart()
}
</script>

<template>
  <main class="vix-dashboard">
    <div class="vix-container">
      <div class="vix-page-links">
        <RouterLink to="/code" class="vix-back"><span aria-hidden="true">←</span> 代码与项目</RouterLink>
        <RouterLink :to="{ hash: '#vix-market-heading' }" class="vix-jump">查看行情 <span aria-hidden="true">↓</span></RouterLink>
      </div>
      <header class="vix-heading">
        <h1><span>VIX</span> 指数仪表盘</h1>
        <p>观察标普 500、纳斯达克 100 和 VIX 期权的隐含波动率。</p>
      </header>

      <div class="vix-layout">
        <section class="vix-panel simulation" aria-labelledby="vix-simulation-heading">
          <div class="panel-heading">
            <div>
              <h2 id="vix-simulation-heading">情景推演</h2>
              <p>从示例值开始，独立调节三只表盘。</p>
            </div>
            <button type="button" class="surface-button" @click="resetReadings">恢复示例</button>
          </div>

          <div class="instruments">
            <article
              v-for="instrument in instruments"
              :key="instrument.id"
              class="instrument"
              :class="{ 'instrument-main': instrument.id === 'vix' }"
              :style="dialStyle(instrument)"
              :aria-labelledby="'vix-instrument-' + instrument.id"
            >
              <div class="instrument-label">
                <h3 :id="'vix-instrument-' + instrument.id">{{ instrument.name }}</h3>
                <p>{{ instrument.description }}</p>
              </div>
              <div class="dial">
                <div class="dial-ticks" aria-hidden="true"></div>
                <div class="dial-track" aria-hidden="true"></div>
                <div class="dial-marker" aria-hidden="true"></div>
                <div class="dial-core">
                  <output :for="'vix-level-' + instrument.id" aria-live="off">{{ readings[instrument.id].toFixed(1) }}</output>
                  <span>指数点</span>
                </div>
              </div>
              <div class="adjuster">
                <span aria-hidden="true">{{ instrument.min }}</span>
                <input
                  :id="'vix-level-' + instrument.id"
                  v-model.number="readings[instrument.id]"
                  type="range"
                  :min="instrument.min"
                  :max="instrument.max"
                  step="0.1"
                  :aria-label="instrument.name + ' 情景读数'"
                />
                <span aria-hidden="true">{{ instrument.max }}</span>
              </div>
            </article>
          </div>

          <div class="vix-bands">
            <div class="band-heading">
              <span id="vix-band-label">VIX 示例区间</span>
              <span>VXN − VIX <strong>{{ spread }} 点</strong></span>
            </div>
            <div class="band-buttons" role="group" aria-labelledby="vix-band-label">
              <button
                v-for="(band, index) in bands"
                :key="band.range"
                type="button"
                :aria-pressed="index === activeBand"
                @click="readings.vix = band.example"
              >{{ band.range }}</button>
            </div>
          </div>
        </section>

        <section class="vix-panel market" aria-labelledby="vix-market-heading">
          <div class="panel-heading">
            <div>
              <h2 id="vix-market-heading">市场行情</h2>
              <p>{{ market.series ? 'FRED 最新可用日收盘 · 近一年' : '查看 VVIX 报价及历史走势。' }}</p>
            </div>
            <button v-if="market.series" type="button" class="surface-button refresh-button" @click="refreshChart">
              <span aria-hidden="true">↻</span> 刷新收盘图
            </button>
          </div>

          <div class="market-switcher" role="group" aria-label="选择行情指数">
            <button
              v-for="instrument in instruments"
              :key="instrument.id"
              type="button"
              :aria-pressed="market.id === instrument.id"
              @click="selectMarket(instrument)"
            >{{ instrument.name }}</button>
          </div>

          <div class="market-well">
            <VixMarketChart
              v-if="market.series"
              :key="chartRevision"
              :series="market.series"
              :name="market.name"
              :requested-at="requestedAt"
            />
            <div v-else class="market-external">
              <h3>VVIX 行情</h3>
              <a :href="quoteUrl" target="_blank" rel="noopener noreferrer" class="surface-button">
                在 TradingView 查看 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div v-if="market.series" class="market-credit">
            <div class="market-links">
              <a :href="'https://fred.stlouisfed.org/series/' + market.series" target="_blank" rel="noopener noreferrer">Cboe / FRED <span aria-hidden="true">↗</span></a>
              <a :href="quoteUrl" target="_blank" rel="noopener noreferrer">查看盘中行情 <span aria-hidden="true">↗</span></a>
            </div>
            <span>图表请求（本地） <time :datetime="requestedAt.toISOString()">{{ timeFormat.format(requestedAt) }}</time></span>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.vix-dashboard {
  --vix-crust: var(--ctp-mocha-crust, #11111b);
  --vix-mantle: var(--ctp-mocha-mantle, #181825);
  --vix-base: var(--ctp-mocha-base, #1e1e2e);
  --vix-surface: var(--ctp-mocha-surface0, #313244);
  --vix-line: var(--ctp-mocha-surface1, #45475a);
  --vix-text: var(--ctp-mocha-text, #cdd6f4);
  --vix-muted: var(--ctp-mocha-subtext0, #a6adc8);
  --vix-lavender: var(--ctp-mocha-lavender, #b4befe);
  --vix-sky: var(--ctp-mocha-sky, #89dceb);
  --vix-peach: var(--ctp-mocha-peach, #fab387);
  min-height: calc(100vh - var(--site-header-height, 72px));
  padding: clamp(1.75rem, 3.75vw, 3.5rem) var(--page-gutter, 1.5rem) clamp(3.5rem, 7vw, 6rem);
  color: var(--vix-text);
  background:
    radial-gradient(ellipse at 16% 0%, rgba(180, 190, 254, 0.12), transparent 35rem),
    radial-gradient(ellipse at 96% 31%, rgba(137, 220, 235, 0.055), transparent 36rem),
    var(--vix-mantle);
}

.vix-container { max-width: 76rem; margin-inline: auto; }

.vix-page-links { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; }

.vix-back, .vix-jump {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  color: var(--vix-muted);
  text-decoration: none;
  font-size: 0.84rem;
}

.vix-jump { display: none; }
.vix-back:hover, .vix-jump:hover { color: var(--vix-lavender); }

.vix-heading { margin: 0.8rem 0 clamp(1.35rem, 2.8vw, 2.15rem); }

.vix-heading h1 {
  margin: 0;
  font-size: clamp(2.05rem, 4.7vw, 4rem);
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.035em;
}

.vix-heading h1 span { color: var(--vix-lavender); }

.vix-heading p {
  margin: 0.55rem 0 0;
  color: var(--vix-muted);
  font-size: clamp(0.86rem, 1.35vw, 1rem);
  line-height: 1.65;
}

.vix-layout {
  display: grid;
  grid-template-columns: minmax(22rem, 0.84fr) minmax(0, 1.25fr);
  gap: clamp(1rem, 2.45vw, 1.75rem);
}

.vix-panel {
  min-width: 0;
  padding: clamp(0.9rem, 2.1vw, 1.4rem);
  border: 1px solid rgba(180, 190, 254, 0.13);
  border-radius: 1.35rem;
  background: linear-gradient(150deg, #242437 0%, var(--vix-base) 67%);
  box-shadow: inset 0 1px 0 rgba(218, 219, 255, 0.07), 0.6rem 0.8rem 1.65rem rgba(10, 10, 18, 0.56);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.95rem;
}

.panel-heading h2 {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.29rem);
  font-weight: 690;
  letter-spacing: 0.015em;
}

.panel-heading p {
  margin: 0.24rem 0 0;
  color: var(--vix-muted);
  font-size: 0.78rem;
  line-height: 1.55;
}

.surface-button, .market-switcher button, .band-buttons button {
  border: 1px solid transparent;
  color: var(--vix-text);
  font: inherit;
  cursor: pointer;
}

.surface-button {
  flex-shrink: 0;
  min-height: 2.35rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 0.65rem;
  background: linear-gradient(145deg, var(--vix-surface), #242435);
  box-shadow: inset 0 1px 1px rgba(224, 223, 255, 0.09), 3px 4px 8px rgba(13, 13, 22, 0.66);
  white-space: nowrap;
  font-size: 0.76rem;
}

.surface-button:hover { color: var(--vix-lavender); border-color: var(--vix-line); }
.surface-button:active { box-shadow: inset 2px 3px 6px rgba(13, 13, 22, 0.78); }
.refresh-button span { font-size: 1.04em; margin-inline-end: 0.08rem; }

.instruments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.instrument {
  min-width: 0;
  padding: 0.7rem 0.75rem 0.45rem;
  border: 1px solid rgba(180, 190, 254, 0.11);
  border-radius: 0.95rem;
  background: linear-gradient(145deg, rgba(49, 50, 68, 0.56), rgba(24, 24, 37, 0.83));
  box-shadow: inset 0 1px 0 rgba(180, 190, 254, 0.055), 3px 4px 10px rgba(13, 13, 22, 0.5);
}

.instrument-main {
  grid-column: 1 / -1;
  background:
    radial-gradient(ellipse at 52% 32%, rgba(180, 190, 254, 0.135), transparent 72%),
    linear-gradient(145deg, #2a2b40, var(--vix-mantle));
}

.instrument-label h3 {
  margin: 0;
  color: var(--dial-accent);
  font-size: 0.91rem;
  font-weight: 750;
  letter-spacing: 0.11em;
}

.instrument-label p {
  min-height: 2.5em;
  margin: 0.18rem 0 0;
  color: var(--vix-muted);
  font-size: 0.69rem;
  line-height: 1.25;
}

.instrument-main .instrument-label p { min-height: 0; }

.dial {
  --ring-width: 0.27rem;
  position: relative;
  width: min(100%, 7.25rem);
  aspect-ratio: 1;
  margin: 0.06rem auto 0.28rem;
  border-radius: 50%;
  background: linear-gradient(155deg, #424458 1%, #242537 42%, #12121d 96%);
  box-shadow:
    0 0.36rem 0 -0.075rem #12121b,
    0 0.68rem 0.9rem -0.13rem rgba(8, 8, 15, 0.92),
    inset 0 1.5px 1.2px rgba(221, 221, 255, 0.27),
    inset 0 -0.26rem 0.48rem rgba(11, 11, 23, 0.83);
  transform: perspective(38rem) rotateX(10deg);
}

.instrument-main .dial {
  --ring-width: 0.48rem;
  width: min(58%, 11.4rem);
  margin-block: 0.02rem 0.5rem;
}

.dial-ticks, .dial-track, .dial-marker, .dial-core {
  position: absolute;
  border-radius: 50%;
}

.dial-ticks {
  inset: 3.7%;
  background: repeating-conic-gradient(from -124deg, rgba(205, 214, 244, 0.48) 0deg 0.9deg, transparent 1.2deg 6.2deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
}

.dial-track {
  inset: 8.8%;
  background: conic-gradient(from -124deg,
    var(--dial-accent) 0deg var(--dial-progress),
    #494b64 var(--dial-progress) 248deg,
    transparent 248deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - var(--ring-width)), #000 calc(100% - var(--ring-width) + 0.75px));
}

.dial-marker {
  inset: 8.2%;
  z-index: 1;
  transform: rotate(var(--dial-angle));
  transition: transform 180ms ease-out;
}

.dial-marker::before {
  position: absolute;
  top: -0.12rem;
  left: 50%;
  width: 0.19rem;
  height: calc(var(--ring-width) + 0.24rem);
  transform: translateX(-50%);
  border-radius: 1rem;
  background: #f2edff;
  box-shadow: 0 0 0.42rem var(--dial-accent);
  content: '';
}

.dial-core {
  inset: 16%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.22rem;
  background: radial-gradient(ellipse at 45% 25%, #303149, #171722 86%);
  box-shadow: inset 0 0.18rem 0.4rem rgba(9, 9, 16, 0.62), 0 1px 0 rgba(217, 216, 255, 0.12);
}

.dial-core output {
  color: var(--vix-text);
  font-size: clamp(1.15rem, 3.2vw, 1.55rem);
  line-height: 1;
  font-weight: 780;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.06em;
}

.instrument-main .dial-core output { font-size: clamp(1.7rem, 4.5vw, 2.85rem); }
.dial-core span { color: var(--vix-muted); font-size: 0.61rem; }

.adjuster {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  align-items: center;
  gap: 0.35rem;
  color: var(--vix-muted);
  font-size: 0.67rem;
  font-variant-numeric: tabular-nums;
}

.adjuster input {
  width: 100%;
  min-width: 0;
  height: 1.65rem;
  margin: 0;
  accent-color: var(--dial-accent);
  cursor: pointer;
}

.vix-bands { margin-top: 0.85rem; }

.band-heading {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.42rem;
  color: var(--vix-muted);
  font-size: 0.71rem;
}

.band-heading strong { color: var(--vix-text); font-weight: 650; font-variant-numeric: tabular-nums; }

.band-buttons, .market-switcher {
  display: grid;
  gap: 0.2rem;
  padding: 0.25rem;
  border: 1px solid rgba(180, 190, 254, 0.09);
  border-radius: 0.75rem;
  background: var(--vix-mantle);
  box-shadow: inset 2px 3px 7px rgba(11, 11, 19, 0.84), 0 1px 0 rgba(221, 221, 255, 0.055);
}

.band-buttons { grid-template-columns: repeat(5, minmax(0, 1fr)); }

.band-buttons button, .market-switcher button {
  min-width: 0;
  min-height: 1.85rem;
  padding: 0.24rem 0.05rem;
  border-radius: 0.48rem;
  background: transparent;
  color: var(--vix-muted);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  font-weight: 570;
}

.band-buttons button:hover, .market-switcher button:hover { color: var(--vix-text); }

.band-buttons button[aria-pressed='true'], .market-switcher button[aria-pressed='true'] {
  border-color: rgba(180, 190, 254, 0.21);
  color: var(--vix-lavender);
  background: linear-gradient(145deg, #393b51, #27283b);
  box-shadow: inset 0 1px 0 rgba(220, 223, 252, 0.1), 2px 2px 4px rgba(11, 11, 19, 0.7);
}

.market { display: flex; flex-direction: column; }

.market-switcher {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-self: flex-start;
  width: min(100%, 14rem);
  margin-bottom: 0.7rem;
}

.market-switcher button { min-height: 2.15rem; font-size: 0.77rem; letter-spacing: 0.08em; }

.market-well {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 24rem;
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 0.9rem;
  background:
    repeating-linear-gradient(0deg, rgba(180, 190, 254, 0.035) 0 1px, transparent 1px 2.5rem),
    repeating-linear-gradient(90deg, rgba(180, 190, 254, 0.035) 0 1px, transparent 1px 2.5rem),
    var(--vix-mantle);
  box-shadow: inset 0.18rem 0.22rem 0.6rem rgba(10, 10, 18, 0.75);
}

.market-external {
  display: grid;
  flex: 1;
  place-content: center;
  justify-items: center;
  gap: 0.85rem;
  padding: 1rem;
  text-align: center;
}

.market-external h3 { margin: 0; font-size: 1.15rem; }
.market-external a { display: inline-flex; align-items: center; gap: 0.35rem; text-decoration: none; }

.market-credit {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.26rem 0.85rem;
  margin-top: 0.65rem;
  color: var(--vix-muted);
  font-size: 0.72rem;
  line-height: 1.55;
}

.market-links { display: flex; flex-wrap: wrap; gap: 0.2rem 0.9rem; }
.market-credit a { color: var(--vix-lavender); }
.market-credit time { font-variant-numeric: tabular-nums; }

.vix-dashboard :is(a, button, input):focus-visible {
  outline: 2px solid var(--vix-lavender);
  outline-offset: 3px;
}

@media (max-width: 900px) {
  .vix-layout { grid-template-columns: minmax(0, 1fr); }
  .market-well { min-height: 27rem; }
  .vix-jump { display: inline-flex; }
}

@media (max-width: 480px) {
  .vix-panel { border-radius: 1.05rem; }
  .market-well { min-height: 22rem; }
  .surface-button { min-height: 2.55rem; }
  .market-switcher button, .band-buttons button { min-height: 2.36rem; }
  .adjuster input { height: 2.15rem; }
  .band-buttons button { font-size: 0.62rem; }
}

@media (prefers-reduced-motion: reduce) {
  .dial-marker { transition: none; }
}
</style>
