import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/constants/config';

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
  const lastFrameRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (!streamId) return;

    const wsUrl = `${config.WS_URL}/ws/stream/${streamId}/`;
    console.log(`[useVideoStream] 📡 Connecting to: ${wsUrl}`);

    if (wsRef.current) {
      console.log(`[useVideoStream] 🔄 Closing existing connection for stream: ${streamId}`);
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[useVideoStream] ✅ Connected successfully to stream: ${streamId}`);
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Diagnostic log in development
        if (__DEV__ && !lastFrameRef.current) {
          console.log('[useVideoStream] First frame structure:', Object.keys(data));
        }

        // Support multiple types of frame messages
        if (
          data.type === 'live_frame' || 
          data.type === 'stream_frame' || 
          data.frame_data || 
          data.frame
        ) {
          const frameData = data.frame_data || data.frame;
          if (frameData) {
            // Remove prefix if it exists to avoid duplication in UI
            const sanitizedFrame = typeof frameData === 'string' 
              ? frameData.replace(/^data:image\/[a-z]+;base64,/, '')
              : frameData;
            
            setFrame(sanitizedFrame);
            lastFrameRef.current = sanitizedFrame;
          }
        }
      } catch (error) {
        console.error(`[useVideoStream] ❌ JSON Parse Error for stream ${streamId}:`, error);
        console.log('[useVideoStream] 📝 Raw message snippet:', 
          typeof event.data === 'string' ? event.data.substring(0, 100) : 'Non-string data');
      }
    };

    ws.onclose = (e) => {
      console.log(`[useVideoStream] 🔌 Connection closed for stream ${streamId}. Code: ${e.code}, Reason: ${e.reason}`);
      setIsConnected(false);
    };

    ws.onerror = (e) => {
      console.error(`[useVideoStream] 🚨 WebSocket Error for stream ${streamId}:`, e);
      setError('Connection failed');
      setIsConnected(false);
    };
  }, [streamId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    frame: frame || lastFrameRef.current,
    isConnected,
    error,
    reconnect: connect,
  };
};
