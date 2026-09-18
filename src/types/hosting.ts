export type HostingStatusValue = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

/** Ringkasan baris hosting request (dari /v1/hosting/requests, /my-requests, /pending, /approved). */
export interface HostingRequestListDTO {
  id: number;
  userName: string;
  projectName: string;
  contactName: string;
  status: HostingStatusValue;
  pmReviewerName?: string | null;
  devOpsHandlerName?: string | null;
  createdAt: string;
}

/** Detail lengkap satu hosting request (dari /v1/hosting/request/{id}). */
export interface HostingRequestDTO {
  id: number;
  idUser: number;
  userName: string;
  idProject: number;
  projectName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectDescription?: string | null;
  techStack?: string | null;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  status: HostingStatusValue;
  idPmReviewer?: number | null;
  pmReviewerName?: string | null;
  pmNotes?: string | null;
  pmReviewedAt?: string | null;
  idDevOpsHandler?: number | null;
  devOpsHandlerName?: string | null;
  devOpsNotes?: string | null;
  hostingUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload untuk membuat/mengubah hosting request (Anggota). */
export interface HostingRequestInput {
  idProject: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectDescription?: string;
  techStack?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
}

/** Payload saat DevOps menyelesaikan hosting. */
export interface HostingDevOpsCompleteInput {
  devOpsNotes?: string;
  hostingUrl?: string;
}
