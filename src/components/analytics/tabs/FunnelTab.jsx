import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import Funnel from '../Funnel'
import { HOURS } from '../../../data/analytics'

export default function FunnelTab() {
  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      <div>
        <div className="section-h"><h2>전환 요약</h2><span className="sub">· 입구 → 체류 → 계산대 → 이탈</span></div>
        <div className="kpis" style={{marginTop: 10}}>
          <KPI label="입구 진입 이벤트" icon={<Ic.Door/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)" value="4,126" unit="건" delta={7.4}/>
          <KPI label="계산대 진입 이벤트" icon={<Ic.Cart/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)" value="1,392" unit="건" delta={11.2}/>
          <KPI label="입구→계산대 전환율" icon={<Ic.Trend/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)" value="33.7" unit="%" delta={3.0}/>
          <KPI label="이탈률" icon={<Ic.Door/>} iconBg="oklch(0.95 0.04 25)" iconFg="oklch(0.55 0.16 25)" value="57.6" unit="%" delta={-2.4} hint="체류만 후 이탈"/>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>오프라인 전환 퍼널</h3>
          <span className="sub">· 30일 누적</span>
          <div className="right"><span className="chip">Vision AI Zone Events</span></div>
        </div>
        <div className="card-b"><Funnel/></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-h"><h3>시간대별 전환율</h3></div>
          <div className="card-b">
            <svg viewBox="0 0 540 220" preserveAspectRatio="none" style={{width:"100%", height: 220}}>
              {(() => {
                const PAD_L=34, PAD_R=14, PAD_T=14, PAD_B=24, innerW=540-PAD_L-PAD_R, innerH=220-PAD_T-PAD_B
                const data = [22, 28, 32, 41, 44, 36, 30, 33, 38, 42, 39, 35, 28]
                const max = 60
                const x = i => PAD_L + (i / (data.length - 1)) * innerW
                const y = v => PAD_T + innerH - (v / max) * innerH
                const path = data.map((d, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(d).toFixed(1)).join(" ")
                const area = path + ` L${x(data.length - 1)},${PAD_T + innerH} L${x(0)},${PAD_T + innerH} Z`
                return (
                  <g>
                    <defs>
                      <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22"/>
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {[0,20,40,60].map(g => (
                      <g key={g}>
                        <line x1={PAD_L} x2={540 - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={g===0?"":"3 4"}/>
                        <text x={PAD_L-6} y={y(g)+3} fontSize="9.5" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}%</text>
                      </g>
                    ))}
                    {HOURS.filter((_,i)=>i%2===0).map((d,i)=>(
                      <text key={d.h} x={x(i*2)} y={214} fontSize="9.5" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{d.h}시</text>
                    ))}
                    <path d={area} fill="url(#cg2)"/>
                    <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/>
                    {data.map((d,i)=>(<circle key={i} cx={x(i)} cy={y(d)} r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.8"/>))}
                  </g>
                )
              })()}
            </svg>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>퍼널 인사이트</h3><span className="sub">· 자동 생성</span></div>
          <div className="card-b ai-list">
            <div className="ai-card"><div className="num">01</div><div>
              <div className="t">체류 후 이탈률이 가장 높은 시간은 16시</div>
              <div className="b">14–16시 사이 체류 후 계산대 미진입 비중이 평균 64%로 다른 시간대보다 높아요. 이 시간대 진열이나 안내 동선을 점검해 보세요.</div>
            </div></div>
            <div className="ai-card"><div className="num">02</div><div>
              <div className="t">점심 시간대 전환율이 평소 대비 +18%</div>
              <div className="b">12–13시 전환율이 44%로 일평균 대비 가장 높아요. 점심 메뉴 결정형 방문자가 많아 즉시 결제 비중이 큰 패턴입니다.</div>
            </div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
