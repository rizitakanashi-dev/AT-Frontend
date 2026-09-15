import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { TOKEN_KEY, USER_KEY, clearSession } from "../features/absensi/services/authService";
import { LoginResponse } from "../types/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Mark a request as already-refreshed so we never loop on a second 401. */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a fresh access token.
 * Single-flight: concurrent 401s share one refresh call.
 * Returns the new access token, or null if refresh failed.
 */
async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null") as LoginResponse | null;
    const refreshToken = stored?.refresh_Token;

    if (!refreshToken) return null;

    try {
      const { data } = await axios.post<LoginResponse>(
        `${api.defaults.baseURL}/v1/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      return data.token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Only attempt refresh once per request, and never on the refresh call itself.
    if (status === 401 && config && !config._retry && !config.url?.includes("/refresh")) {
      config._retry = true;

      const newToken = await tryRefreshToken();
      if (newToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      }

      // Refresh failed or unavailable — the session is dead.
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;