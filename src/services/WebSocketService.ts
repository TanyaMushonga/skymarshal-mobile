import { config, endpoints } from '@/constants/config';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private isConnected: boolean = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize and connect the WebSocket
   */
  connect(token: string) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      if (__DEV__) console.log('[WebSocket] Socket already connected or connecting');
      return;
    }

    this.token = token;
    const wsUrl = `${config.WS_URL}${endpoints.WS_NOTIFICATIONS}`;

    if (__DEV__) console.log(`[WebSocket] Connecting to ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      if (__DEV__) console.log('[WebSocket] Disconnecting manually');
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.token = null;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Verify if the socket is authenticated and ready
   */
  isSocketConnected() {
    return this.isConnected;
  }

  /**
   * Register a message handler
   */
  addListener(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Set up event listeners for the WebSocket
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      if (__DEV__) console.log('[WebSocket] Connected. Sending authentication...');

      // Step 2: Send Authentication Message immediately
      if (this.token) {
        this.send({
          type: 'authenticate',
          token: this.token,
        });
      }
    };

    this.socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Step 3: Handle Auth Response
        if (data.type === 'auth_success') {
          if (__DEV__) console.log('[WebSocket] Authenticated successfully');
          this.isConnected = true;
          // You could optionally start a ping interval here if the server expects client-side pings
        } else if (data.type === 'ping') {
          // Step 3 (Heartbeat): Server sent ping
          if (__DEV__) console.log('[WebSocket] Received ping');
          // Optional: this.send({ type: 'pong' });
        } else if (data.error) {
          console.error('[WebSocket] Protocol error:', data.error);
        } else {
          // Notifications or other messages
          this.notifyHandlers(data);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    this.socket.onclose = (e) => {
      if (__DEV__) console.log('[WebSocket] Disconnected:', e.reason);
      this.isConnected = false;
      this.socket = null;

      // Only reconnect if we have a token (user didn't manually logout)
      if (this.token) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (e) => {
      console.error('[WebSocket] Error event:', e);
    };
  }

  /**
   * Send data to the server
   */
  private send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message, socket not open');
    }
  }

  /**
   * Reconnect with exponential backoff could be implemented here.
   * For now, utilizing a simple timeout.
   */
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    if (__DEV__) console.log('[WebSocket] Scheduling reconnect in 5s...');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.token) {
        this.connect(this.token);
      }
    }, 5000);
  }

  /**
   * Notify all registered handlers of a new message
   */
  private notifyHandlers(data: any) {
    this.handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error('[WebSocket] Error in message handler:', error);
      }
    });
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
