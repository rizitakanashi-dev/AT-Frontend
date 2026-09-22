import api, { fetcher } from '@/lib/api';
import type { AbsenRekapDTO, AbsenMasukDTO, AbsenPulangDTO, Paginated, ProjectDTO, ProjectAnggotaDTO, UserDTO, TargetDTO, TargetInput, UserInput } from '@/types/absensi';

export function todayISO(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function getRekapPage(tanggal: string, page = 1, pageSize = 100) {
  const query = new URLSearchParams({ tanggal, page: String(page), pageSize: String(pageSize) });
  const result = await fetcher<Paginated<AbsenRekapDTO>>(`/v1/absen?${query}`);
  if (!Array.isArray(result.data) || !result.pagination) throw new Error('Format rekap dari backend tidak sesuai.');
  return result;
}

export async function getRekapAbsensi(tanggal = todayISO()): Promise<AbsenRekapDTO[]> {
  const first = await getRekapPage(tanggal);
  const records = [...first.data];
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const next = await getRekapPage(tanggal, page);
    records.push(...next.data);
  }
  return records;
}

export async function getMyAttendance(tanggal = todayISO()) {
  const [rows, targets] = await Promise.all([
    getRekapAbsensi(tanggal), fetcher<TargetDTO[]>('/v1/target/my'),
  ]);
  // Rekap has no user ID. Join against server-scoped target IDs, never a display name.
  const ownedIds = new Set(targets.map((target) => target.id));
  return rows.filter((row) => ownedIds.has(row.idTarget));
}

export const postAbsenMasuk = (data: AbsenMasukDTO) => api.post('/v1/absen/masuk', data);
export const postAbsenPulang = (data: AbsenPulangDTO) => api.put('/v1/absen/pulang', data);
export const getProjects = () => fetcher<ProjectDTO[]>('/v1/project');
export const createProject = (nama: string) => api.post('/v1/project', { nama });
export const updateProject = (id: number, nama: string) => api.put(`/v1/project/${id}`, { id, nama });
export const deleteProject = (id: number) => api.delete(`/v1/project/${id}`);
export const getProjectAnggota = () => fetcher<ProjectAnggotaDTO[]>('/v1/project-anggota');
export const getGuruUsers = () => fetcher<UserDTO[]>('/v1/guru');
export const getDevOpsUsers = () => fetcher<UserDTO[]>('/v1/devops');
export const addProjectMember = (user: number, project: number) => api.post('/v1/project-anggota', { user, project });
export const removeProjectMember = (id: number) => api.delete(`/v1/project-anggota/${id}`);
export const createTarget = (data: TargetInput) => api.post('/v1/target', data);
export const updateTarget = (id: number, data: Omit<TargetInput, 'idUser'>) => api.put(`/v1/target/${id}`, { id, ...data });
export const deleteTarget = (id: number) => api.delete(`/v1/target/${id}`);

export async function getUsers(): Promise<UserDTO[]> {
  try {
    return await fetcher<UserDTO[]>('/v1/admin/users');
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status !== 404) throw error;
    const results = await Promise.allSettled([
      fetcher<UserDTO[]>('/v1/anggota'),
      getGuruUsers(),
      fetcher<UserDTO[]>('/v1/pm'),
      getDevOpsUsers(),
    ]);
    const users = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
    if (!users.length) throw error;
    return users;
  }
}

function adminUserPayload(data: UserInput, includePassword = true) {
  return {
    nama: data.nama.trim(),
    ...(includePassword ? { password: data.password } : {}),
    idRole: data.id_role,
    idDivisi: data.id_divisi > 0 ? data.id_divisi : null,
  };
}

export function canManageUser(role: string) {
  return ['Admin', 'PM', 'Guru', 'DevOps', 'Anggota', 'Pelajar'].includes(role);
}

export function createUser(role: string, data: UserInput) {
  if (!canManageUser(role)) throw new Error(`Pembuatan akun ${role} belum didukung backend.`);
  return api.post('/v1/admin/users', adminUserPayload(data));
}

export function updateUser(user: UserDTO, data: UserInput) {
  if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error('ID pengguna tidak valid.');
  return api.put(`/v1/admin/users/${user.id}`, adminUserPayload(data, Boolean(data.password.trim())));
}

export function deleteUser(user: UserDTO) {
  if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error('ID pengguna tidak valid.');
  return api.delete(`/v1/admin/users/${user.id}`);
}
