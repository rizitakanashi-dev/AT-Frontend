import { z } from 'zod';

export const absenMasukSchema = z.object({
  idProject: z.number().min(1, 'Project wajib dipilih'),
  target: z.string().min(3, 'Target pekerjaan wajib diisi'),
  idStatus: z.number().min(1, 'Status wajib dipilih'),
});

export const absenPulangSchema = z.object({
  idAbsensi: z.number().min(1, 'ID Absensi tidak valid'),
  idTarget: z.number().min(1, 'Target wajib dipilih'),
  idStatus: z.number().min(1, 'Status wajib dipilih'),
});

export type AbsenMasukFormValues = z.infer<typeof absenMasukSchema>;
export type AbsenPulangFormValues = z.infer<typeof absenPulangSchema>;
