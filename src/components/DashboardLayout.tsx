import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { animate, stagger } from 'animejs';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardCheck, 
  History, 
  Users, 
  LogOut, 
  Menu, 
  Target, 
  Building2, 
  CalendarDays, 
  Rocket, 
  Search, 
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '@/features/absensi/services/authService';
import { getSession } from '@/lib/session';
import { roleLabel, normalizeRole, roleHomePath } from '@/lib/roles';
import { Brand } from './Brand';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { ThemeToggle } from '@/features/auth/components/ThemeToggle';
import { useProfile } from '@/features/dashboard/useWorkspace';

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  actions 
}: { 
  children: ReactNode; 
  title: string; 
  subtitle: string; 
  actions?: ReactNode; 
}) {
  const session = useProfile() || getSession();
  const role = normalizeRole(session?.role || '');
  const home = roleHomePath(role);
  const member = role === 'Anggota';
  const devops = role === 'DevOps';
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !mainRef.current) return;
    const page = mainRef.current.querySelector('[data-anime="page"]');
    if (!page) return;
    const groups = mainRef.current.querySelectorAll('[data-anime="stagger"] > *');
    const animations = [
      animate(page, { opacity: [0, 1], translateY: [12, 0], duration: 450, ease: 'out(4)' }),
      animate(groups, { opacity: [0, 1], translateY: [10, 0], delay: stagger(50), duration: 400, ease: 'out(4)' }),
    ];
    return () => animations.forEach((animation) => animation.revert());
  }, [pathname]);

  const { mutate } = useSWRConfig();

  const nav = devops ? [
    { label: 'Dashboard DevOps', icon: Rocket, path: home },
  ] : [
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

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    try { 
      await logoutUser(); 
    } catch { 
      toast.info('Sesi lokal diakhiri.'); 
    } finally {
      await mutate(() => true, undefined, { revalidate: false });
      navigate('/login', { replace: true });
    }
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col justify-between p-4.5">
        <div className="flex flex-col gap-7">
          <div className="px-2 pt-1">
            <Brand />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Menu Utama</p>
            <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
              {nav.map(({ label, icon: Icon, path }) => (
                <NavLink 
                  key={path} 
                  to={path} 
                  end 
                  className="nav-link flex items-center gap-3"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="size-[17px] shrink-0" strokeWidth={1.9} />
                  <span className="text-[13.5px]">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {/* Tefa pulse card */}
          <div className="sidebar-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">Tefa Live</span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="live-dot size-1.5 rounded-full bg-emerald-400" />
                Aktif
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-zinc-200">Teaching Factory Portal</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">Catat kehadiran & target harian.</p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-400">80%</span>
            </div>
          </div>

          {/* User footer */}
          <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8.5 rounded-lg ring-1 ring-white/15">
                <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                  {session?.nama?.slice(0, 2).toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{session?.nama}</p>
                <p className="truncate text-[11px] text-zinc-400">{roleLabel(role)}</p>
              </div>
            </div>
            <Button 
              size="icon-xs" 
              variant="ghost" 
              className="text-zinc-400 hover:bg-white/10 hover:text-white"
              onClick={() => void logout()} 
              disabled={leaving} 
              aria-label="Keluar dari akun"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-shell flex min-h-dvh bg-background text-foreground">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3 focus:text-foreground"
      >
        Lewati navigasi
      </a>

      {/* Desktop Sidebar */}
      <aside className="workspace-sidebar sticky top-0 hidden h-dvh w-64 shrink-0 border-r lg:block">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top Header bar matching SalesOps */}
        <header className="workspace-header sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka navigasi">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-[#0d0f15] p-0 text-white border-zinc-800">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigasi workspace</SheetTitle>
                  <SheetDescription>Menu navigasi Teaching Factory</SheetDescription>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-foreground truncate">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search input matching SalesOps */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="h-8.5 w-44 lg:w-56 rounded-lg border border-border bg-muted/40 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                readOnly
              />
              <kbd className="absolute right-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">⌘K</kbd>
            </div>

            {/* Date pill badge */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
              <CalendarDays className="size-3.5 text-emerald-500" />
              <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Live Role Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
              <span className="live-dot size-1.5 rounded-full bg-emerald-500" />
              <span>{roleLabel(role)}</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Avatar Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-xs">
                {session?.nama?.slice(0, 2).toUpperCase() || 'US'}
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main id="main-content" ref={mainRef} className="flex-1 mx-auto w-full max-w-[1400px] p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                <span>Teaching Factory Workspace</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          <div key={pathname} data-anime="page">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
