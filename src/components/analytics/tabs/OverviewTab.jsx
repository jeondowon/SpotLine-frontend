import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import VisitTrendChart from '../charts/VisitTrendChart'
import DailyBars from '../charts/DailyBars'
import Heatmap from '../charts/Heatmap'
import Histogram from '../charts/Histogram'
import GenderCard from '../GenderCard'
import AgeCard from '../AgeCard'
import WeekdayPatternCard from '../WeekdayPatternCard'
import { HOURS } from '../../../data/analytics'
import { ceil1 } from '../../../utils/format'

function formatAge(a) {
  const m = { '00s':'유아', '10s':'10대', '20s':'20대', '30s':'30대', '40s':'40대', '50s':'50대', 'UNKNOWN':'연령미상' }
  return m[a] ?? a ?? '연령미상'
}
function formatGender(g) {
  if (g === 'MAN') return '남성'
  if (g === 'WOMAN') return '여성'
  return '성별미상'
}
function resultLabel(r) { return r === 'GOOD' ? '좋음' : r === 'BAD' ? '나쁨' : '보통' }
function resultBg(r) {
  return r === 'GOOD' ? 'oklch(0.95 0.04 155)' : r === 'BAD' ? 'oklch(0.95 0.04 25)' : 'oklch(0.95 0.05 80)'
}
function resultFg(r) {
  return r === 'GOOD' ? 'oklch(0.42 0.12 155)' : r === 'BAD' ? 'oklch(0.55 0.16 25)' : 'oklch(0.55 0.14 65)'
}

export default function OverviewTab({ data = {}, day }) {
  const { coreCustomer, weatherImpact, weekdayPatterns, tomorrow, nextWeek, ageGroups: ageData, visits, loading } = data

  // 오늘 방문자: visits/count 마지막 데이터 포인트 (선택 날짜 기준)
  const visitsTrend = visits?.data?.[0]
  const visitCount  = visitsTrend?.length > 0 ? Math.round(visitsTrend[visitsTrend.length - 1]) : null
  const visitSpark  = visitsTrend?.slice(-14) ?? null

  const coreLabel = coreCustomer ? formatAge(coreCustomer.age) : '—'
  const coreHint  = coreCustomer ? `${formatGender(coreCustomer.gender)} · AI 분석` : 'AI 분석 · 당일'

  const weatherResult = weatherImpact?.result

  const jsDay = day ? new Date(day).getDay() : -1
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1
  const todayWeekday = weekdayPatterns?.[todayIdx]

  const tomorrowVal = tomorrow?.expectedVisits
  const nextWeekData = nextWeek?.result ?? []

  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>

      {/* KPI 요약 — 4개 */}
      <div>
        <div className="section-h">
          <h2>하루 핵심 지표</h2>
          <span className="sub">· {day}</span>
          <span className="meta">{loading ? '로딩 중…' : 'API 데이터'}</span>
        </div>
        <div className="kpis" style={{marginTop:10}}>
          <KPI label="오늘 방문자"
            icon={<Ic.Users/>}
            iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
            value={visitCount != null ? visitCount.toLocaleString() : '—'}
            unit={visitCount != null ? '명' : ''}
            hint="5일 이동평균 · visits/count"
            spark={visitSpark} sparkColor="oklch(0.62 0.14 250)"/>
          <KPI label="핵심 고객"
            icon={<Ic.Users/>}
            iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
            value={coreLabel} hint={coreHint}/>
          <KPI label="오늘 평균 체류"
            icon={<Ic.Clock/>}
            iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
            value="—" hint="집계 API 미제공"/>
          <KPI label="날씨 보정 성과"
            icon={<Ic.Sun/>}
            iconBg={weatherResult ? resultBg(weatherResult) : 'oklch(0.95 0.05 80)'}
            iconFg={weatherResult ? resultFg(weatherResult) : 'oklch(0.55 0.14 65)'}
            value={weatherResult ? resultLabel(weatherResult) : '—'}
            hint={weatherImpact ? `실제 ${weatherImpact.realValue != null ? ceil1(weatherImpact.realValue) : '—'} / 기대 ${weatherImpact.expectValue != null ? ceil1(weatherImpact.expectValue) : '—'}` : '데이터 없음'}/>
        </div>
      </div>

      {/* 방문 추세 — visits/count API */}
      <div>
        <div className="section-h">
          <h2>방문 추세</h2>
          <span className="sub">· 이동평균 (5 / 10 / 20 / 60일)</span>
          <span className="meta">{visits ? 'API 데이터' : '데이터 없음'}</span>
        </div>
        <div className="card" style={{marginTop:10}}>
          <div className="card-h">
            <h3>매장 방문 추세</h3>
            <span className="sub">· visits/count</span>
            <div className="right"><span className="chip dot">5일선</span><span className="chip">10일선</span><span className="chip">20일선</span></div>
          </div>
          <div className="card-b" style={{padding:'8px 16px 16px'}}>
            <VisitTrendChart visits={visits} height={220}/>
          </div>
        </div>
      </div>

      {/* 인구 통계 */}
      <div>
        <div className="section-h"><h2>인구 통계</h2><span className="sub">· 연령대 · 성별 · 방문 패턴</span></div>
        <div className="grid-2" style={{marginTop:14, gridTemplateColumns:'1.4fr 1fr'}}>
          <div className="card">
            <div className="card-h"><h3>요일 × 시간대 히트맵</h3><span className="sub">· 방문자 밀도 · 샘플</span></div>
            <div className="card-b" style={{padding:'16px 16px 14px'}}>
              <div className="heat-wrap"><Heatmap/></div>
              <div style={{marginTop:12, display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--muted)', flexWrap:'wrap'}}>
                <span>낮음</span>
                <div style={{display:'flex', gap:2}}>
                  {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map(a => (
                    <div key={a} style={{width:14, height:12, borderRadius:3, background:`oklch(0.62 0.14 250 / ${a})`}}/>
                  ))}
                </div>
                <span>높음</span>
              </div>
            </div>
          </div>
          <div className="card" style={{display:'flex', flexDirection:'column'}}>
            <div className="card-h">
              <h3>일별 방문 수</h3>
              <span className="sub">· {visits ? 'API 데이터' : '샘플'}</span>
            </div>
            <div className="card-b" style={{flex:1, padding:0}}>
              <DailyBars visits={visits}/>
            </div>
          </div>
        </div>
        <div className="grid-2" style={{marginTop:14}}>
          <GenderCard/>
          <AgeCard ageData={ageData}/>
        </div>
      </div>

      {/* 체류 시간 */}
      <div>
        <div className="section-h"><h2>체류 시간 분석</h2><span className="sub">· 분포, 시간대, 연령대 · 샘플 데이터</span></div>
        <div className="grid-3" style={{marginTop:10}}>
          <div className="card">
            <div className="card-h"><h3>체류 시간 분포</h3><span className="sub">· 전체 방문자</span></div>
            <div className="card-b">
              <Histogram/>
              <div style={{marginTop:12, padding:'10px 12px', background:'#F7F9FC', borderRadius:10, fontSize:12, color:'var(--muted)'}}>
                <b style={{color:'var(--ink)'}}>10–20분</b> 구간 비중이 가장 높아요 (28%).
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
                  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
                  return (
                    <g>
                      {[0, 12, 24, 36].map(g => (
                        <g key={g}>
                          <line x1={PAD_L} x2={760-PAD_R} y1={y(g)} y2={y(g)} stroke="#ECEEF2" strokeDasharray={g===0?'':'3 4'}/>
                          <text x={PAD_L-4} y={y(g)+3} fontSize="9" textAnchor="end" fill="#9AA3AF" fontFamily="JetBrains Mono">{g}</text>
                        </g>
                      ))}
                      {HOURS.filter((_,i) => i%2===0).map((d,i) => (
                        <text key={d.h} x={x(i*2)} y={102} fontSize="9" textAnchor="middle" fill="#9AA3AF" fontFamily="JetBrains Mono">{d.h}</text>
                      ))}
                      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill="#fff" stroke="var(--accent)" strokeWidth="1.6"/>)}
                    </g>
                  )
                })()}
              </svg>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>연령대별 평균 체류</h3><span className="sub">· AI 추정 · 분</span></div>
            <div className="card-b">
              <div className="age-stay">
                {[{label:'20–29',stay:21},{label:'30–39',stay:26},{label:'40–49',stay:24},{label:'50–59',stay:18},{label:'기타',stay:14}].map(a => (
                  <div className="row" key={a.label}>
                    <div className="l">{a.label}</div>
                    <div className="track"><div className="fill" style={{width:(a.stay/30)*100+'%'}}/></div>
                    <div className="v">{a.stay}분</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14, fontSize:11.5}} className="priv">
                <Ic.Shield color="#9AA3AF"/>연령대는 익명 통계 · 개인 식별 없음
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 요일 패턴 분석 */}
      <div>
        <div className="section-h"><h2>요일 패턴 분석</h2><span className="sub">· 일주일 방문 비교 · weekday-patterns API</span></div>
        <div style={{marginTop:10}}>
          <WeekdayPatternCard weekdayPatterns={weekdayPatterns}/>
        </div>
      </div>

      {/* 방문 예측 */}
      {(tomorrow || nextWeekData.length > 0) && (
        <div>
          <div className="section-h"><h2>방문 예측</h2><span className="sub">· AI 예측 · 신뢰구간 포함</span></div>
          <div className="grid-2" style={{marginTop:10}}>
            {tomorrow && (
              <div className="card">
                <div className="card-h"><h3>내일 방문 예측</h3><span className="sub">· AI 예측</span></div>
                <div className="card-b" style={{display:'flex', flexDirection:'column', gap:10}}>
                  <div style={{fontSize:32, fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>
                    {tomorrow.expectedVisits.toLocaleString()}
                    <span style={{fontSize:14, fontWeight:500, color:'var(--muted)', marginLeft:4}}>명</span>
                  </div>
                  <div className="list-rows">
                    <div className="row"><span className="k" style={{color:'var(--muted)'}}>신뢰구간 최솟값</span><span className="v mono">{tomorrow.minVisits.toLocaleString()}명</span></div>
                    <div className="row"><span className="k" style={{color:'var(--muted)'}}>신뢰구간 최댓값</span><span className="v mono">{tomorrow.maxVisits.toLocaleString()}명</span></div>
                  </div>
                </div>
              </div>
            )}
            {nextWeekData.length > 0 && (
              <div className="card">
                <div className="card-h"><h3>다음 주 방문 예측</h3><span className="sub">· 월~일 · AI 예측</span></div>
                <div className="card-b">
                  {(() => {
                    const DAY_LABELS = ['월','화','수','목','금','토','일']
                    const maxV = Math.max(...nextWeekData.map(d => d.expectedVisits))
                    return (
                      <div style={{display:'flex', alignItems:'flex-end', gap:6, height:120}}>
                        {nextWeekData.map((d, i) => {
                          const h = maxV > 0 ? Math.max(8, (d.expectedVisits / maxV) * 90) : 8
                          const isWeekend = i >= 5
                          return (
                            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3}}>
                              <div style={{fontSize:9.5, color:'var(--muted)', fontFamily:'JetBrains Mono', marginBottom:2}}>
                                {d.expectedVisits}
                              </div>
                              <div style={{
                                width:'100%', height:h,
                                background: isWeekend ? 'oklch(0.68 0.13 295)' : 'var(--accent)',
                                borderRadius:'3px 3px 0 0', opacity:0.85,
                                position:'relative',
                              }}>
                                {/* 신뢰구간 표시 */}
                                <div style={{
                                  position:'absolute', left:'50%', transform:'translateX(-50%)',
                                  width:2, background:'rgba(255,255,255,0.5)',
                                  top:0, bottom:0,
                                }}/>
                              </div>
                              <div style={{fontSize:10.5, color: isWeekend ? 'oklch(0.55 0.13 295)' : 'var(--muted)', fontFamily:'JetBrains Mono'}}>
                                {DAY_LABELS[i]}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  <div style={{marginTop:8, fontSize:11.5, color:'var(--muted)', display:'flex', gap:12}}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:10, height:10, borderRadius:2, background:'var(--accent)', display:'inline-block'}}/>평일
                    </span>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:10, height:10, borderRadius:2, background:'oklch(0.68 0.13 295)', display:'inline-block'}}/>주말
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="priv" style={{padding:'6px 4px 12px', fontSize:12}}>
        <Ic.Shield color="#9AA3AF"/>
        모든 통계는 Vision AI 익명 집계 결과입니다. 얼굴 인식, 개인 식별은 수행하지 않습니다.
      </div>
    </div>
  )
}
