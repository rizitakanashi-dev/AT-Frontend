import { Link } from 'react-router-dom';
import { ArrowUpRight, FolderKanban, Target, History } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AttendancePanel } from '../components/AttendancePanel';
import { useProfile } from '../useWorkspace';

export default function DashboardPage() {
  const user = useProfile();
  return (
    <DashboardLayout title={`Selamat bekerja, ${user?.nama || 'rekan'}.`} subtitle="Catat kehadiranmu, kerjakan target, dan jaga progres tetap terarah." actions={<Button variant="outline" size="sm" asChild><Link to="/dashboard/targets">Lihat target<ArrowUpRight data-icon="inline-end" /></Link></Button>}>
      <div className="page-stack">
        {/* Main Attendance Module */}
        <AttendancePanel />
        <section aria-labelledby="quick-access-title" className="flex flex-col gap-3">
          <h2 id="quick-access-title" className="section-heading">Lanjutkan pekerjaanmu</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[{ path: '/dashboard/project', icon: FolderKanban, title: 'Proyek saya', description: 'Tim dan penugasan proyek' }, { path: '/dashboard/targets', icon: Target, title: 'Target kerja', description: 'Kelola progres pekerjaan' }, { path: '/dashboard/riwayat', icon: History, title: 'Riwayat kehadiran', description: 'Tinjau aktivitas sebelumnya' }].map(({ path, icon: Icon, title, description }) => <Link key={path} to={path} className="quick-link"><Icon className="size-4 shrink-0 text-primary" /><div className="min-w-0"><h3 className="text-xs font-medium">{title}</h3><p className="mt-1 text-[10px] text-muted-foreground">{description}</p></div><ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" /></Link>)}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
