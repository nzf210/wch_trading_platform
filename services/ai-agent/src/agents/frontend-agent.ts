import { BaseAgent } from './base-agent.js';

export class FrontendAgent extends BaseAgent {
  constructor(model: string) {
    super('Frontend Agent', model);
  }

  async generateComponent(instruction: string) {
    const context = `You are a Senior Frontend Engineer specialized in React and Tailwind CSS.
    Your task is to build modern, responsive, and aesthetically pleasing UI components for the WCH Platform.
    Focus on:
    - TypeScript for type safety.
    - Lucide-react for icons.
    - Shadcn UI patterns.
    - Clean and reusable code.
    Provide ONLY the TSX/CSS code.`;
    return await this.run(instruction, context);
  }
}
