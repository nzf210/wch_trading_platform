import type { JsonObject } from './json';

export type ExchangeAccountStatus = 'active' | 'disabled' | 'error';

export interface ExchangeAccount {
  id: string;
  userId: string;
  exchange: string;
  label: string;
  permissions: JsonObject;
  status: ExchangeAccountStatus | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddExchangeAccountRequest {
  exchange: string;
  label: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}
