import type { LoginResponse } from '@/types/auth';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export function getSession(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !token) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const session = value as Partial<LoginResponse>;
    if (typeof session.nama !== 'string' || typeof session.role !== 'string' ||
      !['Admin', 'PM', 'Guru', 'Anggota', 'DevOps', 'Pelajar'].includes(session.role)) return null;
    return { token, nama: session.nama, role: session.role, refresh_Token: session.refresh_Token || '' };
  } catch {
    return null;
  }
}

export function saveSession(session: LoginResponse) {
  if (typeof session.token !== 'string' || !session.token || typeof session.nama !== 'string' || !session.nama || !['Admin', 'PM', 'Guru', 'Anggota', 'DevOps', 'Pelajar'].includes(session.role)) throw new Error('Respons login tidak valid.');
  // Preserve the existing bearer-token contract; HttpOnly sessions require a backend change.
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
