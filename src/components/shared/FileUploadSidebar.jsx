import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText } from 'lucide-react';
import FileThumbnail from '../common/FileThumbnail';

/**
 * FileUploadSidebar - Left sidebar component for file uploads
 * Receives files and upload handlers from parent to ensure shared state
 *
 * @param {string} sessionId - Current session ID
 * @param {Array} uploadedFiles - Files array from parent (shared state)
 * @param {boolean} isUploading - Upload state from parent
 * @param {Function} onUploadFiles - Upload handler from parent
 * @param {Function} onRemoveFile - Remove handler from parent
 * @param {number} maxFiles - Maximum number of files allowed
 * @param {Array<string>} acceptedTypes - Accepted file types
 * @param {'hr'|'finance'} demoMode - Demo mode for styling
 */
const FileUploadSidebar = ({
  sessionId,
  uploadedFiles = [],
  isUploading = false,
  onUploadFiles,
  onRemoveFile,
  maxFiles = 10,
  acceptedTypes = ['.docx', '.pdf', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg'],
  demoMode = null
}) => {
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    if (!onUploadFiles) {
      console.error('FileUploadSidebar: onUploadFiles handler not provided');
      return;
    }

    const fileArray = Array.from(files);

    // Check max files
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Filter by accepted types
    const filteredFiles = fileArray.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return acceptedTypes.some(type => ext === type.toLowerCase());
    });

    if (filteredFiles.length < fileArray.length) {
      alert(`Some files were skipped. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    if (filteredFiles.length > 0) {
      await onUploadFiles(filteredFiles);
    }
  }, [uploadedFiles.length, maxFiles, acceptedTypes, onUploadFiles]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Click to upload
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
      e.target.value = ''; // Reset input
    }
  }, [handleFileSelect]);

  return (
    <div
      className="w-full h-full bg-light-sidebar border-r border-light-border flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 border-b border-light-border">
        <h3 className="text-lg font-semibold text-light-text mb-2">
          {demoMode === 'hr' ? 'Upload Employee Documents' : 
           demoMode === 'finance' ? 'Upload Financial Data' :
           demoMode === 'legal' ? 'Upload Legal Documents' :
           'Upload Files'}
        </h3>
        <p className="text-xs text-light-text-secondary">
          Drag & drop or click to upload
        </p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Drag & Drop Zone */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 mb-4
            ${isDragging 
              ? 'border-brand-accent-500 bg-brand-accent-50' 
              : 'border-light-border hover:border-brand-accent-300 hover:bg-light-bg'
            }
          `}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-brand-accent-600' : 'text-light-text-secondary'}`} />
          <p className="text-sm font-medium text-light-text mb-1">
            {isDragging ? 'Drop files here' : 'Click or drag files here'}
          </p>
          <p className="text-xs text-light-text-secondary">
            {acceptedTypes.join(', ').toUpperCase()}
          </p>
        </motion.div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4 p-3 bg-brand-accent-50 border border-brand-accent-200 rounded-lg">
            <p className="text-xs text-brand-accent-700 font-medium">Uploading files...</p>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-light-text-secondary">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
              </p>
              {uploadedFiles.length >= maxFiles && (
                <p className="text-xs text-orange-500">Max reached</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {uploadedFiles.map((file) => (
                <div key={file.filename} className="relative">
                  <FileThumbnail
                    file={file}
                    onRemove={() => onRemoveFile && onRemoveFile(file.filename)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uploadedFiles.length === 0 && !isUploading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-light-text-secondary/50 mb-3" />
            <p className="text-sm text-light-text-secondary">
              No files uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSidebar;
