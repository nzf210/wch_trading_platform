
import { create } from 'zustand';
import type { Execution } from '../types/execution';
import type { EventEnvelopeWire } from '../types/event';
import { DomainEventType } from '../types/event';
import type { Order } from '../types/order';

interface TradingState {
  orders: Order[];
  executions: Execution[];
  lastMessage: EventEnvelopeWire | null;
}

interface TradingActions {
  handleEvent: (event: EventEnvelopeWire) => void;
  processOrderEvent: (payload: Order) => void;
  processExecutionEvent: (payload: Execution) => void;
}

export const useTradingStore = create<TradingState & TradingActions>((set) => ({
    orders: [],
    executions: [],
    lastMessage: null,

    handleEvent: (event) => {
      set({ lastMessage: event });

      console.log('Received event:', event.event_type, event.payload);

      switch (event.event_type) {
        case DomainEventType.ORDER_SUBMITTED:
        case DomainEventType.ORDER_ACCEPTED:
        case DomainEventType.ORDER_REJECTED:
          set((state) => {
            const order = event.payload as Order;
            const index = state.orders.findIndex((current: Order) => current.id === order.id);
            if (index === -1) {
              return { orders: [...state.orders, order] };
            }

            const orders = [...state.orders];
            orders[index] = order;
            return { orders };
          });
          break;

        case DomainEventType.EXECUTION_FILLED:
          set((state) => {
            const execution = event.payload as Execution;
            const index = state.executions.findIndex((current: Execution) => current.id === execution.id);
            if (index !== -1) {
              return state;
            }

            return { executions: [...state.executions, execution] };
          });
          break;

        default:
          console.warn(`Unhandled event type: ${event.event_type}`);
      }
    },

    processOrderEvent: (order) => {
      set((state) => {
        const index = state.orders.findIndex((current: Order) => current.id === order.id);
        if (index === -1) {
          return { orders: [...state.orders, order] };
        }

        const orders = [...state.orders];
        orders[index] = order;
        return { orders };
      });
    },

    processExecutionEvent: (execution) => {
      set((state) => {
        const index = state.executions.findIndex((current: Execution) => current.id === execution.id);
        if (index !== -1) {
          return state;
        }

        return { executions: [...state.executions, execution] };
      });
    },
  }));
