import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import Scatter from '../charts/Scatter'
import WeatherCorrTable from '../WeatherCorrTable'

export default function WeatherTab() {
  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      <div>
        <div className="section-h"><h2>날씨 영향 요약</h2><span className="sub">· 최근 30일</span></div>
        <div className="kpis" style={{marginTop: 10}}>
          <KPI label="기온 ↔ 방문자 상관" icon={<Ic.Sun/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)" value="0.78" hint="강한 양의 상관"/>
          <KPI label="비 오는 날 방문자" icon={<Ic.CloudRain/>} iconBg="oklch(0.95 0.04 250)" iconFg="oklch(0.48 0.16 250)" value="-25" unit="%" hint="평소 대비 감소"/>
          <KPI label="맑은 날 방문자" icon={<Ic.Sun/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)" value="+9.4" unit="%" hint="평소 대비 증가"/>
          <KPI label="비 오는 날 체류" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)" value="+8.6" unit="%" hint="평소보다 더 길게 머무름"/>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-h"><h3>기온 vs 일별 방문자</h3><span className="sub">· 30일</span></div>
          <div className="card-b">
            <Scatter/>
            <div style={{display:"flex", gap: 14, marginTop: 8, fontSize: 11.5, color: "var(--muted)", flexWrap:"wrap"}}>
              {[["맑음","oklch(0.75 0.13 80)"],["흐림","oklch(0.72 0.05 250)"],["비","oklch(0.62 0.14 250)"],["고온","oklch(0.65 0.18 25)"]].map(([l,c]) => (
                <span key={l} style={{display:"inline-flex", alignItems:"center", gap: 6}}>
                  <span style={{width: 9, height: 9, background: c, borderRadius: 99}}/>{l}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>오늘 기상 영향 예측</h3><span className="sub">· AI 추정</span></div>
          <div className="card-b" style={{display:"flex", flexDirection:"column", gap: 12}}>
            <div className="wx">
              <div className="wx-icn"><Ic.Sun/></div>
              <div>
                <div className="wx-temp mono">23°</div>
                <div className="wx-desc">맑음 · 강수확률 10% · 5월 16일</div>
              </div>
            </div>
            <div style={{padding: "12px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 12.5, lineHeight: 1.55}}>
              과거 동일 기상 조건에서 평소보다 <b>+14%</b> 방문자 증가가 관측됐어요. 야외 입간판, 외부 시식 행사를 활용해 보세요.
            </div>
            <div className="list-rows">
              <div className="row"><span className="k" style={{color: "var(--muted)"}}>예상 방문자</span><span className="v">+58명</span></div>
              <div className="row"><span className="k" style={{color: "var(--muted)"}}>예상 피크</span><span className="v">19시</span></div>
              <div className="row"><span className="k" style={{color: "var(--muted)"}}>예상 전환율</span><span className="v">38–40%</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>날씨별 비즈니스 지표 비교</h3><span className="sub">· 평소 대비</span></div>
        <div className="card-b"><WeatherCorrTable/></div>
      </div>
    </div>
  )
}
