import { config } from './config.js';
import { PlannerAgent } from './agents/planner-agent.js';
import { APIAgent } from './agents/api-agent.js';
import { DBAgent } from './agents/db-agent.js';
import { FrontendAgent } from './agents/frontend-agent.js';
import { ExecutorAgent } from './agents/executor-agent.js';
import { ScannerAgent } from './agents/scanner-agent.js';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const redisSub = new Redis(redisUrl);
const redisPub = new Redis(redisUrl);

async function startAgents() {
  console.log(`[SYSTEM] Starting AI Agent Orchestrator...`);
  
  // Inisialisasi Semua Agen dengan Model yang sesuai Role
  const agents = {
    planner: new PlannerAgent(config.agentModels.PLANNER),
    api: new APIAgent(config.agentModels.API),
    db: new DBAgent(config.agentModels.DB),
    frontend: new FrontendAgent(config.agentModels.FRONTEND),
    executor: new ExecutorAgent(config.agentModels.EXECUTOR),
    scanner: new ScannerAgent(config.agentModels.SCANNER),
  };

  console.log(`[INIT] All specialized agents booted.`);

  redisSub.subscribe('ai_agent_tasks', (err) => {
    if (err) console.error('Failed to subscribe:', err);
    else console.log('[SYSTEM] Waiting for coding instructions...');
  });

  redisSub.on('message', async (channel, message) => {
    if (channel === 'ai_agent_tasks') {
      const task = JSON.parse(message);
      const text = task.message.trim();
      let responseText = '';

      try {
        if (text.startsWith('/db ')) {
          responseText = await agents.db.generateMigration(text.replace('/db ', ''));
        } else if (text.startsWith('/api ')) {
          responseText = await agents.api.generateCode(text.replace('/api ', ''));
        } else if (text.startsWith('/ui ')) {
          responseText = await agents.frontend.generateComponent(text.replace('/ui ', ''));
        } else if (text.startsWith('/rust ')) {
          responseText = await agents.executor.generateLogic(text.replace('/rust ', ''));
        } else {
          // Default to Planner
          const plan = await agents.planner.createPlan(text);
          responseText = `[PLANNER ARCHITECT]:\n\n${plan}`;
        }
        
        const responsePayload = {
          chatId: task.chatId,
          text: responseText
        };

        await redisPub.publish('ai_agent_responses', JSON.stringify(responsePayload));
      } catch (error) {
        console.error('[ERROR] Task processing failed:', error);
      }
    }
  });

  setInterval(() => {
    console.log(`[HEARTBEAT] Agents are actively listening for new tasks...`);
  }, 60000);
}

startAgents().catch(console.error);
