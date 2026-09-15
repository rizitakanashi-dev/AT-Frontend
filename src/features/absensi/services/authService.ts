import api from '../../../lib/api';
import { LoginRequest, LoginResponse } from '../../../types/auth';

// Key name shared across the app (api.ts, ProtectedRoute, LoginPage, DashboardLayout)
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/v1/auth/login', credentials);
  return response.data;
};

/**
 * Logout: call the backend (best-effort, fire-and-forget), then purge local
 * session state unconditionally so the client is never left half-signed-out.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/v1/auth/logout');
  } catch {
    // Local session is purged regardless of the network result.
  } finally {
    clearSession();
  }
};

/** Remove every auth artifact (JWT + stored user) from local storage. */
export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};