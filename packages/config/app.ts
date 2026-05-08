export interface ServiceEndpointMap {
  apiBaseUrl: string;
  redisUrl: string;
  postgresUrl?: string;
  scannerStream: string;
  tradeStream: string;
  notificationStream: string;
}

export interface ContractVersionMap {
  eventEnvelope: string;
  signalGenerated: string;
  orderIntent: string;
  order: string;
  execution: string;
}

export interface AppConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  paperTradingEnabled: boolean;
  liveTradingEnabled: boolean;
  auditRequiredActions: string[];
  services: ServiceEndpointMap;
  contractVersions: ContractVersionMap;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'wch-trading-platform',
  environment: 'development',
  paperTradingEnabled: true,
  liveTradingEnabled: false,
  auditRequiredActions: [
    'bot.activate_paper',
    'bot.request_live_activation',
    'bot.pause',
    'bot.stop',
    'risk.emergency_stop',
    'exchange_account.create',
  ],
  services: {
    apiBaseUrl: 'http://localhost:8080/api/v1',
    redisUrl: 'redis://localhost:6379',
    postgresUrl: 'postgres://postgres:postgres@localhost:5432/wch_trading',
    scannerStream: 'stream.market-events',
    tradeStream: 'stream.trade-events',
    notificationStream: 'stream.notifications',
  },
  contractVersions: {
    eventEnvelope: 'v2',
    signalGenerated: 'v2',
    orderIntent: 'v2',
    order: 'v2',
    execution: 'v2',
  },
};
