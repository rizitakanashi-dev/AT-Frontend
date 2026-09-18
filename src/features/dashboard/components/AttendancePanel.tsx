import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { ArrowDownToLine, ArrowUpFromLine, Clock, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher, errorMessage } from '@/lib/api';
import { getMyAttendance, getProjectAnggota, getProjects, postAbsenMasuk, postAbsenPulang } from '../absensiService';
import { useProfile, useRefreshWorkspace, useToday } from '../useWorkspace';
import type { StatusDTO } from '@/types/absensi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SelectField } from '@/components/WorkspaceControls';
import { ErrorState, LoadingState } from '@/components/DataState';
import { AttendanceTable } from './AttendanceTable';

export function AttendancePanel() {
  const user = useProfile();
  const today = useToday();
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, mutate } = useSWR(user ? ['attendance-workspace', user.id, today] : null, async () => {
    const [rows, projects, members, statuses] = await Promise.all([getMyAttendance(today), getProjects(), getProjectAnggota(), fetcher<StatusDTO[]>('/v1/status')]);
    return { rows, statuses, projects: projects.filter((project) => members.some((member) => member.idProject === project.id && member.idUser === user?.id)) };
  });
  const [mode, setMode] = useState<'in' | 'out' | null>(null);
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [record, setRecord] = useState('');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState('');
  if (error) return <ErrorState error={error} retry={() => void mutate()} />;
  if (isLoading || !data) return <LoadingState />;
  const active = data.rows.filter((row) => row.jamMasuk && !row.jamPulang);

  function open(next: 'in' | 'out') {
    setMode(next);
    setStatus('');
    setDescription('');
    setProject(data?.projects.length === 1 ? String(data.projects[0].id) : '');
    setRecord(active.length === 1 ? String(active[0].idAbsensi) : '');
    setFormError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !data) return;
    if (!data.statuses.some((item) => item.id === Number(status))) { setFormError('Pilih status target.'); return; }
    setPending(true);
    setFormError('');
    try {
      // Revalidate ownership and active attendance immediately before any mutation.
      const latest = await getMyAttendance(today);
      if (mode === 'in') {
        if (latest.some((row) => !row.jamPulang)) throw new Error('Masih ada absensi aktif. Selesaikan absen pulang terlebih dahulu.');
        if (!description.trim() || !data.projects.some((item) => item.id === Number(project))) throw new Error('Pilih proyek dan isi target kerja.');
        await postAbsenMasuk({ idProject: Number(project), target: description.trim(), idStatus: Number(status) });
      } else {
        const owned = latest.find((row) => row.idAbsensi === Number(record) && !row.jamPulang);
        if (!owned) throw new Error('Catatan sudah ditutup atau bukan milik akun Anda. Muat ulang data.');
        await postAbsenPulang({ idAbsensi: owned.idAbsensi, idTarget: owned.idTarget, idStatus: Number(status) });
      }
      toast.success(mode === 'in' ? 'Absen masuk berhasil dicatat.' : 'Absen pulang berhasil dicatat.');
      setMode(null);
      await refresh();
    } catch (err) { setFormError(errorMessage(err)); }
    finally { setPending(false); }
  }

  return <div className="page-stack">
    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Kehadiran hari ini</CardTitle><Badge variant={active.length ? 'default' : 'secondary'}>{active.length ? 'Sedang bekerja' : data.rows.length ? 'Aktivitas selesai' : 'Belum absen'}</Badge></div><CardDescription>{new Date(`${today}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</CardDescription></CardHeader><CardContent><div className="flex flex-wrap items-center justify-between gap-6"><div className="flex items-start gap-4"><div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">{active.length ? <Clock className="size-6" /> : <CheckCircle2 className="size-6" />}</div><div><p className="text-lg font-medium">{active.length ? 'Tetap fokus, terus berprogres.' : data.rows.length ? 'Terima kasih untuk progres hari ini.' : 'Siap memulai hari yang produktif?'}</p><p className="mt-1 text-muted-foreground">{active.length ? 'Selesaikan sesi dengan mencatat hasil target sebelum pulang.' : 'Pilih proyek dan catat target yang ingin kamu selesaikan.'}</p></div></div><div className="flex flex-wrap gap-3"><Button onClick={() => open('in')} disabled={!!active.length || !data.projects.length || !data.statuses.length}><ArrowDownToLine data-icon="inline-start" />Absen masuk</Button><Button variant="outline" onClick={() => open('out')} disabled={!active.length || !data.statuses.length}><ArrowUpFromLine data-icon="inline-start" />Absen pulang</Button></div></div></CardContent><CardFooter><p className="text-sm text-muted-foreground">{!data.projects.length ? 'Belum ditugaskan ke proyek. Hubungi Admin atau Project Manager.' : !data.statuses.length ? 'Status target belum tersedia. Hubungi administrator.' : 'Waktu kehadiran dicatat otomatis oleh server.'}</p></CardFooter></Card>
    <section className="table-surface"><div className="border-b px-5 py-4"><h2 className="section-heading">Aktivitas hari ini</h2><p className="text-sm text-muted-foreground">Catatan kehadiran dan target milikmu.</p></div><AttendanceTable rows={data.rows} personal /></section>
    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open && !pending) setMode(null); }}><DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{mode === 'in' ? 'Mulai aktivitas' : 'Selesaikan aktivitas'}</DialogTitle><DialogDescription>{mode === 'in' ? 'Tentukan proyek dan target kerja hari ini.' : 'Pilih catatan aktif dan status akhir target yang dikerjakan.'}</DialogDescription></DialogHeader><form onSubmit={submit} className="flex flex-col gap-5"><FieldGroup>{mode === 'in' ? <><SelectField label="Proyek" value={project} onChange={setProject} options={data.projects.map((item) => ({ value: String(item.id), label: item.nama }))} disabled={pending} /><Field><FieldLabel htmlFor="daily-target">Target kerja</FieldLabel><Textarea id="daily-target" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={2000} required disabled={pending} placeholder="Apa yang ingin kamu selesaikan hari ini?" /></Field></> : <SelectField label="Catatan aktif" value={record} onChange={setRecord} options={active.map((item) => ({ value: String(item.idAbsensi), label: `${item.project} · ${item.jamMasuk}` }))} disabled={pending} />}<SelectField label={mode === 'in' ? 'Status awal target' : 'Status akhir target'} value={status} onChange={setStatus} options={data.statuses.map((item) => ({ value: String(item.id), label: item.nama }))} disabled={pending} /></FieldGroup>{formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}<DialogFooter><Button type="button" variant="outline" onClick={() => setMode(null)} disabled={pending}>Batal</Button><Button type="submit" disabled={pending || !status || (mode === 'in' ? !project || !description.trim() : !record)}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menyimpan...' : 'Simpan kehadiran'}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
