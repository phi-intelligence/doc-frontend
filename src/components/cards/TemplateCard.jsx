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
            className={`flex flex-col bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg ${isSelected
                    ? 'border-2 border-brand-accent-600 ring-2 ring-brand-accent-200'
                    : 'border-2 border-transparent hover:border-brand-accent-300'
                }`}
        >
            {/* Thumbnail Preview */}
            <div className="relative w-full aspect-[3/4] bg-slate-100 overflow-hidden">
                {template.thumbnail_url ? (
                    <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-16 h-16" />
                    </div>
                )}

                {/* Selected Badge (checkmark) */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-brand-accent-600 text-white rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white capitalize">
                    {template.category}
                </div>
            </div>

            {/* Template Info */}
            <div className="p-3 text-left">
                <h4 className="text-sm font-semibold text-light-text mb-1 line-clamp-1">
                    {template.name}
                </h4>
                <p className="text-xs text-light-text-secondary line-clamp-2">
                    {template.preview_description || template.description}
                </p>
            </div>
        </button>
    );
};

export default TemplateCard;
