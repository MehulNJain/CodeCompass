import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { RedirectIfSignedIn, RequireAuth } from '@/routes/guards'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<RedirectIfSignedIn />}>
        <Route path="/login" element={<LoginPage mode="signin" />} />
        <Route path="/signup" element={<LoginPage mode="signup" />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
