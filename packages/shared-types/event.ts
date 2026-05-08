import type { IsoDatetimeString } from './json';

export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  eventVersion: string;
  occurredAt: Date;
  producer: string;
  tenantId?: string;
  userId?: string;
  botId?: string;
  correlationId: string;
  causationId?: string;
  idempotencyKey: string;
  payload: T;
}

export interface EventEnvelopeWire<T = unknown> {
  event_id: string;
  event_type: string;
  event_version: string;
  occurred_at: IsoDatetimeString;
  producer: string;
  tenant_id?: string;
  user_id?: string;
  bot_id?: string;
  correlation_id: string;
  causation_id?: string;
  idempotency_key: string;
  payload: T;
}

export enum DomainEventType {
  // Bot events
  BOT_CREATED = 'bot.created',
  BOT_ACTIVATED = 'bot.activated',
  BOT_PAUSED = 'bot.paused',
  BOT_STOPPED = 'bot.stopped',
  BOT_ERROR = 'bot.error',
  
  // Subscription events
  SUBSCRIPTION_VERIFIED = 'subscription.verified',
  
  // Trading events
  SIGNAL_GENERATED = 'signal.generated',
  RISK_CHECK_REQUESTED = 'risk.check.requested',
  RISK_CHECK_PASSED = 'risk.check.passed',
  RISK_CHECK_FAILED = 'risk.check.failed',
  ORDER_INTENT_CREATED = 'order.intent.created',
  ORDER_SUBMITTED = 'order.submitted',
  ORDER_ACCEPTED = 'order.accepted',
  ORDER_REJECTED = 'order.rejected',
  EXECUTION_FILLED = 'execution.filled',
  EXECUTION_PARTIALLY_FILLED = 'execution.partially_filled',
  EXECUTION_FAILED = 'execution.failed',
  
  // Position events
  POSITION_UPDATED = 'position.updated',
  PNL_UPDATED = 'pnl.updated',
  
  // System events
  EMERGENCY_STOP_ACTIVATED = 'emergency_stop.activated',
}
