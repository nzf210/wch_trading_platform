import type { Wallet } from '../../types/wallet';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
              <span className="text-xs font-semibold text-cyan-400">
                {wallet.chain.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-white capitalize">{wallet.chain}</span>
          </div>
          <p className="font-mono text-sm text-slate-400">
            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {wallet.isPrimary && (
            <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
              Primary
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-400">
            {wallet.verifiedAt ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </div>
    </div>
  );
}
