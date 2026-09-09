import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderKanban, ClipboardCheck, History, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Projet', icon: FolderKanban, path: '/dashboard/projet' },
  { label: 'Absensi', icon: ClipboardCheck, path: '/dashboard/absensi' },
  { label: 'Riwayat', icon: History, path: '/dashboard/riwayat' },
];

export default function RiwayatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              A
            </div>
            <span className="text-lg font-bold">
              AbsensiApp <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400 align-middle">PRO</span>
            </span>
          </div>

          <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
            <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
            <div>
              <p className="text-sm font-semibold">Ahmad Fauzi</p>
              <p className="text-xs text-slate-400">Pelajar</p>
            </div>
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
        <h1 className="text-xl font-bold">Riwayat</h1>
        <p className="mt-1 text-xs text-slate-500">Riwayat aktivitas dan absensi kamu.</p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-500">
          Halaman Riwayat — konten akan ditambahkan di sini.
        </div>
      </main>
    </div>
  );
}