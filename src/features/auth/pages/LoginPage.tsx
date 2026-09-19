import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { ShieldCheck, ClipboardCheck, Target, Users } from 'lucide-react';
import { loginUser } from '@/features/absensi/services/authService';
import { getSession, saveSession } from '@/lib/session';
import { errorMessage } from '@/lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { LoginForm } from '../components/LoginForm';
import { Brand } from '@/components/Brand';
import type { LoginFormValues } from '../schemas/loginSchema';
import { roleHomePath } from '@/lib/roles';

export default function LoginPage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const session = getSession();
  if (session) return <Navigate to={roleHomePath(session.role)} replace />;

  async function submit(values: LoginFormValues) {
    setError('');
    try {
      const data = await loginUser(values);
      saveSession(data);
      await mutate(() => true, undefined, { revalidate: false });
      navigate(roleHomePath(data.role), { replace: true });
    } catch (err) { setError(errorMessage(err)); }
  }

  return <div className="flex min-h-dvh flex-col bg-background text-foreground">
    <header className="flex items-center justify-between px-6 py-6 md:px-12"><Brand /><div className="flex items-center gap-5"><span className="hidden text-sm text-muted-foreground sm:inline">binarycodingspace</span><ThemeToggle /></div></header>
    <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-center lg:grid-cols-2">
      <section className="px-6 py-10 sm:px-12 lg:px-20"><div className="mx-auto flex max-w-sm flex-col gap-9">
        <div className="flex flex-col gap-3"><span className="text-sm font-medium text-primary">WORKSPACE TEACHING FACTORY</span><h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight">Selamat datang<br />kembali.</h1><p className="text-pretty text-base leading-relaxed text-muted-foreground">Satu tempat untuk kehadiran, proyek, dan progres belajarmu.</p></div>
        <LoginForm onSubmit={submit} errorMsg={error} />
        <div className="flex items-start gap-3 border-t pt-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-relaxed">Gunakan akun yang diberikan administrator.<br />Butuh akses? Hubungi pengelola Teaching Factory.</p></div>
      </div></section>
      <section className="hidden h-full max-h-[680px] flex-col px-8 py-6 lg:flex" aria-label="Tentang workspace">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground">
          <img src="/images/tefa-workspace.webp" alt="Meja kerja kolaboratif dengan laptop, buku catatan, dan peralatan pengembangan proyek" className="h-72 w-full flex-1 object-cover" width="1200" height="1200" fetchPriority="high" />
          <div className="p-8 xl:p-10"><div className="flex items-start justify-between gap-5"><h2 className="text-balance text-3xl font-medium leading-tight tracking-tight">Langkah kecil hari ini.<br />Kemampuan besar esok.</h2></div><p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">Belajar lewat karya nyata. Bangun kebiasaan baik, selesaikan target, dan bertumbuh bersama tim.</p><div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><ClipboardCheck className="size-4" />Kehadiran</span><span className="flex items-center gap-2"><Target className="size-4" />Target harian</span><span className="flex items-center gap-2"><Users className="size-4" />Kolaborasi</span></div></div>
        </div>
      </section>
    </main>
    <footer className="flex flex-wrap justify-between gap-2 px-6 py-6 text-sm text-muted-foreground md:px-12"><span>© {new Date().getFullYear()} binarycodingspace</span><span>Belajar. Berkarya. Bertumbuh.</span></footer>
  </div>;
}
