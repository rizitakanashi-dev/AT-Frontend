import type { AbsenRekapDTO } from '@/types/absensi';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/DataState';

export function AttendanceTable({ rows, personal = false }: { rows: AbsenRekapDTO[]; personal?: boolean }) {
  if (!rows.length) return <EmptyState title="Belum ada catatan kehadiran" description="Catatan masuk dan pulang akan muncul di sini. Coba tanggal atau pencarian lain." />;
  return <Table><TableHeader><TableRow>{!personal && <TableHead>Anggota</TableHead>}<TableHead>Proyek & target</TableHead><TableHead>Masuk</TableHead><TableHead>Pulang</TableHead><TableHead>Status target</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.idAbsensi}>{!personal && <TableCell><p className="font-medium">{row.nama}</p><p className="text-sm text-muted-foreground">{row.divisi || 'Tanpa divisi'}</p></TableCell>}<TableCell><p className="font-medium">{row.project || 'Tanpa proyek'}</p><p className="max-w-md whitespace-normal text-sm text-muted-foreground">{row.target || 'Tidak ada target'}</p></TableCell><TableCell><span className="tabular-nums">{row.jamMasuk || '—'}</span></TableCell><TableCell><span className="tabular-nums">{row.jamPulang || '—'}</span></TableCell><TableCell><Badge variant="secondary">{row.status || 'Belum ditentukan'}</Badge></TableCell></TableRow>)}</TableBody></Table>;
}
