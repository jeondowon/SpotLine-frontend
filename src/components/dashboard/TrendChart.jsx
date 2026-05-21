const LINES = [
  { label: '5일선',  color: 'var(--accent)',        width: 2.2 },
  { label: '10일선', color: 'oklch(0.60 0.12 290)', width: 1.8 },
  { label: '20일선', color: 'oklch(0.62 0.13 155)', width: 1.8 },
  { label: '60일선', color: 'oklch(0.65 0.10 65)',  width: 1.6 },
]

export default function TrendChart({ data }) {
  if (!data?.date?.length) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-2)', fontSize: 13 }}>
        추세 데이터가 없습니다.
      </div>
    )
  }

  const W = 760, H = 220, PAD_L = 36, PAD_R = 14, PAD_T = 12, PAD_B = 24
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = data.date.length

  const allVals = (data.data ?? []).flat().filter(v => v != null && !isNaN(v))
  const minY = allVals.length ? Math.max(0, Math.min(...allVals) * 0.9) : 0
  const maxY = allVals.length ? Math.max(...allVals) * 1.1 : 100
  const range = maxY - minY || 1

  const xi = i => PAD_L + (n > 1 ? i / (n - 1) : 0.5) * innerW
  const yv = v => PAD_T + innerH - ((v - minY) / range) * innerH

  const pathFor = vals => {
    const pts = vals
      .map((v, i) => (v != null ? `${xi(i).toFixed(1)},${yv(v).toFixed(1)}` : null))
      .filter(Boolean)
    return pts.length >= 2 ? `M${pts.join(' L')}` : ''
  }

  const step = Math.max(1, Math.floor(n / 6))
  const dateLabels = data.date
    .map((d, i) => ({ label: d.slice(5, 10), i }))
    .filter(({ i }) => i % step === 0 || i === n - 1)

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(minY + r * range))

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {gridVals.map((gv, i) => {
          const gy = yv(gv)
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={gy} y2={gy} stroke="#ECEEF2" strokeDasharray={i === 0 ? '' : '3 4'} />
              <text x={PAD_L - 8} y={gy + 3} fontSize="10" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{gv}</text>
            </g>
          )
        })}

        {dateLabels.map(({ i, label }) => (
          <text key={i} x={xi(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{label}</text>
        ))}

        {(data.data ?? []).slice(0, LINES.length).map((vals, li) => {
          const d = pathFor(vals)
          return d ? (
            <path key={li} d={d} fill="none" stroke={LINES[li].color} strokeWidth={LINES[li].width} strokeLinecap="round" strokeLinejoin="round" />
          ) : null
        })}
      </svg>

      <div className="legend">
        {LINES.slice(0, (data.data ?? []).length).map(l => (
          <div key={l.label}><span className="sw" style={{ background: l.color }} />{l.label}</div>
        ))}
        {(() => {
          const ma5 = data.data?.[0] ?? []
          const ma20 = data.data?.[2] ?? []
          const pairs = []
          for (let i = ma5.length - 1; i >= 0 && pairs.length < 2; i--) {
            if (ma5[i] != null && ma20[i] != null) pairs.unshift([ma5[i], ma20[i]])
          }
          if (pairs.length < 2) return <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA3AF' }}>단위: 날씨 보정 방문자(명)</div>
          const [[a0, b0], [a1, b1]] = pairs
          if (a0 <= b0 && a1 > b1) return <div style={{ marginLeft: 'auto', fontSize: 11, color: 'oklch(0.55 0.14 65)', fontWeight: 600 }}>↑ 골든크로스 · 단기 상승 전환</div>
          if (a0 >= b0 && a1 < b1) return <div style={{ marginLeft: 'auto', fontSize: 11, color: 'oklch(0.45 0.16 25)', fontWeight: 600 }}>↓ 데드크로스 · 단기 하락 주의</div>
          return <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA3AF' }}>단위: 날씨 보정 방문자(명)</div>
        })()}
      </div>
    </div>
  )
}
