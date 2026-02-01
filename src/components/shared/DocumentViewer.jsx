import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Grid, List, Download, Eye, X, FileText, ChevronRight, ChevronLeft, Folder, Zap, Globe, Wand2, RefreshCw } from 'lucide-react';
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
  demoMode = null,
  webModeEnabled = false,
  onToggleWebMode = () => {},
  isEnhancing = false,
  onEnhanceWithImages = () => {}
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
      <div className="flex-1 flex flex-col bg-light-bg h-full overflow-hidden selection:bg-brand-accent-100 selection:text-brand-accent-900">
        {/* Header with controls - Refined & Aesthetic */}
        <div className="h-16 border-b border-light-border flex items-center justify-between px-8 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2.5 text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95"
              title="Back to Grid"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-black text-brand-accent-400 uppercase tracking-widest leading-none">PREVIEW_MODE</span>
                  <div className="w-1 h-1 rounded-full bg-light-border" />
                  <span className="text-[9px] font-black text-light-text-secondary uppercase tracking-widest leading-none">
                    {activeArtifact.type || 'DOCUMENT'}
                  </span>
               </div>
               <h3 className="text-sm font-bold text-light-text leading-tight tracking-tight truncate max-w-[400px]">
                 {activeArtifact.filename}
               </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Dynamic Document Controls Group */}
             <div className="flex items-center bg-light-bg/50 p-1 rounded-2xl border border-light-border/50 mr-2">
                <button
                  type="button"
                  onClick={onToggleWebMode}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-wider ${
                    webModeEnabled
                      ? 'bg-brand-accent-600 text-white shadow-md'
                      : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-white'
                  }`}
                  title="Toggle web mode (scrape URLs mentioned in prompts)"
                >
                  <Globe className="w-3.5 h-3.5" />
                  WEB_MODE
                </button>
                <button
                  type="button"
                  onClick={onEnhanceWithImages}
                  disabled={isEnhancing}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-wider ${
                    isEnhancing
                      ? 'text-light-text-secondary/40 cursor-not-allowed'
                      : 'text-light-text-secondary hover:text-brand-accent-600 hover:bg-white'
                  }`}
                  title="Enhance document with AI images"
                >
                  {isEnhancing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  {isEnhancing ? 'ENHANCING...' : 'ENHANCE'}
                </button>
             </div>

             <div className="w-[1px] h-6 bg-light-border mx-1" />

             {activeArtifact && !activeArtifact.isPending && activeArtifact.url && (
               <div className="flex items-center gap-3">
                 <button
                   onClick={() => {
                     if (onOpenCanvas) {
                       onOpenCanvas(activeArtifact);
                     } else {
                       navigate('/editor', { state: { file: activeArtifact } });
                     }
                   }}
                   className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl shadow-lg shadow-brand-accent-200/40 transition-all uppercase tracking-wider active:scale-95"
                   title="Open in Workspace Canvas"
                 >
                   <Zap className="w-3.5 h-3.5" />
                   WORKSPACE_CANVAS
                 </button>
                 <a
                   href={activeArtifact.url}
                   download={activeArtifact.filename}
                   className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-light-text bg-white border border-light-border hover:bg-light-bg hover:border-brand-accent-200 rounded-xl transition-all uppercase tracking-wider active:scale-95 shadow-sm"
                 >
                   <Download className="w-3.5 h-3.5 text-brand-accent-500" />
                   EXPORT
                 </a>
               </div>
             )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col border-r border-light-border bg-[#FAFAF9]">
            <div className="flex-1 overflow-auto p-6">
              <div className="h-full bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-light-border relative">
                {getPreviewComponent(activeArtifact)}
              </div>
            </div>
          </div>

          {/* File List Sidebar - Refined collapsed state */}
          <div className={`flex flex-col h-full bg-light-sidebar transition-all duration-300 border-l border-light-border ${
            fileListCollapsed ? 'w-12' : 'w-60'
          }`}>
            <div className="h-16 border-b border-light-border flex items-center justify-between px-4 bg-white/50 backdrop-blur-sm">
              {!fileListCollapsed && (
                <>
                  <h3 className="font-black text-[10px] text-light-text-secondary flex items-center gap-2 uppercase tracking-widest">
                    <Folder className="w-3.5 h-3.5 text-brand-accent-500" />
                    Archive
                  </h3>
                  <span className="bg-brand-accent-500/10 text-brand-accent-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-accent-500/20">
                    {documents.length}
                  </span>
                </>
              )}
              <button
                onClick={() => setFileListCollapsed(!fileListCollapsed)}
                className={`p-2 text-light-text-secondary hover:text-brand-accent-600 hover:bg-white rounded-lg transition-all ${fileListCollapsed ? 'mx-auto' : ''}`}
                title={fileListCollapsed ? 'Expand archive' : 'Collapse archive'}
              >
                {fileListCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar-thin">
              {fileListCollapsed ? (
                <div className="flex flex-col items-center gap-2 py-2">
                   {/* Minimal icons for collapsed state */}
                   {filteredDocuments.slice(0, 10).map((file, i) => {
                     const Icon = getFileIcon(file.type);
                     return <Icon key={i} className="w-3.5 h-3.5 text-light-text-secondary/40" />;
                   })}
                </div>
              ) : (
                filteredDocuments.map((file, index) => {
                  const isActive = activeArtifact?.filename === file.filename;
                  const IconComponent = getFileIcon(file.type);
                  const isNew = index === 0;
                  
                  return (
                    <motion.div
                      key={file.filename}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-brand-accent-600 text-white shadow-lg shadow-brand-accent-100'
                          : 'bg-white hover:bg-brand-accent-50 text-light-text border border-transparent hover:border-brand-accent-100 shadow-sm'
                      }`}
                      onClick={() => onPreview && onPreview(file)}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-light-bg group-hover:bg-white transition-colors'}`}>
                        <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-brand-accent-500'}`} />
                      </div>
                      <span className={`text-[11px] font-bold truncate flex-1 ${isActive ? 'text-white' : 'text-light-text'}`}>
                        {file.filename}
                      </span>
                      {isNew && !isActive && (
                        <span className="text-[8px] font-black bg-brand-accent-500 text-white px-1.5 py-0.5 rounded-md flex-shrink-0 tracking-tighter">
                          NEW
                        </span>
                      )}
                      {onRemoveFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(file, !file.isOutput);
                            if (activeArtifact?.filename === file.filename && onPreview) {
                              const otherFiles = filteredDocuments.filter(f => f.filename !== file.filename);
                              if (otherFiles.length > 0 && onPreview) onPreview(otherFiles[0]);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            isActive 
                              ? 'text-white/60 hover:text-white hover:bg-white/10' 
                              : 'text-light-text-secondary hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                          }`}
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
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

      {/* Document Grid/List - Aesthetic Polish */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-thin">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-brand-accent-100/20 rounded-full blur-2xl animate-pulse" />
               <FileText className="relative w-20 h-20 text-light-text-secondary/20" />
            </div>
            <p className="text-lg font-black text-light-text tracking-tighter uppercase mb-2">
              No Documents Detected
            </p>
            <p className="text-xs font-bold text-light-text-secondary/60 uppercase tracking-[0.2em] max-w-xs mx-auto">
              {documents.length === 0 
                ? 'Your secure archive is empty. Upload or generate files to begin.' 
                : `No ${filterType === 'all' ? '' : filterType.toUpperCase() + ' '}results found in current workspace.`}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.filename}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl border border-light-border hover:border-brand-accent-300 transition-all duration-300 p-4 shadow-sm hover:shadow-xl hover:shadow-brand-accent-100/20">
                  <div className="mb-4 aspect-[4/3] bg-light-bg rounded-xl overflow-hidden relative">
                    <FileThumbnail
                      file={doc}
                      onRemove={() => {}} // Remove handled by parent
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors pointer-events-none" />
                  </div>
                  <div className="px-1">
                    <p className="text-sm font-bold text-light-text truncate mb-1" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                       <span className="text-[10px] font-black text-brand-accent-500 uppercase tracking-widest leading-none">
                         {doc.type || doc.filename.split('.').pop().toUpperCase()}
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handlePreview(doc);
                          setPreviewMode(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black text-white bg-brand-accent-600 hover:bg-brand-accent-700 rounded-xl transition-all uppercase tracking-wider shadow-md shadow-brand-accent-100/50 active:scale-95"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center justify-center gap-2 p-2 text-light-text-secondary bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-w-5xl mx-auto">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.filename}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-light-border hover:border-brand-accent-300 transition-all p-3 flex items-center gap-4 group hover:shadow-lg hover:shadow-brand-accent-100/10 shadow-sm"
              >
                <div className="w-14 h-14 bg-light-bg rounded-xl overflow-hidden flex-shrink-0 relative">
                  <FileThumbnail
                    file={doc}
                    onRemove={() => {}}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors pointer-events-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-light-text truncate mb-0.5" title={doc.filename}>
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-accent-500 uppercase tracking-widest">
                      {doc.type || doc.filename.split('.').pop().toUpperCase()}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-light-border" />
                    <span className="text-[10px] font-bold text-light-text-secondary opacity-60">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Active Document'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-2">
                  <button
                    onClick={() => {
                      handlePreview(doc);
                      setPreviewMode(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95 uppercase tracking-widest"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2.5 text-light-text-secondary bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded-xl transition-all border border-transparent hover:border-brand-accent-100 active:scale-95"
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
