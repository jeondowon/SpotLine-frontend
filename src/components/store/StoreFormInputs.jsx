import { useState, useEffect, useRef } from 'react'
import '../../styles/onboarding.css'
import O from '../../pages/OnboardingIcons'

export const BIZ = [
  { v: '카페',       ic: <O.Coffee />,   Ic: O.Coffee },
  { v: '음식점',     ic: <O.Fork />,     Ic: O.Fork },
  { v: '베이커리',   ic: <O.Bread />,    Ic: O.Bread },
  { v: '주점 · 바',  ic: <O.Glass />,    Ic: O.Glass },
  { v: '리테일 · 편의', ic: <O.Bag />,   Ic: O.Bag },
  { v: '뷰티 · 헤어', ic: <O.Scissors />, Ic: O.Scissors },
  { v: '의류 · 패션', ic: <O.Shirt />,   Ic: O.Shirt },
  { v: '기타',       ic: <O.Dot />,      Ic: O.Dot },
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

export function BizSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className={'ob-select' + (open ? ' open' : '')} ref={ref}>
      <button className="ob-select-trigger" onClick={() => setOpen(o => !o)}>
        <span className="ic">{value ? bizIcon(value) : <O.Tag />}</span>
        <span className={'ob-select-val' + (value ? '' : ' ph')}>
          {value || '업종을 선택하세요'}
        </span>
        <span className="chev"><O.Chev /></span>
      </button>
      {open && (
        <div className="ob-menu">
          {BIZ.map(b => (
            <div
              key={b.v}
              className={'ob-opt' + (b.v === value ? ' sel' : '')}
              onClick={() => { onChange(b.v); setOpen(false) }}
            >
              <span className="oic">{b.ic}</span>
              <span>{b.v}</span>
              {b.v === value && <span className="ocheck"><O.Check /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DayPicker({ days, toggleDay }) {
  return (
    <div className="ob-days">
      {DAYS.map((d, i) => (
        <button
          key={d}
          className={
            'ob-day' +
            (days.includes(i) ? ' on' : '') +
            (i === 6 ? ' sun' : i === 5 ? ' sat' : '')
          }
          onClick={() => toggleDay(i)}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

function PeriodSelect({ value, onChange }) {
  return (
    <select className="ob-period-sel" value={value} onChange={e => onChange(e.target.value)}>
      <option value="오전">오전</option>
      <option value="오후">오후</option>
    </select>
  )
}

function TimeSelect({ value, onChange }) {
  return (
    <select className="ob-time-sel" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">--:--</option>
      {TIMES_12H.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  )
}

export function TimeRangeSelect({ value, onChange }) {
  return (
    <div className="ob-time-range">
      <span className="ic"><O.Clock /></span>
      <PeriodSelect value={value.startPeriod} onChange={v => onChange({ ...value, startPeriod: v })} />
      <TimeSelect value={value.startTime} onChange={v => onChange({ ...value, startTime: v })} />
      <span className="ob-time-sep">~</span>
      <PeriodSelect value={value.endPeriod} onChange={v => onChange({ ...value, endPeriod: v })} />
      <TimeSelect value={value.endTime} onChange={v => onChange({ ...value, endTime: v })} />
    </div>
  )
}
