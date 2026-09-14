import { z } from 'zod';

export const loginSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;