import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { normalizeWallet, normalizeWchTransaction } from '../types/normalizers';

export function useWallet() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const walletsQuery = useQuery({
    queryKey: ['wallets'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const wallets = await apiClient.listWallets(accessToken!);
      return wallets.map(normalizeWallet);
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ['wallets', 'wch-transactions'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const transactions = await apiClient.listWchTransactions(accessToken!);
      return transactions.map(normalizeWchTransaction);
    },
  });

  return useMemo(
    () => ({
      wallets: walletsQuery.data ?? [],
      transactions: transactionsQuery.data ?? [],
      walletsQuery,
      transactionsQuery,
    }),
    [transactionsQuery, walletsQuery],
  );
}
