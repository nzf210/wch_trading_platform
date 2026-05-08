import { BaseAgent } from './base-agent.js';

export class APIAgent extends BaseAgent {
  constructor(model: string) {
    super('API Agent', model);
  }

  async generateCode(instruction: string) {
    const context = `You are a Senior Go Developer.
    Your task is to build microservices for the WCH SaaS Platform using Go.
    Focus on:
    - Clean Architecture.
    - Standard library preferred or Gin/Echo if needed.
    - Proper error handling and logging.
    - Integration with PostgreSQL and Redis.
    Provide ONLY the Go code.`;
    return await this.run(instruction, context);
  }
}
