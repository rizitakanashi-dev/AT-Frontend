export interface AbsenRekapDTO {
  idAbsensi: number;
  idTarget: number;
  tanggal: string;
  nama: string;
  divisi: string;
  project?: string;
  target?: string;
  status: string;
  jamMasuk?: string | null;
  jamPulang?: string | null;
}

export interface AbsenMasukDTO { idProject: number; target: string; idStatus: number }
export interface AbsenPulangDTO { idAbsensi: number; idTarget: number; idStatus: number }
export interface ProjectDTO { id: number; nama: string }
export interface StatusDTO { id: number; nama: string }
export interface ProjectAnggotaDTO {
  id: number;
  idUser: number;
  idProject: number;
  username: string;
  project: string;
}
export interface UserDTO { id: number; nama: string; role: string; divisi?: string | null }
export interface UserInput { nama: string; password: string; id_role: number; id_divisi: number }
export interface TargetDTO {
  id: number;
  idUser: number;
  userName: string;
  idProject: number;
  projectName: string;
  target: string;
  idStatus: number;
  statusName: string;
}
export interface TargetInput { idUser: number; idProject: number; target: string; idStatus: number }
export interface Paginated<T> {
  data: T[];
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number };
}
