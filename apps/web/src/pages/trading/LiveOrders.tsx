
import { useTradingStore } from '../../store/useTradingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';

export function LiveOrders() {
  const orders = useTradingStore((state) => state.orders);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Orders</CardTitle>
        <CardDescription>Real-time stream of order updates from the exchange.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 ? <p className="text-sm text-slate-500">No live orders.</p> : null}
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-slate-800 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">
                  {order.symbol} · {order.side}
                </p>
                <p className="text-sm text-slate-400">
                  {order.orderType} · Target: {formatCurrency(order.price)}
                </p>
              </div>
              <Badge tone={order.status === 'filled' ? 'success' : 'warning'}>{order.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>Qty: {formatNumber(order.quantity)}</span>
              <span>Exchange: {order.exchange}</span>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
