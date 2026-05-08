export interface RiskThresholds {
  maxPositionSize: number;
  maxDailyLoss: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

export interface RiskGuardrails {
  allowLiveTrading: boolean;
  requireManualApprovalForLive: boolean;
  requireEmergencyStopResetApproval: boolean;
  rejectZeroQuantityOrders: boolean;
}

export interface RiskConfig {
  defaults: RiskThresholds;
  hardLimits: RiskThresholds;
  guardrails: RiskGuardrails;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  defaults: {
    maxPositionSize: 0.05,
    maxDailyLoss: 100,
    stopLossPercent: 3,
    takeProfitPercent: 6,
  },
  hardLimits: {
    maxPositionSize: 1,
    maxDailyLoss: 5000,
    stopLossPercent: 20,
    takeProfitPercent: 50,
  },
  guardrails: {
    allowLiveTrading: false,
    requireManualApprovalForLive: true,
    requireEmergencyStopResetApproval: true,
    rejectZeroQuantityOrders: true,
  },
};
