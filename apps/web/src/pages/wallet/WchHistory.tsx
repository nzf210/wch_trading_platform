import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { normalizeWchTransaction } from '../../types/normalizers';
import { WchUsageCard } from '../../components/wallet/WchUsageCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { WchTransactionStatus, WchTransactionType } from '../../types/wallet';

export function WchHistory() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [typeFilter, setTypeFilter] = useState<WchTransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WchTransactionStatus | 'all'>('all');

  const transactionsQuery = useQuery({
    queryKey: ['wch-transactions'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const transactions = await apiClient.listWchTransactions(accessToken!);
      return transactions.map(normalizeWchTransaction);
    },
  });

  const filteredTransactions = useMemo(() => {
    if (!transactionsQuery.data) return [];
    return transactionsQuery.data.filter((tx) => {
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [transactionsQuery.data, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!transactionsQuery.data) return { total: 0, confirmed: 0, pending: 0, failed: 0 };
    const confirmed = transactionsQuery.data
      .filter((tx) => tx.status === WchTransactionStatus.CONFIRMED)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const pending = transactionsQuery.data
      .filter((tx) => tx.status === WchTransactionStatus.PENDING)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const failed = transactionsQuery.data
      .filter((tx) => tx.status === WchTransactionStatus.FAILED)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { total: transactionsQuery.data.length, confirmed, pending, failed };
  }, [transactionsQuery.data]);

  return (
    <section id="wch-history" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>WCH Transaction History</CardTitle>
          <CardDescription>
            All WCH token transactions including deposits, withdrawals, and subscription payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Transactions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(stats.total)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Confirmed Volume</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{formatNumber(stats.confirmed)} WCH</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pending Volume</p>
              <p className="mt-2 text-2xl font-semibold text-amber-400">{formatNumber(stats.pending)} WCH</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Failed Volume</p>
              <p className="mt-2 text-2xl font-semibold text-rose-400">{formatNumber(stats.failed)} WCH</p>
            </div>
          </div>

          {/* WCH Usage Card */}
          {transactionsQuery.data && transactionsQuery.data.length > 0 && (
            <WchUsageCard transactions={transactionsQuery.data} />
          )}

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Transaction Type</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as WchTransactionType | 'all')}
              >
                <option value="all">all</option>
                {Object.values(WchTransactionType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as WchTransactionStatus | 'all')}
              >
                <option value="all">all</option>
                {Object.values(WchTransactionStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredTransactions.length} of {transactionsQuery.data?.length ?? 0} transactions
            </p>
            <Button variant="ghost" onClick={() => void transactionsQuery.refetch()}>
              Refresh
            </Button>
          </div>

          {/* Transactions List */}
          {transactionsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading transactions...</p>
          ) : transactionsQuery.error ? (
            <p className="text-sm text-rose-300">{transactionsQuery.error.message}</p>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          tone={
                            tx.type === 'deposit' ? 'success' :
                            tx.type === 'withdrawal' ? 'warning' :
                            tx.type === 'subscription_payment' ? 'info' :
                            'neutral'
                          }
                        >
                          {tx.type}
                        </Badge>
                        <Badge
                          tone={
                            tx.status === 'confirmed' ? 'success' :
                            tx.status === 'failed' ? 'danger' :
                            'warning'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        {tx.txHash && (
                          <span className="font-mono text-xs">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-lg font-semibold text-white">{formatNumber(tx.amount)} WCH</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No transactions found.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
