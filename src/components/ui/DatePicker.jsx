import { useState, useRef, useEffect } from 'react'

const NAV_BTN = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 17, color: 'var(--ink-2, #374151)', padding: '0 6px', lineHeight: 1,
}

export default function DatePicker({ day, setDay, dataDates = [] }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef()

  const todayStr = new Date().toISOString().slice(0, 10)
  const initFrom = day || todayStr
  const [calYear, setCalYear] = useState(() => parseInt(initFrom.slice(0, 4)))
  const [calMonth, setCalMonth] = useState(() => parseInt(initFrom.slice(5, 7)) - 1)

  const dataSet = new Set(dataDates.map(d => d.slice(0, 10)))

  const display = day
    ? new Date(day + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    : '날짜 선택'

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    if (!open) {
      const src = day || todayStr
      setCalYear(parseInt(src.slice(0, 4)))
      setCalMonth(parseInt(src.slice(5, 7)) - 1)
    }
    setOpen(o => !o)
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7  // Mon=0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const selectDate = (d) => {
    setDay(`${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    setOpen(false)
  }

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })

  return (
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 34, padding: '0 12px',
          border: '1px solid var(--line-2, #E5E9EF)',
          borderRadius: 8, background: '#fff',
          fontSize: 13, fontWeight: 500, color: 'var(--ink-2, #374151)',
          cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {display}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 40, zIndex: 100,
          background: '#fff', border: '1px solid var(--line-2, #E5E9EF)',
          borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          padding: '10px 12px', width: 228,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={prevMonth} style={NAV_BTN}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink, #111)' }}>{monthLabel}</span>
            <button onClick={nextMonth} style={NAV_BTN}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
            {['월','화','수','목','금','토','일'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#9AA3AF', paddingBottom: 4 }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px 0' }}>
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const isSelected = dateStr === day
              const isToday = dateStr === todayStr
              const hasData = dataSet.has(dateStr)
              return (
                <div
                  key={dateStr}
                  onClick={() => selectDate(d)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '3px 0', borderRadius: 6, cursor: 'pointer',
                    background: isSelected ? 'var(--accent, #3B7CF6)' : 'transparent',
                    color: isSelected ? '#fff' : isToday ? 'var(--accent, #3B7CF6)' : 'var(--ink-2, #374151)',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    fontSize: 12,
                  }}
                >
                  {d}
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%', marginTop: 1,
                    background: hasData ? (isSelected ? '#fff' : 'var(--accent, #3B7CF6)') : 'transparent',
                  }} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
