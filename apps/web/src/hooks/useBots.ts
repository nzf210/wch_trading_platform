import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import {
  normalizeBot,
  normalizeBotDetail,
  normalizeRiskSettings,
} from '../types/normalizers';
import type { CreateBotRequest, UpdateRiskRequest } from '../types/api';

const botKeys = {
  all: ['bots'] as const,
  detail: (botId: string) => ['bots', botId] as const,
  risk: (botId: string) => ['bots', botId, 'risk'] as const,
};

function requireToken(token: string | null): string {
  if (!token) {
    throw new Error('authentication required');
  }

  return token;
}

export function useBots(botId?: string) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const listQuery = useQuery({
    queryKey: botKeys.all,
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const bots = await apiClient.listBots(requireToken(accessToken));
      return bots.map(normalizeBot);
    },
  });

  const detailQuery = useQuery({
    queryKey: botId ? botKeys.detail(botId) : ['bots', 'detail', 'idle'],
    enabled: Boolean(accessToken && botId),
    queryFn: async () => normalizeBotDetail(await apiClient.getBot(botId!, requireToken(accessToken))),
  });

  const riskQuery = useQuery({
    queryKey: botId ? botKeys.risk(botId) : ['bots', 'risk', 'idle'],
    enabled: Boolean(accessToken && botId),
    queryFn: async () => normalizeRiskSettings(await apiClient.getRiskSettings(botId!, requireToken(accessToken))),
  });

  const createBot = useMutation({
    mutationFn: async (payload: CreateBotRequest) =>
      normalizeBotDetail(await apiClient.createBot(payload, requireToken(accessToken))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    },
  });

  const activatePaper = useMutation({
    mutationFn: async (targetBotId: string) =>
      apiClient.activatePaper(targetBotId, requireToken(accessToken)),
    onSuccess: (_, targetBotId) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.detail(targetBotId) });
    },
  });

  const requestLiveActivation = useMutation({
    mutationFn: async (targetBotId: string) =>
      apiClient.requestLiveActivation(targetBotId, requireToken(accessToken)),
    onSuccess: (_, targetBotId) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.detail(targetBotId) });
    },
  });

  const pauseBot = useMutation({
    mutationFn: async (targetBotId: string) =>
      apiClient.pauseBot(targetBotId, requireToken(accessToken)),
    onSuccess: (_, targetBotId) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.detail(targetBotId) });
    },
  });

  const stopBot = useMutation({
    mutationFn: async (targetBotId: string) =>
      apiClient.stopBot(targetBotId, requireToken(accessToken)),
    onSuccess: (_, targetBotId) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.detail(targetBotId) });
    },
  });

  const updateRisk = useMutation({
    mutationFn: async ({ targetBotId, payload }: { targetBotId: string; payload: UpdateRiskRequest }) =>
      normalizeRiskSettings(
        await apiClient.updateRiskSettings(targetBotId, payload, requireToken(accessToken)),
      ),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.risk(variables.targetBotId) });
      void queryClient.invalidateQueries({ queryKey: botKeys.detail(variables.targetBotId) });
    },
  });

  const toggleEmergencyStop = useMutation({
    mutationFn: async ({ targetBotId, stop }: { targetBotId: string; stop: boolean }) =>
      apiClient.toggleBotEmergencyStop(
        targetBotId,
        { stop },
        requireToken(accessToken),
      ),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: botKeys.risk(variables.targetBotId) });
    },
  });

  return useMemo(
    () => ({
      bots: listQuery.data ?? [],
      bot: detailQuery.data?.bot ?? null,
      botDetail: detailQuery.data ?? null,
      riskSettings: riskQuery.data ?? detailQuery.data?.riskSettings ?? null,
      listQuery,
      detailQuery,
      riskQuery,
      createBot,
      activatePaper,
      requestLiveActivation,
      pauseBot,
      stopBot,
      updateRisk,
      toggleEmergencyStop,
    }),
    [
      activatePaper,
      createBot,
      detailQuery,
      listQuery,
      pauseBot,
      requestLiveActivation,
      riskQuery,
      stopBot,
      toggleEmergencyStop,
      updateRisk,
    ],
  );
}
