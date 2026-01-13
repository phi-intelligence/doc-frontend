import React from 'react';
import {
  File, FileText, FileSpreadsheet, Presentation, FileImage, Code
} from 'lucide-react';
import { getFileIcon as getFileIconUtil } from '../../utils/fileUtils';

/**
 * File icon component - Renders appropriate icon for file type
 * @param {string} type - File extension or MIME type
 * @param {string} className - Additional CSS classes
 * @param {number} size - Icon size (default: 16)
 */
const FileIcon = ({ type, className = '', size = 16 }) => {
  const IconComponent = getFileIconUtil(type);
  return <IconComponent className={className} style={{ width: size, height: size }} />;
};

export default FileIcon;
