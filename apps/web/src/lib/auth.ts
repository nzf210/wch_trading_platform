import type { AuthenticatedUser } from '../types/user';

const ACCESS_TOKEN_KEY = 'wch.auth.access_token';
const AUTH_USER_KEY = 'wch.auth.user';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthenticatedUser | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: AuthenticatedUser | null): void {
  if (!isBrowser()) {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  clearStoredAccessToken();
  setStoredAuthUser(null);
}
