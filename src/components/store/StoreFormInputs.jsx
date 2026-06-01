import { useState, useEffect, useRef } from 'react'
import '../../styles/onboarding.css'
import { Ic } from '../ui/Icons'
import { searchAddress } from '../../api/index'

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
        <span className="ic">{value ? bizIcon(value) : <Ic.Tag />}</span>
        <span className={'ob-select-val' + (value ? '' : ' ph')}>
          {value || '업종을 선택하세요'}
        </span>
        <span className="chev"><Ic.Chevron /></span>
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
              {b.v === value && <span className="ocheck"><Ic.Check /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddressSearchInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const ref = useRef(null)
  const hasKey = !!import.meta.env.VITE_KAKAO_REST_API_KEY

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  useEffect(() => {
    if (!hasKey || value.trim().length < 2) return

    let active = true
    const timer = window.setTimeout(() => {
      setStatus('loading')
      searchAddress(value)
        .then(items => {
          if (!active) return
          setResults(items)
          setStatus(items.length ? 'ready' : 'empty')
          setOpen(true)
        })
        .catch(() => {
          if (!active) return
          setResults([])
          setStatus('error')
          setOpen(true)
        })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [hasKey, value])

  const handleInput = (nextValue) => {
    setResults([])
    setStatus('idle')
    onChange({ address: nextValue, latitude: '', longitude: '' })
    setOpen(nextValue.trim().length >= 2)
  }

  const handleSelect = (item) => {
    onChange({
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    })
    setOpen(false)
  }

  return (
    <div className="ob-select" ref={ref} style={{ position: 'relative' }}>
      <div className="ob-input-wrap">
        <span className="ic"><Ic.Pin /></span>
        <input
          className="ob-input"
          value={value}
          placeholder={placeholder}
          onFocus={() => {
            if (value.trim().length >= 2) setOpen(true)
          }}
          onChange={(e) => handleInput(e.target.value)}
        />
      </div>
      {open && (
        <div className="ob-menu" style={{ top: 'calc(100% + 6px)', left: 0, right: 0 }}>
          {!hasKey && (
            <div className="ob-opt" style={{ color: 'var(--muted)' }}>
              주소 검색 키가 설정되지 않았습니다.
            </div>
          )}
          {hasKey && status === 'loading' && (
            <div className="ob-opt" style={{ color: 'var(--muted)' }}>
              주소를 검색하는 중입니다.
            </div>
          )}
          {hasKey && status === 'empty' && (
            <div className="ob-opt" style={{ color: 'var(--muted)' }}>
              검색 결과가 없습니다.
            </div>
          )}
          {hasKey && status === 'error' && (
            <div className="ob-opt" style={{ color: 'var(--muted)' }}>
              주소 검색에 실패했습니다.
            </div>
          )}
          {results.map(item => (
            <button
              type="button"
              key={`${item.address}-${item.longitude}-${item.latitude}`}
              className="ob-opt"
              onClick={() => handleSelect(item)}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="oic"><Ic.Pin /></span>
              <span>
                <span style={{ display: 'block', fontWeight: 700 }}>{item.address}</span>
                {item.detail && (
                  <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'var(--muted)' }}>
                    {item.detail}
                  </span>
                )}
              </span>
            </button>
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
      <span className="ic"><Ic.Clock /></span>
      <PeriodSelect value={value.startPeriod} onChange={v => onChange({ ...value, startPeriod: v })} />
      <TimeSelect value={value.startTime} onChange={v => onChange({ ...value, startTime: v })} />
      <span className="ob-time-sep">~</span>
      <PeriodSelect value={value.endPeriod} onChange={v => onChange({ ...value, endPeriod: v })} />
      <TimeSelect value={value.endTime} onChange={v => onChange({ ...value, endTime: v })} />
    </div>
  )
}
