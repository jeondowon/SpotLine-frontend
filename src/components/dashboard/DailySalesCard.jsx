import { useState, useEffect } from 'react'
import { fetchDailySales } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function DailySalesCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
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
      tooltip={"선택한 날의 누적 매출이에요.\nPOS 연동 데이터를 기준으로 집계해요."}
    />
  )
}
