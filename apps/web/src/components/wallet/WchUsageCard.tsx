import type { WchTransaction } from '../../types/wallet';

import { formatDate, formatNumber } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface WchUsageCardProps {
  transactions: WchTransaction[];
}

export function WchUsageCard({ transactions }: WchUsageCardProps) {
  const confirmedVolume = transactions
    .filter((transaction) => transaction.status === 'confirmed')
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>WCH usage</CardTitle>
        <CardDescription>On-chain subscription and treasury activity reflected through typed wallet contracts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3">
          <span>Confirmed volume</span>
          <span className="font-medium text-white">{formatNumber(confirmedVolume)} WCH</span>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 4).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 px-4 py-3">
              <div>
                <p className="font-medium text-white">{transaction.type}</p>
                <p className="text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
              </div>
              <div className="text-right">
                <p>{formatNumber(transaction.amount)} WCH</p>
                <Badge tone={transaction.status === 'confirmed' ? 'success' : transaction.status === 'failed' ? 'danger' : 'warning'}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
          {transactions.length === 0 ? <p className="text-slate-500">No WCH transactions returned by the API yet.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
