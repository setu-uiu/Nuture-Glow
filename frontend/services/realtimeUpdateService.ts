// WebSocket Real-time Updates Service for Dashboard Synchronization
import { API_BASE } from '../constants';

const TOKEN_KEY = 'ng_auth_token';

type MessageType = 'dashboard_update' | 'system_message' | 'security_alert' | 'user_status_change' | 'settings_update' | 'maintenance_mode' | 'security_event';

interface WSMessage {
  type: MessageType;
  data: Record<string, any>;
  timestamp: string;
  broadcastTo?: 'all_users' | 'specific_role' | 'specific_user';
}

class RealtimeUpdateService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: Map<MessageType, Set<Function>> = new Map();
  private userId: string | null = null;
  private userRole: string | null = null;

  constructor() {
    this.userId = this.getUserIdFromToken();
    this.userRole = this.getUserRoleFromToken();
  }

  /**
   * Extract userId from JWT token
   */
  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  }

  /**
   * Extract userRole from JWT token
   */
  private getUserRoleFromToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  /**
   * Connect to WebSocket server for real-time updates
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        reject(new Error('No authentication token found'));
        return;
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws?token=${token}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected to real-time updates service');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error: Event) => {
          console.error('[WebSocket] Connection error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Connection closed, attempting to reconnect...');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WSMessage): void {
    console.log(`[WebSocket] Received ${message.type}:`, message.data);

    // Check if this message is meant for this user
    if (!this.isMessageForUser(message)) {
      return;
    }

    // Call all registered handlers for this message type
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`[WebSocket] Error in handler for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Determine if this message should be handled by this user
   */
  private isMessageForUser(message: WSMessage): boolean {
    if (!message.broadcastTo) return true; // Broadcast to all

    switch (message.broadcastTo) {
      case 'all_users':
        return true;

      case 'specific_role':
        return this.userRole === message.data.targetRole;

      case 'specific_user':
        return this.userId === message.data.targetUserId;

      default:
        return false;
    }
  }

  /**
   * Register a handler for a specific message type
   */
  subscribe(messageType: MessageType, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const realtimeUpdateService = new RealtimeUpdateService();
