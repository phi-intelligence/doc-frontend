import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

/**
 * PDF renderer with page navigation
 */
const PDFRenderer = ({ artifact, currentPage, setCurrentPage, totalPages, onLoadComplete }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    // Small delay to ensure PDF is rendered
    setTimeout(() => {
      setLoading(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }, 100);
  };

  const handleError = () => {
    setLoading(false);
    if (onLoadComplete) {
      onLoadComplete();
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-dark-bg' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-brand-accent-400' : 'border-brand-accent-500'}`}></div>
              <p className={`mt-2 text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${artifact.url}#toolbar=0&navpanes=0&page=${currentPage}`}
          className={`w-full h-full border-0 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          title="PDF Preview"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      
      {totalPages && totalPages > 1 && (
        <div className={`flex items-center justify-between gap-2 px-4 py-2 border-t ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-gray-50'}`}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'text-dark-text bg-dark-bg border-dark-border hover:bg-dark-sidebar'
                : 'text-light-text bg-white border-light-border hover:bg-gray-100'
            } border`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= totalPages}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'text-dark-text bg-dark-bg border-dark-border hover:bg-dark-sidebar'
                : 'text-light-text bg-white border-light-border hover:bg-gray-100'
            } border`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFRenderer;

