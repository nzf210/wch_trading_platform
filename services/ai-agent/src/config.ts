export const config = {
  liveTradingAllowed: false,
  openclaw: {
    baseUrl: process.env.OPENCLAW_BASE_URL || 'http://127.0.0.1:18789/v1',
    apiKey: process.env.OPENCLAW_API_KEY || 'sk-openclaw-dummy-key',
  },
  agentModels: {
    // Model Tier 1 (High Reasoning/Strategy)
    PLANNER: process.env.PLANNER_MODEL || 'sumopod-m2-7',
    EXECUTOR: process.env.EXECUTOR_MODEL || 'sumopod-m2-7',
    SECURITY: process.env.SECURITY_MODEL || 'sumopod-m2-7',
    
    // Model Tier 2 (Efficient Coding/Implementation)
    API: process.env.API_MODEL || 'sumopod-m2-7',
    DB: process.env.DB_MODEL || 'sumopod-m2-7',
    FRONTEND: process.env.FRONTEND_MODEL || 'sumopod-m2-7',
    SCANNER: process.env.SCANNER_MODEL || 'sumopod-m2-7',
    FIXER: process.env.FIXER_MODEL || 'sumopod-m2-7',
    TESTER: process.env.TESTER_MODEL || 'sumopod-m2-7',
  }
};
