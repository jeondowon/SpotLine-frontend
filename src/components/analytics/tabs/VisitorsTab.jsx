import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import HoursChart from '../charts/HoursChart'
import DailyBars from '../charts/DailyBars'
import Heatmap from '../charts/Heatmap'
import GenderCard from '../GenderCard'
import AgeCard from '../AgeCard'
import { DAYS_30 } from '../../../data/analytics'

export default function VisitorsTab() {
  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      <div>
        <div className="section-h"><h2>방문자 요약</h2><span className="sub">· 최근 30일</span></div>
        <div className="kpis" style={{marginTop: 10}}>
          <KPI label="총 방문자 수" icon={<Ic.Users/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
               value="11,238" unit="명" delta={9.2} spark={DAYS_30.slice(-14)} sparkColor="oklch(0.62 0.14 250)"/>
          <KPI label="일평균 방문자" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
               value="374" unit="명" delta={6.1} spark={DAYS_30.slice(-14)} sparkColor="oklch(0.65 0.14 65)"/>
          <KPI label="피크 시간 방문자" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
               value="124" unit="명/시" delta={14.8} hint="19시 평균"/>
          <KPI label="주요 연령대" icon={<Ic.Users/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
               value="20대" hint="전체의 38%"/>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>시간대별 방문자 (30일 평균)</h3>
          <div className="right"><span className="chip dot">최근 30일</span><span className="chip">이전 30일</span></div>
        </div>
        <div className="card-b" style={{padding: "8px 16px 16px"}}>
          <HoursChart height={240}/>
          <div className="legend" style={{marginTop: 6}}>
            <div><span className="sw" style={{background: "var(--accent)"}}/>최근 30일</div>
            <div><span className="sw" style={{background: "#C9D0DA"}}/>이전 30일</div>
            <div style={{marginLeft:"auto", fontSize:11, color:"#9AA3AF"}}>단위: 시간당 방문자(명)</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{gridTemplateColumns: "1.4fr 1fr"}}>
        <div className="card">
          <div className="card-h"><h3>요일 × 시간대 히트맵</h3><span className="sub">· 방문자 밀도</span></div>
          <div className="card-b" style={{padding: "16px 16px 14px"}}>
            <div className="heat-wrap">
              <Heatmap/>
            </div>
            <div style={{marginTop: 12, display:"flex", alignItems:"center", gap: 8, fontSize: 11, color:"var(--muted)", flexWrap:"wrap"}}>
              <span>낮음</span>
              <div style={{display:"flex", gap: 2}}>
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map(a => (
                  <div key={a} style={{width: 14, height: 12, borderRadius: 3, background: `oklch(0.62 0.14 250 / ${a})`}}/>
                ))}
              </div>
              <span>높음</span>
              <span style={{marginLeft:"auto"}} className="mono">토요일 19시 · 피크</span>
            </div>
          </div>
        </div>
        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <div className="card-h"><h3>일별 방문자 추이</h3><span className="sub">· 30일</span></div>
          <div className="card-b" style={{flex:1, padding:0}}>
            <DailyBars days={30}/>
          </div>
        </div>
      </div>

      <div className="grid-2"><GenderCard/><AgeCard/></div>
    </div>
  )
}
