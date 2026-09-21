import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { ClipboardCheck, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
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

  return <div className="login-page flex min-h-dvh flex-col bg-background text-foreground">
    <header className="login-header flex items-center justify-between px-6 py-6 md:px-10"><Brand /><div className="flex items-center gap-5"><span className="hidden text-xs font-medium uppercase tracking-[.16em] text-muted-foreground sm:inline">Workspace Tefa</span><ThemeToggle /></div></header>
    <main className="login-stage flex flex-1 items-center px-4 pb-8 sm:px-6 lg:px-10">
      <div className="login-frame mx-auto grid w-full max-w-[1220px] overflow-hidden lg:grid-cols-[1.16fr_minmax(360px,.84fr)]">
        <section className="login-workspace-panel relative hidden min-h-[620px] overflow-hidden lg:flex lg:flex-col" aria-label="Ringkasan workspace Teaching Factory"><div className="login-workspace-rings" aria-hidden="true"><span /><span /><span /></div><div className="relative z-10 flex h-full flex-col justify-between p-10"><div className="login-art-kicker"><Sparkles className="size-3.5" /> Absensi Tefa</div><div className="login-workspace-copy max-w-xs"><p className="login-section-label">Workspace snapshot</p><h2 className="mt-3 text-balance text-4xl font-semibold leading-tight">Kerja rapi,<br />progres terasa.</h2><p className="mt-4 text-sm leading-relaxed">Satu ruang untuk menjaga ritme kehadiran, target harian, dan kolaborasi tim.</p></div><div className="login-workspace-board" aria-hidden="true"><div className="login-board-top"><span /><span /><span /></div><div className="login-board-grid"><div className="login-board-chart"><i /><i /><i /><i /><i /></div><div className="login-board-list"><span /><span /><span /></div></div><div className="login-board-footer"><b>Weekly focus</b><strong>84%</strong></div></div><div className="flex flex-wrap gap-5 text-xs font-medium"><span className="flex items-center gap-2"><ClipboardCheck className="size-4" />Kehadiran</span><span className="flex items-center gap-2"><Target className="size-4" />Target harian</span><span className="flex items-center gap-2"><Users className="size-4" />Kolaborasi</span></div></div></section>
        <section className="login-panel login-form-panel flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 lg:py-14"><div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-primary"><span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-3.5" /></span> Workspace Tefa</div>
          <div className="flex flex-col gap-3"><h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight">Masuk untuk<br />melanjutkan.</h1><p className="text-pretty text-sm leading-relaxed text-muted-foreground">Kelola kehadiran, proyek, dan progres belajar timmu.</p></div>
          <div className="mt-8"><LoginForm onSubmit={submit} errorMsg={error} /></div>
          <div className="mt-8 flex items-start gap-3 border-t pt-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p className="text-xs leading-relaxed">Gunakan akun yang diberikan administrator.<br />Butuh akses? Hubungi pengelola Teaching Factory.</p></div>
        </div></section>
      </div>
    </main>
    <footer className="flex flex-wrap justify-between gap-2 px-6 py-5 text-xs text-muted-foreground md:px-10"><span>© {new Date().getFullYear()} binarycodingspace</span><span>Belajar. Berkarya. Bertumbuh.</span></footer>
  </div>;
}
