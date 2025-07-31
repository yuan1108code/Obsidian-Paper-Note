import React, { useState } from 'react';

const ObsidianResult = ({ obsidianUri, paperTitle }) => {
  const [copied, setCopied] = useState(false);

  const handleOpenObsidian = () => {
    if (obsidianUri) {
      window.location.href = obsidianUri;
    }
  };

  const handleCopyUri = async () => {
    try {
      await navigator.clipboard.writeText(obsidianUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URI:', error);
    }
  };

  if (!obsidianUri) {
    return null;
  }

  const styles = {
    container: {
      backgroundColor: '#f0f8ff',
      border: '2px solid #7c3aed',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    icon: {
      fontSize: '28px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#7c3aed',
      margin: 0
    },
    description: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    primaryButton: {
      backgroundColor: '#7c3aed',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    secondaryButton: {
      backgroundColor: copied ? '#d4edda' : 'white',
      color: copied ? '#155724' : '#6b7280',
      border: `1px solid ${copied ? '#c3e6cb' : '#d1d5db'}`,
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    uriPreview: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#6c757d',
      marginTop: '12px',
      wordBreak: 'break-all',
      fontFamily: 'monospace'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>🚀</span>
        <h3 style={styles.title}>準備匯入 Obsidian</h3>
      </div>
      
      <p style={styles.description}>
        📝 <strong>{paperTitle}</strong> 的筆記已經準備完成！<br/>
        點擊下方按鈕即可自動在 Obsidian 中創建這份筆記。
      </p>
      
      <div style={styles.buttonGroup}>
        <button
          onClick={handleOpenObsidian}
          style={styles.primaryButton}
          onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
        >
          📚 在 Obsidian 中開啟
        </button>
        
        <button
          onClick={handleCopyUri}
          style={styles.secondaryButton}
        >
          {copied ? '✅ 已複製' : '🔗 複製 URI'}
        </button>
      </div>
      
      <div style={styles.uriPreview}>
        {obsidianUri}
      </div>
    </div>
  );
};

export default ObsidianResult;