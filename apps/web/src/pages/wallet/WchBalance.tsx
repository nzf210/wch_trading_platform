import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatNumber } from '../../lib/utils';

export function WchBalance() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const transactionsQuery = useQuery({
    queryKey: ['wch-transactions'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const transactions = await apiClient.listWchTransactions(accessToken!);
      return transactions;
    },
  });

  // Calculate WCH balance from confirmed transactions
  const wchBalance = useMemo(() => {
    if (!transactionsQuery.data) return 0;
    return transactionsQuery.data
      .filter((tx) => tx.status === 'confirmed')
      .reduce((sum, tx) => {
        // For deposits and credits, add to balance
        // For withdrawals and payments, subtract from balance
        if (tx.type === 'deposit' || tx.type === 'credit' || tx.type === 'reward') {
          return sum + tx.amount;
        }
        return sum - tx.amount;
      }, 0);
  }, [transactionsQuery.data]);

  return (
    <section id="wch-balance" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>WCH Token Balance</CardTitle>
          <CardDescription>
            Your WCH token balance for subscription payments and platform utilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-cyan-950 to-slate-950 px-6 py-12">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Available Balance</p>
              <p className="mt-4 text-5xl font-bold text-white">{formatNumber(wchBalance, { maximumFractionDigits: 2 })}</p>
              <p className="mt-2 text-lg text-cyan-400">WCH</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Locked</p>
              <p className="mt-2 text-xl font-semibold text-slate-400">0 WCH</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pending</p>
              <p className="mt-2 text-xl font-semibold text-amber-400">0 WCH</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatNumber(wchBalance, { maximumFractionDigits: 2 })} WCH</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
