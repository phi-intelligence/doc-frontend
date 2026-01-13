import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, RefreshCw, Loader2 } from 'lucide-react';
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
    if (status === 'error') {
      return 'Error occurred';
    }
    return title || 'Phi Docs';
  };

  return (
    <div className="mb-4 w-full">
      {/* Collapsible Card */}
      <div className="border border-light-border rounded-xl bg-light-surface/50 overflow-hidden">
        {/* Header - Click to collapse */}
        <div
          onClick={onToggle}
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-light-surface transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            {status === 'processing' ? (
              <Loader2 className="w-4 h-4 text-brand-accent-500 animate-spin" />
            ) : status === 'completed' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : status === 'error' ? (
              <X className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-light-border" />
            )}

            {/* Header Text */}
            <span className="text-sm font-medium text-light-text">
              {getHeaderText()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Retry Button */}
            {status === 'error' && onRetry && (
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(query); }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-light-text hover:bg-white border border-light-border rounded-lg transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}

            {/* Collapse Arrow */}
            <ChevronDown
              className={`w-4 h-4 text-light-text-muted transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''
                }`}
            />
          </div>
        </div>

        {/* Expandable Steps Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-t border-light-border"
            >
              <div className="p-2">
                <ProgressDisplay items={steps} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final Result - Shown below card when completed */}
      {status === 'completed' && finalResult && (
        <div className="mt-3 text-sm text-light-text leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="bg-light-surface px-1.5 py-0.5 rounded text-xs font-mono border border-light-border" {...props} />
                ) : (
                  <code className="block bg-light-surface p-2 rounded text-xs font-mono border border-light-border overflow-x-auto mb-2" {...props} />
                ),
              a: ({ node, ...props }) => <a className="text-brand-accent-500 hover:underline" {...props} />,
            }}
          >
            {finalResult}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent re-renders from unrelated parent state changes
export default memo(ProcessCard);
