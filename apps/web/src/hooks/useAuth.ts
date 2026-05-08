import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';

import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types/api';

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const login = useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await apiClient.login(payload);
      return apiClient.unwrapEnvelope(response);
    },
    onSuccess: (payload) => {
      setSession(payload.token, user);
    },
  });

  const register = useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await apiClient.register(payload);
      return apiClient.unwrapEnvelope(response);
    },
    onSuccess: (payload) => {
      setSession(payload.token, user);
    },
  });

  return useMemo(
    () => ({
      accessToken,
      isAuthenticated: status === 'authenticated',
      status,
      user,
      hydrate,
      login,
      register,
      logout: clearSession,
    }),
    [accessToken, clearSession, hydrate, login, register, status, user],
  );
}
