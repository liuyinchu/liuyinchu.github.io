<template>
  <div class="todo-list-container">
    <!-- 模式切换 -->
    <div class="mode-switch">
      <button
        :class="['mode-btn', mode === 'global' ? 'active' : '']"
        @click="setMode('global')"
        aria-label="Switch to Global mode"
      >
        Total Task
      </button>
      <button
        :class="['mode-btn', mode === 'daily' ? 'active' : '']"
        @click="setMode('daily')"
        aria-label="Switch to Daily mode"
      >
        Daily Task
      </button>
      <span v-if="mode === 'daily'" class="current-day-chip" :title="'Selected day: ' + selectedDateStr">
        {{ selectedDateStr }}
      </span>
    </div>

    <!-- 输入区 -->
    <div class="input-section">
      <input
        type="text"
        v-model="newTaskText"
        @keyup.enter="addTask"
        placeholder="Enter your thought..."
        class="task-input"
        aria-label="Add a task"
      />
      <button @click="addTask" class="add-button" aria-label="Add task">+</button>
    </div>

    <!-- 任务列表（按模式过滤） -->
    <ul class="task-list" role="list">
      <li
        v-for="task in visibleTasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
        role="listitem"
      >
        <label class="checkbox-container" :aria-label="'Toggle complete: ' + task.text">
          <input
            type="checkbox"
            class="hidden-checkbox"
            :checked="task.completed"
            @change="toggleTaskCompletion(task.id)"
            aria-checked="task.completed ? 'true' : 'false'"
          />
          <span class="custom-checkbox"></span>
        </label>

        <div class="task-text">{{ task.text }}</div>

        <!-- 小号日期徽标（与原风格一致，轻量呈现） -->
        <div class="task-meta">
          <span class="date-chip" :title="'Task date'">
            {{ task.date || 'Ever' }}
          </span>
        </div>

        <button
          class="delete-button"
          @click="deleteTask(task.id)"
          :aria-label="'Delete: ' + task.text"
          title="Delete"
        >
          <!-- <svg class="delete-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9 3v1H4v2h16V4h-5V3H9zm1 6h2v9h-2V9zm-4 0h2v9H6V9zm8 0h2v9h-2V9z"
            />
          </svg> -->
          <svg viewBox="0 0 24 24" fill="currentColor" class="delete-icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

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

// 持久化
watch(tasks, (v) => safeWrite(LS_KEYS.TODOS, v), { deep: true })
watch(mode,  (m) => localStorage.setItem(LS_KEYS.MODE, m))

// 监听 Calendar 的广播
onMounted(() => {
  window.addEventListener('app:date-change', onDateChange)
  window.addEventListener('app:set-mode', onModeChange)
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
/* ====== 原始样式风格（你提供的版本） ====== */
.todo-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.input-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.0rem;
}

.task-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid var(--ctp-mocha-surface2);
  border-radius: 0.5rem;
  background-color: var(--ctp-mocha-surface0);
  color: var(--text-color);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: "LXGW WenKai";
}

.task-input::placeholder {
  color: var(--ctp-mocha-overlay1);
}

.task-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--ctp-mocha-blue-rgb), 0.2);
}

.add-button {
  width: 44px;
  height: 44px;
  /* background-color: var(--primary-color); */
  background: linear-gradient(135deg, var(--ctp-mocha-mauve), var(--ctp-mocha-blue));
  color: var(--ctp-mocha-base);
  border: none;
  border-radius: 0.5rem;
  font-size: 1.8rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.add-button:hover {
  /* background-color: var(--primary-color-hover); */
  background: linear-gradient(135deg, var(--success-color), #89dceb);
  transform: translateY(-1px);
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  max-height: 250px;
}

/* 滚动条 */
.task-list::-webkit-scrollbar {
  width: 6px;
}
.task-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--ctp-mocha-blue-rgb), 0.4);
  border-radius: 3px;
}
.task-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--ctp-mocha-blue-rgb), 0.7);
}

.task-item {
  display: flex;
  align-items: center;
  background-color: var(--ctp-mocha-surface0);
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--ctp-mocha-surface1);
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.task-item.completed {
  background-color: var(--ctp-mocha-surface0);
  border-color: var(--ctp-mocha-green);
  opacity: 0.7;
}

.task-text {
  flex-grow: 1;
  color: var(--ctp-mocha-text);
  font-size: 0.95rem;
  margin-left: 0.75rem;
  word-break: break-word;
  transition: text-decoration 0.3s ease, color 0.3s ease;
  font-weight: 700;
  font-family: "LXGW WenKai";
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--ctp-mocha-overlay1);
}

.checkbox-container {
  display: block;
  position: relative;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
}

/* 隐藏原生 checkbox */
.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* 自定义圆形 checkbox */
.custom-checkbox {
  height: 20px;
  width: 20px;
  background-color: var(--ctp-mocha-base);
  border: 2px solid var(--ctp-mocha-surface2);
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  transition: all 0.2s ease;
  position: relative;
}

/* 悬停 */
.checkbox-container:hover .custom-checkbox {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* 选中态：不显示对勾，只改底色与边框为绿色 */
.hidden-checkbox:checked ~ .custom-checkbox {
  background-color: var(--ctp-mocha-green);
  border-color: var(--ctp-mocha-green);
}

/* 维持不显示对勾 */
.custom-checkbox:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid var(--ctp-mocha-base);
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

/* 删除按钮 */
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ctp-mocha-red);
  margin-left: 1rem;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, transform 0.1s ease;
}

.delete-button:hover {
  color: var(--ctp-mocha-maroon);
  transform: scale(1.1);
}

.delete-icon {
  width: 20px;
  height: 20px;
}

/* ====== 为模式切换与日期徽标补充的极简样式（保持同风格） ====== */
.mode-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0.75rem;
}
.mode-btn {
  padding: 0.35rem 0.7rem;
  border-radius: 0.5rem;
  border: 1.5px solid var(--ctp-mocha-surface2);
  background-color: var(--ctp-mocha-surface0);
  color: var(--ctp-mocha-text);
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  font-family: monospace;
  font-weight: 600;
}
.mode-btn.active {
  border-color: var(--primary-color);
  /* background-color: var(--ctp-mocha-base); */
}
.current-day-chip {
  /* margin-left: auto; */
  font-size: 0.75rem;
  color: var(--ctp-mocha-overlay1);
  border: 1px dashed #b4befe;
  /* padding: 0.2rem 0.5rem; */
  padding: 0.35rem 0.7rem;
  border-radius: 0.5rem;
  /* box-shadow: inset 0 0 0 2px rgba(255,255,255,0.3); */
  background: #b4befe;
  color: var(--background-color);
  /* border-color: #b4befe; */
  font-family: monospace;
  font-weight: 600;
}
.task-meta {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: var(--ctp-mocha-overlay1);
}
.date-chip {
  display: inline-block;
  border: 1px solid var(--ctp-mocha-surface2);
  border-radius: 0.4rem;
  padding: 0.05rem 0.35rem;
  font-family: monospace;
}
</style>