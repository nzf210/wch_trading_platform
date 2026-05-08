
import { useEffect, useRef, useState } from 'react';

export enum ReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

interface UseSocketOptions {
  onMessage: (event: MessageEvent) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export const useSocket = (url: string | null, { onMessage, reconnectInterval = 3000, reconnectAttempts = 5 }: UseSocketOptions) => {
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.Closed);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptCount = useRef(0);

  useEffect(() => {
    if (!url) {
      return;
    }

    const connect = () => {
      setReadyState(ReadyState.Connecting);
      
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setReadyState(ReadyState.Open);
        reconnectAttemptCount.current = 0;
      };

      socket.onmessage = onMessage;

      socket.onclose = () => {
        console.log('WebSocket closed');
        setReadyState(ReadyState.Closed);

        if (reconnectAttemptCount.current < reconnectAttempts) {
          setTimeout(() => {
            reconnectAttemptCount.current++;
            console.log(`WebSocket reconnecting... Attempt ${reconnectAttemptCount.current}`);
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        socket.close(); // This will trigger onclose and the reconnect logic
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        reconnectAttemptCount.current = reconnectAttempts; // prevent reconnecting on unmount
        socketRef.current.close();
      }
    };
  }, [url, onMessage, reconnectInterval, reconnectAttempts]);

  return { readyState };
};
