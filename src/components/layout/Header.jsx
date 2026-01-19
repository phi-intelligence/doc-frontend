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
        <div className="w-10 h-10">
          <img
            src="/logophi_brown.png"
            alt="Phi Docs Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.parentElement.classList.add('p-2');
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <Sparkles className="w-full h-full text-brand-accent-500 hidden" />
        </div>
        <span className="font-display font-semibold text-xl text-light-text tracking-tight">Phi Docs</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-light-text-secondary hover:text-brand-accent-600 hover:bg-brand-accent-50 border border-light-border hover:border-brand-accent-200 rounded-lg transition-all duration-200 uppercase tracking-wider"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
