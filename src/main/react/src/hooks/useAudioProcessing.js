import { useState, useCallback } from 'react';
import { uploadAudioFile, startProcessing, getProcessingResults } from '../services/apiService';

export const useAudioProcessing = ({ onSessionCreated, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadFile = useCallback(async (file, paperTitle) => {
    if (!file || !paperTitle.trim()) {
      onError?.('請提供檔案和論文標題');
      return;
    }

    setIsUploading(true);
    try {
      // Validate file size
      const maxSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxSize) {
        throw new Error(`檔案過大，最大支援 30MB，目前檔案大小：${(file.size / 1024 / 1024).toFixed(1)}MB`);
      }

      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/flac', 'audio/ogg'];
      const allowedExtensions = ['.mp3', '.m4a', '.wav', '.mp4', '.flac', '.ogg'];
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        throw new Error('不支援的檔案格式。請使用 MP3, M4A, WAV, MP4, FLAC 或 OGG 格式');
      }

      const result = await uploadAudioFile(file, paperTitle);
      
      if (result.session_id) {
        onSessionCreated?.(result.session_id);
      } else {
        throw new Error('上傳失敗：未收到會話 ID');
      }

    } catch (error) {
      console.error('File upload error:', error);
      onError?.(error.message || '檔案上傳失敗');
    } finally {
      setIsUploading(false);
    }
  }, [onSessionCreated, onError]);

  const processAudio = useCallback(async (sessionId) => {
    if (!sessionId) {
      onError?.('無效的會話 ID');
      return;
    }

    setIsProcessing(true);
    try {
      await startProcessing(sessionId);
      // Processing status will be handled by WebSocket
    } catch (error) {
      console.error('Processing error:', error);
      onError?.(error.message || '處理失敗');
      setIsProcessing(false); // Only reset on error
    }
    // Don't reset isProcessing here - let WebSocket handle completion
  }, [onError]);

  const getResults = useCallback(async (sessionId) => {
    if (!sessionId) {
      throw new Error('無效的會話 ID');
    }

    try {
      const results = await getProcessingResults(sessionId);
      return results;
    } catch (error) {
      console.error('Get results error:', error);
      throw new Error(error.message || '獲取結果失敗');
    }
  }, []);

  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  // Utility function to format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  // Utility function to validate audio file
  const validateAudioFile = useCallback((file) => {
    const errors = [];
    
    if (!file) {
      errors.push('請選擇檔案');
      return errors;
    }

    // Check file size
    const maxSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSize) {
      errors.push(`檔案過大，最大支援 30MB，目前：${formatFileSize(file.size)}`);
    }

    // Check file type
    const allowedExtensions = ['.mp3', '.m4a', '.wav', '.mp4', '.flac', '.ogg'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`不支援的檔案格式：${fileExtension}。支援格式：${allowedExtensions.join(', ')}`);
    }

    return errors;
  }, [formatFileSize]);

  return {
    uploadFile,
    processAudio,
    getResults,
    resetProcessing,
    isUploading,
    isProcessing,
    validateAudioFile,
    formatFileSize
  };
};