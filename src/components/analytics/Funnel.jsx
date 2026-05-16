import { Fragment } from 'react'
import { Ic } from '../ui/Icons'
import { FUNNEL } from '../../data/analytics'

export default function Funnel() {
  const base = FUNNEL[0].count
  const colors = ["var(--accent)", "oklch(0.55 0.16 265)", "oklch(0.50 0.16 295)", "oklch(0.7 0.07 25)"]
  return (
    <div className="funnel">
      {FUNNEL.map((s, i) => {
        const pct = (s.count / base) * 100
        return (
          <Fragment key={s.label}>
            <div className="funnel-step">
              <div className="ic" style={{
                background: i === 3 ? "var(--bad-soft)" : "var(--accent-soft)",
                color: i === 3 ? "oklch(0.45 0.16 25)" : "var(--accent-ink)",
              }}>
                {i === 0 ? <Ic.Door/> : i === 1 ? <Ic.Clock/> : i === 2 ? <Ic.Cart/> : <Ic.Trend style={{transform: "scaleX(-1)"}}/>}
              </div>
              <div>
                <div className="label">{s.label}</div>
                <div className="sub">{s.sub}</div>
              </div>
              <div className="num">
                <div className="v">{s.count.toLocaleString()}</div>
                <div className="p">{pct.toFixed(1)}% · 입구 대비</div>
              </div>
              <div className="funnel-bar">
                <div style={{
                  width: pct + "%",
                  background: s.neg
                    ? "linear-gradient(90deg, oklch(0.7 0.13 25), oklch(0.62 0.18 25))"
                    : `linear-gradient(90deg, ${colors[i]}, var(--accent))`,
                }}>
                  {pct >= 18 && <span>{pct.toFixed(0)}%</span>}
                </div>
              </div>
            </div>
            {i < FUNNEL.length - 1 && (
              <div className="funnel-connector">
                <span className="line"/>
                {(() => {
                  const drop = ((FUNNEL[i].count - FUNNEL[i + 1].count) / FUNNEL[i].count) * 100
                  if (FUNNEL[i + 1].neg) {
                    const lost = FUNNEL[1].count - FUNNEL[2].count
                    return <span className="drop">이탈 {lost.toLocaleString()}명 ({((lost / FUNNEL[1].count) * 100).toFixed(1)}%)</span>
                  }
                  return (
                    <>
                      <span className="keep">유지 {(100 - drop).toFixed(1)}%</span>
                      <span style={{color: "var(--muted-2)"}}>· 단계 이탈 {drop.toFixed(1)}%</span>
                    </>
                  )
                })()}
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
