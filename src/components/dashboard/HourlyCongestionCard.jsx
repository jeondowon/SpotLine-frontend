import { useState, useEffect } from 'react'
import { fetchVisitTrend } from '../../api/index'
import HourlyCongestionChart from './HourlyCongestionChart'
import InfoTooltip from '../ui/InfoTooltip'

export default function HourlyCongestionCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchVisitTrend(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <div className="card">
      <div className="card-h">
        <h3>시간대별 혼잡도</h3>
        <span className="sub">· 오늘 시간대별 방문자</span>
        <div className="right">
          <InfoTooltip
            text="오늘 하루 시간대별 방문자 수를 막대 그래프로 보여줘요.\n\n현재 시간대는 파란색, 피크 시간대는 노란색으로 강조돼요."
          />
        </div>
      </div>
      <div className="card-b" style={{ padding: '8px 12px 14px' }}>
        <HourlyCongestionChart data={data} />
      </div>
    </div>
  )
}
