import { AGE_GROUPS } from '../../data/analytics'

export default function AgeCard({ title = "연령대 추정 분포" }) {
  return (
    <div className="card">
      <div className="card-h">
        <h3>{title}</h3>
        <span className="sub">· AI 추정 · 익명</span>
      </div>
      <div className="card-b">
        <div className="ages">
          {AGE_GROUPS.map(a => (
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
