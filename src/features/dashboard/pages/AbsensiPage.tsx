import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Clock, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { getRekapAbsensi, postAbsenMasuk, postAbsenPulang, getProjects } from '../absensiService';
import { AbsenRekapDTO, ProjectDTO } from '../../../types/absensi';
import { todayISO } from '../absensiService';

export default function AbsensiPage() {
  const [rekapList, setRekapList] = useState<AbsenRekapDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [target, setTarget] = useState('');
  const [idProject, setIdProject] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRekap = useCallback(async () => {
    try {
      const rekap = await getRekapAbsensi(todayISO());
      setRekapList(rekap);
    } catch {
      setErrorMsg('Gagal memuat rekap absensi.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [rekap, proj] = await Promise.all([getRekapAbsensi(todayISO()), getProjects()]);
        if (cancelled) return;
        setRekapList(rekap);
        setProjects(proj);
        setIdProject(proj[0]?.id ?? null);
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat rekap absensi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchRekap]);

  const openCheckIn = () => { setErrorMsg(''); setTarget(''); setShowCheckIn(true); };
  const openCheckOut = () => { setErrorMsg(''); setShowCheckOut(true); };

  const handleCheckIn = async () => {
    if (!idProject || !target.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await postAbsenMasuk({ idProject, target: target.trim(), idStatus: 1 });
      setShowCheckIn(false);
      setTarget('');
      await fetchRekap();
    } catch {
      setErrorMsg('Gagal melakukan check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (rekapList.length === 0) return;
    const latest = rekapList[rekapList.length - 1];
    if (!latest.jamPulang) {
      setSubmitting(true);
      setErrorMsg('');
      try {
        await postAbsenPulang({ idAbsensi: latest.idAbsensi, idTarget: latest.idTarget, idStatus: 2 });
        setShowCheckOut(false);
        await fetchRekap();
      } catch {
        setErrorMsg('Gagal melakukan check-out.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const activeCount = rekapList.filter((r) => !r.jamPulang).length;

  return (
    <DashboardLayout title="Absensi" subtitle="Rekap kehadiran dan aktivitas harian.">
      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button onClick={openCheckIn} disabled={activeCount > 0} className="stem-btn stem-btn-primary">
          <ArrowDownToLine className="h-4 w-4" />
          Check In
        </button>
        <button onClick={openCheckOut} disabled={activeCount === 0} className="stem-btn stem-btn-amber">
          <ArrowUpFromLine className="h-4 w-4" />
          Check Out
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
          {errorMsg}
        </div>
      )}

      {/* Rekap Table */}
      <div className="overflow-hidden rounded-xl" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
            Memuat rekap absensi...
          </div>
        ) : rekapList.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
            <p style={{ color: '#8A8F99' }}>Belum ada data absensi hari ini.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: '#2D3036' }}>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Tanggal</th>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Nama</th>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Project</th>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Status</th>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Jam Masuk</th>
                <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Jam Pulang</th>
              </tr>
            </thead>
            <tbody>
              {rekapList.map((row) => (
                <tr key={row.idAbsensi} className="border-b last:border-0" style={{ borderColor: '#2D3036' }}>
                  <td className="px-5 py-3">{row.tanggal}</td>
                  <td className="px-5 py-3">{row.nama}</td>
                  <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{row.project || '-'}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                      style={
                        row.jamPulang
                          ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }
                          : { backgroundColor: 'rgba(255,159,67,0.12)', color: '#FF9F43' }
                      }
                    >
                      <Clock className="h-3 w-3" />
                      {row.jamPulang ? 'Selesai' : 'On Progress'}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{row.jamMasuk || '-'}</td>
                  <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{row.jamPulang || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Check-In Modal */}
      {showCheckIn && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCheckIn(false)}>
          <div className="stem-pop stem-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-semibold">Check In</h3>
            <p className="mb-4 text-sm" style={{ color: '#8A8F99' }}>Pilih project dan isi target kerja hari ini.</p>
            <label className="mb-1 block text-xs font-medium" style={{ color: '#8A8F99' }}>Project</label>
            <select
              value={idProject ?? ''}
              onChange={(e) => setIdProject(Number(e.target.value) || null)}
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
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Deskripsi target kerja..."
              className="w-full rounded-xl p-3 text-sm focus:outline-none"
              style={{ backgroundColor: '#121316', color: '#FFFFFF', border: '1px solid #2D3036' }}
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowCheckIn(false)} className="stem-btn stem-btn-ghost">
                Batal
              </button>
              <button
                onClick={handleCheckIn}
                disabled={submitting || !target.trim() || !idProject}
                className="stem-btn stem-btn-primary"
              >
                {submitting ? 'Mengirim...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {showCheckOut && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCheckOut(false)}>
          <div className="stem-pop stem-surface w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-semibold">Check Out</h3>
            <p className="mb-4 text-sm" style={{ color: '#8A8F99' }}>Konfirmasi check out hari ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCheckOut(false)} className="stem-btn stem-btn-ghost">
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
    </DashboardLayout>
  );
}