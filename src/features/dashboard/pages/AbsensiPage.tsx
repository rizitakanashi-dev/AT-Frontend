import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderKanban, ClipboardCheck, History, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  getRekapAbsensi,
  postAbsenMasuk,
  postAbsenPulang,
} from '../absensiService';
import { AbsenRekapDTO } from '../../../types/absensi';

const navItems = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Projet', icon: FolderKanban, path: '/dashboard/projet' },
  { label: 'Absensi', icon: ClipboardCheck, path: '/dashboard/absensi' },
  { label: 'Riwayat', icon: History, path: '/dashboard/riwayat' },
];

export default function AbsensiPage() {
  const [rekapList, setRekapList] = useState<AbsenRekapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rekap = await getRekapAbsensi();
        if (!cancelled) setRekapList(rekap);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg('Gagal memuat rekap absensi dari server.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Memuat rekap absensi...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              A
            </div>
            <span className="font-bold">
              AbsensiApp <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400 align-middle">PRO</span>
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-xl font-bold">Absensi</h1>
        <p className="mt-1 text-xs text-slate-500">Rekap kehadiran kamu.</p>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Jam Masuk</th>
                <th className="px-4 py-3">Jam Pulang</th>
              </tr>
            </thead>
            <tbody>
              {rekapList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data absensi.
                  </td>
                </tr>
              ) : (
                rekapList.map((row) => (
                  <tr key={row.idAbsensi} className="border-b border-slate-800/60 last:border-0">
                    <td className="px-4 py-3">{row.tanggal}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.divisi}</td>
                    <td className="px-4 py-3">{row.project ?? '-'}</td>
                    <td className="px-4 py-3">{row.target ?? '-'}</td>
                    <td className="px-4 py-3">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
