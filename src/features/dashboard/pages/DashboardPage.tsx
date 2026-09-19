import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { AttendancePanel } from '../components/AttendancePanel';
import { useProfile } from '../useWorkspace';

export default function DashboardPage() {
  const user = useProfile();
  return <DashboardLayout title={`Halo, ${user?.nama || 'selamat datang'}.`} subtitle="Mari buat progres yang berarti hari ini." actions={<Button variant="outline" asChild><Link to="/dashboard/targets">Lihat target kerja<ArrowUpRight data-icon="inline-end" /></Link></Button>}><AttendancePanel /></DashboardLayout>;
}
