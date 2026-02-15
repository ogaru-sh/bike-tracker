import { useAuthStore } from "@/features/auth";

const API_BASE_URL = __DEV__
  ? "http://localhost:8788"
  : "https://bike-tracker-api.example.workers.dev";

/**
 * Orval のカスタム mutator。
 * 生成される全 hooks がこの関数を通じて API を呼ぶ。
 */
export const apiClient = async <T>({
  url,
  method,
  params,
  data,
  headers: customHeaders,
  signal,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<T> => {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
  }
  const query = searchParams.toString();
  const fullUrl = `${API_BASE_URL}${url}${query ? `?${query}` : ""}`;

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...customHeaders,
  };
  // data がある場合のみ Content-Type を設定（GET では不要）
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        headers.Authorization = `Bearer ${useAuthStore.getState().token}`;
        const retryResponse = await fetch(fullUrl, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal,
        });
        if (retryResponse.ok) {
          if (retryResponse.status === 204) return undefined as T;
          return retryResponse.json();
        }
      }
      useAuthStore.getState().onUnauthorized?.();
    }

    const errorBody = await response.json().catch(() => ({
      error: { code: "INTERNAL_ERROR", message: "Unknown error" },
    }));
    throw errorBody;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

const tryRefreshToken = async (): Promise<boolean> => {
  const currentToken = useAuthStore.getState().token;
  if (!currentToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) return false;

    const { token } = await response.json();
    useAuthStore.getState().setToken(token);
    return true;
  } catch {
    return false;
  }
};

/** Orval が ErrorType<T> として使う型 */
export type ErrorType<T = unknown> = T;
