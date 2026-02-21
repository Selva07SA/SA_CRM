import { create } from "zustand";
import type { AuthUser } from "@/types/auth";
import { extractPermissionKeys } from "@/utils/jwt";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  permissionKeys: string[];
  isAuthenticated: boolean;
  setSession: (input: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  updateAccessToken: (accessToken: string) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "sacrm.auth";

const readStoredState = (): Pick<AuthState, "accessToken" | "refreshToken" | "user" | "permissionKeys" | "isAuthenticated"> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
        permissionKeys: [],
        isAuthenticated: false
      };
    }

    const parsed = JSON.parse(raw) as { accessToken: string | null; refreshToken: string | null; user: AuthUser | null };
    const accessToken = parsed.accessToken ?? null;
    return {
      accessToken,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
      permissionKeys: accessToken ? extractPermissionKeys(accessToken) : [],
      isAuthenticated: Boolean(accessToken && parsed.user)
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      permissionKeys: [],
      isAuthenticated: false
    };
  }
};

const persistState = (state: { accessToken: string | null; refreshToken: string | null; user: AuthUser | null }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op when storage is unavailable
  }
};

const initial = readStoredState();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initial.accessToken,
  refreshToken: initial.refreshToken,
  user: initial.user,
  permissionKeys: initial.permissionKeys,
  isAuthenticated: initial.isAuthenticated,
  setSession: ({ accessToken, refreshToken, user }) =>
    set(() => {
      persistState({ accessToken, refreshToken, user });
      return {
        accessToken,
        refreshToken,
        user,
        permissionKeys: extractPermissionKeys(accessToken),
        isAuthenticated: true
      };
    }),
  updateAccessToken: (accessToken) =>
    set((state) => {
      persistState({ accessToken, refreshToken: state.refreshToken, user: state.user });
      return {
        ...state,
        accessToken,
        permissionKeys: extractPermissionKeys(accessToken)
      };
    }),
  clearSession: () =>
    set(() => {
      persistState({ accessToken: null, refreshToken: null, user: null });
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
        permissionKeys: [],
        isAuthenticated: false
      };
    })
}));
