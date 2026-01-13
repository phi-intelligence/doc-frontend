import { STORAGE_KEYS } from './constants';

/**
 * Generate a session-specific storage key
 * @param {string} sessionId - Session identifier
 * @param {string} type - Data type (e.g., 'cards', 'files')
 * @returns {string} Storage key
 */
export const getSessionKey = (sessionId, type) => `docflies_session_${sessionId}_${type}`;

/**
 * Save session-specific data to localStorage
 * @param {string} sessionId - Session identifier
 * @param {Array} processCards - Process cards data
 * @param {Array} allFiles - All files data
 */
export const saveSessionData = (sessionId, processCards, allFiles) => {
  try {
    localStorage.setItem(getSessionKey(sessionId, 'cards'), JSON.stringify(processCards));
    localStorage.setItem(getSessionKey(sessionId, 'files'), JSON.stringify(allFiles));
  } catch (e) {
    console.warn('Failed to save session data:', e);
  }
};

/**
 * Load session-specific data from localStorage
 * @param {string} sessionId - Session identifier
 * @returns {{processCards: Array, allFiles: Array}} Session data
 */
export const loadSessionData = (sessionId) => {
  try {
    const cards = localStorage.getItem(getSessionKey(sessionId, 'cards'));
    const files = localStorage.getItem(getSessionKey(sessionId, 'files'));
    return {
      processCards: cards ? JSON.parse(cards) : [],
      allFiles: files ? JSON.parse(files) : []
    };
  } catch (e) {
    console.warn('Failed to load session data:', e);
    return { processCards: [], allFiles: [] };
  }
};

/**
 * Delete session-specific data from localStorage
 * @param {string} sessionId - Session identifier
 */
export const deleteSessionData = (sessionId) => {
  try {
    localStorage.removeItem(getSessionKey(sessionId, 'cards'));
    localStorage.removeItem(getSessionKey(sessionId, 'files'));
  } catch (e) {
    console.warn('Failed to delete session data:', e);
  }
};

/**
 * Get a value from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Failed to get storage item ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Set a value in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to set storage item ${key}:`, e);
  }
};

/**
 * Remove a value from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove storage item ${key}:`, e);
  }
};

export { STORAGE_KEYS };
