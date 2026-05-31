import { useState, useEffect } from 'react'
import { fetchAvgDwell } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function AvgDwellCard({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchAvgDwell(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="평균 체류"
      icon={<Ic.Clock />}
      iconBg="oklch(0.95 0.04 155)"
      iconFg="oklch(0.42 0.12 155)"
      value={data?.time != null ? `${data.time}` : '—'}
      unit={data?.time != null ? '분' : ''}
      hint="AI 분석 기준"
    />
  )
}
