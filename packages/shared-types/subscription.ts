import type { IsoDatetimeString, JsonObject } from './json';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING_PAYMENT = 'pending_payment',
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  priceWch: number;
  maxLiveBots: number;
  maxPaperBots: number;
  features: JsonObject;
  createdAt: Date;
}

export interface PlanWire {
  id: string;
  name: string;
  code: string;
  price_wch: number;
  max_live_bots: number;
  max_paper_bots: number;
  features: JsonObject;
  created_at: IsoDatetimeString;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  paidAmountWch: number;
  startedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface SubscriptionWire {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  paid_amount_wch: number;
  started_at: IsoDatetimeString;
  expires_at?: IsoDatetimeString;
  created_at: IsoDatetimeString;
}
