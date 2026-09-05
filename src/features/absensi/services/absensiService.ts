import api from '@/utils/api';
import { AbsenRekapDTO, AbsenMasukDTO, AbsenPulangDTO } from '@/types/absensi';

export const getRekapAbsensi = async (): Promise<AbsenRekapDTO[]> => {
  const response = await api.get<AbsenRekapDTO[]>('/v1/absensi/rekap');
  return response.data;
};

export const postAbsenMasuk = async (data: AbsenMasukDTO) => {
  const response = await api.post('/v1/absensi/masuk', data);
  return response.data;
};

export const postAbsenPulang = async (data: AbsenPulangDTO) => {
  const response = await api.post('/v1/absensi/pulang', data);
  return response.data;
};
