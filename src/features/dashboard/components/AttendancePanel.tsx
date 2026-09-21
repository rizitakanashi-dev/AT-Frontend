import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { ArrowDownToLine, ArrowUpFromLine, Clock, LoaderCircle, CheckCircle2, Sparkles, FolderKanban } from 'lucide-react';
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
  
  const { data, error, isLoading, mutate } = useSWR(
    user ? ['attendance-workspace', user.id, today] : null, 
    async () => {
      const [rows, projects, members, statuses] = await Promise.all([
        getMyAttendance(today), 
        getProjects(), 
        getProjectAnggota(), 
        fetcher<StatusDTO[]>('/v1/status')
      ]);
      return { 
        rows, 
        statuses, 
        projects: projects.filter((project) => members.some((member) => member.idProject === project.id && member.idUser === user?.id)) 
      };
    }
  );

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
    if (!data.statuses.some((item) => item.id === Number(status))) { 
      setFormError('Pilih status target.'); 
      return; 
    }
    setPending(true);
    setFormError('');
    try {
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
    } catch (err) { 
      setFormError(errorMessage(err)); 
    } finally { 
      setPending(false); 
    }
  }

  return (
    <div className="page-stack">
      {/* Attendance Action Card */}
      <div className="salesops-card p-5 sm:p-6 hover-lift">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Sesi Kehadiran Hari Ini</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(`${today}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs font-semibold ${
              active.length 
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' 
                : data.rows.length 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                  : 'border-border text-muted-foreground'
            }`}
          >
            {active.length ? '● Sedang Bekerja' : data.rows.length ? '✓ Aktivitas Selesai' : 'Belum Absen'}
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex size-12 items-center justify-center rounded-xl ${
              active.length ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20' : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
            }`}>
              {active.length ? <Clock className="size-6" /> : <CheckCircle2 className="size-6" />}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                {active.length ? 'Sesi workstation sedang berjalan' : data.rows.length ? 'Target hari ini telah diselesaikan' : 'Siap memulai aktivitas kerja?'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {active.length ? 'Catat hasil pencapaian target sebelum mengakhiri sesi.' : 'Pilih proyek yang ditugaskan dan catat target harian.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              onClick={() => open('in')} 
              disabled={!!active.length || !data.projects.length || !data.statuses.length}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
            >
              <ArrowDownToLine className="size-4 mr-1.5" />
              <span>Absen Masuk</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => open('out')} 
              disabled={!active.length || !data.statuses.length}
              className="border-border bg-card/60 backdrop-blur-sm"
            >
              <ArrowUpFromLine className="size-4 mr-1.5 text-cyan-400" />
              <span>Absen Pulang</span>
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground">
            {!data.projects.length ? 'Belum ditugaskan ke proyek. Hubungi Administrator atau Project Manager.' : !data.statuses.length ? 'Status target belum tersedia.' : 'Waktu kehadiran diverifikasi langsung oleh sistem.'}
          </p>
        </div>
      </div>

      {/* Activity Table */}
      <section className="table-surface">
        <div className="border-b border-border p-4 sm:p-5">
          <h3 className="text-base font-bold text-foreground">Riwayat Hari Ini</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Daftar target dan waktu presensi milik akun Anda.</p>
        </div>
        <AttendanceTable rows={data.rows} personal />
      </section>

      {/* Modal Dialog for In/Out */}
      <Dialog open={mode !== null} onOpenChange={(open) => { if (!open && !pending) setMode(null); }}>
        <DialogContent showCloseButton={!pending} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {mode === 'in' ? 'Mulai Sesi Absensi Masuk' : 'Selesaikan Sesi Absen Pulang'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {mode === 'in' ? 'Pilih proyek dan tentukan target kerja yang ingin dicapai.' : 'Pilih catatan aktif dan status akhir target.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-4 py-2">
            <FieldGroup className="gap-3.5">
              {mode === 'in' ? (
                <>
                  <SelectField 
                    label="Proyek" 
                    value={project} 
                    onChange={setProject} 
                    options={data.projects.map((item) => ({ value: String(item.id), label: item.nama }))} 
                    disabled={pending} 
                  />
                  <Field>
                    <FieldLabel htmlFor="daily-target" className="text-xs font-medium">Target Kerja Hari Ini</FieldLabel>
                    <Textarea 
                      id="daily-target" 
                      value={description} 
                      onChange={(event) => setDescription(event.target.value)} 
                      rows={3} 
                      maxLength={2000} 
                      required 
                      disabled={pending} 
                      placeholder="Apa yang akan kamu kerjakan pada sesi ini?" 
                      className="text-xs rounded-lg border-border focus:border-emerald-500"
                    />
                  </Field>
                </>
              ) : (
                <SelectField 
                  label="Catatan Presensi Aktif" 
                  value={record} 
                  onChange={setRecord} 
                  options={active.map((item) => ({ value: String(item.idAbsensi), label: `${item.project} · ${item.jamMasuk}` }))} 
                  disabled={pending} 
                />
              )}

              <SelectField 
                label={mode === 'in' ? 'Status Awal Target' : 'Status Akhir Target'} 
                value={status} 
                onChange={setStatus} 
                options={data.statuses.map((item) => ({ value: String(item.id), label: item.nama }))} 
                disabled={pending} 
              />
            </FieldGroup>

            {formError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertDescription className="text-xs">{formError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setMode(null)} disabled={pending} size="sm">
                Batal
              </Button>
              <Button 
                type="submit" 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                disabled={pending || !status || (mode === 'in' ? !project || !description.trim() : !record)}
              >
                {pending && <LoaderCircle className="animate-spin size-3.5 mr-1.5" />}
                {pending ? 'Menyimpan...' : 'Simpan Presensi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
