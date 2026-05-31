import { useState, useEffect } from 'react'
import { fetchVisitTrend } from '../../api/index'
import TrendChart from './TrendChart'
import InfoTooltip from '../ui/InfoTooltip'

export default function VisitTrendCard({ startAt, endAt, selectedDay }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchVisitTrend(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <div className="card">
      <div className="card-h">
        <h3>방문 추세선</h3>
        <div className="right">
          <span className="chip dot">날씨 보정값</span>
          <InfoTooltip
            text="최근 60일간 방문자 수의 진짜 흐름을 보여줘요.\n\n5·10·20·60일 이동평균선으로 실제 트렌드를 읽을 수 있어요."
          />
        </div>
      </div>
      <div className="card-b" style={{ padding: '8px 12px 14px' }}>
        <TrendChart data={data} selectedDay={selectedDay} />
      </div>
    </div>
  )
}
