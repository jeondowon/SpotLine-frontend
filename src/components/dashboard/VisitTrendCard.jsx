import { useState, useEffect } from 'react'
import { fetchVisitTrend } from '../../api/index'
import TrendChart from './TrendChart'
import InfoTooltip from '../ui/InfoTooltip'

export default function VisitTrendCard({ startAt, endAt, selectedDay }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    let active = true
    fetchVisitTrend(startAt, endAt)
      .then((nextData) => {
        if (active) setData(nextData)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [startAt, endAt])

  return (
    <div className="card">
      <div className="card-h">
        <h3>방문자 그래프</h3>
        <div className="right">
          <InfoTooltip
            text="날짜별 방문자 수를 단순 선 그래프로 보여줘요.\n\n각 지점은 해당 날짜에 방문한 총 인원을 의미합니다."
          />
        </div>
      </div>
      <div className="card-b" style={{ padding: '8px 12px 14px' }}>
        <TrendChart data={data} selectedDay={selectedDay} />
      </div>
    </div>
  )
}
