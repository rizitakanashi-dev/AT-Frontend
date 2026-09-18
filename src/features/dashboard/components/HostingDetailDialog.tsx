import { useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { LoaderCircle, Mail, Phone, User, FolderKanban, Link2, BookOpen, Layers, Pencil, Ban, Play, CircleCheck, ExternalLink, Trash2 } from 'lucide-react';
import { errorMessage } from '@/lib/api';
import type { HostingRequestDTO } from '@/types/hosting';
import { getHostingRequestDetail, approveHostingRequest, rejectHostingRequest, startHostingProcessing, completeHostingRequest, cancelHostingRequest, deleteHostingRequest } from '../hostingService';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import { normalizeRole } from '@/lib/roles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ErrorState, LoadingState } from '@/components/DataState';
import { HostingStatusBadge } from './HostingStatusBadge';

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="flex items-start gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="break-words font-medium">{value}</p></div></div>;
}

export function HostingDetailDialog({ id, onClose, onEdit }: { id: number; onClose: () => void; onEdit: (request: HostingRequestDTO) => void }) {
  const profile = useProfile();
  const role = normalizeRole(profile?.role || '');
  const refreshList = useRefreshWorkspace();
  const { data: request, error, isLoading, mutate } = useSWR(['hosting-detail', id], () => getHostingRequestDetail(id));
  const [notes, setNotes] = useState('');
  const [hostingUrl, setHostingUrl] = useState('');
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'start' | 'complete' | 'cancel' | 'delete' | null>(null);
  const [actionError, setActionError] = useState('');

  async function run(action: NonNullable<typeof pendingAction>, task: () => Promise<unknown>, message: string, opts?: { closeAfter?: boolean }) {
    setPendingAction(action);
    setActionError('');
    try {
      await task();
      toast.success(message);
      await Promise.all([mutate(), refreshList()]);
      if (opts?.closeAfter) onClose();
    } catch (err) { setActionError(errorMessage(err)); }
    finally { setPendingAction(null); }
  }

  const isOwner = !!request && !!profile && request.idUser === profile.id;
  const canManagePm = role === 'PM' || role === 'Admin';
  const canManageDevOps = role === 'DevOps' || role === 'Admin';
  const busy = pendingAction !== null;

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}><DialogContent showCloseButton={!busy} className="sm:max-w-lg">
    {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !request ? <LoadingState /> : <>
      <DialogHeader><DialogTitle className="flex flex-wrap items-center gap-2">{request.projectName}<HostingStatusBadge status={request.status} /></DialogTitle><DialogDescription>Diajukan oleh {request.userName} · {formatDate(request.createdAt)}</DialogDescription></DialogHeader>
      <div className="stagger-in flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2"><InfoRow icon={User} label="Kontak" value={request.contactName} /><InfoRow icon={Mail} label="Email" value={request.contactEmail} /><InfoRow icon={Phone} label="Telepon" value={request.contactPhone} /><InfoRow icon={Layers} label="Tech stack" value={request.techStack} /></div>
        {request.projectDescription && <div><p className="text-xs text-muted-foreground">Deskripsi proyek</p><p className="mt-1 text-pretty leading-relaxed">{request.projectDescription}</p></div>}
        <div className="flex flex-wrap gap-4">
          {request.repositoryUrl && <a href={request.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Link2 className="size-4" />Repositori<ExternalLink className="size-3" /></a>}
          {request.documentationUrl && <a href={request.documentationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><BookOpen className="size-4" />Dokumentasi<ExternalLink className="size-3" /></a>}
          {request.hostingUrl && <a href={request.hostingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><FolderKanban className="size-4" />Hosting aktif<ExternalLink className="size-3" /></a>}
        </div>

        {(request.pmReviewerName || request.devOpsHandlerName) && <><Separator /><div className="flex flex-col gap-3">
          {request.pmReviewerName && <div className="rounded-lg bg-muted p-3"><p className="text-sm font-medium">Ditinjau oleh {request.pmReviewerName}{request.pmReviewedAt && ` · ${formatDate(request.pmReviewedAt)}`}</p>{request.pmNotes && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{request.pmNotes}&rdquo;</p>}</div>}
          {request.devOpsHandlerName && <div className="rounded-lg bg-muted p-3"><p className="text-sm font-medium">Ditangani oleh {request.devOpsHandlerName}</p>{request.devOpsNotes && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{request.devOpsNotes}&rdquo;</p>}</div>}
        </div></>}

        {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}

        {canManagePm && request.status === 'pending' && <><Separator /><FieldGroup><Field><FieldLabel htmlFor="review-notes">Catatan review</FieldLabel><Textarea id="review-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} maxLength={1000} disabled={busy} placeholder="Opsional, jelaskan alasan keputusan..." /></Field></FieldGroup>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" disabled={busy} onClick={() => void run('reject', () => rejectHostingRequest(request.id, notes.trim()), 'Permintaan hosting ditolak.')}>{pendingAction === 'reject' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Ban data-icon="inline-start" />}Tolak</Button>
            <Button disabled={busy} onClick={() => void run('approve', () => approveHostingRequest(request.id, notes.trim()), 'Permintaan hosting disetujui.')}>{pendingAction === 'approve' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <CircleCheck data-icon="inline-start" />}Setujui</Button>
          </div></>}

        {canManageDevOps && request.status === 'approved' && <><Separator /><div className="flex justify-end"><Button disabled={busy} onClick={() => void run('start', () => startHostingProcessing(request.id), 'Hosting mulai diproses.')}>{pendingAction === 'start' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Play data-icon="inline-start" />}Mulai proses</Button></div></>}

        {canManageDevOps && request.status === 'in_progress' && <><Separator /><FieldGroup>
          <Field><FieldLabel htmlFor="hosting-url">Tautan hosting</FieldLabel><Input id="hosting-url" type="url" value={hostingUrl} onChange={(event) => setHostingUrl(event.target.value)} maxLength={500} disabled={busy} placeholder="https://proyek.contoh.com" /></Field>
          <Field><FieldLabel htmlFor="devops-notes">Catatan DevOps</FieldLabel><Textarea id="devops-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} maxLength={1000} disabled={busy} placeholder="Detail konfigurasi, server, dsb..." /></Field>
        </FieldGroup>
          <div className="flex justify-end"><Button disabled={busy} onClick={() => void run('complete', () => completeHostingRequest(request.id, { hostingUrl: hostingUrl.trim() || undefined, devOpsNotes: notes.trim() || undefined }), 'Hosting selesai diproses.')}>{pendingAction === 'complete' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <CircleCheck data-icon="inline-start" />}Selesaikan hosting</Button></div></>}

        {isOwner && (request.status === 'pending' || request.status === 'rejected') && <><Separator /><div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void run('cancel', () => cancelHostingRequest(request.id), 'Permintaan hosting dibatalkan.', { closeAfter: true })}>{pendingAction === 'cancel' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Ban data-icon="inline-start" />}Batalkan</Button>
          <Button variant="outline" disabled={busy} onClick={() => onEdit(request)}><Pencil data-icon="inline-start" />Edit</Button>
        </div></>}

        {role === 'Admin' && <><Separator /><div className="flex justify-end"><Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busy} onClick={() => void run('delete', () => deleteHostingRequest(request.id), 'Permintaan hosting dihapus permanen.', { closeAfter: true })}>{pendingAction === 'delete' ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Trash2 data-icon="inline-start" />}Hapus permanen</Button></div></>}
      </div>
    </>}
  </DialogContent></Dialog>;
}
