<template>
  <div class="calendar" @keydown.stop.prevent="onKeydown">
    <div class="calendar-header">
      <button class="nav-btn" @click="toPrevMonth" aria-label="Previous month">‹</button>
      <div class="month-title" :aria-label="currentMonthAria">{{ currentMonthYear }}</div>
      <button class="nav-btn" @click="toNextMonth" aria-label="Next month">›</button>
      <button class="today-btn" @click="toToday">今天</button>
    </div>

    <div class="calendar-grid" role="grid" aria-label="Calendar">
      <div class="calendar-day" v-for="(d, i) in weekdays" :key="'d'+i" role="columnheader">
        {{ d }}
      </div>

      <button
        v-for="(cell, idx) in calendarCells"
        :key="'cell'+idx"
        class="calendar-cell"
        role="gridcell"
        :class="{
          'other-month': !cell.inCurrentMonth,
          'today': cell.isToday,
          'selected': isSelected(cell.date)
        }"
        :tabindex="cell.date ? 0 : -1"
        :disabled="!cell.date"
        :aria-label="cell.aria"
        @click="select(cell.date)"
      >
        <span class="date-number">{{ cell.date ? cell.date.getDate() : '' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const today = new Date()
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(null)

// 修改1: 将星期数组改为中文
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthYear = computed(() =>
  viewDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
)
const currentMonthAria = computed(() =>
  viewDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
)

function buildCalendar(d) {
  const year = d.getFullYear();
  const month = d.getMonth();
  const cells = [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const prevMonthPadDays = firstDay.getDay();
  const prevMonthLastDate = new Date(year, month, 0);

  for (let i = prevMonthPadDays; i > 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDate.getDate() - i + 1);
    cells.push(createCellObject(date, false));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    cells.push(createCellObject(date, true));
  }

  const totalCells = 42;
  let nextMonthDay = 1;
  while (cells.length < totalCells) {
    const date = new Date(year, month + 1, nextMonthDay++);
    cells.push(createCellObject(date, false));
  }
  
  return cells;
}

function createCellObject(date, inCurrentMonth) {
  if (!date) return { date: null, inCurrentMonth: false, isToday: false, aria: '' };
  
  const isToday = date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate();

  const aria = date.toLocaleDateString('en-CA');

  return { date, inCurrentMonth, isToday, aria };
}

const calendarCells = computed(() => buildCalendar(viewDate.value))

function toPrevMonth() { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1) }
function toNextMonth() { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1) }
function toToday() {
  const todayVal = new Date();
  viewDate.value = new Date(todayVal.getFullYear(), todayVal.getMonth(), 1);
  selectedDate.value = todayVal;
}

function isSelected(d) {
  return d && selectedDate.value && d.getTime() === selectedDate.value.getTime();
}

function select(d) { if (d) selectedDate.value = new Date(d) }

function onKeydown(e) {
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End','t','T'].includes(e.key)) return;
  
  e.preventDefault();
  
  const base = selectedDate.value ?? new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
  const cur = new Date(base);

  switch (e.key) {
    case 'ArrowLeft':  cur.setDate(cur.getDate() - 1); break;
    case 'ArrowRight': cur.setDate(cur.getDate() + 1); break;
    case 'ArrowUp':    cur.setDate(cur.getDate() - 7); break;
    case 'ArrowDown':  cur.setDate(cur.getDate() + 7); break;
    case 'PageUp':     cur.setMonth(cur.getMonth() - 1); break;
    case 'PageDown':   cur.setMonth(cur.getMonth() + 1); break;
    case 'Home':       cur.setDate(1); break;
    case 'End':        cur.setMonth(cur.getMonth() + 1, 0); break;
    case 't':
    case 'T':          toToday(); return;
  }

  selectedDate.value = cur;
  if (cur.getMonth() !== viewDate.value.getMonth() || cur.getFullYear() !== viewDate.value.getFullYear()) {
    viewDate.value = new Date(cur.getFullYear(), cur.getMonth(), 1);
  }
}
</script>

<style scoped>
.calendar {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  gap: 0.5rem; padding: 0rem; font-size: 0.85rem;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: var(--text-color); background: transparent;
}
.calendar-header {
  display: grid; grid-template-columns: auto 1fr auto auto;
  align-items: center; gap: 0.5rem; user-select: none;
}
.month-title {
  text-align: center; font-weight: 700; letter-spacing: 0.2px;
  padding: 0.25rem 0.5rem; border-radius: 0.5rem;
  background: rgba(255,255,255,0.04);
  backdrop-filter: saturate(120%) blur(2px);
}
.nav-btn, .today-btn {
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: var(--text-color); padding: 0.25rem 0.5rem; line-height: 1;
  border-radius: 0.45rem; cursor: pointer;
  transition: transform 0.06s ease, background-color 0.15s ease, border-color 0.15s ease;
}
.nav-btn:hover, .today-btn:hover {
  background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12);
}
.nav-btn:active, .today-btn:active {
  transform: translateY(1px);
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
  flex: 1;
}

/* 修改2: 调整星期行(表头)的样式 */
.calendar-day {
  text-align: center;
  font-weight: 600;
  padding: 0.35rem 0;
  /* 使用一个更明亮的颜色变量，并去掉透明度 */
  color: #94e2d5; /* 使用主文字颜色，并提供一个备用值 */
  /* opacity: 0.9; 可以保留轻微的透明度，或直接去掉让它完全不透明 */
}

.calendar-cell {
  position: relative; display: grid; place-items: center; padding: 0;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  color: var(--text-color);
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.06s ease;
  outline: none;
}
.calendar-cell:hover:not(:disabled) {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.12);
  cursor: pointer;
}
.calendar-cell:focus-visible {
  box-shadow: 0 0 0 2px rgba(116,199,236,0.7);
}
.date-number {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.other-month { opacity: 0.45; }
.today {
  background-color: #74c7ec; color: #1e1e2e;
  border-color: transparent; font-weight: 800;
}
.selected:not(.today) {
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.05);
}
.calendar-cell:disabled {
  visibility: hidden;
}
@media (max-width: 460px) {
  .calendar { padding: 0.5rem; font-size: 0.8rem; }
  .month-title { font-weight: 700; }
}
</style>