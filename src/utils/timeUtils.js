/**
 * Get a relative time string from a timestamp
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string (e.g., "5m ago", "2h ago", "Yesterday")
 */
export const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Format a timestamp to a readable date string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return new Date(timestamp).toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format a timestamp to a readable date and time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
