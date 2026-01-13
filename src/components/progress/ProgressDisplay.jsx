import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Circle,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Terminal,
    FileText,
    Cpu,
    Sparkles
} from 'lucide-react';
import TerminalBlock from './TerminalBlock';

/**
 * Claude-style Step Item - Minimal, flat design
 */
const StepItem = ({ item, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(
        item.type === 'code_start' || item.type === 'thought' || item.status === 'running'
    );

    // Auto-expand when running, collapse when done (unless has content to show)
    useEffect(() => {
        if (item.status === 'running') {
            setIsExpanded(true);
        }
    }, [item.status]);

    const getIcon = () => {
        if (item.status === 'error') {
            return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
        }
        if (item.status === 'complete') {
            return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
        }
        if (item.status === 'running') {
            return <Loader2 className="w-4 h-4 text-brand-accent-500 animate-spin flex-shrink-0" />;
        }
        // Pending/queued
        return <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />;
    };

    const getTypeIcon = () => {
        if (item.type === 'thought') return <Cpu className="w-3.5 h-3.5 text-purple-500" />;
        if (item.type === 'code_start') return <Terminal className="w-3.5 h-3.5 text-gray-500" />;
        if (item.type === 'file_created') return <FileText className="w-3.5 h-3.5 text-blue-500" />;
        return null;
    };

    const hasExpandableContent = item.type === 'code_start' || item.type === 'thought' ||
        item.type === 'file_created' || item.children?.length > 0;

    const toggleExpand = () => {
        if (hasExpandableContent) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="group">
            {/* Main Step Row - Claude-style flat list */}
            <div
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${hasExpandableContent ? 'cursor-pointer hover:bg-light-surface' : ''
                    } ${item.status === 'running' ? 'bg-brand-accent-50/50' : ''}`}
                onClick={toggleExpand}
            >
                {/* Status Icon */}
                {getIcon()}

                {/* Type Icon (optional) */}
                {getTypeIcon() && (
                    <div className="flex-shrink-0">
                        {getTypeIcon()}
                    </div>
                )}

                {/* Step Text */}
                <span className={`flex-1 text-sm truncate ${item.status === 'running' ? 'text-light-text font-medium' : 'text-light-text-secondary'
                    }`}>
                    {item.title || item.message || "Processing..."}
                </span>

                {/* Filename (right side, like Claude) */}
                {item.filename && (
                    <span className="text-xs text-light-text-muted font-mono truncate max-w-[150px]">
                        {item.filename}
                    </span>
                )}

                {/* Duration badge */}
                {item.duration && item.duration > 0.5 && item.status === 'complete' && (
                    <span className="text-xs text-light-text-muted">
                        {item.duration.toFixed(1)}s
                    </span>
                )}

                {/* Expand indicator */}
                {hasExpandableContent && (
                    <div className="text-light-text-muted">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                )}
            </div>

            {/* Expandable Content */}
            {isExpanded && hasExpandableContent && (
                <div className="ml-7 mt-2 mb-3">
                    {/* Substeps */}
                    {item.children && item.children.length > 0 && (
                        <ul className="space-y-1 mb-3">
                            {item.children.map((child, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-light-text-secondary py-1">
                                    <span className="w-1 h-1 rounded-full bg-light-text-muted" />
                                    {child.title}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Thought/Reasoning Block */}
                    {item.type === 'thought' && (item.output || item.content) && (
                        <div className="p-3 bg-purple-50 rounded-lg text-sm text-purple-900 border border-purple-100">
                            <div className="text-[10px] uppercase tracking-wider text-purple-500 font-semibold mb-1">
                                Reasoning
                            </div>
                            <div className="whitespace-pre-wrap text-xs leading-relaxed">
                                {item.output || item.content}
                            </div>
                        </div>
                    )}

                    {/* Code Block - Use existing TerminalBlock */}
                    {item.type === 'code_start' && (
                        <TerminalBlock
                            code={item.output || item.command || ""}
                            language={item.language || "javascript"}
                            title={item.description || `Generating ${item.language || 'code'}...`}
                            isStreaming={item.status === 'running'}
                        />
                    )}

                    {/* File Created Card */}
                    {item.type === 'file_created' && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-md">
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 truncate">{item.filename}</p>
                                <p className="text-xs text-blue-600">{item.file_type || 'Document'}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {item.error && (
                        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-100">
                            <p className="font-semibold mb-1">Error:</p>
                            <p className="font-mono whitespace-pre-wrap">{item.error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Claude-style Progress Display - Clean, minimal step list
 */
export const ProgressDisplay = ({ items }) => {
    if (!items || items.length === 0) return null;

    // Group items by phase if they have phase headers
    const isActivelyProcessing = items.some(item => item.status === 'running');

    return (
        <div className="w-full">
            {/* Step List */}
            <div className="space-y-0.5">
                {items.map((item, index) => (
                    <StepItem
                        key={item.id || index}
                        item={item}
                        isLast={index === items.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressDisplay;
