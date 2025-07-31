import axios from 'axios';

// Common ports to try for backend
const COMMON_PORTS = [8000, 8001, 8080, 3001, 5000];
let currentPort = 8000;

// Function to test if a port is available
const testPort = async (port) => {
  try {
    const response = await axios.get(`http://localhost:${port}/api/health`, {
      timeout: 2000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Auto-detect available port
const detectAvailablePort = async () => {
  for (const port of COMMON_PORTS) {
    if (await testPort(port)) {
      currentPort = port;
      console.log(`🔍 Auto-detected backend on port ${port}`);
      return port;
    }
  }
  throw new Error('No available backend port found');
};

// Create axios instance with dynamic port detection
const createApiInstance = () => {
  return axios.create({
    baseURL: process.env.REACT_APP_API_URL || `http://localhost:${currentPort}`,
    timeout: 300000, // 5 minutes for audio processing
  });
};

let api = createApiInstance();

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    let message = '未知錯誤';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.log(`🔄 Connection failed on port ${currentPort}, trying to detect available port...`);
      
      try {
        // Try to detect an available port
        const newPort = await detectAvailablePort();
        if (newPort !== currentPort) {
          // Update API instance with new port
          currentPort = newPort;
          api = createApiInstance();
          
          // Retry the original request with new port
          const retryConfig = { ...error.config };
          retryConfig.baseURL = `http://localhost:${currentPort}`;
          return api.request(retryConfig);
        }
      } catch (detectError) {
        message = `無法連接到後端服務器。已嘗試端口: ${COMMON_PORTS.join(', ')}。請確認：\n1. 後端服務器是否已啟動\n2. 使用正確的端口\n3. 防火牆是否阻擋連接`;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '請求超時。音檔處理可能需要較長時間，請稍候再試。';
    } else if (error.response) {
      // Server responded with error status
      message = error.response.data?.detail || error.response.data?.message || `服務器錯誤 (${error.response.status})`;
    } else if (error.request) {
      // Request made but no response received
      message = `網路連接問題：無法聯繫後端服務器 (localhost:${currentPort})。請檢查：\n1. 網路連接是否正常\n2. 後端服務器是否正在運行`;
    } else {
      // Something else happened
      message = error.message || '請求設定錯誤';
    }
    
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      currentPort,
      response: error.response?.data,
      config: error.config?.url
    });
    
    throw new Error(message);
  }
);

// Initialize API service with port detection
export const initializeApiService = async () => {
  try {
    await detectAvailablePort();
    api = createApiInstance();
    console.log(`✅ API service initialized on port ${currentPort}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize API service:', error.message);
    return false;
  }
};

// Get current backend info
export const getBackendInfo = () => ({
  port: currentPort,
  baseURL: `http://localhost:${currentPort}`,
  availablePorts: COMMON_PORTS
});

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