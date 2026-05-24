import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import { ceil1 } from '../../../utils/format'

function resultLabel(r) { return r === 'GOOD' ? '좋음' : r === 'BAD' ? '나쁨' : '보통' }
function resultBg(r) {
  return r === 'GOOD' ? 'oklch(0.95 0.04 155)' : r === 'BAD' ? 'oklch(0.95 0.04 25)' : 'oklch(0.95 0.05 80)'
}
function resultFg(r) {
  return r === 'GOOD' ? 'oklch(0.42 0.12 155)' : r === 'BAD' ? 'oklch(0.55 0.16 25)' : 'oklch(0.55 0.14 65)'
}
function resultDesc(r) {
  if (r === 'GOOD') return '날씨 영향을 제거했을 때도 기대치를 웃도는 성과예요.'
  if (r === 'BAD') return '날씨 영향을 제거해도 기대치에 미달하는 성과예요.'
  return '날씨 영향을 제거하면 기대치에 부합하는 수준이에요.'
}

function ValueBar({ label, value, max, color, pct }) {
  const w = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:12}}>
        <span style={{color:'var(--muted)'}}>{label}</span>
        <span style={{fontWeight:600, fontFamily:'JetBrains Mono, monospace'}}>{value != null ? ceil1(value) : undefined}</span>
      </div>
      <div style={{height:8, background:'#F1F3F6', borderRadius:99, overflow:'hidden'}}>
        <div style={{height:'100%', width:w+'%', background:color, borderRadius:99, transition:'width .4s'}}/>
      </div>
      {pct != null && (
        <div style={{fontSize:11, color:'var(--muted)', textAlign:'right'}}>
          기대 대비 <span style={{fontWeight:600, color: pct >= 0 ? 'oklch(0.42 0.12 155)' : 'oklch(0.55 0.16 25)'}}>
            {pct >= 0 ? '+' : ''}{ceil1(pct)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default function WeatherTab({ data = {}, day }) {
  const { weatherImpact, weekdayPatterns } = data
  const jsDay = day ? new Date(day).getDay() : -1
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1
  const weekdayPattern = weekdayPatterns?.[dayIndex] ?? null

  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>

      {/* KPI 요약 */}
      <div>
        <div className="section-h"><h2>날씨 영향 요약</h2><span className="sub">· 당일 · API 데이터</span></div>
        <div className="kpis" style={{marginTop: 10}}>
          {weatherImpact ? (
            <>
              <KPI label="날씨 대비 실제 성과"
                icon={<Ic.Sun/>}
                iconBg={resultBg(weatherImpact.result)}
                iconFg={resultFg(weatherImpact.result)}
                value={resultLabel(weatherImpact.result)}
                hint={`실제 ${weatherImpact.realValue != null ? ceil1(weatherImpact.realValue) : '—'} / 기대 ${weatherImpact.expectValue != null ? ceil1(weatherImpact.expectValue) : '—'}`}/>
              <KPI label="실제값"
                icon={<Ic.Activity/>}
                iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
                value={weatherImpact.realValue != null ? ceil1(weatherImpact.realValue) : '—'}
                hint="날씨 영향 반영"/>
              <KPI label="보정값"
                icon={<Ic.Trend/>}
                iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
                value={weatherImpact.adjustedValue != null ? ceil1(weatherImpact.adjustedValue) : '—'}
                hint="날씨 영향 제거 후"/>
            </>
          ) : (
            <KPI label="날씨 대비 실제 성과" icon={<Ic.Sun/>}
              iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
              value="—" hint="데이터 없음"/>
          )}
          {weekdayPattern ? (
            <KPI label="요일 패턴 분석"
              icon={<Ic.Clock/>}
              iconBg={resultBg(weekdayPattern.result)}
              iconFg={resultFg(weekdayPattern.result)}
              value={resultLabel(weekdayPattern.result)}
              hint={`실제 ${weekdayPattern.realValue != null ? ceil1(weekdayPattern.realValue) : '—'} / 기대 ${weekdayPattern.expectValue != null ? ceil1(weekdayPattern.expectValue) : '—'}`}/>
          ) : (
            <KPI label="요일 패턴 분석" icon={<Ic.Clock/>}
              iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
              value="—" hint="데이터 없음 (8주+ 필요)"/>
          )}
        </div>
      </div>

      {/* 날씨 영향 상세 — weather-impact API */}
      <div>
        <div className="section-h"><h2>날씨 영향 보정 상세</h2><span className="sub">· weather-impact API</span></div>
        <div className="grid-2" style={{marginTop:10}}>
          <div className="card">
            <div className="card-h">
              <h3>실제값 / 기대값 / 보정값 비교</h3>
              {weatherImpact && (
                <div className="right">
                  <span style={{
                    padding:'3px 8px', borderRadius:999, fontSize:11.5, fontWeight:600,
                    background: resultBg(weatherImpact.result),
                    color: resultFg(weatherImpact.result),
                  }}>{resultLabel(weatherImpact.result)}</span>
                </div>
              )}
            </div>
            <div className="card-b" style={{display:'flex', flexDirection:'column', gap:14}}>
              {weatherImpact ? (
                <>
                  {(() => {
                    const maxV = Math.max(weatherImpact.realValue ?? 0, weatherImpact.expectValue ?? 0, weatherImpact.adjustedValue ?? 0)
                    const realPct = weatherImpact.expectValue > 0
                      ? ((weatherImpact.realValue - weatherImpact.expectValue) / weatherImpact.expectValue) * 100
                      : null
                    return (
                      <>
                        <ValueBar label="실제값 (Real)" value={weatherImpact.realValue} max={maxV} color="var(--accent)" pct={realPct}/>
                        <ValueBar label="기대값 (Expected)" value={weatherImpact.expectValue} max={maxV} color="#C9D0DA"/>
                        <ValueBar label="보정값 (Adjusted)" value={weatherImpact.adjustedValue} max={maxV} color="oklch(0.65 0.14 155)"/>
                      </>
                    )
                  })()}
                  <div style={{
                    padding:'10px 12px', borderRadius:10, fontSize:12.5, lineHeight:1.55,
                    background: weatherImpact.result === 'GOOD' ? 'var(--good-soft)' : weatherImpact.result === 'BAD' ? '#FEF2F2' : 'var(--accent-soft)',
                    color: resultFg(weatherImpact.result),
                  }}>
                    {resultDesc(weatherImpact.result)}
                  </div>
                </>
              ) : (
                <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
                  날씨 보정 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* weather-impact SVG 막대 차트 */}
          <div className="card">
            <div className="card-h"><h3>수치 비교 차트</h3><span className="sub">· 값 시각화</span></div>
            <div className="card-b">
              {weatherImpact ? (
                (() => {
                  const bars = [
                    { label: '실제값', value: weatherImpact.realValue ?? 0, color: 'var(--accent)' },
                    { label: '기대값', value: weatherImpact.expectValue ?? 0, color: '#C9D0DA' },
                    { label: '보정값', value: weatherImpact.adjustedValue ?? 0, color: 'oklch(0.65 0.14 155)' },
                  ]
                  const maxV = Math.max(...bars.map(b => b.value)) || 1
                  return (
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      <div style={{display:'flex', alignItems:'flex-end', gap:12, height:140}}>
                        {bars.map((b, i) => {
                          const h = Math.max(6, (b.value / maxV) * 120)
                          return (
                            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                              <div style={{fontSize:11, fontFamily:'JetBrains Mono', color:'var(--muted)', marginBottom:2}}>
                                {b.value != null ? ceil1(b.value) : undefined}
                              </div>
                              <div style={{width:'100%', height:h, background:b.color, borderRadius:'4px 4px 0 0'}}/>
                              <div style={{fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.3}}>{b.label}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{borderTop:'1px solid var(--line)', paddingTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:12}}>
                        <div><span style={{color:'var(--muted)'}}>실제 vs 기대</span></div>
                        <div style={{textAlign:'right', fontWeight:600, fontFamily:'JetBrains Mono'}}>
                          {weatherImpact.expectValue > 0
                            ? ceil1(((weatherImpact.realValue - weatherImpact.expectValue) / weatherImpact.expectValue) * 100) + '%'
                            : '—'}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
                  데이터 없음
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 요일 패턴 분석 — weekday-patterns API */}
      <div>
        <div className="section-h"><h2>요일 패턴 분석</h2><span className="sub">· weekday-patterns API · 이상 탐지</span></div>
        <div className="grid-2" style={{marginTop:10}}>
          <div className="card">
            <div className="card-h">
              <h3>실제값 vs 기대값 비교</h3>
              {weekdayPattern && (
                <div className="right">
                  <span style={{
                    padding:'3px 8px', borderRadius:999, fontSize:11.5, fontWeight:600,
                    background: resultBg(weekdayPattern.result),
                    color: resultFg(weekdayPattern.result),
                  }}>{resultLabel(weekdayPattern.result)}</span>
                </div>
              )}
            </div>
            <div className="card-b" style={{display:'flex', flexDirection:'column', gap:14}}>
              {weekdayPattern ? (
                <>
                  {(() => {
                    const maxV = Math.max(weekdayPattern.realValue ?? 0, weekdayPattern.expectValue ?? 0)
                    const diff = weekdayPattern.expectValue > 0
                      ? ((weekdayPattern.realValue - weekdayPattern.expectValue) / weekdayPattern.expectValue) * 100
                      : null
                    return (
                      <>
                        <ValueBar label="실제값 (Real)" value={weekdayPattern.realValue} max={maxV} color="var(--accent)" pct={diff}/>
                        <ValueBar label="기대값 (Expected)" value={weekdayPattern.expectValue} max={maxV} color="#C9D0DA"/>
                      </>
                    )
                  })()}
                  <div style={{
                    padding:'10px 12px', borderRadius:10, fontSize:12.5, lineHeight:1.55,
                    background: weekdayPattern.result === 'GOOD' ? 'var(--good-soft)' : weekdayPattern.result === 'BAD' ? '#FEF2F2' : 'var(--accent-soft)',
                    color: resultFg(weekdayPattern.result),
                  }}>
                    {weekdayPattern.result === 'GOOD' && '이 요일 평균 대비 좋은 성과예요.'}
                    {weekdayPattern.result === 'NORMAL' && '이 요일 평균 범위 안의 정상 수준이에요.'}
                    {weekdayPattern.result === 'BAD' && '이 요일 평균 대비 낮은 성과예요. 원인을 살펴보세요.'}
                  </div>
                </>
              ) : (
                <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13, lineHeight:1.6}}>
                  요일 패턴 데이터가 없습니다.<br/>
                  <span style={{fontSize:11.5}}>최소 8주 이상의 과거 데이터가 필요합니다.</span>
                </div>
              )}
            </div>
          </div>

          {/* weekday-patterns 시각화 */}
          <div className="card">
            <div className="card-h"><h3>요일 패턴 차트</h3><span className="sub">· 실제 vs 기대</span></div>
            <div className="card-b">
              {weekdayPattern ? (
                (() => {
                  const bars = [
                    { label: '실제값', value: weekdayPattern.realValue ?? 0, color: 'var(--accent)' },
                    { label: '기대값', value: weekdayPattern.expectValue ?? 0, color: '#C9D0DA' },
                  ]
                  const maxV = Math.max(...bars.map(b => b.value)) || 1
                  return (
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      <div style={{display:'flex', alignItems:'flex-end', gap:20, height:140, padding:'0 20px'}}>
                        {bars.map((b, i) => {
                          const h = Math.max(6, (b.value / maxV) * 120)
                          return (
                            <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                              <div style={{fontSize:12, fontFamily:'JetBrains Mono', color:'var(--muted)', marginBottom:2}}>
                                {b.value != null ? ceil1(b.value) : undefined}
                              </div>
                              <div style={{width:'100%', height:h, background:b.color, borderRadius:'4px 4px 0 0'}}/>
                              <div style={{fontSize:11.5, color:'var(--muted)', textAlign:'center'}}>{b.label}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{borderTop:'1px solid var(--line)', paddingTop:10, fontSize:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
                        <div><span style={{color:'var(--muted)'}}>차이</span></div>
                        <div style={{textAlign:'right', fontWeight:700, fontFamily:'JetBrains Mono',
                          color: (weekdayPattern.realValue ?? 0) >= (weekdayPattern.expectValue ?? 0)
                            ? 'oklch(0.42 0.12 155)' : 'oklch(0.55 0.16 25)'
                        }}>
                          {ceil1((weekdayPattern.realValue ?? 0) - (weekdayPattern.expectValue ?? 0))}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div style={{padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
                  데이터 없음
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
