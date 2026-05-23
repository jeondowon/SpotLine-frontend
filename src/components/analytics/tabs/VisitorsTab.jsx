import KPI from '../../ui/KPI'
import { Ic } from '../../ui/Icons'
import VisitTrendChart from '../charts/VisitTrendChart'
import DailyBars from '../charts/DailyBars'
import Heatmap from '../charts/Heatmap'
import GenderCard from '../GenderCard'
import AgeCard from '../AgeCard'
function formatAge(a) {
  const m = { '00s':'유아', '10s':'10대', '20s':'20대', '30s':'30대', '40s':'40대', '50s':'50대', 'UNKNOWN':'연령미상' }
  return m[a] ?? a ?? '연령미상'
}
function formatGender(g) {
  if (g === 'MAN') return '남성'
  if (g === 'WOMAN') return '여성'
  return '성별미상'
}

export default function VisitorsTab({ data = {}, day }) {
  const { coreCustomer, ageGroups: ageData, visits } = data
  const coreAge    = coreCustomer ? formatAge(coreCustomer.age) : '—'
  const coreGender = coreCustomer ? formatGender(coreCustomer.gender) : ''

  // 선택 날짜 기준 이동평균 추출 (visits/count API)
  const dayIdx = day && visits?.date ? visits.date.lastIndexOf(day) : -1
  const getMA  = (lineIdx) => dayIdx >= 0 && visits?.data?.[lineIdx]?.[dayIdx] != null
    ? Math.round(visits.data[lineIdx][dayIdx]) : null
  const ma5  = getMA(0)
  const ma20 = getMA(2)
  const ma60 = getMA(3)
  const spark5  = visits?.data?.[0]?.slice(-14) ?? null
  const spark60 = visits?.data?.[3]?.slice(-14) ?? null

  return (
    <div className="tab-pane" style={{display:"flex", flexDirection:"column", gap: 20}}>
      <div>
        <div className="section-h">
          <h2>방문자 요약</h2>
          <span className="sub">· {day}</span>
          <span className="meta">{visits ? 'visits/count API' : '데이터 없음'}</span>
        </div>
        <div className="kpis" style={{marginTop: 10}}>
          <KPI label="핵심 고객" icon={<Ic.Users/>} iconBg="oklch(0.95 0.04 295)" iconFg="oklch(0.50 0.16 295)"
               value={coreAge} hint={coreGender ? `${coreGender} · AI 분석` : 'AI 분석'}/>
          <KPI label="5일 이동평균" icon={<Ic.Activity/>} iconBg="oklch(0.95 0.05 80)" iconFg="oklch(0.55 0.14 65)"
               value={ma5 ?? '—'} unit={ma5 != null ? '명' : ''}
               hint={day ?? ''} spark={spark5} sparkColor="oklch(0.65 0.14 65)"/>
          <KPI label="20일 이동평균" icon={<Ic.Clock/>} iconBg="oklch(0.95 0.04 155)" iconFg="oklch(0.42 0.12 155)"
               value={ma20 ?? '—'} unit={ma20 != null ? '명' : ''}
               hint={day ?? ''}/>
          <KPI label="60일 이동평균" icon={<Ic.Users/>} iconBg="oklch(0.95 0.03 250)" iconFg="oklch(0.48 0.16 250)"
               value={ma60 ?? '—'} unit={ma60 != null ? '명' : ''}
               hint={day ?? ''} spark={spark60} sparkColor="oklch(0.62 0.14 250)"/>
        </div>
      </div>

      {/* 방문 추세 — visits/count API */}
      <div className="card">
        <div className="card-h">
          <h3>매장 방문 추세</h3>
          <span className="sub">· 이동평균 (5 / 10 / 20 / 60일)</span>
          <div className="right">
            <span className="chip dot">{visits ? 'API 데이터' : '데이터 없음'}</span>
          </div>
        </div>
        <div className="card-b" style={{padding: "8px 16px 16px"}}>
          <VisitTrendChart visits={visits} height={220}/>
        </div>
      </div>

      <div className="grid-2" style={{gridTemplateColumns: "1.4fr 1fr"}}>
        <div className="card">
          <div className="card-h"><h3>요일 × 시간대 히트맵</h3><span className="sub">· 방문자 밀도 · 샘플</span></div>
          <div className="card-b" style={{padding: "16px 16px 14px"}}>
            <div className="heat-wrap"><Heatmap/></div>
            <div style={{marginTop: 12, display:"flex", alignItems:"center", gap: 8, fontSize: 11, color:"var(--muted)", flexWrap:"wrap"}}>
              <span>낮음</span>
              <div style={{display:"flex", gap: 2}}>
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map(a => (
                  <div key={a} style={{width: 14, height: 12, borderRadius: 3, background: `oklch(0.62 0.14 250 / ${a})`}}/>
                ))}
              </div>
              <span>높음</span>
            </div>
          </div>
        </div>
        <div className="card" style={{display:"flex", flexDirection:"column"}}>
          <div className="card-h">
            <h3>일별 방문 수</h3>
            <span className="sub">· {visits ? 'API 데이터' : '샘플'}</span>
          </div>
          <div className="card-b" style={{flex:1, padding:0}}>
            <DailyBars visits={visits}/>
          </div>
        </div>
      </div>

      <div className="grid-2"><GenderCard/><AgeCard ageData={ageData}/></div>
    </div>
  )
}
