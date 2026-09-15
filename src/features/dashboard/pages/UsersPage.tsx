import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../lib/api';
import { USER_KEY } from '../../absensi/services/authService';
import { UserDTO } from '../../../types/absensi';
import { normalizeRole, ROLES } from '../../../lib/roles';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const viewerRole = (() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? normalizeRole(JSON.parse(raw).role || '') : '';
    } catch {
      return '';
    }
  })();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Admin sees everyone; PM/Guru see the Anggota roster.
        const isAdmin = viewerRole === ROLES.ADMIN;
        const [anggota = [], guru = [], pm = []] = await Promise.all([
          api.get<UserDTO[]>('/Anggota').then(r => r.data).catch(() => []),
          isAdmin ? api.get<UserDTO[]>('/v1/guru').then(r => r.data).catch(() => []) : Promise.resolve([]),
          isAdmin ? api.get<UserDTO[]>('/PM').then(r => r.data).catch(() => []) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setUsers([...anggota, ...guru, ...pm]);
        }
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat daftar pengguna.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [viewerRole]);

  const roleColor: Record<string, string> = {
    Admin: '#A855F7',
    PM: '#3B82F6',
    Guru: '#22D3EE',
    Anggota: '#10B981',
  };

  return (
    <DashboardLayout title="Users" subtitle="Kelola daftar pengguna.">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm" style={{ color: '#8A8F99' }}>
          {users.length} pengguna terdaftar.
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>Memuat...</div>
      ) : errorMsg ? (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
          {errorMsg}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
              <p style={{ color: '#8A8F99' }}>Belum ada pengguna.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: '#2D3036' }}>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>ID</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Nama</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Role</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Divisi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0" style={{ borderColor: '#2D3036' }}>
                    <td className="px-5 py-3" style={{ color: '#10B981' }}>{user.id}</td>
                    <td className="px-5 py-3">{user.nama}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: `${roleColor[user.role] || '#8A8F99'}1F`, color: roleColor[user.role] || '#8A8F99' }}>
                        {user.role || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{user.divisi || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}