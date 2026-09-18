import { z } from 'zod';

export const loginSchema = z.object({
  nama: z.string().trim().min(1, 'Nama pengguna wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
