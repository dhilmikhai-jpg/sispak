import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

// User Pages
import HomePage        from './pages/user/HomePage'
import KonsultasiPage  from './pages/user/KonsultasiPage'
import HasilPage       from './pages/user/HasilPage'
import ChatPage        from './pages/user/ChatPage'

// Admin Pages
import LoginPage       from './pages/admin/LoginPage'
import DashboardPage   from './pages/admin/DashboardPage'
import GejalaPage      from './pages/admin/GejalaPage'
import KerusakanPage   from './pages/admin/KerusakanPage'
import KasusPage       from './pages/admin/KasusPage'
import LaporanPage     from './pages/admin/LaporanPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── User Routes ───────────────────────── */}
        <Route path="/"            element={<HomePage />} />
        <Route path="/konsultasi"  element={<KonsultasiPage />} />
        <Route path="/hasil"       element={<HasilPage />} />
        <Route path="/chat"        element={<ChatPage />} />

        {/* ── Admin Routes ──────────────────────── */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index             element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="gejala"     element={<GejalaPage />} />
          <Route path="kerusakan"  element={<KerusakanPage />} />
          <Route path="kasus"      element={<KasusPage />} />
          <Route path="laporan"    element={<LaporanPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
