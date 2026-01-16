import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Application header component
 * @param {boolean} ragAvailable - Whether RAG is available
 * @param {boolean} ragIndexedDocuments - Whether documents are indexed
 * @param {Function} onClearAll - Callback to clear all data
 */
const Header = ({ ragAvailable, ragIndexedDocuments, onClearAll }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`h-14 sm:h-16 lg:h-20 border-b flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 ${isDark ? 'border-dark-border bg-dark-bg' : 'border-light-border bg-light-bg'}`}>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0">
          <img 
            src="/logophi_brown.png" 
            alt="Phi Docs Logo" 
            className="w-full h-full object-contain" 
            onError={(e) => { 
              e.target.style.display = 'none'; 
              e.target.nextSibling.parentElement.classList.add('p-3'); 
              e.target.nextSibling.style.display = 'block'; 
            }} 
          />
          <Sparkles className={`w-full h-full ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'} hidden`} />
        </div>
        <span className={`font-display font-semibold text-lg sm:text-xl lg:text-2xl tracking-tight uppercase truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Phi Docs</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        {/* RAG Status Indicator */}
        {ragAvailable && (
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg border transition-all ${ragIndexedDocuments
            ? isDark ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-200'
            : isDark ? 'bg-dark-surface text-dark-text-secondary border-dark-border' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
            <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${ragIndexedDocuments ? isDark ? 'text-green-400' : 'text-green-600' : isDark ? 'text-dark-text-muted' : 'text-gray-400'}`} />
            <span className="font-medium whitespace-nowrap hidden sm:inline">
              {ragIndexedDocuments ? 'Document Q&A Active' : 'RAG Ready'}
            </span>
            <span className="font-medium sm:hidden">
              {ragIndexedDocuments ? 'Q&A' : 'RAG'}
            </span>
          </div>
        )}
        <button
          onClick={onClearAll}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg transition-all duration-200 ${isDark ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface border-dark-border' : 'text-light-text-secondary hover:text-light-text hover:bg-white border-light-border'}`}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="font-medium hidden sm:inline">Clear All</span>
        </button>
      </div>
    </div>
  );
};

export default Header;

