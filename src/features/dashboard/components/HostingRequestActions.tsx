import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { Ban, Check, LoaderCircle, Pencil, Play, RotateCcw, Save, Trash2 } from 'lucide-react';
import type { HostingRequestDTO } from '@/types/hosting';
import { errorMessage } from '@/lib/api';
import { useProfile } from '../useWorkspace';
import { hostingPermissions, safeHostingUrl } from '../hostingAccess';
import { approveHostingRequest, rejectHostingRequest, startHostingProcessing, completeHostingRequest, updateHostingDevOpsNotes, cancelHostingRequest, deleteHostingRequest } from '../hostingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

export function HostingRequestActions({ request, onClose, onEdit, onResubmit, onBusyChange }: {
  request: HostingRequestDTO;
  onClose: () => void;
  onEdit: (request: HostingRequestDTO) => void;
  onResubmit: (request: HostingRequestDTO) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const profile = useProfile();
  const permissions = hostingPermissions(profile, request);
  const { mutate } = useSWRConfig();
  const [reviewNotes, setReviewNotes] = useState('');
  const [notes, setNotes] = useState(request.devOpsNotes || '');
  const [hostingUrl, setHostingUrl] = useState(request.hostingUrl || '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<'delete' | 'cancel' | null>(null);

  async function run(task: () => Promise<unknown>, message: string, close = false) {
    if (pending) return;
    setPending(true);
    onBusyChange(true);
    setError('');
    try {
      await task();
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
      onBusyChange(false);
      return;
    }
    toast.success(message);
    setConfirmation(null);
    // Revalidation errors must not turn a successful mutation into a retryable failure.
    const refreshes: Promise<unknown>[] = [mutate((key) => Array.isArray(key) && key[0] === 'hosting-workspace')];
    if (!close) refreshes.push(mutate(['hosting-detail', profile?.id, request.id]));
    else onClose();
    await Promise.allSettled(refreshes);
    setPending(false);
    onBusyChange(false);
  }

  const spinner = pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null;
  if (!permissions.view) return null;

  return <div className="flex flex-col gap-4">
    {error && !confirmation && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {permissions.review && <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void run(() => approveHostingRequest(request.id, reviewNotes.trim()), 'Permintaan disetujui dan masuk antrean DevOps.'); }}>
      <Field><FieldLabel htmlFor="review-notes">Catatan review PM</FieldLabel><Textarea id="review-notes" value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={3} maxLength={1000} disabled={pending} placeholder="Catatan kelayakan atau hal yang perlu diperbaiki..." /><FieldDescription>Wajib diisi jika menolak, agar pemohon tahu apa yang perlu diperbaiki.</FieldDescription></Field>
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={pending || !reviewNotes.trim()} onClick={() => void run(() => rejectHostingRequest(request.id, reviewNotes.trim()), 'Permintaan ditolak. Catatan dapat dilihat pemohon.')}><Ban data-icon="inline-start" />Tolak</Button><Button type="submit" disabled={pending}>{spinner || <Check data-icon="inline-start" />}Setujui hosting</Button></div>
    </form>}
    {permissions.start && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Persetujuan PM sudah diterima. Siap untuk deployment.</p><Button disabled={pending} onClick={() => void run(() => startHostingProcessing(request.id), 'Hosting mulai diproses. Kamu menjadi penanggung jawab.')}>
      {spinner || <Play data-icon="inline-start" />}Mulai proses
    </Button></div>}
    {permissions.notes && <form className="flex flex-col gap-4" onSubmit={(event) => {
      event.preventDefault();
      if (!permissions.complete) return;
      const url = safeHostingUrl(hostingUrl);
      if (!url) { setError('Masukkan tautan hosting HTTP/HTTPS yang valid, tanpa kredensial.'); return; }
      void run(() => completeHostingRequest(request.id, { hostingUrl: url, devOpsNotes: notes.trim() }), 'Hosting selesai. Tautan sudah tersedia untuk pemohon.');
    }}><FieldGroup>
      {permissions.complete && <Field><FieldLabel htmlFor="hosting-url">Tautan hosting aktif</FieldLabel><Input id="hosting-url" type="url" required value={hostingUrl} onChange={(event) => setHostingUrl(event.target.value)} maxLength={500} disabled={pending} placeholder="https://proyek.contoh.com" /><FieldDescription>Pastikan tautan dapat diakses sebelum menyelesaikan hosting.</FieldDescription></Field>}
      <Field><FieldLabel htmlFor="devops-notes">Catatan DevOps</FieldLabel><Textarea id="devops-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} disabled={pending} placeholder="Progres konfigurasi dan deployment. Jangan cantumkan password atau token." /></Field>
    </FieldGroup><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={pending || notes === (request.devOpsNotes || '')} onClick={() => void run(() => updateHostingDevOpsNotes(request.id, notes.trim()), 'Catatan progres disimpan.')}><Save data-icon="inline-start" />Simpan catatan</Button>{permissions.complete && <Button type="submit" disabled={pending || !safeHostingUrl(hostingUrl)}>{spinner || <Check data-icon="inline-start" />}Selesaikan hosting</Button>}</div></form>}
    {permissions.resubmit && <Alert><AlertDescription>Pengajuan ini ditolak. Mengedit detail tidak mengubah statusnya. Gunakan Ajukan ulang untuk membuat permintaan baru yang akan ditinjau PM; riwayat lama tetap tersimpan.</AlertDescription></Alert>}
    <div className="flex flex-wrap justify-end gap-2">
      {permissions.edit && <><Button variant="outline" disabled={pending} onClick={() => { setError(''); setConfirmation('cancel'); }}><Ban data-icon="inline-start" />Batalkan permintaan</Button><Button variant="outline" disabled={pending} onClick={() => onEdit(request)}><Pencil data-icon="inline-start" />Edit detail</Button></>}
      {permissions.resubmit && <Button disabled={pending} onClick={() => onResubmit(request)}><RotateCcw data-icon="inline-start" />Ajukan ulang</Button>}
      {permissions.delete && <Button variant="destructive" disabled={pending} onClick={() => { setError(''); setConfirmation('delete'); }}><Trash2 data-icon="inline-start" />Hapus permanen</Button>}
    </div>
    <AlertDialog open={confirmation !== null} onOpenChange={(open) => { if (!open && !pending) setConfirmation(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmation === 'delete' ? 'Hapus permintaan secara permanen?' : 'Batalkan permintaan hosting?'}</AlertDialogTitle><AlertDialogDescription>{confirmation === 'delete' ? `Permintaan hosting ${request.projectName} dan riwayatnya akan dihapus. Tindakan ini tidak bisa dibatalkan.` : 'Permintaan tidak akan diproses lebih lanjut. Riwayatnya tetap tersimpan dengan status Dibatalkan.'}</AlertDialogDescription></AlertDialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<AlertDialogFooter><AlertDialogCancel disabled={pending}>Kembali</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={pending} onClick={(event) => { event.preventDefault(); if (confirmation === 'delete' && permissions.delete) void run(() => deleteHostingRequest(request.id), 'Permintaan dihapus permanen.', true); if (confirmation === 'cancel' && permissions.edit) void run(() => cancelHostingRequest(request.id), 'Permintaan dibatalkan.', true); }}>{spinner}{confirmation === 'delete' ? 'Ya, hapus permanen' : 'Ya, batalkan'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
