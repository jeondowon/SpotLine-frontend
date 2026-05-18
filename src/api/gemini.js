const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash'

function buildDataSummary(videoData, feedback) {
  if (!videoData) return ''
  const summary = videoData.summary ?? {}
  const persons = videoData.persons ?? []
  const womanCount = persons.filter(p => p.gender === 'female').length
  const manCount = persons.filter(p => p.gender === 'male').length
  const gTotal = womanCount + manCount
  const femPct = gTotal > 0 ? Math.round((womanCount / gTotal) * 100) : 50
  const dwellSecs = summary.avg_dwell_time_seconds ?? 0
  const m = Math.floor(dwellSecs / 60)
  const s = Math.round(dwellSecs % 60)

  return [
    `방문자 수: ${summary.total_visitors ?? 0}명`,
    `혼잡도: ${summary.peak_congestion ?? '알 수 없음'}`,
    `평균 체류 시간: ${m}분 ${s}초`,
    `성별: 여성 ${femPct}%, 남성 ${100 - femPct}%`,
    feedback?.briefing?.message && `일일 브리핑: ${feedback.briefing.message}`,
    feedback?.marketing?.message && `마케팅 추천: ${feedback.marketing.message}`,
  ].filter(Boolean).join('\n')
}

export function buildSystemPrompt(videoData, feedback) {
  const data = buildDataSummary(videoData, feedback)
  return `당신은 매장 분석 AI 어시스턴트입니다.${data ? `\n\n현재 매장 분석 데이터:\n${data}\n\n이 데이터를 바탕으로` : ''} 점주가 운영 결정을 내릴 수 있도록 도와주세요. 구체적인 수치를 근거로 실질적인 조언을 제공하고, 한국어로 간결하게 답변하세요.`
}

const RETRY_DELAYS = [20000, 40000, 60000]

async function callGemini(apiKey, prompt, maxOutputTokens = 1024) {
  let res
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    res = await fetch(`${BASE}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens, temperature: 0.7 },
      }),
    })
    if (res.status !== 429) break
    if (attempt < RETRY_DELAYS.length) {
      await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]))
    }
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function generateSummary(videoData, feedback) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const data = buildDataSummary(videoData, feedback)
  const prompt = `다음 매장 데이터를 분석해주세요:\n${data}\n\n아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트 없이 오직 JSON만 반환하세요.\n\n{\n  "summary": "전체 상황을 2-3문장으로 요약 (한국어)"\n}`
  const text = await callGemini(apiKey, prompt, 512)
  return JSON.parse(text)
}

export async function generateInsightCards(videoData, feedback) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const data = buildDataSummary(videoData, feedback)
  const prompt = `다음 매장 데이터를 분석해주세요:\n${data}\n\n아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트 없이 오직 JSON만 반환하세요.\n\n{\n  "insights": [\n    {\n      "type": "opportunity 또는 warning 또는 trend 또는 success",\n      "title": "인사이트 제목 (15자 이내)",\n      "desc": "설명 (2-3문장, 한국어)",\n      "data": "근거 수치 (1줄)",\n      "action": "추천 액션 (1줄)"\n    }\n  ]\n}\n\ninsights 2~4개 생성하세요.`
  const text = await callGemini(apiKey, prompt, 1024)
  return JSON.parse(text)
}

export async function generateStrategies(videoData, feedback) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const data = buildDataSummary(videoData, feedback)
  const prompt = `다음 매장 데이터를 분석해주세요:\n${data}\n\n아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트 없이 오직 JSON만 반환하세요.\n\n{\n  "strategies": [\n    {\n      "id": "영문 소문자 카테고리 ID (예: conversion, congestion, customer)",\n      "label": "한국어 탭 레이블 (8자 이내)",\n      "items": [\n        {\n          "title": "전략 제목 (20자 이내)",\n          "desc": "설명 (1-2문장, 한국어)",\n          "tag": "운영 또는 마케팅 또는 공간 또는 상품"\n        }\n      ]\n    }\n  ]\n}\n\nstrategies는 데이터에서 두드러지는 패턴을 기반으로 3~5개 카테고리를 생성하세요. 각 카테고리에 2~3개의 실행 전략을 포함하세요.`
  const text = await callGemini(apiKey, prompt, 1024)
  return JSON.parse(text)
}

export async function generateActions(videoData, feedback) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const data = buildDataSummary(videoData, feedback)
  const prompt = `다음 매장 데이터를 분석해주세요:\n${data}\n\n아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트 없이 오직 JSON만 반환하세요.\n\n{\n  "actions": [\n    {\n      "priority": "high 또는 mid 또는 low",\n      "title": "액션 제목 (20자 이내)",\n      "impact": "예상 효과",\n      "difficulty": "쉬움 또는 보통 또는 어려움",\n      "metric": "관련 지표"\n    }\n  ]\n}\n\nactions 3~5개 생성하세요.`
  const text = await callGemini(apiKey, prompt, 768)
  return JSON.parse(text)
}

export async function* streamChat(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  })
  let res
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    res = await fetch(`${BASE}:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    if (res.status !== 429) break
    if (attempt < RETRY_DELAYS.length) {
      await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]))
    }
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data) continue
      try {
        const parsed = JSON.parse(data)
        const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (chunk) yield chunk
      } catch { /* skip malformed SSE */ }
    }
  }
}
