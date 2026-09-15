import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoginResponse } from '../types/auth';
import { roleHomePath } from '../lib/roles';
import { isAnggota } from '../lib/roles';
import { TOKEN_KEY, USER_KEY } from '../features/absensi/services/authService';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userString = localStorage.getItem(USER_KEY);
  const user: LoginResponse | null = userString ? JSON.parse(userString) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  // Normalize 'Pelajar' alias → 'Anggota' when matching allowed roles.
  const allowed = allowedRoles?.map((r) => (isAnggota(r) ? 'Anggota' : r));
  const normalizedRole = isAnggota(role) ? 'Anggota' : role;

  if (allowed && !allowed.includes(normalizedRole)) {
    // Redirect ke halaman rumah role milik user, bukan deny generik.
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;