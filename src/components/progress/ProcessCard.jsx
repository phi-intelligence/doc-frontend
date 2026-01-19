import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProgressDisplay from './ProgressDisplay';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * Claude-style Process Card - Clean, minimal design
 * Shows AI processing steps in a collapsible container
 */
const ProcessCard = ({ title, query, steps, finalResult, artifacts, status, isCollapsed, onToggle, onRetry }) => {
  // Count steps for header
  const stepCount = steps?.length || 0;

  // Get header text based on status
  const getHeaderText = () => {
    if (status === 'processing') {
      return `Processing...`;
    }
    if (status === 'completed') {
      return `${stepCount} step${stepCount !== 1 ? 's' : ''}`;
    }
    if (status === 'warning') {
      return 'Completed with issues';
    }
    if (status === 'error') {
      return 'Error occurred';
    }
    return title || 'Phi Docs';
  };

  return (
    <div className="mb-6 w-full max-w-3xl mx-auto">
      {/* Sleek Status Terminal Card */}
      <div className="border border-brand-accent-200 border-t-4 border-t-brand-accent-600 rounded-2xl bg-[#FDFBF7] shadow-[0_8px_30px_rgba(136,108,74,0.12)] overflow-hidden transition-all duration-300">
        {/* Header - Interactive */}
        <div
          onClick={onToggle}
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-brand-accent-50 transition-colors border-b border-brand-accent-100"
        >
          <div className="flex items-center gap-4">
            {/* Status Visual */}
            <div className="relative flex items-center justify-center">
              {status === 'processing' ? (
                <>
                  <div className="absolute inset-0 bg-brand-accent-200/50 rounded-full animate-ping" />
                  <Loader2 className="w-5 h-5 text-brand-accent-600 animate-spin relative z-10" />
                </>
              ) : status === 'completed' ? (
                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </div>
              ) : status === 'warning' ? (
                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
              ) : status === 'error' ? (
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
                  <X className="w-3.5 h-3.5 text-red-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-brand-accent-100" />
              )}
            </div>

            {/* Title & Status */}
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${
                status === 'warning' ? 'text-amber-700' : 'text-brand-accent-700'
              }`}>
                {status === 'processing' ? 'System Processing' : status === 'completed' ? 'Response Ready' : status === 'warning' ? 'Attention Required' : 'System Error'}
              </span>
              <span className="text-sm font-bold text-brand-accent-900 font-mono">
                {getHeaderText()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Retry Button */}
            {(status === 'error' || status === 'warning') && onRetry && (
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(query); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-all ${
                  status === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {status === 'warning' ? 'TRY_AGAIN' : 'RETRY_SYSTEM'}
              </button>
            )}

            {/* Collapse Toggle */}
            <div className="w-8 h-8 rounded-full hover:bg-brand-accent-100/50 flex items-center justify-center transition-colors">
              <ChevronDown
                className={`w-5 h-5 text-brand-accent-500 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Expandable Steps Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="p-4 bg-brand-accent-50/30">
                <ProgressDisplay items={steps} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final Result - Premium Markdown Display */}
      {(status === 'completed' || status === 'warning') && finalResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 px-6 py-5 bg-[#FDFBF7] rounded-2xl border shadow-[0_4px_20px_rgba(136,108,74,0.05)] text-sm text-brand-accent-900 leading-relaxed ${
            status === 'warning' ? 'border-amber-200' : 'border-brand-accent-200'
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-brand-accent-950" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="bg-brand-accent-100/50 px-1.5 py-0.5 rounded text-[13px] font-mono text-brand-accent-800 border border-brand-accent-200" {...props} />
                ) : (
                  <div className="my-4 rounded-xl overflow-hidden border border-brand-accent-200 border-t-4 border-t-brand-accent-600 bg-brand-accent-50 shadow-inner">
                    <div className="flex items-center px-4 py-2 bg-brand-accent-600 border-b border-brand-accent-700">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10" />
                      </div>
                    </div>
                    <code className="block p-4 text-[13px] font-mono text-brand-accent-900 overflow-x-auto" {...props} />
                  </div>
                ),
              a: ({ node, ...props }) => <a className="text-brand-accent-600 font-bold hover:underline" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
            }}
          >
            {finalResult}
          </ReactMarkdown>
        </motion.div>
      )}
    </div>
  );
};

// Memoize to prevent re-renders from unrelated parent state changes
export default memo(ProcessCard);
