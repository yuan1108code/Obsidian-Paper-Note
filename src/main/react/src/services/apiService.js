import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 300000, // 5 minutes for audio processing
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = '未知錯誤';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      message = '無法連接到後端服務器 (localhost:8000)。請確認：\n1. 後端服務器是否已啟動\n2. 端口 8000 是否被佔用\n3. 防火牆是否阻擋連接';
    } else if (error.code === 'ECONNABORTED') {
      message = '請求超時。音檔處理可能需要較長時間，請稍候再試。';
    } else if (error.response) {
      // Server responded with error status
      message = error.response.data?.detail || error.response.data?.message || `服務器錯誤 (${error.response.status})`;
    } else if (error.request) {
      // Request made but no response received
      message = '網路連接問題：無法聯繫後端服務器。請檢查：\n1. 網路連接是否正常\n2. 後端服務器是否運行在 localhost:8000';
    } else {
      // Something else happened
      message = error.message || '請求設定錯誤';
    }
    
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      config: error.config?.url
    });
    
    throw new Error(message);
  }
);

// Upload audio file
export const uploadAudioFile = async (file, paperTitle) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('paper_title', paperTitle);

  return await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Start audio processing
export const startProcessing = async (sessionId) => {
  return await api.post('/api/process', null, {
    params: { session_id: sessionId }
  });
};

// Get processing results
export const getProcessingResults = async (sessionId) => {
  return await api.get(`/api/result/${sessionId}`);
};

// Save to Obsidian
export const saveToObsidian = async (data) => {
  return await api.post('/api/obsidian/save', data);
};

// Utility function for copying text to clipboard
export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      throw new Error('複製功能不支援，請手動選取文字');
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// WebSocket connection utility
export const createWebSocketConnection = (sessionId) => {
  // Use the same base URL as API but with WebSocket protocol
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const wsBaseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  const wsUrl = `${wsBaseUrl}/ws/${sessionId}`;
  
  try {
    return new WebSocket(wsUrl);
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    throw new Error('無法建立即時連接');
  }
};

// Health check
export const healthCheck = async () => {
  try {
    return await api.get('/');
  } catch (error) {
    throw new Error('無法連接到伺服器');
  }
};

export default api;