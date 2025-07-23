import React from 'react';

const ProgressIndicator = ({ status, percentage, message }) => {
  const getStatusClass = (status) => {
    if (status === '待命中') return 'status-pending';
    if (status === '錯誤！') return 'status-error';
    if (status === '3/3 完成！') return 'status-completed';
    return 'status-processing';
  };

  const getStatusIcon = (status) => {
    if (status === '待命中') return '⏳';
    if (status === '錯誤！') return '❌';
    if (status === '3/3 完成！') return '✅';
    if (status.includes('上傳')) return '📤';
    if (status.includes('語音辨識')) return '🎤';
    if (status.includes('生成摘要')) return '🤖';
    return '⚙️';
  };

  // Don't render if status is pending and no message
  if (status === '待命中' && !message) {
    return null;
  }

  return (
    <div className="card">
      <div className={`status-indicator ${getStatusClass(status)}`}>
        <span style={{ fontSize: '1.2rem' }}>
          {getStatusIcon(status)}
        </span>
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {status}
          </div>
          {message && (
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
              {message}
            </div>
          )}
        </div>
      </div>
      
      {percentage > 0 && percentage < 100 && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {percentage > 0 && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.9rem', 
          color: '#666',
          marginTop: '8px'
        }}>
          {percentage}%
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;