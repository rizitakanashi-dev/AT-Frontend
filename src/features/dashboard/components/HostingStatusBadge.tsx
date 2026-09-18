import type { HostingStatusValue } from '@/types/hosting';
import { HOSTING_STATUS_LABELS, HOSTING_STATUS_ICONS, hostingStatusVariant, hostingStatusLive } from '../hostingStatus';
import { Badge } from '@/components/ui/badge';

export function HostingStatusBadge({ status }: { status: HostingStatusValue }) {
  const Icon = HOSTING_STATUS_ICONS[status];
  const live = hostingStatusLive(status);
  return <Badge variant={hostingStatusVariant(status)} className="gap-1.5">
    {live ? <span className="live-dot text-current"><Icon className={status === 'in_progress' ? 'size-3 animate-spin' : 'size-3'} /></span> : <Icon className="size-3" />}
    {HOSTING_STATUS_LABELS[status]}
  </Badge>;
}
