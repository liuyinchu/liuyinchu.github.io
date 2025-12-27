<script setup>
import { ref, computed, reactive } from 'vue';

// --- 工具函数：复制到剪贴板 ---
const copyToClipboard = async (text, event) => {
  try {
    await navigator.clipboard.writeText(text);
    // 简单的视觉反馈
    const target = event.target.closest('.color-box');
    if (target) {
      target.classList.add('copied');
      setTimeout(() => target.classList.remove('copied'), 1000);
    }
  } catch (err) {
    console.error('Failed to copy!', err);
  }
};

// --- 任务一：学术排版计算逻辑 ---
// 默认参数
const params = reactive({
  rows: 1,
  cols: 1,
  baseWidth: 150, // mm
  surplus: 1.0,   // scale factor
  ratio: 0.75,    // height/width
});

// 常量
const MM_TO_INCH = 1 / 25.4;
const INCH_TO_PT = 72;
const MM_TO_PT = MM_TO_INCH * INCH_TO_PT;

// 计算逻辑 (对应 Python get_academic_style)
const result = computed(() => {
  const { rows, cols, baseWidth, surplus, ratio } = params;
  
  // 1. 物理尺寸计算
  const scale_factor = surplus;
  const sub_w_mm = baseWidth / cols;
  const sub_h_mm = sub_w_mm * ratio;
  
  const total_w_mm = baseWidth; // 原始宽度
  const total_h_mm = sub_h_mm * rows; // 原始高度
  
  const final_w_mm = total_w_mm * scale_factor;
  const final_h_mm = total_h_mm * scale_factor;
  
  // 2. 自适应元素计算
  let font_base, line_base, tick_font;
  
  if (cols == 1) {
    font_base = 10.5;
    line_base = 1.5;
  } else if (cols == 2) {
    font_base = 9.5;
    line_base = 1.25;
  } else {
    font_base = 8.5;
    line_base = 1.0;
  }
  // 刻度字体逻辑
  tick_font = Math.max(8.0, font_base - 1.0);

  // 辅助函数：生成三种单位的对象
  const createDim = (mm) => ({
    mm: mm.toFixed(2),
    inch: (mm * MM_TO_INCH).toFixed(4),
    pt: (mm * MM_TO_PT).toFixed(1)
  });

  return {
    dims: {
      subW: createDim(sub_w_mm),
      subH: createDim(sub_h_mm),
      totalW: createDim(final_w_mm),
      totalH: createDim(final_h_mm)
    },
    settings: {
      fontBase: font_base,
      fontTick: tick_font,
      lineBase: line_base
    }
  };
});

// --- 任务二：配色数据 ---
// 预处理：加上 # 前缀
const paletteRawData = [
  ['0C5DA5', '00B945', 'FF9500', 'FF2C00', '845B97', '474747', '9e9e9e'],
  ['403990', '80A6E2', 'FBDD85', 'F46F43', 'CF3D3E'],
  ['4E79A7', 'F28E2B', 'E15759', '76B7B2', '59A14F', 'EDC948', 'B07AA1', 'FF9DA7', '9C755F', 'BAB0AC'],
  ['006ba4', 'ff800e', '595959', 'a2c8ec', 'ffbc79', 'cfcfcf'],
  ['2c69b0', 'f02720', 'ac613c', '6ba3d6', 'ea6b73', 'e9c39b'],
  ['3951A2', 'DA382A']
];

const palettes = paletteRawData.map(group => group.map(color => `#${color}`));

</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      
      <header class="section-header">
        <h1>Mamplotly Academic Layout Guide Test Version</h1>
        <p class="subtitle">A4-Based Scientific Plotting Calculator & Palette Reference -- by LiuYinChu</p>
      </header>

      <section class="card calculator-section">
        <h2 class="card-title">
          Muti-Plot Dimension Calculator
        </h2>
        
        <div class="calculator-layout">
          <div class="inputs-panel">
            <div class="input-group">
              <label>Rows (m)</label>
              <input type="number" v-model.number="params.rows" min="1" max="10">
            </div>
            <div class="input-group">
              <label>Cols (n)</label>
              <input type="number" v-model.number="params.cols" min="1" max="10">
            </div>
            <div class="input-group">
              <label>Base Width (mm)</label>
              <input type="number" v-model.number="params.baseWidth" step="5">
              <span class="hint">Standard A4 content width ≈ 150mm</span>
            </div>
            <div class="input-group">
              <label>Surplus Scale</label>
              <div class="range-wrapper">
                <input type="range" v-model.number="params.surplus" min="1.0" max="1.5" step="0.05">
                <span class="val-display">{{ params.surplus }}x</span>
              </div>
            </div>
            <div class="input-group">
              <label>Aspect Ratio</label>
              <div class="range-wrapper">
                <input type="range" v-model.number="params.ratio" min="0.1" max="4.0" step="0.05">
                <span class="val-display">{{ params.ratio }}</span>
              </div>
            </div>
          </div>

          <div class="results-panel">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>mm</th>
                    <th>inch</th>
                    <th>pt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Subplot W</td>
                    <td>{{ result.dims.subW.mm }}</td>
                    <td>{{ result.dims.subW.inch }}</td>
                    <td>{{ result.dims.subW.pt }}</td>
                  </tr>
                  <tr>
                    <td>Subplot H</td>
                    <td>{{ result.dims.subH.mm }}</td>
                    <td>{{ result.dims.subH.inch }}</td>
                    <td>{{ result.dims.subH.pt }}</td>
                  </tr>
                  <tr class="highlight-row">
                    <td><strong>Total W</strong></td>
                    <td><strong>{{ result.dims.totalW.mm }}</strong></td>
                    <td>{{ result.dims.totalW.inch }}</td>
                    <td>{{ result.dims.totalW.pt }}</td>
                  </tr>
                  <tr class="highlight-row">
                    <td><strong>Total H</strong></td>
                    <td><strong>{{ result.dims.totalH.mm }}</strong></td>
                    <td>{{ result.dims.totalH.inch }}</td>
                    <td>{{ result.dims.totalH.pt }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="adaptive-settings">
              <div class="setting-item">
                <span class="label">Font Base</span>
                <span class="value">{{ result.settings.fontBase }} pt</span>
              </div>
              <div class="setting-item">
                <span class="label">Tick Font</span>
                <span class="value">{{ result.settings.fontTick }} pt</span>
              </div>
              <div class="setting-item">
                <span class="label">Line Width</span>
                <span class="value">{{ result.settings.lineBase }} pt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="card palette-section">
        <h2 class="card-title">
          Color Theme
        </h2>
        <p class="desc">Click any color block to copy HEX code.</p>

        <div class="palettes-grid">
          <div 
            v-for="(group, idx) in palettes" 
            :key="idx" 
            class="palette-row"
          >
            <div 
              v-for="color in group" 
              :key="color"
              class="color-box"
              :style="{ backgroundColor: color }"
              @click="copyToClipboard(color, $event)"
              :title="color"
            >
              <span class="color-hex">{{ color }}</span>
              <span class="copy-msg">Copied!</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Catppuccin Mocha Palette Definition 
  Scope: Local to this component
*/
.page-container {
  --ctp-base: #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-crust: #11111b;
  --ctp-text: #cdd6f4;
  --ctp-subtext0: #a6adc8;
  --ctp-subtext1: #bac2de;
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  --ctp-surface2: #585b70;
  --ctp-overlay0: #6c7086;
  --ctp-blue: #89b4fa;
  --ctp-mauve: #cba6f7;
  --ctp-red: #f38ba8;
  --ctp-green: #a6e3a1;
  --ctp-yellow: #f9e2af;
  --ctp-peach: #fab387;

  /* 全屏覆盖逻辑：
    设置 fixed 和极高的 z-index 来覆盖原本的 Layout (Header/Footer)。
    Background 使用 Base 色，确保不透出原有内容。
  */
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  z-index: 9999;
  
  background-color: var(--ctp-base);
  color: var(--ctp-text);
  font-family: Verdana, "LXGW WenKai", sans-serif;
  
  /* 滚动条美化 */
  scrollbar-width: thin;
  scrollbar-color: var(--ctp-surface2) var(--ctp-base);
}

.page-container::-webkit-scrollbar {
  width: 8px;
}
.page-container::-webkit-scrollbar-track {
  background: var(--ctp-base);
}
.page-container::-webkit-scrollbar-thumb {
  background-color: var(--ctp-surface2);
  border-radius: 4px;
}

/* 布局容器 */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 标题样式 */
.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--ctp-blue), var(--ctp-mauve));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--ctp-subtext1);
  font-size: 1.1rem;
  opacity: 0.8;
}

/* 卡片通用样式 */
.card {
  background-color: var(--ctp-mantle);
  border: 1px solid var(--ctp-surface0);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  border-color: var(--ctp-surface1);
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: var(--ctp-mauve);
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 1.4rem;
}

/* --- 任务一：计算器样式 --- */
.calculator-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
}

@media (max-width: 768px) {
  .calculator-layout {
    grid-template-columns: 1fr;
  }
}

/* 输入区域 */
.inputs-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--ctp-subtext0);
  font-weight: 600;
}

.input-group input[type="number"] {
  background: var(--ctp-surface0);
  border: 1px solid var(--ctp-surface1);
  color: var(--ctp-text);
  padding: 10px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-group input[type="number"]:focus {
  outline: none;
  border-color: var(--ctp-blue);
  box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
}

.range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-wrapper input[type="range"] {
  flex: 1;
  accent-color: var(--ctp-mauve);
  cursor: pointer;
}

.val-display {
  background: var(--ctp-surface0);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 45px;
  text-align: center;
  color: var(--ctp-mauve);
}

.hint {
  font-size: 0.8rem;
  color: var(--ctp-overlay0);
  font-style: italic;
}

/* 结果区域 */
.results-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--ctp-surface0);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

thead th {
  background: var(--ctp-surface0);
  color: var(--ctp-text);
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
}

tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--ctp-surface0);
  color: var(--ctp-subtext1);
  font-variant-numeric: tabular-nums;
}

tbody tr:last-child td {
  border-bottom: none;
}

.highlight-row {
  background: rgba(137, 180, 250, 0.05); /* very subtle blue tint */
}

.highlight-row td {
  color: var(--ctp-text);
}

/* 自适应参数卡片 */
.adaptive-settings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.setting-item {
  background: var(--ctp-surface0);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.setting-item .label {
  font-size: 0.8rem;
  color: var(--ctp-subtext0);
}

.setting-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ctp-green);
}

/* --- 任务二：配色板样式 --- */
.desc {
  margin-bottom: 20px;
  color: var(--ctp-overlay0);
  font-size: 0.9rem;
}

.palettes-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.palette-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.color-box {
  flex: 1;
  min-width: 60px;
  height: 80px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: flex 0.2s ease;
}

.color-box:hover {
  flex: 1.5; /* Hover时轻微放大占比 */
}

/* HEX 文字 */
.color-hex {
  font-size: 0.75rem;
  background: rgba(0,0,0,0.4);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s;
  backdrop-filter: blur(2px);
}

.color-box:hover .color-hex {
  opacity: 1;
  transform: translateY(0);
}

/* Copied 反馈 */
.copy-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.color-box.copied .copy-msg {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>