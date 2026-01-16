import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../utils/toast';

/**
 * Artifact header with file info and actions
 */
const ArtifactHeader = ({ artifact, content }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const FileIcon = getFileIcon(artifact?.type);

  const handleCopy = async () => {
    if (!content && !artifact?.url) return;

    try {
      // If we have text content, copy that; otherwise copy the URL
      const textToCopy = content || artifact.url;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showSuccess('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showError('Failed to copy to clipboard');
    }
  };

  if (!artifact) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-white'}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-gray-100'}`}>
          <FileIcon className={`w-5 h-5 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-medium truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            {artifact.filename}
          </div>
          <div className={`text-xs ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            {artifact.type?.toUpperCase() || 'FILE'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-all ${
            isDark
              ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-sidebar'
              : 'text-light-text-secondary hover:text-light-text hover:bg-gray-100'
          }`}
          title="Copy content"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        {artifact.url && (
          <a
            href={artifact.url}
            download={artifact.filename}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-sidebar'
                : 'text-light-text-secondary hover:text-light-text hover:bg-gray-100'
            }`}
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ArtifactHeader;

