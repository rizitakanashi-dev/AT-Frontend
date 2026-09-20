import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { fetcher } from '@/lib/api';
import { getHostingWorkspace, createHostingRequest, updateHostingRequest, approveHostingRequest, rejectHostingRequest, startHostingProcessing, completeHostingRequest, updateHostingDevOpsNotes, cancelHostingRequest, deleteHostingRequest } from './hostingService';

vi.mock('@/lib/api', () => ({ fetcher: vi.fn(), default: { post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const fetchMock = vi.mocked(fetcher);
beforeEach(() => vi.clearAllMocks());

describe('Kontrak API hosting', () => {
  it.each(['Anggota', 'Pelajar'])('%s selalu memakai endpoint milik sendiri', async (role) => {
    fetchMock.mockResolvedValue([]);
    await getHostingWorkspace(role);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/v1/hosting/my-requests');
  });
  it.each(['Admin', 'PM'])('%s mengambil seluruh riwayat', async (role) => {
    fetchMock.mockResolvedValue([]);
    await getHostingWorkspace(role);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/v1/hosting/requests');
  });
  it('DevOps hanya meminta status setelah persetujuan dan menyaring respons yang salah', async () => {
    fetchMock.mockResolvedValueOnce([{ id: 1, status: 'approved', createdAt: '2026-09-19' }, { id: 8, status: 'pending' }]);
    fetchMock.mockResolvedValueOnce([{ id: 2, status: 'in_progress', createdAt: '2026-09-18' }]);
    fetchMock.mockResolvedValueOnce([{ id: 3, status: 'completed', createdAt: '2026-09-17' }, { id: 1, status: 'approved', createdAt: '2026-09-19' }]);
    expect((await getHostingWorkspace('DevOps')).map((row) => row.id)).toEqual([1, 2, 3]);
    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual(['/v1/hosting/approved', '/v1/hosting/requests?status=in_progress', '/v1/hosting/requests?status=completed']);
  });
  it('kegagalan salah satu query tidak menjadi riwayat kosong', async () => {
    fetchMock.mockRejectedValue(new Error('Backend gagal'));
    await expect(getHostingWorkspace('DevOps')).rejects.toThrow('Backend gagal');
  });
  it('peran tanpa akses tidak memanggil API', async () => {
    await expect(getHostingWorkspace('Guru')).rejects.toThrow('tidak memiliki akses');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('mengirim pengajuan dan edit sesuai DTO backend', async () => {
    const payload = { idProject: 1, contactName: 'Kontak', contactEmail: 'test@example.com', contactPhone: '0800000000' };
    await createHostingRequest(payload);
    await updateHostingRequest(4, payload);
    expect(api.post).toHaveBeenCalledWith('/v1/hosting/request', payload);
    expect(api.put).toHaveBeenCalledWith('/v1/hosting/request/4', payload);
  });
  it('menggunakan endpoint review, deployment, dan catatan yang tersedia', async () => {
    await approveHostingRequest(4, 'Siap');
    await rejectHostingRequest(4, 'Perbaiki');
    await startHostingProcessing(4);
    await completeHostingRequest(4, { hostingUrl: 'https://example.com', devOpsNotes: 'Selesai' });
    await updateHostingDevOpsNotes(4, 'Progres');
    expect(vi.mocked(api.put).mock.calls).toEqual([
      ['/v1/hosting/request/4/approve', { notes: 'Siap' }],
      ['/v1/hosting/request/4/reject', { notes: 'Perbaiki' }],
      ['/v1/hosting/request/4/start', {}],
      ['/v1/hosting/request/4/complete', { hostingUrl: 'https://example.com', devOpsNotes: 'Selesai' }],
      ['/v1/hosting/request/4/notes', { notes: 'Progres' }],
    ]);
  });
  it('membedakan pembatalan dan hapus permanen', async () => {
    await cancelHostingRequest(4);
    await deleteHostingRequest(4);
    expect(vi.mocked(api.delete).mock.calls).toEqual([['/v1/hosting/request/4/cancel'], ['/v1/hosting/request/4']]);
  });
});
