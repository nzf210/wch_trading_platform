import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useBots } from '../../hooks/useBots';
import { useBotStore } from '../../store/botStore';

export function RiskSettings() {
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const { bot, riskSettings, updateRisk, toggleEmergencyStop } = useBots(selectedBotId ?? undefined);
  const [values, setValues] = useState({
    maxPositionSize: '',
    maxDailyLoss: '',
    stopLossPercent: '',
    takeProfitPercent: '',
  });

  useEffect(() => {
    setValues({
      maxPositionSize: riskSettings?.maxPositionSize?.toString() ?? '',
      maxDailyLoss: riskSettings?.maxDailyLoss?.toString() ?? '',
      stopLossPercent: riskSettings?.stopLossPercent?.toString() ?? '',
      takeProfitPercent: riskSettings?.takeProfitPercent?.toString() ?? '',
    });
  }, [riskSettings]);

  return (
    <section id="risk">
      <Card>
        <CardHeader>
          <CardTitle>Risk controls</CardTitle>
          <CardDescription>Partial updates use the same DTO shape as the Go API policy layer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedBotId || !bot ? (
            <p className="text-sm text-slate-400">Pick a bot first. Risk settings are scoped per bot.</p>
          ) : (
            <>
              <p className="text-sm text-slate-300">Editing risk policy for <span className="font-medium text-white">{bot.name}</span>.</p>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await updateRisk.mutateAsync({
                    targetBotId: selectedBotId,
                    payload: {
                      max_position_size: values.maxPositionSize ? Number(values.maxPositionSize) : undefined,
                      max_daily_loss: values.maxDailyLoss ? Number(values.maxDailyLoss) : undefined,
                      stop_loss_percent: values.stopLossPercent ? Number(values.stopLossPercent) : undefined,
                      take_profit_percent: values.takeProfitPercent ? Number(values.takeProfitPercent) : undefined,
                    },
                  });
                }}
              >
                <Input label="Max position size" type="number" min="0" step="0.01" value={values.maxPositionSize} onChange={(event) => setValues((current) => ({ ...current, maxPositionSize: event.target.value }))} />
                <Input label="Max daily loss" type="number" min="0" step="0.01" value={values.maxDailyLoss} onChange={(event) => setValues((current) => ({ ...current, maxDailyLoss: event.target.value }))} />
                <Input label="Stop loss %" type="number" min="0" step="0.1" value={values.stopLossPercent} onChange={(event) => setValues((current) => ({ ...current, stopLossPercent: event.target.value }))} />
                <Input label="Take profit %" type="number" min="0" step="0.1" value={values.takeProfitPercent} onChange={(event) => setValues((current) => ({ ...current, takeProfitPercent: event.target.value }))} />
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" busy={updateRisk.isPending}>
                    Save risk settings
                  </Button>
                  <Button
                    type="button"
                    variant={riskSettings?.emergencyStop ? 'danger' : 'ghost'}
                    busy={toggleEmergencyStop.isPending}
                    onClick={() =>
                      toggleEmergencyStop.mutate({
                        targetBotId: selectedBotId,
                        stop: !riskSettings?.emergencyStop,
                      })
                    }
                  >
                    {riskSettings?.emergencyStop ? 'Disable emergency stop' : 'Enable emergency stop'}
                  </Button>
                </div>
              </form>
              {updateRisk.error ? <p className="text-sm text-rose-300">{updateRisk.error.message}</p> : null}
              {toggleEmergencyStop.error ? <p className="text-sm text-rose-300">{toggleEmergencyStop.error.message}</p> : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
