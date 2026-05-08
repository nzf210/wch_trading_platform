import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { WalletCard } from '../components/wallet/WalletCard';
import { WchUsageCard } from '../components/wallet/WchUsageCard';
import { useAuth } from '../hooks/useAuth';
import { useSignals } from '../hooks/useSignals';
import { useWallet } from '../hooks/useWallet';
import { formatDate, formatNumber } from '../lib/utils';
import { BotCreate } from './bots/BotCreate';
import { BotDetail } from './bots/BotDetail';
import { BotList } from './bots/BotList';
import { BotLogs } from './bots/BotLogs';
import { ExchangeAccounts } from './exchange/ExchangeAccounts';
import { Login } from './Login';
import { Register } from './Register';
import { RiskSettings } from './settings/RiskSettings';
import { Billing } from './subscription/Billing';
import { Plans } from './subscription/Plans';
import { TradingDataInitializer } from '../components/trading/TradingDataInitializer';
import { LiveOrders } from './trading/LiveOrders';
import { ExecutionsFeed } from './trading/ExecutionsFeed';

export function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { wallets, transactions, walletsQuery, transactionsQuery } = useWallet();
  const { signals, signalsQuery } = useSignals();

  return (
    <AppShell>
      {!isAuthenticated ? (
        <section id="auth" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Login />
            <Register />
          </div>
        </section>
      ) : (
        <>
          <TradingDataInitializer />
          
          {/* Stats Overview */}
          <section id="stats" className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Active Bots</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <Badge tone="success" className="mt-3">+2 this week</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total P&L</p>
                    <p className="text-2xl font-bold text-emerald-400">+$24,892</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <Badge tone="success" className="mt-3">+8.5%</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Win Rate</p>
                    <p className="text-2xl font-bold text-white">76.8%</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <Badge tone="info" className="mt-3">Above target</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Signals</p>
                    <p className="text-2xl font-bold text-white">{signals.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <Badge tone="neutral" className="mt-3">Live feed</Badge>
              </CardContent>
            </Card>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <BotCreate />
              <BotList />
              <BotDetail />
              <BotLogs />
              <RiskSettings />
              <Plans />
              <Billing />
              <ExchangeAccounts />
            </div>

            <div className="space-y-6">
              <LiveOrders />
              <ExecutionsFeed />
              <section id="wallet" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet & Assets</CardTitle>
                    <CardDescription>Manage your wallets and WCH token transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {walletsQuery.isLoading ? <p className="text-sm text-slate-400">Loading wallets...</p> : null}
                    {walletsQuery.error ? <p className="text-sm text-rose-400">{walletsQuery.error.message}</p> : null}
                    <div className="space-y-3">
                      {wallets.slice(0, 3).map((wallet) => (
                        <WalletCard key={wallet.id} wallet={wallet} />
                      ))}
                    </div>
                    {wallets.length === 0 && !walletsQuery.isLoading ? (
                      <p className="text-sm text-slate-500">No wallet payload returned by the API.</p>
                    ) : null}
                  </CardContent>
                </Card>
                {transactionsQuery.error ? <p className="text-sm text-rose-400">{transactionsQuery.error.message}</p> : null}
                <WchUsageCard transactions={transactions} />
              </section>

              <section id="signals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Signal Scanner</CardTitle>
                        <CardDescription>Latest trading signals from AI analysis</CardDescription>
                      </div>
                      <Badge tone="success">Live</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {signalsQuery.isLoading ? <p className="text-sm text-slate-400">Loading signals...</p> : null}
                    {signalsQuery.error ? <p className="text-sm text-rose-400">{signalsQuery.error.message}</p> : null}
                    <div className="space-y-3">
                      {signals.slice(0, 5).map((signal) => (
                        <div key={signal.id} className="rounded-xl border border-slate-800/50 bg-slate-800/20 p-4 transition-colors hover:bg-slate-800/30">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">
                                {signal.symbol} · {signal.action}
                              </p>
                              <p className="text-sm text-slate-400">{signal.strategy}</p>
                            </div>
                            <Badge tone={signal.status === 'processed' ? 'success' : signal.status === 'rejected' ? 'danger' : 'warning'}>
                              {signal.status}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
                            <span>Confidence {formatNumber(signal.confidence)}</span>
                            <span>Price {formatNumber(signal.price)}</span>
                            <span>{formatDate(signal.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {signals.length === 0 && !signalsQuery.isLoading ? (
                      <p className="text-sm text-slate-500">No signal payload returned by the API.</p>
                    ) : null}
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
