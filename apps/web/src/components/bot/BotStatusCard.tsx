import type { Bot } from '../../types/bot';

import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

function getTone(status: Bot['status']) {
  switch (status) {
    case 'paper_active':
    case 'live_active':
      return 'success';
    case 'live_pending_approval':
    case 'paused':
      return 'warning';
    case 'error':
    case 'stopped':
      return 'danger';
    default:
      return 'info';
  }
}

interface BotStatusCardProps {
  bot: Bot;
  selected?: boolean;
  onSelect?: (botId: string) => void;
}

export function BotStatusCard({ bot, selected = false, onSelect }: BotStatusCardProps) {
  return (
    <button className="block w-full text-left" onClick={() => onSelect?.(bot.id)} type="button">
      <Card className={selected ? 'border-cyan-500/60 shadow-[0_0_0_1px_rgba(34,211,238,0.28)]' : undefined}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{bot.name}</CardTitle>
              <CardDescription>
                {bot.strategy} · {bot.symbol}/{bot.quoteAsset}
              </CardDescription>
            </div>
            <Badge tone={getTone(bot.status)}>{bot.status.replace(/_/g, ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Mode</p>
            <p className="mt-1">{bot.mode}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Capital</p>
            <p className="mt-1">{formatCurrency(bot.capital)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Updated</p>
            <p className="mt-1">{formatDate(bot.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
