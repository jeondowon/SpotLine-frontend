import { useEffect, useState } from 'react'
import { fetchCurrentCount } from '../../api/index'
import { Ic } from '../ui/Icons'

export default function OperationalMetrics({ responseWait, justLeft, emptyTable, avgDwell }) {
  const [currentCount, setCurrentCount] = useState(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetchCurrentCount()
        setCurrentCount(r.count)
      } catch { /* ignore */ }
    }
    poll()
    const id = setInterval(poll, 30000)
    return () => clearInterval(id)
  }, [])

  const metrics = [
    {
      label: '현재 인원',
      value: currentCount != null ? `${currentCount}명` : '—',
      icon: <Ic.Users />,
      iconBg: 'oklch(0.955 0.03 155)',
      iconFg: 'oklch(0.42 0.12 155)',
      live: true,
    },
    {
      label: '최대 응대 대기',
      value: responseWait?.time != null ? `${responseWait.time}분` : '—',
      icon: <Ic.Bell />,
      iconBg: 'oklch(0.955 0.05 80)',
      iconFg: 'oklch(0.55 0.14 65)',
    },
    {
      label: '그냥 나간 손님',
      value: justLeft?.count != null ? `${justLeft.count}명` : '—',
      icon: <Ic.Door />,
      iconBg: 'oklch(0.955 0.04 25)',
      iconFg: 'oklch(0.55 0.16 25)',
    },
    {
      label: '테이블 유휴',
      value: emptyTable?.time != null ? `${emptyTable.time}분` : '—',
      icon: <Ic.Dash />,
      iconBg: 'oklch(0.955 0.02 250)',
      iconFg: 'oklch(0.48 0.10 250)',
    },
    {
      label: '평균 체류',
      value: avgDwell?.time != null ? `${avgDwell.time}분` : '—',
      icon: <Ic.Clock />,
      iconBg: 'oklch(0.95 0.04 155)',
      iconFg: 'oklch(0.42 0.12 155)',
    },
  ]

  return (
    <div className="card">
      <div className="card-h">
        <h3>운영 지표</h3>
        <span className="sub">· 서비스 품질 현황</span>
        {currentCount != null && (
          <div className="right">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'oklch(0.42 0.12 155)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.60 0.18 155)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              실시간
            </span>
          </div>
        )}
      </div>
      <div className="card-b">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '16px 8px',
                background: '#F7F9FC',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: m.iconBg,
                  display: 'grid',
                  placeItems: 'center',
                  color: m.iconFg,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {m.icon}
                {m.live && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'oklch(0.60 0.18 155)',
                      border: '2px solid #fff',
                    }}
                  />
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 4 }}>{m.label}</div>
                <div
                  className="mono"
                  style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}
                >
                  {m.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
