import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ProjetPage from './features/dashboard/pages/ProjetPage';
import AbsensiPage from './features/dashboard/pages/AbsensiPage';
import RiwayatPage from './features/dashboard/pages/RiwayatPage';
import DashboardPMPage from './features/dashboard/pages/DashboardPMPage';
import DashboardGuruPage from './features/dashboard/pages/DashboardGuruPage';
import DashboardAdminPage from './features/dashboard/pages/DashboardAdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/projet" element={<ProjetPage />} />
        <Route path="/dashboard/absensi" element={<AbsensiPage />} />
        <Route path="/dashboard/riwayat" element={<RiwayatPage />} />
        <Route path="/pm" element={<DashboardPMPage />} />
        <Route path="/guru" element={<DashboardGuruPage />} />
        <Route path="/admin" element={<DashboardAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;