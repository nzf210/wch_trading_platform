import type { Wallet } from '../../types/wallet';

import { formatDate, shortenAddress } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{wallet.chain}</CardTitle>
          {wallet.isPrimary ? <Badge tone="info">primary</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-300">
        <p>{shortenAddress(wallet.address, 10, 6)}</p>
        <p className="text-slate-500">Created {formatDate(wallet.createdAt)}</p>
        <p className="text-slate-500">
          Verification {wallet.verifiedAt ? formatDate(wallet.verifiedAt) : 'pending'}
        </p>
      </CardContent>
    </Card>
  );
}
