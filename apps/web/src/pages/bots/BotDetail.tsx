import { useEffect } from 'react';

import { BotActionButtons } from '../../components/bot/BotActionButtons';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { useBots } from '../../hooks/useBots';
import { useBotStore } from '../../store/botStore';

export function BotDetail() {
  const { bots, bot, riskSettings, detailQuery, activatePaper, requestLiveActivation, pauseBot, stopBot } = useBots(
    useBotStore((state) => state.selectedBotId) ?? undefined,
  );
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);

  useEffect(() => {
    if (!selectedBotId && bots.length > 0) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId, setSelectedBotId]);

  if (!selectedBotId) {
    return (
      <section className="space-y-4">
        <Card>
          <CardContent className="py-8 text-sm text-slate-400">Select a bot to inspect its typed detail and risk contract.</CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{bot?.name ?? 'Loading bot...'}</CardTitle>
              <CardDescription>
                Detail response is normalized from `snake_case` API shape into shared frontend domain model.
              </CardDescription>
            </div>
            {bot ? <Badge tone="info">{bot.status}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {detailQuery.isLoading ? <p className="text-sm text-slate-400">Loading selected bot...</p> : null}
          {detailQuery.error ? <p className="text-sm text-rose-300">{detailQuery.error.message}</p> : null}

          {bot ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Mode</p>
                  <p className="mt-2 text-sm text-white">{bot.mode}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Capital</p>
                  <p className="mt-2 text-sm text-white">{formatCurrency(bot.capital)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Created</p>
                  <p className="mt-2 text-sm text-white">{formatDate(bot.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Updated</p>
                  <p className="mt-2 text-sm text-white">{formatDate(bot.updatedAt)}</p>
                </div>
              </div>

              <BotActionButtons
                bot={bot}
                activatePaper={activatePaper}
                requestLiveActivation={requestLiveActivation}
                pauseBot={pauseBot}
                stopBot={stopBot}
              />

              {riskSettings ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-800 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Max position</p>
                    <p className="mt-2 text-white">{formatNumber(riskSettings.maxPositionSize)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Max daily loss</p>
                    <p className="mt-2 text-white">{formatNumber(riskSettings.maxDailyLoss)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Stop loss %</p>
                    <p className="mt-2 text-white">{formatNumber(riskSettings.stopLossPercent)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Take profit %</p>
                    <p className="mt-2 text-white">{formatNumber(riskSettings.takeProfitPercent)}</p>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
