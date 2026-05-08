import { create } from 'zustand';

import type { BotMode, BotStatus } from '../types/bot';

export interface BotFilters {
  search: string;
  mode: BotMode | 'all';
  status: BotStatus | 'all';
}

interface BotStoreState {
  selectedBotId: string | null;
  filters: BotFilters;
  setSelectedBotId: (botId: string | null) => void;
  setFilters: (filters: Partial<BotFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: BotFilters = {
  search: '',
  mode: 'all',
  status: 'all',
};

export const useBotStore = create<BotStoreState>((set) => ({
  selectedBotId: null,
  filters: defaultFilters,

  setSelectedBotId: (selectedBotId) => set({ selectedBotId }),

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
