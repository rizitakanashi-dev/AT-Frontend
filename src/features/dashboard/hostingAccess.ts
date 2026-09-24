import type { HostingRequestDTO, HostingStatusValue } from '@/types/hosting';
import type { UserDTO } from '@/types/absensi';
import { isAnggota } from '@/lib/roles';

export const DEVOPS_STATUSES: HostingStatusValue[] = ['approved', 'in_progress', 'completed'];

export function canViewHosting(role: string, status: HostingStatusValue) {
  return role === 'Admin' || role === 'PM' || (role === 'DevOps' && DEVOPS_STATUSES.includes(status));
}

export function hostingPermissions(user: Pick<UserDTO, 'id' | 'role'> | undefined, request: HostingRequestDTO) {
  const admin = user?.role === 'Admin';
  const owner = !!user && isAnggota(user.role) && user.id === request.idUser;
  const view = !!user && (owner || canViewHosting(user.role, request.status));
  const editable = request.status === 'pending' || request.status === 'rejected';
  const handler = admin || (user?.role === 'DevOps' && user.id === request.idDevOpsHandler);
  return {
    view,
    edit: view && editable && (admin || owner),
    review: view && request.status === 'pending' && (admin || user?.role === 'PM'),
    start: view && request.status === 'approved' && (admin || user?.role === 'DevOps'),
    complete: view && request.status === 'in_progress' && handler,
    notes: view && ['in_progress', 'completed'].includes(request.status) && handler,
    delete: view && admin,
    resubmit: owner && request.status === 'rejected',
  };
}

export function safeHostingUrl(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

/**
 * Parse input tautan hosting saat menyelesaikan request.
 * Tautan opsional (sesuai backend): kosong = sah, tanpa URL.
 * Isi non-kosong wajib tautan HTTP/HTTPS yang aman.
 */
export function parseHostingUrlInput(value: string): { valid: true; url?: string } | { valid: false } {
  const raw = value.trim();
  if (!raw) return { valid: true };
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw);
  if (hasScheme) {
    const url = safeHostingUrl(raw);
    return url ? { valid: true, url } : { valid: false };
  }
  // Path tanpa host (diawali "/") bukan tautan lengkap.
  if (raw.startsWith('/')) return { valid: false };
  // Domain polos tanpa skema (mis. "projek.vercel.app") dianggap https://.
  const url = safeHostingUrl(`https://${raw}`);
  return url ? { valid: true, url } : { valid: false };
}
