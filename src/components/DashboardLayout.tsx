import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { LayoutDashboard, FolderKanban, ClipboardCheck, History, Users, LogOut, Menu, Target, Building2, CalendarDays, Rocket, Search, ChevronRight, ArrowUpRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '@/features/absensi/services/authService';
import { getSession } from '@/lib/session';
import { roleLabel, normalizeRole, roleHomePath } from '@/lib/roles';
import { Brand } from './Brand';
import { PageMotion } from './PageMotion';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { InputGroup, InputGroupInput, InputGroupAddon } from './ui/input-group';
import { ThemeToggle } from '@/features/auth/components/ThemeToggle';
import { useProfile } from '@/features/dashboard/useWorkspace';

export default function DashboardLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle: string; actions?: ReactNode }) {
  const session = useProfile() || getSession();
  const role = normalizeRole(session?.role || '');
  const home = roleHomePath(role);
  const member = role === 'Anggota';
  const devops = role === 'DevOps';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (event.isComposing || event.keyCode === 229) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  const nav = devops ? [{ label: 'Dashboard DevOps', icon: Rocket, path: home }] : [
    { label: 'Ringkasan', icon: LayoutDashboard, path: home },
    { label: member ? 'Absensi saya' : 'Rekap kehadiran', icon: ClipboardCheck, path: `${home}/absensi` },
    { label: member ? 'Proyek saya' : 'Proyek', icon: FolderKanban, path: `${home}/${member ? 'project' : 'projects'}` },
    { label: 'Target kerja', icon: Target, path: `${home}/targets` },
    ...(member ? [{ label: 'Hosting saya', icon: Rocket, path: `${home}/hosting` }] : []),
    ...(role === 'PM' ? [{ label: 'Review hosting', icon: Rocket, path: `${home}/hosting` }] : []),
    ...(role === 'Admin' ? [{ label: 'Hosting', icon: Rocket, path: `${home}/hosting` }] : []),
    ...(member ? [{ label: 'Riwayat', icon: History, path: `${home}/riwayat` }] : [{ label: 'Pengguna', icon: Users, path: `${home}/users` }]),
    ...(role === 'Admin' ? [{ label: 'Divisi & referensi', icon: Building2, path: '/admin/divisions' }] : []),
  ];
  const matchingNav = nav.filter((item) => item.label.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id')));

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    try { await logoutUser(); }
    catch { toast.info('Sesi lokal diakhiri.'); }
    finally {
      await mutate(() => true, undefined, { revalidate: false });
      navigate('/login', { replace: true });
    }
  }

  function renderSidebar() {
    return (
      <div className="flex h-full flex-col px-4 py-6">
        <div className="px-2"><Brand /></div>
        <div className="mt-8 flex items-center gap-2.5 rounded-lg border border-sidebar-border px-3 py-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border text-xs font-semibold">TF</span>
          <div className="min-w-0"><p className="truncate text-xs font-medium">Workspace internal</p><p className="text-[10px] text-muted-foreground">{roleLabel(role)}</p></div>
        </div>
        <div className="mt-7 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <p className="sidebar-label">Workspace</p>
          <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
            {nav.map(({ label, icon: Icon, path }) => <NavLink key={path} to={path} end className="nav-link" onClick={() => setMenuOpen(false)}><Icon className="size-[17px] shrink-0" strokeWidth={1.7} /><span>{label}</span></NavLink>)}
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex items-start gap-2.5 px-2 text-muted-foreground"><BookOpen className="mt-0.5 size-4 shrink-0" /><p className="text-[11px] leading-relaxed">Ruang belajar, berkarya,<br />dan tumbuh bersama.</p></div>
          {/* User footer */}
          <div className="flex items-center gap-2.5 border-t border-sidebar-border pt-4">
            <Avatar className="size-8 rounded-md"><AvatarFallback>{session?.nama?.slice(0, 2).toUpperCase() || 'TF'}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{session?.nama}</p><p className="text-[10px] text-muted-foreground">{roleLabel(role)}</p></div>
            <Button size="icon-sm" variant="ghost" onClick={() => void logout()} disabled={leaving} aria-label="Keluar dari akun"><LogOut /></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-shell flex text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">Lewati navigasi</a>
      {/* Desktop Sidebar */}
      <aside className="workspace-sidebar sticky top-0 hidden h-dvh w-56 shrink-0 border-r min-[900px]:block">{renderSidebar()}</aside>
      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="workspace-header sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b px-5 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild><Button size="icon-sm" variant="ghost" className="min-[900px]:hidden" aria-label="Buka navigasi"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="workspace-sidebar w-72 p-0">
                <SheetHeader className="sr-only"><SheetTitle>Navigasi workspace</SheetTitle><SheetDescription>Menu navigasi Teaching Factory</SheetDescription></SheetHeader>
                {renderSidebar()}
              </SheetContent>
            </Sheet>
            <span className="hidden text-xs text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden size-3 text-muted-foreground sm:block" />
            <span className="truncate text-xs font-medium">{nav.find((item) => item.path === pathname)?.label || title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setSearchOpen(true); }} aria-label="Cari halaman workspace"><Search /><span className="hidden text-xs sm:inline">Cari halaman</span><kbd className="hidden rounded border px-1.5 text-[10px] text-muted-foreground xl:inline">Ctrl K</kbd></Button>
            <span className="mx-1 h-5 border-l" /><ThemeToggle />
          </div>
        </header>
        {/* Workspace Body */}
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1480px] flex-1 px-5 py-7 outline-none md:px-7 md:py-8 xl:px-9">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl"><p className="workspace-kicker">Teaching Factory / {roleLabel(role)}</p><h1 className="text-2xl font-medium tracking-tight md:text-[28px]">{title}</h1><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p></div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          <PageMotion key={pathname}>{children}</PageMotion>
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[10px] text-muted-foreground"><span>Absensi Tefa · Teaching Factory</span><span className="flex items-center gap-1.5"><CalendarDays className="size-3" />{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></footer>
        </main>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cari halaman</DialogTitle><DialogDescription>Buka halaman yang tersedia untuk peranmu.</DialogDescription></DialogHeader>
          <InputGroup><InputGroupInput aria-label="Nama halaman" placeholder="Misalnya: proyek atau kehadiran" value={query} onChange={(event) => setQuery(event.target.value)} /><InputGroupAddon><Search /></InputGroupAddon></InputGroup>
          <nav aria-label="Hasil pencarian" className="flex flex-col gap-1">
            {matchingNav.map(({ label, icon: Icon, path }) => <NavLink key={path} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-accent" to={path} onClick={() => setSearchOpen(false)}><Icon className="size-4 text-muted-foreground" />{label}<ArrowUpRight className="ml-auto size-4 text-muted-foreground" /></NavLink>)}
            {!matchingNav.length && <p role="status" className="py-6 text-center text-sm text-muted-foreground">Tidak ada halaman yang cocok.</p>}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
