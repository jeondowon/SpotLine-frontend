const BASE = import.meta.env.VITE_API_BASE_URL

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// 영상
export async function uploadVideo(file, startAt, endAt) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/api/v1/video?startAt=${startAt}&endAt=${endAt}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function fetchVideoStatus(id) {
  return get(`/api/v1/video/${id}/status`)
}

// 통계
export async function fetchRawAnalytics(videoId) {
  return get(`/api/v1/analytics/raw?videoId=${videoId}`)
}

export async function fetchHourlyPopulation(startAt, endAt) {
  return post('/api/v1/analytics/hourly-population', { startAt, endAt })
}

export async function fetchCoreCustomers(startAt, endAt) {
  return post('/api/v1/analytics/core-customers', { startAt, endAt })
}

export async function fetchWeatherImpact(day, rain, temp) {
  return post('/api/v1/analytics/weather-impact', { day, rain, temp })
}

export async function fetchWeekdayPatterns(day, dayOfWeek) {
  return post('/api/v1/analytics/weekday-patterns', { day, dayOfWeek })
}

export async function fetchVisitCount(startAt, endAt) {
  return post('/api/v1/analytics/visits/count', { startAt, endAt })
}

export async function fetchTomorrowPrediction() {
  return post('/api/v1/analytics/predictions/tomorrow')
}

export async function fetchNextWeekPrediction() {
  return post('/api/v1/analytics/predictions/next-week')
}

export async function fetchDailyBriefing() {
  return post('/api/v1/analytics/daily-briefing')
}

export async function fetchMarketingRecommendations() {
  return post('/api/v1/analytics/marketing-recommendations')
}
