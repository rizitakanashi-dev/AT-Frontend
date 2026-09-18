import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetcher } from '@/lib/api';
import type { TargetDTO, UserDTO, AbsenRekapDTO } from '@/types/absensi';
import { getProjects, getRekapAbsensi, getProjectAnggota } from '../absensiService';
import { useProfile, useToday } from '../useWorkspace';
import { roleHomePath } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ErrorState, EmptyState, LoadingState } from '@/components/DataState';
import { Pagination, SearchInput } from '@/components/WorkspaceControls';
import { AttendanceTable } from './AttendanceTable';

export default function ManagementOverview() {
  const profile = useProfile();
  const today = useToday();
  const home = roleHomePath(profile?.role || '');
  const { data, error, isLoading, isValidating, mutate } = useSWR(profile ? ['management-overview', profile.id, today] : null, async () => {
    const [projects, attendance, roster, targets, assignments] = await Promise.all([getProjects(), getRekapAbsensi(today), fetcher<UserDTO[]>('/Anggota'), fetcher<TargetDTO[]>('/v1/target'), getProjectAnggota()]);
    const ownership = new Map(targets.map((target) => [target.id, target.idUser]));
    const recordsByUser = new Map<number, AbsenRekapDTO[]>();
    for (const row of attendance) {
      const owner = ownership.get(row.idTarget);
      if (owner !== undefined) recordsByUser.set(owner, [...(recordsByUser.get(owner) || []), row]);
    }
    return { projects, roster, assignments, recordsByUser };
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserDTO | null>(null);
  const roster = (data?.roster || []).filter((user) => `${user.nama} ${user.divisi}`.toLowerCase().includes(search.toLowerCase()));
  const current = Math.min(page, Math.max(1, Math.ceil(roster.length / 8)));
  const present = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk)).length || 0;
  const active = data?.roster.filter((user) => data.recordsByUser.get(user.id)?.some((row) => row.jamMasuk && !row.jamPulang)).length || 0;
  return <DashboardLayout title="Ringkasan workspace" subtitle={`Selamat datang, ${profile?.nama || 'pengelola'}. Berikut aktivitas Teaching Factory hari ini.`} actions={<Button variant="outline" onClick={() => void mutate()} disabled={isValidating}><RefreshCw data-icon="inline-start" />Muat ulang</Button>}>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : <div className="page-stack"><div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[{ label: 'Anggota terdaftar', value: data.roster.length, hint: 'Seluruh anggota Teaching Factory' }, { label: 'Hadir hari ini', value: present, hint: `${data.roster.length - present} anggota belum absen` }, { label: 'Sedang bekerja', value: active, hint: 'Sudah masuk, belum pulang' }, { label: 'Total proyek', value: data.projects.length, hint: 'Proyek yang terdaftar' }].map((stat) => <Card key={stat.label}><CardHeader><CardDescription>{stat.label}</CardDescription></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</p><p className="mt-2 text-sm text-muted-foreground">{stat.hint}</p></CardContent></Card>)}</div><section className="table-surface"><div className="flex flex-wrap items-center justify-between gap-4 border-b p-5"><div><h2 className="section-heading">Kehadiran anggota</h2><p className="text-sm text-muted-foreground">Ringkasan berdasarkan catatan hari ini, bukan status target.</p></div><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari anggota..." /></div>{!roster.length ? <EmptyState title="Belum ada anggota yang sesuai" description="Tambahkan anggota atau ubah pencarian untuk mulai memantau." /> : <Table><TableHeader><TableRow><TableHead>Anggota</TableHead><TableHead>Proyek</TableHead><TableHead>Kehadiran</TableHead><TableHead>Aktivitas</TableHead></TableRow></TableHeader><TableBody>{roster.slice((current - 1) * 8, current * 8).map((user) => { const logs = data.recordsByUser.get(user.id) || []; const ongoing = logs.some((row) => row.jamMasuk && !row.jamPulang); const projects = [...new Set(data.assignments.filter((item) => item.idUser === user.id).map((item) => item.project))]; return <TableRow key={user.id}><TableCell><p className="font-medium">{user.nama}</p><p className="text-sm text-muted-foreground">{user.divisi || 'Tanpa divisi'}</p></TableCell><TableCell><p className="max-w-xs whitespace-normal text-muted-foreground">{projects.join(', ') || 'Belum ditugaskan'}</p></TableCell><TableCell><Badge variant={ongoing ? 'default' : 'secondary'}>{ongoing ? 'Sedang bekerja' : logs.length ? 'Sudah pulang' : 'Belum absen'}</Badge></TableCell><TableCell><Button variant="ghost" onClick={() => setSelected(user)}>Lihat aktivitas<ArrowUpRight data-icon="inline-end" /></Button></TableCell></TableRow>; })}</TableBody></Table>}<Pagination page={current} total={roster.length} pageSize={8} onChange={setPage} /></section><div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Butuh catatan tanggal lain? Buka rekap kehadiran.</p><Button variant="outline" asChild><Link to={`${home}/absensi`}>Buka rekap<ArrowUpRight data-icon="inline-end" /></Link></Button></div></div>}{selected && <Dialog open onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Aktivitas {selected.nama}</DialogTitle><DialogDescription>Catatan kehadiran pada {today}.</DialogDescription></DialogHeader><AttendanceTable rows={data?.recordsByUser.get(selected.id) || []} personal /></DialogContent></Dialog>}</DashboardLayout>;
}
