import DashboardLayout from '@/components/DashboardLayout';
import { AttendancePanel } from '../components/AttendancePanel';

export default function AbsensiPage() {
  return <DashboardLayout title="Absensi saya" subtitle="Catat masuk, target kerja, dan waktu pulang."><AttendancePanel /></DashboardLayout>;
}
