<script setup>
import { computed, onMounted, ref } from 'vue'

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const DEFAULT_LOCATION = {
  city: '珠海',
  region: '广东',
  country: '中国',
  latitude: 22.27,
  longitude: 113.57,
}

const GLOBE_VIEWBOX = {
  width: 1400,
  height: 1000,
  cx: 700,
  cy: 540,
  radius: 392,
}

const LAND_MASSES = [
  [
    [62, -168], [70, -132], [58, -92], [51, -58], [31, -82],
    [18, -96], [21, -119], [44, -128],
  ],
  [
    [12, -81], [6, -60], [-18, -44], [-54, -68], [-38, -78],
    [-10, -74],
  ],
  [
    [72, -10], [64, 40], [55, 96], [62, 142], [46, 164],
    [22, 112], [8, 76], [20, 38], [36, 18],
  ],
  [
    [34, -16], [36, 28], [8, 48], [-34, 22], [-30, -12],
    [2, -18],
  ],
  [
    [-12, 112], [-10, 154], [-38, 146], [-42, 116],
  ],
  [
    [60, -50], [70, -22], [58, -14], [50, -34],
  ],
]

const SIGNAL_LINKS = [
  { key: 'san-francisco', latitude: 37.77, longitude: -122.42, tone: 'cool' },
  { key: 'new-york', latitude: 40.71, longitude: -74.01, tone: 'warm' },
  { key: 'london', latitude: 51.51, longitude: -0.13, tone: 'cool' },
  { key: 'tokyo', latitude: 35.68, longitude: 139.69, tone: 'green' },
  { key: 'singapore', latitude: 1.35, longitude: 103.82, tone: 'warm' },
  { key: 'sydney', latitude: -33.87, longitude: 151.21, tone: 'cool' },
]

const visitorInfo = ref({
  ip: 'Loading...',
  country: '未知',
  region: '未知',
  city: '未知',
  browser: '未知',
  os: '未知',
  timezone: '未知',
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
})

const isLoading = ref(true)
const loadError = ref('')
const globeCenter = ref({
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
})
const isDragging = ref(false)

let dragOrigin = null

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeLongitude(value) {
  if (!Number.isFinite(value)) return 0
  return ((((value + 180) % 360) + 360) % 360) - 180
}

function parseVisitorDevice() {
  const ua = navigator.userAgent
  const platform = navigator.userAgentData?.platform || navigator.platform || ''

  let browser = '未知'
  if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  let os = '未知'
  if (/Mac/.test(platform) || /Macintosh|Mac OS/.test(ua)) os = 'macOS'
  else if (/Win/.test(platform) || /Windows NT/.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Linux|X11/.test(platform) || /Linux|X11/.test(ua)) os = 'Linux'

  visitorInfo.value = {
    ...visitorInfo.value,
    browser,
    os,
  }
}

async function fetchVisitorInfo() {
  isLoading.value = true
  loadError.value = ''

  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) throw new Error('ipapi request failed')

    const data = await res.json()
    const latitude = Number(data.latitude)
    const longitude = Number(data.longitude)
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)

    visitorInfo.value = {
      ...visitorInfo.value,
      ip: data.ip || '无法获取',
      country: data.country_name || data.country || '未知',
      region: data.region || '未知',
      city: data.city || '未知',
      timezone: data.timezone || '未知',
      latitude: hasCoordinates ? latitude : DEFAULT_LOCATION.latitude,
      longitude: hasCoordinates ? longitude : DEFAULT_LOCATION.longitude,
    }

    if (hasCoordinates) {
      focusVisitorLocation()
    }
  } catch (error) {
    visitorInfo.value = {
      ...visitorInfo.value,
      ip: '无法获取',
      country: DEFAULT_LOCATION.country,
      region: DEFAULT_LOCATION.region,
      city: DEFAULT_LOCATION.city,
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
    }
    loadError.value = 'IP 定位暂时不可用，地球仪显示默认位置。'
    focusVisitorLocation()
  } finally {
    isLoading.value = false
  }
}

function toRadians(degrees) {
  return degrees * Math.PI / 180
}

function projectPoint(latitude, longitude, radius = GLOBE_VIEWBOX.radius) {
  const lat = toRadians(latitude)
  const lon = toRadians(longitude)
  const centerLat = toRadians(globeCenter.value.latitude)
  const centerLon = toRadians(globeCenter.value.longitude)
  const deltaLon = lon - centerLon
  const cosLat = Math.cos(lat)
  const sinLat = Math.sin(lat)
  const cosCenterLat = Math.cos(centerLat)
  const sinCenterLat = Math.sin(centerLat)
  const cosDeltaLon = Math.cos(deltaLon)

  const x = radius * cosLat * Math.sin(deltaLon)
  const y = radius * (cosCenterLat * sinLat - sinCenterLat * cosLat * cosDeltaLon)
  const z = sinCenterLat * sinLat + cosCenterLat * cosLat * cosDeltaLon

  return {
    x: GLOBE_VIEWBOX.cx + x,
    y: GLOBE_VIEWBOX.cy - y,
    visible: z >= -0.04,
    depth: z,
  }
}

function buildProjectedPaths(lines) {
  return lines.flatMap((line) => {
    const segments = []
    let current = []

    line.forEach(([latitude, longitude]) => {
      const point = projectPoint(latitude, longitude)

      if (point.visible) {
        current.push(point)
        return
      }

      if (current.length > 1) {
        segments.push(current)
      }

      current = []
    })

    if (current.length > 1) {
      segments.push(current)
    }

    return segments.map((segment) => segment
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' '))
  })
}

function createParallels() {
  const lines = []

  for (let latitude = -70; latitude <= 70; latitude += 10) {
    const line = []
    for (let longitude = -180; longitude <= 180; longitude += 3) {
      line.push([latitude, longitude])
    }
    lines.push(line)
  }

  return lines
}

function createMeridians() {
  const lines = []

  for (let longitude = -180; longitude < 180; longitude += 10) {
    const line = []
    for (let latitude = -80; latitude <= 80; latitude += 3) {
      line.push([latitude, longitude])
    }
    lines.push(line)
  }

  return lines
}

function interpolateGeoLine(origin, target, steps = 110) {
  const line = []
  let longitudeDelta = normalizeLongitude(target.longitude - origin.longitude)

  if (Math.abs(longitudeDelta) > 180) {
    longitudeDelta = longitudeDelta > 0 ? longitudeDelta - 360 : longitudeDelta + 360
  }

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps
    const latitude = origin.latitude
      + (target.latitude - origin.latitude) * progress
      + Math.sin(progress * Math.PI) * 7
    const longitude = normalizeLongitude(origin.longitude + longitudeDelta * progress)

    line.push([latitude, longitude])
  }

  return line
}

function buildSignalRoutePaths() {
  const origin = {
    latitude: visitorInfo.value.latitude,
    longitude: visitorInfo.value.longitude,
  }

  return SIGNAL_LINKS.flatMap((target) => buildProjectedPaths([
    interpolateGeoLine(origin, target),
  ]).map((path, index) => ({
    key: `${target.key}-${index}`,
    path,
    tone: target.tone,
  })))
}

const parallelPaths = computed(() => buildProjectedPaths(createParallels()))
const meridianPaths = computed(() => buildProjectedPaths(createMeridians()))
const landPaths = computed(() => buildProjectedPaths(LAND_MASSES))
const signalRoutePaths = computed(buildSignalRoutePaths)

const signalDots = computed(() => SIGNAL_LINKS.map((point) => ({
  ...point,
  ...projectPoint(point.latitude, point.longitude),
})).filter((point) => point.visible))

const visitorPoint = computed(() => (
  projectPoint(visitorInfo.value.latitude, visitorInfo.value.longitude)
))

const locationLabel = computed(() => {
  const { city, region, country } = visitorInfo.value
  return [city, region, country].filter((item) => item && item !== '未知').join(' / ') || '未知地点'
})

const coordinateLabel = computed(() => {
  const { latitude, longitude } = visitorInfo.value
  return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
})

const infoRows = computed(() => [
  { label: 'DATE', value: today },
  { label: 'IP', value: visitorInfo.value.ip },
  { label: 'LOCATION', value: locationLabel.value },
  { label: 'BROWSER', value: visitorInfo.value.browser },
  { label: 'SYSTEM', value: visitorInfo.value.os },
  { label: 'TIMEZONE', value: visitorInfo.value.timezone },
])

function focusVisitorLocation() {
  globeCenter.value = {
    latitude: clamp(visitorInfo.value.latitude, -75, 75),
    longitude: normalizeLongitude(visitorInfo.value.longitude),
  }
}

function onGlobePointerDown(event) {
  isDragging.value = true
  dragOrigin = {
    x: event.clientX,
    y: event.clientY,
    latitude: globeCenter.value.latitude,
    longitude: globeCenter.value.longitude,
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function onGlobePointerMove(event) {
  if (!isDragging.value || !dragOrigin) return

  const deltaX = event.clientX - dragOrigin.x
  const deltaY = event.clientY - dragOrigin.y

  globeCenter.value = {
    latitude: clamp(dragOrigin.latitude + deltaY * 0.22, -75, 75),
    longitude: normalizeLongitude(dragOrigin.longitude - deltaX * 0.32),
  }
}

function onGlobePointerUp(event) {
  isDragging.value = false
  dragOrigin = null
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}

onMounted(() => {
  parseVisitorDevice()
  fetchVisitorInfo()
})
</script>

<template>
  <main class="visitor-page" aria-labelledby="visitor-title">
    <section class="visitor-hero">
      <div class="visitor-copy">
        <p class="kicker">VISITOR CENTER</p>
        <h1 id="visitor-title">访客中心</h1>
        <p class="intro">
          这里保存给抵达者的一张入场面板：你的访问痕迹、所在位置和一枚正在对准你的地球信标。
        </p>
      </div>
    </section>

    <section class="visitor-dashboard" aria-label="访客信息面板">
      <article class="info-panel">
        <div class="blessing-card">
          <img src="/fig/welcome.svg" alt="Welcome" loading="eager" decoding="async" />
        </div>

        <div class="panel-heading">
          <p class="kicker">VISITOR SIGNAL</p>
          <h2>访客信息</h2>
          <p>
            这组信息来自浏览器和公开 IP 定位服务，只用于在这里生成一张短暂的访客面板。
          </p>
        </div>

        <dl class="info-grid">
          <div
            v-for="item in infoRows"
            :key="item.label"
            class="info-cell"
          >
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <div class="traffic-strip">
          <span id="busuanzi_container_site_pv">
            SITE PV <strong id="busuanzi_value_site_pv"></strong>
          </span>
          <span>{{ isLoading ? 'LOCATING' : 'SIGNAL READY' }}</span>
        </div>
      </article>

      <article class="globe-panel" aria-label="IP 定位地球仪">
        <div class="globe-copy">
          <p class="kicker">IP ORBIT</p>
          <h2>{{ locationLabel }}</h2>
          <p>{{ loadError || `根据当前显示的 IP，将地球仪旋转到 ${coordinateLabel}。` }}</p>
        </div>

        <div
          class="globe-stage"
          :class="{ 'is-dragging': isDragging }"
          role="img"
          :aria-label="`访客位置地球仪，当前定位 ${locationLabel}`"
          @pointerdown="onGlobePointerDown"
          @pointermove="onGlobePointerMove"
          @pointerup="onGlobePointerUp"
          @pointercancel="onGlobePointerUp"
        >
          <svg class="globe-svg" :viewBox="`0 0 ${GLOBE_VIEWBOX.width} ${GLOBE_VIEWBOX.height}`" aria-hidden="true">
            <defs>
              <radialGradient id="visitor-globe-fill" cx="38%" cy="30%" r="72%">
                <stop offset="0%" stop-color="rgba(205, 214, 244, 0.16)" />
                <stop offset="54%" stop-color="rgba(49, 50, 68, 0.18)" />
                <stop offset="100%" stop-color="rgba(24, 24, 37, 0.86)" />
              </radialGradient>
              <radialGradient id="visitor-globe-wash" cx="46%" cy="42%" r="72%">
                <stop offset="0%" stop-color="rgba(137, 220, 235, 0.10)" />
                <stop offset="70%" stop-color="rgba(137, 220, 235, 0.02)" />
                <stop offset="100%" stop-color="rgba(137, 220, 235, 0)" />
              </radialGradient>
              <clipPath id="visitor-globe-clip">
                <circle
                  :cx="GLOBE_VIEWBOX.cx"
                  :cy="GLOBE_VIEWBOX.cy"
                  :r="GLOBE_VIEWBOX.radius"
                />
              </clipPath>
            </defs>

            <circle
              class="globe-shadow"
              :cx="GLOBE_VIEWBOX.cx + 18"
              :cy="GLOBE_VIEWBOX.cy + 34"
              :r="GLOBE_VIEWBOX.radius"
            />
            <circle
              class="globe-fill"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius"
            />
            <circle
              class="globe-wash"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius"
            />

            <g clip-path="url(#visitor-globe-clip)">
              <path
                v-for="(path, index) in landPaths"
                :key="`land-${index}`"
                :d="path"
                class="globe-land"
              />
              <path
                v-for="(path, index) in parallelPaths"
                :key="`parallel-${index}`"
                :d="path"
                class="globe-line globe-line--soft"
              />
              <path
                v-for="(path, index) in meridianPaths"
                :key="`meridian-${index}`"
                :d="path"
                class="globe-line"
              />
              <path
                v-for="route in signalRoutePaths"
                :key="`route-under-${route.key}`"
                :d="route.path"
                class="globe-orbit"
              />
              <path
                v-for="route in signalRoutePaths"
                :key="`route-core-${route.key}`"
                :d="route.path"
                class="globe-orbit-core"
                :class="`globe-orbit-core--${route.tone}`"
              />
              <g
                v-for="point in signalDots"
                :key="point.key"
                class="globe-dot"
                :class="`globe-dot--${point.tone}`"
                :transform="`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`"
              >
                <circle r="4.2" />
              </g>
            </g>

            <circle
              class="globe-rim"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius"
            />

            <g
              v-if="visitorPoint.visible"
              class="visitor-marker"
              :transform="`translate(${visitorPoint.x.toFixed(1)} ${visitorPoint.y.toFixed(1)})`"
            >
              <circle class="marker-pulse" r="34" />
              <circle class="marker-ring" r="12" />
              <circle class="marker-core" r="5.5" />
            </g>
          </svg>
        </div>

        <div class="globe-toolbar">
          <button type="button" @click="focusVisitorLocation">定位到访客</button>
          <span>{{ coordinateLabel }}</span>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.visitor-page {
  min-height: calc(100vh - 72px);
  overflow: hidden;
  padding: clamp(4.5rem, 8vw, 7rem) clamp(1rem, 4vw, 3rem) 7rem;
  background:
    radial-gradient(circle at 78% 22%, rgba(var(--ctp-mocha-sky-rgb), 0.12), transparent 28rem),
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px),
    linear-gradient(145deg, var(--ctp-mocha-crust), var(--ctp-mocha-base) 52%, var(--ctp-mocha-mantle));
  background-size: auto, 42px 42px, 42px 42px, auto;
  color: var(--ctp-mocha-text);
}

.visitor-hero,
.visitor-dashboard {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.visitor-hero {
  margin-bottom: clamp(2rem, 5vw, 4rem);
}

.kicker {
  margin: 0;
  color: var(--ctp-mocha-sky);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 1rem 0 1.25rem;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(3.3rem, 8vw, 6.4rem);
  font-weight: 800;
  line-height: 1;
}

.intro {
  max-width: 760px;
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.85;
}

.visitor-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
  gap: clamp(1.2rem, 3vw, 2rem);
  align-items: stretch;
}

.info-panel,
.globe-panel {
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.16);
  border-radius: 8px;
  background:
    linear-gradient(150deg, rgba(var(--ctp-mocha-surface1-rgb), 0.86), rgba(var(--ctp-mocha-base-rgb), 0.9)),
    var(--ctp-mocha-base);
  box-shadow:
    18px 22px 42px rgba(0, 0, 0, 0.34),
    -14px -14px 30px rgba(255, 255, 255, 0.026),
    inset 1px 1px 0 rgba(255, 255, 255, 0.06);
}

.info-panel {
  display: grid;
  gap: 1.3rem;
  align-content: start;
  padding: clamp(1.2rem, 3vw, 2rem);
}

.blessing-card {
  display: grid;
  min-height: 150px;
  place-items: center;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.16);
  border-radius: 8px;
  padding: 1rem;
  background:
    linear-gradient(135deg, rgba(var(--ctp-mocha-crust-rgb), 0.72), rgba(var(--ctp-mocha-surface0-rgb), 0.56)),
    var(--ctp-mocha-crust);
  box-shadow:
    inset 8px 8px 18px rgba(0, 0, 0, 0.28),
    inset -8px -8px 18px rgba(255, 255, 255, 0.025);
}

.blessing-card img {
  width: min(340px, 84%);
  max-height: 110px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(var(--ctp-mocha-sky-rgb), 0.18));
}

.panel-heading {
  display: grid;
  gap: 0.75rem;
}

.panel-heading h2,
.globe-copy h2 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.panel-heading p,
.globe-copy p {
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  line-height: 1.75;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 0;
}

.info-cell {
  min-width: 0;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.12);
  border-radius: 8px;
  padding: 0.9rem;
  background: rgba(var(--ctp-mocha-base-rgb), 0.58);
  box-shadow:
    inset 4px 4px 10px rgba(0, 0, 0, 0.22),
    inset -4px -4px 10px rgba(255, 255, 255, 0.025);
}

.info-cell dt {
  margin: 0 0 0.45rem;
  color: var(--ctp-mocha-teal);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}

.info-cell dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: 1.05rem;
  line-height: 1.45;
}

.traffic-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem;
  border-top: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.18);
  padding-top: 1rem;
  color: var(--ctp-mocha-overlay2);
  font-family: 'Fira Code', monospace;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
}

.traffic-strip strong {
  color: var(--ctp-mocha-peach);
  font-weight: 700;
}

.globe-panel {
  position: relative;
  display: grid;
  gap: 1rem;
  min-height: 640px;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  overflow: hidden;
}

.globe-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.08), transparent 34%),
    repeating-linear-gradient(90deg, transparent 0 18px, rgba(255, 255, 255, 0.035) 18px 19px);
  opacity: 0.5;
}

.globe-copy,
.globe-stage,
.globe-toolbar {
  position: relative;
  z-index: 1;
}

.globe-copy {
  display: grid;
  gap: 0.7rem;
}

.globe-stage {
  display: grid;
  height: clamp(440px, 42vw, 560px);
  overflow: hidden;
  place-items: center;
  margin: -0.4rem -1.6rem 0;
  border-top: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.12);
  border-bottom: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.12);
  cursor: grab;
  background:
    radial-gradient(circle at 48% 46%, rgba(var(--ctp-mocha-sky-rgb), 0.08), transparent 18rem),
    rgba(var(--ctp-mocha-crust-rgb), 0.22);
  touch-action: none;
  user-select: none;
}

.globe-stage.is-dragging {
  cursor: grabbing;
}

.globe-svg {
  width: min(1320px, 220%);
  max-width: none;
  transform: translate(-9%, -3%);
  filter: drop-shadow(0 28px 44px rgba(0, 0, 0, 0.38));
}

.globe-shadow {
  fill: rgba(0, 0, 0, 0.22);
}

.globe-fill {
  fill: url(#visitor-globe-fill);
}

.globe-wash {
  fill: url(#visitor-globe-wash);
}

.globe-land {
  fill: none;
  stroke: rgba(147, 153, 178, 0.32);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
  vector-effect: non-scaling-stroke;
}

.globe-line {
  fill: none;
  stroke: rgba(147, 153, 178, 0.18);
  stroke-width: 0.58;
  vector-effect: non-scaling-stroke;
}

.globe-line--soft {
  stroke: rgba(var(--ctp-mocha-lavender-rgb), 0.11);
}

.globe-orbit {
  fill: none;
  stroke: rgba(var(--ctp-mocha-peach-rgb), 0.24);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 18;
}

.globe-orbit-core {
  fill: none;
  stroke: var(--ctp-mocha-peach);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
  vector-effect: non-scaling-stroke;
}

.globe-orbit-core--cool {
  stroke: var(--ctp-mocha-sapphire);
}

.globe-orbit-core--green {
  stroke: var(--ctp-mocha-green);
}

.globe-dot circle {
  fill: none;
  stroke: var(--ctp-mocha-overlay2);
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}

.globe-dot--warm circle {
  stroke: var(--ctp-mocha-peach);
}

.globe-dot--cool circle {
  stroke: var(--ctp-mocha-sapphire);
}

.globe-dot--green circle {
  stroke: var(--ctp-mocha-green);
}

.globe-rim {
  fill: none;
  stroke: rgba(147, 153, 178, 0.38);
  stroke-width: 0.9;
  vector-effect: non-scaling-stroke;
}

.marker-pulse,
.marker-ring,
.marker-core {
  fill: var(--ctp-mocha-peach);
}

.marker-pulse {
  animation: markerPulse 1.9s ease-out infinite;
  opacity: 0.26;
}

.marker-ring {
  fill: none;
  stroke: var(--ctp-mocha-peach);
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}

.marker-core {
  stroke: var(--ctp-mocha-crust);
  stroke-width: 2.4;
  vector-effect: non-scaling-stroke;
}

.globe-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid rgba(var(--ctp-mocha-overlay0-rgb), 0.16);
  padding-top: 1rem;
}

.globe-toolbar button {
  border: 1px solid rgba(var(--ctp-mocha-teal-rgb), 0.26);
  border-radius: 999px;
  padding: 0.65rem 1rem;
  background: rgba(var(--ctp-mocha-crust-rgb), 0.5);
  color: var(--ctp-mocha-teal);
  cursor: pointer;
  font-family: 'LXGW WenKai', serif;
  font-size: 0.95rem;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.globe-toolbar button:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--ctp-mocha-teal-rgb), 0.5);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.7);
}

.globe-toolbar span {
  color: var(--ctp-mocha-overlay2);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

@keyframes markerPulse {
  0% {
    r: 8;
    opacity: 0.36;
  }
  100% {
    r: 44;
    opacity: 0;
  }
}

@media (max-width: 980px) {
  .visitor-dashboard {
    grid-template-columns: 1fr;
  }

  .globe-panel {
    min-height: auto;
  }
}

@media (max-width: 560px) {
  .visitor-page {
    padding-inline: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .globe-stage {
    height: 360px;
    margin-inline: -1rem;
  }

  .globe-svg {
    width: min(840px, 220%);
    transform: translate(-13%, -4%);
  }

  .globe-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
