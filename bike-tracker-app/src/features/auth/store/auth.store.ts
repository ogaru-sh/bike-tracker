/**
 * Vanilla Zustand store — React 外（api-client.ts）からトークンを参照するために使用。
 * UI 側の stores/auth.store.ts がログイン/ログアウト時にここも同期更新する。
 */
import { createStore } from "zustand/vanilla";

type TokenState = {
  token: string | null;
  setToken: (token: string | null) => void;
  /** api-client から 401 時にログアウト状態にするためのコールバック */
  onUnauthorized: (() => void) | null;
  setOnUnauthorized: (cb: () => void) => void;
};

const tokenStore = createStore<TokenState>((set, get) => ({
  token: null,
  setToken: (token) => set({ token }),
  onUnauthorized: null,
  setOnUnauthorized: (cb) => set({ onUnauthorized: cb }),
}));

export const getState = tokenStore.getState;
export { tokenStore };
