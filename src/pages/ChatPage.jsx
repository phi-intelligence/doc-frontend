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
import { sendMessage as sendChatMessage } from '../api/chat';
import { uploadFile, getFileUrl, getPreviewUrl, clearArtifacts, clearUploads, enhanceWithImages } from '../api/files';
import { getRAGStatus, indexDocument } from '../api/rag';

// Import hooks
import { useProgressStream } from '../hooks/useProgressStream';
import { useSession } from '../hooks/useSession';
import { useFiles } from '../hooks/useFiles';
import { useArtifacts } from '../hooks/useArtifacts';
import { useConnect } from '../hooks/useConnect';

// Import components
import ChatHistorySidebar from '../components/layout/ChatHistorySidebar';
import Header from '../components/layout/Header';
import WelcomeScreen from '../features/chat/components/WelcomeScreen';
import ProcessCard from '../components/progress/ProcessCard';
import EnhancementCard from '../features/artifacts/components/EnhancementCard';
import FileChip from '../components/common/FileChip';
import DocumentPreview from '../components/preview/DocumentPreview';
import ConnectMenu from '../components/connect/ConnectMenu';

/**
 * ChatPage - Main chatbot interface for document and skill operations
 * Supports skill-specific mode via ?skill= query parameter
 */
function ChatPage() {
  // Get skill from URL params
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill');

  // Session management
  const {
    sessionId,
    chatHistory,
    createNewSession,
    selectSession: selectSessionHandler,
    deleteSession: deleteSessionHandler,
    updateChatHistory
  } = useSession();

  // File management
  const { uploadedFiles, isUploading, uploadFiles: uploadFilesHandler, removeFile, clearFiles, setUploadedFiles } = useFiles(sessionId);

  // Artifact management
  const {
    outputArtifacts,
    activeArtifact,
    artifactContent,
    previewLoading,
    documentPreviewLoading,
    videoLoadError,
    currentPage,
    totalPages,
    videoRef,
    selectArtifact,
    addArtifacts,
    removeArtifact,
    clearArtifacts: clearArtifactsHandler,
    setCurrentPage,
    setTotalPages,
    setDocumentPreviewLoading,
    setVideoLoadError,
    setOutputArtifacts,
    setActiveArtifact
  } = useArtifacts();

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
  const [webModeEnabled, setWebModeEnabled] = useState(false);
  const [webUrls, setWebUrls] = useState([]);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return getStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    return getStorageItem(STORAGE_KEYS.RIGHT_SIDEBAR_COLLAPSED, true);
  });

  // RAG state
  const [ragAvailable, setRagAvailable] = useState(false);
  const [ragIndexedDocuments, setRagIndexedDocuments] = useState(false);
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

  // Connect integration hook
  const {
    connectors,
    connectionStatus,
    activeConnectors,
    connectAvailable,
    toggleConnector,
    connectApp,
    getIntegrations
  } = useConnect(sessionId);

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

  // RAG status check
  const checkRagStatus = useCallback(async () => {
    try {
      const status = await getRAGStatus(sessionId);
      setRagAvailable(status.available || false);
      setRagIndexedDocuments(status.has_indexed_documents || false);
    } catch (error) {
      setRagAvailable(false);
      setRagIndexedDocuments(false);
    }
  }, [sessionId]);

  // Index document for RAG
  const indexDocumentForRag = useCallback(async (filename) => {
    if (!ragAvailable || ragIndexing) return;
    setRagIndexing(true);
    try {
      await indexDocument(filename, sessionId);
      await checkRagStatus();
    } catch (error) {
      console.error('Failed to index document:', error);
    } finally {
      setRagIndexing(false);
    }
  }, [ragAvailable, ragIndexing, sessionId, checkRagStatus]);

  useEffect(() => {
    checkRagStatus();
  }, [checkRagStatus]);

  // Session handlers
  const handleNewChat = async () => {
    const newId = await createNewSession();
    setProcessCards([]);
    setUploadedFiles([]);
    setAllFiles([]);
    setOutputArtifacts([]);
    setActiveArtifact(null);
    setMessages([]);
    deleteSessionData(sessionId);
    setRightSidebarCollapsed(true);
    setRagIndexedDocuments(false);
    setRagIndexing(false);
  };

  const handleSelectSession = (selectedId) => {
    if (selectedId === sessionId) return;

    const sessionData = selectSessionHandler(selectedId);

    setProcessCards(sessionData?.processCards || []);
    setAllFiles(sessionData?.allFiles || []);
    setUploadedFiles([]);
    setActiveArtifact(sessionData?.allFiles?.[0] || null);
    setMessages([]);
    setRightSidebarCollapsed(!sessionData?.allFiles?.length);
  };

  const handleDeleteSession = async (deleteId) => {
    await deleteSessionHandler(deleteId);
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
      ...uploadedFiles.map(f => f.filename),
      ...outputArtifacts.slice(-3).map(f => f.filename)
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
      const response = await sendChatMessage(
        query,
        contextFiles,
        sessionId,
        activeArtifact?.filename || null,
        currentPage,
        getIntegrations(),
        abortControllerRef.current?.signal,
        skillParam,  // Pre-selected skill from URL (bypasses LLM skill selection)
        templateId,  // Template selection
        urls,        // NEW: Web URLs
        webModeEnabled  // NEW: Web mode flag
      );

      setProcessCards(prev => prev.map(card =>
        card.id === cardId
          ? { ...card, finalResult: response.response, status: 'completed' }
          : card
      ));

      if (response.new_artifacts && response.new_artifacts.length > 0) {
        const newArtifacts = response.new_artifacts.map(filename => ({
          filename,
          type: filename.split('.').pop().toUpperCase(),
          url: getFileUrl(filename),
          previewUrl: getPreviewUrl(filename),
          isOutput: true,
          createdAt: new Date().toISOString()
        }));

        setProcessCards(prev => prev.map(card =>
          card.id === cardId ? { ...card, artifacts: newArtifacts } : card
        ));

        addArtifacts(newArtifacts);

        if (newArtifacts.length > 0) {
          const newArtifact = newArtifacts[0];
          const ext = newArtifact.type?.toLowerCase();

          setAllFiles(prev => {
            const withoutPending = prev.filter(f => !f.isPending);
            return [...newArtifacts, ...withoutPending];
          });

          const updatedArtifact = activeArtifact?.filename === newArtifact.filename
            ? { ...newArtifact, previewUrl: getPreviewUrl(newArtifact.filename) }
            : newArtifact;
          selectArtifact(updatedArtifact);

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
            newArtifacts.forEach(artifact => {
              indexDocumentForRag(artifact.filename);
            });
          }
        }
      } else {
        if (pendingArtifact) {
          setPendingArtifact(null);
          setAllFiles(prev => prev.filter(f => !f.isPending));
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

    const results = await uploadFilesHandler(files);

    if (results.successful.length > 0) {
      const newFiles = results.successful;
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setAllFiles(prev => [...newFiles, ...prev]);
      selectArtifact(newFiles[0]);

      const successMsg = newFiles.length === 1
        ? `Uploaded: ${newFiles[0].filename}`
        : `Uploaded ${newFiles.length} files: ${newFiles.map(f => f.filename).join(', ')}`;

      setMessages(prev => [...prev, { role: 'system', text: successMsg }]);

      if (ragAvailable) {
        newFiles.forEach(file => indexDocumentForRag(file.filename));
      }
    }

    if (results.errors.length > 0) {
      setMessages(prev => [...prev, {
        role: 'error',
        text: `Upload failed for: ${results.errors.join('; ')}`
      }]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear all handler
  const handleClearAll = async () => {
    try {
      await clearArtifacts();
      await clearUploads();
      setUploadedFiles([]);
      setOutputArtifacts([]);
      setActiveArtifact(null);
      setStorageItem(STORAGE_KEYS.PROCESS_CARDS, []);
      setStorageItem(STORAGE_KEYS.UPLOADED_FILES, []);
      setStorageItem(STORAGE_KEYS.ALL_FILES, []);
      const newSessionId = await createNewSession();
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
      removeFile(file.filename);
    } else {
      removeArtifact(file.filename);
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
    setSidebarCollapsed(prev => !prev);
  };

  const toggleRightSidebarCollapse = () => {
    setRightSidebarCollapsed(prev => !prev);
  };

  // Enhance with images handler
  const handleEnhanceWithImages = async () => {
    if (isEnhancing || !activeArtifact) return;
    setIsEnhancing(true);

    const cardId = Date.now();
    const originalFilename = activeArtifact.filename;
    setEnhancementCards(prev => [...prev, {
      id: cardId,
      originalFile: originalFilename,
      enhancedFile: null,
      status: 'processing'
    }]);

    try {
      const response = await enhanceWithImages(originalFilename, sessionId, 'professional');
      if (response.success && response.enhanced_filename) {
        const newFile = {
          filename: response.enhanced_filename,
          type: activeArtifact.type,
          url: getFileUrl(response.enhanced_filename),
          previewUrl: getPreviewUrl(response.enhanced_filename),
          isOutput: true,
          createdAt: new Date().toISOString()
        };

        setAllFiles(prev => [...prev, newFile]);
        selectArtifact(newFile);

        setEnhancementCards(prev => prev.map(c =>
          c.id === cardId
            ? { ...c, status: 'completed', enhancedFile: newFile.filename }
            : c
        ));
      } else {
        setEnhancementCards(prev => prev.map(c =>
          c.id === cardId ? { ...c, status: 'error' } : c
        ));
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      setEnhancementCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, status: 'error' } : c
      ));
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
    <div className="flex h-screen w-full bg-light-bg overflow-hidden">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={chatHistory}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Chat Section */}
      <div className={`flex flex-col h-full border-r border-light-border transition-all duration-300 ${allFiles.length > 0 ? (sidebarCollapsed ? 'w-[38%]' : 'w-[34%]') : 'flex-1'}`}>
        {/* Enhanced Header with skill indicator and home button */}
        <div className="h-16 border-b border-light-border flex items-center justify-between px-4 bg-light-bg">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg transition-all"
              title="Back to Tools"
            >
              <Home className="w-5 h-5" />
            </Link>
            {skillParam && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent-50 rounded-lg border border-brand-accent-200">
                <span className="text-sm font-medium text-brand-accent-700">
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
            onToggleWebMode={() => setWebModeEnabled(!webModeEnabled)}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar-dark bg-light-bg">
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
                      <div className="bg-light-sidebar border border-light-border px-5 py-3 rounded-2xl rounded-tr-sm text-light-text max-w-2xl shadow-sm">
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
            <div className="border-t border-light-border bg-light-sidebar p-4">
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
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-light-bg border border-light-border rounded-xl px-3 py-2 focus-within:border-light-border-hover transition-colors">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-brand-accent-500 hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onConnectApp={connectApp}
                  connectAvailable={connectAvailable}
                />

                {/* Web Scraping Button */}
                <button
                  type="button"
                  onClick={() => setWebModeEnabled(!webModeEnabled)}
                  className={`p-2 rounded-lg transition-all ${webModeEnabled
                    ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md hover:from-blue-600 hover:to-cyan-600'
                    : 'text-light-text-secondary hover:text-light-text hover:bg-white'
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
                  className="flex-1 py-2 bg-transparent border-none outline-none text-light-text placeholder-light-text-muted text-sm"
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
                    className="p-2.5 bg-brand-accent-500 text-white rounded-lg hover:bg-brand-accent-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>

              <div className="text-center mt-2 text-xs text-light-text-muted">
                Phi Docs can make mistakes. Please double-check responses.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Section: Document Viewer + File List */}
      {
        (allFiles.length > 0 || pendingArtifact) && (
          <div className="flex-1 flex h-full bg-light-bg">
            {/* Document Viewer */}
            <div className="flex-1 flex flex-col border-r border-light-border">
              <div className="h-16 border-b border-light-border flex items-center justify-between px-6 bg-light-bg">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-semibold text-xl text-light-text flex items-center gap-2 tracking-tight">
                    <FileText className="w-5 h-5 text-brand-accent-500" />
                    {activeArtifact?.filename || 'Document Preview'}
                  </h2>
                  {activeArtifact && (
                    <div className="flex items-center gap-2 text-xs text-brand-accent-600 bg-brand-accent-50 px-3 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      Viewing{['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                        ? (['pptx', 'ppt'].includes(activeArtifact.type?.toLowerCase())
                          ? ` (Slide ${currentPage})`
                          : ` (Page ${currentPage})`)
                        : ''}
                    </div>
                  )}
                </div>
                {activeArtifact && !activeArtifact.isPending && activeArtifact.url && (
                  <div className="flex items-center gap-2">
                    {['docx', 'pptx', 'xlsx', 'pdf'].includes(activeArtifact.type?.toLowerCase()) && (
                      <button
                        onClick={handleEnhanceWithImages}
                        disabled={isEnhancing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                        title="Add AI-generated images to this document"
                      >
                        {isEnhancing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                      </button>
                    )}
                    <a
                      href={activeArtifact.url}
                      download={activeArtifact.filename}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-light-text bg-white border border-light-border hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto p-4 bg-light-bg">
                {activeArtifact ? (
                  <div className="h-full bg-white rounded-lg overflow-hidden shadow-sm border border-light-border">
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
                  <div className="h-full flex flex-col items-center justify-center text-light-text-secondary">
                    <FileText className="w-24 h-24 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Select a document</p>
                    <p className="text-sm">Choose from the list on the right</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document List (collapsible) */}
            <div className={`flex flex-col h-full bg-light-sidebar transition-all duration-300 border-l border-light-border ${rightSidebarCollapsed ? 'w-12' : 'w-52'}`}>
              <div className="h-16 border-b border-light-border flex items-center justify-between px-3">
                {!rightSidebarCollapsed && (
                  <>
                    <h3 className="font-semibold text-xs text-light-text-secondary flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-brand-accent-500" />
                      Files
                    </h3>
                    <span className="bg-brand-accent-500/10 text-brand-accent-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-brand-accent-500/20">
                      {allFiles.length}
                    </span>
                  </>
                )}
                <button
                  onClick={toggleRightSidebarCollapse}
                  className={`p-1.5 text-light-text-secondary hover:text-light-text hover:bg-white/50 rounded-lg transition-colors ${rightSidebarCollapsed ? 'mx-auto' : ''}`}
                  title={rightSidebarCollapsed ? 'Expand files' : 'Collapse files'}
                >
                  {rightSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                          className={`p-2 rounded-lg transition-colors ${isActive
                            ? 'bg-light-bg text-brand-accent-500 border border-brand-accent-500/30'
                            : 'text-light-text-secondary hover:bg-white/50 hover:text-light-text'}`}
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
                          ? 'bg-light-bg border-brand-accent-500/30'
                          : 'bg-transparent border-transparent hover:bg-white/50 hover:border-light-border'
                          }`}
                        onClick={() => selectArtifact(file)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${isActive ? 'bg-brand-accent-500/10' : 'bg-white'}`}>
                            <IconComponent className={`w-3 h-3 ${isActive ? 'text-brand-accent-500' : 'text-light-text-secondary'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[11px] font-medium truncate ${isActive ? 'text-light-text' : 'text-light-text-secondary'}`}>
                              {file.filename}
                            </div>
                          </div>
                          {isNewest && (
                            <span className="text-[8px] font-bold px-1 py-0.5 bg-brand-accent-500/10 text-brand-accent-500 rounded border border-brand-accent-500/20">
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
}

export default ChatPage;
