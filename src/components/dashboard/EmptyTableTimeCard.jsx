import { useState, useEffect } from 'react'
import { fetchEmptyTableTime } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function EmptyTableTimeCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchEmptyTableTime(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="테이블 유휴"
      icon={<Ic.Dash />}
      iconBg="oklch(0.955 0.02 250)"
      iconFg="oklch(0.48 0.10 250)"
      value={data?.time != null ? `${data.time}` : '—'}
      unit={data?.time != null ? '분' : ''}
      hint="최대 테이블 비어있던 시간"
    />
  )
}
