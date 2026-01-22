import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronDown, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Terminal Block Component for Timeline with Live Streaming Support
const TerminalBlock = ({ code, language, title, isStreaming = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [displayedCode, setDisplayedCode] = useState('');
    const codeRef = useRef(null);
    const revealIntervalRef = useRef(null);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Typewriter effect: reveal code progressively for readable streaming
    useEffect(() => {
        if (isStreaming && code.length > displayedCode.length) {
            // Clear any existing interval
            if (revealIntervalRef.current) {
                clearInterval(revealIntervalRef.current);
            }

            // Reveal ~15 chars every 30ms for readable speed
            revealIntervalRef.current = setInterval(() => {
                setDisplayedCode(prev => {
                    const nextLength = Math.min(prev.length + 15, code.length);
                    if (nextLength >= code.length) {
                        clearInterval(revealIntervalRef.current);
                        revealIntervalRef.current = null;
                    }
                    return code.slice(0, nextLength);
                });
            }, 30);
        }

        return () => {
            if (revealIntervalRef.current) {
                clearInterval(revealIntervalRef.current);
            }
        };
    }, [code, isStreaming]);

    // When streaming ends, show full code immediately
    useEffect(() => {
        if (!isStreaming && code) {
            setDisplayedCode(code);
        }
    }, [isStreaming, code]);

    // Auto-scroll to bottom when code grows (streaming)
    useEffect(() => {
        if (isStreaming && codeRef.current && isExpanded) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [displayedCode, isStreaming, isExpanded]);

    // Auto-expand when streaming starts
    useEffect(() => {
        if (isStreaming && !isExpanded) {
            setIsExpanded(true);
        }
    }, [isStreaming]);

    // NOTE: No auto-collapse - terminal stays visible after streaming
    // User can manually click header to collapse if desired

    return (
        <div className="mt-4 mb-3 rounded-xl overflow-hidden border border-brand-accent-200 border-t-4 border-t-brand-accent-600 bg-brand-accent-50 shadow-[0_10px_30px_rgba(136,108,74,0.1)] font-mono text-sm max-w-full">
            {/* Terminal Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between px-4 py-2.5 bg-brand-accent-600 border-b border-brand-accent-700 cursor-pointer hover:bg-brand-accent-700 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5 mr-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                    </div>
                    <Terminal className="w-3.5 h-3.5 text-brand-accent-100" />
                    <span className="text-[11px] font-bold text-white tracking-wider font-mono uppercase">
                        {title || `Generate ${language || 'Code'}`}
                    </span>
                    {isStreaming && (
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="w-1.5 h-3 bg-white animate-pulse inline-block" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isStreaming && (
                        <span className="text-[10px] text-brand-accent-100 font-bold animate-pulse">STREAMING_PROCESS</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-brand-accent-100 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Terminal Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                    >
                        <div className="relative p-5 overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar-light" ref={codeRef}>
                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2 rounded-lg bg-brand-accent-100/50 hover:bg-brand-accent-200/50 text-brand-accent-600 transition-all z-10 border border-brand-accent-200"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <pre className="text-xs leading-relaxed text-brand-accent-900 font-mono whitespace-pre-wrap break-all selection:bg-brand-accent-200">
                                {displayedCode}
                                {(isStreaming || displayedCode.length < code.length) && <span className="inline-block w-2 h-4 align-text-bottom bg-brand-accent-500 animate-pulse ml-1" />}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TerminalBlock;
