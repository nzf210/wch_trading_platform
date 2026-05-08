import { BaseAgent } from './base-agent.js';

export class DBAgent extends BaseAgent {
  constructor(model: string) {
    super('Database Agent', model);
  }

  async generateMigration(instruction: string) {
    const context = `You are a Senior Database Engineer specialized in PostgreSQL.
    Your task is to generate high-quality SQL migrations for the WCH Platform.
    Follow these rules:
    - Use clear naming conventions (e.g., 001_create_users_table.sql).
    - Include indexes for performance.
    - Ensure referential integrity with foreign keys.
    - Provide ONLY the SQL code.`;
    return await this.run(instruction, context);
  }
}
