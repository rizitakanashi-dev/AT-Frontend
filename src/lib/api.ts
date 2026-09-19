import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearSession, getSession, saveSession } from './session';
import type { LoginResponse } from '@/types/auth';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

interface RetriableConfig extends InternalAxiosRequestConfig { _retry?: boolean }
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = getSession()?.token;
  if (token && !config.url?.endsWith('/login')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const session = getSession();
  if (!session?.refresh_Token) return null;
  refreshPromise = axios.post<LoginResponse>(`${api.defaults.baseURL}/v1/auth/refresh`, {
    refreshToken: session.refresh_Token,
  }, { timeout: 15000 }).then(({ data }) => {
    // A late refresh must not restore a session after logout or another login.
    if (getSession()?.refresh_Token !== session.refresh_Token) return null;
    saveSession(data);
    return data.token;
  }).catch(() => null).finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const isLogin = config?.url?.endsWith('/login');
  if (error.response?.status === 401 && config && !isLogin) {
    if (!config._retry) {
      config._retry = true;
      const token = await refreshToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      }
    }
    clearSession();
    if (window.location.pathname !== '/login') window.location.replace('/login');
  }
  return Promise.reject(error);
});

export async function fetcher<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  if (typeof data === 'string') throw new Error('Respons API tidak valid. Periksa alamat backend.');
  return data;
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return 'Nama pengguna atau kata sandi tidak sesuai.';
    if (status === 403) return 'Anda tidak memiliki izin untuk tindakan ini.';
    if (status === 429) return 'Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi.';
    if (!error.response || status === 502 || status === 503 || status === 504 || (status === 500 && !error.response.data)) return 'Backend belum dapat dihubungi. Periksa koneksi dan coba lagi.';
    const data = error.response.data;
    if (data && typeof data === 'object' && typeof data.message === 'string') return data.message;
    if (status === 404) return 'Data atau endpoint tidak ditemukan.';
    return 'Permintaan belum berhasil. Silakan coba lagi.';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
}

export default api;
