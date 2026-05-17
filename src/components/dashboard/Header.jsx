import { Ic } from '../ui/Icons'

export default function Header({ storeName }) {
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
        <button className="icon-btn" aria-label="알림"><Ic.Bell/></button>
        <div className="avatar">박</div>
      </div>
    </header>
  )
}
