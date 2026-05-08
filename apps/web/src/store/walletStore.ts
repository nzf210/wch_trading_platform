import { create } from 'zustand';

import type { WalletChain } from '../types/wallet';

interface WalletStoreState {
  selectedWalletId: string | null;
  selectedChain: WalletChain | 'all';
  setSelectedWalletId: (walletId: string | null) => void;
  setSelectedChain: (chain: WalletChain | 'all') => void;
  reset: () => void;
}

export const useWalletStore = create<WalletStoreState>((set) => ({
  selectedWalletId: null,
  selectedChain: 'all',

  setSelectedWalletId: (selectedWalletId) => set({ selectedWalletId }),
  setSelectedChain: (selectedChain) => set({ selectedChain }),
  reset: () =>
    set({
      selectedWalletId: null,
      selectedChain: 'all',
    }),
}));
