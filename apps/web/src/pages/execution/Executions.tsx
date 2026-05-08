import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { ExecutionStatus } from '../../types/execution';
import type { Execution } from '../../types/execution';

export function Executions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [botFilter, setBotFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');

  const executionsQuery = useQuery<Execution[]>({
    queryKey: ['executions'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      // TODO: Add listExecutions API method when backend supports it
      // For now, we'll show empty state
      return [];
    },
  });

  const filteredExecutions = executionsQuery.data?.filter((exec) => {
    const matchesBot = botFilter === '' || exec.botId.toLowerCase().includes(botFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exec.status === statusFilter;
    return matchesBot && matchesStatus;
  }) ?? [];

  // Stats
  const stats = executionsQuery.data ? {
    total: executionsQuery.data.length,
    completed: executionsQuery.data.filter((e) => e.status === ExecutionStatus.COMPLETED).length,
    failed: executionsQuery.data.filter((e) => e.status === ExecutionStatus.FAILED).length,
    totalPnl: executionsQuery.data.reduce((sum, e) => sum + (e.pnl ?? 0), 0),
  } : { total: 0, completed: 0, failed: 0, totalPnl: 0 };

  return (
    <section id="executions-page" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Trade Executions</CardTitle>
          <CardDescription>
            View completed and failed trade executions with P&L tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Executions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(stats.total)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{formatNumber(stats.completed)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Failed</p>
              <p className="mt-2 text-2xl font-semibold text-rose-400">{formatNumber(stats.failed)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total P&L</p>
              <p className={`mt-2 text-2xl font-semibold ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(stats.totalPnl)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Bot ID</span>
              <input
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                placeholder="Filter by bot ID"
                value={botFilter}
                onChange={(event) => setBotFilter(event.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ExecutionStatus | 'all')}
              >
                <option value="all">all</option>
                <option value={ExecutionStatus.PENDING}>pending</option>
                <option value={ExecutionStatus.COMPLETED}>completed</option>
                <option value={ExecutionStatus.FAILED}>failed</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredExecutions.length} executions
            </p>
            <Button variant="ghost" onClick={() => void executionsQuery.refetch()}>
              Refresh
            </Button>
          </div>

          {/* Executions List */}
          {executionsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading executions...</p>
          ) : executionsQuery.error ? (
            <p className="text-sm text-rose-300">{executionsQuery.error.message}</p>
          ) : filteredExecutions.length > 0 ? (
            <div className="space-y-2">
              {filteredExecutions.map((exec) => (
                <div key={exec.id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge tone={exec.status === ExecutionStatus.COMPLETED ? 'success' : 'danger'}>
                          {exec.status}
                        </Badge>
                        <span className="font-medium text-white">Order: {exec.orderId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span>Qty: {formatNumber(exec.filledQuantity)}</span>
                        <span>Avg Price: {formatCurrency(exec.averagePrice)}</span>
                        <span>Fee: {formatCurrency(exec.fee)}</span>
                        <span>Bot: {exec.botId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      {exec.pnl !== undefined && (
                        <p className={`text-lg font-semibold ${exec.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(exec.pnl)}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">Executed: {formatDate(exec.executedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                No executions found. Trade executions will appear here after orders are filled.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
