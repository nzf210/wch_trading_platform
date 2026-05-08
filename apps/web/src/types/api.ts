import type {
  BotMode,
  BotStatus,
  BotWire,
  RiskSettingsWire,
} from './bot';
import type { DomainEventType as EventType, EventEnvelopeWire } from './event';
import type { ExecutionStatus as ExecutionState, ExecutionWire } from './execution';
import type { IsoDatetimeString, JsonObject } from './json';
import type {
  OrderIntentWire,
  OrderIntentStatus as IntentStatus,
  OrderWire,
  OrderSide as Side,
  OrderStatus as TradeStatus,
  OrderType as TradeType,
} from './order';
import type { SignalAction as SignalSide, SignalStatus as SignalState, SignalWire } from './signal';
import type { Plan, PlanWire, SubscriptionStatus as BillingStatus, SubscriptionWire } from './subscription';
import type { AuthenticatedUserWire, UserRole, UserSessionWire, UserStatus, UserWire } from './user';
import type {
  WalletChain,
  WalletWire,
  WchTransactionWire,
  WchTransactionStatus as WalletTxStatus,
  WchTransactionType as WalletTxType,
} from './wallet';

export type ApiDateString = IsoDatetimeString;

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  correlation_id?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  correlation_id?: string;
}

export interface ApiHealthResponse {
  status: 'ok' | string;
  service: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  token: string;
}

export type AuthResponse = ApiSuccessResponse<AuthTokenPayload>;

export type ApiUser = UserWire;

export type ApiAuthenticatedUser = AuthenticatedUserWire;

export type ApiUserSession = UserSessionWire;

export type ApiRiskSettings = RiskSettingsWire;

export interface CreateBotRiskSettingsRequest {
  max_position_size?: number;
  max_daily_loss?: number;
  stop_loss_percent?: number;
  take_profit_percent?: number;
}

export interface CreateBotRequest {
  name: string;
  strategy: string;
  symbol: string;
  quote_asset: string;
  capital: number;
  exchange_account_id?: string;
  config?: JsonObject;
  risk_settings: CreateBotRiskSettingsRequest;
}

export type ApiBot = BotWire;

export interface ApiBotDetailResponse {
  bot: ApiBot;
  risk_settings: ApiRiskSettings;
}

export interface UpdateRiskRequest {
  max_position_size?: number;
  max_daily_loss?: number;
  stop_loss_percent?: number;
  take_profit_percent?: number;
  emergency_stop?: boolean;
}

export interface EmergencyStopRequest {
  stop: boolean;
}

export interface LifecycleMessageResponse {
  message: string;
}

export interface AddExchangeAccountRequestBody {
  exchange: string;
  label: string;
  api_key: string;
  api_secret: string;
  passphrase?: string;
}

// Current API Go exchange handlers return the repository model directly,
// so the JSON shape is sanitized and only exposes public account fields.
export interface ApiExchangeAccount {
  id: string;
  user_id: string;
  exchange: string;
  label: string;
  permissions: string;
  status: string;
  created_at: ApiDateString;
  updated_at: ApiDateString;
}

export type ApiOrderIntent = OrderIntentWire;

export type ApiOrder = OrderWire;

export type ApiExecution = ExecutionWire;

export type ApiSignal = SignalWire;

export type ApiPlan = PlanWire;

export type ApiSubscription = SubscriptionWire;

export interface ApiSubscriptionSummaryResponse {
  subscription: ApiSubscription;
  plan: ApiPlan;
}

export type ApiWallet = WalletWire;

export type ApiWchTransaction = WchTransactionWire;

export interface ApiEventEnvelope<TPayload = unknown>
  extends EventEnvelopeWire<TPayload> {
  event_type: EventType | string;
}
