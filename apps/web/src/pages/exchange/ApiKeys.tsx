import { useState } from 'react';

import type { AddExchangeAccountRequest } from '../../types/exchange';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface ApiKeysProps {
  onSubmit: (payload: AddExchangeAccountRequest) => Promise<void> | void;
  busy?: boolean;
}

export function ApiKeys({ onSubmit, busy = false }: ApiKeysProps) {
  const [values, setValues] = useState({
    exchange: 'binance',
    label: 'Primary Binance',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add exchange account</CardTitle>
        <CardDescription>
          This form uses the sanitized FE request contract even though backend responses still expose raw repository fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({
              exchange: values.exchange,
              label: values.label,
              apiKey: values.apiKey,
              apiSecret: values.apiSecret,
              passphrase: values.passphrase || undefined,
            });
          }}
        >
          <Input label="Exchange" value={values.exchange} onChange={(event) => setValues((current) => ({ ...current, exchange: event.target.value }))} required />
          <Input label="Label" value={values.label} onChange={(event) => setValues((current) => ({ ...current, label: event.target.value }))} required />
          <Input label="API key" value={values.apiKey} onChange={(event) => setValues((current) => ({ ...current, apiKey: event.target.value }))} required />
          <Input label="API secret" type="password" value={values.apiSecret} onChange={(event) => setValues((current) => ({ ...current, apiSecret: event.target.value }))} required />
          <Input label="Passphrase" value={values.passphrase} onChange={(event) => setValues((current) => ({ ...current, passphrase: event.target.value }))} />
          <div className="md:col-span-2">
            <Button type="submit" busy={busy}>
              Save exchange account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
