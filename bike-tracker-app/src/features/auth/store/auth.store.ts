import { createStore } from "zustand/vanilla";

type AuthState = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  login: (token: string, userId: string) => void;
  logout: () => void;
};

const authStore = createStore<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  setToken: (token) => set({ token }),
  login: (token, userId) => set({ token, userId, isAuthenticated: true }),
  logout: () => set({ token: null, userId: null, isAuthenticated: false }),
}));

export const getState = authStore.getState;
export { authStore };
