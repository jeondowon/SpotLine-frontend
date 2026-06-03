const BASE = import.meta.env.VITE_API_BASE_URL
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function get(path, params) {
  const url = params
    ? `${BASE}${path}?${new URLSearchParams(params)}`
    : `${BASE}${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API ${res.status}`)
}

// 영상
export function fetchYoloStream(signal) {
  return fetch(`${BASE}/api/v1/video/stream`, { signal })
}

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

// 통계 v1

export async function fetchHourlyPopulation(startAt, endAt) {
  return get('/api/v1/analytics/hourly-population', { startAt, endAt })
}

export async function fetchCoreCustomers(startAt, endAt) {
  return get('/api/v1/analytics/core-customers', { startAt, endAt })
}

export async function fetchWeatherImpact(startAt, endAt) {
  return get('/api/v1/analytics/weather-impact', { startAt, endAt })
}

export async function fetchWeekdayPatterns(startAt, endAt) {
  return get('/api/v1/analytics/weekday-patterns', { startAt, endAt })
}

export async function fetchTomorrowPrediction() {
  return get('/api/v1/analytics/predictions/tomorrow')
}

export async function fetchNextWeekPrediction() {
  return get('/api/v1/analytics/predictions/next-week')
}

export async function fetchDailyBriefing() {
  return get('/api/v1/analytics/daily-briefing')
}

export async function fetchMarketingRecommendations() {
  return get('/api/v1/analytics/marketing-recommendations')
}

export async function fetchDailyVisits(date) {
  return get('/api/v1/analytics/visits/daily', { date })
}

// 통계 v2
export async function fetchVisitTrend(startAt, endAt) {
  return get('/api/v2/analytics/visit-trend', { startAt, endAt })
}

export async function fetchCurrentCount() {
  return get('/api/v2/analytics/current-count')
}

export async function fetchPeekTime(startAt, endAt) {
  return get('/api/v2/analytics/peek-time', { startAt, endAt })
}

export async function fetchDailySales(startAt, endAt) {
  return get('/api/v2/analytics/daily-sales', { startAt, endAt })
}

export async function fetchBestMenu(startAt, endAt) {
  return get('/api/v2/analytics/best-menu', { startAt, endAt })
}

export async function fetchResponseWaitTime(startAt, endAt) {
  return get('/api/v2/analytics/response-wait-time', { startAt, endAt })
}

export async function fetchJustLeftCount(startAt, endAt) {
  return get('/api/v2/analytics/just-left-count', { startAt, endAt })
}

export async function fetchEmptyTableTime(startAt, endAt) {
  return get('/api/v2/analytics/empty-table-time', { startAt, endAt })
}

export async function fetchDailyCount(startAt, endAt) {
  return get('/api/v2/analytics/daily-count', { startAt, endAt })
}

export async function fetchCoreCustomerV2(startAt, endAt) {
  return get('/api/v2/analytics/core-customer', { startAt, endAt })
}

export async function fetchAvgDwell(startAt, endAt) {
  return get('/api/v2/analytics/avg-dwell', { startAt, endAt })
}

export async function fetchGenderDistribution(startAt, endAt) {
  return get('/api/v2/analytics/gender-distribution', { startAt, endAt })
}

export async function fetchStore() {
  return get('/api/v1/store')
}

export async function saveStore(store) {
  return put('/api/v1/store', store)
}

export async function deleteStore() {
  return del('/api/v1/store')
}

export async function searchAddress(query) {
  if (!KAKAO_REST_API_KEY || !query?.trim()) return []

  const params = new URLSearchParams({ query: query.trim(), size: '5' })
  const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?${params}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  })
  if (!res.ok) throw new Error(`Kakao API ${res.status}`)
  const data = await res.json()
  return (data.documents ?? []).map(item => ({
    id: item.address_name,
    address: item.road_address?.address_name || item.address_name,
    detail: item.road_address?.building_name || item.address?.region_3depth_name || '',
    latitude: Number(item.y),
    longitude: Number(item.x),
  }))
}

// AI 챗봇
export async function sendChatMessage(message, videoId, context) {
  return post('/api/v1/ai/chat', { message, videoId, context })
}
