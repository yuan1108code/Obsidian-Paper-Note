import React, { useState, useEffect } from 'react';
import './App.css';
import InputSection from './components/InputSection';
import ResultTabs from './components/ResultTabs';
import ExportSection from './components/ExportSection';
import ProgressIndicator from './components/ProgressIndicator';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { initializeApiService, getBackendInfo } from './services/apiService';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [progress, setProgress] = useState({
    status: '待命中',
    percentage: 0,
    message: ''
  });
  const [results, setResults] = useState({
    transcript: '',
    summary: ''
  });
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    port: null,
    initializing: true
  });
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Custom hooks for WebSocket and audio processing
  const { connectWebSocket, disconnectWebSocket } = useWebSocket(sessionId, {
    onProgress: setProgress,
    onResults: setResults
  });

  const { 
    uploadFile, 
    processAudio, 
    getResults,
    isUploading,
    isProcessing 
  } = useAudioProcessing({
    onSessionCreated: (id) => {
      setSessionId(id);
      connectWebSocket(id);
    },
    onError: (error) => {
      setProgress({
        status: '錯誤！',
        percentage: 0,
        message: error
      });
    }
  });

  // Initialize API service on component mount
  useEffect(() => {
    const initializeAPI = async () => {
      const success = await initializeApiService();
      const info = getBackendInfo();
      
      setBackendStatus({
        connected: success,
        port: info.port,
        initializing: false
      });
      
      if (success) {
        console.log(`🚀 Backend connected on port ${info.port}`);
      }
    };
    
    initializeAPI();
  }, []);

  // Manual reconnect function
  const handleReconnect = async () => {
    setIsReconnecting(true);
    setBackendStatus(prev => ({ ...prev, initializing: true }));
    
    const success = await initializeApiService();
    const info = getBackendInfo();
    
    setBackendStatus({
      connected: success,
      port: info.port,
      initializing: false
    });
    
    setIsReconnecting(false);
    
    if (success) {
      console.log(`🔄 Reconnected to backend on port ${info.port}`);
    }
  };

  useEffect(() => {
    return () => {
      if (sessionId) {
        disconnectWebSocket();
      }
    };
  }, [sessionId, disconnectWebSocket]);

  const handleFileUpload = async (file) => {
    if (!paperTitle.trim()) {
      alert('請先輸入論文標題');
      return;
    }

    await uploadFile(file, paperTitle);
  };

  const handleStartProcessing = async () => {
    if (!sessionId) {
      alert('請先上傳音檔');
      return;
    }

    await processAudio(sessionId);
  };

  const handleReset = () => {
    setSessionId('');
    setPaperTitle('');
    setProgress({ status: '待命中', percentage: 0, message: '' });
    setResults({ transcript: '', summary: '' });
    disconnectWebSocket();
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1>📝 Obsidian Paper Note</h1>
          <p>論文 Podcast 自動筆記工具 - 一鍵將學術 Podcast 轉換為 Obsidian 筆記</p>
          
          {/* Backend Status Indicator */}
          <div style={{ 
            margin: '10px 0', 
            padding: '8px 16px', 
            backgroundColor: backendStatus.connected ? '#e8f5e8' : backendStatus.initializing ? '#fff3cd' : '#f8d7da',
            borderRadius: '4px',
            fontSize: '14px',
            color: backendStatus.connected ? '#2e7d32' : backendStatus.initializing ? '#856404' : '#721c24',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              {backendStatus.initializing ? (
                '🔍 正在檢測後端服務器...'
              ) : backendStatus.connected ? (
                `✅ 後端已連接 (localhost:${backendStatus.port})`
              ) : (
                '❌ 後端連接失敗 - 請檢查服務器狀態'
              )}
            </span>
            
            {!backendStatus.connected && !backendStatus.initializing && (
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: isReconnecting ? 'not-allowed' : 'pointer',
                  opacity: isReconnecting ? 0.6 : 1
                }}
              >
                {isReconnecting ? '重連中...' : '🔄 重新連接'}
              </button>
            )}
          </div>
        </header>

        {/* Block A: Input & Control */}
        <InputSection 
          paperTitle={paperTitle}
          onTitleChange={setPaperTitle}
          onFileUpload={handleFileUpload}
          onStartProcessing={handleStartProcessing}
          isDisabled={isUploading || isProcessing}
          hasFile={!!sessionId}
        />

        {/* Progress Indicator */}
        <ProgressIndicator 
          status={progress.status}
          percentage={progress.percentage}
          message={progress.message}
        />

        {/* Block B: Results Display */}
        {(results.transcript || results.summary) && (
          <ResultTabs 
            transcript={results.transcript}
            summary={results.summary}
            onSummaryChange={(newSummary) => 
              setResults(prev => ({ ...prev, summary: newSummary }))
            }
          />
        )}

        {/* Block C: Export & Save */}
        {results.summary && (
          <ExportSection 
            paperTitle={paperTitle}
            content={results.summary}
          />
        )}

        {/* Reset Button */}
        {sessionId && (
          <div className="card text-center">
            <button 
              className="button button-secondary"
              onClick={handleReset}
            >
              重新開始
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;