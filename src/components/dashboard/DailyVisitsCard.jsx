import { useState, useEffect } from 'react'
import { fetchDailyVisits } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function DailyVisitsCard({ day }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!day) return
    setData(null)
    fetchDailyVisits(day).then(setData).catch(() => {})
  }, [day])

  return (
    <KPI
      label="오늘 방문자"
      icon={<Ic.User />}
      iconBg="oklch(0.955 0.03 205)"
      iconFg="oklch(0.5 0.095 218)"
      value={data?.totalVisits != null ? data.totalVisits.toLocaleString() : '—'}
      unit={data?.totalVisits != null ? '명' : ''}
      hint="선택 날짜 총 방문"
    />
  )
}
