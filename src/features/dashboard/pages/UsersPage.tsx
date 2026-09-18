import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Pencil, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import api, { fetcher } from '@/lib/api';
import { getUsers } from '../absensiService';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import type { UserDTO } from '@/types/absensi';
import { normalizeRole, roleLabel } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorState, EmptyState, LoadingState } from '@/components/DataState';
import { ConfirmDelete, Pagination, SearchInput } from '@/components/WorkspaceControls';
import { UserEditor } from '../components/UserEditor';

export default function UsersPage() {
  const profile = useProfile();
  const admin = normalizeRole(profile?.role || '') === 'Admin';
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, mutate } = useSWR(profile ? ['users-workspace', profile.id, admin] : null, () => admin ? getUsers() : fetcher<UserDTO[]>('/Anggota'));
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<UserDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<UserDTO | null>(null);
  const filtered = (data || []).filter((user) => (role === 'all' || user.role === role) && `${user.nama} ${user.divisi || ''}`.toLowerCase().includes(search.toLowerCase()));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  return <DashboardLayout title={admin ? 'Pengguna' : 'Anggota'} subtitle={admin ? 'Kelola akses dan data anggota Teaching Factory.' : 'Daftar anggota dan divisi yang terdaftar.'} actions={admin && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Tambah pengguna</Button>}><div className="page-stack"><div className="flex flex-wrap items-center justify-between gap-4">{admin && <Tabs value={role} onValueChange={(value) => { setRole(value); setPage(1); }}><TabsList><TabsTrigger value="all">Semua</TabsTrigger><TabsTrigger value="Anggota">Anggota</TabsTrigger><TabsTrigger value="Guru">Guru</TabsTrigger><TabsTrigger value="PM">PM</TabsTrigger></TabsList></Tabs>}<SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari nama atau divisi..." /></div>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading ? <LoadingState /> : <div className="table-surface">{!filtered.length ? <EmptyState title="Pengguna tidak ditemukan" description="Tambahkan pengguna atau coba kata pencarian lain." /> : <Table><TableHeader><TableRow><TableHead>Nama pengguna</TableHead><TableHead>Peran</TableHead><TableHead>Divisi</TableHead>{admin && <TableHead><span className="sr-only">Tindakan</span></TableHead>}</TableRow></TableHeader><TableBody>{filtered.slice((current - 1) * 10, current * 10).map((user) => <TableRow key={user.id}><TableCell><span className="font-medium">{user.nama}</span></TableCell><TableCell><Badge variant="secondary">{roleLabel(user.role)}</Badge></TableCell><TableCell>{user.divisi || 'Tanpa divisi'}</TableCell>{admin && <TableCell>{user.role === 'Guru' ? <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setEditor(user)} aria-label={`Edit ${user.nama}`}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => setDeleting(user)} aria-label={`Hapus ${user.nama}`}><Trash2 /></Button></div> : <span className="text-sm text-muted-foreground">Hanya lihat</span>}</TableCell>}</TableRow>)}</TableBody></Table>}<Pagination page={current} total={filtered.length} onChange={setPage} /></div>}{admin && <p className="flex items-start gap-2 text-sm text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" />Edit dan hapus hanya tersedia untuk guru. Backend belum menyediakan tindakan tersebut untuk anggota dan PM.</p>}</div>{editor && <UserEditor user={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}{deleting && <ConfirmDelete title="Hapus akun guru?" description={`Akun “${deleting.nama}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`} onClose={() => setDeleting(null)} onConfirm={async () => { await api.delete(`/v1/guru/${deleting.id}`); toast.success('Akun guru dihapus.'); await refresh(); }} />}</DashboardLayout>;
}
