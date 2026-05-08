import {
  type AuthenticatedUser,
} from './user';
import type { Bot, RiskSettings } from './bot';
import type { EventEnvelope } from './event';
import type { ExchangeAccount } from './exchange';
import type { Execution } from './execution';
import type { JsonObject } from './json';
import type { Order, OrderIntent } from './order';
import type { Signal } from './signal';
import type { Plan, Subscription } from './subscription';
import type { User, UserSession } from './user';
import type { Wallet, WchTransaction } from './wallet';
import type {
  ApiAuthenticatedUser,
  ApiBot,
  ApiBotDetailResponse,
  ApiEventEnvelope,
  ApiExecution,
  ApiExchangeAccount,
  ApiOrder,
  ApiOrderIntent,
  ApiPlan,
  ApiRiskSettings,
  ApiSignal,
  ApiSubscription,
  ApiSubscriptionSummaryResponse,
  ApiUser,
  ApiUserSession,
  ApiWallet,
  ApiWchTransaction,
} from './api';

function toDate(value: string): Date {
  return new Date(value);
}

function parseJsonObject(value: string): JsonObject {
  try {
    const parsed = JSON.parse(value) as JsonObject;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeUser(user: ApiUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    createdAt: toDate(user.created_at),
    updatedAt: toDate(user.updated_at),
  };
}

export function normalizeAuthenticatedUser(user: ApiAuthenticatedUser): AuthenticatedUser {
  return {
    ...normalizeUser(user),
    tenantId: user.tenant_id,
  };
}

export function normalizeUserSession(session: ApiUserSession): UserSession {
  return {
    accessToken: session.access_token,
    expiresAt: toDate(session.expires_at),
    user: normalizeAuthenticatedUser(session.user),
  };
}

export function normalizeRiskSettings(risk: ApiRiskSettings): RiskSettings {
  return {
    id: risk.id,
    botId: risk.bot_id,
    maxPositionSize: risk.max_position_size,
    maxDailyLoss: risk.max_daily_loss,
    stopLossPercent: risk.stop_loss_percent,
    takeProfitPercent: risk.take_profit_percent,
    emergencyStop: risk.emergency_stop,
    createdAt: toDate(risk.created_at),
    updatedAt: toDate(risk.updated_at),
  };
}

export function normalizeBot(bot: ApiBot): Bot {
  return {
    id: bot.id,
    userId: bot.user_id,
    exchangeAccountId: bot.exchange_account_id,
    name: bot.name,
    mode: bot.mode,
    strategy: bot.strategy,
    symbol: bot.symbol,
    quoteAsset: bot.quote_asset,
    capital: bot.capital,
    status: bot.status,
    config: bot.config,
    createdAt: toDate(bot.created_at),
    updatedAt: toDate(bot.updated_at),
  };
}

export function normalizeBotDetail(response: ApiBotDetailResponse): {
  bot: Bot;
  riskSettings: RiskSettings;
} {
  return {
    bot: normalizeBot(response.bot),
    riskSettings: normalizeRiskSettings(response.risk_settings),
  };
}

export function normalizeExchangeAccount(account: ApiExchangeAccount): ExchangeAccount {
  return {
    id: account.id,
    userId: account.user_id,
    exchange: account.exchange,
    label: account.label,
    permissions: parseJsonObject(account.permissions),
    status: account.status,
    createdAt: toDate(account.created_at),
    updatedAt: toDate(account.updated_at),
  };
}

export function normalizeOrderIntent(orderIntent: ApiOrderIntent): OrderIntent {
  return {
    id: orderIntent.id,
    botId: orderIntent.bot_id,
    userId: orderIntent.user_id,
    signalId: orderIntent.signal_id,
    side: orderIntent.side,
    orderType: orderIntent.order_type,
    quantity: orderIntent.quantity,
    price: orderIntent.price,
    status: orderIntent.status,
    reason: orderIntent.reason,
    createdAt: toDate(orderIntent.created_at),
  };
}

export function normalizeOrder(order: ApiOrder): Order {
  return {
    id: order.id,
    botId: order.bot_id,
    userId: order.user_id,
    signalId: order.signal_id,
    orderIntentId: order.order_intent_id,
    exchange: order.exchange,
    symbol: order.symbol,
    side: order.side,
    orderType: order.order_type,
    quantity: order.quantity,
    price: order.price,
    status: order.status,
    exchangeOrderId: order.exchange_order_id,
    idempotencyKey: order.idempotency_key,
    rawResponse: order.raw_response,
    createdAt: toDate(order.created_at),
    updatedAt: toDate(order.updated_at),
  };
}

export function normalizeExecution(execution: ApiExecution): Execution {
  return {
    id: execution.id,
    orderId: execution.order_id,
    botId: execution.bot_id,
    userId: execution.user_id,
    filledQuantity: execution.filled_quantity,
    averagePrice: execution.average_price,
    fee: execution.fee,
    pnl: execution.pnl,
    status: execution.status,
    executedAt: toDate(execution.executed_at),
    createdAt: toDate(execution.created_at),
  };
}

export function normalizeSignal(signal: ApiSignal): Signal {
  return {
    id: signal.id,
    botId: signal.bot_id,
    userId: signal.user_id,
    exchange: signal.exchange,
    symbol: signal.symbol,
    strategy: signal.strategy,
    action: signal.action,
    price: signal.price,
    confidence: signal.confidence,
    status: signal.status,
    schemaVersion: signal.schema_version,
    featureSnapshot: signal.feature_snapshot,
    ttlMs: signal.ttl_ms,
    dedupKey: signal.dedup_key,
    provenance: signal.provenance,
    payload: signal.payload,
    createdAt: toDate(signal.created_at),
  };
}

export function normalizePlan(plan: ApiPlan): Plan {
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    priceWch: plan.price_wch,
    maxLiveBots: plan.max_live_bots,
    maxPaperBots: plan.max_paper_bots,
    features: plan.features,
    createdAt: toDate(plan.created_at),
  };
}

export function normalizeSubscription(subscription: ApiSubscription): Subscription {
  return {
    id: subscription.id,
    userId: subscription.user_id,
    planId: subscription.plan_id,
    status: subscription.status,
    paidAmountWch: subscription.paid_amount_wch,
    startedAt: toDate(subscription.started_at),
    expiresAt: subscription.expires_at ? toDate(subscription.expires_at) : undefined,
    createdAt: toDate(subscription.created_at),
  };
}

export function normalizeSubscriptionSummary(response: ApiSubscriptionSummaryResponse): {
  subscription: Subscription;
  plan: Plan;
} {
  return {
    subscription: normalizeSubscription(response.subscription),
    plan: normalizePlan(response.plan),
  };
}

export function normalizeWallet(wallet: ApiWallet): Wallet {
  return {
    id: wallet.id,
    userId: wallet.user_id,
    chain: wallet.chain,
    address: wallet.address,
    isPrimary: wallet.is_primary,
    verifiedAt: wallet.verified_at ? toDate(wallet.verified_at) : undefined,
    createdAt: toDate(wallet.created_at),
  };
}

export function normalizeWchTransaction(transaction: ApiWchTransaction): WchTransaction {
  return {
    id: transaction.id,
    userId: transaction.user_id,
    walletId: transaction.wallet_id,
    txHash: transaction.tx_hash,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status,
    metadata: transaction.metadata,
    createdAt: toDate(transaction.created_at),
  };
}

export function normalizeEventEnvelope<TPayload>(
  event: ApiEventEnvelope<TPayload>,
): EventEnvelope<TPayload> {
  return {
    eventId: event.event_id,
    eventType: event.event_type,
    eventVersion: event.event_version,
    occurredAt: toDate(event.occurred_at),
    producer: event.producer,
    tenantId: event.tenant_id,
    userId: event.user_id,
    botId: event.bot_id,
    correlationId: event.correlation_id,
    causationId: event.causation_id,
    idempotencyKey: event.idempotency_key,
    payload: event.payload,
  };
}
