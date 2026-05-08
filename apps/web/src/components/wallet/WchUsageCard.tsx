import type { WchTransaction } from '../../types/wallet';

interface WchUsageCardProps {
  transactions: WchTransaction[];
}

export function WchUsageCard({ transactions }: WchUsageCardProps) {
  // Calculate usage by type
  const usageByType = transactions.reduce((acc, tx) => {
    acc[tx.type] = (acc[tx.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTransactions = transactions.length;
  const maxCount = Math.max(...Object.values(usageByType), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h4 className="mb-4 text-sm font-medium text-slate-200">Usage Breakdown</h4>
      <div className="space-y-3">
        {Object.entries(usageByType).map(([type, count]) => (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 capitalize">{type.replace(/_/g, ' ')}</span>
              <span className="text-white">{count}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {Object.keys(usageByType).length === 0 && (
          <p className="text-sm text-slate-500">No usage data available.</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
        <span className="text-slate-400">Total Transactions</span>
        <span className="font-medium text-white">{totalTransactions}</span>
      </div>
    </div>
  );
}
