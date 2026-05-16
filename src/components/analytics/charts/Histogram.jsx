import { STAY_DIST } from '../../../data/analytics'

export default function Histogram() {
  const max = Math.max(...STAY_DIST.map(s => s.pct))
  const peakI = STAY_DIST.findIndex(s => s.pct === max)
  return (
    <div className="histo">
      {STAY_DIST.map((s, i) => (
        <div className={"col" + (i === peakI ? " peak" : "")} key={s.range}>
          <div className="mono" style={{fontSize: 10.5, color: "#6B7280", fontWeight: 600}}>{s.pct}%</div>
          <div className="b" style={{height: (s.pct / max) * 100 + "px"}}/>
          <div className="l">{s.range}</div>
        </div>
      ))}
    </div>
  )
}
