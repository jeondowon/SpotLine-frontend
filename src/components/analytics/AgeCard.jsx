import { AGE_GROUPS } from '../../data/analytics'

function parseAgeGroups(raw) {
  if (!raw) return AGE_GROUPS
  return [
    { label: '10대 이하', pct: (raw.age00s ?? 0) + (raw.age10s ?? 0) },
    { label: '20–29',    pct: raw.age20s ?? 0 },
    { label: '30–39',    pct: raw.age30s ?? 0 },
    { label: '40–49',    pct: raw.age40s ?? 0 },
    { label: '50대+',    pct: raw.age50s ?? 0 },
  ]
}

export default function AgeCard({ title = "연령대 추정 분포", ageData }) {
  const groups = parseAgeGroups(ageData)
  return (
    <div className="card">
      <div className="card-h">
        <h3>{title}</h3>
        <span className="sub">· AI 추정 · 익명</span>
        {ageData && <div className="right"><span className="chip dot">실시간</span></div>}
      </div>
      <div className="card-b">
        <div className="ages">
          {groups.map(a => (
            <div className="age-row" key={a.label}>
              <div className="l mono">{a.label}</div>
              <div className="track"><div className="fill" style={{width: a.pct + "%"}}/></div>
              <div className="v mono">{a.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
