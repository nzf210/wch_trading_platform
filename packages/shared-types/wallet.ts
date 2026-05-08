import type { IsoDatetimeString, JsonObject } from './json';

export enum WalletChain {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  BASE = 'base',
  SOLANA = 'solana',
  TON = 'ton',
  TRON = 'tron',
}

export interface Wallet {
  id: string;
  userId: string;
  chain: WalletChain | string;
  address: string;
  isPrimary: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface WalletWire {
  id: string;
  user_id: string;
  chain: WalletChain | string;
  address: string;
  is_primary: boolean;
  verified_at?: IsoDatetimeString;
  created_at: IsoDatetimeString;
}

export enum WchTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  CREDIT = 'credit',
  REWARD = 'reward',
  ADJUSTMENT = 'adjustment',
}

export enum WchTransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface WchTransaction {
  id: string;
  userId: string;
  walletId?: string;
  txHash?: string;
  type: WchTransactionType | string;
  amount: number;
  status: WchTransactionStatus | string;
  metadata: JsonObject;
  createdAt: Date;
}

export interface WchTransactionWire {
  id: string;
  user_id: string;
  wallet_id?: string;
  tx_hash?: string;
  type: WchTransactionType | string;
  amount: number;
  status: WchTransactionStatus | string;
  metadata: JsonObject;
  created_at: IsoDatetimeString;
}
