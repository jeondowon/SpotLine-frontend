import { Ic } from '../ui/Icons'
import Donut from './charts/Donut'
import { GENDER } from '../../data/analytics'

export default function GenderCard() {
  const slices = [
    { label: "여성", pct: GENDER.f, count: GENDER.fCount, color: "oklch(0.7 0.13 0)" },
    { label: "남성", pct: GENDER.m, count: GENDER.mCount, color: "oklch(0.62 0.13 250)" },
  ]
  return (
    <div className="card">
      <div className="card-h">
        <h3>성별 추정 분포</h3>
        <span className="sub">· AI 추정 · 익명</span>
      </div>
      <div className="card-b">
        <div className="donut-wrap">
          <Donut slices={slices} label="전체"/>
          <div className="donut-legend">
            {slices.map(s => (
              <div className="row" key={s.label}>
                <span className="sw" style={{background: s.color}}/>
                <span>{s.label}</span>
                <span className="v mono">{s.pct}%</span>
                <span className="sub mono">{s.count.toLocaleString()}명</span>
              </div>
            ))}
            <div className="priv" style={{marginTop: 6}}>
              <Ic.Shield color="#9AA3AF"/>외관 기반 추정 · 얼굴 식별 없음
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
