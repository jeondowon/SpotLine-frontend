import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import HoursChart from '../charts/HoursChart'
import DailyBars from '../charts/DailyBars'
import Heatmap from '../charts/Heatmap'
import Histogram from '../charts/Histogram'
import Scatter from '../charts/Scatter'
import GenderCard from '../GenderCard'
import AgeCard from '../AgeCard'
import Funnel from '../Funnel'
import WeatherCorrTable from '../WeatherCorrTable'
import { DAYS_30, HOURS } from '../../../data/analytics'

export default function OverviewTab() {
  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      {/* KPI 요약 */}
      <div>
        <div className="section-h"><h2>핵심 분석 요약</h2><span className="sub">· 최근 30일</span><span className="meta">기준일 2026.05.16</span></div>
        <div className="kpis-6" style={{marginTop: 10}}>
          <KPI className="compact" label="총 방문자 수" icon={<Ic.Users/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
               value="11,238" unit="명" delta={9.2} spark={DAYS_30.slice(-12)} sparkColor="oklch(0.62 0.14 250)"/>
          <KPI className="compact" label="평균 체류 시간" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
               value="23분" delta={4.2} hint="이전 30일 대비"/>
          <KPI className="compact" label="입구→계산대 전환율" icon={<Ic.Trend/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
               value="33.7" unit="%" delta={1.6}/>
          <KPI className="compact" label="가장 방문 많은 시간대" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
               value="19시" hint="시간당 평균 124명"/>
          <KPI className="compact" label="주요 방문 연령대" icon={<Ic.Users/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
               value="20대" hint="전체의 38% · AI 추정"/>
          <KPI className="compact" label="날씨 영향도" icon={<Ic.Sun/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
               value="높음" hint={<span>상관계수 <b className="mono">0.78</b></span>}/>
        </div>
      </div>

      {/* 방문자 분석 */}
      <div>
        <div className="section-h"><h2>방문자 분석</h2><span className="sub">· 시간대, 일별, 인구 통계</span></div>
        <div className="grid-2-1" style={{marginTop: 10}}>
          <div className="card">
            <div className="card-h">
              <h3>시간대별 평균 방문자</h3>
              <span className="sub">· 30일 평균</span>
              <div className="right"><span className="chip dot">방문자</span><span className="chip">전월 비교</span></div>
            </div>
            <div className="card-b" style={{padding: "8px 12px 14px"}}>
              <HoursChart height={220}/>
              <div className="legend">
                <div><span className="sw" style={{background: "var(--accent)"}}/>최근 30일</div>
                <div><span className="sw" style={{background: "#C9D0DA"}}/>이전 30일</div>
                <div style={{marginLeft:"auto", fontSize:11, color:"#9AA3AF"}}>단위: 시간당 방문자(명)</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>요일 × 시간대 히트맵</h3><span className="sub">· 방문자 밀도</span></div>
            <div className="card-b">
              <Heatmap/>
              <div style={{marginTop: 12, display:"flex", alignItems:"center", gap: 8, fontSize: 11, color:"var(--muted)"}}>
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
        </div>
        <div className="grid-3" style={{marginTop: 12}}>
          <div className="card">
            <div className="card-h"><h3>일별 방문자 추이</h3><span className="sub">· 30일</span></div>
            <div className="card-b"><DailyBars days={30}/></div>
          </div>
          <GenderCard/>
          <AgeCard/>
        </div>
      </div>

      {/* 체류 시간 */}
      <div>
        <div className="section-h"><h2>체류 시간 분석</h2><span className="sub">· 분포, 시간대, 연령대</span></div>
        <div className="grid-3" style={{marginTop: 10}}>
          <div className="card">
            <div className="card-h"><h3>체류 시간 분포</h3><span className="sub">· 전체 방문자</span></div>
            <div className="card-b">
              <Histogram/>
              <div style={{marginTop: 12, padding: "10px 12px", background: "#F7F9FC", borderRadius: 10, fontSize: 12, color: "var(--muted)"}}>
                <b style={{color: "var(--ink)"}}>10–20분</b> 구간 비중이 가장 높아요 (28%). 짧은 체류 비중을 줄이면 전환율 개선 여지가 있어요.
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>시간대별 평균 체류</h3><span className="sub">· 분(min)</span></div>
            <div className="card-b">
              <svg className="hours-svg" viewBox="0 0 760 110" preserveAspectRatio="none">
                {(() => {
                  const PAD_L=30, PAD_R=10, PAD_T=8, PAD_B=22, innerW=760-PAD_L-PAD_R, innerH=110-PAD_T-PAD_B
                  const max = 36
                  const x = i => PAD_L + (i / (HOURS.length - 1)) * innerW
                  const y = v => PAD_T + innerH - (v / max) * innerH
                  const pts = HOURS.map((d, i) => [x(i), y(d.stay)])
                  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")
                  return (
                    <g>
                      {[0, 12, 24, 36].map(g => (
                        <g key={g}>
                          <line x1={PAD_L} x2={760 - PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={g === 0 ? "" : "3 4"}/>
                          <text x={PAD_L - 4} y={y(g) + 3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
                        </g>
                      ))}
                      {HOURS.filter((_, i) => i % 2 === 0).map((d, i) => (
                        <text key={d.h} x={x(i * 2)} y={102} fontSize="9" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{d.h}</text>
                      ))}
                      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill="#fff" stroke="var(--accent)" strokeWidth="1.6"/>)}
                    </g>
                  )
                })()}
              </svg>
              <div style={{display:"flex", justifyContent:"space-between", fontSize: 12, color: "var(--muted)", marginTop: 4}}>
                <span>점심 시간대 (12–13시)<br/><b className="mono" style={{color: "var(--ink)"}}>32분</b></span>
                <span style={{textAlign:"right"}}>저녁 피크 (18–19시)<br/><b className="mono" style={{color: "var(--ink)"}}>29분</b></span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>연령대별 평균 체류</h3><span className="sub">· AI 추정 · 분</span></div>
            <div className="card-b">
              <div className="age-stay">
                {[{label:"20–29",stay:21},{label:"30–39",stay:26},{label:"40–49",stay:24},{label:"50–59",stay:18},{label:"기타",stay:14}].map(a => (
                  <div className="row" key={a.label}>
                    <div className="l">{a.label}</div>
                    <div className="track"><div className="fill" style={{width: (a.stay / 30) * 100 + "%"}}/></div>
                    <div className="v">{a.stay}분</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: 14, fontSize: 11.5}} className="priv">
                <Ic.Shield color="#9AA3AF"/>연령대는 익명 통계 · 개인 식별 없음
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전환 분석 */}
      <div>
        <div className="section-h"><h2>오프라인 전환 분석</h2><span className="sub">· 입구 → 체류 → 계산대 → 이탈</span></div>
        <div className="grid-2" style={{marginTop: 10, gridTemplateColumns: "1.4fr 1fr"}}>
          <div className="card">
            <div className="card-h">
              <h3>오프라인 전환 퍼널</h3>
              <span className="sub">· 30일 누적</span>
              <div className="right"><span className="chip">Vision AI Zone Events</span></div>
            </div>
            <div className="card-b"><Funnel/></div>
          </div>
          <div className="card">
            <div className="card-h"><h3>시간대별 전환율</h3><span className="sub">· 입구 대비 계산대</span></div>
            <div className="card-b">
              <svg viewBox="0 0 540 200" preserveAspectRatio="none" style={{width:"100%", height: 200}}>
                {(() => {
                  const PAD_L=34, PAD_R=14, PAD_T=14, PAD_B=24, innerW=540-PAD_L-PAD_R, innerH=200-PAD_T-PAD_B
                  const data = [22, 28, 32, 41, 44, 36, 30, 33, 38, 42, 39, 35, 28]
                  const max = 60
                  const x = i => PAD_L + (i / (data.length - 1)) * innerW
                  const y = v => PAD_T + innerH - (v / max) * innerH
                  const path = data.map((d, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + "," + y(d).toFixed(1)).join(" ")
                  const area = path + ` L${x(data.length - 1)},${PAD_T + innerH} L${x(0)},${PAD_T + innerH} Z`
                  return (
                    <g>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.50 0.16 295)" stopOpacity="0.22"/>
                          <stop offset="100%" stopColor="oklch(0.50 0.16 295)" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {[0,20,40,60].map(g => (
                        <g key={g}>
                          <line x1={PAD_L} x2={540-PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={g===0?"":"3 4"}/>
                          <text x={PAD_L-6} y={y(g)+3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}%</text>
                        </g>
                      ))}
                      {HOURS.filter((_,i)=>i%2===0).map((d,i)=>(
                        <text key={d.h} x={x(i*2)} y={194} fontSize="9.5" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{d.h}</text>
                      ))}
                      <path d={area} fill="url(#cg)"/>
                      <path d={path} fill="none" stroke="oklch(0.50 0.16 295)" strokeWidth="2.2" strokeLinecap="round"/>
                      {data.map((d,i)=>(<circle key={i} cx={x(i)} cy={y(d)} r="2.4" fill="#fff" stroke="oklch(0.50 0.16 295)" strokeWidth="1.6"/>))}
                    </g>
                  )
                })()}
              </svg>
              <div className="list-rows" style={{marginTop: 6}}>
                <div className="row"><span className="k" style={{color:"var(--muted)"}}>최고 전환 시간</span><span className="v">13시 · 44%</span></div>
                <div className="row"><span className="k" style={{color:"var(--muted)"}}>최저 전환 시간</span><span className="v">10시 · 22%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 날씨 영향 */}
      <div>
        <div className="section-h"><h2>날씨 영향 분석</h2><span className="sub">· 날씨 × 비즈니스 지표</span></div>
        <div className="grid-2-1" style={{marginTop: 10}}>
          <div className="card">
            <div className="card-h"><h3>기온 vs 방문자 수</h3><span className="sub">· 30일 일별</span><div className="right"><span className="chip">상관관계</span></div></div>
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
            <div className="card-h"><h3>날씨 영향도</h3><span className="sub">· 평소 대비</span></div>
            <div className="card-b"><WeatherCorrTable/></div>
          </div>
        </div>
      </div>

      <div className="priv" style={{padding:"6px 4px 12px", fontSize: 12}}>
        <Ic.Shield color="#9AA3AF"/>
        모든 통계는 Vision AI 익명 집계 결과입니다. 얼굴 인식, 개인 식별, 영상 저장은 수행하지 않습니다.
      </div>
    </div>
  )
}
