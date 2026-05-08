import type {
  AddExchangeAccountRequestBody,
  ApiBot,
  ApiBotDetailResponse,
  ApiExchangeAccount,
  ApiHealthResponse,
  ApiRiskSettings,
  ApiSignal,
  ApiSubscriptionSummaryResponse,
  ApiSuccessResponse,
  ApiWallet,
  ApiWchTransaction,
  AuthResponse,
  CreateBotRequest,
  EmergencyStopRequest,
  LifecycleMessageResponse,
  LoginRequest,
  RegisterRequest,
  UpdateRiskRequest,
} from '../types/api';

export class ApiError extends Error {
  status: number;
  correlationId?: string;

  constructor(message: string, status: number, correlationId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.correlationId = correlationId;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  authToken?: string | null;
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, QueryValue>;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');
const API_HEALTH_URL = (import.meta.env.VITE_API_HEALTH_URL ?? '/api/health').replace(/\/$/, '');
const CORRELATION_HEADER = 'X-Correlation-ID';

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function buildHealthUrl(): string {
  return new URL(API_HEALTH_URL, window.location.origin).toString();
}

function isEnvelope<T>(value: unknown): value is ApiSuccessResponse<T> {
  return typeof value === 'object' && value !== null && 'success' in value && 'data' in value;
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authToken, body, headers, query, ...init } = options;
  const correlationId = createCorrelationId();
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      [CORRELATION_HEADER]: correlationId,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`;
    const correlationId =
      typeof payload === 'object' &&
      payload !== null &&
      'correlation_id' in payload &&
      typeof payload.correlation_id === 'string'
        ? payload.correlation_id
        : undefined;
    throw new ApiError(message, response.status, correlationId);
  }

  return payload as T;
}

function unwrapEnvelope<T>(payload: ApiSuccessResponse<T> | T): T {
  if (isEnvelope<T>(payload)) {
    return payload.data;
  }

  return payload;
}

export const apiClient = {
  getHealth(): Promise<ApiHealthResponse> {
    return fetch(buildHealthUrl(), {
      headers: { Accept: 'application/json', [CORRELATION_HEADER]: createCorrelationId() },
    }).then(async (response) => {
      const payload = await parseJson(response);
      if (!response.ok) {
        throw new ApiError('health check failed', response.status);
      }
      return payload as ApiHealthResponse;
    });
  },

  register(body: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', { method: 'POST', body });
  },

  login(body: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', { method: 'POST', body });
  },

  listBots(authToken: string): Promise<ApiBot[]> {
    return request<ApiBot[]>('/bots/', { authToken });
  },

  getBot(botId: string, authToken: string): Promise<ApiBotDetailResponse> {
    return request<ApiBotDetailResponse>(`/bots/${botId}/`, { authToken });
  },

  createBot(body: CreateBotRequest, authToken: string): Promise<ApiBotDetailResponse> {
    return request<ApiBotDetailResponse>('/bots/', { method: 'POST', authToken, body });
  },

  activatePaper(botId: string, authToken: string): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>(`/bots/${botId}/activate-paper`, {
      method: 'POST',
      authToken,
    });
  },

  requestLiveActivation(botId: string, authToken: string): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>(`/bots/${botId}/request-live-activation`, {
      method: 'POST',
      authToken,
    });
  },

  pauseBot(botId: string, authToken: string): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>(`/bots/${botId}/pause`, {
      method: 'POST',
      authToken,
    });
  },

  stopBot(botId: string, authToken: string): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>(`/bots/${botId}/stop`, {
      method: 'POST',
      authToken,
    });
  },

  getRiskSettings(botId: string, authToken: string): Promise<ApiRiskSettings> {
    return request<ApiRiskSettings>(`/risk/${botId}/`, { authToken });
  },

  updateRiskSettings(
    botId: string,
    body: UpdateRiskRequest,
    authToken: string,
  ): Promise<ApiRiskSettings> {
    return request<ApiRiskSettings>(`/risk/${botId}/`, {
      method: 'PUT',
      authToken,
      body,
    });
  },

  toggleBotEmergencyStop(
    botId: string,
    body: EmergencyStopRequest,
    authToken: string,
  ): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>(`/risk/${botId}/emergency-stop`, {
      method: 'POST',
      authToken,
      body,
    });
  },

  toggleGlobalEmergencyStop(
    body: EmergencyStopRequest,
    authToken: string,
  ): Promise<LifecycleMessageResponse> {
    return request<LifecycleMessageResponse>('/risk/emergency-stop', {
      method: 'POST',
      authToken,
      body,
    });
  },

  listExchangeAccounts(authToken: string): Promise<ApiExchangeAccount[]> {
    return request<ApiExchangeAccount[]>('/exchange-accounts/', { authToken });
  },

  addExchangeAccount(
    body: AddExchangeAccountRequestBody,
    authToken: string,
  ): Promise<ApiExchangeAccount> {
    return request<ApiExchangeAccount>('/exchange-accounts/', {
      method: 'POST',
      authToken,
      body,
    });
  },

  getCurrentSubscription(authToken: string): Promise<ApiSubscriptionSummaryResponse> {
    return request<ApiSubscriptionSummaryResponse>('/subscription/', { authToken });
  },

  listWallets(authToken: string): Promise<ApiWallet[]> {
    return request<ApiWallet[]>('/wallets', { authToken });
  },

  listWchTransactions(authToken: string): Promise<ApiWchTransaction[]> {
    return request<ApiWchTransaction[]>('/wch/transactions', { authToken });
  },

  listSignals(authToken: string): Promise<ApiSignal[]> {
    return request<ApiSignal[]>('/signals', { authToken });
  },

  unwrapEnvelope,
};
