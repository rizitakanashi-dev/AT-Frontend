import { useState } from 'react';
import useSWR from 'swr';
import { Download, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getMyAttendance, getRekapAbsensi, todayISO } from '../absensiService';
import { useProfile } from '../useWorkspace';
import { normalizeRole } from '@/lib/roles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { LoadingState, ErrorState } from '@/components/DataState';
import { Pagination, SearchInput } from '@/components/WorkspaceControls';
import { AttendanceTable } from '../components/AttendanceTable';

export default function RiwayatPage() {
  const user = useProfile();
  const personal = normalizeRole(user?.role || '') === 'Anggota';
  const [date, setDate] = useState(todayISO);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isValidating, mutate } = useSWR(user && date ? ['history', user.id, date, personal] : null, () => personal ? getMyAttendance(date) : getRekapAbsensi(date));
  const filtered = (data || []).filter((row) => [row.nama, row.project, row.target, row.divisi, row.status].join(' ').toLowerCase().includes(search.toLowerCase()));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));

  function exportCSV() {
    const escape = (value: unknown) => {
      let text = String(value ?? '');
      if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [['Tanggal', 'Nama', 'Divisi', 'Proyek', 'Target', 'Status', 'Masuk', 'Pulang'], ...filtered.map((row) => [row.tanggal, row.nama, row.divisi, row.project, row.target, row.status, row.jamMasuk, row.jamPulang])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-${date}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <DashboardLayout title={personal ? 'Riwayat kehadiran' : 'Rekap kehadiran'} subtitle={personal ? 'Tinjau kembali aktivitas dan target harianmu.' : 'Pantau catatan kehadiran semua anggota berdasarkan tanggal.'} actions={<Button variant="outline" onClick={exportCSV} disabled={!filtered.length || !!error || isLoading}><Download data-icon="inline-start" />Ekspor CSV</Button>}><div className="page-stack"><div className="flex flex-wrap items-end justify-between gap-4"><div className="w-52"><Field><FieldLabel htmlFor="attendance-date">Tanggal kehadiran</FieldLabel><Input id="attendance-date" type="date" value={date} max={todayISO()} onChange={(event) => { setDate(event.target.value); setPage(1); }} /></Field></div><div className="flex w-full items-center gap-3 sm:w-auto"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari nama, proyek, atau target..." /><Button variant="outline" size="icon" onClick={() => void mutate()} disabled={isValidating || !date} aria-label="Muat ulang rekap"><RefreshCw /></Button></div></div>{!date ? <p className="text-muted-foreground">Pilih tanggal untuk melihat kehadiran.</p> : error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading ? <LoadingState /> : <div className="table-surface"><AttendanceTable rows={filtered.slice((current - 1) * 10, current * 10)} personal={personal} /><Pagination page={current} total={filtered.length} onChange={setPage} /></div>}</div></DashboardLayout>;
}
