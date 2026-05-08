import type { IsoDatetimeString, JsonObject } from './json';

export enum BotStatus {
  DRAFT = 'draft',
  PAPER_ACTIVE = 'paper_active',
  LIVE_PENDING_APPROVAL = 'live_pending_approval',
  LIVE_ACTIVE = 'live_active',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export enum BotMode {
  PAPER = 'paper',
  LIVE = 'live',
}

export interface Bot {
  id: string;
  userId: string;
  exchangeAccountId?: string;
  name: string;
  mode: BotMode;
  strategy: string;
  symbol: string;
  quoteAsset: string;
  capital: number;
  status: BotStatus;
  config: JsonObject;
  createdAt: Date;
  updatedAt: Date;
}

export interface BotWire {
  id: string;
  user_id: string;
  exchange_account_id?: string;
  name: string;
  mode: BotMode;
  strategy: string;
  symbol: string;
  quote_asset: string;
  capital: number;
  status: BotStatus;
  config: JsonObject;
  created_at: IsoDatetimeString;
  updated_at: IsoDatetimeString;
}

export interface RiskSettings {
  id: string;
  botId: string;
  maxPositionSize?: number;
  maxDailyLoss?: number;
  stopLossPercent?: number;
  takeProfitPercent?: number;
  emergencyStop: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskSettingsWire {
  id: string;
  bot_id: string;
  max_position_size?: number;
  max_daily_loss?: number;
  stop_loss_percent?: number;
  take_profit_percent?: number;
  emergency_stop: boolean;
  created_at: IsoDatetimeString;
  updated_at: IsoDatetimeString;
}
