export enum ExchangeCode {
  BINANCE = 'binance',
  BYBIT = 'bybit',
  OKX = 'okx',
}

export interface ExchangeCapability {
  paperTrading: boolean;
  liveTrading: boolean;
  supportsPassphrase: boolean;
  supportedOrderTypes: Array<'market' | 'limit'>;
}

export interface ExchangeConfig {
  code: ExchangeCode;
  label: string;
  defaultQuoteAsset: string;
  wsEnabled: boolean;
  capabilities: ExchangeCapability;
}

export const EXCHANGE_CONFIGS: Record<ExchangeCode, ExchangeConfig> = {
  [ExchangeCode.BINANCE]: {
    code: ExchangeCode.BINANCE,
    label: 'Binance',
    defaultQuoteAsset: 'USDT',
    wsEnabled: true,
    capabilities: {
      paperTrading: true,
      liveTrading: true,
      supportsPassphrase: false,
      supportedOrderTypes: ['market', 'limit'],
    },
  },
  [ExchangeCode.BYBIT]: {
    code: ExchangeCode.BYBIT,
    label: 'Bybit',
    defaultQuoteAsset: 'USDT',
    wsEnabled: true,
    capabilities: {
      paperTrading: true,
      liveTrading: true,
      supportsPassphrase: false,
      supportedOrderTypes: ['market', 'limit'],
    },
  },
  [ExchangeCode.OKX]: {
    code: ExchangeCode.OKX,
    label: 'OKX',
    defaultQuoteAsset: 'USDT',
    wsEnabled: true,
    capabilities: {
      paperTrading: true,
      liveTrading: true,
      supportsPassphrase: true,
      supportedOrderTypes: ['market', 'limit'],
    },
  },
};

export const SUPPORTED_EXCHANGES = Object.values(ExchangeCode);
