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
export async function streamVideoChunk(blob, createdAt) {
  const formData = new FormData()
  formData.append('createdAt', createdAt)
  formData.append('fileChunk', blob)
  const res = await fetch(`${BASE}/api/v1/video/stream`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
}

export async function uploadVideo(file) {
  const today = new Date().toISOString().slice(0, 10)
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/api/v1/video?startAt=${today}T00:00:00&endAt=${today}T23:59:59`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function fetchVideoDownload(id) {
  const res = await fetch(`${BASE}/api/v1/video/${id}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res
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

export async function fetchWeatherImpact(day) {
  return post('/api/v1/analytics/weather-impact', { day })
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

export async function fetchDailyVisits(date) {
  return get(`/api/v1/analytics/visits/daily?date=${date}`)
}

// AI 챗봇
export async function sendChatMessage(message, videoId, context) {
  return post('/api/v1/ai/chat', { message, videoId, context })
}
