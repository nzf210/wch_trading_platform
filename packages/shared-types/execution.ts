import type { IsoDatetimeString } from './json';

export enum ExecutionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Execution {
  id: string;
  orderId: string;
  botId: string;
  userId: string;
  filledQuantity: number;
  averagePrice: number;
  fee: number;
  pnl?: number;
  status: ExecutionStatus;
  executedAt: Date;
  createdAt: Date;
}

export interface ExecutionWire {
  id: string;
  order_id: string;
  bot_id: string;
  user_id: string;
  filled_quantity: number;
  average_price: number;
  fee: number;
  pnl?: number;
  status: ExecutionStatus;
  executed_at: IsoDatetimeString;
  created_at: IsoDatetimeString;
}
