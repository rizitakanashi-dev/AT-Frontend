import { useState } from 'react';
import useSWR from 'swr';
import { FolderKanban, Plus, Pencil, Trash2, ArrowUpRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { getProjects, createProject, updateProject, deleteProject, getProjectAnggota } from '../absensiService';
import type { ProjectDTO } from '@/types/absensi';
import { normalizeRole } from '@/lib/roles';
import { useProfile, useRefreshWorkspace } from '../useWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ErrorState, LoadingState, EmptyState } from '@/components/DataState';
import { SearchInput, ConfirmDelete } from '@/components/WorkspaceControls';
import { NameDialog } from '@/components/NameDialog';
import { ProjectMembers } from '../components/ProjectMembers';

export default function ProjectsPage() {
  const user = useProfile();
  const role = normalizeRole(user?.role || '');
  const personal = role === 'Anggota';
  const canManage = role === 'Admin' || role === 'PM';
  const refresh = useRefreshWorkspace();
  const { data, error, isLoading, mutate } = useSWR(user ? ['projects-workspace', user.id] : null, async () => {
    const [projects, members] = await Promise.all([getProjects(), getProjectAnggota()]);
    return { members, projects: personal ? projects.filter((project) => members.some((member) => member.idProject === project.id && member.idUser === user?.id)) : projects };
  });
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<ProjectDTO | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ProjectDTO | null>(null);
  const [selected, setSelected] = useState<ProjectDTO | null>(null);
  const projects = (data?.projects || []).filter((project) => project.nama.toLowerCase().includes(search.toLowerCase()));

  return <DashboardLayout title={personal ? 'Proyek saya' : 'Proyek'} subtitle={personal ? 'Ruang kolaborasi untuk karya yang sedang kamu bangun.' : 'Kelola proyek dan tempatkan anggota di tim yang tepat.'} actions={canManage && <Button onClick={() => setEditor('new')}><Plus data-icon="inline-start" />Tambah proyek</Button>}><div className="page-stack"><div className="flex flex-wrap items-center justify-between gap-3"><SearchInput value={search} onChange={setSearch} placeholder="Cari proyek..." />{data && !error && <p className="text-muted-foreground">{projects.length} proyek</p>}</div>{error ? <ErrorState error={error} retry={() => void mutate()} /> : isLoading || !data ? <LoadingState /> : !projects.length ? <div className="table-surface"><EmptyState title={search ? 'Proyek tidak ditemukan' : 'Belum ada proyek'} description={personal ? 'Proyek yang ditugaskan kepadamu akan tampil di sini.' : 'Tambahkan proyek baru atau coba kata pencarian lain.'} /></div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => { const count = data.members.filter((member) => member.idProject === project.id).length; return <Card key={project.id}><CardHeader><div className="mb-4 flex items-center justify-between gap-2"><span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary"><FolderKanban className="size-5" /></span>{canManage && <div className="flex items-center gap-1"><Button size="icon" variant="ghost" onClick={() => setEditor(project)} aria-label={`Edit ${project.nama}`}><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => setDeleting(project)} aria-label={`Hapus ${project.nama}`}><Trash2 /></Button></div>}</div><CardTitle>{project.nama}</CardTitle><CardDescription>Proyek Teaching Factory</CardDescription></CardHeader><CardContent><p className="flex items-center gap-2 text-muted-foreground"><Users className="size-4" />{count} anggota berkolaborasi</p></CardContent><CardFooter><Button variant="ghost" className="w-full justify-between" onClick={() => setSelected(project)}>Lihat anggota<ArrowUpRight data-icon="inline-end" /></Button></CardFooter></Card>; })}</div>}</div>{editor && <NameDialog title={editor === 'new' ? 'Tambah proyek' : 'Edit proyek'} label="Nama proyek" initial={editor === 'new' ? '' : editor.nama} onClose={() => setEditor(null)} onSave={async (name) => { if (editor === 'new') await createProject(name); else await updateProject(editor.id, name); toast.success('Proyek disimpan.'); await refresh(); }} />}{deleting && <ConfirmDelete title="Hapus proyek?" description={`Proyek “${deleting.nama}” akan dihapus. Tindakan ini tidak dapat dibatalkan dan dapat ditolak bila proyek masih memiliki data terkait.`} onClose={() => setDeleting(null)} onConfirm={async () => { await deleteProject(deleting.id); toast.success('Proyek dihapus.'); await refresh(); }} />}{selected && <ProjectMembers project={selected} canManage={canManage} onClose={() => setSelected(null)} />}</DashboardLayout>;
}
