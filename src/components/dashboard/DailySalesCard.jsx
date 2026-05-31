import { useState, useEffect } from 'react'
import { fetchDailySales } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function DailySalesCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchDailySales(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="오늘 매출"
      icon={<Ic.Cart />}
      iconBg="oklch(0.955 0.03 65)"
      iconFg="oklch(0.55 0.14 65)"
      value={data?.dailySales != null ? data.dailySales.toLocaleString() : '—'}
      unit={data?.dailySales != null ? '원' : ''}
      hint="당일 누적 매출"
    />
  )
}
