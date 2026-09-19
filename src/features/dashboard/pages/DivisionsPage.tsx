import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import api, { fetcher } from '@/lib/api';
import type { StatusDTO } from '@/types/absensi';
import { useRefreshWorkspace } from '../useWorkspace';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ErrorState, EmptyState, LoadingState } from '@/components/DataState';
import { ConfirmDelete, SearchInput } from '@/components/WorkspaceControls';
import { NameDialog } from '@/components/NameDialog';

export default function DivisionsPage() {
  const [tab, setTab] = useState('divisi');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<StatusDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<StatusDTO | null>(null);
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, mutate } = useSWR<StatusDTO[]>(`/v1/${tab}`, fetcher);
  const rows = (data || []).filter((item) => item.nama.toLowerCase().includes(search.toLowerCase()));
  return <DashboardLayout title="Divisi & referensi" subtitle="Atur divisi dan lihat referensi peran serta status dari backend." actions={tab === 'divisi' && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Tambah divisi</Button>}><Tabs value={tab} onValueChange={(value) => { setTab(value); setSearch(''); }} className="gap-6"><TabsList><TabsTrigger value="divisi">Divisi</TabsTrigger><TabsTrigger value="role">Peran</TabsTrigger><TabsTrigger value="status">Status target</TabsTrigger></TabsList>{['divisi', 'role', 'status'].map((value) => <TabsContent key={value} value={value}><div className="page-stack"><SearchInput value={search} onChange={setSearch} placeholder="Cari nama..." />{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading ? <LoadingState /> : <div className="table-surface">{!rows.length ? <EmptyState title="Belum ada data yang sesuai" /> : <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nama</TableHead><TableHead><span className="sr-only">Tindakan</span></TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell><span className="font-medium">{item.nama}</span></TableCell><TableCell>{tab === 'divisi' ? <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setEditor(item)} aria-label={`Edit ${item.nama}`}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(item)} aria-label={`Hapus ${item.nama}`}><Trash2 /></Button></div> : <span className="text-muted-foreground">Hanya lihat</span>}</TableCell></TableRow>)}</TableBody></Table>}</div>}{tab !== 'divisi' && <p className="text-sm text-muted-foreground">Referensi ini dikelola oleh backend dan tidak dapat diubah dari frontend.</p>}</div></TabsContent>)}</Tabs>{editor && <NameDialog title={editor === 'new' ? 'Tambah divisi' : 'Edit divisi'} label="Nama divisi" initial={editor === 'new' ? '' : editor.nama} onClose={() => setEditor(null)} onSave={async (nama) => { if (editor === 'new') await api.post('/v1/divisi', { nama }); else await api.put(`/v1/divisi/${editor.id}`, { id: editor.id, nama }); toast.success('Divisi disimpan.'); await refresh(); }} />}{deleting && <ConfirmDelete title="Hapus divisi?" description={`Divisi “${deleting.nama}” akan dihapus. Penghapusan dapat ditolak jika masih digunakan oleh akun pengguna.`} onClose={() => setDeleting(null)} onConfirm={async () => { await api.delete(`/v1/divisi/${deleting.id}`); toast.success('Divisi dihapus.'); await refresh(); }} />}</DashboardLayout>;
}
