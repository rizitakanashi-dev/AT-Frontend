import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  ClipboardCheck,
  History,
  Users,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import { logoutUser, USER_KEY } from '../features/absensi/services/authService';
import { roleLabel, normalizeRole } from '../lib/roles';
import { Camera } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const roleNavMap: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Home', icon: Home, path: '/admin' },
    { label: 'Project', icon: FolderKanban, path: '/admin/projects' },
    { label: 'User', icon: Users, path: '/admin/users' },
  ],
  PM: [
    { label: 'Home', icon: Home, path: '/pm' },
    { label: 'Project', icon: FolderKanban, path: '/pm/projects' },
    { label: 'User', icon: Users, path: '/pm/users' },
  ],
  Guru: [
    { label: 'Home', icon: Home, path: '/guru' },
    { label: 'Project', icon: FolderKanban, path: '/guru/projects' },
    { label: 'User', icon: Users, path: '/guru/users' },
  ],
  Anggota: [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Project', icon: FolderKanban, path: '/dashboard/project' },
    { label: 'Absensi', icon: ClipboardCheck, path: '/dashboard/absensi' },
    { label: 'Riwayat', icon: History, path: '/dashboard/riwayat' },
  ],
};

function getRole(user: Record<string, unknown>): string {
  return (user.role as string) || 'Anggota';
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const userStr = localStorage.getItem(USER_KEY);
  const user: Record<string, unknown> = userStr ? JSON.parse(userStr) : {};
  const role = normalizeRole(getRole(user));
  const nama = (user.nama as string) || (user.Nama as string) || 'User';
  const navItems = roleNavMap[role] || roleNavMap.Anggota;
  const displayRole = roleLabel(role);

  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem(`avatar_${nama}`));
  const avatarInitial = (nama || 'U').charAt(0).toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      localStorage.setItem(`avatar_${nama}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#121316', color: '#FFFFFF' }}>
      {/* Sidebar */}
      <aside
        className="flex w-64 shrink-0 flex-col justify-between border-r p-5"
        style={{ borderColor: '#2D3036', backgroundColor: '#18191C' }}
      >
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold">binarycodingspace</span>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ backgroundColor: '#1E2024', borderColor: '#2D3036' }}>
            <label className="group relative cursor-pointer" title="Ganti foto profil">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatar ? (
                <img src={avatar} alt={nama} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#10B981' }}>
                  {avatarInitial}
                </span>
              )}
              <span
                className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[#121316] opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: '#10B981' }}
              >
                <Camera className="h-3 w-3" />
              </span>
            </label>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{nama}</p>
              <p className="text-xs" style={{ color: '#10B981' }}>{displayRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <div key={label} className="relative">
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: '#10B981', boxShadow: '0 0 12px rgba(16,185,129,0.6)' }}
                    />
                  )}
                  <button
                    onClick={() => navigate(path)}
                    className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200"
                    style={
                      active
                        ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', fontWeight: 500 }
                        : { color: '#8A8F99' }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#8A8F99';
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200"
          style={{ color: '#FF6B6B', borderColor: 'rgba(255,107,107,0.18)', backgroundColor: 'rgba(255,107,107,0.06)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.14)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.06)'; }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4 backdrop-blur" style={{ borderColor: '#2D3036', backgroundColor: 'rgba(18,19,22,0.85)' }}>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs" style={{ color: '#8A8F99' }}>{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-lg px-3 py-2 text-xs font-medium sm:block" style={{ backgroundColor: '#1E2024', color: '#8A8F99', border: '1px solid #2D3036' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#8A8F99' }} />
              <input
                placeholder="Cari..."
                className="w-56 rounded-lg py-2 pl-9 pr-3 text-sm transition-all focus:outline-none"
                style={{ backgroundColor: '#1E2024', color: '#FFFFFF', border: '1px solid #2D3036' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2D3036'; }}
              />
            </div>
            <button
              className="rounded-lg p-2 transition-all hover:border-lime-500/30"
              style={{ backgroundColor: '#1E2024', color: '#8A8F99', border: '1px solid #2D3036' }}
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
