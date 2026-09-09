import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Users,
  LogOut,
  Search,
  Bell,
  Settings,
  UserPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

interface UserRow {
  idUser: string;
  nama: string;
  role: 'Admin' | 'PM' | 'Guru' | 'Pelajar';
  divisi: string;
  status: 'Active' | 'Inactive';
}

interface Divisi {
  nama: string;
  penanggungJawab: string;
  jumlahAnggota: number;
}

const defaultUsers: UserRow[] = [
  { idUser: 'USR-001', nama: 'Anto Wijaya', role: 'Admin', divisi: 'IT Ops & Security', status: 'Active' },
  { idUser: 'USR-002', nama: 'Budi Santoso', role: 'PM', divisi: 'NicaAdmin Team', status: 'Active' },
  { idUser: 'USR-003', nama: 'Siti Aminah', role: 'Guru', divisi: 'Pendidik', status: 'Active' },
  { idUser: 'USR-004', nama: 'Ahmad Fauzi', role: 'Pelajar', divisi: 'Siswa Magang', status: 'Active' },
  { idUser: 'USR-005', nama: 'Zaskia Amalia', role: 'Pelajar', divisi: 'Siswa Magang', status: 'Inactive' },
];

const divisiList: Divisi[] = [
  { nama: 'IT Ops & Security', penanggungJawab: 'Anto Wijaya', jumlahAnggota: 4 },
  { nama: 'NicaAdmin Team', penanggungJawab: 'Budi Santoso', jumlahAnggota: 12 },
  { nama: 'Siswa Magang', penanggungJawab: 'Siti Aminah', jumlahAnggota: 12 },
];

const navItems = [
  { label: 'Home', icon: Home, active: false },
  { label: 'Project', icon: FolderKanban, active: false },
  { label: 'User', icon: Users, active: true },
];

const roleBadgeStyle: Record<UserRow['role'], string> = {
  Admin: 'bg-purple-500/10 text-purple-400',
  PM: 'bg-blue-500/10 text-blue-400',
  Guru: 'bg-cyan-500/10 text-cyan-400',
  Pelajar: 'bg-emerald-500/10 text-emerald-400',
};

export default function DashboardAdminPage() {
  const [users, setUsers] = useState<UserRow[]>(defaultUsers);
  const [autoCheckOut, setAutoCheckOut] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [toleransi, setToleransi] = useState(15);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteUser = async (idUser: string) => {
    try {
      setUsers(users.filter((u) => u.idUser !== idUser));
      setShowDeleteConfirm(null);
      console.log('User deleted:', idUser);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = async (user: UserRow) => {
    try {
      setEditingUser(null);
      console.log('User updated:', user);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 font-bold text-emerald-400">
              A
            </div>
            <span className="text-lg font-bold">
              AbsensiApp
              <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 align-middle text-[10px] text-emerald-400">
                PRO
              </span>
            </span>
          </div>

          <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
            <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
            <div>
              <p className="text-sm font-semibold">Anto Wijaya</p>
              <p className="text-xs text-emerald-400">Administrator</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-emerald-500/10 font-medium text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
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

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard DBA</h1>
            <p className="text-xs text-slate-500">Master Data Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Cari master data..."
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

        {/* User Management Table */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Master Data Management</h2>
              <p className="text-xs text-slate-500">
                Kelola data pengguna, hak akses, divisi, dan parameter konfigurasi sistem AbsensiApp.
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400">
              <UserPlus className="h-4 w-4" />
              Tambah Pengguna
            </button>
          </div>

          <p className="mb-2 text-xs text-slate-500">USER MANAGEMENT LIST</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="pb-3 font-medium">ID User</th>
                  <th className="pb-3 font-medium">Nama Pengguna</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Divisi</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.idUser} className="border-b border-slate-800/50">
                    <td className="py-3 text-emerald-400">{user.idUser}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
                        {user.nama}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${roleBadgeStyle[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{user.divisi}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="rounded-lg bg-slate-800/60 p-1.5 text-emerald-400 hover:bg-slate-800"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.idUser)}
                          className="rounded-lg bg-slate-800/60 p-1.5 text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom grid: Divisi & System Settings */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Divisi & Departemen */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Divisi & Departemen</h2>
              <button className="text-xs text-emerald-400 hover:underline">Kelola Divisi</button>
            </div>
            <div className="space-y-3">
              {divisiList.map((d) => (
                <div
                  key={d.nama}
                  className="flex items-center justify-between rounded-lg bg-slate-800/40 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{d.nama}</p>
                    <p className="text-xs text-slate-500">Ketua Divisi: {d.penanggungJawab}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                    {d.jumlahAnggota} Members
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 font-semibold">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto Check-Out</p>
                  <p className="text-xs text-slate-500">
                    Otomatis check-out pengguna setelah jam kerja selesai
                  </p>
                </div>
                <ToggleSwitch checked={autoCheckOut} onChange={setAutoCheckOut} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifikasi</p>
                  <p className="text-xs text-slate-500">
                    Kirim notifikasi otomatis untuk Guru & PM
                  </p>
                </div>
                <ToggleSwitch checked={emailNotif} onChange={setEmailNotif} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Batas Toleransi Keterlambatan</p>
                  <p className="text-xs text-slate-500">Toleransi absen check-in sebelum terlambat</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={toleransi}
                    onChange={(e) => setToleransi(Number(e.target.value))}
                    className="w-16 rounded-lg bg-slate-800/60 px-2 py-1 text-center text-sm focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">Menit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-semibold text-red-400">Konfirmasi Penghapusan</h3>
            <p className="mb-6 text-sm text-slate-400">
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}