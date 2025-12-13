<template>
  <AmbientBackground />
  <div 
    class="m2048-container" 
    tabindex="0" 
    @keydown="handleKeydown"
    ref="gameContainerRef"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <div class="m2048-header">
      <h1 class="m2048-title">2048</h1>
      <div class="m2048-score-board">
        <div class="m2048-score-box">
          <span>SCORE</span>
          <strong>{{ score }}</strong>
        </div>
        <button @click.stop="initGame" class="m2048-new-game-btn">新游戏</button>
      </div>
    </div>

    <div class="m2048-board" :class="{ 'board-focused': isFocused }">
      <div class="m2048-grid-row" v-for="(row, rIndex) in board" :key="'r-'+rIndex">
        <div class="m2048-grid-cell" v-for="(cell, cIndex) in row" :key="'c-'+cIndex">
          <div 
            v-if="cell > 0" 
            class="m2048-tile" 
            :class="`tile-${cell}`"
          >
            {{ cell }}
          </div>
        </div>
      </div>
      
      <div v-if="gameOver" class="m2048-overlay">
        <h2>游戏结束!</h2>
        <button @click.stop="initGame">再试一次</button>
      </div>

      <div v-if="!isFocused && !gameOver" class="m2048-focus-hint">
        <span>点击此处激活游戏</span>
      </div>
    </div>

    <div class="m2048-hint">
      <span v-if="isFocused">使用 <strong>↑ ↓ ← →</strong> 键移动</span>
      <span v-else>游戏已暂停输入 (防止误触)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AmbientBackground from '../components/AmbientBackground.vue'


// --- 状态定义 ---
const board = ref([]);
const score = ref(0);
const gameOver = ref(false);
const isFocused = ref(false);
const gameContainerRef = ref(null);

// --- 核心逻辑 (完全无副作用) ---

const initGame = () => {
  board.value = Array(4).fill().map(() => Array(4).fill(0));
  score.value = 0;
  gameOver.value = false;
  addNewTile();
  addNewTile();
  // 新游戏开始时，自动让容器获取焦点
  if (gameContainerRef.value) gameContainerRef.value.focus();
};

const addNewTile = () => {
  const emptyTiles = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board.value[r][c] === 0) emptyTiles.push({ r, c });
    }
  }
  if (emptyTiles.length > 0) {
    const randomPos = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board.value[randomPos.r][randomPos.c] = Math.random() < 0.9 ? 2 : 4;
  }
};

const compressRow = (row) => {
  let filtered = row.filter(num => num !== 0);
  let newRow = [];
  let scoreAdd = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2;
      newRow.push(mergedVal);
      scoreAdd += mergedVal;
      i++;
    } else {
      newRow.push(filtered[i]);
    }
  }
  while (newRow.length < 4) newRow.push(0);
  return { newRow, scoreAdd };
};

const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
const reverseRows = (matrix) => matrix.map(row => [...row].reverse());

const move = (direction) => {
  if (gameOver.value) return;

  let originalBoardStr = JSON.stringify(board.value);
  let tempBoard = board.value.map(row => [...row]);
  let totalScoreAdd = 0;

  if (direction === 'up') tempBoard = transpose(tempBoard);
  else if (direction === 'right') tempBoard = reverseRows(tempBoard);
  else if (direction === 'down') { tempBoard = transpose(tempBoard); tempBoard = reverseRows(tempBoard); }

  tempBoard = tempBoard.map(row => {
    const { newRow, scoreAdd } = compressRow(row);
    totalScoreAdd += scoreAdd;
    return newRow;
  });

  if (direction === 'up') tempBoard = transpose(tempBoard);
  else if (direction === 'right') tempBoard = reverseRows(tempBoard);
  else if (direction === 'down') { tempBoard = reverseRows(tempBoard); tempBoard = transpose(tempBoard); }

  if (JSON.stringify(tempBoard) !== originalBoardStr) {
    board.value = tempBoard;
    score.value += totalScoreAdd;
    addNewTile();
    checkGameOver();
  }
};

const checkGameOver = () => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board.value[r][c] === 0) return;
    }
  }
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let current = board.value[r][c];
      if (c < 3 && current === board.value[r][c + 1]) return;
      if (r < 3 && current === board.value[r + 1][c]) return;
    }
  }
  gameOver.value = true;
};

// --- 安全的事件处理 ---
// 注意：这个函数只绑定在 div 上，不绑定在 window 上
const handleKeydown = (e) => {
  // 只拦截方向键，其他按键放行
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (keys.includes(e.key)) {
    // 阻止默认行为（防止滚动页面）只在按方向键时发生
    e.preventDefault(); 
    
    switch(e.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
    }
  }
};

onMounted(() => {
  initGame();
  // 页面加载后自动尝试获取焦点，方便用户直接玩
  // 如果页面有其他 autofocus 元素，这里可以去掉
  if (gameContainerRef.value) {
    gameContainerRef.value.focus();
  }
});
</script>

<style scoped>
/* Catppuccin Mocha Palette
  使用了具体的 CSS 命名空间 (m2048-*) 以确保零冲突
*/

.m2048-container {
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1e1e2e; /* Base */
  padding: 20px;
  color: #cdd6f4; /* Text */
  border-radius: 12px;
  outline: none; /* 移除浏览器默认 Focus 框 */
  /* 让这个容器在其父元素中居中 (可选) */
  max-width: 450px;
  margin: 80px auto 0; /* 顶部 40px，左右居中 */
}

.m2048-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.m2048-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  color: #cdd6f4;
}

.m2048-score-board {
  display: flex;
  gap: 10px;
}

.m2048-score-box {
  background: #313244; /* Surface0 */
  padding: 5px 15px;
  border-radius: 6px;
  text-align: center;
  min-width: 70px;
}

.m2048-score-box span {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  color: #a6adc8; /* Subtext0 */
  font-weight: bold;
}

.m2048-score-box strong {
  display: block;
  font-size: 20px;
  color: #cdd6f4;
}

.m2048-new-game-btn {
  background: #cba6f7; /* Mauve */
  color: #1e1e2e;
  border: none;
  padding: 0 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.m2048-new-game-btn:hover {
  background: #d8b9ff;
  transform: translateY(-1px);
}

.m2048-board {
  position: relative;
  width: 350px;
  height: 350px;
  background: #313244; /* Surface0 */
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.3s ease;
  border: 2px solid transparent;
}

/* 视觉反馈：当游戏获得焦点时，边框发光 */
.board-focused {
  border-color: #cba6f7; /* Mauve border */
  box-shadow: 0 0 15px rgba(203, 166, 247, 0.3);
}

.m2048-grid-row {
  display: flex;
  gap: 10px;
  height: 100%;
}

.m2048-grid-cell {
  background: #585b70; /* Surface2 */
  flex: 1;
  border-radius: 6px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.m2048-tile {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 30px;
  color: #1e1e2e;
  animation: appear 0.2s ease-in-out;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  z-index: 2;
}

@keyframes appear {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Catppuccin Colors */
.tile-2    { background: #f5e0dc; }
.tile-4    { background: #f2cdcd; }
.tile-8    { background: #f5c2e7; }
.tile-16   { background: #cba6f7; }
.tile-32   { background: #89b4fa; }
.tile-64   { background: #74c7ec; }
.tile-128  { background: #89dceb; font-size: 26px; }
.tile-256  { background: #94e2d5; font-size: 26px; }
.tile-512  { background: #a6e3a1; font-size: 26px; }
.tile-1024 { background: #f9e2af; font-size: 20px; }
.tile-2048 { background: #fab387; font-size: 20px; }

/* Overlays */
.m2048-overlay, .m2048-focus-hint {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.m2048-overlay {
  background: rgba(24, 24, 37, 0.85);
}

.m2048-overlay h2 {
  font-size: 40px;
  color: #cdd6f4;
  margin-bottom: 20px;
}

.m2048-overlay button {
  padding: 12px 24px;
  background: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

/* 焦点提示层：未聚焦时显示微弱遮罩 */
.m2048-focus-hint {
  background: rgba(30, 30, 46, 0.6);
  cursor: pointer;
}

.m2048-focus-hint span {
  color: #cdd6f4;
  font-weight: bold;
  background: #1e1e2e;
  padding: 10px 20px;
  border-radius: 20px;
  border: 2px solid #cba6f7;
}

.m2048-hint {
  margin-top: 20px;
  color: #a6adc8;
  height: 20px; /* 占位防止跳动 */
}

.m2048-hint strong {
  color: #cdd6f4;
}
</style>