import { Fragment } from 'react'
import { Ic } from '../ui/Icons'
import { WEATHER_CORR } from '../../data/analytics'
import { ceil1 } from '../../utils/format'

export default function WeatherCorrTable() {
  const cell = (v, d) => {
    const cls = d > 0 ? "up" : d < 0 ? "dn" : "flat"
    return (
      <div>
        <div className="mono" style={{fontWeight: 600, fontSize: 13}}>{v}</div>
        <div className={"delta-cell " + cls} style={{fontSize: 11, marginTop: 2}}>
          {d > 0 ? "▲" : d < 0 ? "▼" : "—"} {ceil1(Math.abs(d))}%
        </div>
      </div>
    )
  }

  return (
    <div style={{overflowX: "auto", WebkitOverflowScrolling: "touch"}}>
    <div className="corr-grid" style={{minWidth: 420}}>
      <div className="hh">날씨</div>
      <div className="hh">방문자</div>
      <div className="hh">평균 체류</div>
      <div className="hh">혼잡도</div>
      <div className="hh">전환율</div>
      {WEATHER_CORR.map(w => {
        const Icon = Ic[w.icon] || Ic.Cloud
        const bg = w.icon === "Sun"       ? "oklch(0.95 0.05 80)"
                 : w.icon === "CloudRain" ? "oklch(0.95 0.04 250)"
                 : "oklch(0.96 0.02 250)"
        const fg = w.icon === "Sun"       ? "oklch(0.55 0.14 65)"
                 : w.icon === "CloudRain" ? "oklch(0.48 0.16 250)"
                 : "oklch(0.45 0.04 250)"
        return (
          <Fragment key={w.id}>
            <div className="rh">
              <span className="ic" style={{background: bg, color: fg}}><Icon/></span>
              <div>
                <div>{w.label}</div>
                <div style={{fontSize: 10.5, color: "var(--muted-2)", fontFamily: "JetBrains Mono"}}>{w.days}일</div>
              </div>
            </div>
            {cell(w.v + "명", w.dv)}
            {cell(w.stay + "분", w.ds)}
            {cell(w.cong, w.dc)}
            {cell(ceil1(w.conv) + "%", w.dcv)}
          </Fragment>
        )
      })}
    </div>
    </div>
  )
}
