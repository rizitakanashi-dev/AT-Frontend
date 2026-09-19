import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearSession } from '@/lib/session';

export default function UnauthorizedPage() {
  return <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center"><ShieldX className="size-10 text-muted-foreground" /><h1 className="mt-6 text-2xl font-semibold">Akses tidak tersedia</h1><p className="my-4 max-w-sm text-muted-foreground">Peran akun ini belum didukung. Hubungi administrator untuk memeriksa akses Anda.</p><Button asChild><Link to="/login" onClick={clearSession}>Kembali ke halaman masuk</Link></Button></main>;
}
