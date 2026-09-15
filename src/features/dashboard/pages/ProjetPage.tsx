import { useState, useEffect } from 'react';
import { FolderKanban, Users, X } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../lib/api';
import { getProjectAnggota, getProjects } from '../absensiService';
import { ProjectAnggotaDTO } from '../../../types/absensi';

interface ProjectView {
  id: number;
  nama: string;
  members: ProjectAnggotaDTO[];
}

export default function ProjetPage() {
  const [projects, setProjects] = useState<ProjectView[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<ProjectView | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Resolve the logged-in user's real id from the session profile.
        const me = await api.get<{ id: number }>('/v1/auth/me');
        const [all, allProjects] = await Promise.all([getProjectAnggota(), getProjects()]);
        const mine = all.filter((pa) => pa.idUser === me.data.id);
        const byProject = new Map<number, ProjectAnggotaDTO[]>();
        for (const pa of all) {
          const list = byProject.get(pa.idProject) || [];
          list.push(pa);
          byProject.set(pa.idProject, list);
        }
        const views: ProjectView[] = mine
          .map((pa) => ({
            id: pa.idProject,
            nama: allProjects.find((p) => p.id === pa.idProject)?.nama || pa.project,
            members: byProject.get(pa.idProject) || [],
          }))
          .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);
        if (!cancelled) setProjects(views);
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat data project dari server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout title="Project" subtitle="Workspace project yang kamu kerjakan.">
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat data project...
        </div>
      ) : errorMsg ? (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}
        >
          {errorMsg}
        </div>
      ) : projects.length === 0 ? (
        <div className="stem-surface p-12 text-center">
          <FolderKanban className="mx-auto mb-3 h-10 w-10" style={{ color: '#8A8F99' }} />
          <p style={{ color: '#8A8F99' }}>Kamu belum ditugaskan ke project manapun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="stem-card cursor-pointer p-5" onClick={() => setSelected(project)}>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
                >
                  <FolderKanban className="h-4 w-4" style={{ color: '#10B981' }} />
                </div>
                <h3 className="font-semibold">{project.nama}</h3>
              </div>
              <p className="mt-2 text-xs" style={{ color: '#8A8F99' }}>{project.members.length} anggota</p>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Popup */}
      {selected && (
        <div className="stem-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="stem-pop stem-surface w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                  <FolderKanban className="h-4 w-4" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 className="font-semibold">{selected.nama}</h3>
                  <p className="text-xs" style={{ color: '#8A8F99' }}>ID: {selected.id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1" style={{ color: '#8A8F99' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-2 text-xs font-medium" style={{ color: '#8A8F99' }}>Anggota project</p>
            {selected.members.length === 0 ? (
              <p className="py-6 text-center text-sm" style={{ color: '#8A8F99' }}>
                Belum ada anggota di project ini.
              </p>
            ) : (
              <ul className="space-y-2">
                {selected.members.map((m) => (
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