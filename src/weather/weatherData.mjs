export const WEATHER_ENDPOINTS = {
  current: '/v7/weather/now',
  hourly: '/v7/weather/24h',
  daily: '/v7/weather/7d',
}

export function createWeatherSections() {
  return Object.fromEntries(Object.keys(WEATHER_ENDPOINTS).map(name => [
    name, { data: null, updatedAt: null, error: null, loading: false },
  ]))
}

// Each section settles independently; a failed refresh keeps its last successful observation.
export async function refreshWeatherSections(request, previous, onUpdate = () => {}, names = ['current', 'hourly', 'daily']) {
  const defaults = createWeatherSections()
  const sections = Object.fromEntries(Object.keys(defaults).map(name => [
    name, { ...defaults[name], ...previous?.[name] },
  ]))
  await Promise.all(names.map(async name => {
    sections[name] = { ...sections[name], loading: true, error: null }
    onUpdate(name, { ...sections[name] })
    try {
      const payload = await request(WEATHER_ENDPOINTS[name])
      const data = name === 'current' ? payload?.now : payload?.[name]
      const valid = name === 'current'
        ? data && typeof data === 'object' && !Array.isArray(data)
        : Array.isArray(data) && data.length > 0
      if (!valid) throw new Error('Missing weather data')
      sections[name] = {
        data,
        updatedAt: payload.updateTime || (name === 'current' ? data.obsTime : null) || null,
        error: null,
        loading: false,
      }
    } catch {
      sections[name] = { ...sections[name], loading: false, error: 'Unable to load ' + name + ' weather.' }
    }
    onUpdate(name, { ...sections[name] })
  }))
  return sections
}
