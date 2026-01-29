import React, { useRef, useState, useEffect, memo } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Download, FileUp } from 'lucide-react';
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
 * @param {boolean} [videoLoadError] - Optional controlled loading video error state (ChatPage/editor parity)
 * @param {Function} [setVideoLoadError] - Optional setter for loading video error state
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
  videoLoadError: videoLoadErrorProp,
  setVideoLoadError: setVideoLoadErrorProp
}) => {
  const videoRef = useRef(null);
  const [videoLoadErrorInternal, setVideoLoadErrorInternal] = useState(false);
  const videoLoadError = videoLoadErrorProp !== undefined ? videoLoadErrorProp : videoLoadErrorInternal;
  const setVideoLoadError = typeof setVideoLoadErrorProp === 'function' ? setVideoLoadErrorProp : setVideoLoadErrorInternal;

  // Safe wrapper to handle undefined setDocumentPreviewLoading
  const safeSetLoading = (value) => {
    if (typeof setDocumentPreviewLoading === 'function') {
      setDocumentPreviewLoading(value);
    } else {
      console.warn('setDocumentPreviewLoading is not a function:', setDocumentPreviewLoading);
    }
  };


  // Loading video component (reusable) - Memoized internally for stability
  const LoadingVideo = ({ message = 'Loading preview...', subtitle = 'Preparing your document' }) => (
    <div className="absolute inset-0 z-10 bg-black" style={{ contain: 'strict', transform: 'translateZ(0)' }}>
      {!videoLoadError ? (
        <video
          ref={videoRef}
          src="/loading_preview.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
          onError={(e) => {
            const video = e.target;
            const error = video.error;
            if (error) {
              console.error('Video loading error:', {
                code: error.code,
                message: error.message,
                MEDIA_ERR_ABORTED: error.MEDIA_ERR_ABORTED,
                MEDIA_ERR_NETWORK: error.MEDIA_ERR_NETWORK,
                MEDIA_ERR_DECODE: error.MEDIA_ERR_DECODE,
                MEDIA_ERR_SRC_NOT_SUPPORTED: error.MEDIA_ERR_SRC_NOT_SUPPORTED,
                networkState: video.networkState,
                readyState: video.readyState,
                src: video.src
              });
            } else {
              console.error('Video loading error (no error details available):', e);
            }
            setVideoLoadError(true);
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully');
          }}
          onCanPlay={() => {
            console.log('Video can play');
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.warn('Video autoplay failed:', err);
                setVideoLoadError(true);
              });
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="relative">
            <RefreshCw className="w-16 h-16 animate-spin text-white/80" />
            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-lg font-medium text-white/90 mb-2">{message}</p>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm font-medium text-white/90 bg-black/30 inline-block px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">{message}</p>
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

  // If no artifact but loading state is active, show loading video during transition
  if (!artifact && documentPreviewLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        <LoadingVideo />
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

  // For pending artifacts, always show loading video
  if (isPending) {
    return (
      <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-light-border shadow-sm relative">
        <LoadingVideo
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
        {documentPreviewLoading && <LoadingVideo />}
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
          <LoadingVideo
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
