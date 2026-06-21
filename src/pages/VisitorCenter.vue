<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  cy: 500,
  radius: 560,
}

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
const worldFeatures = ref([])
const globeCenter = ref({
  latitude: DEFAULT_LOCATION.latitude,
  longitude: DEFAULT_LOCATION.longitude,
})
const isDragging = ref(false)
const scrollProgress = ref(0)
const globeScrollSection = ref(null)

let dragOrigin = null
let scrollFrame = 0

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

async function fetchWorldFeatures() {
  try {
    const res = await fetch('/data/ne_110m_admin_0_countries.geojson')
    if (!res.ok) throw new Error('world map request failed')

    const data = await res.json()
    worldFeatures.value = Array.isArray(data.features) ? data.features : []
  } catch (error) {
    worldFeatures.value = []
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
    visible: z >= -0.01,
    depth: z,
  }
}

function buildProjectedPaths(lines) {
  return lines.flatMap((line) => {
    const segments = []
    let current = []
    let previousLongitude = null

    line.forEach(([latitude, longitude]) => {
      const point = projectPoint(latitude, longitude)
      const longitudeJump = previousLongitude === null
        ? 0
        : Math.abs(normalizeLongitude(longitude - previousLongitude))

      if (point.visible && longitudeJump < 42) {
        current.push(point)
      } else {
        if (current.length > 1) {
          segments.push(current)
        }
        current = point.visible ? [point] : []
      }

      previousLongitude = longitude
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

  for (let latitude = -80; latitude <= 80; latitude += 10) {
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
    for (let latitude = -88; latitude <= 88; latitude += 3) {
      line.push([latitude, longitude])
    }
    lines.push(line)
  }

  return lines
}

function featureToLines(feature) {
  const { geometry } = feature
  if (!geometry) return []

  const polygonToLines = (polygon) => polygon.map((ring) => ring
    .filter((coordinate) => coordinate.length >= 2)
    .map(([longitude, latitude]) => [Number(latitude), Number(longitude)])
    .filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude)))
    .filter((line) => line.length > 1)

  if (geometry.type === 'Polygon') {
    return polygonToLines(geometry.coordinates)
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon) => polygonToLines(polygon))
  }

  return []
}

function createVisitorRegionLine() {
  const latitude = visitorInfo.value.latitude
  const longitude = visitorInfo.value.longitude
  const longitudeRadius = 2.2 / Math.max(Math.cos(toRadians(latitude)), 0.22)
  const line = []

  for (let index = 0; index <= 96; index += 1) {
    const angle = (index / 96) * Math.PI * 2
    line.push([
      latitude + Math.sin(angle) * 1.45,
      normalizeLongitude(longitude + Math.cos(angle) * longitudeRadius),
    ])
  }

  return line
}

const worldLines = computed(() => worldFeatures.value.flatMap((feature) => featureToLines(feature)))
const parallelPaths = computed(() => buildProjectedPaths(createParallels()))
const meridianPaths = computed(() => buildProjectedPaths(createMeridians()))
const landPaths = computed(() => buildProjectedPaths(worldLines.value))
const visitorRegionPaths = computed(() => buildProjectedPaths([createVisitorRegionLine()]))

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

const statusText = computed(() => {
  if (isLoading.value) return 'LOCATING'
  if (loadError.value) return 'FALLBACK'
  return 'SIGNAL READY'
})

const infoRows = computed(() => [
  { label: 'DATE', value: today },
  { label: 'IP', value: visitorInfo.value.ip },
  { label: 'LOCATION', value: locationLabel.value },
  { label: 'BROWSER', value: visitorInfo.value.browser },
  { label: 'SYSTEM', value: visitorInfo.value.os },
  { label: 'TIMEZONE', value: visitorInfo.value.timezone },
])

const globeStageStyle = computed(() => ({
  '--globe-scale': (0.84 + scrollProgress.value * 0.27).toFixed(3),
  '--globe-y': `${(11 - scrollProgress.value * 11).toFixed(2)}vh`,
  '--globe-opacity': (0.84 + scrollProgress.value * 0.16).toFixed(3),
  '--overlay-opacity': (1 - scrollProgress.value * 0.42).toFixed(3),
}))

function focusVisitorLocation() {
  globeCenter.value = {
    latitude: clamp(visitorInfo.value.latitude, -72, 72),
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
    latitude: clamp(dragOrigin.latitude + deltaY * 0.2, -72, 72),
    longitude: normalizeLongitude(dragOrigin.longitude - deltaX * 0.3),
  }
}

function onGlobePointerUp(event) {
  isDragging.value = false
  dragOrigin = null
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}

function updateScrollProgress() {
  const section = globeScrollSection.value
  if (!section) return

  const rect = section.getBoundingClientRect()
  const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1)
  scrollProgress.value = clamp(-rect.top / scrollable, 0, 1)
}

function requestScrollProgress() {
  if (scrollFrame) return

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0
    updateScrollProgress()
  })
}

onMounted(() => {
  parseVisitorDevice()
  fetchVisitorInfo()
  fetchWorldFeatures()
  updateScrollProgress()
  window.addEventListener('scroll', requestScrollProgress, { passive: true })
  window.addEventListener('resize', requestScrollProgress)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestScrollProgress)
  window.removeEventListener('resize', requestScrollProgress)
  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame)
  }
})
</script>

<template>
  <main class="visitor-page" aria-labelledby="visitor-title">
    <section class="visitor-overview" aria-label="访客中心信息">
      <div class="visitor-title-panel">
        <p class="kicker">VISITOR CENTER</p>
        <h1 id="visitor-title">访客中心</h1>
        <img
          class="welcome-line"
          src="/fig/welcome.svg"
          alt="欢迎你的到来，祝你有晴朗的一天！"
          loading="eager"
          decoding="async"
        />
      </div>

      <article class="info-panel">
        <div class="panel-heading">
          <p class="kicker">VISITOR SIGNAL</p>
          <h2>访客信息</h2>
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
          <span>{{ statusText }}</span>
        </div>
      </article>
    </section>

    <section
      ref="globeScrollSection"
      class="globe-scroll-section"
      aria-label="IP 定位地球仪"
    >
      <div
        class="globe-sticky"
        :class="{ 'is-dragging': isDragging }"
        :style="globeStageStyle"
      >
        <div class="globe-overlay">
          <h2>{{ locationLabel }}</h2>
          <p>{{ loadError || coordinateLabel }}</p>
          <button type="button" @click="focusVisitorLocation">定位到访客</button>
        </div>

        <div
          class="globe-stage"
          role="img"
          :aria-label="`访客位置地球仪，当前定位 ${locationLabel}`"
          @pointerdown="onGlobePointerDown"
          @pointermove="onGlobePointerMove"
          @pointerup="onGlobePointerUp"
          @pointercancel="onGlobePointerUp"
        >
          <svg class="globe-svg" :viewBox="`0 0 ${GLOBE_VIEWBOX.width} ${GLOBE_VIEWBOX.height}`" aria-hidden="true">
            <defs>
              <radialGradient id="visitor-globe-fill" cx="48%" cy="42%" r="72%">
                <stop offset="0%" stop-color="rgba(49, 50, 68, 0.62)" />
                <stop offset="72%" stop-color="rgba(30, 30, 46, 0.95)" />
                <stop offset="100%" stop-color="rgba(17, 17, 27, 1)" />
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
              class="globe-backdrop"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius + 11"
            />
            <circle
              class="globe-fill"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius"
            />

            <g clip-path="url(#visitor-globe-clip)">
              <path
                v-for="(path, index) in parallelPaths"
                :key="`parallel-${index}`"
                :d="path"
                class="globe-grid globe-grid--parallel"
              />
              <path
                v-for="(path, index) in meridianPaths"
                :key="`meridian-${index}`"
                :d="path"
                class="globe-grid"
              />
              <path
                v-for="(path, index) in landPaths"
                :key="`land-${index}`"
                :d="path"
                class="globe-land"
              />
              <path
                v-for="(path, index) in visitorRegionPaths"
                :key="`visitor-region-under-${index}`"
                :d="path"
                class="visitor-region visitor-region--under"
              />
              <path
                v-for="(path, index) in visitorRegionPaths"
                :key="`visitor-region-core-${index}`"
                :d="path"
                class="visitor-region visitor-region--core"
              />
            </g>

            <circle
              class="globe-rim globe-rim--inner"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius"
            />
            <circle
              class="globe-rim globe-rim--outer"
              :cx="GLOBE_VIEWBOX.cx"
              :cy="GLOBE_VIEWBOX.cy"
              :r="GLOBE_VIEWBOX.radius + 8"
            />

            <g
              v-if="visitorPoint.visible"
              class="visitor-marker"
              :transform="`translate(${visitorPoint.x.toFixed(1)} ${visitorPoint.y.toFixed(1)})`"
            >
              <circle class="marker-pulse" r="34" />
              <circle class="marker-ring" r="13" />
              <circle class="marker-core" r="5.5" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.visitor-page {
  min-height: calc(100vh - 72px);
  overflow: clip;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.065) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.065) 1px, transparent 1px),
    linear-gradient(145deg, var(--ctp-mocha-crust), var(--ctp-mocha-base) 48%, var(--ctp-mocha-mantle));
  background-size: 44px 44px, 44px 44px, auto;
  color: var(--ctp-mocha-text);
}

.visitor-overview {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(1180px, calc(100% - 2rem));
  min-height: calc(100vh - 72px);
  margin: 0 auto;
  padding: 5.5rem 0 4.5rem;
  grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
  gap: 2rem;
  align-items: center;
}

.visitor-title-panel,
.info-panel {
  min-width: 0;
}

.visitor-title-panel {
  display: grid;
  gap: 1.25rem;
}

.kicker {
  margin: 0;
  color: var(--ctp-mocha-sky);
  font-family: 'Fira Code', monospace;
  font-size: 0.78rem;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
}

.welcome-line {
  width: min(360px, 82%);
  height: auto;
  margin-top: 0.35rem;
  object-fit: contain;
  filter:
    drop-shadow(0 0 22px rgba(var(--ctp-mocha-sky-rgb), 0.2))
    drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
}

.info-panel {
  display: grid;
  gap: 1.35rem;
  padding: 2rem;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.16);
  border-radius: 8px;
  background:
    linear-gradient(150deg, rgba(var(--ctp-mocha-surface1-rgb), 0.78), rgba(var(--ctp-mocha-base-rgb), 0.92)),
    var(--ctp-mocha-base);
  box-shadow:
    18px 22px 42px rgba(0, 0, 0, 0.34),
    -14px -14px 30px rgba(255, 255, 255, 0.024),
    inset 1px 1px 0 rgba(255, 255, 255, 0.05);
}

.panel-heading {
  display: grid;
  gap: 0.7rem;
}

.panel-heading h2,
.globe-overlay h2 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  line-height: 1.1;
}

.panel-heading h2 {
  font-size: 3rem;
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
    inset -4px -4px 10px rgba(255, 255, 255, 0.024);
}

.info-cell dt {
  margin: 0 0 0.45rem;
  color: var(--ctp-mocha-teal);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  letter-spacing: 0;
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
  letter-spacing: 0;
}

.traffic-strip strong {
  color: var(--ctp-mocha-peach);
  font-weight: 700;
}

.globe-scroll-section {
  position: relative;
  z-index: 1;
  height: 330vh;
  min-height: 2200px;
  margin-top: -2rem;
}

.globe-sticky {
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  min-height: 720px;
  overflow: hidden;
  cursor: grab;
  background:
    linear-gradient(180deg, rgba(var(--ctp-mocha-base-rgb), 0.02), rgba(var(--ctp-mocha-crust-rgb), 0.58)),
    linear-gradient(145deg, rgba(var(--ctp-mocha-surface0-rgb), 0.26), rgba(var(--ctp-mocha-crust-rgb), 0.68));
  touch-action: none;
  user-select: none;
}

.globe-sticky.is-dragging {
  cursor: grabbing;
}

.globe-stage {
  position: absolute;
  inset: 0;
}

.globe-svg {
  position: absolute;
  top: 49%;
  left: 50%;
  width: min(1500px, 118vw);
  max-width: none;
  height: auto;
  opacity: var(--globe-opacity);
  transform: translate(-50%, calc(-50% + var(--globe-y))) scale(var(--globe-scale));
  transform-origin: center;
  transition: opacity 0.18s ease;
  filter: drop-shadow(0 38px 48px rgba(0, 0, 0, 0.32));
}

.globe-overlay {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(860px, calc(100% - 2rem));
  margin: 0 auto;
  padding-top: 7rem;
  gap: 0.9rem;
  justify-items: center;
  text-align: center;
  opacity: var(--overlay-opacity);
  pointer-events: none;
}

.globe-overlay h2 {
  max-width: 780px;
  font-size: 4rem;
}

.globe-overlay p {
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1.08rem;
  line-height: 1.6;
}

.globe-overlay button {
  pointer-events: auto;
  margin-top: 0.3rem;
  border: 1px solid rgba(var(--ctp-mocha-teal-rgb), 0.25);
  border-radius: 8px;
  padding: 0.68rem 1rem;
  background: rgba(var(--ctp-mocha-crust-rgb), 0.54);
  color: var(--ctp-mocha-teal);
  cursor: pointer;
  font-family: 'LXGW WenKai', serif;
  font-size: 0.96rem;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.globe-overlay button:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--ctp-mocha-teal-rgb), 0.52);
  background: rgba(var(--ctp-mocha-surface0-rgb), 0.74);
}

.globe-backdrop {
  fill: rgba(0, 0, 0, 0.32);
}

.globe-fill {
  fill: url(#visitor-globe-fill);
}

.globe-grid {
  fill: none;
  stroke: rgba(166, 173, 200, 0.18);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 0.45;
  vector-effect: non-scaling-stroke;
}

.globe-grid--parallel {
  stroke: rgba(166, 173, 200, 0.14);
}

.globe-land {
  fill: none;
  stroke: rgba(205, 214, 244, 0.34);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 0.52;
  vector-effect: non-scaling-stroke;
}

.visitor-region {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.visitor-region--under {
  stroke: rgba(var(--ctp-mocha-peach-rgb), 0.28);
  stroke-width: 18;
}

.visitor-region--core {
  stroke: var(--ctp-mocha-peach);
  stroke-width: 0.72;
  vector-effect: non-scaling-stroke;
}

.globe-rim {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.globe-rim--inner {
  stroke: rgba(205, 214, 244, 0.35);
  stroke-width: 0.75;
}

.globe-rim--outer {
  stroke: rgba(205, 214, 244, 0.22);
  stroke-width: 0.52;
}

.marker-pulse,
.marker-ring,
.marker-core {
  fill: var(--ctp-mocha-peach);
}

.marker-pulse {
  animation: markerPulse 1.9s ease-out infinite;
  opacity: 0.24;
}

.marker-ring {
  fill: none;
  stroke: var(--ctp-mocha-peach);
  stroke-width: 2.6;
  vector-effect: non-scaling-stroke;
}

.marker-core {
  stroke: var(--ctp-mocha-crust);
  stroke-width: 2.4;
  vector-effect: non-scaling-stroke;
}

@keyframes markerPulse {
  0% {
    r: 9;
    opacity: 0.34;
  }
  100% {
    r: 46;
    opacity: 0;
  }
}

@media (max-width: 980px) {
  .visitor-overview {
    grid-template-columns: 1fr;
    align-content: center;
  }

  h1 {
    font-size: 4.8rem;
  }

  .panel-heading h2 {
    font-size: 2.5rem;
  }

  .globe-overlay h2 {
    font-size: 3rem;
  }
}

@media (max-width: 640px) {
  .visitor-overview {
    width: min(100% - 2rem, 1180px);
    padding: 4.5rem 0 3rem;
  }

  h1 {
    font-size: 3.5rem;
  }

  .welcome-line {
    width: min(300px, 88%);
  }

  .info-panel {
    padding: 1.2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .globe-scroll-section {
    min-height: 1900px;
  }

  .globe-sticky {
    min-height: 640px;
  }

  .globe-svg {
    width: 1320px;
  }

  .globe-overlay {
    padding-top: 5.2rem;
  }

  .globe-overlay h2 {
    font-size: 2.35rem;
  }

}
</style>
