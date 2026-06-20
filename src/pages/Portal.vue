<script setup>
import APlayer from 'aplayer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue'
import Weather from '../components/Weather.vue'

const wallpaper = '/bg/Firefly_Paper_Airplane.png'
const bootMessage = 'Wishing your day stays bright —— like sunshine that chose to stay just for you.'

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
    title: 'Site Map',
    icon: '/favicon_liuyin.svg',
    windowClass: 'window-map',
  },
  {
    id: 'dock',
    label: 'Dock',
    title: 'Dock',
    icon: 'https://www.google.com/s2/favicons?sz=128&domain_url=https://github.com/',
    windowClass: 'window-dock',
  },
]

const quickLinks = [
  { name: 'ChatGPT', url: 'https://chat.openai.com/' },
  { name: 'Claude', url: 'https://claude.ai/' },
  { name: 'GitHub', url: 'https://github.com/' },
  { name: 'Google', url: 'https://www.google.com/' },
  { name: 'Translate', url: 'https://translate.google.com/' },
  { name: 'Gmail', url: 'https://mail.google.com/' },
  { name: 'Drive', url: 'https://drive.google.com/drive/home' },
]

const siteMapSections = [
  {
    title: 'Jottings',
    description: '随记、开放空间与日常记录。',
    links: [
      { name: '随记', path: '/space1' },
      { name: '网络邻居', path: '/space2' },
    ],
  },
  {
    title: 'Resources',
    description: '文献、编程、计算机、资料、工具与文件。',
    links: [
      { name: '资源链接', path: '/rd' },
      { name: '文献', path: '/rliterature' },
      { name: '编程', path: '/rprogramming' },
      { name: '计算机', path: '/rcs' },
      { name: '资料', path: '/rmaterials' },
      { name: '工具', path: '/rtools' },
      { name: '文件', path: '/rfiles' },
    ],
  },
  {
    title: 'Code',
    description: '代码、项目与实验报告入口。',
    links: [
      { name: '代码与项目', path: '/code' },
      { name: '实验报告', path: '/labreport' },
    ],
  },
  {
    title: 'About',
    description: '自我介绍、学术主页、版权与说明。',
    links: [
      { name: '关于', path: '/about' },
      { name: '我的学术', path: '/research' },
      { name: '个人学术简历', path: '/academic' },
      { name: '版权说明', path: '/credit' },
    ],
  },
]

const activeWindow = ref(null)
const now = ref(new Date())
const dockGroups = ref([])
const musicTracks = ref([])
const aplayerContainer = ref(null)
const loadingData = ref(true)
const dataError = ref('')
const isBooting = ref(true)
let clockTimer
let bootTimer
let player

const allWindowApps = computed(() => [...topApps, ...bottomApps])
const activeApp = computed(() => allWindowApps.value.find((app) => app.id === activeWindow.value))
const rightTopApps = computed(() => topApps.filter((app) => app.align === 'right'))
const todoApp = computed(() => topApps.find((app) => app.id === 'todo'))

const menuTime = computed(() => (
  now.value.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  + ' '
  + now.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
))

function iconForUrl(url, size = 96) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(url)}`
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

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  bootTimer = window.setTimeout(() => {
    isBooting.value = false
  }, reduceMotion ? 250 : 3200)
})

onBeforeUnmount(() => {
  destroyPlayer()
  window.clearInterval(clockTimer)
  window.clearTimeout(bootTimer)
})
</script>

<template>
  <main class="portal-desktop" :style="{ '--portal-wallpaper': `url(${wallpaper})` }">
    <div class="wallpaper" aria-hidden="true"></div>
    <div class="desktop-vignette" aria-hidden="true"></div>

    <Transition name="boot">
      <section v-if="isBooting" class="boot-screen" aria-label="Portal loading">
        <p class="boot-handwriting">{{ bootMessage }}</p>
      </section>
    </Transition>

    <header class="portal-menu-bar" aria-label="Portal menu bar">
      <div class="menu-left">
        <button
          v-if="todoApp"
          class="menu-app-button todo-menu-button"
          type="button"
          :class="{ 'is-active': activeWindow === todoApp.id }"
          aria-label="Open TODO List"
          @click="openWindow(todoApp.id)"
        >
          <span class="app-light"></span>
          <span>{{ todoApp.label }}</span>
        </button>
      </div>

      <div class="menu-center">
        <span class="menu-title">LiuYinChu Portal</span>
        <span class="menu-status">{{ loadingData ? 'Syncing' : 'Ready' }}</span>
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
          <div class="app-panel-heading">
            <p>Website map</p>
            <h1>LiuYinChu'Space</h1>
          </div>
          <div class="site-map-grid">
            <article v-for="section in siteMapSections" :key="section.title" class="site-map-card">
              <h2>{{ section.title }}</h2>
              <p>{{ section.description }}</p>
              <div class="site-map-links">
                <RouterLink
                  v-for="link in section.links"
                  :key="link.path"
                  :to="link.path"
                  class="site-map-link"
                >
                  {{ link.name }}
                </RouterLink>
              </div>
            </article>
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
            <div class="link-grid">
              <a
                v-for="site in group.links"
                :key="site.url"
                :href="site.url"
                class="link-tile"
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
        class="launcher-end-button"
        type="button"
        :class="{ 'is-active': activeWindow === 'map' }"
        aria-label="Open website map"
        @click="openWindow('map')"
      >
        <img :src="bottomApps[0].icon" alt="">
        <span>Map</span>
      </button>

      <div class="quick-launcher" aria-label="Common links">
        <a
          v-for="site in quickLinks"
          :key="site.url"
          :href="site.url"
          target="_blank"
          rel="noopener noreferrer"
          class="quick-launcher-link"
          :aria-label="site.name"
        >
          <img :src="iconForUrl(site.url, 128)" alt="">
          <span>{{ site.name }}</span>
        </a>
      </div>

      <button
        class="launcher-end-button"
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

  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  color: var(--portal-text);
  background: #181825;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'LXGW WenKai', system-ui, sans-serif;
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
    linear-gradient(180deg, rgba(17, 17, 27, 0.62), rgba(17, 17, 27, 0.16) 38%, rgba(17, 17, 27, 0.56)),
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.07), transparent 34rem);
}

.boot-screen {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(circle at 50% 45%, rgba(180, 190, 254, 0.14), transparent 28rem),
    rgba(17, 17, 27, 0.82);
  backdrop-filter: blur(18px);
}

.boot-handwriting {
  position: relative;
  max-width: min(78vw, 860px);
  margin: 0;
  overflow: hidden;
  color: rgba(245, 246, 255, 0.92);
  font-family: 'LXGW WenKai', 'Bradley Hand', 'Segoe Print', cursive;
  font-size: clamp(1.35rem, 3vw, 2.6rem);
  font-weight: 600;
  line-height: 1.55;
  text-align: center;
  text-shadow: 0 0 24px rgba(137, 180, 250, 0.36);
  white-space: nowrap;
  animation: handwriting-reveal 2.45s cubic-bezier(0.2, 0.82, 0.18, 1) both;
}

.boot-handwriting::after {
  content: '';
  position: absolute;
  top: 13%;
  bottom: 13%;
  width: 2px;
  background: rgba(245, 246, 255, 0.7);
  box-shadow: 0 0 18px rgba(245, 246, 255, 0.62);
  animation: handwriting-caret 2.45s cubic-bezier(0.2, 0.82, 0.18, 1) both;
}

.boot-leave-active {
  transition: opacity 0.56s ease, filter 0.56s ease;
}

.boot-leave-to {
  opacity: 0;
  filter: blur(8px);
}

.portal-menu-bar {
  position: absolute;
  top: max(0.65rem, env(safe-area-inset-top));
  right: clamp(0.7rem, 2.4vw, 1.8rem);
  left: clamp(0.7rem, 2.4vw, 1.8rem);
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(7rem, 1fr) auto minmax(18rem, 1fr);
  align-items: center;
  height: clamp(2.25rem, 4vw, 2.8rem);
  padding: 0 clamp(0.45rem, 1.3vw, 0.7rem);
  color: rgba(245, 246, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(24, 24, 37, 0.36);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 20px 70px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(26px) saturate(155%);
  box-sizing: border-box;
}

.menu-left,
.menu-center,
.menu-right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-left {
  justify-content: flex-start;
}

.menu-center {
  justify-content: center;
  gap: 0.72rem;
}

.menu-right {
  justify-content: flex-end;
  gap: 0.45rem;
}

.menu-title {
  font-size: 0.88rem;
  font-weight: 780;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.menu-status,
.menu-clock {
  color: rgba(205, 214, 244, 0.72);
  font-size: 0.75rem;
  font-weight: 620;
  white-space: nowrap;
}

.menu-app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  min-width: 2.25rem;
  height: 1.45rem;
  padding: 0 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.48rem;
  color: rgba(245, 246, 255, 0.84);
  background: rgba(255, 255, 255, 0.1);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, background-color 0.16s ease, border-color 0.16s ease;
}

.menu-app-button:hover,
.menu-app-button:focus-visible,
.menu-app-button.is-active {
  border-color: rgba(180, 190, 254, 0.42);
  background: rgba(180, 190, 254, 0.2);
  outline: none;
  transform: translateY(-1px);
}

.todo-menu-button {
  min-width: 3.15rem;
}

.app-light {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: #f38ba8;
  box-shadow: 0 0 14px rgba(243, 139, 168, 0.7);
}

.icon-menu-button img {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 0.24rem;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.05rem;
  background: var(--portal-window);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 34px 90px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(30px) saturate(155%);
}

.window-music { width: min(780px, calc(100vw - 3rem)); }
.window-weather { width: min(520px, calc(100vw - 3rem)); }
.window-calendar { width: min(600px, calc(100vw - 3rem)); }
.window-todo { width: min(690px, calc(100vw - 3rem)); }
.window-map { width: min(860px, calc(100vw - 3rem)); }

.window-titlebar {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr) 5rem;
  align-items: center;
  min-height: 2.65rem;
  padding: 0 0.9rem;
  background: var(--portal-toolbar);
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

.app-panel-heading {
  display: grid;
  gap: 0.18rem;
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
  min-height: 24rem;
}

:deep(.aplayer) {
  margin: 0;
  border-radius: 1rem;
  color: #cdd6f4;
  background: rgba(30, 30, 46, 0.64);
  box-shadow: none;
  overflow: hidden;
}

:deep(.aplayer-pic) {
  border-radius: 0 0.9rem 0.9rem 0;
}

:deep(.aplayer-list ol li) {
  border-top-color: rgba(180, 190, 254, 0.1);
  color: #cdd6f4;
  background: transparent;
}

:deep(.aplayer-list ol li:hover),
:deep(.aplayer-list-light) {
  color: #11111b !important;
  background: rgba(180, 190, 254, 0.9) !important;
}

:deep(.aplayer-list-light .aplayer-list-title),
:deep(.aplayer-list-light .aplayer-list-author) {
  color: #11111b !important;
}

:deep(.aplayer-info),
:deep(.aplayer-list) {
  border-color: rgba(180, 190, 254, 0.1);
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

.map-window-content,
.dock-window-content {
  gap: 1.25rem;
}

.site-map-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.site-map-card {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid rgba(180, 190, 254, 0.13);
  border-radius: 1rem;
  background: rgba(30, 30, 46, 0.54);
}

.site-map-card h2,
.site-map-card p {
  margin: 0;
}

.site-map-card h2 {
  color: #cba6f7;
  font-size: 0.96rem;
  letter-spacing: 0.03em;
}

.site-map-card p {
  color: var(--portal-muted);
  font-size: 0.86rem;
  line-height: 1.55;
}

.site-map-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.48rem;
}

.site-map-link {
  padding: 0.42rem 0.6rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 999px;
  color: rgba(245, 246, 255, 0.88);
  background: rgba(69, 71, 90, 0.42);
  font-size: 0.82rem;
  font-weight: 650;
  text-decoration: none;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.site-map-link:hover,
.site-map-link:focus-visible {
  border-color: rgba(203, 166, 247, 0.42);
  background: rgba(203, 166, 247, 0.16);
  outline: none;
  transform: translateY(-1px);
}

.link-group {
  display: grid;
  gap: 0.8rem;
}

.link-group h2 {
  margin: 0;
  color: var(--group-accent, #b4befe);
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.9rem, 1fr));
  gap: 0.82rem;
}

.link-tile {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  min-height: 5.5rem;
  padding: 0.82rem 0.45rem;
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 0.95rem;
  color: rgba(245, 246, 255, 0.9);
  background: rgba(49, 50, 68, 0.52);
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.link-tile:hover,
.link-tile:focus-visible {
  border-color: rgba(180, 190, 254, 0.35);
  background: rgba(69, 71, 90, 0.74);
  outline: none;
  transform: translateY(-2px);
}

.link-tile img {
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
}

.link-tile span {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 0.83rem;
  font-weight: 650;
  line-height: 1.25;
}

.bottom-launcher {
  position: absolute;
  right: 50%;
  bottom: max(1.15rem, env(safe-area-inset-bottom));
  z-index: 18;
  display: grid;
  grid-template-columns: auto minmax(21rem, 34rem) auto;
  align-items: center;
  width: min(72rem, calc(100vw - 3rem));
  min-height: clamp(4.1rem, 8vw, 5rem);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.25rem;
  background: rgba(24, 24, 37, 0.4);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 26px 72px rgba(0, 0, 0, 0.34);
  transform: translateX(50%);
  backdrop-filter: blur(26px) saturate(165%);
}

.launcher-end-button {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.55rem;
  height: 100%;
  min-width: clamp(6.4rem, 12vw, 9.2rem);
  padding: 0 0.9rem;
  border: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(245, 246, 255, 0.88);
  background: transparent;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 760;
  cursor: pointer;
  text-align: left;
}

.launcher-end-button:last-child {
  border-right: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.18);
}

.launcher-end-button:hover,
.launcher-end-button:focus-visible,
.launcher-end-button.is-active {
  background: rgba(180, 190, 254, 0.14);
  outline: none;
}

.launcher-end-button:first-child {
  border-radius: 1.2rem 0 0 1.2rem;
}

.launcher-end-button:last-child {
  border-radius: 0 1.2rem 1.2rem 0;
}

.launcher-end-button img {
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 0.7rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
}

.quick-launcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.35rem, 1vw, 0.65rem);
  min-width: 0;
  padding: 0 0.75rem;
}

.quick-launcher-link {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  width: clamp(2.6rem, 4.6vw, 3.35rem);
  color: rgba(245, 246, 255, 0.86);
  text-decoration: none;
  transition: transform 0.18s ease;
}

.quick-launcher-link:hover,
.quick-launcher-link:focus-visible {
  outline: none;
  transform: translateY(-0.45rem) scale(1.06);
}

.quick-launcher-link img {
  width: clamp(2.1rem, 4vw, 2.8rem);
  height: clamp(2.1rem, 4vw, 2.8rem);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.13);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
}

.quick-launcher-link span {
  max-width: 4.5rem;
  overflow: hidden;
  font-size: 0.64rem;
  font-weight: 650;
  line-height: 1.15;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
}

@keyframes handwriting-reveal {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  100% {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes handwriting-caret {
  0% {
    left: 0;
    opacity: 0;
  }
  8%,
  84% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .portal-menu-bar {
    grid-template-columns: auto 1fr auto;
  }

  .menu-title,
  .menu-status,
  .menu-clock,
  .icon-menu-button span {
    display: none;
  }

  .menu-center {
    min-width: 1rem;
  }

  .site-map-grid {
    grid-template-columns: 1fr;
  }

  .bottom-launcher {
    grid-template-columns: auto minmax(0, 1fr) auto;
    width: calc(100vw - 1rem);
  }

  .launcher-end-button {
    min-width: 4.8rem;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.25rem;
    padding: 0 0.48rem;
    text-align: center;
  }

  .launcher-end-button img {
    width: 2rem;
    height: 2rem;
  }

  .quick-launcher {
    overflow-x: auto;
    justify-content: flex-start;
    scrollbar-width: none;
  }

  .quick-launcher::-webkit-scrollbar {
    display: none;
  }

  .quick-launcher-link {
    flex: 0 0 auto;
  }
}

@media (max-width: 700px) {
  .boot-handwriting {
    white-space: normal;
  }

  .portal-menu-bar {
    right: 0.55rem;
    left: 0.55rem;
    height: 2.45rem;
  }

  .menu-app-button {
    height: 1.55rem;
    padding: 0 0.44rem;
  }

  .mac-window {
    top: calc(50% - 0.2rem);
    width: calc(100vw - 1rem);
    max-height: calc(100dvh - 8.5rem);
    min-height: 23rem;
  }

  .window-titlebar {
    grid-template-columns: 4.2rem minmax(0, 1fr) 4.2rem;
  }

  .window-body {
    padding: 0.85rem;
  }

  .app-panel-heading h1 {
    font-size: 1.35rem;
  }

  .link-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bottom-launcher {
    min-height: 4.45rem;
    bottom: max(0.55rem, env(safe-area-inset-bottom));
  }

  .launcher-end-button span,
  .quick-launcher-link span {
    display: none;
  }

  .launcher-end-button {
    min-width: 3.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .boot-handwriting,
  .boot-handwriting::after,
  .quick-launcher-link,
  .menu-app-button,
  .site-map-link,
  .link-tile {
    animation: none;
    transition: none;
  }

  .boot-handwriting {
    clip-path: none;
  }
}
</style>
