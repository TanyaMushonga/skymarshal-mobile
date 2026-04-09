import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/constants/config';

export interface StreamFrame {
  frame_data: string;
  frame_number: number;
  timestamp: number;
}

export const useVideoStream = (streamId: string | null) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [streamMode, setStreamMode] = useState<'LIVE' | 'SIMULATED' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastFrameRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (!streamId) {
      console.log('[useVideoStream] ⚠️ No streamId provided, skipping connection');
      return;
    }

    const wsUrl = `${config.WS_URL}/ws/stream/${streamId}/`;
    
    console.log(`[useVideoStream] 📡 Attempting connection for feed at: ${wsUrl}`);

    if (wsRef.current) {
      console.log(`[useVideoStream] 🔄 Closing existing connection for stream: ${streamId}`);
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[useVideoStream] ✅ WebSocket connection OPEN for stream: ${streamId}`);
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (
            data.type === 'live_frame' || 
            data.type === 'stream_frame' || 
            data.frame_data || 
            data.frame
          ) {
            const frameData = data.frame_data || data.frame;
            if (frameData) {
              const sanitizedFrame = typeof frameData === 'string' 
                ? frameData.replace(/^data:image\/[a-z]+;base64,/, '')
                : frameData;
              
              setFrame(sanitizedFrame);
              lastFrameRef.current = sanitizedFrame;

              if (data.source) {
                setStreamMode(data.source);
              }
            }
          } else {
            console.log(`[useVideoStream] 💬 Received non-frame message type: ${data.type || 'unknown'}`);
          }
        } catch {
          console.warn(`[useVideoStream] ⚠️ Failed to parse message for stream ${streamId}`);
        }
      };

      ws.onclose = (e) => {
        console.log(`[useVideoStream] 🔌 Connection closed for stream ${streamId}. Code: ${e.code}, Reason: ${e.reason || 'None provided'}`);
        setIsConnected(false);
      };

      ws.onerror = (e: any) => {
        const errMsg = e.message || 'Unknown WebSocket Error';
        console.error(`[useVideoStream] 🚨 WebSocket Error for stream ${streamId}:`, errMsg);
        setError(`Connection failed: ${errMsg}. Check if the server at ${wsUrl} is reachable.`);
        setIsConnected(false);
      };
    } catch (err: any) {
      console.error(`[useVideoStream] 💥 Exception while establishing connection for ${streamId}:`, err.message);
      setError(`Connection exception: ${err.message}`);
    }
  }, [streamId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    frame: frame || lastFrameRef.current,
    streamMode,
    isConnected,
    error,
    reconnect: connect,
  };
};

