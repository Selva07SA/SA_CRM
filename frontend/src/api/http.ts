import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import type { ApiEnvelope } from "@/types/api";
import type { AuthTokens } from "@/types/auth";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "https://sa-crm.onrender.com/api/v1";

export const http = axios.create({
  baseURL,
  timeout: 20000
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken, updateAccessToken, clearSession } = useAuthStore.getState();
      if (!refreshToken) throw new Error("No refresh token available");

      try {
        const { data } = await axios.post<ApiEnvelope<AuthTokens>>(`${baseURL}/auth/refresh`, {
          refreshToken
        });

        updateAccessToken(data.data.accessToken);
        useAuthStore.setState({ refreshToken: data.data.refreshToken });
        return data.data.accessToken;
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig;
    const status = error.response?.status;
    const requestUrl = original?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register") || requestUrl.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch {
        toast.error("Session expired. Please login again.");
      }
    }

    const apiError = (error.response?.data as { error?: { message?: string; details?: any } } | undefined)?.error;
    if (apiError?.message) {
      toast.error(apiError.message);
      if (apiError.details && typeof apiError.details === "object") {
        console.warn("[API Details]", apiError.details);
      }
    } else {
      toast.error(error.message || "An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

/**
 * Safely unwrap the data from a successful API response.
 */
export const unwrap = <T>(response: { data: ApiEnvelope<T> }): T => {
  return response.data.data;
};
