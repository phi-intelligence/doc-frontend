import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronDown, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Terminal Block Component for Timeline with Live Streaming Support
const TerminalBlock = ({ code, language, title, isStreaming = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const codeRef = useRef(null);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-scroll to bottom when code grows (streaming)
    useEffect(() => {
        if (isStreaming && codeRef.current && isExpanded) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [code, isStreaming, isExpanded]);

    // Auto-expand when streaming starts
    useEffect(() => {
        if (isStreaming && !isExpanded) {
            setIsExpanded(true);
        }
    }, [isStreaming]);

    return (
        <div className="mt-3 mb-2 rounded-lg overflow-hidden border border-light-border bg-terminal-light shadow-soft font-mono text-sm max-w-full">
            {/* Terminal Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-3 py-2 bg-light-surface border-b border-light-border cursor-pointer hover:bg-light-sidebar transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-brand-accent-500" />
                    <span className="text-xs font-medium text-light-text font-sans">
                        {title || `Generate ${language || 'Code'}`}
                    </span>
                    {isStreaming && (
                        <span className="w-1.5 h-3 bg-brand-accent-400 animate-pulse inline-block ml-1" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isStreaming && (
                        <span className="text-[10px] text-brand-accent-500 animate-pulse mr-2">Streaming...</span>
                    )}
                    <span className="text-[10px] text-light-text-muted font-sans">
                        {isExpanded ? 'Hide' : 'Show Code'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-light-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Terminal Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="relative p-3 overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar-thin" ref={codeRef}>
                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-1.5 rounded bg-light-sidebar hover:bg-light-border text-light-text-secondary hover:text-light-text transition-all z-10"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </button>

                            <pre className="text-xs leading-relaxed text-light-text font-mono code-block whitespace-pre-wrap break-all">
                                {code}
                                {isStreaming && <span className="inline-block w-2 h-4 align-text-bottom bg-brand-accent-300 animate-pulse ml-0.5" />}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TerminalBlock;
