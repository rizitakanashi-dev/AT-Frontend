import { useState, useMemo } from 'react';
import {
  FolderKanban,
  ClipboardCheck,
  LogOut,
  Search,
  Bell,
  Settings,
  ArrowUpDown,
  UserPlus,
} from 'lucide-react';

interface TeamMember {
  id: number;
  nama: string;
  progress: number;
  absen: 'Hadir' | 'Pending';
  jamKerja: string;
}

const initialTeam: TeamMember[] = [
  { id: 1, nama: 'Ahmad Fauzi', progress: 85, absen: 'Hadir', jamKerja: '08 Hrs / Daily' },
  { id: 2, nama: 'Fathur Rahman', progress: 65, absen: 'Hadir', jamKerja: '08 Hrs / Daily' },
  { id: 3, nama: 'Siti Rahma', progress: 40, absen: 'Pending', jamKerja: '08 Hrs / Daily' },
  { id: 4, nama: 'Rian Hidayat', progress: 92, absen: 'Hadir', jamKerja: '08 Hrs / Daily' },
  { id: 5, nama: 'Zaskia Amalia', progress: 20, absen: 'Pending', jamKerja: '08 Hrs / Daily' },
];

const navItems = [
  { label: 'Projet', icon: FolderKanban, active: true },
  { label: 'Absen', icon: ClipboardCheck, active: false },
];

export default function DashboardPMPage() {
  const [team] = useState<TeamMember[]>(initialTeam);
  const [sortDesc, setSortDesc] = useState(true);

  const sortedTeam = useMemo(() => {
    return [...team].sort((a, b) =>
      sortDesc ? b.progress - a.progress : a.progress - b.progress
    );
  }, [team, sortDesc]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/50 p-5">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
              A
            </div>
            <span className="text-lg font-bold">
              AbsensiApp
              <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400 align-middle">
                PRO
              </span>
            </span>
          </div>

          <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
            <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
            <div>
              <p className="text-sm font-semibold">Budi Santoso</p>
              <p className="text-xs text-emerald-400">Project Manager</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Project Manager</h1>
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

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Team Progress</h2>
              <p className="text-xs text-slate-500">
                Pantau performa harian dan absensi anggota project Anda.
              </p>
            </div>
            <button
              onClick={() => setSortDesc((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Urutkan: {sortDesc ? 'Progres Tertinggi' : 'Progres Terendah'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="pb-3 font-medium">Nama</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Absen</th>
                  <th className="pb-3 font-medium">Jam Kerja</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeam.map((member) => (
                  <tr key={member.id} className="border-b border-slate-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
                        {member.nama}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${member.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{member.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          member.absen === 'Hadir'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {member.absen}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{member.jamKerja}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Total {team.length} Anggota Aktif Terdaftar dalam Project.
            </p>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400">
              <UserPlus className="h-4 w-4" />
              Tambah Anggota
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}