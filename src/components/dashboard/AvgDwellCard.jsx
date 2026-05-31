import { useState, useEffect } from 'react'
import { fetchAvgDwell } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function AvgDwellCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchAvgDwell(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="평균 체류"
      icon={<Ic.Clock />}
      iconBg="oklch(0.95 0.04 155)"
      iconFg="oklch(0.42 0.12 155)"
      value={data?.time != null ? `${data.time}` : '—'}
      unit={data?.time != null ? '분' : ''}
      tooltip={"방문자가 매장 안에서 머문 평균 시간이에요.\nVision AI가 입장·퇴장 시간을 분석해 계산해요."}
    />
  )
}
