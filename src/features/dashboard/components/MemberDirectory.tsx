import { useState } from 'react';
import { ArrowUpRight, SearchX } from 'lucide-react';
import type { AbsenRekapDTO, UserDTO } from '@/types/absensi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pagination, SearchInput } from '@/components/WorkspaceControls';
import { AttendanceTable } from './AttendanceTable';

const PAGE_SIZE = 8;

export function MemberDirectory({ roster, recordsByUser }: { roster: UserDTO[]; recordsByUser: Map<number, AbsenRekapDTO[]> }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UserDTO | null>(null);
  const filtered = roster.filter((user) => `${user.nama} ${user.divisi || ''}`.toLocaleLowerCase('id').includes(search.trim().toLocaleLowerCase('id')));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  return (
    <>
      {/* User Directory Table Section */}
      <section className="table-surface" aria-labelledby="members-title">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
          <div><h2 id="members-title" className="section-heading">Kehadiran anggota</h2><p className="mt-1 text-xs text-muted-foreground">Status hari ini, dalam satu tampilan.</p></div>
          <div className="w-full sm:w-52"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari nama atau divisi..." /></div>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Anggota</TableHead><TableHead className="hidden sm:table-cell">Divisi</TableHead><TableHead>Status hari ini</TableHead><TableHead className="text-right"><span className="sr-only">Detail</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((user) => {
              const records = recordsByUser.get(user.id) || [];
              const active = records.some((row) => row.jamMasuk && !row.jamPulang);
              const present = records.some((row) => row.jamMasuk);
              return <TableRow key={user.id}>
                <TableCell><div className="flex items-center gap-3"><Avatar className="size-8 rounded-md"><AvatarFallback>{user.nama.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="max-w-40 truncate text-xs font-medium">{user.nama}</p><p className="text-[10px] text-muted-foreground sm:hidden">{user.divisi || 'Belum ditentukan'}</p></div></div></TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{user.divisi || 'Belum ditentukan'}</TableCell>
                <TableCell><span className="status-label" data-status={active ? 'active' : 'idle'}>{active ? 'Sedang bekerja' : present ? 'Sesi selesai' : 'Belum masuk'}</span></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon-sm" onClick={() => setSelected(user)} aria-label={`Detail ${user.nama}`}><ArrowUpRight /></Button></TableCell>
              </TableRow>;
            })}
            {!filtered.length && <TableRow><TableCell colSpan={4}><div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><SearchX className="mb-1 size-5" /><p className="text-sm">{search ? 'Tidak ada anggota yang cocok.' : 'Belum ada anggota terdaftar.'}</p>{search && <Button variant="link" size="sm" onClick={() => { setSearch(''); setPage(1); }}>Hapus pencarian</Button>}</div></TableCell></TableRow>}
          </TableBody>
        </Table>
        <Pagination page={current} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </section>
      {/* Detail Dialog */}
      {selected && <Dialog open onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{selected.nama}</DialogTitle><DialogDescription>{selected.divisi || 'Divisi belum ditentukan'} · Catatan kehadiran hari ini</DialogDescription></DialogHeader><AttendanceTable rows={recordsByUser.get(selected.id) || []} /></DialogContent></Dialog>}
    </>
  );
}
