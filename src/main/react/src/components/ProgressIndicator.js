import React from 'react';

const ProgressIndicator = ({ status, percentage, message }) => {
  const getStatusClass = (status) => {
    if (status === '待命中') return 'status-pending';
    if (status === '錯誤！') return 'status-error';
    if (status === '3/3 完成！' || status === '處理完成！') return 'status-completed';
    return 'status-processing';
  };

  const getStatusIcon = (status) => {
    if (status === '待命中') return '⏳';
    if (status === '錯誤！') return '❌';
    if (status === '3/3 完成！' || status === '處理完成！') return '✅';
    if (status.includes('上傳')) return '📤';
    if (status.includes('語音辨識') || status.includes('辨識')) return '🎤';
    if (status.includes('生成摘要') || status.includes('摘要') || status.includes('重點摘要')) return '🤖';
    if (status.includes('開始處理')) return '⚙️';
    return '⚙️';
  };

  const getProgressSteps = (percentage) => {
    if (percentage >= 100) return { current: 3, total: 3, step: '完成' };
    if (percentage >= 60) return { current: 3, total: 3, step: '生成摘要' };
    if (percentage >= 10) return { current: 2, total: 3, step: '語音辨識' };
    return { current: 1, total: 3, step: '準備中' };
  };

  // Don't render if status is pending and no message
  if (status === '待命中' && !message) {
    return null;
  }

  const progressSteps = getProgressSteps(percentage);
  const isProcessing = percentage > 0 && percentage < 100;
  const isCompleted = percentage >= 100;

  return (
    <div className="card progress-card">
      <div className="progress-header">
        <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
          🚀 處理進度
        </h3>
        <div className="progress-steps">
          步驟 {progressSteps.current} / {progressSteps.total} - {progressSteps.step}
        </div>
      </div>

      <div className={`status-indicator ${getStatusClass(status)}`}>
        <span className="status-icon">
          {getStatusIcon(status)}
        </span>
        <div className="status-content">
          <div className="status-text">
            {status}
          </div>
          {message && (
            <div className="status-message">
              {message}
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar-enhanced">
          <div 
            className={`progress-fill-enhanced ${isProcessing ? 'animate-pulse' : ''}`}
            style={{ 
              width: `${Math.max(percentage, 0)}%`,
              backgroundColor: isCompleted ? '#4caf50' : isProcessing ? '#2196f3' : '#f5f5f5'
            }}
          />
        </div>
        
        <div className="progress-percentage">
          {percentage}%
        </div>
      </div>

      {/* Step Indicators */}
      <div className="step-indicators">
        <div className={`step-item ${percentage > 0 ? 'completed' : 'pending'}`}>
          <div className="step-dot">📤</div>
          <div className="step-label">檔案上傳</div>
        </div>
        <div className={`step-item ${percentage >= 50 ? 'completed' : percentage >= 10 ? 'active' : 'pending'}`}>
          <div className="step-dot">🎤</div>
          <div className="step-label">語音辨識</div>
        </div>
        <div className={`step-item ${percentage >= 100 ? 'completed' : percentage >= 60 ? 'active' : 'pending'}`}>
          <div className="step-dot">🤖</div>
          <div className="step-label">生成摘要</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;