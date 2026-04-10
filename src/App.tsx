import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { Shell } from './components/layout/Shell'
import { DashboardPage } from './pages/DashboardPage'
import { SitesPage } from './pages/SitesPage'
import { SiteDetailPage } from './pages/SiteDetailPage'
import { PlanningPage } from './pages/PlanningPage'
import { PhotosPage } from './pages/PhotosPage'
import { CartePage } from './pages/CartePage'
import { RapportsPage } from './pages/RapportsPage'
import { ImportPage } from './pages/ImportPage'
import { SettingsPage } from './pages/SettingsPage'
import { NouveauSitePage } from './pages/NouveauSitePage'
import { FraisTrajetPage } from './pages/FraisTrajetPage'
import { LoginPage } from './pages/LoginPage'

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser)
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export default function App() {
  const { initSeed, darkMode } = useStore()

  useEffect(() => {
    initSeed()
  }, [initSeed])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoutes>
              <Shell />
            </ProtectedRoutes>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/sites/nouveau" element={<NouveauSitePage />} />
          <Route path="/sites/:id" element={<SiteDetailPage />} />
          <Route path="/carte" element={<CartePage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/rapports" element={<RapportsPage />} />
          <Route path="/trajets" element={<FraisTrajetPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/parametres" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
