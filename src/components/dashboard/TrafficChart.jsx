import { HOUR_DATA } from '../../data/dashboard'

export default function TrafficChart({ style }) {
  const W = 760, H = 240, PAD_L = 36, PAD_R = 14, PAD_T = 16, PAD_B = 28
  const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B
  const maxY = 140
  const xs = HOUR_DATA.map(([h]) => h)
  const x = h => PAD_L + ((h - xs[0]) / (xs[xs.length - 1] - xs[0])) * innerW
  const y = v => PAD_T + innerH - (v / maxY) * innerH

  const today = HOUR_DATA.map(([h, t]) => [x(h), y(t)])
  const yest  = HOUR_DATA.map(([h, , ye]) => [x(h), y(ye)])

  const smoothPath = pts => {
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    return d
  }

  const todayPath = smoothPath(today)
  const yestPath  = smoothPath(yest)
  const areaPath  = todayPath + ` L${today[today.length - 1][0]},${PAD_T + innerH} L${today[0][0]},${PAD_T + innerH} Z`
  const gridY = [0, 35, 70, 105, 140]
  const nowX = x(17)

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {gridY.map((g, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={i === 0 ? "" : "3 4"}/>
            <text x={PAD_L - 8} y={y(g) + 3} fontSize="10" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
          </g>
        ))}
        {HOUR_DATA.map(([h]) => (
          <text key={h} x={x(h)} y={H - 10} fontSize="10" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{String(h).padStart(2, "0")}</text>
        ))}
        <line x1={nowX} x2={nowX} y1={PAD_T} y2={H - PAD_B} stroke="oklch(0.62 0.14 250)" strokeWidth="1" strokeDasharray="2 3" opacity="0.55"/>
        <rect x={nowX + 4} y={PAD_T + 2} width="48" height="16" rx="4" fill="oklch(0.95 0.03 250)"/>
        <text x={nowX + 28} y={PAD_T + 13} fontSize="10" textAnchor="middle" fill="oklch(0.48 0.16 250)" fontWeight="600">현재 17시</text>
        <path d={yestPath} fill="none" stroke="#C9D0DA" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round"/>
        {style !== "line" && <path d={areaPath} fill="url(#areaG)"/>}
        <path d={todayPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"/>
        {today.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={HOUR_DATA[i][0] === 19 ? 4.5 : 2.5} fill="#fff" stroke="var(--accent)" strokeWidth="1.8"/>
          </g>
        ))}
        {(() => {
          const peakI = HOUR_DATA.findIndex(d => d[1] === Math.max(...HOUR_DATA.map(d => d[1])))
          const px = today[peakI][0], py = today[peakI][1]
          return (
            <g>
              <rect x={px - 44} y={py - 32} width="88" height="22" rx="6" fill="#0F1419"/>
              <text x={px} y={py - 17} textAnchor="middle" fontSize="10.5" fill="#fff" fontWeight="600">피크 124명</text>
              <path d={`M${px - 4},${py - 10} L${px},${py - 6} L${px + 4},${py - 10} Z`} fill="#0F1419"/>
            </g>
          )
        })()}
      </svg>
      <div className="legend">
        <div><span className="sw" style={{background: "var(--accent)"}}/>오늘</div>
        <div><span className="sw" style={{background: "#C9D0DA"}}/>어제</div>
        <div style={{marginLeft:"auto", fontSize:11, color:"#9AA3AF"}}>단위: 시간당 방문자(명)</div>
      </div>
    </div>
  )
}
