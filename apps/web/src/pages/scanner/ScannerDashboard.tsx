import { useMemo } from 'react';

import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate, formatNumber } from '../../lib/utils';
import { useSignals } from '../../hooks/useSignals';
import { SignalAction, SignalStatus } from '../../types/signal';

export function ScannerDashboard() {
  const { signals, signalsQuery } = useSignals();

  const stats = useMemo(() => {
    const total = signals.length;
    const buySignals = signals.filter((s) => s.action === SignalAction.BUY).length;
    const sellSignals = signals.filter((s) => s.action === SignalAction.SELL).length;
    const processedSignals = signals.filter((s) => s.status === SignalStatus.PROCESSED).length;
    const pendingSignals = signals.filter((s) => s.status === SignalStatus.PENDING).length;
    const rejectedSignals = signals.filter((s) => s.status === SignalStatus.REJECTED).length;
    const avgConfidence = total > 0 ? signals.reduce((sum, s) => sum + s.confidence, 0) / total : 0;

    return { total, buySignals, sellSignals, processedSignals, pendingSignals, rejectedSignals, avgConfidence };
  }, [signals]);

  const recentSignals = useMemo(() => signals.slice(0, 10), [signals]);

  const symbolStats = useMemo(() => {
    const counts: Record<string, { buy: number; sell: number; total: number }> = {};
    signals.forEach((signal) => {
      if (!counts[signal.symbol]) {
        counts[signal.symbol] = { buy: 0, sell: 0, total: 0 };
      }
      counts[signal.symbol].total++;
      if (signal.action === SignalAction.BUY) counts[signal.symbol].buy++;
      else counts[signal.symbol].sell++;
    });
    return Object.entries(counts)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [signals]);

  return (
    <section id="scanner-dashboard" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Scanner Dashboard</CardTitle>
          <CardDescription>Real-time signal scanner metrics and distribution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Signals</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(stats.total)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Buy / Sell</p>
              <p className="mt-2 text-lg font-semibold text-white">
                <span className="text-emerald-400">{formatNumber(stats.buySignals)}</span>
                {' / '}
                <span className="text-rose-400">{formatNumber(stats.sellSignals)}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Processed / Rejected</p>
              <p className="mt-2 text-lg font-semibold text-white">
                <span className="text-emerald-400">{formatNumber(stats.processedSignals)}</span>
                {' / '}
                <span className="text-rose-400">{formatNumber(stats.rejectedSignals)}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Avg Confidence</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(stats.avgConfidence, { maximumFractionDigits: 1 })}%</p>
            </div>
          </div>

          {/* Symbol Distribution */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-200">Top Symbols</h3>
            <div className="space-y-2">
              {symbolStats.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-white">{item.symbol}</span>
                    <div className="flex gap-3 text-sm">
                      <span className="text-emerald-400">BUY {item.buy}</span>
                      <span className="text-rose-400">SELL {item.sell}</span>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">Total: {item.total}</span>
                </div>
              ))}
              {symbolStats.length === 0 && (
                <p className="text-sm text-slate-500">No symbol data available.</p>
              )}
            </div>
          </div>

          {/* Recent Signals */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-slate-200">Recent Signals</h3>
            {signalsQuery.isLoading ? (
              <p className="text-sm text-slate-400">Loading signals...</p>
            ) : signalsQuery.error ? (
              <p className="text-sm text-rose-300">{signalsQuery.error.message}</p>
            ) : (
              <div className="space-y-2">
                {recentSignals.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Badge tone={signal.action === SignalAction.BUY ? 'success' : 'danger'}>
                        {signal.action}
                      </Badge>
                      <div>
                        <p className="font-medium text-white">{signal.symbol}</p>
                        <p className="text-xs text-slate-400">{signal.strategy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-300">{formatNumber(signal.confidence)}%</p>
                        <p className="text-xs text-slate-500">{formatDate(signal.createdAt)}</p>
                      </div>
                      <Badge tone={signal.status === SignalStatus.PROCESSED ? 'success' : signal.status === SignalStatus.REJECTED ? 'danger' : 'warning'}>
                        {signal.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentSignals.length === 0 && (
                  <p className="text-sm text-slate-500">No signals available.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
