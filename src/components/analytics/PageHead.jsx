import { Ic } from '../ui/Icons'

const RANGES = [
  { v: "today",  l: "오늘" },
  { v: "7d",     l: "7일" },
  { v: "30d",    l: "30일" },
  { v: "custom", l: "사용자 지정" },
]

export default function PageHead({ range, setRange }) {
  return (
    <div className="content" style={{paddingBottom: 0}}>
      <div className="an-head">
        <div>
          <h1>분석</h1>
          <p>매장 고객 행동에서 어떤 패턴이 발견되는지 깊이 있게 살펴보세요. · Vision AI 익명 집계 데이터</p>
        </div>
        <div className="right">
          <div className="range-pills">
            {RANGES.map(o => (
              <button key={o.v} className={range === o.v ? "on" : ""} onClick={() => setRange(o.v)}>{o.l}</button>
            ))}
          </div>
          <div className="date-pick">
            <Ic.Cal color="#6B7280"/>
            <span className="mono" style={{fontSize: 12}}>2026.04.17 – 05.16</span>
            <Ic.Chevron color="#9AA3AF"/>
          </div>
          <button className="btn-secondary"><Ic.Compare/> 비교</button>
          <button className="btn-secondary"><Ic.Download/> 내보내기</button>
        </div>
      </div>
    </div>
  )
}
