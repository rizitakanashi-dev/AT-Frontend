export interface AbsenRekapDTO {
  idAbsensi: number;
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
