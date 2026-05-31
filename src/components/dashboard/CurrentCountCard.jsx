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
      tooltip={"현재 매장 안에 있는 인원 수예요.\n카메라 영상을 실시간으로 분석해 30초마다 자동 갱신돼요."}
    />
  )
}
