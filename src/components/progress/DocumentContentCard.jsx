import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Loader2, BookOpen, PenTool, Layout, Sparkles, FileEdit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Rotating friendly messages for drafting state
const DRAFTING_MESSAGES = [
    { text: "Drafting document content...", icon: PenTool },
    { text: "Creating sections for your document...", icon: Layout },
    { text: "Preparing content structure...", icon: FileEdit },
    { text: "Generating document elements...", icon: Sparkles },
    { text: "Building your document...", icon: FileText },
];

/**
 * Hook for rotating through drafting messages
 */
const useDraftingMessage = (isDrafting) => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!isDrafting) {
            setMessageIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % DRAFTING_MESSAGES.length);
        }, 2500); // Rotate every 2.5 seconds

        return () => clearInterval(interval);
    }, [isDrafting]);

    return DRAFTING_MESSAGES[messageIndex];
};

/**
 * DocumentContentCard - Shows document content snippets instead of raw code.
 *
 * This component displays the extracted text content that will appear in
 * the generated document, providing a more user-friendly preview than
 * showing raw code during document generation.
 */
const DocumentContentCard = ({
    snippets = [],
    title = "Document content",
    isStreaming = false,
    language = "document"
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // Show "Drafting document..." when streaming and no snippets yet
    const isDrafting = isStreaming && (!snippets || snippets.length === 0);

    // Get rotating message for drafting state
    const draftingMessage = useDraftingMessage(isDrafting);

    // Limit visible snippets unless expanded
    const MAX_VISIBLE = 8;
    const visibleSnippets = showAll ? snippets : snippets.slice(0, MAX_VISIBLE);
    const hasMore = snippets.length > MAX_VISIBLE;

    // Truncate long snippets for display
    const truncateSnippet = (text, maxLen = 200) => {
        if (!text || text.length <= maxLen) return text;
        return text.slice(0, maxLen).trim() + '...';
    };

    return (
        <div className="mt-4 mb-3 rounded-xl overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200 cursor-pointer hover:from-blue-150 hover:to-blue-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-200">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-blue-900">
                            {isDrafting ? "Drafting document..." : title}
                        </span>
                        {!isDrafting && snippets.length > 0 && (
                            <span className="ml-2 text-xs text-blue-500 font-medium">
                                {snippets.length} content block{snippets.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {isStreaming && (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-2" />
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Content Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                    >
                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar-light">
                            {isDrafting ? (
                                /* Drafting state - show animated rotating placeholder */
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-200 animate-pulse">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={draftingMessage.text}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {React.createElement(draftingMessage.icon, {
                                                    className: "w-4 h-4 text-blue-600"
                                                })}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex-1">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={draftingMessage.text}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-sm text-blue-700 font-medium block"
                                            >
                                                {draftingMessage.text}
                                            </motion.span>
                                        </AnimatePresence>
                                        <span className="text-xs text-blue-500 mt-0.5 block">
                                            Content will appear as it's generated...
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            ) : snippets.length === 0 ? (
                                /* No content extracted */
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Document content will appear here
                                    </span>
                                </div>
                            ) : (
                                /* Content snippets */
                                <>
                                    {visibleSnippets.map((snippet, index) => (
                                        <ContentSnippet
                                            key={index}
                                            text={truncateSnippet(snippet)}
                                            index={index}
                                        />
                                    ))}

                                    {/* Show more button */}
                                    {hasMore && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAll(!showAll);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {showAll ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Show less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    Show {snippets.length - MAX_VISIBLE} more
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Individual content snippet card
 */
const ContentSnippet = ({ text, index }) => {
    if (!text) return null;

    return (
        <div className="group relative p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all">
            {/* Index indicator */}
            <div className="absolute -left-1 top-3 w-1 h-6 bg-blue-300 rounded-full opacity-60" />

            {/* Content */}
            <p className="text-sm text-gray-800 leading-relaxed pl-2 whitespace-pre-wrap">
                {text}
            </p>
        </div>
    );
};

export default DocumentContentCard;
