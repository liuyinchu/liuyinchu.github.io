<template>
  <section class="weather-app portal-widget" aria-label="Current weather" :aria-busy="loading">
    <div v-if="loading" class="weather-status" role="status">
      <img src="/portal-icons/weather-cloud.svg" alt="" class="weather-status-icon" />
      <h2 class="weather-city">{{ locationName }}</h2>
      <p class="weather-status-copy">Loading current weather…</p>
    </div>
    <div v-else-if="error" class="weather-status">
      <img src="/portal-icons/weather-cloud.svg" alt="" class="weather-status-icon" />
      <h2 class="weather-city">{{ locationName }}</h2>
      <p class="weather-status-copy" role="alert">Weather is unavailable right now.</p>
      <button class="weather-retry" type="button" @click="fetchWeatherData">Try again</button>
    </div>
    <div v-else-if="weatherInfo" class="weather-body">
      <header class="weather-overview">
        <div class="weather-summary">
          <h2 class="weather-city">{{ locationName }}</h2>
          <p class="weather-condition">{{ weatherInfo.text }}</p>
          <p class="weather-temperature" :aria-label="weatherInfo.temp + ' degrees Celsius'">
            <span>{{ weatherInfo.temp }}°</span><span class="weather-scale" aria-hidden="true">C</span>
          </p>
        </div>
        <img :src="conditionIcon" alt="" class="weather-condition-icon" />
      </header>
      <dl class="weather-metrics" aria-label="Weather details">
        <div v-for="metric in weatherMetrics" :key="metric.label" class="weather-metric">
          <dt class="weather-metric-label">
            <img :src="'/portal-icons/' + metric.icon + '.svg'" alt="" />
            <span>{{ metric.label }}</span>
          </dt>
          <dd class="weather-metric-value">{{ metric.value }}<span class="weather-metric-unit">{{ metric.unit }}</span></dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

// --- 核心配置 (请根据您的实际情况修改) ---

// 1. 您的和风天气公共密钥 (Your QWeather Public Key)
//    获取地址: https://dev.qweather.com/docs/configuration/project-and-key/
// ⚠️ 警告: 请务必替换为您自己的有效API Key。
const QWEATHER_API_KEY = '56b97062a8b1413586f388cffbb8c53a'; // 举例: 'abcdef1234567890abcdef1234567890'

// 2. 天气API Host (Weather API Host)
//    - 免费订阅用户: 通常无需修改以下默认值 'devapi.qweather.com'。
//    - 付费订阅用户: 请根据您在和风天气控制台获取的专属API域名替换。
const QWEATHER_WEATHER_API_HOST = 'nm6apvx4jf.re.qweatherapi.com'; // 付费用户请替换, e.g., 'api.qweather.com' 或您的专属域名

// 3. 固定的地点ID (用于获取天气数据)
// ⚠️ 请确认这是您希望获取天气的准确Location ID。您之前提到的是 '101280704' (珠海香洲区)。
const LOCATION_ID_FOR_WEATHER = '101280704';

// 4. 固定的显示城市名称
// ⚠️ 请确认这是您希望在界面上显示的城市名称。
const DISPLAY_CITY_NAME = 'Zhuhai'; // 例如 "珠海", "香洲区", "北京市" 等

// --- 响应式状态定义 ---
const weatherInfo = ref(null);      // 存储实时天气数据
const locationName = ref(DISPLAY_CITY_NAME); // 直接使用固定的城市名称
const loading = ref(true);          // 控制加载状态
const error = ref(null);            // 存储错误信息


// Use the reported condition without inferring forecasts or the current time.
const conditionIcon = computed(() => {
  const condition = (weatherInfo.value?.text || '').toLowerCase();
  let icon = 'cloud';
  if (/thunder|storm/.test(condition)) icon = 'storm';
  else if (/snow|sleet|ice|blizzard/.test(condition)) icon = 'snow';
  else if (/rain|drizzle|shower/.test(condition)) icon = 'rain';
  else if (/fog|mist|haze|dust|sand/.test(condition)) icon = 'fog';
  else if (/partly cloudy|few clouds/.test(condition)) icon = 'cloud-sun';
  else if (/sunny|clear/.test(condition)) icon = String(weatherInfo.value?.icon) === '150' ? 'moon' : 'sun';
  return '/portal-icons/weather-' + icon + '.svg';
});

const weatherMetrics = computed(() => {
  const now = weatherInfo.value;
  if (!now) return [];
  const metrics = [
    { label: 'Feels like', icon: 'thermometer', value: now.feelsLike, unit: '°C' },
    { label: 'Wind', icon: 'wind', value: now.windSpeed, unit: 'km/h' },
    { label: 'Humidity', icon: 'droplets', value: now.humidity, unit: '%' },
  ];
  if (now.pressure != null && now.pressure !== '') {
    metrics.push({ label: 'Pressure', icon: 'gauge', value: now.pressure, unit: 'hPa' });
  }
  if (now.vis != null && now.vis !== '') {
    metrics.push({ label: 'Visibility', icon: 'eye', value: Number(now.vis).toFixed(1), unit: 'km' });
  }
  return metrics;
});

/**
 * 统一的 API 请求辅助函数 (与之前版本相同)
 * @param {string} apiUrl - 完整的API请求URL
 * @param {string} apiKey - 和风天气API Key
 * @param {string} apiNameForError - API的名称，用于错误日志中区分
 * @returns {Promise<any>} 解析后的JSON数据
 * @throws {Error} 当请求失败或API返回非200业务代码时抛出
 */
const fetchQWeatherApi = async (apiUrl, apiKey, apiNameForError) => {
  const headers = {
    'X-QW-Api-Key': apiKey,
  };
  const response = await fetch(apiUrl, { headers });
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

/**
 * 获取天气数据的主函数 (已简化，不再获取地理位置名称)
 */
const fetchWeatherData = async () => {
  loading.value = true;
  error.value = null;

  if (QWEATHER_API_KEY === 'YOUR_QWEATHER_PUBLIC_KEY' || !QWEATHER_API_KEY) {
    error.value = '配置错误：请在组件代码中设置有效的和风天气 API Key。';
    loading.value = false;
    console.error(error.value);
    return;
  }

  const weatherApiUrl = `https://${QWEATHER_WEATHER_API_HOST}/v7/weather/now?location=${LOCATION_ID_FOR_WEATHER}&lang=en`;

  try {
    const weatherResponse = await fetchQWeatherApi(weatherApiUrl, QWEATHER_API_KEY, 'Weather API');

    if (weatherResponse && weatherResponse.now) {
      weatherInfo.value = weatherResponse.now;
    } else {
      throw new Error('天气API响应结构异常："now"字段缺失。');
    }

  } catch (e) {
    console.error('获取天气数据失败:', e);
    let detailedErrorMessage = `加载天气数据失败: ${e.message}`;
    const errorMsgLower = e.message.toLowerCase();

    // 错误原因分析 (与之前类似，但现在只针对天气API)
    if (errorMsgLower.includes('qweather code: 401') || errorMsgLower.includes('status 401') || errorMsgLower.includes('qweather code: 403') || errorMsgLower.includes('status 403')) {
      detailedErrorMessage += '\n原因分析: API Key认证失败。请检查API Key是否正确、有效、已激活，或与当前配置的API Host是否匹配。';
    } else if (errorMsgLower.includes('qweather code: 400')) {
      detailedErrorMessage += '\n原因分析: 请求参数错误或无效。请检查Location ID ('+ LOCATION_ID_FOR_WEATHER +')格式或API请求参数。';
    } else if (errorMsgLower.includes('qweather code: 402')) {
      detailedErrorMessage += '\n原因分析: 超过API调用限制或账户余额不足。';
    } else if (errorMsgLower.includes('qweather code: 404') || errorMsgLower.includes('status 404')) {
      detailedErrorMessage += '\n原因分析: 请求的资源未找到。可能是API Host配置不正确，或者查询的Location ID ('+ LOCATION_ID_FOR_WEATHER +')不存在/服务不支持。请仔细核对API Host和Location ID。';
    } else if (errorMsgLower.includes('qweather code: 429')) {
      detailedErrorMessage += '\n原因分析: 请求过于频繁，请稍后再试。';
    } else if (errorMsgLower.includes('networkerror') || errorMsgLower.includes('failed to fetch')) {
      detailedErrorMessage += '\n原因分析: 网络连接问题。请检查您的网络连接。';
    } else {
      detailedErrorMessage += '\n请检查网络连接及API配置。';
    }
    error.value = detailedErrorMessage;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWeatherData();
});
</script>

<style scoped>
.weather-app {
  container-type: inline-size;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
  color: var(--app-text, #f8f9fc);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  font-size: 13px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, .28) transparent;
}
.weather-app::-webkit-scrollbar { width: 6px; height: 6px; }
.weather-app::-webkit-scrollbar-track { background: transparent; }
.weather-app::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, .28); border-radius: 999px; }
.weather-app::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, .42); }
.weather-app::-webkit-scrollbar-corner { background: transparent; }
.weather-body { padding: 16px 20px 20px; }
.weather-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}
.weather-summary { min-width: 0; }
.weather-city {
  margin: 0;
  color: var(--app-text, #f8f9fc);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -.45px;
  line-height: 1.25;
}
.weather-condition {
  margin: 4px 0 6px;
  color: var(--app-muted, rgba(255, 255, 255, .68));
  font-size: 13px;
  line-height: 1.4;
}
.weather-temperature {
  display: flex;
  align-items: baseline;
  margin: 0;
  color: var(--app-text, #f8f9fc);
  font-size: 72px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -4px;
  font-variant-numeric: tabular-nums;
}
.weather-scale {
  margin-left: 5px;
  color: var(--app-muted, rgba(255, 255, 255, .68));
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0;
}
.weather-condition-icon {
  width: 86px;
  height: 86px;
  flex-shrink: 0;
  margin-right: 8px;
  opacity: .95;
  filter: brightness(0) invert(1) drop-shadow(0 5px 14px rgba(139, 188, 255, .16));
}
.weather-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}
.weather-metric {
  grid-column: span 2;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--app-line, rgba(255, 255, 255, .12));
  border-radius: 13px;
  background: var(--app-fill, rgba(255, 255, 255, .065));
}
.weather-metric:nth-child(-n + 2) { grid-column: span 3; }
.weather-metric-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--app-muted, rgba(255, 255, 255, .68));
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
}
.weather-metric-label img { width: 13px; height: 13px; opacity: .75; filter: brightness(0) invert(1); }
.weather-metric-value {
  margin: 5px 0 0;
  color: var(--app-text, #f8f9fc);
  font-size: 21px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -.4px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.weather-metric-unit {
  margin-left: 4px;
  color: var(--app-muted, rgba(255, 255, 255, .68));
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0;
}
.weather-status {
  display: flex;
  min-height: 100%;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  text-align: center;
}
.weather-status-icon { width: 42px; height: 42px; margin-bottom: 12px; opacity: .75; filter: brightness(0) invert(1); }
.weather-status-copy { margin: 8px 0 0; color: var(--app-muted, rgba(255, 255, 255, .68)); line-height: 1.5; }
.weather-retry {
  margin-top: 16px;
  padding: 7px 15px;
  border: 1px solid var(--app-line, rgba(255, 255, 255, .12));
  border-radius: 8px;
  background: var(--app-control-bg, rgba(255, 255, 255, .10));
  color: var(--app-text, #f8f9fc);
  font: inherit;
  cursor: pointer;
}
.weather-retry:hover { background: rgba(255, 255, 255, .17); }
.weather-retry:focus-visible { outline: 2px solid var(--app-accent, #8bbcff); outline-offset: 3px; }
@container (max-width: 360px) {
  .weather-body { padding: 12px 14px 16px; }
  .weather-overview { gap: 12px; margin-bottom: 14px; }
  .weather-city { font-size: 20px; }
  .weather-temperature { font-size: 64px; }
  .weather-condition-icon { width: 68px; height: 68px; margin-right: 2px; }
  .weather-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .weather-metric, .weather-metric:nth-child(-n + 2) { grid-column: span 1; }
  .weather-metric:last-child:nth-child(odd) { grid-column: 1 / -1; }
}
</style>