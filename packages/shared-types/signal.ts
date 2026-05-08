import type { IsoDatetimeString, JsonObject } from './json';

export enum SignalStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export enum SignalAction {
  BUY = 'buy',
  SELL = 'sell',
}

export interface SignalProvenance {
  source: string;
  version: string;
  hostname?: string;
}

export interface Signal {
  id: string;
  botId: string;
  userId: string;
  exchange: string;
  symbol: string;
  strategy: string;
  action: SignalAction;
  price?: number;
  confidence: number;
  status: SignalStatus;

  schemaVersion: string;
  featureSnapshot: JsonObject;
  ttlMs: number;
  dedupKey: string;
  provenance: SignalProvenance;
  payload: JsonObject;
  createdAt: Date;
}

export interface SignalWire {
  id: string;
  bot_id: string;
  user_id: string;
  exchange: string;
  symbol: string;
  strategy: string;
  action: SignalAction;
  price?: number;
  confidence: number;
  status: SignalStatus;
  schema_version: string;
  feature_snapshot: JsonObject;
  ttl_ms: number;
  dedup_key: string;
  provenance: SignalProvenance;
  payload: JsonObject;
  created_at: IsoDatetimeString;
}
