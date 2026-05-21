import { Link, useLocation } from 'react-router-dom'
import { Ic } from '../ui/Icons'

const NAV_ITEMS = [
  { id: "intro",     label: "소개",     ic: <Ic.Spark/>, to: "/intro",      badge: "DEMO" },
  { id: "dashboard", label: "대시보드", ic: <Ic.Dash/>,  to: "/dashboard" },
]

const BOTTOM_ITEMS = [
  { id: "settings", label: "설정", ic: <Ic.Gear/>, to: "/settings" },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  const isActive = id => {
    if (id === "intro")     return pathname === "/"
    if (id === "dashboard") return pathname === "/dashboard"
    if (id === "analytics") return pathname === "/analytics"
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
            return (
              <Link key={item.id} to={item.to}
                    className={"sb-item" + (active ? " active" : "")}
                    style={{textDecoration: "none"}}>
                {inner}
              </Link>
            )
          })}
        </nav>
      </div>

      <nav className="sb-nav" style={{ marginTop: 'auto' }}>
        {BOTTOM_ITEMS.map(item => (
          <Link key={item.id} to={item.to}
                className={"sb-item" + (isActive(item.id) ? " active" : "")}
                style={{textDecoration: "none"}}>
            {item.ic}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

    </aside>
  )
}
