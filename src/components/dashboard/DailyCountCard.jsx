import { useState, useEffect } from 'react'
import { fetchDailyCount } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'
import { ceil1 } from '../../utils/format'

export default function DailyCountCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchDailyCount(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  const count = data?.count
  const avg = data?.avgCount
  const delta = count != null && avg != null && avg > 0
    ? ceil1(((count - avg) / avg) * 100)
    : undefined

  return (
    <KPI
      label="오늘 vs 평균"
      icon={<Ic.Trend />}
      iconBg="oklch(0.955 0.03 250)"
      iconFg="oklch(0.48 0.16 250)"
      value={count != null ? count.toLocaleString() : '—'}
      unit={count != null ? '명' : ''}
      delta={delta}
      hint={avg != null ? `평균 ${avg.toLocaleString()}명` : '평균 대비 비교'}
    />
  )
}
