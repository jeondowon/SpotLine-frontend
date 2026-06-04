import { useState, useEffect } from 'react'
import { fetchVisitTrend } from '../../api/index'
import HourlyCongestionChart from './HourlyCongestionChart'
import InfoTooltip from '../ui/InfoTooltip'

export default function HourlyCongestionCard({ startAt, endAt }) {
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
        <h3>시간대별 혼잡도</h3>
        <div className="right">
          <InfoTooltip
            text={"오늘 하루 시간대별 방문자 수를 선 그래프로 보여줘요.\n\n현재 시간대는 파란색, 피크 시간대는 네이비로 강조돼요."}
          />
        </div>
      </div>
      <div className="card-b" style={{ padding: '6px 10px 10px' }}>
        <HourlyCongestionChart data={data} />
      </div>
    </div>
  )
}
