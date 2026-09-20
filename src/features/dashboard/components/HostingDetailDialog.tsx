import { useState } from 'react';
import useSWR from 'swr';
import { Mail, Phone, User, FolderKanban, Link2, BookOpen, Layers, ExternalLink, ShieldCheck } from 'lucide-react';
import type { HostingRequestDTO } from '@/types/hosting';
import { getHostingRequestDetail } from '../hostingService';
import { useProfile } from '../useWorkspace';
import { hostingPermissions, safeHostingUrl } from '../hostingAccess';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ErrorState, LoadingState } from '@/components/DataState';
import { HostingStatusBadge } from './HostingStatusBadge';
import { HostingProgress } from './HostingOverview';
import { HostingRequestActions } from './HostingRequestActions';

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="flex items-start gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="break-words font-medium">{value}</p></div></div>;
}

export function HostingDetailDialog({ id, onClose, onEdit, onResubmit }: { id: number; onClose: () => void; onEdit: (request: HostingRequestDTO) => void; onResubmit: (request: HostingRequestDTO) => void }) {
  const profile = useProfile();
  const { data: request, error, isLoading, mutate } = useSWR(profile ? ['hosting-detail', profile.id, id] : null, () => getHostingRequestDetail(id));
  const [busy, setBusy] = useState(false);
  const visible = request && hostingPermissions(profile, request).view;
  const links = request ? [
    { label: 'Repositori', url: safeHostingUrl(request.repositoryUrl), icon: Link2 },
    { label: 'Dokumentasi', url: safeHostingUrl(request.documentationUrl), icon: BookOpen },
    { label: 'Hosting aktif', url: safeHostingUrl(request.hostingUrl), icon: FolderKanban },
  ] : [];

  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}><DialogContent showCloseButton={!busy} className="sm:max-w-2xl">
    <DialogHeader><DialogTitle className="flex flex-wrap items-center gap-2">{visible ? request.projectName : 'Detail permintaan hosting'}{visible && <HostingStatusBadge status={request.status} />}</DialogTitle><DialogDescription>{visible ? `Diajukan oleh ${request.userName} · ${formatDate(request.createdAt)}` : 'Informasi dan perkembangan pengajuan hosting proyek.'}</DialogDescription></DialogHeader>
    {error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !request ? <LoadingState /> : !visible ? <Alert><ShieldCheck /><AlertDescription>Permintaan ini tidak tersedia untuk peran kamu. DevOps hanya menampilkan permintaan setelah persetujuan PM.</AlertDescription></Alert> : <div className="flex flex-col gap-5">
      <div className="rounded-xl border bg-muted/40 p-4"><HostingProgress status={request.status} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><InfoRow icon={User} label="Kontak" value={request.contactName} /><InfoRow icon={Mail} label="Email" value={request.contactEmail} /><InfoRow icon={Phone} label="Telepon" value={request.contactPhone} /><InfoRow icon={Layers} label="Tech stack" value={request.techStack} /></div>
      {request.projectDescription && <div><p className="text-xs text-muted-foreground">Deskripsi proyek</p><p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{request.projectDescription}</p></div>}
      {links.some((link) => link.url) && <div className="flex flex-wrap gap-4">{links.map(({ label, url, icon: Icon }) => url && <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Icon className="size-4" />{label}<ExternalLink className="size-3" /><span className="sr-only">(tab baru)</span></a>)}</div>}
      {(request.pmReviewerName || request.devOpsHandlerName) && <><Separator /><div className="flex flex-col gap-3">
        {request.pmReviewerName && <div className="rounded-lg bg-muted p-3"><p className="text-sm font-medium">Ditinjau oleh {request.pmReviewerName}{request.pmReviewedAt && ` · ${formatDate(request.pmReviewedAt)}`}</p>{request.pmNotes && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{request.pmNotes}</p>}</div>}
        {request.devOpsHandlerName && <div className="rounded-lg bg-muted p-3"><p className="text-sm font-medium">Ditangani oleh {request.devOpsHandlerName}</p>{request.devOpsNotes && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{request.devOpsNotes}</p>}</div>}
      </div></>}
      <Separator />
      <HostingRequestActions key={`${request.id}-${request.status}`} request={request} onClose={onClose} onEdit={onEdit} onResubmit={onResubmit} onBusyChange={setBusy} />
    </div>}
  </DialogContent></Dialog>;
}
