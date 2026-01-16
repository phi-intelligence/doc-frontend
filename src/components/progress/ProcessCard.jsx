import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ProgressDisplay from './ProgressDisplay';
import { getFileIcon } from '../../utils/fileUtils';
import { useTheme } from '../../context/ThemeContext';

/**
 * Claude-style Process Card - Clean, minimal design
 * Shows AI processing steps in a collapsible container
 */
const ProcessCard = ({ title, query, steps, finalResult, artifacts, status, isCollapsed, onToggle, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-dark-border bg-dark-surface/50' : 'border-light-border bg-light-surface/50'}`}>
        {/* Header - Click to collapse */}
        <div
          onClick={onToggle}
          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${isDark ? 'hover:bg-dark-surface' : 'hover:bg-light-surface'}`}
        >
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            {status === 'processing' ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            ) : status === 'completed' ? (
              <Check className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            ) : status === 'error' ? (
              <X className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            ) : (
              <div className={`w-4 h-4 rounded-full border-2 ${isDark ? 'border-dark-border' : 'border-light-border'}`} />
            )}

            {/* Header Text */}
            <span className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              {getHeaderText()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Retry Button */}
            {status === 'error' && onRetry && (
              <button
                onClick={(e) => { e.stopPropagation(); onRetry(query); }}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-lg transition-all ${isDark ? 'text-dark-text hover:bg-dark-sidebar border-dark-border' : 'text-light-text hover:bg-white border-light-border'}`}
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}

            {/* Collapse Arrow */}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'} ${!isCollapsed ? 'rotate-180' : ''}`}
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
              className={`border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}
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
        <div className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className={`px-1.5 py-0.5 rounded text-xs font-mono border ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`} {...props} />
                ) : (
                  <code className={`block p-2 rounded text-xs font-mono border overflow-x-auto mb-2 ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'}`} {...props} />
                ),
              a: ({ node, ...props }) => <a className={`hover:underline ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} {...props} />,
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
