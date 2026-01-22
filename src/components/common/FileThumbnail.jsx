import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Presentation, FileSpreadsheet, FileImage, File } from 'lucide-react';
import { getPreviewUrl } from '../../api/files';

/**
 * FileThumbnail - Visual thumbnail card for uploaded files
 * Shows document preview image with file type badge (Claude-style)
 * 
 * @param {Object} file - File object with filename, type, previewUrl
 * @param {Function} onRemove - Callback when remove button is clicked
 */
const FileThumbnail = ({ file, onRemove }) => {
    const [imageError, setImageError] = useState(false);
    const fileType = file.type?.toUpperCase() || file.filename.split('.').pop().toUpperCase();
    const previewUrl = file.previewUrl || getPreviewUrl(file.filename);

    // Get appropriate icon based on file type
    const getFileIcon = () => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return <FileText className="w-8 h-8 text-red-400" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-8 h-8 text-blue-400" />;
            case 'ppt':
            case 'pptx':
                return <Presentation className="w-8 h-8 text-orange-400" />;
            case 'xls':
            case 'xlsx':
                return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                return <FileImage className="w-8 h-8 text-purple-400" />;
            default:
                return <File className="w-8 h-8 text-gray-400" />;
        }
    };

    // Get background color based on file type
    const getBgColor = () => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'from-red-50 to-red-100';
            case 'doc':
            case 'docx':
                return 'from-blue-50 to-blue-100';
            case 'ppt':
            case 'pptx':
                return 'from-orange-50 to-orange-100';
            case 'xls':
            case 'xlsx':
                return 'from-green-50 to-green-100';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
                return 'from-purple-50 to-purple-100';
            default:
                return 'from-brand-accent-50 to-brand-accent-100';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-24 h-28 rounded-xl border border-brand-accent-100 bg-white overflow-hidden group shadow-sm hover:shadow-md transition-all duration-200"
        >
            {/* Preview Area */}
            <div className="w-full h-20 overflow-hidden">
                {!imageError ? (
                    <img
                        src={previewUrl}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    // Fallback with icon
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getBgColor()}`}>
                        {getFileIcon()}
                    </div>
                )}
            </div>

            {/* File Type Badge */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/95 border border-brand-accent-100 rounded-md text-[10px] font-bold text-light-text tracking-wide shadow-sm">
                {fileType}
            </div>

            {/* Remove Button - Visible on hover */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-red-50 border border-brand-accent-100 hover:border-red-200 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                title="Remove file"
            >
                <X className="w-3 h-3 text-light-text-secondary hover:text-red-500" />
            </button>

            {/* Filename tooltip on hover */}
            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-[9px] text-white truncate font-medium">
                    {file.filename}
                </p>
            </div>
        </motion.div>
    );
};

export default FileThumbnail;
