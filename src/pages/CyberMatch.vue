<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AmbientBackground from '../components/AmbientBackground.vue';

const CARD_BACK = '/bg/card/card-back.png';

const faceCards = [
  { id: 'star-sword', name: 'Starforged Sword Saint', image: '/bg/card/card-01.png' },
  { id: 'lunar-oracle', name: 'Lunar River Oracle', image: '/bg/card/card-02.png' },
  { id: 'void-dragon', name: 'Void Dragon', image: '/bg/card/card-03.png' },
  { id: 'aurora-guardian', name: 'Aurora Mech Guardian', image: '/bg/card/card-04.png' },
  { id: 'crimson-phoenix', name: 'Crimson Phoenix Mage', image: '/bg/card/card-05.png' },
  { id: 'nebula-alchemist', name: 'Nebula Alchemist', image: '/bg/card/card-06.png' },
  { id: 'jade-thunder', name: 'Jade Thunder Beast', image: '/bg/card/card-07.png' },
  { id: 'abyssal-crown', name: 'Abyssal Crown', image: '/bg/card/card-08.png' },
  { id: 'astral-whale', name: 'Astral Whale', image: '/bg/card/card-09.png' },
  { id: 'obsidian-shrine', name: 'Obsidian Shrine', image: '/bg/card/card-10.png' },
  { id: 'solar-spear', name: 'Solar Spear Knight', image: '/bg/card/card-11.png' },
  { id: 'crystal-fox', name: 'Crystal Fox Spirit', image: '/bg/card/card-12.png' },
  { id: 'cloud-palace', name: 'Cloud Palace Envoy', image: '/bg/card/card-13.png' },
  { id: 'arcane-seal', name: 'Astral Sigil Archive', image: '/bg/card/card-14.png' },
  { id: 'eclipse-warship', name: 'Eclipse Warship', image: '/bg/card/card-15.png' },
  { id: 'comet-monk', name: 'Sapphire Comet Monk', image: '/bg/card/card-16.png' },
  { id: 'iron-lotus', name: 'Iron Lotus Citadel', image: '/bg/card/card-17.png' },
  { id: 'shadow-leviathan', name: 'Shadow Tide Leviathan', image: '/bg/card/card-18.png' },
  { id: 'rune-stag', name: 'Golden Rune Stag', image: '/bg/card/card-19.png' },
  { id: 'storm-empress', name: 'Storm Crown Empress', image: '/bg/card/card-20.png' },
  { id: 'black-sun', name: 'Black Sun Observatory', image: '/bg/card/card-21.png' },
  { id: 'jade-bridge', name: 'Moonlit Jade Bridge', image: '/bg/card/card-22.png' },
  { id: 'lotus-assassin', name: 'Plasma Lotus Assassin', image: '/bg/card/card-23.png' },
  { id: 'silver-automaton', name: 'Silver Wing Automaton', image: '/bg/card/card-24.png' },
  { id: 'battle-banner', name: 'Red Mist Battle Banner', image: '/bg/card/card-25.png' },
  { id: 'ink-dragon', name: 'Celestial Ink Dragon', image: '/bg/card/card-26.png' },
  { id: 'star-harp', name: 'Frozen Star Harp', image: '/bg/card/card-27.png' },
  { id: 'void-navigator', name: 'Void Pearl Navigator', image: '/bg/card/card-28.png' },
  { id: 'green-pagoda', name: 'Green Flame Pagoda', image: '/bg/card/card-29.png' },
  { id: 'orbital-gate', name: 'Ancient Orbital Gate', image: '/bg/card/card-30.png' },
  { id: 'pearl-qilin', name: 'Pearl Armored Qilin', image: '/bg/card/card-31.png' }
];

const modes = [
  {
    id: 'rift',
    title: 'RIFT',
    subtitle: '4 x 4',
    columns: 4,
    pairs: 8,
    revealDelay: 920,
    scoreBase: 120,
    accent: '#74f2ce'
  },
  {
    id: 'eclipse',
    title: 'ECLIPSE',
    subtitle: '5 x 4',
    columns: 5,
    pairs: 10,
    revealDelay: 820,
    scoreBase: 150,
    accent: '#f7c65f'
  },
  {
    id: 'apotheosis',
    title: 'APOTHEOSIS',
    subtitle: '6 x 6',
    columns: 6,
    pairs: 18,
    revealDelay: 700,
    scoreBase: 190,
    accent: '#9db8ff'
  }
];

const STORAGE_KEY = 'cyber-match-records-v2';

const selectedModeId = ref(modes[0].id);
const gameStarted = ref(false);
const isLocked = ref(false);
const hasWon = ref(false);
const score = ref(0);
const turns = ref(0);
const combo = ref(0);
const elapsedSeconds = ref(0);
const cards = ref([]);
const records = ref({});

let timerId = null;
let pendingFlipTimer = null;

const currentMode = computed(() => modes.find(mode => mode.id === selectedModeId.value) || modes[0]);
const matchedPairs = computed(() => cards.value.filter(card => card.isMatched).length / 2);
const remainingPairs = computed(() => Math.max(currentMode.value.pairs - matchedPairs.value, 0));
const progress = computed(() => {
  if (!cards.value.length) return 0;
  return Math.round((matchedPairs.value / currentMode.value.pairs) * 100);
});
const accuracy = computed(() => {
  if (!turns.value) return 100;
  return Math.round((matchedPairs.value / turns.value) * 100);
});
const timeLabel = computed(() => {
  const minutes = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});
const activeRecord = computed(() => records.value[currentMode.value.id] || null);
const deckCoverage = computed(() => Math.round((currentMode.value.pairs / faceCards.length) * 100));

const readRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    records.value = raw ? JSON.parse(raw) : {};
  } catch {
    records.value = {};
  }
};

const saveRecords = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value));
  } catch {
    // Storage can be disabled in private browser contexts; gameplay should continue.
  }
};

const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const buildDeck = (mode) => {
  const selectedFaces = shuffle(faceCards).slice(0, mode.pairs);
  const pairedCards = selectedFaces.flatMap(face => ([
    { ...face, instanceId: `${face.id}-a` },
    { ...face, instanceId: `${face.id}-b` }
  ]));

  return shuffle(pairedCards).map((face, index) => ({
    id: `${face.instanceId}-${index}`,
    matchKey: face.id,
    name: face.name,
    image: face.image,
    isFlipped: false,
    isMatched: false
  }));
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const startTimer = () => {
  stopTimer();
  timerId = setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);
};

const clearPendingFlip = () => {
  if (pendingFlipTimer) {
    clearTimeout(pendingFlipTimer);
    pendingFlipTimer = null;
  }
};

const initGame = () => {
  clearPendingFlip();
  stopTimer();

  cards.value = buildDeck(currentMode.value);
  score.value = 0;
  turns.value = 0;
  combo.value = 0;
  elapsedSeconds.value = 0;
  hasWon.value = false;
  isLocked.value = false;
  gameStarted.value = true;
  startTimer();
};

const handleWin = () => {
  hasWon.value = true;
  isLocked.value = false;
  stopTimer();

  const modeId = currentMode.value.id;
  const previous = records.value[modeId];
  const nextRecord = {
    score: score.value,
    turns: turns.value,
    time: elapsedSeconds.value,
    accuracy: accuracy.value
  };

  if (!previous || score.value > previous.score || (score.value === previous.score && elapsedSeconds.value < previous.time)) {
    records.value = { ...records.value, [modeId]: nextRecord };
    saveRecords();
  }
};

const handleMatch = (flippedCards) => {
  flippedCards.forEach(card => {
    card.isMatched = true;
  });
  combo.value += 1;
  score.value += currentMode.value.scoreBase + (combo.value - 1) * 25;
  isLocked.value = false;

  if (cards.value.every(card => card.isMatched)) {
    handleWin();
  }
};

const handleMismatch = (flippedCards) => {
  combo.value = 0;
  score.value = Math.max(0, score.value - 15);
  pendingFlipTimer = setTimeout(() => {
    flippedCards.forEach(card => {
      card.isFlipped = false;
    });
    isLocked.value = false;
    pendingFlipTimer = null;
  }, currentMode.value.revealDelay);
};

const flipCard = (card) => {
  if (isLocked.value || hasWon.value || !gameStarted.value || card.isFlipped || card.isMatched) return;

  card.isFlipped = true;
  const flippedCards = cards.value.filter(item => item.isFlipped && !item.isMatched);

  if (flippedCards.length === 2) {
    isLocked.value = true;
    turns.value += 1;

    if (flippedCards[0].matchKey === flippedCards[1].matchKey) {
      handleMatch(flippedCards);
    } else {
      handleMismatch(flippedCards);
    }
  }
};

const selectMode = (modeId) => {
  if (modeId === selectedModeId.value) return;
  selectedModeId.value = modeId;
  initGame();
};

onMounted(() => {
  readRecords();
  initGame();
});

onBeforeUnmount(() => {
  clearPendingFlip();
  stopTimer();
});
</script>

<template>
  <AmbientBackground />
  <div id="catppuccin-game-wrapper" class="game-shell">
    <section class="hero-panel">
      <header class="hud">
        <div class="brand">
          <img class="brand-mark" :src="CARD_BACK" alt="" aria-hidden="true">
          <div>
            <p class="eyebrow">ARCANE MEMORY PROTOCOL</p>
            <h1>CYBER MATCH</h1>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="label">TIME</span>
            <span class="value">{{ timeLabel }}</span>
          </div>
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

      <div class="mode-bar" aria-label="Difficulty modes">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="mode-card"
          :class="{ active: selectedModeId === mode.id }"
          :style="{ '--mode-accent': mode.accent }"
          type="button"
          @click="selectMode(mode.id)"
        >
          <span class="mode-title">{{ mode.title }}</span>
          <span class="mode-subtitle">{{ mode.subtitle }} / {{ mode.pairs }} PAIRS</span>
        </button>
      </div>

      <main class="board-area">
        <div class="board-frame">
          <div class="board-topline">
            <div>
              <span class="sector-label">DECK POOL</span>
              <strong>{{ faceCards.length }} RELICS</strong>
            </div>
            <div>
              <span class="sector-label">ACTIVE DRAW</span>
              <strong>{{ currentMode.pairs }} PAIRS</strong>
            </div>
            <div>
              <span class="sector-label">COVERAGE</span>
              <strong>{{ deckCoverage }}%</strong>
            </div>
          </div>

          <div class="cards-grid" :style="{ '--columns': currentMode.columns }">
            <button
              v-for="card in cards"
              :key="card.id"
              class="card-scene"
              :class="{ matched: card.isMatched }"
              type="button"
              :disabled="isLocked || card.isFlipped || card.isMatched || hasWon"
              :aria-label="card.isFlipped || card.isMatched ? card.name : 'Hidden relic card'"
              @click="flipCard(card)"
            >
              <span class="card-object" :class="{ 'is-flipped': card.isFlipped || card.isMatched }">
                <span class="card-face card-front">
                  <img :src="CARD_BACK" alt="" aria-hidden="true">
                </span>
                <span class="card-face card-back" :class="{ 'is-matched': card.isMatched }">
                  <img :src="card.image" :alt="card.name">
                </span>
              </span>
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="hasWon" class="victory-overlay">
            <div class="victory-content">
              <span class="victory-kicker">{{ currentMode.title }} CLEARED</span>
              <h2>RELIC CONSTELLATION COMPLETE</h2>
              <div class="victory-stats">
                <span>{{ score }} SCORE</span>
                <span>{{ turns }} TURNS</span>
                <span>{{ timeLabel }}</span>
              </div>
              <button @click="initGame" class="restart-btn" type="button">PLAY AGAIN</button>
            </div>
          </div>
        </transition>
      </main>

      <footer class="footer">
        <div class="progress-copy">
          <span>{{ matchedPairs }} / {{ currentMode.pairs }} PAIRS SEALED</span>
          <span>{{ remainingPairs }} REMAINING</span>
          <span>{{ accuracy }}% ACCURACY</span>
        </div>
        <div class="progress-bar" aria-hidden="true">
          <div class="fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="record-row">
          <span>COMBO x{{ combo }}</span>
          <span v-if="activeRecord">BEST {{ activeRecord.score }} / {{ activeRecord.time }}s</span>
          <span v-else>BEST UNCLAIMED</span>
          <button class="compact-btn" type="button" @click="initGame">RESET RUN</button>
        </div>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.game-shell {
  --bg-deep: #050714;
  --bg-panel: rgba(9, 13, 29, 0.9);
  --bg-panel-strong: rgba(15, 21, 42, 0.96);
  --line-soft: rgba(166, 186, 255, 0.18);
  --line-gold: rgba(244, 198, 109, 0.46);
  --text-main: #eef4ff;
  --text-muted: #9eacc9;
  --jade: #74f2ce;
  --gold: #f4c66d;
  --ember: #ff8a61;
  --violet: #9b7cff;
  --blue: #7fc7ff;

  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-main);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  position: relative;
  box-sizing: border-box;
  user-select: none;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  padding: clamp(1rem, 2.2vw, 1.5rem);
  background:
    radial-gradient(circle at 18% 10%, rgba(116, 242, 206, 0.18), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(244, 198, 109, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(5, 7, 18, 0.96), rgba(18, 15, 38, 0.94) 45%, rgba(8, 20, 32, 0.96));
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent 72%);
}

.hud,
.mode-bar,
.board-area,
.footer {
  position: relative;
  z-index: 1;
}

.hud {
  display: flex;
  justify-content: space-between;
  gap: 1.25rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.brand-mark {
  width: clamp(48px, 6vw, 68px);
  aspect-ratio: 1;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 0 24px rgba(116, 242, 206, 0.18), 0 10px 24px rgba(0, 0, 0, 0.35);
}

.eyebrow,
.sector-label,
.label {
  display: block;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.brand h1 {
  margin: 0.18rem 0 0;
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0;
  color: var(--text-main);
  text-shadow: 0 0 28px rgba(127, 199, 255, 0.28);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(82px, 1fr));
  gap: 0.65rem;
}

.stat-item,
.mode-card,
.board-topline,
.record-row {
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(14px);
}

.stat-item {
  min-height: 58px;
  padding: 0.65rem 0.75rem;
  border-radius: 12px;
  text-align: right;
  box-sizing: border-box;
}

.value {
  display: block;
  margin-top: 0.18rem;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  font-weight: 850;
  color: var(--text-main);
}

.stat-item.highlight .value {
  color: var(--jade);
  text-shadow: 0 0 18px rgba(116, 242, 206, 0.32);
}

.mode-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.mode-card {
  min-height: 74px;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  color: var(--text-main);
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.mode-card:hover,
.mode-card:focus-visible {
  transform: translateY(-2px);
  border-color: var(--mode-accent);
  outline: none;
}

.mode-card.active {
  border-color: var(--mode-accent);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--mode-accent) 20%, transparent), rgba(255, 255, 255, 0.055));
  box-shadow: 0 0 26px color-mix(in srgb, var(--mode-accent) 24%, transparent);
}

.mode-title,
.mode-subtitle {
  display: block;
}

.mode-title {
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.mode-subtitle {
  margin-top: 0.24rem;
  color: var(--text-muted);
  font-size: 0.74rem;
  font-weight: 750;
}

.board-area {
  position: relative;
}

.board-frame {
  padding: clamp(0.75rem, 1.5vw, 1.1rem);
  border: 1px solid var(--line-gold);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(4, 6, 16, 0.74), rgba(21, 23, 46, 0.82)),
    radial-gradient(circle at center, rgba(116, 242, 206, 0.08), transparent 64%);
  box-shadow: inset 0 0 32px rgba(244, 198, 109, 0.07);
}

.board-topline {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
}

.board-topline strong {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.92rem;
  letter-spacing: 0.03em;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: clamp(0.45rem, 1vw, 0.8rem);
}

.card-scene {
  appearance: none;
  border: 0;
  padding: 0;
  background: transparent;
  perspective: 1100px;
  cursor: pointer;
  aspect-ratio: 1;
}

.card-scene:disabled {
  cursor: default;
}

.card-scene:focus-visible {
  outline: 2px solid var(--jade);
  outline-offset: 4px;
  border-radius: 16px;
}

.card-object {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.58s cubic-bezier(0.2, 0.72, 0.22, 1);
}

.card-scene:not(:disabled):hover .card-object {
  transform: translateY(-3px) rotateX(4deg);
}

.card-object.is-flipped,
.card-scene:not(:disabled):hover .card-object.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  border-radius: clamp(10px, 1.5vw, 16px);
  backface-visibility: hidden;
  border: 1px solid rgba(244, 198, 109, 0.42);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.26), inset 0 0 18px rgba(255, 255, 255, 0.05);
}

.card-face img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.card-front {
  background: var(--bg-deep);
}

.card-back {
  transform: rotateY(180deg);
  background: var(--bg-deep);
}

.card-back.is-matched {
  border-color: rgba(116, 242, 206, 0.9);
  box-shadow: 0 0 18px rgba(116, 242, 206, 0.42), inset 0 0 20px rgba(116, 242, 206, 0.16);
}

.card-scene.matched {
  animation: matchedPulse 0.5s ease;
}

.footer {
  margin-top: 1rem;
}

.progress-copy,
.record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.progress-bar {
  height: 8px;
  margin: 0.65rem 0;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--jade), var(--gold), var(--ember));
  box-shadow: 0 0 18px rgba(116, 242, 206, 0.42);
  transition: width 0.35s ease;
}

.record-row {
  min-height: 42px;
  padding: 0.5rem 0.65rem;
  border-radius: 12px;
}

.compact-btn,
.restart-btn {
  border: 1px solid rgba(244, 198, 109, 0.58);
  color: #07111b;
  background: linear-gradient(135deg, var(--gold), var(--jade));
  font-weight: 900;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.compact-btn:hover,
.restart-btn:hover,
.compact-btn:focus-visible,
.restart-btn:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 0 22px rgba(244, 198, 109, 0.32);
  outline: none;
}

.compact-btn {
  padding: 0.48rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
}

.victory-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(5, 7, 18, 0.78);
  backdrop-filter: blur(8px);
}

.victory-content {
  width: min(520px, 100%);
  padding: clamp(1.35rem, 4vw, 2rem);
  border: 1px solid rgba(244, 198, 109, 0.5);
  border-radius: 18px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(244, 198, 109, 0.22), transparent 36%),
    rgba(10, 13, 30, 0.96);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
  animation: popIn 0.38s cubic-bezier(0.18, 0.9, 0.24, 1.2);
}

.victory-kicker {
  color: var(--jade);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.victory-content h2 {
  margin: 0.5rem 0 1rem;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 1;
  letter-spacing: 0;
}

.victory-stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1.25rem;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.restart-btn {
  padding: 0.82rem 1.35rem;
  border-radius: 999px;
  font-size: 0.9rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes popIn {
  from {
    transform: scale(0.94);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes matchedPulse {
  0% {
    transform: scale(1);
  }
  55% {
    transform: scale(1.045);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 820px) {
  .hud,
  .progress-copy,
  .record-row {
    align-items: stretch;
    flex-direction: column;
  }

  .stats,
  .mode-bar,
  .board-topline {
    grid-template-columns: 1fr;
  }

  .stat-item {
    text-align: left;
  }

  .cards-grid {
    gap: 0.42rem;
  }
}

@media (max-width: 560px) {
  .game-shell {
    width: min(100vw, calc(100vw - 16px));
    padding: 0.5rem;
  }

  .hero-panel {
    border-radius: 14px;
    padding: 0.75rem;
  }

  .brand {
    align-items: flex-start;
  }

  .brand h1 {
    font-size: 1.65rem;
  }

  .brand-mark {
    width: 46px;
    border-radius: 10px;
  }

  .mode-card {
    min-height: 62px;
  }

  .board-frame {
    padding: 0.5rem;
    border-radius: 14px;
  }

  .cards-grid {
    gap: 0.28rem;
  }

  .card-face {
    border-radius: 8px;
  }
}
</style>
