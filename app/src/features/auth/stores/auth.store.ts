import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import {
  getAuthMe,
  postAuthApple,
  postAuthLogin,
  postAuthSignup,
} from "@/generated/endpoints/auth/auth";

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

type User = { id: string; email: string | null; name: string | null };

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** api-client の 401 時にログアウトするコールバック */
  onUnauthorized: (() => void) | null;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithApple: (idToken: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  onUnauthorized: null,

  setToken: (token) => set({ token }),

  initialize: async () => {
    // 401 時のコールバックを登録
    set({ onUnauthorized: () => get().logout() });

    try {
      const token = await storage.getToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await getAuthMe();
      await storage.setUser(user);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      await storage.clear();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await postAuthLogin({ email, password });
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  signup: async (email, password, name) => {
    const res = await postAuthSignup({ email, password, name: name ?? "" });
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  loginWithApple: async (idToken, name) => {
    const res = await postAuthApple({ idToken, name });
    await storage.setToken(res.token);
    await storage.setUser(res.user as User);
    set({ user: res.user as User, token: res.token, isAuthenticated: true });
  },

  logout: async () => {
    await storage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
