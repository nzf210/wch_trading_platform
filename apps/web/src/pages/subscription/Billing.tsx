import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate, formatNumber } from '../../lib/utils';
import { useSubscription } from '../../hooks/useSubscription';

export function Billing() {
  const { subscription } = useSubscription();

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Billing state</CardTitle>
          <CardDescription>Subscription summary response is normalized into FE billing models with real dates.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                <div className="mt-2">
                  <Badge tone={subscription.status === 'active' ? 'success' : subscription.status === 'pending_payment' ? 'warning' : 'danger'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Paid</p>
                <p className="mt-2 text-white">{formatNumber(subscription.paidAmountWch)} WCH</p>
              </div>
              <div className="rounded-2xl border border-slate-800 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Started</p>
                <p className="mt-2 text-white">{formatDate(subscription.startedAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Expires</p>
                <p className="mt-2 text-white">{formatDate(subscription.expiresAt)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No billing payload available for the current session.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
