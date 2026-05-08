import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatNumber } from '../../lib/utils';
import { useSubscription } from '../../hooks/useSubscription';

export function Plans() {
  const { plan, subscriptionQuery } = useSubscription();

  return (
    <section id="subscription">
      <Card>
        <CardHeader>
          <CardTitle>Plan contract</CardTitle>
          <CardDescription>Frontend now consumes the canonical shared `Plan` contract instead of per-page DTOs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionQuery.isLoading ? <p className="text-sm text-slate-400">Loading subscription plan...</p> : null}
          {subscriptionQuery.error ? <p className="text-sm text-rose-300">{subscriptionQuery.error.message}</p> : null}

          {plan ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Plan</p>
                <p className="mt-2 text-white">{plan.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Price</p>
                <p className="mt-2 text-white">{formatNumber(plan.priceWch)} WCH</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Paper bots</p>
                <p className="mt-2 text-white">{plan.maxPaperBots}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Live bots</p>
                <p className="mt-2 text-white">{plan.maxLiveBots}</p>
              </div>
            </div>
          ) : (
            <Badge tone="warning">No plan payload returned yet</Badge>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
