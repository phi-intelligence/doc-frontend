import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Grid, List, Download, Eye, X, FileText, ChevronRight, ChevronLeft, Folder, Zap } from 'lucide-react';
import FileThumbnail from '../common/FileThumbnail';
import DocumentPreview from '../preview/DocumentPreview';
import ExcelPreview from '../preview/ExcelPreview';
import { getFileUrl, getPreviewUrl } from '../../api/files';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * DocumentViewer - Center section component for viewing documents
 * Displays uploaded and generated documents with preview and download
 * 
 * @param {Array} documents - Combined uploaded + generated documents
 * @param {Object} activeArtifact - Currently active artifact for preview
 * @param {string} artifactContent - Content for text-based files (from useArtifacts)
 * @param {number} currentPage - Current page number (from useArtifacts)
 * @param {Function} setCurrentPage - Function to update current page (from useArtifacts)
 * @param {number|null} totalPages - Total number of pages (from useArtifacts)
 * @param {boolean} documentPreviewLoading - Loading state (from useArtifacts)
 * @param {Function} setDocumentPreviewLoading - Function to update loading state (from useArtifacts)
 * @param {boolean} previewLoading - Preview loading state (from useArtifacts)
 * @param {Function} onPreview - Callback when document is previewed
 * @param {Function} onDownload - Callback when document is downloaded
 * @param {Function} onRemoveFile - Callback when file is removed
 * @param {'grid'|'list'} viewMode - Display mode (grid or list)
 * @param {'hr'|'finance'} demoMode - Demo mode for styling
 */
const DocumentViewer = ({ 
  documents = [], 
  activeArtifact = null,
  artifactContent = null,
  currentPage = 1,
  setCurrentPage = () => {},
  totalPages = null,
  documentPreviewLoading = false,
  setDocumentPreviewLoading = () => {},
  previewLoading = false,
  onPreview,
  onDownload,
  onRemoveFile,
  onOpenCanvas,
  viewMode: initialViewMode = 'grid',
  demoMode = null
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [previewMode, setPreviewMode] = useState(false);
  const [fileListCollapsed, setFileListCollapsed] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  // Switch to preview mode when activeArtifact is set
  useEffect(() => {
    if (activeArtifact) {
      setPreviewMode(true);
    }
  }, [activeArtifact]);

  // Filter documents by type
  const filteredDocuments = React.useMemo(() => {
    if (filterType === 'all') return documents;
    return documents.filter(doc => {
      const docType = doc.type?.toLowerCase() || doc.filename.split('.').pop().toLowerCase();
      return docType === filterType.toLowerCase();
    });
  }, [documents, filterType]);

  // Get unique file types for filter
  const fileTypes = React.useMemo(() => {
    const types = new Set();
    documents.forEach(doc => {
      const type = doc.type?.toLowerCase() || doc.filename.split('.').pop().toLowerCase();
      if (type) types.add(type);
    });
    return Array.from(types);
  }, [documents]);

  // Handle preview
  const handlePreview = (doc) => {
    if (onPreview) onPreview(doc);
  };

  // Handle download
  const handleDownload = (doc) => {
    const url = getFileUrl(doc.filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onDownload) onDownload(doc);
  };

  // Get preview component based on file type (defensive URL normalization for /api paths)
  const getPreviewComponent = (artifact) => {
    if (!artifact) return null;

    const fileType = artifact.type?.toLowerCase() || artifact.filename.split('.').pop().toLowerCase();
    const fileUrl = (artifact.url && artifact.url.startsWith('/api')) ? artifact.url : getFileUrl(artifact.filename);
    const previewUrl = (artifact.previewUrl && artifact.previewUrl.startsWith('/api')) ? artifact.previewUrl : getPreviewUrl(artifact.filename);

    // Create artifact object for DocumentPreview
    const previewArtifact = {
      filename: artifact.filename,
      url: fileUrl,
      previewUrl,
      type: artifact.type || fileType.toUpperCase(),
      isOutput: artifact.isOutput !== false
    };
    
    if (fileType === 'xlsx' || fileType === 'xls') {
      return (
        <div className="w-full h-full">
          <ExcelPreview url={fileUrl} onLoadComplete={() => {}} />
        </div>
      );
    } else {
      return (
        <DocumentPreview
          artifact={previewArtifact}
          artifactContent={artifactContent}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          documentPreviewLoading={documentPreviewLoading}
          setDocumentPreviewLoading={setDocumentPreviewLoading}
          previewLoading={previewLoading}
        />
      );
    }
  };

  // Show preview mode if activeArtifact exists
  if (previewMode && activeArtifact) {
    return (
      <div className="flex-1 flex flex-col bg-light-bg h-full overflow-hidden">
        {/* Header with controls */}
        <div className="h-16 border-b border-light-border flex items-center justify-between px-6 bg-light-bg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2 text-light-text-secondary hover:text-light-text hover:bg-light-sidebar rounded transition-colors"
              title="Back to grid/list view"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-light-text truncate">
              {activeArtifact.filename}
            </h3>
          </div>

          {activeArtifact && !activeArtifact.isPending && activeArtifact.url && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenCanvas) {
                    onOpenCanvas(activeArtifact);
                  } else {
                    navigate('/editor', { state: { file: activeArtifact } });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl shadow-lg shadow-brand-accent-200/50 transition-all duration-200 uppercase tracking-wider active:scale-95"
                title="Open in Workspace Canvas"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                WORKSPACE_CANVAS
              </button>
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

        {/* Preview Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col border-r border-light-border">
            <div className="flex-1 overflow-auto p-4 bg-light-bg">
              <div className="h-full bg-white rounded-lg overflow-hidden shadow-sm border border-light-border">
                {getPreviewComponent(activeArtifact)}
              </div>
            </div>
          </div>

          {/* File List Sidebar */}
          <div className={`flex flex-col h-full bg-light-sidebar transition-all duration-300 border-l border-light-border ${
            fileListCollapsed ? 'w-12' : 'w-52'
          }`}>
            <div className="h-12 border-b border-light-border flex items-center justify-between px-3">
              {!fileListCollapsed && (
                <>
                  <h3 className="font-semibold text-xs text-light-text-secondary flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-brand-accent-500" />
                    Files
                  </h3>
                  <span className="bg-brand-accent-500/10 text-brand-accent-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-brand-accent-500/20">
                    {documents.length}
                  </span>
                </>
              )}
              <button
                onClick={() => setFileListCollapsed(!fileListCollapsed)}
                className={`p-1.5 text-light-text-secondary hover:text-light-text hover:bg-white/50 rounded-lg transition-colors ${fileListCollapsed ? 'mx-auto' : ''}`}
                title={fileListCollapsed ? 'Expand files' : 'Collapse files'}
              >
                {fileListCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {fileListCollapsed ? (
                <div className="flex flex-col items-center gap-1">
                  {/* File icons removed for cleaner collapsed state */}
                </div>
              ) : (
                filteredDocuments.map((file, index) => {
                  const isActive = activeArtifact?.filename === file.filename;
                  const IconComponent = getFileIcon(file.type);
                  const isNew = index === 0; // First file is newest
                  
                  return (
                    <div
                      key={file.filename}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-brand-accent-500 text-white'
                          : 'bg-white hover:bg-light-bg text-light-text border border-light-border hover:border-brand-accent-300'
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (onPreview) onPreview(file);
                        }}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium truncate flex-1">
                          {file.filename}
                        </span>
                        {isNew && (
                          <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </button>
                      {onRemoveFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(file, !file.isOutput);
                            if (activeArtifact?.filename === file.filename && onPreview) {
                              // Clear active artifact by selecting first other file
                              const otherFiles = filteredDocuments.filter(f => f.filename !== file.filename);
                              if (otherFiles.length > 0 && onPreview) {
                                onPreview(otherFiles[0]);
                              }
                            }
                          }}
                          className="ml-auto p-1 text-light-text-secondary hover:text-red-600 transition-colors flex-shrink-0"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid/List view mode
  return (
    <div className="flex-1 flex flex-col bg-light-bg h-full overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 border-b border-light-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-light-text">
            {demoMode === 'hr' ? 'HR Documents' : 
             demoMode === 'finance' ? 'Financial Reports' : 
             'Documents'}
          </h3>
          {documents.length > 0 && (
            <span className="text-xs text-light-text-secondary bg-light-sidebar px-2 py-1 rounded">
              {filteredDocuments.length} of {documents.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          {fileTypes.length > 0 && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-light-border rounded-lg px-2 py-1 bg-light-sidebar text-light-text"
            >
              <option value="all">All Types</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          )}

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-light-border rounded-lg p-1 bg-light-sidebar">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-brand-accent-500 text-white' 
                  : 'text-light-text-secondary hover:text-light-text'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-brand-accent-500 text-white' 
                  : 'text-light-text-secondary hover:text-light-text'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-light-text-secondary/30 mb-4" />
            <p className="text-light-text-secondary mb-2">
              {documents.length === 0 
                ? 'No documents yet' 
                : `No ${filterType === 'all' ? '' : filterType.toUpperCase() + ' '}documents found`}
            </p>
            <p className="text-xs text-light-text-secondary/70">
              Upload files or generate documents to see them here
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.filename}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="bg-light-sidebar rounded-xl border border-light-border hover:border-brand-accent-300 transition-all p-3">
                  <div className="mb-2">
                    <FileThumbnail
                      file={doc}
                      onRemove={() => {}} // Remove handled by parent
                    />
                  </div>
                  <p className="text-xs text-light-text truncate mb-2" title={doc.filename}>
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handlePreview(doc);
                        setPreviewMode(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-light-text bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-light-text bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.filename}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-light-sidebar rounded-lg border border-light-border hover:border-brand-accent-300 transition-all p-3 flex items-center gap-3"
              >
                <div className="w-12 h-12 flex-shrink-0">
                  <FileThumbnail
                    file={doc}
                    onRemove={() => {}}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-light-text truncate" title={doc.filename}>
                    {doc.filename}
                  </p>
                  <p className="text-xs text-light-text-secondary">
                    {doc.type || doc.filename.split('.').pop().toUpperCase()}
                    {doc.uploadedAt && ` • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handlePreview(doc);
                      setPreviewMode(true);
                    }}
                    className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DocumentViewer;
