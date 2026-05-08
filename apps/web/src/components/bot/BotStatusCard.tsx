import type { Bot } from '../../types/bot';

import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

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
      <Card className={selected ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'hover:border-slate-700/50'}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                selected ? 'bg-cyan-500/20' : 'bg-slate-800/50'
              }`}>
                <svg className={`h-5 w-5 ${selected ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">{bot.name}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {bot.strategy} · {bot.symbol}/{bot.quoteAsset}
                </p>
              </div>
            </div>
            <Badge tone={getTone(bot.status)}>{bot.status.replace(/_/g, ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-3 text-sm">
          <div className="rounded-lg bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mode</p>
            <p className="mt-1 font-medium text-white">{bot.mode}</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Capital</p>
            <p className="mt-1 font-medium text-white">{formatCurrency(bot.capital)}</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Updated</p>
            <p className="mt-1 font-medium text-white">{formatDate(bot.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
