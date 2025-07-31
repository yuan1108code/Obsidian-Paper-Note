import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const InputSection = ({ 
  paperTitle, 
  onTitleChange, 
  onFileUpload, 
  onStartProcessing,
  isDisabled,
  hasFile 
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.m4a', '.wav', '.mp4', '.flac', '.ogg']
    },
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024, // 30MB
    disabled: isDisabled
  });

  return (
    <div className="card">
      <h2>📤 輸入與控制</h2>
      
      {/* Paper Title Input */}
      <div className="mb-16">
        <label htmlFor="paper-title" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          論文標題 <span style={{ color: '#c62828' }}>*</span>
        </label>
        <input
          id="paper-title"
          type="text"
          value={paperTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="請輸入論文標題（將作為 Obsidian 筆記的檔案名稱）"
          className="input"
          disabled={isDisabled}
        />
        <small style={{ color: '#666', fontSize: '0.9rem' }}>
          範例：大型語言模型在學術研究中的應用
        </small>
      </div>

      {/* File Upload Zone */}
      <div className="mb-16">
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          音檔上傳 <span style={{ color: '#c62828' }}>*</span>
        </label>
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
          style={{ 
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-column flex-center">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
              {hasFile ? '✅' : '🎵'}
            </div>
            {isDragActive ? (
              <p>拖放檔案到此處...</p>
            ) : hasFile ? (
              <div>
                <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>檔案已上傳！</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  點擊或拖放新檔案以替換
                </p>
              </div>
            ) : (
              <div>
                <p>點擊選擇或拖曳音檔至此</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  支援格式：MP3, M4A, WAV, MP4, FLAC, OGG
                </p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>
                  檔案大小限制：30MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          className="button"
          onClick={onStartProcessing}
          disabled={isDisabled || !hasFile || !paperTitle.trim()}
          style={{ 
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {isDisabled ? '處理中...' : '🚀 生成筆記'}
        </button>
        
        {(!hasFile || !paperTitle.trim()) && (
          <p style={{ 
            color: '#c62828', 
            fontSize: '0.9rem', 
            marginTop: '8px' 
          }}>
            {!paperTitle.trim() && '請輸入論文標題'}
            {!paperTitle.trim() && !hasFile && ' 並 '}
            {!hasFile && '請上傳音檔'}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputSection;