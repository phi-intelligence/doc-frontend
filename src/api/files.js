import apiClient from './index';
import { API_BASE } from '../utils/constants';

/**
 * Upload a file to the server
 * @param {File} file - File to upload
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with filename
 */
export const uploadFile = async (file, sessionId) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/upload?session_id=${sessionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Upload multiple files
 * @param {Array<File>} files - Files to upload
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadFiles = async (files, sessionId) => {
  const results = [];
  for (const file of files) {
    try {
      const result = await uploadFile(file, sessionId);
      results.push({ success: true, file, result });
    } catch (error) {
      results.push({
        success: false,
        file,
        error: error.response?.data?.detail || error.message
      });
    }
  }
  return results;
};

/**
 * Get file download URL
 * @param {string} filename - File name
 * @returns {string} File URL
 */
export const getFileUrl = (filename) => {
  return `${API_BASE}/files/${filename}`;
};

/**
 * Get file preview URL
 * @param {string} filename - File name
 * @param {boolean} cacheBust - Add cache-busting query param
 * @returns {string} Preview URL
 */
export const getPreviewUrl = (filename, cacheBust = true) => {
  const url = `${API_BASE}/preview/${filename}`;
  return cacheBust ? `${url}?v=${Date.now()}` : url;
};

/**
 * Get file metadata
 * @param {string} filename - File name
 * @returns {Promise<Object>} File metadata
 */
export const getFileMetadata = async (filename) => {
  const response = await apiClient.get(`/files/${filename}/metadata`);
  return response.data;
};

/**
 * List all artifacts
 * @returns {Promise<Array>} List of artifacts
 */
export const listArtifacts = async () => {
  const response = await apiClient.get('/artifacts');
  return response.data;
};

/**
 * Clear all artifacts
 * @returns {Promise<void>}
 */
export const clearArtifacts = async () => {
  await apiClient.delete('/artifacts');
};

/**
 * Clear all uploads
 * @returns {Promise<void>}
 */
export const clearUploads = async () => {
  await apiClient.delete('/uploads');
};

/**
 * Enhance document with images
 * @param {string} filename - Original file name
 * @param {string} sessionId - Session identifier
 * @param {string} imageStyle - Image style (default: 'professional')
 * @returns {Promise<Object>} Response with enhanced filename
 */
export const enhanceWithImages = async (filename, sessionId, imageStyle = 'professional') => {
  const response = await apiClient.post('/enhance-with-images', {
    filename,
    session_id: sessionId,
    image_style: imageStyle
  });
  return response.data;
};
