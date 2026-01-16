import React from 'react';
import { Check, FileText } from 'lucide-react';

/**
 * TemplateCard - Displays a single template option with thumbnail
 * @param {Object} template - Template object with id, name, thumbnail_url, category, etc.
 * @param {boolean} isSelected - Whether this template is currently selected
 * @param {Function} onClick - Handler when card is clicked
 */
const TemplateCard = ({ template, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col bg-white dark:bg-dark-surface rounded-xl overflow-hidden transition-all hover:shadow-lg ${isSelected
                    ? 'border-2 border-brand-accent-600 dark:border-brand-accent-500 ring-2 ring-brand-accent-200 dark:ring-brand-accent-800'
                    : 'border-2 border-transparent hover:border-brand-accent-300 dark:hover:border-brand-accent-600'
                }`}
        >
            {/* Thumbnail Preview */}
            <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-dark-sidebar overflow-hidden">
                {template.thumbnail_url ? (
                    <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-dark-text-muted">
                        <FileText className="w-16 h-16" />
                    </div>
                )}

                {/* Selected Badge (checkmark) */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-brand-accent-600 dark:bg-brand-accent-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 dark:bg-white/20 backdrop-blur-sm rounded text-xs text-white capitalize">
                    {template.category}
                </div>
            </div>

            {/* Template Info */}
            <div className="p-3 text-left">
                <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1 line-clamp-1">
                    {template.name}
                </h4>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                    {template.preview_description || template.description}
                </p>
            </div>
        </button>
    );
};

export default TemplateCard;
