import { Route, Routes } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import RepositoryLayout from '@/pages/repository/RepositoryLayout'
import StartHereTab from '@/pages/repository/StartHereTab'
import GraphTab from '@/pages/repository/GraphTab'
import ComingSoonTab from '@/pages/repository/ComingSoonTab'
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
        <Route path="/repositories/:id" element={<RepositoryLayout />}>
          <Route index element={<StartHereTab />} />
          <Route path="graph" element={<GraphTab />} />
          <Route path="tours" element={<ComingSoonTab feature="tours" />} />
          <Route path="ask" element={<ComingSoonTab feature="ask" />} />
        </Route>
      </Route>
    </Routes>
  )
}
