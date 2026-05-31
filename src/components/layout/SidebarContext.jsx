import { createContext, useContext } from 'react'

export const SidebarContext = createContext(null)
export const useSidebarToggle = () => useContext(SidebarContext)
