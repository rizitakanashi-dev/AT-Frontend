import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { ArrowUpRight, RefreshCw, Users, CheckCircle2, Clock3, FolderKanban } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetcher } from '@/lib/api';
import type { TargetDTO, UserDTO, AbsenRekapDTO } from '@/types/absensi';
import { getProjects, getRekapAbsensi, getProjectAnggota } from '../absensiService';
import { useProfile, useToday } from '../useWorkspace';
import { roleHomePath } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/DataState';
import { MemberDirectory } from './MemberDirectory';
import { cn } from '@/lib/utils';

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
        getProjectAnggota(),
      ]);
      const ownership = new Map(targets.map((target) => [target.id, target.idUser]));
      const recordsByUser = new Map<number, AbsenRekapDTO[]>();
      for (const row of attendance) {
        const owner = ownership.get(row.idTarget);
        if (owner !== undefined) {
          const records = recordsByUser.get(owner) || [];
          records.push(row);
          recordsByUser.set(owner, records);
        }
      }
      return { projects, roster, assignments, recordsByUser, attendance, targets };
    },
  );

  const present = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk)).length || 0;
  const active = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk && !row.jamPulang)).length || 0;
  // Divisions distribution calculation
  const divisions = new Map<string, number>();
  for (const user of data?.roster || []) {
    const name = user.divisi?.trim() || 'Belum ditentukan';
    divisions.set(name, (divisions.get(name) || 0) + 1);
  }
  const divisionList = [...divisions.entries()].sort((a, b) => b[1] - a[1]);
  // Recent attendance activity list
  const recentAttendance = [...(data?.attendance || [])].sort((a, b) => (b.jamPulang || b.jamMasuk || '').localeCompare(a.jamPulang || a.jamMasuk || '')).slice(0, 5);
  const metrics = [
    { label: 'Total anggota', value: data?.roster.length || 0, hint: 'Anggota terdaftar', icon: Users },
    { label: 'Hadir hari ini', value: present, hint: `${(data?.roster.length || 0) - present} belum absen masuk`, icon: CheckCircle2 },
    { label: 'Sedang bekerja', value: active, hint: 'Sudah masuk, belum pulang', icon: Clock3 },
    { label: 'Total proyek', value: data?.projects.length || 0, hint: 'Proyek terdaftar', icon: FolderKanban },
  ];

  return (
    <DashboardLayout title="Ringkasan workspace" subtitle={`Selamat datang, ${profile?.nama || 'pengelola'}. Berikut aktivitas tim Teaching Factory hari ini.`} actions={<Button variant="outline" size="sm" onClick={() => void mutate()} disabled={isValidating}><RefreshCw className={cn(isValidating && 'animate-spin')} data-icon="inline-start" />Muat ulang</Button>}>
      {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : (
        <div className="page-stack">
          {/* Top 4 Stats Metric Cards */}
          <section className="overview-metrics" aria-label="Ringkasan hari ini">
            {metrics.map(({ label, value, hint, icon: Icon }) => <article className="overview-metric" key={label}><div className="flex items-center justify-between gap-3"><h2 className="text-xs text-muted-foreground">{label}</h2><Icon className="metric-icon" /></div><div className="flex items-baseline gap-2"><strong>{value}</strong><span className="text-[10px] text-muted-foreground">{label === 'Total proyek' ? 'proyek' : 'orang'}</span></div><p className="text-[10px] text-muted-foreground">{hint}</p></article>)}
          </section>
          <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <MemberDirectory roster={data.roster} recordsByUser={data.recordsByUser} />
            <aside className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <section className="salesops-card" aria-labelledby="divisions-title">
                <div className="border-b p-5"><h2 id="divisions-title" className="section-heading">Komposisi tim</h2><p className="mt-1 text-xs text-muted-foreground">Anggota berdasarkan divisi</p></div>
                <ul className="flex flex-col p-2">
                  {divisionList.map(([name, count]) => <li key={name} className="flex items-center justify-between gap-3 px-3 py-3 text-xs"><span className="truncate">{name}</span><span className="shrink-0 tabular-nums text-muted-foreground">{count} anggota</span></li>)}
                  {!divisionList.length && <li className="px-3 py-5 text-xs text-muted-foreground">Belum ada data divisi.</li>}
                </ul>
                <div className="flex items-center justify-between border-t px-5 py-3 text-[11px] text-muted-foreground"><span>Total anggota</span><strong className="font-medium text-foreground">{data.roster.length}</strong></div>
              </section>
              {/* Recent Activity Feed */}
              <section className="salesops-card" aria-labelledby="activity-title">
                <div className="border-b p-5"><h2 id="activity-title" className="section-heading">Aktivitas tercatat</h2><p className="mt-1 text-xs text-muted-foreground">Pembaruan kehadiran hari ini</p></div>
                <ol className="flex flex-col gap-5 p-5">
                  {recentAttendance.map((row) => <li key={row.idAbsensi} className="flex gap-3"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-1"><p className="truncate text-xs font-medium">{row.nama}</p><time className="text-[10px] tabular-nums text-muted-foreground">{row.jamPulang || row.jamMasuk || '—'}</time></div><p className="mt-1 text-[11px] text-muted-foreground">{row.jamPulang ? 'Menyelesaikan sesi' : row.jamMasuk ? 'Memulai sesi' : 'Catatan kehadiran'}{row.project ? ` · ${row.project}` : ''}</p></div></li>)}
                  {!recentAttendance.length && <li className="py-4 text-xs text-muted-foreground">Belum ada kehadiran tercatat hari ini.</li>}
                </ol>
                <div className="border-t px-3 py-2"><Button variant="ghost" size="sm" asChild className="w-full justify-between"><Link to={`${home}/absensi`}>Buka rekap kehadiran<ArrowUpRight data-icon="inline-end" /></Link></Button></div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
