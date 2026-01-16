import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Session Store - Manages current session ID and chat history
 * Persisted to localStorage
 */
const useSessionStore = create(
  persist(
    (set, get) => ({
      // Current session ID
      currentSessionId: null,
      setCurrentSessionId: (id) => {
        set({ currentSessionId: id });
        // Also update localStorage directly for backward compatibility
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
          } catch (e) {
            console.warn('Failed to persist session ID:', e);
          }
        }
      },

      // Chat history (list of sessions)
      chatHistory: [],
      setChatHistory: (history) => set({ chatHistory: history }),
      updateChatHistory: (sessionId, title) => {
        set((state) => {
          const existing = state.chatHistory.find((s) => s.id === sessionId);
          if (existing) {
            return {
              chatHistory: state.chatHistory.map((s) =>
                s.id === sessionId
                  ? { ...s, title, timestamp: Date.now() }
                  : s
              ),
            };
          } else {
            return {
              chatHistory: [{ id: sessionId, title, timestamp: Date.now() }, ...state.chatHistory],
            };
          }
        });
      },
    }),
    {
      name: 'docflies-session-store',
    }
  )
);

export default useSessionStore;

