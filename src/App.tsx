import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './features/dashboard/pages/UnauthorizedPage';
import { LoadingState } from './components/DataState';

// Code-split the role pages so each role loads only its own bundle.
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./features/dashboard/pages/ProjectsPage'));
const AbsensiPage = lazy(() => import('./features/dashboard/pages/AbsensiPage'));
const RiwayatPage = lazy(() => import('./features/dashboard/pages/RiwayatPage'));
const ManagementOverview = lazy(() => import('./features/dashboard/components/ManagementOverview'));
const UsersPage = lazy(() => import('./features/dashboard/pages/UsersPage'));
const TargetsPage = lazy(() => import('./features/dashboard/pages/TargetsPage'));
const DivisionsPage = lazy(() => import('./features/dashboard/pages/DivisionsPage'));
const HostingPage = lazy(() => import('./features/dashboard/pages/HostingPage'));

export default function App() {
  return <BrowserRouter><Suspense fallback={<div className="mx-auto max-w-3xl p-8"><LoadingState /></div>}><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route element={<ProtectedRoute allowedRoles={['Anggota']} />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/project" element={<ProjectsPage />} />
      <Route path="/dashboard/absensi" element={<AbsensiPage />} />
      <Route path="/dashboard/riwayat" element={<RiwayatPage />} />
      <Route path="/dashboard/targets" element={<TargetsPage />} />
      <Route path="/dashboard/hosting" element={<HostingPage />} />
    </Route>
    {['Admin', 'Guru', 'PM'].map((role) => <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
      <Route path={`/${role.toLowerCase()}`} element={<ManagementOverview />} />
      <Route path={`/${role.toLowerCase()}/projects`} element={<ProjectsPage />} />
      <Route path={`/${role.toLowerCase()}/users`} element={<UsersPage />} />
      <Route path={`/${role.toLowerCase()}/absensi`} element={<RiwayatPage />} />
      <Route path={`/${role.toLowerCase()}/targets`} element={<TargetsPage />} />
    </Route>)}
    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
      <Route path="/admin/divisions" element={<DivisionsPage />} />
      <Route path="/admin/hosting" element={<HostingPage />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['PM']} />}><Route path="/pm/hosting" element={<HostingPage />} /></Route>
    <Route element={<ProtectedRoute allowedRoles={['DevOps']} />}><Route path="/devops" element={<HostingPage />} /></Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes></Suspense></BrowserRouter>;
}
