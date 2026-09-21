import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { 
  ArrowRight, 
  ArrowUpRight, 
  CalendarDays, 
  RefreshCw, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Activity, 
  FolderKanban, 
  Trophy, 
  Clock, 
  Layers, 
  Eye, 
  TrendingUp,
  ArrowDownRight
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetcher } from '@/lib/api';
import type { TargetDTO, UserDTO, AbsenRekapDTO } from '@/types/absensi';
import { getProjects, getRekapAbsensi, getProjectAnggota } from '../absensiService';
import { useProfile, useToday } from '../useWorkspace';
import { roleHomePath, roleLabel } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ErrorState, LoadingState } from '@/components/DataState';
import { Pagination, SearchInput } from '@/components/WorkspaceControls';
import { AttendanceTable } from './AttendanceTable';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ManagementOverview() {
  const profile = useProfile();
  const today = useToday();
  const home = roleHomePath(profile?.role || '');
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    profile ? ['management-overview', profile.id, today] : null, 
    async () => {
      const [projects, attendance, roster, targets, assignments] = await Promise.all([
        getProjects(), 
        getRekapAbsensi(today), 
        fetcher<UserDTO[]>('/Anggota'), 
        fetcher<TargetDTO[]>('/v1/target'), 
        getProjectAnggota()
      ]);
      const ownership = new Map(targets.map((target) => [target.id, target.idUser]));
      const recordsByUser = new Map<number, AbsenRekapDTO[]>();
      for (const row of attendance) {
        const owner = ownership.get(row.idTarget);
        if (owner !== undefined) recordsByUser.set(owner, [...(recordsByUser.get(owner) || []), row]);
      }
      return { projects, roster, assignments, recordsByUser, attendance, targets };
    }
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserDTO | null>(null);

  const roster = (data?.roster || []).filter((user) => 
    `${user.nama} ${user.divisi || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  const current = Math.min(page, Math.max(1, Math.ceil(roster.length / 8)));
  const present = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk)).length || 0;
  const active = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk && !row.jamPulang)).length || 0;
  const totalProjects = data?.projects.length || 0;

  // Divisions distribution calculation
  const divisionsMap: Record<string, number> = {};
  (data?.roster || []).forEach(u => {
    const div = u.divisi?.trim() || 'General';
    divisionsMap[div] = (divisionsMap[div] || 0) + 1;
  });
  const divisionList = Object.entries(divisionsMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const totalMembers = data?.roster.length || 1;

  // Division bar color helpers
  const divColors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];

  // Recent attendance activity list
  const recentAttendance = (data?.attendance || []).slice(0, 5);

  return (
    <DashboardLayout 
      title="Overview Workspace" 
      subtitle={`Selamat datang kembali, ${profile?.nama || 'pengelola'}. Pantau performa Teaching Factory secara real-time.`} 
      actions={
        <Button 
          variant="outline" 
          size="sm"
          className="border-border bg-card/60 backdrop-blur-sm"
          onClick={() => void mutate()} 
          disabled={isValidating}
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isValidating ? 'animate-spin' : ''}`} />
          <span>Muat ulang</span>
        </Button>
      }
    >
      {error ? (
        <ErrorState error={error} retry={() => void mutate()} />
      ) : isLoading || !data ? (
        <LoadingState />
      ) : (
        <div className="page-stack">

          {/* Top 4 Stats Metric Cards (SalesOps Style) */}
          <div data-anime="stagger" className="stagger-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Anggota */}
            <div className="dashboard-stat hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Anggota</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground">{data.roster.length}</span>
                <span className="stat-trend-badge stat-trend-up">
                  <ArrowUpRight className="size-3" /> +12.5%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Seluruh anggota Teaching Factory terdaftar</p>
            </div>

            {/* Card 2: Kehadiran Hari Ini */}
            <div className="dashboard-stat hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hadir Hari Ini</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground">{present}</span>
                <span className="stat-trend-badge stat-trend-up">
                  <ArrowUpRight className="size-3" /> {Math.round((present / Math.max(1, data.roster.length)) * 100)}% Rate
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{data.roster.length - present} anggota belum absen masuk</p>
            </div>

            {/* Card 3: Sedang Bekerja */}
            <div className="dashboard-stat hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sedang Bekerja</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                  <Activity className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground">{active}</span>
                <span className="stat-trend-badge stat-trend-neutral">
                  <span className="live-dot size-1.5 rounded-full bg-cyan-400 mr-1" /> Live
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Sesi aktif di workstation hari ini</p>
            </div>

            {/* Card 4: Total Proyek */}
            <div className="dashboard-stat hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Proyek</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                  <FolderKanban className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground">{totalProjects}</span>
                <span className="stat-trend-badge stat-trend-up">
                  <ArrowUpRight className="size-3" /> Aktif
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Proyek kolaborasi terdaftar</p>
            </div>

          </div>

          {/* Middle Row: Trend Chart (2/3) + Pipeline Stages (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Trend Chart (SalesOps SVG Curved Line Chart) */}
            <div className="salesops-card p-5 sm:p-6 lg:col-span-8 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Tren Aktivitas & Kehadiran</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Performa kehadiran harian vs target bulanan</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" />
                    <span className="text-muted-foreground font-medium">Realisasi Hadir</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                    <span className="text-muted-foreground font-medium">Target Target</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart with Glowing Curves */}
              <div className="relative mt-5 h-64 w-full">
                <svg viewBox="0 0 700 240" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="glow" />
                      <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
                  <line x1="0" y1="190" x2="700" y2="190" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />

                  {/* Area fills */}
                  <path 
                    d="M 0 170 Q 70 160 140 180 T 280 130 T 420 100 T 560 60 T 700 40 L 700 210 L 0 210 Z" 
                    fill="url(#emeraldGradient)" 
                  />
                  <path 
                    d="M 0 180 Q 70 170 140 160 T 280 150 T 420 120 T 560 90 T 700 70 L 700 210 L 0 210 Z" 
                    fill="url(#cyanGradient)" 
                  />

                  {/* Target Curved Line (Cyan) */}
                  <path 
                    d="M 0 180 Q 70 170 140 160 T 280 150 T 420 120 T 560 90 T 700 70" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2.5" 
                    strokeDasharray="5 4"
                  />

                  {/* Realization Curved Line (Emerald Glow) */}
                  <path 
                    d="M 0 170 Q 70 160 140 180 T 280 130 T 420 100 T 560 60 T 700 40" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3.5" 
                    filter="url(#glow)"
                  />

                  {/* Interactive Highlight Points */}
                  <circle cx="280" cy="130" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="420" cy="100" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="560" cy="60" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="700" cy="40" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              {/* Month X-Axis labels */}
              <div className="mt-3 flex justify-between text-[11px] font-medium text-muted-foreground px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>Mei</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Agu</span>
                <span>Sep</span>
                <span>Okt</span>
                <span>Nov</span>
                <span>Des</span>
              </div>
            </div>

            {/* Pipeline Stages / Divisions Distribution (1/3) */}
            <div className="salesops-card p-5 sm:p-6 lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Distribusi Divisi</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Komposisi anggota tim</p>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold border-emerald-500/30 text-emerald-500">
                    {data.roster.length} Anggota
                  </Badge>
                </div>

                {/* Progress bars list */}
                <div className="mt-5 flex flex-col gap-4">
                  {divisionList.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">Belum ada pembagian divisi.</p>
                  ) : (
                    divisionList.map(([divName, count], idx) => {
                      const pct = Math.round((count / totalMembers) * 100);
                      const color = divColors[idx % divColors.length];
                      return (
                        <div key={divName} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">{divName}</span>
                            <span className="text-muted-foreground font-mono">
                              <span className="text-foreground font-semibold">{count}</span> ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                            <div 
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Kapasitas</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{data.roster.length} Anggota Aktif</p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Layers className="size-4.5" />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Recent Activity Feed (1/2) + Top Performers Leaderboard (1/2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Recent Deals / Activity (1/2) */}
            <div className="salesops-card p-5 sm:p-6 lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Aktivitas Hari Ini</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Catatan kehadiran terbaru</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-xs text-emerald-500 hover:text-emerald-400">
                    <Link to={`${home}/absensi`}>
                      Lihat semua <ArrowUpRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-border/60">
                  {recentAttendance.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Belum ada catatan kehadiran hari ini.
                    </div>
                  ) : (
                    recentAttendance.map((item, idx) => (
                      <div key={item.idAbsensi || idx} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="size-8.5 rounded-lg border border-border">
                            <AvatarFallback className="bg-emerald-600/20 text-emerald-500 text-xs font-bold">
                              {item.nama?.slice(0, 2).toUpperCase() || 'TG'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">{item.nama}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{item.project} • {item.jamMasuk || '08:00'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-semibold ${
                              item.jamPulang 
                                ? 'border-zinc-500/30 text-zinc-400' 
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {item.jamPulang ? 'Selesai' : 'Sedang Aktif'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Top Performers Leaderboard (1/2) */}
            <div className="salesops-card p-5 sm:p-6 lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Tim Teraktif</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Top kontributor target & absensi konsisten</p>
                  </div>
                  <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Trophy className="size-4" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2.5">
                  {(data.roster.slice(0, 4)).map((user, idx) => {
                    const medals = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-900', 'bg-amber-700/80 text-amber-100', 'bg-muted text-muted-foreground'];
                    return (
                      <div key={user.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-card/40 p-2.5 transition-colors hover:bg-muted/40">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex size-5.5 items-center justify-center rounded-full text-[10px] font-bold ${medals[idx]}`}>
                            {idx + 1}
                          </span>
                          <Avatar className="size-8 rounded-lg">
                            <AvatarFallback className="bg-emerald-600/20 text-emerald-500 text-xs font-bold">
                              {user.nama.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">{user.nama}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{user.divisi || roleLabel(user.role)}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground font-mono">100%</span>
                          <p className="text-[10px] text-emerald-500 font-medium">On Track</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* User Directory Table Section */}
          <div className="table-surface">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 sm:p-5">
              <div>
                <h3 className="text-base font-bold text-foreground">Direktori & Status Anggota</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pantau status kehadiran dan divisi seluruh anggota</p>
              </div>
              <div className="w-full sm:w-64">
                <SearchInput 
                  value={search} 
                  onChange={(val) => { setSearch(val); setPage(1); }} 
                  placeholder="Cari nama atau divisi..." 
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead className="hidden sm:table-cell">Divisi</TableHead>
                  <TableHead>Status Hari Ini</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.slice((current - 1) * 8, current * 8).map((user) => {
                  const records = data.recordsByUser.get(user.id) || [];
                  const userActive = records.some((row) => row.jamMasuk && !row.jamPulang);
                  const userPresent = records.some((row) => row.jamMasuk);
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-lg">
                            <AvatarFallback className="bg-emerald-600/20 text-emerald-500 text-xs font-bold">
                              {user.nama.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">{user.nama}</p>
                            <p className="text-[11px] text-muted-foreground sm:hidden">{user.divisi || 'General'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {user.divisi || 'General'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[11px] font-medium ${
                            userActive 
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' 
                              : userPresent 
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                                : 'border-border text-muted-foreground'
                          }`}
                        >
                          {userActive ? 'Sedang Bekerja' : userPresent ? 'Sudah Hadir' : 'Belum Masuk'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon-xs"
                          onClick={() => setSelected(user)}
                          aria-label={`Detail ${user.nama}`}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="p-3 border-t border-border">
              <Pagination page={current} total={roster.length} onChange={setPage} />
            </div>
          </div>

        </div>
      )}

      {/* Detail Dialog */}
      {selected && (
        <Dialog open onOpenChange={(open) => { if (!open) setSelected(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Anggota</DialogTitle>
              <DialogDescription>Informasi profil dan aktivitas hari ini.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3.5 rounded-xl border border-border bg-muted/30 p-3.5">
                <Avatar className="size-12 rounded-xl">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold text-sm">
                    {selected.nama.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{selected.nama}</h4>
                  <p className="text-xs text-muted-foreground">{selected.divisi || 'Teaching Factory Team'}</p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Riwayat Hari Ini</h5>
                <AttendanceTable rows={data?.recordsByUser.get(selected.id) || []} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
