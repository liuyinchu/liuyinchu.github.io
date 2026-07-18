<script setup>
import APlayer from 'aplayer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue'
import Weather from '../components/Weather.vue'

const wallpaper = '/bg/Firefly_Paper_Airplane.png'

const topApps = [
  {
    id: 'todo',
    label: 'TODO',
    title: 'TODO List',
    icon: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://todoist.com/',
    align: 'left',
    windowClass: 'window-todo',
  },
  {
    id: 'music',
    label: 'Music',
    title: 'Music',
    icon: '/music/cover/default.jpg',
    align: 'right',
    windowClass: 'window-music',
  },
  {
    id: 'weather',
    label: 'Weather',
    title: 'Weather',
    icon: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.qweather.com/',
    align: 'right',
    windowClass: 'window-weather',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    title: 'Calendar',
    icon: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://calendar.google.com/',
    align: 'right',
    windowClass: 'window-calendar',
  },
]

const bottomApps = [
  {
    id: 'map',
    label: 'Map',
    title: 'Spotlight',
    icon: '/favicon_liuyin.svg',
    windowClass: 'window-map',
  },
  {
    id: 'dock',
    label: 'Dock',
    title: 'Dock',
    icon: '/icons/portal-launchpad.png',
    windowClass: 'window-dock',
  },
]

const quickLinks = [
  { name: 'ChatGPT', url: 'https://chat.openai.com/', compact: true },
  { name: 'Claude', url: 'https://claude.ai/', compact: true },
  { name: 'Gemini', url: 'https://gemini.google.com/', compact: true },
  { name: 'GitHub', url: 'https://github.com/', compact: true },
  { name: 'Google', url: 'https://www.google.com/', compact: true },
  { name: 'Translate', url: 'https://translate.google.com/' },
  { name: 'Gmail', url: 'https://mail.google.com/' },
  { name: 'Drive', url: 'https://drive.google.com/drive/home' },
  { name: 'ipinfo', url: 'https://ipinfo.io/what-is-my-ip' },
]

const resourceSearchSources = [
  { id: 'literature', label: '文献', file: 'literature.json', path: '/rliterature' },
  { id: 'programming', label: '编程', file: 'programming.json', path: '/rprogramming' },
  { id: 'computer', label: '计算机', file: 'computer.json', path: '/rcomputer' },
  { id: 'materials', label: '资料', file: 'materials.json', path: '/rmaterials' },
  { id: 'tools', label: '工具', file: 'tools.json', path: '/rtools' },
  { id: 'files', label: '文件', file: 'files.json', path: '/rfiles' },
]

const defaultSpotlightLinks = [
  {
    name: '首页',
    path: '/',
    hint: '返回滚动叙事首页',
    category: '核心入口',
    keywords: ['home', 'welcome', 'index'],
  },
  {
    name: '随记',
    path: '/space1',
    hint: '片刻、问题、读到的东西',
    category: '核心入口',
    keywords: ['jottings', 'notes', 'space1', 'blog'],
  },
  {
    name: '资源链接',
    path: '/rd',
    hint: '文献、工具、资料与文件',
    category: '核心入口',
    keywords: ['resources', 'links', 'rd'],
  },
  {
    name: '代码与项目',
    path: '/code',
    hint: '项目、实验与代码记录',
    category: '核心入口',
    keywords: ['code', 'projects', 'programming'],
  },
  {
    name: '赛博会客厅',
    path: '/space3',
    hint: '访客中心、网络邻居与开放空间中枢',
    category: '核心入口',
    keywords: ['lounge', 'visitor', 'friends', 'guest', 'space3'],
  },
  {
    name: '关于',
    path: '/about',
    hint: '自我介绍、学术与说明',
    category: '核心入口',
    keywords: ['about', 'profile', 'statement'],
  },
]

const fallbackSearchItems = [
  ...defaultSpotlightLinks,
  {
    name: '访客中心',
    path: '/visitor-center',
    hint: '访客信息、IP 定位和访客地球仪',
    category: '赛博会客厅',
    keywords: ['visitor', 'ip', 'globe', 'guest'],
  },
  {
    name: '网络邻居',
    path: '/space2',
    hint: '朋友们的个人站点与友链街区',
    category: '赛博会客厅',
    keywords: ['friends', 'neighbor', 'links', 'space2'],
  },
  {
    name: '自我介绍',
    path: '/about/self',
    hint: '站主自我介绍和个人页面',
    category: '关于',
    keywords: ['self', 'intro', 'profile'],
  },
  {
    name: '学术主页',
    path: '/research',
    hint: '研究综述、学术脉络和学术名片入口',
    category: '关于',
    keywords: ['research', 'academic', 'scholar'],
  },
  {
    name: '我的学术',
    path: '/academic',
    hint: '由 JSON 和 Markdown 驱动的学术名片 deck',
    category: '关于',
    keywords: ['cv', 'resume', 'academic', 'deck'],
  },
  {
    name: '版权说明',
    path: '/credit',
    hint: '网站内容、素材与版权说明',
    category: '关于',
    keywords: ['copyright', 'credit', 'license'],
  },
  {
    name: '文献',
    path: '/rliterature',
    hint: '论文、文献与阅读资料',
    category: '资源链接',
    keywords: ['literature', 'paper', 'reference'],
  },
  {
    name: '编程',
    path: '/rprogramming',
    hint: '编程语言、开发资料与实践链接',
    category: '资源链接',
    keywords: ['programming', 'coding', 'developer'],
  },
  {
    name: '计算机',
    path: '/rcomputer',
    hint: '计算机科学与相关学习资源',
    category: '资源链接',
    keywords: ['computer science', 'cs', 'algorithm'],
  },
  {
    name: '资料',
    path: '/rmaterials',
    hint: '常用材料、文档与学习资料',
    category: '资源链接',
    keywords: ['materials', 'docs', 'data'],
  },
  {
    name: '工具',
    path: '/rtools',
    hint: '在线工具与效率工具集合',
    category: '资源链接',
    keywords: ['tools', 'utilities'],
  },
  {
    name: '文件',
    path: '/rfiles',
    hint: '文件资源与可下载内容入口',
    category: '资源链接',
    keywords: ['files', 'download'],
  },
  {
    name: '实验报告',
    path: '/labreport',
    hint: '实验报告与课程实践记录',
    category: '代码与项目',
    keywords: ['lab', 'report', 'experiment'],
  },
  {
    name: 'Ysy Data Analysis Helper',
    path: '/ysy-data-analysis-helper',
    hint: '个人实验数据分析工具',
    category: '代码与项目',
    keywords: ['data analysis', 'python', 'project'],
  },
  {
    name: 'Brisk Nexus',
    path: '/brisk-nexus',
    hint: '个人小巧思合集',
    category: '代码与项目',
    keywords: ['brisk', 'nexus', 'toy'],
  },
  {
    name: 'Cyber Match',
    path: '/cyber-match',
    hint: 'Cyber Match Vue 游戏',
    category: '代码与项目',
    keywords: ['game', 'vue', 'cyber match'],
  },
  {
    name: 'Portal',
    path: '/portal',
    hint: 'macOS 风格桌面入口与常用工具',
    category: '功能页',
    keywords: ['portal', 'desktop', 'dock', 'music', 'weather', 'todo', 'calendar'],
  },
]

const activeWindow = ref(null)
const now = ref(new Date())
const dockGroups = ref([])
const musicTracks = ref([])
const aplayerContainer = ref(null)
const spotlightQuery = ref('')
const searchItems = ref([])
const loadingData = ref(true)
const dataError = ref('')
let clockTimer
let player

const allWindowApps = computed(() => [...topApps, ...bottomApps])
const activeApp = computed(() => allWindowApps.value.find((app) => app.id === activeWindow.value))
const rightTopApps = computed(() => topApps.filter((app) => app.align === 'right'))
const todoApp = computed(() => topApps.find((app) => app.id === 'todo'))
const normalizedSearchItems = computed(() => {
  const source = searchItems.value.length ? searchItems.value : fallbackSearchItems
  return source.map(normalizeSearchItem).filter((item) => item.name && item.path)
})
const filteredSpotlightLinks = computed(() => {
  const terms = normalizeText(spotlightQuery.value).split(/\s+/).filter(Boolean)

  if (!terms.length) return defaultSpotlightLinks.map(normalizeSearchItem)

  return normalizedSearchItems.value
    .filter((item) => terms.every((term) => item.searchText.includes(term)))
    .sort((a, b) => scoreSearchItem(b, terms) - scoreSearchItem(a, terms))
    .slice(0, 12)
})

const menuTime = computed(() => (
  now.value.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  + ' '
  + now.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
))

function iconForUrl(url, size = 96) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(url)}`
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().trim()
}

function compactText(value, maxLength = 96) {
  const text = String(value ?? '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.replace(/^\[|\]\([^)]*\)$/g, ''))
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function normalizeSearchItem(item) {
  const name = item.name || item.title || ''
  const hint = item.hint || item.description || item.desc || ''
  const category = item.category || '站内页面'
  const keywords = Array.isArray(item.keywords) ? item.keywords : []
  const path = item.path || item.url || item.href || '/'
  const external = Boolean(item.external || /^https?:\/\//i.test(path))
  const searchText = normalizeText([
    name,
    hint,
    category,
    path,
    ...keywords,
  ].join(' '))

  return {
    name,
    path,
    external,
    hint,
    category,
    keywords,
    searchText,
    rank: Number(item.rank ?? 60),
  }
}

function scoreSearchItem(item, terms) {
  const name = normalizeText(item.name)
  const category = normalizeText(item.category)
  const hint = normalizeText(item.hint)
  const path = normalizeText(item.path)
  let score = item.rank

  terms.forEach((term) => {
    if (name === term) score += 120
    else if (name.startsWith(term)) score += 82
    else if (name.includes(term)) score += 56

    if (category.includes(term)) score += 24
    if (path.includes(term)) score += 20
    if (hint.includes(term)) score += 12
  })

  if (!item.external) score += 8
  return score
}

async function fetchJsonArray(path) {
  try {
    const response = await fetch(path, { cache: 'no-cache' })
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function uniqueSearchItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    const normalized = normalizeSearchItem(item)
    const key = `${normalizeText(normalized.name)}|${normalized.path}`
    if (!normalized.name || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildArticleSearchItems(articles) {
  return articles.map((article) => ({
    name: article.title,
    path: `/space1/${article.id}`,
    hint: article.desc || article.date || '',
    category: '随记',
    keywords: ['article', 'jottings', article.id, article.author, article.date],
    rank: 72,
  }))
}

function buildProjectSearchItems(projects) {
  return projects
    .filter((project) => project.homepage || project.repo)
    .map((project) => ({
      name: project.name,
      path: project.homepage || project.repo,
      external: !project.homepage && Boolean(project.repo),
      hint: project.desc || '',
      category: '代码与项目',
      keywords: ['code', 'project', project.category, project.repo],
      rank: 76,
    }))
}

function buildResourceSearchItems(resourceGroups) {
  return resourceGroups.flatMap(({ source, items }) => items.map((item) => ({
    name: item.name,
    path: item.url || source.path,
    external: Boolean(item.url),
    hint: compactText(item.intro || item.add || source.label),
    category: `资源链接 · ${source.label}`,
    keywords: ['resource', source.id, source.label, item.url],
    rank: 54,
  })))
}

function buildFriendSearchItems(friends) {
  return friends.map((friend) => ({
    name: friend.name,
    path: friend.link,
    external: true,
    hint: friend.desc || '网络邻居',
    category: '网络邻居',
    keywords: ['friend', 'neighbor', 'links'],
    rank: 52,
  }))
}

async function loadSearchItems() {
  const [
    staticItems,
    articles,
    projects,
    friends,
    ...resourceData
  ] = await Promise.all([
    fetchJsonArray('/data/search-index.json'),
    fetchJsonArray('/articles.json'),
    fetchJsonArray('/code_proj.json'),
    fetchJsonArray('/friends.json'),
    ...resourceSearchSources.map((source) => fetchJsonArray(`/resource/${source.file}`)),
  ])

  const resourceGroups = resourceSearchSources.map((source, index) => ({
    source,
    items: resourceData[index] || [],
  }))

  return uniqueSearchItems([
    ...fallbackSearchItems,
    ...staticItems,
    ...buildArticleSearchItems(articles),
    ...buildProjectSearchItems(projects),
    ...buildResourceSearchItems(resourceGroups),
    ...buildFriendSearchItems(friends),
  ])
}

function openWindow(id) {
  activeWindow.value = id
}

function closeWindow() {
  activeWindow.value = null
}

async function loadPortalData() {
  loadingData.value = true
  dataError.value = ''

  try {
    const [musicRes, dockRes] = await Promise.all([
      fetch('/data/portal-music.json'),
      fetch('/data/portal-dock.json'),
    ])

    if (!musicRes.ok) throw new Error(`Music JSON ${musicRes.status}`)
    if (!dockRes.ok) throw new Error(`Dock JSON ${dockRes.status}`)

    musicTracks.value = await musicRes.json()
    dockGroups.value = await dockRes.json()
    searchItems.value = await loadSearchItems()
  } catch (error) {
    dataError.value = `Portal data failed: ${error.message}`
  } finally {
    loadingData.value = false
  }
}

function destroyPlayer() {
  if (player) {
    player.destroy()
    player = null
  }
}

async function mountPlayer() {
  await nextTick()
  if (activeWindow.value !== 'music' || !aplayerContainer.value || !musicTracks.value.length || player) return

  player = new APlayer({
    container: aplayerContainer.value,
    autoplay: false,
    theme: '#89b4fa',
    listFolded: false,
    listMaxHeight: '246px',
    audio: musicTracks.value,
  })
}

watch(activeWindow, async (next) => {
  if (next !== 'music') destroyPlayer()
  else await mountPlayer()
})

watch(musicTracks, async () => {
  if (activeWindow.value === 'music') await mountPlayer()
})

onMounted(() => {
  loadPortalData()
  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 30000)
})

onBeforeUnmount(() => {
  destroyPlayer()
  window.clearInterval(clockTimer)
})
</script>

<template>
  <main class="portal-desktop" :style="{ '--portal-wallpaper': `url(${wallpaper})` }">
    <div class="wallpaper" aria-hidden="true"></div>
    <div class="desktop-vignette" aria-hidden="true"></div>

    <header class="portal-menu-bar" aria-label="Portal menu bar">
      <div class="menu-left">
        <RouterLink to="/" class="menu-home-link" aria-label="Back to home">
          <img src="/favicon_liuyin.svg" alt="" class="menu-brand-icon">
        </RouterLink>
        <button
          v-if="todoApp"
          class="menu-app-button todo-menu-button"
          type="button"
          :class="{ 'is-active': activeWindow === todoApp.id }"
          aria-label="Open TODO List"
          @click="openWindow(todoApp.id)"
        >
          <span class="todo-menu-icon" aria-hidden="true">☑</span>
          <span>{{ todoApp.label }}</span>
        </button>
      </div>

      <div class="menu-right">
        <button
          v-for="app in rightTopApps"
          :key="app.id"
          class="menu-app-button icon-menu-button"
          type="button"
          :class="{ 'is-active': activeWindow === app.id }"
          :aria-label="`Open ${app.label}`"
          @click="openWindow(app.id)"
        >
          <img :src="app.icon" alt="">
          <span>{{ app.label }}</span>
        </button>
        <span class="menu-clock">{{ menuTime }}</span>
      </div>
    </header>

    <section
      v-if="activeApp"
      class="mac-window"
      :class="activeApp.windowClass"
      :aria-label="activeApp.title"
    >
      <div class="window-titlebar">
        <div class="traffic-lights" aria-label="Window controls">
          <button class="traffic-light close" type="button" aria-label="Close window" @click="closeWindow"></button>
          <button class="traffic-light minimize" type="button" aria-label="Minimize unavailable" disabled></button>
          <button class="traffic-light zoom" type="button" aria-label="Zoom unavailable" disabled></button>
        </div>
        <div class="window-title">
          <img :src="activeApp.icon" alt="">
          <span>{{ activeApp.title }}</span>
        </div>
      </div>

      <div class="window-body">
        <div v-if="dataError" class="portal-error">{{ dataError }}</div>

        <section v-if="activeWindow === 'music'" class="mac-app-content music-app">
          <div class="app-panel-heading">
            <p>Now playing</p>
            <h1>Music Library</h1>
          </div>
          <div v-if="loadingData" class="portal-loading">Loading music library...</div>
          <div v-else ref="aplayerContainer" class="aplayer-mount"></div>
        </section>

        <section v-else-if="activeWindow === 'weather'" class="mac-app-content widget-shell weather-shell">
          <div class="app-panel-heading">
            <p>Forecast</p>
            <h1>Weather</h1>
          </div>
          <Weather class="portal-widget weather-widget" />
        </section>

        <section v-else-if="activeWindow === 'calendar'" class="mac-app-content widget-shell calendar-shell">
          <div class="app-panel-heading">
            <p>Schedule</p>
            <h1>Calendar</h1>
          </div>
          <Calendar class="portal-widget calendar-widget" />
        </section>

        <section v-else-if="activeWindow === 'todo'" class="mac-app-content widget-shell todo-shell">
          <div class="app-panel-heading">
            <p>Focus board</p>
            <h1>TODO List</h1>
          </div>
          <ToDoList class="portal-widget todo-widget" />
        </section>

        <section v-else-if="activeWindow === 'map'" class="mac-app-content map-window-content">
          <label class="spotlight-search">
            <span class="spotlight-magnifier" aria-hidden="true"></span>
            <input
              v-model="spotlightQuery"
              class="spotlight-input"
              type="search"
              autocomplete="off"
              placeholder="搜索 LiuYinChu'Space"
              aria-label="Search site links"
            >
          </label>

          <div class="spotlight-results" aria-label="Site search results">
            <template
              v-for="link in filteredSpotlightLinks"
              :key="`${link.external ? 'external' : 'internal'}-${link.path}`"
            >
              <a
                v-if="link.external"
                :href="link.path"
                class="spotlight-result"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="spotlight-result-copy">
                  <strong>{{ link.name }}</strong>
                  <small>{{ link.category }} · {{ link.hint }}</small>
                </span>
                <span class="spotlight-result-action">访问</span>
              </a>
              <RouterLink
                v-else
                :to="link.path"
                class="spotlight-result"
              >
                <span class="spotlight-result-copy">
                  <strong>{{ link.name }}</strong>
                  <small>{{ link.category }} · {{ link.hint }}</small>
                </span>
                <span class="spotlight-result-action">打开</span>
              </RouterLink>
            </template>
            <p v-if="!filteredSpotlightLinks.length" class="spotlight-empty">没有找到对应入口</p>
          </div>
        </section>

        <section v-else-if="activeWindow === 'dock'" class="mac-app-content dock-window-content">
          <div class="app-panel-heading">
            <p>Resource dock</p>
            <h1>Dock</h1>
          </div>
          <div
            v-for="group in dockGroups"
            :key="group.name"
            class="link-group"
            :style="{ '--group-accent': group.color }"
          >
            <h2>{{ group.name }}</h2>
            <div class="launchpad-grid">
              <a
                v-for="site in group.links"
                :key="site.url"
                :href="site.url"
                class="launchpad-tile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img :src="iconForUrl(site.url, 96)" alt="">
                <span>{{ site.name }}</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </section>

    <nav class="bottom-launcher" aria-label="Portal launcher">
      <button
        class="launcher-item"
        type="button"
        :class="{ 'is-active': activeWindow === 'map' }"
        aria-label="Open website map"
        @click="openWindow('map')"
      >
        <img :src="bottomApps[0].icon" alt="">
        <span>Map</span>
      </button>

      <span class="launcher-divider" aria-hidden="true"></span>

      <a
        v-for="site in quickLinks"
        :key="site.url"
        :href="site.url"
        target="_blank"
        rel="noopener noreferrer"
        class="launcher-item"
        :class="{ 'hide-on-compact': !site.compact }"
        :aria-label="site.name"
      >
        <img :src="iconForUrl(site.url, 128)" alt="">
        <span>{{ site.name }}</span>
      </a>

      <span class="launcher-divider" aria-hidden="true"></span>

      <button
        class="launcher-item"
        type="button"
        :class="{ 'is-active': activeWindow === 'dock' }"
        aria-label="Open Dock"
        @click="openWindow('dock')"
      >
        <img :src="bottomApps[1].icon" alt="">
        <span>Dock</span>
      </button>
    </nav>
  </main>
</template>

<style scoped>
.portal-desktop {
  --portal-text: rgba(245, 246, 255, 0.94);
  --portal-muted: rgba(205, 214, 244, 0.72);
  --portal-border: rgba(255, 255, 255, 0.16);
  --portal-window: rgba(24, 24, 37, 0.72);
  --portal-toolbar: rgba(30, 30, 46, 0.74);
  --neo-surface: rgba(55, 67, 94, 0.62);
  --neo-surface-soft: rgba(70, 84, 113, 0.5);
  --neo-surface-deep: rgba(24, 31, 49, 0.54);
  --neo-surface-inset: rgba(14, 20, 34, 0.34);
  --neo-border: rgba(255, 255, 255, 0.13);
  --neo-highlight: rgba(255, 255, 255, 0.15);
  --neo-shadow-dark: rgba(3, 8, 20, 0.34);
  --neo-shadow-light: rgba(255, 255, 255, 0.1);
  --neo-raised:
    12px 12px 28px var(--neo-shadow-dark),
    -10px -10px 24px var(--neo-shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.09);
  --neo-inset:
    inset 8px 8px 18px rgba(3, 8, 20, 0.34),
    inset -8px -8px 18px rgba(255, 255, 255, 0.07);

  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  color: var(--portal-text);
  background: #181825;
  font-family: 'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Inter', system-ui, sans-serif;
}

.wallpaper,
.desktop-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wallpaper {
  background-image: var(--portal-wallpaper);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.desktop-vignette {
  background:
    linear-gradient(180deg, rgba(17, 17, 27, 0.38), rgba(17, 17, 27, 0.06) 42%, rgba(17, 17, 27, 0.46)),
    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.08), transparent 34rem);
}

.portal-menu-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  height: 1.65rem;
  padding: 0 0.72rem;
  color: rgba(18, 20, 30, 0.9);
  border: 0;
  border-radius: 0;
  background: rgba(216, 224, 255, 0.72);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.32), 0 10px 28px rgba(17, 17, 27, 0.12);
  backdrop-filter: blur(18px) saturate(170%);
  box-sizing: border-box;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-left {
  justify-content: flex-start;
  gap: 0.42rem;
}

.menu-right {
  justify-content: flex-end;
  gap: 0.26rem;
}

.menu-clock {
  color: rgba(18, 20, 30, 0.82);
  font-size: 0.76rem;
  font-weight: 650;
  white-space: nowrap;
}

.menu-brand-icon {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 0.24rem;
}

.menu-home-link {
  display: inline-flex;
  width: 1.24rem;
  height: 1.24rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.32rem;
  transition: background-color 0.16s ease;
}

.menu-home-link:hover,
.menu-home-link:focus-visible {
  background: rgba(255, 255, 255, 0.42);
  outline: none;
}

.menu-app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 1.25rem;
  height: 1.24rem;
  padding: 0 0.3rem;
  border: 0;
  border-radius: 0.32rem;
  color: rgba(18, 20, 30, 0.9);
  background: transparent;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 720;
  cursor: pointer;
  transition: transform 0.16s ease, background-color 0.16s ease, border-color 0.16s ease;
}

.menu-app-button:hover,
.menu-app-button:focus-visible,
.menu-app-button.is-active {
  background: rgba(255, 255, 255, 0.42);
  outline: none;
}

.todo-menu-button {
  min-width: 1.24rem;
  padding: 0;
}

.todo-menu-icon {
  color: rgba(18, 20, 30, 0.9);
  font-size: 0.92rem;
  font-weight: 760;
  line-height: 1;
}

.todo-menu-button span:last-child {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.icon-menu-button img {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 0.22rem;
}

.icon-menu-button span {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.mac-window {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  display: flex;
  width: min(920px, calc(100vw - 3rem));
  max-height: min(690px, calc(100dvh - 8.4rem));
  min-height: 24rem;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.82rem;
  background: rgba(32, 34, 48, 0.76);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 38px 110px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(34px) saturate(160%);
}

.window-music {
  width: min(780px, calc(100vw - 3rem));
  min-height: auto;
}
.window-weather { width: min(560px, calc(100vw - 3rem)); }
.window-calendar { width: min(600px, calc(100vw - 3rem)); }
.window-todo { width: min(690px, calc(100vw - 3rem)); }
.window-map { width: min(720px, calc(100vw - 3rem)); }
.window-dock {
  width: min(1080px, calc(100vw - 3rem));
  max-height: min(560px, calc(100dvh - 10.6rem));
  min-height: 21rem;
}

.window-titlebar {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr) 5rem;
  align-items: center;
  min-height: 2.4rem;
  padding: 0 0.9rem;
  background: rgba(27, 28, 40, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.traffic-lights {
  display: flex;
  align-items: center;
  gap: 0.48rem;
}

.traffic-light {
  width: 0.78rem;
  height: 0.78rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
}

.traffic-light.close {
  background: #ff5f57;
  cursor: pointer;
}

.traffic-light.minimize {
  background: #febc2e;
}

.traffic-light.zoom {
  background: #28c840;
}

.traffic-light:disabled {
  cursor: default;
}

.window-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  color: rgba(245, 246, 255, 0.9);
  font-size: 0.88rem;
  font-weight: 760;
}

.window-title img {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 0.28rem;
}

.window-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: clamp(1rem, 2vw, 1.35rem);
}

.window-music .window-body {
  padding-bottom: 1.1rem;
}

.window-music .window-body,
.window-map .window-body {
  background:
    radial-gradient(circle at 18% 10%, rgba(137, 180, 250, 0.12), transparent 17rem),
    radial-gradient(circle at 88% 94%, rgba(245, 194, 231, 0.08), transparent 16rem),
    linear-gradient(145deg, rgba(57, 68, 96, 0.32), rgba(18, 24, 39, 0.22));
}

.portal-loading,
.portal-error {
  padding: 2rem;
  color: var(--portal-muted);
  text-align: center;
}

.portal-error {
  color: #f38ba8;
}

.mac-app-content {
  display: grid;
  gap: 1.05rem;
  min-height: 100%;
}

.music-app {
  gap: 1.15rem;
  min-height: auto;
}

.app-panel-heading {
  display: grid;
  gap: 0.18rem;
}

.music-app .app-panel-heading {
  gap: 0.22rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--neo-border);
  border-radius: 1.05rem;
  background: linear-gradient(145deg, var(--neo-surface-soft), var(--neo-surface-deep));
  box-shadow: var(--neo-raised);
}

.app-panel-heading p,
.app-panel-heading h1 {
  margin: 0;
}

.app-panel-heading p {
  color: rgba(180, 190, 254, 0.82);
  font-size: 0.78rem;
  font-weight: 780;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-panel-heading h1 {
  color: rgba(245, 246, 255, 0.96);
  font-size: clamp(1.45rem, 2.4vw, 2.1rem);
  line-height: 1.08;
}

.aplayer-mount {
  min-height: 0;
}

:deep(.aplayer) {
  margin: 0;
  border: 1px solid var(--neo-border);
  border-radius: 1.2rem;
  color: #cdd6f4;
  background: linear-gradient(145deg, rgba(62, 74, 103, 0.66), rgba(23, 30, 48, 0.58));
  box-shadow: var(--neo-raised);
  overflow: hidden;
}

:deep(.aplayer-list) {
  max-height: 246px;
  background: rgba(16, 22, 36, 0.2);
}

:deep(.aplayer-pic) {
  border-radius: 0 0.9rem 0.9rem 0;
  box-shadow:
    10px 0 24px rgba(3, 8, 20, 0.28),
    inset -1px 0 0 rgba(255, 255, 255, 0.08);
}

:deep(.aplayer-list ol li) {
  border-top-color: rgba(180, 190, 254, 0.1);
  color: #cdd6f4;
  background: transparent;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.aplayer-list ol li:hover),
:deep(.aplayer-list-light) {
  color: rgba(245, 246, 255, 0.96) !important;
  background: rgba(137, 180, 250, 0.22) !important;
  box-shadow: var(--neo-inset);
}

:deep(.aplayer-list-light .aplayer-list-title),
:deep(.aplayer-list-light .aplayer-list-author) {
  color: rgba(245, 246, 255, 0.96) !important;
}

:deep(.aplayer-info),
:deep(.aplayer-list) {
  border-color: rgba(180, 190, 254, 0.1);
}

:deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-bar),
:deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgba(14, 20, 34, 0.42);
  box-shadow: var(--neo-inset);
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.todo-list-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.widget-shell :deep(.todo-container) {
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 1rem;
  background: rgba(30, 30, 46, 0.58);
  box-shadow: none;
}

.map-window-content {
  gap: 0.65rem;
  min-height: auto;
  padding: 0.1rem 0.05rem 0.35rem;
}

.spotlight-search {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.7rem;
  min-height: 3.2rem;
  padding: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.05rem;
  color: rgba(245, 246, 255, 0.92);
  background: rgba(17, 24, 38, 0.34);
  box-shadow: var(--neo-inset);
  cursor: text;
}

.spotlight-magnifier {
  position: relative;
  display: inline-flex;
  width: 1.32rem;
  height: 1.32rem;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.spotlight-magnifier::before {
  content: '';
  width: 0.82rem;
  height: 0.82rem;
  border: 2px solid rgba(245, 246, 255, 0.72);
  border-radius: 50%;
}

.spotlight-magnifier::after {
  content: '';
  position: absolute;
  right: 0.18rem;
  bottom: 0.18rem;
  width: 0.48rem;
  height: 2px;
  border-radius: 999px;
  background: rgba(245, 246, 255, 0.72);
  transform: rotate(45deg);
}

.spotlight-input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  color: rgba(245, 246, 255, 0.94);
  background: transparent;
  font: inherit;
  font-size: clamp(1.1rem, 2vw, 1.42rem);
  font-weight: 650;
  outline: none;
}

.spotlight-input::placeholder {
  color: rgba(245, 246, 255, 0.56);
}

.spotlight-results {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--neo-border);
  border-radius: 1.08rem;
  background: linear-gradient(145deg, var(--neo-surface), var(--neo-surface-deep));
  box-shadow: var(--neo-raised);
}

.spotlight-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
  min-height: 3.45rem;
  padding: 0 1rem;
  color: rgba(245, 246, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  transition: background-color 0.16s ease, box-shadow 0.16s ease;
}

.spotlight-result:last-child {
  border-bottom: 0;
}

.spotlight-result:hover,
.spotlight-result:focus-visible {
  background: rgba(137, 180, 250, 0.18);
  box-shadow: var(--neo-inset);
  outline: none;
}

.spotlight-result-copy {
  display: grid;
  min-width: 0;
  gap: 0.18rem;
}

.spotlight-result-copy strong {
  color: rgba(245, 246, 255, 0.95);
  font-size: 0.96rem;
}

.spotlight-result-copy small {
  overflow: hidden;
  color: rgba(205, 214, 244, 0.64);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotlight-result-action {
  color: rgba(205, 214, 244, 0.58);
  font-size: 0.76rem;
  font-weight: 620;
}

.spotlight-empty {
  margin: 0;
  padding: 1.2rem 1rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.86rem;
  text-align: center;
}

.dock-window-content {
  gap: 1.25rem;
  min-height: auto;
}

.link-group {
  display: grid;
  gap: 1rem;
}

.link-group h2 {
  margin: 0;
  color: var(--group-accent, #b4befe);
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.launchpad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.6rem, 1fr));
  gap: 1.25rem 1rem;
}

.launchpad-tile {
  display: grid;
  justify-items: center;
  gap: 0.52rem;
  min-height: 5.9rem;
  padding: 0.35rem 0.2rem;
  border: 0;
  border-radius: 0.8rem;
  color: rgba(245, 246, 255, 0.9);
  background: transparent;
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.launchpad-tile:hover,
.launchpad-tile:focus-visible {
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  transform: translateY(-3px);
}

.launchpad-tile img {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 12px 24px rgba(0, 0, 0, 0.24);
}

.launchpad-tile span {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: rgba(245, 246, 255, 0.9);
  font-size: 0.76rem;
  font-weight: 620;
  line-height: 1.25;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);
}

.bottom-launcher {
  position: absolute;
  right: 50%;
  bottom: max(1.15rem, env(safe-area-inset-bottom));
  z-index: 18;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: clamp(0.34rem, 0.85vw, 0.66rem);
  width: auto;
  max-width: calc(100vw - 2rem);
  min-height: 4.7rem;
  padding: 0.48rem 0.7rem 0.42rem;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.35rem;
  background: rgba(26, 28, 40, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 24px 72px rgba(0, 0, 0, 0.36);
  transform: translateX(50%);
  backdrop-filter: blur(30px) saturate(170%);
  scrollbar-width: none;
}

.bottom-launcher::-webkit-scrollbar {
  display: none;
}

.launcher-item {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  width: clamp(3rem, 4.3vw, 3.65rem);
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  color: rgba(245, 246, 255, 0.88);
  background: transparent;
  font: inherit;
  font-size: 0.66rem;
  font-weight: 650;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease;
}

.launcher-item:hover,
.launcher-item:focus-visible {
  outline: none;
  transform: translateY(-0.48rem) scale(1.06);
}

.launcher-item.is-active::after {
  content: '';
  position: absolute;
  bottom: -0.1rem;
  width: 0.26rem;
  height: 0.26rem;
  border-radius: 50%;
  background: rgba(245, 246, 255, 0.88);
}

.launcher-item img {
  width: clamp(2.45rem, 4vw, 3rem);
  height: clamp(2.45rem, 4vw, 3rem);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 12px 26px rgba(0, 0, 0, 0.32);
}

.launcher-item span {
  max-width: 4rem;
  overflow: hidden;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
}

.launcher-divider {
  width: 1px;
  height: 3.35rem;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.22);
}

@media (max-width: 900px) {
  .portal-menu-bar {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .menu-clock,
  .icon-menu-button span {
    display: none;
  }

  .bottom-launcher {
    justify-content: flex-start;
    width: auto;
  }
}

@media (max-width: 700px), (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .portal-menu-bar {
    height: calc(3rem + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 0.35rem 0;
  }

  .menu-left,
  .menu-right {
    gap: 0.08rem;
  }

  .menu-home-link,
  .menu-app-button {
    width: 2.75rem;
    min-width: 2.75rem;
    height: 2.75rem;
    padding: 0;
  }

  .menu-brand-icon,
  .icon-menu-button img {
    width: 1.1rem;
    height: 1.1rem;
  }

  .mac-window {
    top: calc(3rem + env(safe-area-inset-top) + 0.45rem);
    right: 0.5rem;
    bottom: calc(4.2rem + max(0.55rem, env(safe-area-inset-bottom)));
    left: 0.5rem;
    width: auto;
    max-height: none;
    min-height: 0;
    transform: none;
  }

  .window-titlebar {
    grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
    min-height: 2.75rem;
    padding: 0 0.55rem;
  }

  .traffic-lights {
    gap: 0;
  }

  .traffic-light.minimize,
  .traffic-light.zoom {
    display: none;
  }

  .traffic-light.close {
    position: relative;
    width: 2.75rem;
    height: 2.75rem;
    margin-left: -0.55rem;
    background: transparent;
  }

  .traffic-light.close::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 0.78rem;
    height: 0.78rem;
    margin: auto;
    border-radius: 50%;
    background: #ff5f57;
  }

  .window-body {
    padding: 0.85rem;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .app-panel-heading h1 {
    font-size: 1.35rem;
  }

  .launchpad-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bottom-launcher {
    align-items: center;
    min-height: 0;
    bottom: max(0.55rem, env(safe-area-inset-bottom));
    max-width: calc(100vw - 1rem);
    padding: 0.46rem 0.62rem;
    justify-content: flex-start;
    scroll-snap-type: x proximity;
    overscroll-behavior-inline: contain;
    -webkit-overflow-scrolling: touch;
  }

  .launcher-item span {
    display: none;
  }

  .launcher-item {
    width: 2.75rem;
    min-height: 2.75rem;
    scroll-snap-align: start;
    touch-action: manipulation;
  }

  .launcher-item.hide-on-compact {
    display: none;
  }

  .launcher-item img {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.68rem;
  }

  .launcher-divider {
    height: 2.45rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .launcher-item,
  .menu-app-button,
  .spotlight-result,
  .launchpad-tile {
    animation: none;
    transition: none;
  }
}
</style>
