import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher, errorMessage } from '@/lib/api';
import type { StatusDTO, UserDTO } from '@/types/absensi';
import { canManageUser, createUser, updateUser } from '../absensiService';
import { useRefreshWorkspace } from '../useWorkspace';
import { normalizeRole, roleLabel } from '@/lib/roles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
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
  const [role, setRole] = useState(user?.role || 'Anggota');
  const [division, setDivision] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');
  const previousDivision = data?.divisions.filter((item) => item.nama === user?.divisi);
  const divisionNeedsSelection = Boolean(user?.divisi && previousDivision?.length !== 1 && division === null);
  const selectedDivision = division ?? (previousDivision?.length === 1 ? String(previousDivision[0].id) : 'none');
  const roleOptions = data?.roles
    .map((item) => ({ value: normalizeRole(item.nama), label: roleLabel(item.nama) }))
    .filter((item, index, options) => options.findIndex((option) => option.value === item.value) === index) || [];
  const hasDevOpsRole = roleOptions.some((item) => item.value === 'DevOps');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !data || !name.trim() || divisionNeedsSelection) return;
    if (user && !canManageUser(user.role)) {
      setFormError('Perubahan untuk peran ini belum didukung backend.');
      return;
    }
    const selectedRole = data.roles.find((item) => normalizeRole(item.nama) === normalizeRole(role));
    if (!selectedRole) { setFormError('Peran belum tersedia di backend.'); return; }
    setPending(true);
    setFormError('');
    const payload = { nama: name.trim(), password, id_role: selectedRole.id, id_divisi: selectedDivision === 'none' ? 0 : Number(selectedDivision) };
    try {
      if (user) await updateUser(user, { ...payload, id_role: selectedRole.id });
      else await createUser(role, payload);
      toast.success(user ? 'Data pengguna diperbarui.' : 'Pengguna berhasil ditambahkan.');
      await refresh();
      onClose();
    } catch (err) { setFormError(errorMessage(err)); }
    finally { setPending(false); }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit pengguna' : 'Tambah pengguna'}</DialogTitle>
          <DialogDescription>{user ? `Perbarui profil ${user.nama}, termasuk role, divisi, atau password bila diperlukan.` : 'Siapkan akun baru untuk bergabung di Teaching Factory.'}</DialogDescription>
        </DialogHeader>
        {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user-name">Nama pengguna</FieldLabel>
                <Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" maxLength={100} required disabled={pending} placeholder="Nama lengkap pengguna" />
              </Field>
              {user ? (
                <SelectField label="Peran" value={role} onChange={setRole} options={roleOptions.filter((item) => ['Admin', 'Anggota', 'Guru', 'PM', 'DevOps'].includes(item.value))} disabled={pending} />
              ) : (
                <>
                  <SelectField label="Peran" value={role} onChange={setRole} options={roleOptions.filter((item) => ['Anggota', 'Guru', 'PM', 'DevOps'].includes(item.value))} disabled={pending} />
                  <Field>
                    <FieldLabel htmlFor="new-password">Kata sandi awal</FieldLabel>
                    <Input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} placeholder="Minimal 8 karakter" />
                    <FieldDescription>Bagikan kata sandi hanya kepada pemilik akun.</FieldDescription>
                  </Field>
                </>
              )}
              {user && <Field><FieldLabel htmlFor="edit-password">Password baru</FieldLabel><Input id="edit-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} placeholder="Kosongkan jika tidak diubah" /><FieldDescription>Isi hanya jika password akun perlu diganti.</FieldDescription></Field>}
              <SelectField label="Divisi" value={selectedDivision} onChange={setDivision} options={[{ value: 'none', label: 'Tanpa divisi' }, ...data.divisions.map((item) => ({ value: String(item.id), label: item.nama }))]} disabled={pending} />
            </FieldGroup>
            {divisionNeedsSelection && <Alert><AlertDescription>Divisi sebelumnya tidak dapat dipetakan. Pilih divisi secara eksplisit sebelum menyimpan.</AlertDescription></Alert>}
            {!hasDevOpsRole && <Alert><AlertDescription>Role DevOps belum dikirim oleh server, jadi opsi ini belum dapat dibuat dengan aman. Pastikan role DevOps tersedia pada endpoint role backend.</AlertDescription></Alert>}
            {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 shrink-0" />Perubahan disimpan langsung ke server.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Batal</Button>
              <Button type="submit" disabled={pending || !name.trim() || divisionNeedsSelection || (!user && password.length < 8)}>
                {pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                {pending ? 'Menyimpan...' : user ? 'Simpan perubahan' : 'Buat akun'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
