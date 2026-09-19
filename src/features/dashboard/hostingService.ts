import api, { fetcher } from '@/lib/api';
import type { HostingRequestListDTO, HostingRequestDTO, HostingRequestInput, HostingDevOpsCompleteInput } from '@/types/hosting';

export const getHostingRequests = (status?: string) =>
  fetcher<HostingRequestListDTO[]>(`/v1/hosting/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getMyHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/my-requests');
export const getPendingHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/pending');
export const getApprovedHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/approved');
export const getHostingRequestDetail = (id: number) => fetcher<HostingRequestDTO>(`/v1/hosting/request/${id}`);

export async function getHostingWorkspace(role: string): Promise<HostingRequestListDTO[]> {
  if (role === 'Anggota' || role === 'Pelajar') return getMyHostingRequests();
  if (role === 'Admin' || role === 'PM') return getHostingRequests();
  if (role !== 'DevOps') throw new Error('Peran ini tidak memiliki akses hosting.');
  const groups = await Promise.all([
    getApprovedHostingRequests(), getHostingRequests('in_progress'), getHostingRequests('completed'),
  ]);
  const rows = groups.flat().filter((row) => ['approved', 'in_progress', 'completed'].includes(row.status));
  return [...new Map(rows.map((row) => [row.id, row])).values()]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export const createHostingRequest = (data: HostingRequestInput) => api.post('/v1/hosting/request', data);
export const updateHostingRequest = (id: number, data: HostingRequestInput) => api.put(`/v1/hosting/request/${id}`, data);
export const approveHostingRequest = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/approve`, { notes });
export const rejectHostingRequest = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/reject`, { notes });
export const startHostingProcessing = (id: number) => api.put(`/v1/hosting/request/${id}/start`, {});
export const completeHostingRequest = (id: number, data: HostingDevOpsCompleteInput) => api.put(`/v1/hosting/request/${id}/complete`, data);
export const updateHostingDevOpsNotes = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/notes`, { notes });
export const cancelHostingRequest = (id: number) => api.delete(`/v1/hosting/request/${id}/cancel`);
export const deleteHostingRequest = (id: number) => api.delete(`/v1/hosting/request/${id}`);
