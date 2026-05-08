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
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Please log in or register to access the platform.</CardDescription>
            </CardHeader>
          </Card>
          <div className="grid gap-4 xl:grid-cols-2">
            <Login />
            <Register />
          </div>
        </section>
      ) : (
        <>
          <TradingDataInitializer />
          <section id="status-summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frontend contract status</CardTitle>
                <CardDescription>
                  Shared domain contracts, API DTOs, normalizers, stores, hooks, and pages are now wired into one runnable UI surface.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Badge tone="info">Shared contracts</Badge>
                <Badge tone="info">API DTOs</Badge>
                <Badge tone="info">Normalizers</Badge>
                <Badge tone="info">Runtime hooks</Badge>
                <Badge tone="success">Buildable shell</Badge>
              </CardContent>
            </Card>
          </section>

          <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <BotCreate />
              <BotList />
              <BotDetail />
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
                    <CardTitle>Wallet summary</CardTitle>
                    <CardDescription>Wallet and WCH transaction pages now consume the canonical FE wallet contracts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {walletsQuery.isLoading ? <p className="text-sm text-slate-400">Loading wallets...</p> : null}
                    {walletsQuery.error ? <p className="text-sm text-rose-300">{walletsQuery.error.message}</p> : null}
                    <div className="space-y-4">
                      {wallets.slice(0, 3).map((wallet) => (
                        <WalletCard key={wallet.id} wallet={wallet} />
                      ))}
                    </div>
                    {wallets.length === 0 && !walletsQuery.isLoading ? (
                      <p className="text-sm text-slate-500">No wallet payload returned by the API.</p>
                    ) : null}
                  </CardContent>
                </Card>
                {transactionsQuery.error ? <p className="text-sm text-rose-300">{transactionsQuery.error.message}</p> : null}
                <WchUsageCard transactions={transactions} />
              </section>

              <section id="signals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent signals</CardTitle>
                    <CardDescription>Signal payloads are normalized from API wire shape before the UI reads them.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {signalsQuery.isLoading ? <p className="text-sm text-slate-400">Loading signals...</p> : null}
                    {signalsQuery.error ? <p className="text-sm text-rose-300">{signalsQuery.error.message}</p> : null}
                    <div className="space-y-3">
                      {signals.slice(0, 5).map((signal) => (
                        <div key={signal.id} className="rounded-2xl border border-slate-800 px-4 py-4">
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
