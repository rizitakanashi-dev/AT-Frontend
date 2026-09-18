import { Clock, CircleCheck, CircleX, Loader, PartyPopper, Ban, type LucideIcon } from 'lucide-react';
import type { HostingStatusValue } from '@/types/hosting';

export const HOSTING_STATUS_LABELS: Record<HostingStatusValue, string> = {
  pending: 'Menunggu review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  in_progress: 'Sedang diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const HOSTING_STATUS_ICONS: Record<HostingStatusValue, LucideIcon> = {
  pending: Clock,
  approved: CircleCheck,
  rejected: CircleX,
  in_progress: Loader,
  completed: PartyPopper,
  cancelled: Ban,
};

export function hostingStatusVariant(status: HostingStatusValue): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    case 'rejected':
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
}

/** Statuses that represent an ongoing, "live" state worth a subtle pulse in the UI. */
export function hostingStatusLive(status: HostingStatusValue): boolean {
  return status === 'pending' || status === 'in_progress';
}
