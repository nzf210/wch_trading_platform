
import { useTradingStore } from '../../store/useTradingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatNumber, formatDate } from '../../lib/utils';
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
                  {exec.symbol} · {exec.side}
                </p>
                <p className="text-sm text-slate-400">
                  Filled at {formatNumber(exec.price, 'currency')}
                </p>
              </div>
              <Badge tone="success">Filled</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>Qty: {formatNumber(exec.quantity)}</span>
              <span>Fee: {formatNumber(exec.fee, 'currency')}</span>
              <span>{formatDate(exec.executedAt)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
