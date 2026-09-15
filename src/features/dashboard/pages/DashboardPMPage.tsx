import { useState, useEffect } from 'react';
import { Users, FolderKanban, UserCheck } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../lib/api';
import { getProjectAnggota, getProjects, getRekapAbsensi, todayISO } from '../absensiService';
import { ProjectDTO, UserDTO } from '../../../types/absensi';

interface TeamRow {
  anggota: UserDTO;
  projectName: string;
  hadir: boolean;
  jamMasuk?: string;
}

function matchName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default function DashboardPMPage() {
  const [members, setMembers] = useState<TeamRow[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [assignments, proj, rekap, roster] = await Promise.all([
          getProjectAnggota(),
          getProjects(),
          getRekapAbsensi(todayISO()),
          api.get<UserDTO[]>('/Anggota').then((r) => r.data || []),
        ]);
        let rows: TeamRow[] = [];
        for (const pa of assignments) {
          const member = roster.find((u) => u.id === pa.idUser);
          if (!member) continue;
          const logs = rekap.filter((r) => matchName(r.nama, member.nama));
          const active = logs.find((r) => !r.jamPulang);
          const present = logs.find((r) => r.jamMasuk);
          rows.push({
            anggota: member,
            projectName: pa.project || pa.idProject.toString(),
            hadir: logs.length > 0,
            jamMasuk: active?.jamMasuk ?? present?.jamMasuk,
          });
        }
        if (!cancelled) {
          setProjects(proj);
          setMembers(rows);
        }
      } catch {
        if (!cancelled) setErrorMsg('Gagal memuat data tim dari server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hadir = members.filter((m) => m.hadir).length;

  return (
    <DashboardLayout title="Dashboard PM" subtitle="Pantau kehadiran anggota project.">
      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: '#8A8F99' }}>
          Memuat data tim...
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="mb-4 rounded-xl p-4 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
              {errorMsg}
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(32,230,183,0.12)' }}>
                <FolderKanban className="h-5 w-5" style={{ color: '#20E6B7' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Total Project</p>
                <p className="text-xl font-bold">{projects.length}</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                <Users className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Total Anggota</p>
                <p className="text-xl font-bold">{members.length}</p>
              </div>
            </div>
            <div className="stem-tile">
              <div className="stem-icon-chip" style={{ backgroundColor: 'rgba(255,159,67,0.12)' }}>
                <UserCheck className="h-5 w-5" style={{ color: '#FF9F43' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#8A8F99' }}>Hadir Hari Ini</p>
                <p className="text-xl font-bold">{hadir}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#1E2024', border: '1px solid #2D3036' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Anggota Project</h2>
                <p className="text-xs" style={{ color: '#8A8F99' }}>Kehadiran harian per anggota.</p>
              </div>
            </div>

            {members.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: '#8A8F99' }}>
                Belum ada anggota yang ditugaskan ke project.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: '#2D3036' }}>
                      <th className="pb-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Nama</th>
                      <th className="pb-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Project</th>
                      <th className="pb-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Absen</th>
                      <th className="pb-3 text-xs font-medium" style={{ color: '#8A8F99' }}>Jam Masuk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.anggota.id} className="border-b last:border-0" style={{ borderColor: '#2D3036' }}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full" style={{ backgroundColor: '#10B981' }} />
                            {member.anggota.nama}
                          </div>
                        </td>
                        <td className="py-3" style={{ color: '#8A8F99' }}>{member.projectName}</td>
                        <td className="py-3">
                          <span className="rounded-full px-2.5 py-1 text-xs" style={
                            member.hadir
                              ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }
                              : { backgroundColor: 'rgba(255,159,67,0.12)', color: '#FF9F43' }
                          }>
                            {member.hadir ? 'Hadir' : 'Belum'}
                          </span>
                        </td>
                        <td className="py-3" style={{ color: '#8A8F99' }}>{member.jamMasuk || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}