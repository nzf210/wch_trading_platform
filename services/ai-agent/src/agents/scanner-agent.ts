import { BaseAgent } from './base-agent.js';

export class ScannerAgent extends BaseAgent {
  constructor(model: string) {
    super('Scanner Agent', model);
  }

  async generateScanner(instruction: string) {
    const context = `You are a Quant Developer specialized in market scanning and technical analysis.
    Your task is to build market scanners in Go or Python for the WCH Platform.
    Focus on:
    - Efficient websocket connections.
    - Technical indicator implementation (RSI, MACD, etc.).
    - Signal generation logic.
    Provide ONLY the source code.`;
    return await this.run(instruction, context);
  }
}
