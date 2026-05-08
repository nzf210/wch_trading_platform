
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DomainEventType, EventEnvelopeWire } from '../../../../packages/shared-types/event';
import { Order } from '../../../../packages/shared-types/order';
import { Execution } from '../../../../packages/shared-types/execution';

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

export const useTradingStore = create(
  immer<TradingState & TradingActions>((set) => ({
    orders: [],
    executions: [],
    lastMessage: null,

    handleEvent: (event) => {
      set((state) => {
        state.lastMessage = event;
      });

      console.log('Received event:', event.event_type, event.payload);

      switch (event.event_type) {
        case DomainEventType.ORDER_SUBMITTED:
        case DomainEventType.ORDER_ACCEPTED:
        case DomainEventType.ORDER_REJECTED:
          set((state) => {
            state.processOrderEvent(event.payload as Order);
          });
          break;
        
        case DomainEventType.EXECUTION_FILLED:
          set((state) => {
            state.processExecutionEvent(event.payload as Execution);
          });
          break;
        
        default:
          console.warn(`Unhandled event type: ${event.event_type}`);
      }
    },

    processOrderEvent: (order) => {
      set((state) => {
        const index = state.orders.findIndex((o) => o.id === order.id);
        if (index !== -1) {
          state.orders[index] = order;
        } else {
          state.orders.push(order);
        }
      });
    },

    processExecutionEvent: (execution) => {
      set((state) => {
        const index = state.executions.findIndex((e) => e.id === execution.id);
        if (index === -1) {
          state.executions.push(execution);
        }
      });
    },
  }))
);
