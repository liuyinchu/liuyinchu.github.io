// District IDs and zones: https://github.com/qwd/LocationList/blob/master/China-City-List-latest.csv
// Irvine: QWeather GeoAPI, California / United States (6C810).
// Waikiki uses a coordinate point, not a city ID: https://forecast.weather.gov/MapClick.php?lat=21.28000&lon=-157.83000
export const weatherCities = [
  { id: 'zhuhai', label: '珠海 · 香洲区', name: 'Zhuhai', detail: 'Xiangzhou, Guangdong', location: '101280704', timeZone: 'Asia/Shanghai' },
  { id: 'chengdu', label: '成都 · 武侯区', name: 'Chengdu', detail: 'Wuhou, Sichuan', location: '101270119', timeZone: 'Asia/Shanghai' },
  { id: 'guangzhou', label: '广州 · 天河区', name: 'Guangzhou', detail: 'Tianhe, Guangdong', location: '101280109', timeZone: 'Asia/Shanghai' },
  { id: 'irvine', label: '加州 · 尔湾', name: 'Irvine', detail: 'California, United States', location: '6C810', timeZone: 'America/Los_Angeles' },
  { id: 'waikiki', label: '夏威夷 · Waikiki', name: 'Waikiki', detail: 'Honolulu, Hawaii', location: '-157.83,21.28', timeZone: 'Pacific/Honolulu' },
  { id: 'nanchong', label: '南充 · 顺庆区', name: 'Nanchong', detail: 'Shunqing, Sichuan', location: '101270508', timeZone: 'Asia/Shanghai' },
]

export const defaultWeatherCity = weatherCities[0]

export function findWeatherCity(id) {
  return weatherCities.find(city => city.id === id) || defaultWeatherCity
}
