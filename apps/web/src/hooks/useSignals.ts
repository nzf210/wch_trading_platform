import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { normalizeSignal } from '../types/normalizers';

export function useSignals() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const signalsQuery = useQuery({
    queryKey: ['signals'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const signals = await apiClient.listSignals(accessToken!);
      return signals.map(normalizeSignal);
    },
  });

  return useMemo(
    () => ({
      signals: signalsQuery.data ?? [],
      signalsQuery,
    }),
    [signalsQuery],
  );
}
