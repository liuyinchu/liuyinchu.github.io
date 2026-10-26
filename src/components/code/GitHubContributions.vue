<template>
  <section class="github-panel" aria-labelledby="contributions-title" :aria-busy="loading">
    <header class="panel-header">
      <div class="panel-heading">
        <h2 id="contributions-title">把想法，写进每一天<span>.</span></h2>
      </div>
      <div class="panel-controls">
        <div class="account-switch" role="group" aria-label="GitHub 账号">
          <span class="account-switch__thumb" :class="{ 'is-secondary': login === accounts[1].login }" aria-hidden="true"></span>
          <button v-for="account in accounts" :key="account.login" type="button"
            :aria-pressed="login === account.login" @click="selectAccount(account.login)">
            <span class="account-at">@</span>{{ account.login }}
          </button>
        </div>
        <label class="period-label">
          <span class="sr-only">贡献期间</span>
          <select v-model="period" aria-label="贡献期间">
            <option value="last">近一年</option>
            <option v-for="year in years" :key="year" :value="String(year)">{{ year }} 年</option>
          </select>
        </label>
      </div>
    </header>

    <div v-if="!days.length && loading" class="panel-skeleton" role="status" aria-label="正在获取 GitHub 贡献">
      <div class="skeleton-caption"></div>
      <div class="skeleton-calendar"></div>
      <div class="skeleton-stats"><span v-for="i in 4" :key="i"></span></div>
      <span class="sr-only">正在获取 GitHub 贡献…</span>
    </div>

    <div v-else-if="!days.length && failure" class="contribution-error" role="status">
      <span class="error-orbit" aria-hidden="true">↗</span>
      <h3>暂时无法连接贡献数据</h3>
      <p>{{ failure }}。可以重试，或直接前往 GitHub 查看。</p>
      <div><button type="button" class="retry-button" @click="load(true)">重新获取</button>
        <a :href="profileUrl" target="_blank" rel="noopener noreferrer">在 GitHub 查看 ↗</a></div>
    </div>

    <template v-else-if="days.length">
      <div class="calendar-meta">
        <p class="calendar-range">{{ days[0].date }} <span>—</span> {{ days.at(-1).date }}</p>
        <div class="day-inspector">
          <span v-if="activeDay" id="contribution-tooltip" role="tooltip">
            {{ formatContributionDate(activeDay.date) }}<b>{{ activeDay.count }} 次贡献</b>
          </span>
          <span v-else class="inspector-hint">悬停或点按查看 · 方向键浏览</span>
        </div>
      </div>

      <div ref="scrollRef" class="calendar-scroll" aria-label="贡献日历，可横向滚动">
        <div class="calendar-canvas" :style="{ '--weeks': calendar.weeks.length }">
          <div class="month-labels" aria-hidden="true">
            <span v-for="month in calendarMonths" :key="month.key" :style="{ gridColumn: month.week + 2 }">{{ month.label }}</span>
          </div>
          <div class="heatmap" role="group" aria-label="每日贡献；上下移动一天，左右移动一周，Home 和 End 跳到首尾">
            <div class="weekday-labels" aria-hidden="true"><span></span><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span></div>
            <div v-for="(week, index) in calendar.weeks" :key="index" class="week-column">
              <template v-for="(day, weekday) in week" :key="weekday">
                <button v-if="day" type="button" class="contribution-day"
                  :data-date="day.date" :data-level="day.level"
                  :class="{ inspected: activeDay?.date === day.date }"
                  :tabindex="focusIndex === day.index ? 0 : -1"
                  :aria-label="formatContributionDate(day.date) + '，' + day.count + ' 次贡献'"
                  :aria-describedby="activeDay?.date === day.date ? 'contribution-tooltip' : undefined"
                  @pointerenter="inspect(day)" @pointerleave="leaveDay($event)"
                  @focus="inspect(day)" @blur="activeDay = null"
                  @click="inspect(day)" @keydown="onDayKey($event, day.index)"></button>
                <span v-else class="calendar-blank" aria-hidden="true"></span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-bottom">
        <p>贡献包含提交、Pull Request、Issue 等公开活动</p>
        <div class="calendar-legend" aria-label="颜色越亮，贡献越多"><span>少</span>
          <i v-for="level in 5" :key="level" :data-level="level - 1"></i><span>多</span></div>
      </div>

      <dl class="contribution-stats">
        <div data-stat="total"><dt>区间贡献</dt><dd>{{ number(stats.total) }}<small>次</small></dd></div>
        <div data-stat="active"><dt>活跃天数</dt><dd>{{ number(stats.activeDays) }}<small>天</small></dd></div>
        <div data-stat="streak"><dt>区间最长连续</dt><dd>{{ number(stats.longestStreak) }}<small>天</small></dd></div>
        <div data-stat="latest"><dt>该期间最近活跃</dt><dd class="date-value">{{ stats.latestActive || '暂无' }}</dd></div>
      </dl>

      <div v-if="failure" class="cache-warning" role="status">
        <span>显示过期缓存 · {{ failure }}</span>
        <button type="button" :disabled="loading" @click="load(true)">{{ loading ? '正在重试…' : '重试' }}</button>
      </div>
      <div v-else-if="loading" class="refresh-note" role="status">正在更新缓存…</div>
    </template>

    <footer class="panel-source">
      <span>来源：GitHub 公开贡献 · <a href="https://github.com/grubersjoe/github-contributions-api" target="_blank" rel="noopener noreferrer">第三方数据服务</a>
        <span v-if="fetchedAt" class="fetched-time"> · 获取于 {{ fetchedTime }}</span>
        <span class="source-delay"> · 服务缓存约一小时，GitHub 记录可能另有延迟</span></span>
      <a :href="profileUrl" target="_blank" rel="noopener noreferrer">@{{ login }}</a>
    </footer>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeContributions, contributionCalendar, contributionStats, formatContributionDate, moveContributionFocus } from '../../utils/githubContributions.mjs'

const accounts = [{ login: 'pifuyuini', since: 2023 }, { login: 'liuyinchu', since: 2025 }]
const login = ref('pifuyuini')
const period = ref('last')
const days = ref([])
const loading = ref(false)
const failure = ref('')
const fetchedAt = ref(0)
const focusIndex = ref(0)
const activeDay = ref(null)
const scrollRef = ref(null)
const memoryCache = new Map()
const CACHE_AGE = 60 * 60 * 1000
let controller
let requestId = 0

const years = computed(() => {
  const first = accounts.find(account => account.login === login.value).since
  return Array.from({ length: new Date().getFullYear() - first + 1 }, (_, i) => new Date().getFullYear() - i)
})
const profileUrl = computed(() => 'https://github.com/' + login.value + (period.value === 'last' ? '' : '?tab=overview&from=' + period.value + '-01-01&to=' + period.value + '-12-31'))
const calendar = computed(() => contributionCalendar(days.value))
// A short first month can share a week with the next; keep its label from colliding.
const calendarMonths = computed(() => calendar.value.months.filter((month, index, months) => index > 0 || months.length === 1 || months[1].week - month.week >= 2))
const stats = computed(() => contributionStats(days.value))
const fetchedTime = computed(() => new Date(fetchedAt.value).toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }))
const number = value => new Intl.NumberFormat('zh-CN').format(value)

function selectAccount(account) {
  if (login.value === account) return
  period.value = 'last'
  login.value = account
}
function inspect(day) {
  focusIndex.value = day.index
  activeDay.value = day
}
function leaveDay(event) {
  if (document.activeElement !== event.currentTarget) activeDay.value = null
}
async function onDayKey(event, index) {
  if (event.key === 'Escape') {
    activeDay.value = null
    return
  }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  focusIndex.value = moveContributionFocus(days.value, index, event.key)
  await nextTick()
  scrollRef.value?.querySelector('[data-date="' + days.value[focusIndex.value].date + '"]')?.focus({ preventScroll: true })
  const button = scrollRef.value?.querySelector('[data-date="' + days.value[focusIndex.value].date + '"]')
  if (button && scrollRef.value) {
    // Scroll only the calendar, keeping keyboard navigation from moving the page.
    const left = button.offsetLeft - scrollRef.value.offsetLeft
    if (left < scrollRef.value.scrollLeft) scrollRef.value.scrollLeft = left - 8
    else if (left + button.offsetWidth > scrollRef.value.scrollLeft + scrollRef.value.clientWidth) {
      scrollRef.value.scrollLeft = left + button.offsetWidth - scrollRef.value.clientWidth + 8
    }
  }
}
function readCache(key) {
  try {
    const cached = memoryCache.get(key) || JSON.parse(localStorage.getItem(key) || 'null')
    if (cached && Number.isFinite(cached.fetchedAt) && cached.fetchedAt > 0) {
      return { ...cached, days: normalizeContributions(cached.payload, period.value) }
    }
  } catch { /* Storage restrictions must not prevent fetching public data. */ }
  return null
}
function saveCache(key, entry) {
  memoryCache.set(key, entry)
  try { localStorage.setItem(key, JSON.stringify(entry)) } catch { /* Memory cache remains available. */ }
}
async function setDays(value) {
  days.value = value
  focusIndex.value = value.length - 1
  activeDay.value = null
  await nextTick()
  if (scrollRef.value) scrollRef.value.scrollLeft = scrollRef.value.scrollWidth
}
async function load(force = false) {
  const id = ++requestId
  controller?.abort()
  const currentController = new AbortController()
  controller = currentController
  const key = 'code-contributions:v1:' + login.value + ':' + period.value
  const cached = readCache(key)
  failure.value = ''
  fetchedAt.value = cached?.fetchedAt || 0
  loading.value = true
  await setDays(cached?.days || [])
  if (id !== requestId) return
  if (cached && Date.now() - cached.fetchedAt < CACHE_AGE && !force) {
    loading.value = false
    return
  }
  const timer = setTimeout(() => currentController.abort(), 10_000)
  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/' + login.value + '?y=' + period.value, { signal: currentController.signal })
    if (!response.ok) throw new Error('数据服务暂不可用（' + response.status + '）')
    const payload = await response.json()
    const normalized = normalizeContributions(payload, period.value)
    if (id !== requestId) return
    const entry = { payload, fetchedAt: Date.now() }
    saveCache(key, entry)
    fetchedAt.value = entry.fetchedAt
    await setDays(normalized)
  } catch (error) {
    if (id !== requestId) return
    failure.value = error.name === 'AbortError' ? '请求超时，请稍后重试' : error.message === 'Failed to fetch' ? '网络连接暂不可用' : error.message || '无法获取贡献数据'
  } finally {
    clearTimeout(timer)
    if (id === requestId) loading.value = false
  }
}
watch([login, period], () => load(), { immediate: true, flush: 'post' })
onBeforeUnmount(() => { requestId += 1; controller?.abort() })
</script>

<style scoped>
.github-panel {
  --day-0: #292b3e; --day-1: #41446b; --day-2: #64669a; --day-3: #9995ca; --day-4: #d3c3ef;
  width: 100%; min-width: 0; box-sizing: border-box; position: relative;
  padding: 2rem 2rem 0; border: 1px solid rgba(203,166,247,.18); border-radius: 20px;
  background: radial-gradient(ellipse at 88% 0%, rgba(137,180,250,.065), transparent 48%), linear-gradient(140deg,rgba(30,30,46,.94),rgba(24,24,37,.98));
  box-shadow: 0 20px 60px -35px rgba(0,0,0,.7), inset 0 1px 0 rgba(243,233,198,.035);
}
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.panel-heading h2 { font-size: clamp(1.2rem,2.2vw,1.55rem); color: var(--c-gold); font-weight: 500; letter-spacing: .03em; margin: 0; }
.panel-heading h2 > span { color: #b4befe; }
.panel-controls { display: flex; align-items: center; flex-wrap: wrap; gap: .7rem; }
.account-switch { position: relative; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); padding: 4px; gap: 3px; border: 1px solid #cba6f71a; border-radius: 11px; background: #11111b65; }
.account-switch__thumb { position: absolute; inset: 4px auto 4px 4px; width: calc((100% - 11px) / 2); box-sizing: border-box; border: 1px solid #cba6f724; border-radius: 7px; background: #313244; box-shadow: 0 2px 8px #0002; pointer-events: none; transition: transform 360ms cubic-bezier(.22,1,.36,1); }
.account-switch__thumb.is-secondary { transform: translateX(calc(100% + 3px)); }
.account-switch button { position: relative; z-index: 1; padding: .55rem .75rem; color: var(--c-text-dim); background: transparent; border: 1px solid transparent; border-radius: 7px; cursor: pointer; font: 12px/1.3 system-ui,sans-serif; transition: color .2s ease, transform 160ms cubic-bezier(.22,1,.36,1); }
.account-switch button[aria-pressed="true"] { color: #f3e9c6; }
@media (prefers-reduced-motion: no-preference) {
  .account-switch button:active { transform: scale(.97); }
}
.account-at { opacity: .6; padding-right: 2px; }
.period-label select { appearance: auto; border: 1px solid #cba6f72b; border-radius: 9px; padding: .7rem .6rem; background: #1e1e2e; color: var(--c-text-main); font: inherit; font-size: .8rem; line-height: 1.2; cursor: pointer; color-scheme: dark; }
.calendar-meta { display: flex; justify-content: space-between; align-items: center; gap: .5rem; min-height: 1.5rem; margin-bottom: 1rem; }
.calendar-range { margin: 0; font: 11px/1.5 system-ui,sans-serif; color: var(--c-text-dim); white-space: nowrap; letter-spacing: .015em; }
.calendar-range > span { opacity: .4; margin: 0 .4rem; }
.day-inspector { min-height: 1.4rem; text-align: right; font-size: .75rem; color: var(--c-text-dim); }
.day-inspector b { font-weight: 500; color: var(--c-gold); padding-left: .8rem; }
.inspector-hint { color: #a6adc8; opacity: .8; font-size: .7rem; }
.calendar-scroll { width: 100%; overflow-x: auto; overflow-y: hidden; padding: 4px 0 9px; scrollbar-width: thin; scrollbar-color: #535271 #181825; }
.calendar-canvas { min-width: calc(32px + var(--weeks) * 16px); width: 100%; }
.month-labels, .heatmap { display: grid; grid-template-columns: 26px repeat(var(--weeks), minmax(0,1fr)); gap: 4px; }
.month-labels { margin-bottom: 8px; height: 14px; color: var(--c-text-dim); font: 10px/14px system-ui,sans-serif; }
.month-labels > span { grid-row: 1; white-space: nowrap; overflow: visible; }
.week-column,.weekday-labels { display: grid; grid-template-rows: repeat(7,12px); gap: 4px; }
.weekday-labels { color: var(--c-text-dim); font-size: 10px; line-height: 12px; }
.contribution-day,.calendar-legend i { border: 1px solid #ffffff05; background: var(--day-0); border-radius: 3px; }
.contribution-day { display: block; width: 100%; height: 12px; min-height: 0; min-width: 0; box-sizing: border-box; padding: 0; cursor: pointer; transition: filter .16s,transform .16s,box-shadow .16s; }
[data-level="1"] { background: var(--day-1) !important; }
[data-level="2"] { background: var(--day-2) !important; }
[data-level="3"] { background: var(--day-3) !important; }
[data-level="4"] { background: var(--day-4) !important; }
.contribution-day.inspected { box-shadow: 0 0 0 1.5px #f3e9c6; filter: brightness(1.18); }
.calendar-bottom { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: .65rem 0 1.6rem; }
.calendar-bottom > p { margin: 0; font-size: .68rem; color: var(--c-text-dim); }
.calendar-legend { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.calendar-legend span { font-size: 10px; color: var(--c-text-dim); margin: 0 3px; }
.calendar-legend i { width: 10px; height: 10px; }
.contribution-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); border-top: 1px solid #cba6f71c; padding: 1.6rem 0; margin: 0; }
.contribution-stats > div { padding: 0 1.8rem; border-left: 1px solid #cba6f71c; }
.contribution-stats > div:first-child { padding-left: 0; border-left: 0; }
.contribution-stats > div:last-child { padding-right: 0; }
.contribution-stats dt { font-size: .75rem; color: var(--c-text-dim); margin-bottom: .7rem; }
.contribution-stats dd { color: var(--c-gold); margin: 0; font: 400 2rem/1.15 system-ui,sans-serif; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.contribution-stats dd small { font: .65rem/1.2 system-ui,sans-serif; letter-spacing: 0; color: var(--c-text-dim); padding-left: .5rem; }
.contribution-stats .date-value { font-size: clamp(.85rem,1.5vw,1.25rem); line-height: 2.3rem; letter-spacing: -.015em; white-space: nowrap; }
.panel-source { display: flex; align-items: baseline; justify-content: space-between; gap: .8rem; border-top: 1px solid #cba6f714; padding: 1rem 0; color: var(--c-text-dim); font-size: .62rem; line-height: 1.8; }
.panel-source > a { white-space: nowrap; }
.github-panel a { color: #b4befe; text-underline-offset: 3px; text-decoration-color: #b4befe45; transition: color .2s,text-decoration-color .2s; }
.github-panel a:hover { color: var(--c-gold); text-decoration-color: var(--c-gold); }
.cache-warning { display: flex; gap: 1rem; justify-content: space-between; align-items: center; color: #f9e2af; font-size: .75rem; padding: .7rem 0; border-top: 1px solid #f9e2af20; }
.cache-warning button { color: inherit; background: transparent; border: 1px solid #f9e2af50; border-radius: 5px; padding: .35rem .7rem; font: inherit; cursor: pointer; white-space: nowrap; }
.refresh-note { color: #a6adc8; font-size: .72rem; padding-bottom: .7rem; }
.contribution-error { text-align: center; padding: 2rem 1rem 3rem; min-height: 190px; box-sizing: border-box; }
.error-orbit { color: #b4befe; font-size: 2rem; }
.contribution-error h3 { color: var(--c-gold); font-size: 1rem; font-weight: 500; }
.contribution-error p { color: var(--c-text-dim); font-size: .8rem; line-height: 1.7; }
.contribution-error > div { display: flex; gap: 1.2rem; align-items: center; justify-content: center; margin-top: 1.2rem; font-size: .8rem; }
.retry-button { color: var(--c-gold); border: 1px solid #f3e9c640; border-radius: 7px; background: #f3e9c60a; padding: .65rem 1rem; font: inherit; cursor: pointer; }
.panel-skeleton { min-height: 290px; padding: 0 0 1rem; }
.skeleton-caption { width: 170px; height: 12px; background: #313244; border-radius: 4px; margin-bottom: 1.5rem; }
.skeleton-calendar { height: 115px; border-radius: 5px; opacity: .7; background: repeating-linear-gradient(90deg,transparent 0 12px,#1e1e2e 12px 16px),repeating-linear-gradient(0deg,#313244 0 12px,#1e1e2e 12px 16px); }
.skeleton-stats { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2.3rem; }
.skeleton-stats span { width: 19%; height: 48px; border-radius: 4px; background: #31324470; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.github-panel :is(button,select,a):focus-visible { outline: 2px solid #f3e9c6; outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .contribution-day:hover { transform: scale(1.18); }
  .github-panel { animation: panel-arrive .55s ease-out both; }
  .panel-skeleton { animation: skeleton-breathe 1.4s ease-in-out 2; }
}
@keyframes panel-arrive { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
@keyframes skeleton-breathe { 50% { opacity: .5; } }
@media (max-width: 900px) {
  .panel-header { align-items: flex-start; flex-direction: column; gap: 1.2rem; }
  .panel-controls { width: 100%; justify-content: space-between; }
  .contribution-stats > div { padding-inline: 1.15rem; }
}
@media (max-width: 600px) {
  .github-panel { padding: 1.25rem 1rem 0; border-radius: 15px; }
  .panel-header { margin-bottom: 1.25rem; }
  .panel-controls { gap: .5rem; }
  .account-switch { flex: 1; }
  .account-switch button { flex: 1; min-height: 40px; padding: .45rem .3rem; font-size: 11px; }
  .period-label select { min-height: 48px; padding-inline: .4rem; font-size: .75rem; }
  .calendar-meta { flex-direction: column; align-items: flex-start; gap: .5rem; margin-bottom: .5rem; }
  .day-inspector { text-align: left; min-height: 1.3rem; }
  .calendar-bottom { flex-wrap: wrap; gap: .5rem; margin-bottom: 1.1rem; }
  .calendar-bottom > p { font-size: .6rem; }
  .calendar-legend { margin-left: auto; }
  .contribution-stats { padding: 1.2rem 0; }
  .contribution-stats > div { padding: 0 .6rem; }
  .contribution-stats dt { font-size: .57rem; white-space: nowrap; letter-spacing: -.03em; margin-bottom: .7rem; }
  .contribution-stats dd { font-size: 1.4rem; }
  .contribution-stats dd small { display: none; }
  .contribution-stats .date-value { font-size: .6rem; line-height: 1.6rem; letter-spacing: -.035em; }
  .panel-source { flex-wrap: wrap; gap: .3rem; padding: .8rem 0; font-size: .58rem; }
  .source-delay { display: block; }
  .contribution-error { padding-inline: 0; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
</style>
