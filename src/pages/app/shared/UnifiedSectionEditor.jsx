import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Share2, Settings } from 'lucide-react';

import { useSession } from '../../../hooks/useSession';
import { useFiles } from '../../../hooks/useFiles';
import { useArtifacts } from '../../../hooks/useArtifacts';
import { useProgressStream } from '../../../hooks/useProgressStream';
import { useConnect } from '../../../hooks/useConnect';
import { sendMessage } from '../../../api/chat';
import { getFileUrl, getPreviewUrl, clearArtifacts, clearUploads, enhanceWithImages } from '../../../api/files';
import { saveSessionData, loadSessionData, deleteSessionData, getStorageItem, setStorageItem } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../utils/constants';
import { listSkills } from '../../../api/skills';

import FileUploadSidebar from '../../../components/shared/FileUploadSidebar';
import DocumentViewer from '../../../components/shared/DocumentViewer';
import AIChatSidebar from '../../../components/shared/AIChatSidebar';
import ChatHistorySidebar from '../../../components/layout/ChatHistorySidebar';
import ConnectMenu from '../../../components/connect/ConnectMenu';
import TemplateCard from '../../../components/cards/TemplateCard';
import { FILE_TYPE_CATEGORIES, TEMPLATE_FILE_TYPES } from '../../../workspace/templatesConfig';
import { extractUrls, isValidUrl } from '../../../workspace/workspaceUtils';
import EnhancementCard from '../../../features/artifacts/components/EnhancementCard';

/**
 * UnifiedSectionEditor - A generic 3-pane editor for departmental workspaces
 */
const UnifiedSectionEditor = ({ 
  sectionName = 'General', 
  sectionKey = 'general',
  suggestions = [],
  backTo = '/app/dashboard',
  employee = null,
  initialFiles = []
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillFromUrl = searchParams.get('skill');

  const {
    sessionId,
    chatHistory,
    createNewSession,
    selectSession: selectSessionHandler,
    deleteSession: deleteSessionHandler,
    updateChatHistory
  } = useSession();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return getStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  });

  // Skill hint (all-skills everywhere): default is "auto" (null) unless URL specifies.
  const [skillHint, setSkillHint] = useState(() => skillFromUrl || null);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Templates (B2B parity)
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateFileType, setTemplateFileType] = useState(() => {
    const s = String(skillFromUrl || '').toLowerCase();
    return TEMPLATE_FILE_TYPES.includes(s) ? s : 'docx';
  });
  const [templateCategory, setTemplateCategory] = useState('all');
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Web mode (B2B parity)
  const [webModeEnabled, setWebModeEnabled] = useState(false);

  // Enhance-with-images (ChatPage parity)
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementCards, setEnhancementCards] = useState([]);
  
  // States and Hooks (reusing logic from HRIntegrationPage)
  const { uploadedFiles, isUploading, uploadFiles: uploadFilesHandler, removeFile, clearFiles } = useFiles(sessionId);
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
    documentPreviewLoading,
    setDocumentPreviewLoading,
    previewLoading,
    setOutputArtifacts,
    setActiveArtifact
  } = useArtifacts();
  
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
  const normalizeIncomingFiles = useCallback((files) => {
    return (files || [])
      .filter((f) => f?.filename)
      .map((f) => ({
        ...f,
        isPinned: true,
        isOutput: false,
        url: f.url?.startsWith('/api') ? f.url : getFileUrl(f.filename),
        previewUrl: f.previewUrl?.startsWith('/api') ? f.previewUrl : (f.previewUrl || getPreviewUrl(f.filename))
      }));
  }, []);

  const [pinnedFiles, setPinnedFiles] = useState(() => normalizeIncomingFiles(initialFiles));
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

  // Connect integrations (ChatPage parity)
  const {
    connectors,
    connectionStatus,
    activeConnectors,
    connectAvailable,
    toggleConnector,
    connectApp,
    getIntegrations
  } = useConnect(sessionId);

  // Handle returning from /editor with saved/returned file (ChatPage parity)
  useEffect(() => {
    if (location.state?.savedFile && location.state?.savedAt) {
      const savedFilename = location.state.savedFile;
      const savedAt = location.state.savedAt;
      const freshPreviewUrl = getPreviewUrl(savedFilename);

      setAllFiles(prev => {
        const idx = prev.findIndex(f => f.filename === savedFilename);
        if (idx >= 0) {
          const updated = [...prev];
          const updatedFile = { ...updated[idx], previewUrl: freshPreviewUrl, lastSaved: savedAt };
          updated[idx] = updatedFile;
          selectArtifact(updatedFile);
          return updated;
        }
        const newFile = {
          filename: savedFilename,
          type: savedFilename.split('.').pop().toUpperCase(),
          url: getFileUrl(savedFilename),
          previewUrl: freshPreviewUrl,
          isOutput: true,
          createdAt: new Date().toISOString(),
          lastSaved: savedAt
        };
        selectArtifact(newFile);
        return [newFile, ...prev];
      });

      navigate(location.pathname + location.search, { replace: true, state: {} });
    } else if (location.state?.returnedFile) {
      const returnedFilename = location.state.returnedFile;
      setAllFiles(prev => {
        const existingFile = prev.find(f => f.filename === returnedFilename);
        if (existingFile) {
          const freshFile = { ...existingFile, previewUrl: getPreviewUrl(returnedFilename) };
          selectArtifact(freshFile);
        }
        return prev;
      });
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, location.search, navigate, selectArtifact, setAllFiles]);
  
  // Resize state
  const leftWidthKey = `unified_editor_${sectionKey}_left_width`;
  const rightWidthKey = `unified_editor_${sectionKey}_right_width`;
  const [leftWidth, setLeftWidth] = useState(() => {
    return parseInt(localStorage.getItem(leftWidthKey) || '280', 10);
  });
  const [rightWidth, setRightWidth] = useState(() => {
    return parseInt(localStorage.getItem(rightWidthKey) || '320', 10);
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const abortControllerRef = useRef(null);

  // Persist sidebar collapse state (same key as ChatPage for consistency)
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Utility functions for pending artifacts (same approach as demo pages)
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

  // Load skills list (for optional skill picker; does not restrict usage)
  useEffect(() => {
    const run = async () => {
      try {
        const data = await listSkills();
        const skills = Array.isArray(data?.skills) ? data.skills : [];
        setAvailableSkills(skills);
      } catch {
        setAvailableSkills([]);
      }
    };
    run();
  }, []);

  // Sync skill hint from URL if it changes
  useEffect(() => {
    setSkillHint(skillFromUrl || null);
  }, [skillFromUrl]);

  // Sync default template file type from URL skill if applicable
  useEffect(() => {
    const s = String(skillFromUrl || '').toLowerCase();
    if (TEMPLATE_FILE_TYPES.includes(s)) {
      setTemplateFileType(s);
      setTemplateCategory('all');
    }
  }, [skillFromUrl]);

  // Fetch templates when modal open and filters change
  useEffect(() => {
    if (!templatesOpen) return;
    if (!TEMPLATE_FILE_TYPES.includes(templateFileType)) return;

    const run = async () => {
      setTemplatesLoading(true);
      try {
        const categoryParam = templateCategory === 'all' ? '' : `&category=${templateCategory}`;
        const resp = await fetch(`/api/templates?file_type=${templateFileType}${categoryParam}`);
        const data = await resp.json().catch(() => ({}));
        setTemplates(Array.isArray(data?.templates) ? data.templates : []);
      } catch (e) {
        console.error('Failed to load templates:', e);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    run();
  }, [templatesOpen, templateFileType, templateCategory]);

  const getFileTypeFromSkill = useCallback((skill) => {
    const mapping = {
      docx: { ext: 'docx', type: 'DOCX' },
      pptx: { ext: 'pptx', type: 'PPTX' },
      ppt: { ext: 'pptx', type: 'PPTX' },
      xlsx: { ext: 'xlsx', type: 'XLSX' },
      xls: { ext: 'xlsx', type: 'XLSX' },
      pdf: { ext: 'pdf', type: 'PDF' }
    };
    return mapping[skill?.toLowerCase()] || { ext: 'docx', type: 'DOCX' };
  }, []);

  const acceptedTypes = React.useMemo(() => {
    // B2B requirement: all editors can create/use all supported document types.
    return [
      '.docx', '.doc',
      '.xlsx', '.xls', '.csv',
      '.pptx', '.ppt',
      '.pdf',
      '.png', '.jpg', '.jpeg', '.gif', '.webp',
      '.txt', '.md', '.json', '.xml', '.html'
    ];
  }, []);

  // Initialize
  useEffect(() => {
    if (!sessionId) createNewSession();
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

  // Apply/refresh pinned files from navigation state (employee docs preload)
  useEffect(() => {
    const nextPinned = normalizeIncomingFiles(initialFiles);
    if (nextPinned.length > 0) {
      setPinnedFiles(nextPinned);
    }
  }, [initialFiles, normalizeIncomingFiles]);

  useEffect(() => {
    const uniqueByFilename = (list) => {
      const seen = new Set();
      const out = [];
      for (const item of list) {
        if (!item?.filename) continue;
        if (seen.has(item.filename)) continue;
        seen.add(item.filename);
        out.push(item);
      }
      return out;
    };

    const combined = [
      ...pinnedFiles.map(f => ({ ...f, isPinned: true, isOutput: false })),
      ...uploadedFiles.map(f => ({ ...f, isOutput: false })),
      ...outputArtifacts.map(a => ({ ...a, isOutput: true }))
    ];
    setAllFiles(prev => {
      const pending = prev.filter(f => f.isPending);
      return [...pending, ...uniqueByFilename(combined)];
    });
  }, [pinnedFiles, uploadedFiles, outputArtifacts]);

  // Persist process cards and allFiles
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PROCESS_CARDS, processCards);
    saveSessionData(sessionId, processCards, allFiles);
    if (processCards.length > 0) {
      const firstQuery = processCards[0]?.query || `${sectionName} Workspace`;
      updateChatHistory(sessionId, firstQuery);
    }
  }, [processCards, sessionId, allFiles, updateChatHistory, sectionName]);

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
          }
          return [newPendingArtifact, ...prev];
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
    localStorage.setItem(leftWidthKey, leftWidth.toString());
  }, [leftWidthKey, leftWidth]);

  useEffect(() => {
    localStorage.setItem(rightWidthKey, rightWidth.toString());
  }, [rightWidthKey, rightWidth]);

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

  // File removal handler
  const handleRemoveFile = useCallback((file, isUpload) => {
    if (file?.isPinned) {
      setPinnedFiles(prev => prev.filter(f => f.filename !== file.filename));
      if (activeArtifact?.filename === file.filename) {
        setActiveArtifact(null);
      }
      setAllFiles(prev => prev.filter(f => f.filename !== file.filename));
      return;
    }
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

  // Full parity message handler (generalized by sectionKey → demo_mode)
  const handleSendMessage = useCallback(async (message, contextFiles, signal, templateId = null) => {
    if ((!message.trim() && !templateId) || isProcessing) return;

    setIsProcessing(true);

    // Create process card
    const cardId = `card-${Date.now()}`;
    setCurrentCardId(cardId);
    progressStream.clear();

    const newCard = {
      id: cardId,
      query: message || (templateId ? `Use template: ${templateId}` : ''),
      steps: [],
      finalResult: '',
      artifacts: [],
      status: 'processing',
      isCollapsed: false
    };
    setProcessCards(prev => [...prev, newCard]);

    // Add user message (kept for compatibility; UI mainly uses cards)
    const userMessage = {
      role: 'user',
      content: message || (templateId ? `Use template: ${templateId}` : ''),
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Create abort controller
    abortControllerRef.current = signal ? { abort: () => {} } : new AbortController();
    const abortSignal = signal || abortControllerRef.current.signal;

    const isFileOperation = ['create', 'generate', 'make', 'build', 'write', 'add', 'edit', 'modify', 'update'].some(
      word => message.toLowerCase().includes(word)
    );

    try {
      const fileNames = contextFiles || [...pinnedFiles.map(f => f.filename), ...uploadedFiles.map(f => f.filename)];

      // Extract URLs if web mode enabled (ChatPage parity)
      let urls = [];
      if (webModeEnabled && message) {
        urls = extractUrls(message);
        urls = urls.filter(isValidUrl);
      }

      const response = await sendMessage(
        message,
        fileNames,
        sessionId,
        activeArtifact?.filename || null,
        currentPage,
        getIntegrations(), // connectors / integrations dict
        abortSignal,
        skillHint, // skill_hint
        templateId, // template_id
        urls, // web_urls
        webModeEnabled, // web_mode_enabled
        sectionKey // demo_mode
      );

      // Update process card
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
          finalResult: (response.response || '') + fileDetailsMessage,
          artifacts: response.new_artifacts || response.artifacts || [],
          status: 'completed',
          isCollapsed: true
        };
      }));

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.response || 'Completed successfully',
        timestamp: new Date().toISOString(),
        artifacts: response.new_artifacts || response.artifacts || []
      };
      setChatMessages(prev => [...prev, assistantMessage]);

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

        setAllFiles(prev => {
          const withoutPending = prev.filter(f => !f.isPending);
          return [...newArtifacts, ...withoutPending];
        });

        if (newArtifacts.length > 0) {
          const newArtifact = newArtifacts[0];
          const ext = newArtifact.type?.toLowerCase();

          selectArtifact(newArtifact);

          if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) {
            setDocumentPreviewLoading(true);
            setCurrentPage(1);
          }
        }

        setPendingArtifact(null);
      } else {
        if (pendingArtifact) {
          setPendingArtifact(null);
          setAllFiles(prev => prev.filter(f => !f.isPending));
        }

        if (isFileOperation && !response.response?.toLowerCase().includes('error')) {
          setProcessCards(prev => prev.map(card =>
            card.id === cardId
              ? {
                ...card,
                status: 'warning',
                finalResult: (response.response || '') + '\n\n⚠️ No new document was generated. Please try again or rephrase your request.'
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
          content: `Error: ${error.message || 'Failed'}`,
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
  }, [
    sessionId,
    uploadedFiles,
    pinnedFiles,
    isProcessing,
    addArtifacts,
    selectArtifact,
    activeArtifact,
    currentPage,
    setCurrentPage,
    setDocumentPreviewLoading,
    progressStream,
    pendingArtifact,
    sectionKey
  ]);

  // Retry handler (must be declared after handleSendMessage to avoid TDZ at runtime)
  const handleRetry = useCallback((query) => {
    handleSendMessage(query, [...pinnedFiles.map(f => f.filename), ...uploadedFiles.map(f => f.filename)], null);
  }, [pinnedFiles, uploadedFiles, handleSendMessage]);

  // Resizing logic
  const onMouseMove = useCallback((e) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      const minWidth = 200;
      const maxWidth = 500;
      const availableSpace = window.innerWidth - rightWidth;
      const maxAllowedWidth = Math.max(minWidth, availableSpace - 400);
      if (newWidth >= minWidth && newWidth <= Math.min(maxWidth, maxAllowedWidth)) {
        setLeftWidth(newWidth);
      }
    } else if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 250;
      const maxWidth = 600;
      const availableSpace = window.innerWidth - leftWidth;
      const maxAllowedWidth = Math.max(minWidth, availableSpace - 400);
      if (newWidth >= minWidth && newWidth <= Math.min(maxWidth, maxAllowedWidth)) {
        setRightWidth(newWidth);
      }
    }
  }, [isResizingLeft, isResizingRight, rightWidth, leftWidth]);

  const onMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isResizingLeft, isResizingRight, onMouseMove, onMouseUp]);

  // Enhance with images handler (ChatPage parity)
  const handleEnhanceWithImages = useCallback(async () => {
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

        setAllFiles(prev => [newFile, ...prev]);
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
  }, [isEnhancing, activeArtifact, sessionId, selectArtifact]);

  return (
    <div className="fixed inset-0 z-50 bg-light-bg flex flex-col overflow-hidden">
      {/* Templates Modal */}
      {templatesOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="px-6 py-4 border-b border-light-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-light-text">Templates</h3>
                <p className="text-sm text-light-text-secondary">
                  Select a template and then send a prompt (or send empty) to create from it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTemplatesOpen(false)}
                className="px-3 py-2 text-sm font-bold text-light-text-secondary hover:text-light-text rounded-xl hover:bg-light-bg"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-4 border-b border-light-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-light-text-secondary">FILE TYPE</div>
                <select
                  value={templateFileType}
                  onChange={(e) => { setTemplateFileType(e.target.value); setTemplateCategory('all'); }}
                  className="text-sm font-bold px-3 py-2 rounded-xl border border-light-border bg-white text-light-text"
                >
                  {TEMPLATE_FILE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-light-text-secondary">CATEGORY</div>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="text-sm font-bold px-3 py-2 rounded-xl border border-light-border bg-white text-light-text"
                >
                  {(FILE_TYPE_CATEGORIES[templateFileType] || [{ id: 'all', label: 'All Templates' }]).map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-xs font-bold text-light-text-secondary hover:text-light-text rounded-xl border border-light-border hover:bg-light-bg"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {templatesLoading ? (
                <div className="text-sm text-light-text-secondary">Loading templates…</div>
              ) : templates.length === 0 ? (
                <div className="text-sm text-light-text-secondary">No templates found.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {templates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isSelected={selectedTemplate?.id === t.id}
                      onClick={() => {
                        if (selectedTemplate?.id === t.id) setSelectedTemplate(null);
                        else setSelectedTemplate(t);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-light-border flex items-center justify-between bg-light-bg">
              <div className="text-sm text-light-text-secondary truncate">
                {selectedTemplate ? (
                  <>
                    Selected: <span className="font-bold text-light-text">{selectedTemplate.name}</span> ({selectedTemplate.id})
                  </>
                ) : (
                  'No template selected.'
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!selectedTemplate}
                  onClick={() => setTemplatesOpen(false)}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                    selectedTemplate
                      ? 'bg-brand-accent-600 text-white hover:bg-brand-accent-700'
                      : 'bg-white text-light-text-secondary border border-light-border cursor-not-allowed'
                  }`}
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <header className="h-16 border-b border-light-border bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to={backTo} className="p-2 hover:bg-light-sidebar rounded-xl transition-colors text-light-text-secondary">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-brand-accent-600 uppercase">{sectionName} Workspace</span>
              <div className="w-1 h-1 rounded-full bg-light-border" />
              <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">Live System</span>
              {employee?.name ? (
                <>
                  <div className="w-1 h-1 rounded-full bg-light-border" />
                  <span className="text-[10px] font-bold text-light-text-secondary tracking-widest uppercase">
                    EMPLOYEE: {employee.name}
                  </span>
                </>
              ) : null}
            </div>
            <h1 className="text-sm font-bold text-light-text">{activeArtifact?.filename || 'Untitled Document'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Skill Mode (all skills everywhere) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-light-text-secondary uppercase">SKILL</span>
            <select
              value={skillHint || ''}
              onChange={(e) => setSkillHint(e.target.value || null)}
              className="text-xs font-bold px-2 py-1 rounded-lg border border-light-border bg-white text-light-text"
              title="Optional skill hint (does not restrict capabilities)"
            >
              <option value="">AUTO</option>
              {availableSkills.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text hover:bg-light-sidebar rounded-xl transition-all border border-transparent hover:border-light-border"
            title="Choose a document template"
          >
            TEMPLATES
          </button>

          <button
            type="button"
            onClick={() => setWebModeEnabled((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
              webModeEnabled
                ? 'bg-brand-accent-600 text-white border-brand-accent-700'
                : 'text-light-text border-transparent hover:border-light-border hover:bg-light-sidebar'
            }`}
            title="Toggle web mode (scrape URLs mentioned in prompts)"
          >
            WEB_MODE
          </button>

          <button
            type="button"
            onClick={handleEnhanceWithImages}
            disabled={isEnhancing || !activeArtifact}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
              (isEnhancing || !activeArtifact)
                ? 'text-light-text-secondary border-light-border bg-white cursor-not-allowed'
                : 'text-light-text border-transparent hover:border-light-border hover:bg-light-sidebar'
            }`}
            title="Enhance the active document with AI-generated images"
          >
            {isEnhancing ? 'ENHANCING…' : 'ENHANCE_WITH_AI'}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text hover:bg-light-sidebar rounded-xl transition-all border border-transparent hover:border-light-border">
            <Share2 className="w-4 h-4" />
            SHARE
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl transition-all shadow-md shadow-brand-accent-100">
            <Save className="w-4 h-4" />
            SAVE CHANGES
          </button>
          <div className="w-[1px] h-6 bg-light-border mx-2" />
          <button className="p-2 text-light-text-secondary hover:bg-light-sidebar rounded-lg">
            <Settings className="w-4 h-4" />
          </button>

          {/* Connect menu (ChatPage parity) */}
          <ConnectMenu
            sessionId={sessionId}
            connectors={connectors}
            connectionStatus={connectionStatus}
            activeConnectors={activeConnectors}
            onToggleConnector={toggleConnector}
            onConnectApp={connectApp}
            connectAvailable={connectAvailable}
          />
          <button
            type="button"
            onClick={async () => {
              const newId = await createNewSession();
              setProcessCards([]);
              setAllFiles([]);
              setPinnedFiles([]);
              setOutputArtifacts([]);
              setActiveArtifact(null);
              setChatMessages([]);
              deleteSessionData(sessionId);
              return newId;
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl transition-all shadow-md shadow-brand-accent-100"
          >
            NEW CHAT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions Sidebar (ChatPage parity) */}
        <ChatHistorySidebar
          sessions={chatHistory}
          currentSessionId={sessionId}
          onNewChat={async () => {
            const newId = await createNewSession();
            setProcessCards([]);
            setAllFiles([]);
            setPinnedFiles([]);
            setOutputArtifacts([]);
            setActiveArtifact(null);
            setChatMessages([]);
            deleteSessionData(sessionId);
            return newId;
          }}
          onSelectSession={(selectedId) => {
            if (selectedId === sessionId) return;
            const sessionData = selectSessionHandler(selectedId);
            setProcessCards(sessionData?.processCards || []);
            setAllFiles(sessionData?.allFiles || []);
            setPinnedFiles([]);
            setOutputArtifacts([]);
            setActiveArtifact(sessionData?.allFiles?.[0] || null);
            setChatMessages([]);
          }}
          onDeleteSession={async (deleteId) => {
            await deleteSessionHandler(deleteId);
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* Left: Files */}
        <div style={{ width: `${leftWidth}px` }} className="shrink-0 bg-white border-r border-light-border overflow-hidden">
          <FileUploadSidebar
            sessionId={sessionId}
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            onUploadFiles={uploadFilesHandler}
            onRemoveFile={removeFile}
            maxFiles={10}
            acceptedTypes={acceptedTypes}
            demoMode={sectionKey}
          />
        </div>

        {/* Resize Divider */}
        <div 
          onMouseDown={() => setIsResizingLeft(true)}
          className="w-1 cursor-col-resize hover:bg-brand-accent-500/20 transition-colors shrink-0" 
        />

        {/* Middle: Preview */}
        <div className="flex-1 min-w-0 bg-light-bg flex flex-col">
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
            onPreview={selectArtifact}
            onDownload={(doc) => window.open(getFileUrl(doc.filename))}
            onRemoveFile={handleRemoveFile}
            onOpenCanvas={(file) => {
              navigate('/editor', {
                state: {
                  file,
                  returnTo: location.pathname + location.search
                }
              });
            }}
            viewMode="grid"
            demoMode={sectionKey}
          />
        </div>

        {/* Resize Divider */}
        <div 
          onMouseDown={() => setIsResizingRight(true)}
          className="w-1 cursor-col-resize hover:bg-brand-accent-500/20 transition-colors shrink-0" 
        />

        {/* Right: AI Chat */}
        <div style={{ width: `${rightWidth}px` }} className="shrink-0 bg-white border-l border-light-border flex flex-col overflow-hidden">
          <AIChatSidebar
            sessionId={sessionId}
            contextFiles={[...pinnedFiles.map(f => f.filename), ...uploadedFiles.map(f => f.filename)]}
            onSendMessage={handleSendMessage}
            messages={chatMessages}
            isLoading={isProcessing}
            isProcessing={isProcessing}
            suggestions={suggestions}
            demoMode={sectionKey}
            templateId={selectedTemplate?.id || null}
            onClearTemplate={() => setSelectedTemplate(null)}
            enhancementCards={enhancementCards}
            onViewEnhancedFile={(filename) => {
              const file = allFiles.find(f => f.filename === filename);
              if (file) selectArtifact(file);
            }}
            setProcessCards={setProcessCards}
            processCards={processCards}
            onToggleCard={handleToggleCard}
            onRetry={handleRetry}
            onStopGeneration={handleStopGeneration}
            uploadedFiles={uploadedFiles}
            onRemoveFile={handleRemoveFile}
            onUploadFiles={uploadFilesHandler}
            acceptedTypes={acceptedTypes}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedSectionEditor;
