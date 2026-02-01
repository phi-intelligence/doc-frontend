import apiClient from './index';

/**
 * Create a new session
 * @returns {Promise<Object>} Response with session_id
 */
export const createSession = async () => {
  const response = await apiClient.post('/session/new');
  return response.data;
};

/**
 * Delete a session
 * @param {string} sessionId - Session identifier
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId) => {
  await apiClient.delete(`/session/${sessionId}`);
};

/**
 * List all sessions with metadata
 * @returns {Promise<Object>} Response with sessions array and total count
 */
export const listSessions = async () => {
  const response = await apiClient.get('/session/list');
  return response.data;
};

/**
 * Get session history and operations
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with operations, files, etc.
 */
export const getSessionHistory = async (sessionId) => {
  const response = await apiClient.get(`/session/${sessionId}/history`);
  return response.data;
};
