// visits/count API 응답: { date: string[], data: number[][] }
// data[0]=5일, data[1]=10일, data[2]=20일, data[3]=60일 이동평균선

const LINE_META = [
  { label: '5일',  color: 'var(--accent)',          width: 2.2, opacity: 1    },
  { label: '10일', color: 'oklch(0.55 0.16 265)',   width: 1.6, opacity: 0.75 },
  { label: '20일', color: 'oklch(0.50 0.14 295)',   width: 1.4, opacity: 0.6  },
  { label: '60일', color: 'oklch(0.62 0.06 250)',   width: 1.2, opacity: 0.45 },
]

export default function VisitTrendChart({ visits, height = 220 }) {
  if (!visits?.date?.length || !visits?.data?.length) {
    return (
      <div style={{height, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', fontSize:13}}>
        방문 추세 데이터 없음
      </div>
    )
  }

  const { date, data: lines } = visits
  const n = date.length

  const allVals = lines.flat().filter(v => v != null && !isNaN(v))
  if (!allVals.length) return null
  const maxVal = Math.max(...allVals) || 1
  const minVal = Math.min(...allVals)

  const W = 760, H = height
  const PAD_L = 40, PAD_R = 12, PAD_T = 16, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  const xPos = i => PAD_L + (i / Math.max(n - 1, 1)) * innerW
  const yPos = v => PAD_T + innerH - ((v - minVal) / Math.max(maxVal - minVal, 1)) * innerH

  const yTicks = [minVal, Math.round(minVal + (maxVal - minVal) * 0.5), maxVal]
  const labelStep = Math.max(1, Math.floor(n / 6))

  return (
    <div style={{position:'relative'}}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{width:'100%', height, display:'block'}}>
        {/* 그리드 */}
        {yTicks.map((g, gi) => (
          <g key={gi}>
            <line x1={PAD_L} x2={W-PAD_R} y1={yPos(g)} y2={yPos(g)}
              stroke="#ECEEF2" strokeDasharray={gi === 0 ? '' : '3 4'}/>
            <text x={PAD_L-4} y={yPos(g)+3} fontSize="9" textAnchor="end"
              fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
          </g>
        ))}
        {/* X축 날짜 레이블 */}
        {date.map((d, i) => {
          if (i % labelStep !== 0 && i !== n - 1) return null
          const dt = new Date(d)
          return (
            <text key={i} x={xPos(i)} y={H-5} fontSize="9" textAnchor="middle"
              fill="#9AA3AF" fontFamily="JetBrains Mono">
              {`${dt.getMonth()+1}/${dt.getDate()}`}
            </text>
          )
        })}
        {/* 이동평균 선 */}
        {lines.map((lineData, li) => {
          if (!lineData?.length) return null
          const meta = LINE_META[li] ?? LINE_META[0]
          const path = lineData
            .map((v, i) => (i === 0 ? 'M' : 'L') + xPos(i).toFixed(1) + ',' + yPos(v ?? minVal).toFixed(1))
            .join(' ')
          return (
            <path key={li} d={path} fill="none"
              stroke={meta.color} strokeWidth={meta.width}
              strokeLinecap="round" strokeLinejoin="round"
              opacity={meta.opacity}/>
          )
        })}
        {/* 마지막 포인트 강조 */}
        {lines[0] && n > 0 && (
          <circle cx={xPos(n-1)} cy={yPos(lines[0][n-1] ?? minVal)} r="3.5"
            fill="#fff" stroke="var(--accent)" strokeWidth="2"/>
        )}
      </svg>
      {/* 범례 */}
      <div style={{display:'flex', gap:14, padding:'0 4px 2px', flexWrap:'wrap'}}>
        {LINE_META.slice(0, lines.length).map((m, i) => (
          <span key={i} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)'}}>
            <span style={{width:16, height:2.5, background:m.color, borderRadius:2, display:'inline-block', opacity:m.opacity}}/>
            {m.label} 이동평균
          </span>
        ))}
      </div>
    </div>
  )
}
