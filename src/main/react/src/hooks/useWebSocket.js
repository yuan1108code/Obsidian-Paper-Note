import { useCallback, useRef } from 'react';
import { createWebSocketConnection } from '../services/apiService';

export const useWebSocket = (sessionId, { onProgress, onResults }) => {
  const wsRef = useRef(null);

  const connectWebSocket = useCallback((id) => {
    if (!id) return;

    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create new WebSocket connection
      const ws = createWebSocketConnection(id);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          // Update progress
          if (onProgress) {
            onProgress({
              status: data.status,
              percentage: data.progress_percentage,
              message: data.message || ''
            });
          }

          // Update results if available
          if (data.data && onResults) {
            if (data.data.transcript) {
              onResults(prev => ({ ...prev, transcript: data.data.transcript }));
            }
            if (data.data.summary) {
              onResults(prev => ({ ...prev, summary: data.data.summary }));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onProgress) {
          onProgress({
            status: '錯誤！',
            percentage: 0,
            message: '連接中斷，請重新整理頁面'
          });
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (event.code !== 1000) { // Not a normal closure
          if (onProgress) {
            onProgress({
              status: '錯誤！',
              percentage: 0,
              message: '連接中斷'
            });
          }
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (onProgress) {
        onProgress({
          status: '錯誤！',
          percentage: 0,
          message: '無法建立即時連接'
        });
      }
    }
  }, [onProgress, onResults]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    connectWebSocket,
    disconnectWebSocket,
    sendMessage
  };
};