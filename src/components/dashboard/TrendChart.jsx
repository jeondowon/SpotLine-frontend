const LINE_COLOR = 'var(--accent)'

export default function TrendChart({ data, selectedDay }) {
  if (!data?.time?.length) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-2)', fontSize: 13 }}>
        추세 데이터가 없습니다.
      </div>
    )
  }

  const rawData = data.data ?? []

  const slicedDate = data.time
  const slicedData = rawData
  const selectedIndex = selectedDay
    ? slicedDate.findIndex(d => d.slice(0, 10) === selectedDay.slice(0, 10))
    : -1

  const W = 760, H = 220, PAD_L = 36, PAD_R = 14, PAD_T = 12, PAD_B = 24
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = slicedDate.length

  const allVals = slicedData.filter(v => v != null && !isNaN(v))
  const maxRaw = allVals.length ? Math.max(...allVals) : 100
  const minY = 0
  const maxY = Math.max(10, Math.ceil(maxRaw * 1.1))
  const range = maxY - minY || 1

  const xi = i => PAD_L + (n > 1 ? i / (n - 1) : 0.5) * innerW
  const yv = v => PAD_T + innerH - ((v - minY) / range) * innerH

  const points = slicedData
    .map((v, i) => (v != null ? { x: xi(i), y: yv(v), value: v, date: slicedDate[i] } : null))
    .filter(Boolean)
  const linePath = points.length >= 2
    ? `M${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`
    : ''

  const step = Math.max(1, Math.floor(n / 6))
  const dateLabels = slicedDate
    .map((d, i) => ({ label: d.slice(5, 10), i }))
    .filter(({ i }) => i % step === 0 || i === n - 1)

  const gridStep = Math.max(1, Math.ceil(maxY / 4 / 10) * 10)
  const gridStart = Math.ceil(minY / gridStep) * gridStep
  const gridVals = []
  for (let v = gridStart; v <= maxY; v += gridStep) gridVals.push(v)

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

        {linePath && (
          <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p, i) => (
          <circle
            key={`${p.date}-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === selectedIndex ? '5' : '3.5'}
            fill="#fff"
            stroke={i === selectedIndex ? 'var(--ink)' : LINE_COLOR}
            strokeWidth={i === selectedIndex ? '2.4' : '2'}
          />
        ))}
      </svg>

      <div className="legend">
        <div><span className="sw" style={{ background: LINE_COLOR }} />일별 방문자 수</div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA3AF' }}>단위: 방문자(명)</div>
      </div>
    </div>
  )
}
