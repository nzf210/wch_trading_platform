import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { normalizeWallet } from '../../types/normalizers';
import { WalletCard } from '../../components/wallet/WalletCard';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { WalletChain } from '../../types/wallet';

const CHAIN_OPTIONS: WalletChain[] = [
  WalletChain.ETHEREUM,
  WalletChain.BSC,
  WalletChain.POLYGON,
  WalletChain.ARBITRUM,
  WalletChain.BASE,
  WalletChain.SOLANA,
  WalletChain.TON,
  WalletChain.TRON,
];

export function WalletConnect() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [chain, setChain] = useState<WalletChain>(WalletChain.ETHEREUM);
  const [address, setAddress] = useState('');

  const walletsQuery = useQuery({
    queryKey: ['wallets'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const wallets = await apiClient.listWallets(accessToken!);
      return wallets.map(normalizeWallet);
    },
  });

  const addWallet = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error('Not authenticated');
      return apiClient.addExchangeAccount(
        { exchange: chain, label: address },
        accessToken,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setAddress('');
    },
  });

  return (
    <section id="wallet-connect" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Add blockchain wallets to manage your WCH tokens and subscription payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Chain</span>
                <select
                  className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                  value={chain}
                  onChange={(event) => setChain(event.target.value as WalletChain)}
                >
                  {CHAIN_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <Input
              label="Wallet Address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="0x..."
            />
          </div>
          <Button
            onClick={() => addWallet.mutate()}
            busy={addWallet.isPending}
            disabled={!address}
          >
            Connect Wallet
          </Button>
          {addWallet.error && (
            <p className="text-sm text-rose-300">{addWallet.error.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Wallets</CardTitle>
              <CardDescription>Your linked blockchain wallets.</CardDescription>
            </div>
            <Badge>{walletsQuery.data?.length ?? 0} wallets</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {walletsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading wallets...</p>
          ) : walletsQuery.error ? (
            <p className="text-sm text-rose-300">{walletsQuery.error.message}</p>
          ) : walletsQuery.data && walletsQuery.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {walletsQuery.data.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No wallets connected. Add your first wallet above.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
