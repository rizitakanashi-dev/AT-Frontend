import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { UserPlus, Trash2, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher, errorMessage } from '@/lib/api';
import type { ProjectDTO, ProjectAnggotaDTO, UserDTO } from '@/types/absensi';
import { addProjectMember, removeProjectMember } from '../absensiService';
import { useRefreshWorkspace } from '../useWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { SelectField, ConfirmDelete } from '@/components/WorkspaceControls';
import { LoadingState, ErrorState, EmptyState } from '@/components/DataState';

export function ProjectMembers({ project, canManage, onClose }: { project: ProjectDTO; canManage: boolean; onClose: () => void }) {
  const members = useSWR<ProjectAnggotaDTO[]>('/v1/project-anggota', fetcher);
  const roster = useSWR<UserDTO[]>(canManage ? '/v1/anggota' : null, fetcher);
  const refresh = useRefreshWorkspace();
  const [userId, setUserId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<ProjectAnggotaDTO | null>(null);
  const assigned = (members.data || []).filter((item) => item.idProject === project.id);
  const options = (roster.data || []).filter((user) => !assigned.some((member) => member.idUser === user.id));
  async function add(event: FormEvent) {
    event.preventDefault();
    if (pending || !options.some((user) => user.id === Number(userId))) return;
    setPending(true);
    setError('');
    try { await addProjectMember(Number(userId), project.id); setUserId(''); toast.success('Anggota ditambahkan ke proyek.'); await refresh(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <><Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{project.nama}</DialogTitle><DialogDescription>Anggota dan kolaborasi dalam proyek.</DialogDescription></DialogHeader>{members.error ? <ErrorState error={members.error} retry={() => void members.mutate()} /> : members.isLoading ? <LoadingState /> : <><div className="max-h-64 overflow-y-auto">{assigned.length ? <ul className="flex flex-col gap-2">{assigned.map((item) => <li key={item.id} className="flex items-center gap-3 rounded-lg border p-3"><Avatar><AvatarFallback>{item.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="min-w-0 flex-1 break-words font-medium">{item.username}</span>{canManage && <Button size="icon" variant="ghost" onClick={() => setRemoving(item)} disabled={pending} aria-label={`Keluarkan ${item.username}`}><Trash2 /></Button>}</li>)}</ul> : <EmptyState title="Belum ada anggota" description="Tambahkan anggota untuk mulai berkolaborasi." />}</div>{canManage && <><Separator />{roster.error ? <ErrorState error={roster.error} retry={() => void roster.mutate()} /> : <form onSubmit={add} className="flex flex-col gap-4"><FieldGroup><SelectField label="Tambahkan anggota" value={userId} onChange={setUserId} options={options.map((user) => ({ value: String(user.id), label: user.nama }))} placeholder={roster.isLoading ? 'Memuat anggota...' : options.length ? 'Pilih anggota' : 'Tidak ada anggota tersedia'} disabled={pending || roster.isLoading || !options.length} /></FieldGroup>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button type="submit" disabled={pending || !userId}>{pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <UserPlus data-icon="inline-start" />}Tambahkan ke proyek</Button></form>}</>}</>}</DialogContent></Dialog>{removing && <ConfirmDelete title="Keluarkan anggota?" description={`${removing.username} akan dikeluarkan dari proyek ${project.nama}. Akun pengguna tidak dihapus.`} onClose={() => setRemoving(null)} onConfirm={async () => { await removeProjectMember(removing.id); toast.success('Anggota dikeluarkan dari proyek.'); await refresh(); }} />}</>;
}
