import apiClient from './index';

/**
 * Get RAG service status
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} RAG status information
 */
export const getRAGStatus = async (sessionId) => {
  const response = await apiClient.get('/rag/status', {
    params: { session_id: sessionId }
  });
  return response.data;
};

/**
 * Index a document for RAG
 * @param {string} filename - File name to index
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Indexing result
 */
export const indexDocument = async (filename, sessionId) => {
  const response = await apiClient.post('/rag/index', {
    filename,
    session_id: sessionId
  });
  return response.data;
};

/**
 * Query documents using RAG
 * @param {string} query - Search query
 * @param {string} sessionId - Session identifier
 * @param {number} topK - Number of results (default: 5)
 * @returns {Promise<Object>} Query results
 */
export const queryDocuments = async (query, sessionId, topK = 5) => {
  const response = await apiClient.post('/rag/query', {
    query,
    session_id: sessionId,
    top_k: topK
  });
  return response.data;
};

/**
 * Remove a document from RAG index
 * @param {string} filename - File name to remove
 * @param {string} sessionId - Session identifier
 * @returns {Promise<void>}
 */
export const removeDocument = async (filename, sessionId) => {
  await apiClient.post('/rag/remove', {
    filename,
    session_id: sessionId
  });
};
