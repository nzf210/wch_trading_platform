import OpenAI from 'openai';
import { config } from '../config.js';

export abstract class BaseAgent {
  protected client: OpenAI;
  protected model: string;
  protected name: string;

  constructor(name: string, model: string) {
    this.name = name;
    this.model = model;
    this.client = new OpenAI({
      baseURL: config.openclaw.baseUrl,
      apiKey: config.openclaw.apiKey,
    });
  }

  async run(prompt: string, context: string = ''): Promise<string> {
    console.log(`[${this.name}] Processing task...`);
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: `You are the ${this.name}. ${context}` },
          { role: 'user', content: prompt }
        ],
      });
      return response.choices[0].message.content ?? '';
    } catch (error) {
      console.error(`[${this.name}] Error:`, error);
      return '';
    }
  }
}
