import { HOURS } from '../../../data/analytics'

export default function HoursChart({ height = 220 }) {
  const W = 760, H = height, PAD_L = 36, PAD_R = 14, PAD_T = 14, PAD_B = 26
  const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B
  const maxY = 140
  const x = h => PAD_L + ((h - HOURS[0].h) / (HOURS[HOURS.length - 1].h - HOURS[0].h)) * innerW
  const y = v => PAD_T + innerH - (v / maxY) * innerH
  const todayPts = HOURS.map(d => [x(d.h), y(d.v)])
  const prevPts  = HOURS.map(d => [x(d.h), y(d.prev)])

  const smooth = pts => {
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    return d
  }

  const todayP = smooth(todayPts)
  const prevP  = smooth(prevPts)
  const areaP  = todayP + ` L${todayPts[todayPts.length - 1][0]},${PAD_T + innerH} L${todayPts[0][0]},${PAD_T + innerH} Z`

  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} style={{height}} preserveAspectRatio="none">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0, 35, 70, 105, 140].map((g, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={i === 0 ? "" : "3 4"}/>
          <text x={PAD_L - 8} y={y(g) + 3} fontSize="10" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
        </g>
      ))}
      {HOURS.map(d => (
        <text key={d.h} x={x(d.h)} y={H - 8} fontSize="10" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{String(d.h).padStart(2, "0")}</text>
      ))}
      <path d={prevP} fill="none" stroke="#C9D0DA" strokeWidth="1.4" strokeDasharray="4 4" strokeLinecap="round"/>
      <path d={areaP} fill="url(#hg)"/>
      <path d={todayP} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"/>
      {todayPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={HOURS[i].h === 19 ? 4.5 : 2.4} fill="#fff" stroke="var(--accent)" strokeWidth="1.8"/>
      ))}
    </svg>
  )
}
