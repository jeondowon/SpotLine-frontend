import { DAYS_30 } from '../../../data/analytics'

export default function DailyBars({ days = 30, visits }) {
  const useReal = visits && visits.date?.length > 0 && visits.data?.[0]?.length > 0
  const data = useReal ? visits.data[0] : DAYS_30.slice(-days)
  const dates = useReal ? visits.date : null
  const max = Math.max(...data)

  const W = 480, H = 260
  const PAD_L = 16, PAD_R = 16, PAD_T = 30, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const baseY = PAD_T + innerH
  const barW = innerW / data.length
  const gap = Math.max(2, barW * 0.22)

  function getLabel(i) {
    if (useReal) {
      const d = new Date(dates[i])
      const showIdx = i === 0 || i === data.length - 1 || (data.length > 10 && i === Math.floor(data.length / 2))
      if (!showIdx) return null
      return `${d.getMonth() + 1}/${d.getDate()}`
    }
    const isToday = i === data.length - 1
    if (i === 0) return `${days}일전`
    if (isToday) return '오늘'
    if (i === Math.floor(days / 2)) return `${days - i}일전`
    return null
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block", minHeight: 180 }}
    >
      <line x1={PAD_L} x2={W - PAD_R} y1={baseY} y2={baseY} stroke="#ECEEF2" strokeWidth="1"/>
      {data.map((v, i) => {
        const isLast = i === data.length - 1
        const barH = Math.max(3, (v / max) * innerH)
        const x = PAD_L + i * barW + gap / 2
        const y = baseY - barH
        const w = barW - gap
        const fill = isLast ? "oklch(0.62 0.13 250)" : "var(--accent)"
        const lbl = getLabel(i)
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={barH} rx={Math.min(3, w / 3)} fill={fill} opacity={isLast ? 1 : 0.72}/>
            {isLast && (
              <text x={x + w / 2} y={y - 6} fontSize="11" textAnchor="middle"
                fill="oklch(0.62 0.13 250)" fontFamily="JetBrains Mono, monospace" fontWeight="700">{v}</text>
            )}
            {lbl && (
              <text x={x + w / 2} y={H - 8} fontSize="10" textAnchor="middle"
                fill="#9AA3AF" fontFamily="JetBrains Mono, monospace">{lbl}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
