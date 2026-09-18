import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher, errorMessage } from '@/lib/api';
import type { TargetDTO, StatusDTO } from '@/types/absensi';
import { createTarget, updateTarget, getProjects, getUsers } from '../absensiService';
import { useRefreshWorkspace } from '../useWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SelectField } from '@/components/WorkspaceControls';
import { ErrorState, LoadingState } from '@/components/DataState';

export function TargetEditor({ target, onClose }: { target?: TargetDTO; onClose: () => void }) {
  const { data, error, isLoading, mutate } = useSWR(['target-editor-options', !target], async () => {
    const [projects, statuses, users] = await Promise.all([getProjects(), fetcher<StatusDTO[]>('/v1/status'), !target ? getUsers() : Promise.resolve([])]);
    return { projects, statuses, users };
  });
  const refresh = useRefreshWorkspace();
  const [user, setUser] = useState(target ? String(target.idUser) : '');
  const [project, setProject] = useState(target ? String(target.idProject) : '');
  const [status, setStatus] = useState(target ? String(target.idStatus) : '');
  const [description, setDescription] = useState(target?.target || '');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !data) return;
    if (!data.projects.some((item) => item.id === Number(project)) || !data.statuses.some((item) => item.id === Number(status)) || (!target && !data.users.some((item) => item.id === Number(user)))) { setFormError('Pilih pengguna, proyek, dan status yang valid.'); return; }
    setPending(true);
    setFormError('');
    try {
      const input = { idProject: Number(project), idStatus: Number(status), target: description.trim() };
      if (target) await updateTarget(target.id, input);
      else await createTarget({ ...input, idUser: Number(user) });
      toast.success('Target kerja disimpan.');
      await refresh();
      onClose();
    } catch (err) { setFormError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{target ? 'Edit target kerja' : 'Tambah target kerja'}</DialogTitle><DialogDescription>{target ? `Target milik ${target.userName}.` : 'Tentukan pekerjaan yang jelas dan dapat ditindaklanjuti.'}</DialogDescription></DialogHeader>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : <form onSubmit={submit} className="flex flex-col gap-5"><FieldGroup>{!target && <SelectField label="Penanggung jawab" value={user} onChange={setUser} options={data.users.map((item) => ({ value: String(item.id), label: `${item.nama} · ${item.role}` }))} disabled={pending} />}<SelectField label="Proyek" value={project} onChange={setProject} options={data.projects.map((item) => ({ value: String(item.id), label: item.nama }))} disabled={pending} /><Field><FieldLabel htmlFor="target-description">Target kerja</FieldLabel><Textarea id="target-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required maxLength={2000} disabled={pending} placeholder="Jelaskan hasil yang ingin dicapai..." /></Field><SelectField label="Status target" value={status} onChange={setStatus} options={data.statuses.map((item) => ({ value: String(item.id), label: item.nama }))} disabled={pending} /></FieldGroup>{formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}<DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={pending}>Batal</Button><Button type="submit" disabled={pending || !user || !project || !status || !description.trim()}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menyimpan...' : 'Simpan target'}</Button></DialogFooter></form>}</DialogContent></Dialog>;
}
