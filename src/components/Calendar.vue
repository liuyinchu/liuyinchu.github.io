<template>
  <div class="calendar">
    <div class="calendar-header">
      {{ currentMonthYear }}
    </div>
    <div class="calendar-grid">
      <div class="calendar-day" v-for="(d, i) in weekdays" :key="'d'+i">{{ d }}</div>
      <div
        class="calendar-cell"
        v-for="(date, index) in daysInMonth"
        :key="'cell'+index"
        :class="{ today: isToday(date) }"
      >
        {{ date ? date.getDate() : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const today = new Date()

const currentYear = today.getFullYear()
const currentMonthIndex = today.getMonth()

const currentMonthYear = today.toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long'
})

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []

  // 填充前置空白
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }

  // 填充日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

const daysInMonth = computed(() => getMonthDays(currentYear, currentMonthIndex))

function isToday(date) {
  return (
    date instanceof Date &&
    !isNaN(date) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}
</script>

<style scoped>
.calendar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
}

.calendar-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
  flex: 1;
}

.calendar-day {
  text-align: center;
  opacity: 0.6;
  font-weight: 600;
  color: var(--ctp-mocha-subtext0);
}

.calendar-cell {
  text-align: center;
  padding: 0.4rem 0;
  border-radius: 0.5rem;
  color: var(--text-color);
  transition: background-color 0.2s ease;
}

.calendar-cell:hover {
  background-color: rgba(255, 255, 255, 0.07);
  cursor: pointer;
}

.calendar-cell.today {
  background-color: #74c7ec;
  color: #1e1e2e;
  font-weight: bold;
}
</style>