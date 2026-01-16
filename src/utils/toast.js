import { toast } from 'react-toastify';

/**
 * Show success toast notification
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
  });
};

/**
 * Show error toast notification
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
  });
};

/**
 * Show info toast notification
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
  });
};

/**
 * Show warning toast notification
 * @param {string} message - Warning message
 */
export const showWarning = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
  });
};

