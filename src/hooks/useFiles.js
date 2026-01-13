import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { uploadFile } from '../api/files';

/**
 * Hook for file management
 * Handles uploaded files state and operations
 */
export const useFiles = (sessionId) => {
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    return getStorageItem(STORAGE_KEYS.UPLOADED_FILES, []);
  });

  const [isUploading, setIsUploading] = useState(false);

  // Persist uploaded files
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.UPLOADED_FILES, uploadedFiles);
  }, [uploadedFiles]);

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
              url: `/files/${result.filename || file.name}`,
              previewUrl: `/preview/${result.filename || file.name}?v=${Date.now()}`,
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
          url: `/files/${r.result.filename || r.file.name}`,
          previewUrl: `/preview/${r.result.filename || r.file.name}?v=${Date.now()}`,
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
