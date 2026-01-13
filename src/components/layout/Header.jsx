import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';

/**
 * Application header component
 * @param {boolean} ragAvailable - Whether RAG is available
 * @param {boolean} ragIndexedDocuments - Whether documents are indexed
 * @param {Function} onClearAll - Callback to clear all data
 */
const Header = ({ ragAvailable, ragIndexedDocuments, onClearAll }) => {
  return (
    <div className="h-20 border-b border-light-border flex items-center justify-between px-8 bg-light-bg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12">
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
          <Sparkles className="w-full h-full text-brand-accent-500 hidden" />
        </div>
        <span className="font-display font-semibold text-2xl text-light-text tracking-tight uppercase">Phi Docs</span>
      </div>
      <div className="flex items-center gap-3">
        {/* RAG Status Indicator */}
        {ragAvailable && (
          <div className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all ${ragIndexedDocuments
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
            <Sparkles className={`w-3.5 h-3.5 ${ragIndexedDocuments ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-medium">
              {ragIndexedDocuments ? 'Document Q&A Active' : 'RAG Ready'}
            </span>
          </div>
        )}
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-4 py-2 text-sm text-light-text-secondary hover:text-light-text hover:bg-white border border-light-border rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Clear All</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
