export interface AbsenRekapDTO {
  idAbsensi: number;
  idTarget: number;
  tanggal: string;
  nama: string;
  divisi: string;
  project?: string;
  target?: string;
  status: string;
  jamMasuk?: string;
  jamPulang?: string;
}

export interface AbsenMasukDTO {
  idProject: number;
  target: string;
  idStatus: number;
}

export interface AbsenPulangDTO {
  idAbsensi: number;
  idTarget: number;
  idStatus: number;
}

export interface ProjectDTO {
  id: number;
  nama: string;
}

export interface ProjectAnggotaDTO {
  id: number;
  idUser: number;
  idProject: number;
  username: string;
  project: string;
}

/** User record returned by /v1/guru, /Anggota, /PM, /auth/me. */
export interface UserDTO {
  id: number;
  nama: string;
  role: string;
  divisi?: string | null;
}

export interface StatusDTO {
  id: number;
  nama: string;
}