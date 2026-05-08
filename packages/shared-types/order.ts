import type { IsoDatetimeString, JsonObject } from './json';

export enum OrderIntentStatus {
  CREATED = 'created',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  SUPERSEDED = 'superseded',
}

export enum OrderStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  FAILED = 'failed',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
}

export interface OrderIntent {
  id: string;
  botId: string;
  userId: string;
  signalId?: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  status: OrderIntentStatus;
  reason?: string;
  createdAt: Date;
}

export interface OrderIntentWire {
  id: string;
  bot_id: string;
  user_id: string;
  signal_id?: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  price?: number;
  status: OrderIntentStatus;
  reason?: string;
  created_at: IsoDatetimeString;
}

export interface Order {
  id: string;
  botId: string;
  userId: string;
  signalId?: string;
  orderIntentId: string;
  exchange: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  status: OrderStatus;
  exchangeOrderId?: string;
  idempotencyKey: string;
  rawResponse?: JsonObject;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWire {
  id: string;
  bot_id: string;
  user_id: string;
  signal_id?: string;
  order_intent_id: string;
  exchange: string;
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  price?: number;
  status: OrderStatus;
  exchange_order_id?: string;
  idempotency_key: string;
  raw_response?: JsonObject;
  created_at: IsoDatetimeString;
  updated_at: IsoDatetimeString;
}
