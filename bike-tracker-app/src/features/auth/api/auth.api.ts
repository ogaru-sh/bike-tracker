import { API_BASE_URL } from "@/config/api";
import type { AuthResponse } from "../types";

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    request<AuthResponse>("/auth/signup", { email, password, name }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { email, password }),

  apple: (idToken: string, name?: string) =>
    request<AuthResponse>("/auth/apple", { idToken, name }),

  refresh: async (token: string): Promise<{ token: string }> => {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token refresh failed");
    return res.json();
  },

  me: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json() as Promise<{ id: string; email: string | null; name: string | null }>;
  },
};
