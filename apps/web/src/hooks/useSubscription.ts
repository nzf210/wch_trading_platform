import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { normalizeSubscriptionSummary } from '../types/normalizers';

export function useSubscription() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', 'current'],
    enabled: Boolean(accessToken),
    queryFn: async () =>
      normalizeSubscriptionSummary(
        await apiClient.getCurrentSubscription(accessToken!),
      ),
  });

  return useMemo(
    () => ({
      subscription: subscriptionQuery.data?.subscription ?? null,
      plan: subscriptionQuery.data?.plan ?? null,
      subscriptionQuery,
    }),
    [subscriptionQuery],
  );
}
