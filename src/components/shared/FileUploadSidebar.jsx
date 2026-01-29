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
      className="w-full h-full bg-white border-r border-light-border flex flex-col overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header - Refined & Aesthetic */}
      <div className="p-6 border-b border-light-border bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
           <Upload className="w-4 h-4 text-brand-accent-600" />
           <span className="text-[10px] font-black text-brand-accent-500 uppercase tracking-widest leading-none">Safe Repository</span>
        </div>
        <h3 className="text-sm font-bold text-light-text mb-1 tracking-tight">
          {demoMode === 'hr' ? 'Employee Intelligence' : 
           demoMode === 'finance' ? 'Fiscal Documents' :
           demoMode === 'legal' ? 'Legal Archive' :
           'Document Ingestion'}
        </h3>
        <p className="text-[10px] font-bold text-light-text-secondary/60 uppercase tracking-widest">
          Secure Sandbox Upload
        </p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-thin">
        {/* Drag & Drop Zone - Aesthetic Polish */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer
            transition-all duration-300 mb-8 relative group overflow-hidden
            ${isDragging 
              ? 'border-brand-accent-500 bg-brand-accent-50/50 shadow-lg shadow-brand-accent-100/20' 
              : 'border-light-border bg-[#FAFAF9] hover:border-brand-accent-300 hover:bg-white hover:shadow-xl hover:shadow-black/5'
            }
          `}
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-brand-accent-600 text-white' : 'bg-white text-brand-accent-500 shadow-sm border border-light-border'}`}>
             <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-light-text mb-1 tracking-tight">
            {isDragging ? 'Release to Upload' : 'Click or Drag Files'}
          </p>
          <p className="text-[10px] font-black text-light-text-secondary/40 uppercase tracking-widest">
            {acceptedTypes.join(' ').toUpperCase()}
          </p>
        </motion.div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 p-4 bg-brand-accent-600 rounded-2xl shadow-lg shadow-brand-accent-100 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-[11px] text-white font-black uppercase tracking-widest">Encrypting & Ingesting...</p>
          </div>
        )}

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-black text-light-text-secondary uppercase tracking-widest">
                Ingested Docs ({uploadedFiles.length})
              </span>
              {uploadedFiles.length >= maxFiles && (
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Capacity Reached</span>
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
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="w-16 h-16 bg-light-bg rounded-2xl flex items-center justify-center mb-4">
               <FileText className="w-8 h-8 text-light-text-secondary" />
            </div>
            <p className="text-xs font-black text-light-text-secondary uppercase tracking-widest">
              No files in sandbox
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSidebar;
