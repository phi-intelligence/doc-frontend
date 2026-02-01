import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { saveSessionData, loadSessionData, deleteSessionData, getStorageItem, setStorageItem } from '../utils/storage';
import { createSession, deleteSession as deleteSessionAPI, listSessions } from '../api/sessions';

/**
 * Hook for session management
 * Handles session creation, selection, deletion, and data persistence
 */
export const useSession = () => {
  const [sessionId, setSessionId] = useState(() => {
    const saved = getStorageItem(STORAGE_KEYS.SESSION_ID);
    if (saved) return saved;
    const newId = Math.random().toString(36).substr(2, 9);
    setStorageItem(STORAGE_KEYS.SESSION_ID, newId);
    return newId;
  });

  const [chatHistory, setChatHistory] = useState(() => {
    return getStorageItem(STORAGE_KEYS.CHAT_HISTORY, []);
  });

  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      const response = await createSession();
      const newId = response.session_id;
      setStorageItem(STORAGE_KEYS.SESSION_ID, newId);
      setSessionId(newId);
      return newId;
    } catch (error) {
      console.error('Error creating new session:', error);
      // Fallback to local session creation
      const newId = Math.random().toString(36).substr(2, 9);
      setStorageItem(STORAGE_KEYS.SESSION_ID, newId);
      setSessionId(newId);
      return newId;
    }
  }, []);

  // Select a session
  const selectSession = useCallback((selectedId) => {
    if (selectedId === sessionId) return;

    // Load selected session data from per-session storage
    const sessionData = loadSessionData(selectedId);

    // Update session ID
    setStorageItem(STORAGE_KEYS.SESSION_ID, selectedId);
    setSessionId(selectedId);

    return sessionData;
  }, [sessionId]);

  // Delete a session
  const deleteSession = useCallback(async (deleteId) => {
    try {
      await deleteSessionAPI(deleteId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }

    // Remove from chat history
    setChatHistory(prev => prev.filter(s => s.id !== deleteId));

    // Delete session data
    deleteSessionData(deleteId);

    // If deleting current session, create new one
    if (deleteId === sessionId) {
      await createNewSession();
    }
  }, [sessionId, createNewSession]);

  // Update chat history entry
  const updateChatHistory = useCallback((sessionId, title) => {
    setChatHistory(prev => {
      const existing = prev.find(s => s.id === sessionId);
      if (existing) {
        return prev.map(s => s.id === sessionId
          ? { ...s, title, timestamp: Date.now() }
          : s
        );
      } else {
        return [{ id: sessionId, title, timestamp: Date.now() }, ...prev];
      }
    });
  }, []);

  // Fetch sessions from backend
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await listSessions();
      if (response.sessions && Array.isArray(response.sessions)) {
        // Transform backend format to frontend format
        const sessions = response.sessions.map(s => ({
          id: s.id,
          title: s.title || 'New Conversation',
          timestamp: s.last_updated ? new Date(s.last_updated).getTime() : Date.now(),
          messageCount: s.message_count || 0,
          fileCount: s.file_count || 0,
        }));
        setChatHistory(sessions);
        return sessions;
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fall back to local storage
    } finally {
      setIsLoadingSessions(false);
    }
    return chatHistory;
  }, [chatHistory]);

  // Persist chat history
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
  }, [chatHistory]);

  return {
    sessionId,
    chatHistory,
    isLoadingSessions,
    createNewSession,
    selectSession,
    deleteSession,
    updateChatHistory,
    setChatHistory,
    fetchSessions,
  };
};
