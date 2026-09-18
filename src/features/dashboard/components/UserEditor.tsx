import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import api, { fetcher, errorMessage } from '@/lib/api';
import type { StatusDTO, UserDTO } from '@/types/absensi';
import { createUser } from '../absensiService';
import { useRefreshWorkspace } from '../useWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SelectField } from '@/components/WorkspaceControls';
import { ErrorState, LoadingState } from '@/components/DataState';

export function UserEditor({ user, onClose }: { user?: UserDTO; onClose: () => void }) {
  const { data, error, isLoading, mutate } = useSWR('user-form-options', async () => {
    const [divisions, roles] = await Promise.all([fetcher<StatusDTO[]>('/v1/divisi'), fetcher<StatusDTO[]>('/v1/role')]);
    return { divisions, roles };
  });
  const refresh = useRefreshWorkspace();
  const [name, setName] = useState(user?.nama || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user ? 'Guru' : 'Anggota');
  const [division, setDivision] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');
  const previousDivision = data?.divisions.filter((item) => item.nama === user?.divisi);
  const selectedDivision = division ?? (previousDivision?.length === 1 ? String(previousDivision[0].id) : 'none');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !data || !name.trim()) return;
    const selectedRole = data.roles.find((item) => item.nama === role);
    if (!selectedRole) { setFormError('Peran belum tersedia di backend.'); return; }
    setPending(true);
    setFormError('');
    const payload = { nama: name.trim(), password, id_role: selectedRole.id, id_divisi: selectedDivision === 'none' ? 0 : Number(selectedDivision) };
    try {
      if (user) await api.put(`/v1/guru/${user.id}`, { ...payload, password: '' });
      else await createUser(role, payload);
      toast.success(user ? 'Data guru diperbarui.' : 'Pengguna berhasil ditambahkan.');
      await refresh();
      onClose();
    } catch (err) { setFormError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{user ? 'Edit data guru' : 'Tambah pengguna'}</DialogTitle><DialogDescription>{user ? 'Perbarui nama dan divisi. Endpoint ini tidak mengubah kata sandi.' : 'Buat akun untuk anggota, guru, atau project manager.'}</DialogDescription></DialogHeader>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : <form onSubmit={submit} className="flex flex-col gap-5"><FieldGroup><Field><FieldLabel htmlFor="user-name">Nama pengguna</FieldLabel><Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" maxLength={100} required disabled={pending} /></Field>{!user && <><SelectField label="Peran" value={role} onChange={setRole} options={data.roles.filter((item) => ['Anggota', 'Guru', 'PM'].includes(item.nama)).map((item) => ({ value: item.nama, label: item.nama === 'PM' ? 'Project Manager' : item.nama }))} disabled={pending} /><Field><FieldLabel htmlFor="new-password">Kata sandi awal</FieldLabel><Input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} placeholder="Minimal 8 karakter" /></Field></>}<SelectField label="Divisi" value={selectedDivision} onChange={setDivision} options={[{ value: 'none', label: 'Tanpa divisi' }, ...data.divisions.map((item) => ({ value: String(item.id), label: item.nama }))]} disabled={pending} /></FieldGroup>{formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}<DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={pending}>Batal</Button><Button type="submit" disabled={pending || !name.trim() || (!user && password.length < 8)}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menyimpan...' : 'Simpan pengguna'}</Button></DialogFooter></form>}</DialogContent></Dialog>;
}
