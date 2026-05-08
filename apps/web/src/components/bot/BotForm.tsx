import { useState } from 'react';

import type { CreateBotRequest } from '../../types/api';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';

interface BotFormProps {
  onSubmit: (payload: CreateBotRequest) => Promise<void> | void;
  busy?: boolean;
}

const initialState = {
  name: '',
  strategy: 'ema_cross_v1',
  symbol: 'BTCUSDT',
  quoteAsset: 'USDT',
  capital: '1000',
  exchangeAccountId: '',
  maxPositionSize: '250',
  maxDailyLoss: '100',
  stopLossPercent: '2',
  takeProfitPercent: '4',
};

export function BotForm({ onSubmit, busy = false }: BotFormProps) {
  const [values, setValues] = useState(initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create bot</CardTitle>
        <CardDescription>Use the typed DTO contract directly from the UI. All risk values remain optional but explicit.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({
              name: values.name,
              strategy: values.strategy,
              symbol: values.symbol,
              quote_asset: values.quoteAsset,
              capital: Number(values.capital),
              exchange_account_id: values.exchangeAccountId || undefined,
              config: {},
              risk_settings: {
                max_position_size: values.maxPositionSize ? Number(values.maxPositionSize) : undefined,
                max_daily_loss: values.maxDailyLoss ? Number(values.maxDailyLoss) : undefined,
                stop_loss_percent: values.stopLossPercent ? Number(values.stopLossPercent) : undefined,
                take_profit_percent: values.takeProfitPercent ? Number(values.takeProfitPercent) : undefined,
              },
            });
            setValues(initialState);
          }}
        >
          <Input label="Bot name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} required />
          <Input label="Strategy" value={values.strategy} onChange={(event) => setValues((current) => ({ ...current, strategy: event.target.value }))} required />
          <Input label="Symbol" value={values.symbol} onChange={(event) => setValues((current) => ({ ...current, symbol: event.target.value }))} required />
          <Input label="Quote asset" value={values.quoteAsset} onChange={(event) => setValues((current) => ({ ...current, quoteAsset: event.target.value }))} required />
          <Input label="Capital" type="number" min="0" step="0.01" value={values.capital} onChange={(event) => setValues((current) => ({ ...current, capital: event.target.value }))} required />
          <Input label="Exchange account ID" value={values.exchangeAccountId} onChange={(event) => setValues((current) => ({ ...current, exchangeAccountId: event.target.value }))} hint="Optional for draft bots, required for live-activation request." />
          <Input label="Max position size" type="number" min="0" step="0.01" value={values.maxPositionSize} onChange={(event) => setValues((current) => ({ ...current, maxPositionSize: event.target.value }))} />
          <Input label="Max daily loss" type="number" min="0" step="0.01" value={values.maxDailyLoss} onChange={(event) => setValues((current) => ({ ...current, maxDailyLoss: event.target.value }))} />
          <Input label="Stop loss %" type="number" min="0" step="0.1" value={values.stopLossPercent} onChange={(event) => setValues((current) => ({ ...current, stopLossPercent: event.target.value }))} />
          <Input label="Take profit %" type="number" min="0" step="0.1" value={values.takeProfitPercent} onChange={(event) => setValues((current) => ({ ...current, takeProfitPercent: event.target.value }))} />
          <div className="md:col-span-2">
            <Button type="submit" busy={busy}>
              Create bot
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
