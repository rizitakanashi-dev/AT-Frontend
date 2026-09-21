import { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useProfile } from '../useWorkspace';
import { normalizeRole } from '@/lib/roles';
import { getHostingWorkspace } from '../hostingService';
import { HostingOverview } from '../components/HostingOverview';
import type { HostingRequestDTO, HostingStatusValue } from '@/types/hosting';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ErrorState, EmptyState, LoadingState } from '@/components/DataState';
import { SearchInput, Pagination } from '@/components/WorkspaceControls';
import { HostingStatusBadge } from '../components/HostingStatusBadge';
import { HostingRequestEditor } from '../components/HostingRequestEditor';
import { HostingDetailDialog } from '../components/HostingDetailDialog';

type TabDef = { value: string; label: string; statuses?: HostingStatusValue[] };

const TAB_CONFIG: Record<string, TabDef[]> = {
  Anggota: [{ value: 'all', label: 'Semua milik saya' }, { value: 'pending', label: 'Menunggu', statuses: ['pending'] }, { value: 'active', label: 'Berjalan', statuses: ['approved', 'in_progress'] }, { value: 'completed', label: 'Selesai', statuses: ['completed'] }, { value: 'rejected', label: 'Ditolak', statuses: ['rejected'] }, { value: 'cancelled', label: 'Dibatalkan', statuses: ['cancelled'] }],
  PM: [{ value: 'pending', label: 'Menunggu review', statuses: ['pending'] }, { value: 'all', label: 'Semua riwayat' }],
  DevOps: [{ value: 'approved', label: 'Siap diproses', statuses: ['approved'] }, { value: 'in_progress', label: 'Sedang diproses', statuses: ['in_progress'] }, { value: 'completed', label: 'Selesai', statuses: ['completed'] }, { value: 'all', label: 'Semua disetujui' }],
  Admin: [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu', statuses: ['pending'] },
    { value: 'approved', label: 'Disetujui', statuses: ['approved'] },
    { value: 'in_progress', label: 'Diproses', statuses: ['in_progress'] },
    { value: 'completed', label: 'Selesai', statuses: ['completed'] },
    { value: 'rejected', label: 'Ditolak', statuses: ['rejected'] },
    { value: 'cancelled', label: 'Dibatalkan', statuses: ['cancelled'] },
  ],
};

const TITLE_BY_ROLE: Record<string, string> = { Anggota: 'Hosting saya', PM: 'Review hosting', DevOps: 'Project disetujui', Admin: 'Hosting' };
const SUBTITLE_BY_ROLE: Record<string, string> = {
  Anggota: 'Ajukan hosting untuk proyekmu dan pantau statusnya.',
  PM: 'Tinjau permintaan hosting dari anggota sebelum diteruskan ke DevOps.',
  DevOps: 'Lihat project yang sudah disetujui PM dan lanjutkan proses hosting.',
  Admin: 'Pantau seluruh permintaan hosting dari pengajuan hingga selesai.',
};

export default function HostingPage() {
  const profile = useProfile();
  const role = normalizeRole(profile?.role || '');
  const member = role === 'Anggota';
  const tabs = TAB_CONFIG[role] || [];
  const [tab, setTab] = useState(tabs[0]?.value || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<HostingRequestDTO | 'new' | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { data, error, isLoading, isValidating, mutate } = useSWR(profile ? ['hosting-workspace', profile.id, role] : null, () => getHostingWorkspace(role));
  const activeTab = tabs.find((item) => item.value === tab);
  const scoped = (data || []).filter((row) => !activeTab?.statuses || activeTab.statuses.includes(row.status));
  const filtered = scoped.filter((row) => `${row.projectName} ${row.userName} ${row.contactName}`.toLowerCase().includes(search.toLowerCase()));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));

  const [resubmitting, setResubmitting] = useState(false);

  return <DashboardLayout title={TITLE_BY_ROLE[role] || 'Hosting'} subtitle={SUBTITLE_BY_ROLE[role] || ''} actions={<div className="flex items-center gap-2">{member && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Ajukan hosting</Button>}<Button variant="outline" size="icon" onClick={() => void mutate()} disabled={isValidating} aria-label="Muat ulang"><RefreshCw className={isValidating ? 'animate-spin' : ''} /></Button></div>}>
    {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : <div className="page-stack">
      <HostingOverview requests={data} role={role} />
      <Tabs value={tab} onValueChange={(value) => { setTab(value); setPage(1); }} className="min-w-0 gap-5">
        <div className="min-w-0 overflow-x-auto pb-1"><TabsList variant="line" aria-label="Filter status hosting">{tabs.map((item) => <TabsTrigger key={item.value} value={item.value}>{item.label}<span className="tabular-nums">{data.filter((row) => !item.statuses || item.statuses.includes(row.status)).length}</span></TabsTrigger>)}</TabsList></div>
        <TabsContent value={tab} className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari proyek atau nama..." /><p className="text-sm text-muted-foreground" role="status">{filtered.length} permintaan</p></div>
      <div className="table-surface hosting-table">{!filtered.length ? <EmptyState title={member ? 'Belum ada permintaan hosting' : 'Tidak ada data yang sesuai'} description={member ? 'Ajukan hosting untuk proyekmu yang sudah siap dirilis.' : 'Coba ubah tab atau kata pencarian.'} /> : <Table>
        <TableHeader><TableRow>{!member && <TableHead>Pemohon</TableHead>}<TableHead>Proyek</TableHead><TableHead>Status</TableHead><TableHead>Penanggung jawab</TableHead><TableHead>Diajukan</TableHead><TableHead><span className="sr-only">Tindakan</span></TableHead></TableRow></TableHeader>
        <TableBody>{filtered.slice((current - 1) * 10, current * 10).map((row) => <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelected(row.id)}>
          {!member && <TableCell><span className="font-medium">{row.userName}</span></TableCell>}
          <TableCell><p className="font-medium">{row.projectName}</p><p className="text-sm text-muted-foreground">{row.contactName}</p></TableCell>
          <TableCell><HostingStatusBadge status={row.status} /></TableCell>
          <TableCell className="text-sm text-muted-foreground">{row.devOpsHandlerName || row.pmReviewerName || '—'}</TableCell>
          <TableCell className="text-sm text-muted-foreground">{new Date(row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
          <TableCell><Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); setSelected(row.id); }}>Lihat detail</Button></TableCell>
        </TableRow>)}</TableBody>
      </Table>}<Pagination page={current} total={filtered.length} onChange={setPage} /></div>
        </TabsContent>
      </Tabs>
    </div>}

    {editor && <HostingRequestEditor request={editor === 'new' ? undefined : editor} resubmit={resubmitting} onClose={() => { setEditor(null); setResubmitting(false); }} />}
    {selected !== null && <HostingDetailDialog key={selected} id={selected} onClose={() => setSelected(null)} onEdit={(request) => { setSelected(null); setResubmitting(false); setEditor(request); }} onResubmit={(request) => { setSelected(null); setResubmitting(true); setEditor(request); }} />}
  </DashboardLayout>;
}
