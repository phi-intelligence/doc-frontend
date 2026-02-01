import React, { memo } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Download, FileUp, Loader2 } from 'lucide-react';
import MermaidPreview from './MermaidPreview';
import ReactLivePreview from './ReactLivePreview';
import ExcelPreview from './ExcelPreview';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * Document preview component that handles all file types
 * @param {Object} artifact - Artifact object with filename, url, previewUrl, type, etc.
 * @param {string} artifactContent - Content for text-based files
 * @param {number} currentPage - Current page number for paginated documents
 * @param {Function} setCurrentPage - Function to update current page
 * @param {number|null} totalPages - Total number of pages
 * @param {boolean} documentPreviewLoading - Loading state for document preview
 * @param {Function} setDocumentPreviewLoading - Function to update loading state
 * @param {boolean} previewLoading - Loading state for text previews
 */
const DocumentPreview = ({
  artifact,
  artifactContent,
  currentPage = 1,
  setCurrentPage,
  totalPages = null,
  documentPreviewLoading = false,
  setDocumentPreviewLoading,
  previewLoading = false,
}) => {
  // Safe wrapper to handle undefined setDocumentPreviewLoading
  const safeSetLoading = (value) => {
    if (typeof setDocumentPreviewLoading === 'function') {
      setDocumentPreviewLoading(value);
    } else {
      console.warn('setDocumentPreviewLoading is not a function:', setDocumentPreviewLoading);
    }
  };

  // Loading spinner component (simple, fast, reliable)
  const LoadingSpinner = ({ message = 'Loading preview...', subtitle = 'Preparing your document' }) => (
    <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
      </div>
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  // Page navigation controls
  const PageNavigation = ({ ext }) => (
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-light-bg border-t border-light-border">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-light-text bg-white border border-light-border hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <span className="text-sm font-medium text-light-text">
        Page {currentPage}{totalPages ? ` of ${totalPages}` : ''} {['pptx', 'ppt'].includes(ext) ? '(Slide)' : ''}
      </span>
      <button
        onClick={() => setCurrentPage(p => p + 1)}
        disabled={totalPages !== null && currentPage >= totalPages}
        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-light-text bg-white border border-light-border hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  // If no artifact but loading state is active, show loading spinner during transition
  if (!artifact && documentPreviewLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        <LoadingSpinner />
      </div>
    );
  }

  // No artifact selected
  if (!artifact) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-light-text-secondary bg-light-bg">
        <FileUp className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Select a file to preview</p>
        <p className="text-sm mt-2">Upload a document or select from artifacts</p>
      </div>
    );
  }

  // Check if artifact is pending (code generation phase)
  const isPending = artifact.isPending === true;
  const ext = artifact.type?.toLowerCase();
  const previewUrl = artifact.previewUrl || artifact.url;

  // For pending artifacts, always show loading spinner
  if (isPending) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        <LoadingSpinner
          message="Generating document..."
          subtitle="Code generation in progress..."
        />
      </div>
    );
  }

  // Loading state for text-based artifacts
  if (previewLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-light-bg">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-accent-500" />
      </div>
    );
  }

  // MERMAID
  if (ext === 'mermaid') {
    return <MermaidPreview chart={artifactContent} />;
  }

  // REACT / JSX
  if (ext === 'jsx' || ext === 'js') {
    return <ReactLivePreview code={artifactContent || '// No content'} />;
  }

  // HTML - render in iframe
  if (ext === 'html') {
    return (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-light-border shadow-sm">
        <iframe
          srcDoc={artifactContent}
          className="w-full h-full border-0"
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  // TXT / MD / JSON - show as raw text
  if (['txt', 'md', 'json'].includes(ext)) {
    return (
      <div className="w-full h-full bg-terminal-light p-4 border border-light-border rounded-lg overflow-auto font-mono text-sm">
        <pre className="text-light-text">{artifactContent}</pre>
      </div>
    );
  }

  // PDF
  if (ext === 'pdf') {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        {documentPreviewLoading && <LoadingSpinner />}
        <iframe
          src={`${artifact.url}#toolbar=0&navpanes=0&page=${currentPage}`}
          className={`w-full flex-1 border-0 bg-white ${documentPreviewLoading ? 'invisible' : 'visible'}`}
          title="PDF Preview"
          onLoad={() => {
            setTimeout(() => {
              safeSetLoading(false);
            }, 500);
          }}
          onError={() => {
            console.error('PDF iframe load error');
            safeSetLoading(false);
          }}
        />
        <PageNavigation ext={ext} />
      </div>
    );
  }

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg p-4">
        <img
          src={artifact.url}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded shadow-lg"
        />
      </div>
    );
  }

  // Office - Excel files get custom table view
  if (['xlsx', 'xls'].includes(ext)) {
    return (
      <ExcelPreview
        url={previewUrl}
        onLoadComplete={() => safeSetLoading(false)}
      />
    );
  }

  // Other Office files (DOCX, PPTX) - use iframe (converted to PDF)
  if (['docx', 'doc', 'pptx', 'ppt'].includes(ext)) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        {documentPreviewLoading && (
          <LoadingSpinner
            message="Loading preview..."
            subtitle="Converting document..."
          />
        )}
        <iframe
          key={`${artifact.filename}-${previewUrl}`}
          src={`${previewUrl}#toolbar=0&navpanes=0&page=${currentPage}`}
          className={`w-full flex-1 border-0 bg-white ${documentPreviewLoading ? 'invisible' : 'visible'}`}
          title="Document Preview"
          onLoad={(e) => {
            // Check if iframe loaded successfully by trying to access content
            // LibreOffice conversion can take time, so use longer delay
            setTimeout(() => {
              try {
                // Check if iframe has content (PDF loaded)
                const iframe = e.target;
                if (iframe && iframe.contentDocument) {
                  // If we can access contentDocument, it's same-origin (error page)
                  // Real PDF won't be accessible due to cross-origin
                  safeSetLoading(false);
                } else {
                  // Cross-origin = PDF loaded successfully
                  safeSetLoading(false);
                }
              } catch (err) {
                // Cross-origin error = PDF loaded (expected)
                safeSetLoading(false);
              }
            }, 2000); // Increased timeout for LibreOffice conversion
          }}
          onError={(e) => {
            console.error('Document preview iframe error:', e);
            safeSetLoading(false);
          }}
        />
        <PageNavigation ext={ext} />
      </div>
    );
  }

  // Fallback
  const IconComponent = getFileIcon(ext);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white border rounded-lg shadow-sm">
      <div className="p-6 bg-brand-accent-500/10 rounded-full mb-6">
        <IconComponent className="w-16 h-16 text-brand-accent-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{artifact.filename}</h3>
      <p className="text-sm text-gray-500 mb-6">
        Preview not available for .{ext} files
      </p>
      <a
        href={artifact.url}
        download={artifact.filename}
        className="flex items-center gap-2 px-6 py-3 bg-brand-accent-500 text-white font-semibold rounded-lg hover:bg-brand-accent-600 transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
      >
        <Download className="w-5 h-5" />
        Download File
      </a>
    </div>
  );
};

// Memoize to prevent re-renders from parent state changes (like progress updates)
export default memo(DocumentPreview, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.artifact?.filename === nextProps.artifact?.filename &&
    prevProps.artifact?.isPending === nextProps.artifact?.isPending &&
    prevProps.artifact?.previewUrl === nextProps.artifact?.previewUrl &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.documentPreviewLoading === nextProps.documentPreviewLoading &&
    prevProps.previewLoading === nextProps.previewLoading &&
    prevProps.artifactContent === nextProps.artifactContent
  );
});
