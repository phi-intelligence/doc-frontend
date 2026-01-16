import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * Claude-style Artifact Card - Shows generated files in chat
 * Appears after document generation is complete
 */
const ArtifactCard = ({ artifact, onClick, isActive = false }) => {
    if (!artifact) return null;

    const Icon = getFileIcon(artifact.type);
    const ext = artifact.type?.toUpperCase() || 'FILE';

    return (
        <div
            onClick={onClick}
            className={`
        group flex items-center gap-3 p-3 rounded-xl border cursor-pointer
        transition-all duration-200 ease-out
        ${isActive
                    ? 'bg-brand-accent-50 dark:bg-brand-accent-900/30 border-brand-accent-200 dark:border-brand-accent-800 shadow-sm'
                    : 'bg-white dark:bg-dark-surface border-light-border dark:border-dark-border hover:border-brand-accent-200 dark:hover:border-brand-accent-700 hover:bg-light-surface dark:hover:bg-dark-sidebar'
                }
      `}
        >
            {/* File Icon */}
            <div className={`
        p-2.5 rounded-lg transition-colors
        ${isActive ? 'bg-brand-accent-100 dark:bg-brand-accent-800/50' : 'bg-light-surface dark:bg-dark-sidebar group-hover:bg-brand-accent-50 dark:group-hover:bg-brand-accent-900/30'}
      `}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent-600 dark:text-brand-accent-400' : 'text-brand-accent-500 dark:text-brand-accent-400'}`} />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                    {artifact.filename}
                </p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                    {artifact.summary || `${ext} Document`}
                </p>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {artifact.url && (
                    <a
                        href={artifact.url}
                        download={artifact.filename}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-light-surface dark:hover:bg-dark-sidebar rounded-md transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted" />
                    </a>
                )}
                <button
                    onClick={onClick}
                    className="p-1.5 hover:bg-light-surface dark:hover:bg-dark-sidebar rounded-md transition-colors"
                    title="Preview"
                >
                    <ExternalLink className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted" />
                </button>
            </div>
        </div>
    );
};

export default ArtifactCard;
