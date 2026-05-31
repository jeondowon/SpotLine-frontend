import { useState, useEffect } from 'react'
import { fetchCurrentCount } from '../../api/index'
import KPI from '../ui/KPI'
import { Ic } from '../ui/Icons'

export default function CurrentCountCard() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetchCurrentCount()
        setCount(r.count)
      } catch { /* ignore */ }
    }
    poll()
    const id = setInterval(poll, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <KPI
      label="현재 인원"
      icon={<Ic.Users />}
      iconBg="oklch(0.955 0.03 155)"
      iconFg="oklch(0.42 0.12 155)"
      value={count != null ? `${count}` : '—'}
      unit={count != null ? '명' : ''}
      hint="실시간 · 30초 갱신"
    />
  )
}
