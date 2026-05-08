import { create } from 'zustand';

import { clearStoredAuth, getStoredAccessToken, getStoredAuthUser, setStoredAccessToken, setStoredAuthUser } from '../lib/auth';
import type { AuthenticatedUser } from '../types/user';

export type AuthStatus = 'anonymous' | 'authenticated';

interface AuthState {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  status: AuthStatus;
  hydrate: () => void;
  setSession: (accessToken: string, user?: AuthenticatedUser | null) => void;
  setUser: (user: AuthenticatedUser | null) => void;
  clearSession: () => void;
}

function getInitialState() {
  const accessToken = getStoredAccessToken();
  const user = getStoredAuthUser();

  return {
    accessToken,
    user,
    status: accessToken ? ('authenticated' as const) : ('anonymous' as const),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  hydrate: () => {
    const state = getInitialState();
    set(state);
  },

  setSession: (accessToken, user) => {
    setStoredAccessToken(accessToken);
    setStoredAuthUser(user ?? null);
    set({
      accessToken,
      user: user ?? null,
      status: 'authenticated',
    });
  },

  setUser: (user) => {
    setStoredAuthUser(user);
    set((state) => ({
      ...state,
      user,
    }));
  },

  clearSession: () => {
    clearStoredAuth();
    set({
      accessToken: null,
      user: null,
      status: 'anonymous',
    });
  },
}));
