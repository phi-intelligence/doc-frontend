import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, ChevronRight, ChevronLeft,
  Trash2, Download, Eye, FileText, Folder, Wand2, Cloud, Mail, Square, Home,
  Globe
} from 'lucide-react';

// Import utilities
import { STORAGE_KEYS } from '../utils/constants';
import { saveSessionData, loadSessionData, deleteSessionData, getStorageItem, setStorageItem } from '../utils/storage';
import { getFileIcon } from '../utils/fileUtils';

// Import API services
import { getFileUrl, getPreviewUrl } from '../api/files';

// Import hooks
import { useProgressStream } from '../hooks/useProgressStream';
import { useArtifactContent } from '../hooks/useArtifactContent';

// Import stores
import useUIStore from '../stores/useUIStore';
import useSessionStore from '../stores/useSessionStore';

// Import queries
import { useCreateSession, useChatHistory, useDeleteSession } from '../hooks/queries/useSessionQueries';
import { useUploadFiles, useArtifacts, useClearArtifacts, useClearUploads, useEnhanceWithImages } from '../hooks/queries/useFileQueries';
import { useSendMessage } from '../hooks/queries/useChatQueries';
import { useRAGStatus, useIndexDocument } from '../hooks/queries/useRAGQueries';
import { useConnectStatus, useConnectorApps, useConnectionStatus, useConnectApp } from '../hooks/queries/useConnectQueries';

// Import components
import WelcomeScreen from '../components/chat/WelcomeScreen';
import ProcessCard from '../components/progress/ProcessCard';
import EnhancementCard from '../components/artifacts/EnhancementCard';
import FileChip from '../components/common/FileChip';
import DocumentPreview from '../components/preview/DocumentPreview';
import ConnectMenu from '../components/connect/ConnectMenu';
import ChatHistorySidebar from '../components/chat/ChatHistorySidebar';
import Header from '../components/chat/Header';
import { useTheme } from '../context/ThemeContext';

/**
 * ChatPage - Main chatbot interface for document and skill operations
 * Supports skill-specific mode via ?skill= query parameter
 */
const ChatPage = () => {
  // Get skill from URL params
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill');
  
  // Theme
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Zustand stores
  const {
    sidebarCollapsed,
    rightSidebarCollapsed,
    setSidebarCollapsed,
    setRightSidebarCollapsed,
    activeArtifact,
    setActiveArtifact,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    documentPreviewLoading,
    setDocumentPreviewLoading,
    videoLoadError,
    setVideoLoadError,
    artifactContent,
    previewLoading,
    setArtifactContent,
    setPreviewLoading,
    webModeEnabled,
    toggleWebMode,
  } = useUIStore();

  const { currentSessionId, setCurrentSessionId, chatHistory, setChatHistory, updateChatHistory } = useSessionStore();

  // Session queries
  const createSessionMutation = useCreateSession();
  const { data: chatHistoryData = [] } = useChatHistory();
  const deleteSessionMutation = useDeleteSession();

  // Initialize sessionId on mount
  useEffect(() => {
    if (!currentSessionId) {
      const stored = getStorageItem(STORAGE_KEYS.SESSION_ID);
      if (stored) {
        setCurrentSessionId(stored);
      } else {
        // Create new session if none exists
        createSessionMutation.mutate();
      }
    }
  }, []);

  // Get sessionId - use currentSessionId from store
  const sessionId = currentSessionId || getStorageItem(STORAGE_KEYS.SESSION_ID);

  // File queries
  const uploadFilesMutation = useUploadFiles();
  const { data: artifactsData = [] } = useArtifacts();
  const clearArtifactsMutation = useClearArtifacts();
  const clearUploadsMutation = useClearUploads();
  const enhanceWithImagesMutation = useEnhanceWithImages();

  // Chat queries
  const sendMessageMutation = useSendMessage();

  // RAG queries
  const { data: ragStatus } = useRAGStatus(sessionId);
  const indexDocumentMutation = useIndexDocument();
  const ragAvailable = ragStatus?.available || false;
  const ragIndexedDocuments = ragStatus?.has_indexed_documents || false;

  // Connect queries
  const { data: connectAvailable = false } = useConnectStatus();
  const { data: connectors = [] } = useConnectorApps();
  
  // Local state for uploaded files (not server state, just UI tracking)
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const isUploading = uploadFilesMutation.isPending;

  // Process cards state - initialize from session-specific storage
  const [processCards, setProcessCards] = useState(() => {
    const currentSessionId = getStorageItem(STORAGE_KEYS.SESSION_ID);
    if (currentSessionId) {
      const sessionData = loadSessionData(currentSessionId);
      if (sessionData?.processCards?.length > 0) {
        return sessionData.processCards;
      }
    }
    return getStorageItem(STORAGE_KEYS.PROCESS_CARDS, []);
  });

  // Chat state
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [currentCardId, setCurrentCardId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingArtifact, setPendingArtifact] = useState(null);

  // Web scraping state
  const [webUrls, setWebUrls] = useState([]);

  // Artifact content loading
  useArtifactContent(activeArtifact);

  // Output artifacts from query
  const outputArtifacts = artifactsData;

  // Connect state - track active connectors locally
  const [activeConnectors, setActiveConnectors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const connectAppMutation = useConnectApp();

  // Get connection status for connectors (using individual queries)
  const gmailStatus = useConnectionStatus('gmail', sessionId);
  const driveStatus = useConnectionStatus('googledrive', sessionId);
  const docsStatus = useConnectionStatus('googledocs', sessionId);
  const hubspotStatus = useConnectionStatus('hubspot', sessionId);
  const airtableStatus = useConnectionStatus('airtable', sessionId);

  useEffect(() => {
    if (gmailStatus.data !== undefined) {
      setConnectionStatus((prev) => ({ ...prev, gmail: gmailStatus.data }));
    }
  }, [gmailStatus.data]);

  useEffect(() => {
    if (driveStatus.data !== undefined) {
      setConnectionStatus((prev) => ({ ...prev, googledrive: driveStatus.data }));
    }
  }, [driveStatus.data]);

  useEffect(() => {
    if (docsStatus.data !== undefined) {
      setConnectionStatus((prev) => ({ ...prev, googledocs: docsStatus.data }));
    }
  }, [docsStatus.data]);

  useEffect(() => {
    if (hubspotStatus.data !== undefined) {
      setConnectionStatus((prev) => ({ ...prev, hubspot: hubspotStatus.data }));
    }
  }, [hubspotStatus.data]);

  useEffect(() => {
    if (airtableStatus.data !== undefined) {
      setConnectionStatus((prev) => ({ ...prev, airtable: airtableStatus.data }));
    }
  }, [airtableStatus.data]);

  const toggleConnector = (appId) => {
    if (!connectionStatus[appId]) return;
    setActiveConnectors((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  const getIntegrations = () => {
    const result = {};
    for (const [appId, isActive] of Object.entries(activeConnectors)) {
      if (isActive && connectionStatus[appId]) {
        result[appId] = true;
      }
    }
    return result;
  };

  const handleConnectApp = async (appId) => {
    const result = await connectAppMutation.mutateAsync({ appId, sessionId });
    if (result?.connected) {
      setConnectionStatus((prev) => ({ ...prev, [appId]: true }));
      setActiveConnectors((prev) => ({ ...prev, [appId]: true }));
    }
  };

  // RAG indexing state
  const [ragIndexing, setRagIndexing] = useState(false);

  // Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementCards, setEnhancementCards] = useState([]);

  // All files (combined uploaded + output artifacts)
  const [allFiles, setAllFiles] = useState(() => {
    return getStorageItem(STORAGE_KEYS.ALL_FILES, []);
  });

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const processCardsRef = useRef([]);

  // Progress stream hook
  const progressStream = useProgressStream(sessionId);

  // Get skill display name
  const getSkillDisplayName = (skill) => {
    const names = {
      'docx': 'Word Documents',
      'xlsx': 'Excel Spreadsheets',
      'pdf': 'PDF Processing',
      'pptx': 'Presentations',
      'imagegen': 'Image Generation',
      'frontend-design': 'Frontend Design',
      'handwritten-ocr': 'Handwritten OCR'
    };
    return names[skill] || skill;
  };

  // Persist state to localStorage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PROCESS_CARDS, processCards);
    saveSessionData(sessionId, processCards, allFiles);
    if (processCards.length > 0) {
      const firstQuery = processCards[0]?.query || 'Untitled Chat';
      updateChatHistory(sessionId, firstQuery);
    }
  }, [processCards, sessionId, allFiles, updateChatHistory]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.ALL_FILES, allFiles);
    if (allFiles.length > 0 && rightSidebarCollapsed) {
      setRightSidebarCollapsed(false);
    }
  }, [allFiles, rightSidebarCollapsed]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RIGHT_SIDEBAR_COLLAPSED, rightSidebarCollapsed);
  }, [rightSidebarCollapsed]);

  // Sync progress stream to active card
  useEffect(() => {
    if (currentCardId && progressStream.items.length > 0) {
      setProcessCards(prev => prev.map(card =>
        card.id === currentCardId
          ? { ...card, steps: progressStream.items }
          : card
      ));
      const lastItem = progressStream.items[progressStream.items.length - 1];
      if (lastItem && lastItem.message) {
        setProcessingStatus(lastItem.message);
      }
    }
  }, [progressStream.items, currentCardId]);

  // Utility function to extract skill name from code_start event text
  const extractSkillFromEvent = (text) => {
    if (!text) return null;
    const match = text.match(/for\s+(\w+)/i);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    const skillPatterns = ['docx', 'pptx', 'xlsx', 'pdf', 'doc', 'ppt', 'xls'];
    const lowerText = text.toLowerCase();
    for (const skill of skillPatterns) {
      if (lowerText.includes(skill)) {
        return skill;
      }
    }
    return null;
  };

  // Map skill names to file extensions and types
  const getFileTypeFromSkill = (skill) => {
    const skillLower = (skill || '').toLowerCase();
    const mapping = {
      'docx': { ext: 'docx', type: 'DOCX' },
      'pptx': { ext: 'pptx', type: 'PPTX' },
      'ppt': { ext: 'pptx', type: 'PPTX' },
      'xlsx': { ext: 'xlsx', type: 'XLSX' },
      'xls': { ext: 'xlsx', type: 'XLSX' },
      'pdf': { ext: 'pdf', type: 'PDF' }
    };
    return mapping[skillLower] || { ext: 'docx', type: 'DOCX' };
  };

  // Detect code_start events and create pending artifact for right panel visibility
  useEffect(() => {
    if (!isProcessing) {
      if (pendingArtifact) {
        setPendingArtifact(null);
        setAllFiles(prev => prev.filter(f => !f.isPending));
      }
      return;
    }

    const codeStartEvent = progressStream.items.find(
      item => item.type === 'code_start' && item.status === 'running'
    );

    if (codeStartEvent) {
      const skillName = extractSkillFromEvent(codeStartEvent.command || codeStartEvent.title || '');

      if (skillName && (!pendingArtifact || !pendingArtifact.filename.includes(skillName))) {
        const fileType = getFileTypeFromSkill(skillName);
        const pendingFilename = `Generating_${skillName}.${fileType.ext}`;

        const newPendingArtifact = {
          filename: pendingFilename,
          type: fileType.type,
          url: null,
          previewUrl: null,
          isOutput: true,
          isPending: true,
          createdAt: new Date().toISOString()
        };

        setAllFiles(prev => {
          const hasPending = prev.some(f => f.isPending);
          if (hasPending) {
            return prev.map(f => f.isPending ? newPendingArtifact : f);
          } else {
            return [newPendingArtifact, ...prev];
          }
        });

        setPendingArtifact(newPendingArtifact);
        setDocumentPreviewLoading(true);
        setVideoLoadError(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressStream.items, isProcessing]);

  // Index document for RAG
  const indexDocumentForRag = useCallback(async (filename) => {
    if (!ragAvailable || ragIndexing) return;
    setRagIndexing(true);
    try {
      await indexDocumentMutation.mutateAsync({ filename, sessionId });
    } catch (error) {
      console.error('Failed to index document:', error);
    } finally {
      setRagIndexing(false);
    }
  }, [ragAvailable, ragIndexing, sessionId, indexDocumentMutation]);

  // Session handlers
  const handleNewChat = async () => {
    const newId = await createSessionMutation.mutateAsync();
    setProcessCards([]);
    setUploadedFiles([]);
    setAllFiles([]);
    setActiveArtifact(null);
    setMessages([]);
    if (sessionId) {
      deleteSessionData(sessionId);
    }
    setRightSidebarCollapsed(true);
    setRagIndexing(false);
  };

  const handleSelectSession = (selectedId) => {
    if (selectedId === sessionId) return;

    setCurrentSessionId(selectedId);
    const sessionData = loadSessionData(selectedId);

    setProcessCards(sessionData?.processCards || []);
    setAllFiles(sessionData?.allFiles || []);
    setUploadedFiles([]);
    setActiveArtifact(sessionData?.allFiles?.[0] || null);
    setMessages([]);
    setRightSidebarCollapsed(!sessionData?.allFiles?.length);
  };

  const handleDeleteSession = async (deleteId) => {
    await deleteSessionMutation.mutateAsync(deleteId);
    if (deleteId === sessionId) {
      await handleNewChat();
    }
  };

  // URL extraction and validation utilities
  const extractUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches || [];
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Send message handler
  const handleSendMessage = async (e, overrideText = null, templateId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = overrideText !== null ? overrideText : input;
    if (!query.trim() && !templateId) return;
    if (overrideText === null) setInput('');

    // Extract URLs if web mode is enabled
    let urls = [];
    if (webModeEnabled) {
      urls = extractUrls(query);

      // Validate URLs
      const validUrls = urls.filter(isValidUrl);
      if (urls.length !== validUrls.length) {
        console.warn('Some URLs are invalid:', urls.filter(url => !isValidUrl(url)));
      }
      urls = validUrls;

      console.log(`Web mode enabled - detected ${urls.length} URLs:`, urls);
    }

    if (pendingArtifact) {
      setPendingArtifact(null);
      setAllFiles(prev => prev.filter(f => !f.isPending));
    }

    setIsProcessing(true);
    setProcessingStatus('Starting...');

    abortControllerRef.current = new AbortController();

    const contextFiles = [
      ...uploadedFiles.map((f) => f.filename),
      ...outputArtifacts.slice(-3).map((f) => f.filename),
    ];

    const cardId = `card-${Date.now()}`;
    setCurrentCardId(cardId);
    progressStream.clear();

    const newCard = {
      id: cardId,
      query,
      steps: [],
      finalResult: '',
      artifacts: [],
      status: 'processing',
      isCollapsed: false
    };

    setProcessCards(prev => [...prev, newCard]);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: query,
        files: contextFiles,
        sessionId,
        activeFile: activeArtifact?.filename || null,
        currentPage,
        connectors: getIntegrations(),
        signal: abortControllerRef.current?.signal,
        skillHint: skillParam,
        templateId,
        webUrls: urls,
        webModeEnabled,
      });

      setProcessCards(prev => prev.map(card =>
        card.id === cardId
          ? { ...card, finalResult: response.response, status: 'completed' }
          : card
      ));

      if (response.new_artifacts && response.new_artifacts.length > 0) {
        const newArtifacts = response.new_artifacts.map((filename) => ({
          filename,
          type: filename.split('.').pop().toUpperCase(),
          url: getFileUrl(filename),
          previewUrl: getPreviewUrl(filename),
          isOutput: true,
          createdAt: new Date().toISOString(),
        }));

        setProcessCards((prev) =>
          prev.map((card) =>
            card.id === cardId ? { ...card, artifacts: newArtifacts } : card
          )
        );

        if (newArtifacts.length > 0) {
          const newArtifact = newArtifacts[0];
          const ext = newArtifact.type?.toLowerCase();

          setAllFiles((prev) => {
            const withoutPending = prev.filter((f) => !f.isPending);
            return [...newArtifacts, ...withoutPending];
          });

          const updatedArtifact =
            activeArtifact?.filename === newArtifact.filename
              ? { ...newArtifact, previewUrl: getPreviewUrl(newArtifact.filename) }
              : newArtifact;
          setActiveArtifact(updatedArtifact);

          if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
            setDocumentPreviewLoading(true);
            setVideoLoadError(false);
            setCurrentPage(1);
          } else {
            setDocumentPreviewLoading(false);
            setVideoLoadError(false);
          }

          setPendingArtifact(null);

          if (ragAvailable) {
            newArtifacts.forEach((artifact) => {
              indexDocumentForRag(artifact.filename);
            });
          }
        }
      } else {
        if (pendingArtifact) {
          setPendingArtifact(null);
          setAllFiles((prev) => prev.filter((f) => !f.isPending));
        }
      }

      setProcessingStatus('Complete!');
    } catch (error) {
      setProcessCards(prev => prev.map(card =>
        card.id === cardId
          ? {
            ...card,
            status: 'error',
            finalResult: `Error: ${error.response?.data?.detail || error.message || 'Something went wrong'}`
          }
          : card
      ));
      if (pendingArtifact) {
        setPendingArtifact(null);
        setAllFiles(prev => prev.filter(f => !f.isPending));
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
      setCurrentCardId(null);
      abortControllerRef.current = null;
      setTimeout(() => setProcessingStatus(''), 2000);
    }
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    try {
      const results = await uploadFilesMutation.mutateAsync({ files, sessionId });

      if (results.successful && results.successful.length > 0) {
        const newFiles = results.successful.map((r) => ({
          filename: r.result?.filename || r.file?.name,
          type: (r.result?.filename || r.file?.name).split('.').pop().toUpperCase(),
          url: getFileUrl(r.result?.filename || r.file?.name),
          previewUrl: getPreviewUrl(r.result?.filename || r.file?.name),
          isOutput: false,
          uploadedAt: new Date().toISOString(),
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setAllFiles((prev) => [...newFiles, ...prev]);
        setActiveArtifact(newFiles[0]);

        if (ragAvailable) {
          newFiles.forEach((file) => indexDocumentForRag(file.filename));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear all handler
  const handleClearAll = async () => {
    try {
      await clearArtifactsMutation.mutateAsync();
      await clearUploadsMutation.mutateAsync();
      setUploadedFiles([]);
      setActiveArtifact(null);
      setStorageItem(STORAGE_KEYS.PROCESS_CARDS, []);
      setStorageItem(STORAGE_KEYS.UPLOADED_FILES, []);
      setStorageItem(STORAGE_KEYS.ALL_FILES, []);
      const newSessionId = await createSessionMutation.mutateAsync();
      setProcessCards([]);
      setAllFiles([]);
      setMessages([]);
    } catch (error) {
      console.error(error);
    }
  };

  // Remove file handler
  const handleRemoveFile = (file, isUpload) => {
    if (isUpload) {
      setUploadedFiles((prev) => prev.filter((f) => f.filename !== file.filename));
    } else {
      // Artifacts are managed by the query, but we can remove from local state
      setAllFiles((prev) => prev.filter((f) => f.filename !== file.filename));
    }
    if (activeArtifact?.filename === file.filename) {
      setActiveArtifact(null);
    }
  };

  // Retry handler
  const handleRetry = (query) => {
    setInput(query);
  };

  // Stop generation handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setProcessingStatus('Stopped');
    setCurrentCardId(null);
    if (pendingArtifact) {
      setPendingArtifact(null);
      setAllFiles(prev => prev.filter(f => !f.isPending));
    }
    setProcessCards(prev => prev.map(card =>
      card.status === 'processing'
        ? { ...card, status: 'stopped', finalResult: 'Generation stopped by user.' }
        : card
    ));
    setTimeout(() => setProcessingStatus(''), 2000);
  };

  // Toggle sidebars
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleRightSidebarCollapse = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  // Select artifact helper
  const selectArtifact = (artifact) => {
    if (!artifact) {
      setDocumentPreviewLoading(false);
      setVideoLoadError(false);
      setActiveArtifact(null);
      setCurrentPage(1);
      return;
    }

    const ext = artifact.type?.toLowerCase();

    if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
      setDocumentPreviewLoading(true);
      setVideoLoadError(false);
    } else {
      setDocumentPreviewLoading(false);
      setVideoLoadError(false);
    }

    setActiveArtifact(artifact);
    setCurrentPage(1);
  };

  // Enhance with images handler
  const handleEnhanceWithImages = async () => {
    if (isEnhancing || !activeArtifact) return;
    setIsEnhancing(true);

    const cardId = Date.now();
    const originalFilename = activeArtifact.filename;
    setEnhancementCards((prev) => [
      ...prev,
      {
        id: cardId,
        originalFile: originalFilename,
        enhancedFile: null,
        status: 'processing',
      },
    ]);

    try {
      const response = await enhanceWithImagesMutation.mutateAsync({
        filename: originalFilename,
        sessionId,
        imageStyle: 'professional',
      });
      if (response.success && response.enhanced_filename) {
        const newFile = {
          filename: response.enhanced_filename,
          type: activeArtifact.type,
          url: getFileUrl(response.enhanced_filename),
          previewUrl: getPreviewUrl(response.enhanced_filename),
          isOutput: true,
          createdAt: new Date().toISOString(),
        };

        setAllFiles((prev) => [...prev, newFile]);
        setActiveArtifact(newFile);

        setEnhancementCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...c, status: 'completed', enhancedFile: newFile.filename }
              : c
          )
        );
      } else {
        setEnhancementCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, status: 'error' } : c))
        );
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      setEnhancementCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, status: 'error' } : c))
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [processCards]);

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={chatHistoryData}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Chat Section */}
      <div className={`flex flex-col h-full border-r transition-all duration-300 ${isDark ? 'border-dark-border' : 'border-light-border'} ${allFiles.length > 0 ? (sidebarCollapsed ? 'w-[38%]' : 'w-[34%]') : 'flex-1'}`}>
        {/* Enhanced Header with skill indicator and home button */}
        <div className={`h-14 sm:h-16 border-b flex items-center justify-between px-2 sm:px-3 md:px-4 ${isDark ? 'border-dark-border bg-dark-bg' : 'border-light-border bg-light-bg'}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              to="/"
              className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${isDark ? 'text-dark-text-secondary hover:text-brand-accent-400 hover:bg-brand-accent-900/30' : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50'}`}
              title="Back to Tools"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            {skillParam && (
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border flex-shrink-0 ${isDark ? 'bg-brand-accent-900/30 border-brand-accent-800' : 'bg-brand-accent-50 border-brand-accent-200'}`}>
                <span className={`text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none ${isDark ? 'text-brand-accent-300' : 'text-brand-accent-700'}`}>
                  {getSkillDisplayName(skillParam)}
                </span>
              </div>
            )}
          </div>
          <Header
            ragAvailable={ragAvailable}
            ragIndexedDocuments={ragIndexedDocuments}
            onClearAll={handleClearAll}
            minimal={true}
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.csv,.jpg,.jpeg,.png"
        />

        {(processCards.length === 0 && uploadedFiles.length === 0) ? (
          <WelcomeScreen
            onSend={(text, templateId) => handleSendMessage({ preventDefault: () => { } }, text, templateId)}
            onUpload={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            skill={skillParam}
            webModeEnabled={webModeEnabled}
            onToggleWebMode={toggleWebMode}
          />
        ) : (
          <>
            <div className={`flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar-dark ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
              <AnimatePresence>
                {processCards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* User Message Bubble */}
                    <div className="flex justify-end px-4">
                      <div className={`px-5 py-3 rounded-2xl rounded-tr-sm max-w-2xl shadow-sm ${isDark ? 'bg-dark-sidebar border-dark-border text-dark-text' : 'bg-light-sidebar border-light-border text-light-text'} border`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{card.query}</p>
                      </div>
                    </div>

                    {/* AI Process Card */}
                    <ProcessCard
                      title="Phi Docs"
                      query={card.query}
                      steps={card.steps}
                      finalResult={card.finalResult}
                      artifacts={card.artifacts}
                      status={card.status}
                      isCollapsed={card.isCollapsed}
                      onToggle={() => {
                        setProcessCards(prev => prev.map(c =>
                          c.id === card.id ? { ...c, isCollapsed: !c.isCollapsed } : c
                        ));
                      }}
                      onRetry={handleRetry}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Enhancement Cards */}
              <AnimatePresence>
                {enhancementCards.map((card) => (
                  <EnhancementCard
                    key={card.id}
                    originalFile={card.originalFile}
                    enhancedFile={card.enhancedFile}
                    status={card.status}
                    onViewFile={(filename) => {
                      const file = allFiles.find(f => f.filename === filename);
                      if (file) {
                        selectArtifact(file);
                      }
                    }}
                  />
                ))}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t p-4 ${isDark ? 'border-dark-border bg-dark-sidebar' : 'border-light-border bg-light-sidebar'}`}>
              {/* Uploaded Files Row */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <FileChip
                      key={file.filename}
                      file={file}
                      isUpload={true}
                      isActive={false}
                      onClick={() => { }}
                      onRemove={() => handleRemoveFile(file, true)}
                    />
                  ))}
                </div>
              )}

              {/* Main Input Row */}
              <form onSubmit={handleSendMessage} className={`flex items-center gap-3 border rounded-xl px-3 py-2 transition-colors ${isDark ? 'bg-dark-bg border-dark-border focus-within:border-dark-border-hover' : 'bg-light-bg border-light-border focus-within:border-light-border-hover'}`}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-brand-accent-400 hover:text-brand-accent-300 hover:bg-brand-accent-900/30' : 'text-brand-accent-500 hover:text-brand-accent-600 hover:bg-brand-accent-50'}`}
                  title="Attach files"
                >
                  {isUploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>



                {/* Connect Menu */}
                <ConnectMenu
                  sessionId={sessionId}
                  connectors={connectors}
                  connectionStatus={connectionStatus}
                  activeConnectors={activeConnectors}
                  onToggleConnector={toggleConnector}
                  onConnectApp={handleConnectApp}
                  connectAvailable={connectAvailable}
                />

                {/* Web Scraping Button */}
                <button
                  type="button"
                  onClick={toggleWebMode}
                  className={`p-2 rounded-lg transition-all ${webModeEnabled
                    ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md hover:from-blue-600 hover:to-cyan-600'
                    : isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface' : 'text-light-text-secondary hover:text-light-text hover:bg-white'
                    }`}
                  title={webModeEnabled ? "Web mode ON - Will scrape URLs" : "Enable web scraping"}
                >
                  <Globe className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={skillParam ? `Ask about ${getSkillDisplayName(skillParam)}...` : "Reply..."}
                  className={`flex-1 py-2 bg-transparent border-none outline-none text-sm ${isDark ? 'text-dark-text placeholder-dark-text-muted' : 'text-light-text placeholder-light-text-muted'}`}
                  disabled={isProcessing}
                />



                {isProcessing ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all animate-pulse"
                    title="Stop generation"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`p-2.5 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'bg-brand-accent-600 hover:bg-brand-accent-500' : 'bg-brand-accent-500 hover:bg-brand-accent-600'}`}
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>

              <div className={`text-center mt-2 text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Phi Docs can make mistakes. Please double-check responses.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Section: Document Viewer + File List */}
      {
        (allFiles.length > 0 || pendingArtifact) && (
          <div className={`flex-1 flex h-full ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
            {/* Document Viewer */}
            <div className={`flex-1 flex flex-col border-r ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
              <div className={`h-14 sm:h-16 border-b flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 ${isDark ? 'border-dark-border bg-dark-bg' : 'border-light-border bg-light-bg'}`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <h2 className={`font-display font-semibold text-sm sm:text-base md:text-lg lg:text-xl flex items-center gap-1.5 sm:gap-2 tracking-tight truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    <FileText className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                    <span className="truncate">{activeArtifact?.filename || 'Document Preview'}</span>
                  </h2>
                  {activeArtifact && (
                    <div className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${isDark ? 'text-brand-accent-300 bg-brand-accent-900/30' : 'text-brand-accent-600 bg-brand-accent-50'}`}>
                      <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">
                        Viewing{['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                          ? (['pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                            ? ` (Slide ${currentPage})`
                            : ` (Page ${currentPage})`)
                          : ''}
                      </span>
                      <span className="sm:hidden">
                        {['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                          ? (['pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                            ? `S${currentPage}`
                            : `P${currentPage}`)
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
                {activeArtifact && !activeArtifact.isPending && activeArtifact.url && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {['docx', 'pptx', 'xlsx', 'pdf'].includes(activeArtifact.type?.toLowerCase()) && (
                      <button
                        onClick={handleEnhanceWithImages}
                        disabled={isEnhancing}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                        title="Add AI-generated images to this document"
                      >
                        {isEnhancing ? (
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        <span className="hidden sm:inline">{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                        <span className="sm:hidden">{isEnhancing ? '...' : 'AI'}</span>
                      </button>
                    )}
                    <a
                      href={activeArtifact.url}
                      download={activeArtifact.filename}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${isDark ? 'text-dark-text bg-dark-surface border-dark-border hover:bg-dark-sidebar' : 'text-light-text bg-white border-light-border hover:bg-gray-50'} border`}
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                )}
              </div>

              <div className={`flex-1 overflow-auto p-4 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
                {activeArtifact ? (
                  <div className={`h-full rounded-lg overflow-hidden shadow-sm border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'}`}>
                    <DocumentPreview
                      artifact={activeArtifact}
                      artifactContent={artifactContent}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      documentPreviewLoading={documentPreviewLoading}
                      setDocumentPreviewLoading={setDocumentPreviewLoading}
                      previewLoading={previewLoading}
                    />
                  </div>
                ) : (
                  <div className={`h-full flex flex-col items-center justify-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    <FileText className="w-24 h-24 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Select a document</p>
                    <p className="text-sm">Choose from the list on the right</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document List (collapsible) */}
            <div className={`flex flex-col h-full transition-all duration-300 border-l ${isDark ? 'bg-dark-sidebar border-dark-border' : 'bg-light-sidebar border-light-border'} ${rightSidebarCollapsed ? 'w-10 sm:w-12' : 'w-48 sm:w-52'}`}>
              <div className={`h-14 sm:h-16 border-b flex items-center justify-between px-2 sm:px-3 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                {!rightSidebarCollapsed && (
                  <>
                    <h3 className={`font-semibold text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      <Folder className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
                      <span className="truncate">Files</span>
                    </h3>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-brand-accent-900/30 text-brand-accent-300 border-brand-accent-800' : 'bg-brand-accent-500/10 text-brand-accent-500 border-brand-accent-500/20'}`}>
                      {allFiles.length}
                    </span>
                  </>
                )}
                <button
                  onClick={toggleRightSidebarCollapse}
                  className={`p-1 sm:p-1.5 rounded-lg transition-colors ${rightSidebarCollapsed ? 'mx-auto' : ''} ${isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface/50' : 'text-light-text-secondary hover:text-light-text hover:bg-white/50'}`}
                  title={rightSidebarCollapsed ? 'Expand files' : 'Collapse files'}
                >
                  {rightSidebarCollapsed ? <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {rightSidebarCollapsed ? (
                  <div className="flex flex-col items-center gap-1">
                    {allFiles.map((file, index) => {
                      const isActive = activeArtifact?.filename === file.filename;
                      const IconComponent = getFileIcon(file.type);
                      return (
                        <button
                          key={`${file.filename}-${index}`}
                          onClick={() => selectArtifact(file)}
                          className={`p-2 rounded-lg transition-colors border ${isActive
                            ? isDark ? 'bg-dark-bg text-brand-accent-400 border-brand-accent-600/30' : 'bg-light-bg text-brand-accent-500 border-brand-accent-500/30'
                            : isDark ? 'text-dark-text-secondary hover:bg-dark-surface/50 hover:text-dark-text border-transparent' : 'text-light-text-secondary hover:bg-white/50 hover:text-light-text border-transparent'}`}
                          title={file.filename}
                        >
                          <IconComponent className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  allFiles.map((file, index) => {
                    const isActive = activeArtifact?.filename === file.filename;
                    const isNewest = index === 0;
                    const IconComponent = getFileIcon(file.type);

                    return (
                      <motion.div
                        key={`${file.filename}-${index}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${isActive
                          ? isDark ? 'bg-dark-bg border-brand-accent-600/30' : 'bg-light-bg border-brand-accent-500/30'
                          : isDark ? 'bg-transparent border-transparent hover:bg-dark-surface/50 hover:border-dark-border' : 'bg-transparent border-transparent hover:bg-white/50 hover:border-light-border'
                          }`}
                        onClick={() => selectArtifact(file)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${isActive ? isDark ? 'bg-brand-accent-900/30' : 'bg-brand-accent-500/10' : isDark ? 'bg-dark-surface' : 'bg-white'}`}>
                            <IconComponent className={`w-3 h-3 ${isActive ? isDark ? 'text-brand-accent-400' : 'text-brand-accent-500' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[11px] font-medium truncate ${isActive ? isDark ? 'text-dark-text' : 'text-light-text' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                              {file.filename}
                            </div>
                          </div>
                          {isNewest && (
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${isDark ? 'bg-brand-accent-900/30 text-brand-accent-300 border-brand-accent-800' : 'bg-brand-accent-500/10 text-brand-accent-500 border-brand-accent-500/20'}`}>
                              NEW
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ChatPage;
