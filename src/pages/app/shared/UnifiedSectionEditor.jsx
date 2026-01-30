import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Share2, Settings } from 'lucide-react';

import { useSession } from '../../../hooks/useSession';
import { useFiles } from '../../../hooks/useFiles';
import { useArtifacts } from '../../../hooks/useArtifacts';
import { useProgressStream } from '../../../hooks/useProgressStream';
import { useConnect } from '../../../hooks/useConnect';
import { sendMessage } from '../../../api/chat';
import { getFileUrl, getPreviewUrl, enhanceWithImages } from '../../../api/files';
import { getRAGStatus, indexDocument as indexDocumentForRag } from '../../../api/rag';
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
  const { uploadedFiles, isUploading, uploadFiles: uploadFilesHandler, removeFile, setUploadedFiles } = useFiles(sessionId);
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
    videoLoadError,
    setVideoLoadError,
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

  // RAG state (ChatPage parity)
  const [ragAvailable, setRagAvailable] = useState(false);
  const [ragIndexedDocuments, setRagIndexedDocuments] = useState(false);
  const [ragIndexing, setRagIndexing] = useState(false);

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

  // RAG status check (ChatPage parity)
  const checkRagStatus = useCallback(async () => {
    try {
      const status = await getRAGStatus(sessionId);
      setRagAvailable(status.available || false);
      setRagIndexedDocuments(status.has_indexed_documents || false);
    } catch {
      setRagAvailable(false);
      setRagIndexedDocuments(false);
    }
  }, [sessionId]);

  useEffect(() => {
    checkRagStatus();
  }, [checkRagStatus]);

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

      // Trigger RAG re-indexing for the saved file (ChatPage parity)
      if (ragAvailable && savedFilename) {
        setRagIndexing(true);
        indexDocumentForRag(savedFilename, sessionId)
          .then(() => setRagIndexedDocuments(true))
          .catch((err) => console.error('Failed to index document for RAG:', err))
          .finally(() => setRagIndexing(false));
      }

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
  }, [location.state, location.pathname, location.search, navigate, selectArtifact, setAllFiles, ragAvailable, sessionId]);
  
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
        const normalized = sessionData.allFiles.map((f) => ({
          ...f,
          url: f.url?.startsWith('/api') ? f.url : getFileUrl(f.filename),
          previewUrl: f.previewUrl || getPreviewUrl(f.filename)
        }));
        setAllFiles(normalized);
        setOutputArtifacts(normalized.filter((f) => f.isOutput));
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
  // IMPORTANT: This must both ADD new items AND UPDATE existing items
  // Code streaming (code_output events) updates the output field on existing code_start items
  useEffect(() => {
    if (currentCardId && progressStream.items.length > 0) {
      setProcessCards(prev => prev.map(card => {
        if (card.id !== currentCardId) return card;
        const existingSteps = card.steps || [];
        const existingIds = new Set(existingSteps.map(s => s.id));

        // Build a map of progress items by ID for efficient lookup
        const progressItemsById = new Map(progressStream.items.map(item => [item.id, item]));

        // Update existing steps with fresh data from progress stream
        const updatedSteps = existingSteps.map(step => {
          const freshItem = progressItemsById.get(step.id);
          if (freshItem) {
            // Merge fresh data (output, status, etc.) into existing step
            return { ...step, ...freshItem };
          }
          return step;
        });

        // Add any new items that don't exist in steps yet
        const newProgressItems = progressStream.items.filter(item => !existingIds.has(item.id));

        return {
          ...card,
          steps: [...updatedSteps, ...newProgressItems]
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
  // NOTE: ChatPage does NOT have this - it only adds from response.new_artifacts
  // We keep this for earlier feedback but dedupe to avoid duplicates with response.new_artifacts
  useEffect(() => {
    const fileCreatedEvents = progressStream.items.filter(
      item => item.type === 'file_created'
    );

    if (fileCreatedEvents.length > 0) {
      // Dedupe: only add artifacts not already in outputArtifacts
      const existingFilenames = new Set(outputArtifacts.map(a => a.filename));
      const newArtifacts = fileCreatedEvents
        .filter(event => !existingFilenames.has(event.filename))
        .map(event => ({
          filename: event.filename,
          type: event.filename.split('.').pop().toUpperCase(),
          url: getFileUrl(event.filename),
          previewUrl: getPreviewUrl(event.filename),
          isOutput: true,
          createdAt: new Date().toISOString()
        }));

      if (newArtifacts.length > 0) {
        addArtifacts(newArtifacts);
      }
    }
  }, [progressStream.items, addArtifacts, outputArtifacts]);

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
      // Build context files like ChatPage: pinnedFiles + uploadedFiles + recent outputArtifacts
      const buildContextFiles = () => {
        const filenames = new Set(); // Dedupe by filename
        pinnedFiles.forEach(f => filenames.add(f.filename));
        uploadedFiles.forEach(f => filenames.add(f.filename));
        // Include last 10 output artifacts for better document awareness (ChatPage parity)
        outputArtifacts.slice(-10).forEach(f => filenames.add(f.filename));
        return Array.from(filenames);
      };
      const fileNames = contextFiles || buildContextFiles();

      // Clear uploaded files after including in prompt (ChatPage parity)
      if (uploadedFiles.length > 0 && setUploadedFiles) {
        setUploadedFiles([]);
      }

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

        // Add new artifacts to allFiles with "newest first" ordering (ChatPage parity)
        // This explicit setAllFiles is needed because the useEffect that derives allFiles
        // from pinnedFiles + uploadedFiles + outputArtifacts puts outputArtifacts at the end,
        // but we want new artifacts at the top for better UX.
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

        // Index new artifacts for RAG when available (ChatPage parity)
        if (ragAvailable && newArtifactFilenames.length > 0) {
          setRagIndexing(true);
          Promise.all(newArtifactFilenames.map((fn) => indexDocumentForRag(fn, sessionId)))
            .then(() => setRagIndexedDocuments(true))
            .catch((err) => console.error('Failed to index documents for RAG:', err))
            .finally(() => setRagIndexing(false));
        }
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
    outputArtifacts,
    isProcessing,
    addArtifacts,
    selectArtifact,
    activeArtifact,
    currentPage,
    setCurrentPage,
    setDocumentPreviewLoading,
    progressStream,
    pendingArtifact,
    sectionKey,
    setUploadedFiles,
    ragAvailable,
    getIntegrations,
    skillHint,
    webModeEnabled
  ]);

  // Retry handler (must be declared after handleSendMessage to avoid TDZ at runtime)
  // Include outputArtifacts in context so "edit this document" works on retry (ChatPage parity)
  const handleRetry = useCallback((query) => {
    const contextFiles = [...new Set([
      ...pinnedFiles.map(f => f.filename),
      ...uploadedFiles.map(f => f.filename),
      ...outputArtifacts.slice(-10).map(f => f.filename)
    ])];
    handleSendMessage(query, contextFiles, null);
  }, [pinnedFiles, uploadedFiles, outputArtifacts, handleSendMessage]);

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

      {/* Editor Header - Premium & Organized */}
      <header className="h-16 border-b border-light-border bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6">
          <Link 
            to={backTo} 
            className="p-2.5 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent-100/50">
              <img src="/logophi_brown.png" alt="Phi" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black tracking-[0.2em] text-brand-accent-600 uppercase leading-none">{sectionName}</span>
                <div className="w-1 h-1 rounded-full bg-light-border" />
                <span className="text-[9px] font-black text-green-600 tracking-[0.2em] uppercase leading-none">LIVE_SYSTEM</span>
                {employee?.name ? (
                  <>
                    <div className="w-1 h-1 rounded-full bg-light-border" />
                    <span className="text-[9px] font-black text-light-text-secondary tracking-[0.2em] uppercase leading-none">
                      EMP: {employee.name.split(' ')[0]}
                    </span>
                  </>
                ) : null}
              </div>
              <h1 className="text-sm font-bold text-light-text leading-none tracking-tight">
                {activeArtifact?.filename || 'Workspace Overview'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace Tools Group */}
          <div className="flex items-center bg-light-bg/50 p-1 rounded-2xl border border-light-border/50 mr-2">
            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-black text-light-text-secondary hover:text-brand-accent-600 hover:bg-white rounded-xl transition-all uppercase tracking-wider"
            >
              Templates
            </button>
          </div>

          <div className="w-[1px] h-6 bg-light-border mx-1" />

          <button className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all">
            <Settings className="w-4 h-4" />
          </button>

          {/* Connect & New Chat */}
          <div className="flex items-center gap-2 ml-2">
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
              className="flex items-center gap-2 px-5 py-2 text-[11px] font-black text-white bg-gray-900 hover:bg-black rounded-xl transition-all shadow-lg shadow-gray-200 active:scale-95 uppercase tracking-widest"
            >
              NEW_SESSION
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Improved Dividers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sessions Sidebar */}
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
            const loadedFiles = sessionData?.allFiles || [];
            setProcessCards(sessionData?.processCards || []);
            setAllFiles(loadedFiles);
            setPinnedFiles([]);
            setOutputArtifacts(loadedFiles.filter((f) => f.isOutput));
            setActiveArtifact(loadedFiles[0] || null);
            setChatMessages([]);
          }}
          onDeleteSession={async (deleteId) => {
            const wasCurrentSession = deleteId === sessionId;
            await deleteSessionHandler(deleteId);
            if (wasCurrentSession) {
              setProcessCards([]);
              setAllFiles([]);
              setPinnedFiles([]);
              setOutputArtifacts([]);
              setActiveArtifact(null);
              setChatMessages([]);
            }
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* Left: Files */}
        <div style={{ width: `${leftWidth}px` }} className="shrink-0 bg-white overflow-hidden flex flex-col">
          <FileUploadSidebar
            sessionId={sessionId}
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            onUploadFiles={uploadFilesHandler}
            onRemoveFile={handleRemoveFile}
            maxFiles={10}
            acceptedTypes={acceptedTypes}
            demoMode={sectionKey}
          />
        </div>

        {/* Modern Resize Divider Left */}
        <div 
          onMouseDown={() => setIsResizingLeft(true)}
          className={`w-1.5 cursor-col-resize flex-shrink-0 transition-all group relative z-10 ${
            isResizingLeft ? 'bg-brand-accent-100/30' : 'bg-transparent hover:bg-brand-accent-50'
          }`}
        >
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${
            isResizingLeft ? 'bg-brand-accent-600' : 'bg-light-border group-hover:bg-brand-accent-300'
          }`} />
        </div>

        {/* Middle: Preview */}
        <div className="flex-1 min-w-0 bg-[#FAFAF9] flex flex-col shadow-[inset_0_0_20px_0_rgba(0,0,0,0.015)]">
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
            videoLoadError={videoLoadError}
            setVideoLoadError={setVideoLoadError}
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
            webModeEnabled={webModeEnabled}
            onToggleWebMode={() => setWebModeEnabled(prev => !prev)}
            isEnhancing={isEnhancing}
            onEnhanceWithImages={handleEnhanceWithImages}
          />
        </div>

        {/* Modern Resize Divider Right */}
        <div 
          onMouseDown={() => setIsResizingRight(true)}
          className={`w-1.5 cursor-col-resize flex-shrink-0 transition-all group relative z-10 ${
            isResizingRight ? 'bg-brand-accent-100/30' : 'bg-transparent hover:bg-brand-accent-50'
          }`}
        >
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${
            isResizingRight ? 'bg-brand-accent-600' : 'bg-light-border group-hover:bg-brand-accent-300'
          }`} />
        </div>

        {/* Right: AI Chat */}
        <div style={{ width: `${rightWidth}px` }} className="shrink-0 bg-white flex flex-col overflow-hidden">
          <AIChatSidebar
            sessionId={sessionId}
            contextFiles={[...new Set([
              ...pinnedFiles.map(f => f.filename),
              ...uploadedFiles.map(f => f.filename),
              ...outputArtifacts.slice(-10).map(f => f.filename)
            ])]}
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
            webModeEnabled={webModeEnabled}
            onToggleWebMode={() => setWebModeEnabled(prev => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default UnifiedSectionEditor;
