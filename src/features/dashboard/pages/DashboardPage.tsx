import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { getProjects, getRekapAbsensi, postAbsenMasuk, postAbsenPulang } from '../absensiService';
import { AbsenRekapDTO, ProjectDTO } from '../../../types/absensi';
import { todayISO } from '../absensiService';

interface CheckInState {
  idProject: number | null;
  target: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [todayRekap, setTodayRekap] = useState<AbsenRekapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<'in' | 'out' | null>(null);
  const [form, setForm] = useState<CheckInState>({ idProject: null, target: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [proj, rekap] = await Promise.all([
        getProjects(),
        getRekapAbsensi(todayISO()),
      ]);
      setProjects(proj);
      setTodayRekap(rekap);
      // Default the project selector to the user's first available project.
      setForm((f) => ({ ...f, idProject: f.idProject ?? proj[0]?.id ?? null }));
    } catch {
      setErrorMsg('Gagal memuat data dashboard dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const myToday = todayRekap.filter((r) => !r.jamPulang);

  const handleCheckIn = async () => {
    if (!form.idProject || !form.target.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await postAbsenMasuk({
        idProject: form.idProject,
        target: form.target.trim(),
        idStatus: 1,
      });
      setModal(null);
      setForm((f) => ({ ...f, target: '' }));
      await load();
    } catch {
      setErrorMsg('Gagal melakukan check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (myToday.length === 0) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const active = myToday[myToday.length - 1];
      await postAbsenPulang({
        idAbsensi: active.idAbsensi,
        idTarget: active.idTarget,
        idStatus: 2,
      });
      setModal(null);
      await load();
    } catch {
      setErrorMsg('Gagal melakukan check-out.');
    } finally {
      setSubmitting(false);
    }
  };

  const attendedToday = todayRekap.length > 0;

  return (
    <DashboardLayout title="Dashboard Pelajar" subtitle="Ringkasan aktivitas harian kamu.">
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat dashboard...
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
              {errorMsg}
            </div>
          )}

          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
              <p className="mb-2 text-xs font-medium" style={{ color: '#8A8F99' }}>Project Aktif</p>
              <select
                value={form.idProject ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, idProject: Number(e.target.value) || null }))}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: '#121316', color: '#FFFFFF', border: '1px solid #2D3036' }}
              >
                {projects.length === 0 && <option value="">Tidak ada project</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>

            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                <Clock className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Catatan Hari Ini</p>
                <p className="text-xl font-bold">{todayRekap.length} Aktivitas</p>
              </div>
            </div>

            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(32,230,183,0.12)' }}>
                <CheckCircle2 className="h-5 w-5" style={{ color: '#20E6B7' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Status Kehadiran</p>
                <p className="text-xl font-bold">{attendedToday ? (myToday.length ? 'Check-in' : 'Hadir') : 'Belum Check In'}</p>
              </div>
            </div>
          </div>

          {/* Today's records */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Daily Work Log</h2>
                <p className="text-xs" style={{ color: '#8A8F99' }}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {attendedToday && (
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                  Checked In
                </span>
              )}
            </div>

            <div className="mb-6 space-y-3">
              {todayRekap.length === 0 ? (
                <p className="py-4 text-center text-sm" style={{ color: '#8A8F99' }}>
                  Belum ada aktivitas hari ini. Tekan Check In untuk memulai.
                </p>
              ) : (
                todayRekap.map((log) => (
                  <div key={log.idAbsensi} className="flex gap-4 text-sm">
                    <span className="w-20 shrink-0" style={{ color: '#10B981' }}>{log.jamMasuk || '-'}</span>
                    <div>
                      <p className="font-medium">{log.project || 'Project'}</p>
                      <p className="text-xs" style={{ color: '#8A8F99' }}>{log.target || '-'}</p>
                      {log.jamPulang && <p className="text-xs" style={{ color: '#8A8F99' }}>Keluar: {log.jamPulang}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: '#2D3036' }}>
              <p className="text-sm" style={{ color: '#8A8F99' }}>
                {myToday.length ? 'Check Out untuk mengakhiri aktivitas kerja hari ini.' : 'Tekan Check In untuk memulai hari kerja.'}
              </p>
              <div className="flex gap-2">
                {myToday.length > 0 && (
                  <button onClick={() => setModal('out')} className="stem-btn stem-btn-amber">
                    <ArrowUpFromLine className="h-4 w-4" />
                    Check Out
                  </button>
                )}
                <button
                  onClick={() => { setErrorMsg(''); setModal('in'); }}
                  disabled={myToday.length > 0}
                  className="stem-btn stem-btn-primary"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Check In
                </button>
              </div>
            </div>
          </div>

          {/* Check-In Modal */}
          {modal === 'in' && (
            <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
              <div className="stem-pop stem-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-1 text-lg font-semibold">Check In</h3>
                <p className="mb-4 text-sm" style={{ color: '#8A8F99' }}>Masukkan target kerja hari ini.</p>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#8A8F99' }}>Project</label>
                <select
                  value={form.idProject ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, idProject: Number(e.target.value) || null }))}
                  className="mb-4 w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ backgroundColor: '#121316', color: '#FFFFFF', border: '1px solid #2D3036' }}
                >
                  {projects.length === 0 && <option value="">Tidak ada project</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#8A8F99' }}>Target Kerja</label>
                <textarea
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  placeholder="Deskripsi target kerja..."
                  className="w-full rounded-xl p-3 text-sm focus:outline-none"
                  style={{ backgroundColor: '#121316', color: '#FFFFFF', border: '1px solid #2D3036' }}
                  rows={3}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setModal(null)} className="stem-btn stem-btn-ghost">
                    Batal
                  </button>
                  <button
                    onClick={handleCheckIn}
                    disabled={submitting || !form.target.trim() || !form.idProject}
                    className="stem-btn stem-btn-primary"
                  >
                    {submitting ? 'Mengirim...' : 'Konfirmasi'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Check-Out Modal */}
          {modal === 'out' && (
            <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
              <div className="stem-pop stem-surface w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-1 text-lg font-semibold">Check Out</h3>
                <p className="mb-4 text-sm" style={{ color: '#8A8F99' }}>Konfirmasi check out hari ini?</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setModal(null)} className="stem-btn stem-btn-ghost">
                    Batal
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={submitting}
                    className="stem-btn stem-btn-amber"
                  >
                    {submitting ? 'Mengirim...' : 'Check Out'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}