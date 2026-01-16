import React, { useRef, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';
import { useTheme } from '../../context/ThemeContext';

/**
 * Artifact switcher popover - similar to Claude's artifact selector
 */
const ArtifactSwitcher = ({ 
  artifacts, 
  activeArtifact, 
  onSelectArtifact, 
  onClose,
  isOpen 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`absolute top-full right-0 mt-2 w-80 max-h-96 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'} border rounded-lg shadow-xl z-50 overflow-hidden`}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <h3 className={`font-semibold text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          Artifacts ({artifacts.length})
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-all ${
            isDark
              ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-sidebar'
              : 'text-light-text-secondary hover:text-light-text hover:bg-gray-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-80 custom-scrollbar-dark">
        {artifacts.length === 0 ? (
          <div className={`p-4 text-center ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No artifacts yet</p>
          </div>
        ) : (
          <div className="p-2">
            {artifacts.map((artifact, index) => {
              const isActive = activeArtifact?.filename === artifact.filename;
              const IconComponent = getFileIcon(artifact.type);
              
              return (
                <button
                  key={`${artifact.filename}-${index}`}
                  onClick={() => {
                    onSelectArtifact(artifact);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left mb-1 ${
                    isActive
                      ? isDark
                        ? 'bg-dark-bg text-brand-accent-400 border border-brand-accent-500/30'
                        : 'bg-light-bg text-brand-accent-600 border border-brand-accent-500/30'
                      : isDark
                      ? 'text-dark-text-secondary hover:bg-dark-sidebar hover:text-dark-text'
                      : 'text-light-text-secondary hover:bg-gray-50 hover:text-light-text'
                  }`}
                >
                  <div className={`p-1.5 rounded ${isActive ? isDark ? 'bg-brand-accent-900/30' : 'bg-brand-accent-500/10' : isDark ? 'bg-dark-bg' : 'bg-gray-100'}`}>
                    <IconComponent className={`w-4 h-4 ${isActive ? isDark ? 'text-brand-accent-400' : 'text-brand-accent-500' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isActive ? isDark ? 'text-dark-text' : 'text-light-text' : isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                      {artifact.filename}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      {artifact.type?.toUpperCase() || 'FILE'}
                    </div>
                  </div>
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-brand-accent-400' : 'bg-brand-accent-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactSwitcher;

