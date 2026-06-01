import { useState, useEffect } from 'react'
import { fetchHourlyPopulation } from '../../api/index'
import { Ic } from '../ui/Icons'
import InfoTooltip from '../ui/InfoTooltip'

const AGE_KEYS = [
  { key: 'age00s', label: '0-9세' },
  { key: 'age10s', label: '10대' },
  { key: 'age20s', label: '20대' },
  { key: 'age30s', label: '30대' },
  { key: 'age40s', label: '40대' },
  { key: 'age50s', label: '50대+' },
]

export default function HourlyPopulationCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    fetchHourlyPopulation(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  const ageGroups = AGE_KEYS.map(({ key, label }) => ({
    label,
    pct: data?.[key] ?? 0,
  }))

  return (
    <div className="card">
      <div className="card-h">
        <h3>연령대 분포</h3>
        <div className="right">
          <InfoTooltip
            text="오늘 방문한 손님을 연령대별로 나눠서 보여줘요.\n\nVision AI가 영상을 보고 익명으로 연령대를 추정한 통계예요."
          />
        </div>
      </div>
      <div className="card-b">
        <div className="ages">
          {ageGroups.map((a) => (
            <div className="age-row" key={a.label}>
              <div className="l mono">{a.label}</div>
              <div className="track">
                <div className="fill" style={{ width: a.pct + '%' }} />
              </div>
              <div className="v mono">{a.pct}%</div>
            </div>
          ))}
        </div>
        <div className="priv" style={{ marginTop: 14, fontSize: 11.5 }}>
          <Ic.Shield color="#9AA3AF" />
          Vision AI 익명 추정 통계입니다.
        </div>
      </div>
    </div>
  )
}
