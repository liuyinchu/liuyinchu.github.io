<template>
  <div class="weather-container">
    <div v-if="loading" class="loading-state">Loading weather data...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else-if="weatherData" class="weather-content">
      <p class="summary-text">
        Today in <span class="highlight-city">{{ weatherData.location.name }}</span>,
        it will be <span class="highlight-desc">{{ weatherData.current.weather_descriptions[0] }}</span>,
        with <span class="highlight-temp">{{ weatherData.current.temperature }}°C</span>
      </p>

      <ul class="details-list">
        <li>
          <span class="bullet">•</span> Feels like temperature is
          <span class="detail-value">{{ weatherData.current.feelslike }}°C</span>
        </li>
        <li>
          <span class="bullet">•</span> Wind speed in your Location is
          <span class="detail-value">{{ weatherData.current.wind_speed }} kmph</span>
        </li>
        <li>
          <span class="bullet">•</span> And humidity
          <span class="detail-value">{{ weatherData.current.humidity }}%</span>
        </li>
        <li v-if="weatherData.current.pressure">
          <span class="bullet">•</span> Pressure
          <span class="detail-value">{{ weatherData.current.pressure }} mb</span>
        </li>
        <li v-if="weatherData.current.visibility">
          <span class="bullet">•</span> Visibility
          <span class="detail-value">{{ weatherData.current.visibility }} km</span>
        </li>
        <li v-if="weatherData.current.precip > 0"> <span class="bullet">•</span> Precipitation
          <span class="detail-value">{{ weatherData.current.precip }} mm</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const weatherData = ref(null)
const loading = ref(true)
const error = ref(null)

const API_KEY = '43f74d4d7804cabcfc6be9c5876eb845' // ⚠️ 请替换为你自己的 API Key
const CITY = 'Zhuhai' // 默认城市，已改为截图中的“珠海”

const fetchWeather = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://api.weatherstack.com/current?access_key=${API_KEY}&query=${CITY}&units=m`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.info || 'Unknown Weatherstack API error');
    }
    
    weatherData.value = data;
  } catch (e) {
    console.error('Failed to fetch weather data:', e);
    if (e.message.includes('status: 403')) {
        error.value = 'Failed to load weather data: Access denied. Please check your API key.';
    } else if (e.message.includes('Unknown Weatherstack API error')) {
        error.value = `Failed to load weather data: ${e.message}.`;
    }
    else {
        error.value = `Failed to load weather data: ${e.message}. Please check your network connection or API key.`;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
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
  color: var(--ctp-mocha-peach); /* 城市名强调色改为 Peach */
  font-weight: 700;
}

.highlight-desc {
  color: var(--ctp-mocha-lavender); /* 天气描述强调色保持 Lavender */
  font-weight: 600;
  text-transform: capitalize;
}

.highlight-temp {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--ctp-mocha-sky); /* 温度强调色改为 Sky */
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
  display: flex; /* 使用 flex 布局 */
  align-items: baseline;
  flex-wrap: wrap; /* 允许换行，防止长文本溢出或粘连 */
}

.bullet {
  color: var(--primary-color);
  margin-right: 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
  flex-shrink: 0; /* 小圆点不收缩 */
}

.detail-value {
  color: var(--ctp-mocha-text);
  font-weight: 600;
  margin-left: 0.25rem; /* 增加值与前一个文本的间距 */
  white-space: nowrap; /* 尝试避免数值和单位断行 */
}
</style>