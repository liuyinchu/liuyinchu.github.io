<template>
  <div class="todo-list-container">
    <div class="input-section">
      <input
        type="text"
        v-model="newTaskText"
        @keyup.enter="addTask"
        placeholder="Enter your thought..."
        class="task-input"
      />
      <button @click="addTask" class="add-button">+</button>
    </div>

    <ul class="task-list">
      <li
        v-for="task in tasks"
        :key="task.id"
        :class="['task-item', { 'completed': task.completed }]"
      >
        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="task.completed"  @change="toggleTaskCompletion(task.id)" class="hidden-checkbox"
          />
          <span class="custom-checkbox"></span>
        </label>
        <span class="task-text">{{ task.text }}</span>
        <button @click="deleteTask(task.id)" class="delete-button">
          <svg viewBox="0 0 24 24" fill="currentColor" class="delete-icon">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zm3-4.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const newTaskText = ref('')
const tasks = ref(JSON.parse(localStorage.getItem('myToDoList')) || [])

watch(tasks, (newTasks) => {
  localStorage.setItem('myToDoList', JSON.stringify(newTasks))
}, { deep: true })

const addTask = () => {
  if (newTaskText.value.trim() !== '') {
    tasks.value.push({
      id: Date.now(),
      text: newTaskText.value.trim(),
      completed: false,
    })
    newTaskText.value = ''
  }
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(task => task.id !== id)
}

const toggleTaskCompletion = (id) => {
  const task = tasks.value.find(task => task.id === id)
  if (task) {
    task.completed = !task.completed
  }
}
</script>

<style scoped>
.todo-list-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* 填充父卡片高度 */
  padding: 0 1.5rem; /* 与卡片左右留白保持一致 */
  box-sizing: border-box; /* 边框和内边距不增加总尺寸 */
}

.input-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.task-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid var(--ctp-mocha-surface2);
  border-radius: 0.5rem;
  background-color: var(--ctp-mocha-surface0);
  color: var(--ctp-mocha-text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.task-input::placeholder {
  color: var(--ctp-mocha-overlay0);
}

.task-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--ctp-mocha-blue-rgb), 0.2);
}

.add-button {
  width: 44px;
  height: 44px; /* 与输入框高度匹配 */
  background-color: var(--primary-color);
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
  background-color: var(--primary-color-hover);
  transform: translateY(-1px);
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* 让列表尽可能占据剩余空间 */
  overflow-y: auto; /* 允许滚动 */
  padding-right: 0.5rem; /* 为滚动条留出空间 */
  /* 新增：限制最大高度 */
  /* 假设一行任务高度约 3rem (48px)，4行就是 12rem (192px)。
     根据实际 padding 和 margin 调整。
     这里我们根据卡片总高 400px，顶部输入框 + margin 大概 44+16=60px
     下方 padding 2rem (32px)，标题 1.5rem + margin = 24+16=40px
     400 - 60 - 32 - 40 = 268px, 
     所以 max-height 留给 task-list 约 250px 比较合理，
     可以显示 4-5 行。为了严格 4 行显示，设置大约 4 * 3rem = 12rem */
  max-height: 250px; /* 调整此值以控制可见行数。每行约 50px-60px */
}

/* 定制滚动条 */
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
  margin-bottom: 0.75rem; /* 任务项之间的间距 */
  border: 1px solid var(--ctp-mocha-surface1);
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.task-item.completed {
  background-color: var(--ctp-mocha-surface0);
  border-color: var(--ctp-mocha-green); /* 完成时边框颜色 */
  opacity: 0.7; /* 略微降低透明度 */
}

.task-text {
  flex-grow: 1;
  color: var(--ctp-mocha-text);
  font-size: 0.95rem;
  margin-left: 0.75rem;
  word-break: break-word;
  /* 确保划线效果能够生效 */
  transition: text-decoration 0.3s ease, color 0.3s ease;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--ctp-mocha-overlay1); /* 完成文本颜色更柔和 */
}

.checkbox-container {
  display: block;
  position: relative;
  cursor: pointer;
  font-size: 22px; /* 影响自定义checkbox大小 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 隐藏浏览器默认的checkbox */
.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* 创建自定义的checkbox */
.custom-checkbox {
  height: 20px;
  width: 20px;
  background-color: var(--ctp-mocha-base);
  border: 2px solid var(--ctp-mocha-surface2);
  border-radius: 50%; /* 圆形 */
  display: inline-block;
  vertical-align: middle;
  transition: all 0.2s ease;
  position: relative; /* 用于放置伪元素对勾 */
}

/* 鼠标悬停时 */
.checkbox-container:hover .custom-checkbox {
  background-color: var(--ctp-mocha-overlay0);
  border-color: var(--primary-color);
}

/* 选中时 */
.hidden-checkbox:checked ~ .custom-checkbox {
  background-color: var(--ctp-mocha-green); /* 选中时的背景色 */
  border-color: var(--ctp-mocha-green);
}

/* 选中时显示勾 - 根据新要求，我们不显示这个勾 */
.custom-checkbox:after {
  /* 保持默认隐藏，或者直接删除这整个伪元素和其下面的样式，
     因为你明确要求不显示对勾，这里只是注释掉显示逻辑。*/
  content: "";
  position: absolute;
  display: none; /* 明确保持隐藏，不显示对勾 */
  /* 以下样式即便不显示也保留，以防未来又想加上 */
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid var(--ctp-mocha-base);
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

/* 删掉或者注释掉这一整段，因为我们不希望选中时显示对勾了 */
/* .hidden-checkbox:checked ~ .custom-checkbox:after {
  display: block;
} */

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ctp-mocha-red); /* 删除按钮颜色 */
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
</style>