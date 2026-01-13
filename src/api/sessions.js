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
