import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiKeys } from './ApiKeys';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { apiClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { normalizeExchangeAccount } from '../../types/normalizers';

export function ExchangeAccounts() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['exchange-accounts'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const payload = await apiClient.listExchangeAccounts(accessToken!);
      return payload.map(normalizeExchangeAccount);
    },
  });

  const addAccount = useMutation({
    mutationFn: async (payload: {
      exchange: string;
      label: string;
      apiKey: string;
      apiSecret: string;
      passphrase?: string;
    }) =>
      normalizeExchangeAccount(
        await apiClient.addExchangeAccount(
          {
            exchange: payload.exchange,
            label: payload.label,
            api_key: payload.apiKey,
            api_secret: payload.apiSecret,
            passphrase: payload.passphrase,
          },
          accessToken!,
        ),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exchange-accounts'] });
    },
  });

  return (
    <section id="exchange" className="space-y-4">
      <ApiKeys
        onSubmit={async (payload) => {
          await addAccount.mutateAsync(payload);
        }}
        busy={addAccount.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>Exchange accounts</CardTitle>
          <CardDescription>Current backend response is normalized from PascalCase and secret-bearing repository rows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accessToken ? <p className="text-sm text-slate-400">Authenticate first to query exchange accounts.</p> : null}
          {accountsQuery.isLoading ? <p className="text-sm text-slate-400">Loading exchange accounts...</p> : null}
          {accountsQuery.error ? <p className="text-sm text-rose-300">{accountsQuery.error.message}</p> : null}
          {addAccount.error ? <p className="text-sm text-rose-300">{addAccount.error.message}</p> : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {(accountsQuery.data ?? []).map((account) => (
              <div key={account.id} className="rounded-2xl border border-slate-800 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{account.label}</p>
                    <p className="text-sm text-slate-400">{account.exchange}</p>
                  </div>
                  <Badge tone={account.status === 'active' ? 'success' : account.status === 'error' ? 'danger' : 'warning'}>
                    {account.status}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">Updated {formatDate(account.updatedAt)}</p>
              </div>
            ))}
          </div>

          {(accountsQuery.data ?? []).length === 0 && !accountsQuery.isLoading ? (
            <p className="text-sm text-slate-500">No exchange accounts returned by the API.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
