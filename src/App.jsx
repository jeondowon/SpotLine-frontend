import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import RawPage from './pages/RawPage'
import ChatPage from './pages/ChatPage'
import OnboardingPage from './pages/OnboardingPage'
import LiveStreamPage from './pages/LiveStreamPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace/>}/>
        <Route path="/onboarding" element={<OnboardingPage/>}/>
        <Route path="/live" element={<LiveStreamPage/>}/>
        <Route path="/dashboard" element={<DashboardPage/>}/>
        <Route path="/analytics" element={<AnalyticsPage/>}/>
        <Route path="/reports" element={<ReportsPage/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/raw" element={<RawPage/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
        <Route path="*" element={<Navigate to="/live" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
