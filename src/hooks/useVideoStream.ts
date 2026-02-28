import { useState, useEffect, useCallback, useRef } from 'react';

export interface StreamFrame {
  frame_data: string;
  frame_number: number;
  timestamp: number;
}

export const useVideoStream = (streamId: string | null) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!streamId) return;

    // Use hardcoded backend URL for now as per system configuration
    const wsUrl = `ws://10.0.2.2:8000/ws/stream/${streamId}/`;

    console.log(`Mobile: Connecting to stream: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('Mobile: Stream WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'live_frame') {
          setFrame(data.frame_data);
        }
      } catch (err) {
        console.error('Mobile: Error parsing stream message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Mobile: Stream WebSocket disconnected');
    };

    ws.onerror = (err) => {
      setError('WebSocket connection failed');
      console.error('Mobile: Stream WebSocket error:', err);
    };
  }, [streamId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { frame, isConnected, error, reconnect: connect };
};
