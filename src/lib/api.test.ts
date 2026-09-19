import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import api, { fetcher } from './api';
import { clearSession, getSession, saveSession } from './session';

const initial = { token: 'test-access', refresh_Token: 'test-refresh', nama: 'Test User', role: 'Anggota' };
const renewed = { ...initial, token: 'test-access-new', refresh_Token: 'test-refresh-new' };
function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { data: '', status: 401, statusText: 'Unauthorized', headers: new AxiosHeaders(), config });
}
const originalAdapter = api.defaults.adapter;

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) });
  vi.stubGlobal('window', { location: { pathname: '/login', replace: vi.fn() } });
});
afterEach(() => { api.defaults.adapter = originalAdapter; vi.unstubAllGlobals(); });

describe('Session and API boundaries', () => {
  it('handles corrupt storage and unknown roles without crashing', () => {
    localStorage.setItem('token', 'test');
    localStorage.setItem('user', '{broken');
    expect(getSession()).toBeNull();
    expect(() => saveSession({ ...initial, role: 'Unsupported' })).toThrow('Respons login');
  });

  it('does not refresh a failed login', async () => {
    saveSession(initial);
    const refresh = vi.spyOn(axios, 'post');
    api.defaults.adapter = async (config) => { throw unauthorized(config); };
    await expect(api.post('/v1/auth/login', { nama: 'wrong', password: 'wrong' })).rejects.toThrow();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('shares a single refresh across concurrent 401 responses', async () => {
    saveSession(initial);
    const refresh = vi.spyOn(axios, 'post').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { data: renewed };
    });
    api.defaults.adapter = async (config) => {
      if (config.headers.Authorization !== `Bearer ${renewed.token}`) throw unauthorized(config);
      return { data: { ok: true }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() };
    };
    const responses = await Promise.all([api.get('/one'), api.get('/two')]);
    expect(responses.every((response) => response.data.ok)).toBe(true);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(getSession()?.token).toBe(renewed.token);
  });

  it('does not restore a logged-out session from an in-flight refresh', async () => {
    saveSession(initial);
    vi.spyOn(axios, 'post').mockImplementation(async () => { clearSession(); return { data: renewed }; });
    api.defaults.adapter = async (config) => { throw unauthorized(config); };
    await expect(api.get('/one')).rejects.toThrow();
    expect(getSession()).toBeNull();
  });

  it('clears the session if a retried request is still unauthorized', async () => {
    saveSession(initial);
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: renewed });
    api.defaults.adapter = async (config) => { throw unauthorized(config); };
    await expect(api.get('/one')).rejects.toThrow();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(getSession()).toBeNull();
  });

  it('rejects an HTML SPA fallback instead of treating it as API data', async () => {
    api.defaults.adapter = async (config) => ({ data: '<html>Fallback</html>', status: 200, statusText: 'OK', config, headers: new AxiosHeaders() });
    await expect(fetcher('/v1/project')).rejects.toThrow('Respons API tidak valid');
  });
});
