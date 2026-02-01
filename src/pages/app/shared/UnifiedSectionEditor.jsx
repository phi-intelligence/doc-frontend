import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MessageSquarePlus, PanelLeftClose, PanelLeft, Globe } from 'lucide-react';
import { useSession } from '../../../hooks/useSession';
import { useFiles } from '../../../hooks/useFiles';
import { useArtifacts } from '../../../hooks/useArtifacts';
import { useProgressStream } from '../../../hooks/useProgressStream';
import { sendMessage } from '../../../api/chat';
import { getFileUrl, getPreviewUrl, listSessionArtifacts } from '../../../api/files';
import { saveSessionData, loadSessionData, getStorageItem } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../utils/constants';
import FileUploadSidebar from '../../../components/shared/FileUploadSidebar';
import DocumentViewer from '../../../components/shared/DocumentViewer';
import AIChatSidebar from '../../../components/shared/AIChatSidebar';
import ChatHistorySidebar from '../../../components/layout/ChatHistorySidebar';

/**
 * UnifiedSectionEditor - 3-pane editor for all section-based workflows.
 *
 * Props:
 *   sectionName: Display name (e.g. "Human Resources", "Document Chat")
 *   sectionKey: Key for demoMode/skillHint (e.g. "hr", "finance", "legal", "general")
 *   suggestions: Array of prompt suggestions
 *   backTo: Path for back button (e.g. "/app/hr")
 *   initialFiles: Array of files to pre-load
 *   templateId: Template ID to use (from URL or parent)
 *   initialMessage: Message to send on mount (optional)
 *   employee: Employee context (HR workflows) - DEPRECATED, use moduleContext instead
 *   skillHint: Skill hint override (defaults to sectionKey)
 *   moduleContext: Module-specific context for AI responses
 *     - employee: {id, name, email, title, department} for HR
 *     - contract: {id, parties, type, status} for Legal
 *     - campaign: {id, name, status} for Marketing
 *     - budgetId: string for Finance
 *     - entityType: 'hr' | 'finance' | 'legal' | 'marketing'
 */
export default function UnifiedSectionEditor({
  sectionName = 'Document Editor',
  sectionKey = 'general',
  suggestions = [],
  backTo = '/app/dashboard',
  initialFiles = [],
  templateId: initialTemplateId = null,
  initialMessage = null,
  employee = null,
  skillHint = null,
  onBack = null,
  moduleContext = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionId, 
    chatHistory, 
    isLoadingSessions,
    createNewSession, 
    selectSession, 
    deleteSession,
    fetchSessions,
    updateChatHistory,
  } = useSession();
  const { uploadedFiles, isUploading, uploadFiles, removeFile, setUploadedFiles } = useFiles(sessionId);
  const {
    outputArtifacts,
    activeArtifact,
    artifactContent,
    previewLoading,
    documentPreviewLoading,
    videoLoadError,
    currentPage,
    totalPages,
    selectArtifact,
    addArtifacts,
    removeArtifact,
    setCurrentPage,
    setDocumentPreviewLoading,
    setVideoLoadError,
    setOutputArtifacts,
  } = useArtifacts();
  const { items: progressItems, isConnected, clear: clearProgress } = useProgressStream(sessionId);

  // State
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [processCards, setProcessCards] = useState(() => {
    // Initialize from session storage if available
    const currentSessionId = getStorageItem(STORAGE_KEYS.SESSION_ID);
    if (currentSessionId) {
      const sessionData = loadSessionData(currentSessionId);
      return sessionData?.processCards || [];
    }
    return [];
  });
  const [enhancementCards, setEnhancementCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webModeEnabled, setWebModeEnabled] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Chat history sidebar state
  const [historyCollapsed, setHistoryCollapsed] = useState(() => {
    return localStorage.getItem('editor_history_collapsed') === 'true';
  });

  // Resize state for resizable panels
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('editor_left_sidebar_width') || '288', 10);
  });
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('editor_right_sidebar_width') || '420', 10);
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const abortControllerRef = useRef(null);
  const initialMessageSentRef = useRef(false);
  const demoMode = sectionKey !== 'general' ? sectionKey : null;

  // Compute final module context (merge legacy employee prop with moduleContext)
  const finalModuleContext = useMemo(() => {
    // If moduleContext is provided, use it directly
    if (moduleContext) {
      return moduleContext;
    }
    // Legacy support: if employee prop is provided, wrap it in moduleContext structure
    if (employee) {
      return {
        employee,
        entityType: 'hr'
      };
    }
    // If we have a demoMode, include entityType even without specific context
    if (demoMode) {
      return {
        entityType: demoMode
      };
    }
    return null;
  }, [moduleContext, employee, demoMode]);

  // Merge uploaded + output documents
  const allDocuments = useMemo(() => {
    return [...uploadedFiles, ...outputArtifacts];
  }, [uploadedFiles, outputArtifacts]);

  // Pre-load initialFiles on mount
  useEffect(() => {
    if (initialFiles.length > 0 && uploadedFiles.length === 0) {
      setUploadedFiles(initialFiles);
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Persist session data when processCards or documents change
  useEffect(() => {
    if (!sessionId) return;
    saveSessionData(sessionId, processCards, allDocuments);
    
    // Update chat history title based on first query
    if (processCards.length > 0 && processCards[0]?.query) {
      updateChatHistory(sessionId, processCards[0].query);
    }
  }, [sessionId, processCards, allDocuments, updateChatHistory]);

  // Load session artifacts on mount and when sessionId changes
  // This ensures proper session isolation - each session shows only its own files
  useEffect(() => {
    if (!sessionId) return;
    
    // Skip if we have initialFiles (they'll be loaded separately)
    if (initialFiles.length > 0) return;
    
    // Skip if we already have artifacts loaded (e.g., from creating a document)
    if (outputArtifacts.length > 0) return;
    
    // Load session files from backend
    (async () => {
      try {
        const response = await listSessionArtifacts(sessionId);
        if (response.artifacts && response.artifacts.length > 0) {
          const artifacts = response.artifacts.map(f => ({
            filename: f.filename,
            type: f.type || f.filename.split('.').pop().toUpperCase(),
            url: getFileUrl(f.filename),
            previewUrl: getPreviewUrl(f.filename),
            isOutput: true,
            isPending: false,
            size: f.size,
            modified: f.modified,
          }));
          setOutputArtifacts(artifacts);
        }
      } catch (error) {
        console.error('Failed to load initial session files:', error);
      }
    })();
  }, [sessionId]); // Only depend on sessionId to avoid infinite loops

  // Persist history collapsed state
  useEffect(() => {
    localStorage.setItem('editor_history_collapsed', historyCollapsed.toString());
  }, [historyCollapsed]);

  // Handle returned file from workspace (Collabora editor)
  useEffect(() => {
    const savedFile = location.state?.savedFile;
    const returnedFile = location.state?.returnedFile;
    const filename = savedFile || returnedFile;

    if (filename) {
      // Find file in artifacts or uploads
      const allDocs = [...outputArtifacts, ...uploadedFiles];
      const file = allDocs.find(f => f.filename === filename);
      
      if (file) {
        // Refresh preview URL and select the file
        const freshFile = { ...file, previewUrl: getPreviewUrl(filename) };
        selectArtifact(freshFile);
        // Clear state to prevent re-triggering on subsequent renders
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        // File not found locally - fetch from backend and select
        (async () => {
          try {
            const response = await listSessionArtifacts(sessionId);
            if (response.artifacts && response.artifacts.length > 0) {
              // Transform backend format to frontend artifact format
              const artifacts = response.artifacts.map(f => ({
                filename: f.filename,
                type: f.type || f.filename.split('.').pop().toUpperCase(),
                url: getFileUrl(f.filename),
                previewUrl: getPreviewUrl(f.filename),
                isOutput: true,
                isPending: false,
                size: f.size,
                modified: f.modified,
              }));
              setOutputArtifacts(artifacts);
              
              // Find and select the returned file
              const targetFile = artifacts.find(f => f.filename === filename);
              if (targetFile) {
                selectArtifact({ ...targetFile, previewUrl: getPreviewUrl(filename) });
              }
            }
          } catch (error) {
            console.error('Failed to load session files after workspace return:', error);
          } finally {
            // Clear state to prevent re-triggering on subsequent renders
            navigate(location.pathname, { replace: true, state: {} });
          }
        })();
      }
    }
  }, [location.state, outputArtifacts, uploadedFiles, selectArtifact, navigate, location.pathname, sessionId, setOutputArtifacts]);

  // Send initial message on mount (once)
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current && sessionId) {
      initialMessageSentRef.current = true;
      handleSendMessage(initialMessage, [], null, templateId);
    }
  }, [initialMessage, sessionId]);

  // Transform progress items into process cards
  useEffect(() => {
    if (progressItems.length === 0) return;

    setProcessCards((prev) => {
      // Find or create the current card (last one that's still running)
      let cards = [...prev];
      let currentCard = cards.find((c) => c.status === 'running');

      if (!currentCard) {
        // Create new card for this response
        currentCard = {
          id: `card-${Date.now()}`,
          query: '',
          steps: [],
          artifacts: [],
          finalResult: null,
          status: 'running',
          isCollapsed: false,
        };
        cards.push(currentCard);
      }

      // Update steps from progress items
      const steps = progressItems
        .filter((item) => ['step_start', 'step_complete', 'progress', 'code_start', 'code_output', 'thought'].includes(item.type))
        .map((item) => ({
          id: item.id,
          title: item.title || item.type,
          status: item.status || 'running',
          type: item.type,
          output: item.output,
          content: item.content,
          duration: item.duration,
          language: item.language,
          children: item.children,
          content_snippets: item.content_snippets,
        }));

      // Extract artifacts from file_created events
      const artifacts = progressItems
        .filter((item) => item.type === 'file_created')
        .map((item) => ({
          filename: item.filename,
          type: item.filename.split('.').pop().toUpperCase(),
          url: getFileUrl(item.filename),
          previewUrl: getPreviewUrl(item.filename),
          isOutput: true,
          isPending: false,
          createdAt: new Date().toISOString(),
        }));

      // Check for completion
      const messageEvent = progressItems.find((item) => item.type === 'message');
      const errorEvent = progressItems.find((item) => item.type === 'error');
      const isComplete = messageEvent || errorEvent;

      currentCard.steps = steps;
      currentCard.artifacts = artifacts;
      currentCard.status = isComplete ? (errorEvent ? 'error' : 'complete') : 'running';
      currentCard.finalResult = messageEvent?.content || null;

      // Add new artifacts to output artifacts
      if (artifacts.length > 0) {
        addArtifacts(artifacts);
        // Auto-select newest artifact
        if (artifacts.length > 0 && !activeArtifact) {
          selectArtifact(artifacts[artifacts.length - 1]);
        }
      }

      // Update the card in the array
      const cardIndex = cards.findIndex((c) => c.id === currentCard.id);
      if (cardIndex >= 0) {
        cards[cardIndex] = currentCard;
      }

      return cards;
    });

    // Update processing state
    const isStillProcessing = progressItems.some(
      (item) => item.status === 'running' || (item.type === 'step_start' && item.status !== 'complete' && item.status !== 'error')
    );
    setIsProcessing(isStillProcessing);
  }, [progressItems]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (message, contextFiles = [], signal = null, templateIdOverride = null) => {
      if (!message.trim() && !templateIdOverride) return;

      // Create abort controller if not provided
      if (!signal) {
        abortControllerRef.current = new AbortController();
        signal = abortControllerRef.current.signal;
      }

      setIsProcessing(true);
      clearProgress();

      // Create new process card for this message
      const newCard = {
        id: `card-${Date.now()}`,
        query: message,
        steps: [],
        artifacts: [],
        finalResult: null,
        status: 'running',
        isCollapsed: false,
      };
      setProcessCards((prev) => [...prev, newCard]);

      try {
        // Get all file names for context
        const allFileNames = [
          ...uploadedFiles.map((f) => f.filename),
          ...(contextFiles || []).map((f) => (typeof f === 'string' ? f : f.filename)),
        ];

        await sendMessage(
          message,
          allFileNames,
          sessionId,
          activeArtifact?.filename || null,
          currentPage,
          [],
          signal,
          skillHint || sectionKey,
          templateIdOverride || templateId,
          [],
          webModeEnabled,
          demoMode,
          finalModuleContext
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Send message error:', error);
          setProcessCards((prev) =>
            prev.map((c) =>
              c.id === newCard.id
                ? { ...c, status: 'error', finalResult: error.message || 'An error occurred' }
                : c
            )
          );
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      sessionId,
      uploadedFiles,
      activeArtifact,
      currentPage,
      skillHint,
      sectionKey,
      templateId,
      webModeEnabled,
      demoMode,
      finalModuleContext,
      clearProgress,
    ]
  );

  // Stop generation
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  // Retry handler
  const handleRetry = useCallback(
    (query) => {
      handleSendMessage(query);
    },
    [handleSendMessage]
  );

  // File removal
  const handleRemoveFile = useCallback(
    (file, isUpload) => {
      if (isUpload) {
        removeFile(file.filename);
      } else {
        removeArtifact(file.filename);
      }
    },
    [removeFile, removeArtifact]
  );

  // Preview handler
  const handlePreview = useCallback(
    (doc) => {
      selectArtifact(doc);
    },
    [selectArtifact]
  );

  // Clear template
  const handleClearTemplate = useCallback(() => {
    setTemplateId(null);
  }, []);

  // Toggle web mode
  const handleToggleWebMode = useCallback(() => {
    setWebModeEnabled((prev) => !prev);
  }, []);

  // Back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(backTo);
    }
  }, [onBack, navigate, backTo]);

  // Enhance with images placeholder
  const handleEnhanceWithImages = useCallback(async () => {
    if (!activeArtifact || isEnhancing) return;
    setIsEnhancing(true);
    try {
      // TODO: Implement image enhancement
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsEnhancing(false);
    }
  }, [activeArtifact, isEnhancing]);

  // Open workspace canvas with return navigation
  const handleOpenCanvas = useCallback((artifact) => {
    navigate('/editor', {
      state: {
        file: artifact,
        returnTo: window.location.pathname, // Return to current editor route
        sessionId: sessionId, // Pass current session ID for proper file association
      }
    });
  }, [navigate, sessionId]);

  // New chat handler
  const handleNewChat = useCallback(async () => {
    // Save current session data before switching
    if (sessionId && processCards.length > 0) {
      saveSessionData(sessionId, processCards, allDocuments);
    }
    
    // Clear all state including activeArtifact
    setProcessCards([]);
    clearProgress();
    setOutputArtifacts([]);
    setUploadedFiles([]);
    selectArtifact(null); // Clear active document
    
    // Create new session
    await createNewSession();
    // Refresh sessions list
    fetchSessions();
  }, [sessionId, processCards, allDocuments, createNewSession, clearProgress, 
      setOutputArtifacts, setUploadedFiles, selectArtifact, fetchSessions]);

  // Select session handler
  const handleSelectSession = useCallback(async (selectedId) => {
    if (selectedId === sessionId) return;
    
    // Save current session data before switching
    if (sessionId && processCards.length > 0) {
      saveSessionData(sessionId, processCards, allDocuments);
    }
    
    // Clear current state
    clearProgress();
    selectArtifact(null); // Clear active document first
    
    // Load session data from localStorage (process cards, etc.)
    const sessionData = loadSessionData(selectedId);
    setProcessCards(sessionData?.processCards || []);
    
    // Select the session (this updates sessionId in useSession)
    selectSession(selectedId);
    
    // Load session files from backend
    try {
      const response = await listSessionArtifacts(selectedId);
      if (response.artifacts && response.artifacts.length > 0) {
        // Transform backend format to frontend artifact format
        const artifacts = response.artifacts.map(f => ({
          filename: f.filename,
          type: f.type || f.filename.split('.').pop().toUpperCase(),
          url: getFileUrl(f.filename),
          previewUrl: getPreviewUrl(f.filename),
          isOutput: true,
          isPending: false,
          size: f.size,
          modified: f.modified,
        }));
        setOutputArtifacts(artifacts);
        
        // Auto-select the first artifact for preview
        if (artifacts.length > 0) {
          selectArtifact(artifacts[0]);
        }
      } else {
        setOutputArtifacts([]);
      }
    } catch (error) {
      console.error('Failed to load session files:', error);
      setOutputArtifacts([]);
    }
  }, [sessionId, processCards, allDocuments, selectSession, clearProgress, 
      setOutputArtifacts, selectArtifact]);

  // Delete session handler
  const handleDeleteSession = useCallback(async (deleteId) => {
    await deleteSession(deleteId);
    // Refresh sessions list
    fetchSessions();
  }, [deleteSession, fetchSessions]);

  // Toggle history sidebar
  const toggleHistorySidebar = useCallback(() => {
    setHistoryCollapsed(prev => !prev);
  }, []);

  // Persist sidebar widths to localStorage
  useEffect(() => {
    localStorage.setItem('editor_left_sidebar_width', leftSidebarWidth.toString());
  }, [leftSidebarWidth]);

  useEffect(() => {
    localStorage.setItem('editor_right_sidebar_width', rightSidebarWidth.toString());
  }, [rightSidebarWidth]);

  // Resize handlers for left sidebar
  const startResizingLeft = useCallback((e) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const stopResizingLeft = useCallback(() => {
    setIsResizingLeft(false);
  }, []);

  const resizeLeft = useCallback((e) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      const minWidth = 200;
      const maxWidth = 500;
      const availableSpace = window.innerWidth - rightSidebarWidth;
      const maxAllowedWidth = Math.max(minWidth, availableSpace - 400);
      
      if (newWidth >= minWidth && newWidth <= Math.min(maxWidth, maxAllowedWidth)) {
        setLeftSidebarWidth(newWidth);
      }
    }
  }, [isResizingLeft, rightSidebarWidth]);

  // Resize handlers for right sidebar
  const startResizingRight = useCallback((e) => {
    e.preventDefault();
    setIsResizingRight(true);
  }, []);

  const stopResizingRight = useCallback(() => {
    setIsResizingRight(false);
  }, []);

  const resizeRight = useCallback((e) => {
    if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 250;
      const maxWidth = 600;
      const availableSpace = window.innerWidth - leftSidebarWidth;
      const maxAllowedWidth = Math.max(minWidth, availableSpace - 400);
      
      if (newWidth >= minWidth && newWidth <= Math.min(maxWidth, maxAllowedWidth)) {
        setRightSidebarWidth(newWidth);
      }
    }
  }, [isResizingRight, leftSidebarWidth]);

  // Mouse event listeners for resize
  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', isResizingLeft ? resizeLeft : resizeRight);
      window.addEventListener('mouseup', isResizingLeft ? stopResizingLeft : stopResizingRight);
      return () => {
        window.removeEventListener('mousemove', isResizingLeft ? resizeLeft : resizeRight);
        window.removeEventListener('mouseup', isResizingLeft ? stopResizingLeft : stopResizingRight);
      };
    }
  }, [isResizingLeft, isResizingRight, resizeLeft, resizeRight, stopResizingLeft, stopResizingRight]);

  return (
    <div className={`flex flex-col h-screen w-full bg-light-bg overflow-hidden ${(isResizingLeft || isResizingRight) ? 'cursor-col-resize' : ''}`}>
      {/* Global Resize Overlay - Prevents iframe from stealing mouse events */}
      {(isResizingLeft || isResizingRight) && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize" />
      )}

      {/* Header */}
      <div className="h-14 border-b border-light-border flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          {/* Toggle History Sidebar */}
          <button
            onClick={toggleHistorySidebar}
            className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all"
            title={historyCollapsed ? "Show chat history" : "Hide chat history"}
          >
            {historyCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          <div className="w-[1px] h-6 bg-light-border" />
          
          <button
            onClick={handleBack}
            className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-brand-accent-500 uppercase tracking-widest leading-none mb-0.5">
              {sectionKey.toUpperCase()}_EDITOR
            </span>
            <h1 className="text-sm font-bold text-light-text tracking-tight">{sectionName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Web Research Toggle */}
          <button
            onClick={() => setWebModeEnabled(!webModeEnabled)}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black rounded-xl transition-all uppercase tracking-wider active:scale-95 ${
              webModeEnabled
                ? 'text-white bg-brand-accent-600 shadow-lg shadow-brand-accent-200/40'
                : 'text-light-text-secondary bg-light-bg border border-light-border hover:border-brand-accent-300 hover:text-brand-accent-600'
            }`}
            title={webModeEnabled ? "Web research enabled - click to disable" : "Enable web research for citations and sources"}
          >
            <Globe className="w-4 h-4" />
            LIVE_SURF
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl shadow-lg shadow-brand-accent-200/40 transition-all uppercase tracking-wider active:scale-95"
            title="Start new conversation"
          >
            <MessageSquarePlus className="w-4 h-4" />
            NEW_CHAT
          </button>

          {employee && (
            <div className="flex items-center gap-3 px-4 py-2 bg-brand-accent-50 rounded-xl border border-brand-accent-100">
              <div className="w-8 h-8 rounded-full bg-brand-accent-600 flex items-center justify-center text-white font-bold text-xs">
                {employee.name?.charAt(0) || 'E'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-light-text">{employee.name}</span>
                <span className="text-[10px] text-light-text-secondary">{employee.title || employee.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4-Pane Layout with Resizable Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far Left: Chat History Sidebar (Collapsible) */}
        <ChatHistorySidebar
          sessions={chatHistory}
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isCollapsed={historyCollapsed}
          onToggleCollapse={toggleHistorySidebar}
        />

        {/* Left: File Upload Sidebar */}
        <div style={{ width: `${leftSidebarWidth}px` }} className="shrink-0 overflow-hidden">
          <FileUploadSidebar
            sessionId={sessionId}
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            onUploadFiles={uploadFiles}
            onRemoveFile={(filename) => removeFile(filename)}
            demoMode={demoMode}
          />
        </div>

        {/* Resize Divider - Left */}
        <div
          onMouseDown={startResizingLeft}
          className={`w-3 h-full cursor-col-resize flex-shrink-0 transition-colors z-30 group relative ${
            isResizingLeft ? 'bg-brand-accent-100/30' : 'bg-transparent hover:bg-brand-accent-50'
          }`}
        >
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${
            isResizingLeft ? 'bg-brand-accent-600 w-[2px]' : 'bg-brand-accent-200 group-hover:bg-brand-accent-400'
          }`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center">
            <div className={`w-1 h-4 rounded-full ${
              isResizingLeft ? 'bg-brand-accent-600' : 'bg-brand-accent-100 group-hover:bg-brand-accent-300'
            }`} />
          </div>
        </div>

        {/* Center: Document Viewer */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <DocumentViewer
            documents={allDocuments}
            activeArtifact={activeArtifact}
            artifactContent={artifactContent}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            documentPreviewLoading={documentPreviewLoading}
            setDocumentPreviewLoading={setDocumentPreviewLoading}
            previewLoading={previewLoading}
            onPreview={handlePreview}
            onRemoveFile={handleRemoveFile}
            onOpenCanvas={handleOpenCanvas}
            demoMode={demoMode}
            videoLoadError={videoLoadError}
            setVideoLoadError={setVideoLoadError}
            webModeEnabled={webModeEnabled}
            onToggleWebMode={handleToggleWebMode}
            isEnhancing={isEnhancing}
            onEnhanceWithImages={handleEnhanceWithImages}
          />
        </div>

        {/* Resize Divider - Right */}
        <div
          onMouseDown={startResizingRight}
          className={`w-3 h-full cursor-col-resize flex-shrink-0 transition-colors z-30 group relative ${
            isResizingRight ? 'bg-brand-accent-100/30' : 'bg-transparent hover:bg-brand-accent-50'
          }`}
        >
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${
            isResizingRight ? 'bg-brand-accent-600 w-[2px]' : 'bg-brand-accent-200 group-hover:bg-brand-accent-400'
          }`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center">
            <div className={`w-1 h-4 rounded-full ${
              isResizingRight ? 'bg-brand-accent-600' : 'bg-brand-accent-100 group-hover:bg-brand-accent-300'
            }`} />
          </div>
        </div>

        {/* Right: AI Chat Sidebar */}
        <div style={{ width: `${rightSidebarWidth}px` }} className="shrink-0 overflow-hidden">
          <AIChatSidebar
            sessionId={sessionId}
            contextFiles={uploadedFiles.map((f) => f.filename)}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            suggestions={suggestions}
            demoMode={demoMode}
            templateId={templateId}
            onClearTemplate={handleClearTemplate}
            enhancementCards={enhancementCards}
            setProcessCards={setProcessCards}
            processCards={processCards}
            onRetry={handleRetry}
            onStopGeneration={handleStopGeneration}
            uploadedFiles={uploadedFiles}
            onRemoveFile={(file) => removeFile(file.filename)}
            onUploadFiles={uploadFiles}
            webModeEnabled={webModeEnabled}
            onToggleWebMode={handleToggleWebMode}
          />
        </div>
      </div>
    </div>
  );
}
