import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownPreview = ({ content, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy markdown:', error);
    }
  };

  const handleOpenObsidian = (obsidianUri) => {
    if (obsidianUri) {
      window.location.href = obsidianUri;
    }
  };

  const markdownStyles = {
    container: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '12px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#495057',
      margin: 0
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px'
    },
    button: {
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    copyButton: {
      backgroundColor: copied ? '#d4edda' : '#ffffff',
      borderColor: copied ? '#c3e6cb' : '#6c757d',
      color: copied ? '#155724' : '#6c757d'
    },
    obsidianButton: {
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed',
      color: 'white'
    },
    content: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      padding: '16px',
      maxHeight: '400px',
      overflowY: 'auto'
    },
    markdown: {
      lineHeight: '1.6',
      color: '#333'
    }
  };

  return (
    <div style={markdownStyles.container}>
      <div style={markdownStyles.header}>
        <h3 style={markdownStyles.title}>📋 Markdown 預覽</h3>
        <div style={markdownStyles.buttonGroup}>
          <button
            onClick={handleCopyMarkdown}
            style={{
              ...markdownStyles.button,
              ...markdownStyles.copyButton
            }}
          >
            {copied ? '✅ 已複製' : '📋 複製 Markdown'}
          </button>
        </div>
      </div>
      
      <div style={markdownStyles.content}>
        <ReactMarkdown style={markdownStyles.markdown}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreview;