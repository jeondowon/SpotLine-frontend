import { useState, useEffect } from 'react'
import { fetchCoreCustomerV2 } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

function label(data) {
  if (!data) return '—'
  const age = data.age ? `${data.age}대` : null
  const gender = data.gender === 1 ? '남성' : data.gender === 2 ? '여성' : null
  return [age, gender].filter(Boolean).join(' ') || '—'
}

export default function CoreCustomerV2Card({ startAt, endAt }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!startAt || !endAt) return
    setData(null)
    fetchCoreCustomerV2(startAt, endAt).then(setData).catch(() => {})
  }, [startAt, endAt])

  return (
    <KPI
      label="핵심 고객"
      icon={<Ic.Users />}
      iconBg="oklch(0.955 0.03 205)"
      iconFg="oklch(0.5 0.095 218)"
      value={label(data)}
      hint="오늘 최다 방문 그룹"
    />
  )
}
