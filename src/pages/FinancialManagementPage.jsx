import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Square } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useFiles } from '../hooks/useFiles';
import { useArtifacts } from '../hooks/useArtifacts';
import { useProgressStream } from '../hooks/useProgressStream';
import { sendMessage } from '../api/chat';
import { getFileUrl, getPreviewUrl, clearArtifacts, clearUploads } from '../api/files';
import { saveSessionData, loadSessionData, getStorageItem, setStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import FileUploadSidebar from '../components/shared/FileUploadSidebar';
import DocumentViewer from '../components/shared/DocumentViewer';
import AIChatSidebar from '../components/shared/AIChatSidebar';
import FinancePromptSuggestions from '../components/finance/FinancePromptSuggestions';
import Header from '../components/layout/Header';

/**
 * FinancialManagementPage - Specialized page for financial report generation
 * Three-column layout: FileUploadSidebar | DocumentViewer | AIChatSidebar
 * Complete feature parity with ChatPage
 */
const FinancialManagementPage = () => {
  // Session management
  const { sessionId, createNewSession } = useSession();
  
  // File management
  const { uploadedFiles, isUploading, uploadFiles: uploadFilesHandler, removeFile, clearFiles } = useFiles(sessionId);
  
  // Artifact management - extract ALL state from useArtifacts
  const {
    outputArtifacts,
    addArtifacts,
    selectArtifact,
    removeArtifact,
    activeArtifact,
    artifactContent,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    documentPreviewLoading,
    setDocumentPreviewLoading,
    previewLoading,
    setOutputArtifacts,
    setActiveArtifact
  } = useArtifacts();
  
  // Progress streaming
  const progressStream = useProgressStream(sessionId);

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
  const [currentCardId, setCurrentCardId] = useState(null);

  // Local state
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allFiles, setAllFiles] = useState(() => {
    const currentSessionId = getStorageItem(STORAGE_KEYS.SESSION_ID);
    if (currentSessionId) {
      const sessionData = loadSessionData(currentSessionId);
      if (sessionData?.allFiles?.length > 0) {
        return sessionData.allFiles.map((f) => ({
          ...f,
          url: f.url?.startsWith('/api') ? f.url : getFileUrl(f.filename),
          previewUrl: f.previewUrl || getPreviewUrl(f.filename)
        }));
      }
    }
    return getStorageItem(STORAGE_KEYS.ALL_FILES, []) || [];
  });
  const [pendingArtifact, setPendingArtifact] = useState(null);
  
  // Resize state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('demo_left_sidebar_width') || '280', 10);
  });
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('demo_right_sidebar_width') || '320', 10);
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Refs
  const abortControllerRef = useRef(null);

  // Finance-specific prompt suggestions
  const financeSuggestions = [
    "Analyze this data and generate all financial reports with charts",
    "Create comprehensive financial package: dashboard, PDF summary, and analysis report",
    "Generate Excel dashboard with charts from this data",
    "Create executive summary PDF and full analysis report",
    "Generate monthly sales report with visualizations"
  ];

  // Utility functions for pending artifacts
  const extractSkillFromEvent = useCallback((text) => {
    if (!text) return null;
    const match = text.match(/for\s+(\w+)/i);
    if (match && match[1]) return match[1].toLowerCase();
    const skillPatterns = ['docx', 'pptx', 'xlsx', 'pdf'];
    const lowerText = text.toLowerCase();
    for (const skill of skillPatterns) {
      if (lowerText.includes(skill)) return skill;
    }
    return null;
  }, []);

  const getFileTypeFromSkill = useCallback((skill) => {
    const mapping = {
      'docx': { ext: 'docx', type: 'DOCX' },
      'pptx': { ext: 'pptx', type: 'PPTX' },
      'ppt': { ext: 'pptx', type: 'PPTX' },
      'xlsx': { ext: 'xlsx', type: 'XLSX' },
      'xls': { ext: 'xlsx', type: 'XLSX' },
      'pdf': { ext: 'pdf', type: 'PDF' }
    };
    return mapping[skill?.toLowerCase()] || { ext: 'docx', type: 'DOCX' };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (!sessionId) {
      createNewSession();
    }
  }, [sessionId, createNewSession]);

  // Load session data on mount
  useEffect(() => {
    if (sessionId) {
      const sessionData = loadSessionData(sessionId);
      if (sessionData?.processCards?.length > 0) {
        setProcessCards(sessionData.processCards);
      }
      if (sessionData?.allFiles?.length > 0) {
        setAllFiles(sessionData.allFiles.map((f) => ({
          ...f,
          url: f.url?.startsWith('/api') ? f.url : getFileUrl(f.filename),
          previewUrl: f.previewUrl || getPreviewUrl(f.filename)
        })));
      }
    }
  }, [sessionId]);

  // Sync allFiles with uploadedFiles and outputArtifacts (preserve pending via functional update)
  useEffect(() => {
    const combined = [
      ...uploadedFiles.map(f => ({ ...f, isOutput: false })),
      ...outputArtifacts.map(a => ({ ...a, isOutput: true }))
    ];
    setAllFiles(prev => {
      const pending = prev.filter(f => f.isPending);
      return [...pending, ...combined];
    });
  }, [uploadedFiles, outputArtifacts]);

  // Persist process cards and allFiles
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PROCESS_CARDS, processCards);
    saveSessionData(sessionId, processCards, allFiles);
  }, [processCards, sessionId, allFiles]);

  // Sync progress stream to process cards
  useEffect(() => {
    if (currentCardId && progressStream.items.length > 0) {
      setProcessCards(prev => prev.map(card => {
        if (card.id !== currentCardId) return card;
        const existingSteps = card.steps || [];
        const existingIds = new Set(existingSteps.map(s => s.id));
        const newProgressItems = progressStream.items.filter(item => !existingIds.has(item.id));
        return {
          ...card,
          steps: [...existingSteps, ...newProgressItems]
        };
      }));
    }
  }, [progressStream.items, currentCardId]);

  // Detect code_start events and create pending artifacts
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressStream.items, isProcessing, extractSkillFromEvent, getFileTypeFromSkill]);

  // Track artifacts from progress stream file_created events
  useEffect(() => {
    const fileCreatedEvents = progressStream.items.filter(
      item => item.type === 'file_created'
    );

    if (fileCreatedEvents.length > 0) {
      const newArtifacts = fileCreatedEvents.map(event => ({
        filename: event.filename,
        type: event.filename.split('.').pop().toUpperCase(),
        url: getFileUrl(event.filename),
        previewUrl: getPreviewUrl(event.filename),
        isOutput: true,
        createdAt: new Date().toISOString()
      }));
      addArtifacts(newArtifacts);
    }
  }, [progressStream.items, addArtifacts]);

  // Auto-preview uploaded files
  useEffect(() => {
    if (uploadedFiles.length > 0 && !activeArtifact) {
      const latestFile = uploadedFiles[uploadedFiles.length - 1];
      selectArtifact(latestFile);
    }
  }, [uploadedFiles, activeArtifact, selectArtifact]);

  // Persist sidebar widths
  useEffect(() => {
    localStorage.setItem('demo_left_sidebar_width', leftSidebarWidth.toString());
  }, [leftSidebarWidth]);

  useEffect(() => {
    localStorage.setItem('demo_right_sidebar_width', rightSidebarWidth.toString());
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

  // Stop generation handler
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
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
  }, [pendingArtifact]);

  // Retry handler
  const handleRetry = useCallback((query) => {
    handleSendMessage(query, uploadedFiles.map(f => f.filename), null);
  }, [uploadedFiles]);

  // Clear all handler
  const handleClearAll = useCallback(async () => {
    try {
      await clearArtifacts();
      await clearUploads();
      clearFiles();
      setOutputArtifacts([]);
      setActiveArtifact(null);
      setProcessCards([]);
      setAllFiles([]);
      setChatMessages([]);
      setPendingArtifact(null);
      await createNewSession();
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }, [createNewSession, clearFiles, setOutputArtifacts, setActiveArtifact]);

  // File removal handler
  const handleRemoveFile = useCallback((file, isUpload) => {
    if (isUpload) {
      removeFile(file.filename);
    } else {
      removeArtifact(file.filename);
    }
    if (activeArtifact?.filename === file.filename) {
      setActiveArtifact(null);
    }
    setAllFiles(prev => prev.filter(f => f.filename !== file.filename));
  }, [removeFile, removeArtifact, activeArtifact, setActiveArtifact]);

  // Toggle card handler
  const handleToggleCard = useCallback((cardId) => {
    setProcessCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, isCollapsed: !card.isCollapsed } : card
    ));
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback(async (message, contextFiles, signal) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Create process card
    const cardId = `card-${Date.now()}`;
    setCurrentCardId(cardId);
    progressStream.clear();

    const newCard = {
      id: cardId,
      query: message,
      steps: [],
      finalResult: '',
      artifacts: [],
      status: 'processing',
      isCollapsed: false
    };
    setProcessCards(prev => [...prev, newCard]);

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Create abort controller
    abortControllerRef.current = signal ? { abort: () => {} } : new AbortController();
    const abortSignal = signal || abortControllerRef.current.signal;

    // Detect file operation
    const isFileOperation = ['create', 'generate', 'make', 'build', 'write', 'add', 'edit', 'modify', 'update'].some(
      word => message.toLowerCase().includes(word)
    );

    try {
      // Get file names for context
      const fileNames = contextFiles || uploadedFiles.map(f => f.filename);

      // Send message with demo_mode
      const response = await sendMessage(
        message,
        fileNames,
        sessionId,
        activeArtifact?.filename || null,
        currentPage,
        [], // connectors
        abortSignal,
        null, // skill_hint
        null, // template_id
        [], // web_urls
        false, // web_mode_enabled
        'finance' // demo_mode
      );

      // Update process card with response
      setProcessCards(prev => prev.map(card => {
        if (card.id !== cardId) return card;
        const existingSteps = card.steps || [];
        const existingIds = new Set(existingSteps.map(s => s.id));
        const newProgressItems = progressStream.items.filter(item => !existingIds.has(item.id));
        const allSteps = [...existingSteps, ...newProgressItems];
        
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

        const fileDetailsMessage = response.new_artifacts?.length > 0
          ? `\n\nGenerated ${response.new_artifacts.length} file(s): ${response.new_artifacts.join(', ')}`
          : '';

        return {
          ...card,
          steps: finalSteps,
          finalResult: response.response + fileDetailsMessage,
          artifacts: response.new_artifacts || response.artifacts || [],
          status: 'completed',
          isCollapsed: true
        };
      }));

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.response || 'Reports generated successfully',
        timestamp: new Date().toISOString(),
        artifacts: response.new_artifacts || response.artifacts || []
      };
      setChatMessages(prev => [...prev, assistantMessage]);

      // Track artifacts from response (use new_artifacts for newly created files only)
      const newArtifactFilenames = response.new_artifacts || response.artifacts || [];
      if (newArtifactFilenames.length > 0) {
        const newArtifacts = newArtifactFilenames.map(filename => ({
          filename,
          type: filename.split('.').pop().toUpperCase(),
          url: getFileUrl(filename),
          previewUrl: getPreviewUrl(filename),
          isOutput: true,
          createdAt: new Date().toISOString()
        }));
        addArtifacts(newArtifacts);

        // Update allFiles
        setAllFiles(prev => {
          const withoutPending = prev.filter(f => !f.isPending);
          return [...newArtifacts, ...withoutPending];
        });

        // Auto-select first artifact
        if (newArtifacts.length > 0) {
          const newArtifact = newArtifacts[0];
          const ext = newArtifact.type?.toLowerCase();
          
          selectArtifact(newArtifact);
          
          if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
            setDocumentPreviewLoading(true);
            setCurrentPage(1);
          }
        }

        // Clear pending artifact
        setPendingArtifact(null);
      } else {
        // No new artifacts were created
        if (pendingArtifact) {
          setPendingArtifact(null);
          setAllFiles(prev => prev.filter(f => !f.isPending));
        }

        // Check if this was expected to create a file but didn't
        if (isFileOperation && !response.response?.toLowerCase().includes('error')) {
          setProcessCards(prev => prev.map(card =>
            card.id === cardId
              ? {
                ...card,
                status: 'warning',
                finalResult: response.response + '\n\n⚠️ No new document was generated. Please try again or rephrase your request.'
              }
              : card
          ));
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        setProcessCards(prev => prev.map(card =>
          card.id === cardId
            ? {
              ...card,
              status: 'error',
              finalResult: `Error: ${error.response?.data?.detail || error.message || 'Something went wrong'}`
            }
            : card
        ));
        const errorMessage = {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to generate reports'}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
      if (pendingArtifact) {
        setPendingArtifact(null);
        setAllFiles(prev => prev.filter(f => !f.isPending));
      }
    } finally {
      setIsProcessing(false);
      setCurrentCardId(null);
      abortControllerRef.current = null;
    }
  }, [sessionId, uploadedFiles, isProcessing, addArtifacts, selectArtifact, activeArtifact, currentPage, setCurrentPage, setDocumentPreviewLoading, progressStream, pendingArtifact]);

  // Handle file preview
  const handlePreview = useCallback((doc) => {
    selectArtifact(doc);
  }, [selectArtifact]);

  // Handle file download
  const handleDownload = useCallback((doc) => {
    const url = getFileUrl(doc.filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-light-bg">
      {/* Header */}
      <Header 
        ragAvailable={false} 
        ragIndexedDocuments={false}
        onClearAll={handleClearAll}
      />

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Upload */}
        <div style={{ width: `${leftSidebarWidth}px` }} className="flex-shrink-0 overflow-hidden">
          <FileUploadSidebar
            sessionId={sessionId}
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            onUploadFiles={uploadFilesHandler}
            onRemoveFile={removeFile}
            maxFiles={10}
            acceptedTypes={['.csv', '.xlsx', '.xls', '.docx', '.pdf']}
            demoMode="finance"
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

        {/* Center - Document Viewer */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <DocumentViewer
            documents={allFiles}
            activeArtifact={activeArtifact}
            artifactContent={artifactContent}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            documentPreviewLoading={documentPreviewLoading}
            setDocumentPreviewLoading={setDocumentPreviewLoading}
            previewLoading={previewLoading}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onRemoveFile={handleRemoveFile}
            viewMode="grid"
            demoMode="finance"
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

        {/* Right Sidebar - AI Chat */}
        <div style={{ width: `${rightSidebarWidth}px` }} className="flex-shrink-0 overflow-hidden">
          <AIChatSidebar
            sessionId={sessionId}
            contextFiles={uploadedFiles.map(f => f.filename)}
            onSendMessage={handleSendMessage}
            messages={chatMessages}
            isLoading={isProcessing}
            isProcessing={isProcessing}
            suggestions={financeSuggestions}
            demoMode="finance"
            processCards={processCards}
            onToggleCard={handleToggleCard}
            onRetry={handleRetry}
            onStopGeneration={handleStopGeneration}
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialManagementPage;
