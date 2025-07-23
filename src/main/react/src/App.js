import React, { useState, useEffect } from 'react';
import './App.css';
import InputSection from './components/InputSection';
import ResultTabs from './components/ResultTabs';
import ExportSection from './components/ExportSection';
import ProgressIndicator from './components/ProgressIndicator';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioProcessing } from './hooks/useAudioProcessing';

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