import { useState } from 'react';
import {
  FolderKanban,
  ClipboardCheck,
  LogOut,
  Search,
  Bell,
  Settings,
  X,
  Download,
} from 'lucide-react';

interface Task {
  nama: string;
  durasi: string;
  progres: number;
}

interface Student {
  id: number;
  nama: string;
  kehadiran: number; // persen
  status: 'Hadir' | 'Pending';
  checkIn: string;
  penilaian: number; // persen untuk circular indicator
  tasks: Task[];
}

const students: Student[] = [
  {
    id: 1,
    nama: 'Ahmad Fauzi',
    kehadiran: 98,
    status: 'Hadir',
    checkIn: '08:12 AM',
    penilaian: 98,
    tasks: [
      { nama: 'Develop Frontend UI', durasi: '08:00 AM - 04:30 PM', progres: 95 },
      { nama: 'Refactor API Controllers', durasi: '08:12 AM - 05:00 PM', progres: 60 },
    ],
  },
  {
    id: 2,
    nama: 'Fathur Rahman',
    kehadiran: 88,
    status: 'Hadir',
    checkIn: '08:30 AM',
    penilaian: 88,
    tasks: [
      { nama: 'Setup Database Schema', durasi: '08:30 AM - 03:00 PM', progres: 80 },
      { nama: 'Testing Unit', durasi: '03:00 PM - 05:00 PM', progres: 55 },
    ],
  },
];

const navItems = [
  { label: 'Projet', icon: FolderKanban, active: true },
  { label: 'Absen', icon: ClipboardCheck, active: false },
];

export default function DashboardGuruPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
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
              <p className="text-sm font-semibold">Siti Aminah</p>
              <p className="text-xs text-emerald-400">Guru Pengawas</p>
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

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Guru Pengawas</h1>
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

        {/* Student Monitoring Grid */}
        <div>
          <h2 className="mb-1 font-semibold">Student Monitoring Grid</h2>
          <p className="mb-4 text-xs text-slate-500">
            Klik pada salah satu kartu untuk melihat detail laporan absensi dan kinerja.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-colors hover:border-emerald-500/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-400 to-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{student.nama}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${
                        student.status === 'Hadir'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{student.kehadiran}%</p>
                  <p className="text-[10px] text-slate-500">{student.checkIn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Detail Laporan */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Absensi Pelajar - Detail Laporan</h3>
                <p className="text-xs text-slate-500">
                  Siswa: {selectedStudent.nama} | Project: NicaAdmin Dark
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Circular Progress Indicator */}
            <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-800/40 p-4">
              <CircularProgress percent={selectedStudent.penilaian} />
              <div>
                <p className="text-sm font-medium">Status Penilaian</p>
                <p className="text-xs text-slate-500">
                  Pelajar {selectedStudent.nama} konsisten melakukan check-in tepat waktu dan
                  menyelesaikan tugas harian secara merata.
                </p>
              </div>
            </div>

            {/* Tabel Target Kerja */}
            <p className="mb-2 text-xs text-slate-500">TARGET KERJA</p>
            <div className="mb-4 space-y-2">
              <div className="grid grid-cols-3 text-[11px] text-slate-500">
                <span>Target Kerja</span>
                <span>Durasi Kehadiran</span>
                <span className="text-right">Progress</span>
              </div>
              {selectedStudent.tasks.map((task, i) => (
                <div key={i} className="grid grid-cols-3 items-center text-xs">
                  <span className="font-medium">{task.nama}</span>
                  <span className="text-slate-400">{task.durasi}</span>
                  <span className="text-right text-emerald-400">{task.progres}% Selesai</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                Tutup
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen kecil untuk lingkaran progress (SVG)
function CircularProgress({ percent }: { percent: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#34d399"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {percent}%
      </span>
    </div>
  );
}