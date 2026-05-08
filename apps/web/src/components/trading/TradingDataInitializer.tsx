
import { useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { useTradingStore } from '../../store/useTradingStore';
import { EventEnvelopeWire } from '../../../../packages/shared-types/event';

// This component handles the WebSocket connection and data flow.
// It doesn't render anything itself.
export function TradingDataInitializer() {
  const token = useAuthStore((state) => state.token);
  const handleEvent = useTradingStore((state) => state.handleEvent);

  const socketUrl = useMemo(() => {
    if (!token) return null;
    // In a real app, this would come from an environment variable.
    const url = 'ws://localhost:8080/api/v1/ws';
    return `${url}?token=${token}`;
  }, [token]);

  const onMessage = (event: MessageEvent) => {
    try {
      const messageData = JSON.parse(event.data) as EventEnvelopeWire;
      handleEvent(messageData);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  useSocket(socketUrl, { onMessage });

  return null;
}
