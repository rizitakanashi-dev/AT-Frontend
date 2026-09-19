import { Check, ClipboardCheck, Clock3, Rocket, Server, CircleCheck } from 'lucide-react';
import type { HostingRequestListDTO, HostingStatusValue } from '@/types/hosting';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'Pengajuan', description: 'Detail proyek & kontak', icon: Rocket },
  { label: 'Review PM', description: 'Pemeriksaan kelayakan', icon: ClipboardCheck },
  { label: 'Proses DevOps', description: 'Konfigurasi & deployment', icon: Server },
  { label: 'Hosting aktif', description: 'Siap digunakan', icon: CircleCheck },
];

export function HostingProgress({ status }: { status?: HostingStatusValue }) {
  const current = status ? ({ pending: 1, approved: 2, in_progress: 2, completed: 4, rejected: 1, cancelled: 0 }[status]) : -1;
  const stopped = status === 'rejected' || status === 'cancelled';
  return <ol className="hosting-steps" aria-label="Tahapan hosting">
    {steps.map(({ label, description, icon: Icon }, index) => <li key={label} className={cn('hosting-step', current > index && 'is-done', current === index && !stopped && 'is-current')} aria-current={current === index && !stopped ? 'step' : undefined}>
      <span className="hosting-step-icon" aria-hidden="true">{current > index ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
      <div><p className="text-sm font-medium">{label}</p>{!status && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
    </li>)}
  </ol>;
}

export function HostingOverview({ requests, role }: { requests: HostingRequestListDTO[]; role: string }) {
  const count = (statuses: HostingStatusValue[]) => requests.filter((row) => statuses.includes(row.status)).length;
  const stats = [
    { label: role === 'Anggota' ? 'Permintaan saya' : 'Total permintaan', value: requests.length, hint: role === 'DevOps' ? 'Setelah persetujuan PM' : 'Seluruh riwayat pengajuan', icon: Rocket },
    { label: role === 'DevOps' ? 'Siap diproses' : 'Menunggu review', value: count([role === 'DevOps' ? 'approved' : 'pending']), hint: role === 'DevOps' ? 'Sudah disetujui PM' : 'Menunggu keputusan PM', icon: Clock3 },
    { label: 'Sedang diproses', value: count(['in_progress']), hint: 'Dalam penanganan DevOps', icon: Server },
    { label: 'Selesai', value: count(['completed']), hint: 'Deployment diselesaikan', icon: CircleCheck },
  ];
  return <div className="flex flex-col gap-5">
    <section className="directory-intro hosting-intro" aria-label="Alur hosting proyek">
      <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"><Rocket className="size-5" /></span><div><p className="text-xs font-medium tracking-widest text-primary">DARI PROYEK KE PUBLIK</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Satu alur, sampai siap mengudara.</h2></div></div>
      <HostingProgress />
    </section>
    <div className="stagger-in grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(({ label, value, hint, icon: Icon }) => <Card key={label} className="hover-lift hosting-stat"><CardHeader><CardDescription>{label}</CardDescription><CardAction><Icon className="size-4 text-primary" /></CardAction><CardTitle><span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span></CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{hint}</p></CardContent></Card>)}</div>
  </div>;
}
