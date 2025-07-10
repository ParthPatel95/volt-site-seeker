import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (recipientId: string, listingId: string, message: string) => void;
  markAsRead: (messageId: string) => void;
  setTyping: (recipientId: string, isTyping: boolean) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  reconnect: () => void;
}

export const useVoltMarketWebSocket = (): UseWebSocketReturn => {
  const { profile } = useVoltMarketAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messageCallbacksRef = useRef<((message: WebSocketMessage) => void)[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!profile?.id) return;

    try {
      // Use the correct WebSocket URL for Supabase Edge Functions
      const wsUrl = `wss://ktgosplhknmnyagxrgbe.functions.supabase.co/voltmarket-chat`;
      console.log('Attempting to connect to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          userId: profile.id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Call all registered callbacks
          messageCallbacksRef.current.forEach(callback => {
            callback(data);
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts < 5) {
          const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [profile?.id, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((recipientId: string, listingId: string, message: string) => {
    if (!wsRef.current || !isConnected || !profile?.id) {
      console.error('WebSocket not connected or user not authenticated');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      senderId: profile.id,
      recipientId,
      listingId,
      message
    }));
  }, [isConnected, profile?.id]);

  const markAsRead = useCallback((messageId: string) => {
    if (!wsRef.current || !isConnected) return;

    wsRef.current.send(JSON.stringify({
      type: 'mark_read',
      messageId
    }));
  }, [isConnected]);

  const setTyping = useCallback((recipientId: string, isTyping: boolean) => {
    if (!wsRef.current || !isConnected) return;

    wsRef.current.send(JSON.stringify({
      type: 'typing',
      recipientId,
      isTyping
    }));
  }, [isConnected]);

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacksRef.current.push(callback);
    
    // Return cleanup function
    return () => {
      messageCallbacksRef.current = messageCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Connect when profile is available
  useEffect(() => {
    if (profile?.id) {
      connect();
    }

    return disconnect;
  }, [profile?.id, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    markAsRead,
    setTyping,
    onMessage,
    reconnect
  };
};