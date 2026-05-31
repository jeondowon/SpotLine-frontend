import { useState, useEffect } from 'react'
import { fetchBestMenu } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function BestMenuCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchBestMenu(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="베스트 메뉴"
      icon={<Ic.Sparkle />}
      iconBg="oklch(0.955 0.03 65)"
      iconFg="oklch(0.55 0.14 65)"
      value={data?.menu ?? '—'}
      hint="오늘 판매 1위"
    />
  )
}
