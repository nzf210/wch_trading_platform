export const config = {
  liveTradingAllowed: false,
  openclaw: {
    baseUrl: process.env.OPENCLAW_BASE_URL || 'http://127.0.0.1:18789/v1',
    apiKey: process.env.OPENCLAW_API_KEY || 'sk-openclaw-dummy-key',
  },
  agentModels: {
    // Model Tier 1 (High Reasoning/Strategy)
    PLANNER: process.env.PLANNER_MODEL || 'gpt-4o',
    EXECUTOR: process.env.EXECUTOR_MODEL || 'gpt-4o',
    SECURITY: process.env.SECURITY_MODEL || 'gpt-4o',
    
    // Model Tier 2 (Efficient Coding/Implementation)
    API: process.env.API_MODEL || 'gpt-4o-mini',
    DB: process.env.DB_MODEL || 'gpt-4o-mini',
    FRONTEND: process.env.FRONTEND_MODEL || 'gpt-4o-mini',
    SCANNER: process.env.SCANNER_MODEL || 'gpt-4o-mini',
    FIXER: process.env.FIXER_MODEL || 'gpt-4o-mini',
    TESTER: process.env.TESTER_MODEL || 'gpt-4o-mini',
  }
};
