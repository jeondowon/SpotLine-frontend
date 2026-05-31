export default function HourlyCongestionChart({ data }) {
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
    hourMap[h] = (hourMap[h] || 0) + (data.data[i] || 0)
  })

  const now = new Date().getHours()
  const hours = Object.keys(hourMap).map(Number).sort((a, b) => a - b)
  const values = hours.map(h => hourMap[h])
  const maxVal = Math.max(...values, 1)
  const peakHour = hours[values.indexOf(maxVal)]

  const W = 760, H = 180
  const PAD_L = 30, PAD_R = 10, PAD_T = 10, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = hours.length
  const slotW = innerW / n
  const barW = Math.max(6, slotW * 0.62)

  const cx = (i) => PAD_L + slotW * i + slotW / 2
  const bh = (v) => Math.max(2, (v / maxVal) * innerH)
  const by = (v) => PAD_T + innerH - bh(v)

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
              <text x={PAD_L - 4} y={gy + 3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{gv}</text>
            </g>
          )
        })}

        {/* 막대 */}
        {hours.map((h, i) => {
          const v = hourMap[h]
          const isNow = h === now
          const isPeak = h === peakHour
          const fill = isNow
            ? 'var(--accent)'
            : isPeak
            ? 'oklch(0.55 0.14 65)'
            : 'oklch(0.80 0.06 220)'
          return (
            <g key={h}>
              <rect
                x={cx(i) - barW / 2}
                y={by(v)}
                width={barW}
                height={bh(v)}
                rx={3}
                fill={fill}
                opacity={isNow || isPeak ? 1 : 0.72}
              />
              {/* 피크 수치 표시 */}
              {isPeak && (
                <text
                  x={cx(i)}
                  y={by(v) - 4}
                  fontSize="9"
                  textAnchor="middle"
                  fill="oklch(0.55 0.14 65)"
                  fontFamily="JetBrains Mono"
                  fontWeight="700"
                >
                  {v}
                </text>
              )}
              <text
                x={cx(i)}
                y={H - 6}
                fontSize="9"
                textAnchor="middle"
                fill={isNow ? 'var(--accent-ink)' : '#9AA3AF'}
                fontFamily="JetBrains Mono"
                fontWeight={isNow ? 700 : 400}
              >
                {h}시
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
          <span className="sw" style={{ background: 'oklch(0.55 0.14 65)' }} />
          피크 시간 ({peakHour}시, {maxVal}명)
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA3AF' }}>
          단위: 방문자(명)
        </div>
      </div>
    </div>
  )
}
