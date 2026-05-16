import { SCATTER_PTS } from '../../../data/analytics'

export default function Scatter() {
  const W = 540, H = 240, PAD_L = 40, PAD_R = 16, PAD_T = 14, PAD_B = 28
  const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B
  const xMin = 8, xMax = 34, yMin = 200, yMax = 540
  const x = t => PAD_L + ((t - xMin) / (xMax - xMin)) * innerW
  const y = v => PAD_T + innerH - ((v - yMin) / (yMax - yMin)) * innerH
  const colors = { sunny:"oklch(0.75 0.13 80)", cloudy:"oklch(0.72 0.05 250)", rain:"oklch(0.62 0.14 250)", hot:"oklch(0.65 0.18 25)" }

  const xs = SCATTER_PTS.map(p => p[0]), ys = SCATTER_PTS.map(p => p[1])
  const n = xs.length
  const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0)
  const sxx = xs.reduce((a, b) => a + b * b, 0), sxy = xs.reduce((a, b, i) => a + b * ys[i], 0)
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const b = (sy - m * sx) / n
  const lx1 = xMin, lx2 = 28
  const ly1 = m * lx1 + b, ly2 = m * lx2 + b

  return (
    <svg className="scatter-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {[200, 300, 400, 500].map(g => (
        <g key={g}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray="3 4"/>
          <text x={PAD_L - 6} y={y(g) + 3} fontSize="10" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
        </g>
      ))}
      {[10, 15, 20, 25, 30].map(g => (
        <text key={g} x={x(g)} y={H - 8} fontSize="10" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}°</text>
      ))}
      <line x1={x(lx1)} y1={y(ly1)} x2={x(lx2)} y2={y(ly2)} stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.7"/>
      {SCATTER_PTS.map((p, i) => (
        <circle key={i} cx={x(p[0])} cy={y(p[1])} r="5" fill={colors[p[2]]} opacity="0.85" stroke="#fff" strokeWidth="1.5"/>
      ))}
      <text x={W - PAD_R - 2} y={y(ly2) - 6} fontSize="10.5" textAnchor="end" fill="var(--accent-ink)" fontWeight="600" fontFamily="JetBrains Mono">상관계수 r = 0.78</text>
    </svg>
  )
}
