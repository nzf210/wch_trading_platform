import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatDate, formatNumber } from '../../lib/utils';
import { BotStatus } from '../../types/bot';

interface BotLogEntry {
  timestamp: Date;
  level: string;
  message: string;
}

export function BotLogs() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const botsQuery = useQuery({
    queryKey: ['bots'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const bots = await apiClient.listBots(accessToken!);
      return bots;
    },
  });

  const logsQuery = useQuery<BotLogEntry[]>({
    queryKey: ['bot-logs', selectedBot],
    enabled: Boolean(accessToken) && Boolean(selectedBot),
    queryFn: async () => {
      // TODO: Add getBotLogs API method when backend supports it
      // For now, we'll show empty state
      return [];
    },
  });

  const selectedBotData = botsQuery.data?.find((b) => b.id === selectedBot);

  return (
    <section id="bot-logs" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bot Logs</CardTitle>
              <CardDescription>
                View detailed logs for your trading bots to debug issues and monitor activity.
              </CardDescription>
            </div>
            <Badge tone="info">Real-time</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bot Selector */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Select Bot</span>
              <select
                className="h-11 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-sm text-white backdrop-blur transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                value={selectedBot ?? ''}
                onChange={(event) => setSelectedBot(event.target.value || null)}
              >
                <option value="">Select a bot...</option>
                {botsQuery.data?.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name} ({bot.status})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Log Level</span>
              <select
                className="h-11 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 text-sm text-white backdrop-blur transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </label>
          </div>

          {/* Selected Bot Info */}
          {selectedBotData && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{selectedBotData.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{selectedBotData.id}</p>
                </div>
                <Badge tone={
                  selectedBotData.status === BotStatus.PAPER_ACTIVE || 
                  selectedBotData.status === BotStatus.LIVE_ACTIVE 
                    ? 'success' : 'warning'
                }>
                  {selectedBotData.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          )}

          {/* Refresh */}
          {selectedBot && (
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => void logsQuery.refetch()}>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Logs
              </Button>
            </div>
          )}

          {/* Logs List */}
          {logsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          ) : logsQuery.error ? (
            <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{logsQuery.error.message}</p>
          ) : logsQuery.data && logsQuery.data.length > 0 ? (
            <div className="space-y-1 font-mono text-xs">
              {logsQuery.data.map((log, index) => (
                <div
                  key={index}
                  className={`rounded-lg px-4 py-3 ${
                    log.level === 'error' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                    log.level === 'warn' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    'bg-slate-800/30 text-slate-300 border border-slate-700/30'
                  }`}
                >
                  <span className="mr-3 text-slate-500">[{formatDate(log.timestamp)}]</span>
                  <span className={`mr-3 font-semibold ${
                    log.level === 'error' ? 'text-rose-400' :
                    log.level === 'warn' ? 'text-amber-400' :
                    'text-cyan-400'
                  }`}>[{log.level.toUpperCase()}]</span>
                  {log.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700/50 py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">
                {selectedBot
                  ? 'No logs available for this bot yet.'
                  : 'Select a bot above to view its logs.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
