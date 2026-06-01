function toNumber(value) {
  if (Array.isArray(value)) {
    const found = value.find(item => Number.isFinite(Number(item)))
    return found == null ? null : Number(found)
  }
  if (value && typeof value === 'object') {
    const found = [value.value, value.count, value.visits, value.totalVisits]
      .find(item => Number.isFinite(Number(item)))
    return found == null ? null : Number(found)
  }
  return Number.isFinite(Number(value)) ? Number(value) : null
}

export default function HourlyCongestionChart({ data }) {
  const PEAK_COLOR = 'var(--navy)'

  if (!data?.time?.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-2)', fontSize: 13 }}>
        시간대별 데이터가 없습니다.
      </div>
    )
  }

  // 시간대별 합산
  const hourMap = {}
  data.time.forEach((t, i) => {
    const h = new Date(t).getHours()
    const value = toNumber(data.data?.[i])
    if (!Number.isFinite(h) || value == null) return
    hourMap[h] = (hourMap[h] || 0) + value
  })

  const now = new Date().getHours()
  const dataHours = Object.keys(hourMap).map(Number).sort((a, b) => a - b)
  if (!dataHours.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-2)', fontSize: 13 }}>
        시간대별 데이터가 없습니다.
      </div>
    )
  }

  const firstHour = dataHours[0]
  const lastHour = dataHours[dataHours.length - 1]
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i)
  const values = hours.map(h => hourMap[h] || 0)
  const maxVal = Math.max(...values, 1)
  const peakHour = hours[values.indexOf(maxVal)]

  const W = 680, H = 210
  const PAD_L = 34, PAD_R = 14, PAD_T = 36, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = hours.length

  const x = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2)
  const y = (v) => PAD_T + innerH - ((v || 0) / maxVal) * innerH

  const points = hours.map((h, i) => ({
    hour: h,
    value: hourMap[h] || 0,
    x: x(i),
    y: y(hourMap[h] || 0),
  }))
  const linePath = points.length >= 2
    ? `M${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`
    : ''

  const gridVals = [0.25, 0.5, 0.75, 1]

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* 그리드 */}
        {gridVals.map((pct) => {
          const gv = Math.round(maxVal * pct)
          const gy = PAD_T + innerH - innerH * pct
          return (
            <g key={pct}>
              <line x1={PAD_L} x2={W - PAD_R} y1={gy} y2={gy} stroke="#ECEEF2" strokeDasharray="3 4" />
              <text x={PAD_L - 5} y={gy + 3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{gv}</text>
            </g>
          )
        })}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p) => {
          const isNow = p.hour === now
          const isPeak = p.hour === peakHour
          const color = isNow
            ? 'var(--accent)'
            : isPeak
            ? PEAK_COLOR
            : 'var(--accent)'
          const radius = isNow || isPeak ? 5 : 3.4
          const peakLabel = `피크 ${p.value}명`
          const peakLabelWidth = Math.max(60, peakLabel.length * 7.8)
          const peakLabelX = Math.min(
            W - PAD_R - peakLabelWidth / 2,
            Math.max(PAD_L + peakLabelWidth / 2, p.x)
          )
          const peakLabelY = Math.max(17, p.y - 20)

          return (
            <g key={p.hour}>
              <circle
                cx={p.x}
                cy={p.y}
                r={radius}
                fill="#fff"
                stroke={color}
                strokeWidth={isNow || isPeak ? '2.6' : '2'}
              />
              {/* 피크 수치 표시 */}
              {isPeak && (
                <g>
                  <rect
                    x={peakLabelX - peakLabelWidth / 2}
                    y={peakLabelY - 11}
                    width={peakLabelWidth}
                    height="19"
                    rx="9.5"
                    fill={PEAK_COLOR}
                  />
                  <text
                    x={peakLabelX}
                    y={peakLabelY + 2}
                    fontSize="11"
                    textAnchor="middle"
                    fill="#fff"
                    fontWeight="700"
                  >
                    {peakLabel}
                  </text>
                </g>
              )}
              <text
                x={p.x}
                y={H - 7}
                fontSize="8"
                textAnchor="middle"
                fill={isNow ? 'var(--accent-ink)' : '#9AA3AF'}
                fontFamily="JetBrains Mono"
                fontWeight={isNow ? 700 : 400}
              >
                {p.hour}시
              </text>
            </g>
          )
        })}
      </svg>

      <div className="legend">
        <div>
          <span className="sw" style={{ background: 'var(--accent)' }} />
          현재 시간대
        </div>
        <div>
          <span className="sw" style={{ background: PEAK_COLOR }} />
          피크 시간 ({peakHour}시, {maxVal}명)
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA3AF' }}>
          단위: 방문자(명)
        </div>
      </div>
    </div>
  )
}
