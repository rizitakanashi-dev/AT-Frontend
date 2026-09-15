import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoginPage from './features/auth/pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './features/dashboard/pages/UnauthorizedPage';

// Code-split the role pages so each role loads only its own bundle.
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ProjetPage = lazy(() => import('./features/dashboard/pages/ProjetPage'));
const AbsensiPage = lazy(() => import('./features/dashboard/pages/AbsensiPage'));
const RiwayatPage = lazy(() => import('./features/dashboard/pages/RiwayatPage'));
const DashboardAdminPage = lazy(() => import('./features/dashboard/pages/DashboardAdminPage'));
const DashboardGuruPage = lazy(() => import('./features/dashboard/pages/DashboardGuruPage'));
const DashboardPMPage = lazy(() => import('./features/dashboard/pages/DashboardPMPage'));
const UsersPage = lazy(() => import('./features/dashboard/pages/UsersPage'));
const ProjectsPage = lazy(() => import('./features/dashboard/pages/ProjectsPage'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#121316', color: '#8A8F99' }}>
      Memuat...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Anggota (Student) — protected */}
          <Route element={<ProtectedRoute allowedRoles={['Anggota']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/project" element={<ProjetPage />} />
            <Route path="/dashboard/absensi" element={<AbsensiPage />} />
            <Route path="/dashboard/riwayat" element={<RiwayatPage />} />
          </Route>

          {/* Admin — executive overview + full CRUD */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<DashboardAdminPage />} />
            <Route path="/admin/projects" element={<ProjectsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* Guru */}
          <Route element={<ProtectedRoute allowedRoles={['Guru']} />}>
            <Route path="/guru" element={<DashboardGuruPage />} />
            <Route path="/guru/projects" element={<ProjectsPage />} />
            <Route path="/guru/users" element={<UsersPage />} />
          </Route>

          {/* PM */}
          <Route element={<ProtectedRoute allowedRoles={['PM']} />}>
            <Route path="/pm" element={<DashboardPMPage />} />
            <Route path="/pm/projects" element={<ProjectsPage />} />
            <Route path="/pm/users" element={<UsersPage />} />
          </Route>

          {/* Redirect any leftover path to home */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;