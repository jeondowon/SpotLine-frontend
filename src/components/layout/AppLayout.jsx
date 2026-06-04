import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { SidebarContext } from "./SidebarContext";

export default function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = () => setMenuOpen((v) => !v);
  const close = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <SidebarContext.Provider value={toggle}>
      <div className="app">
        {menuOpen && <div className="sb-overlay" onClick={close} />}
        <Sidebar isOpen={menuOpen} onClose={close} />
        <div className="main">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
