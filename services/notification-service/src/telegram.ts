import { Telegraf } from 'telegraf';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const redis = new Redis(redisUrl);
const redisSub = new Redis(redisUrl);

export const startTelegramBot = () => {
  bot.start((ctx) => {
    ctx.reply('Welcome to WCH Platform Builder! 🏗️\nI am your AI Project Assistant. Send me coding instructions to build your SaaS Trading Bot platform.');
  });

  bot.help((ctx) => {
    ctx.reply('Commands:\n' +
      '/api <desc> - Generate Go API code\n' +
      '/db <desc> - Generate SQL migrations\n' +
      '/ui <desc> - Generate React components\n' +
      '/rust <desc> - Generate Rust trading logic\n' +
      '<any text> - Get a technical plan from the Architect');
  });

  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text.startsWith('/')) return;

    ctx.reply('Acknowledged. Forwarding build instructions to AI Architects... 🛠️');

    // Kirim pesan ke Redis channel agar AI Agent memprosesnya
    const payload = {
      chatId: ctx.chat.id,
      message: text,
      timestamp: new Date().toISOString()
    };

    await redis.publish('ai_agent_tasks', JSON.stringify(payload));
  });

  // Listen for responses from AI Agent
  redisSub.subscribe('ai_agent_responses', (err) => {
    if (err) console.error('Failed to subscribe to ai_agent_responses:', err);
  });

  redisSub.on('message', (channel, message) => {
    if (channel === 'ai_agent_responses') {
      const response = JSON.parse(message);
      bot.telegram.sendMessage(response.chatId, response.text);
    }
  });

  bot.launch();
  console.log('Telegram Bot is running...');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
