import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSession, deleteSession as deleteSessionAPI } from '../../api/sessions';
import { showSuccess, showError } from '../../utils/toast';
import useSessionStore from '../../stores/useSessionStore';
import { STORAGE_KEYS } from '../../utils/constants';
import { getStorageItem, setStorageItem } from '../../utils/storage';

/**
 * Mutation to create a new session
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { setCurrentSessionId, updateChatHistory } = useSessionStore();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await createSession();
        return response.session_id;
      } catch (error) {
        console.error('Error creating session:', error);
        // Fallback to local session creation
        const newId = Math.random().toString(36).substr(2, 9);
        setStorageItem(STORAGE_KEYS.SESSION_ID, newId);
        return newId;
      }
    },
    onSuccess: (sessionId) => {
      setCurrentSessionId(sessionId);
      updateChatHistory(sessionId, 'New Conversation');
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
  });
};

/**
 * Query for chat history list
 */
export const useChatHistory = () => {
  const { chatHistory } = useSessionStore();

  return useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => {
      // Load from localStorage for backward compatibility
      const stored = getStorageItem(STORAGE_KEYS.CHAT_HISTORY, []);
      return stored.length > 0 ? stored : chatHistory;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: chatHistory,
  });
};

/**
 * Mutation to delete a session
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  const { currentSessionId, setChatHistory, chatHistory } = useSessionStore();
  const createSessionMutation = useCreateSession();

  return useMutation({
    mutationFn: async (sessionId) => {
      try {
        await deleteSessionAPI(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
        // Continue with local deletion even if API fails
      }
      return sessionId;
    },
    onSuccess: async (sessionId) => {
      // Remove from chat history
      const updated = chatHistory.filter((s) => s.id !== sessionId);
      setChatHistory(updated);
      setStorageItem(STORAGE_KEYS.CHAT_HISTORY, updated);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });

      // If deleting current session, create new one
      if (sessionId === currentSessionId) {
        const newSession = await createSessionMutation.mutateAsync();
        showSuccess('Session deleted. New session created.');
      } else {
        showSuccess('Session deleted');
      }
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to delete session');
    },
  });
};

