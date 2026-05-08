import { useState } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { useSignals } from '../../hooks/useSignals';
import { SignalAction, SignalStatus } from '../../types/signal';

export function Signals() {
  const { signals, signalsQuery } = useSignals();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SignalStatus | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<SignalAction | 'all'>('all');

  const filteredSignals = signals.filter((signal) => {
    const matchesSearch =
      search === '' ||
      signal.symbol.toLowerCase().includes(search.toLowerCase()) ||
      signal.strategy.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || signal.status === statusFilter;
    const matchesAction = actionFilter === 'all' || signal.action === actionFilter;
    return matchesSearch && matchesStatus && matchesAction;
  });

  return (
    <section id="signals-page" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Signal Explorer</CardTitle>
          <CardDescription>Browse and filter all trading signals from the scanner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="symbol, strategy"
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as SignalStatus | 'all')}
              >
                <option value="all">all</option>
                {Object.values(SignalStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Action</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value as SignalAction | 'all')}
              >
                <option value="all">all</option>
                {Object.values(SignalAction).map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredSignals.length} of {signals.length} signals
            </p>
            <Button variant="ghost" onClick={() => void signalsQuery.refetch()}>
              Refresh
            </Button>
          </div>

          {/* Signals Table */}
          {signalsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading signals...</p>
          ) : signalsQuery.error ? (
            <p className="text-sm text-rose-300">{signalsQuery.error.message}</p>
          ) : (
            <div className="space-y-2">
              {filteredSignals.map((signal) => (
                <div key={signal.id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge tone={signal.action === SignalAction.BUY ? 'success' : 'danger'}>
                          {signal.action}
                        </Badge>
                        <span className="text-lg font-semibold text-white">{signal.symbol}</span>
                        <Badge tone={signal.status === SignalStatus.PROCESSED ? 'success' : signal.status === SignalStatus.REJECTED ? 'danger' : 'warning'}>
                          {signal.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span>Strategy: {signal.strategy}</span>
                        <span>Exchange: {signal.exchange}</span>
                        <span>Confidence: {formatNumber(signal.confidence)}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      {signal.price && (
                        <p className="text-sm text-slate-300">Price: {formatCurrency(signal.price)}</p>
                      )}
                      <p className="text-xs text-slate-500">Created: {formatDate(signal.createdAt)}</p>
                      <p className="text-xs text-slate-500">TTL: {signal.ttlMs}ms</p>
                    </div>
                  </div>
                  {/* Feature Snapshot Preview */}
                  {signal.featureSnapshot && Object.keys(signal.featureSnapshot).length > 0 && (
                    <div className="mt-3 rounded-lg bg-slate-950/50 p-3">
                      <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Feature Snapshot</p>
                      <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-3">
                        {Object.entries(signal.featureSnapshot).slice(0, 6).map(([key, value]) => (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="text-slate-500">{key}:</span>
                            <span className="text-slate-300">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredSignals.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  No signals matched the current filter criteria.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
