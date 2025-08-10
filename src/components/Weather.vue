<template>
  <div class="weather-container">
    <div v-if="loading" class="loading-state">Loading weather data...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else-if="weatherInfo" class="weather-content">
      <p class="summary-text">
        Today in <span class="highlight-city">{{ locationName }}</span> ,
        it will be <span class="highlight-desc">{{ weatherInfo.text }}</span> ,
        with <span class="highlight-temp">{{ weatherInfo.temp }}°C</span> .
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
/* ===== 容器：柔和玻璃感 + 细描边 + 内边距优化 ===== */
.weather-container {
  transform: scale(0.999);
  transform-origin: top center;

  --card-bg: rgba(255,255,255,0.03);
  --card-bd: rgba(255,255,255,0.08);
  --card-bd-strong: rgba(255,255,255,0.14);
  --chip-bg: rgba(255,255,255,0.06);
  --chip-bd: rgba(255,255,255,0.12);

  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.1rem 1.25rem; /* 收紧左右，拉大整体密度 */
  box-sizing: border-box;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  justify-content: center;
  align-items: stretch;

  background: linear-gradient(180deg, var(--card-bg), transparent 120%),
              radial-gradient(120% 90% at 10% -10%, rgba(116,199,236,0.09), transparent 40%),
              radial-gradient(120% 90% at 100% 0%, rgba(203,166,247,0.06), transparent 45%);
  border: 1px solid var(--card-bd);
  border-radius: 14px;
  backdrop-filter: saturate(115%) blur(6px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}

/* ===== 状态：加载/错误 ===== */
.loading-state, .error-state {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px dashed var(--card-bd);
}

/* 骨架微动效（loading） */
.loading-state {
  font-size: 1.05rem;
  color: var(--ctp-mocha-overlay1);
  position: relative;
  overflow: hidden;
}
.loading-state::after{
  content:"";
  position:absolute; inset:0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer{
  100% { transform: translateX(100%); }
}

.error-state {
  color: var(--ctp-mocha-red);
  white-space: pre-line;
  border-color: color-mix(in oklab, var(--ctp-mocha-red) 35%, transparent);
  background: color-mix(in oklab, var(--ctp-mocha-red) 8%, transparent);
}

/* ===== 内容主体 ===== */
.weather-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  background: none !important; /* 去掉深色背景 */
  box-shadow: none !important; /* 去掉阴影 */
  border-radius: 0 !important; /* 去掉圆角 */
  padding: 0; /* 去掉额外间距 */
}

/* ===== 概要句：层级更清晰，数值更突出 ===== */
.summary-text {
  margin: 0;
  font-weight: 600;
  line-height: 1.45;
  color: var(--ctp-mocha-text);
  font-size: clamp(1.05rem, 0.92rem + 0.6vw, 1.6rem);
  letter-spacing: 0.1px;
}

/* 城市名：暖色强调 */
.highlight-city {
  color: var(--ctp-mocha-peach);
  font-weight: 800;
}

/* 天气描述：淡紫强调，首字母已在模板中处理为 capitalize */
.highlight-desc {
  color: var(--ctp-mocha-lavender);
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  border-radius: 0.5rem;
  background: rgba(203,166,247,0.12);
  border: 1px solid rgba(203,166,247,0.28);
}

/* 温度：大号数字 + 轻投影，视觉锚点 */
.highlight-temp {
  display: inline-block;
  margin-left: 0.4rem;
  font-weight: 900;
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
  color: var(--ctp-mocha-sky);
  text-shadow: 0 2px 12px rgba(116,199,236,0.25);
  transform: translateY(1px);
}

/* ===== 细节列表：对齐规整，加入分隔线与数值“胶囊” ===== */
.details-list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  font-size: clamp(0.88rem, 0.84rem + 0.2vw, 1rem);
  color: var(--ctp-mocha-subtext0);
  display: grid;
  grid-template-columns: 1fr;   /* 你若想双列：改 repeat(2,minmax(0,1fr)) */
  row-gap: 0.35rem;
}

.details-list li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 0.4rem;
  padding: 0.4rem 0.25rem;
  border-bottom: 1px dashed var(--card-bd);
}
.details-list li:last-child { border-bottom: 0; }

/* 子弹点：几何圆点，不抢主色 */
.bullet {
  width: 10px; height: 10px;
  display: inline-block;
  line-height: 10px;
  text-indent: -9999px; /* 隐藏原字符 */
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--ctp-mocha-sky), var(--ctp-mocha-blue));
  box-shadow: 0 0 0 2px rgba(255,255,255,0.06);
  margin-right: 0.25rem;
}

/* 数值胶囊：与主题协调的玻璃态 chip */
.detail-value {
  justify-self: end;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-bd);
  color: var(--ctp-mocha-text);
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
  min-width: 4ch;
  text-align: right;
}

/* ===== 交互微动效（整体 hover 轻微提亮） ===== */
.weather-container:hover {
  border-color: var(--card-bd-strong);
  box-shadow: 0 10px 28px rgba(0,0,0,0.22);
}

/* ===== 小屏优化：行距与字号略收紧 ===== */
@media (max-width: 460px) {
  .weather-container { padding: 0.9rem 1rem; }
  .details-list { row-gap: 0.25rem; }
  .details-list li { padding: 0.3rem 0.1rem; }
}

/* KILL the dark panel on the container itself */
.weather-container {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  border-radius: 0 !important; /* 如需保持外层卡片圆角，可删掉这行 */
  padding: 0 0rem !important; /* 保留你原先的左右内边距 */
}

/* 保险：如果之前加过伪元素做遮罩，一并关掉 */
.weather-container::before,
.weather-container::after {
  content: none !important;
  display: none !important;
  background: none !important;
  box-shadow: none !important;
}

/* 内容块保持透明，防止内层再加底色 */
.weather-content {
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
}
</style>