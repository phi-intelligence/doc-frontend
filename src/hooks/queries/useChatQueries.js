import { useMutation } from '@tanstack/react-query';
import { sendMessage as sendMessageAPI, batchProcess as batchProcessAPI } from '../../api/chat';
import { showError } from '../../utils/toast';

/**
 * Mutation to send a chat message
 */
export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({
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
    }) =>
      sendMessageAPI(
        message,
        files,
        sessionId,
        activeFile,
        currentPage,
        connectors,
        signal,
        skillHint,
        templateId,
        webUrls,
        webModeEnabled
      ),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to send message';
      showError(errorMessage);
    },
  });
};

/**
 * Mutation for batch processing
 */
export const useBatchProcess = () => {
  return useMutation({
    mutationFn: ({ message, uploadedFiles, sessionId }) =>
      batchProcessAPI(message, uploadedFiles, sessionId),
    onError: (error) => {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Batch processing failed';
      showError(errorMessage);
    },
  });
};

