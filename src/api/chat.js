import apiClient from './index';
import { API_BASE } from '../utils/constants';

/**
 * Send a chat message to the backend
 * @param {string} message - User message
 * @param {Array<string>} contextFiles - Context file names
 * @param {string} sessionId - Session identifier
 * @param {string|null} activeDocument - Active document filename
 * @param {number|null} currentPage - Current page number
 * @param {Object|null} integrations - Connect integrations state {drive: bool, gmail: bool}
 * @param {AbortSignal|null} signal - AbortController signal for request cancellation
 * @returns {Promise<Object>} Response with message and artifacts
 */
export const sendMessage = async (message, contextFiles = [], sessionId, activeDocument = null, currentPage = null, integrations = null, signal = null) => {
  const response = await apiClient.post('/chat', {
    message,
    context_files: contextFiles,
    session_id: sessionId,
    active_document: activeDocument,
    current_page: currentPage,
    integrations: integrations
  }, {
    signal: signal
  });
  return response.data;
};

/**
 * Process multiple files with the same query (batch processing)
 * @param {string} message - User message/query
 * @param {Array<string>} uploadedFiles - List of file names to process
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with results
 */
export const batchProcess = async (message, uploadedFiles, sessionId) => {
  const response = await apiClient.post('/chat/batch', {
    message,
    context_files: uploadedFiles,
    session_id: sessionId
  });
  return response.data;
};

/**
 * Get progress stream URL for SSE connection
 * @param {string} sessionId - Session identifier
 * @returns {string} SSE endpoint URL
 */
export const getProgressStreamUrl = (sessionId) => {
  return `${API_BASE}/api/stream/${sessionId}`;
};
