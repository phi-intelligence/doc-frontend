import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Send, Paperclip, RefreshCw, Clock, ChevronDown, ChevronRight, ChevronLeft,
  Trash2, Download, Eye, FileText, Folder, Wand2, Cloud, Mail, Square, Home,
  Globe, Zap, MessageSquarePlus
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
import { useAuth } from '../auth/AuthContext';

// Import components
import ChatHistorySidebar from '../components/layout/ChatHistorySidebar';
import Header from '../components/layout/Header';
import WelcomeScreen from '../features/chat/components/WelcomeScreen';
import ProcessCard from '../components/progress/ProcessCard';
import EnhancementCard from '../features/artifacts/components/EnhancementCard';
import ChatPane from '../workspace/ChatPane';
import FileChip from '../components/common/FileChip';
import FileThumbnail from '../components/common/FileThumbnail';
import DocumentPreview from '../components/preview/DocumentPreview';
import ConnectMenu from '../components/connect/ConnectMenu';
import { extractUrls, isValidUrl } from '../workspace/workspaceUtils';

/**
 * ChatPage - Main chatbot interface for document and skill operations
 * Supports skill-specific mode via ?skill= query parameter
 */
function ChatPage() {
  // Get skill from URL params
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill');
  const navigate = useNavigate();
  const location = useLocation();

  // Auth context - for smart navigation
  const { isAuthenticated } = useAuth();

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

  // Resizable layout state
  const [chatWidth, setChatWidth] = useState(() => {
    const saved = localStorage.getItem('chat_width');
    if (saved) return parseInt(saved);

    // Default to a generous 65% split of remaining space
    const sidebarWidth = 224;
    const rightSidebarWidth = 208;
    const available = window.innerWidth - sidebarWidth - rightSidebarWidth;
    return Math.floor(available * 0.65);
  });
  const [isResizing, setIsResizing] = useState(false);

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
    // Only auto-open the right sidebar when the VERY FIRST file is added
    if (allFiles.length === 1 && rightSidebarCollapsed) {
      setRightSidebarCollapsed(false);
    }
  }, [allFiles]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RIGHT_SIDEBAR_COLLAPSED, rightSidebarCollapsed);
  }, [rightSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('chat_width', chatWidth.toString());
  }, [chatWidth]);

  // Resize handler
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const sidebarWidth = sidebarCollapsed ? 48 : 224;
      const rightSidebarWidth = rightSidebarCollapsed ? 48 : 208;
      const newWidth = e.clientX - sidebarWidth;

      // Relaxed Constraints for better compatibility
      const minChatWidth = 400;
      const minDocWidth = 300;
      const availableSpace = window.innerWidth - sidebarWidth - rightSidebarWidth;
      const maxChatWidth = Math.max(minChatWidth, availableSpace - minDocWidth);

      if (newWidth >= minChatWidth && newWidth <= maxChatWidth) {
        setChatWidth(newWidth);
      }
    }
  }, [isResizing, sidebarCollapsed, rightSidebarCollapsed]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Sync progress stream to active card and extract file_created events
  useEffect(() => {
    if (currentCardId && progressStream.items.length > 0) {
      // Extract artifacts from file_created events (real-time updates)
      const fileCreatedArtifacts = progressStream.items
        .filter(item => item.type === 'file_created')
        .map(item => ({
          filename: item.filename,
          type: item.filename?.split('.').pop()?.toUpperCase() || 'FILE',
          url: getFileUrl(item.filename),
          previewUrl: getPreviewUrl(item.filename),
          isOutput: true,
          isPending: false,
          createdAt: new Date().toISOString()
        }));

      setProcessCards(prev => prev.map(card =>
        card.id === currentCardId
          ? { 
              ...card, 
              steps: progressStream.items,
              // Merge file_created artifacts with existing artifacts
              artifacts: fileCreatedArtifacts.length > 0 ? fileCreatedArtifacts : card.artifacts
            }
          : card
      ));

      // Add newly created files to allFiles and outputArtifacts in real-time
      if (fileCreatedArtifacts.length > 0) {
        // Add to outputArtifacts (avoids duplicates via addArtifacts)
        addArtifacts(fileCreatedArtifacts);
        
        // Update allFiles with new artifacts
        setAllFiles(prev => {
          const withoutPending = prev.filter(f => !f.isPending);
          const existingFilenames = new Set(withoutPending.map(f => f.filename));
          const newFiles = fileCreatedArtifacts.filter(f => !existingFilenames.has(f.filename));
          return [...newFiles, ...withoutPending];
        });

        // Auto-select the latest artifact if none selected
        if (!activeArtifact || activeArtifact.isPending) {
          const latestArtifact = fileCreatedArtifacts[fileCreatedArtifacts.length - 1];
          selectArtifact(latestArtifact);
          
          const ext = latestArtifact.type?.toLowerCase();
          if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
            setDocumentPreviewLoading(true);
          }
        }

        // Clear pending artifact
        setPendingArtifact(null);
      }

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
    if (!ragAvailable || !filename) return;

    setRagIndexing(true);
    try {
      await indexDocument(filename, sessionId);
      setRagIndexedDocuments(true);
    } catch (error) {
      console.error('Failed to index document for RAG:', error);
    } finally {
      setRagIndexing(false);
    }
  }, [ragAvailable, sessionId]);

  useEffect(() => {
    checkRagStatus();
  }, [checkRagStatus]);

  // Handle returning from editor with saved file
  useEffect(() => {
    // Case 1: Returning with saved file (needs RAG re-indexing)
    if (location.state?.savedFile && location.state?.savedAt) {
      const savedFilename = location.state.savedFile;
      const savedAt = location.state.savedAt;
      console.log('Returning from editor with saved file:', savedFilename);

      const freshPreviewUrl = getPreviewUrl(savedFilename);

      // 1. Update file list (refresh existing or add new)
      setAllFiles(prev => {
        const existingFileIndex = prev.findIndex(f => f.filename === savedFilename);

        if (existingFileIndex >= 0) {
          // Refresh existing file metadata
          const updatedFiles = [...prev];
          const updatedFile = {
            ...updatedFiles[existingFileIndex],
            previewUrl: freshPreviewUrl,
            lastSaved: savedAt
          };
          updatedFiles[existingFileIndex] = updatedFile;

          // Trigger selection for the updated file immediately
          selectArtifact(updatedFile);
          return updatedFiles;
        } else {
          // If for some reason it's a new file (e.g. Save As), add it to top
          const newFile = {
            filename: savedFilename,
            type: savedFilename.split('.').pop().toUpperCase(),
            url: getFileUrl(savedFilename),
            previewUrl: freshPreviewUrl,
            isOutput: true,
            createdAt: new Date().toISOString(),
            lastSaved: savedAt
          };

          // Trigger selection for the new file
          selectArtifact(newFile);
          return [newFile, ...prev];
        }
      });

      // Trigger RAG re-indexing for the saved file
      if (ragAvailable) {
        indexDocumentForRag(savedFilename);
      }

      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Case 2: Returning without save (just auto-select the file)
    else if (location.state?.returnedFile) {
      const returnedFilename = location.state.returnedFile;
      console.log('Returning from editor (no save), auto-selecting:', returnedFilename);

      // Find and select the file with fresh preview URL
      setAllFiles(prev => {
        const existingFile = prev.find(f => f.filename === returnedFilename);
        if (existingFile) {
          const freshFile = { ...existingFile, previewUrl: getPreviewUrl(returnedFilename) };
          selectArtifact(freshFile);
        }
        return prev;
      });

      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, ragAvailable, selectArtifact, indexDocumentForRag]);

  // Session handlers
  const handleNewChat = useCallback(async () => {
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
  }, [createNewSession, sessionId]);

  // Handle new chat request from Navigation State (forceNew)
  const resetTriggered = useRef(false);
  useEffect(() => {
    // Check if we came from a link with state={{ forceNew: true }}
    const shouldForceNew = location.state?.forceNew === true;

    if (shouldForceNew && !resetTriggered.current) {
      console.log('Handling forced new chat request...');
      resetTriggered.current = true;

      // 1. Perform reset logic
      handleNewChat();

      // 2. Clear the location state to prevent re-triggering on refresh
      // We keep the pathname and search params (like ?skill=docx) intact
      navigate(location.pathname + location.search, { replace: true, state: {} });

      // 3. Reset ref after delay
      setTimeout(() => {
        resetTriggered.current = false;
      }, 500);
    }
  }, [location.state, location.pathname, location.search, navigate, handleNewChat]);

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
      ...outputArtifacts.slice(-10).map(f => f.filename)  // Expanded from 3 to 10 for better document awareness
    ];

    // Clear uploaded files from input area after they're included in the prompt
    // They've been "sent" with the message, so thumbnails should disappear
    if (uploadedFiles.length > 0) {
      setUploadedFiles([]);
    }

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
      // Build file details message for chat response
      const fileDetailsMessage = response.new_artifacts?.length > 0
        ? `\n\n**Created Files:**\n${response.new_artifacts.map(f => `- \`${f}\``).join('\n')}`
        : '';

      // Add execution complete step and append file details to response
      // IMPORTANT: Use the card's accumulated steps (which were synced during processing)
      // and merge with any new progressStream items to avoid missing steps
      setProcessCards(prev => prev.map(card => {
        if (card.id !== cardId) return card;

        // Get existing steps from the card (accumulated during processing)
        const existingSteps = card.steps || [];

        // Get any new items from progressStream that aren't already in steps
        const existingIds = new Set(existingSteps.map(s => s.id));
        const newProgressItems = progressStream.items.filter(item => !existingIds.has(item.id));

        // Merge existing steps with any new items
        const allSteps = [...existingSteps, ...newProgressItems];

        // Add execution complete step if files were created
        const finalSteps = response.new_artifacts?.length > 0
          ? [
            ...allSteps,
            {
              id: 'exec-complete-' + Date.now(),
              type: 'step_complete',
              title: `Execution Complete - ${response.new_artifacts.length} file(s) created`,
              message: `Successfully generated: ${response.new_artifacts.join(', ')}`,
              status: 'complete',
              duration: 0
            }
          ]
          : allSteps;

        return {
          ...card,
          steps: finalSteps,
          finalResult: response.response + fileDetailsMessage,
          status: 'completed',
          isCollapsed: true  // Auto-collapse after completion - user can expand to view steps
        };
      }));

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
          // Auto-collapse left sidebar when first artifact is created
          if (!sidebarCollapsed) {
            setSidebarCollapsed(true);
          }

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
        // No new artifacts were created
        if (pendingArtifact) {
          setPendingArtifact(null);
          setAllFiles(prev => prev.filter(f => !f.isPending));
        }

        // Stop preview loading state
        setDocumentPreviewLoading(false);

        // Check if this was expected to create a file but didn't
        // Look for common file operation keywords in the query
        const queryLower = query.toLowerCase();
        const isFileOperation = ['create', 'generate', 'make', 'build', 'write', 'add', 'edit', 'modify', 'update'].some(
          word => queryLower.includes(word)
        );

        // If it looks like a file operation but no file was created, mark as warning
        if (isFileOperation && !response.response?.toLowerCase().includes('error')) {
          setProcessCards(prev => prev.map(card =>
            card.id === cardId
              ? {
                ...card,
                status: 'warning',
                finalResult: response.response + '\n\n⚠️ No new document was generated. The operation may have encountered issues. Please try again or rephrase your request.'
              }
              : card
          ));
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
      // Note: uploadFilesHandler already adds to uploadedFiles in useFiles hook
      // Only add to allFiles for sidebar display
      setAllFiles(prev => [...newFiles, ...prev]);
      // Don't auto-select uploaded files - let user prompt first
      // Document viewer will show when output artifacts are created

      const successMsg = newFiles.length === 1
        ? `Uploaded: ${newFiles[0].filename}`
        : `Uploaded ${newFiles.length} files: ${newFiles.map(f => f.filename).join(', ')}`;

      setMessages(prev => [...prev, { role: 'system', text: successMsg }]);

      // Don't index to RAG immediately - let user modify files first
      // RAG indexing will happen when user sends a prompt (backend handles via context_files)
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
    <div className={`flex h-screen w-full bg-light-bg overflow-hidden ${isResizing ? 'cursor-col-resize' : ''}`}>
      {/* Global Resize Overlay - Prevents iframe from stealing mouse events */}
      {isResizing && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize" />
      )}

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
      <div
        className={`flex flex-col h-full border-r border-light-border transition-shadow duration-300 ${allFiles.length > 0 ? '' : 'flex-1'} ${isResizing ? 'select-none shadow-[4px_0_15px_rgba(0,0,0,0.05)] z-10' : ''}`}
        style={{ width: allFiles.length > 0 ? `${chatWidth}px` : 'auto' }}
      >
        {/* Header - Home (Left), Logo (Center), New Chat (Right) */}
        <div className="h-16 border-b border-light-border flex items-center justify-between px-4 bg-light-bg relative">
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? '/app' : '/'}
              className="p-2.5 text-brand-accent-500 hover:text-brand-accent-700 hover:bg-brand-accent-50 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95"
              title={isAuthenticated ? 'Back to Dashboard' : 'Back to Tools'}
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img
              src="/genX.png"
              alt="Phi"
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="flex items-center">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl shadow-md shadow-brand-accent-200/40 transition-all active:scale-95 uppercase tracking-wider"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
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
            <ChatPane
              processCards={processCards}
              setProcessCards={setProcessCards}
              enhancementCards={enhancementCards}
              onRetry={handleRetry}
              onViewEnhancedFile={(filename) => {
                const file = allFiles.find(f => f.filename === filename);
                if (file) {
                  selectArtifact(file);
                }
              }}
            />

            {/* Input Area - Recessed Command Center */}
            <div className="border-t border-brand-accent-100/50 bg-terminal-light p-6">
              {/* Uploaded Files Row - Thumbnail Cards */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3 px-2">
                  {uploadedFiles.map((file) => (
                    <FileThumbnail
                      key={file.filename}
                      file={file}
                      onRemove={() => handleRemoveFile(file, true)}
                    />
                  ))}
                </div>
              )}

              {/* Main Input Row - Neumorphic/High-end effect */}
              <form onSubmit={handleSendMessage} className="relative flex flex-col gap-3 bg-white border border-brand-accent-200 shadow-[inset_0_2px_4px_0_rgba(136,108,74,0.03),0_10px_30px_rgba(136,108,74,0.05)] rounded-[1.5rem] p-3 focus-within:border-brand-accent-400 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={skillParam ? `Execute doc command for ${getSkillDisplayName(skillParam)}...` : "Type a command or ask a question..."}
                    className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-[15px] text-light-text placeholder-light-text-muted/60 font-medium"
                    disabled={isProcessing}
                  />

                  {isProcessing ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
                      title="Stop Execution"
                    >
                      <Square className="w-5 h-5 flex-shrink-0" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-3 bg-brand-accent-600 text-white rounded-xl hover:bg-brand-accent-700 transition-all disabled:opacity-30 disabled:grayscale active:scale-95 shadow-lg shadow-brand-accent-200"
                      title="Execute Command"
                    >
                      <Send className="w-5 h-5 flex-shrink-0" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-2 pt-1 border-t border-brand-accent-50/50">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg transition-all"
                    >
                      {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                      ATTACH_FILES
                    </button>

                    <div className="w-[1px] h-4 bg-brand-accent-100 mx-1" />

                    <button
                      type="button"
                      onClick={() => setWebModeEnabled(!webModeEnabled)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${webModeEnabled
                        ? 'text-white bg-brand-accent-600 shadow-sm'
                        : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50'
                        }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      LIVE_SURF
                    </button>
                  </div>

                  <ConnectMenu
                    sessionId={sessionId}
                    connectors={connectors}
                    connectionStatus={connectionStatus}
                    activeConnectors={activeConnectors}
                    onToggleConnector={toggleConnector}
                    onConnectApp={connectApp}
                    connectAvailable={connectAvailable}
                  />
                </div>
              </form>

              <div className="text-center mt-2 text-xs text-light-text-muted">
                Phi Docs can make mistakes. Please double-check responses.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resize Divider */}
      {(allFiles.length > 0 || pendingArtifact) && (
        <div
          onMouseDown={startResizing}
          className={`w-3 h-full cursor-col-resize flex-shrink-0 transition-colors z-30 group relative ${isResizing ? 'bg-brand-accent-100/30' : 'bg-transparent hover:bg-brand-accent-50'
            }`}
        >
          {/* Visual Indicator - centered thin line */}
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${isResizing ? 'bg-brand-accent-600 w-[2px]' : 'bg-brand-accent-200 group-hover:bg-brand-accent-400'
            }`} />

          {/* Subtle grabber visual in the middle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center">
            <div className={`w-1 h-4 rounded-full ${isResizing ? 'bg-brand-accent-600' : 'bg-brand-accent-100 group-hover:bg-brand-accent-300'}`} />
          </div>
        </div>
      )}

      {/* Right Section: Document Viewer + File List */}
      {
        (allFiles.length > 0 || pendingArtifact) && (
          <div className="flex-1 flex h-full bg-light-bg">
            {/* Document Viewer */}
            <div className="flex-1 flex flex-col border-r border-light-border">
              <div className="h-16 border-b border-light-border flex items-center justify-end px-6 bg-light-bg">
                {activeArtifact && !activeArtifact.isPending && activeArtifact.url && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/editor', { state: { file: activeArtifact } })}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl shadow-lg shadow-brand-accent-200/50 transition-all duration-200 uppercase tracking-wider active:scale-95"
                      title="Open in Workspace Canvas"
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                      WORKSPACE_CANVAS
                    </button>
                    {['docx', 'pptx', 'xlsx', 'pdf'].includes(activeArtifact.type?.toLowerCase()) && (
                      <button
                        onClick={handleEnhanceWithImages}
                        disabled={isEnhancing}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-brand-accent-200/50 transition-all duration-200 uppercase tracking-wider active:scale-95"
                        title="Add AI-generated images to this document"
                      >
                        {isEnhancing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        {isEnhancing ? 'ENHANCING...' : 'ENHANCE_WITH_AI'}
                      </button>
                    )}
                    <a
                      href={activeArtifact.url}
                      download={activeArtifact.filename}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text bg-white border border-brand-accent-100 hover:bg-brand-accent-50 hover:border-brand-accent-200 rounded-xl transition-all duration-200 uppercase tracking-wider active:scale-95 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-accent-500" />
                      DOWNLOAD
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
                    {/* File icons removed for cleaner collapsed state, matching left sidebar */}
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
                        onClick={() => {
                          // Refresh preview URL to ensure latest content is shown after editor return
                          const freshFile = { ...file, previewUrl: getPreviewUrl(file.filename) };
                          selectArtifact(freshFile);
                        }}
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
