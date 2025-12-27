<template>
  <div class="resource-directory-wrapper">
    <div class="content-container">
      <header class="directory-header">
        <h1 class="main-title">资源链接·目录</h1>
        <p class="sub-title">Resource Collection Hub<br>
            <br>
            <a href="/resource">回到旧的资源链接页面</a>
        </p>
        
        <div class="search-container" :class="{ 'is-active': isSearchFocused || searchQuery }">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索资源名称..." 
              v-model="searchQuery"
              @focus="isSearchFocused = true"
              @blur="handleBlur"
              @keydown.down.prevent="onArrowDown"
              @keydown.up.prevent="onArrowUp"
              @keydown.enter.prevent="onEnter"
            />
            
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              ✕
            </button>
          </div>

          <transition name="fade-slide">
            <div v-if="(isSearchFocused || searchQuery) && searchQuery" class="search-results-dropdown custom-scrollbar">
              <div v-if="filteredResources.length > 0" class="results-list">
                <div 
                  v-for="(item, index) in filteredResources" 
                  :key="item.uniqueKey"
                  class="result-item"
                  :class="{ 'is-selected': index === selectedIndex }"
                  @mouseenter="selectedIndex = index"
                  @mousedown.prevent="handleResultClick(item)"
                >
                  <div class="result-info">
                    <span class="result-name">{{ item.name }}</span>
                    <span class="result-category-tag">{{ item.categoryLabel }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-results">
                没有找到相关资源
              </div>
            </div>
          </transition>
        </div>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在读取资源...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <div v-else class="category-grid">
        <div 
          v-for="cat in categories" 
          :key="cat.id" 
          class="category-card"
        >
          <div class="card-header">
            <h2 class="card-title" @click="navigateToCategory(cat.routePath)">
              <span class="icon-placeholder">#</span> {{ cat.label }}
            </h2>
            <button class="more-btn" @click="navigateToCategory(cat.routePath)">
              View All
            </button>
          </div>

          <ul class="resource-list custom-scrollbar">
            <li 
              v-for="item in cat.data" 
              :key="item.idx" 
              class="resource-item"
            >
              <span class="item-idx">{{ formatIdx(item.idx) }}</span>
              <a 
                v-if="item.url" 
                :href="item.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="item-link"
              >
                {{ item.name }}
              </a>
              <span v-else class="item-text-only">{{ item.name }}</span>
            </li>
            
            <li v-if="!cat.data || cat.data.length === 0" class="empty-tip">
              暂无数据
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- 配置区域 ---
const categoryConfig = [
  { id: 'literature', label: '文献', file: 'literature.json', routePath: '/rliterature' },
  { id: 'programming', label: '编程', file: 'programming.json', routePath: '/rprogramming' },
  { id: 'computer', label: '计算机', file: 'computer.json', routePath: '/rcomputer' },
  { id: 'materials', label: '资料', file: 'materials.json', routePath: '/rmaterials' },
  { id: 'tools', label: '工具', file: 'tools.json', routePath: '/rtools' },
  { id: 'files', label: '文件', file: 'files.json', routePath: '/rfiles' }
];

// --- 响应式数据 ---
const categories = ref([]);
const loading = ref(true);
const error = ref(null);

// --- 搜索相关状态 ---
const searchQuery = ref('');
const isSearchFocused = ref(false);
const selectedIndex = ref(-1); // 用于键盘导航

// --- 辅助函数 ---
const formatIdx = (idx) => String(idx).padStart(2, '0');
const navigateToCategory = (path) => router.push(path);

// --- 数据处理与搜索逻辑 ---
const allResourcesFlat = computed(() => {
  if (loading.value || categories.value.length === 0) return [];
  return categories.value.flatMap(cat => {
    const items = cat.data || [];
    return items.map(item => ({
      ...item,
      categoryLabel: cat.label,
      uniqueKey: `${cat.id}-${item.idx}`
    }));
  });
});

const filteredResources = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase().trim();
  return allResourcesFlat.value.filter(item => 
    item.name && item.name.toLowerCase().includes(query)
  );
});

// 监听搜索词变化，重置选中项
watch(searchQuery, () => {
  selectedIndex.value = -1;
});

// --- 交互事件 ---
const clearSearch = () => {
  searchQuery.value = '';
  selectedIndex.value = -1;
};

const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
};

const handleResultClick = (item) => {
  if (item.url) {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }
};

// --- 键盘导航逻辑 ---
const onArrowDown = () => {
  if (filteredResources.value.length === 0) return;
  if (selectedIndex.value < filteredResources.value.length - 1) {
    selectedIndex.value++;
  } else {
    selectedIndex.value = 0; // 循环到底部回到顶部
  }
};

const onArrowUp = () => {
  if (filteredResources.value.length === 0) return;
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  } else {
    selectedIndex.value = filteredResources.value.length - 1; // 循环到顶部回到底部
  }
};

const onEnter = () => {
  if (filteredResources.value.length === 0) return;
  
  // 如果有选中项，跳转选中项；如果没有选中但有结果，默认跳转第一项
  const targetIndex = selectedIndex.value === -1 ? 0 : selectedIndex.value;
  const item = filteredResources.value[targetIndex];
  
  if (item) {
    handleResultClick(item);
    // 触发失去焦点效果，收起下拉框
    document.activeElement.blur();
    isSearchFocused.value = false;
  }
};

// --- API 获取 ---
const fetchAllResources = async () => {
  try {
    loading.value = true;
    const fetchPromises = categoryConfig.map(async (config) => {
      try {
        const response = await fetch(`/resource/${config.file}`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        const sortedData = data.sort((a, b) => Number(a.idx) - Number(b.idx));
        return { ...config, data: sortedData };
      } catch (err) {
        console.warn(`Failed to load ${config.file}:`, err);
        return { ...config, data: [] };
      }
    });
    categories.value = await Promise.all(fetchPromises);
  } catch (err) {
    error.value = "无法加载资源目录";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAllResources();
});
</script>

<style scoped>
/* Scope: Localized
  Theme: Catppuccin Mocha
  Font: LXGW WenKai
*/

.resource-directory-wrapper {
  /* CSS Variables Definition - Local Scope Only */
  --ctp-base: #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-text: #cdd6f4;
  --ctp-subtext0: #a6adc8;
  --ctp-overlay0: #6c7086;
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  --ctp-surface2: #585b70;
  --ctp-lavender: #b4befe;
  --ctp-blue: #89b4fa;
  --ctp-mauve: #cba6f7;
  --ctp-red: #f38ba8;
  
  --font-main: 'LXGW WenKai', 'PingFang SC', sans-serif;

  width: 100%;
  min-height: 100vh;
  background-color: var(--ctp-base);
  color: var(--ctp-text);
  font-family: var(--font-main);
  padding: 40px 20px;
  box-sizing: border-box;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* --- Header --- */
.directory-header {
  text-align: center;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  /* 移除光团后，保留文字渐变增加质感 */
  background: linear-gradient(120deg, var(--ctp-mauve), var(--ctp-blue));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 2px;
}
.sub-title {
  color: var(--ctp-subtext0);
  font-size: 1.2rem;
  margin-top: 10px;
  margin-bottom: 30px;
  opacity: 0.8;
}

/* --- Search Bar --- */
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  z-index: 100;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(49, 50, 68, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(180, 190, 254, 0.2);
  border-radius: 12px;
  padding: 0 16px;
  height: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-container.is-active .search-input-wrapper {
  border-color: var(--ctp-mauve);
  background: rgba(49, 50, 68, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--ctp-subtext0);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--ctp-text);
  font-size: 1.1rem;
  font-family: var(--font-main);
  outline: none;
}

.search-input::placeholder {
  color: var(--ctp-overlay0);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--ctp-overlay0);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
.clear-btn:hover {
  color: var(--ctp-red);
}

/* Search Results Dropdown */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 8px;
  background: rgba(30, 30, 46, 0.98);
  border: 1px solid var(--ctp-surface1);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 350px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(166, 173, 200, 0.05);
  cursor: pointer;
  transition: background 0.1s;
}

/* 高亮样式：鼠标悬浮 或 键盘选中 */
.result-item:hover,
.result-item.is-selected {
  background: var(--ctp-surface1); /* 明显的高亮背景 */
}

.result-name {
  color: var(--ctp-text);
  font-size: 1rem;
}

.result-category-tag {
  color: var(--ctp-mauve);
  font-size: 0.8rem;
  margin-top: 2px;
  background: rgba(203, 166, 247, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-left: 10px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: var(--ctp-overlay0);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* --- Category Grid --- */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
}

/* Card Style (矮卡片版本) */
.category-card {
  background: rgba(49, 50, 68, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(180, 190, 254, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 280px; /* 降低高度 */
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: rgba(203, 166, 247, 0.3);
  background: rgba(49, 50, 68, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(166, 173, 200, 0.1);
}

.card-title {
  font-size: 1.4rem;
  margin: 0;
  color: var(--ctp-lavender);
  cursor: pointer;
  transition: color 0.3s ease;
}
.card-title:hover {
  color: var(--ctp-mauve);
}

.icon-placeholder {
  color: var(--ctp-overlay0);
  margin-right: 4px;
  font-weight: normal;
}

.more-btn {
  background: transparent;
  border: 1px solid var(--ctp-surface1);
  color: var(--ctp-subtext0);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--font-main);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.more-btn:hover {
  background: var(--ctp-surface1);
  color: var(--ctp-text);
  border-color: var(--ctp-blue);
}

.resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.resource-item {
  display: flex;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid rgba(166, 173, 200, 0.05);
}

.resource-item:hover {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

.item-idx {
  font-family: 'Fira Code', monospace;
  color: var(--ctp-overlay0);
  font-size: 0.95rem;
  margin-right: 10px;
  min-width: 22px;
}

.item-link {
  color: var(--ctp-text);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
  position: relative;
}

.item-link:hover {
  color: var(--ctp-blue);
}
/* 移除了下划线动画，保持极简，只变色 */

.item-text-only {
  color: var(--ctp-overlay0);
  cursor: default;
}

.empty-tip {
  color: var(--ctp-overlay0);
  text-align: center;
  padding-top: 20px;
  font-size: 0.9rem;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--ctp-surface1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--ctp-overlay0); }

/* Loading & Error */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--ctp-subtext0);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ctp-surface1);
  border-top: 3px solid var(--ctp-mauve);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 768px) {
  .main-title { font-size: 2rem; }
  .category-grid { grid-template-columns: 1fr; }
  .category-card { height: auto; max-height: 400px; }
}
</style>