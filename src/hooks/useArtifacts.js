import { useState, useEffect, useRef } from 'react';
import { getFileUrl, getPreviewUrl } from '../api/files';
import apiClient from '../api/index';

/**
 * Hook for artifact management
 * Handles output artifacts, active artifact selection, and preview state
 */
export const useArtifacts = () => {
  const [outputArtifacts, setOutputArtifacts] = useState([]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [artifactContent, setArtifactContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [documentPreviewLoading, setDocumentPreviewLoading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const videoRef = useRef(null);

  // Select an artifact with proper loading state
  const selectArtifact = (artifact) => {
    if (!artifact) {
      setDocumentPreviewLoading(false);
      setVideoLoadError(false);
      setActiveArtifact(null);
      setCurrentPage(1);
      return;
    }

    const ext = artifact.type?.toLowerCase();

    // Set loading state for document types
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

  // Fetch content for text-based artifacts
  useEffect(() => {
    if (activeArtifact) {
      const ext = activeArtifact.type?.toLowerCase();
      if (['mermaid', 'jsx', 'js', 'html', 'md', 'txt', 'json'].includes(ext)) {
        setPreviewLoading(true);
        apiClient.get(activeArtifact.url)
          .then(res => {
            setArtifactContent(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
          })
          .catch(err => setArtifactContent(`Error loading content: ${err.message}`))
          .finally(() => setPreviewLoading(false));
      } else {
        setArtifactContent(null);
      }
      // Note: Document preview loading is handled entirely by:
      // 1. selectArtifact() - sets initial loading state
      // 2. DocumentPreview component - clears loading state on iframe load
      // This prevents circular dependency issues
    } else {
      setArtifactContent(null);
      // Clear loading state when no artifact is selected
      setDocumentPreviewLoading(false);
      setVideoLoadError(false);
    }
  }, [activeArtifact]); // Removed documentPreviewLoading to prevent circular dependency

  // Add new artifacts
  const addArtifacts = (artifacts) => {
    setOutputArtifacts(prev => {
      const updated = [...prev];
      artifacts.forEach(newArtifact => {
        const existingIndex = updated.findIndex(a => a.filename === newArtifact.filename);
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...newArtifact,
            createdAt: new Date().toISOString()
          };
        } else {
          updated.push(newArtifact);
        }
      });
      return updated;
    });
  };

  // Remove artifact
  const removeArtifact = (filename) => {
    setOutputArtifacts(prev => prev.filter(f => f.filename !== filename));
    if (activeArtifact?.filename === filename) {
      setActiveArtifact(null);
    }
  };

  // Clear all artifacts
  const clearArtifacts = () => {
    setOutputArtifacts([]);
    setActiveArtifact(null);
  };

  return {
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
    clearArtifacts,
    setCurrentPage,
    setTotalPages,
    setDocumentPreviewLoading,
    setVideoLoadError,
    setOutputArtifacts,
    setActiveArtifact
  };
};
