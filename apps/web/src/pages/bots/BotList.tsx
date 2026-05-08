import { useMemo } from 'react';

import { useBots } from '../../hooks/useBots';
import { useBotStore } from '../../store/botStore';
import { BotMode, BotStatus } from '../../types/bot';
import { BotStatusCard } from '../../components/bot/BotStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export function BotList() {
  const { bots, listQuery } = useBots();
  const filters = useBotStore((state) => state.filters);
  const setFilters = useBotStore((state) => state.setFilters);
  const selectedBotId = useBotStore((state) => state.selectedBotId);
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);

  const filteredBots = useMemo(
    () =>
      bots.filter((bot) => {
        const matchesSearch =
          filters.search.length === 0 ||
          `${bot.name} ${bot.symbol} ${bot.strategy}`.toLowerCase().includes(filters.search.toLowerCase());
        const matchesMode = filters.mode === 'all' || bot.mode === filters.mode;
        const matchesStatus = filters.status === 'all' || bot.status === filters.status;
        return matchesSearch && matchesMode && matchesStatus;
      }),
    [bots, filters.mode, filters.search, filters.status],
  );

  return (
    <section id="bots" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bot inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Search" value={filters.search} onChange={(event) => setFilters({ search: event.target.value })} placeholder="name, symbol, strategy" />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Mode</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={filters.mode}
                onChange={(event) => setFilters({ mode: event.target.value as BotMode | 'all' })}
              >
                <option value="all">all</option>
                {Object.values(BotMode).map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100"
                value={filters.status}
                onChange={(event) => setFilters({ status: event.target.value as BotStatus | 'all' })}
              >
                <option value="all">all</option>
                {Object.values(BotStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {listQuery.isLoading ? <p className="text-sm text-slate-400">Loading bots...</p> : null}
          {listQuery.error ? <p className="text-sm text-rose-300">{listQuery.error.message}</p> : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {filteredBots.map((bot) => (
              <BotStatusCard
                key={bot.id}
                bot={bot}
                selected={selectedBotId === bot.id}
                onSelect={setSelectedBotId}
              />
            ))}
          </div>

          {filteredBots.length === 0 && !listQuery.isLoading ? (
            <p className="text-sm text-slate-500">No bots matched the current filter set.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
