import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import AgeCard from '../AgeCard'
import Histogram from '../charts/Histogram'
import { HOURS } from '../../../data/analytics'

export default function StayTab() {
  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      <div>
        <div className="section-h"><h2>체류 시간 요약</h2></div>
        <div className="kpis" style={{marginTop: 10}}>
          <KPI label="평균 체류 시간" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)" value="23분" delta={4.2}/>
          <KPI label="중앙값 (median)" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)" value="18분" delta={2.1}/>
          <KPI label="최장 체류 (P95)" icon={<Ic.Trend/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)" value="62분" delta={-1.3}/>
          <KPI label="이탈성 짧은 체류" icon={<Ic.Door/>} iconBg="oklch(0.95 0.04 25)" iconFg="oklch(0.55 0.16 25)" value="14" unit="%" delta={-3.1} hint="< 5분 비중"/>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-h"><h3>체류 시간 분포</h3><span className="sub">· 전체 방문자</span></div>
          <div className="card-b"><Histogram/></div>
        </div>
        <div className="card">
          <div className="card-h"><h3>평균 체류 시간 추이</h3><span className="sub">· 14일</span></div>
          <div className="card-b">
            <svg viewBox="0 0 380 180" preserveAspectRatio="none" style={{width:"100%", height: 180}}>
              {(() => {
                const data = [19,20,21,20,22,23,22,21,23,24,23,23,24,23]
                const PAD_L=28, PAD_R=10, PAD_T=10, PAD_B=22, innerW=380-PAD_L-PAD_R, innerH=180-PAD_T-PAD_B
                const x = i => PAD_L + (i / (data.length - 1)) * innerW
                const y = v => PAD_T + innerH - ((v - 15) / (28 - 15)) * innerH
                const path = data.map((d, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(d).toFixed(1)).join(" ")
                return (
                  <g>
                    {[15, 20, 25].map(g => (
                      <g key={g}>
                        <line x1={PAD_L} x2={380 - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray="3 4"/>
                        <text x={PAD_L - 4} y={y(g) + 3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}m</text>
                      </g>
                    ))}
                    <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.2"/>
                    {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d)} r="2.4" fill="#fff" stroke="var(--accent)" strokeWidth="1.6"/>)}
                  </g>
                )
              })()}
            </svg>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <AgeCard title="연령대별 평균 체류"/>
        <div className="card">
          <div className="card-h"><h3>시간대별 평균 체류</h3></div>
          <div className="card-b">
            <svg className="hours-svg" viewBox="0 0 760 110" preserveAspectRatio="none" style={{height: 160}}>
              {(() => {
                const PAD_L=30, PAD_R=10, PAD_T=10, PAD_B=22, innerW=760-PAD_L-PAD_R, innerH=110-PAD_T-PAD_B
                const max = 36
                const x = i => PAD_L + (i / (HOURS.length - 1)) * innerW
                const y = v => PAD_T + innerH - (v / max) * innerH
                const w = innerW / HOURS.length - 2
                return HOURS.map((d, i) => {
                  const bh = (d.stay / max) * innerH
                  return <rect key={i} x={x(i) - w / 2} y={y(d.stay)} width={w} height={bh} fill="var(--accent)" opacity={d.stay > 26 ? 1 : 0.55} rx="3"/>
                })
              })()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
