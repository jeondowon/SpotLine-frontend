const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function resultBg(r) {
  return r === 'GOOD' ? 'oklch(0.95 0.04 155)' : r === 'BAD' ? 'oklch(0.95 0.04 25)' : 'oklch(0.95 0.05 80)'
}
function resultFg(r) {
  return r === 'GOOD' ? 'oklch(0.42 0.12 155)' : r === 'BAD' ? 'oklch(0.55 0.16 25)' : 'oklch(0.55 0.14 65)'
}
function resultLabel(r) { return r === 'GOOD' ? '좋음' : r === 'BAD' ? '나쁨' : '보통' }

export default function WeekdayPatternCard({ weekdayPatterns }) {
  const allVals = (weekdayPatterns ?? []).flatMap(d => d ? [d.realValue ?? 0, d.expectValue ?? 0] : [])
  const maxVal = allVals.length ? Math.max(...allVals) : 1

  const hasData = weekdayPatterns?.some(Boolean)

  return (
    <div className="card">
      <div className="card-h">
        <h3>요일별 방문 패턴</h3>
        <span className="sub">· weekday-patterns API · 이상 탐지</span>
        <div className="right" style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)'}}>
            <span style={{width:10,height:10,borderRadius:2,background:'var(--accent)',display:'inline-block'}}/>실제값
          </span>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)'}}>
            <span style={{width:10,height:10,borderRadius:2,background:'#C9D0DA',display:'inline-block'}}/>기대값
          </span>
        </div>
      </div>
      <div className="card-b">
        {hasData ? (
          <>
            <div style={{display:'flex', gap:10, alignItems:'flex-end', height:150, padding:'0 4px'}}>
              {DAY_LABELS.map((label, i) => {
                const d = weekdayPatterns[i]
                const realH = d ? Math.max(6, ((d.realValue ?? 0) / maxVal) * 120) : 0
                const expH  = d ? Math.max(6, ((d.expectValue ?? 0) / maxVal) * 120) : 0
                const isWeekend = i >= 5
                return (
                  <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3}}>
                    {d ? (
                      <div style={{
                        width:8, height:8, borderRadius:'50%', marginBottom:4,
                        background: resultFg(d.result),
                      }}/>
                    ) : <div style={{height:12}}/>}
                    <div style={{display:'flex', gap:2, alignItems:'flex-end', width:'100%'}}>
                      <div style={{
                        flex:1, height:realH,
                        background: isWeekend ? 'oklch(0.68 0.13 295)' : 'var(--accent)',
                        borderRadius:'3px 3px 0 0', opacity:d ? 0.85 : 0.2,
                      }}/>
                      <div style={{
                        flex:1, height:expH,
                        background:'#C9D0DA',
                        borderRadius:'3px 3px 0 0', opacity:d ? 1 : 0.2,
                      }}/>
                    </div>
                    <div style={{
                      fontSize:11, fontFamily:'JetBrains Mono', marginTop:2,
                      color: isWeekend ? 'oklch(0.55 0.13 295)' : 'var(--muted)',
                    }}>{label}</div>
                  </div>
                )
              })}
            </div>

            <div style={{marginTop:12, borderTop:'1px solid var(--line)', paddingTop:10,
              display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, textAlign:'center'}}>
              {weekdayPatterns.map((d, i) => (
                <div key={i}>
                  {d ? (
                    <span style={{
                      display:'inline-block',
                      padding:'2px 6px', borderRadius:6, fontSize:10.5, fontWeight:600,
                      background: resultBg(d.result), color: resultFg(d.result),
                    }}>
                      {resultLabel(d.result)}
                    </span>
                  ) : (
                    <span style={{fontSize:11, color:'var(--muted)'}}>—</span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{height:150, display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--muted)', fontSize:13, flexDirection:'column', gap:6}}>
            <span>요일 패턴 데이터 없음</span>
            <span style={{fontSize:11.5}}>최소 8주 이상의 과거 데이터가 필요합니다.</span>
          </div>
        )}
      </div>
    </div>
  )
}
