import type { UseMutationResult } from '@tanstack/react-query';

import type { LifecycleMessageResponse } from '../../types/api';
import type { Bot } from '../../types/bot';
import { Button } from '../ui/Button';

interface BotActionButtonsProps {
  bot: Bot;
  activatePaper: UseMutationResult<LifecycleMessageResponse, Error, string, unknown>;
  requestLiveActivation: UseMutationResult<LifecycleMessageResponse, Error, string, unknown>;
  pauseBot: UseMutationResult<LifecycleMessageResponse, Error, string, unknown>;
  stopBot: UseMutationResult<LifecycleMessageResponse, Error, string, unknown>;
}

export function BotActionButtons({
  bot,
  activatePaper,
  requestLiveActivation,
  pauseBot,
  stopBot,
}: BotActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="primary"
        busy={activatePaper.isPending}
        disabled={bot.status !== 'draft' && bot.status !== 'paused'}
        onClick={() => activatePaper.mutate(bot.id)}
      >
        Activate paper
      </Button>
      <Button
        variant="secondary"
        busy={requestLiveActivation.isPending}
        disabled={bot.status !== 'paper_active' && bot.status !== 'paused'}
        onClick={() => requestLiveActivation.mutate(bot.id)}
      >
        Request live
      </Button>
      <Button
        variant="ghost"
        busy={pauseBot.isPending}
        disabled={bot.status !== 'paper_active' && bot.status !== 'live_active'}
        onClick={() => pauseBot.mutate(bot.id)}
      >
        Pause
      </Button>
      <Button
        variant="danger"
        busy={stopBot.isPending}
        disabled={bot.status === 'stopped'}
        onClick={() => stopBot.mutate(bot.id)}
      >
        Stop
      </Button>
    </div>
  );
}
