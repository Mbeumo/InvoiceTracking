/**
 * Real-time WebSocket Service for Live Updates
 * 
 * Provides real-time communication with Django Channels backend
 * for instant updates on invoices, notifications, and AI processing
 */

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export interface InvoiceUpdateEvent {
  type: 'invoice_updated' | 'invoice_status_changed' | 'ai_processing_complete';
  invoice_id: string;
  invoice?: any;
  changes?: Record<string, any>;
  old_status?: string;
  new_status?: string;
  changed_by?: string;
  results?: any;
  timestamp: string;
}

export interface NotificationEvent {
  type: 'new_notification' | 'notification_read';
  notification?: any;
  notification_id?: string;
  user_id: string;
  timestamp: string;
}

export interface AIInsightEvent {
  type: 'new_insight' | 'anomaly_detected' | 'prediction_updated';
  insight?: any;
  invoice_id?: string;
  anomalies?: any[];
  risk_score?: number;
  prediction_type?: string;
  data?: any;
  timestamp: string;
}

type EventHandler = (event: any) => void;

export class RealtimeService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(
    private baseUrl: string = 'ws://localhost:8000/ws',
    private getAuthToken: () => string | null
  ) {}

  // Connection management
  connect(endpoint: 'invoices' | 'notifications' | 'ai-insights'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      const token = this.getAuthToken();
      const wsUrl = `${this.baseUrl}/${endpoint}/${token ? `?token=${token}` : ''}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(`WebSocket connected to ${endpoint}`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket disconnected from ${endpoint}:`, event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;

          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(endpoint);
          }
        };

        this.ws.onerror = (error) => {
          console.error(`WebSocket error on ${endpoint}:`, error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event handling
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Send messages
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  // Subscribe to specific invoice updates
  subscribeToInvoice(invoiceId: string): void {
    this.send({
      type: 'subscribe_invoice',
      data: { invoice_id: invoiceId }
    });
  }

  unsubscribeFromInvoice(invoiceId: string): void {
    this.send({
      type: 'unsubscribe_invoice',
      data: { invoice_id: invoiceId }
    });
  }

  // Private methods
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in event handler for ${message.type}:`, error);
        }
      });
    }
  }

  private scheduleReconnect(endpoint: string): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect(endpoint).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  // Connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Singleton instances for different endpoints
export class InvoiceRealtimeService extends RealtimeService {
  constructor(getAuthToken: () => string | null) {
    super(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws', getAuthToken);
  }

  async connectToInvoices(): Promise<void> {
    return this.connect('invoices');
  }

  // Invoice-specific event handlers
  onInvoiceUpdated(handler: (event: InvoiceUpdateEvent) => void): () => void {
    return this.on('invoice_updated', handler);
  }

  onInvoiceStatusChanged(handler: (event: InvoiceUpdateEvent) => void): () => void {
    return this.on('invoice_status_changed', handler);
  }

  onAIProcessingComplete(handler: (event: InvoiceUpdateEvent) => void): () => void {
    return this.on('ai_processing_complete', handler);
  }
}

export class NotificationRealtimeService extends RealtimeService {
  constructor(getAuthToken: () => string | null) {
    super(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws', getAuthToken);
  }

  async connectToNotifications(): Promise<void> {
    return this.connect('notifications');
  }

  // Notification-specific event handlers
  onNewNotification(handler: (event: NotificationEvent) => void): () => void {
    return this.on('new_notification', handler);
  }

  onNotificationRead(handler: (event: NotificationEvent) => void): () => void {
    return this.on('notification_read', handler);
  }
}

export class AIInsightsRealtimeService extends RealtimeService {
  constructor(getAuthToken: () => string | null) {
    super(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws', getAuthToken);
  }

  async connectToAIInsights(): Promise<void> {
    return this.connect('ai-insights');
  }

  // AI insights event handlers
  onNewInsight(handler: (event: AIInsightEvent) => void): () => void {
    return this.on('new_insight', handler);
  }

  onAnomalyDetected(handler: (event: AIInsightEvent) => void): () => void {
    return this.on('anomaly_detected', handler);
  }

  onPredictionUpdated(handler: (event: AIInsightEvent) => void): () => void {
    return this.on('prediction_updated', handler);
  }
}