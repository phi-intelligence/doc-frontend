import React, { memo } from 'react';
import { getFileCategory, hasCodeView, isTextBased } from '../../utils/artifactUtils';
import MarkdownRenderer from './renderers/MarkdownRenderer';
import CodeRenderer from './renderers/CodeRenderer';
import PDFRenderer from './renderers/PDFRenderer';
import OfficeRenderer from './renderers/OfficeRenderer';
import ImageRenderer from './renderers/ImageRenderer';
import ExcelRenderer from './renderers/ExcelRenderer';
import MermaidRenderer from './renderers/MermaidRenderer';
import ArtifactSkeleton from './ArtifactSkeleton';
import { useTheme } from '../../context/ThemeContext';

/**
 * Artifact content renderer that routes to appropriate renderer based on file type
 */
const ArtifactContent = ({
  artifact,
  content,
  activeTab,
  isLoading,
  currentPage,
  setCurrentPage,
  totalPages,
  onLoadComplete
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Only show loading skeleton for text-based files that need content fetching
  const needsContentLoading = artifact && isTextBased(artifact.type?.toLowerCase()) && isLoading;
  
  if (needsContentLoading) {
    return (
      <div className={`flex-1 overflow-auto artifact-scrollbar ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
        <ArtifactSkeleton />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-dark-bg text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No file selected</p>
          <p className="text-sm">Select a file from the list to preview</p>
        </div>
      </div>
    );
  }

  const category = getFileCategory(artifact.type);
  const ext = artifact.type?.toLowerCase();

  // Handle code view tab for files that support it
  if (hasCodeView(artifact.type) && activeTab === 'code') {
    return (
      <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
        <CodeRenderer code={content} fileType={artifact.type} />
      </div>
    );
  }

  // Handle preview tab or files without code view
  switch (category) {
    case 'markdown':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <MarkdownRenderer content={content} />
        </div>
      );

    case 'code':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <CodeRenderer code={content} fileType={artifact.type} />
        </div>
      );

    case 'mermaid':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <MermaidRenderer content={content} />
        </div>
      );

    case 'pdf':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <PDFRenderer
            artifact={artifact}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onLoadComplete={onLoadComplete}
          />
        </div>
      );

    case 'office':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <OfficeRenderer
            artifact={artifact}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onLoadComplete={onLoadComplete}
          />
        </div>
      );

    case 'spreadsheet':
      return (
        <div className="flex-1 overflow-auto w-full max-w-full min-w-0 artifact-scrollbar">
          <ExcelRenderer artifact={artifact} onLoadComplete={onLoadComplete} />
        </div>
      );

    case 'image':
      return (
        <div className="flex-1 overflow-hidden w-full max-w-full min-w-0">
          <ImageRenderer artifact={artifact} />
        </div>
      );

    default:
      // Fallback for unsupported types
      return (
        <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-dark-bg text-dark-text-secondary' : 'bg-white text-light-text-secondary'}`}>
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-sm">File type .{ext} is not supported for preview</p>
            {artifact.url && (
              <a
                href={artifact.url}
                download={artifact.filename}
                className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-brand-accent-600 hover:bg-brand-accent-500 text-white'
                    : 'bg-brand-accent-500 hover:bg-brand-accent-600 text-white'
                }`}
              >
                Download File
              </a>
            )}
          </div>
        </div>
      );
  }
};

export default memo(ArtifactContent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.artifact?.filename === nextProps.artifact?.filename &&
    prevProps.artifact?.url === nextProps.artifact?.url &&
    prevProps.content === nextProps.content &&
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages
  );
});

