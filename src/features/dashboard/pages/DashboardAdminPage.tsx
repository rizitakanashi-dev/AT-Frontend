import { useState, useEffect } from 'react';
import { Users, FolderKanban, UserCheck, ClipboardList } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../lib/api';
import { getProjects, getRekapAbsensi, todayISO } from '../absensiService';
import { UserDTO, ProjectDTO, AbsenRekapDTO } from '../../../types/absensi';

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export default function DashboardAdminPage() {
  const [gurus, setGurus] = useState<UserDTO[]>([]);
  const [anggota, setAnggota] = useState<UserDTO[]>([]);
  const [pms, setPms] = useState<UserDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [todayRekap, setTodayRekap] = useState<AbsenRekapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [g, a, p, pr, rekap] = await Promise.all([
          api.get<UserDTO[]>('/v1/guru'),
          api.get<UserDTO[]>('/Anggota'),
          api.get<UserDTO[]>('/PM'),
          getProjects(),
          getRekapAbsensi(todayISO()),
        ]);
        if (cancelled) return;
        setGurus(g.data || []);
        setAnggota(a.data || []);
        setPms(p.data || []);
        setProjects(pr);
        setTodayRekap(rekap);
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat data dashboard dari server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats: Stat[] = [
    { label: 'Guru', value: gurus.length, icon: UserCheck, color: '#22D3EE' },
    { label: 'Project Manager', value: pms.length, icon: Users, color: '#3B82F6' },
    { label: 'Anggota', value: anggota.length, icon: Users, color: '#10B981' },
    { label: 'Project Aktif', value: projects.length, icon: FolderKanban, color: '#FF9F43' },
  ];
  const activeToday = todayRekap.filter((r) => !r.jamPulang).length;

  return (
    <DashboardLayout title="Dashboard Admin" subtitle="Executive overview dan monitoring.">
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat dashboard admin...
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
              {errorMsg}
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="stem-tile">
                <div className="stem-icon-chip" style={{ backgroundColor: `${s.color}1F` }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Today's overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                <ClipboardList className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Absensi Hari Ini</p>
                <p className="text-xl font-bold">{todayRekap.length} catatan</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(255,159,67,0.12)' }}>
                <Users className="h-5 w-5" style={{ color: '#FF9F43' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Belum Check Out</p>
                <p className="text-xl font-bold">{activeToday} orang</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(32,230,183,0.12)' }}>
                <FolderKanban className="h-5 w-5" style={{ color: '#20E6B7' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Total Pengguna</p>
                <p className="text-xl font-bold">{gurus.length + pms.length + anggota.length}</p>
              </div>
            </div>
          </div>

          {/* User distribution */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
            <div className="mb-4">
              <h2 className="font-semibold">Komposisi Pengguna</h2>
              <p className="text-xs" style={{ color: '#8A8F99' }}>Distribusi peran di sistem.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { label: 'Guru', list: gurus, color: '#22D3EE' },
                { label: 'Project Manager', list: pms, color: '#3B82F6' },
                { label: 'Anggota', list: anggota, color: '#10B981' },
              ].map((bucket) => (
                <div key={bucket.label} className="rounded-lg p-4" style={{ backgroundColor: '#121316', border: '1px solid #2D3036' }}>
                  <p className="mb-2 text-xs font-medium" style={{ color: '#8A8F99' }}>{bucket.label} · {bucket.list.length}</p>
                  <ul className="space-y-1.5 text-sm">
                    {bucket.list.length === 0 && <li style={{ color: '#8A8F99' }}>Belum ada data.</li>}
                    {bucket.list.slice(0, 6).map((u) => (
                      <li key={u.id} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bucket.color }} />
                        {u.nama}
                      </li>
                    ))}
                    {bucket.list.length > 6 && (
                      <li style={{ color: '#8A8F99' }}>+{bucket.list.length - 6} lainnya</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}