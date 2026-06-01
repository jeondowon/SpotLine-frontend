import { Ic } from '../ui/Icons'

export const BIZ = [
  { v: '카페',       ic: <Ic.Coffee />,   Ic: Ic.Coffee },
  { v: '음식점',     ic: <Ic.Fork />,     Ic: Ic.Fork },
  { v: '베이커리',   ic: <Ic.Bread />,    Ic: Ic.Bread },
  { v: '주점 · 바',  ic: <Ic.Glass />,    Ic: Ic.Glass },
  { v: '리테일 · 편의', ic: <Ic.Bag />,   Ic: Ic.Bag },
  { v: '뷰티 · 헤어', ic: <Ic.Scissors />, Ic: Ic.Scissors },
  { v: '의류 · 패션', ic: <Ic.Shirt />,   Ic: Ic.Shirt },
  { v: '기타',       ic: <Ic.Dot />,      Ic: Ic.Dot },
]

export const DAYS = ['월', '화', '수', '목', '금', '토', '일']

export const TIMES_12H = [
  '12:00', '12:30',
  ...Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 1
    const m = i % 2 === 0 ? '00' : '30'
    return `${h}:${m}`
  }),
]

export function bizIcon(v) {
  return (BIZ.find(b => b.v === v) || {}).ic
}

export function timeLabel(t) {
  if (!t.startTime || !t.endTime) return null
  return `${t.startPeriod} ${t.startTime} ~ ${t.endPeriod} ${t.endTime}`
}
