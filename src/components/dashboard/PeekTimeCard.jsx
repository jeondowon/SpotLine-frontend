import { useState, useEffect } from 'react'
import { fetchPeekTime } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function PeekTimeCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
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
      hint="가장 바쁜 시간대"
    />
  )
}
