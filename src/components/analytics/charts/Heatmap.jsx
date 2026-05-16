import { Fragment } from 'react'

export default function Heatmap() {
  const days = ["월","화","수","목","금","토","일"]
  const hours = Array.from({ length: 13 }, (_, i) => i + 9)

  const cell = (d, h) => {
    let v = 20
    if (h >= 12 && h <= 13) v += 50
    if (h >= 18 && h <= 20) v += 60
    if (d >= 5 && h >= 14) v += 30
    if (d <= 4 && h >= 14 && h <= 16) v -= 10
    return Math.max(5, Math.min(100, v + Math.sin(d * 1.7 + h * 0.6) * 12))
  }

  return (
    <div className="heat" style={{gridTemplateColumns: `36px repeat(${hours.length}, 1fr)`}}>
      <div className="hd"></div>
      {hours.map(h => <div className="hd" key={h}>{h}</div>)}
      {days.map((dn, d) => (
        <Fragment key={d}>
          <div className="rh">{dn}</div>
          {hours.map(h => {
            const v = cell(d, h)
            const a = v / 100
            return (
              <div key={h} className="cell" title={`${dn} ${h}시 · ${Math.round(v)}`}
                   style={{background: `oklch(0.62 0.14 250 / ${a})`}}/>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
