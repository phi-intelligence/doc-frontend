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
                    ? 'bg-brand-accent-50 border-brand-accent-200 shadow-sm'
                    : 'bg-white border-light-border hover:border-brand-accent-200 hover:bg-light-surface'
                }
      `}
        >
            {/* File Icon */}
            <div className={`
        p-2.5 rounded-lg transition-colors
        ${isActive ? 'bg-brand-accent-100' : 'bg-light-surface group-hover:bg-brand-accent-50'}
      `}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent-600' : 'text-brand-accent-500'}`} />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text truncate">
                    {artifact.filename}
                </p>
                <p className="text-xs text-light-text-muted mt-0.5">
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
                        className="p-1.5 hover:bg-light-surface rounded-md transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4 text-light-text-muted" />
                    </a>
                )}
                <button
                    onClick={onClick}
                    className="p-1.5 hover:bg-light-surface rounded-md transition-colors"
                    title="Preview"
                >
                    <ExternalLink className="w-4 h-4 text-light-text-muted" />
                </button>
            </div>
        </div>
    );
};

export default ArtifactCard;
