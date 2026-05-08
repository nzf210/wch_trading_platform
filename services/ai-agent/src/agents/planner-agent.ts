import { BaseAgent } from './base-agent.js';

export class PlannerAgent extends BaseAgent {
  constructor(model: string) {
    super('Planner Agent', model);
  }

  async createPlan(userRequest: string) {
    const context = `You are the Lead Architect for the WCH SaaS Trading Bot Platform. 
    Your job is to take high-level coding instructions and break them down into technical tasks for building the platform.
    Focus on:
    - Microservices (Go API, Rust Executor, Scanner)
    - Database migrations (PostgreSQL)
    - Frontend components (React/Tailwind)
    - Redis-based event architecture.
    
    Always respond with a structured technical plan for development.`;
    return await this.run(userRequest, context);
  }
}
