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
      hint="손님 착석 후 최대 대기"
    />
  )
}
