import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { errorMessage } from '@/lib/api';

export function LoadingState() {
  return <div className="flex flex-col gap-4" role="status" aria-label="Memuat data"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /><span className="sr-only">Memuat data...</span></div>;
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return <Alert variant="destructive"><AlertCircle /><AlertTitle>Data belum dapat dimuat</AlertTitle><AlertDescription><p>{errorMessage(error)}</p>{retry && <Button variant="outline" size="sm" onClick={retry}><RefreshCw data-icon="inline-start" />Coba lagi</Button>}</AlertDescription></Alert>;
}

export function EmptyState({ title = 'Belum ada data', description = 'Data akan muncul di sini setelah ditambahkan.' }: { title?: string; description?: string }) {
  return <Empty className="min-h-52"><EmptyHeader><EmptyMedia variant="icon"><Inbox /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader></Empty>;
}
