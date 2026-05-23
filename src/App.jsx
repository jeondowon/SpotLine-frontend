import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IntroPage from './pages/IntroPage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import RawPage from './pages/RawPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/intro" replace/>}/>
        <Route path="/intro" element={<IntroPage/>}/>
        <Route path="/dashboard" element={<DashboardPage/>}/>
        <Route path="/analytics" element={<AnalyticsPage/>}/>
        <Route path="/reports" element={<ReportsPage/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/raw" element={<RawPage/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
        <Route path="*" element={<Navigate to="/intro" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
