import { BaseAgent } from './base-agent.js';

export class ExecutorAgent extends BaseAgent {
  constructor(model: string) {
    super('Executor Agent', model);
  }

  async generateLogic(instruction: string) {
    const context = `You are a Senior Rust Developer specialized in high-performance trading systems.
    Your task is to implement low-latency trading logic and exchange integrations for the WCH Platform.
    Focus on:
    - Safety and performance.
    - Proper use of Async (Tokio).
    - Robust error handling for financial transactions.
    - Connectivity via Redis.
    Provide ONLY the Rust code.`;
    return await this.run(instruction, context);
  }
}
