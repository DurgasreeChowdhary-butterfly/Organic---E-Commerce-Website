import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getStore } from "@/store/storeRegistry";
import type { RootState } from "@/store";

/**
 * Shared axios instance. Attaches the JWT access token to every request
 * and centralizes 401 handling (token refresh / logout).
 *
 * Reads/writes auth state via the store registry (`getStore()`) rather
 * than importing `@/store` or `@/features/auth/authSlice` directly, and
 * dispatches plain action objects using Redux Toolkit's auto-generated
 * `"auth/setTokens"` / `"auth/logout"` type strings instead of importing
 * the action creators. Both choices exist to avoid a real circular
 * import (store -> authSlice -> authService -> apiClient -> ...) that
 * throws "Cannot access 'authReducer' before initialization" at runtime.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Plain axios instance for the refresh call itself, so it never runs
// through apiClient's own response interceptor (which would recurse).
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = (getStore().getState() as RootState).auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = (getStore().getState() as RootState).auth;
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post("/auth/refresh", { refresh_token: refreshToken });
    getStore().dispatch({
      type: "auth/setTokens",
      payload: { accessToken: data.access_token, refreshToken: data.refresh_token },
    });
    return data.access_token as string;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      getStore().dispatch({ type: "auth/logout" });
    }

    return Promise.reject(error);
  }
);
