import { useState, useEffect } from 'react'
import { fetchResponseWaitTime } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function ResponseWaitTimeCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchResponseWaitTime(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="최대 응대 대기"
      icon={<Ic.Bell />}
      iconBg="oklch(0.955 0.05 80)"
      iconFg="oklch(0.55 0.14 65)"
      value={data?.time != null ? `${data.time}` : '—'}
      unit={data?.time != null ? '분' : ''}
      tooltip={"손님이 착석 후 직원 응대를 기다린 최대 시간이에요.\n이 값이 높으면 서비스 대기가 길었다는 신호예요."}
    />
  )
}
