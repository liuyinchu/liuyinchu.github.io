<template>
  <div class="reminders-app">
    <header class="reminders-header">
      <h2>Reminders</h2>
      <span class="reminders-count" :aria-label="remainingCount + ' incomplete reminders'">{{ remainingCount }}</span>
    </header>

    <div class="reminders-toolbar">
      <div class="reminders-segments" role="group" aria-label="Reminder scope">
        <button type="button" :class="{ 'is-active': mode === 'global' }" :aria-pressed="mode === 'global'" @click="setMode('global')">All</button>
        <button type="button" :class="{ 'is-active': mode === 'daily' }" :aria-pressed="mode === 'daily'" @click="setMode('daily')">Daily</button>
      </div>
      <time v-if="mode === 'daily'" class="reminders-selected-date" :datetime="selectedDateStr" :title="'Date selected in Calendar: ' + selectedDateStr">{{ selectedDateStr }}</time>
    </div>

    <form class="reminders-composer" @submit.prevent="addTask">
      <input
        v-model="newTaskText"
        type="text"
        class="reminders-input"
        :placeholder="mode === 'daily' ? 'Add a reminder for this day' : 'Add a reminder'"
        aria-label="New reminder"
        autocomplete="off"
      />
      <button type="submit" class="reminders-add" :disabled="!canAddTask"><span class="reminders-add-icon" aria-hidden="true"></span>Add</button>
    </form>

    <div class="reminders-content">
      <ul v-if="visibleTasks.length" class="reminders-list" aria-label="Reminders">
        <li v-for="task in visibleTasks" :key="task.id" class="reminders-item" :class="{ 'is-completed': task.completed }">
          <label class="reminders-check-target">
            <input type="checkbox" class="reminders-checkbox" :checked="task.completed" @change="toggleTaskCompletion(task.id)" :aria-label="'Complete reminder: ' + task.text" />
            <span class="reminders-check-icon" aria-hidden="true"></span>
          </label>
          <div class="reminders-task-content">
            <span class="reminders-task-text">{{ task.text }}</span>
            <time v-if="task.date && mode === 'global'" class="reminders-task-date" :datetime="task.date">{{ task.date }}</time>
          </div>
          <button type="button" class="reminders-delete" @click="deleteTask(task.id)" :aria-label="'Delete reminder: ' + task.text" title="Delete reminder"><span class="reminders-delete-icon" aria-hidden="true"></span></button>
        </li>
      </ul>
      <div v-else class="reminders-empty" role="status">
        <img src="/portal-icons/reminders.svg" width="40" height="40" alt="" />
        <p>{{ mode === 'daily' ? 'No reminders for this day' : 'No reminders yet' }}</p>
        <span>{{ mode === 'daily' ? 'Add one above or select another day in Calendar.' : 'Your reminders will appear here.' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

/** LocalStorage keys 与日历联动事件 */
const LS_KEYS = {
  TODOS: 'myToDoList',
  MODE:  'myToDoMode',
  SEL:   'portal.selectedDate'
}

const newTaskText = ref('')

// 读取任务并向后兼容旧结构
const raw = safeRead(LS_KEYS.TODOS, '[]')
const tasks = ref(Array.isArray(raw) ? raw.map(migrateTask) : [])

// 模式：默认全局
const mode = ref(localStorage.getItem(LS_KEYS.MODE) === 'daily' ? 'daily' : 'global')

// 当前选中日期（与 Calendar 联动）
const selectedDateStr = ref(
  (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEYS.SEL)) || formatDate(new Date())
)

// 过滤后的可见任务
const visibleTasks = computed(() => {
  if (mode.value !== 'daily') return tasks.value
  return tasks.value.filter(t => t.date === selectedDateStr.value)
})

const remainingCount = computed(() => visibleTasks.value.filter(task => !task.completed).length)
const canAddTask = computed(() => newTaskText.value.trim().length > 0)

// 持久化
watch(tasks, (v) => safeWrite(LS_KEYS.TODOS, v), { deep: true })
watch(mode,  (m) => localStorage.setItem(LS_KEYS.MODE, m))

// 监听 Calendar 的广播
onMounted(() => {
  window.addEventListener('app:date-change', onDateChange)
  window.addEventListener('app:set-mode', onModeChange)
})

onUnmounted(() => {
  window.removeEventListener('app:date-change', onDateChange)
  window.removeEventListener('app:set-mode', onModeChange)
})

// 业务操作
function addTask () {
  const txt = newTaskText.value.trim()
  if (!txt) return
  tasks.value.push({
    id: Date.now(),
    text: txt,
    completed: false,
    date: mode.value === 'daily' ? selectedDateStr.value : null
  })
  newTaskText.value = ''
}
function deleteTask (id) {
  tasks.value = tasks.value.filter(t => t.id !== id)
}
function toggleTaskCompletion (id) {
  const t = tasks.value.find(x => x.id === id)
  if (t) t.completed = !t.completed
}
function setMode (m) {
  mode.value = m === 'daily' ? 'daily' : 'global'
}

// 联动事件回调
function onDateChange (e) {
  if (!e?.detail?.date) return
  selectedDateStr.value = e.detail.date
  localStorage.setItem(LS_KEYS.SEL, selectedDateStr.value)
}
function onModeChange (e) {
  const m = e?.detail?.mode
  if (!m) return
  setMode(m)
}

// 工具函数
function migrateTask (t) {
  if (typeof t === 'string') {
    return { id: Date.now() + Math.random(), text: t, completed: false, date: null }
  }
  if (t && typeof t === 'object') {
    return { id: t.id ?? (Date.now() + Math.random()), text: t.text ?? '', completed: !!t.completed, date: (t.date ?? null) }
  }
  return { id: Date.now() + Math.random(), text: '', completed: false, date: null }
}
function formatDate (d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function safeRead (key, fallbackJson) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : JSON.parse(fallbackJson)
  } catch {
    return JSON.parse(fallbackJson)
  }
}
function safeWrite (key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
</script>

<style scoped>
.reminders-app {
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  color: var(--app-text, #f8f9fc);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.45;
}
.reminders-app *,
.reminders-app *::before,
.reminders-app *::after { box-sizing: border-box; }
.reminders-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex: none; margin-bottom: 16px; }
.reminders-header h2 { margin: 0; font-size: 24px; font-weight: 650; letter-spacing: -.65px; line-height: 1.2; }
.reminders-count { color: var(--app-accent, #8bbcff); font-size: 28px; line-height: 1.2; font-weight: 600; font-variant-numeric: tabular-nums; }
.reminders-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; flex: none; margin-bottom: 14px; }
.reminders-segments { display: inline-flex; padding: 3px; gap: 3px; border: 1px solid var(--app-line, rgba(255,255,255,.12)); border-radius: 9px; background: var(--app-fill, rgba(255,255,255,.065)); }
.reminders-app button { font: inherit; cursor: pointer; }
.reminders-segments button { min-width: 70px; min-height: 30px; padding: 4px 16px; border: 0; border-radius: 6px; color: var(--app-muted, rgba(255,255,255,.68)); background: transparent; font-weight: 500; }
.reminders-segments button.is-active { color: var(--app-text, #f8f9fc); background: var(--app-control-bg, rgba(255,255,255,.10)); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.reminders-selected-date { color: var(--app-muted, rgba(255,255,255,.68)); font-size: 12px; font-variant-numeric: tabular-nums; }
.reminders-composer { display: flex; flex: none; align-items: center; gap: 10px; border-bottom: 1px solid var(--app-line, rgba(255,255,255,.12)); padding: 0 0 10px; }
.reminders-input { display: block; width: 100%; min-width: 0; min-height: 36px; padding: 7px 10px; border: 1px solid transparent; border-radius: 8px; color: var(--app-text, #f8f9fc); background: var(--app-fill, rgba(255,255,255,.065)); font: inherit; }
.reminders-input::placeholder { color: var(--app-muted, rgba(255,255,255,.68)); opacity: 1; }
.reminders-add { display: inline-flex; align-items: center; justify-content: center; gap: 5px; flex: none; min-height: 34px; padding: 6px 14px; border: 1px solid var(--app-line, rgba(255,255,255,.12)); border-radius: 7px; color: var(--app-accent, #8bbcff); background: var(--app-control-bg, rgba(255,255,255,.10)); font-weight: 600; }
.reminders-add-icon,
.reminders-delete-icon { display: block; flex: none; width: 18px; height: 18px; background: currentColor; mask-size: contain; mask-position: center; mask-repeat: no-repeat; }
.reminders-add-icon { mask-image: url('/portal-icons/plus.svg'); }
.reminders-delete-icon { mask-image: url('/portal-icons/trash-2.svg'); }
.reminders-add:disabled { color: var(--app-muted, rgba(255,255,255,.68)); opacity: .5; cursor: default; }
.reminders-content { flex: 1 1 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--app-line, rgba(255,255,255,.12)) transparent; }
.reminders-list { padding: 0; margin: 0; list-style: none; }
.reminders-item { display: flex; align-items: flex-start; min-width: 0; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--app-line, rgba(255,255,255,.12)); }
.reminders-check-target { position: relative; display: flex; flex: none; width: 32px; height: 32px; align-items: center; justify-content: center; cursor: pointer; }
.reminders-checkbox { appearance: none; width: 20px; height: 20px; margin: 0; border: 1.5px solid var(--app-muted, rgba(255,255,255,.68)); border-radius: 50%; background: transparent; cursor: pointer; }
.reminders-checkbox:checked { border-color: var(--app-accent, #8bbcff); background: var(--app-accent, #8bbcff); }
.reminders-check-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; background: #162333; mask: url('/portal-icons/check.svg') center / contain no-repeat; pointer-events: none; opacity: 0; }
.reminders-checkbox:checked + .reminders-check-icon { opacity: 1; }
.reminders-check-target:focus-within { outline: 2px solid var(--app-accent, #8bbcff); outline-offset: 1px; border-radius: 50%; }
.reminders-task-content { display: flex; flex: 1; flex-direction: column; align-items: flex-start; min-width: 0; gap: 4px; padding: 6px 0; }
.reminders-task-text { overflow-wrap: anywhere; white-space: pre-wrap; }
.reminders-task-date { color: var(--app-muted, rgba(255,255,255,.68)); font-size: 11px; font-variant-numeric: tabular-nums; }
.reminders-item.is-completed .reminders-task-text { color: var(--app-muted, rgba(255,255,255,.68)); text-decoration: line-through; }
.reminders-delete { display: inline-flex; align-items: center; justify-content: center; width: 44px; min-width: 44px; min-height: 32px; flex: none; margin-left: 4px; padding: 6px 8px; border: 0; border-radius: 6px; color: var(--app-muted, rgba(255,255,255,.68)); background: transparent; opacity: 0; }
.reminders-item:hover .reminders-delete,
.reminders-item:focus-within .reminders-delete { opacity: 1; }
.reminders-delete:hover { color: #ffaaa4; background: var(--app-fill, rgba(255,255,255,.065)); }
.reminders-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; gap: 8px; padding: 28px 16px; text-align: center; }
.reminders-empty img { filter: brightness(0) invert(1); opacity: .5; margin-bottom: 2px; }
.reminders-empty p { margin: 0; color: var(--app-text, #f8f9fc); font-weight: 500; }
.reminders-empty span { max-width: 250px; color: var(--app-muted, rgba(255,255,255,.68)); font-size: 12px; }
.reminders-app button:focus-visible,
.reminders-input:focus-visible { outline: 2px solid var(--app-accent, #8bbcff); outline-offset: 2px; }
@media (max-width: 600px), (hover: none), (pointer: coarse) {
  .reminders-segments button,
  .reminders-input,
  .reminders-add,
  .reminders-delete { min-height: 44px; }
  .reminders-check-target { width: 44px; height: 44px; }
  .reminders-delete { opacity: 1; }
}
@media (max-width: 360px) {
  .reminders-app { padding: 16px; }
}
@media (max-width: 480px) {
  .reminders-header { margin-bottom: 12px; }
  .reminders-header h2 { font-size: 22px; }
  .reminders-toolbar { margin-bottom: 10px; }
  .reminders-segments button { min-width: 64px; }
  .reminders-delete { padding-inline: 6px; }
}
</style>
