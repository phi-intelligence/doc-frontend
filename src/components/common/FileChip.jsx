import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * File chip component - Displays a file with icon and remove button
 * @param {Object} file - File object with filename, type, etc.
 * @param {boolean} isUpload - Whether this is an uploaded file
 * @param {boolean} isActive - Whether this file is currently active/selected
 * @param {Function} onClick - Callback when chip is clicked
 * @param {Function} onRemove - Callback when remove button is clicked
 */
const FileChip = ({ file, isUpload, isActive, onClick, onRemove }) => {
  const IconComponent = getFileIcon(file.type);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-lg border transition-all duration-200 ${isActive
        ? 'bg-brand-accent-500 text-white border-brand-accent-600 font-semibold'
        : isUpload
          ? 'bg-white text-light-text border-light-border hover:border-gray-300 hover:bg-gray-50'
          : 'bg-white text-light-text border-light-border hover:border-gray-300 hover:bg-gray-50'
        }`}
      onClick={onClick}
    >
      <IconComponent className="w-4 h-4" />
      <span className="max-w-[140px] truncate font-medium">{file.filename}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="ml-1 hover:text-red-600 hover:scale-110 transition-all duration-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.button>
  );
};

export default FileChip;
