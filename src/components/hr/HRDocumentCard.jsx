import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserCheck, CreditCard, Shield, ClipboardList, Download, Eye } from 'lucide-react';
import { getFileIcon } from '../../utils/fileUtils';

/**
 * HRDocumentCard - Enhanced document card for HR documents
 * Shows document type badge and metadata
 */
const HRDocumentCard = ({ document, onPreview, onDownload }) => {
  // Determine document type from filename or metadata
  const getDocumentType = () => {
    const filename = document.filename.toLowerCase();
    if (filename.includes('offer') || filename.includes('offer_letter')) {
      return { type: 'Offer Letter', icon: FileText, color: 'blue' };
    }
    if (filename.includes('contract') || filename.includes('employment')) {
      return { type: 'Employment Contract', icon: UserCheck, color: 'green' };
    }
    if (filename.includes('id') || filename.includes('card')) {
      return { type: 'ID Card', icon: CreditCard, color: 'purple' };
    }
    if (filename.includes('nda') || filename.includes('non-disclosure')) {
      return { type: 'NDA', icon: Shield, color: 'orange' };
    }
    if (filename.includes('checklist') || filename.includes('onboarding')) {
      return { type: 'Onboarding Checklist', icon: ClipboardList, color: 'indigo' };
    }
    return { type: 'HR Document', icon: FileText, color: 'gray' };
  };

  const docType = getDocumentType();
  const Icon = docType.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-light-sidebar rounded-xl border border-light-border hover:border-brand-accent-300 transition-all p-4 group"
    >
      {/* Document Type Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${
          docType.color === 'blue' ? 'bg-blue-50' :
          docType.color === 'green' ? 'bg-green-50' :
          docType.color === 'purple' ? 'bg-purple-50' :
          docType.color === 'orange' ? 'bg-orange-50' :
          'bg-indigo-50'
        }`}>
          <Icon className={`w-4 h-4 ${
            docType.color === 'blue' ? 'text-blue-600' :
            docType.color === 'green' ? 'text-green-600' :
            docType.color === 'purple' ? 'text-purple-600' :
            docType.color === 'orange' ? 'text-orange-600' :
            'text-indigo-600'
          }`} />
        </div>
        <span className="text-xs font-semibold text-light-text">{docType.type}</span>
      </div>

      {/* Filename */}
      <p className="text-sm text-light-text font-medium mb-2 truncate" title={document.filename}>
        {document.filename}
      </p>

      {/* Metadata */}
      {document.uploadedAt && (
        <p className="text-xs text-light-text-secondary mb-3">
          {new Date(document.uploadedAt).toLocaleDateString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPreview && onPreview(document)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-light-text bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          Preview
        </button>
        <button
          onClick={() => onDownload && onDownload(document)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-light-text bg-light-bg hover:bg-brand-accent-50 hover:text-brand-accent-600 rounded transition-colors"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default HRDocumentCard;
