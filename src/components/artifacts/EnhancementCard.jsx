import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, X, Wand2, Eye } from 'lucide-react';

/**
 * Enhancement card component - Shows AI image enhancement progress
 * @param {string} originalFile - Original file name
 * @param {string} enhancedFile - Enhanced file name (if completed)
 * @param {string} status - Status: 'processing', 'completed', or 'error'
 * @param {Function} onViewFile - Callback to view the enhanced file
 */
const EnhancementCard = ({ originalFile, enhancedFile, status, onViewFile }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-4 w-full max-w-3xl mx-auto"
  >
    <div className="border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status Icon */}
        {status === 'processing' ? (
          <div className="p-2 bg-purple-100 rounded-full">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
          </div>
        ) : status === 'completed' ? (
          <div className="p-2 bg-green-100 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div className="p-2 bg-red-100 rounded-full">
            <X className="w-4 h-4 text-red-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-light-text truncate">
              {status === 'processing' ? 'Enhancing with AI images...' :
                status === 'completed' ? 'Enhancement complete!' : 'Enhancement failed'}
            </span>
          </div>
          <p className="text-xs text-light-text-secondary mt-0.5 truncate">
            {originalFile} → {enhancedFile || '...'}
          </p>
        </div>

        {/* View Button */}
        {status === 'completed' && enhancedFile && onViewFile && (
          <button
            onClick={() => onViewFile(enhancedFile)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export default EnhancementCard;

