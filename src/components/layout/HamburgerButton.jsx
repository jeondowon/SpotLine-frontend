import { useSidebarToggle } from './SidebarContext'
import { Ic } from '../ui/Icons'

export default function HamburgerButton() {
  const toggle = useSidebarToggle()
  return (
    <button className="hdr-menu-btn" onClick={toggle} aria-label="메뉴">
      <Ic.Menu />
    </button>
  )
}
