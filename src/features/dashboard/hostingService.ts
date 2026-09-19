import api, { fetcher } from '@/lib/api';
import type { HostingRequestListDTO, HostingRequestDTO, HostingRequestInput, HostingDevOpsCompleteInput } from '@/types/hosting';

export const getHostingRequests = (status?: string) =>
  fetcher<HostingRequestListDTO[]>(`/v1/hosting/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getMyHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/my-requests');
export const getPendingHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/pending');
export const getApprovedHostingRequests = () => fetcher<HostingRequestListDTO[]>('/v1/hosting/approved');
export const getHostingRequestDetail = (id: number) => fetcher<HostingRequestDTO>(`/v1/hosting/request/${id}`);

export const createHostingRequest = (data: HostingRequestInput) => api.post('/v1/hosting/request', data);
export const updateHostingRequest = (id: number, data: HostingRequestInput) => api.put(`/v1/hosting/request/${id}`, data);
export const approveHostingRequest = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/approve`, { notes });
export const rejectHostingRequest = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/reject`, { notes });
export const startHostingProcessing = (id: number) => api.put(`/v1/hosting/request/${id}/start`, {});
export const completeHostingRequest = (id: number, data: HostingDevOpsCompleteInput) => api.put(`/v1/hosting/request/${id}/complete`, data);
export const updateHostingDevOpsNotes = (id: number, notes: string) => api.put(`/v1/hosting/request/${id}/notes`, { notes });
export const cancelHostingRequest = (id: number) => api.delete(`/v1/hosting/request/${id}/cancel`);
export const deleteHostingRequest = (id: number) => api.delete(`/v1/hosting/request/${id}`);
