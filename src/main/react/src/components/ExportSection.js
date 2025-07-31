import React, { useState } from 'react';
import { saveToObsidian, copyToClipboard } from '../services/apiService';

const ExportSection = ({ paperTitle, content }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [vaultSettings, setVaultSettings] = useState({
    vaultName: '',
    filePath: ''
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleSaveToObsidian = async () => {
    if (!content.trim()) {
      alert('沒有內容可以儲存');
      return;
    }

    setIsLoading(true);
    try {
      const response = await saveToObsidian({
        paper_title: paperTitle,
        content: content,
        vault_name: vaultSettings.vaultName || undefined,
        file_path: vaultSettings.filePath || undefined
      });

      if (response.success) {
        // 開啟 Obsidian URI
        window.location.href = response.obsidian_uri;
      } else {
        alert(`儲存失敗：${response.message}`);
      }
    } catch (error) {
      console.error('儲存至 Obsidian 失敗:', error);
      alert('儲存失敗，請檢查網路連接或 Obsidian 是否已安裝');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContent = async () => {
    try {
      await copyToClipboard(content);
      // 簡單的視覺反饋
      const button = document.getElementById('copy-button');
      const originalText = button.textContent;
      button.textContent = '已複製！';
      button.style.background = '#2e7d32';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    } catch (error) {
      console.error('複製失敗:', error);
      alert('複製失敗，請手動選取文字');
    }
  };

  return (
    <div className="card">
      <h2>💾 匯出與儲存</h2>
      
      {/* Main Action Buttons */}
      <div className="flex" style={{ marginBottom: '20px' }}>
        <button
          className="button"
          onClick={handleSaveToObsidian}
          disabled={isLoading || !content.trim()}
          style={{ 
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '處理中...' : '🚀 一鍵存入 Obsidian'}
        </button>
        
        <button
          id="copy-button"
          className="button button-secondary"
          onClick={handleCopyContent}
          disabled={!content.trim()}
          style={{ 
            padding: '16px',
            fontSize: '16px'
          }}
        >
          📋 複製筆記內容
        </button>
      </div>

      {/* Settings Toggle */}
      <div style={{ marginBottom: '16px' }}>
        <button
          className="button button-secondary"
          onClick={() => setShowSettings(!showSettings)}
          style={{ 
            padding: '8px 16px',
            fontSize: '14px'
          }}
        >
          ⚙️ {showSettings ? '隱藏' : '顯示'} Obsidian 設定
        </button>
      </div>

      {/* Obsidian Settings */}
      {showSettings && (
        <div style={{ 
          background: '#f8f9fa',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Obsidian 設定</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              Vault 名稱 (選填)
            </label>
            <input
              type="text"
              value={vaultSettings.vaultName}
              onChange={(e) => setVaultSettings(prev => ({ 
                ...prev, 
                vaultName: e.target.value 
              }))}
              placeholder="預設為 Obsidian Vault"
              className="input"
              style={{ fontSize: '14px', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              檔案路徑 (選填)
            </label>
            <input
              type="text"
              value={vaultSettings.filePath}
              onChange={(e) => setVaultSettings(prev => ({ 
                ...prev, 
                filePath: e.target.value 
              }))}
              placeholder="預設為 Papers/Summaries/[論文標題]"
              className="input"
              style={{ fontSize: '14px', padding: '8px' }}
            />
          </div>
          
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            margin: '8px 0 0 0',
            lineHeight: '1.4'
          }}>
            💡 提示：留空將使用預設設定。檔案路徑範例：Research/2024/AI Papers
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        background: '#e3f2fd',
        padding: '16px',
        borderRadius: '4px',
        marginTop: '16px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>使用說明</h4>
        <ul style={{ 
          margin: 0,
          paddingLeft: '20px',
          fontSize: '14px',
          color: '#1565c0'
        }}>
          <li>點擊「一鍵存入 Obsidian」會自動開啟 Obsidian 並建立新筆記</li>
          <li>如果自動儲存失敗，可以使用「複製筆記內容」手動貼上</li>
          <li>確保已安裝 Obsidian 並且目標 Vault 存在</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportSection;