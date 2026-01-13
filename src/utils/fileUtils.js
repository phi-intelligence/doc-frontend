import {
  File, FileText, FileSpreadsheet, Presentation, FileImage, Code
} from 'lucide-react';

/**
 * Get the appropriate icon component for a file type
 * @param {string} type - File extension or MIME type
 * @returns {React.Component} Lucide icon component
 */
export const getFileIcon = (type) => {
  if (!type) return File;
  const t = type.toLowerCase();
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(t)) return FileImage;
  
  // Document types
  if (['pdf'].includes(t)) return FileText;
  if (['docx', 'doc'].includes(t)) return FileText;
  
  // Spreadsheet types
  if (['xlsx', 'xls'].includes(t)) return FileSpreadsheet;
  
  // Presentation types
  if (['pptx', 'ppt'].includes(t)) return Presentation;
  
  // Code types
  if (['js', 'jsx', 'py', 'html', 'css', 'json', 'ts', 'tsx'].includes(t)) return Code;
  
  return File;
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (without dot)
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Get file type category
 * @param {string} filename - File name
 * @returns {string} File category (image, document, spreadsheet, presentation, code, other)
 */
export const getFileCategory = (filename) => {
  const ext = getFileExtension(filename);
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['pdf', 'docx', 'doc'].includes(ext)) return 'document';
  if (['xlsx', 'xls'].includes(ext)) return 'spreadsheet';
  if (['pptx', 'ppt'].includes(ext)) return 'presentation';
  if (['js', 'jsx', 'py', 'html', 'css', 'json', 'ts', 'tsx'].includes(ext)) return 'code';
  
  return 'other';
};

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file type is previewable
 * @param {string} filename - File name
 * @returns {boolean} True if file can be previewed
 */
export const isPreviewable = (filename) => {
  const ext = getFileExtension(filename);
  const previewableTypes = [
    'pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'txt', 'md', 'json', 'xml', 'html'
  ];
  return previewableTypes.includes(ext);
};
