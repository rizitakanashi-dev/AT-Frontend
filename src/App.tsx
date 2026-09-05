import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
// Impor halaman dashboard & absensi kamu jika sudah ada

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Routes */}
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/anggota/dashboard" element={<div>Anggota Dashboard</div>} />

        {/* Absensi Routes */}
        <Route path="/absensi/rekap" element={<div>Halaman Rekap Absen</div>} />
      </Routes>
    </BrowserRouter>
  );
}
