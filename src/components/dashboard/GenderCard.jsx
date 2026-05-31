import { useState, useEffect } from 'react'
import { fetchRawAnalytics } from '../../api/index'
import Donut from '../analytics/charts/Donut'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'
import { ceil1 } from '../../utils/format'

function getSeedVideoId(day) {
  const start = new Date('2026-04-24')
  const current = new Date(day)
  const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24))
  if (diffDays >= 0 && diffDays < 30) return diffDays + 1
  return null
}

const FALLBACK_SLICES = [
  { label: '여성', pct: 58, color: 'oklch(0.7 0.13 0)' },
  { label: '남성', pct: 42, color: 'oklch(0.58 0.12 210)' },
]

export default function GenderCard({ day }) {
  const [raw, setRaw] = useState(null)

  useEffect(() => {
    if (!day) return
    setRaw(null)
    const videoId = getSeedVideoId(day) || localStorage.getItem('last_video_id')
    if (!videoId) return
    fetchRawAnalytics(videoId).then(setRaw).catch(() => {})
  }, [day])

  const slices = (() => {
    const persons = raw?.persons
    if (!persons || persons.length === 0) return FALLBACK_SLICES
    const f = persons.filter((p) => p.gender === 'female').length
    const fPct = Number(((f / persons.length) * 100).toFixed(1))
    return [
      { label: '여성', pct: fPct, color: 'oklch(0.7 0.13 0)' },
      { label: '남성', pct: Number((100 - fPct).toFixed(1)), color: 'oklch(0.58 0.12 210)' },
    ]
  })()

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h">
        <h3>성별 추정 분포</h3>
        <span className="sub">· AI 추정 · 익명</span>
        <div className="right">
          <InfoTooltip
            text="Vision AI가 영상에서 익명으로 성별을 추정해 분포를 보여줘요.\n\n주요 고객의 성별 비중을 파악해서 상품 구성이나 마케팅 방향을 잡는 데 도움이 돼요."
          />
        </div>
      </div>
      <div
        className="card-b"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
      >
        <div className="donut-wrap" style={{ gap: 100 }}>
          <Donut slices={slices} label="전체" size={170} />
          <div className="donut-legend">
            {slices.map((s) => (
              <div className="row" key={s.label}>
                <span className="sw" style={{ background: s.color }} />
                <span>{s.label}</span>
                <span className="v mono">{ceil1(s.pct)}%</span>
              </div>
            ))}
            <div className="priv" style={{ marginTop: 6 }}>
              <Ic.Shield color="#9AA3AF" />
              외관 기반 추정 · 얼굴 식별 없음
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
