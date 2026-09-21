import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock3, Rocket, Sparkles, Target, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AttendancePanel } from '../components/AttendancePanel';
import { useProfile } from '../useWorkspace';

export default function DashboardPage() {
  const user = useProfile();
  return <DashboardLayout title={`Halo, ${user?.nama || 'selamat datang'}.`} subtitle="Mari buat progres yang berarti hari ini." actions={<Button variant="outline" asChild><Link to="/dashboard/targets">Lihat target kerja<ArrowUpRight data-icon="inline-end" /></Link></Button>}>
    <div className="page-stack">
      <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
        <div className="dashboard-hero-orbit dashboard-hero-orbit-one" aria-hidden="true" />
        <div className="dashboard-hero-orbit dashboard-hero-orbit-two" aria-hidden="true" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow-chip"><Sparkles data-icon="inline-start" /> Fokus hari ini</div>
            <h2 id="dashboard-hero-title" className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Satu langkah kecil, progres yang terasa.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">Pantau kehadiran, selesaikan target, dan jaga ritme proyekmu tetap bergerak bersama tim.</p>
          </div>
          <div className="dashboard-hero-note"><TrendingUp className="size-5 text-primary" /><div><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ritme workspace</p><p className="mt-1 font-medium">Konsisten lebih baik dari terburu-buru.</p></div></div>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3"><div className="dashboard-hero-metric"><Target className="size-4 text-primary" /><span>Target kerja</span><strong>Siap dilanjutkan</strong></div><div className="dashboard-hero-metric"><Clock3 className="size-4 text-primary" /><span>Ritme hari ini</span><strong>Jaga konsistensi</strong></div><div className="dashboard-hero-metric"><Rocket className="size-4 text-primary" /><span>Langkah berikutnya</span><strong>Mulai aktivitas</strong></div></div>
        <div className="dashboard-hero-footer"><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="size-4" /></span><span>Workspace siap menemani progresmu.</span></div><span className="hidden text-xs font-medium uppercase tracking-[.16em] text-muted-foreground sm:inline">01 / Fokus</span></div>
      </section>
      <div data-anime="stagger"><AttendancePanel /></div>
    </div>
  </DashboardLayout>;
}
