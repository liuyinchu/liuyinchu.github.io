import test from 'node:test'
import assert from 'node:assert/strict'
import {
  numberOrNull, formatLocalHour, formatLocalTime, formatForecastDay, formatTimeZoneLabel,
  temperatureDomain, temperatureRange, solarSummary, uvCategory,
} from '../src/weather/weatherModel.mjs'
import {
  WEATHER_ENDPOINTS, createWeatherSections, refreshWeatherSections,
} from '../src/weather/weatherData.mjs'

test('missing numbers stay missing, while measured zero stays zero', () => {
  for (const value of [null, undefined, '', '  ', 'unknown', false, NaN, Infinity]) {
    assert.equal(numberOrNull(value), null)
  }
  assert.equal(numberOrNull('0'), 0)
  assert.equal(numberOrNull(0), 0)
  assert.equal(numberOrNull('-2.5'), -2.5)
})

test('time labels use Shanghai across midnight and input offsets', () => {
  assert.equal(formatLocalTime('2026-10-24T16:35:00Z'), '00:35')
  assert.equal(formatLocalHour('2026-10-24T09:35:00-07:00'), '00:00')
  assert.equal(formatLocalTime('2026-10-25T00:35:00+08:00'), '00:35')
  assert.equal(formatLocalTime(null), '—')
  assert.equal(formatLocalHour('invalid'), '—')
})

test('forecast dates remain calendar dates and Today uses Shanghai', () => {
  const now = Date.parse('2026-10-24T16:01:00Z')
  assert.equal(formatForecastDay('2026-10-25', now), 'Today')
  assert.equal(formatForecastDay('2026-10-24', now), 'Sat')
  assert.equal(formatForecastDay('2026-10-26', now), 'Mon')
  assert.equal(formatForecastDay('2026-02-30', now), '—')
})

test('temperature ranges use a shared real domain including negative and zero readings', () => {
  const daily = [{ tempMin: '-5', tempMax: '0' }, { tempMin: '0', tempMax: '15' }]
  const domain = temperatureDomain(daily)
  assert.deepEqual(domain, { min: -5, max: 15 })
  assert.deepEqual(temperatureRange(daily[0], domain), { left: 0, width: 25 })
  assert.deepEqual(temperatureRange(daily[1], domain), { left: 25, width: 75 })
  assert.equal(temperatureRange({ tempMin: null, tempMax: '15' }, domain), null)
  assert.equal(temperatureDomain([{ tempMin: '', tempMax: null }]), null)
})

test('equal temperatures render a finite point without inventing a temperature range', () => {
  const day = { tempMin: '0', tempMax: '0' }
  assert.deepEqual(temperatureRange(day, temperatureDomain([day])), { left: 50, width: 0 })
})

test('solar progress uses the forecast date and Shanghai sunrise and sunset', () => {
  const day = { fxDate: '2026-10-25', sunrise: '06:00', sunset: '18:00' }
  assert.deepEqual(solarSummary(day, Date.parse('2026-10-25T04:00:00Z')), {
    sunrise: '06:00', sunset: '18:00', daylightMinutes: 720, progress: 0.5, isDay: true,
  })
  assert.equal(solarSummary(day, Date.parse('2026-10-24T16:00:00Z')).isDay, false)
  assert.equal(solarSummary(day, Date.parse('2026-10-24T16:00:00Z')).progress, 0)
  assert.equal(solarSummary(day, Date.parse('2026-10-25T10:00:00Z')).isDay, false)
  assert.equal(solarSummary(day, Date.parse('2026-10-25T10:00:00Z')).progress, 1)
})

test('missing solar data does not fabricate daylight or day/night status', () => {
  assert.deepEqual(solarSummary({ fxDate: '2026-10-25', sunrise: '06:00' }), {
    sunrise: '06:00', sunset: null, daylightMinutes: null, progress: null, isDay: null,
  })
  assert.deepEqual(solarSummary(null), {
    sunrise: null, sunset: null, daylightMinutes: null, progress: null, isDay: null,
  })
})

test('UV categories preserve a true zero and established boundaries', () => {
  assert.equal(uvCategory(null), null)
  assert.equal(uvCategory(''), null)
  for (const [value, label, level] of [[0, 'Low', 1], [3, 'Moderate', 2], [6, 'High', 3], [8, 'Very high', 4], [11, 'Extreme', 5]]) {
    assert.deepEqual(uvCategory(String(value)), { label, level })
  }
})

test('the same instant uses each city timezone for hours and Today', () => {
  const now = '2026-07-01T08:35:00Z'
  const zones = [
    ['Asia/Shanghai', '16:35', '2026-07-01'],
    ['America/Los_Angeles', '01:35', '2026-07-01'],
    ['Pacific/Honolulu', '22:35', '2026-06-30'],
  ]
  for (const [zone, time, today] of zones) {
    assert.equal(formatLocalTime(now, zone), time)
    assert.equal(formatLocalHour(now, zone), time.slice(0, 2) + ':00')
    assert.equal(formatForecastDay(today, now, zone), 'Today')
    assert.equal(formatForecastDay('2026-07-02', now, zone), 'Thu')
  }
  assert.equal(formatForecastDay('2026-06-30', now, 'America/Los_Angeles'), 'Tue')
  assert.equal(formatForecastDay('2026-07-01', now, 'Pacific/Honolulu'), 'Wed')
})

test('Los Angeles hour and timezone labels follow the timestamp in summer and winter', () => {
  const zone = 'America/Los_Angeles'
  assert.equal(formatLocalTime('2026-07-01T12:00:00Z', zone), '05:00')
  assert.equal(formatLocalTime('2026-01-01T12:00:00Z', zone), '04:00')
  assert.equal(formatTimeZoneLabel('2026-07-01T12:00:00Z', zone), 'PDT')
  assert.equal(formatTimeZoneLabel('2026-01-01T12:00:00Z', zone), 'PST')
  assert.equal(formatTimeZoneLabel('2026-03-08T09:59:00Z', zone), 'PST')
  assert.equal(formatTimeZoneLabel('2026-03-08T10:00:00Z', zone), 'PDT')
})

test('solar events use their own Los Angeles offsets across both DST transitions', () => {
  const zone = 'America/Los_Angeles'
  for (const [date, sunrise, midpoint, sunset] of [
    ['2026-03-08', '2026-03-08T13:00:00Z', '2026-03-08T19:00:00Z', '2026-03-09T01:00:00Z'],
    ['2026-11-01', '2026-11-01T14:00:00Z', '2026-11-01T20:00:00Z', '2026-11-02T02:00:00Z'],
  ]) {
    const day = { fxDate: date, sunrise: '06:00', sunset: '18:00' }
    assert.deepEqual(solarSummary(day, midpoint, zone), {
      sunrise: '06:00', sunset: '18:00', daylightMinutes: 720, progress: 0.5, isDay: true,
    })
    assert.equal(solarSummary(day, sunrise, zone).progress, 0)
    assert.equal(solarSummary(day, sunrise, zone).isDay, true)
    assert.equal(solarSummary(day, sunset, zone).progress, 1)
    assert.equal(solarSummary(day, sunset, zone).isDay, false)
    assert.equal(solarSummary(day, Date.parse(sunrise) - 60000, zone).isDay, false)
  }
})

test('Honolulu solar times and zone labels stay on UTC minus ten in both seasons', () => {
  const zone = 'Pacific/Honolulu'
  for (const date of ['2026-01-01', '2026-07-01']) {
    assert.equal(formatLocalTime(date + 'T12:00:00Z', zone), '02:00')
    assert.equal(formatTimeZoneLabel(date + 'T12:00:00Z', zone), 'HST')
    assert.equal(solarSummary({ fxDate: date, sunrise: '06:00', sunset: '18:00' }, date + 'T22:00:00Z', zone).progress, 0.5)
  }
})

test('missing dates and solar values remain missing in non-default zones', () => {
  assert.equal(formatLocalTime(null, 'America/Los_Angeles'), '—')
  assert.equal(formatLocalHour('invalid', 'Pacific/Honolulu'), '—')
  assert.equal(formatTimeZoneLabel(null, 'Pacific/Honolulu'), 'Local time')
  assert.equal(formatForecastDay('2026-02-30', Date.now(), 'America/Los_Angeles'), '—')
  assert.deepEqual(solarSummary({ fxDate: '2026-07-01', sunrise: '06:00' }, Date.now(), 'Pacific/Honolulu'), {
    sunrise: '06:00', sunset: null, daylightMinutes: null, progress: null, isDay: null,
  })
})

const stamp = '2026-10-25T08:00:00+08:00'
const currentPayload = { now: { temp: '0', obsTime: stamp } }
const hourlyPayload = { updateTime: stamp, hourly: [{ fxTime: stamp, temp: '1', pop: '0' }] }
const dailyPayload = { updateTime: stamp, daily: [{ fxDate: '2026-10-25', tempMin: '0', tempMax: '10' }] }

test('partial successes are retained and each section reports loading and settled state', async () => {
  const events = []
  const sections = await refreshWeatherSections(async path => {
    if (path === WEATHER_ENDPOINTS.current) return currentPayload
    if (path === WEATHER_ENDPOINTS.hourly) throw new Error('network failed')
    return dailyPayload
  }, createWeatherSections(), (name, state) => events.push({ name, ...state }))
  assert.equal(sections.current.data.temp, '0')
  assert.equal(sections.current.updatedAt, stamp)
  assert.deepEqual(sections.daily.data, dailyPayload.daily)
  assert.equal(sections.hourly.data, null)
  assert.ok(sections.hourly.error)
  for (const name of Object.keys(WEATHER_ENDPOINTS)) {
    assert.deepEqual(events.filter(event => event.name === name).map(event => event.loading), [true, false])
  }
})

test('all failed requests settle without rejecting the refresh', async () => {
  const sections = await refreshWeatherSections(async () => { throw new Error('offline') })
  for (const state of Object.values(sections)) {
    assert.equal(state.loading, false)
    assert.equal(state.data, null)
    assert.equal(state.updatedAt, null)
    assert.ok(state.error)
  }
})

test('failed refresh keeps old data and its original time without mutating previous state', async () => {
  const previous = createWeatherSections()
  previous.hourly = { data: hourlyPayload.hourly, updatedAt: stamp, error: null, loading: false }
  const snapshot = structuredClone(previous)
  const sections = await refreshWeatherSections(async () => { throw new Error('offline') }, previous)
  assert.deepEqual(sections.hourly.data, hourlyPayload.hourly)
  assert.equal(sections.hourly.updatedAt, stamp)
  assert.ok(sections.hourly.error)
  assert.deepEqual(previous, snapshot)
})

test('retry only requests its specified section and replaces its timestamp on success', async () => {
  const previous = createWeatherSections()
  previous.current = { data: currentPayload.now, updatedAt: stamp, error: null, loading: false }
  previous.hourly.error = 'Unavailable'
  const calls = []
  const nextStamp = '2026-10-25T09:00:00+08:00'
  const sections = await refreshWeatherSections(async path => {
    calls.push(path)
    return { ...hourlyPayload, updateTime: nextStamp }
  }, previous, () => {}, ['hourly'])
  assert.deepEqual(calls, ['/v7/weather/24h'])
  assert.deepEqual(sections.current, previous.current)
  assert.equal(sections.hourly.updatedAt, nextStamp)
  assert.equal(sections.hourly.error, null)
  assert.deepEqual(sections.daily, previous.daily)
})

test('missing or empty forecast payloads fail locally and retain the previous timestamp', async () => {
  const previous = createWeatherSections()
  previous.daily = { data: dailyPayload.daily, updatedAt: stamp, error: null, loading: false }
  const sections = await refreshWeatherSections(async path => path === WEATHER_ENDPOINTS.daily ? { daily: [] } : {}, previous)
  assert.ok(sections.current.error)
  assert.ok(sections.hourly.error)
  assert.ok(sections.daily.error)
  assert.equal(sections.daily.updatedAt, stamp)
  assert.deepEqual(sections.daily.data, dailyPayload.daily)
})

test('provider update time takes precedence over current observation time', async () => {
  const updateTime = '2026-10-25T08:15:00+08:00'
  const sections = await refreshWeatherSections(async () => ({ ...currentPayload, updateTime }), undefined, undefined, ['current'])
  assert.equal(sections.current.updatedAt, updateTime)
})
