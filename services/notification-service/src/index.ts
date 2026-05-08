import { startTelegramBot } from './telegram.js';

console.log('[NOTIFICATION SERVICE] Starting...');

try {
  startTelegramBot();
} catch (error) {
  console.error('[NOTIFICATION SERVICE] Failed to start Telegram Bot:', error);
}
