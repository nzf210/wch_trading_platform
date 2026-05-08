
import { useTradingStore } from '../../store/useTradingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';

export function ExecutionsFeed() {
  const executions = useTradingStore((state) => state.executions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executions Feed</CardTitle>
        <CardDescription>Real-time stream of successfully executed trades.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {executions.length === 0 ? <p className="text-sm text-slate-500">No executions yet.</p> : null}
        {executions.map((exec) => (
          <div key={exec.id} className="rounded-2xl border border-slate-800 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">
                  {exec.orderId}
                </p>
                <p className="text-sm text-slate-400">
                  Avg price {formatCurrency(exec.averagePrice)}
                </p>
              </div>
              <Badge tone="success">Filled</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>Qty: {formatNumber(exec.filledQuantity)}</span>
              <span>Fee: {formatCurrency(exec.fee)}</span>
              <span>{formatDate(exec.executedAt)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
