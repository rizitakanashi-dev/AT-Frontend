import { useState } from 'react';
import useSWR from 'swr';
import { Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { fetcher } from '@/lib/api';
import { canManageUser, deleteUser, getUsers } from '../absensiService';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import type { UserDTO } from '@/types/absensi';
import { normalizeRole, roleLabel } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ErrorState, LoadingState } from '@/components/DataState';
import { ConfirmDelete } from '@/components/WorkspaceControls';
import { UserEditor } from '../components/UserEditor';
import { UserDirectory } from '../components/UserDirectory';

export default function UsersPage() {
  const profile = useProfile();
  const admin = normalizeRole(profile?.role || '') === 'Admin';
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, isValidating, mutate } = useSWR(profile ? ['users-workspace', profile.id, admin] : null, () => admin ? getUsers() : fetcher<UserDTO[]>('/Anggota'));
  const [editor, setEditor] = useState<UserDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<UserDTO | null>(null);
  const [viewing, setViewing] = useState<UserDTO | null>(null);

  return (
    <DashboardLayout title={admin ? 'Pengguna' : 'Anggota'} subtitle={admin ? 'Satu tempat untuk mengenal tim dan mengelola akun.' : 'Kenali anggota dan divisi di Teaching Factory.'} actions={admin && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Tambah pengguna</Button>}>
      <div className="page-stack">
        <section className="directory-intro" aria-label="Direktori Teaching Factory">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Users className="size-6" /></div>
            <div className="flex flex-col gap-1"><p className="text-sm font-medium text-primary">TEACHING FACTORY / TIM</p><h2 className="text-balance text-xl font-semibold tracking-tight">Tim hebat dimulai dari orang-orangnya.</h2><p className="text-pretty text-sm text-muted-foreground">Temukan pengguna, periksa divisi, dan kelola profil dengan lebih mudah.</p></div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void mutate()} disabled={isValidating || !profile}><RefreshCw data-icon="inline-start" className={isValidating ? 'animate-spin' : ''} />{isValidating ? 'Memuat...' : 'Perbarui'}</Button>
        </section>
        {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !profile ? <LoadingState /> : <UserDirectory users={admin && profile && data && !data.some((user) => user.id === profile.id) ? [...data, profile] : data || []} admin={admin} onEdit={setEditor} onDelete={setDeleting} onView={setViewing} />}
        {admin && <Alert><ShieldCheck /><AlertTitle>Kontrol akun terpusat</AlertTitle><AlertDescription><div className="flex flex-col gap-2"><p>Admin dapat membuat, melihat, mengubah role/divisi, dan menghapus semua akun melalui endpoint administrasi.</p><details><summary className="cursor-pointer font-medium">Catatan keamanan</summary><ul className="mt-2 flex list-disc flex-col gap-1 pl-4"><li>Akun Admin aktif tidak dapat menghapus dirinya sendiri.</li><li>Admin terakhir tidak dapat dihapus oleh server.</li><li>Password hanya dikirim saat membuat akun atau ketika diisi saat edit.</li></ul></details></div></AlertDescription></Alert>}
      </div>
      {admin && editor && <UserEditor user={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}
      {admin && deleting && <ConfirmDelete title={`Hapus ${deleting.nama}?`} description={`Akun ${roleLabel(deleting.role)} ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`} onClose={() => setDeleting(null)} onConfirm={async () => { await deleteUser(deleting); toast.success('Akun pengguna dihapus.'); await refresh(); }} />}
      {viewing && <Dialog open onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Profil pengguna</DialogTitle><DialogDescription>Informasi akun yang terdaftar di Teaching Factory.</DialogDescription></DialogHeader>
          <dl className="flex flex-col gap-5">
            <div><dt className="text-sm text-muted-foreground">Nama pengguna</dt><dd className="break-words text-lg font-medium">{viewing.nama}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Peran</dt><dd><Badge variant="secondary">{roleLabel(viewing.role)}</Badge></dd></div>
            <div><dt className="text-sm text-muted-foreground">Divisi</dt><dd>{viewing.divisi || 'Tanpa divisi'}</dd></div>
          </dl>
          {admin && <Alert><ShieldCheck /><AlertTitle>Profil dikelola oleh Admin</AlertTitle><AlertDescription>Role dan divisi dapat diperbarui dari satu endpoint administrasi tanpa memindahkan akun ke endpoint role lain.</AlertDescription></Alert>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Tutup</Button>{admin && canManageUser(viewing.role) && <Button onClick={() => { setEditor(viewing); setViewing(null); }}>Edit profil</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>}
    </DashboardLayout>
  );
}
