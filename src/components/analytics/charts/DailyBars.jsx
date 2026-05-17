import { DAYS_30 } from '../../../data/analytics'

export default function DailyBars({ days = 30 }) {
  const data = DAYS_30.slice(-days)
  const max = Math.max(...data)

  const W = 480, H = 260
  const PAD_L = 16, PAD_R = 16, PAD_T = 30, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const baseY = PAD_T + innerH

  const barW = innerW / data.length
  const gap = Math.max(2, barW * 0.22)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block", minHeight: 180 }}
    >
      <line x1={PAD_L} x2={W - PAD_R} y1={baseY} y2={baseY} stroke="#ECEEF2" strokeWidth="1"/>

      {data.map((v, i) => {
        const isToday = i === data.length - 1
        const dayOfWeek = (i + 1) % 7
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6

        const barH = Math.max(3, (v / max) * innerH)
        const x = PAD_L + i * barW + gap / 2
        const y = baseY - barH
        const w = barW - gap

        const fill = isToday
          ? "oklch(0.62 0.13 250)"
          : isWeekend
          ? "oklch(0.68 0.13 295)"
          : "var(--accent)"

        const showLbl = i === 0 || i === Math.floor(days / 2) || isToday
        const lblText = i === 0 ? `${days}일전` : isToday ? "오늘" : `${days - i}일전`

        return (
          <g key={i}>
            <rect
              x={x} y={y} width={w} height={barH}
              rx={Math.min(3, w / 3)}
              fill={fill}
              opacity={isToday ? 1 : 0.72}
            />
            {isToday && (
              <text
                x={x + w / 2} y={y - 6}
                fontSize="11" textAnchor="middle"
                fill="oklch(0.62 0.13 250)"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                {v}
              </text>
            )}
            {showLbl && (
              <text
                x={x + w / 2} y={H - 8}
                fontSize="10" textAnchor="middle"
                fill="#9AA3AF"
                fontFamily="JetBrains Mono, monospace"
              >
                {lblText}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
