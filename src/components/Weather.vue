<template>
  <div class="weather-container">
    <div v-if="loading" class="loading-state">Loading weather data...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else-if="weatherInfo" class="weather-content">
      <p class="summary-text">
        Today in <span class="highlight-city">{{ locationName }}</span>,
        it will be <span class="highlight-desc">{{ weatherInfo.text }}</span>,
        with <span class="highlight-temp">{{ weatherInfo.temp }}°C</span>
      </p>

      <ul class="details-list">
        <li>
          <span class="bullet">•</span> Feels like temperature is
          <span class="detail-value">{{ weatherInfo.feelsLike }}°C</span>
        </li>
        <li>
          <span class="bullet">•</span> Wind speed in your Location is
          <span class="detail-value">{{ weatherInfo.windSpeed }} km/h</span>
        </li>
        <li>
          <span class="bullet">•</span> And humidity
          <span class="detail-value">{{ weatherInfo.humidity }}%</span>
        </li>
        <li v-if="weatherInfo.pressure">
          <span class="bullet">•</span> Pressure
          <span class="detail-value">{{ weatherInfo.pressure }} hPa</span>
        </li>
        <li v-if="weatherInfo.vis">
          <span class="bullet">•</span> Visibility
          <span class="detail-value">{{ Number(weatherInfo.vis).toFixed(1) }} km</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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
/* 样式部分保持不变 */
.weather-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1.5rem;
  box-sizing: border-box;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', sans-serif;
  justify-content: center;
  align-items: flex-start;
}

.loading-state, .error-state {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 1.1rem;
  color: var(--ctp-mocha-overlay1);
  text-align: center;
}

.error-state {
  color: var(--ctp-mocha-red);
  white-space: pre-line;
}

.weather-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.summary-text {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--ctp-mocha-text);
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.highlight-city {
  color: var(--ctp-mocha-peach);
  font-weight: 700;
}

.highlight-desc {
  color: var(--ctp-mocha-lavender);
  font-weight: 600;
  text-transform: capitalize;
}

.highlight-temp {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--ctp-mocha-sky);
  display: inline-block;
  margin-left: 0.5rem;
}

.details-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.95rem;
  color: var(--ctp-mocha-subtext0);
}

.details-list li {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.bullet {
  color: var(--primary-color);
  margin-right: 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
  flex-shrink: 0;
}

.detail-value {
  color: var(--ctp-mocha-text);
  font-weight: 600;
  margin-left: 0.25rem;
  white-space: nowrap;
}
</style>