import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock3, Rocket, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AttendancePanel } from '../components/AttendancePanel';
import { useProfile } from '../useWorkspace';

export default function DashboardPage() {
  const user = useProfile();
  
  return (
    <DashboardLayout 
      title={`Halo, ${user?.nama || 'rekan'}.`} 
      subtitle="Fokus pada progres harian dan selesaikan target proyekmu." 
      actions={
        <Button 
          variant="outline" 
          size="sm"
          asChild
          className="border-border bg-card/60 backdrop-blur-sm shadow-xs"
        >
          <Link to="/dashboard/targets">
            <span>Target Kerja</span>
            <ArrowUpRight className="size-3.5 ml-1" />
          </Link>
        </Button>
      }
    >
      <div className="page-stack">
        {/* Modern Welcome Hero Card */}
        <section className="reference-welcome" aria-labelledby="dashboard-hero-title">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                <Sparkles className="size-3.5" />
                <span>Daily Focus & Productivity</span>
              </div>
              <h2 id="dashboard-hero-title" className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Satu langkah kecil, hasil yang terasa.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Catat jam kehadiran, deskripsikan target harianmu, dan kolaborasi bersama tim proyek Teaching Factory.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Konsistensi Kehadiran</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground">
                  <Zap className="size-3.5 text-amber-500" />
                  <span>Target Tuntas</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Right Box */}
            <div className="grid grid-cols-2 gap-3 sm:w-80">
              <div className="rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Ritme Kerja</span>
                  <Clock3 className="size-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-xl font-bold text-foreground">On Track</p>
                <span className="text-[10px] text-emerald-500 font-medium">100% Konsisten</span>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Target Harian</span>
                  <Target className="size-4 text-teal-400" />
                </div>
                <p className="mt-2 text-xl font-bold text-foreground">Siap</p>
                <span className="text-[10px] text-teal-400 font-medium">Mulai Absen</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Attendance Module */}
        <div data-anime="stagger">
          <AttendancePanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
