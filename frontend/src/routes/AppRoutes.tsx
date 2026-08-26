import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage mode="signin" />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}
