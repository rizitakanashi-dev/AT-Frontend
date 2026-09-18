import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { fetcher } from '@/lib/api';
import type { TargetDTO, StatusDTO, ProjectDTO } from '@/types/absensi';
import { deleteTarget } from '../absensiService';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import { normalizeRole } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ErrorState, EmptyState, LoadingState } from '@/components/DataState';
import { ConfirmDelete, Pagination, SearchInput, SelectField } from '@/components/WorkspaceControls';
import { TargetEditor } from '../components/TargetEditor';

export default function TargetsPage() {
  const profile = useProfile();
  const role = normalizeRole(profile?.role || '');
  const personal = role === 'Anggota';
  const refresh = useRefreshWorkspace();
  const [project, setProject] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<TargetDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<TargetDTO | null>(null);
  const { data, error, isLoading, mutate } = useSWR(profile ? ['targets-workspace', profile.id, personal] : null, async () => {
    const [targets, projects, statuses] = await Promise.all([fetcher<TargetDTO[]>(personal ? '/v1/target/my' : '/v1/target'), fetcher<ProjectDTO[]>('/v1/project'), fetcher<StatusDTO[]>('/v1/status')]);
    return { targets, projects, statuses };
  });
  const filtered = (data?.targets || []).filter((target) => (project === 'all' || target.idProject === Number(project)) && (status === 'all' || target.idStatus === Number(status)) && `${target.target} ${target.userName} ${target.projectName}`.toLowerCase().includes(search.toLowerCase()));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  return <DashboardLayout title="Target kerja" subtitle={personal ? 'Kelola target dan perbarui progres pekerjaanmu.' : 'Tetapkan target dan pantau progres pekerjaan tim.'} actions={!personal && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Tambah target</Button>}><div className="page-stack"><div className="flex flex-wrap items-end gap-4"><div className="w-full sm:w-52"><SelectField label="Proyek" value={project} onChange={(value) => { setProject(value); setPage(1); }} options={[{ value: 'all', label: 'Semua proyek' }, ...(data?.projects || []).map((item) => ({ value: String(item.id), label: item.nama }))]} /></div><div className="w-full sm:w-48"><SelectField label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: 'all', label: 'Semua status' }, ...(data?.statuses || []).map((item) => ({ value: String(item.id), label: item.nama }))]} /></div><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari target atau nama..." /></div>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading ? <LoadingState /> : <div className="table-surface">{!filtered.length ? <EmptyState title="Belum ada target yang sesuai" description={personal ? 'Target dibuat saat absen masuk atau diberikan oleh pengelola.' : 'Buat target baru atau ubah filter pencarian.'} /> : <Table><TableHeader><TableRow><TableHead>Target kerja</TableHead>{!personal && <TableHead>Penanggung jawab</TableHead>}<TableHead>Status</TableHead><TableHead><span className="sr-only">Tindakan</span></TableHead></TableRow></TableHeader><TableBody>{filtered.slice((current - 1) * 10, current * 10).map((target) => <TableRow key={target.id}><TableCell><p className="max-w-lg whitespace-normal font-medium">{target.target}</p><p className="text-sm text-muted-foreground">{target.projectName}</p></TableCell>{!personal && <TableCell>{target.userName}</TableCell>}<TableCell><Badge variant="secondary">{target.statusName || 'Belum ditentukan'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setEditor(target)} aria-label={`Edit target ${target.target}`}><Pencil /></Button>{role === 'Admin' && <Button variant="ghost" size="icon" onClick={() => setDeleting(target)} aria-label={`Hapus target ${target.target}`}><Trash2 /></Button>}</div></TableCell></TableRow>)}</TableBody></Table>}<Pagination page={current} total={filtered.length} onChange={setPage} /></div>}</div>{editor && <TargetEditor target={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}{deleting && <ConfirmDelete title="Hapus target kerja?" description="Target ini akan dihapus permanen. Target yang terhubung dengan absensi dapat ditolak oleh backend." onClose={() => setDeleting(null)} onConfirm={async () => { await deleteTarget(deleting.id); toast.success('Target dihapus.'); await refresh(); }} />}</DashboardLayout>;
}
