<script setup>
import { ref, computed, onMounted } from 'vue';
import AmbientBackground from '../components/AmbientBackground.vue'


// --- 1. 游戏配置与状态 ---
const gameStarted = ref(false);
const isLocked = ref(false); // 防止连点
const score = ref(0);
const turns = ref(0);
const bestScore = ref(localStorage.getItem('cyber-match-best') || 0);

// 游戏卡片图标 (使用 Unicode 符号以保持无依赖)
const symbols = ['⚡', '💎', '🔮', '🧬', '🪐', '🚀', '🌌', '🔥'];
const cards = ref([]);

// --- 2. 核心逻辑 ---

// 初始化/重置游戏
const initGame = () => {
  // 生成成对卡片
  const pairs = [...symbols, ...symbols];
  // Fisher-Yates 洗牌算法 (确保绝对随机)
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  cards.value = pairs.map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false
  }));
  
  score.value = 0;
  turns.value = 0;
  gameStarted.value = true;
  isLocked.value = false;
};

// 翻牌逻辑
const flipCard = (card) => {
  // 卫语句：如果被锁定、已开始游戏、已翻开或已匹配，则忽略
  if (isLocked.value || !gameStarted.value || card.isFlipped || card.isMatched) return;

  // 翻开当前卡片
  card.isFlipped = true;

  // 检查已翻开但未匹配的卡片
  const flippedCards = cards.value.filter(c => c.isFlipped && !c.isMatched);

  if (flippedCards.length === 2) {
    isLocked.value = true; // 锁定面板
    turns.value++;

    // 检查是否匹配
    if (flippedCards[0].icon === flippedCards[1].icon) {
      handleMatch(flippedCards);
    } else {
      handleMismatch(flippedCards);
    }
  }
};

// 匹配成功处理
const handleMatch = (flippedCards) => {
  flippedCards.forEach(c => c.isMatched = true);
  score.value += 100;
  isLocked.value = false;
  
  // 检查胜利
  if (cards.value.every(c => c.isMatched)) {
    handleWin();
  }
};

// 匹配失败处理
const handleMismatch = (flippedCards) => {
  setTimeout(() => {
    flippedCards.forEach(c => c.isFlipped = false);
    isLocked.value = false;
  }, 1000); // 1秒记忆时间
};

// 胜利处理
const handleWin = () => {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    localStorage.setItem('cyber-match-best', score.value);
  }
};

// 重新开始
const restart = () => {
  gameStarted.value = false;
  setTimeout(() => initGame(), 300);
};

// 计算属性：进度
const progress = computed(() => {
  if (!cards.value.length) return 0;
  const matchedCount = cards.value.filter(c => c.isMatched).length;
  return Math.round((matchedCount / cards.value.length) * 100);
});

onMounted(initGame);
</script>

<template>
  <AmbientBackground />
  <div id="catppuccin-game-wrapper" class="game-container">
    
    <header class="hud">
      <div class="brand">
        <span class="logo-icon">👾</span>
        <h1>CYBER MATCH</h1>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <span class="label">TURNS</span>
          <span class="value">{{ turns }}</span>
        </div>
        <div class="stat-item highlight">
          <span class="label">SCORE</span>
          <span class="value">{{ score }}</span>
        </div>
      </div>
    </header>

    <main class="board-area">
      <div class="cards-grid">
        <div 
          v-for="card in cards" 
          :key="card.id"
          class="card-scene"
          @click="flipCard(card)"
        >
          <div class="card-object" :class="{ 'is-flipped': card.isFlipped }">
            <div class="card-face card-front">
              <span class="pattern">?</span>
            </div>
            <div class="card-face card-back" :class="{ 'is-matched': card.isMatched }">
              <span class="icon">{{ card.icon }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <transition name="fade">
        <div v-if="cards.length > 0 && cards.every(c => c.isMatched)" class="victory-overlay">
          <div class="victory-content">
            <h2>✨ COMPLETED ✨</h2>
            <p>Score: {{ score }} | Best: {{ bestScore }}</p>
            <button @click="restart" class="restart-btn">PLAY AGAIN</button>
          </div>
        </div>
      </transition>
    </main>

    <footer class="footer">
      <div class="progress-bar">
        <div class="fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="status-text">{{ progress }}% SYNCED</p>
    </footer>
  </div>
</template>

<style scoped>
/* --- 4. Catppuccin Mocha 配色变量 (Scoped) --- */
.game-container {
  --ctp-base: #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-crust: #11111b;
  --ctp-text: #cdd6f4;
  --ctp-subtext0: #a6adc8;
  --ctp-overlay0: #6c7086;
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  --ctp-blue: #89b4fa;
  --ctp-mauve: #cba6f7;
  --ctp-red: #f38ba8;
  --ctp-green: #a6e3a1;
  --ctp-yellow: #f9e2af;
  --ctp-peach: #fab387;

  /* 容器基础样式 */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--ctp-base);
  color: var(--ctp-text);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
}

/* 顶部 HUD */
.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px var(--ctp-mauve));
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, var(--ctp-mauve), var(--ctp-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.label {
  font-size: 0.7rem;
  color: var(--ctp-overlay0);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ctp-subtext0);
}

.stat-item.highlight .value {
  color: var(--ctp-green);
  text-shadow: 0 0 10px rgba(166, 227, 161, 0.3);
}

/* 游戏网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  aspect-ratio: 1; /* 保持正方形 */
}

/* 3D 卡片容器 */
.card-scene {
  background-color: transparent;
  perspective: 1000px;
  cursor: pointer;
  aspect-ratio: 1;
}

.card-object {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 12px;
}

.card-scene:hover .card-object {
  box-shadow: 0 10px 15px rgba(0,0,0,0.2);
}

.card-object.is-flipped {
  transform: rotateY(180deg);
}

/* 卡片正反面通用 */
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 关键：隐藏背面 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 2rem;
  border: 2px solid transparent;
}

/* 卡片正面 (未翻开) */
.card-front {
  background-color: var(--ctp-surface0);
  color: var(--ctp-overlay0);
  transition: all 0.3s;
}

.card-front:hover {
  background-color: var(--ctp-surface1);
  border-color: var(--ctp-blue);
  color: var(--ctp-blue);
}

.card-front .pattern {
  font-weight: 900;
  opacity: 0.3;
}

/* 卡片背面 (已翻开) */
.card-back {
  background-color: var(--ctp-surface1);
  color: var(--ctp-text);
  transform: rotateY(180deg);
  border: 2px solid var(--ctp-mauve);
  box-shadow: inset 0 0 20px rgba(203, 166, 247, 0.2);
}

.card-back.is-matched {
  border-color: var(--ctp-green);
  background-color: rgba(166, 227, 161, 0.1);
  box-shadow: 0 0 15px var(--ctp-green);
}

.icon {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* 底部进度 */
.footer {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  height: 6px;
  background-color: var(--ctp-surface0);
  border-radius: 3px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ctp-blue), var(--ctp-mauve));
  transition: width 0.5s ease;
}

.status-text {
  text-align: right;
  font-size: 0.75rem;
  color: var(--ctp-overlay0);
  margin: 0;
}

/* 胜利界面 */
.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 46, 0.85); /* Base color with opacity */
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.victory-content {
  text-align: center;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.victory-content h2 {
  font-size: 2.5rem;
  color: var(--ctp-yellow);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(249, 226, 175, 0.5);
}

.victory-content p {
  color: var(--ctp-subtext0);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.restart-btn {
  background: linear-gradient(45deg, var(--ctp-blue), var(--ctp-mauve));
  border: none;
  padding: 12px 32px;
  color: var(--ctp-base);
  font-weight: 800;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.restart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(137, 180, 250, 0.6);
}

/* 动画定义 */
@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>