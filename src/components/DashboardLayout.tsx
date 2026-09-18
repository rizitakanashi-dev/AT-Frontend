import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { LayoutDashboard, FolderKanban, ClipboardCheck, History, Users, LogOut, Menu, Target, Building2, CalendarDays, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '@/features/absensi/services/authService';
import { getSession } from '@/lib/session';
import { roleLabel, normalizeRole, roleHomePath } from '@/lib/roles';
import { Brand } from './Brand';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { ThemeToggle } from '@/features/auth/components/ThemeToggle';
import { useProfile } from '@/features/dashboard/useWorkspace';

export default function DashboardLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle: string; actions?: ReactNode }) {
  const session = useProfile() || getSession();
  const role = normalizeRole(session?.role || '');
  const home = roleHomePath(role);
  const member = role === 'Anggota';
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mutate } = useSWRConfig();
  const nav = [
    { label: 'Ringkasan', icon: LayoutDashboard, path: home },
    { label: member ? 'Absensi saya' : 'Rekap kehadiran', icon: ClipboardCheck, path: `${home}/absensi` },
    { label: member ? 'Proyek saya' : 'Proyek', icon: FolderKanban, path: `${home}/${member ? 'project' : 'projects'}` },
    { label: 'Target kerja', icon: Target, path: `${home}/targets` },
    ...(member ? [{ label: 'Riwayat', icon: History, path: `${home}/riwayat` }] : [{ label: 'Pengguna', icon: Users, path: `${home}/users` }]),
    ...(role === 'Admin' ? [{ label: 'Divisi & referensi', icon: Building2, path: '/admin/divisions' }] : []),
  ];

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    try { await logoutUser(); }
    catch { toast.info('Sesi lokal diakhiri. Server belum dapat mengonfirmasi logout.'); }
    finally {
      await mutate(() => true, undefined, { revalidate: false });
      navigate('/login', { replace: true });
    }
  }

  function SidebarContent() {
    return <div className="flex h-full flex-col justify-between p-5">
      <div className="flex flex-col gap-9">
        <Brand />
        <div className="flex flex-col gap-3"><p className="px-3 text-sm text-muted-foreground">Workspace</p><nav aria-label="Navigasi utama" className="flex flex-col gap-1">{nav.map(({ label, icon: Icon, path }) => <NavLink key={path} to={path} end className="nav-link" onClick={() => setMenuOpen(false)}><Icon className="size-[18px]" strokeWidth={1.7} />{label}</NavLink>)}</nav></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-muted p-4 text-muted-foreground"><p className="font-medium text-foreground">Sedikit progres, setiap hari.</p><p className="mt-1 text-sm leading-relaxed">Catat kehadiran. Kerjakan target. Tumbuh bersama.</p></div>
        <Separator />
        <div className="flex items-center gap-3"><Avatar><AvatarFallback>{session?.nama.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate font-medium">{session?.nama}</p><p className="text-sm text-muted-foreground">{roleLabel(role)}</p></div><Button size="icon" variant="ghost" onClick={() => void logout()} disabled={leaving} aria-label="Keluar dari akun"><LogOut /></Button></div>
      </div>
    </div>;
  }

  return <div className="flex min-h-dvh bg-background text-foreground">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3 focus:text-foreground">Lewati navigasi</a>
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-card text-card-foreground lg:block"><SidebarContent /></aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/95 px-5 text-foreground backdrop-blur-sm md:px-9">
        <div className="flex items-center gap-3"><Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger asChild><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka navigasi"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-72"><SheetHeader className="sr-only"><SheetTitle>Navigasi workspace</SheetTitle><SheetDescription>Menu sesuai peran akun Anda.</SheetDescription></SheetHeader><SidebarContent /></SheetContent></Sheet><span className="hidden text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden size-4 text-muted-foreground sm:block" /><span className="font-medium">{title}</span></div>
        <div className="flex items-center gap-4"><span className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><CalendarDays className="size-4" />{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span><ThemeToggle /></div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1440px] px-5 py-8 md:px-9 md:py-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-balance text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1><p className="mt-1 text-pretty text-muted-foreground">{subtitle}</p></div>{actions}</div>
        <div key={pathname} className="page-enter">{children}</div>
      </main>
    </div>
  </div>;
}
