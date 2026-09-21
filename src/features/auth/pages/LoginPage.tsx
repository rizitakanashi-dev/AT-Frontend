import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Users,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
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
    } catch (err) { 
      setError(errorMessage(err)); 
    }
  }

  return (
    <div className="login-page flex min-h-dvh flex-col justify-between">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Brand />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="live-dot size-1.5 rounded-full bg-emerald-500" />
            <span>Portal Aktif</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="login-frame mx-auto grid w-full max-w-[1100px] overflow-hidden lg:grid-cols-12">
          
          {/* Left Showcase Side (SalesOps Inspired) */}
          <section className="login-showcase-panel relative hidden min-h-[580px] p-10 lg:col-span-6 lg:flex lg:flex-col lg:justify-between">
            {/* Ambient glow backgrounds */}
            <div className="absolute -left-20 -top-20 size-72 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-teal-500/15 blur-3xl" aria-hidden="true" />

            {/* Top Badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Sparkles className="size-3.5" />
                <span>Teaching Factory Operations</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                Satu dashboard.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  Semua progres tim.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 max-w-md">
                Pantau rekap kehadiran harian, kelola target kerja divisi, dan track deployment proyek dalam satu platform terpadu.
              </p>
            </div>

            {/* Simulated Live Ops Preview Card */}
            <div className="relative z-10 my-6 rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">Live Attendance Rate</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">94.8%</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Hadir</p>
                  <p className="mt-1 text-lg font-bold text-white">42</p>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center">
                    <ArrowUpRight className="size-2.5" /> +12%
                  </span>
                </div>
                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Target Selesai</p>
                  <p className="mt-1 text-lg font-bold text-white">128</p>
                  <span className="text-[10px] text-teal-400 font-medium flex items-center">
                    <CheckCircle2 className="size-2.5 mr-0.5" /> 88%
                  </span>
                </div>
                <div className="rounded-lg bg-white/5 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Proyek</p>
                  <p className="mt-1 text-lg font-bold text-white">8</p>
                  <span className="text-[10px] text-zinc-400 font-medium">Aktif</span>
                </div>
              </div>

              {/* Mini Trend Bar */}
              <div className="mt-4 flex items-end gap-1.5 h-10 pt-2">
                <div className="flex-1 bg-emerald-500/30 rounded-t h-[40%]" />
                <div className="flex-1 bg-emerald-500/40 rounded-t h-[65%]" />
                <div className="flex-1 bg-emerald-500/50 rounded-t h-[50%]" />
                <div className="flex-1 bg-emerald-500/70 rounded-t h-[85%]" />
                <div className="flex-1 bg-emerald-500 rounded-t h-[100%]" />
              </div>
            </div>

            {/* Bottom features list */}
            <div className="relative z-10 flex items-center gap-6 text-xs text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ClipboardCheck className="size-4 text-emerald-400" />
                Absensi Real-time
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="size-4 text-teal-400" />
                Target Harian
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-emerald-400" />
                Multi-role
              </span>
            </div>
          </section>

          {/* Right Form Side */}
          <section className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-3.5" />
                  <span>Portal Masuk</span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Selamat Datang
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Masukkan nama pengguna dan kata sandi akun Anda.
                </p>
              </div>

              <LoginForm onSubmit={submit} errorMsg={error} />

              <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <p className="leading-relaxed">
                  Akses diamankan dengan enkripsi sesi server. Hubungi Administrator jika lupa kata sandi.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-muted-foreground md:px-12">
        <span>© {new Date().getFullYear()} Teaching Factory · binarycodingspace</span>
        <span className="hidden sm:inline">Teaching Factory Management Platform</span>
      </footer>
    </div>
  );
}
