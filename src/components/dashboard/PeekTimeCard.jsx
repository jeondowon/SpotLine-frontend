import { useState, useEffect } from 'react'
import { fetchPeekTime } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function PeekTimeCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    fetchPeekTime(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="피크 시간"
      icon={<Ic.Clock />}
      iconBg="oklch(0.955 0.03 205)"
      iconFg="oklch(0.5 0.095 218)"
      value={data?.time != null ? `${data.time}` : '—'}
      unit={data?.time != null ? '시' : ''}
      tooltip={"하루 중 방문자가 가장 많았던 시간대예요.\n이 시간에 맞춰 인력 배치나 프로모션을 준비해보세요."}
    />
  )
}
