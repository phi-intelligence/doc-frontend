import apiClient from './index';
import { API_BASE } from '../utils/constants';

/**
 * Send a chat message to the backend
 * @param {string} message - User's message
 * @param {Array} files - Array of filenames being referenced
 * @param {string} sessionId - Current session ID
 * @param {string} activeFile - Currently active file in preview
 * @param {number} currentPage - Current page number (for PDFs/presentations)
 * @param {Array} connectors - Active connectors (Gmail, Drive, etc.)
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @param {string|null} skillHint - Pre-selected skill from URL (bypasses LLM skill selection)
 * @param {string|null} templateId - Selected template ID
 * @param {Array} webUrls - URLs to scrape for web mode
 * @param {boolean} webModeEnabled - Whether web scraping mode is enabled
 */
export async function sendMessage(
  message,
  files = [],
  sessionId,
  activeFile = null,
  currentPage = 1,
  connectors = [],
  signal = null,
  skillHint = null,
  templateId = null,
  webUrls = [],
  webModeEnabled = false,
  demoMode = null
) {
  const response = await apiClient.post('/chat', {
    message,
    session_id: sessionId,
    context_files: files,
    active_document: activeFile,
    current_page: currentPage,
    integrations: Array.isArray(connectors) ? null : (connectors || null),
    skill_hint: skillHint,
    template_id: templateId,
    web_urls: webUrls,
    web_mode_enabled: webModeEnabled,
    demo_mode: demoMode
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
