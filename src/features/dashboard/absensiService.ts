import api from '../../lib/api';
import {
  AbsenRekapDTO,
  AbsenMasukDTO,
  AbsenPulangDTO,
  ProjectDTO,
  ProjectAnggotaDTO,
  UserDTO,
} from '../../types/absensi';

export const getRekapAbsensi = async (tanggal?: string): Promise<AbsenRekapDTO[]> => {
  // Backend returns 400 if `tanggal` is missing — default to today.
  const params: Record<string, string> = { tanggal: tanggal || todayISO() };
  const response = await api.get<AbsenRekapDTO[]>('/v1/absen', { params });
  return response.data;
};

export const postAbsenMasuk = async (data: AbsenMasukDTO) => {
  const response = await api.post('/v1/absen/masuk', data);
  return response.data;
};

export const postAbsenPulang = async (data: AbsenPulangDTO) => {
  const response = await api.put('/v1/absen/pulang', data);
  return response.data;
};

export const getProjects = async (): Promise<ProjectDTO[]> => {
  const response = await api.get<ProjectDTO[]>('/v1/project');
  return response.data;
};

export const createProject = async (nama: string): Promise<ProjectDTO> => {
  const { data } = await api.post<ProjectDTO>('/v1/project', { nama });
  return data;
};

export const updateProject = async (id: number, nama: string): Promise<void> => {
  await api.put(`/v1/project/${id}`, { id, nama });
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/v1/project/${id}`);
};

export const getProjectAnggota = async (): Promise<ProjectAnggotaDTO[]> => {
  const response = await api.get<ProjectAnggotaDTO[]>('/v1/project-anggota');
  return response.data;
};

export const getGuruUsers = async (): Promise<UserDTO[]> => {
  const response = await api.get<UserDTO[]>('/v1/guru');
  return response.data;
};

/** ISO date (YYYY-MM-DD) in the local timezone. */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}