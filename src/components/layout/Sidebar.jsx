import { Link, useLocation } from 'react-router-dom'
import { Ic } from '../ui/Icons'

const NAV_ITEMS = [
  { id: "dashboard", label: "대시보드",    ic: <Ic.Dash/>,   to: "/" },
  { id: "analytics", label: "분석",        ic: <Ic.Chart/>,  to: "/analytics" },
  { id: "ai",        label: "AI 인사이트", ic: <Ic.Spark/>,  to: "/insights", badge: "NEW" },
  { id: "settings",  label: "설정",        ic: <Ic.Gear/>,   to: "/settings" },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  const isActive = id => {
    if (id === "dashboard") return pathname === "/"
    if (id === "analytics") return pathname === "/analytics"
    if (id === "ai")        return pathname === "/insights"
    if (id === "settings")  return pathname === "/settings"
    return false
  }

  return (
    <aside className="sb">
      <Link to="/" className="sb-brand" style={{textDecoration:"none", color:"inherit"}}>
        <div className="sb-mark" aria-hidden="true"></div>
        <div>
          <div className="sb-name">Spotline</div>
          <div className="sb-sub">매장 인사이트</div>
        </div>
      </Link>

      <div>
        <div className="sb-section-label">메뉴</div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.id)
            const inner = (
              <>
                {item.ic}
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </>
            )
            if (item.to) {
              return (
                <Link key={item.id} to={item.to}
                      className={"sb-item" + (active ? " active" : "")}
                      style={{textDecoration: "none"}}>
                  {inner}
                </Link>
              )
            }
            return (
              <div key={item.id} className={"sb-item" + (active ? " active" : "")}>
                {inner}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="sb-store">
        <div className="ava">박</div>
        <div style={{flex:1, minWidth: 0}}>
          <div className="nm">박지원 점주</div>
          <div className="pl">Pro · 단일 매장</div>
        </div>
        <Ic.Chevron color="#9AA3AF"/>
      </div>
    </aside>
  )
}
