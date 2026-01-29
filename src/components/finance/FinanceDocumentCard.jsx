import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileSpreadsheet, TrendingUp, PieChart, FileText, Download, Eye } from 'lucide-react';

/**
 * FinanceDocumentCard - Enhanced document card for finance documents
 * Shows document type badge and metadata
 */
const FinanceDocumentCard = ({ document, onPreview, onDownload }) => {
  // Determine document type from filename or metadata
  const getDocumentType = () => {
    const filename = document.filename.toLowerCase();
    if (filename.includes('sales') || filename.includes('sales_report')) {
      return { type: 'Sales Report', icon: BarChart3, color: 'blue' };
    }
    if (filename.includes('dashboard') || filename.includes('dashboard')) {
      return { type: 'Dashboard', icon: FileSpreadsheet, color: 'green' };
    }
    if (filename.includes('analysis') || filename.includes('financial_analysis')) {
      return { type: 'Financial Analysis', icon: TrendingUp, color: 'purple' };
    }
    if (filename.includes('summary') || filename.includes('financial_summary')) {
      return { type: 'Financial Summary', icon: PieChart, color: 'orange' };
    }
    if (filename.includes('expense') || filename.includes('expense_report')) {
      return { type: 'Expense Report', icon: FileText, color: 'indigo' };
    }
    return { type: 'Financial Document', icon: FileSpreadsheet, color: 'gray' };
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

      {/* Chart indicator for Excel files */}
      {(document.type === 'XLSX' || document.filename.toLowerCase().endsWith('.xlsx')) && (
        <div className="mb-3 flex items-center gap-1 text-xs text-brand-accent-600">
          <BarChart3 className="w-3 h-3" />
          <span>Contains charts</span>
        </div>
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

export default FinanceDocumentCard;
