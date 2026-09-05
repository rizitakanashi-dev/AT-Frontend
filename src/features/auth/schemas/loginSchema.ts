import { z } from 'zod';

export const loginSchema = z.object({
  nama: z.string().min(1, { message: 'Nama/Email wajib diisi' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
