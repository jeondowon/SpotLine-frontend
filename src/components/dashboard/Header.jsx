import { Ic } from '../ui/Icons'

export default function Header({ storeName, tab, onTab }) {
  return (
    <header className="hdr">
      <div>
        <div className="hdr-title">{storeName}</div>
        <div className="hdr-sub">2026년 5월 16일 토요일 · 영업 중 · 마지막 동기화 14초 전</div>
      </div>
      <div className="hdr-right">
        <div className="ai-status" title="Vision AI 처리 정상">
          <span className="d"/>
          AI 처리 정상
          <span style={{color:'#6B7280', fontWeight: 500, marginLeft: 4}}>· 2 카메라</span>
        </div>
        <div className="seg-tabs">
          {["오늘","어제","이번주"].map((x, i) => (
            <button key={i} className={tab === i ? "on" : ""} onClick={() => onTab(i)}>{x}</button>
          ))}
        </div>
        <div className="date-pick">
          <Ic.Cal color="#6B7280"/>
          <span className="mono" style={{fontSize: 12}}>2026.05.16</span>
          <span className="seg">· 09:00–22:00</span>
          <Ic.Chevron color="#9AA3AF"/>
        </div>
        <button className="icon-btn" aria-label="알림"><Ic.Bell/></button>
        <button className="icon-btn" aria-label="검색"><Ic.Search/></button>
        <div className="avatar">박</div>
      </div>
    </header>
  )
}
