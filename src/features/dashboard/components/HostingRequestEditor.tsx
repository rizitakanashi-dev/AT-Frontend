import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { LoaderCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { errorMessage } from '@/lib/api';
import { safeHostingUrl } from '../hostingAccess';
import type { HostingRequestDTO } from '@/types/hosting';
import { getProjects, getProjectAnggota } from '../absensiService';
import { createHostingRequest, updateHostingRequest } from '../hostingService';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SelectField } from '@/components/WorkspaceControls';
import { ErrorState, LoadingState } from '@/components/DataState';

export function HostingRequestEditor({ request, resubmit = false, onClose }: { request?: HostingRequestDTO; resubmit?: boolean; onClose: () => void }) {
  const profile = useProfile();
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, mutate } = useSWR(profile ? ['hosting-editor-projects', profile.id, request?.id, resubmit] : null, async () => {
    const [projects, members] = await Promise.all([getProjects(), getProjectAnggota()]);
    return projects.filter((project) => profile?.role === 'Admin' || members.some((member) => member.idProject === project.id && member.idUser === profile?.id) || (!resubmit && request?.idProject === project.id));
  });
  const [project, setProject] = useState(request ? String(request.idProject) : '');
  const [contactName, setContactName] = useState(request?.contactName || profile?.nama || '');
  const [contactEmail, setContactEmail] = useState(request?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(request?.contactPhone || '');
  const [description, setDescription] = useState(request?.projectDescription || '');
  const [techStack, setTechStack] = useState(request?.techStack || '');
  const [repositoryUrl, setRepositoryUrl] = useState(request?.repositoryUrl || '');
  const [documentationUrl, setDocumentationUrl] = useState(request?.documentationUrl || '');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !data) return;
    if (!data.some((item) => item.id === Number(project))) { setFormError('Pilih proyek yang valid dan sudah kamu ikuti.'); return; }
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) { setFormError('Lengkapi nama, email, dan nomor kontak.'); return; }
    if ([repositoryUrl, documentationUrl].some((url) => url.trim() && !safeHostingUrl(url))) { setFormError('Tautan harus berupa alamat HTTP/HTTPS yang valid, tanpa kredensial.'); return; }
    setPending(true);
    setFormError('');
    try {
      const input = {
        idProject: Number(project),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        projectDescription: description.trim() || undefined,
        techStack: techStack.trim() || undefined,
        repositoryUrl: repositoryUrl.trim() || undefined,
        documentationUrl: documentationUrl.trim() || undefined,
      };
      if (request && !resubmit) await updateHostingRequest(request.id, input);
      else await createHostingRequest(input);
      toast.success(request && !resubmit ? 'Detail permintaan diperbarui. Status tetap dipertahankan.' : 'Permintaan hosting baru diajukan. Menunggu review PM.');
      await Promise.allSettled([refresh()]);
      onClose();
    } catch (err) { setFormError(errorMessage(err)); }
    finally { setPending(false); }
  }

  const valid = project && contactName.trim() && contactEmail.trim() && contactPhone.trim();
  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><DialogContent showCloseButton={!pending} className="sm:max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><Rocket className="size-5 text-primary" />{resubmit ? 'Ajukan ulang hosting' : request ? 'Edit permintaan hosting' : 'Ajukan hosting proyek'}</DialogTitle><DialogDescription>{resubmit ? 'Detail lama disalin ke pengajuan baru. Perbaiki sesuai catatan PM; riwayat permintaan sebelumnya tidak dihapus.' : request ? 'Perbarui detail permintaan. Mengedit tidak mengubah status review.' : 'Isi detail proyek agar PM dapat meninjau dan menyetujui hosting.'}</DialogDescription></DialogHeader>
    {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : !data.length ? <Alert><AlertDescription>Kamu belum tergabung di proyek apa pun. Minta PM menambahkanmu ke proyek sebelum mengajukan hosting.</AlertDescription></Alert> : <form onSubmit={submit} className="flex flex-col gap-5">
      <FieldGroup>
        <SelectField label="Proyek" value={project} onChange={setProject} options={data.map((item) => ({ value: String(item.id), label: item.nama }))} disabled={pending || (!!request && !resubmit)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field><FieldLabel htmlFor="contact-name">Nama kontak</FieldLabel><Input id="contact-name" value={contactName} onChange={(event) => setContactName(event.target.value)} required maxLength={100} disabled={pending} /></Field>
          <Field><FieldLabel htmlFor="contact-phone">Nomor WhatsApp</FieldLabel><Input id="contact-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required maxLength={30} disabled={pending} placeholder="08xx-xxxx-xxxx" /></Field>
        </div>
        <Field><FieldLabel htmlFor="contact-email">Email kontak</FieldLabel><Input id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} required maxLength={150} disabled={pending} /></Field>
        <Field><FieldLabel htmlFor="hosting-description">Deskripsi proyek</FieldLabel><Textarea id="hosting-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={2000} disabled={pending} placeholder="Ceritakan fungsi dan tujuan proyek yang akan dihosting..." /></Field>
        <Field><FieldLabel htmlFor="hosting-stack">Tech stack</FieldLabel><Input id="hosting-stack" value={techStack} onChange={(event) => setTechStack(event.target.value)} maxLength={255} disabled={pending} placeholder="Contoh: Next.js, MySQL, Docker" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field><FieldLabel htmlFor="hosting-repo">Tautan repositori</FieldLabel><Input id="hosting-repo" type="url" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} maxLength={500} disabled={pending} placeholder="https://github.com/..." /></Field>
          <Field><FieldLabel htmlFor="hosting-docs">Tautan dokumentasi</FieldLabel><Input id="hosting-docs" type="url" value={documentationUrl} onChange={(event) => setDocumentationUrl(event.target.value)} maxLength={500} disabled={pending} placeholder="https://..." /></Field>
        </div>
      </FieldGroup>
      {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
      <DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={pending}>Batal</Button><Button type="submit" disabled={pending || !valid}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menyimpan...' : resubmit ? 'Kirim pengajuan baru' : request ? 'Simpan perubahan' : 'Ajukan hosting'}</Button></DialogFooter>
    </form>}
  </DialogContent></Dialog>;
}
