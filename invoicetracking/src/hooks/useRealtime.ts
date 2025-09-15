/**
 * React hooks for real-time WebSocket connections
 */
import { useEffect, useRef, useState } from 'react';
import { 
  InvoiceRealtimeService, 
  NotificationRealtimeService, 
  AIInsightsRealtimeService,
  InvoiceUpdateEvent,
  NotificationEvent,
  AIInsightEvent
} from '../services/realtimeService';

export const useInvoiceRealtime = (getAuthToken: () => string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const serviceRef = useRef<InvoiceRealtimeService | null>(null);

  useEffect(() => {
    const service = new InvoiceRealtimeService(getAuthToken);
    serviceRef.current = service;

    const connect = async () => {
      try {
        await service.connectToInvoices();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error: any) {
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [getAuthToken]);

  const subscribeToInvoice = (invoiceId: string) => {
    serviceRef.current?.subscribeTo Invoice(invoiceId);
  };

  const unsubscribeFromInvoice = (invoiceId: string) => {
    serviceRef.current?.unsubscribeFromInvoice(invoiceId);
  };

  const onInvoiceUpdated = (handler: (event: InvoiceUpdateEvent) => void) => {
    return serviceRef.current?.onInvoiceUpdated(handler) || (() => {});
  };

  const onInvoiceStatusChanged = (handler: (event: InvoiceUpdateEvent) => void) => {
    return serviceRef.current?.onInvoiceStatusChanged(handler) || (() => {});
  };

  const onAIProcessingComplete = (handler: (event: InvoiceUpdateEvent) => void) => {
    return serviceRef.current?.onAIProcessingComplete(handler) || (() => {});
  };

  return {
    isConnected,
    connectionError,
    subscribeToInvoice,
    unsubscribeFromInvoice,
    onInvoiceUpdated,
    onInvoiceStatusChanged,
    onAIProcessingComplete
  };
};

export const useNotificationRealtime = (getAuthToken: () => string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const serviceRef = useRef<NotificationRealtimeService | null>(null);

  useEffect(() => {
    const service = new NotificationRealtimeService(getAuthToken);
    serviceRef.current = service;

    const connect = async () => {
      try {
        await service.connectToNotifications();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error: any) {
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [getAuthToken]);

  const onNewNotification = (handler: (event: NotificationEvent) => void) => {
    return serviceRef.current?.onNewNotification(handler) || (() => {});
  };

  const onNotificationRead = (handler: (event: NotificationEvent) => void) => {
    return serviceRef.current?.onNotificationRead(handler) || (() => {});
  };

  return {
    isConnected,
    connectionError,
    onNewNotification,
    onNotificationRead
  };
};

export const useAIInsightsRealtime = (getAuthToken: () => string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const serviceRef = useRef<AIInsightsRealtimeService | null>(null);

  useEffect(() => {
    const service = new AIInsightsRealtimeService(getAuthToken);
    serviceRef.current = service;

    const connect = async () => {
      try {
        await service.connectToAIInsights();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error: any) {
        setConnectionError(error.message);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [getAuthToken]);

  const onNewInsight = (handler: (event: AIInsightEvent) => void) => {
    return serviceRef.current?.onNewInsight(handler) || (() => {});
  };

  const onAnomalyDetected = (handler: (event: AIInsightEvent) => void) => {
    return serviceRef.current?.onAnomalyDetected(handler) || (() => {});
  };

  const onPredictionUpdated = (handler: (event: AIInsightEvent) => void) => {
    return serviceRef.current?.onPredictionUpdated(handler) || (() => {});
  };

  return {
    isConnected,
    connectionError,
    onNewInsight,
    onAnomalyDetected,
    onPredictionUpdated
  };
};