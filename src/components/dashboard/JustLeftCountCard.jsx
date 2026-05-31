import { useState, useEffect } from 'react'
import { fetchJustLeftCount } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function JustLeftCountCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchJustLeftCount(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="그냥 나간 손님"
      icon={<Ic.Door />}
      iconBg="oklch(0.955 0.04 25)"
      iconFg="oklch(0.55 0.16 25)"
      value={data?.count != null ? `${data.count}` : '—'}
      unit={data?.count != null ? '명' : ''}
      hint="입장 후 미주문 이탈"
    />
  )
}
