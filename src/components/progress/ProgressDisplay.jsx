import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import DocumentContentCard from './DocumentContentCard';

/**
 * Claude-style Step Item - Minimal, flat design
 */
const StepItem = ({ item, isLast }) => {
    const [isExpanded, setIsExpanded] = useState(
        item.type === 'code_start' || item.type === 'thought' || item.status === 'running'
    );

    // Auto-expand when running, but don't auto-collapse - let user control collapse
    // TerminalBlock handles its own code content collapse
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
            return (
                <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
            );
        }
        if (item.status === 'running') {
            return <Loader2 className="w-4 h-4 text-brand-accent-500 animate-spin flex-shrink-0" />;
        }
        // Pending/queued
        return <Circle className="w-4 h-4 text-gray-200 flex-shrink-0" />;
    };

    const getTypeIcon = () => {
        if (item.type === 'thought') return <Cpu className="w-3.5 h-3.5 text-brand-accent-600" />;
        if (item.type === 'code_start') return <Terminal className="w-3.5 h-3.5 text-gray-400" />;
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
        <div className="group relative">
            {!isLast && (
                <div className="absolute left-[7px] top-8 bottom-0 w-[1px] bg-brand-accent-100" />
            )}

            {/* Main Step Row - Claude-style flat list */}
            <div
                className={`flex items-start gap-4 py-3 px-3 rounded-xl transition-all duration-200 ${hasExpandableContent ? 'cursor-pointer hover:bg-brand-accent-50/50' : ''
                    } ${item.status === 'running' ? 'bg-brand-accent-50/30' : ''}`}
                onClick={toggleExpand}
            >
                {/* Status Icon */}
                <div className="mt-0.5">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {/* Type Icon (optional) */}
                        {getTypeIcon() && (
                            <div className="px-1.5 py-0.5 rounded-md bg-white border border-brand-accent-100 flex-shrink-0 shadow-sm">
                                {getTypeIcon()}
                            </div>
                        )}
                        <span className={`text-[13px] leading-tight ${item.status === 'running' ? 'text-light-text font-bold' : 'text-light-text-secondary font-medium'
                            }`}>
                            {item.title || item.message || "Initializing system..."}
                        </span>
                    </div>

                    {/* Sub-info line */}
                    <div className="flex items-center gap-3">
                        {item.filename && (
                            <span className="text-[11px] text-brand-accent-600 font-bold font-mono tracking-tighter truncate max-w-[200px] flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-brand-accent-300" />
                                {item.filename}
                            </span>
                        )}

                        {item.duration && item.duration > 0.5 && item.status === 'complete' && (
                            <span className="text-[10px] text-light-text-muted font-bold tracking-wider">
                                {item.duration.toFixed(1)}s_EXEC
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand indicator */}
                {hasExpandableContent && (
                    <div className="mt-1 text-light-text-muted">
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                )}
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && hasExpandableContent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-11 mt-1 mb-4"
                    >
                        {/* Substeps */}
                        {item.children && item.children.length > 0 && (
                            <div className="space-y-1.5 mb-4 pl-3 border-l-2 border-brand-accent-100/50">
                                {item.children.map((child, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs text-light-text-secondary py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent-200 mt-1.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium">{child.title}</span>
                                            {child.description && (
                                                <p className="text-[11px] text-light-text-muted mt-0.5 font-mono leading-tight">{child.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Thought/Reasoning Block */}
                        {item.type === 'thought' && (item.output || item.content) && (
                            <div className="p-4 bg-brand-accent-100 rounded-xl text-brand-accent-900 border border-brand-accent-200 shadow-sm overflow-hidden relative group/thought">
                                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none text-brand-accent-400">
                                    <Cpu className="w-12 h-12" />
                                </div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-accent-600 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Analysis Engine
                                </div>
                                <div className="whitespace-pre-wrap text-[12px] leading-relaxed font-mono custom-scrollbar-light max-h-[250px] overflow-y-auto pr-2 relative z-10">
                                    {item.output || item.content}
                                </div>
                            </div>
                        )}

                        {/* Code Block - Document content cards or terminal */}
                        {item.type === 'code_start' && (() => {
                            // Check if this is a document generation step (docx, pptx, xlsx, pdf)
                            // CRITICAL: Must detect document skills DURING streaming (before content_snippets arrive)
                            // to show DocumentContentCard with "Drafting..." instead of raw code
                            const documentSkills = ['docx', 'pptx', 'xlsx', 'pdf', 'doc', 'ppt', 'xls'];
                            const documentKeywords = /\b(docx|pptx|xlsx|pdf|document|presentation|spreadsheet|report|word|powerpoint|excel)\b/i;
                            
                            // Check skill field directly (most reliable)
                            const hasDocumentSkill = item.skill && documentSkills.includes(item.skill.toLowerCase());
                            
                            // Fallback: check title, description, or command for document keywords
                            const hasDocumentKeyword = (
                                (item.title && documentKeywords.test(item.title)) ||
                                (item.description && documentKeywords.test(item.description)) ||
                                (item.command && documentKeywords.test(item.command))
                            );
                            
                            const isDocumentStep = (
                                item.content_snippets !== undefined ||
                                hasDocumentSkill ||
                                hasDocumentKeyword
                            );

                            if (isDocumentStep) {
                                // Show document content card (or "Drafting..." while streaming)
                                return (
                                    <DocumentContentCard
                                        snippets={item.content_snippets || []}
                                        title={item.description || "Document content"}
                                        isStreaming={item.status === 'running'}
                                        language={item.language}
                                    />
                                );
                            }

                            // Non-document code: show terminal block
                            return (
                                <TerminalBlock
                                    code={item.output || item.command || ""}
                                    language={item.language || "javascript"}
                                    title={item.description || `Generating ${item.language || 'code'}...`}
                                    isStreaming={item.status === 'running'}
                                />
                            );
                        })()}

                        {/* File Created Card */}
                        {item.type === 'file_created' && (
                            <div className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-xl shadow-sm group/file">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-700 transition-all duration-300">
                                    <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-0.5">Artifact Ready</div>
                                    <p className="text-sm font-bold text-light-text truncate">{item.filename}</p>
                                    <p className="text-[11px] font-medium text-light-text-muted">{item.file_type || 'Document Container'}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {item.error && (
                            <div className="p-4 bg-red-50 text-red-900 text-xs rounded-xl border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="font-bold uppercase tracking-wider">System Halt</span>
                                </div>
                                <div className="font-mono bg-white/40 p-3 rounded-lg border border-red-200/50 whitespace-pre-wrap">
                                    {item.error}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
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
