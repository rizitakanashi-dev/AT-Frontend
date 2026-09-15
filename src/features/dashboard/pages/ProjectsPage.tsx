import { useState, useEffect, useCallback } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, Users, X } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { getProjects, createProject, updateProject, deleteProject, getProjectAnggota } from '../absensiService';
import { ProjectDTO, ProjectAnggotaDTO } from '../../../types/absensi';
import { USER_KEY } from '../../absensi/services/authService';
import { normalizeRole, ROLES } from '../../../lib/roles';

interface ProjectDetail extends ProjectDTO {
  members: ProjectAnggotaDTO[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<ProjectDTO | null>(null);
  const [nama, setNama] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDTO | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);

  // Admin / PM can manage projects; Guru is view-only.
  const canManage = (() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const role = raw ? normalizeRole(JSON.parse(raw).role || '') : '';
      return role === ROLES.ADMIN || role === ROLES.PM;
    } catch {
      return false;
    }
  })();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await getProjects());
      setErrorMsg('');
    } catch {
      setErrorMsg('Gagal memuat data project.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getProjects();
        if (!cancelled) setProjects(data);
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat data project.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => { setErrorMsg(''); setNama(''); setMode('create'); };
  const openEdit = (p: ProjectDTO) => { setErrorMsg(''); setNama(p.nama); setEditing(p); setMode('edit'); };

  const openDetail = async (p: ProjectDTO) => {
    setErrorMsg('');
    try {
      const all = await getProjectAnggota();
      const members = all.filter((pa) => pa.idProject === p.id);
      setDetail({ ...p, members });
    } catch {
      setErrorMsg('Gagal memuat anggota project.');
    }
  };

  const handleSave = async () => {
    if (!nama.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (mode === 'edit' && editing) {
        await updateProject(editing.id, nama.trim());
      } else {
        await createProject(nama.trim());
      }
      setMode(null);
      setEditing(null);
      await reload();
    } catch {
      setErrorMsg('Gagal menyimpan project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch {
      setErrorMsg('Gagal menghapus project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Projects" subtitle="Kelola data project.">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm" style={{ color: '#8A8F99' }}>{projects.length} project aktif.</div>
        {canManage && (
          <button onClick={openCreate} className="stem-btn stem-btn-primary">
            <Plus className="h-4 w-4" />
            Tambah Project
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>Memuat...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="stem-surface col-span-full p-12 text-center">
              <FolderKanban className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
              <p style={{ color: '#8A8F99' }}>Belum ada project.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="stem-card cursor-pointer p-5" onClick={() => openDetail(project)}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                      <FolderKanban className="h-4 w-4" style={{ color: '#10B981' }} />
                    </div>
                    <h3 className="font-semibold">{project.nama}</h3>
                  </div>
                  {canManage && (
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(project); }} className="rounded-lg p-1.5" style={{ backgroundColor: '#25282E', color: '#10B981' }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }} className="rounded-lg p-1.5" style={{ backgroundColor: '#25282E', color: '#FF6B6B' }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs" style={{ color: '#8A8F99' }}>ID: {project.id}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {mode && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMode(null)}>
          <div className="stem-pop stem-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-semibold">{mode === 'edit' ? 'Edit Project' : 'Tambah Project'}</h3>
            <p className="mb-4 text-sm" style={{ color: '#8A8F99' }}>Nama project baru.</p>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama project..."
              autoFocus
              className="w-full rounded-xl p-3 text-sm focus:outline-none"
              style={{ backgroundColor: '#121316', color: '#FFFFFF', border: '1px solid #2D3036' }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setMode(null)} className="stem-btn stem-btn-ghost">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={submitting || !nama.trim()}
                className="stem-btn stem-btn-primary"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="stem-pop stem-surface w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 font-semibold" style={{ color: '#FF6B6B' }}>Konfirmasi Penghapusan</h3>
            <p className="mb-6 text-sm" style={{ color: '#8A8F99' }}>
              Yakin ingin menghapus project "{deleteTarget.nama}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="stem-btn stem-btn-ghost">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="stem-btn"
                style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
              >
                {submitting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Popup */}
      {detail && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetail(null)}>
          <div className="stem-pop stem-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                  <FolderKanban className="h-4 w-4" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 className="font-semibold">{detail.nama}</h3>
                  <p className="text-xs" style={{ color: '#8A8F99' }}>ID: {detail.id}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="rounded-lg p-1" style={{ color: '#8A8F99' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-2 text-xs font-medium" style={{ color: '#8A8F99' }}>Anggota project</p>
            {detail.members.length === 0 ? (
              <p className="py-6 text-center text-sm" style={{ color: '#8A8F99' }}>
                Belum ada anggota di project ini.
              </p>
            ) : (
              <ul className="space-y-2">
                {detail.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg p-2.5 text-sm" style={{ backgroundColor: '#121316', border: '1px solid #2D3036' }}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#10B981' }}>
                      {(m.username || '?').charAt(0).toUpperCase()}
                    </span>
                    <Users className="h-3.5 w-3.5" style={{ color: '#8A8F99' }} />
                    <span className="min-w-0 flex-1">{m.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}