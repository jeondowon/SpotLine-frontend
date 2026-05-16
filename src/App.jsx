import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import InsightsPage from './pages/InsightsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage/>}/>
        <Route path="/analytics" element={<AnalyticsPage/>}/>
        <Route path="/insights" element={<InsightsPage/>}/>
        <Route path="/reports" element={<ReportsPage/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
