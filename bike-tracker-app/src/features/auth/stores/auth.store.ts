import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../api/auth.api";
import { tokenStore } from "../store/auth.store";
import type { User } from "../types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const storage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (v: string) => SecureStore.setItemAsync(TOKEN_KEY, v),
  getUser: async (): Promise<User | null> => {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (u: User) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(u)),
  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithApple: (idToken: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    // api-client の 401 時にログアウトするコールバックを登録
    tokenStore.getState().setOnUnauthorized(() => {
      useAuthStore.getState().logout();
    });

    try {
      const token = await storage.getToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // トークンでユーザー情報を取得して検証
      const user = await authApi.me(token);
      await storage.setUser(user);
      tokenStore.getState().setToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      // トークン無効 → クリアしてログアウト状態
      await storage.clear();
      tokenStore.getState().setToken(null);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    tokenStore.getState().setToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  signup: async (email, password, name) => {
    const res = await authApi.signup(email, password, name);
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    tokenStore.getState().setToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  loginWithApple: async (idToken, name) => {
    const res = await authApi.apple(idToken, name);
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    tokenStore.getState().setToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  logout: async () => {
    await storage.clear();
    tokenStore.getState().setToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
