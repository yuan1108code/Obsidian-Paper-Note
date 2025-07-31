import React, { useState } from 'react';

const ResultTabs = ({ transcript, summary, onSummaryChange }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // 簡單的視覺反饋
      const button = document.getElementById(`copy-${type}`);
      const originalText = button.textContent;
      button.textContent = '已複製！';
      button.style.background = '#2e7d32';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    } catch (err) {
      console.error('複製失敗:', err);
      alert('複製失敗，請手動選取文字');
    }
  };

  return (
    <div className="card">
      <h2>📋 結果顯示</h2>
      
      {/* Tabs Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          🤖 AI 重點摘要
        </button>
        <button
          className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          📝 完整逐字稿
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <div className="flex" style={{ marginBottom: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, color: '#666' }}>
              您可以在儲存前編輯摘要內容：
            </p>
            <div className="flex" style={{ gap: '8px' }}>
              <button
                className="button button-secondary"
                onClick={() => setIsEditing(!isEditing)}
                style={{ padding: '6px 12px', fontSize: '14px' }}
              >
                {isEditing ? '✅ 完成編輯' : '✏️ 編輯'}
              </button>
              <button
                id="copy-summary"
                className="button"
                onClick={() => copyToClipboard(summary, 'summary')}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '15px',
                  fontWeight: 'bold',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none'
                }}
              >
                📋 複製為 Markdown
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={summary}
              onChange={(e) => onSummaryChange(e.target.value)}
              className="textarea"
              placeholder="AI 生成的摘要將顯示在此處..."
              style={{ minHeight: '400px' }}
            />
          ) : (
            <div 
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '16px',
                minHeight: '400px',
                backgroundColor: '#fafafa',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {summary || '摘要生成中，請稍候...'}
            </div>
          )}
        </div>
      )}

      {/* Transcript Tab */}
      {activeTab === 'transcript' && (
        <div>
          <div className="flex" style={{ marginBottom: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, color: '#666' }}>
              完整的語音辨識結果：
            </p>
            <button
              id="copy-transcript"
              className="button"
              onClick={() => copyToClipboard(transcript, 'transcript')}
              style={{ 
                padding: '8px 16px', 
                fontSize: '15px',
                fontWeight: 'bold',
                background: '#2196f3',
                color: 'white',
                border: 'none'
              }}
            >
              📋 複製為 Markdown
            </button>
          </div>
          
          <div 
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '16px',
              minHeight: '400px',
              backgroundColor: '#fafafa',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.6',
              maxHeight: '600px',
              overflowY: 'auto'
            }}
          >
            {transcript || '語音辨識中，請稍候...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultTabs;