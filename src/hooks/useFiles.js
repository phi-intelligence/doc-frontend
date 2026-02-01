import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getSessionKey, getStorageItem, setStorageItem } from '../utils/storage';
import { uploadFile, getFileUrl, getPreviewUrl } from '../api/files';

/**
 * Hook for file management
 * Handles uploaded files state and operations
 */
export const useFiles = (sessionId) => {
  const sessionUploadsKey = sessionId ? getSessionKey(sessionId, 'uploads') : null;

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    // Session-scoped uploads - only load files for THIS session
    if (sessionUploadsKey) {
      const sessionFiles = getStorageItem(sessionUploadsKey, null);
      if (Array.isArray(sessionFiles)) return sessionFiles;
    }
    // New sessions start with empty uploads
    return [];
  });

  const [isUploading, setIsUploading] = useState(false);

  // Persist uploaded files
  useEffect(() => {
    if (sessionUploadsKey) {
      setStorageItem(sessionUploadsKey, uploadedFiles);
    } else {
      // fallback (should be rare)
      setStorageItem(STORAGE_KEYS.UPLOADED_FILES, uploadedFiles);
    }
  }, [uploadedFiles]);

  // On session change, load uploads for that session only
  useEffect(() => {
    if (!sessionUploadsKey) return;
    const sessionFiles = getStorageItem(sessionUploadsKey, null);
    if (Array.isArray(sessionFiles)) {
      setUploadedFiles(sessionFiles);
    } else {
      // New sessions start with empty uploads - no legacy migration
      setUploadedFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUploadsKey]);

  // Upload files
  const uploadFiles = async (files) => {
    setIsUploading(true);
    const results = [];
    
    try {
      for (const file of files) {
        try {
          const result = await uploadFile(file, sessionId);
            results.push({
            success: true,
            file,
            result: {
              filename: result.filename || file.name,
              type: (result.filename || file.name).split('.').pop().toUpperCase(),
              url: getFileUrl(result.filename || file.name),
              previewUrl: getPreviewUrl(result.filename || file.name),
              isOutput: false,
              uploadedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          results.push({
            success: false,
            file,
            error: error.response?.data?.detail || error.message
          });
        }
      }

      const successful = results
        .filter(r => r.success)
        .map(r => ({
          filename: r.result.filename || r.file.name,
          type: (r.result.filename || r.file.name).split('.').pop().toUpperCase(),
          url: getFileUrl(r.result.filename || r.file.name),
          previewUrl: getPreviewUrl(r.result.filename || r.file.name),
          isOutput: false,
          uploadedAt: new Date().toISOString()
        }));

      if (successful.length > 0) {
        setUploadedFiles(prev => [...prev, ...successful]);
      }

      return {
        successful,
        errors: results.filter(r => !r.success).map(r => r.error)
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        successful: [],
        errors: [error.message]
      };
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file
  const removeFile = (filename) => {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename));
  };

  // Clear all files
  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    clearFiles,
    setUploadedFiles
  };
};
