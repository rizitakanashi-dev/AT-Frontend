import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from '@/lib/api';
import { getRekapAbsensi, getMyAttendance, addProjectMember, postAbsenMasuk, postAbsenPulang } from './absensiService';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({ fetcher: vi.fn(), default: { post: vi.fn(), put: vi.fn() } }));
const fetchMock = vi.mocked(fetcher);
const own = { idAbsensi: 2, idTarget: 20, nama: 'Nama sama', tanggal: '2026-09-18', jamMasuk: '08:00', jamPulang: null, divisi: 'RPL', status: 'Proses' };
const other = { ...own, idAbsensi: 1, idTarget: 10 };

beforeEach(() => vi.clearAllMocks());

describe('Kontrak Absensi-Tefa', () => {
  it('menggabungkan seluruh halaman respons rekap', async () => {
    fetchMock.mockResolvedValueOnce({ data: [other], pagination: { totalPages: 2 } });
    fetchMock.mockResolvedValueOnce({ data: [own], pagination: { totalPages: 2 } });
    expect(await getRekapAbsensi('2026-09-18')).toEqual([other, own]);
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/v1/absen?tanggal=2026-09-18&page=2&pageSize=100');
  });

  it('memilih kepemilikan lewat ID target, bukan nama atau posisi catatan', async () => {
    fetchMock.mockImplementation(async (path: string) => {
      if (path === '/v1/target/my') return [{ id: own.idTarget }];
      return { data: [other, own], pagination: { totalPages: 1 } };
    });
    expect(await getMyAttendance('2026-09-18')).toEqual([own]);
  });

  it('tidak menampilkan catatan orang lain saat akun belum punya target', async () => {
    fetchMock.mockImplementation(async (path: string) => path === '/v1/target/my' ? [] : { data: [other], pagination: { totalPages: 1 } });
    expect(await getMyAttendance('2026-09-18')).toEqual([]);
  });

  it('tidak menyembunyikan kegagalan pagination sebagai data kosong', async () => {
    fetchMock.mockResolvedValueOnce({ data: [own], pagination: { totalPages: 2 } });
    fetchMock.mockRejectedValueOnce(new Error('Server gagal'));
    await expect(getRekapAbsensi('2026-09-18')).rejects.toThrow('Server gagal');
  });

  it('menolak kontrak rekap yang tidak valid', async () => {
    fetchMock.mockResolvedValueOnce([own]);
    await expect(getRekapAbsensi('2026-09-18')).rejects.toThrow('Format rekap');
  });

  it('mengirim nama field membership sesuai DTO backend', async () => {
    await addProjectMember(7, 3);
    expect(api.post).toHaveBeenCalledWith('/v1/project-anggota', { user: 7, project: 3 });
  });

  it('mempertahankan metode masuk POST dan pulang PUT serta status pilihan', async () => {
    await postAbsenMasuk({ idProject: 3, target: 'Perbaiki antarmuka', idStatus: 5 });
    await postAbsenPulang({ idAbsensi: 2, idTarget: 20, idStatus: 8 });
    expect(api.post).toHaveBeenCalledWith('/v1/absen/masuk', { idProject: 3, target: 'Perbaiki antarmuka', idStatus: 5 });
    expect(api.put).toHaveBeenCalledWith('/v1/absen/pulang', { idAbsensi: 2, idTarget: 20, idStatus: 8 });
  });
});
