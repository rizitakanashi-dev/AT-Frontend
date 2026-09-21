import { useState } from 'react';
import { ArrowDownAZ, ArrowUpAZ, Building2, Eye, Pencil, Trash2 } from 'lucide-react';
import type { UserDTO } from '@/types/absensi';
import { normalizeRole, roleLabel } from '@/lib/roles';
import { canManageUser } from '../absensiService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/DataState';
import { Pagination, SearchInput } from '@/components/WorkspaceControls';

export function UserDirectory({ users, admin, onEdit, onDelete, onView }: {
  users: UserDTO[];
  admin: boolean;
  onEdit: (user: UserDTO) => void;
  onDelete: (user: UserDTO) => void;
  onView: (user: UserDTO) => void;
}) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [descending, setDescending] = useState(false);
  const roles = admin ? ['all', 'Anggota', 'Guru', 'PM', 'DevOps', 'Admin'] : ['all'];
  const query = search.trim().toLocaleLowerCase('id-ID');
  const matchesRole = (userRole: string) => role === 'all' || normalizeRole(userRole) === normalizeRole(role);
  const filtered = users.filter((user) => matchesRole(user.role) && `${user.nama} ${user.divisi || ''} ${roleLabel(user.role)}`.toLocaleLowerCase('id-ID').includes(query))
    .sort((a, b) => (descending ? -1 : 1) * a.nama.localeCompare(b.nama, 'id'));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));

  return (
    <Tabs value={role} onValueChange={(value) => { setRole(value); setPage(1); }} className="min-w-0 gap-5">
      <div className="min-w-0 overflow-x-auto pb-2">
        <TabsList variant="line" aria-label="Filter peran pengguna" className="min-h-11">
          {roles.map((item) => (
            <TabsTrigger key={item} value={item} className="min-h-11 px-3">
              {item === 'all' ? 'Semua pengguna' : item === 'Anggota' ? 'Pelajar' : item}
              <span className="tabular-nums">{users.filter((user) => item === 'all' || normalizeRole(user.role) === normalizeRole(item)).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {roles.map((item) => (
        <TabsContent key={item} value={item} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Cari nama, peran, atau divisi..." />
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground" role="status">{filtered.length} pengguna</p>
              <Button variant="outline" size="sm" onClick={() => { setDescending(!descending); setPage(1); }} aria-label={descending ? 'Urutkan nama A ke Z' : 'Urutkan nama Z ke A'}>
                {descending ? <ArrowUpAZ data-icon="inline-start" /> : <ArrowDownAZ data-icon="inline-start" />}
                {descending ? 'Z–A' : 'A–Z'}
              </Button>
            </div>
          </div>
          <div className="table-surface user-directory">
            {!filtered.length ? (
              <div className="flex flex-col items-center pb-6">
                <EmptyState title={query ? 'Tidak ada hasil yang cocok' : 'Belum ada pengguna'} description={query ? 'Coba nama, peran, atau divisi lain.' : 'Pengguna yang ditambahkan akan muncul di sini.'} />
                {(query || role !== 'all') && <Button variant="outline" onClick={() => { setSearch(''); setRole('all'); setPage(1); }}>Reset filter</Button>}
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Pengguna</TableHead><TableHead className="hidden sm:table-cell">Peran</TableHead><TableHead className="hidden md:table-cell">Divisi</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.slice((current - 1) * 10, current * 10).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden size-10 sm:flex"><AvatarFallback>{user.nama.trim().split(/\s+/).slice(0, 2).map((name) => name[0]).join('').toUpperCase()}</AvatarFallback></Avatar>
                          <div className="flex min-w-0 flex-col gap-1"><p className="max-w-36 truncate font-medium sm:max-w-48" title={user.nama}>{user.nama}</p><span className="sm:hidden"><Badge variant="secondary">{roleLabel(user.role)}</Badge></span><p className="max-w-36 truncate text-sm text-muted-foreground sm:max-w-48 md:hidden" title={user.divisi || 'Tanpa divisi'}>{user.divisi || 'Tanpa divisi'}</p></div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant={['DevOps', 'PM', 'Admin'].includes(normalizeRole(user.role)) ? 'outline' : 'secondary'}>{roleLabel(user.role)}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell"><span className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-4 shrink-0" />{user.divisi || 'Tanpa divisi'}</span></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onView(user)} aria-label={`Lihat ${user.nama}`} title="Lihat profil"><Eye /></Button>
                          {admin && canManageUser(user.role) && <>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label={`Edit ${user.nama}`} title="Edit pengguna"><Pencil /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(user)} aria-label={`Hapus ${user.nama}`} title="Hapus pengguna"><Trash2 /></Button>
                          </>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Pagination page={current} total={filtered.length} onChange={setPage} />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
