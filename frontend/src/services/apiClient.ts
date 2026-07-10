import axios from "axios";

/**
 * Shared axios instance. Attaches the JWT access token to every request
 * and centralizes 401 handling (token refresh / logout).
 * TODO: wire up request interceptor (Authorization header) and response
 * interceptor (refresh-token retry on 401).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// TODO: apiClient.interceptors.request.use(...)
// TODO: apiClient.interceptors.response.use(...)
