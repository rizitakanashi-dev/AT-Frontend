import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  ClipboardCheck,
  History,
  LogOut,
  Search,
  Bell,
  Settings,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import api from '@/lib/api';

interface Project {
  id: number;
  nama: string;
}

interface WorkLog {
  id: number;
  time: string;
  title: string;
  desc: string;
  status: string;
}

const navItems = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Projet', icon: FolderKanban, path: '/dashboard/projet' },
  { label: 'Absensi', icon: ClipboardCheck, path: '/dashboard/absensi' },
  { label: 'Riwayat', icon: History, path: '/dashboard/riwayat' },
];

const defaultLogs: WorkLog[] = [
  { id: 1, time: '08:00 AM', title: 'Check-in', desc: 'Hadir tepat waktu di Lab TI', status: 'Completed' },
  { id: 2, time: '11:30 AM', title: 'Work Log', desc: 'Membuat UI/Mockup untuk AbsensiApp', status: 'In Progress' },
  { id: 3, time: '03:00 PM', title: 'Work Log', desc: 'Finalisasi core features & testing', status: 'Pending' },
];

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(defaultLogs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInForm, setCheckInForm] = useState({ project: '', target: '' });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get<Project[]>('/v1/project');
        setProjects(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedProject(response.data[0].id);
        }
      } catch (err) {
        setError('Gagal memuat data project');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const handleCheckIn = async () => {
    if (!selectedProject || !checkInForm.target) {
      setError('Harap isi semua field');
      return;
    }

    try {
      const payload = {
        idProject: selectedProject,
        target: checkInForm.target,
        idStatus: 2,
      };

      const response = await api.post('/v1/absen/masuk', payload);
      console.log('Check-in berhasil:', response.data);

      const newLog: WorkLog = {
        id: workLogs.length + 1,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        title: 'Check-in',
        desc: checkInForm.target,
        status: 'Completed',
      };
      setWorkLogs([newLog, ...workLogs]);

      setShowCheckInModal(false);
      setCheckInForm({ project: '', target: '' });
    } catch (err) {
      setError('Gagal melakukan check-in');
      console.error('Check-in error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 font-bold text-emerald-400">
              A
            </div>
            <span className="text-lg font-bold">
              AbsensiApp <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 align-middle text-[10px] text-emerald-400">PRO</span>
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
                      ? 'bg-emerald-500/10 font-medium text-emerald-400'
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Pelajar</h1>
            <p className="text-xs text-slate-500">NicaAdmin Dark Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Cari projek / pelajar..."
                className="w-64 rounded-lg bg-slate-800/60 py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button className="rounded-lg bg-slate-800/60 p-2 hover:bg-slate-800">
              <Bell className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-slate-800/60 p-2 hover:bg-slate-800">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="mb-2 text-xs text-slate-500">PILIH PROJEK</p>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800/60 px-3 py-2 text-sm focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-slate-500">
              Projek saat ini di bawah pengawasan Guru SMK Attaufiq
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">AKUMULASI JAM KERJA</p>
              <p className="text-xl font-bold">07 Jam 45 Menit</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">PERSENTASE HADIR</p>
              <p className="text-xl font-bold">
                98.5% <span className="text-xs font-normal text-emerald-400">Sangat Baik</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Daily Work Log & Aktivitas</h2>
              <p className="text-xs text-slate-500">Kamis, 24 Oktober 2024</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              Status: checked-in
            </span>
          </div>

          <p className="mb-2 text-xs text-slate-500">DESKRIPSI PEKERJAAN HARI INI</p>
          <div className="mb-6 rounded-lg bg-slate-800/40 p-3 text-sm text-slate-300">
            Mendesain layout dashboard untuk 3 user role: Student, PM, dan Guru dengan aesthetic
            NicaAdmin Dark Mode. Mengimplementasikan data table, grid pemantauan, dan floating
            action bar check-in.
          </div>

          <p className="mb-3 text-xs text-slate-500">RIWAYAT LOG MASUK/AKTIVITAS HARI INI</p>
          <div className="mb-6 space-y-3">
            {workLogs.map((log) => (
              <div key={log.id} className="flex gap-4 text-sm">
                <span className="w-20 shrink-0 text-emerald-400">{log.time}</span>
                <div>
                  <p className="font-medium">{log.title}</p>
                  <p className="text-xs text-slate-500">{log.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div>
              <p className="text-sm font-medium">Konfirmasi Absensi Kehadiran</p>
              <p className="text-xs text-slate-500">
                Pastikan tekan CI saat tiba dan CO setelah selesai bekerja
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckInModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
              >
                CI (Check-In)
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700">
                CO (Check-Out)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCheckInModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Check-In Absensi</h3>
                <p className="text-xs text-slate-500">Masukkan detail pekerjaan Anda</p>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Project</label>
                <select
                  value={checkInForm.project || selectedProject || ''}
                  onChange={(e) => setCheckInForm({ ...checkInForm, project: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Pilih Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Deskripsi Pekerjaan</label>
                <textarea
                  value={checkInForm.target}
                  onChange={(e) => setCheckInForm({ ...checkInForm, target: e.target.value })}
                  placeholder="Masukkan target/deskripsi pekerjaan Anda..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleCheckIn}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
              >
                Konfirmasi Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}