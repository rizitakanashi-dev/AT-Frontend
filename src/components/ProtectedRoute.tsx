import { Navigate, Outlet } from 'react-router-dom';
import useSWR from 'swr';
import { getSession, clearSession } from '@/lib/session';
import { normalizeRole, roleHomePath } from '@/lib/roles';
import { fetcher } from '@/lib/api';
import type { UserDTO } from '@/types/absensi';
import { ErrorState, LoadingState } from './DataState';
import { Button } from './ui/button';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const session = getSession();
  const { data: user, error, isLoading, mutate } = useSWR<UserDTO>(session ? '/v1/auth/me' : null, fetcher);
  if (!session) return <Navigate to="/login" replace />;
  if (error) return <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 p-6"><ErrorState error={error} retry={() => void mutate()} /><Button variant="outline" onClick={() => { clearSession(); window.location.replace('/login'); }}>Kembali ke halaman masuk</Button></main>;
  if (isLoading || !user) return <main className="mx-auto max-w-3xl p-8"><LoadingState /></main>;
  if (!['Admin', 'PM', 'Guru', 'Anggota', 'Pelajar'].includes(user.role)) return <Navigate to="/unauthorized" replace />;
  const role = normalizeRole(user.role);
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={roleHomePath(role)} replace />;
  return <Outlet />;
}
