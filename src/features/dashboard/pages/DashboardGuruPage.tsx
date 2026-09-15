import { useState, useEffect } from 'react';
import { X, Users, UserCheck, Clock } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../lib/api';
import { getRekapAbsensi, todayISO } from '../absensiService';
import { UserDTO, AbsenRekapDTO } from '../../../types/absensi';

interface StudentView extends UserDTO {
  hadir: boolean;
  jamMasuk?: string;
  jamPulang?: string;
  logs: AbsenRekapDTO[];
}

function matchName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default function DashboardGuruPage() {
  const [students, setStudents] = useState<StudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<StudentView | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [roster, rekap] = await Promise.all([
          api.get<UserDTO[]>('/Anggota').then((r) => r.data || []),
          getRekapAbsensi(todayISO()),
        ]);
        const views: StudentView[] = roster.map((u) => {
          const logs = rekap.filter((r) => matchName(r.nama, u.nama));
          const active = logs.find((r) => !r.jamPulang);
          const present = logs.find((r) => r.jamMasuk);
          return {
            ...u,
            hadir: logs.length > 0,
            jamMasuk: present?.jamMasuk,
            jamPulang: active ? undefined : present?.jamPulang,
            logs,
          };
        });
        if (!cancelled) setStudents(views);
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat data siswa dari server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hadirToday = students.filter((s) => s.hadir).length;

  return (
    <DashboardLayout title="Dashboard Guru" subtitle="Monitoring status kehadiran siswa.">
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat data siswa...
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
              {errorMsg}
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(32,230,183,0.12)' }}>
                <Users className="h-5 w-5" style={{ color: '#20E6B7' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Total Siswa</p>
                <p className="text-xl font-bold">{students.length}</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                <UserCheck className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Hadir Hari Ini</p>
                <p className="text-xl font-bold">{hadirToday}</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(255,159,67,0.12)' }}>
                <Clock className="h-5 w-5" style={{ color: '#FF9F43' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Belum Check In</p>
                <p className="text-xl font-bold">{students.length - hadirToday}</p>
              </div>
            </div>
          </div>

          {/* Student Grid */}
          {students.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
              <Users className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
              <p style={{ color: '#8A8F99' }}>Belum ada siswa terdaftar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelected(student)}
                  className="flex items-center justify-between rounded-xl p-4 text-left transition-all duration-200 hover:shadow-lg"
                  style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <div>
                      <p className="text-sm font-medium">{student.nama}</p>
                      <span className="inline-block rounded-full px-2 py-0.5 text-[10px]" style={
                        student.hadir
                          ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }
                          : { backgroundColor: 'rgba(255,159,67,0.12)', color: '#FF9F43' }
                      }>
                        {student.hadir ? 'Hadir' : 'Belum Check In'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#10B981' }}>{student.jamMasuk || '--:--'}</p>
                    <p className="text-[10px]" style={{ color: '#8A8F99' }}>{student.divisi || '-'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {selected && (
            <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
              <div className="stem-pop w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Detail Kehadiran</h3>
                    <p className="text-xs" style={{ color: '#8A8F99' }}>{selected.nama}{selected.divisi ? ` · ${selected.divisi}` : ''}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-lg p-1" style={{ color: '#8A8F99' }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selected.logs.length === 0 ? (
                  <p className="py-6 text-center text-sm" style={{ color: '#8A8F99' }}>
                    Belum ada aktivitas absensi hari ini.
                  </p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {selected.logs.map((log) => (
                      <div key={log.idAbsensi} className="flex items-center justify-between rounded-lg p-3 text-sm" style={{ backgroundColor: '#121316', border: '1px solid #2D3036' }}>
                        <div>
                          <p className="font-medium">{log.project || 'Project'}</p>
                          <p className="text-xs" style={{ color: '#8A8F99' }}>{log.target || '-'}</p>
                        </div>
                        <div className="text-right text-xs" style={{ color: '#8A8F99' }}>
                          <p>{log.jamMasuk || '-'} ke {log.jamPulang || 'aktif'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: '#2D3036' }}>
                  <button onClick={() => setSelected(null)} className="rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: '#25282E', color: '#FFFFFF' }}>Tutup</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}