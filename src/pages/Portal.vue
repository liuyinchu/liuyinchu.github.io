<script setup>
import APlayer from 'aplayer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue'
import Weather from '../components/Weather.vue'

const wallpaper = '/bg/Firefly_Paper_Airplane.png'
const router = useRouter()

const topApps = [
  {
    id: 'todo',
    label: 'TODO',
    title: 'TODO List',
    icon: 'https://www.google.com/s2/favicons?sz=256&domain_url=https://todoist.com/',
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
    icon: 'https://www.google.com/s2/favicons?sz=256&domain_url=https://www.qweather.com/',
    align: 'right',
    windowClass: 'window-weather',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    title: 'Calendar',
    icon: 'https://www.google.com/s2/favicons?sz=256&domain_url=https://calendar.google.com/',
    align: 'right',
    windowClass: 'window-calendar',
  },
]

const bottomApps = [
  {
    id: 'map',
    label: 'Spotlight',
    title: 'Spotlight',
    icon: '/favicon_liuyin.svg',
  },
  {
    id: 'dock',
    label: 'Launchpad',
    title: 'Launchpad',
    icon: '/icons/portal-launchpad.png',
  },
]

const quickLinks = [
  { name: 'ChatGPT', url: 'https://chat.openai.com/' },
  { name: 'Claude', url: 'https://claude.ai/' },
  { name: 'Gemini', url: 'https://gemini.google.com/' },
  { name: 'GitHub', url: 'https://github.com/' },
  { name: 'Google', url: 'https://www.google.com/' },
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
const activeOverlay = ref(null)
const minimizedWindow = ref(null)
const now = ref(new Date())
const dockGroups = ref([])
const musicTracks = ref([])
const aplayerContainer = ref(null)
const spotlightQuery = ref('')
const launchpadQuery = ref('')
const spotlightSelectedIndex = ref(0)
const searchItems = ref([])
const loadingData = ref(true)
const dataError = ref('')
const windowRef = ref(null)
const spotlightInput = ref(null)
const launchpadInput = ref(null)
const dockRef = ref(null)
const windowPos = ref({ x: 0, y: 0 })
const restoreWindowPos = ref({ x: 0, y: 0 })
const dragDelta = ref({ x: 0, y: 0 })
const windowPositioned = ref(false)
const windowMaximized = ref(false)
const windowBodyScrolled = ref(false)
const dragging = ref(false)
const compactLayout = ref(false)
const isMinimizing = ref(false)
const lastFocusedElement = ref(null)
const overlayReturnFocus = ref(null)
let clockTimer
let player
let dragPointerId = null
let dragCaptureTarget = null
let dragStart = { pointerX: 0, pointerY: 0, originX: 0, originY: 0 }
let dockAnimationFrame
let minimizeTimer

const allWindowApps = computed(() => [...topApps, ...bottomApps])
const activeWindowApp = computed(() => topApps.find((app) => app.id === activeWindow.value))
const activeOverlayApp = computed(() => bottomApps.find((app) => app.id === activeOverlay.value))
const activeApp = computed(() => activeOverlayApp.value || activeWindowApp.value)
const minimizedApp = computed(() => allWindowApps.value.find((app) => app.id === minimizedWindow.value))
const dockWindowApps = computed(() => [bottomApps[0], ...topApps, bottomApps[1]])
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
const spotlightGroups = computed(() => {
  const grouped = new Map()

  filteredSpotlightLinks.value.forEach((item) => {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category).push(item)
  })

  let resultIndex = 0
  return Array.from(grouped, ([category, items]) => ({
    category,
    items: items.map((item) => ({ ...item, resultIndex: resultIndex++ })),
  }))
})
const spotlightFlatLinks = computed(() => spotlightGroups.value.flatMap((group) => group.items))
const filteredDockGroups = computed(() => {
  const query = normalizeText(launchpadQuery.value)
  if (!query) return dockGroups.value

  return dockGroups.value
    .map((group) => ({
      ...group,
      links: group.links.filter((site) => normalizeText(`${site.name} ${site.url}`).includes(query)),
    }))
    .filter((group) => group.links.length)
})
const menuTime = computed(() => {
  const date = now.value
  const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' })
  const time = now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${monthDay} ${weekday} ${time}`
})
const windowStyle = computed(() => {
  if (compactLayout.value || !windowPositioned.value) return {}

  if (windowMaximized.value) {
    return {
      top: '34px',
      left: '8px',
      width: 'calc(100vw - 16px)',
      height: 'calc(100dvh - 112px)',
      maxHeight: 'none',
    }
  }

  const style = {
    top: `${windowPos.value.y}px`,
    left: `${windowPos.value.x}px`,
  }
  if (dragging.value) {
    style.transform = `translate3d(${dragDelta.value.x}px, ${dragDelta.value.y}px, 0)`
  }
  return style
})

function iconForUrl(url, size = 256) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(url)}`
}

function fallbackIcon(label = '?') {
  const initial = Array.from(String(label).trim())[0]?.toUpperCase() || '?'
  const safeInitial = initial.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character])
  let hash = 0
  Array.from(String(label)).forEach((character) => {
    hash = ((hash << 5) - hash + character.codePointAt(0)) | 0
  })
  const hue = Math.abs(hash) % 360
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="hsl(${hue} 72% 64%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 38) % 360} 64% 42%)"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="58" fill="url(#g)"/>
      <circle cx="196" cy="52" r="54" fill="white" fill-opacity=".14"/>
      <text x="128" y="154" text-anchor="middle" fill="white"
        font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="108" font-weight="600">${safeInitial}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function handleIconError(event, label) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  image.src = fallbackIcon(label)
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

function isOrdinaryWindow(id) {
  return Boolean(id && id !== 'map' && id !== 'dock')
}

function rememberCurrentFocus(target = lastFocusedElement) {
  if (document.activeElement instanceof HTMLElement) {
    target.value = document.activeElement
  }
}

async function restorePreviousFocus(target = lastFocusedElement) {
  await nextTick()
  if (target.value?.isConnected) {
    target.value.focus({ preventScroll: true })
  }
}

function updateCompactLayout() {
  compactLayout.value = window.matchMedia(
    '(max-width: 700px), (max-width: 950px) and (max-height: 600px) and (orientation: landscape)',
  ).matches

  if (compactLayout.value) {
    cancelWindowDrag()
  }
}

function clampWindowPosition(x, y, rect = windowRef.value?.getBoundingClientRect()) {
  if (!rect) return { x, y }
  const visibleTitlebar = 40
  const minX = visibleTitlebar - rect.width
  const maxX = window.innerWidth - visibleTitlebar
  const minY = 28
  const maxY = Math.max(minY, window.innerHeight - visibleTitlebar)

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

async function centerWindow() {
  if (!isOrdinaryWindow(activeWindow.value) || compactLayout.value) return
  await nextTick()
  const rect = windowRef.value?.getBoundingClientRect()
  if (!rect) return

  windowPos.value = clampWindowPosition(
    Math.max(8, (window.innerWidth - rect.width) / 2),
    Math.max(34, (window.innerHeight - rect.height) / 2),
    rect,
  )
  restoreWindowPos.value = { ...windowPos.value }
  windowPositioned.value = true
}

async function focusActiveSurface() {
  await nextTick()

  if (activeOverlay.value === 'map') {
    spotlightInput.value?.focus({ preventScroll: true })
  } else if (activeOverlay.value === 'dock') {
    launchpadInput.value?.focus({ preventScroll: true })
  } else if (isOrdinaryWindow(activeWindow.value) && minimizedWindow.value !== activeWindow.value) {
    windowRef.value?.focus({ preventScroll: true })
  }
}

async function openWindow(id) {
  if (!id) return

  if (!isOrdinaryWindow(id)) {
    if (!activeOverlay.value) rememberCurrentFocus(overlayReturnFocus)
    activeOverlay.value = id
    spotlightSelectedIndex.value = 0
    await focusActiveSurface()
    return
  }

  activeOverlay.value = null
  if (activeWindow.value === id && minimizedWindow.value === id) {
    await restoreMinimizedWindow()
    return
  }

  rememberCurrentFocus()
  const changingWindow = activeWindow.value !== id
  if (changingWindow) {
    minimizedWindow.value = null
    windowMaximized.value = false
    windowPositioned.value = false
    windowBodyScrolled.value = false
  }

  activeWindow.value = id
  spotlightSelectedIndex.value = 0

  if (isOrdinaryWindow(id) && !windowPositioned.value) {
    await centerWindow()
  }
  await focusActiveSurface()
}

async function closeWindow() {
  if (activeOverlay.value) {
    activeOverlay.value = null
    await restorePreviousFocus(overlayReturnFocus)
    overlayReturnFocus.value = null
    return
  }

  if (!activeWindow.value) return
  cancelWindowDrag()
  activeWindow.value = null
  minimizedWindow.value = null
  windowMaximized.value = false
  windowPositioned.value = false
  windowBodyScrolled.value = false
  await restorePreviousFocus()
}

async function minimizeWindow() {
  if (!isOrdinaryWindow(activeWindow.value)) return
  isMinimizing.value = true
  minimizedWindow.value = activeWindow.value
  window.clearTimeout(minimizeTimer)
  minimizeTimer = window.setTimeout(() => {
    isMinimizing.value = false
  }, 220)
  await nextTick()
  dockRef.value
    ?.querySelector(`[data-app-id="${activeWindow.value}"]`)
    ?.focus({ preventScroll: true })
}

async function restoreMinimizedWindow() {
  if (!minimizedWindow.value) return
  activeWindow.value = minimizedWindow.value
  minimizedWindow.value = null
  isMinimizing.value = false
  await focusActiveSurface()
}

function toggleMaximizeWindow() {
  if (!isOrdinaryWindow(activeWindow.value) || compactLayout.value) return

  if (windowMaximized.value) {
    windowMaximized.value = false
    windowPos.value = { ...restoreWindowPos.value }
    return
  }

  const rect = windowRef.value?.getBoundingClientRect()
  if (rect) {
    windowPos.value = { x: rect.left, y: rect.top }
    restoreWindowPos.value = { ...windowPos.value }
    windowPositioned.value = true
  }
  windowMaximized.value = true
}

function startWindowDrag(event) {
  if (
    event.button !== 0
    || compactLayout.value
    || windowMaximized.value
    || event.target.closest('.traffic-lights')
  ) return

  const rect = windowRef.value?.getBoundingClientRect()
  if (!rect) return

  cancelWindowDrag()
  windowPos.value = { x: rect.left, y: rect.top }
  windowPositioned.value = true
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    originX: rect.left,
    originY: rect.top,
  }
  dragDelta.value = { x: 0, y: 0 }
  dragging.value = true
  dragPointerId = event.pointerId
  dragCaptureTarget = event.currentTarget
  dragCaptureTarget.setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', moveWindowDrag)
  window.addEventListener('pointerup', endWindowDrag)
  window.addEventListener('pointercancel', endWindowDrag)
}

function moveWindowDrag(event) {
  if (!dragging.value || event.pointerId !== dragPointerId) return
  const rect = windowRef.value?.getBoundingClientRect()
  const proposed = clampWindowPosition(
    dragStart.originX + event.clientX - dragStart.pointerX,
    dragStart.originY + event.clientY - dragStart.pointerY,
    rect
      ? { width: rect.width, height: rect.height }
      : undefined,
  )
  dragDelta.value = {
    x: proposed.x - dragStart.originX,
    y: proposed.y - dragStart.originY,
  }
}

function endWindowDrag(event) {
  if (!dragging.value || event.pointerId !== dragPointerId) return
  const completedPointerId = dragPointerId
  const captureTarget = dragCaptureTarget
  windowPos.value = {
    x: dragStart.originX + dragDelta.value.x,
    y: dragStart.originY + dragDelta.value.y,
  }
  restoreWindowPos.value = { ...windowPos.value }
  dragging.value = false
  dragDelta.value = { x: 0, y: 0 }
  dragPointerId = null
  dragCaptureTarget = null
  removeWindowDragListeners()

  if (captureTarget?.hasPointerCapture(completedPointerId)) {
    captureTarget.releasePointerCapture(completedPointerId)
  }
}

function removeWindowDragListeners() {
  window.removeEventListener('pointermove', moveWindowDrag)
  window.removeEventListener('pointerup', endWindowDrag)
  window.removeEventListener('pointercancel', endWindowDrag)
}

function cancelWindowDrag() {
  const cancelledPointerId = dragPointerId
  const captureTarget = dragCaptureTarget
  dragging.value = false
  dragDelta.value = { x: 0, y: 0 }
  dragPointerId = null
  dragCaptureTarget = null
  removeWindowDragListeners()

  if (
    cancelledPointerId !== null
    && captureTarget?.hasPointerCapture(cancelledPointerId)
  ) {
    captureTarget.releasePointerCapture(cancelledPointerId)
  }
}

function handleViewportResize() {
  updateCompactLayout()
  if (window.innerWidth <= 900) resetDockMagnification()
  if (
    compactLayout.value
    || windowMaximized.value
    || !windowPositioned.value
    || !isOrdinaryWindow(activeWindow.value)
  ) return

  const rect = windowRef.value?.getBoundingClientRect()
  windowPos.value = clampWindowPosition(windowPos.value.x, windowPos.value.y, rect)
}

function trapFocus(event, root) {
  if (event.key !== 'Tab' || !root) return
  const focusable = Array.from(root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none'
      && style.visibility !== 'hidden'
      && element.getClientRects().length > 0
    )
  })

  if (!focusable.length) {
    event.preventDefault()
    root.focus({ preventScroll: true })
    return
  }

  const currentIndex = focusable.indexOf(document.activeElement)
  const direction = event.shiftKey ? -1 : 1
  const nextIndex = currentIndex < 0
    ? (event.shiftKey ? focusable.length - 1 : 0)
    : (currentIndex + direction + focusable.length) % focusable.length

  event.preventDefault()
  focusable[nextIndex].focus()
}

function handleDialogKeydown(event) {
  trapFocus(event, event.currentTarget)
}

function handleWindowBodyScroll(event) {
  windowBodyScrolled.value = event.currentTarget.scrollTop > 0
}

async function activateSpotlightResult(item) {
  if (!item) return
  if (item.external) {
    window.open(item.path, '_blank', 'noopener,noreferrer')
    await closeWindow()
  } else {
    await closeWindow()
    await router.push(item.path)
  }
}

async function revealSelectedSpotlightResult() {
  await nextTick()
  document.querySelector(
    `.spotlight-result[data-result-index="${spotlightSelectedIndex.value}"]`,
  )?.scrollIntoView({ block: 'nearest' })
}

async function handleSpotlightKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    spotlightSelectedIndex.value = Math.min(
      spotlightSelectedIndex.value + 1,
      Math.max(0, spotlightFlatLinks.value.length - 1),
    )
    await revealSelectedSpotlightResult()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    spotlightSelectedIndex.value = Math.max(0, spotlightSelectedIndex.value - 1)
    await revealSelectedSpotlightResult()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    await activateSpotlightResult(spotlightFlatLinks.value[spotlightSelectedIndex.value])
  } else if (event.key === 'Escape') {
    event.preventDefault()
    await closeWindow()
  }
}

function handleGlobalKeydown(event) {
  if (event.defaultPrevented) return
  const commandKey = event.metaKey || event.ctrlKey

  if (commandKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openWindow('map')
  } else if (
    commandKey
    && event.key.toLowerCase() === 'w'
    && (activeWindow.value || activeOverlay.value)
  ) {
    event.preventDefault()
    closeWindow()
  } else if (event.key === 'Escape' && (activeWindow.value || activeOverlay.value)) {
    event.preventDefault()
    closeWindow()
  }
}

function handleDockPointerMove(event) {
  if (
    compactLayout.value
    || window.innerWidth <= 900
    || event.pointerType === 'touch'
    || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return

  window.cancelAnimationFrame(dockAnimationFrame)
  const pointerX = event.clientX
  dockAnimationFrame = window.requestAnimationFrame(() => {
    const dock = dockRef.value
    if (!dock) return
    const dockRect = dock.getBoundingClientRect()

    dock.querySelectorAll('.launcher-item').forEach((item) => {
      const itemCenter = dockRect.left + item.offsetLeft - dock.scrollLeft + item.offsetWidth / 2
      const signedDistance = itemCenter - pointerX
      const distance = Math.abs(signedDistance)
      const radius = 112
      const influence = distance >= radius
        ? 0
        : (Math.cos(Math.PI * distance / radius) + 1) / 2
      const scale = 1 + influence * 0.58
      const direction = Math.sign(signedDistance)
      const horizontalInfluence = Math.min(1, distance / 52)
      item.style.setProperty('--dock-scale', scale.toFixed(3))
      item.style.setProperty(
        '--dock-shift',
        `${direction * influence * horizontalInfluence * 11}px`,
      )
      item.style.setProperty('--dock-lift', `${influence * -24}px`)
    })
  })
}

function resetDockMagnification() {
  window.cancelAnimationFrame(dockAnimationFrame)
  dockRef.value?.querySelectorAll('.launcher-item').forEach((item) => {
    item.style.removeProperty('--dock-scale')
    item.style.removeProperty('--dock-shift')
    item.style.removeProperty('--dock-lift')
  })
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

async function handleWindowAfterEnter() {
  if (activeWindow.value === 'music') await mountPlayer()
  await focusActiveSurface()
}

watch(activeWindow, async (next) => {
  if (next !== 'music') destroyPlayer()
  else await mountPlayer()
})

watch(musicTracks, async () => {
  if (activeWindow.value === 'music') await mountPlayer()
})

watch(spotlightQuery, () => {
  spotlightSelectedIndex.value = 0
})

watch(spotlightFlatLinks, (links) => {
  spotlightSelectedIndex.value = Math.min(
    spotlightSelectedIndex.value,
    Math.max(0, links.length - 1),
  )
})

onMounted(() => {
  loadPortalData()
  updateCompactLayout()
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('resize', handleViewportResize)
  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 30000)
})

onBeforeUnmount(() => {
  destroyPlayer()
  cancelWindowDrag()
  window.clearInterval(clockTimer)
  window.clearTimeout(minimizeTimer)
  window.cancelAnimationFrame(dockAnimationFrame)
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('resize', handleViewportResize)
})
</script>

<template>
  <main
    class="portal-desktop"
    :style="{ '--portal-wallpaper': `url(${wallpaper})` }"
    @pointerdown.self="closeWindow"
  >
    <div class="wallpaper" aria-hidden="true"></div>
    <div class="desktop-vignette" aria-hidden="true"></div>

    <header class="portal-menu-bar" aria-label="Portal menu bar">
      <div class="menu-left">
        <RouterLink to="/" class="menu-home-link" aria-label="Back to home">
          <img src="/favicon_liuyin.svg" alt="" class="menu-brand-icon">
        </RouterLink>
        <strong class="menu-current-app">{{ activeApp?.title ?? 'Finder' }}</strong>
        <nav class="menu-commands" aria-label="Application menus">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </nav>
      </div>

      <div class="menu-right">
        <button
          class="menu-glyph-button"
          type="button"
          :class="{ 'is-active': activeOverlay === 'map' }"
          aria-label="Open Spotlight"
          title="Spotlight (⌘K)"
          @click="openWindow('map')"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.4"></circle>
            <path d="m12.6 12.6 4.1 4.1"></path>
          </svg>
        </button>
        <span
          class="menu-status-glyph control-center-glyph"
          aria-label="Control Center"
          title="Control Center"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5.25h14M3 14.75h14"></path>
            <circle cx="7" cy="5.25" r="2"></circle>
            <circle cx="13" cy="14.75" r="2"></circle>
          </svg>
        </span>
        <span class="menu-status-glyph" aria-label="Wi-Fi connected" title="Wi-Fi">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2.6 7.2a11 11 0 0 1 14.8 0M5.2 10.1a7.1 7.1 0 0 1 9.6 0M8 13a3 3 0 0 1 4 0"></path>
            <circle cx="10" cy="16" r="1"></circle>
          </svg>
        </span>
        <span class="menu-status-glyph battery-glyph" aria-label="Battery charged" title="Battery">
          <svg viewBox="0 0 24 20" aria-hidden="true">
            <rect x="2" y="5" width="18" height="10" rx="2"></rect>
            <path d="M21 8v4"></path>
            <rect class="battery-level" x="4" y="7" width="13.5" height="6" rx="1"></rect>
          </svg>
        </span>
        <span class="menu-clock">{{ menuTime }}</span>
      </div>
    </header>

    <Transition name="window-shell" appear @after-enter="handleWindowAfterEnter">
      <section
        v-if="activeWindowApp"
        v-show="minimizedWindow !== activeWindow"
        :key="activeWindowApp.id"
        ref="windowRef"
        class="mac-window"
        :class="[
          activeWindowApp.windowClass,
          {
            'is-positioned': windowPositioned && !compactLayout,
            'is-maximized': windowMaximized,
            'is-dragging': dragging,
            'is-minimizing': isMinimizing,
          },
        ]"
        :style="windowStyle"
        :aria-label="activeWindowApp.title"
        role="dialog"
        :aria-modal="activeOverlay ? 'false' : 'true'"
        :aria-hidden="activeOverlay ? 'true' : undefined"
        :inert="Boolean(activeOverlay)"
        tabindex="-1"
        @pointerdown.stop
        @keydown="handleDialogKeydown"
      >
        <div
          class="window-titlebar"
          :class="{ 'has-scrolled-divider': windowBodyScrolled }"
          @pointerdown="startWindowDrag"
          @lostpointercapture="endWindowDrag"
          @dblclick="toggleMaximizeWindow"
        >
          <div class="traffic-lights" aria-label="Window controls" @pointerdown.stop>
            <button
              class="traffic-light close"
              type="button"
              aria-label="Close window"
              @pointerdown.stop
              @click.stop="closeWindow"
            ></button>
            <button
              class="traffic-light minimize"
              type="button"
              aria-label="Minimize window"
              @pointerdown.stop
              @click.stop="minimizeWindow"
            ></button>
            <button
              class="traffic-light zoom"
              type="button"
              :aria-label="windowMaximized ? 'Restore window' : 'Maximize window'"
              @pointerdown.stop
              @click.stop="toggleMaximizeWindow"
            ></button>
          </div>
          <div class="window-title">
            <img
              :src="activeWindowApp.icon"
              alt=""
              @error="handleIconError($event, activeWindowApp.title)"
            >
            <span>{{ activeWindowApp.title }}</span>
          </div>
        </div>

        <div class="window-body" @scroll.passive="handleWindowBodyScroll">
          <div v-if="dataError" class="portal-error" role="alert">{{ dataError }}</div>

          <section v-if="activeWindow === 'music'" class="mac-app-content music-app">
            <div v-if="loadingData" class="portal-loading" role="status">Loading music library...</div>
            <div v-else ref="aplayerContainer" class="aplayer-mount"></div>
          </section>

          <section v-else-if="activeWindow === 'weather'" class="mac-app-content widget-shell weather-shell">
            <Weather class="portal-widget weather-widget" />
          </section>

          <section v-else-if="activeWindow === 'calendar'" class="mac-app-content widget-shell calendar-shell">
            <Calendar class="portal-widget calendar-widget" />
          </section>

          <section v-else-if="activeWindow === 'todo'" class="mac-app-content widget-shell todo-shell">
            <ToDoList class="portal-widget todo-widget" />
          </section>
        </div>
      </section>
    </Transition>

    <Transition name="spotlight-shell" appear>
      <div
        v-if="activeOverlay === 'map'"
        class="spotlight-overlay"
        @pointerdown.self="closeWindow"
      >
        <section
          class="spotlight-panel"
          aria-label="Spotlight"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @pointerdown.stop
          @keydown="handleDialogKeydown"
        >
          <label class="spotlight-search">
            <span class="spotlight-magnifier" aria-hidden="true"></span>
            <input
              ref="spotlightInput"
              v-model="spotlightQuery"
              class="spotlight-input"
              type="search"
              role="combobox"
              autocomplete="off"
              placeholder="Spotlight Search"
              aria-label="Search LiuYinChu's Space"
              aria-autocomplete="list"
              aria-controls="portal-spotlight-results"
              aria-expanded="true"
              :aria-activedescendant="spotlightFlatLinks.length
                ? `spotlight-result-${spotlightSelectedIndex}`
                : undefined"
              @keydown="handleSpotlightKeydown"
            >
          </label>

          <div
            id="portal-spotlight-results"
            class="spotlight-results"
            role="listbox"
            aria-label="Site search results"
          >
            <section
              v-for="(group, groupIndex) in spotlightGroups"
              :key="group.category"
              class="spotlight-group"
              role="group"
              :aria-labelledby="`spotlight-group-${groupIndex}`"
            >
              <h2 :id="`spotlight-group-${groupIndex}`">{{ group.category }}</h2>
              <button
                v-for="link in group.items"
                :key="`${link.external ? 'external' : 'internal'}-${link.path}`"
                :id="`spotlight-result-${link.resultIndex}`"
                class="spotlight-result"
                :class="{ 'is-selected': spotlightSelectedIndex === link.resultIndex }"
                :data-result-index="link.resultIndex"
                type="button"
                role="option"
                tabindex="-1"
                :aria-selected="spotlightSelectedIndex === link.resultIndex"
                @mouseenter="spotlightSelectedIndex = link.resultIndex"
                @click="activateSpotlightResult(link)"
              >
                <span class="spotlight-result-icon" aria-hidden="true">
                  <svg v-if="link.external" viewBox="0 0 20 20">
                    <path d="M8 4H4.8A1.8 1.8 0 0 0 3 5.8v9.4A1.8 1.8 0 0 0 4.8 17h9.4a1.8 1.8 0 0 0 1.8-1.8V12"></path>
                    <path d="M11 3h6v6M17 3l-8 8"></path>
                  </svg>
                  <svg v-else viewBox="0 0 20 20">
                    <path d="M5 2.8h6l4 4v10.4H5z"></path>
                    <path d="M11 2.8v4h4M7.5 11h5M7.5 14h5"></path>
                  </svg>
                </span>
                <span class="spotlight-result-copy">
                  <strong>{{ link.name }}</strong>
                  <small>{{ link.hint }}</small>
                </span>
                <span class="spotlight-result-category">{{ link.category }}</span>
              </button>
            </section>
            <p v-if="!spotlightFlatLinks.length" class="spotlight-empty" role="status">
              没有找到对应入口
            </p>
          </div>
        </section>
      </div>
    </Transition>

    <Transition name="launchpad-shell" appear>
      <div
        v-if="activeOverlay === 'dock'"
        class="launchpad-overlay"
        @click.self="closeWindow"
      >
        <section
          class="launchpad-panel"
          aria-label="Launchpad"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @click.self="closeWindow"
          @keydown="handleDialogKeydown"
        >
          <button class="launchpad-close" type="button" aria-label="Close Launchpad" @click="closeWindow">
            ×
          </button>
          <label class="launchpad-search">
            <span class="spotlight-magnifier" aria-hidden="true"></span>
            <input
              ref="launchpadInput"
              v-model="launchpadQuery"
              type="search"
              autocomplete="off"
              placeholder="Search"
              aria-label="Search Launchpad"
            >
          </label>

          <div v-if="dataError" class="portal-error" role="alert">{{ dataError }}</div>
          <div v-else-if="loadingData" class="portal-loading" role="status">Loading Launchpad...</div>
          <div v-else class="launchpad-groups" @click.self="closeWindow">
            <section
              v-for="group in filteredDockGroups"
              :key="group.name"
              class="link-group"
              @click.self="closeWindow"
            >
              <h2>{{ group.name }}</h2>
              <div class="launchpad-grid" @click.self="closeWindow">
                <a
                  v-for="site in group.links"
                  :key="site.url"
                  :href="site.url"
                  class="launchpad-tile"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="closeWindow"
                >
                  <img
                    :src="iconForUrl(site.url)"
                    alt=""
                    @error="handleIconError($event, site.name)"
                  >
                  <span>{{ site.name }}</span>
                </a>
              </div>
            </section>
            <p v-if="!filteredDockGroups.length" class="launchpad-empty" role="status">
              No matching applications
            </p>
          </div>
        </section>
      </div>
    </Transition>

    <nav
      ref="dockRef"
      class="bottom-launcher"
      aria-label="Portal Dock"
      tabindex="-1"
      @pointerdown.stop
      @pointermove="handleDockPointerMove"
      @pointerleave="resetDockMagnification"
      @pointercancel="resetDockMagnification"
    >
      <button
        v-for="app in dockWindowApps"
        :key="app.id"
        class="launcher-item"
        type="button"
        :data-app-id="app.id"
        :class="{
          'is-active': isOrdinaryWindow(app.id)
            ? activeWindow === app.id && minimizedWindow !== app.id
            : activeOverlay === app.id,
          'is-running': isOrdinaryWindow(app.id)
            ? activeWindow === app.id || minimizedWindow === app.id
            : activeOverlay === app.id,
        }"
        :aria-label="`Open ${app.label}`"
        @click="openWindow(app.id)"
      >
        <img
          :src="app.icon"
          alt=""
          @error="handleIconError($event, app.label)"
        >
        <span class="launcher-tooltip">{{ app.label }}</span>
      </button>

      <span class="launcher-divider" aria-hidden="true"></span>

      <a
        v-for="site in quickLinks"
        :key="site.url"
        :href="site.url"
        target="_blank"
        rel="noopener noreferrer"
        class="launcher-item"
        :aria-label="site.name"
      >
        <img
          :src="iconForUrl(site.url)"
          alt=""
          @error="handleIconError($event, site.name)"
        >
        <span class="launcher-tooltip">{{ site.name }}</span>
      </a>

      <template v-if="minimizedApp">
        <span class="launcher-divider" aria-hidden="true"></span>
        <button
          class="launcher-item minimized-window-preview"
          type="button"
          :aria-label="`Restore ${minimizedApp.title}`"
          @click="restoreMinimizedWindow"
        >
          <img
            :src="minimizedApp.icon"
            alt=""
            @error="handleIconError($event, minimizedApp.title)"
          >
          <span class="launcher-tooltip">Restore {{ minimizedApp.title }}</span>
        </button>
      </template>
    </nav>
  </main>
</template>

<style scoped>
.portal-desktop {
  --portal-material-menu: rgba(30, 30, 34, 0.72);
  --portal-material-window: rgba(36, 36, 40, 0.78);
  --portal-material-dock: rgba(40, 40, 44, 0.45);
  --portal-material-blur: saturate(180%) blur(24px);
  --portal-hairline: rgba(255, 255, 255, 0.09);
  --portal-stroke-outer: rgba(0, 0, 0, 0.35);
  --portal-text-primary: rgba(255, 255, 255, 0.92);
  --portal-text-secondary: rgba(255, 255, 255, 0.62);
  --portal-text-tertiary: rgba(255, 255, 255, 0.42);
  --portal-text-accent: #0a84ff;
  --portal-shadow-window:
    0 0 0 0.5px var(--portal-stroke-outer),
    0 22px 70px rgba(0, 0, 0, 0.38),
    0 4px 18px rgba(0, 0, 0, 0.22);
  --portal-radius-window: 10px;
  --portal-radius-control: 7px;
  --portal-radius-icon: 22.5%;
  --portal-fw-regular: 400;
  --portal-fw-medium: 500;
  --portal-fw-semibold: 600;
  --portal-text: var(--portal-text-primary);
  --portal-muted: var(--portal-text-secondary);

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
  font-weight: var(--portal-fw-medium);
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
  font-weight: var(--portal-fw-semibold);
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

.window-music .window-body {
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

.aplayer-mount {
  min-height: 0;
}

:deep(.aplayer) {
  margin: 0;
  border: 1px solid var(--portal-hairline);
  border-radius: 1.2rem;
  color: #cdd6f4;
  background: linear-gradient(145deg, rgba(62, 74, 103, 0.66), rgba(23, 30, 48, 0.58));
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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
  font-weight: var(--portal-fw-medium);
  outline: none;
}

.spotlight-input::placeholder {
  color: rgba(245, 246, 255, 0.56);
}

.spotlight-results {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--portal-hairline);
  border-radius: 1.08rem;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
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

.spotlight-empty {
  margin: 0;
  padding: 1.2rem 1rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.86rem;
  text-align: center;
}

.link-group {
  display: grid;
  gap: 1rem;
}

.link-group h2 {
  margin: 0;
  color: var(--group-accent, #b4befe);
  font-size: 0.86rem;
  font-weight: var(--portal-fw-semibold);
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
  font-weight: var(--portal-fw-medium);
  line-height: 1.25;
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
  font-weight: var(--portal-fw-medium);
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease;
}

.launcher-item:hover,
.launcher-item:focus-visible {
  outline: none;
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

  .menu-home-link {
    width: 2.75rem;
    min-width: 2.75rem;
    height: 2.75rem;
    padding: 0;
  }

  .menu-brand-icon {
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

  .launcher-item img {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.68rem;
  }

  .launcher-divider {
    height: 2.45rem;
  }
}

/* macOS material pass */
.portal-menu-bar {
  height: 26px;
  padding: 0 10px;
  color: var(--portal-text-primary);
  background: var(--portal-material-menu);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.14);
  -webkit-backdrop-filter: var(--portal-material-blur);
  backdrop-filter: var(--portal-material-blur);
}

.menu-left,
.menu-right {
  gap: 4px;
}

.menu-brand-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.menu-home-link,
.menu-glyph-button {
  display: inline-flex;
  width: 24px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  color: var(--portal-text-primary);
  background: transparent;
  cursor: pointer;
  transition: background-color 120ms ease;
}

.menu-home-link:hover,
.menu-glyph-button:hover,
.menu-glyph-button.is-active {
  background: rgba(255, 255, 255, 0.12);
}

.menu-current-app {
  margin: 0 6px 0 2px;
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-semibold);
  white-space: nowrap;
}

.menu-commands {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-regular);
}

.menu-commands span {
  padding: 2px 7px;
  border-radius: 5px;
}

.menu-commands span:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-glyph-button svg,
.menu-status-glyph svg {
  width: 17px;
  height: 17px;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.55;
}

.menu-status-glyph {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  color: var(--portal-text-primary);
}

.battery-glyph {
  width: 26px;
}

.battery-glyph svg {
  width: 22px;
}

.battery-level {
  fill: currentColor;
  stroke: none;
}

.menu-clock {
  margin-left: 3px;
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-regular);
}

.mac-window {
  width: min(920px, calc(100vw - 48px));
  max-height: min(690px, calc(100dvh - 118px));
  min-height: 24rem;
  overflow: hidden;
  border: 0.5px solid var(--portal-hairline);
  border-radius: var(--portal-radius-window);
  color: var(--portal-text-primary);
  background: var(--portal-material-window);
  box-shadow: var(--portal-shadow-window);
  -webkit-backdrop-filter: var(--portal-material-blur);
  backdrop-filter: var(--portal-material-blur);
  transform-origin: center center;
  will-change: transform, opacity;
}

.mac-window.is-positioned {
  transform: none;
}

.mac-window.is-maximized {
  border-radius: var(--portal-radius-window);
}

.mac-window.is-dragging {
  user-select: none;
  transition: none !important;
}

.window-music {
  width: min(780px, calc(100vw - 48px));
}

.window-weather {
  width: min(560px, calc(100vw - 48px));
}

.window-calendar {
  width: min(600px, calc(100vw - 48px));
}

.window-todo {
  width: min(690px, calc(100vw - 48px));
}

.window-titlebar {
  grid-template-columns: 72px minmax(0, 1fr) 72px;
  min-height: 31px;
  padding: 0 10px;
  background: transparent;
  border-bottom: 0.5px solid transparent;
  cursor: grab;
  touch-action: none;
  transition: border-color 120ms ease;
}

.window-titlebar.has-scrolled-divider {
  border-bottom-color: var(--portal-hairline);
}

.window-titlebar:active {
  cursor: grabbing;
}

.traffic-lights {
  gap: 8px;
}

.traffic-light {
  position: relative;
  width: 12px;
  height: 12px;
  overflow: hidden;
  cursor: default;
}

.traffic-light.close {
  background: #ff5f57;
}

.traffic-light.minimize {
  background: #febc2e;
}

.traffic-light.zoom {
  background: #28c840;
}

.traffic-light::after {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(55, 33, 30, 0.82);
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: var(--portal-fw-semibold);
  line-height: 12px;
  opacity: 0;
  transition: opacity 90ms ease;
}

.traffic-light.close::after {
  content: '×';
}

.traffic-light.minimize::after {
  content: '−';
  padding-bottom: 2px;
}

.traffic-light.zoom::after {
  content: '+';
  color: rgba(18, 65, 33, 0.86);
}

.traffic-lights:hover .traffic-light::after,
.traffic-light:focus-visible::after {
  opacity: 1;
}

.window-title {
  gap: 6px;
  color: var(--portal-text-secondary);
  font-size: 13px;
  font-weight: var(--portal-fw-medium);
}

.window-title img {
  width: 16px;
  height: 16px;
  border-radius: var(--portal-radius-icon);
  object-fit: cover;
}

.window-body {
  padding: 14px;
  scrollbar-color: rgba(255, 255, 255, 0.26) transparent;
  scrollbar-width: thin;
}

.window-body::-webkit-scrollbar,
.spotlight-results::-webkit-scrollbar,
.launchpad-panel::-webkit-scrollbar,
:deep(.aplayer-list::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.window-body::-webkit-scrollbar-track,
.spotlight-results::-webkit-scrollbar-track,
.launchpad-panel::-webkit-scrollbar-track,
:deep(.aplayer-list::-webkit-scrollbar-track) {
  background: transparent;
}

.window-body::-webkit-scrollbar-thumb,
.spotlight-results::-webkit-scrollbar-thumb,
.launchpad-panel::-webkit-scrollbar-thumb,
:deep(.aplayer-list::-webkit-scrollbar-thumb) {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
  background-clip: padding-box;
}

.window-music .window-body {
  background: transparent;
}

.mac-app-content {
  gap: 10px;
}

.music-app {
  gap: 10px;
}

:deep(.aplayer) {
  margin: 0;
  overflow: hidden;
  border: 0.5px solid var(--portal-hairline);
  border-radius: var(--portal-radius-control);
  color: #f5f5f7;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: none;
}

:deep(.aplayer-list) {
  background: rgba(0, 0, 0, 0.14);
}

:deep(.aplayer-pic) {
  border-radius: 0;
  box-shadow: none;
}

:deep(.aplayer-list ol li) {
  border-top-color: var(--portal-hairline);
  color: var(--portal-text-secondary);
  background: transparent;
}

:deep(.aplayer-list ol li:hover),
:deep(.aplayer-list-light) {
  color: var(--portal-text-primary) !important;
  background: rgba(10, 132, 255, 0.22) !important;
  box-shadow: none;
}

:deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-bar),
:deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgba(0, 0, 0, 0.28);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.todo-list-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.widget-shell :deep(.todo-container) {
  border: 0.5px solid var(--portal-hairline);
  border-radius: var(--portal-radius-control);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: none;
}

.portal-loading,
.portal-error {
  color: var(--portal-text-secondary);
  font-weight: var(--portal-fw-regular);
}

.portal-error {
  color: #ff9f9a;
}

.window-shell-enter-active,
.window-shell-leave-active {
  transition:
    opacity 180ms cubic-bezier(0.32, 0.72, 0, 1),
    transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
}

.mac-window.window-shell-enter-from,
.mac-window.window-shell-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.92);
}

.mac-window.is-positioned.window-shell-enter-from,
.mac-window.is-positioned.window-shell-leave-to {
  transform: scale(0.92);
}

.mac-window.is-positioned.is-minimizing.window-shell-leave-to {
  opacity: 0;
  transform: translate3d(0, 52vh, 0) scale(0.18);
}

.spotlight-overlay,
.launchpad-overlay {
  position: absolute;
  inset: 0;
}

.spotlight-overlay {
  z-index: 40;
  background: rgba(0, 0, 0, 0.08);
}

.spotlight-panel {
  position: absolute;
  top: 24%;
  left: 50%;
  display: grid;
  width: min(680px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 150px));
  overflow: hidden;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 14px;
  color: var(--portal-text-primary);
  background: rgba(38, 38, 42, 0.82);
  box-shadow: var(--portal-shadow-window);
  transform: translateX(-50%);
  -webkit-backdrop-filter: saturate(180%) blur(34px);
  backdrop-filter: saturate(180%) blur(34px);
}

.spotlight-search {
  min-height: 64px;
  padding: 0 18px;
  border: 0;
  border-radius: 0;
  border-bottom: 0.5px solid var(--portal-hairline);
  background: rgba(0, 0, 0, 0.12);
  box-shadow: none;
}

.spotlight-magnifier::before {
  border-color: var(--portal-text-secondary);
}

.spotlight-magnifier::after {
  background: var(--portal-text-secondary);
}

.spotlight-input {
  color: var(--portal-text-primary);
  font-size: clamp(20px, 3vw, 24px);
  font-weight: var(--portal-fw-regular);
}

.spotlight-input::placeholder {
  color: var(--portal-text-tertiary);
}

.spotlight-results {
  max-height: 420px;
  overflow-y: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.spotlight-group {
  display: grid;
}

.spotlight-group + .spotlight-group {
  border-top: 0.5px solid var(--portal-hairline);
}

.spotlight-group h2 {
  margin: 0;
  padding: 9px 14px 5px;
  color: var(--portal-text-tertiary);
  font-size: 11px;
  font-weight: var(--portal-fw-medium);
  letter-spacing: 0;
  text-transform: none;
}

.spotlight-result {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  width: 100%;
  min-height: 50px;
  padding: 6px 14px;
  border: 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.055);
  border-radius: 0;
  color: var(--portal-text-primary);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: default;
  box-shadow: none;
}

.spotlight-result:hover,
.spotlight-result:focus-visible,
.spotlight-result.is-selected {
  background: rgba(10, 132, 255, 0.34);
  box-shadow: none;
}

.spotlight-result-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 7px;
  color: var(--portal-text-secondary);
  background: rgba(255, 255, 255, 0.07);
}

.spotlight-result-icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.spotlight-result-copy {
  gap: 1px;
}

.spotlight-result-copy strong {
  color: var(--portal-text-primary);
  font-size: 14px;
  font-weight: var(--portal-fw-medium);
}

.spotlight-result-copy small {
  color: var(--portal-text-secondary);
  font-size: 12px;
}

.spotlight-result-category {
  max-width: 130px;
  overflow: hidden;
  color: var(--portal-text-tertiary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotlight-empty {
  color: var(--portal-text-secondary);
}

.spotlight-shell-enter-active,
.spotlight-shell-leave-active {
  transition: opacity 160ms ease;
}

.spotlight-shell-enter-active .spotlight-panel,
.spotlight-shell-leave-active .spotlight-panel {
  transition: transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
}

.spotlight-shell-enter-from,
.spotlight-shell-leave-to {
  opacity: 0;
}

.spotlight-shell-enter-from .spotlight-panel,
.spotlight-shell-leave-to .spotlight-panel {
  transform: translateX(-50%) scale(0.96);
}

.launchpad-overlay {
  z-index: 34;
  overflow: hidden;
  color: var(--portal-text-primary);
  background: rgba(12, 12, 16, 0.34);
  -webkit-backdrop-filter: blur(36px) brightness(0.62) saturate(135%);
  backdrop-filter: blur(36px) brightness(0.62) saturate(135%);
}

.launchpad-panel {
  position: absolute;
  inset: 26px 0 0;
  overflow-y: auto;
  padding: 44px clamp(32px, 7vw, 110px) 118px;
}

.launchpad-close {
  position: fixed;
  top: 38px;
  right: 24px;
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 50%;
  color: var(--portal-text-secondary);
  background: rgba(0, 0, 0, 0.24);
  font: inherit;
  font-size: 20px;
  cursor: pointer;
}

.launchpad-search {
  display: grid;
  grid-template-columns: auto 1fr;
  width: min(280px, 72vw);
  min-height: 32px;
  align-items: center;
  gap: 8px;
  margin: 0 auto 38px;
  padding: 0 10px;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
}

.launchpad-search .spotlight-magnifier {
  width: 15px;
  height: 15px;
  transform: scale(0.78);
}

.launchpad-search input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  color: var(--portal-text-primary);
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: var(--portal-fw-regular);
  outline: none;
}

.launchpad-search input::placeholder {
  color: var(--portal-text-tertiary);
}

.launchpad-groups {
  display: grid;
  gap: 34px;
  max-width: 1180px;
  margin: 0 auto;
}

.link-group {
  gap: 16px;
}

.link-group h2 {
  color: var(--portal-text-secondary);
  font-size: 13px;
  font-weight: var(--portal-fw-medium);
  letter-spacing: 0;
  text-transform: none;
}

.launchpad-grid {
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 28px 18px;
}

.launchpad-tile {
  min-height: 92px;
  gap: 8px;
  padding: 0;
  border-radius: 10px;
  color: var(--portal-text-primary);
  background: transparent;
  transition: transform 160ms ease;
}

.launchpad-tile:hover,
.launchpad-tile:focus-visible {
  background: transparent;
  transform: scale(1.06);
}

.launchpad-tile img {
  width: 68px;
  height: 68px;
  border-radius: var(--portal-radius-icon);
  object-fit: cover;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
}

.launchpad-tile span {
  color: var(--portal-text-primary);
  font-size: 12px;
  font-weight: var(--portal-fw-regular);
}

.launchpad-empty {
  margin: 8vh 0 0;
  color: var(--portal-text-secondary);
  text-align: center;
}

.launchpad-shell-enter-active,
.launchpad-shell-leave-active {
  transition: opacity 180ms ease;
}

.launchpad-shell-enter-active .launchpad-panel,
.launchpad-shell-leave-active .launchpad-panel {
  transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
}

.launchpad-shell-enter-from,
.launchpad-shell-leave-to {
  opacity: 0;
}

.launchpad-shell-enter-from .launchpad-panel,
.launchpad-shell-leave-to .launchpad-panel {
  transform: scale(1.08);
}

.bottom-launcher {
  bottom: max(12px, env(safe-area-inset-bottom));
  gap: 4px;
  min-height: 64px;
  padding: 7px 9px 5px;
  overflow: visible;
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  background: var(--portal-material-dock);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.18),
    0 16px 46px rgba(0, 0, 0, 0.28);
  -webkit-backdrop-filter: saturate(180%) blur(30px);
  backdrop-filter: saturate(180%) blur(30px);
}

.launcher-item {
  --dock-scale: 1;
  --dock-shift: 0px;
  --dock-lift: 0px;
  display: flex;
  width: 52px;
  height: 56px;
  align-items: end;
  justify-content: center;
  overflow: visible;
  color: var(--portal-text-primary);
  transform:
    translateX(var(--dock-shift))
    translateY(var(--dock-lift));
  transition: transform 90ms linear;
  will-change: transform;
}

.launcher-item:hover,
.launcher-item:focus-visible {
  z-index: 2;
  outline: none;
}

.launcher-item img {
  width: 48px;
  height: 48px;
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--portal-radius-icon);
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.27);
  transform: scale(var(--dock-scale));
  transform-origin: center bottom;
  transition: transform 90ms linear;
  will-change: transform;
}

.launcher-tooltip {
  position: absolute;
  bottom: calc(100% + 16px);
  left: 50%;
  display: block;
  max-width: 150px;
  padding: 5px 9px;
  overflow: visible;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 6px;
  color: var(--portal-text-primary);
  background: rgba(36, 36, 40, 0.86);
  font-size: 12px;
  font-weight: var(--portal-fw-regular);
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 5px);
  transition: opacity 120ms ease, transform 120ms ease;
  white-space: nowrap;
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.launcher-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 7px;
  height: 7px;
  border-right: 0.5px solid var(--portal-hairline);
  border-bottom: 0.5px solid var(--portal-hairline);
  background: rgba(36, 36, 40, 0.86);
  transform: translate(-50%, -4px) rotate(45deg);
}

.launcher-item:hover .launcher-tooltip,
.launcher-item:focus-visible .launcher-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.launcher-item.is-running::after {
  content: '';
  position: absolute;
  bottom: -1px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
}

.launcher-item.is-active::after {
  bottom: -1px;
  width: 4px;
  height: 4px;
}

.launcher-divider {
  height: 48px;
  margin: 0 3px;
  background: rgba(255, 255, 255, 0.18);
}

.minimized-window-preview img {
  border-radius: 7px;
  filter: saturate(0.76) brightness(0.92);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.18),
    0 8px 20px rgba(0, 0, 0, 0.32);
}

.portal-desktop :is(
  .menu-home-link,
  .menu-glyph-button,
  .traffic-light,
  .spotlight-input,
  .spotlight-result,
  .launchpad-close,
  .launchpad-search input,
  .launchpad-tile,
  .launcher-item,
  .mac-window
):focus-visible {
  outline: 2px solid var(--portal-text-accent);
  outline-offset: 2px;
}

@media (max-width: 1100px) and (min-width: 701px) {
  .launchpad-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .menu-commands {
    display: none;
  }

  .menu-clock {
    display: inline;
  }

  .menu-current-app {
    margin-right: 2px;
  }

  .bottom-launcher {
    max-width: calc(100vw - 20px);
    overflow-x: auto;
    overflow-y: hidden;
  }

  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    transform: none !important;
  }

  .launcher-item img {
    transform: none !important;
  }

  .launcher-tooltip {
    display: none;
  }
}

@media (max-width: 700px), (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .portal-menu-bar {
    height: calc(44px + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 8px 0;
  }

  .menu-home-link,
  .menu-glyph-button {
    width: 34px;
    height: 34px;
  }

  .menu-current-app {
    max-width: 104px;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
  }

  .menu-status-glyph,
  .battery-glyph {
    display: none;
  }

  .menu-clock {
    font-size: 11px;
  }

  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    top: calc(44px + env(safe-area-inset-top) + 6px) !important;
    right: 8px !important;
    bottom: calc(66px + max(8px, env(safe-area-inset-bottom))) !important;
    left: 8px !important;
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    min-height: 0;
    transform: none !important;
  }

  .window-titlebar {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    min-height: 36px;
    padding: 0 8px;
    cursor: default;
  }

  .traffic-light.minimize,
  .traffic-light.zoom {
    display: none;
  }

  .traffic-light.close {
    width: 28px;
    height: 28px;
    margin-left: -6px;
    background: transparent;
  }

  .traffic-light.close::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #ff5f57;
  }

  .traffic-light.close::after {
    color: rgba(55, 33, 30, 0.82);
    line-height: 28px;
  }

  .window-body {
    padding: 10px;
  }

  .spotlight-overlay {
    background: rgba(0, 0, 0, 0.24);
  }

  .spotlight-panel {
    top: calc(44px + env(safe-area-inset-top) + 8px);
    right: 8px;
    bottom: calc(66px + max(8px, env(safe-area-inset-bottom)));
    left: 8px;
    width: auto;
    max-height: none;
    transform: none;
  }

  .spotlight-search {
    min-height: 54px;
    padding: 0 14px;
  }

  .spotlight-input {
    font-size: 19px;
  }

  .spotlight-result {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .spotlight-result-category {
    display: none;
  }

  .spotlight-shell-enter-from .spotlight-panel,
  .spotlight-shell-leave-to .spotlight-panel {
    transform: scale(0.97);
  }

  .launchpad-panel {
    inset: calc(44px + env(safe-area-inset-top)) 0 0;
    padding: 36px 18px 88px;
  }

  .launchpad-close {
    top: calc(52px + env(safe-area-inset-top));
    right: 12px;
  }

  .launchpad-search {
    margin-bottom: 28px;
  }

  .launchpad-groups {
    gap: 28px;
  }

  .launchpad-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px 10px;
  }

  .launchpad-tile img {
    width: 58px;
    height: 58px;
  }

  .bottom-launcher {
    bottom: max(8px, env(safe-area-inset-bottom));
    min-height: 52px;
    padding: 5px 7px 3px;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    width: 44px;
    height: 44px;
    min-height: 44px;
    transform: none !important;
  }

  .launcher-item img {
    width: 38px;
    height: 38px;
    transform: none !important;
  }

  .launcher-tooltip {
    display: none;
  }

  .launcher-divider {
    height: 38px;
  }
}

@media (max-width: 480px) {
  .menu-clock {
    display: none;
  }

  .launchpad-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (hover: none), (pointer: coarse) {
  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    transform: none !important;
  }

  .launcher-item img {
    transform: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .portal-menu-bar,
  .mac-window,
  .spotlight-panel,
  .bottom-launcher,
  .launchpad-overlay,
  .launcher-tooltip {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .portal-menu-bar {
    background: rgb(38, 38, 42);
  }

  .mac-window,
  .spotlight-panel {
    background: rgb(43, 43, 47);
  }

  .bottom-launcher {
    background: rgb(52, 52, 56);
  }

  .launchpad-overlay {
    background: rgb(25, 25, 29);
  }

  .launcher-tooltip,
  .launcher-tooltip::after {
    background: rgb(36, 36, 40);
  }
}

@media (prefers-reduced-motion: reduce) {
  .window-shell-enter-active,
  .window-shell-leave-active,
  .spotlight-shell-enter-active,
  .spotlight-shell-leave-active,
  .spotlight-shell-enter-active .spotlight-panel,
  .spotlight-shell-leave-active .spotlight-panel,
  .launchpad-shell-enter-active,
  .launchpad-shell-leave-active,
  .launchpad-shell-enter-active .launchpad-panel,
  .launchpad-shell-leave-active .launchpad-panel,
  .launcher-item,
  .launcher-item img,
  .launcher-tooltip,
  .menu-glyph-button,
  .spotlight-result,
  .launchpad-tile {
    animation: none !important;
    transition: none !important;
  }

  .mac-window.window-shell-enter-from,
  .mac-window.window-shell-leave-to,
  .mac-window.is-positioned.window-shell-enter-from,
  .mac-window.is-positioned.window-shell-leave-to,
  .mac-window.is-positioned.is-minimizing.window-shell-leave-to,
  .spotlight-shell-enter-from .spotlight-panel,
  .spotlight-shell-leave-to .spotlight-panel,
  .launchpad-shell-enter-from .launchpad-panel,
  .launchpad-shell-leave-to .launchpad-panel {
    transform: none !important;
  }
}
</style>
