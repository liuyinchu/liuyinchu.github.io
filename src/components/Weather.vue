<template>
  <section ref="appElement" class="weather-app portal-widget" :aria-label="selectedCity.name + ' weather'" @scroll.passive="updateCityMenuGeometry">
    <div class="weather-body">
      <header class="weather-toolbar">
        <div ref="cityPicker" class="weather-city-picker">
          <h2><button ref="cityTrigger" class="weather-city-trigger" type="button" :aria-expanded="cityMenuOpen" aria-controls="weather-city-options" :aria-label="'Choose weather city, current ' + selectedCity.name" @click="toggleCityMenu"><span>{{ selectedCity.name }}</span><img src="/portal-icons/chevron-right.svg" alt="" :class="{ 'is-open': cityMenuOpen }" /></button></h2>
          <p class="weather-updated">{{ sections.current.loading ? 'Updating weather…' : sections.current.updatedAt ? 'Updated ' + localTime(sections.current.updatedAt) + ' · ' + timeZoneLabel(sections.current.updatedAt) : 'Local weather · ' + timeZoneLabel(observedAt) }}</p>
          <div v-if="cityMenuOpen" id="weather-city-options" class="weather-city-menu" role="group" aria-label="Weather cities" :style="cityMenuStyle" data-liquid-surface data-liquid-kind="menu">
            <canvas class="weather-city-optics" data-liquid-local-optics aria-hidden="true"></canvas>
            <div ref="cityMenu" class="weather-city-list">
              <button v-for="city in weatherCities" :key="city.id" class="weather-city-option" type="button" :aria-pressed="selectedCity.id === city.id" @click="selectCity(city)">
                <span><strong>{{ city.label }}</strong><small>{{ city.name }}</small></span>
                <img v-if="selectedCity.id === city.id" src="/portal-icons/check.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
        <button class="weather-icon-button" type="button" :disabled="busy" :aria-label="busy ? 'Updating weather' : 'Refresh weather'" title="Refresh weather" @click="refresh()">
          <img src="/portal-icons/refresh-cw.svg" alt="" :class="{ 'weather-refreshing': busy }" />
        </button>
      </header>

      <div v-if="sections.current.error" class="weather-notice" role="status">
        <span>{{ current ? 'Could not update current conditions. Showing the last observation.' : 'Current conditions are unavailable.' }}</span>
        <button type="button" :disabled="busy" @click="refresh(['current'])">Retry</button>
      </div>
      <div class="weather-hero" :class="{ 'weather-hero-pending': !current }">
        <template v-if="current">
          <div class="weather-hero-main">
            <img :src="weatherIcon(current.icon)" alt="" class="weather-hero-icon weather-symbol" @error="iconFallback" />
            <p class="weather-temperature" :aria-label="numeric(current.temp) + ' degrees Celsius'">{{ numeric(current.temp) }}<span class="weather-degree">°</span><span class="weather-scale">C</span></p>
          </div>
          <p class="weather-condition">{{ current.text || 'Current conditions' }}</p>
          <p class="weather-high-low"><span>H: {{ degree(today?.tempMax) }}</span><span>L: {{ degree(today?.tempMin) }}</span><span class="weather-hero-feels">Feels like {{ degree(current.feelsLike) }}</span></p>
        </template>
        <p v-else class="weather-empty" role="status">{{ sections.current.loading ? 'Getting the latest conditions…' : 'Weather will appear here when available.' }}</p>
      </div>

      <section class="weather-card weather-hourly" aria-labelledby="weather-hourly-title">
        <header class="weather-card-heading">
          <h3 id="weather-hourly-title">24-hour forecast</h3>
          <div class="weather-scroll-controls">
            <button type="button" class="weather-icon-button weather-scroll-button" aria-label="Earlier hours" :disabled="!canScrollBack" @click="scrollHours(-1)"><img src="/portal-icons/chevron-left.svg" alt="" /></button>
            <button type="button" class="weather-icon-button weather-scroll-button" aria-label="Later hours" :disabled="!canScrollForward" @click="scrollHours(1)"><img src="/portal-icons/chevron-right.svg" alt="" /></button>
          </div>
        </header>
        <div v-if="sections.hourly.error" class="weather-notice weather-notice-inline" role="status">
          <span>{{ hours.length ? 'Forecast update failed. Showing saved hours.' : 'Hourly forecast is unavailable.' }}</span>
          <button type="button" :disabled="busy" @click="refresh(['hourly'])">Retry</button>
        </div>
        <div v-if="hours.length" ref="hourlyTrack" class="weather-hourly-track" aria-label="Select an hour for details" @scroll.passive="updateScrollState">
          <button v-for="(hour, index) in hours" :key="hour.fxTime" type="button" class="weather-hour" :class="{ 'is-selected': selectedHour === index }" :aria-pressed="selectedHour === index" :aria-label="localHour(hour.fxTime) + ', ' + (hour.text || '') + ', ' + degree(hour.temp)" @click="selectedHour = index" @keydown="navigateHour($event, index)">
            <span class="weather-hour-time">{{ localHour(hour.fxTime) }}</span>
            <img :src="weatherIcon(hour.icon)" alt="" class="weather-hour-icon weather-symbol" @error="iconFallback" />
            <span class="weather-hour-temperature">{{ degree(hour.temp) }}</span>
            <span class="weather-hour-pop">{{ numberOrNull(hour.pop) == null ? '' : numeric(hour.pop) + '%' }}</span>
          </button>
        </div>
        <p v-else class="weather-empty" role="status">{{ sections.hourly.loading ? 'Loading the next 24 hours…' : 'No hourly forecast to display.' }}</p>
        <p v-if="activeHour" class="weather-hour-detail"><strong>{{ localHour(activeHour.fxTime) }} · {{ activeHour.text || 'Forecast' }}</strong><span>Wind {{ measure(activeHour.windSpeed, 'km/h') }} · Humidity {{ measure(activeHour.humidity, '%') }}<template v-if="numberOrNull(activeHour.pop) != null"> · Precip. chance {{ measure(activeHour.pop, '%') }}</template><template v-if="numberOrNull(activeHour.precip) != null"> · Precipitation {{ measure(activeHour.precip, 'mm') }}</template></span></p>
        <p v-if="sections.hourly.updatedAt" class="weather-section-updated">{{ sections.hourly.loading ? 'Refreshing · ' : '' }}Forecast updated {{ localTime(sections.hourly.updatedAt) }} {{ timeZoneLabel(sections.hourly.updatedAt) }}</p>
      </section>

      <div class="weather-lower-grid">
        <section class="weather-card weather-daily" aria-labelledby="weather-daily-title">
          <header class="weather-card-heading"><h3 id="weather-daily-title">7-day forecast</h3><span class="weather-heading-note">Low / High</span></header>
          <div v-if="sections.daily.error" class="weather-notice weather-notice-inline" role="status">
            <span>{{ days.length ? 'Forecast update failed. Showing saved days.' : 'Daily forecast is unavailable.' }}</span>
            <button type="button" :disabled="busy" @click="refresh(['daily'])">Retry</button>
          </div>
          <div v-for="day in days" :key="day.fxDate" class="weather-day" :class="{ 'is-open': expandedDay === day.fxDate }">
            <button type="button" class="weather-day-row" :aria-expanded="expandedDay === day.fxDate" :aria-controls="'weather-day-' + day.fxDate" :aria-label="forecastDay(day.fxDate, observedAt) + ', ' + (day.textDay || '') + ', low ' + degree(day.tempMin) + ', high ' + degree(day.tempMax) + '. Show daily details'" @click="expandedDay = expandedDay === day.fxDate ? null : day.fxDate">
              <span class="weather-day-label">{{ forecastDay(day.fxDate, observedAt) }}</span>
              <img :src="weatherIcon(day.iconDay)" :alt="day.textDay || ''" class="weather-day-icon weather-symbol" @error="iconFallback" />
              <span class="weather-day-low">{{ degree(day.tempMin) }}</span>
              <span class="weather-range" aria-hidden="true">
                <span v-if="temperatureRange(day, domain)" class="weather-range-fill" :style="rangeStyle(day)"></span>
                <span v-if="forecastDay(day.fxDate, observedAt) === 'Today' && currentPoint != null" class="weather-range-current" :style="{ left: currentPoint + '%' }"></span>
              </span>
              <span class="weather-day-high">{{ degree(day.tempMax) }}</span>
            </button>
            <div v-if="expandedDay === day.fxDate" :id="'weather-day-' + day.fxDate" class="weather-day-detail">
              <p>{{ day.textDay || '—' }} by day · {{ day.textNight || '—' }} at night</p>
              <dl><div><dt>Day wind</dt><dd>{{ day.windDirDay || '—' }} {{ measure(day.windSpeedDay, 'km/h') }}</dd></div><div><dt>Precipitation</dt><dd>{{ measure(day.precip, 'mm') }}</dd></div><div><dt>Sunrise</dt><dd>{{ day.sunrise || '—' }}</dd></div><div><dt>Sunset</dt><dd>{{ day.sunset || '—' }}</dd></div></dl>
            </div>
          </div>
          <p v-if="!days.length" class="weather-empty" role="status">{{ sections.daily.loading ? 'Loading the week ahead…' : 'No daily forecast to display.' }}</p>
          <p v-if="sections.daily.updatedAt" class="weather-section-updated">{{ sections.daily.loading ? 'Refreshing · ' : '' }}Forecast updated {{ localTime(sections.daily.updatedAt) }} {{ timeZoneLabel(sections.daily.updatedAt) }}</p>
        </section>

        <div class="weather-metric-grid" aria-label="Weather details">
          <article class="weather-card weather-metric">
            <h3><img src="/portal-icons/thermometer.svg" alt="" />Feels like</h3>
            <p class="weather-metric-value">{{ degree(current?.feelsLike) }}</p>
            <p class="weather-metric-copy">{{ feelsDescription }}</p>
          </article>
          <article class="weather-card weather-metric">
            <h3><img src="/portal-icons/droplets.svg" alt="" />Humidity</h3>
            <p class="weather-metric-value">{{ measure(current?.humidity, '%') }}</p>
            <p class="weather-metric-copy">Dew point {{ degree(current?.dew) }}</p>
          </article>
          <article class="weather-card weather-metric">
            <h3><img src="/portal-icons/wind.svg" alt="" />Wind</h3>
            <p class="weather-metric-value">{{ numeric(current?.windSpeed) }}<span>km/h</span></p>
            <p class="weather-metric-copy">{{ current?.windDir || 'Direction unavailable' }}<template v-if="numberOrNull(current?.windScale) != null"> · Force {{ current.windScale }}</template></p>
          </article>
          <article class="weather-card weather-metric">
            <h3><img src="/portal-icons/weather-sun.svg" alt="" />Today's UV</h3>
            <p class="weather-metric-value">{{ numeric(today?.uvIndex) }}<span>{{ uv?.label || '' }}</span></p>
            <div v-if="uv" class="weather-uv-track" aria-hidden="true"><i :style="{ left: ((uv.level - 1) / 4 * 100) + '%' }"></i></div>
            <p class="weather-metric-copy">Daily forecast index</p>
          </article>
          <article class="weather-card weather-metric weather-sun-card">
            <h3><img :src="solar.isDay ? '/portal-icons/sunset.svg' : '/portal-icons/sunrise.svg'" alt="" />Sunrise &amp; sunset</h3>
            <div class="weather-sun-times"><span><img src="/portal-icons/sunrise.svg" alt="" />{{ solar.sunrise || '—' }}</span><span><img src="/portal-icons/sunset.svg" alt="" />{{ solar.sunset || '—' }}</span></div>
            <div v-if="solar.progress != null" class="weather-daylight-track" :aria-label="'Daylight progress ' + Math.round(solar.progress * 100) + '%'"><span :style="{ width: (solar.progress * 100) + '%' }"></span></div>
            <p class="weather-metric-copy">{{ daylightDescription }}</p>
          </article>
          <article class="weather-card weather-metric weather-observation-card">
            <div><h3><img src="/portal-icons/eye.svg" alt="" />Visibility</h3><p class="weather-small-value">{{ measure(current?.vis, 'km') }}</p></div>
            <div><h3><img src="/portal-icons/gauge.svg" alt="" />Pressure</h3><p class="weather-small-value">{{ measure(current?.pressure, 'hPa') }}</p></div>
          </article>
        </div>
      </div>
      <footer class="weather-footer"><span>Weather data by <a href="https://www.qweather.com/" target="_blank" rel="noopener noreferrer">QWeather</a></span><span>Icons: <a href="https://icons.qweather.com/" target="_blank" rel="noopener noreferrer">QWeather</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></span></footer>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { weatherCities, defaultWeatherCity, findWeatherCity } from '../weather/weatherCities.mjs';
import { createWeatherSections, refreshWeatherSections } from '../weather/weatherData.mjs';
import { numberOrNull, formatLocalHour, formatLocalTime, formatForecastDay, formatTimeZoneLabel, temperatureDomain, temperatureRange, solarSummary, uvCategory } from '../weather/weatherModel.mjs';

// --- 核心配置 (请根据您的实际情况修改) ---

// 1. 您的和风天气公共密钥 (Your QWeather Public Key)
//    获取地址: https://dev.qweather.com/docs/configuration/project-and-key/
// ⚠️ 警告: 请务必替换为您自己的有效API Key。
const QWEATHER_API_KEY = '56b97062a8b1413586f388cffbb8c53a'; // 举例: 'abcdef1234567890abcdef1234567890'

// 2. 天气API Host (Weather API Host)
//    - 免费订阅用户: 通常无需修改以下默认值 'devapi.qweather.com'。
//    - 付费订阅用户: 请根据您在和风天气控制台获取的专属API域名替换。
const QWEATHER_WEATHER_API_HOST = 'nm6apvx4jf.re.qweatherapi.com'; // 付费用户请替换, e.g., 'api.qweather.com' 或您的专属域名

const fetchQWeatherApi = async (apiUrl, apiKey, apiNameForError, signal) => {
  const headers = {
    'X-QW-Api-Key': apiKey,
  };
  const response = await fetch(apiUrl, { headers, signal });
  if (!response.ok) {
    let errorDetails = `HTTP Status ${response.status}: ${response.statusText || 'No status text'}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.code) {
        errorDetails += ` (QWeather Code: ${errorData.code}, Message: ${errorData.message || 'No message'})`;
      }
    } catch (e) { /* 忽略解析JSON错误 */ }
    throw new Error(`${apiNameForError} request failed. ${errorDetails}`);
  }
  const data = await response.json();
  if (data.code !== '200') {
    throw new Error(`${apiNameForError} returned error. QWeather Code: ${data.code}. Message: ${data.message || 'Unknown QWeather API error.'}`);
  }
  return data;
};


// Section data stays independent so one failed forecast cannot erase current conditions.
const sections = ref(createWeatherSections());
const selectedCity = ref(defaultWeatherCity);
const cityStorageKey = 'portal.weather.city';
const localTime = iso => formatLocalTime(iso, selectedCity.value.timeZone);
const localHour = iso => formatLocalHour(iso, selectedCity.value.timeZone);
const forecastDay = (date, now) => formatForecastDay(date, now, selectedCity.value.timeZone);
const timeZoneLabel = iso => formatTimeZoneLabel(iso, selectedCity.value.timeZone);
const current = computed(() => sections.value.current.data);
const hours = computed(() => (sections.value.hourly.data || []).slice(0, 24));
const days = computed(() => (sections.value.daily.data || []).slice(0, 7));
const observedAt = ref(Date.now());
const today = computed(() => days.value.find(day => forecastDay(day.fxDate, observedAt.value) === 'Today'));
const domain = computed(() => temperatureDomain(days.value));
const solar = computed(() => solarSummary(today.value, observedAt.value, selectedCity.value.timeZone));
const uv = computed(() => uvCategory(today.value?.uvIndex));
const busy = computed(() => Object.values(sections.value).some(section => section.loading));
const selectedHour = ref(0);
const expandedDay = ref(null);
const activeHour = computed(() => hours.value[selectedHour.value] || hours.value[0]);
const appElement = ref(null);
const hourlyTrack = ref(null);
const canScrollBack = ref(false);
const canScrollForward = ref(false);
const cityPicker = ref(null);
const cityTrigger = ref(null);
const cityMenu = ref(null);
const cityMenuOpen = ref(false);
const cityMenuStyle = ref({});
let cityResizeObserver;
let requestId = 0;
let controller;
let disposed = false;
let resizeObserver;
let localClock;

const numeric = value => numberOrNull(value) == null ? '—' : String(numberOrNull(value));
const degree = value => numberOrNull(value) == null ? '—' : numeric(value) + '°';
const measure = (value, unit) => numberOrNull(value) == null ? '—' : numeric(value) + (unit === '%' ? '' : ' ') + unit;
const weatherIcon = code => '/weather-icons/' + (/^\d{3,4}$/.test(String(code)) ? code : '999') + '.svg';
function iconFallback(event) {
  if (!event.target.src.endsWith('/999.svg')) event.target.src = '/weather-icons/999.svg';
}
const feelsDescription = computed(() => {
  const air = numberOrNull(current.value?.temp);
  const feels = numberOrNull(current.value?.feelsLike);
  if (air == null || feels == null) return 'Perceived temperature';
  if (Math.abs(air - feels) < 1) return 'Similar to the actual temperature';
  return Math.abs(feels - air) + '° ' + (feels > air ? 'warmer' : 'cooler') + ' than the actual temperature';
});
const daylightDescription = computed(() => {
  if (solar.value.daylightMinutes == null) return 'Sun times in local time';
  const minutes = Math.round(solar.value.daylightMinutes);
  return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm of daylight · Local time';
});
const currentPoint = computed(() => {
  const value = numberOrNull(current.value?.temp);
  const scale = domain.value;
  if (value == null || !scale || value < scale.min || value > scale.max) return null;
  return scale.max === scale.min ? 50 : (value - scale.min) / (scale.max - scale.min) * 100;
});
function rangeStyle(day) {
  const range = temperatureRange(day, domain.value);
  return range ? { left: range.left + '%', width: range.width + '%' } : {};
}
function updateCityMenuGeometry() {
  if (!cityMenuOpen.value || !appElement.value || !cityTrigger.value) return;
  const root = appElement.value.getBoundingClientRect();
  const trigger = cityTrigger.value.getBoundingClientRect();
  const toolbar = cityPicker.value.parentElement.getBoundingClientRect();
  const below = Math.max(0, Math.min(root.bottom, window.innerHeight) - trigger.bottom - 12);
  const above = Math.max(0, trigger.top - Math.max(root.top, 0) - 12);
  const opensAbove = below < 100 && above > below;
  cityMenuStyle.value = {
    width: Math.min(320, toolbar.width) + 'px',
    maxHeight: Math.min(352, opensAbove ? above : below) + 'px',
    top: opensAbove ? 'auto' : trigger.bottom - toolbar.top + 5 + 'px',
    bottom: opensAbove ? toolbar.bottom - trigger.top + 5 + 'px' : 'auto',
  };
}
function closeCityMenu(returnFocus = false) {
  window.removeEventListener('keydown', dismissCityMenu, true);
  cityMenuOpen.value = false;
  if (returnFocus) cityTrigger.value?.focus({ preventScroll: true });
}
async function toggleCityMenu() {
  if (cityMenuOpen.value) return closeCityMenu();
  cityMenuOpen.value = true;
  // Resolve Escape before Portal's window-level close shortcut, regardless of the key target.
  window.addEventListener('keydown', dismissCityMenu, true);
  updateCityMenuGeometry();
  await nextTick();
  if (!cityMenuOpen.value || disposed) return;
  const selected = cityMenu.value?.querySelector('[aria-pressed="true"]');
  selected?.focus({ preventScroll: true });
  if (selected) cityMenu.value.scrollTop = selected.offsetTop - cityMenu.value.clientHeight / 2 + selected.clientHeight / 2;
}
function dismissCityMenu(event) {
  if (event.key !== 'Escape' || !cityMenuOpen.value || cityPicker.value?.closest('[inert]')) return;
  event.preventDefault();
  event.stopPropagation();
  closeCityMenu(true);
}
function dismissCityMenuOutside(event) {
  if (cityMenuOpen.value && !cityPicker.value?.contains(event.target)) closeCityMenu();
}
function selectCity(city) {
  closeCityMenu(true);
  if (city.id === selectedCity.value.id) return;
  // Invalidate before aborting: even an already settled old response cannot publish.
  requestId += 1;
  controller?.abort();
  selectedCity.value = city;
  sections.value = createWeatherSections();
  selectedHour.value = 0;
  expandedDay.value = null;
  if (hourlyTrack.value) hourlyTrack.value.scrollLeft = 0;
  updateScrollState();
  observedAt.value = Date.now();
  try { localStorage.setItem(cityStorageKey, city.id); } catch { /* Selection still works when storage is unavailable. */ }
  refresh();
}
function updateScrollState() {
  const element = hourlyTrack.value;
  canScrollBack.value = !!element && element.scrollLeft > 2;
  canScrollForward.value = !!element && element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
}
function scrollHours(direction) {
  const element = hourlyTrack.value;
  if (!element) return;
  element.scrollBy({ left: direction * element.clientWidth * .75, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function navigateHour(event, index) {
  let target = index;
  if (event.key === 'ArrowRight') target = Math.min(hours.value.length - 1, index + 1);
  else if (event.key === 'ArrowLeft') target = Math.max(0, index - 1);
  else if (event.key === 'Home') target = 0;
  else if (event.key === 'End') target = hours.value.length - 1;
  else return;
  event.preventDefault();
  selectedHour.value = target;
  hourlyTrack.value?.querySelectorAll('button')[target]?.focus({ preventScroll: true });
  hourlyTrack.value?.querySelectorAll('button')[target]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
watch(hourlyTrack, element => {
  resizeObserver?.disconnect();
  if (element) {
    resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
  }
  updateScrollState();
});
async function refresh(names = ['current', 'hourly', 'daily']) {
  if (busy.value || disposed) return;
  const city = selectedCity.value;
  const id = ++requestId;
  controller = new AbortController();
  const signal = controller.signal;
  const ownsRequest = () => !disposed && id === requestId && selectedCity.value.id === city.id;
  const request = path => fetchQWeatherApi(
    'https://' + QWEATHER_WEATHER_API_HOST + path + '?location=' + encodeURIComponent(city.location) + '&lang=en',
    QWEATHER_API_KEY, 'Weather API', signal,
  );
  await refreshWeatherSections(request, sections.value, (name, section) => {
    if (!ownsRequest()) return;
    sections.value[name] = section;
    observedAt.value = Date.now();
  }, names);
  if (!ownsRequest()) return;
  selectedHour.value = Math.min(selectedHour.value, Math.max(0, hours.value.length - 1));
  await nextTick();
  if (!ownsRequest()) return;
  updateScrollState();
}
onMounted(() => {
  try { selectedCity.value = findWeatherCity(localStorage.getItem(cityStorageKey)); } catch { /* Use the default city without storage. */ }
  document.addEventListener('pointerdown', dismissCityMenuOutside, true);
  document.addEventListener('focusin', dismissCityMenuOutside);
  window.addEventListener('resize', updateCityMenuGeometry);
  cityResizeObserver = new ResizeObserver(updateCityMenuGeometry);
  cityResizeObserver.observe(appElement.value);
  refresh();
  // Advance daylight and local day labels without making network requests.
  localClock = setInterval(() => { observedAt.value = Date.now(); }, 60_000);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', dismissCityMenu, true);
  disposed = true;
  requestId += 1;
  controller?.abort();
  resizeObserver?.disconnect();
  cityResizeObserver?.disconnect();
  clearInterval(localClock);
  document.removeEventListener('pointerdown', dismissCityMenuOutside, true);
  document.removeEventListener('focusin', dismissCityMenuOutside);
  window.removeEventListener('resize', updateCityMenuGeometry);
});
</script>

<style scoped>
.weather-app {
  container-type: inline-size; width: 100%; height: 100%; min-height: 0; overflow: auto;
  box-sizing: border-box; color: var(--app-text, #f8f9fc); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  font-size: 13px; line-height: 1.4; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.28) transparent;
}
.weather-app *, .weather-app *::before, .weather-app *::after { box-sizing: border-box; }
.weather-body { padding: 17px 22px 16px; }
.weather-app h2, .weather-app h3, .weather-app p { margin: 0; }
.weather-app button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.weather-app button:disabled { cursor: default; opacity: .35; }
.weather-app button:focus-visible, .weather-app a:focus-visible { outline: 2px solid #acd9ff; outline-offset: 3px; }
.weather-toolbar { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.weather-toolbar h2 { font-size: 23px; font-weight: 600; letter-spacing: -.6px; }
.weather-city-picker { min-width: 0; }
.weather-city-trigger { display: flex; align-items: center; gap: 8px; min-height: 44px; max-width: 100%; padding: 0; border: 0; border-radius: 7px; background: transparent; text-align: left; }
.weather-city-trigger span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.weather-city-trigger img { width: 15px; height: 15px; flex-shrink: 0; filter: brightness(0) invert(1); opacity: .65; transform: rotate(90deg); transition: transform .15s; }
.weather-city-trigger img.is-open { transform: rotate(-90deg); }
.weather-city-trigger:hover img { opacity: 1; }
.weather-city-menu { position: absolute; z-index: 5; left: 0; display: flex; flex-direction: column; max-width: 100%; padding: 5px; overflow: hidden; isolation: isolate; border: 1px solid rgba(255,255,255,.16); border-top-color: rgba(255,255,255,.3); border-bottom-color: rgba(255,255,255,.08); border-radius: 18px; background: linear-gradient(145deg,rgba(255,255,255,.06),transparent 44%), rgba(27,32,42,.42); backdrop-filter: blur(22px) saturate(115%); -webkit-backdrop-filter: blur(22px) saturate(115%); box-shadow: 0 14px 34px rgba(0,0,0,.2), 0 3px 8px rgba(0,0,0,.08), inset 0 .5px rgba(255,255,255,.13); }
.weather-city-optics { display: none; position: absolute; z-index: 0; inset: -.5px; width: calc(100% + 1px); height: calc(100% + 1px); border-radius: inherit; pointer-events: none; opacity: .32; }
.has-liquid-webgl .weather-city-optics { display: block; }
.weather-city-list { position: relative; z-index: 1; flex: 0 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; border-radius: 12px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.26) transparent; }
.weather-city-option { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; width: 100%; padding: 7px 10px; border: 0; border-radius: 11px; background: transparent; text-align: left; transition: background-color .14s, box-shadow .14s; }
.weather-city-option:hover { background: rgba(255,255,255,.065); }
.weather-city-option[aria-pressed="true"] { background: rgba(174,207,248,.13); box-shadow: inset 0 .5px rgba(255,255,255,.12); }
.weather-city-option:focus-visible { outline-offset: -2px; }
.weather-city-option strong, .weather-city-option small { display: block; }
.weather-city-option strong { font-size: 12px; font-weight: 500; line-height: 1.45; }
.weather-city-option small { margin-top: 2px; font-size: 10px; color: var(--app-muted, #c6d1df); }
.weather-city-option img { width: 16px; height: 16px; flex-shrink: 0; filter: brightness(0) invert(1); }
.weather-updated { font-size: 11px; color: var(--app-muted, #c6d1df); margin-top: 2px !important; }
.weather-icon-button { width: 36px; height: 36px; display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; border: 1px solid var(--app-line, rgba(255,255,255,.13)); background: rgba(255,255,255,.055); border-radius: 50%; transition: background .15s; }
.weather-icon-button:hover:not(:disabled) { background: rgba(255,255,255,.14); }
.weather-icon-button img { width: 16px; height: 16px; filter: brightness(0) invert(1); opacity: .9; }
.weather-refreshing { animation: weather-rotate 1.2s linear infinite; }
.weather-hero { min-height: 146px; padding: 12px 0 17px; text-align: center; }
.weather-hero-main { display: flex; align-items: center; justify-content: center; gap: 16px; }
.weather-hero-icon { width: 64px; height: 64px; opacity: .94; }
.weather-symbol { filter: brightness(0) invert(1); object-fit: contain; }
.weather-temperature { font-size: 76px; font-weight: 250; letter-spacing: -4px; line-height: 1.08; font-variant-numeric: tabular-nums; }
.weather-degree { letter-spacing: -3px; }
.weather-scale { margin-left: 3px; font-size: 19px; font-weight: 400; letter-spacing: 0; color: var(--app-muted, #c6d1df); }
.weather-condition { font-size: 15px; margin-top: 2px !important; font-weight: 500; }
.weather-high-low { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 5px !important; font-size: 12px; }
.weather-hero-feels { color: var(--app-muted, #c6d1df); }
.weather-hero-pending { display: flex; align-items: center; justify-content: center; }
.weather-card { min-width: 0; border: 1px solid var(--app-line, rgba(255,255,255,.12)); border-radius: 16px; background: var(--app-fill, rgba(255,255,255,.055)); }
.weather-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 40px; padding: 4px 13px; }
.weather-card-heading h3, .weather-metric h3 { font-size: 11px; line-height: 1.3; font-weight: 600; color: var(--app-muted, #c6d1df); }
.weather-card-heading h3 { letter-spacing: .35px; text-transform: uppercase; }
.weather-scroll-controls { display: flex; gap: 4px; }
.weather-scroll-button { width: 28px; height: 28px; background: transparent; border-color: transparent; }
.weather-scroll-button img { width: 14px; height: 14px; }
.weather-hourly-track { display: flex; gap: 4px; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.18) transparent; padding: 2px 10px 7px; scroll-padding: 10px; }
.weather-hour { display: flex; flex-direction: column; align-items: center; flex: 0 0 58px; gap: 6px; min-height: 108px; padding: 8px 4px 5px; border: 1px solid transparent; border-radius: 12px; background: transparent; }
.weather-hour:hover { background: rgba(255,255,255,.065); }
.weather-hour.is-selected { border-color: rgba(181,216,255,.25); background: rgba(170,205,255,.12); }
.weather-hour-time { color: var(--app-muted, #c6d1df); font-size: 11px; }
.weather-hour-icon { width: 24px; height: 24px; }
.weather-hour-temperature { font-size: 16px; font-weight: 500; }
.weather-hour-pop { min-height: 13px; font-size: 10px; color: #b5ddff; line-height: 1.1; }
.weather-hour-detail { display: flex; flex-wrap: wrap; gap: 3px 10px; padding: 8px 13px 1px; border-top: 1px solid var(--app-line, rgba(255,255,255,.1)); font-size: 10px; color: var(--app-muted, #c6d1df); }
.weather-hour-detail strong { color: var(--app-text, #f8f9fc); font-weight: 500; }
.weather-section-updated { padding: 6px 13px 9px; color: var(--app-muted, #c6d1df); font-size: 9px; }
.weather-lower-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: start; gap: 12px; margin-top: 12px; }
.weather-heading-note { color: var(--app-muted, #c6d1df); font-size: 9px; }
.weather-day { margin: 0 12px; border-top: 1px solid var(--app-line, rgba(255,255,255,.1)); }
.weather-day-row { display: grid; grid-template-columns: 42px 24px 29px minmax(26px,1fr) 29px; gap: 7px; width: 100%; min-height: 43px; padding: 8px 0; border: 0; background: transparent; align-items: center; text-align: left; }
.weather-day-row:hover { background: rgba(255,255,255,.04); }
.weather-day-label { font-size: 12px; font-weight: 500; }
.weather-day-icon { width: 22px; height: 22px; }
.weather-day-low, .weather-day-high { text-align: right; font-variant-numeric: tabular-nums; font-size: 12px; }
.weather-day-low { color: var(--app-muted, #c6d1df); }
.weather-range { height: 4px; border-radius: 10px; position: relative; background: rgba(8,18,35,.18); }
.weather-range-fill { position: absolute; top: 0; height: 4px; min-width: 4px; border-radius: 10px; background: linear-gradient(90deg,#a5cfee,#e4d5a3); }
.weather-range-current { position: absolute; top: -2px; width: 8px; height: 8px; border: 2px solid rgba(39,57,83,.8); border-radius: 50%; background: white; transform: translateX(-50%); }
.weather-day-detail { padding: 0 0 12px; font-size: 10px; color: var(--app-muted, #c6d1df); }
.weather-day-detail dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 9px 0 0; }
.weather-day-detail dt { font-size: 9px; }
.weather-day-detail dd { margin: 2px 0 0; color: var(--app-text, #f8f9fc); }
.weather-metric-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 9px; }
.weather-metric { padding: 11px 12px; min-height: 102px; }
.weather-metric h3 { display: flex; align-items: center; gap: 5px; }
.weather-metric h3 img { width: 12px; height: 12px; filter: brightness(0) invert(1); opacity: .8; }
.weather-metric-value { font-size: 24px; font-weight: 400; letter-spacing: -.5px; margin: 8px 0 4px !important; line-height: 1.05; font-variant-numeric: tabular-nums; }
.weather-metric-value span { font-size: 10px; letter-spacing: 0; margin-left: 5px; font-weight: 400; color: var(--app-muted, #c6d1df); }
.weather-metric-copy { font-size: 10px; color: var(--app-muted, #c6d1df); line-height: 1.4; }
.weather-uv-track { height: 3px; margin: 8px 3px 7px; border-radius: 10px; background: linear-gradient(90deg,#8ac4b0,#d4cc8a,#daac81,#cb8d8d,#b59cc5); position: relative; }
.weather-uv-track i { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: white; top: -1.5px; transform: translateX(-50%); box-shadow: 0 0 0 1px rgba(0,0,0,.3); }
.weather-sun-card { grid-column: 1 / -1; min-height: 98px; }
.weather-sun-times { display: flex; justify-content: space-between; gap: 12px; font-size: 21px; font-weight: 400; margin-top: 9px; font-variant-numeric: tabular-nums; }
.weather-sun-times span { display: flex; align-items: center; gap: 6px; }
.weather-sun-times img { width: 18px; height: 18px; filter: brightness(0) invert(1); opacity: .7; }
.weather-daylight-track { height: 3px; border-radius: 4px; background: rgba(255,255,255,.13); margin: 8px 0; overflow: hidden; }
.weather-daylight-track span { display: block; height: 100%; background: #e6d6ae; border-radius: inherit; }
.weather-observation-card { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: auto; }
.weather-observation-card > div + div { padding-left: 12px; border-left: 1px solid var(--app-line, rgba(255,255,255,.1)); }
.weather-small-value { font-size: 15px; margin-top: 7px !important; font-variant-numeric: tabular-nums; }
.weather-notice { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 9px; background: rgba(235,180,110,.09); font-size: 11px; margin-top: 8px; }
.weather-notice-inline { margin: 0 10px 8px; }
.weather-notice button { border: 0; background: transparent; text-decoration: underline; text-underline-offset: 3px; padding: 6px; flex-shrink: 0; }
.weather-empty { text-align: center; padding: 20px 12px; color: var(--app-muted, #c6d1df); font-size: 12px; }
.weather-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; padding-top: 14px; font-size: 9px; color: var(--app-muted, #c6d1df); }
.weather-footer a { color: inherit; text-decoration: none; }
.weather-footer a:hover { text-decoration: underline; }
@keyframes weather-rotate { to { transform: rotate(360deg); } }
@container (max-width: 580px) {
  .weather-lower-grid { grid-template-columns: 1fr; }
  .weather-metric-grid { gap: 10px; }
  .weather-day-row { grid-template-columns: 48px 26px 34px minmax(40px,1fr) 34px; min-height: 46px; }
  .weather-metric { min-height: 105px; }
  .weather-observation-card { min-height: auto; }
}
@container (max-width: 360px) {
  .weather-body { padding: 13px 12px 16px; }
  .weather-toolbar h2 { font-size: 21px; }
  .weather-temperature { font-size: 68px; }
  .weather-hero-icon { width: 54px; height: 54px; }
  .weather-high-low { gap: 8px; font-size: 11px; }
  .weather-day-row { grid-template-columns: 39px 22px 27px minmax(26px,1fr) 27px; gap: 6px; }
  .weather-heading-note { display: none; }
}
@media (pointer: coarse), (max-width: 600px) {
  .weather-icon-button { min-width: 44px; min-height: 44px; }
  .weather-notice button { min-height: 44px; min-width: 44px; }
  .weather-day-row { min-height: 48px; }
}
@media (prefers-reduced-transparency: reduce) {
  .weather-city-menu { background: rgba(25,31,40,.96); backdrop-filter: none; -webkit-backdrop-filter: none; }
  .has-liquid-webgl .weather-city-optics { display: none; }
}
@media (forced-colors: active) {
  .weather-city-menu { color: CanvasText; background: Canvas; border: 1px solid CanvasText; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
  .has-liquid-webgl .weather-city-optics { display: none; }
  .weather-city-option small { color: GrayText; }
  .weather-city-option[aria-pressed="true"] { outline: 1px solid Highlight; outline-offset: -2px; box-shadow: none; }
  .weather-city-option:focus-visible { outline-color: Highlight; }
}
@media (prefers-reduced-motion: reduce) {
  .weather-app *, .weather-app *::before, .weather-app *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
</style>
