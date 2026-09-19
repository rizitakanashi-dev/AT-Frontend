import api from '@/lib/api';
import { clearSession } from '@/lib/session';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export { TOKEN_KEY, USER_KEY, clearSession } from '@/lib/session';

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/v1/auth/login', credentials);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post('/v1/auth/logout');
  } finally {
    clearSession();
  }
}
