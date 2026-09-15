import { useState, useEffect, useCallback } from 'react';
import { History, Clock } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { getRekapAbsensi, todayISO } from '../absensiService';
import { AbsenRekapDTO } from '../../../types/absensi';

export default function RiwayatPage() {
  const [logList, setLogList] = useState<AbsenRekapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [tanggal, setTanggal] = useState(todayISO());

  const fetchRiwayat = useCallback(async (date: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const rekap = await getRekapAbsensi(date);
      setLogList(rekap);
    } catch {
      setErrorMsg('Gagal memuat riwayat absensi dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRiwayat(tanggal);
  }, [tanggal, fetchRiwayat]);

  return (
    <DashboardLayout title="Riwayat" subtitle="Riwayat aktivitas dan absensi kamu.">
      {/* Date filter */}
      <div className="mb-5 flex items-center gap-3">
        <label className="text-sm" style={{ color: '#8A8F99' }}>Tanggal</label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm"
          style={{ backgroundColor: '#1E2024', color: '#FFFFFF', border: '1px solid #2D3036' }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat riwayat...
        </div>
      ) : errorMsg ? (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}
        >
          {errorMsg}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
          {logList.length === 0 ? (
            <div className="p-12 text-center">
              <History className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
              <p style={{ color: '#8A8F99' }}>Belum ada riwayat absensi pada tanggal ini.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: '#2D3036' }}>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Tanggal</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Project</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Target</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Status</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Jam</th>
                </tr>
              </thead>
              <tbody>
                {logList.map((row) => (
                  <tr key={row.idAbsensi} className="border-b last:border-0" style={{ borderColor: '#2D3036' }}>
                    <td className="px-5 py-3">{row.tanggal}</td>
                    <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{row.project || '-'}</td>
                    <td className="px-5 py-3" style={{ color: '#8A8F99' }}>{row.target || '-'}</td>
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
                    <td className="px-5 py-3 text-xs" style={{ color: '#8A8F99' }}>
                      {row.jamMasuk ? `${row.jamMasuk}${row.jamPulang ? ` ke ${row.jamPulang}` : ''}` : '-'}
                    </td>
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