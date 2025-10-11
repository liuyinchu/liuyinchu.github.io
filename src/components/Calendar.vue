<template>
  <div class="calendar" @keydown.stop.prevent="onKeydown">
    <div class="calendar-header">
      <button class="nav-btn" @click="toPrevMonth" aria-label="Previous month">◀</button>
      <div class="month-title" :aria-label="currentMonthAria">{{ currentMonthYear }}</div>
      <button class="nav-btn" @click="toNextMonth" aria-label="Next month">▶</button>
      <button class="today-btn" @click="toToday">Today</button>

      <!-- 选中日期存在时，提供标红/取消标红 -->
      <button
        v-if="selectedDate"
        class="mark-btn"
        @click="toggleRedForSelected"
        :aria-label="isRed(selectedDate) ? 'Unmark red' : 'Mark red'"
      >
        {{ isRed(selectedDate) ? 'Cancel' : 'Notice' }}
      </button>
    </div>

    <div class="calendar-grid" role="grid" aria-label="Calendar">
      <div class="calendar-day" v-for="(d, i) in weekdays" :key="'d'+i" role="columnheader">
        {{ d }}
      </div>

      <button
        v-for="(cell, idx) in calendarCells"
        :key="'c'+idx"
        class="calendar-cell"
        :class="{
          today: cell.isToday,
          selected: isSelected(cell.date),
          'out-this-month': !cell.inMonth,
          'is-red': isRed(cell.date)
        }"
        :aria-selected="isSelected(cell.date) ? 'true' : 'false'"
        @click="select(cell.date)"
      >
        {{ cell.date.getDate() }}
      </button>
    </div>

    <!-- 标红日期列表（长期显示；点击即切 Daily 并跳转该日） -->
    <div class="red-dates" v-if="redDatesArr.length">
      <!-- <small class="red-title">已标红：</small> -->
      <div class="red-list">
        <button
          v-for="d in redDatesSorted"
          :key="d"
          class="red-pill"
          :title="'Jump to ' + d"
          @click="jumpTo(d)"
        >
          {{ d }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

/**
 * 本组件仅操作 LocalStorage 并向外广播自定义事件：
 *  - 广播：'app:date-change' { detail: { date: 'YYYY-MM-DD' } }
 *  - 广播：'app:set-mode'    { detail: { mode: 'daily' } }（当点击标红列表时）
 */

const LS_KEYS = {
  REDS: 'portal.redDates',
  SEL:  'portal.selectedDate'
}

const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const viewDate = ref(new Date())     // 当前视图月份（1 号）
const selectedDate = ref(null)       // 选中的具体日期（Date）

// 标红日期数组（字符串 'YYYY-MM-DD'），用数组便于持久化/排序
const redDatesArr = ref(readRedDates())

// 计算属性：当前月份标题、ARIA 文案
const currentMonthYear = computed(() =>
  `${viewDate.value.getFullYear()} - ${String(viewDate.value.getMonth()+1).padStart(2,'0')}`
)
const currentMonthAria = computed(() =>
  viewDate.value.toLocaleDateString('en', { year: 'numeric', month: 'long' })
)

// 生成 6 行 × 7 列（42）格子
const calendarCells = computed(() => buildCalendar(viewDate.value))

// 选中当天：用于样式
function isSelected (d) {
  return !!(d && selectedDate.value && sameDay(d, selectedDate.value))
}
function isRed (d) {
  if (!d) return false
  return redDatesArr.value.includes(fmt(d))
}

// --- 生命周期与持久化 ---
onMounted(() => {
  // 恢复选中日期（若有）
  const s = localStorage.getItem(LS_KEYS.SEL)
  if (s) {
    const parsed = parseDateStr(s)
    if (parsed) {
      selectedDate.value = parsed
      viewDate.value = new Date(parsed.getFullYear(), parsed.getMonth(), 1)
      emitDateChange(parsed)
    }
  }
})

// 标红持久化
watch(redDatesArr, (arr) => {
  try { localStorage.setItem(LS_KEYS.REDS, JSON.stringify(arr)) } catch {}
}, { deep: true })

// 选中日期写回（并通知 ToDoList）
watch(selectedDate, (d) => {
  if (!d) return
  const s = fmt(d)
  try { localStorage.setItem(LS_KEYS.SEL, s) } catch {}
  emitDateChange(d)
})

// --- 交互 ---
function select (d) {
  if (!d) return
  selectedDate.value = new Date(d)
}

function toPrevMonth () {
  const v = new Date(viewDate.value)
  v.setMonth(v.getMonth() - 1, 1)
  viewDate.value = v
}
function toNextMonth () {
  const v = new Date(viewDate.value)
  v.setMonth(v.getMonth() + 1, 1)
  viewDate.value = v
}
function toToday () {
  const t = new Date()
  viewDate.value = new Date(t.getFullYear(), t.getMonth(), 1)
  selectedDate.value = t
}

function toggleRedForSelected () {
  if (!selectedDate.value) return
  const s = fmt(selectedDate.value)
  const idx = redDatesArr.value.indexOf(s)
  if (idx >= 0) redDatesArr.value.splice(idx, 1)
  else redDatesArr.value.push(s)
}

// 点击标红日期：切 Daily + 跳到该日（并滚动到该月）
function jumpTo (dateStr) {
  const d = parseDateStr(dateStr)
  if (!d) return
  viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
  selectedDate.value = d
  // 通知 ToDoList 切 Daily
  window.dispatchEvent(new CustomEvent('app:set-mode', { detail: { mode: 'daily' } }))
}

// 键盘导航（原有行为保留/增强）
function onKeydown (e) {
  const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End','t','T']
  if (!keys.includes(e.key)) return
  e.preventDefault()

  const base = selectedDate.value ?? new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
  const cur = new Date(base)

  switch (e.key) {
    case 'ArrowLeft':  cur.setDate(cur.getDate() - 1); break
    case 'ArrowRight': cur.setDate(cur.getDate() + 1); break
    case 'ArrowUp':    cur.setDate(cur.getDate() - 7); break
    case 'ArrowDown':  cur.setDate(cur.getDate() + 7); break
    case 'PageUp':     cur.setMonth(cur.getMonth() - 1); break
    case 'PageDown':   cur.setMonth(cur.getMonth() + 1); break
    case 'Home':       cur.setDate(1); break
    case 'End':        cur.setMonth(cur.getMonth() + 1, 0); break
    case 't':
    case 'T':          toToday(); return
  }
  selectedDate.value = cur
  if (cur.getMonth() !== viewDate.value.getMonth() || cur.getFullYear() !== viewDate.value.getFullYear()) {
    viewDate.value = new Date(cur.getFullYear(), cur.getMonth(), 1)
  }
}

// --- 辅助与构造 ---
function buildCalendar (d) {
  const y = d.getFullYear()
  const m = d.getMonth()
  const cells = []

  const firstDay = new Date(y, m, 1)
  const lastDay  = new Date(y, m + 1, 0)

  // 前置填充（上个月的尾部）
  const prevPad = firstDay.getDay()
  const prevLastDate = new Date(y, m, 0)
  for (let i = prevPad; i > 0; i--) {
    const date = new Date(y, m - 1, prevLastDate.getDate() - i + 1)
    cells.push(makeCell(date, false))
  }

  // 本月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(y, m, i)
    cells.push(makeCell(date, true))
  }

  // 后置填充（下个月的开头）
  const total = 42
  let nextDay = 1
  while (cells.length < total) {
    const date = new Date(y, m + 1, nextDay++)
    cells.push(makeCell(date, false))
  }
  return cells
}

function makeCell (date, inMonth) {
  return {
    date,
    inMonth,
    isToday: sameDay(date, new Date())
  }
}

function sameDay (a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function fmt (d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateStr (s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  if (Number.isNaN(dt.getTime())) return null
  return dt
}

function readRedDates () {
  try {
    const s = localStorage.getItem(LS_KEYS.REDS)
    const arr = s ? JSON.parse(s) : []
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
  } catch {
    return []
  }
}

// 向外广播日期变化
function emitDateChange (d) {
  window.dispatchEvent(new CustomEvent('app:date-change', { detail: { date: fmt(d) } }))
}

// 派生：排序后的标红列表
const redDatesSorted = computed(() => {
  return [...redDatesArr.value].sort((a, b) => a.localeCompare(b))
})
</script>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.7rem;
  user-select: none;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.month-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  color: var(--text-color);
  font-size: 17px;
  background: var(--ctp-mocha-surface0);;
  border-radius: 0.4rem;
  border: 1px solid var(--ctp-mocha-surface0);
  padding: 0.17rem 0;
}

.nav-btn,
.today-btn,
.mark-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid var(--ctp-mocha-surface0);
  background:var(--ctp-mocha-surface0);;
  color: var(--text-color);
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  font-family: monospace;
  
}

.today-btn {
  margin-left: auto;
  background: linear-gradient(135deg, var(--success-color), #89dceb);
  color: #1e1e2e;
  border-color: var(--success-color);
}
.mark-btn {
  border-color: #eba0ac;
  background: linear-gradient(135deg, var(--danger-color), #f5c2e7);
  color:  #1e1e2e;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 0.2rem;
  column-gap: 0.5rem;
}

.calendar-day {
  text-align: center;
  font-weight: 700;
  color: var(--ctp-mocha-subtext0);
}

.calendar-cell {
  text-align: center;
  padding: 0.35rem 0;
  border-radius: 999999rem;
  color: var(--text-color);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  font-size: 0.88rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
}

.calendar-cell.selected:not(.today) {
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.3);
  background: #b4befe;
  color: var(--background-color);
  border-color: #b4befe;
}

/* 长期标红（高亮） */
.calendar-cell.is-red {
  color: var(--ctp-mocha-red);
  border-color: rgba(235, 111, 146, 0.35); /* 近似 Mocha red 边框 */
  background: rgba(235, 111, 146, 0.08);
}

.calendar-cell.today {
  background: linear-gradient(135deg, var(--success-color), #89dceb);
  color: var(--background-color);
  border-color: var(--success-color);
}

/* 月外日期弱化 */
.calendar-cell.out-this-month {
  opacity: 0.5;
}

.red-dates {
  margin-top: -0.2rem;
}
.red-title {
  color: var(--ctp-mocha-subtext0);
}
.red-list {
  margin-top: 0.25rem;
  display: flex; flex-wrap: wrap; gap: 0.5rem;
}
.red-pill {
  border: 1px solid var(--ctp-mocha-red);
  color: var(--ctp-mocha-red);
  background: transparent;
  border-radius: 999px;
  padding: 0.05rem 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

@media (max-width: 460px) {
  .calendar { padding: 0.5rem; font-size: 0.8rem; }
  .month-title { font-weight: 700; }
}
</style>